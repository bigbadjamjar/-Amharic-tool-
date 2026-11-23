// Writes docs/native-check.md: every practice sentence, with the doubtful ones first,
// so a native speaker can check them in one sitting.   node tools/native-check.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = vm.createContext({});
vm.runInContext(["course.js", "sentences.js", "dialogues.js", "stories.js", "culture.js"].map(f => fs.readFileSync(path.join(root, "site/js/data", f), "utf8")).join("\n;\n") +
  ";globalThis.X={LESSONS,SENT,DIALOGUES,STORIES,CULTURE};", ctx);
const { LESSONS, SENT, DIALOGUES, STORIES, CULTURE } = ctx.X;
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
// Dialogues: the flagged lines go with the other doubts, then each conversation in full.
const dl = DIALOGUES.flatMap(d => d.lines.map(([sp, am, rom, en, check]) => ({ d, who: d.who[sp], am, rom, en, check })));
const dflag = dl.filter(x => x.check);
const drow = x => `| ${x.who.name} (${x.who.g === "f" ? "woman" : "man"}) | ${x.am} | ${x.rom} | ${x.en} | ${x.check || ""} |  |`;
const dhead = "| Speaker | Amharic | Transcription | English | Why it's flagged | OK? / correction |\n|---|---|---|---|---|---|";
md += `\n## Dialogues\n\nEach unit has a short conversation (${dl.length} lines in all). Please check that each line is natural for the speaker ` +
  `(the speaker's gender matters for “you” and the verb endings). ${dflag.length} lines have a specific doubt.\n\n### Dialogue lines with a specific doubt\n\n` +
  `| Unit | Speaker | Amharic | Transcription | English | Why it's flagged | OK? / correction |\n|---|---|---|---|---|---|---|\n` +
  dflag.map(x => `| ${x.d.l} ${drow(x)}`).join("\n") + "\n";
for (const d of DIALOGUES) md += `\n### ${d.l}. ${d.title}\n\n${d.scene}\n\n${dhead}\n${dl.filter(x => x.d === d).map(drow).join("\n")}\n`;
// Reading stories: the flagged lines first, then each story in full.
const sl = STORIES.flatMap(s => s.lines.map(([am, rom, en, check]) => ({ s, am, rom, en, check })));
const sflag = sl.filter(x => x.check), shead = "| Amharic | Transcription | English | Why it's flagged | OK? / correction |\n|---|---|---|---|---|---|";
const srow = x => `| ${x.am} | ${x.rom} | ${x.en} | ${x.check || ""} |  |`;
md += `\n## Reading stories\n\n${STORIES.length} short stories (${sl.length} lines). Please check each line reads naturally. ${sflag.length} lines have a specific doubt.\n\n` +
  `### Story lines with a specific doubt\n\n| Story | Amharic | Transcription | English | Why it's flagged | OK? / correction |\n|---|---|---|---|---|---|\n` +
  sflag.map(x => `| ${x.s.title} ${srow(x)}`).join("\n") + "\n";
for (const s of STORIES) md += `\n### ${s.title} (${s.am}), after unit ${s.after}\n\n${s.intro}\n\n${shead}\n${sl.filter(x => x.s === s).map(srow).join("\n")}\n`;
// Culture notes: the Amharic in the text and the useful phrases.
let cn = 0;
md += `\n## Culture notes\n\nThe Amharic examples and phrases in the culture notes. Please check the spelling, the transcription and that the meaning given is right.\n`;
for (const c of CULTURE) {
  const ex = c.p.flatMap(p => [...p.matchAll(/\{([^|}]+)\|([^}]*)\}/g)].map(m => [m[1], m[2], "(in the text)"]));
  const rows = ex.concat(c.phrases); cn += rows.length;
  md += `\n### ${c.title}\n\n| Amharic | Transcription | English | OK? / correction |\n|---|---|---|---|\n${rows.map(r => `| ${r[0]} | ${r[1]} | ${r[2]}${r[3] ? ` **(${r[3]})**` : ""} |  |`).join("\n")}\n`;
}
// Everyday drills (data/everyday.js): the words, and the patterns the app builds times, prices and dates from.
{
  const ev = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root, "site/js/data/everyday.js"), "utf8") + ";globalThis.EV=EV;", ev);
  const E = ev.EV, erow = (am, rom, en, why) => `| ${am} | ${rom} | ${en} | ${why || ""} |  |`;
  const ehead = "| Amharic | Transcription | English | Why it's flagged | OK? / correction |\n|---|---|---|---|---|";
  const H = n => E.hours[n - 1];
  md += `\n## Everyday drills: time, money and dates\n\nThe Test tab's “Everyday Amharic” drills build whole phrases from these pieces ` +
    `(for example part of the day + hour + ተኩል). Please check the pieces and the patterns.\n\n### Patterns the app builds\n\n${ehead}\n` + [
      erow(`${E.parts[1][0]} ${H(3)[0]}`, `${E.parts[1][1]} ${H(3)[1]}`, "9:00 am", "Part of the day before the hour. Is ጠዋት or ከጠዋቱ more natural here?"),
      erow(`${E.parts[3][0]} ${H(8)[0]}`, `${E.parts[3][1]} ${H(8)[1]}`, "2:00 pm", "Check ከሰዓት በኋላ for afternoon times."),
      erow(`${E.parts[4][0]} ${H(2)[0]}`, `${E.parts[4][1]} ${H(2)[1]}`, "8:00 pm", "ማታ for 6 pm to midnight; would ምሽት be better?"),
      erow(`${E.parts[0][0]} ${H(8)[0]}`, `${E.parts[0][1]} ${H(8)[1]}`, "2:00 am", "ሌሊት for midnight to 6 am."),
      erow(`${E.parts[2][0]} ${H(6)[0]}`, `${E.parts[2][1]} ${H(6)[1]}`, "12:00 noon", "ቀን for the noon hour."),
      erow(`${H(3)[0]} ${E.half[0]}`, `${H(3)[1]} ${E.half[1]}`, "3:30 (9:30 am)", ""),
      erow(`${H(3)[0]} ${E.quarter[0]}`, `${H(3)[1]} ${E.quarter[1]}`, "3:15 (9:15 am)", "Check ከሩብ for quarter past."),
      erow(E.qto[3][0], E.qto[3][1], "quarter to four, 3:45 (9:45 am)", "Check the ለ… ሩብ ጉዳይ pattern for quarter to."),
      erow("አሥር ብር ከሃምሳ ሳንቲም", "assir birr kehamsa santim", "10.50 birr", "Check ከ… ሳንቲም for birr and cents."),
      erow("ቡና ሠላሳ ብር ነው", "buna selasa birr new", "Coffee is 30 birr", ""),
      erow("ኅዳር አሥራ ሦስት", "hidar asra sost", "Hidar 13", "Month then day as a number word.")
    ].join("\n") + "\n";
  const sec = (t, rows) => { md += `\n### ${t}\n\n${ehead}\n${rows.join("\n")}\n`; };
  sec("Telling the time", E.timeWords.map(w => erow(...w)).concat(E.parts.map(p => erow(p[0], p[1], p[2])), E.hours.map((h, i) => erow(h[0], h[1], `${i + 1} o'clock (Ethiopian)`)), E.qto.map((h, i) => erow(h[0], h[1], `quarter to ${i + 1}`))));
  sec("Money and shopping", E.shop.map(w => erow(...w)).concat(E.items.map(w => erow(w[0], w[1], w[2])), E.cents.map(c => erow(c[1], c[2], `and ${c[0]} santim`))));
  sec("Dates and the calendar", E.dateWords.map(w => erow(...w)).concat(E.months.map((m, i) => erow(m[0], m[1], `month ${i + 1}`)), E.days.map(w => erow(...w)), E.holidays.map(h => erow(h[0], h[1], h[2]))));
}
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/native-check.md"), md);
console.log(`docs/native-check.md: ${SENT.length} sentences, ${flagged.length} flagged; ${dl.length} dialogue lines, ${dflag.length} flagged; ${sl.length} story lines, ${sflag.length} flagged; ${cn} culture phrases`);
