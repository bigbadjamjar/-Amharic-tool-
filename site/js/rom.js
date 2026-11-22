/* ---------- transcription for any Amharic on the page ----------
   Most Amharic in the app comes with its own transcription. Some does not: words inside notes and
   headings, the person column of verb tables, search results, the verb list. So that the Transcription
   switch covers everything, autoRom() runs after each render and adds a .rom after any Amharic that
   has none.
   The transcription is looked up word by word in ROMW, which is built from every Amharic/transcription
   pair already in the data, so loose words read the same as they do elsewhere in the app. A word the
   data never transcribes falls back to romGuess(), a letter-by-letter reading of the fidel. */

const ETH_RE = /[ሀ-ፚ]/;                       // letters (numerals and marks are 1360-137C)
const ETH_RUN = /-?[ሀ-፼](?:[ሀ-፼\s\-]*[ሀ-፼])?/g;
const ROM_PUNCT = {"።":".","፣":",","፤":";","፥":":","፦":":","፧":"?","፨":".","፡":" "};
const ROM_SCHOLARLY = /[äəšñčǧžṭṣ̣]/;

// fidel letter -> {c: consonant, v: vowel (null for the sixth order, which may or may not sound an i)}
const ROMF = {};
FID.forEach(f => {
  const c = FR[f.row][1];
  if (f.ord === 5) ROMF[f.ch] = {c, v: null};
  else if (f.ord === 8 && /\(i\)$/.test(f.snd)) ROMF[f.ch] = {c: c + "w", v: null};
  else ROMF[f.ch] = {c: "", v: f.snd};                // snd already joins consonant and vowel
});

// Letter-by-letter reading. Sixth-order letters get an i at the start of a word and between two
// consonants, and none at the end of a word or on their own: ስም sim, ልብስ libs, ትምህርት timhirt, -ን -n.
function romGuess(word){
  const ch = Array.from(word), out = [];
  ch.forEach((x, i) => {
    const f = ROMF[x];
    if (!f) { out.push(ROM_PUNCT[x] !== undefined ? ROM_PUNCT[x] : x); return; }
    if (f.v !== null) { out.push(f.v); return; }
    const prev = out.join(""), atStart = !prev || /\s$/.test(prev);   // after a hyphen it is a suffix, not a word start
    const atEnd = !ROMF[ch[i + 1]];
    const afterCons = /[bcdfghjklmnpqrstvwxyz']$/.test(prev);
    out.push(f.c + (!atEnd && (atStart || afterCons) ? "i" : ""));
  });
  return out.join("");
}

// Every word the data transcribes: fidel word -> transcription (the most common one if they differ).
const ROMW = (() => {
  const count = {};
  const clean = s => s.replace(/[?!.,;:"“”‘’()…።፣፤፥፦፧፨፡]/g, "").trim();
  const pair = (am, rom) => {
    if (typeof am !== "string" || typeof rom !== "string" || !ETH_RE.test(am) || ETH_RE.test(rom) || !/[a-z]/i.test(rom)) return;
    if (ROM_SCHOLARLY.test(rom) && typeof modern === "function") rom = modern(rom);
    const a = clean(am).split(/\s+/).filter(Boolean), r = clean(rom).split(/\s+/).filter(Boolean);
    const add = (k, v) => { const c = count[k] = count[k] || {}; c[v] = (c[v] || 0) + 1; };
    if (a.length > 1) add(a.join(" "), r.join(" "));
    if (a.length === r.length) a.forEach((w, i) => add(w, r[i]));
  };
  const seen = new Set();
  const walk = (x, depth) => {
    if (!x || typeof x !== "object" || depth > 7 || seen.has(x)) return;
    seen.add(x);
    if (Array.isArray(x)) {
      for (let i = 0; i + 1 < x.length; i++) pair(x[i], x[i + 1]);
      x.forEach(y => walk(y, depth + 1));
      return;
    }
    if (typeof x.am === "string") pair(x.am, x.rom);
    if (Array.isArray(x.am) && Array.isArray(x.rom)) x.am.forEach((a, i) => pair(a, x.rom[i]));
    Object.values(x).forEach(y => walk(y, depth + 1));
  };
  const src = [];
  try { src.push(LESSONS, EXTRA, SENT, PR, POLITE, T, PARTS, DIALOGUES, VLIST); } catch (e) {}
  ["BVERBS", "BOBJ", "BTIME", "BWHEN_MORE"].forEach(n => { try { src.push(eval(n)); } catch (e) {} });
  src.forEach(s => walk(s, 0));
  const out = {};
  for (const k in count) out[k] = Object.entries(count[k]).sort((a, b) => b[1] - a[1])[0][0];
  return out;
})();

// Transcription of a piece of Amharic text (Latin and digits inside it are kept as they are).
function romOf(s){
  s = String(s).normalize("NFC");
  const whole = s.replace(/[?!.,;:"“”()…።፣፤፥፦፧፨፡]/g, "").trim();
  // (only when the punctuation is all at the ends: "ነኝ፣ እግዚአብሔር" has a comma inside, so it goes word by word)
  if (ROMW[whole] && s.includes(whole)) return s.replace(whole, ROMW[whole]).replace(/[።፣፤፥፦፧፨፡]/g, c => ROM_PUNCT[c]);
  return s.split(/(\s+)/).map(tok => {
    if (!ETH_RE.test(tok)) return tok;
    const m = tok.match(/^(-?)([ሀ-ፚ]+)(.*)$/);
    if (m && ROMW[m[2]]) return m[1] + ROMW[m[2]] + m[3].replace(/[፠-፨]/g, c => ROM_PUNCT[c] || c);
    return romGuess(tok);
  }).join("");
}

// After each render: give every piece of Amharic that has no transcription one.
// Left alone: the fidel chart, keyboards and typing boxes (the letters are what you practise), quiz
// questions and answer choices (their transcription appears once you answer), number symbols, and
// anything inside .norom-auto.
const ROM_SKIP = ".chart,.keys,.forms,.kbd,.tin,input,textarea,select,.rom,.say,.sbtns,.q,.opt,.tiles,.tile,.built,.slots,.peek,.wlicon,.ticon,.ncard .sym,.norom-auto,header";
function romHasNext(el){
  let n = el.nextSibling;
  while (n && ((n.nodeType === 3 && !n.nodeValue.trim()) || (n.nodeType === 1 && n.matches(".say,.sbtns,.mic,br")))) n = n.nextSibling;
  return !!(n && n.nodeType === 1 && n.classList.contains("rom"));
}
function autoRom(root){
  if (!root) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
  let t; while ((t = tw.nextNode())) if (ETH_RE.test(t.nodeValue)) nodes.push(t);
  nodes.forEach(node => {
    const el = node.parentElement;
    if (!el || el.closest(ROM_SKIP)) return;
    const am = el.closest(".am");
    if (am) {
      // an .am already followed by its transcription, or the first Amharic of a block that is (dialogue lines)
      if (am.querySelector(".rom") || romHasNext(am)) return;
      const blk = am.parentElement;
      if (blk && blk.querySelector(".am") === am && romHasNext(blk)) return;
      if (am.textContent.trim() !== node.nodeValue.trim() && am.firstChild !== node) return;   // one per .am
      const r = document.createElement("span");
      r.className = "rom"; r.textContent = romOf(am.textContent.replace(/▶/g, "").trim());
      am.after(" ", r);
      return;
    }
    // loose Amharic inside English text: wrap each run as fidel plus transcription
    const txt = node.nodeValue, frag = document.createDocumentFragment();
    let last = 0, done = false;
    txt.replace(ETH_RUN, (run, at) => {
      if (!ETH_RE.test(run)) return run;                 // numerals and marks only: leave as they are
      frag.append(txt.slice(last, at));
      const a = document.createElement("span"); a.className = "am nosay"; a.textContent = run;   // no ▶ here, as before
      const r = document.createElement("span"); r.className = "rom"; r.textContent = romOf(run);
      frag.append(a, " ", r);
      last = at + run.length; done = true;
      return run;
    });
    if (!done) return;
    frag.append(txt.slice(last));
    node.replaceWith(frag);
  });
}
