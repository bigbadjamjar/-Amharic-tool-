// Checks the data files and the verb engine without a browser:  node tests/run.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
// Same order as the <script> tags in site/index.html, minus the browser-only files.
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
  .filter(f => f.startsWith("js/") && !/js\/(app|audio|profiles|offline|dialogue|recorder|progress|report)\.js$/.test(f));
const ctx = vm.createContext({ console });
vm.runInContext(files.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n;\n") +
  "\n;globalThis.X={romOf,enForm,DIALOGUES,VLIST,VRAW,T,PARTS,LESSONS,SENT,vforms,TENSES,EXTRA,FID,toFidel,BVERBS,bMakeVerbSentence,bCourseSentence,bOptions,findSearch,findIndex,srsEmpty,srsAnswer,srsActivity,srsDue,srsStreak,srsForecast,srsMigrate,srsClean,srsIndex,srsKeyOf,srsCount,gToE,eToG,etTime,EV,GLOSS,GLOSSW,glossOf,glossOfWords,glWords,glKey,STORIES,CULTURE};", ctx);
const X = ctx.X;

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log("FAIL " + msg); } };
const verb = head => X.VLIST.find(v => v.head === head);
const form = (head, tense, i) => { const v = verb(head); return v ? (i == null ? X.vforms(v)[tense] : X.vforms(v)[tense][i]).am : "(no verb " + head + ")"; };

// --- course data hangs together
const lessonNums = new Set(X.LESSONS.map(l => l.n));
for (const l of X.LESSONS) {
  for (const n of l.notes || []) {
    for (const t of n.tables || []) ok(X.T[t], `lesson ${l.n}: table "${t}" does not exist`);
    for (const p of n.parts || []) ok(X.PARTS[p] || p.endsWith("Stem"), `lesson ${l.n}: parts "${p}" do not exist`);
  }
  for (const r of l.review || []) ok(lessonNums.has(r), `lesson ${l.n} reviews missing lesson ${r}`);
  for (const w of l.vocab || []) ok(w.length >= 3 && w[0] && w[2], `lesson ${l.n}: bad vocab entry ${JSON.stringify(w)}`);
}
for (const s of X.SENT) ok(lessonNums.has(s.l) && s.am && s.en, `sentence has a bad lesson or is empty: ${JSON.stringify(s)}`);
for (const t of Object.values(X.T)) ok(t.am.length === 8 && t.rom.length === 8 && t.en.length === 8, `table "${t.title}" needs 8 forms`);
for (const [cat, words] of Object.entries(X.EXTRA)) for (const w of words) ok(w.length >= 3, `vocab ${cat}: bad entry ${JSON.stringify(w)}`);

// --- dialogues: one per unit, well formed, and readable as JSON by tools/make_audio.py
const dsrc = fs.readFileSync(path.join(root, "js/data/dialogues.js"), "utf8");
let djson = null; try { djson = JSON.parse(dsrc.slice(dsrc.indexOf("= [") + 2, dsrc.lastIndexOf("]") + 1)); } catch (e) { ok(false, `dialogues.js is not strict JSON: ${e.message}`); }
ok(djson && djson.length === X.DIALOGUES.length, "dialogues.js: JSON read and script disagree");
for (const l of X.LESSONS.filter(l => !l.review)) ok(X.DIALOGUES.some(d => d.l === l.n), `unit ${l.n} has no dialogue`);
for (const d of X.DIALOGUES) {
  ok(lessonNums.has(d.l) && d.title && d.scene, `dialogue for unit ${d.l}: bad unit, title or scene`);
  ok(["A", "B"].every(k => d.who[k] && d.who[k].name && /^[fm]$/.test(d.who[k].g)), `dialogue ${d.l}: each speaker needs a name and g "f" or "m"`);
  ok(d.lines.length >= 4 && d.lines.length <= 8, `dialogue ${d.l}: should have 4 to 8 lines`);
  for (const [sp, am, rom, en] of d.lines) {
    ok(d.who[sp] && am && rom && en, `dialogue ${d.l}: bad line ${JSON.stringify([sp, am])}`);
    ok(!/[A-Za-z]/.test(am), `dialogue ${d.l}: Latin letters in the Amharic ${am}`);
  }
  ok(d.lines.some(x => x[0] === "A") && d.lines.some(x => x[0] === "B"), `dialogue ${d.l}: both speakers need lines`);
}

// --- every verb conjugates in every tense, 8 persons each
for (const v of X.VLIST) {
  let f; try { f = X.vforms(v); } catch (e) { ok(false, `verb ${v.rom} throws: ${e.message}`); continue; }
  for (const [k] of X.TENSES) if (f[k]) ok(f[k].length === 8 && f[k].every(x => x.am && !/undefined|null/.test(x.am + x.rom)), `verb ${v.rom} ${k} is incomplete`);
}

// --- forms a native speaker has confirmed, and mistakes the older app made
const knownForms = [
  ["ayyä", "pres", 0, "አያለሁ"],          // not እያለሁ
  ["ayyä", "vn", null, "ማየት"],
  ["anäbbäbä", "pres", 0, "አነባለሁ"],
  ["anäbbäbä", "vn", null, "ማንበብ"],
  ["anäbbäbä", "cmd", 1, "አንብብ"],
  ["wäddädä", "vn", null, "መውደድ"],      // not መወደድ
  ["wäddädä", "pres", 0, "እወዳለሁ"],
  ["säbbärä", "past", 0, "ሰበርኩ"],
  ["säbbärä", "pres", 3, "ይሰብራል"],
  ["fällägä", "pres", 0, "እፈልጋለሁ"],
  ["anäbbäbä", "pastNeg", 0, "አላነበብኩም"],  // not አልአነበብኩም
];
for (const [h, t, i, want] of knownForms) {
  if (!verb(h)) { console.log(`note: ${h} is not in the word list, skipped`); continue; }
  const got = form(h, t, i);
  ok(got === want, `${h} ${t}${i == null ? "" : "[" + i + "]"}: expected ${want}, got ${got}`);
}
// verbs are tagged with a real unit (or 99), and every verb a unit teaches is one the engine knows
const units = new Map(X.LESSONS.map(l => [l.n, l]));
for (const v of X.VRAW) ok(v[3] === 99 || (units.has(v[3]) && !units.get(v[3]).review), `verb ${v[0]} has unit ${v[3]}`);
const known = new Set(X.VLIST.map(v => v.am));
for (const l of X.LESSONS) for (const w of l.vocab || []) {
  const looksVerb = /^(be |[a-z]+$|[a-z]+, [a-z]+$|[a-z]+ [a-z]+$)/.test(w[2]) && X.VRAW.some(r => r[0] === w[0]);
  if (looksVerb) ok(X.VRAW.find(r => r[0] === w[0])[3] <= l.n, `unit ${l.n} teaches ${w[0]} but the verb list tags it later`);
}
// sentences belong to teaching units, and extra vocabulary does not repeat course words
for (const s of X.SENT) ok(!units.get(s.l)?.review, `sentence "${s.am}" is filed under a review unit`);
const courseWords = new Set(X.LESSONS.flatMap(l => (l.vocab || []).map(w => w[0])));
for (const [cat, words] of Object.entries(X.EXTRA)) for (const w of words) ok(!courseWords.has(w[0]), `extra vocab ${cat} repeats course word ${w[0]}`);

// --- sentence builder: every slot offers the right word once, plus 3 different wrong ones
for (const b of X.BVERBS) ok(verb(b[0]), `sentence builder uses ${b[0]}, which is not in the verb list`);
const checkSlots = (x, what) => {
  for (const w of x.words) {
    const o = X.bOptions(w), ams = o.map(y => y.am);
    ok(o.filter(y => y.ok).length === 1 && o.find(y => y.ok).am === w.am, `${what}: "${w.am}" is not offered exactly once as right`);
    ok(new Set(ams).size === ams.length, `${what}: repeated choices for "${w.am}"`);
    ok(o.length === 4, `${what}: only ${o.length} choices for "${w.am}"`);
  }
};
for (let n = 0; n < 400; n++) { const x = X.bMakeVerbSentence(); if (x) checkSlots(x, `made-up "${x.en}"`); }
// every setting still gives the right number of choices, with the right word once
for (const mode of ["forms", "mixed", "any"]) for (const n of [2, 3, 6]) for (const tenses of [["past"], ["pres", "presNeg"], undefined]) {
  const o = { mode, n, tenses, upto: n === 6 ? 0 : 8 };
  for (let k = 0; k < 30; k++) {
    const x = X.bMakeVerbSentence(o.upto || 99, tenses) || X.bMakeVerbSentence();
    for (const w of x.words) {
      const c = X.bOptions(w, o);
      ok(c.length === n && c.filter(y => y.ok).length === 1 && new Set(c.map(y => y.am)).size === n, `${mode}/${n}: bad choices for "${w.am}"`);
      // "same word" mode: every wrong verb choice is a form of the right verb
      if (mode === "forms" && w.d.k === "verb") {
        const all = new Set(Object.values(X.vforms(verb(w.d.h))).flat().map(y => y.am));
        ok(c.every(y => all.has(y.am)), `forms mode offered another verb for "${w.am}": ${c.map(y => y.am).join(" ")}`);
      }
    }
  }
}
for (const s of X.SENT) checkSlots(X.bCourseSentence(s), `course "${s.am}"`);

// --- profiles: old progress moves into a first profile, and backups survive the round trip
{
  const P = vm.createContext({ console, TextEncoder, TextDecoder, CompressionStream, DecompressionStream, Response, Blob, btoa, atob, Uint8Array });
  vm.runInContext(fs.readFileSync(path.join(root, "js/profiles.js"), "utf8") + "\n;globalThis.X={makeProfiles,memoryStore,backupToCode,readBackup};", P);
  const Y = P.X, st = Y.memoryStore();
  st.setItem("amharic-best", JSON.stringify({ L1: 9 })); st.setItem("amharic-rom", "0"); st.setItem("amharic-upto", "4");
  st.setItem("amharic-miss", JSON.stringify([{ k: "a", q: { big: "x" }, s: 0 }]));
  const pr = Y.makeProfiles(st), me = pr.cur();
  ok(pr.list().length === 1 && me && me.name === "Me", "old progress should become one profile called Me");
  const d = pr.load();
  ok(d.best.L1 === 9 && d.rom === false && d.upto === 4 && d.miss.length === 1 && d.kbhints === true, "old progress moved across wrongly: " + JSON.stringify(d));
  ok(Y.makeProfiles(st).list().length === 1, "migration should only happen once");
  const sam = pr.add("Sam"); pr.add("sam");
  ok(pr.list().map(p => p.name).join() === "Me,Sam,sam (2)", "names should be made unique: " + pr.list().map(p => p.name).join());
  ok(pr.cur().name === "sam (2)" && Object.keys(pr.load().best || {}).length === 0, "a new profile starts empty and becomes current");
  pr.use(me.id); pr.rename(me.id, "  Rob  "); ok(pr.cur().name === "Rob", "rename");
  const lg = pr.add("Christopher Robin"); ok(pr.cur().name.length <= 10 && pr.cur().name === "Christophe", "long names are cut to 10 letters: " + pr.cur().name);
  pr.add("Christopher"); ok(pr.cur().name === "Christ (2)", "a unique long name still fits 10 letters: " + pr.cur().name);
  pr.remove && pr.remove(pr.cur().id); pr.remove && pr.remove(lg);
  pr.save({ best: { L2: 7 } }, sam); ok(pr.load(me.id).best.L1 === 9 && pr.load(sam).best.L2 === 7, "profiles keep separate progress");
  const b = pr.backup(me.id);
  for (const code of [await Y.backupToCode(b), JSON.stringify(b)]) {
    const back = await Y.readBackup(code);
    ok(back.name === "Rob" && back.data.best.L1 === 9 && back.data.miss.length === 1, "backup round trip failed for " + code.slice(0, 6));
  }
  let msg = ""; try { await Y.readBackup("hello"); } catch (e) { msg = e.message; }
  ok(/doesn't look like a backup/.test(msg), "a bad code should give a plain error");
  pr.remove(sam); ok(pr.list().length === 2 && pr.load(sam).best === undefined, "remove deletes the profile's data");
  const fresh = Y.makeProfiles(Y.memoryStore()); ok(fresh.list().length === 0 && fresh.cur() === null, "a new device starts with no profiles");
}

// --- spaced repetition: boxes, due dates, streaks, and moving old progress across
{
  const D = 20000, st = X.srsEmpty();
  X.srsAnswer(st, "w:ሰላም", true, D); ok(st.it["w:ሰላም"][0] === 1 && st.it["w:ሰላም"][1] === D + 1, "a new item starts in box 1, due tomorrow");
  X.srsAnswer(st, "w:ሰላም", true, D); ok(st.it["w:ሰላም"][0] === 1, "a right answer before it's due doesn't move it up");
  const days = [D + 1, D + 4, D + 11, D + 25, D + 55];
  days.forEach(d => X.srsAnswer(st, "w:ሰላም", true, d));
  ok(st.it["w:ሰላም"][0] === 6 && st.it["w:ሰላም"][1] === D + 115, "right on each due day climbs to box 6: " + JSON.stringify(st.it["w:ሰላም"]));
  X.srsAnswer(st, "w:ሰላም", false, D + 120); ok(st.it["w:ሰላም"][0] === 4 && st.it["w:ሰላም"][1] === D + 121, "a wrong answer drops two boxes, due tomorrow");
  ok(X.srsDue(st, D + 121).length === 1 && X.srsDue(st, D + 120).length === 0, "due list");
  ok(X.srsForecast(st, 3, D + 120).join() === "0,1,0", "forecast");
  const a = X.srsEmpty(); [D - 3, D - 2, D - 1, D, D - 10, D - 9].forEach(d => X.srsActivity(a, d));
  const k = X.srsStreak(a, D); ok(k.now === 4 && k.best === 4 && k.today === 1, "streak counts days in a row: " + JSON.stringify(k));
  ok(X.srsStreak(a, D + 1).now === 4 && X.srsStreak(a, D + 2).now === 0, "streak survives until the end of the next day");
  const ix = X.srsIndex(), u1 = X.LESSONS.find(l => l.n === 1).vocab[0];
  ok(ix["w:" + u1[0]] && ix["w:" + u1[0]].unit === 1, "index knows unit 1's words");
  ok(X.srsKeyOf({ type: "mc", big: u1[2], opts: [{ l: u1[0] }], ans: 0 }) === "w:" + u1[0], "old saved mistakes are matched to their word");
  const m = X.srsMigrate({ best: { L1: 9, L2: 4 }, miss: [{ k: "x", q: { type: "mc", big: u1[2], opts: [{ l: u1[0] }], ans: 0 } }], day: "2024-10-1" }, D);
  const u2 = X.LESSONS.find(l => l.n === 2).vocab[0];
  ok(m.it["w:" + u1[0]][0] === 1 && m.it["w:" + u1[0]][1] === D, "a saved mistake is due today after moving across");
  ok(m.it["w:" + u2[0]][0] === 1 && !m.it["w:" + X.LESSONS.find(l => l.n === 3).vocab[0][0]], "a weak unit starts in box 1, untested units stay new");
  const good = X.LESSONS.find(l => l.n === 1).vocab.filter(w => w[0] !== u1[0]).map(w => m.it["w:" + w[0]]);
  ok(good.every(r => r && r[0] === 2 && r[1] > D), "words from a well-scored unit start in box 2");
  ok(Object.keys(X.srsClean(JSON.parse(JSON.stringify(m))).it).length === Object.keys(m.it).length, "saved review data survives a save and load");
  ok(X.srsClean({ it: { bad: [9, 1], ok: [2, 5] } }).it.bad === undefined, "bad saved rows are dropped");
}
// --- search: finds things by English, Amharic (twin letters alike), transcription and verb forms
{
  const top = (q, n = 5) => X.findSearch(q, n).hits.map(e => e.am);
  ok(top("hello").includes("ሰላም"), "search: 'hello' should find ሰላም");
  ok(top("selam")[0] === "ሰላም", "search: transcription 'selam' should put ሰላም first");
  ok(top("ሠላም")[0] === "ሰላም", "search: twin letter ሠ should match ሰ");
  ok(top("ameseginalehu").includes("አመሰግናለሁ"), "search: transcription ignores doubled letters");
  ok(X.findSearch("አያለሁ").hits.some(e => e.places.some(p => p.t === "verb")), "search: a verb form (አያለሁ) finds its verb");
  ok(X.findSearch("zzzzqq").hits.length === 0, "search: nonsense finds nothing");
  ok(X.findSearch("water", 500).hits.every(e => e.places.length), "search: every result has somewhere to go");
  const n = X.findIndex().length; ok(n > 1000, `search index looks too small (${n})`);
}

// --- reading stories and culture notes: every word of a story can be tapped, units exist
{
  const rc = vm.createContext({});
  vm.runInContext(["stories.js", "culture.js"].map(f => fs.readFileSync(path.join(root, "js/data", f), "utf8")).join("\n;\n") + ";globalThis.R={STORIES,STWORDS,CULTURE};", rc);
  const { STORIES, STWORDS, CULTURE } = rc.R, P = /[።፣፤፥፦፧?!.,;:«»"“”]/g, ids = new Set();
  for (const s of STORIES) {
    ok(s.id && !ids.has(s.id) && s.title && s.am && s.rom && s.intro && lessonNums.has(s.after), `story ${s.id}: needs a unique id, title, Amharic title, intro and a real unit`);
    ids.add(s.id);
    ok(s.lines.length >= 5 && s.lines.length <= 12, `story ${s.id}: should have 5 to 12 lines`);
    for (const [am, rom, en] of s.lines) {
      ok(am && rom && en && !/[A-Za-z]/.test(am), `story ${s.id}: bad line ${am}`);
      const a = am.replace(P, " ").split(/\s+/).filter(Boolean), r = rom.replace(/[?!.,;:]/g, " ").split(/\s+/).filter(Boolean);
      ok(a.length === r.length, `story ${s.id}: ${a.length} Amharic words but ${r.length} in the transcription: ${am}`);
      for (const w of a) ok(STWORDS[w], `story ${s.id}: no meaning for the word ${w}`);
    }
    for (const [q, opts, a] of s.qs) ok(q && opts.length === 3 && opts[a], `story ${s.id}: bad question ${q}`);
  }
  for (const c of CULTURE) {
    ok(c.id && !ids.has(c.id + "-c") && c.title && c.intro && c.icon && c.p.length, `culture ${c.id}: needs id, title, intro, icon, text`);
    ids.add(c.id + "-c");
    ok(c.units.length && c.units.every(n => lessonNums.has(n)), `culture ${c.id}: links to a unit that doesn't exist`);
    for (const p of c.p) for (const m of p.matchAll(/\{([^|}]+)\|([^}]*)\}/g)) ok(m[2].trim() && !/[A-Za-z]/.test(m[1]), `culture ${c.id}: example ${m[0]} needs fidel and a transcription`);
    for (const [am, rom, en] of c.phrases) ok(am && rom && en && !/[A-Za-z]/.test(am), `culture ${c.id}: bad phrase ${am}`);
  }
}

// --- everyday drills: the Ethiopian calendar and clock
{
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  ok(same(X.gToE(2026, 11, 22), [2019, 3, 13]), "22 Nov 2026 is Hidar 13, 2019");
  ok(same(X.gToE(2026, 9, 11), [2019, 1, 1]), "New Year 2019 is 11 Sep 2026");
  ok(same(X.gToE(2027, 9, 12), [2020, 1, 1]) && same(X.gToE(2027, 9, 11), [2019, 13, 6]), "New Year moves to 12 Sep before a leap year, after a 6-day Pagume");
  ok(same(X.gToE(2027, 1, 7), [2019, 4, 29]), "Genna (Christmas) is 7 January");
  ok(same(X.eToG(2019, 3, 13), [2026, 11, 22]), "Ethiopian to Western date");
  ok(X.etTime(9, 0).parts.join(" ") === "ጠዋት ሦስት ሰዓት", "9 am is ጠዋት ሦስት ሰዓት");
  ok(X.etTime(20, 30).parts.join(" ") === "ማታ ሁለት ሰዓት ተኩል", "8:30 pm is ማታ ሁለት ሰዓት ተኩል");
  ok(X.etTime(9, 45).parts.join(" ") === "ጠዋት ለአራት ሩብ ጉዳይ", "9:45 am names the coming hour");
  ok(X.EV.hours.length === 12 && X.EV.qto.length === 12 && X.EV.months.length === 13 && X.EV.days.length === 7, "everyday word lists are complete");
}

// --- English meaning beside each verb form
{
  const en = (head, t, i) => X.enForm(verb(head), t, i).text;
  const byEn = (g, t, i) => X.enForm(X.VLIST.find(v => v.en === g), t, i).text;
  ok(byEn("eat", "past", 0) === "I ate", "English past of eat: " + byEn("eat", "past", 0));
  ok(byEn("eat", "pres", 3) === "he eats / will eat", "English present of eat: " + byEn("eat", "pres", 3));
  ok(byEn("study", "pastNeg", 5) === "we did not study", "English past negative: " + byEn("study", "pastNeg", 5));
  ok(byEn("be tired", "past", 6) === "you were tired", "English past of be: " + byEn("be tired", "past", 6));
  ok(byEn("be tired", "presNeg", 0) === "I am not tired / won't be tired", "English negative of be: " + byEn("be tired", "presNeg", 0));
  ok(byEn("go, leave, walk", "perf", 4) === "she has gone", "English has done: " + byEn("go, leave, walk", "perf", 4));
  ok(byEn("open", "cmd", 1) === "open!" && byEn("open", "cmd", 5) === "let us open", "English commands");
  ok(byEn("open", "cmdNeg", 2) === "don't open!" && byEn("open", "cmdNeg", 7) === "let them not open", "English negative commands");
  ok(byEn("wash oneself", "past", 0) === "I washed myself", "English oneself: " + byEn("wash oneself", "past", 0));
  ok(byEn("quarrel", "past", 7) === "they quarrelled", "British doubling: " + byEn("quarrel", "past", 7));
  ok(byEn("get used to (a place, each other)", "past", 0) === "I got used to", "brackets dropped: " + byEn("get used to (a place, each other)", "past", 0));
  for (const v of X.VLIST) for (const t of Object.keys(X.vforms(v))) if (Array.isArray(X.vforms(v)[t]))
    for (let i = 0; i < 8; i++) { const s = X.enForm(v, t, i).text; ok(s && !/[()]|undefined|  /.test(s.replace("(that) ","")), `English for ${v.en} ${t} ${i}: "${s}"`); }
}

// --- transcription of a sentence with a comma inside is not left in Amharic letters
ok(!/[ሀ-፼]/.test(X.romOf("ደህና ነኝ፣ እግዚአብሔር ይመስገን። አንተስ?")), "romOf with inner punctuation: " + X.romOf("ደህና ነኝ፣ እግዚአብሔር ይመስገን። አንተስ?"));

// --- word by word (data/gloss.js): one meaning for each word, and every sentence covered
{
  const SR = { cur: null };
  for (const [k, v] of Object.entries(X.GLOSS)) {
    const n = X.glWords(k).length, g = v.split("|");
    ok(n === g.length, `gloss for ${k}: ${n} Amharic words but ${g.length} meanings ("${v}")`);
    ok(g.every(x => x.trim() && !/^\s|\s$/.test(x)), `gloss for ${k}: an empty meaning, or spaces round a | ("${v}")`);
  }
  // Sentences without a word-by-word line are listed, not failed, so new content can land first.
  const all = [];
  X.SENT.forEach(s => all.push(["sentences", s.am]));
  X.DIALOGUES.forEach(d => d.lines.forEach(l => all.push([`dialogue ${d.l}`, l[1]])));
  X.STORIES.forEach(s => s.lines.forEach(l => all.push([`story ${s.id}`, l[0]])));
  X.CULTURE.forEach(c => (c.phrases || []).forEach(p => all.push([`culture ${c.id}`, p[0]])));
  ["timeWords", "shop", "dateWords"].forEach(k => X.EV[k].forEach(p => all.push([`everyday ${k}`, p[0]])));
  const missing = all.filter(([, am]) => X.glWords(am).length > 1 && !X.glossOf(am));
  if (missing.length) console.log(`note: ${missing.length} sentences have no word-by-word meanings yet (data/gloss.js):\n  ` + missing.map(([w, am]) => `${w}: ${am}`).join("\n  "));
  const used = new Set(all.map(([, am]) => X.glKey(am)));
  const spare = Object.keys(X.GLOSS).filter(k => !used.has(X.glKey(k)));
  if (spare.length) console.log(`note: ${spare.length} entries in data/gloss.js match no sentence (edited or removed?):\n  ` + spare.join("\n  "));
  ok(X.glossOf("ስሜ ሳራ ነው።").join("|") === "my name|Sara|is", "glossOf ignores punctuation");
  ok(X.glossOf("ሰላም") === null, "one word: no word-by-word line");
  // every time the Everyday drills can say, and the made-up sentences of the sentence builder
  for (let h = 0; h < 24; h++) for (const m of [0, 15, 30, 45]) { const t = X.etTime(h, m); ok(X.glossOf(t.parts.join(" ")), `no word-by-word for the time ${t.parts.join(" ")}`); }
  ok(X.glossOf("ለአራት ሩብ ጉዳይ").join("|") === "for four|quarter|?short", "ለ- on a number: " + X.glossOf("ለአራት ሩብ ጉዳይ"));
  for (let k = 0; k < 300; k++) { const x = X.bMakeVerbSentence(); if (!x || x.words.length < 2) continue; const g = X.glossOfWords(x.words);
    ok(g && g.length === x.words.length, `no word-by-word for the made-up sentence ${x.words.map(w => w.am).join(" ")}`); }
}

// --- audio: a line with only a male-voice clip (a man's dialogue line) still gets a play button everywhere
{
  const actx = vm.createContext({ window: { AUDIO_FILES: { "ሰላም": "clips/ሰላም.mp3" }, AUDIO_MALE: { "ደህና ነኝ": "clips/m/ደህና ነኝ.mp3", "ሰላም": "clips/m/ሰላም.mp3" } } });
  vm.runInContext(fs.readFileSync(path.join(root, "js/audio.js"), "utf8") + "\n;globalThis.A={clipFor,canSay};", actx);
  const A = actx.A;
  ok(A.canSay("ደህና ነኝ።"), "male-only clip: canSay should be true (search results, cards and tests show ▶)");
  ok(A.clipFor("ደህና ነኝ") === "clips/m/ደህና ነኝ.mp3", "male-only clip: female lookup falls back to the male clip");
  ok(A.clipFor("ሰላም", "m") === "clips/m/ሰላም.mp3" && A.clipFor("ሰላም") === "clips/ሰላም.mp3", "each voice prefers its own clip");
  ok(!A.canSay("ውሃ"), "no clip: no button");
}
// --- audio: a replaced clip gets a new address, so a phone's saved old copy is not played
{
  const actx = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, "js/audio.js"), "utf8") + "\n;globalThis.A={clipURL};", actx);
  ok(actx.A.clipURL("clips/ሀ.mp3?3f9a1c") === "audio/clips/" + encodeURIComponent("ሀ") + ".mp3?v=3f9a1c", "clipURL adds ?v=: " + actx.A.clipURL("clips/ሀ.mp3?3f9a1c"));
  ok(actx.A.clipURL("clips/m/ሰላም.mp3") === "audio/clips/m/" + encodeURIComponent("ሰላም") + ".mp3", "clipURL without a fingerprint");
  const man = fs.readFileSync(path.join(root, "audio/manifest.js"), "utf8");
  ok(/"ሀ": "clips\/ሀ\.mp3\?[0-9a-f]{6}"/.test(man), "manifest clips carry a fingerprint (run tools/audio_manifest.py)");
}

console.log(`${passes} checks passed, ${fails} failed (${X.VLIST.length} verbs, ${X.LESSONS.length} lessons, ${X.SENT.length} sentences)`);
process.exit(fails ? 1 : 0);
