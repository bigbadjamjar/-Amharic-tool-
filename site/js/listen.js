/* ---------- listening practice ----------
   Questions answered by ear: the clip plays and the words stay hidden until you answer.
   Only words, sentences and letters that have a saved clip in audio/clips are used, so the
   tests grow by themselves as clips are added. Uses app.js helpers (mk, pick, LMAP, S ...) at call time. */
const LS_DEF = {upto:0, what:"both"};          // upto: last unit to use (0 = all units); what: words / sent / both
const LS_WHAT = [["words","Words"],["sent","Sentences"],["both","Both"]];
// Course words and sentences that have a clip, up to unit N. Each: {am, rom, en, l, w (1 = single word or phrase from a word list)}.
function lsItems(N, what){
  N = N || LASTF; what = what || "both";
  const seen = new Set(), out = [];
  const add = x => { const k = sayKey(x.am); if(!seen.has(k) && clipFor(x.am)){ seen.add(k); out.push(x); } };
  if(what !== "sent") FULL.filter(n=>n<=N).forEach(n=>(LMAP[n].vocab||[]).forEach(w=>add({am:w[0],rom:w[1],en:w[2],l:n,w:1})));
  if(what !== "words") SENT.filter(x=>x.l<=N).forEach(x=>add({am:x.am,rom:x.rom,en:x.en,l:x.l,w:0}));
  return out;
}
const lsLetters = () => FID.filter(f=>f.snd && clipFor(f.ch));
const lsQ = (q, x) => Object.assign(q, {listen:x.am, heardRom:x.rom||"", heardEn:x.en||""});
// 1. Hear it, pick the meaning
function qListenMean(N, what){
  const pool = lsItems(N, what); if(pool.length < 4) return null;
  const x = pick(pool);
  // wrong answers: same kind (word / sentence) first, then anything
  let others = pool.filter(y=>y.w===x.w && y.en!==x.en && y.am!==x.am);
  if(others.length < 6) others = pool.filter(y=>y.en!==x.en && y.am!==x.am);
  return lsQ(mk("Listening · meaning", x.am, true, "What does it mean?", {l:x.en}, others.map(y=>({l:y.en})), false), x);
}
// 2. Hear it, pick what was said, from look-alike and sound-alike choices written in fidel
function lsLike(a, b){
  const A = Array.from(a.replace(/\s/g,"")), B = Array.from(b.replace(/\s/g,""));
  const cA = new Set(A.map(c=>CAN[c]||c)), cB = new Set(B.map(c=>CAN[c]||c));
  let share = 0; cA.forEach(c=>{ if(cB.has(c)) share++; });
  return share*2 - Math.abs(A.length - B.length) - (a.split(" ").length !== b.split(" ").length ? 3 : 0) + (A[0]===Array.from(b)[0] ? 2 : 0);
}
function qListenWord(N, what){
  const pool = lsItems(N, what); if(pool.length < 4) return null;
  const x = pick(pool);
  const near = pool.filter(y=>canon(y.am)!==canon(x.am)).map(y=>[lsLike(x.am,y.am)+Math.random(),y]).sort((p,q)=>q[0]-p[0]).slice(0,6).map(p=>p[1]);
  return lsQ(mk("Listening · which one?", x.am, true, "Which did you hear?", {l:x.am, r:x.rom}, near.map(y=>({l:y.am, r:y.rom})), true), x);
}
// 3. Dictation: hear it, type it in fidel (words and short phrases only; long sentences are too slow to tap out)
function qListenType(N){
  const pool = lsItems(N, "both").filter(x=>(x.w ? typable([x.am,x.rom,x.en]) : sWords(x).length<=3));
  if(!pool.length) return null;
  const x = pick(pool);
  return lsQ({type:"type", kind:"Dictation", big:x.am, bigAm:true, sub:"Type what you hear", answer:x.am, rom:x.rom}, x);
}
// 4. Hear a letter, pick it. Wrong choices share its consonant or its vowel, but never sound the same (no twin letters).
function qListenLetter(){
  const pool = lsLetters(); if(pool.length < 2) return null;
  const f = pick(pool);
  const seen = new Set([f.snd]), wr = [];
  shuffle(FID.filter(x=>x.snd && x.snd!==f.snd && CAN[x.ch]!==CAN[f.ch] && (x.row===f.row || x.ord===f.ord)))
    .forEach(x=>{ if(!seen.has(x.snd)){ seen.add(x.snd); wr.push({l:x.ch}); } });
  return lsQ(mk("Listening · letters", f.ch, true, "Which letter did you hear?", {l:f.ch, r:f.snd}, wr.map(o=>({l:o.l, r:(FID.find(y=>y.ch===o.l)||{}).snd})), true), {am:f.ch, rom:f.snd});
}
const LS_TESTS = ["lis-mean","lis-word","lis-type","lis-letter"];
function lsTopic(id){
  const N = () => S.ls.upto, W = () => S.ls.what;
  if(id==="lis-mean") return {name:"Hear it, pick the meaning", desc:"Listen to a word or sentence and choose what it means", gen:()=>qListenMean(N(),W())};
  if(id==="lis-word") return {name:"Hear it, pick the Amharic", desc:"Choose what you heard from words that look and sound alike", gen:()=>qListenWord(N(),W())};
  if(id==="lis-type") return {name:"Dictation", desc:"Listen, then type what you hear in fidel", gen:()=>qListenType(N())};
  if(id==="lis-letter") return {name:"Hear a letter", desc:"Listen to a single fidel letter and pick it", gen:qListenLetter};
}
// How many items each test can draw on, with the current settings
function lsCount(id){
  if(id==="lis-letter") return lsLetters().length;
  if(id==="lis-type") return lsItems(S.ls.upto,"both").filter(x=>(x.w ? typable([x.am,x.rom,x.en]) : sWords(x).length<=3)).length;
  return lsItems(S.ls.upto, S.ls.what).length;
}
function lsMenu(){
  const item = id => { const t=lsTopic(id), n=lsCount(id), ok = id==="lis-letter" ? n>=20 : n>=4;
    return `<button class="topic" data-act="start" data-v="${id}" ${ok?"":"disabled"}><b>${esc(t.name)}</b><small>${esc(ok?t.desc:id==="lis-letter"?"No letter recordings yet. They come with the “fidel letters” audio run.":"Not enough recordings for these settings.")}</small>${ok?bestChip(id):""}</button>`; };
  const L = S.ls;
  return `<h3>Listening</h3><div class="stack">${LS_TESTS.map(item).join("")}</div>
   <div class="note bset"><h4>Listening settings</h4>
    <p class="count">Units</p><select id="ls-upto" class="sel" aria-label="Units for listening"><option value="0">All units</option>${FULL.map(n=>`<option value="${n}" ${L.upto===n?"selected":""}>Units 1 to ${n}</option>`).join("")}</select>
    <p class="count">Use</p>${mini("ls-what",LS_WHAT,L.what)}
    <p class="count bhelp">${lsItems(L.upto,L.what).length} recordings to practise with. “Use” applies to the first two tests; dictation always uses words and short phrases. Audio speed is set with the ${esc(sayRate+"×")} button at the top.</p></div>`;
}
// The top of a listening question: big play button, a slower one, and (after answering) what was said
const lsSlow = () => sayRate>.5 ? Math.max(.5, Math.round(sayRate*.7*100)/100) : 0;
function lsHead(q, answered){
  const slow = lsSlow();
  let h = `<div class="kind">${esc(q.kind)}</div><div class="lsplay"><button class="lsbtn" data-act="say" data-v="${esc(q.listen)}" aria-label="Play again"><span aria-hidden="true">▶</span> Play</button>`+
    (slow ? `<button class="lsbtn slow" data-act="say-slow" data-v="${esc(q.listen)}" aria-label="Play slower"><span aria-hidden="true">🐢</span> Slower</button>` : "")+`</div>`;
  if(answered) h += `<div class="heard"><span class="am nosay">${esc(q.listen)}</span>${q.heardRom?`<span class="rom">${esc(q.heardRom)}</span>`:""}${q.heardEn?`<span class="en">${esc(q.heardEn)}</span>`:""}</div>`;
  else h += `<div class="sub">${esc(q.sub)}</div>`+(q.type==="type"&&q.heardEn?(S.quiz&&S.quiz.hint===S.quiz.i?`<div class="sub">It means “${esc(q.heardEn)}”</div>`:`<button class="link" data-act="ls-hint" style="margin-top:6px">Hint: show the meaning</button>`):"");
  return h;
}
