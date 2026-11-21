/* ---------- dialogues ----------
   Each unit's conversation (data/dialogues.js), shown under the unit's "Dialogue" tab.
   Read it, play it all, or take one part: the other person's lines play by themselves, and on your turn
   you pick your reply (or build it word by word), then hear it said. Men's lines use the male voice
   where there is a male clip (audio/clips/m/). Uses app.js helpers (S, esc, shuffle, pick, render, SENT) at call time. */
const DMAP = {}; DIALOGUES.forEach(d=>DMAP[d.l]=d);
const DG_DEF = () => ({n:0, side:null, i:0, shown:0, how:"pick", opts:null, bad:[], built:[], result:null, missed:false, right:0, done:false, playing:-1, tok:0, en:true});
let DG = DG_DEF();
const dgOther = s => s==="A" ? "B" : "A";
const dgVoice = (d, i) => d.who[d.lines[i][0]].g;
function dgReset(n, keep){ const how=DG.how, en=DG.en; DG.tok++; stopAm(); DG = DG_DEF(); DG.n=n; if(keep){DG.how=how; DG.en=en;} }
function dgStop(){ if(DG.playing>=0 || DG.side){ DG.tok++; stopAm(); DG.playing=-1; } }
// Still on this dialogue's screen? Playback chains stop as soon as you leave it.
const dgHere = (tok) => tok===DG.tok && S.mode==="course" && S.lesson===DG.n && S.lview==="dlg";

function dgBubble(d, i, opt){
  const [sp, am, rom, en] = d.lines[i], p = d.who[sp], you = DG.side===sp;
  return `<div class="bub ${sp==="A"?"l":"r"} ${you?"you":""} ${opt.now?"now":""}">
    <div class="bwho">${esc(p.name)}${you?" (you)":""}</div>
    <div class="bline"><span class="am nosay">${esc(am)}</span>${canSay(am)||clipFor(am,p.g)?`<span class="sbtns"><button class="say" data-act="dg-say" data-v="${i}" aria-label="Listen" title="Listen">▶</button>${typeof micBtn==="function"?micBtn(am,p.g):""}</span>`:""}</div>
    ${rom?`<span class="rom">${esc(rom)}</span>`:""}${DG.en||opt.en?`<span class="en">${esc(en)}</span>`:""}</div>`;
}

function dialogueHTML(l){
  const d = DMAP[l.n]; if(!d) return "";
  if(DG.n!==l.n) dgReset(l.n, true);
  const A = d.who.A, B = d.who.B, enBtn = `<button class="link" data-act="dg-en">${DG.en?"Hide English":"Show English"}</button>`;
  if(!DG.side){
    const all = DG.playing>=0;
    return `<h3 class="dtitle">${esc(d.title)}</h3><p class="lead">${esc(d.scene)}</p>
      <div class="dbar"><button class="btn ${all?"":"primary"}" data-act="${all?"dg-stop":"dg-all"}">${all?"■ Stop":"▶ Play it all"}</button>${enBtn}</div>
      <div class="dlg">${d.lines.map((_,i)=>dgBubble(d,i,{now:DG.playing===i})).join("")}</div>
      <div class="note"><h4>Your turn: take a part</h4><p>You hear the other person, then answer. Choose your reply from three, or build it word by word.</p>
       ${mini("dg-how",[["pick","Choose"],["build","Build"]],DG.how)}
       <div class="btns dparts"><button class="btn primary" data-act="dg-side" data-v="A">Be ${esc(A.name)}</button><button class="btn primary" data-act="dg-side" data-v="B">Be ${esc(B.name)}</button></div></div>`;
  }
  const me = d.who[DG.side], them = d.who[dgOther(DG.side)];
  let h = `<div class="dbar"><button class="back" data-act="dg-quit">‹ Whole dialogue</button>${enBtn}</div>
    <p class="lead">You are <b>${esc(me.name)}</b>, talking to ${esc(them.name)}. ${esc(d.scene)}</p>
    <div class="dlg">`;
  for(let i=0;i<DG.shown;i++) h += dgBubble(d, i, {now:DG.playing===i});
  h += `</div>`;
  if(DG.done){
    const mine = d.lines.filter(x=>x[0]===DG.side).length;
    return h + `<div class="note dend"><h4>${DG.right===mine?"Perfect!":"Done!"}</h4><p>${DG.right} of ${mine} replies right first time.</p>
      <div class="btns"><button class="btn" data-act="dg-side" data-v="${DG.side}">Again</button><button class="btn primary" data-act="dg-side" data-v="${dgOther(DG.side)}">Swap parts</button></div></div>`;
  }
  if(DG.playing>=0 || DG.i>=d.lines.length || d.lines[DG.i][0]!==DG.side) return h + (DG.playing>=0 && d.lines[DG.playing][0]===DG.side ? "" : `<p class="count dwait">${esc(them.name)} is speaking…</p>`);
  // your turn
  const line = d.lines[DG.i];
  h += `<div class="dturn"><div class="kind">Your turn ${mini("dg-how",[["pick","Choose"],["build","Build"]],DG.how)}</div>
    <div class="dsay">Say: <b>${esc(line[3])}</b></div>`;
  if(DG.how==="pick"){
    if(!DG.opts) DG.opts = dgOptions(d, DG.i);
    h += `<div class="stack">`+DG.opts.map((o,j)=>{ const bad=DG.bad.includes(j), ok=DG.result==="ok"&&o.am===line[1];
      return `<button class="opt ${bad?"wrong":ok?"right":""}" data-act="dg-pick" data-v="${j}" ${bad||DG.result?"disabled":""}><span class="am">${esc(o.am)}</span>${o.rom?`<span class="rom">${esc(o.rom)}</span>`:""}</button>`; }).join("")+`</div>`;
    if(DG.bad.length) h += `<p class="fb bad">Not that one. Try again.</p>`;
  }else{
    if(!DG.opts) DG.opts = dgTiles(line[1]);
    const done = DG.result==="ok", shown = DG.result==="shown";
    h += `<div class="built ${done?"right":DG.result==="no"?"wrong":""}">${DG.built.map((t,j)=>`<button class="tile" data-act="dg-unbuild" data-v="${j}" ${DG.result&&DG.result!=="no"?"disabled":""}>${esc(DG.opts[t])}</button>`).join("")||`<span class="count">Tap the words in order</span>`}</div>
      <div class="tiles">${DG.opts.map((w,j)=>`<button class="tile ${DG.built.includes(j)?"used":""}" data-act="dg-build" data-v="${j}" ${DG.built.includes(j)||(DG.result&&DG.result!=="no")?"disabled":""}>${esc(w)}</button>`).join("")}</div>`;
    if(DG.result==="no") h += `<p class="fb bad">Not quite. Tap a word in the box to take it out.</p>`;
    if(DG.missed && !done && !shown) h += `<p class="count"><button class="link" data-act="dg-show">Show me the answer</button></p>`;
    if(!done && !shown) h += `<div class="btns"><button class="btn primary wide" data-act="dg-check" ${DG.built.length===DG.opts.length?"":"disabled"}>Check</button></div>`;
  }
  return h + `</div>`;
}

// Three replies to choose from: the right one, another of your lines in this dialogue, and a sentence from the course near this unit.
function dgOptions(d, i){
  const line = d.lines[i], k = sayKey(line[1]), seen = new Set([k]), out = [{am:line[1], rom:line[2]}];
  const add = (am, rom) => { const kk = sayKey(am); if(out.length<3 && !seen.has(kk)){ seen.add(kk); out.push({am, rom}); } };
  shuffle(d.lines.filter(x=>x[0]===line[0])).forEach(x=>add(x[1], x[2]));
  const len = line[1].split(" ").length;
  const near = SENT.filter(s=>s.l<=d.l).concat(DIALOGUES.filter(x=>x.l<=d.l && x!==d).flatMap(x=>x.lines.map(y=>({am:y[1], rom:y[2]}))));
  shuffle(near).sort((a,b)=>Math.abs(a.am.split(" ").length-len)-Math.abs(b.am.split(" ").length-len)).slice(0,6).forEach(x=>add(x.am, x.rom));
  return shuffle(out);
}
function dgTiles(am){
  const w = am.split(" ").filter(Boolean); let t = shuffle(w), g = 0;
  while(w.length>1 && t.join(" ")===w.join(" ") && g++<20) t = shuffle(w);
  return t;
}
// Show line `from`; play the other person's lines one after another until it's your turn or the end.
function dgRun(from){
  const d = DMAP[DG.n], tok = DG.tok;
  DG.shown = Math.max(DG.shown, Math.min(from+1, d.lines.length));
  if(from>=d.lines.length){ DG.done = true; DG.playing = -1; DG.shown = d.lines.length; render(); return; }
  DG.i = from; DG.opts = null; DG.bad = []; DG.built = []; DG.result = null; DG.missed = false;
  if(d.lines[from][0]===DG.side){ DG.shown = from; DG.playing = -1; render(); dgScroll(".dturn"); return; }
  DG.playing = from; render(); dgScroll(".bub.now");
  playAm(d.lines[from][1], 0, dgVoice(d, from), ()=>{ if(dgHere(tok)) setTimeout(()=>{ if(dgHere(tok)) dgRun(from+1); }, 350); });
}
// Keep the conversation in view as it grows
function dgScroll(sel){ const el = document.querySelector(sel); if(el && el.scrollIntoView) el.scrollIntoView({block:"nearest", behavior:"smooth"}); }
// Your reply is done (right, or shown to you): add it to the conversation, say it, and carry on.
function dgSaid(){
  const d = DMAP[DG.n], i = DG.i, tok = DG.tok;
  DG.shown = i+1; DG.playing = i; render();
  playAm(d.lines[i][1], 0, dgVoice(d, i), ()=>{ if(dgHere(tok)) setTimeout(()=>{ if(dgHere(tok)) dgRun(i+1); }, 350); });
}
function dgPlayAll(from){
  const d = DMAP[DG.n], tok = DG.tok;
  if(from>=d.lines.length){ DG.playing = -1; render(); return; }
  DG.playing = from; render(); dgScroll(".bub.now");
  playAm(d.lines[from][1], 0, dgVoice(d, from), ()=>{ if(dgHere(tok)) setTimeout(()=>{ if(dgHere(tok)) dgPlayAll(from+1); }, 350); });
}
// Clicks on data-act="dg-…". Returns true if it has rendered already.
function dgAct(a, v){
  const d = DMAP[DG.n]; if(!d) return false;
  if(a==="dg-say"){ dgStop(); playAm(d.lines[+v][1], 0, dgVoice(d, +v)); return true; }
  if(a==="dg-en"){ DG.en = !DG.en; return false; }
  if(a==="dg-how"){ DG.how = v; DG.opts = null; DG.bad = []; DG.built = []; if(DG.result==="no") DG.result = null; return false; }
  if(a==="dg-all"){ dgStop(); dgPlayAll(0); return true; }
  if(a==="dg-stop"){ dgStop(); return false; }
  if(a==="dg-quit"){ dgReset(DG.n, true); return false; }
  if(a==="dg-side"){ dgReset(DG.n, true); DG.side = v; dgRun(0); window.scrollTo(0,0); return true; }
  const line = d.lines[DG.i];
  if(a==="dg-pick" && !DG.result){
    if(DG.opts[+v].am===line[1]){ DG.result = "ok"; if(!DG.missed) DG.right++; dgSaid(); return true; }
    if(!DG.bad.includes(+v)) DG.bad.push(+v); DG.missed = true; return false;
  }
  if(a==="dg-build" && (!DG.result || DG.result==="no")){ if(!DG.built.includes(+v)) DG.built.push(+v); DG.result = null; return false; }
  if(a==="dg-unbuild" && (!DG.result || DG.result==="no")){ DG.built.splice(+v, 1); DG.result = null; return false; }
  if(a==="dg-check" && (!DG.result || DG.result==="no")){
    const said = DG.built.map(j=>DG.opts[j]).join(" ");
    if(said===line[1].split(" ").filter(Boolean).join(" ")){ if(!DG.missed) DG.right++; DG.result = "ok"; dgSaid(); return true; }
    DG.result = "no"; DG.missed = true; return false;
  }
  if(a==="dg-show"){ DG.result = "shown"; DG.built = []; dgSaid(); return true; }
  return false;
}
// For the Test tab: one button per unit that opens its dialogue.
function dgMenu(){
  return `<h3>Dialogues</h3><p class="count">Hear one side of a short conversation and answer as the other person.</p><div class="stack">`+
    DIALOGUES.map(d=>`<button class="topic" data-act="dg-open" data-v="${d.l}"><b><span class="lnum">${d.l}</span>${esc(d.title)}</b><small>${esc(d.who.A.name)} and ${esc(d.who.B.name)} · ${d.lines.length} lines</small></button>`).join("")+`</div>`;
}
