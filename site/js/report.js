/* ---------- report a mistake ----------
   A small flag (⚑) sits beside words, sentences, table rows, dialogue lines and flashcards, and after
   each answered test question. "Report a problem" at the bottom of every page does the same for the
   app as a whole. Either one opens a panel where you say what's wrong (spelling, meaning,
   transcription, audio...) and, if you like, what it should be.
   There is no server, so the report is sent by the person themselves, three ways:
     - "Send": the phone's share sheet (WhatsApp, Messages, email...), or an email on a computer
     - "Post on GitHub": a new issue on the repository, filled in (needs a GitHub account)
     - "Copy": the report as text, to paste anywhere
   Every report says which word, what's wrong, where in the app it was and which audio file plays,
   so it can be fixed without asking.
   Self-contained: it watches #app and adds its flags after each render, and handles its own clicks
   (data-rep, not data-act), so app.js needs no changes. Reads S, LMAP, topic(), clipFor() at call time. */

// Optional: an email address that "Send" fills in on computers without a share sheet. Left empty, the
// email opens with no address and the person types it. The repository is public, so anything put here
// can be read by anyone (and by spam robots).
const REPORT_EMAIL = "";
const REPORT_REPO = "https://github.com/bigbadjamjar/-Amharic-tool-";
const REPORT_SITE = "https://amharicapp.com/";

const FLAG_SVG = `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5 21V4m0 0h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const REP_ITEM_KINDS = [["am","Amharic spelling"],["en","English meaning"],["rom","Transcription"],["audio","Audio clip"],["other","Something else"]];
const REP_GEN_KINDS = [["word","A wrong word or meaning"],["audio","Audio"],["broken","Something not working"],["idea","An idea"]];
const REP = {open:false, item:null, kinds:[], fix:"", name:"", msg:""};
const repStore = { get(k){ try{ return localStorage.getItem(k)||""; }catch(e){ return ""; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
const repEsc = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const repBtn = (big) => `<button class="rep${big?" big":""}" data-rep="open" aria-label="Report a mistake" title="Report a mistake">${FLAG_SVG}</button>`;

/* --- reading the item off the page --- */
// text of an element without the buttons inside it (▶, 🎙, ⚑)
function repText(el){
  if(!el) return "";
  const c = el.cloneNode(true); c.querySelectorAll("button,svg").forEach(b=>b.remove());
  return c.textContent.replace(/\s+/g," ").trim();
}
function repItemOf(box){
  if(!box) return null;
  let am, rom, en, extra = "";
  if(box.classList.contains("bigbtns")){ const f = box.previousElementSibling; if(f && f.classList.contains("flash")) box = f; }
  if(box.classList.contains("q")){
    // an answered test question: the question, and the right answer
    const card = box, after = []; let n = box.nextElementSibling;
    while(n){ after.push(n); n = n.nextElementSibling; }
    const right = after.map(x=>x.querySelector(".opt.right")).find(Boolean), ans = after.find(x=>x.classList.contains("ans")), fb = after.find(x=>x.classList.contains("fb"));
    const qa = repText(card.querySelector(".big")) || repText(card.querySelector(".am"));
    am = qa; rom = repText(card.querySelector(".sub.rom")) || "";
    const kind = repText(card.querySelector(".kind"));
    const answer = right ? (right.querySelector(".am") ? repText(right.querySelector(".am"))+(right.querySelector(".rom")?" ("+repText(right.querySelector(".rom"))+")":"") : repText(right)) : ans ? repText(ans) : fb ? repText(fb) : "";
    extra = (kind ? "Question type: "+kind+"\n" : "") + (repText(card.querySelector(".sub:not(.rom)")) ? "Question says: "+repText(card.querySelector(".sub:not(.rom)"))+"\n" : "") + (answer ? "App's answer: "+answer+"\n" : "");
    return {am, rom, en:"", extra};
  }
  if(box.classList.contains("miss")){ return {am:repText(box).split("You ")[0].trim(), rom:"", en:"", extra:"From the list of answers to review\n"}; }
  const amEl = box.querySelector(".am");
  am = repText(amEl);
  const romEl = box.querySelector(".rom"); rom = romEl ? repText(romEl) : "";
  const enEl = box.querySelector(".en,.fen,small"); en = enEl ? repText(enEl) : "";
  const who = box.querySelector(".who"); if(who) extra = "Person: "+repText(who)+"\n";
  return {am, rom, en, extra};
}

/* --- where in the app --- */
function repWhere(){
  if(typeof S==="undefined") return "";
  const tab = {course:"Learn",fidel:"Learn › Fidel › Letters",num:"Learn › Fidel › Numbers",eth:"Learn › Culture",ref:"Tables",test:"Test",prog:"Progress",find:"Search",me:"Profiles",who:"Profiles",welcome:"Welcome page"}[S.mode] || S.mode;
  const p = [tab];
  try{
    if(S.mode==="course" && S.lesson){ const l = typeof LMAP!=="undefined" && LMAP[S.lesson]; p.push("Unit "+S.lesson+(l&&l.title?" ("+l.title+")":"")); p.push({notes:"Notes",words:"Words",sent:"Sentences",dlg:"Dialogue",cards:"Cards"}[S.lview]||S.lview); }
    else if(S.mode==="fidel") p.push({chart:"Chart",type:"Typing"}[S.ftab]||S.ftab);
    else if(S.mode==="ref"){ p.push({pronouns:"Pronouns",verbs:"Verbs",extra:"Extra words"}[S.rtab]||S.rtab); if(S.rtab==="extra" && S.cat) p.push(S.cat); }
    else if(S.mode==="test" && S.quiz){ const t = typeof topic==="function" && topic(S.quiz.id); p.push((t&&t.name)||S.quiz.id); if(!S.quiz.done) p.push("question "+(S.quiz.i+1)); }
    else if(S.mode==="eth" && typeof ETHV!=="undefined" && ETHV.id && ETHMAP[ETHV.id]) p.push(ETHMAP[ETHV.id].title);
    else if(S.mode==="find" && S.find && S.find.q) p.push("“"+S.find.q+"”");
  }catch(e){}
  return p.filter(Boolean).join(" › ");
}

/* --- the report itself, as plain text --- */
function repClip(am){ try{ const c = am && typeof clipFor==="function" && clipFor(am); return c ? "audio/"+c : ""; }catch(e){ return ""; } }
function repReport(){
  const it = REP.item, kinds = (it ? REP_ITEM_KINDS : REP_GEN_KINDS).filter(k=>REP.kinds.includes(k[0])).map(k=>k[1]);
  const L = [];
  if(it){
    L.push("Item: "+(it.am||"(none)")+(it.rom?" ("+it.rom+")":"")+(it.en?" = "+it.en:""));
    if(it.extra) L.push(it.extra.trim());
  }
  L.push("Problem: "+(kinds.length?kinds.join(", "):"(not chosen)"));
  if(REP.fix.trim()) L.push((it?"Should be / note: ":"Details: ")+REP.fix.trim());
  L.push("Where: "+(repWhere()||"(unknown)"));
  const clip = it && repClip(it.am); if(clip) L.push("Audio file: "+clip);
  if(REP.name.trim()) L.push("From: "+REP.name.trim());
  L.push("Sent: "+new Date().toISOString().slice(0,10)+" · "+REPORT_SITE);
  return L.join("\n");
}
const repTitle = () => { const it = REP.item; return it && it.am ? "Report: "+it.am+(it.en?" ("+it.en+")":"") : "Report: "+((REP_GEN_KINDS.find(k=>REP.kinds.includes(k[0]))||[0,"app feedback"])[1]); };

/* --- the panel --- */
function repSheet(){ let el = document.getElementById("repsheet"); if(!el){ el = document.createElement("div"); el.id = "repsheet"; el.className = "repsheet"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Report a problem"); el.hidden = true; document.body.appendChild(el); } return el; }
const repCanShare = () => typeof navigator!=="undefined" && typeof navigator.share==="function";
function repRender(){
  const el = repSheet();
  if(!REP.open){ el.hidden = true; el.innerHTML = ""; document.body.classList.remove("repopen"); return; }
  el.hidden = false; document.body.classList.add("repopen");
  const it = REP.item, kinds = it ? REP_ITEM_KINDS : REP_GEN_KINDS, chosen = REP.kinds.length > 0;
  el.innerHTML = `<div class="rpinner">
    <div class="rphead"><div>${it
      ? `<span class="count">Report a mistake</span><span class="am nosay norom-auto">${repEsc(it.am||"")}</span>${it.rom?`<span class="rom">${repEsc(it.rom)}</span>`:""}${it.en?`<span class="en">${repEsc(it.en)}</span>`:""}`
      : `<b class="rptitle">Report a problem</b><span class="count">Found a mistake, a bad clip or a bug? Tell us here.</span>`}</div>
      <button class="rsx" data-rep="close" aria-label="Close">×</button></div>
    <div><p class="rplab">What's wrong? <small>Choose any</small></p>
      <div class="rpchips">${kinds.map(([k,l])=>`<button class="chip" data-rep="kind" data-v="${k}" aria-selected="${REP.kinds.includes(k)}">${l}</button>`).join("")}</div></div>
    <label class="rplab" for="rep-fix">${it?"What should it be? <small>Optional</small>":"Tell us more <small>Optional</small>"}</label>
    <textarea id="rep-fix" class="rpin" rows="2" maxlength="600" placeholder="${it?"e.g. the right spelling or meaning":"What happened, or what would help?"}">${repEsc(REP.fix)}</textarea>
    <label class="rplab" for="rep-name">Your name <small>Optional, remembered on this device</small></label>
    <input id="rep-name" class="rpin" type="text" maxlength="40" autocomplete="name" value="${repEsc(REP.name)}">
    <div class="rpsend">
      <button class="btn primary" data-rep="share" ${chosen?"":"disabled"}>${repCanShare()?"Send…":"Send by email"}</button>
      <button class="btn" data-rep="github" ${chosen?"":"disabled"}>Post on GitHub</button>
      <button class="btn" data-rep="copy" ${chosen?"":"disabled"}>Copy</button>
    </div>
    <p class="count rpmsg" role="status">${REP.msg?repEsc(REP.msg):chosen?(repCanShare()?"“Send…” lets you pick WhatsApp, Messages, email and so on. ":"")+"“Post on GitHub” needs a free GitHub account.":"Choose what's wrong first."}</p>
  </div>`;
}
function repOpen(item){
  if(typeof REC!=="undefined" && REC.am && typeof recClose==="function") recClose();
  Object.assign(REP, {open:true, item, kinds:[], fix:"", msg:"", name:repStore.get("amharic-rep-name")});
  repRender();
  const first = repSheet().querySelector(".chip"); if(first) first.focus({preventScroll:true});
}
function repClose(){ REP.open = false; repRender(); }
function repDone(msg){ REP.msg = msg; repRender(); }
function repAct(a, v, btn){
  if(a==="open"){
    const box = btn.closest(".row,.bub,.peek,.pcard,.miss,.bigbtns,.repq");
    repOpen(!box ? null : repItemOf(box.classList.contains("repq") ? document.querySelector("#app .q") : box));
    return;
  }
  if(a==="close"){ repClose(); return; }
  if(a==="kind"){ const i = REP.kinds.indexOf(v); if(i>=0) REP.kinds.splice(i,1); else REP.kinds.push(v); REP.msg = ""; repRender(); const b = repSheet().querySelector(`[data-rep="kind"][data-v="${v}"]`); if(b) b.focus({preventScroll:true}); return; }
  const text = repReport(), title = repTitle();
  if(a==="share"){
    if(repCanShare()){ navigator.share({title, text}).then(()=>repDone("Sent. Thank you!"), err=>{ if(err && err.name!=="AbortError") repMail(title, text); }); }
    else repMail(title, text);
    return;
  }
  if(a==="github"){
    const url = REPORT_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(text);
    window.open(url, "_blank", "noopener"); repDone("GitHub opened in a new tab. Press “Create” there to send it.");
    return;
  }
  if(a==="copy"){
    const ok = () => repDone("Copied. Paste it into a message or email."), bad = () => repDone("Couldn't copy here. Try “Send” instead.");
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, bad); else bad();
  }
}
function repMail(title, text){
  location.href = "mailto:"+encodeURIComponent(REPORT_EMAIL).replace(/%40/g,"@")+"?subject="+encodeURIComponent(title)+"&body="+encodeURIComponent(text);
  repDone("Your email app should open with the report filled in."+(REPORT_EMAIL?"":" Add who it's for and send."));
}

/* --- adding the flags after each render --- */
const REP_BOXES = ".tbl .row, .bub, .peek, .pcard, .miss";
function addReportButtons(root){
  root.querySelectorAll(REP_BOXES).forEach(box=>{
    if(box.querySelector(".rep")) return;
    const am = box.querySelector(".am"); if(!am || !repText(am)) return;
    // after the ▶ / 🎙 that follow the word, or after the word itself
    const inside = am.querySelector(".sbtns,.say"), nx = am.nextElementSibling;
    // inside the ▶ 🎙 group when there is one, so the flag never wraps onto a line of its own
    const grp = inside || (nx && (nx.classList.contains("sbtns") || nx.classList.contains("say")) ? nx : null);
    if(grp && grp.classList.contains("sbtns")) grp.insertAdjacentHTML("beforeend", repBtn());
    else if(grp) grp.insertAdjacentHTML("afterend", repBtn());
    else if(am.parentElement.classList.contains("bline")) am.parentElement.insertAdjacentHTML("beforeend", repBtn());
    else am.insertAdjacentHTML(getComputedStyle(am).display==="block" ? "beforeend" : "afterend", repBtn());
  });
  // flashcards: beside the big ▶ and 🎙
  root.querySelectorAll(".bigbtns").forEach(b=>{ if(!b.querySelector(".rep")) b.insertAdjacentHTML("beforeend", repBtn(true)); });
  // an answered test question: a line under the feedback
  const fb = root.querySelector(".q ~ .fb"), q = root.querySelector(".q");
  if(fb && q && !root.querySelector(".repq")) fb.insertAdjacentHTML("afterend", `<p class="repq"><button class="link" data-rep="open">${FLAG_SVG} Something wrong with this question?</button></p>`);
}
if(typeof document!=="undefined"){
  let pending = false;
  const run = () => { pending = false; const app = document.getElementById("app"); if(app) addReportButtons(app); };
  const start = () => {
    const app = document.getElementById("app"); if(!app) return;
    new MutationObserver(()=>{ if(!pending){ pending = true; Promise.resolve().then(run); } }).observe(app, {childList:true, subtree:true});
    run();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start); else start();
  document.addEventListener("click", e=>{
    const b = e.target.closest("[data-rep]"); if(!b || b.disabled) return;
    e.preventDefault(); repAct(b.dataset.rep, b.dataset.v, b);
  });
  document.addEventListener("input", e=>{
    if(e.target.id==="rep-fix") REP.fix = e.target.value;
    if(e.target.id==="rep-name"){ REP.name = e.target.value; repStore.set("amharic-rep-name", REP.name.trim()); }
  });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && REP.open) repClose(); });
}
