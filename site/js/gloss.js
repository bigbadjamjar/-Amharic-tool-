/* ---------- word by word ----------
   With the "Word by word" switch on (S.gloss, saved in each profile), a sentence shows each Amharic word
   with its English meaning under it, in Amharic word order, so you can see how the sentence is built:
     ስሜ        ሳራ     ነው
     my name   Sara   is
   The meanings are in data/gloss.js. A sentence with none there simply gets no word-by-word line.
   Made-up sentences from the sentence builder get theirs from the pieces they were built from.
   Uses app.js helpers (S, esc) and romOf (rom.js) at call time. */

const GL_PUNCT = /[።፣፤፥፦፧?!.,;:«»"“”()…]/g;
const glClean = w => String(w).replace(GL_PUNCT, "").trim();
const glKey = s => String(s).normalize("NFC").replace(GL_PUNCT, " ").replace(/\s+/g, " ").trim();
const glWords = s => String(s).normalize("NFC").split(/\s+/).filter(w => glClean(w));
const GL_MAP = (() => {
  const m = {};
  for (const k in GLOSS) m[glKey(k)] = GLOSS[k].split("|").map(x => x.trim());
  return m;
})();

// One word from GLOSSW, also with ለ- "for" or ከ- "and" in front (ለአራት "for four", ከሃምሳ "and fifty").
function glWord(w){
  if (GLOSSW[w]) return GLOSSW[w];
  const p = w[0], rest = w.slice(1);
  if ((p === "ለ" || p === "ከ") && GLOSSW[rest] && !/^\?/.test(GLOSSW[rest])) return (p === "ለ" ? "for " : "and ") + GLOSSW[rest];
  return null;
}

// The meaning of each word of a sentence (an array, one per word), or null if there is none.
function glossOf(am){
  if (typeof am !== "string") return null;
  const ws = glWords(am);
  if (ws.length < 2) return null;
  const g = GL_MAP[glKey(am)];
  if (g && g.length === ws.length) return g;
  const each = ws.map(w => glWord(glClean(w)));
  return each.every(Boolean) ? each : null;
}

// A sentence from the sentence builder: words tagged with how they were made (builder.js).
function glossOfWords(words){
  if (!Array.isArray(words) || words.length < 2) return null;
  const sets = () => BTIME.concat(BWHEN_MORE, Object.values(BOBJ).flat());
  const g = words.map(w => {
    const d = w.d || {};
    if (d.k === "pr" && PR[d.i]) return PR[d.i].short || PR[d.i].en;
    if (d.k === "set") { const x = sets().find(y => y[0] === w.am); return x ? x[2].replace(/^(a|an) /, "") : null; }
    if (d.k === "verb" && d.t !== "vn" && typeof enForm === "function") {
      const v = VLIST.find(x => (x.head || x.rom) === d.h); if (!v) return null;
      try {
        // "she drinks / will drink": the future half when the sentence says ነገ "tomorrow"
        const f = enForm(v, d.t, d.i), [now, later] = f.text.split(" / ");
        const t = later && words.some(x => x.am === "ነገ") ? EN_WHO[d.i] + " " + later : now;
        return f.tag ? t.replace(/^you\b/, "you (" + f.tag + ")").replace(/!$/, "! (" + f.tag + ")").replace(/\) \((m|f|pl)\)$/, ")") : t;
      } catch (e) { return null; }
    }
    return null;
  });
  return g.every(Boolean) ? g : null;
}

// The switch. One setting for the whole app; it is shown wherever there are sentences.
const glossBtn = () => `<button class="glbtn" data-act="gloss" aria-pressed="${!!S.gloss}" title="Show the English meaning under each Amharic word"><i></i>Word by word</button>`;

// The word-by-word line for one sentence, or "" (switch off, or no meanings for it).
// rom: the sentence's own transcription, if it has one word for each Amharic word; given: meanings already worked out.
function glossHTML(am, rom, given){
  if (!S.gloss) return "";
  const g = given || glossOf(am); if (!g) return "";
  const ws = glWords(am);
  if (g.length !== ws.length) return "";
  const rs = rom ? String(rom).replace(/[?!.,;:"“”()…]/g, " ").split(/\s+/).filter(Boolean) : [];
  const r = j => rs.length === ws.length ? rs[j] : romOf(glClean(ws[j]));
  return `<div class="gloss norom-auto" role="group" aria-label="Word by word">` + ws.map((w, j) => {
    const unsure = /^\?/.test(g[j]), en = g[j].replace(/^\?\s*/, "");
    return `<span class="gw"><span class="am nosay">${esc(glClean(w))}</span><span class="rom">${esc(r(j))}</span>` +
      `<span class="ge${unsure ? " unsure" : ""}"${unsure ? ` title="A best guess, not yet checked by a native speaker"` : ""}>${esc(en)}</span></span>`;
  }).join("") + `</div>`;
}

// After a test question is answered: the sentence it was about, word by word, with the switch beside it.
function glossForQ(q){
  if (!q) return null;
  const opt = q.optAm && q.opts && q.opts[q.ans];
  const tries = [];
  if (q.type === "order" || q.type === "slot") tries.push([q.answer, q.rom, q.words]);
  if (q.bigAm) tries.push([q.big, q.bigRom]);
  if (typeof q.listen === "string") tries.push([q.listen, null]);
  if (q.parts) tries.push([q.parts.join(" "), q.bigRom]);
  if (opt) tries.push([opt.l, opt.r]);
  for (const [am, rom, words] of tries) {
    if (typeof am !== "string") continue;
    const g = glossOf(am) || glossOfWords(words);
    if (g) return {am, rom, g};
  }
  return null;
}
function glossQHTML(q){
  const x = glossForQ(q); if (!x) return "";
  return `<div class="glq">${glossBtn()}${glossHTML(x.am, x.rom, x.g)}</div>`;
}
