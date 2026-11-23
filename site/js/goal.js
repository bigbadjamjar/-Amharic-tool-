/* ---------- daily goal and streak ----------
   Each profile can pick a small daily goal: a number of answers a day (5, 10, 20, 30 or 50), or none.
   The streak counts days in a row on which the goal was reached. It is meant to be gentle:
   - today never counts against you: until midnight the streak just waits for you;
   - with "rest days" on (the default), missing one day in any 7 doesn't break the streak;
   - once a day's goal is reached it stays reached, even if the goal is raised later,
     and lowering the goal counts any earlier day that now meets it.
   With no goal, the streak counts every day with at least one answer.
   Saved in the profile as  goal: {n: answers a day (0 = none), rest: true/false, met: {day: 1}}
   Day numbers and the answers per day come from srs.js (dayNum, S.srs.act). */
const GOAL_OPTS = [5, 10, 20, 30, 50];
const GOAL_DEF = 10;
const goalClean = g => {
  g = g && typeof g === "object" ? g : {};
  const n = g.n === 0 || GOAL_OPTS.includes(+g.n) ? +g.n : GOAL_DEF, met = {};
  if (g.met && typeof g.met === "object") for (const d in g.met) if (g.met[d]) met[d] = 1;
  return { n, rest: g.rest !== false, met };
};
// Was the goal reached on day d?
const goalOk = (g, act, d) => !!g.met[d] || (act[d] || 0) >= Math.max(1, g.n);
// After each answer: mark today as reached. Returns true only at the moment the goal is first reached today.
function goalTick(g, act, today) {
  today = today == null ? dayNum() : today;
  const old = today - 400; for (const d in g.met) if (+d < old) delete g.met[d];
  if (!g.n || g.met[today] || (act[today] || 0) < g.n) return false;
  g.met[today] = 1; return true;
}
/* The streak, worked out from the first day the goal was reached up to today.
   now: the streak as it stands (today counts if already reached, and never breaks it)
   best: the longest streak so far · done/need: answers today and the goal
   rested: a day off within the current streak in the last 7 days (so the next miss would end it) */
function goalStreak(g, act, today) {
  today = today == null ? dayNum() : today;
  const ok = d => goalOk(g, act, d);
  const days = Object.keys(g.met).concat(Object.keys(act)).map(Number).filter(d => d <= today && ok(d));
  let run = 0, best = 0, skip = null;
  if (days.length) {
    for (let d = Math.min(...days); d < today; d++) {
      if (ok(d)) run++;
      else if (run > 0 && g.rest && (skip === null || d - skip >= 7)) skip = d;
      else { run = 0; skip = null; }
      best = Math.max(best, run);
    }
    if (ok(today)) run++;
    best = Math.max(best, run);
  }
  const done = act[today] || 0;
  return { now: run, best, done, need: g.n, reached: ok(today), rested: run > 0 && skip !== null && today - skip < 7 };
}

/* ---- what it looks like ---- */
// A ring that fills as today's answers add up
function goalRing(done, need, size) {
  size = size || 76;
  const r = 15.5, c = 2 * Math.PI * r, f = need ? Math.min(1, done / need) : done ? 1 : 0;
  return `<svg class="gring${need && done >= need ? " full" : ""}" viewBox="0 0 36 36" width="${size}" height="${size}" aria-hidden="true">` +
    `<circle cx="18" cy="18" r="${r}" class="t"/><circle cx="18" cy="18" r="${r}" class="f" stroke-dasharray="${(f * c).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 18 18)"/></svg>`;
}
// One short line about today, for the welcome page and the end of a test
function goalLine(k) {
  if (!k.need) return k.done ? `${plural(k.done, "answer")} today` : "No daily goal set";
  return k.reached ? "Today's goal reached" : `${k.done} of ${k.need} answers today`;
}
// The streak in words: "5-day streak", or nothing when there isn't one
const goalStreakText = k => k.now ? `${k.now}-day streak` : "";
// A friendly sentence under the ring. No pressure, no warnings about losing anything.
function goalMsg(k) {
  if (k.reached) return k.need ? (k.done > k.need ? `Goal reached, and ${k.done - k.need} extra. Well done.` : "Goal reached for today. Well done.") : "You've practised today. Well done.";
  const left = k.need ? k.need - k.done : 1;
  const start = k.need ? `${plural(left, "more answer")} reaches today's goal.` : "Answer any question to count today.";
  if (k.now) return start;
  return `${start} ${k.best ? "Reach it on any day to start a new streak." : "Reach it on any day to start a streak."}`;
}
// The card at the top of the Progress page: ring, message and the goal picker
function goalCard(g, act) {
  const k = goalStreak(g, act);
  const opt = (n, label) => `<button class="chip" role="radio" aria-checked="${g.n === n}" aria-selected="${g.n === n}" data-act="goal-n" data-v="${n}">${label}</button>`;
  return `<div class="pgcard pggoal">
    <div class="ggtop">
      <div class="ggring">${goalRing(k.done, k.need)}<span class="gnum"><b>${k.done}</b>${k.need ? `<small>of ${k.need}</small>` : ""}</span></div>
      <div class="ggtext"><b>${k.need ? `Daily goal: ${k.need} answers` : "No daily goal"}</b>
        <p>${goalMsg(k)}</p>
      </div>
    </div>
    <div class="ggpick"><span class="count" id="gg-l">Answers a day</span><div class="chips" role="radiogroup" aria-labelledby="gg-l">${GOAL_OPTS.map(n => opt(n, n)).join("")}${opt(0, "None")}</div></div>
    <label class="ggrest"><input type="checkbox" id="goal-rest" ${g.rest ? "checked" : ""}> Rest days: missing one day a week won't end your streak</label>
  </div>`;
}
// The small summary on the welcome page for someone coming back
function goalWelcome(g, act, name) {
  const k = goalStreak(g, act);
  return `<div class="wlgoal">${goalRing(k.done, k.need, 40)}<div><b>${esc(name)}</b><small>${goalLine(k)}${k.now ? ` · ${goalStreakText(k)}` : ""}</small></div></div>`;
}
// Under the score at the end of a test
function goalAfter(g, act, hit) {
  const k = goalStreak(g, act);
  if (hit) return `<p class="ggdone">🎉 You reached today's goal${k.now > 1 ? ` · ${goalStreakText(k)}` : ""}</p>`;
  if (!k.need || k.reached) return "";
  return `<p class="count ggafter">${k.done} of ${k.need} answers towards today's goal</p>`;
}
