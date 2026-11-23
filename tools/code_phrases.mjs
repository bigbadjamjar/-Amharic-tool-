// Amharic that the app builds in code rather than writing out in a data file, so tools/make_audio.py
// cannot find it by reading the data files. Prints a JSON object of phrase lists:
//   numbers: every number word from 0 to 100, the hundreds and thousands, ሺ on its own,
//            and the examples on the Numbers page (so "Try any" can say any number in pieces)
//   verbs:   each verb's "-ing" noun and "doer" word, shown under the verb in Verbs
//   conj:    every form in the verb tables (each tense, each person), course verbs first in unit order
// Used by make_audio.py:  node tools/code_phrases.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
  .filter(f => f.startsWith("js/data/") || f === "js/engine.js");
// The numbers part of app.js (numWord and the rules shown on the Numbers page).
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
const nums = app.slice(app.indexOf("/* ---------- numbers"), app.indexOf("const NTESTS"));
const ctx = vm.createContext({ console });
vm.runInContext(files.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n;\n") + "\n;" + nums +
  "\n;globalThis.X={VLIST,vforms,numWord,NRULES,TENSES};", ctx);
const X = ctx.X;

const numbers = new Set(["ሺ", "መቶ", "አሥር ሺ"]);
for (let n = 0; n <= 100; n++) numbers.add(X.numWord(n)[0]);
for (let h = 2; h <= 9; h++) { numbers.add(X.numWord(h * 100)[0]); numbers.add(X.numWord(h * 1000)[0]); }
numbers.add(X.numWord(1000)[0]);
for (const r of X.NRULES) for (const p of r.p) for (const m of p.matchAll(/\{([^|{}]+)\|/g))
  if (!/[-…]/.test(m[1])) numbers.add(m[1].trim());

const verbs = new Set();
for (const v of X.VLIST) { const f = X.vforms(v); if (f.vn) verbs.add(f.vn.am); if (f.part) verbs.add(f.part.am); }

// Every form in the verb tables. Only the verbs taught in the course (units 1-30) get clips for now;
// set ALL_VERBS to true to give all the other verbs in the Verbs list clips too (about 17,000 more).
const ALL_VERBS = false;
const conj = new Set();
const inCourse = v => v.lesson < 99;
const order = X.VLIST.filter(v => ALL_VERBS || inCourse(v)).sort((a, b) => (inCourse(a) ? a.lesson : 999) - (inCourse(b) ? b.lesson : 999));
for (const v of order) { const f = X.vforms(v);
  for (const t of X.TENSES) for (const x of f[t[0]] || []) if (x && x.am && !/[-…_]/.test(x.am)) conj.add(x.am); }

console.log(JSON.stringify({ numbers: [...numbers], verbs: [...verbs], conj: [...conj] }));
