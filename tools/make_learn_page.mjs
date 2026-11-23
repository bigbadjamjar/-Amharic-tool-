// Builds the plain pages that search engines read:  node tools/make_learn_page.mjs
//   site/learn-amharic.html  a written overview of everything in the course, made from the course data
//   site/sitemap.xml         the list of pages for Google, dated today
// The deploy workflow runs this before every upload, so both always match the app. Safe to run by hand.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://amharicapp.com/";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
const ctx = vm.createContext({});
for (const f of ["course", "stories", "culture"]) vm.runInContext(fs.readFileSync(path.join(root, "js/data", f + ".js"), "utf8"), ctx);
vm.runInContext("globalThis.X={LESSONS,LEVELS,STORIES,CULTURE}", ctx);
const { LESSONS, LEVELS, STORIES, CULTURE } = ctx.X;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const word = w => `<span lang="am">${esc(w[0])}</span> <i>${esc(w[1])}</i> “${esc(w[2])}”`;

const units = LESSONS.map(l => l.n);
const levels = LEVELS.map(lv => {
  const ls = LESSONS.filter(l => l.n >= lv.from && l.n <= lv.to);
  if (!ls.length) return "";
  const items = ls.map(l => {
    const topics = (l.notes || []).map(n => n.h).filter(Boolean);
    const words = (l.vocab || []).slice(0, 4).map(word).join(", ");
    return `<li><b>Unit ${l.n}: ${esc(l.title)}.</b>${topics.length ? ` ${esc(topics.join(" · "))}.` : ""}${words ? `<br><span class="count">Words include ${words}.</span>` : ""}</li>`;
  }).join("\n");
  return `<h3>${esc(lv.name)}: units ${ls[0].n}–${ls[ls.length - 1].n}</h3>\n<p>${esc(lv.about)}</p>\n<ul>\n${items}\n</ul>`;
}).join("\n\n");
const stories = STORIES.map(s => `<li><b><span lang="am">${esc(s.am)}</span> (${esc(s.title)}).</b> ${esc(s.intro)}</li>`).join("\n");
const culture = CULTURE.map(c => `<li><b>${esc(c.title)}.</b> ${esc(c.intro || "")}</li>`).join("\n");
const desc = `A free Amharic course with audio: learn to read the Fidel (Ethiopic alphabet), ${units.length} topic units from greetings to giving opinions, verb tables, reading stories, culture notes and tests.`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Learn Amharic free: lessons, Fidel alphabet and audio · Amharic App</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}learn-amharic.html">
<meta name="theme-color" content="#413c58">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/schemes.css">
<script>try{var sc=localStorage.getItem("amharic-scheme");if(sc&&sc!=="summer")document.documentElement.setAttribute("data-scheme",sc)}catch(e){}</script>
<style>.pv h3{margin-top:22px}.pv ul{margin:6px 0 0;padding-left:20px}.pv li{margin:6px 0}</style>
</head>
<body>
<!-- Made by tools/make_learn_page.mjs from the course data. Edit the data or that script, not this file. -->
<main class="wrap pv">
<p><a href="./">‹ Open the Amharic App</a></p>
<h2>Learn Amharic free: lessons, the Fidel alphabet and audio</h2>
<p class="lead">The Amharic App is a free course in Amharic (<span lang="am">አማርኛ</span>), the main language of Ethiopia. It works on your phone or computer, even offline, with no account needed.</p>

<h3>What's in the app</h3>
<ul>
<li><b>The Fidel.</b> Learn to read the Ethiopic alphabet, letter by letter, with a sound for every letter.</li>
<li><b>${units.length} topic units.</b> Each one is built around something you want to say, with notes, word lists, a dialogue and a test.</li>
<li><b>Audio everywhere.</b> Tap a word, sentence or dialogue line to hear it, and slow it down if you need to.</li>
<li><b>Verb tables.</b> Every form of more than 300 verbs, in fidel and English letters, each with its sound.</li>
<li><b>Numbers, time, money and dates.</b> Including Ethiopian time and the Ethiopian calendar.</li>
<li><b>Reading stories and culture notes.</b> Short graded stories and notes on everyday life in Ethiopia.</li>
<li><b>Tests, games and review.</b> Spaced review brings back what you are about to forget, with a gentle daily goal.</li>
<li><b>Transcription switch.</b> See every word in English letters too, like <i>selam</i>, until you can read the fidel.</li>
</ul>
<p><a class="btn primary" href="./">Start learning Amharic</a></p>

<h2>The course, unit by unit</h2>
${levels}

<h2>Reading stories</h2>
<p>Short stories written for learners. Each one uses only the words and grammar of the units before it, and every word can be tapped.</p>
<ul>
${stories}
</ul>

<h2>Ethiopia and its culture</h2>
<ul>
${culture}
</ul>

<h2>Good to know</h2>
<p>The lessons, sentences and dialogues are written for this app, not copied from a textbook. They have not yet been checked by a native speaker, and the audio is made by text-to-speech. Corrections are very welcome at <a href="mailto:hello@amharicapp.com">hello@amharicapp.com</a>.</p>
<p><a class="btn primary" href="./">Open the Amharic App</a></p>
<p class="count"><a href="privacy.html">Privacy notice</a> · © 2026 Robert Sadler. All rights reserved.</p>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(root, "learn-amharic.html"), html);

const today = new Date().toISOString().slice(0, 10);
const pages = [["", "1.0"], ["learn-amharic.html", "0.8"], ["privacy.html", "0.3"]];
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`);
console.log(`learn-amharic.html: ${LESSONS.length} units, ${STORIES.length} stories, ${CULTURE.length} culture notes; sitemap.xml: ${pages.length} pages`);
