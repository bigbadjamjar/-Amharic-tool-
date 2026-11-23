// The sign-in and sync flow in a real browser, against the Firebase emulators (see README.md):
//   node browser.test.mjs
// Two browser "devices" share one account. The app is served from ../../site with a demo config switched on.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const site = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname); if (p.endsWith("/")) p += "index.html";
  const f = path.join(site, p);
  if (!f.startsWith(site) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(0, "127.0.0.1");
await new Promise(r => server.on("listening", r));
const BASE = `http://localhost:${server.address().port}/`;
const CONFIG = `const FIREBASE_CONFIG = {apiKey:"demo-key",authDomain:"demo-amharic.firebaseapp.com",projectId:"demo-amharic",appId:"demo"};`;
const FS = "http://127.0.0.1:8080/v1/projects/demo-amharic/databases/(default)/documents";

let n = 0, bad = 0;
const shot = async (page, name) => { if (!process.env.SHOTS) return; await page.locator("#account").scrollIntoViewIfNeeded(); await page.locator("#account").evaluate(e => window.scrollBy(0, e.getBoundingClientRect().top - 120)); await page.screenshot({ path: path.join(process.env.SHOTS, name + ".png") }); };
const ok = (c, m) => { if (c) n++; else { bad++; console.log("FAIL " + m); } };
const browser = await chromium.launch();

async function device(on = true){
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: process.env.SHOTS ? 2 : 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem("amharic-cloud-emu", "1"); localStorage.setItem("amharic-welcome", "1"); } catch (e) {} });
  await ctx.route("**/js/cloud.js", async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace(/const FIREBASE_CONFIG = (null|\{[\s\S]*?\});/, on ? CONFIG : "const FIREBASE_CONFIG = null;") }); });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error" || process.env.DEBUG) console.log("console: " + m.text()); });
  page.on("pageerror", e => { bad++; console.log("PAGE ERROR " + e.message); });
  return { ctx, page };
}
// a device with some profiles (the first one in use): [[name, data], ...]
async function withProfiles(page, list){
  await page.goto(BASE);
  await page.evaluate(list => { localStorage.setItem("amharic-profiles", JSON.stringify({ list: list.map((x, i) => ({ id: "p" + i + Math.random().toString(36).slice(2, 6), name: x[0] })), cur: null }));
    const idx = JSON.parse(localStorage.getItem("amharic-profiles")); idx.cur = idx.list[0].id; localStorage.setItem("amharic-profiles", JSON.stringify(idx));
    idx.list.forEach((p, i) => localStorage.setItem("amharic-p:" + p.id, JSON.stringify(list[i][1]))); }, list);
  await page.reload();
}
const withProfile = (page, name, data) => withProfiles(page, [[name, data]]);
const byName = (page, name) => page.evaluate(name => { const idx = JSON.parse(localStorage.getItem("amharic-profiles")); const p = idx.list.find(p => p.name === name); return p ? JSON.parse(localStorage.getItem("amharic-p:" + p.id)) : null; }, name);
const names = page => page.evaluate(() => JSON.parse(localStorage.getItem("amharic-profiles")).list.map(p => p.name).sort().join(","));
const cloudProfiles = async uid => { const d = await cloudDoc(uid); return d ? JSON.parse(JSON.parse(JSON.stringify(d.fields.data.stringValue))).profiles : null; };
const cp = (list, name) => list.find(e => e.name === name && !e.del);
const profilesPage = async page => { await page.click("#whobtn"); await page.waitForSelector("#app h2:has-text('Profiles')"); };
const local = page => page.evaluate(() => JSON.parse(localStorage.getItem("amharic-p:" + JSON.parse(localStorage.getItem("amharic-profiles")).cur)));
const cloudDoc = async uid => { const r = await fetch(`${FS}/users/${uid}`, { headers: { Authorization: "Bearer owner" } }); return r.ok ? r.json() : null; };
const uidOf = page => page.evaluate(() => JSON.parse(localStorage.getItem("amharic-cloud") || "null")?.uid);
async function emailSignIn(page, create){
  await page.click("[data-act=cl-form][data-v=email]");
  if (create) await page.click("[data-act=cl-form][data-v=new]");
  await page.fill("#cl-email", "rob@example.com"); await page.fill("#cl-pass", "amharic123");
  if (create) await shot(page, "2-create-account");
  await page.click("[data-act=cl-email-go]");
}

// --- switched off: nothing shows and no Firebase code is fetched
{
  const { ctx, page } = await device(false); const fetched = [];
  page.on("request", r => { if (/firebase/.test(r.url())) fetched.push(r.url()); });
  await withProfile(page, "Rob", {}); await profilesPage(page);
  ok(!(await page.locator("#account").count()), "no account section while FIREBASE_CONFIG is null");
  ok(!fetched.length, "no Firebase files loaded while switched off: " + fetched.join(" "));
  await ctx.close();
}

// --- device A: Rob and Sara; make an account; both go up
const A = await device();
await withProfiles(A.page, [["Rob", { rom: false, best: { u1: 8, u2: 5 }, srs: { v: 1, it: { "w:ሰላም": [3, 99999, 5, 0, 20000] }, act: { 20000: 6 } } }], ["Sara", { best: { u4: 7 } }]]);
ok(!(await A.page.evaluate(() => performance.getEntriesByType("resource").some(e => /firebase/.test(e.name)))), "signed out: Firebase not loaded until Profiles is opened");
await profilesPage(A.page);
ok(await A.page.locator("#account").count(), "account section shows when switched on");
await shot(A.page, "1-signed-out");
await A.page.waitForFunction(() => typeof CL !== "undefined" && !!CL.fb);
ok(true, "opening Profiles while signed out loads Firebase ahead of a tap on Sign in with Google");
// (the Google window itself can't be tested here: it needs apis.google.com, which this test machine can't reach)
await A.page.waitForSelector("[data-act=cl-form][data-v=email]");
await emailSignIn(A.page, true);
await A.page.waitForSelector("text=Rob and Sara's progress is now saved to your account");
await shot(A.page, "3-signed-in");
const uid = await uidOf(A.page);
let c = await cloudProfiles(uid);
ok(c && cp(c, "Rob")?.data.best.u1 === 8 && cp(c, "Sara")?.data.best.u4 === 7, "both of A's profiles are in the account");

// --- device B: Rob (other progress) and an empty "Learner": Rob combines, Sara arrives, Learner goes
const B = await device();
await withProfiles(B.page, [["Learner", {}], ["rob", { rom: true, best: { u1: 6, u3: 9 }, srs: { v: 1, it: { "l:ሀ": [1, 99999, 1, 0, 20001] }, act: { 20001: 3 } } }]]);
await profilesPage(B.page);
await emailSignIn(B.page, false);
await B.page.waitForSelector("text=Added from your account: Sara");
await shot(B.page, "4-second-device");
ok(await names(B.page) === "Rob,Sara" || await names(B.page) === "Sara,rob", "B now has Rob and Sara, and the empty Learner is gone: " + await names(B.page));
let b = await byName(B.page, "Rob") || await byName(B.page, "rob");
ok(b.best.u1 === 8 && b.best.u3 === 9 && b.best.u2 === 5, "B's Rob has both devices' best scores: " + JSON.stringify(b.best));
ok(b.srs.it["w:ሰላም"] && b.srs.it["l:ሀ"], "B's Rob has both devices' words");
ok((await byName(B.page, "Sara")).best.u4 === 7, "Sara's progress came to B");
c = await cloudProfiles(uid);
ok(c.filter(e => !e.del).length === 2 && (cp(c, "Rob") || cp(c, "rob")).data.best.u3 === 9, "the account has two profiles, Rob combined");

// --- changes on B reach A: a setting, and a new profile
await B.page.click("#romtoggle");
await B.page.fill("#pf-add", "Tom"); await B.page.click("[data-act=pf-add]");
await B.page.waitForTimeout(6500);
c = await cloudProfiles(uid);
ok(cp(c, "Tom"), "B's new profile Tom went up");
await A.page.click("#whobtn"); await A.page.click("[data-act=cl-sync]"); await A.page.waitForSelector("text=Synced.");
ok(await names(A.page) === "Rob,Sara,Tom", "A has Tom now: " + await names(A.page));
const bRob = await byName(B.page, "Rob") || await byName(B.page, "rob");
ok((await byName(A.page, "Rob")).rom === bRob.rom && (await byName(A.page, "Rob")).best.u3 === 9, "A's Rob picked up B's change and progress");

// --- deleting Tom on A removes him everywhere
await A.page.click("[data-act=pf-use] >> text=Tom"); await A.page.click("[data-act=pf-del]");
ok(await A.page.locator("text=from this device and from your account").count(), "delete warns it's from the account too");
await A.page.click("[data-act=pf-del-ok]");
await A.page.waitForTimeout(2500);
ok(!cp(await cloudProfiles(uid), "Tom"), "Tom is gone from the account");
await B.page.click("#whobtn"); await B.page.click("[data-act=cl-sync]"); await B.page.waitForSelector("text=Synced.");
ok(!(await names(B.page)).includes("Tom"), "Tom is gone from B: " + await names(B.page));

// --- A offline: the app still opens and works, and changes go up once back online
await A.page.waitForTimeout(1500);   // let the service worker finish saving the app
await A.ctx.setOffline(true);
await A.page.reload(); await A.page.waitForSelector("#app h2");
ok(await A.page.locator("header .seg").count(), "app opens offline while signed in");
await A.page.evaluate(() => { const p = JSON.parse(localStorage.getItem("amharic-profiles")).cur; });
await profilesPage(A.page);
await A.page.waitForSelector("#account");
ok(await A.page.locator("#account + .note >> text=Signed in as").count(), "Profiles page shows signed in while offline");
await A.page.click("[data-act=pf-use] >> text=Rob");
await A.page.click("#romtoggle");   // change while offline
const aRom = (await byName(A.page, "Rob")).rom;
await A.page.waitForTimeout(6000);
await A.ctx.setOffline(false);
await A.page.evaluate(() => window.dispatchEvent(new Event("online")));
await A.page.waitForTimeout(3000);
ok(cp(await cloudProfiles(uid), "Rob").data.rom === aRom, "the offline change was sent once back online");

// --- B: delete the account
await B.page.click("[data-act=cl-del]"); await B.page.click("[data-act=cl-del-ok]");
await B.page.waitForSelector("text=Your account and the progress saved in it are deleted");
ok(!(await cloudDoc(uid)), "the account's document is gone");
ok((await byName(B.page, "Sara")).best.u4 === 7, "progress on B's device is still there");
const users = await (await fetch("http://127.0.0.1:9099/emulator/v1/projects/demo-amharic/accounts", { method: "DELETE" })).ok;

await browser.close(); server.close();
console.log(`browser: ${n} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
