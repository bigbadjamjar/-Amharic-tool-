/* ---------- optional account: sign in, and progress kept in step across devices ----------
   Signing in is never needed. Without it the app works exactly as before, with everything on this device.
   Someone who signs in (Google, or email and password) links one of this device's profiles to their account.
   That profile's progress is then copied to the account and kept in step with their other devices.

   Switching it on: paste the web config from the Firebase console into FIREBASE_CONFIG below.
   While it is null, nothing about accounts shows anywhere in the app and nothing is loaded or sent.

   The Firebase code is kept in js/firebase/ (copied from the "firebase" npm package, version 13.4.0)
   and is only loaded once someone uses the account part, so the app is no slower for everyone else.

   What is stored online (Cloud Firestore, one document per account, see firestore.rules):
     users/<account id>   {name: profile name, data: the profile's saved progress as JSON text, updated: time in ms, v: 1}
   What this device remembers (localStorage "amharic-cloud"):
     {uid, email, pid: which profile here is linked, lt: when that profile last changed here, ct: the account copy's time when we last synced, at: when we last synced}

   Keeping two devices in step: progress is combined, never thrown away. Best scores keep the higher score,
   each spaced repetition word keeps whichever device saw it most recently, answers per day keep the bigger count,
   and days the goal was reached are kept from both. Settings and the mistakes list come from whichever side changed last. */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC_--u6wwwBoA7ZR1l2mNLtAIT-Zf0e6Hg",
  authDomain: "amharicapp-e94fd.firebaseapp.com",
  projectId: "amharicapp-e94fd",
  storageBucket: "amharicapp-e94fd.firebasestorage.app",
  messagingSenderId: "105865511929",
  appId: "1:105865511929:web:7dc503b55699082645b328"
};   // (measurementId left out: no Google Analytics)

const CL_V = 1;
const cloudOn = () => typeof window !== "undefined" && !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
const clHasProgress = d => !!d && (Object.keys(d.best || {}).length > 0 || Object.keys((d.srs && d.srs.it) || {}).length > 0 || (d.miss || []).length > 0);

/* Combine two copies of one profile's data. a and b are the saved data, at and bt when each last changed (ms).
   Pure: changes neither copy. */
function cloudMerge(a, at, b, bt){
  a = a && typeof a === "object" ? a : {}; b = b && typeof b === "object" ? b : {};
  const aNew = (+at || 0) >= (+bt || 0), N = aNew ? a : b, O = aNew ? b : a;
  const out = JSON.parse(JSON.stringify(Object.assign({}, O, N)));   // settings, mistakes, "day" etc.: the newer side
  const obj = x => x && typeof x === "object" ? x : {};
  // best scores: the higher one
  const best = Object.assign({}, obj(O.best));
  for (const k in obj(N.best)) if (typeof N.best[k] === "number") best[k] = Math.max(N.best[k], typeof best[k] === "number" ? best[k] : -Infinity);
  out.best = best;
  // spaced repetition: each word from the side that saw it last (then the one with more answers); answers per day: the bigger count
  const sa = obj(O.srs), sb = obj(N.srs);
  if (O.srs || N.srs) {
    const it = {}, act = {}, ia = obj(sa.it), ib = obj(sb.it), ca = obj(sa.act), cb = obj(sb.act);
    for (const k in ia) it[k] = ia[k].slice();
    for (const k in ib) { const r = ib[k], o = it[k]; if (!Array.isArray(r)) continue;
      if (!o || (+r[4] || 0) > (+o[4] || 0) || ((+r[4] || 0) === (+o[4] || 0) && (+r[2] || 0) >= (+o[2] || 0))) it[k] = r.slice(); }
    for (const d in ca) act[d] = +ca[d] || 0;
    for (const d in cb) act[d] = Math.max(act[d] || 0, +cb[d] || 0);
    out.srs = Object.assign({}, sa, sb, {it, act});
  }
  // daily goal: the newer setting, and every day reached on either side
  if (O.goal || N.goal) out.goal = Object.assign({}, obj(O.goal), obj(N.goal), {met: Object.assign({}, obj(obj(O.goal).met), obj(obj(N.goal).met))});
  // games: the newer settings, the higher best scores
  if (O.games || N.games) {
    const gb = Object.assign({}, obj(obj(O.games).best));
    const nb = obj(obj(N.games).best);
    for (const k in nb) if (typeof nb[k] === "number") gb[k] = Math.max(nb[k], typeof gb[k] === "number" ? gb[k] : -Infinity);
    out.games = Object.assign({}, obj(O.games), obj(N.games), {best: gb});
  }
  return out;
}

/* ---------- state ---------- */
const CL_KEY = "amharic-cloud", CL_REDIRECT = "amharic-cloud-redirect";
const clStore = typeof localStorage !== "undefined" ? safeStore() : null;
const clGet = () => { try { const v = clStore && clStore.getItem(CL_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const clPut = v => { try { if (v) clStore.setItem(CL_KEY, JSON.stringify(v)); else clStore.removeItem(CL_KEY); } catch (e) {} };
const CL = {
  fb: null,          // the loaded Firebase pieces
  loading: null,     // promise while loading
  user: undefined,   // undefined: not known yet · null: signed out · otherwise the Firebase user
  link: clGet(),
  busy: "",          // what's happening now, shown on the Profiles page
  msg: "", err: "",
  form: "",          // "", "email" (sign in), "new" (create account), "reset" (forgot password)
  email: "", pass: "",
  ask: null,         // {name, data, t}: the account already has progress and this profile has some too
  del: false,        // showing "delete my account?"
  offline: false,
  timer: null
};

/* ---------- loading Firebase, only when needed ---------- */
function clLoad(){
  if (CL.fb) return Promise.resolve(CL.fb);
  if (CL.loading) return CL.loading;
  const u = f => new URL("js/firebase/firebase-" + f + ".js", document.baseURI).href;
  CL.loading = Promise.all([import(u("app")), import(u("auth")), import(u("firestore-lite"))]).then(([A, U, F]) => {
    const app = A.initializeApp(FIREBASE_CONFIG);
    const auth = U.getAuth(app), db = F.getFirestore(app);
    // local testing only: the Firebase emulators (see tests/cloud-rules.test.mjs)
    try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem("amharic-cloud-emu")) {
      U.connectAuthEmulator(auth, "http://127.0.0.1:9099", {disableWarnings: true}); F.connectFirestoreEmulator(db, "127.0.0.1", 8080); } } catch (e) {}
    CL.fb = {U, F, auth, db};
    CL.offline = false;
    U.onAuthStateChanged(auth, user => clAuthChanged(user));
    return CL.fb;
  }).catch(e => { CL.loading = null; CL.offline = true; throw e; });
  return CL.loading;
}
const clRender = () => { if (typeof render === "function" && (S.mode === "me" || S.mode === "who")) render(); };

/* ---------- signing in and out ---------- */
const CL_ERR = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-email": "Type your email address first.",
  "auth/missing-password": "Type your password.",
  "auth/invalid-credential": "That email and password don't match. Check them, or tap \"Forgot password\".",
  "auth/wrong-password": "That email and password don't match. Check them, or tap \"Forgot password\".",
  "auth/user-not-found": "There's no account with that email yet. Tap \"Create an account\".",
  "auth/email-already-in-use": "There's already an account with that email. Sign in instead (or with Google, if that's how you made it).",
  "auth/weak-password": "Choose a password of at least 6 letters or numbers.",
  "auth/too-many-requests": "Too many tries. Wait a few minutes and try again.",
  "auth/network-request-failed": "Couldn't reach the internet. Check your connection and try again.",
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
  "auth/unauthorized-domain": "Sign-in isn't set up for this web address yet.",
  "auth/account-exists-with-different-credential": "You already have an account with that email, made a different way. Try the other sign-in option.",
  "auth/requires-recent-login": "For safety, sign out, sign in again, then try once more."
};
const clErrText = e => { const c = e && e.code; return c in CL_ERR ? CL_ERR[c] : "Something went wrong" + (c ? " (" + c.replace(/^\w+\//, "") + ")" : "") + ". Please try again."; };
async function clDo(busy, fn){
  CL.busy = busy; CL.err = ""; CL.msg = ""; clRender();
  try { await fn(await clLoad()); }
  catch (e) { CL.err = CL.offline ? "You're offline. Connect to the internet to sign in." : clErrText(e); }
  CL.busy = ""; clRender();
}
function clGoogle(){
  return clDo("Signing in…", async ({U, auth}) => {
    const p = new U.GoogleAuthProvider(); p.setCustomParameters({prompt: "select_account"});
    try { await U.signInWithPopup(auth, p); }
    catch (e) {
      // some phones (apps added to the home screen) can't open the Google window: go to Google's page and come back instead
      if (e && /popup-blocked|operation-not-supported/.test(e.code)) { try { clStore.setItem(CL_REDIRECT, "1"); } catch (x) {} await U.signInWithRedirect(auth, p); }
      else throw e;
    }
  });
}
const clEmailBits = () => [CL.email.trim(), CL.pass];
function clEmailGo(){
  const [em, pw] = clEmailBits();
  if (CL.form === "reset") return clDo("Sending…", async ({U, auth}) => { await U.sendPasswordResetEmail(auth, em); CL.form = "email"; CL.msg = "Check your email for a link to choose a new password. It can take a few minutes, and may land in junk mail."; });
  if (CL.form === "new") return clDo("Creating your account…", async ({U, auth}) => { await U.createUserWithEmailAndPassword(auth, em, pw); });
  return clDo("Signing in…", async ({U, auth}) => { await U.signInWithEmailAndPassword(auth, em, pw); });
}
async function clSignOut(){
  clPut(null); CL.link = null; CL.ask = null; CL.del = false; CL.form = "";
  if (CL.fb) { try { await CL.fb.U.signOut(CL.fb.auth); } catch (e) {} }
  CL.user = null; CL.msg = "Signed out. Progress stays on this device."; clRender();
}
async function clDelete(){
  const user = CL.user; if (!user) return;
  await clDo("Deleting…", async ({U, F, db}) => {
    await F.deleteDoc(F.doc(db, "users", user.uid));
    clPut(null); CL.link = null; CL.del = false;
    try { await U.deleteUser(user); CL.user = null; CL.msg = "Your account and the progress saved in it are deleted. Progress on this device is still here."; }
    catch (e) {
      if (e && e.code === "auth/requires-recent-login") { await clSignOut(); CL.msg = "The progress saved in your account is deleted. To delete the account itself, sign in again and tap \"Delete my account\" once more."; }
      else throw e;
    }
  });
}

/* ---------- linking a profile and keeping it in step ---------- */
const clDocRef = uid => CL.fb.F.doc(CL.fb.db, "users", uid);
async function clRead(uid){
  const snap = await CL.fb.F.getDoc(clDocRef(uid));
  if (!snap.exists()) return null;
  const x = snap.data(); let data = {};
  try { data = JSON.parse(x.data || "{}"); } catch (e) {}
  return {name: String(x.name || ""), data, t: +x.updated || 0};
}
async function clWrite(uid, name, data){
  const t = Date.now();
  await CL.fb.F.setDoc(clDocRef(uid), {name: String(name || "Learner").slice(0, 40), data: JSON.stringify(data), updated: t, v: CL_V});
  return t;
}
const clLinked = () => CL.link && CL.user && CL.link.uid === CL.user.uid ? CL.link : null;
const clProfile = () => { const l = clLinked(); return l ? PROF.list().find(p => p.id === l.pid) || null : null; };
const clIsCur = () => { const l = clLinked(), c = PROF.cur(); return !!(l && c && c.id === l.pid); };
const clLocal = () => clIsCur() ? profileData() : PROF.load(CL.link.pid);
// Can the account's progress be put into what's on screen without disturbing anything?
const clSafe = () => !S.quiz && !(typeof G !== "undefined" && G) && !(S.mode === "fidel" && S.ftab === "type");
function clApply(data){
  const keepLesson = S.lesson, keepView = S.lview;
  applyData(data); S.lesson = keepLesson; S.lview = keepView;
}

async function clAuthChanged(user){
  CL.user = user || null;
  try { clStore.removeItem(CL_REDIRECT); } catch (e) {}
  if (!user) { if (CL.link) { CL.link = null; clPut(null); } clRender(); return; }
  if (CL.link && CL.link.uid !== user.uid) { CL.link = null; clPut(null); }   // a different account than last time
  if (CL.link && !PROF.list().some(p => p.id === CL.link.pid)) { CL.link = null; clPut(null); }   // that profile was deleted here
  CL.form = ""; CL.pass = "";
  if (CL.link) { await clSync(true); return; }
  // just signed in on this device: link the profile in use
  CL.busy = "Getting your progress…"; clRender();
  try {
    const cloud = await clRead(user.uid);
    if (!PROF.cur()) { PROF.add(cloud && cloud.name || (user.displayName || "").split(" ")[0] || "Learner", cloud ? cloud.data : {}); applyData(PROF.load()); }
    const cur = PROF.cur();
    if (!cloud) { save(); await clLinkTo(cur.id, null); CL.msg = `Signed in. ${cur.name}'s progress is now saved to your account.`; }
    else if (!clHasProgress(profileData())) { await clLinkTo(cur.id, cloud, true); CL.msg = `Signed in. Your progress from your account is now in ${cur.name}.`; }
    else CL.ask = cloud;   // both have progress: ask (see cloudHTML)
  } catch (e) { CL.err = "Signed in, but couldn't reach your saved progress. " + clErrText(e); }
  CL.busy = ""; clRender();
  if (typeof render === "function" && S.mode !== "me" && S.mode !== "who") render();
}
// Link profile pid to the signed-in account and bring the two copies together.
async function clLinkTo(pid, cloud, replace){
  CL.link = {uid: CL.user.uid, email: CL.user.email || "", pid, lt: Date.now(), ct: 0, at: 0}; clPut(CL.link);
  if (cloud && replace) { CL.link.lt = 0; }   // this profile had nothing yet: the account's copy wins on settings too
  await clSync(true, cloud);
}
async function clChoose(how){
  const cloud = CL.ask; if (!cloud) return;
  CL.ask = null; CL.busy = "Saving…"; clRender();
  try {
    if (how === "new") { keep(); PROF.add(cloud.name || "Me", cloud.data); applyData(PROF.load()); await clLinkTo(PROF.cur().id, cloud, true); CL.msg = `Signed in. ${PROF.cur().name} is added with the progress from your account.`; }
    else { save(); await clLinkTo(PROF.cur().id, cloud); CL.msg = `Signed in. ${PROF.cur().name}'s progress here and in your account are combined.`; }
  } catch (e) { CL.err = clErrText(e); }
  CL.busy = ""; if (typeof render === "function") render();
}

let clSyncing = null;
/* Bring this device and the account into step. apply: also put changes from the account into what's on screen (when safe). */
async function clSync(apply, cloudKnown){
  if (clSyncing) return clSyncing;
  clSyncing = (async () => {
    const L = clLinked(); if (!L || !CL.fb) return;
    if (!PROF.list().some(p => p.id === L.pid)) { CL.link = null; clPut(null); return; }
    try {
      const cloud = cloudKnown !== undefined ? cloudKnown : await clRead(L.uid);
      const cur = clIsCur(), local = clLocal();
      const merged = cloud ? cloudMerge(local, L.lt || 0, cloud.data, cloud.t) : local;
      const ms = JSON.stringify(merged), name = (clProfile() || {}).name;
      let t = cloud ? cloud.t : 0;
      if (!cloud || ms !== JSON.stringify(cloud.data) || cloud.name !== name) t = await clWrite(L.uid, name, merged);
      if (ms !== JSON.stringify(local)) {
        if (!cur) { PROF.save(merged, L.pid); L.lt = t; }
        else if (apply && clSafe()) { PROF.save(merged, L.pid); clApply(merged); L.lt = t; if (typeof render === "function") render(); }
      } else L.lt = Math.max(L.lt || 0, t);
      L.ct = t; L.at = Date.now(); CL.offline = false; CL.err = ""; clPut(L);
    } catch (e) {
      CL.offline = navigator.onLine === false || (e && /unavailable|network/.test(e.code || e.message || ""));
      if (!CL.offline) CL.err = "Couldn't sync just now. " + clErrText(e);
    }
  })().finally(() => { clSyncing = null; clRender(); });
  return clSyncing;
}

/* Called by save() in app.js after every change: note the time, and send it to the account a few seconds later. */
function cloudTouch(){
  if (!CL.link || !cloudOn()) return;
  const c = PROF.cur(); if (!c || c.id !== CL.link.pid) return;
  CL.link.lt = Date.now(); clPut(CL.link);
  clearTimeout(CL.timer); CL.timer = setTimeout(() => clSync(false), 5000);
}

/* ---------- the "Your account" part of the Profiles page ---------- */
const clAgo = ms => { if (!ms) return ""; const s = (Date.now() - ms) / 1000;
  return s < 60 ? "just now" : s < 3600 ? Math.round(s / 60) + " min ago" : s < 86400 ? Math.round(s / 3600) + " hours ago" : new Date(ms).toLocaleDateString(undefined, {day: "numeric", month: "short"}); };
function cloudHTML(){
  if (!cloudOn()) return "";
  const cur = PROF.cur(), nm = cur ? esc(cur.name) : "your";
  let h = `<h3 id="account">Your account <small class="count">(optional)</small></h3><div class="note">`;
  const foot = `<p class="count" style="margin-top:10px"><a href="privacy.html" target="_blank" rel="noopener">Privacy notice</a>: what is saved and how to delete it.</p>`;
  if (CL.busy) return h + `<p role="status">${esc(CL.busy)}</p></div>`;
  const status = (CL.msg ? `<p class="count" role="status">${esc(CL.msg)}</p>` : "") + (CL.err ? `<p class="count bad" role="alert">${esc(CL.err)}</p>` : "");
  if (CL.user && CL.ask) {
    const a = CL.ask;
    return h + `<p>Signed in as <b>${esc(CL.user.email || "")}</b>. Your account already has progress${a.name ? " for <b>" + esc(a.name) + "</b>" : ""}: ${esc(statLine(a.data))}.</p>
      <p style="margin-top:8px">What should happen to it on this device?</p>
      <div class="stack" style="margin-top:10px">
        <button class="topic" data-act="cl-merge"><b>Combine it with ${nm}'s progress</b><small>Best when it's the same person. Nothing is lost: scores and words learned from both are kept.</small></button>
        <button class="topic" data-act="cl-new"><b>Add it as a separate profile</b><small>${nm} stays as it is on this device, and ${esc(a.name || "the account")} is added next to it.</small></button>
      </div><div class="pfrow" style="margin-top:10px"><button class="link" data-act="cl-out">Cancel and sign out</button></div>${status}</div>`;
  }
  const L = clLinked();
  if (CL.user && L) {
    const p = clProfile();
    h += `<p>Signed in as <b>${esc(CL.user.email || CL.user.displayName || "you")}</b>. <b>${esc(p ? p.name : "")}</b>'s progress is saved to your account and kept in step on every device where you sign in.</p>`;
    h += `<p class="count" style="margin-top:6px">${CL.offline ? "You're offline. Changes are kept on this device and saved to your account when you're back online." : L.at ? "Last synced " + clAgo(L.at) + "." : "Syncing…"}</p>`;
    if (cur && p && cur.id !== p.id) h += `<p class="count">You're using ${esc(cur.name)} now, which stays on this device only.</p>`;
    if (CL.del) h += `<div class="note warn"><p>Delete your account and the progress saved in it? Progress on this device stays. This can't be undone.</p><div class="pfrow" style="margin-top:8px"><button class="btn danger" data-act="cl-del-ok">Delete my account</button><button class="btn" data-act="cl-del-x">Cancel</button></div></div>`;
    else h += `<div class="pfrow" style="margin-top:10px"><button class="btn" data-act="cl-sync">Sync now</button><button class="btn" data-act="cl-out">Sign out</button></div>
      <div class="bar" style="justify-content:flex-start"><button class="link" data-act="cl-del">Delete my account</button></div>`;
    return h + status + foot + `</div>`;
  }
  if (CL.user && !L) {   // signed in, but no profile here is linked (it was deleted, or linking failed)
    h += `<p>Signed in as <b>${esc(CL.user.email || CL.user.displayName || "you")}</b>.${cur ? "" : " Add a profile above first."}</p>`;
    h += `<div class="pfrow" style="margin-top:10px">${cur ? `<button class="btn primary" data-act="cl-link">Save ${nm}'s progress to this account</button>` : ""}<button class="btn" data-act="cl-out">Sign out</button></div>`;
    return h + status + foot + `</div>`;
  }
  if (CL.link && CL.user === undefined) {   // signed in on this device, but Firebase hasn't loaded (offline, or still starting)
    h += `<p>Signed in as <b>${esc(CL.link.email || "you")}</b>.</p><p class="count" style="margin-top:6px">${CL.offline ? "You're offline. Changes are kept on this device and saved to your account when you're back online." : "Connecting…"}</p>`;
    h += `<div class="pfrow" style="margin-top:10px"><button class="btn" data-act="cl-out">Sign out</button></div>`;
    return h + status + foot + `</div>`;
  }
  // signed out
  h += `<p>Sign in to keep ${nm}${cur ? "'s" : ""} progress safe and carry on from any phone or computer. You don't need an account to use the app.</p>`;
  if (CL.form) {
    const reset = CL.form === "reset", isNew = CL.form === "new";
    h += `<div class="clform" style="margin-top:10px">
      <input id="cl-email" type="email" autocomplete="email" placeholder="Email address" value="${esc(CL.email)}">
      ${reset ? "" : `<input id="cl-pass" type="password" autocomplete="${isNew ? "new-password" : "current-password"}" placeholder="${isNew ? "Choose a password (6 or more letters)" : "Password"}" value="${esc(CL.pass)}">`}
      <div class="pfrow"><button class="btn primary" data-act="cl-email-go">${reset ? "Send reset link" : isNew ? "Create account" : "Sign in"}</button><button class="btn" data-act="cl-form" data-v="">Cancel</button></div>
      <div class="bar" style="justify-content:flex-start;gap:16px">${isNew || reset ? `<button class="link" data-act="cl-form" data-v="email">I have an account</button>` : `<button class="link" data-act="cl-form" data-v="new">Create an account</button><button class="link" data-act="cl-form" data-v="reset">Forgot password</button>`}</div></div>`;
  } else {
    h += `<div class="pfrow" style="margin-top:10px"><button class="btn primary" data-act="cl-google"><span aria-hidden="true" class="gmark">G</span> Sign in with Google</button><button class="btn" data-act="cl-form" data-v="email">Use email</button></div>`;
  }
  return h + status + foot + `</div>`;
}

/* Clicks on data-act="cl-…" (from app.js). Returns true when it has rendered by itself. */
function cloudAct(a, v){
  CL.msg = ""; CL.err = "";
  if (a === "cl-google") { clGoogle(); return true; }
  if (a === "cl-form") { CL.form = v || ""; CL.pass = ""; if (v) setTimeout(() => { const i = document.getElementById("cl-email"); if (i && !i.value) i.focus(); }, 0); return false; }
  if (a === "cl-email-go") { clEmailGo(); return true; }
  if (a === "cl-out") { clSignOut(); return true; }
  if (a === "cl-sync") { CL.msg = ""; keep(); clSync(true).then(() => { if (!CL.err && !CL.offline) CL.msg = "Synced."; clRender(); }); return true; }
  if (a === "cl-merge" || a === "cl-new") { clChoose(a === "cl-new" ? "new" : "merge"); return true; }
  if (a === "cl-link") { if (CL.user) clAuthChanged(CL.user); return true; }
  if (a === "cl-del") { CL.del = true; return false; }
  if (a === "cl-del-x") { CL.del = false; return false; }
  if (a === "cl-del-ok") { clDelete(); return true; }
  return false;
}

/* A profile was deleted on this device: if it was the linked one, stop syncing it (the account keeps its copy). */
function cloudForget(pid){ if (CL.link && CL.link.pid === pid) { CL.link = null; clPut(null); } }

/* Start up: only load Firebase if this device is signed in (or coming back from Google's sign-in page). */
function cloudStart(){
  if (!cloudOn()) return;
  let back = false; try { back = !!clStore.getItem(CL_REDIRECT); } catch (e) {}
  if (CL.link || back) clLoad().catch(() => clRender());
  document.addEventListener("input", e => { if (e.target.id === "cl-email") CL.email = e.target.value; if (e.target.id === "cl-pass") CL.pass = e.target.value; });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && (e.target.id === "cl-email" || e.target.id === "cl-pass")) { e.preventDefault(); clEmailGo(); } });
  // send changes when the app is put away, and fetch changes from other devices when it comes back
  let hidden = 0;
  document.addEventListener("visibilitychange", () => {
    if (!clLinked()) return;
    if (document.visibilityState === "hidden") { hidden = Date.now(); keep(); clearTimeout(CL.timer); clSync(false); }
    else if (Date.now() - hidden > 60000) clSync(true);
  });
  window.addEventListener("online", () => { if (CL.link) clLoad().then(() => clSync(true)).catch(() => {}); });
}
