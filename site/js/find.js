/* ---------- search everything ----------
   One box that looks through every Amharic item in the app: course words, sentences, dialogues,
   extra words, verbs (and every verb form, for Amharic searches), grammar tables, pronouns,
   fidel letters and numbers. Matches English, Amharic or transcription.
   Twin letters count as the same (ሰ/ሠ, ሀ/ሐ/ኀ, አ/ዐ, ጸ/ፀ), and in transcription doubled
   letters and accents are ignored, so "ameseginalehu" finds አመሰግናለሁ.
   findSearch() needs only the data files and the engine (tests/run.mjs uses it); the screen itself
   (renderFind, findGo) uses app.js helpers at call time. */

const FIND_STRIP = /[?!.,;:"'“”‘’()\[\]\/\\*<>|…።፣፤፡፥፦፧፨]/g;
const findKey = s => String(s).normalize("NFC").replace(FIND_STRIP," ").replace(/\s+/g," ").trim();
const ETH = /[ሀ-᎟]/;
// Twin letters -> one letter, using the sound keys from fidel.js
const TWIN = {}; (()=>{ const first = {}; FID.forEach(f=>{ if(!(f.key in first)) first[f.key]=f.ch; TWIN[f.ch]=first[f.key]; }); })();
const normAm = s => Array.from(findKey(s)).map(c=>TWIN[c]||c).join("");
const normEn = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
// transcription: also drop apostrophes and doubled letters (gemination), and treat ä/ə like e/i
const normRom = s => normEn(String(s).replace(/ä/g,"e").replace(/ə/g,"i").replace(/[ʼ'’]/g,"")).replace(/(.)\1+/g,"$1");

let FIND_IX = null, FIND_FORMS = null;
// One entry per Amharic text; places = everywhere it appears, best first.
function findIndex(){
  if(FIND_IX) return FIND_IX;
  const map = new Map(), out = [];
  const add = (am, rom, en, place, rank) => {
    if(!am) return;
    const k = findKey(am); let e = map.get(k);
    if(!e){ e = {am, rom:rom||"", en:en||"", places:[], rank, na:normAm(am), nr:normRom(rom||""), ne:normEn(en||"")}; map.set(k, e); out.push(e); }
    else { if(!e.rom && rom){ e.rom = rom; e.nr = normRom(rom); } if(en && !e.ne.includes(normEn(en))){ e.en = e.en ? e.en+"; "+en : en; e.ne = normEn(e.en); } e.rank = Math.min(e.rank, rank); }
    if(!e.places.some(p=>p.label===place.label)) e.places.push(place);
  };
  LESSONS.filter(l=>!l.review).forEach(l=>(l.vocab||[]).forEach(w=>add(w[0], w[1], w[2], {label:`Unit ${l.n} words`, t:"lesson", n:l.n, view:"words"}, 0)));
  VLIST.forEach((v,i)=>add(v.am, modern(v.rom), v.en, {label: LESSONS.some(l=>l.n===v.lesson) ? `Verb · unit ${v.lesson}` : "Verb", t:"verb", i}, 1));
  Object.entries(EXTRA).forEach(([cat, words])=>words.forEach(w=>add(w[0], w[1], w[2], {label:`Extra words · ${cat}`, t:"extra", cat}, 2)));
  PR.concat(POLITE).forEach(p=>add(p.am, p.rom, p.en, {label:"Pronouns", t:"ref", tab:"pronouns"}, 2));
  SENT.forEach(x=>add(x.am, x.rom, x.en, {label:`Unit ${x.l} sentences`, t:"lesson", n:x.l, view:"sent"}, 3));
  DIALOGUES.forEach(d=>d.lines.forEach(x=>add(x[1], x[2], x[3], {label:`Unit ${d.l} dialogue`, t:"lesson", n:d.l, view:"dlg"}, 4)));
  // grammar tables: open the first unit whose notes show the table
  Object.entries(T).forEach(([k, t])=>{
    const l = LESSONS.find(l=>(l.notes||[]).some(nt=>(nt.tables||[]).concat(nt.show||[]).includes(k)));
    const place = l ? {label:`Unit ${l.n} notes · ${t.title}`, t:"lesson", n:l.n, view:"notes"} : {label:t.title, t:"ref", tab:"pronouns"};
    t.am.forEach((am,i)=>add(am, t.rom[i], (t.full ? t.en[i] : subj(i)+" "+t.en[i]), place, 5));
  });
  return FIND_IX = out;
}
// Every form of every verb, searched only when you type Amharic.
function findForms(){
  if(FIND_FORMS) return FIND_FORMS;
  const out = [];
  VLIST.forEach((v,i)=>{ const f = vforms(v);
    TENSES.forEach(([t, name])=>(f[t]||[]).forEach((x,p)=>out.push({am:x.am, rom:x.rom, en:`${subj(p)} · ${name.toLowerCase()} of “${v.en}”`, na:normAm(x.am), places:[{label:`Verb ${v.am} · ${name}`, t:"verb", i, tense:t}], rank:6})));
  });
  return FIND_FORMS = out;
}
function findScore(text, q){
  if(!text || !q) return 0;
  if(text===q) return 100;
  if(text.startsWith(q)) return 80;
  const at = text.indexOf(q); if(at<0) return 0;
  return (text[at-1]===" " || text[at-1]===";") ? 60 : (q.length>=3 ? 30 : 0);
}
// -> {hits:[entries], total}
function findSearch(raw, max){
  max = max || 50;
  const q0 = String(raw||"").trim(); if(!q0) return {hits:[], total:0};
  const scored = [];
  if(ETH.test(q0)){
    const q = normAm(q0), seen = new Set();
    findIndex().forEach(e=>{ const s = findScore(e.na, q); if(s){ scored.push([s, e]); seen.add(e.na); } });
    // verb forms: whole-word or start matches only, and not ones already found above
    findForms().forEach(e=>{ if(seen.has(e.na)) return; const s = findScore(e.na, q); if(s>=60){ scored.push([s-15, e]); seen.add(e.na); } });
    FID.forEach(f=>{ if(normAm(f.ch)===q) scored.push([110, {am:f.ch, rom:f.snd, en:"Fidel letter", places:[{label:"Fidel chart", t:"fidel", ch:f.ch}], rank:0}]); });
  }else{
    const qe = normEn(q0), qr = normRom(q0);
    if(qe) findIndex().forEach(e=>{ const s = Math.max(findScore(e.ne, qe), findScore(e.nr, qr)-5); if(s) scored.push([s, e]); });
    // a number: how to say and write it
    if(/^\d{1,4}$/.test(q0.replace(/,/g,"")) && typeof numWord==="function"){ const n = +q0.replace(/,/g,"");
      if(n>=1 && n<=9999){ const w = numWord(n); scored.push([120, {am:w[0], rom:w[1], en:n.toLocaleString("en")+" · "+numSym(n), places:[{label:"Numbers", t:"num", n}], rank:0}]); } }
    // a fidel sound, e.g. "be" or "shi": the letters that make it
    if(/^[a-z']{1,4}$/.test(q0.toLowerCase())) FID.forEach(f=>{ if(f.snd && f.snd===q0.toLowerCase()) scored.push([90, {am:f.ch, rom:f.snd, en:"Fidel letter", places:[{label:"Fidel chart", t:"fidel", ch:f.ch}], rank:0}]); });
  }
  scored.sort((a,b)=>b[0]-a[0] || a[1].rank-b[1].rank || a[1].am.length-b[1].am.length);
  return {hits:scored.slice(0,max).map(x=>x[1]), total:scored.length};
}

/* ---------- the search screen ---------- */
let FIND_LAST = [];
function findResultsHTML(){
  const q = S.find.q.trim();
  if(!q) return `<div class="note"><p>Type a word in English, Amharic or transcription. Try
    ${["water","ቡና","selam","go","25"].map(x=>`<button class="link" data-act="find-try" data-v="${esc(x)}">${esc(x)}</button>`).join(", ")}.</p>
    <p class="count">Tap ▶ to hear it${typeof recOK==="function"&&recOK()?", the microphone to record yourself saying it,":""} or a place name to go to where it's taught.</p></div>`;
  const {hits, total} = findSearch(q, 50);
  FIND_LAST = hits;
  if(!hits.length) return `<p class="count">Nothing found for “${esc(q)}”. Try fewer letters, or the English.</p>`;
  return `<p class="count">${total>hits.length?`Showing ${hits.length} of ${total}. Type more to narrow it down.`:`${total} found`}</p>
    <div class="tbl canrec findlist">`+hits.map((e,j)=>`<div class="row frow"><div class="form">${A(e.am,e.rom)}<span class="fen">${esc(e.en)}</span>
      <span class="fplaces">${e.places.slice(0,4).map((p,k)=>`<button class="link" data-act="find-go" data-v="${j}.${k}">${esc(p.label)}</button>`).join("")}${e.places.length>4?`<span class="count">+${e.places.length-4} more</span>`:""}</span></div></div>`).join("")+`</div>`;
}
function renderFind(){
  return `<h2>Search</h2>
    <input id="findq" class="sel findq" type="search" placeholder="English, Amharic or transcription" value="${esc(S.find.q)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" aria-label="Search">
    <div id="findres">${findResultsHTML()}</div>`;
}
function findRefresh(){ const r = document.getElementById("findres"); if(r){ r.innerHTML = findResultsHTML(); autoRom(r); addSayButtons(r); } }
// Go to where a result is taught, and point it out.
function findGo(v){
  const [j, k] = String(v).split(".").map(Number), e = FIND_LAST[j]; if(!e) return;
  const p = e.places[k]; S.find.from = true;
  if(p.t==="lesson"){ S.mode="course"; S.lesson=p.n; S.lview=p.view; if(p.view==="dlg") dgReset(p.n, true); }
  else if(p.t==="verb"){ S.mode="ref"; S.rtab="verbs"; S.v.view="look"; S.v.q=""; S.v.lesson="all"; S.v.sel=p.i; if(p.tense) S.v.tense=p.tense; }
  else if(p.t==="extra"){ S.mode="ref"; S.rtab="extra"; S.cat=p.cat; S.eview="list"; }
  else if(p.t==="ref"){ S.mode="ref"; S.rtab=p.tab; }
  else if(p.t==="fidel"){ S.mode="fidel"; S.ftab="chart"; S.pick=p.ch; }
  else if(p.t==="num"){ S.mode="num"; S.num.tab="try"; S.num.n=String(p.n); }
  render();
  // scroll to the word and make it glow for a moment
  const key = findKey(e.am), el = Array.from(document.querySelectorAll("#app .am")).find(x=>findKey(x.textContent)===key);
  const box = el ? (el.closest(".row,.bub,.vitem,.ncard,td,.peek") || el) : (p.t==="verb" ? document.getElementById("vpanel") : null);
  if(box){ box.scrollIntoView({block:"center"}); box.classList.add("hit"); setTimeout(()=>box.classList.remove("hit"), 2200); }
  else window.scrollTo(0,0);
}
