/* ---------- phone app + offline ----------
   Registers the service worker (sw.js) so the app opens without signal, shows how to add it to the home screen,
   and lets you save every audio clip in one go. Audio is kept in the browser's Cache Storage under the same
   name sw.js uses. Shown at the bottom of the Profiles page (offlineHTML), plus a one-time tip at the top. */
const OFF_AUDIO = "amharic-audio-v1";   // must match sw.js
const OFF_TIP_KEY = "amharic-offline-tip";
const OFF = {ok: false, ready: false, have: null, total: 0, busy: false, done: 0, failed: 0, msg: "", prompt: null};

(function setupOffline(){
  if (typeof window === "undefined") return;
  OFF.ok = "serviceWorker" in navigator && "caches" in window && window.isSecureContext;
  if (!OFF.ok) return;
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.ready.then(reg => {
    OFF.ready = true;
    // save what this first visit already loaded (fonts especially), then count saved clips
    const warm = () => (reg.active || navigator.serviceWorker.controller)?.postMessage({type: "warm",
      urls: [location.href, ...performance.getEntriesByType("resource").map(e => e.name)]});
    warm(); setTimeout(warm, 5000);   // again later, for font files that load once text appears
    offCount();
  });
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); OFF.prompt = e; offRefresh(); });
  window.addEventListener("appinstalled", () => { OFF.prompt = null; offRefresh(); });
  window.addEventListener("online", offRefresh);
  window.addEventListener("offline", offRefresh);
  document.addEventListener("DOMContentLoaded", offTip);
})();

const offInstalled = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const offIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const offAndroid = () => /Android/i.test(navigator.userAgent);
const offClipURLs = () => Object.values(AUDIO_FILES).map(c => new URL("audio/" + c.split("/").map(encodeURIComponent).join("/"), location.href).href);
const offMB = n => Math.max(1, Math.round(n * 12.5 / 1024));   // clips average about 12.5 KB
const offStore = {get(){ try { return localStorage.getItem(OFF_TIP_KEY); } catch (e) { return "x"; } }, set(){ try { localStorage.setItem(OFF_TIP_KEY, "1"); } catch (e) {} }};
function offRefresh(){ if (typeof render === "function" && typeof S !== "undefined" && S.mode === "me") render(); }

async function offMissing(){
  const cache = await caches.open(OFF_AUDIO);
  const have = new Set((await cache.keys()).map(r => r.url));
  const all = offClipURLs();
  return {cache, all, missing: all.filter(u => !have.has(u))};
}
async function offCount(){
  try { const {all, missing} = await offMissing(); OFF.total = all.length; OFF.have = all.length - missing.length; } catch (e) { OFF.have = null; }
  offRefresh();
}

async function offSaveAll(){
  if (OFF.busy) return;
  OFF.busy = true; OFF.done = 0; OFF.failed = 0; OFF.msg = "";
  try { await navigator.storage?.persist?.(); } catch (e) {}   // asks the browser not to clear it when space is low
  let cache, missing;
  try { ({cache, missing} = await offMissing()); } catch (e) { OFF.busy = false; OFF.msg = "This browser won't let the app save files. Try Safari or Chrome, and not a private window."; offRefresh(); return; }
  const todo = missing.slice(), total = todo.length;
  offRefresh();
  const step = async () => {
    while (todo.length && OFF.busy) {
      const u = todo.shift();
      try { const r = await fetch(u, {cache: "no-cache"}); if (r.ok) await cache.put(u, r); else OFF.failed++; } catch (e) { OFF.failed++; }
      OFF.done++;
      const p = document.getElementById("off-prog");
      if (p) p.textContent = `Saving ${OFF.done} of ${total}…`;
      const bar = document.getElementById("off-bar");
      if (bar) bar.style.width = (100 * OFF.done / total) + "%";
    }
  };
  await Promise.all([step(), step(), step(), step(), step(), step()]);
  const stopped = !OFF.busy && todo.length;
  try { const m = await offMissing(); OFF.total = m.all.length; OFF.have = m.all.length - m.missing.length; } catch (e) {}
  OFF.busy = false;
  OFF.msg = stopped ? "Stopped. Tap the button again to carry on where it left off."
    : OFF.failed ? `${OFF.failed} clip${OFF.failed > 1 ? "s" : ""} couldn't be saved, probably because the signal dropped. Tap the button again to try those.`
    : "";
  offRefresh();
}

function offInstallSteps(){
  if (offInstalled()) return `<p><b>✓ You're using the app version.</b> It opens from your home screen like any other app.</p>`;
  if (OFF.prompt) return `<p>Put it on your home screen so it opens like an app, full screen, even with no signal.</p><div class="pfrow" style="margin-top:10px"><button class="btn primary" data-act="off-install">Install app</button></div>`;
  if (offIOS()) return `<p>Put it on your home screen so it opens like an app, full screen, even with no signal:</p>
    <ol class="offsteps"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (a square with an arrow pointing up).</li><li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>
    <p class="count">On iPhone and iPad the home screen app keeps its own saved audio, so open it from the home screen first, then save the audio there.</p>`;
  if (offAndroid()) return `<p>Put it on your home screen so it opens like an app, full screen, even with no signal:</p>
    <ol class="offsteps"><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu at the top right.</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b>, then <b>Install</b>.</li></ol>`;
  return `<p>On a phone, open this page and add it to your home screen: in Safari it's <b>Share → Add to Home Screen</b>; in Chrome it's <b>⋮ → Add to Home screen</b>. On a computer, Chrome and Edge show an install button at the right end of the address bar.</p>`;
}

function offlineHTML(){
  let h = `<h3 id="offline">Use it as a phone app, without signal</h3><div class="note">` + offInstallSteps();
  if (!OFF.ok) return h + `<p class="count">Saving for offline needs the app opened from its web address (not from a file) in an up to date browser.</p></div>`;
  h += `<p style="margin-top:12px"><b>${OFF.ready ? "✓ The app is saved on this device" : "Saving the app on this device…"}</b>${OFF.ready ? ". It will open and work with no signal." : ""}</p>`;
  const n = OFF.total || Object.keys(AUDIO_FILES).length;
  if (!n) return h + `</div>`;
  const left = OFF.have == null ? n : n - OFF.have;
  h += `<p style="margin-top:12px"><b>Audio:</b> `;
  if (OFF.busy) h += `</p><p class="count" id="off-prog" role="status">Saving ${OFF.done}…</p><div class="offbar"><i id="off-bar" style="width:0"></i></div><div class="pfrow"><button class="btn" data-act="off-stop">Stop</button></div>`;
  else if (OFF.have != null && !left) h += `✓ all ${n} clips are saved, so every ▶ button works offline.</p>`;
  else {
    h += OFF.have ? `${OFF.have} of ${n} clips saved so far. ` : `clips are saved as you play them. `;
    h += `Save them all now so every ▶ button works offline.</p>`;
    h += `<div class="pfrow" style="margin-top:10px"><button class="btn primary" data-act="off-save"${navigator.onLine === false ? " disabled" : ""}>${OFF.have ? `Save the other ${left} clips` : `Save all ${n} clips`} (about ${offMB(left)} MB)</button></div>`;
    if (navigator.onLine === false) h += `<p class="count">You're offline right now. Connect to Wi-Fi to save the audio.</p>`;
    else h += `<p class="count">Best done on Wi-Fi. When new clips are added to the app, come back here to save those too.</p>`;
  }
  if (OFF.msg) h += `<p class="count" role="status">${esc(OFF.msg)}</p>`;
  return h + `</div>`;
}

// One-time tip at the top, for phone users who haven't installed it yet.
function offTip(){
  if (!OFF.ok || offInstalled() || !(offIOS() || offAndroid()) || offStore.get()) return;
  const d = document.createElement("div");
  d.className = "offtip"; d.setAttribute("role", "note");
  d.innerHTML = `<span>Add this to your home screen to use it like an app, even with no signal.</span><button class="link" data-act="off-how">Show me</button><button class="offx" data-act="off-tipx" aria-label="Dismiss">×</button>`;
  document.querySelector("main").before(d);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a === "off-save") offSaveAll();
  else if (a === "off-stop") OFF.busy = false;
  else if (a === "off-install" && OFF.prompt) { const p = OFF.prompt; OFF.prompt = null; p.prompt(); p.userChoice?.finally?.(offRefresh); }
  else if (a === "off-how" || a === "off-tipx") {
    offStore.set(); document.querySelector(".offtip")?.remove();
    if (a === "off-how") { S.mode = "me"; render(); setTimeout(() => document.getElementById("offline")?.scrollIntoView({block: "start"}), 0); e.stopImmediatePropagation(); }
  }
});
