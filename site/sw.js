/* Service worker: lets the app open and run with no signal.

   - The app itself (page, scripts, styles, icons): fetched fresh when online so updates show up straight away,
     with a saved copy used when there's no signal or the network is very slow.
   - Audio clips: saved the first time each one plays, then always played from the saved copy.
     "Save audio for offline" on the Profiles page saves all of them in one go (see js/offline.js).
   - Fonts from Google: saved the first time they load.
   Everything is kept in this browser's Cache Storage; nothing is sent anywhere.
   The cache names below must match js/offline.js. */
const SHELL = "amharic-shell-v1", AUDIO = "amharic-audio-v1", FONTS = "amharic-fonts-v1";
const KEEP = [SHELL, AUDIO, FONTS];
const SLOW_MS = 4000;   // after this long with no answer, use the saved copy instead

// Things not named in index.html that the app still needs offline.
const EXTRA = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];

// Save the page and every local script and stylesheet it names, so new files are picked up without editing this list.
async function saveShell(){
  const cache = await caches.open(SHELL);
  const html = await (await fetch("index.html", {cache: "no-cache"})).text();
  const named = [...html.matchAll(/(?:src|href)="([^"#?:]+)"/g)].map(m => m[1]).filter(u => !u.startsWith("//"));
  const urls = [...new Set([...EXTRA, ...named])];
  await Promise.all(urls.map(async u => {
    try { const r = await fetch(u, {cache: "no-cache"}); if (r.ok) await cache.put(u, r); } catch (e) {}
  }));
}

self.addEventListener("install", e => { e.waitUntil(saveShell().catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("amharic-") && !KEEP.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The page sends the list of files it loaded (fonts mostly) so they're saved even from the very first visit.
self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "warm" && Array.isArray(d.urls)) e.waitUntil(Promise.all(d.urls.map(warm)));
});
async function warm(u){
  try {
    const url = new URL(u, self.registration.scope);
    const name = isFont(url) ? FONTS : url.origin === location.origin && !isClip(url) ? SHELL : null;
    if (!name) return;
    const cache = await caches.open(name);
    if (await cache.match(url.href)) return;
    const r = await fetch(url.href, isFont(url) ? {mode: "cors"} : {});
    if (r.ok) await cache.put(url.href, r);
  } catch (e) {}
}

const isClip = url => url.origin === location.origin && url.pathname.includes("/audio/clips/");
const isFont = url => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (isClip(url)) e.respondWith(clip(req));
  else if (isFont(url)) e.respondWith(font(req));
  else if (url.origin === location.origin) e.respondWith(shell(req));
});

// Network first (with a time limit), saved copy as the fallback.
async function shell(req){
  const cache = await caches.open(SHELL);
  const fromNet = fetch(req.url, {cache: "no-cache"}).then(r => { if (r.ok && r.type === "basic") cache.put(req.url, r.clone()); return r; });
  fromNet.catch(() => {});
  const r = await Promise.race([fromNet.catch(() => null), new Promise(ok => setTimeout(() => ok(null), SLOW_MS))]);
  if (r) return r;
  const s = await cache.match(req.url, {ignoreSearch: true}) || (req.mode === "navigate" ? await cache.match("index.html") : null);
  if (s) return s;
  try { return await fromNet; } catch (e) { return new Response("Offline and not saved yet", {status: 504}); }
}

// Fonts never change at a given address, so a saved copy is always fine.
async function font(req){
  const cache = await caches.open(FONTS);
  const s = await cache.match(req);
  if (s) return s;
  try { const r = await fetch(req); if (r.ok || r.type === "opaque") cache.put(req, r.clone()); return r; }
  catch (e) { return new Response("", {status: 504}); }
}

// Audio: saved copy first. Clips are saved whole; Safari asks for pieces ("Range"), so cut the piece out here.
async function clip(req){
  const cache = await caches.open(AUDIO);
  let r = await cache.match(req.url);
  if (!r) {
    try {
      r = await fetch(req.url);   // the whole file, without the Range header
      if (r.ok) {
        await cache.put(req.url, r.clone());
        // Drop saved copies of the same clip from before it was replaced (same file, different ?v=).
        for (const old of await cache.keys(req.url, {ignoreSearch: true})) if (old.url !== req.url) cache.delete(old);
      }
    } catch (e) { return new Response("", {status: 504}); }
  }
  return piece(req, r);
}
async function piece(req, r){
  const range = req.headers.get("range");
  if (!range || !r.ok) return r;
  const buf = await r.arrayBuffer(), len = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  let start = m[1] ? +m[1] : (m[2] ? Math.max(0, len - +m[2]) : 0);
  let end = m[1] && m[2] ? Math.min(+m[2], len - 1) : len - 1;
  if (start >= len || start > end) return new Response("", {status: 416, headers: {"Content-Range": `bytes */${len}`}});
  return new Response(buf.slice(start, end + 1), {status: 206, headers: {
    "Content-Type": r.headers.get("Content-Type") || "audio/mpeg",
    "Content-Range": `bytes ${start}-${end}/${len}`,
    "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes"
  }});
}
