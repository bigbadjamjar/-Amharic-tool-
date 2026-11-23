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
  if (on) await ctx.route("**/js/cloud.js", async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace("const FIREBASE_CONFIG = null;", CONFIG) }); });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error" || process.env.DEBUG) console.log("console: " + m.text()); });
  page.on("pageerror", e => { bad++; console.log("PAGE ERROR " + e.message); });
  return { ctx, page };
}
// a device with one profile that already has some progress
async function withProfile(page, name, data){
  await page.goto(BASE);
  await page.evaluate(([name, data]) => { localStorage.setItem("amharic-profiles", JSON.stringify({ list: [{ id: "p1", name }], cur: "p1" })); localStorage.setItem("amharic-p:p1", JSON.stringify(data)); }, [name, data]);
  await page.reload();
}
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

// --- device A: make an account; its progress goes up
const A = await device();
await withProfile(A.page, "Rob", { rom: false, best: { u1: 8, u2: 5 }, srs: { v: 1, it: { "w:ሰላም": [3, 99999, 5, 0, 20000] }, act: { 20000: 6 } } });
ok(!(await A.page.evaluate(() => performance.getEntriesByType("resource").some(e => /firebase/.test(e.name)))), "signed out: Firebase not loaded at start");
await profilesPage(A.page);
ok(await A.page.locator("#account").count(), "account section shows when switched on");
await shot(A.page, "1-signed-out");
await emailSignIn(A.page, true);
await A.page.waitForSelector("text=Rob's progress is now saved to your account");
await shot(A.page, "3-signed-in");
const uid = await uidOf(A.page);
let d = await cloudDoc(uid);
ok(d && JSON.parse(d.fields.data.stringValue).best.u1 === 8 && d.fields.name.stringValue === "Rob", "A's progress is in the account");

// --- device B: different progress, same account: combine
const B = await device();
await withProfile(B.page, "Robert", { rom: true, best: { u1: 6, u3: 9 }, srs: { v: 1, it: { "l:ሀ": [1, 99999, 1, 0, 20001] }, act: { 20001: 3 } } });
await profilesPage(B.page);
await emailSignIn(B.page, false);
await B.page.waitForSelector("[data-act=cl-merge]");
ok(await B.page.locator("text=Your account already has progress").count(), "B is asked what to do with the account's progress");
await shot(B.page, "4-second-device-choice");
await B.page.click("[data-act=cl-merge]");
await B.page.waitForSelector("text=are combined");
let b = await local(B.page);
ok(b.best.u1 === 8 && b.best.u3 === 9 && b.best.u2 === 5, "B now has both devices' best scores: " + JSON.stringify(b.best));
ok(b.srs.it["w:ሰላም"] && b.srs.it["l:ሀ"], "B has both devices' words");
d = await cloudDoc(uid); const c = JSON.parse(d.fields.data.stringValue);
ok(c.best.u3 === 9 && c.srs.it["l:ሀ"], "the account has the combined progress");

// --- a change on B reaches A
await B.page.click("#romtoggle");   // a setting change, saved, then sent 5 seconds later
await B.page.waitForTimeout(6500);
const bRom = (await local(B.page)).rom;
d = await cloudDoc(uid);
ok(JSON.parse(d.fields.data.stringValue).rom === bRom, "B's change was sent to the account");
await A.page.click("[data-act=cl-sync]"); await A.page.waitForSelector("text=Synced.");
ok((await local(A.page)).rom === bRom && (await local(A.page)).best.u3 === 9, "A picked up B's change and progress");

// --- A offline: the app still opens and works, and changes go up once back online
await A.page.waitForTimeout(1500);   // let the service worker finish saving the app
await A.ctx.setOffline(true);
await A.page.reload(); await A.page.waitForSelector("#app h2");
ok(await A.page.locator("header .seg").count(), "app opens offline while signed in");
await A.page.evaluate(() => { const p = JSON.parse(localStorage.getItem("amharic-profiles")).cur; });
await profilesPage(A.page);
await A.page.waitForSelector("#account");
ok(await A.page.locator("#account + .note >> text=Signed in as").count(), "Profiles page shows signed in while offline");
await A.page.click("#romtoggle");   // change while offline
const aRom = (await local(A.page)).rom;
await A.page.waitForTimeout(6000);
await A.ctx.setOffline(false);
await A.page.evaluate(() => window.dispatchEvent(new Event("online")));
await A.page.waitForTimeout(3000);
d = await cloudDoc(uid);
ok(JSON.parse(d.fields.data.stringValue).rom === aRom, "the offline change was sent once back online");

// --- B: delete the account
await B.page.click("[data-act=cl-del]"); await B.page.click("[data-act=cl-del-ok]");
await B.page.waitForSelector("text=Your account and the progress saved in it are deleted");
ok(!(await cloudDoc(uid)), "the account's document is gone");
ok((await local(B.page)).best.u3 === 9, "progress on B's device is still there");
const users = await (await fetch("http://127.0.0.1:9099/emulator/v1/projects/demo-amharic/accounts", { method: "DELETE" })).ok;

await browser.close(); server.close();
console.log(`browser: ${n} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
