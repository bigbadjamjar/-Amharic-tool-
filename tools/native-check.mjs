// Writes docs/native-check.md: every practice sentence, with the doubtful ones first,
// so a native speaker can check them in one sitting.   node tools/native-check.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = vm.createContext({});
vm.runInContext(["course.js", "sentences.js"].map(f => fs.readFileSync(path.join(root, "site/js/data", f), "utf8")).join("\n;\n") +
  ";globalThis.X={LESSONS,SENT};", ctx);
const { LESSONS, SENT } = ctx.X;
const title = n => LESSONS.find(l => l.n === n).title;
const row = s => `| ${s.l} | ${s.am} | ${s.rom} | ${s.en} | ${s.check || ""} |  |`;
const head = "| Unit | Amharic | Transcription | English | Why it's flagged | OK? / correction |\n|---|---|---|---|---|---|";
const flagged = SENT.filter(s => s.check), rest = SENT.filter(s => !s.check);
let md = `# Sentences for a native speaker to check\n\n` +
  `All ${SENT.length} practice sentences in the course were written for this app and none has been checked yet. ` +
  `Please mark each one OK, or write the natural way to say it. ${flagged.length} have a specific doubt and are listed first.\n\n` +
  `## Specific doubts\n\n${head}\n${flagged.map(row).join("\n")}\n\n## Everything else, by unit\n`;
for (const l of LESSONS.filter(l => !l.review)) {
  const ss = rest.filter(s => s.l === l.n);
  if (ss.length) md += `\n### ${l.n}. ${title(l.n)}\n\n${head}\n${ss.map(row).join("\n")}\n`;
}
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/native-check.md"), md);
console.log(`docs/native-check.md: ${SENT.length} sentences, ${flagged.length} flagged`);
