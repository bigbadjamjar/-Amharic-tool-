/* ---------- record yourself ----------
   Tap 🎙 beside a word or sentence: a panel opens at the bottom of the screen where you can hear the
   clip, record yourself saying it, and play the two back to back to compare.
   Recordings never leave the device. The latest one for each phrase is kept in this browser's
   storage (IndexedDB), separately for each profile, and can be deleted from the Profiles page.
   Works on iPhone (Safari 14.3+, records MP4/AAC) and Android/desktop Chrome (records WebM/Opus).
   Needs https (or localhost): browsers only allow the microphone on secure pages.
   Uses app.js/audio.js helpers (S, PROF, esc, playAm, stopAm, canSay, sayKey, findIndex) at call time. */

const recOK = () => typeof navigator!=="undefined" && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof MediaRecorder!=="undefined";
const REC_MAX = 10;   // seconds; recording stops by itself after this
const REC = {am:null, voice:"", rom:"", en:"", state:"idle", url:null, err:"", t0:0, timer:null, rec:null, stream:null, chunks:[], player:null, playing:""};
const MIC_SVG = `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const micBtn = (am, voice) => recOK() ? `<button class="mic" data-act="rec-open" data-v="${esc(am)}"${voice==="m"?` data-g="m"`:""} aria-label="Record yourself" title="Record yourself">${MIC_SVG}</button>` : "";

/* --- storage: one IndexedDB store, key = profile id | phrase --- */
let recDBp = null;
function recDB(){
  if(recDBp) return recDBp;
  recDBp = new Promise((res, rej)=>{
    if(typeof indexedDB==="undefined") return rej(new Error("no IndexedDB"));
    const r = indexedDB.open("amharic-rec", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("clips");
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  recDBp.catch(()=>{ recDBp = null; });
  return recDBp;
}
const recWho = () => { const c = typeof PROF!=="undefined" && PROF.cur(); return c ? c.id : "_"; };
const recKey = am => recWho()+"|"+sayKey(am);
function recTx(mode, fn){
  return recDB().then(db=>new Promise((res, rej)=>{ const tx = db.transaction("clips", mode), st = tx.objectStore("clips"); let out; const r = fn(st); if(r) r.onsuccess = () => { out = r.result; }; tx.oncomplete = () => res(out); tx.onerror = tx.onabort = () => rej(tx.error); }));
}
const recGet = am => recTx("readonly", st=>st.get(recKey(am))).catch(()=>null);
const recPut = (am, blob) => recTx("readwrite", st=>st.put({blob, type:blob.type, at:Date.now()}, recKey(am))).catch(()=>{});
const recDel = am => recTx("readwrite", st=>st.delete(recKey(am))).catch(()=>{});
// keys belonging to a profile
const recKeysOf = id => recTx("readonly", st=>st.getAllKeys()).then(ks=>(ks||[]).filter(k=>String(k).startsWith(id+"|"))).catch(()=>[]);
function recDelAll(id){ return recKeysOf(id).then(ks=>ks.length ? recTx("readwrite", st=>{ ks.forEach(k=>st.delete(k)); }) : null).catch(()=>{}); }
let recCount = null;   // for the Profiles page; null = not counted yet
function recRecount(){ recKeysOf(recWho()).then(ks=>{ const n = ks.length; if(n!==recCount){ recCount = n; if(S.mode==="me" && typeof render==="function") render(); } }); }

/* --- the panel --- */
function recSheet(){ let el = document.getElementById("recsheet"); if(!el){ el = document.createElement("div"); el.id = "recsheet"; el.className = "recsheet"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Record yourself"); document.body.appendChild(el); } return el; }
function recRender(){
  const el = recSheet();
  if(!REC.am){ el.hidden = true; el.innerHTML = ""; document.body.classList.remove("recopen"); return; }
  el.hidden = false; document.body.classList.add("recopen");
  const st = REC.state, have = !!REC.url, clip = !!(canSay(REC.am) || clipFor(REC.am, REC.voice)), secs = st==="rec" ? Math.min(REC_MAX, Math.floor((Date.now()-REC.t0)/1000)) : 0;
  const pb = (act, label, on) => `<button class="btn ${on?"on":""}" data-act="${act}" ${st==="rec"||st==="ask"?"disabled":""}>${label}</button>`;
  el.innerHTML = `<div class="rsinner">
    <div class="rshead"><div><span class="am nosay">${esc(REC.am)}</span>${REC.rom?`<span class="rom">${esc(REC.rom)}</span>`:""}${REC.en?`<span class="en">${esc(REC.en)}</span>`:""}</div>
      <button class="rsx" data-act="rec-close" aria-label="Close">×</button></div>
    ${st==="rec" ? `<button class="btn recbtn going" data-act="rec-stop"><i></i>Stop · ${secs}s</button>`
      : `<button class="btn recbtn" data-act="rec-start" ${st==="ask"?"disabled":""}><i></i>${st==="ask"?"Waiting for the microphone…":have?"Record again":"Record yourself"}</button>`}
    <div class="rsplay">${clip?pb("rec-clip","▶ Clip",REC.playing==="clip"):""}${have?pb("rec-mine","▶ You",REC.playing==="mine"):""}${have&&clip?pb("rec-both","▶ Clip, then you",REC.playing==="both"):""}</div>
    ${REC.err?`<p class="fb bad" role="alert">${esc(REC.err)}</p>`:`<p class="count">${have?"Listen to both. Does yours sound the same? Your recording stays on this device.":clip?"Listen to the clip, then record yourself saying it.":"Record yourself saying it."}</p>`}
    ${have?`<p class="count"><button class="link" data-act="rec-del">Delete my recording</button></p>`:""}
  </div>`;
}
function recOpen(am, voice){
  recClose(true);
  const e = typeof findIndex==="function" && findIndex().find(x=>sayKey(x.am)===sayKey(am));
  Object.assign(REC, {am, voice:voice||"", rom:e?e.rom:"", en:e?e.en:"", state:"idle", url:null, err:"", playing:""});
  recRender();
  recGet(am).then(r=>{ if(REC.am===am && r && r.blob && !REC.url){ REC.url = URL.createObjectURL(r.blob); recRender(); } });
}
function recRelease(){ if(REC.stream){ REC.stream.getTracks().forEach(t=>t.stop()); REC.stream = null; } clearInterval(REC.timer); REC.timer = null; }
function recStopPlay(){ if(REC.player){ REC.player.onended = REC.player.onerror = null; REC.player.pause(); REC.player = null; } stopAm(); REC.playing = ""; }
function recClose(quiet){
  if(REC.rec && REC.rec.state!=="inactive"){ REC.rec.onstop = null; try{ REC.rec.stop(); }catch(e){} }
  REC.rec = null; recRelease(); recStopPlay();
  if(REC.url) URL.revokeObjectURL(REC.url);
  Object.assign(REC, {am:null, url:null, state:"idle", err:""});
  if(!quiet) recRender();
}
function recMime(){
  const types = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return MediaRecorder.isTypeSupported ? types.find(t=>MediaRecorder.isTypeSupported(t)) || "" : "";
}
async function recStart(){
  if(!recOK()){ REC.err = "This browser can't record. Try Safari on iPhone or Chrome on Android."; return recRender(); }
  recStopPlay(); REC.err = ""; REC.state = "ask"; recRender();
  const am = REC.am;
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true}});
    if(REC.am!==am){ stream.getTracks().forEach(t=>t.stop()); return; }
    REC.stream = stream; REC.chunks = [];
    const mime = recMime(), rec = REC.rec = new MediaRecorder(stream, mime ? {mimeType:mime} : undefined);
    rec.ondataavailable = e => { if(e.data && e.data.size) REC.chunks.push(e.data); };
    rec.onstop = () => {
      recRelease();
      const blob = new Blob(REC.chunks, {type: rec.mimeType || mime || "audio/mp4"});
      REC.rec = null; REC.state = "idle";
      if(REC.am!==am) return;
      if(!blob.size){ REC.err = "Nothing was recorded. Please try again."; return recRender(); }
      if(REC.url) URL.revokeObjectURL(REC.url);
      REC.url = URL.createObjectURL(blob);
      recPut(am, blob).then(()=>{ recCount = null; });
      recRender(); recPlay("mine");
    };
    rec.start();
    REC.state = "rec"; REC.t0 = Date.now();
    REC.timer = setInterval(()=>{ if((Date.now()-REC.t0)/1000 >= REC_MAX) recStop(); else recRender(); }, 250);
    recRender();
  }catch(err){
    recRelease(); REC.state = "idle"; REC.rec = null;
    REC.err = err && err.name==="NotAllowedError"
      ? "The microphone is blocked. Allow it for this site in your browser settings (on iPhone: Settings › Safari › Microphone, or the “aA” menu in the address bar), then try again."
      : err && err.name==="NotFoundError" ? "No microphone found on this device." : "Couldn't start the microphone. "+((err&&err.message)||"");
    recRender();
  }
}
function recStop(){ clearInterval(REC.timer); REC.timer = null; if(REC.rec && REC.rec.state!=="inactive") REC.rec.stop(); }
function recPlay(what){
  recStopPlay();
  const mine = () => { if(!REC.url){ REC.playing = ""; return recRender(); }
    const a = REC.player = new Audio(REC.url); REC.playing = what;
    a.onended = a.onerror = () => { if(REC.player===a){ REC.player = null; REC.playing = ""; recRender(); } };
    a.play().catch(()=>{ REC.playing = ""; recRender(); }); recRender(); };
  if(what==="mine") return mine();
  REC.playing = what; recRender();
  playAm(REC.am, 0, REC.voice, () => { if(REC.playing!==what) return; if(what==="both") setTimeout(()=>{ if(REC.playing==="both") mine(); }, 400); else { REC.playing = ""; recRender(); } });
}
// Clicks on data-act="rec-…"
function recAct(a, v, g){
  if(a==="rec-open") return recOpen(v, g);
  if(a==="rec-close") return recClose();
  if(a==="rec-start") return recStart();
  if(a==="rec-stop") return recStop();
  if(a==="rec-clip") return recPlay("clip");
  if(a==="rec-mine") return recPlay("mine");
  if(a==="rec-both") return recPlay("both");
  if(a==="rec-del"){ const am = REC.am; recStopPlay(); if(REC.url) URL.revokeObjectURL(REC.url); REC.url = null; recDel(am).then(()=>{ recCount = null; }); return recRender(); }
  if(a==="rec-delall"){ recDelAll(recWho()).then(()=>{ recCount = 0; if(typeof render==="function") render(); }); return; }
}
// For the Profiles page
function recHTML(){
  if(!recOK()) return "";
  if(recCount===null) recRecount();
  return `<h3>My recordings</h3><div class="note"><p>When you record yourself (tap the microphone next to a word), the latest recording of each word is kept on this device only. It is not in backups.</p>
    <div class="pfrow" style="margin-top:8px;align-items:center"><span class="count">${recCount===null?"…":recCount===1?"1 recording":recCount+" recordings"}</span>${recCount?`<button class="btn" data-act="rec-delall">Delete all</button>`:""}</div></div>`;
}
if(typeof document!=="undefined") document.addEventListener("keydown", e=>{ if(e.key==="Escape" && REC.am) recClose(); });
