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
  del: false,        // showing "delete my account?"
  offline: false,
  snap: {},          // each profile's data as last saved or synced, so saving with nothing changed doesn't count as a change
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
  clearTimeout(CL.timer); clPut(null); CL.link = null; CL.del = false; CL.form = "";
  if (CL.fb) { try { await CL.fb.U.signOut(CL.fb.auth); } catch (e) {} }
  CL.user = null; CL.msg = "Signed out. Everyone's progress stays on this device."; clRender();
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

/* ---------- keeping every profile in step with the account ----------
   The account holds all the profiles from every device where it was used:
     users/<uid>.data = JSON {profiles: [{id, name, t, data} or {id, del: true, t}]}   (v: 2)
   Accounts saved by the first version (v: 1) held one profile; it is read as a profile with id "first".
   This device remembers which of its profiles is which one in the account (link.map: local id -> account id),
   when each profile last changed here (link.lts), and profiles deleted here that the account should forget (link.gone). */
const clDocRef = uid => CL.fb.F.doc(CL.fb.db, "users", uid);
async function clRead(uid){
  const snap = await CL.fb.F.getDoc(clDocRef(uid));
  if (!snap.exists()) return null;
  const x = snap.data(); let d = {};
  try { d = JSON.parse(x.data || "{}"); } catch (e) {}
  const t = +x.updated || 0;
  if ((+x.v || 1) < 2) return {t, profiles: [{id: "first", name: String(x.name || "Me"), t, data: d}]};
  return {t, profiles: Array.isArray(d.profiles) ? d.profiles.filter(e => e && typeof e.id === "string") : []};
}
async function clWrite(uid, profiles){
  const t = Date.now(), live = profiles.filter(e => !e.del);
  await CL.fb.F.setDoc(clDocRef(uid), {name: String(live.map(e => e.name).join(", ") || "Learner").slice(0, 40), data: JSON.stringify({profiles}), updated: t, v: 2});
  return t;
}
const clLinked = () => CL.link && CL.user && CL.link.uid === CL.user.uid ? CL.link : null;
const cloudSignedIn = () => !!clLinked();
const clNorm = L => {   // fill in a link record, including one saved by the first version ({pid, lt})
  L.map = L.map || {}; L.lts = L.lts || {}; L.gone = L.gone || {};
  if (L.pid) { L.map[L.pid] = "first"; L.lts[L.pid] = L.lt || 0; delete L.pid; delete L.lt; delete L.ct; }
  return L;
};
if (CL.link) clNorm(CL.link);
// Can the account's progress be put into what's on screen without disturbing anything?
const clSafe = () => !S.quiz && !(typeof G !== "undefined" && G) && !(S.mode === "fidel" && S.ftab === "type");
function clApply(data){
  const keepLesson = S.lesson, keepView = S.lview;
  applyData(data); S.lesson = keepLesson; S.lview = keepView;
}
const clSame = (a, b) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

async function clAuthChanged(user){
  CL.user = user || null;
  try { clStore.removeItem(CL_REDIRECT); } catch (e) {}
  if (!user) { if (CL.link) { CL.link = null; clPut(null); } clRender(); return; }
  CL.form = ""; CL.pass = "";
  if (CL.link && CL.link.uid === user.uid) { await clSync(true); return; }
  // just signed in on this device
  CL.link = clNorm({uid: user.uid, email: user.email || "", at: 0}); clPut(CL.link);
  CL.busy = "Getting your progress…"; clRender();
  keep();
  const r = await clSync(true, true);
  CL.busy = "";
  if (r && !CL.err) {
    const names = PROF.list().map(p => p.name);
    CL.msg = "Signed in. " + (names.length ? clList(names) + (names.length > 1 ? "'s progress is" : "'s progress is") + " now saved to your account." : "");
    if (r.added.length) CL.msg += " Added from your account: " + clList(r.added) + ".";
  }
  if (typeof render === "function") render();
}
const clList = a => a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];

let clSyncing = null;
/* Bring this device and the account into step, for every profile.
   apply: also put changes into the profile on screen (when safe). first: this device has just signed in.
   Resolves to {added: [names of profiles that came from the account]} or null if it couldn't sync. */
async function clSync(apply, first){
  if (clSyncing) return clSyncing;
  clSyncing = (async () => {
    const L = clLinked(); if (!L || !CL.fb) return null;
    clNorm(L);
    try {
      const cloud = await clRead(L.uid), now = Date.now();
      const ents = cloud ? cloud.profiles : [], byId = {};
      ents.forEach(e => { byId[e.id] = e; });
      const out = {}, added = [];
      let curId = PROF.cur() ? PROF.cur().id : null, curGone = false;
      // forget map entries for profiles that are no longer here
      for (const pid in L.map) if (!PROF.list().some(p => p.id === pid)) { delete L.map[pid]; delete L.lts[pid]; }
      const mapped = () => new Set(Object.values(L.map));
      // a profile here with the same name as one in the account (and not yet paired) is the same person
      for (const e of ents) {
        if (e.del || mapped().has(e.id)) continue;
        const p = PROF.list().find(q => !L.map[q.id] && clSame(q.name, e.name));
        if (p) L.map[p.id] = e.id;
      }
      // just signed in: an empty, unnamed-for profile here (like "Learner" with nothing done) isn't worth adding to the account
      if (first && ents.some(e => !e.del)) for (const p of PROF.list()) {
        if (L.map[p.id]) continue;
        const d = p.id === curId ? profileData() : PROF.load(p.id);
        if (!clHasProgress(d)) { PROF.remove(p.id); if (p.id === curId) { curId = null; curGone = true; } }
      }
      // each profile here
      for (const p of PROF.list()) {
        const isCur = p.id === curId, local = isCur ? profileData() : PROF.load(p.id), lt = L.lts[p.id] || 0;
        let cid = L.map[p.id], e = cid && byId[cid];
        if (!cid) { cid = byId[p.id] ? p.id + Math.random().toString(36).slice(2, 5) : p.id; L.map[p.id] = cid; }
        if (e && e.del && lt <= e.t) {   // deleted on another device
          delete L.map[p.id]; delete L.lts[p.id];
          if (isCur && !(apply && clSafe())) { out[cid] = e; continue; }
          PROF.remove(p.id); if (isCur) { curId = null; curGone = true; }
          continue;
        }
        if (!e || e.del) { out[cid] = {id: cid, name: p.name, t: lt || now, data: local}; continue; }
        const merged = cloudMerge(local, lt, e.data, e.t), name = lt >= e.t ? p.name : e.name;
        const changedHere = JSON.stringify(merged) !== JSON.stringify(local), changedThere = JSON.stringify(merged) !== JSON.stringify(e.data) || name !== e.name;
        const t = changedThere ? now : e.t;
        out[cid] = {id: cid, name, t, data: merged};
        if (name !== p.name) PROF.rename(p.id, name);
        if (changedHere) {
          if (!isCur) { PROF.save(merged, p.id); L.lts[p.id] = t; }
          else if (apply && clSafe()) { PROF.save(merged, p.id); clApply(merged); L.lts[p.id] = t; }
        } else L.lts[p.id] = Math.max(lt, t);
      }
      // profiles in the account that aren't on this device yet
      const have = mapped();
      for (const e of ents) {
        if (e.del || have.has(e.id) || out[e.id]) continue;
        const keepCur = PROF.cur() ? PROF.cur().id : null;
        const id = PROF.add(e.name || "Learner", e.data || {});
        if (keepCur) PROF.use(keepCur); else curId = id;
        L.map[id] = e.id; L.lts[id] = e.t; out[e.id] = e; added.push(PROF.list().find(p => p.id === id).name);
      }
      // profiles deleted here, and deletions from other devices (kept for 90 days so every device hears of them)
      for (const cid in L.gone) out[cid] = {id: cid, del: true, t: L.gone[cid]};
      for (const e of ents) if (e.del && !out[e.id] && now - e.t < 90 * 864e5) out[e.id] = e;
      const list = Object.values(out);
      if (!cloud || JSON.stringify(list) !== JSON.stringify(ents)) await clWrite(L.uid, list);
      L.gone = {};
      for (const p of PROF.list()) CL.snap[p.id] = JSON.stringify(PROF.cur() && p.id === PROF.cur().id ? profileData() : PROF.load(p.id));
      if (curGone || (!PROF.cur() && PROF.list().length)) { if (!PROF.cur() && PROF.list().length) PROF.use(PROF.list()[0].id); applyData(PROF.load()); }
      else if (curId && !PROF.list().some(p => p.id === curId)) applyData(PROF.load());
      if (S.mode === "who" && PROF.cur()) S.mode = "course";
      L.at = Date.now(); CL.offline = false; CL.err = ""; clPut(L);
      if (typeof render === "function") render();
      return {added};
    } catch (e) {
      clPut(L);
      CL.offline = navigator.onLine === false || (e && /unavailable|network/.test(e.code || e.message || ""));
      if (!CL.offline) CL.err = "Couldn't sync just now. " + clErrText(e);
      return null;
    }
  })().finally(() => { clSyncing = null; clRender(); });
  return clSyncing;
}

/* Called by app.js after every change (save, rename, new profile): note the time, and send it to the account a few seconds later. */
function cloudTouch(){
  if (!CL.link || !cloudOn()) return;
  const c = PROF.cur(); clNorm(CL.link);
  if (c) { const j = JSON.stringify(profileData()); if (CL.snap[c.id] !== j) { CL.snap[c.id] = j; CL.link.lts[c.id] = Date.now(); } }   // only a real change counts
  clPut(CL.link);
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
  const L = clLinked();
  if (CL.user && L) {
    const names = PROF.list().map(p => "<b>" + esc(p.name) + "</b>");
    h += `<p>Signed in as <b>${esc(CL.user.email || CL.user.displayName || "you")}</b>. ${names.length ? clList(names) + "'s progress is" : "Progress is"} saved to your account and kept in step on every device where you sign in.</p>`;
    h += `<p class="count" style="margin-top:6px">${CL.offline ? "You're offline. Changes are kept on this device and saved to your account when you're back online." : L.at ? "Last synced " + clAgo(L.at) + "." : "Syncing…"}</p>`;
    if (CL.del) h += `<div class="note warn"><p>Delete your account and the progress saved in it? Progress on this device stays. This can't be undone.</p><div class="pfrow" style="margin-top:8px"><button class="btn danger" data-act="cl-del-ok">Delete my account</button><button class="btn" data-act="cl-del-x">Cancel</button></div></div>`;
    else h += `<div class="pfrow" style="margin-top:10px"><button class="btn" data-act="cl-sync">Sync now</button><button class="btn" data-act="cl-out">Sign out</button></div>
      <div class="bar" style="justify-content:flex-start"><button class="link" data-act="cl-del">Delete my account</button></div>`;
    return h + status + foot + `</div>`;
  }
  if (CL.link && CL.user === undefined) {   // signed in on this device, but Firebase hasn't loaded (offline, or still starting)
    h += `<p>Signed in as <b>${esc(CL.link.email || "you")}</b>.</p><p class="count" style="margin-top:6px">${CL.offline ? "You're offline. Changes are kept on this device and saved to your account when you're back online." : "Connecting…"}</p>`;
    h += `<div class="pfrow" style="margin-top:10px"><button class="btn" data-act="cl-out">Sign out</button></div>`;
    return h + status + foot + `</div>`;
  }
  // signed out
  h += `<p>Sign in to keep ${PROF.list().length > 1 ? "everyone's" : nm + (cur ? "'s" : "")} progress safe and carry on from any phone or computer. One account holds every profile on this device. You don't need an account to use the app.</p>`;
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
  if (a === "cl-jump") { const el = document.getElementById("account"); if (el) window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - (document.querySelector("header") || {offsetHeight: 0}).offsetHeight - 12, behavior: "smooth"}); return true; }
  if (a === "cl-del") { CL.del = true; return false; }
  if (a === "cl-del-x") { CL.del = false; return false; }
  if (a === "cl-del-ok") { clDelete(); return true; }
  return false;
}

/* A profile was deleted on this device: delete it from the account too, so it doesn't come back. */
function cloudForget(pid){
  if (!CL.link) return; clNorm(CL.link);
  const cid = CL.link.map[pid]; if (!cid) return;
  CL.link.gone[cid] = Date.now(); delete CL.link.map[pid]; delete CL.link.lts[pid]; clPut(CL.link);
  clearTimeout(CL.timer); CL.timer = setTimeout(() => clSync(false), 1000);
}

/* Start up: only load Firebase if this device is signed in (or coming back from Google's sign-in page). */
function cloudStart(){
  if (!cloudOn()) return;
  let back = false; try { back = !!clStore.getItem(CL_REDIRECT); } catch (e) {}
  if (CL.link) { const c = PROF.cur(); PROF.list().forEach(p => { CL.snap[p.id] = JSON.stringify(c && p.id === c.id ? profileData() : PROF.load(p.id)); }); }
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
