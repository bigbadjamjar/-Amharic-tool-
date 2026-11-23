/* ---------- reading stories and culture notes ----------
   Stories (data/stories.js) live on the Test tab (section "Stories"), and are also linked from the end of
   the unit they go with. Tap any word to see what it means and how it sounds; play one line or the whole
   story; a short quiz at the end, whose best score is kept like any test's (S.best["st-" + id]).
   Culture notes (data/culture.js) live on the Course page: short notes with useful phrases.
   The rest of the state lives in RD, not in S, and isn't saved. Uses app.js helpers (S, esc, fmt, mini,
   wordList, render, save, shuffle, LMAP) at call time. */
const RD_DEF = () => ({view:null, id:null, from:null, w:null, en:false, ans:{}, ord:null, playing:-1, tok:0});
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
// a story shows on the Test tab, a culture note on the Course page
const rdFocus = () => S.mode==="test" && !S.quiz && RD.view==="story";
const rdHere = tok => tok===RD.tok && rdFocus();
function rdStop(){ if(RD.playing>=0){ RD.tok++; stopAm(); RD.playing = -1; } }
function rdLeave(){ rdStop(); RD.view = null; RD.id = null; RD.w = null; }
function rdOpen(view, id, from){ rdStop(); const en = RD.en; RD = RD_DEF(); RD.en = en; RD.view = view; RD.id = id; RD.from = from; if(view==="story") rdShuffle(); }
// the quiz answers come in a new order each time (in the data the right one is often first)
function rdShuffle(){ const s = STMAP[RD.id]; RD.ord = s ? s.qs.map(q => shuffle(q[1].map((_, j) => j))) : null; }
const stBestId = s => "st-"+s.id;
const stChip = s => { const b = S.best[stBestId(s)]; return b!=null ? `<span class="best"><strong>${b}/${s.qs.length}</strong>best</span>` : `<span class="best untried">not tried</span>`; };
const rdUnits = us => us.length===1 ? `Unit ${us[0]}` : `Units ${us.slice(0,-1).join(", ")} and ${us[us.length-1]}`;

/* Course page: the way in to the culture notes (the stories are on the Test tab) */
function rdCourseCards(){
  return `<div class="rdgo">
    <button class="tcard cu" data-act="rd-list" data-v="culture"><span class="ticon" aria-hidden="true">☕</span><b>Culture notes</b><small>Greetings, the coffee ceremony, holidays, Ethiopian time and more.</small><span class="tn">${CULTURE.length} notes ›</span></button></div>`;
}
/* Test tab, section "Stories": every story, easiest first, with its best quiz score */
function rdStoryList(){
  return `<div class="stack">${STORIES.map(s => `<button class="topic" data-act="rd-story" data-v="${s.id}" data-from="list"><b><span class="lnum">${s.after}</span>${esc(s.title)}</b><small>After unit ${s.after} · ${s.lines.length} lines · ${s.qs.length} questions · ${esc(s.intro)}</small>${stChip(s)}</button>`).join("")}</div>`;
}
/* End of a unit's notes: the story and culture notes that go with it */
function rdUnitLinks(n){
  const st = STORIES.filter(s => s.after===n), cu = CULTURE.filter(c => c.units.includes(n));
  if(!st.length && !cu.length) return "";
  return `<h3>Read more</h3><div class="stack rdfill rdmore" style="--n:${st.length+cu.length}">`+
    st.map(s => `<button class="topic" data-act="rd-story" data-v="${s.id}" data-from="unit"><b>📖 Story and quiz: ${esc(s.title)}</b><small>${esc(s.intro)} Tap any word for its meaning.</small></button>`).join("")+
    cu.map(c => `<button class="topic" data-act="rd-note" data-v="${c.id}" data-from="unit"><b>${c.icon} Culture: ${esc(c.title)}</b><small>${esc(c.intro)}</small></button>`).join("")+`</div>`;
}

function rdBack(){
  const back = RD.from==="unit" && S.lesson ? `‹ Unit ${S.lesson}` : RD.view==="story" ? "‹ All stories" : RD.from==="list" ? "‹ All culture notes" : "‹ Course";
  return `<button class="back" data-act="rd-back">${back}</button>`;
}
function rdHTML(){
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
    <h3>Useful phrases</h3>${wordList(c.phrases.map(x => [x[0], x[1], x[2]]))}
    <h3>Goes with</h3><div class="stack rdfill" style="--n:${c.units.length}">${c.units.map(n => `<button class="topic" data-act="lesson-go" data-v="${n}"><b><span class="lnum">${n}</span>${esc(LMAP[n].title)}</b><small>Open the unit</small></button>`).join("")}</div>`;
}

function rdStoryHTML(s){
  if(!s) return "";
  const all = RD.playing>=0, i = STORIES.indexOf(s), next = STORIES[i+1];
  let h = rdBack() + `<h2>${esc(s.title)}</h2><p class="rdam"><span class="am nosay">${esc(s.am)}</span>${sayBtn(s.am)} <span class="rom">${esc(s.rom||"")}</span></p>
    <p class="lead">After unit ${s.after}. ${esc(s.intro)}</p>
    <div class="dbar"><button class="btn ${all?"":"primary"}" data-act="${all?"rd-stop":"rd-all"}">${all?"■ Stop":"▶ Read it to me"}</button><button class="link" data-act="rd-en">${RD.en?"Hide English":"Show English"}</button></div>
    <p class="count rdhint">Tap any word to see what it means.</p>
    <div class="story norom-auto">`;
  s.lines.forEach((line, li) => {
    const ws = rdWords(line);
    h += `<div class="stl ${RD.playing===li?"now":""}"><div class="stam">${ws.map((w, j) => `${esc(w.pre)}<button class="stw" data-act="rd-w" data-v="${li}:${j}" aria-pressed="${RD.w===li+":"+j}">${esc(w.shown)}</button>${esc(w.post)}`).join(" ")}${canSay(line[0])?`<button class="say" data-act="rd-say" data-v="${li}" aria-label="Listen to this line" title="Listen">▶</button>`:""}</div>
      <span class="rom">${esc(line[1])}</span>${RD.en?`<span class="en">${esc(line[2])}</span>`:""}`;
    if(RD.w && +RD.w.split(":")[0]===li){
      const w = ws[+RD.w.split(":")[1]];
      if(w) h += `<div class="stword"><div class="stwhead"><span class="am">${esc(w.shown)}</span>${sayBtn(w.key)}<button class="stx" data-act="rd-w" data-v="" aria-label="Close">×</button></div><span class="rom">${esc(w.rom)}</span><span class="en">${esc(STWORDS[w.key] || "")}</span></div>`;
    }
    h += `</div>`;
  });
  if(!RD.ord) rdShuffle();
  h += `</div><div class="bar sthead"><h3>Quiz: did you follow it?</h3>${stChip(s)}</div><div class="stqs">`;
  s.qs.forEach(([q, opts, a], qi) => {
    const got = RD.ans[qi], ord = RD.ord[qi] || opts.map((_, j) => j);
    h += `<div class="stq"><p><b>${qi+1}.</b> ${esc(q)}</p><div class="stopts">${ord.map(j => `<button class="opt ${got!=null&&j===a?"right":got===j?"wrong":""}" data-act="rd-ans" data-v="${qi}:${j}" ${got!=null?"disabled":""}>${esc(opts[j])}</button>`).join("")}</div></div>`;
  });
  h += `</div>`;
  const done = Object.keys(RD.ans).length===s.qs.length, right = s.qs.filter((q, qi) => RD.ans[qi]===q[2]).length;
  if(done) h += `<p class="fb ${right===s.qs.length?"good":""}">${right} of ${s.qs.length} right.${right===s.qs.length?" Well done!":" Read it again and try once more?"}${RD.record?" A new best score for this story.":""}</p>`;
  h += `<div class="rdnext">${done?`<button class="btn" data-act="rd-again">Try the quiz again</button>`:""}${next?`<button class="btn primary" data-act="rd-story" data-v="${next.id}" data-from="${RD.from==="unit"?"list":RD.from||"list"}">Next story: ${esc(next.title)} ›</button>`:""}</div>`;
  return h;
}

// When the last question is answered: keep the best score, and count it towards today's practice.
function rdScore(){
  const s = STMAP[RD.id]; if(!s || Object.keys(RD.ans).length<s.qs.length) return;
  const right = s.qs.filter((q, qi) => RD.ans[qi]===q[2]).length, k = stBestId(s), b = S.best[k];
  RD.record = b!=null && right>b;
  if(b==null || right>b) S.best[k] = right;
  if(typeof srsActivity==="function" && S.srs) srsActivity(S.srs);
  save();
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
  if(a==="rd-story"){   // a story opens on the Test tab, wherever it was chosen
    S.mode = "test"; S.quiz = null; S.tsec = "stories"; if(typeof gmStop==="function") gmStop();
    rdOpen("story", v, from==="unit" ? "unit" : "list"); window.scrollTo(0,0); return false;
  }
  if(a==="rd-note"){
    const back = RD.view===null ? (from || "course") : from;
    rdOpen("note", v, back); window.scrollTo(0,0); return false;
  }
  if(a==="rd-back"){
    const f = RD.from, story = RD.view==="story";
    if(story){ rdLeave(); if(f==="unit" && S.lesson){ S.mode = "course"; S.lview = "notes"; } }   // back to the unit, or to the list of stories
    else if(f==="list") rdOpen("culture", null, "course"); else rdLeave();
    window.scrollTo(0,0); return false;
  }
  if(a==="rd-en"){ RD.en = !RD.en; return false; }
  if(a==="rd-w"){ RD.w = !v || RD.w===v ? null : v; const s = STMAP[RD.id]; if(RD.w && s){ const w = rdWords(s.lines[+v.split(":")[0]])[+v.split(":")[1]]; if(w && canSay(w.key)) playAm(w.key); } return false; }
  if(a==="rd-say"){ rdStop(); playAm(STMAP[RD.id].lines[+v][0]); render(); return true; }
  if(a==="rd-all"){ rdStop(); rdPlayAll(0); return true; }
  if(a==="rd-stop"){ rdStop(); return false; }
  if(a==="rd-ans"){ const [q, j] = v.split(":").map(Number); if(RD.ans[q]==null){ RD.ans[q] = j; rdScore(); } return false; }
  if(a==="rd-again"){ RD.ans = {}; RD.record = false; rdShuffle(); return false; }
  return false;
}
