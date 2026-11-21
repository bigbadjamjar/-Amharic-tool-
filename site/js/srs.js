/* ---------- spaced repetition ----------
   Every word, sentence, verb and letter you meet becomes an "item" that sits in one of six boxes.
   A right answer moves it up a box, and each box waits longer before the item comes back:
     box 1: 1 day · 2: 3 days · 3: 1 week · 4: 2 weeks · 5: 1 month · 6: 2 months
   A wrong answer moves it down two boxes (never below box 1), so it comes back tomorrow.
   Right answers only move an item up when it is due, so doing the same test five times in a row
   doesn't make something look learned. Boxes 5 and 6 count as "mastered".

   Item keys:  w:<amharic> word · s:<amharic> sentence · l:<amharic> heard (listening) · v:<amharic> verb · f:<letter> letter
   Saved in the profile as  srs: {v:1, it:{key:[box, due, reps, lapses, last]}, act:{day: answers}}
   where due/last/day are day numbers (days since 1970 in local time).
   Uses data globals (LESSONS, SENT, VLIST, FID, EXTRA) at call time, so it loads before app.js. */
const SRS_DAYS = [0, 1, 3, 7, 14, 30, 60];
const SRS_MASTER = 5, SRS_KNOWN = 3, SRS_TOP = 6;
const dayNum = (d) => { d = d || new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset()*60000) / 86400000); };
const srsEmpty = () => ({v:1, it:{}, act:{}});
function srsClean(x){
  const s = srsEmpty(); if(!x || typeof x!=="object") return s;
  if(x.it && typeof x.it==="object") for(const k in x.it){ const r=x.it[k]; if(Array.isArray(r) && r[0]>=1 && r[0]<=SRS_TOP && isFinite(r[1])) s.it[k]=[+r[0],+r[1],+r[2]||0,+r[3]||0,+r[4]||0]; }
  if(x.act && typeof x.act==="object") for(const d in x.act) if(+x.act[d]>0) s.act[d]=+x.act[d];
  return s;
}
// Record one answer for an item. Returns the new box.
function srsAnswer(st, key, ok, today){
  today = today==null ? dayNum() : today;
  let r = st.it[key];
  if(!r){ st.it[key] = [1, today+1, 1, ok?0:1, today]; return 1; }   // first time seen: back tomorrow either way
  r[2]++; r[4]=today;
  if(ok){ if(r[1] <= today){ r[0]=Math.min(SRS_TOP, r[0]+1); r[1]=today+SRS_DAYS[r[0]]; } }
  else { r[3]++; r[0]=Math.max(1, r[0]-2); r[1]=today+1; }
  return r[0];
}
// Count one answered question towards today's activity (for streaks). Keeps about 13 months.
function srsActivity(st, today){
  today = today==null ? dayNum() : today;
  st.act[today] = (st.act[today]||0) + 1;
  const old = today - 400; for(const d in st.act) if(+d < old) delete st.act[d];
}
const srsBox = (st, key) => st.it[key] ? st.it[key][0] : 0;
const srsState = (st, key) => { const b=srsBox(st,key); return !b?"new":b>=SRS_MASTER?"mastered":b>=SRS_KNOWN?"known":"learning"; };
// Items due on or before a day, most overdue first
function srsDue(st, today){
  today = today==null ? dayNum() : today;
  return Object.keys(st.it).filter(k=>st.it[k][1]<=today).sort((a,b)=>st.it[a][1]-st.it[b][1]||st.it[a][0]-st.it[b][0]);
}
// How many items fall due on each of the next n days (index 0 = today, including anything overdue)
function srsForecast(st, n, today){
  today = today==null ? dayNum() : today;
  const out = Array(n).fill(0);
  for(const k in st.it){ const d=Math.max(0, st.it[k][1]-today); if(d<n) out[d]++; }
  return out;
}
// Streak: days in a row with at least one answer, ending today (or yesterday, if today has nothing yet)
function srsStreak(st, today){
  today = today==null ? dayNum() : today;
  const on = d => (st.act[d]||0) > 0;
  let d = on(today) ? today : today-1, n = 0;
  while(on(d)){ n++; d--; }
  const days = Object.keys(st.act).map(Number).filter(on).sort((a,b)=>a-b);
  let best = 0, run = 0, prev = null;
  for(const x of days){ run = prev!==null && x===prev+1 ? run+1 : 1; best=Math.max(best,run); prev=x; }
  return {now:n, best:Math.max(best,n), today:st.act[today]||0, days:days.length};
}

/* ---- what there is to learn ---- */
let SRS_IX = null;
// key -> {kind, unit, x}. Words and sentences take the first unit they appear in.
function srsIndex(){
  if(SRS_IX) return SRS_IX;
  const ix = {}, add = (k, kind, unit, x) => { if(!ix[k]) ix[k]={kind, unit, x}; };
  LESSONS.filter(l=>!l.review).forEach(l=>(l.vocab||[]).forEach(w=>add("w:"+w[0], "word", l.n, w)));
  SENT.forEach(x=>add("s:"+x.am, "sent", x.l, x));
  Object.keys(EXTRA).forEach(c=>EXTRA[c].forEach(w=>add("w:"+w[0], "extra", 0, w)));
  VLIST.forEach(v=>add("v:"+v.am, "verb", v.lesson<99?v.lesson:0, v));
  FID.filter(f=>f.snd).forEach(f=>add("f:"+f.ch, "letter", 0, f));
  return SRS_IX = ix;
}
// Which item a question is about: its tag if it has one, otherwise a best guess from what it shows (older saved mistakes)
function srsKeyOf(q){
  if(!q) return null;
  if(q.srs) return q.srs;
  const ix = srsIndex(), ans = q.type==="mc" ? q.opts[q.ans].l : q.answer;
  if(q.listen) return ix["w:"+q.listen]||ix["s:"+q.listen] ? "l:"+q.listen : null;
  for(const t of [q.big, ans]){ for(const p of ["w:","s:","f:"]) if(ix[p+t]) return p+t; }
  for(const k in ix){ const e=ix[k]; if((e.kind==="word"||e.kind==="extra") && e.x[2]===q.big) return k; if(e.kind==="sent" && e.x.en===q.big) return k; }
  return null;
}
/* Turn the progress people already had into a starting point, the first time this runs for a profile:
   words and sentences from units tested at 7/10 or better start in box 2, other tested units in box 1,
   and saved mistakes are due today. Due dates are spread over the coming days so they don't all land at once. */
function srsMigrate(d, today){
  today = today==null ? dayNum() : today;
  const st = srsEmpty(), best = d.best||{}, ix = srsIndex();
  let i = 0;
  LESSONS.filter(l=>!l.review && best["L"+l.n]!=null).forEach(l=>{
    const good = best["L"+l.n] >= 7;
    Object.keys(ix).forEach(k=>{ const e=ix[k]; if(e.unit===l.n && (e.kind==="word"||e.kind==="sent") && !st.it[k]){
      st.it[k] = good ? [2, today+1+(i++%6), 1, 0, today] : [1, today+(i++%3), 1, 0, today]; } });
  });
  (Array.isArray(d.miss)?d.miss:[]).forEach(m=>{ const k=srsKeyOf(m&&m.q); if(k){ const r=st.it[k]; st.it[k]=[1, today, r?r[2]:1, 1, today]; } });
  if(typeof d.day==="string" && d.day){ const p=d.day.split("-").map(Number); if(p.length===3){ const n=dayNum(new Date(p[0],p[1]-1,p[2])); if(n<=today) st.act[n]=1; } }
  return st;
}
// Totals for a set of keys: {new, learning, known, mastered, total}
function srsCount(st, keys){
  const c = {new:0, learning:0, known:0, mastered:0, total:keys.length};
  keys.forEach(k=>c[srsState(st,k)]++);
  return c;
}
