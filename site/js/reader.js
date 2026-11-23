/* ---------- reading stories and culture notes ----------
   Opened from the Course page (two cards at the top) and from the end of a unit's notes.
   Stories (data/stories.js): tap any word to see what it means and how it sounds; play one line or the
   whole story; three questions at the end. Culture notes (data/culture.js): short notes with useful phrases.
   The state lives in RD, not in S, and nothing here is saved. Uses app.js helpers (S, esc, fmt, mini,
   wordList, render, LMAP) at call time. */
const RD_DEF = () => ({view:null, id:null, from:null, w:null, en:false, ans:{}, playing:-1, tok:0});
let RD = RD_DEF();
const STMAP = {}; STORIES.forEach(s => STMAP[s.id] = s);
const CUMAP = {}; CULTURE.forEach(c => CUMAP[c.id] = c);
const RD_PUNCT = /[።፣፤፥፦፧?!.,;:«»"“”]/g;
const rdKey = w => w.replace(RD_PUNCT, "");
// The words of a line, each with its own transcription and the punctuation that follows it.
function rdWords(line){
  const am = line[0].split(/\s+/).filter(Boolean), rom = line[1].replace(/[?!.,;:]/g, " ").split(/\s+/).filter(Boolean);
  return am.map((w, j) => ({key: rdKey(w), shown: w.replace(/^[«"“]+/, "").replace(/[።፣፤፥፦፧?!.,;:»"”]+$/, ""), pre: (w.match(/^[«"“]+/) || [""])[0], post: (w.match(/[።፣፤፥፦፧?!.,;:»"”]+$/) || [""])[0], rom: rom[j] || ""}));
}
const rdFocus = () => S.mode==="course" && RD.view==="story";
const rdHere = tok => tok===RD.tok && rdFocus();
function rdStop(){ if(RD.playing>=0){ RD.tok++; stopAm(); RD.playing = -1; } }
function rdLeave(){ rdStop(); RD.view = null; RD.id = null; RD.w = null; }
function rdOpen(view, id, from){ rdStop(); const en = RD.en; RD = RD_DEF(); RD.en = en; RD.view = view; RD.id = id; RD.from = from; }
const rdUnits = us => us.length===1 ? `Unit ${us[0]}` : `Units ${us.slice(0,-1).join(", ")} and ${us[us.length-1]}`;

/* Course page: the way in */
function rdCourseCards(){
  return `<div class="rdgo">
    <button class="tcard" data-act="rd-list" data-v="stories"><span class="ticon" aria-hidden="true">📖</span><b>Reading stories</b><small>${STORIES.length} short stories that grow with the course. Tap any word to see what it means.</small><span class="tn">${STORIES.length} stories ›</span></button>
    <button class="tcard" data-act="rd-list" data-v="culture"><span class="ticon" aria-hidden="true">☕</span><b>Culture notes</b><small>Greetings, the coffee ceremony, holidays, Ethiopian time and more.</small><span class="tn">${CULTURE.length} notes ›</span></button></div>`;
}
/* End of a unit's notes: the story and culture notes that go with it */
function rdUnitLinks(n){
  const st = STORIES.filter(s => s.after===n), cu = CULTURE.filter(c => c.units.includes(n));
  if(!st.length && !cu.length) return "";
  return `<h3>Read more</h3><div class="stack rdfill rdmore" style="--n:${st.length+cu.length}">`+
    st.map(s => `<button class="topic" data-act="rd-story" data-v="${s.id}" data-from="unit"><b>📖 Story: ${esc(s.title)}</b><small>${esc(s.intro)} Tap any word for its meaning.</small></button>`).join("")+
    cu.map(c => `<button class="topic" data-act="rd-note" data-v="${c.id}" data-from="unit"><b>${c.icon} Culture: ${esc(c.title)}</b><small>${esc(c.intro)}</small></button>`).join("")+`</div>`;
}

function rdBack(){
  const back = RD.from==="unit" && S.lesson ? `‹ Unit ${S.lesson}` : RD.from==="list" ? (RD.view==="story" ? "‹ All stories" : "‹ All culture notes") : "‹ Course";
  return `<button class="back" data-act="rd-back">${back}</button>`;
}
function rdHTML(){
  if(RD.view==="stories") return rdBack() + `<h2>Reading stories</h2><p class="lead">Short stories written for this course, from easy to harder. Each one uses the words and grammar up to its unit. Tap any word to see what it means and hear it.</p>
    <div class="stack">${STORIES.map(s => `<button class="topic" data-act="rd-story" data-v="${s.id}" data-from="list"><b><span class="lnum">${s.after}</span>${esc(s.title)}</b><small>After unit ${s.after} · ${s.lines.length} lines · ${esc(s.intro)}</small></button>`).join("")}</div>`;
  if(RD.view==="culture") return rdBack() + `<h2>Culture notes</h2><p class="lead">Short notes on everyday life in Ethiopia, each with a few useful phrases. Each one goes with a unit of the course.</p>
    <div class="tgrid rdgrid">${CULTURE.map(c => `<button class="tcard" data-act="rd-note" data-v="${c.id}" data-from="list"><span class="ticon" aria-hidden="true">${c.icon}</span><b>${esc(c.title)}</b><small>${esc(c.intro)}</small><span class="tn">${rdUnits(c.units)} ›</span></button>`).join("")}</div>`;
  if(RD.view==="note") return rdNoteHTML(CUMAP[RD.id]);
  if(RD.view==="story") return rdStoryHTML(STMAP[RD.id]);
  return "";
}

function rdNoteHTML(c){
  if(!c) return "";
  return rdBack() + `<h2 class="rdh"><span aria-hidden="true">${c.icon}</span> ${esc(c.title)}</h2><p class="lead">${esc(c.intro)}</p>
    <div class="note rdnote">${c.p.map(p => `<p>${fmt(p)}</p>`).join("")}</div>
    <div class="glbar"><h3>Useful phrases</h3>${glossBtn()}</div>${wordList(c.phrases.map(x => [x[0], x[1], x[2]]), true)}
    <h3>Goes with</h3><div class="stack rdfill" style="--n:${c.units.length}">${c.units.map(n => `<button class="topic" data-act="lesson-go" data-v="${n}"><b><span class="lnum">${n}</span>${esc(LMAP[n].title)}</b><small>Open the unit</small></button>`).join("")}</div>`;
}

function rdStoryHTML(s){
  if(!s) return "";
  const all = RD.playing>=0, i = STORIES.indexOf(s), next = STORIES[i+1];
  let h = rdBack() + `<h2>${esc(s.title)}</h2><p class="rdam"><span class="am nosay">${esc(s.am)}</span>${sayBtn(s.am)} <span class="rom">${esc(s.rom||"")}</span></p>
    <p class="lead">After unit ${s.after}. ${esc(s.intro)}</p>
    <div class="dbar"><button class="btn ${all?"":"primary"}" data-act="${all?"rd-stop":"rd-all"}">${all?"■ Stop":"▶ Read it to me"}</button><span class="dtog"><button class="link" data-act="rd-en">${RD.en?"Hide English":"Show English"}</button>${glossBtn()}</span></div>
    <p class="count rdhint">Tap any word to see what it means.</p>
    <div class="story norom-auto">`;
  s.lines.forEach((line, li) => {
    const ws = rdWords(line);
    h += `<div class="stl ${RD.playing===li?"now":""}"><div class="stam">${ws.map((w, j) => `${esc(w.pre)}<button class="stw" data-act="rd-w" data-v="${li}:${j}" aria-pressed="${RD.w===li+":"+j}">${esc(w.shown)}</button>${esc(w.post)}`).join(" ")}${canSay(line[0])?`<button class="say" data-act="rd-say" data-v="${li}" aria-label="Listen to this line" title="Listen">▶</button>`:""}</div>
      <span class="rom">${esc(line[1])}</span>${RD.en?`<span class="en">${esc(line[2])}</span>`:""}${glossHTML(line[0],line[1])}`;
    if(RD.w && +RD.w.split(":")[0]===li){
      const w = ws[+RD.w.split(":")[1]];
      if(w) h += `<div class="stword"><div class="stwhead"><span class="am">${esc(w.shown)}</span>${sayBtn(w.key)}<button class="stx" data-act="rd-w" data-v="" aria-label="Close">×</button></div><span class="rom">${esc(w.rom)}</span><span class="en">${esc(STWORDS[w.key] || "")}</span></div>`;
    }
    h += `</div>`;
  });
  h += `</div><h3>Did you follow it?</h3><div class="stqs">`;
  s.qs.forEach(([q, opts, a], qi) => {
    const got = RD.ans[qi];
    h += `<div class="stq"><p><b>${qi+1}.</b> ${esc(q)}</p><div class="stopts">${opts.map((o, j) => `<button class="opt ${got!=null&&j===a?"right":got===j?"wrong":""}" data-act="rd-ans" data-v="${qi}:${j}" ${got!=null?"disabled":""}>${esc(o)}</button>`).join("")}</div></div>`;
  });
  h += `</div>`;
  const done = Object.keys(RD.ans).length===s.qs.length, right = s.qs.filter((q, qi) => RD.ans[qi]===q[2]).length;
  if(done) h += `<p class="fb ${right===s.qs.length?"good":""}">${right} of ${s.qs.length} right.${right===s.qs.length?" Well done!":" Read it again and try once more?"}</p>`;
  h += `<div class="rdnext">${done?`<button class="btn" data-act="rd-again">Try the questions again</button>`:""}${next?`<button class="btn primary" data-act="rd-story" data-v="${next.id}" data-from="${RD.from||"list"}">Next story: ${esc(next.title)} ›</button>`:""}</div>`;
  return h;
}

function rdPlayAll(from){
  const s = STMAP[RD.id], tok = RD.tok;
  if(!s || from>=s.lines.length){ RD.playing = -1; render(); return; }
  RD.playing = from; render();
  const el = document.querySelector(".stl.now"); if(el && el.scrollIntoView) el.scrollIntoView({block:"nearest", behavior:"smooth"});
  playAm(s.lines[from][0], 0, null, () => { if(rdHere(tok)) setTimeout(() => { if(rdHere(tok)) rdPlayAll(from+1); }, 450); });
}

// Clicks on data-act="rd-…". Returns true if it has rendered already.
function rdAct(a, v, b){
  const from = b && b.dataset.from;
  if(a==="rd-list"){ S.lesson = null; rdOpen(v, null, "course"); window.scrollTo(0,0); return false; }
  if(a==="rd-story" || a==="rd-note"){
    const back = RD.view===null ? (from || "course") : RD.view==="story" ? RD.from : from;   // "next story" keeps where you came from
    rdOpen(a==="rd-story" ? "story" : "note", v, back); window.scrollTo(0,0); return false;
  }
  if(a==="rd-back"){
    const f = RD.from, kind = RD.view==="story" ? "stories" : "culture";
    if(f==="list") rdOpen(kind, null, "course"); else rdLeave();
    window.scrollTo(0,0); return false;
  }
  if(a==="rd-en"){ RD.en = !RD.en; return false; }
  if(a==="rd-w"){ RD.w = !v || RD.w===v ? null : v; const s = STMAP[RD.id]; if(RD.w && s){ const w = rdWords(s.lines[+v.split(":")[0]])[+v.split(":")[1]]; if(w && canSay(w.key)) playAm(w.key); } return false; }
  if(a==="rd-say"){ rdStop(); playAm(STMAP[RD.id].lines[+v][0]); render(); return true; }
  if(a==="rd-all"){ rdStop(); rdPlayAll(0); return true; }
  if(a==="rd-stop"){ rdStop(); return false; }
  if(a==="rd-ans"){ const [q, j] = v.split(":").map(Number); if(RD.ans[q]==null) RD.ans[q] = j; return false; }
  if(a==="rd-again"){ RD.ans = {}; return false; }
  return false;
}
