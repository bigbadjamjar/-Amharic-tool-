// Checks the data files and the verb engine without a browser:  node tests/run.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
// Same order as the <script> tags in site/index.html, minus the browser-only files.
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
  .filter(f => f.startsWith("js/") && !/js\/(app|audio|profiles|offline)\.js$/.test(f));
const ctx = vm.createContext({ console });
vm.runInContext(files.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n;\n") +
  "\n;globalThis.X={VLIST,VRAW,T,PARTS,LESSONS,SENT,vforms,TENSES,EXTRA,FID,toFidel,BVERBS,bMakeVerbSentence,bCourseSentence,bOptions};", ctx);
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

console.log(`${passes} checks passed, ${fails} failed (${X.VLIST.length} verbs, ${X.LESSONS.length} lessons, ${X.SENT.length} sentences)`);
process.exit(fails ? 1 : 0);
