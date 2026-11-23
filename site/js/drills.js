/* ---------- everyday drills: telling the time, prices, dates ----------
   The "Everyday Amharic" section of the Test tab: an explanation page for each topic (with a few
   things to try), and short tests that use the normal quiz screen. The words are in data/everyday.js.
   Uses app.js helpers (S, mk, pick, ri, shuffle, esc, numWord, mini, tItem, wordList) at call time. */

/* ----- the Ethiopian calendar -----
   Twelve months of 30 days, then ጳጉሜ with 5 days (6 in the year before a Western leap year).
   Dates are converted through the Julian day number, so they are exact for any year. */
const ET_EPOCH = 1724221;   // Julian day number of መስከረም 1, year 1
const gToJdn = (y, m, d) => { const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; };
function jdnToG(j){
  const a = j + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor(146097 * b / 4),
        d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * d / 4), m = Math.floor((5 * e + 2) / 153);
  return [100 * b + d - 4800 + Math.floor(m / 10), m + 3 - 12 * Math.floor(m / 10), e - Math.floor((153 * m + 2) / 5) + 1];
}
const eToJdn = (y, m, d) => ET_EPOCH + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1;
function jdnToE(j){
  const k = j - ET_EPOCH + 365, r = ((k % 1461) + 1461) % 1461, n = r % 365 + 365 * Math.floor(r / 1460);
  return [4 * Math.floor(k / 1461) + Math.floor(r / 365) - Math.floor(r / 1460), Math.floor(n / 30) + 1, n % 30 + 1];
}
const gToE = (y, m, d) => jdnToE(gToJdn(y, m, d));
const eToG = (y, m, d) => jdnToG(eToJdn(y, m, d));
const weekday = j => (j + 1) % 7;   // 0 = Sunday
const etMonthDays = (y, m) => m < 13 ? 30 : (y % 4 === 3 ? 6 : 5);
const G_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const gStr = (y, m, d, noYear) => `${d} ${G_MONTHS[m-1]}${noYear ? "" : " " + y}`;
const gShort = (m, d) => `${d} ${G_MONTHS[m-1].slice(0,3)}`;
const eStr = (y, m, d) => `${EV.months[m-1][0]} ${d}${y ? ", " + y : ""}`;
const eRom = (y, m, d) => `${EV.months[m-1][1]} ${d}${y ? ", " + y : ""}`;
const todayJdn = () => { const t = new Date(); return gToJdn(t.getFullYear(), t.getMonth() + 1, t.getDate()); };
// How a date is said: month, then the day as a number word (the year, if wanted, in words too)
const eSaid = (y, m, d) => [EV.months[m-1][0], numWord(d)[0]].concat(y ? [numWord(y)[0]] : []);
const eSaidRom = (y, m, d) => [EV.months[m-1][1], numWord(d)[1]].concat(y ? [numWord(y)[1]] : []).join(" ");

/* ----- the Ethiopian clock -----
   The day starts at sunrise, so 7 in the morning is "one o'clock". Ethiopian hour = Western hour - 6
   (on a 12-hour clock). Times here are on the hour, quarter past, half past or quarter to. */
const DR_MINS = [0, 15, 30, 45];
const etHour = h => ((h + 5) % 12) + 1;                       // Western hour 0-23 -> Ethiopian 1-12
const dayPart = h => EV.parts.find(p => h >= p[3] && h <= p[4]);
const wTime = (h, m) => `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h < 12 ? "am" : "pm"}`;
const eClock = (h, m) => `${etHour(h)}:${String(m).padStart(2,"0")}`;
// The Amharic for a time: [pieces to say], transcription. "Quarter to" names the coming hour.
function etTime(h, m){
  const p = dayPart(h), eh = etHour(m === 45 ? (h + 1) % 24 : h) - 1;
  const main = m === 45 ? EV.qto[eh] : EV.hours[eh];
  const tail = m === 30 ? EV.half : m === 15 ? EV.quarter : null;
  return { parts: [p[0], main[0]].concat(tail ? [tail[0]] : []), rom: [p[1], main[1]].concat(tail ? [tail[1]] : []).join(" "), part: p };
}
const etSay = (h, m) => etTime(h, m).parts.join(" ");
// The same words, but with the Western number (the mistake to avoid): 9 am said as "ዘጠኝ ሰዓት"
function etWrongNumber(h, m){
  const p = dayPart(h), wh = (h % 12 || 12) - 1;
  if(wh === etHour(h) - 1 || m === 45) return null;
  const tail = m === 30 ? EV.half : m === 15 ? EV.quarter : null;
  return { l: [p[0], EV.hours[wh][0]].concat(tail ? [tail[0]] : []).join(" "), r: [p[1], EV.hours[wh][1]].concat(tail ? [tail[1]] : []).join(" ") };
}
// A small clock face. The hour numbers are the Western ones; the Ethiopian ones are the same marks read 6 hours on.
function clockSVG(h, m, size){
  size = size || 120;
  const hr = ((h % 12) + m / 60) * 30, mn = m * 6, nums = [];
  for(let i = 1; i <= 12; i++){ const a = i * 30 * Math.PI / 180; nums.push(`<text x="${50 + 37 * Math.sin(a)}" y="${50 - 37 * Math.cos(a) + 4}">${i}</text>`); }
  return `<svg class="clock" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${wTime(h, m)}"><circle cx="50" cy="50" r="47"/>${nums.join("")}
    <line class="hh" x1="50" y1="50" x2="${50 + 24 * Math.sin(hr * Math.PI / 180)}" y2="${50 - 24 * Math.cos(hr * Math.PI / 180)}"/>
    <line class="mh" x1="50" y1="50" x2="${50 + 33 * Math.sin(mn * Math.PI / 180)}" y2="${50 - 33 * Math.cos(mn * Math.PI / 180)}"/><circle class="pin" cx="50" cy="50" r="3"/></svg>`;
}

/* ----- prices ----- */
const priceRound = n => n >= 1000 ? Math.round(n / 100) * 100 : n >= 300 ? Math.round(n / 50) * 50 : Math.round(n / 5) * 5;
function priceFor(item){ const lo = item[3], hi = item[4]; return priceRound(lo + Math.random() * (hi - lo)); }
// The Amharic for a price: number word + ብር, then (for cents) ከ… ሳንቲም
function priceSay(n, c){
  const w = numWord(n), ct = c ? EV.cents.find(x => x[0] === c) : null;
  return { parts: [w[0], EV.birr[0]].concat(ct ? [ct[1]] : []), rom: [w[1], EV.birr[1]].concat(ct ? [ct[2]] : []).join(" ") };
}
const priceStr = (n, c) => n.toLocaleString("en") + (c ? "." + c : "") + " birr";
function priceNear(n, c){
  const d = String(n), out = [[n + 5, c], [n - 5, c], [n + 10, c], [n - 10, c], [n * 10, c], [Math.round(n / 10) || 1, c], [+d.split("").reverse().join(""), c], [n, c ? 0 : 50], [n, c === 25 ? 75 : 25], [n + 100, c]];
  if(n >= 100) out.push([n + 50, c], [n - 50, c], [n * 2, c]);
  return out.filter(([x, y]) => x > 0 && x <= 9999 && !(x === n && y === c));
}

/* ----- playing a phrase made of pieces -----
   A time or price has no clip of its own, so its pieces are played one after another. A piece with no
   clip is split into words; anything still without a clip is spoken by the browser, if it can. */
function drPieces(parts){
  const out = [];
  parts.forEach(p => { if(clipFor(p) || !/\s/.test(p)) out.push(p); else out.push(...drPieces(p.split(/\s+/))); });
  return out;
}
const drCanSay = parts => !!amVoice || drPieces(parts).every(p => clipFor(p));
let drTok = 0;
function drPlay(parts){
  const list = drPieces(parts).filter(p => clipFor(p) || amVoice), tok = ++drTok;
  if(!list.length) return;
  let i = 0;
  const next = () => { if(tok !== drTok || i >= list.length) return; playAm(list[i++], null, null, next); };
  next();
}
const drSayBtn = (parts, label) => parts && drCanSay(parts)
  ? `<button class="say ${label ? "drsay" : ""}" data-act="dr-say" data-v="${esc(parts.join("|"))}" aria-label="Listen" title="Listen">▶${label ? " " + esc(label) : ""}</button>` : "";

/* ----- questions ----- */
const drQ = (q, parts, ansParts, bigRom) => Object.assign(q, { parts: parts || null, ansParts: ansParts || null, bigRom: bigRom || null });
// 1. Read the time: Western time to Amharic, or Amharic to Western time
function qTime(){
  const h = ri(24), m = pick(DR_MINS), t = etTime(h, m), said = t.parts.join(" ");
  const alt = [], add = (hh, mm) => { hh = (hh + 24) % 24; const x = etTime(hh, mm); if(x.parts.join(" ") !== said) alt.push({ h: hh, m: mm, l: x.parts.join(" "), r: x.rom }); };
  [1, -1, 6, -6, 12, 2].forEach(d => add(h + d, m)); DR_MINS.forEach(mm => add(h, mm));
  const wrongNum = etWrongNumber(h, m);
  if(ri(2)){
    const wr = (wrongNum ? [wrongNum, wrongNum] : []).concat(alt);
    return Object.assign(drQ(mk("Telling the time", wTime(h, m), false, "How do you say this time in Amharic?", { l: said, r: t.rom }, wr, true), null, t.parts), { clock: [h, m] });
  }
  const wr = [6, -6, 1, -1, 12].map(d => ({ l: wTime((h + d + 24) % 24, m) })).concat(DR_MINS.filter(x => x !== m).map(x => ({ l: wTime(h, x) })));
  return drQ(mk("Telling the time", said, true, "What time is this on a Western clock?", { l: wTime(h, m) }, wr, false), t.parts, null, t.rom);
}
// 2. Two clocks: convert between the Western and the Ethiopian clock face
function qClock(){
  const h = ri(24), m = pick(DR_MINS), p = dayPart(h), e = eClock(h, m);
  if(ri(2)){
    const wr = [wTime(h, m).replace(/ [ap]m/, ""), eClock((h + 1) % 24, m), eClock((h + 23) % 24, m), eClock(h, (m + 30) % 60), eClock((h + 2) % 24, m)].map(l => ({ l }));
    return Object.assign(drQ(mk("Two clocks", wTime(h, m), false, "What does an Ethiopian clock say?", { l: e }, wr, false), null, etTime(h, m).parts), { clock: [h, m] });
  }
  const part = p[2], wr = [6, -6, 1, -1, 12].map(d => ({ l: wTime((h + d + 24) % 24, m) }));
  return drQ(mk("Two clocks", `${e} ${part}`, false, "on the Ethiopian clock. What is it on a Western clock?", { l: wTime(h, m) }, wr, false), etTime(h, m).parts, null, etTime(h, m).rom);
}
// 3. Prices: digits to Amharic, Amharic to digits, or "how much is…?"
function qPrice(){
  const it = pick(EV.items), n = priceFor(it), c = n < 100 && !ri(4) ? pick(EV.cents)[0] : 0, ps = priceSay(n, c), said = ps.parts.join(" ");
  const near = priceNear(n, c);
  const r = ri(3);
  if(r === 0) return drQ(mk("Prices", priceStr(n, c), false, "Choose the Amharic", { l: said, r: ps.rom }, near.map(([x, y]) => { const s = priceSay(x, y); return { l: s.parts.join(" "), r: s.rom }; }), true), null, ps.parts);
  if(r === 1) return drQ(mk("Prices", said, true, "How much is that?", { l: priceStr(n, c) }, near.map(([x, y]) => ({ l: priceStr(x, y) })), false), ps.parts, null, ps.rom);
  const line = [it[0], ...ps.parts, "ነው"];
  return drQ(mk("At the shop", line.join(" "), true, `How much is ${it[2]}?`, { l: priceStr(n, c) }, near.map(([x, y]) => ({ l: priceStr(x, y) })), false), line, null, `${it[1]} ${ps.rom} new`);
}
// 4. Shopping phrases
function qShop(){
  const w = pick(EV.shop), others = EV.shop.filter(x => x !== w);
  if(ri(2)) return drQ(mk("Shopping phrases", w[0], true, "What does this mean?", { l: w[2] }, others.map(x => ({ l: x[2] })), false), [w[0]], null, w[1]);
  return drQ(mk("Shopping phrases", w[2], false, "Choose the Amharic", { l: w[0], r: w[1] }, others.map(x => ({ l: x[0], r: x[1] })), true), null, [w[0]]);
}
// 5. Days of the week and the months
function qDays(){
  const r = ri(5);
  if(r < 2){
    const i = ri(7), d = EV.days[i], o = EV.days.filter(x => x !== d);
    if(r === 0) return tag(drQ(mk("Days of the week", d[0], true, "Which day is this?", { l: d[2] }, o.map(x => ({ l: x[2] })), false), [d[0]], null, d[1]), "w:" + d[0]);
    const nx = EV.days[(i + 1) % 7];
    return drQ(mk("Days of the week", d[0], true, "Which day comes next?", { l: nx[0], r: nx[1] }, o.filter(x => x !== nx).map(x => ({ l: x[0], r: x[1] })), true), [d[0]], [nx[0]], d[1]);
  }
  const i = ri(13), mo = EV.months[i], o = EV.months.filter(x => x !== mo);
  if(r === 2){ const nx = EV.months[(i + 1) % 13];
    return drQ(mk("Months", mo[0], true, "Which month comes next?", { l: nx[0], r: nx[1] }, o.filter(x => x !== nx).map(x => ({ l: x[0], r: x[1] })), true), [mo[0]], [nx[0]], mo[1]); }
  const ord = n => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
  if(r === 3) return drQ(mk("Months", `The ${ord(i + 1)} month`, false, "of the Ethiopian year is…", { l: mo[0], r: mo[1] }, o.map(x => ({ l: x[0], r: x[1] })), true), null, [mo[0]]);
  // roughly when in the Western year
  const y = jdnToE(todayJdn())[0], span = m => { const [, gm, gd] = eToG(y, m + 1, 1), [, em, ed] = eToG(y, m + 1, etMonthDays(y, m + 1)); return `${gShort(gm, gd)} – ${gShort(em, ed)}`; };
  return drQ(mk("Months", mo[0], true, "When is this month in the Western calendar?", { l: span(i) }, EV.months.map((_, k) => k).filter(k => k !== i).map(k => ({ l: span(k) })), false), [mo[0]], null, mo[1]);
}
// 6. Ethiopian dates: convert either way, the year, or the date of a holiday
function qDate(){
  const tj = todayJdn(), r = ri(7);
  if(r === 0){
    const hd = pick(EV.holidays), o = EV.holidays.filter(x => x !== hd);
    const wr = o.map(x => ({ l: eStr(0, x[3], x[4]), r: eRom(0, x[3], x[4]) })).concat([{ l: eStr(0, hd[3], hd[4] + 10 > 30 ? hd[4] - 10 : hd[4] + 10) }, { l: eStr(0, hd[3] % 13 + 1, hd[4]) }]);
    return drQ(mk("Holidays", `${hd[0]}`, true, `${hd[2]}: when is it?`, { l: eStr(0, hd[3], hd[4]), r: eRom(0, hd[3], hd[4]) }, wr, true), [hd[0]], eSaid(0, hd[3], hd[4]), hd[1]);
  }
  if(r === 1){
    const [ey] = jdnToE(tj), [gy] = jdnToG(tj);
    return drQ(mk("The Ethiopian year", `${G_MONTHS[jdnToG(tj)[1]-1]} ${gy}`, false, "What year is it in Ethiopia?", { l: String(ey) }, [ey + 1, ey - 1, ey + 8, gy - 6, gy + 7].map(x => ({ l: String(x) })), false), null, [numWord(ey)[0]]);
  }
  const j = tj - 400 + ri(800), [y, m, d] = jdnToE(j), [gy, gm, gd] = jdnToG(j);
  const nearE = [[y, m % 13 + 1, d], [y, m === 1 ? 12 : m - 1, d], [y + 1, m, d], [y - 1, m, d], [y, m, d <= 20 ? d + 10 : d - 10]].filter(([a, b, c]) => c <= etMonthDays(a, b));
  if(r <= 3) return drQ(mk("Ethiopian dates", gStr(gy, gm, gd), false, "What is this date in the Ethiopian calendar?", { l: eStr(y, m, d), r: eRom(y, m, d) }, nearE.map(([a, b, c]) => ({ l: eStr(a, b, c), r: eRom(a, b, c) })), true), null, eSaid(0, m, d));
  const nearG = nearE.map(([a, b, c]) => { const g = eToG(a, b, c); return { l: gStr(g[0], g[1], g[2]) }; });
  return drQ(mk("Ethiopian dates", eStr(y, m, d), true, "What is this date in the Western calendar?", { l: gStr(gy, gm, gd) }, nearG, false), eSaid(0, m, d), null, eSaidRom(0, m, d));
}
const DR_TESTS = {
  "dr-time":  ["Telling the time", "Say times the Ethiopian way, and understand them when you hear them", qTime],
  "dr-clock": ["Two clocks", "Change between the Western and the Ethiopian clock", qClock],
  "dr-price": ["Prices", "Say and understand prices in birr", qPrice],
  "dr-shop":  ["Shopping phrases", "Ask the price, bargain and pay", qShop],
  "dr-days":  ["Days and months", "The days of the week and the 13 Ethiopian months", qDays],
  "dr-date":  ["Ethiopian dates", "Change dates between the calendars, and know the holidays", qDate]
};
function drTopic(id){ const t = DR_TESTS[id]; return t && { name: t[0], desc: t[1], gen: t[2] }; }

/* ----- the explanation pages ----- */
const DR_TABS = [["time", "Time"], ["money", "Money"], ["dates", "Dates"]];
const drState = () => S.dr || (S.dr = { tab: "time", h: null, m: 0, date: "", seed: 1 });
// a line of Amharic with its transcription and a play button for the whole phrase
const drLine = (parts, rom, cls) => `<span class="drline ${cls || ""}"><span class="am nosay norom-auto">${esc(parts.join(" "))}</span>${drSayBtn(parts)}${rom ? `<span class="rom">${esc(rom)}</span>` : ""}</span>`;
const drWords = list => wordList(list.map(w => [w[0], w[1], w[2]]), true);

function drTimePage(){
  const D = drState(); if(D.h === null){ const t = new Date(); D.h = t.getHours(); D.m = DR_MINS[Math.floor(t.getMinutes() / 15)]; }
  const t = etTime(D.h, D.m);
  const rows = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(w => {
    return `<div class="row drrow"><span>${w} am · ${w} pm</span><span class="form">${drLine([EV.hours[etHour(w) - 1][0]], EV.hours[etHour(w) - 1][1])}</span><span class="en">${etHour(w)} o'clock</span></div>`; }).join("");
  return `<div class="note"><h4>Two ways to tell the time</h4>
      <p>Ethiopians usually count the hours from sunrise, not from midnight. The first hour of daylight, 7 in the morning, is {አንድ ሰዓት|and se'at} “one o'clock”. Noon is {ስድስት ሰዓት|siddist se'at} “six o'clock”, and 6 in the evening is {አሥራ ሁለት ሰዓት|asra hulett se'at} “twelve o'clock”. Then the night hours start again from one.</p>
      <p><b>The rule:</b> take 6 off the Western time (or add 6, it comes to the same on a 12-hour clock). 9 am is 3 o'clock, 2 pm is 8 o'clock, 8 pm is 2 o'clock.</p>
      <p>A watch looks the same. You just read the hour from the opposite side of the face. Phones, flights and offices may use the Western clock, so if a time sounds odd, ask {በኢትዮጵያ ሰዓት?|be'ityop'ya se'at?} “by Ethiopian time?” or {በፈረንጅ ሰዓት?|beferenj se'at?} “by Western time?”</p></div>
    <div class="note drtry"><h4>Try any time</h4>
      <div class="drpick"><select id="dr-h" class="sel" aria-label="Hour">${Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${h === D.h ? "selected" : ""}>${h % 12 || 12} ${h < 12 ? "am" : "pm"}</option>`).join("")}</select>
      <select id="dr-m" class="sel" aria-label="Minutes">${DR_MINS.map(m => `<option value="${m}" ${m === D.m ? "selected" : ""}>:${String(m).padStart(2, "0")}</option>`).join("")}</select>
      <button class="link" data-act="dr-now">Now</button></div>
      <div class="drclock">${clockSVG(D.h, D.m, 112)}<div><p class="count">${wTime(D.h, D.m)} on a Western clock is</p><p class="drbig norom-auto">${eClock(D.h, D.m)} <small>on an Ethiopian clock</small></p>${drLine(t.parts, t.rom, "big")}${glossHTML(t.parts.join(" "), t.rom)}</div></div></div>
    <div class="note"><h4>Morning, afternoon, evening, night</h4><p>Because the same hour comes round twice, say which part of the day you mean, before the hour:</p>
      <p>{ጠዋት|t'ewat} morning (about 6 am to noon) · {ቀን|qen} the middle of the day · {ከሰዓት በኋላ|kese'at behwala} afternoon (“after the hour”, noon to 6 pm) · {ማታ|mata} evening (6 pm to midnight) · {ሌሊት|lélit} night (midnight to 6 am).</p>
      <p>{ጠዋት ሦስት ሰዓት|t'ewat sost se'at} is 9 am, {ከሰዓት በኋላ ስምንት ሰዓት|kese'at behwala simmint se'at} is 2 pm, {ማታ ሁለት ሰዓት|mata hulett se'at} is 8 pm.</p></div>
    <div class="note"><h4>Half past, quarter past, quarter to</h4>
      <p>{ተኩል|tekul} half past: {ሦስት ሰዓት ተኩል|sost se'at tekul} 3:30 (9:30 am). {ከሩብ|kerub} quarter past: {ሦስት ሰዓት ከሩብ|sost se'at kerub} 3:15.</p>
      <p>For a quarter to, name the coming hour with {ለ-|le-} “for” and add {ሩብ ጉዳይ|rub gudday} “a quarter short”: {ለአራት ሩብ ጉዳይ|le'aratt rub gudday} is a quarter to four, 3:45 (9:45 am).</p>
      <p>Other minutes use {ደቂቃ|deqiqa} “minute”: {ሦስት ሰዓት ከአሥር ደቂቃ|sost se'at ke'assir deqiqa} “ten past three”.</p></div>
    <h3>Every hour on both clocks</h3><div class="tbl wl2">${rows}</div>
    <h3>Useful words</h3>${drWords(EV.timeWords)}`;
}
function drMoneyPage(){
  const D = drState(), rnd = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(D.seed * 7919);
  const board = EV.items.map(it => { const n = priceRound(it[3] + rnd() * (it[4] - it[3])), ps = priceSay(n, 0);
    return `<div class="row drprice"><span class="form">${drLine([it[0]], it[1])}<small class="en">${esc(it[2])}</small></span><span class="drp">${priceStr(n, 0)}</span>${drLine(ps.parts, ps.rom)}</div>`; }).join("");
  return `<div class="note"><h4>Birr and santim</h4>
      <p>Ethiopian money is the {ብር|birr}. A birr has 100 {ሳንቲም|santim}. Say the number, then {ብር|birr}: {ሃምሳ ብር|hamsa birr} 50 birr, {መቶ ሃያ ብር|meto haya birr} 120 birr.</p>
      <p>For birr and santim, join the santim on with {ከ-|ke-}: {አሥር ብር ከሃምሳ ሳንቲም|assir birr kehamsa santim} 10.50 birr. Santim are rare in shops now, but you will see them on bills.</p>
      <p>Prices on this page are only examples; they change quickly. The number words are on the Numbers tab.</p></div>
    <div class="note"><h4>Asking and bargaining</h4>
      <p>{ስንት ነው?|sint new?} “how much is it?” The answer is usually just the price and {ነው|new} “it is”: {ቡና ሠላሳ ብር ነው|buna selasa birr new} “coffee is 30 birr”.</p>
      <p>In a market it is normal to bargain. {ውድ ነው|wid new} “it's expensive”, then {ቀንሱልኝ|qenisullign} “bring it down for me”. In shops and cafés the price is usually fixed.</p></div>
    <div class="bar"><h3 style="margin:0">Price board</h3><button class="link" data-act="dr-reprice">New prices</button></div>
    <div class="tbl drboard">${board}</div>
    <h3>Shopping phrases</h3>${drWords(EV.shop)}`;
}
function drDatesPage(){
  const D = drState(), tj = todayJdn(), [ey, em, ed] = jdnToE(tj), wd = EV.days[weekday(tj)];
  const said = [wd[0]].concat(eSaid(0, em, ed));
  let conv = "";
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(D.date || "");
  if(m){ const j = gToJdn(+m[1], +m[2], +m[3]), [y, mo, d] = jdnToE(j), w = EV.days[weekday(j)];
    conv = `<p class="drbig norom-auto">${esc(eStr(0, mo, d))} <small>${y} ዓ.ም.</small></p>${drLine([w[0]].concat(eSaid(0, mo, d)), w[1] + " " + eSaidRom(0, mo, d))}${glossHTML([w[0]].concat(eSaid(0, mo, d)).join(" "), w[1] + " " + eSaidRom(0, mo, d))}`; }
  const months = EV.months.map((mo, i) => { const [, gm, gd] = eToG(ey, i + 1, 1);
    return `<div class="row drrow"><span class="lnum">${i + 1}</span><span class="form">${drLine([mo[0]], mo[1])}</span><span class="en">from ${gShort(gm, gd)}${i === 12 ? ` · ${etMonthDays(ey, 13)} days` : ""}</span></div>`; }).join("");
  const hols = EV.holidays.map(hd => { const g = eToG(ey, hd[3], hd[4]);
    return `<div class="row drhol"><span class="form">${drLine([hd[0]], hd[1])}<small class="en">${esc(hd[2])}</small></span><span class="en">${drLine(eSaid(0, hd[3], hd[4]), eSaidRom(0, hd[3], hd[4]))}<small>${gShort(g[1], g[2])}</small></span></div>`; }).join("");
  return `<div class="note drtoday"><h4>Today</h4><p class="count">${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} is</p>
      <p class="drbig norom-auto">${esc(wd[0])}፣ ${esc(eStr(0, em, ed))} <small>${ey} ዓ.ም.</small></p>${drLine(said, wd[1] + " " + eSaidRom(0, em, ed))}${glossHTML(said.join(" "), wd[1] + " " + eSaidRom(0, em, ed))}</div>
    <div class="note"><h4>Thirteen months of sunshine</h4>
      <p>Ethiopia has its own calendar. Twelve months have exactly 30 days, and a thirteenth month, {ጳጉሜ|p'agumé}, has 5 days (6 every fourth year).</p>
      <p>The year starts on {መስከረም|meskerem} 1, which is 11 September (12 September in the year before a Western leap year). The Ethiopian year number is 7 or 8 behind the Western one: 8 behind until New Year in September, then 7. Write {ዓ.ም.|amete mihret} after an Ethiopian year.</p>
      <p>Say the month, then the day: {ኅዳር አሥራ ሦስት|hidar asra sost} “Hidar 13”. {ዛሬ ስንት ነው?|zaré sint new?} asks “what's the date today?”</p></div>
    <div class="note drtry"><h4>Change a date</h4><div class="drpick"><input id="dr-date" class="sel" type="date" value="${esc(D.date || "")}" aria-label="A Western date"></div>${conv || `<p class="count">Pick a Western date to see it in the Ethiopian calendar.</p>`}</div>
    <h3>The months this year (${ey} <span class="norom-auto">ዓ.ም.</span>)</h3><div class="tbl wl2">${months}</div>
    <h3>Days of the week</h3>${drWords(EV.days)}
    <h3>Holidays with a fixed date</h3><div class="tbl wl2">${hols}</div>
    <h3>Useful words</h3>${drWords(EV.dateWords)}`;
}
const DR_PAGE_TESTS = { time: ["dr-time", "dr-clock"], money: ["dr-price", "dr-shop"], dates: ["dr-days", "dr-date"] };
function drMenu(){
  const D = drState();
  const body = D.tab === "money" ? drMoneyPage() : D.tab === "dates" ? drDatesPage() : drTimePage();
  return `<div class="bar">${mini("dr-tab", DR_TABS, D.tab)}${glossBtn()}</div>
    <h3>Test yourself</h3>${tStack(DR_PAGE_TESTS[D.tab])}${fmtNotes(body)}`;
}
// notes above write Amharic examples as {fidel|transcription}, like the course
const fmtNotes = h => h.replace(/\{([^|}]+)\|([^}]*)\}/g, (_, a, r) => /^[\u1200-\u137F\s፣።?]+$/.test(a) && drCanSay([a.replace(/[?።፣]/g, "")])
  ? `<span class="am nosay">${a}</span>${drSayBtn([a.replace(/[?።፣]/g, "")])} <span class="rom">${r}</span>` : `<span class="am">${a}</span> <span class="rom">${r}</span>`);

// clicks and changes from these pages; returns true when it has drawn the screen itself
function drAct(a, v){
  const D = drState();
  if(a === "dr-say"){ drPlay(String(v).split("|")); return true; }
  if(a === "dr-tab"){ D.tab = v; return false; }
  if(a === "dr-now"){ const t = new Date(); D.h = t.getHours(); D.m = DR_MINS[Math.floor(t.getMinutes() / 15)]; return false; }
  if(a === "dr-reprice"){ D.seed++; return false; }
  return false;
}
function drChange(id, val){
  const D = drState();
  if(id === "dr-h") D.h = +val;
  else if(id === "dr-m") D.m = +val;
  else if(id === "dr-date") D.date = val;
}
