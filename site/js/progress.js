/* ---------- progress page ----------
   Streak and practice calendar, what's due for review, and how much of each kind of thing is
   learning / known / mastered (see srs.js for the boxes), overall and unit by unit.
   Uses app.js helpers (S, esc, FULL, LMAP, plural ...) at call time. */
const PG_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const pgDate = n => new Date(n*86400000 + new Date(n*86400000).getTimezoneOffset()*60000);   // day number -> local Date at midnight
function pgGroups(){
  const ix = srsIndex(), of = kind => Object.keys(ix).filter(k=>ix[k].kind===kind && (kind!=="verb" || ix[k].unit>0));
  return [
    ["Course words", of("word")],
    ["Sentences", of("sent")],
    ["Listening", lsItems(0,"both").map(x=>"l:"+x.am)],
    ["Course verbs", of("verb")],
    ["Fidel letters", of("letter")],
    ["Extra words", of("extra")]
  ];
}
// One stacked bar: mastered, known, learning, then not started
function pgBar(c){
  const t = c.total||1, w = n => (n/t*100).toFixed(2)+"%";
  return `<div class="pgbar" role="img" aria-label="${c.mastered} mastered, ${c.known} known, ${c.learning} learning, ${c.new} not started">`+
    `<i class="m" style="width:${w(c.mastered)}"></i><i class="k" style="width:${w(c.known)}"></i><i class="l" style="width:${w(c.learning)}"></i></div>`;
}
const pgKey = `<div class="pgkey"><span><i class="m"></i>Mastered</span><span><i class="k"></i>Known</span><span><i class="l"></i>Learning</span><span><i></i>Not started</span></div>`;
function pgCalendar(st, today){
  // the last five weeks, Sunday to Saturday, ending with this week
  const end = today + (6 - pgDate(today).getDay()), start = end - 34;
  let h = `<div class="pgcal">`+PG_DAYS.map(d=>`<b>${d[0]}</b>`).join("");
  for(let d=start; d<=end; d++){
    const n = st.act[d]||0, lvl = d>today ? "f" : !n ? "0" : n<10 ? "1" : n<30 ? "2" : "3";
    const label = pgDate(d).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});
    h += `<span class="c${lvl}${d===today?" now":""}" title="${esc(label)}: ${d>today?"":plural(n,"answer")}"></span>`;
  }
  return h+`</div>`;
}
function pgForecast(st, today){
  const f = srsForecast(st, 7, today), max = Math.max(1, ...f);
  return `<div class="pgfc">`+f.map((n,i)=>`<div><span class="n">${n||""}</span><i style="height:${Math.round(n/max*56)}px"></i><small>${i===0?"Today":PG_DAYS[pgDate(today+i).getDay()]}</small></div>`).join("")+`</div>`;
}
// "12 known, 30 learning": short, so it fits beside the name on a phone
const pgSum = (c, short) => { const k=c.mastered+c.known; return k||!c.learning ? `${k} known`+(c.learning&&!short?`, ${c.learning} learning`:short&&c.learning?` · ${c.learning} learning`:"") : `${c.learning} learning`; };
function renderProgress(){
  const st = S.srs, d0 = dayNum(), sk = srsStreak(st, d0), due = srsDue(st, d0).length;
  const groups = pgGroups(), seen = Object.keys(st.it).length;
  const mastered = groups.reduce((a,g)=>a+srsCount(st,g[1]).mastered,0);
  let h = `<h2>Progress</h2><p class="lead">${seen?`You've met ${plural(seen,"item")} so far. Each one comes back for review just before you're likely to forget it.`:"Answer a few questions and your progress shows up here."}</p>
   <div class="pgtiles">
    <div><strong>${sk.now}</strong><small>day streak${sk.best>sk.now?` · best ${sk.best}`:""}</small></div>
    <div><strong>${sk.today}</strong><small>answered today</small></div>
    <div><strong>${due}</strong><small>due for review</small></div>
    <div><strong>${mastered}</strong><small>mastered</small></div>
   </div>
   <div class="stack" style="margin-top:12px">`+
   (due?`<button class="btn primary wide" data-act="start" data-v="due">Review ${plural(due,"item")} now</button>`:"")+
   `<button class="btn${due?"":" primary"} wide" data-act="start" data-v="daily">${S.day===today()?"Another session":"Start today's session"}</button></div>
   <h3>Last five weeks</h3>${pgCalendar(st, d0)}<p class="count">${sk.today?"You've practised today.":sk.now?"Practise today to keep your streak going.":"Practise on any day to start a streak."} Any answered question counts.</p>
   <h3>Coming up for review</h3>${seen?pgForecast(st, d0):`<p class="count">Nothing yet.</p>`}
   <h3>What you know</h3>${pgKey}<div class="pglist">`;
  groups.forEach(([name, keys])=>{ if(!keys.length) return; const c=srsCount(st,keys);
    h += `<div class="pgrow"><div class="pgname"><b>${esc(name)}</b><span>${pgSum(c)} of ${c.total}</span></div>${pgBar(c)}</div>`; });
  h += `</div><h3>By unit</h3><p class="count">Words and sentences in each unit, and your best unit test score.</p><div class="pglist">`;
  const ix = srsIndex();
  FULL.forEach(n=>{
    const keys = Object.keys(ix).filter(k=>ix[k].unit===n && (ix[k].kind==="word"||ix[k].kind==="sent")), c = srsCount(st, keys), b = S.best["L"+n];
    h += `<button class="pgrow pgunit" data-act="lesson-go" data-v="${n}"><div class="pgname"><b><span class="lnum">${n}</span>${esc(LMAP[n].title)}</b><span>${c.total-c.new?pgSum(c,1):"not started"}${b!=null?` · test ${b}/10`:""}</span></div>${pgBar(c)}</button>`;
  });
  h += `</div><div class="note"><h4>How review works</h4>
   <p>Every word, sentence, verb and letter you answer goes into one of six boxes. Get it right when it's due and it moves up a box, so it comes back later: after 1 day, then 3 days, a week, 2 weeks, a month, and 2 months. Get it wrong and it drops two boxes and comes back tomorrow.</p>
   <p>Items in boxes 3 and 4 count as known, and boxes 5 and 6 as mastered. Today's session starts with whatever is due, then adds a few new things from the unit you're up to.</p></div>`;
  return h;
}
