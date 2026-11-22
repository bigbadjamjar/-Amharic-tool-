/* ---------- games ----------
   Three quick games on the Test tab, made from the app's own words and letters:
   matching pairs (face up, or face down as a memory game), a 60-second speed round, and fidel bingo.
   Settings and best scores are saved per profile as `games` (see applyData / profileData in app.js).
   Uses app.js helpers (S, esc, pick, ri, shuffle, mk, mini, render, numWord, LMAP, FULL, FID, CAN,
   qFidRec, qNumWord, qWord, playAm, clipFor, save) at call time. */
const GM_DEF = () => ({ src: "words", upto: 0, style: "match", level: "easy", how: "both", best: {} });
const GM_SRC = [["words", "Words"], ["letters", "Letters"], ["numbers", "Numbers"], ["everyday", "Everyday"]];
function gmClean(d){
  const g = GM_DEF(); if(!d || typeof d !== "object") return g;
  if(GM_SRC.some(x => x[0] === d.src)) g.src = d.src;
  if(typeof d.upto === "number") g.upto = d.upto;
  if(d.style === "memory") g.style = "memory";
  if(["easy", "mixed", "hard"].includes(d.level)) g.level = d.level;
  if(["both", "hear", "read"].includes(d.how)) g.how = d.how;
  if(d.best && typeof d.best === "object") Object.keys(d.best).forEach(k => { if(typeof d.best[k] === "number") g.best[k] = d.best[k]; });
  return g;
}
let G = null;            // the game being played
let gmTimer = null;
const gmStop = () => { if(gmTimer){ clearInterval(gmTimer); gmTimer = null; } G = null; };
const gmHere = g => G === g && S.mode === "test" && !S.quiz;

/* ----- what the games are made of: pairs of {a: Amharic, r: transcription, e: meaning or sound} ----- */
function gmItems(src){
  const out = [], seen = new Set(), add = (a, r, e) => { if(!a || !e || seen.has(a) || seen.has("e:" + e)) return; seen.add(a); seen.add("e:" + e); out.push({ a, r: r || "", e }); };
  if(src === "letters") FID.filter(f => f.snd && f.ord < 7).forEach(f => { if(!seen.has("k:" + CAN[f.ch])){ seen.add("k:" + CAN[f.ch]); add(f.ch, "", f.snd); } });
  else if(src === "numbers") [1,2,3,4,5,6,7,8,9,10,11,12,15,20,25,30,40,50,60,70,80,90,100,1000].forEach(n => { const w = numWord(n); add(w[0], w[1], n.toLocaleString("en")); });
  else if(src === "everyday") [EV.days, EV.shop, EV.timeWords, EV.dateWords].forEach(l => l.forEach(w => add(w[0], w[1], w[2])));
  else FULL.filter(n => !S.gm.upto || n <= S.gm.upto).forEach(n => (LMAP[n].vocab || []).forEach(w => { if(w[2].length <= 26 && !/name\)|…/.test(w[2]) && !/[…\-]/.test(w[0])) add(w[0], w[1], w[2].replace(/\s*\([^)]*\)$/, "")); }));
  return out;
}
const gmSrcName = () => (GM_SRC.find(x => x[0] === S.gm.src) || GM_SRC[0])[1] + (S.gm.src === "words" && S.gm.upto ? ", units 1 to " + S.gm.upto : "");
const gmFmt = s => s >= 60 ? Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") : s + "s";
const gmSay = a => { if(clipFor(a)) playAm(a); };

/* ----- 1. matching pairs ----- */
function gmPairsStart(){
  const n = S.gm.style === "memory" ? 8 : 6, items = shuffle(gmItems(S.gm.src)).slice(0, n);
  if(items.length < 4) return null;
  const cards = shuffle(items.flatMap((x, i) => [{ p: i, side: "a", t: x.a, r: x.r }, { p: i, side: "e", t: x.e }]));
  const g = { kind: "pairs", style: S.gm.style, items, cards, left: shuffle(items.map((_, i) => i)), right: shuffle(items.map((_, i) => i)),
    sel: null, open: [], done: new Set(), wrong: null, misses: 0, t0: Date.now(), t1: 0, lock: false, key: "pairs-" + S.gm.src + "-" + S.gm.style };
  gmPairsClock(g);
  return g;
}
function gmPairsClock(g){
  gmTimer = setInterval(() => { if(!gmHere(g) || g.t1){ clearInterval(gmTimer); gmTimer = null; return; } const el = document.getElementById("gm-clock"); if(el) el.textContent = gmFmt(Math.floor((Date.now() - g.t0) / 1000)); }, 500);
}
function gmPairsTap(v){
  const g = G; if(g.t1 || g.lock) return;
  if(g.style === "memory"){
    const i = +v, c = g.cards[i]; if(g.done.has(c.p) || g.open.includes(i)) return;
    g.open.push(i); if(c.side === "a") gmSay(c.t);
    if(g.open.length < 2) return;
    const [x, y] = g.open.map(k => g.cards[k]);
    if(x.p === y.p && x.side !== y.side){ g.done.add(x.p); g.open = []; }
    else { g.misses++; g.lock = true; setTimeout(() => { if(G !== g) return; g.open = []; g.lock = false; render(); }, 900); }
  } else {
    // face up: one from each column. Tapping the same column again just changes your choice.
    const [side, p] = v.split(":"), k = +p; if(g.done.has(k)) return;
    if(side === "a") gmSay(g.items[k].a);
    if(!g.sel || g.sel[0] === side){ g.sel = [side, k]; g.wrong = null; return; }
    if(g.sel[1] === k){ g.done.add(k); g.sel = null; g.wrong = null; }
    else { g.misses++; g.wrong = [g.sel, [side, k]]; g.sel = null; setTimeout(() => { if(G === g && g.wrong){ g.wrong = null; render(); } }, 700); }
  }
  if(g.done.size === g.items.length){ g.t1 = Date.now(); const s = Math.max(1, Math.round((g.t1 - g.t0) / 1000)); g.secs = s;
    const b = S.gm.best[g.key]; g.record = b == null || s < b; if(g.record){ S.gm.best[g.key] = s; } srsActivity(S.srs); save(); }
}
function gmPairsHTML(g){
  const head = `<div class="gmhead"><span class="count">${g.done.size} of ${g.items.length} pairs · ${g.misses} ${g.misses === 1 ? "miss" : "misses"}</span><span class="gmclock" id="gm-clock">${gmFmt(Math.floor(((g.t1 || Date.now()) - g.t0) / 1000))}</span></div>`;
  if(g.t1) return gmEnd(g, `${gmFmt(g.secs)}`, g.misses ? `with ${g.misses} ${g.misses === 1 ? "miss" : "misses"}` : "with no misses", g.record ? "A new best time!" : `Best: ${gmFmt(S.gm.best[g.key])}`,
    `<div class="tbl wl2">${g.items.map(x => `<div class="row vrow"><span class="form">${drLine([x.a], x.r)}</span><span class="en">${esc(x.e)}</span></div>`).join("")}</div>`);
  if(g.style === "memory"){
    return head + `<div class="gmgrid mem">` + g.cards.map((c, i) => { const up = g.done.has(c.p) || g.open.includes(i), bad = g.lock && g.open.includes(i);
      return `<button class="gmcard ${up ? "up" : ""} ${g.done.has(c.p) ? "ok" : ""} ${bad ? "no" : ""} ${c.side === "a" ? "isam" : ""}" data-act="gm-tap" data-v="${i}" aria-label="${up ? esc(c.t) : "Hidden card"}">${up ? (c.side === "a" ? `<span class="am norom-auto">${esc(c.t)}</span>${romTag(c.r)}` : `<span>${esc(c.t)}</span>`) : `<span class="gmback norom-auto" aria-hidden="true">ፊ</span>`}</button>`; }).join("") + `</div>
      <p class="count gmhelp">Turn over two cards. Find each Amharic word and its meaning.</p>`;
  }
  const cell = (side, k) => { const x = g.items[k], on = g.sel && g.sel[0] === side && g.sel[1] === k, bad = g.wrong && g.wrong.some(w => w[0] === side && w[1] === k), ok = g.done.has(k);
    return `<button class="gmcard up ${side === "a" ? "isam" : ""} ${on ? "on" : ""} ${bad ? "no" : ""} ${ok ? "ok gone" : ""}" data-act="gm-tap" data-v="${side}:${k}" ${ok ? "disabled" : ""}>${side === "a" ? `<span class="am norom-auto">${esc(x.a)}</span>${romTag(x.r)}` : `<span>${esc(x.e)}</span>`}</button>`; };
  return head + `<div class="gmgrid cols">${g.left.map((k, i) => cell("a", k) + cell("e", g.right[i])).join("")}</div>
    <p class="count gmhelp">Tap an Amharic word, then its meaning.</p>`;
}

/* ----- 2. speed round: as many right as you can in 60 seconds ----- */
const GM_SECS = 60;
function gmSpeedQ(){
  const src = S.gm.src;
  if(src === "letters") return qFidRec();
  if(src === "numbers") return qNumWord(100);
  const pool = gmItems(src).map(x => [x.a, x.r, x.e]);
  return qWord(pool, src === "everyday" ? "Everyday" : "Words", pool);
}
function gmSpeedStart(){
  if(gmItems(S.gm.src).length < 4) return null;
  const g = { kind: "speed", end: Date.now() + GM_SECS * 1000, q: gmSpeedQ(), score: 0, n: 0, picked: null, missed: [], key: "speed-" + S.gm.src };
  gmTimer = setInterval(() => {
    if(!gmHere(g)){ clearInterval(gmTimer); gmTimer = null; if(G === g && !g.over) g.over = "left"; return; }
    const left = Math.max(0, g.end - Date.now()), el = document.getElementById("gm-left"), bar = document.getElementById("gm-bar");
    if(el) el.textContent = Math.ceil(left / 1000) + "s";
    if(bar) bar.style.width = (left / (GM_SECS * 10)) + "%";
    if(!left){ clearInterval(gmTimer); gmTimer = null; gmSpeedOver(g); render(); }
  }, 150);
  return g;
}
function gmSpeedOver(g){
  if(g.over) return; g.over = "time";
  const b = S.gm.best[g.key]; g.record = g.score > 0 && (b == null || g.score > b); if(g.record) S.gm.best[g.key] = g.score;
  if(g.n) srsActivity(S.srs); save();
}
function gmSpeedPick(v){
  const g = G; if(g.over || g.picked !== null) return;
  if(Date.now() >= g.end){ gmSpeedOver(g); return; }
  const j = +v, q = g.q; g.n++;
  if(j === q.ans){ g.score++; g.q = gmSpeedQ(); g.flash = "good"; setTimeout(() => { if(G === g && g.flash === "good"){ g.flash = null; const s = document.querySelector(".gmscore"); if(s) s.classList.remove("good"); } }, 300); return; }
  g.picked = j; g.flash = "bad"; g.missed.push(q);
  setTimeout(() => { if(G !== g) return; g.picked = null; g.flash = null; if(!g.over) g.q = gmSpeedQ(); render(); }, 1100);
}
function gmSpeedHTML(g){
  if(g.over === "left") return `<div class="score"><div class="count">Speed round</div><p>The round stopped when you left the page.</p></div><div class="stack"><button class="btn primary wide" data-act="gm-start" data-v="speed">Start again</button><button class="btn wide" data-act="gm-quit">All games</button></div>`;
  if(g.over) return gmEnd(g, String(g.score), `right in ${GM_SECS} seconds` + (g.n > g.score ? `, ${g.n - g.score} wrong` : ""), g.record ? "A new best score!" : S.gm.best[g.key] != null ? `Best: ${S.gm.best[g.key]}` : "",
    g.missed.length ? `<h3>To look at again</h3><div class="tbl">${g.missed.map(q => `<div class="miss">${q.bigAm ? drLine([q.big], "") : esc(q.big)} → ${q.optAm ? drLine([q.opts[q.ans].l], q.opts[q.ans].r) : `<b>${esc(q.opts[q.ans].l)}</b>`}</div>`).join("")}</div>` : "");
  const q = g.q, left = Math.max(0, g.end - Date.now());
  return `<div class="gmhead"><span class="gmscore ${g.flash === "good" ? "good" : ""}"><strong>${g.score}</strong> right</span><span class="gmclock" id="gm-left">${Math.ceil(left / 1000)}s</span></div>
    <div class="prog gmprog"><i id="gm-bar" style="width:${left / (GM_SECS * 10)}%"></i></div>
    <div class="q gmq"><div class="big ${q.bigAm ? "am" : ""} nosay">${esc(q.big)}</div>${q.bigAm && !qNoRom(q) && tRom(q.big) ? `<div class="rom bigrom">${esc(tRom(q.big))}</div>` : ""}<div class="sub">${esc(q.sub)}</div></div>
    <div class="gmopts">${q.opts.map((o, j) => { const cls = g.picked !== null ? (j === q.ans ? " right" : j === g.picked ? " wrong" : "") : "";
      return `<button class="opt${cls}" data-act="gm-pick" data-v="${j}" ${g.picked !== null ? "disabled" : ""}>${q.optAm ? `<span class="am">${esc(o.l)}</span>` + ((g.picked !== null || !qNoRom(q)) && o.r ? `<span class="rom">${esc(o.r)}</span>` : "") : `<span>${esc(o.l)}</span>`}</button>`; }).join("")}</div>`;
}

/* ----- 3. fidel bingo -----
   A card of 16 letters, all with different sounds. A letter is called (heard, read, or both): tap it if it's
   on your card, or press "Not on my card". A full row, column or diagonal is bingo. */
const GM_LEVELS = [["easy", "Easy"], ["mixed", "Mixed"], ["hard", "Look-alikes"]];
const GM_HOW = [["both", "Hear and read"], ["hear", "Hear only"], ["read", "Read only"]];
const GM_LEVEL_HELP = { easy: "Each letter in its first form, like ለ መ ረ.", mixed: "Any of the seven forms of any letter.", hard: "All the forms of just a few letters, so they look alike." };
function gmBingoPool(level){
  let pool = FID.filter(f => f.snd && f.ord < 7);
  if(level === "easy") pool = pool.filter(f => f.ord === 0 || (f.ord === 3 && FR[f.row][2]));
  if(level === "hard"){ const rows = shuffle([...new Set(pool.map(f => f.row))].filter(r => !FR[r][2])).slice(0, 4); pool = pool.filter(f => rows.includes(f.row)); }
  // one letter per sound, so a call can only mean one square
  const seen = new Set(); return shuffle(pool).filter(f => { if(seen.has(CAN[f.ch]) || seen.has(f.snd)) return false; seen.add(CAN[f.ch]); seen.add(f.snd); return true; });
}
const gmCanHear = () => lsLetters().length >= 20;
function gmBingoStart(){
  const pool = gmBingoPool(S.gm.level); if(pool.length < 18) return null;
  const card = pool.slice(0, 16), extra = pool.slice(16, 22);
  const calls = shuffle(card.map(f => ({ f, on: true })).concat(extra.map(f => ({ f, on: false }))));
  const how = S.gm.how === "hear" && !gmCanHear() ? "both" : S.gm.how === "both" && !gmCanHear() ? "read" : S.gm.how;
  const g = { kind: "bingo", card, calls, ci: 0, marked: new Set(), mistakes: 0, bad: null, hint: null, shown: how !== "hear", how, line: null, said: 0, key: "bingo-" + S.gm.level };
  return g;
}
const GM_LINES = (() => { const L = []; for(let i = 0; i < 4; i++){ L.push([0,1,2,3].map(j => i * 4 + j)); L.push([0,1,2,3].map(j => j * 4 + i)); } L.push([0,5,10,15], [3,6,9,12]); return L; })();
const gmCall = g => g.calls[g.ci];
function gmBingoSay(g){ const c = gmCall(g); if(c && g.how !== "read") gmSay(c.f.ch); }
function gmBingoNext(g){
  g.ci++; g.bad = null; g.hint = null; g.shown = g.how !== "hear";
  const line = GM_LINES.find(l => l.every(i => g.marked.has(i)));
  if(line){ g.line = line; g.won = true; const b = S.gm.best[g.key]; g.calls_used = g.ci; g.record = b == null || g.ci < b; if(g.record) S.gm.best[g.key] = g.ci; S.gm.best.bingos = (S.gm.best.bingos || 0) + 1; srsActivity(S.srs); save(); return; }
  if(g.ci >= g.calls.length){ g.won = false; g.out = true; return; }
  gmBingoSay(g);
}
function gmBingoTap(v){
  const g = G; if(g.won || g.out) return; const c = gmCall(g);
  if(v === "none"){
    if(!c.on){ gmBingoNext(g); return; }
    g.mistakes++; g.hint = g.card.indexOf(c.f); g.shown = true; return;
  }
  const i = +v; if(g.marked.has(i)) return;
  if(c.on && g.card[i] === c.f){ g.marked.add(i); gmBingoNext(g); return; }
  g.mistakes++; g.bad = i; g.shown = true;
  setTimeout(() => { if(G === g && g.bad === i){ g.bad = null; render(); } }, 700);
}
function gmBingoHTML(g){
  const grid = `<div class="bingo norom-auto ${g.won ? "won" : ""}">${g.card.map((f, i) => { const m = g.marked.has(i), inLine = g.line && g.line.includes(i);
    return `<button class="bcell ${m ? "on" : ""} ${inLine ? "line" : ""} ${g.bad === i ? "no" : ""} ${g.hint === i ? "hint" : ""}" data-act="gm-cell" data-v="${i}" ${g.won || g.out || m ? "disabled" : ""}><span class="am">${f.ch}</span>${(m || g.won || g.out) && f.snd ? `<small class="rom">${esc(f.snd)}</small>` : ""}</button>`; }).join("")}</div>`;
  if(g.won || g.out){
    return `<div class="score"><div class="count">Fidel bingo</div><div class="n norom-auto">${g.won ? "ቢንጎ!" : "No bingo"}</div><p style="margin:6px auto">${g.won ? `Bingo after ${g.calls_used} calls, with ${g.mistakes || "no"} ${g.mistakes === 1 ? "mistake" : "mistakes"}.` : "Every letter has been called. Try another card."}</p>${g.won ? `<p class="count">${g.record ? "Your quickest bingo yet!" : `Quickest: ${S.gm.best[g.key]} calls`} · ${S.gm.best.bingos} ${S.gm.best.bingos === 1 ? "bingo" : "bingos"} so far</p>` : ""}</div>` + grid +
      `<div class="stack" style="margin-top:16px"><button class="btn primary wide" data-act="gm-start" data-v="bingo">New card</button><button class="btn wide" data-act="gm-quit">All games</button></div>`;
  }
  const c = gmCall(g);
  return `<div class="gmhead"><span class="count">Call ${g.ci + 1} · ${g.marked.size} marked · ${g.mistakes} ${g.mistakes === 1 ? "mistake" : "mistakes"}</span></div>
    <div class="q bcall"><div class="kind">${g.how === "hear" ? "Listen" : "The caller says"}</div>
      <div class="bsnd">${g.shown ? `<b>${esc(c.f.snd)}</b>` : `<button class="link" data-act="gm-show">Show the sound</button>`}</div>
      ${g.how !== "read" && clipFor(c.f.ch) ? `<div class="lsplay"><button class="lsbtn" data-act="gm-again"><span aria-hidden="true">▶</span> Again</button></div>` : ""}
      ${g.hint !== null ? `<p class="fb bad">It's on your card, here. Tap it.</p>` : g.bad !== null ? `<p class="fb bad">Not that one.</p>` : ""}</div>
    ${grid}<button class="btn wide bnone" data-act="gm-cell" data-v="none">Not on my card</button>`;
}

/* ----- shared: the end screen, the menu, starting and clicks ----- */
function gmEnd(g, big, line, best, extra){
  const name = { pairs: "Matching pairs", speed: "Speed round" }[g.kind];
  return `<div class="score"><div class="count">${name} · ${esc(gmSrcName())}</div><div class="n">${esc(big)}</div><p style="margin:6px auto">${esc(line)}</p>${best ? `<p class="count">${esc(best)}</p>` : ""}</div>${extra || ""}
    <div class="stack" style="margin-top:16px"><button class="btn primary wide" data-act="gm-start" data-v="${g.kind}">Play again</button><button class="btn wide" data-act="gm-quit">All games</button></div>`;
}
function gmRender(){
  const g = G;
  if(g.kind === "pairs" && !g.t1 && !gmTimer) gmPairsClock(g);
  const top = `<div class="bar" style="margin:14px 0 4px"><b>${{ pairs: g.style === "memory" ? "Memory pairs" : "Matching pairs", speed: "Speed round", bingo: "Fidel bingo" }[g.kind]}</b><button class="link" data-act="gm-quit">End game</button></div>`;
  return top + (g.kind === "pairs" ? gmPairsHTML(g) : g.kind === "speed" ? gmSpeedHTML(g) : gmBingoHTML(g));
}
function gmBest(k, fmt){ const b = S.gm.best[k]; return b != null ? `<span class="best"><strong>${fmt(b)}</strong>best</span>` : `<span class="best untried">not tried</span>`; }
function gmMenu(){
  const M = S.gm, n = gmItems(M.src).length;
  const card = (id, name, desc, best) => `<button class="topic" data-act="gm-start" data-v="${id}" ${id !== "bingo" && n < 4 ? "disabled" : ""}><b>${name}</b><small>${desc}</small>${best}</button>`;
  return `<div class="stack">
      ${card("pairs", "Matching pairs", M.style === "memory" ? "Turn over cards two at a time to find 8 pairs" : "Match 6 Amharic words to their meanings, against the clock", gmBest("pairs-" + M.src + "-" + M.style, gmFmt))}
      ${card("speed", "Speed round", "As many right answers as you can in 60 seconds", gmBest("speed-" + M.src, String))}
      ${card("bingo", "Fidel bingo", "Hear or read a letter, find it on your card. Get a line to win.", gmBest("bingo-" + M.level, b => b + " calls"))}
    </div>
    <div class="note bset"><h4>Pairs and speed round</h4>
      <p class="count">Words from</p>${mini("gm-src", GM_SRC, M.src)}
      ${M.src === "words" ? `<p class="count">Units</p><select id="gm-upto" class="sel" aria-label="Units for games"><option value="0">All units</option>${FULL.map(u => `<option value="${u}" ${M.upto === u ? "selected" : ""}>Units 1 to ${u}</option>`).join("")}</select>` : ""}
      <p class="count">Pairs style</p>${mini("gm-style", [["match", "Face up"], ["memory", "Memory"]], M.style)}
      <p class="count bhelp">${n} ${M.src === "letters" ? "letters" : "words"} to play with. Face up: tap a word, then its meaning. Memory: the cards start face down.</p></div>
    <div class="note bset"><h4>Bingo</h4>
      <p class="count">Letters</p>${mini("gm-level", GM_LEVELS, M.level)}<p class="count bhelp">${esc(GM_LEVEL_HELP[M.level])}</p>
      <p class="count">Calls</p>${mini("gm-how", GM_HOW, M.how)}
      <p class="count bhelp">${gmCanHear() ? "“Hear only” is the hardest: you can still show the sound if you need it." : "Letter recordings aren't on this device yet, so calls are read only."}</p></div>`;
}
function gmStart(kind){
  gmStop();
  const g = kind === "pairs" ? gmPairsStart() : kind === "speed" ? gmSpeedStart() : gmBingoStart();
  if(!g) return;
  S.quiz = null; G = g;
  if(g.kind === "bingo") setTimeout(() => { if(G === g) gmBingoSay(g); }, 250);
}
// clicks from the games; returns true when it has drawn the screen itself
function gmAct(a, v){
  const M = S.gm;
  if(a === "gm-start"){ gmStart(v); render(); window.scrollTo(0, 0); return true; }
  if(a === "gm-quit"){ gmStop(); render(); window.scrollTo(0, 0); return true; }
  if(a === "gm-src"){ M.src = v; save(); return false; }
  if(a === "gm-style"){ M.style = v; save(); return false; }
  if(a === "gm-level"){ M.level = v; save(); return false; }
  if(a === "gm-how"){ M.how = v; save(); return false; }
  if(!G) return false;
  if(a === "gm-tap" && G.kind === "pairs") gmPairsTap(v);
  else if(a === "gm-pick" && G.kind === "speed") gmSpeedPick(v);
  else if(a === "gm-cell" && G.kind === "bingo") gmBingoTap(v);
  else if(a === "gm-again" && G.kind === "bingo"){ gmBingoSay(G); return true; }
  else if(a === "gm-show" && G.kind === "bingo") G.shown = true;
  return false;
}
function gmChange(id, val){ if(id === "gm-upto"){ S.gm.upto = +val; save(); } }
