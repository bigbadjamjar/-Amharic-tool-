/* ---------- the Ethiopia tab ----------
   Notes on the country, its peoples and everyday life (data/culture.js), sorted into groups below.
   Each note has a few paragraphs, sometimes a table of quick facts, and useful phrases with audio.
   A note can also be opened from the end of a course unit's notes ("Read more"); its back button then
   returns to that unit. The state lives in ETHV and nothing here is saved. Uses app.js helpers
   (S, esc, fmt, wordList, LMAP) at call time. */
const ETH_GROUPS = [   // four notes in each group, so the cards fill their rows on phones and laptops
  {title:"The land and its history", ids:["country","regions","peoples","history"]},
  {title:"Faith, festivals and time", ids:["faith","holidays","calendar","time"]},
  {title:"Food, coffee and the market", ids:["dishes","food","coffee","market"]},
  {title:"Family and manners", ids:["family","greet","names","care"]},
  {title:"Music, sport and more", ids:["music","running","taxi","proverbs"]}
];
const ETH_ORDER = ETH_GROUPS.flatMap(g => g.ids);
const ETHMAP = {}; CULTURE.forEach(c => ETHMAP[c.id] = c);
let ETHV = {id:null, unit:null};   // unit: the course unit a note was opened from, for the back button

const ethUnits = us => us.length===1 ? `Unit ${us[0]}` : `Units ${us.slice(0,-1).join(", ")} and ${us[us.length-1]}`;

function renderEth(){
  const c = ETHV.id && ETHMAP[ETHV.id];
  return c ? ethNoteHTML(c) : ethHomeHTML();
}

function ethHomeHTML(){
  let h = `<h2>Ethiopia <span class="ethname"><span class="am nosay">ኢትዮጵያ</span> <span class="rom">ityop'ya</span></span></h2>
    <p class="lead">The country, its peoples and its everyday life: history, faith, food, music and more. Each note ends with a few useful phrases you can listen to.</p>`;
  ETH_GROUPS.forEach(g => {
    h += `<h3>${esc(g.title)}</h3><div class="tgrid rdgrid">` + g.ids.map(id => {
      const c = ETHMAP[id];
      return `<button class="tcard" data-act="eth-note" data-v="${c.id}"><span class="ticon" aria-hidden="true">${c.icon}</span><b>${esc(c.title)}</b><small>${esc(c.intro)}</small><span class="tn">Read ›</span></button>`;
    }).join("") + `</div>`;
  });
  return h;
}

function ethNoteHTML(c){
  const back = ETHV.unit && LMAP[ETHV.unit] ? `‹ Unit ${ETHV.unit}` : "‹ Ethiopia";
  const i = ETH_ORDER.indexOf(c.id), next = ETHMAP[ETH_ORDER[i+1]];
  let h = `<button class="back" data-act="eth-back">${back}</button>
    <h2 class="rdh"><span aria-hidden="true">${c.icon}</span> ${esc(c.title)}</h2><p class="lead">${esc(c.intro)}</p>`;
  if(c.facts) h += `<dl class="ethfacts">${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
  h += `<div class="note rdnote">${c.p.map(p => `<p>${fmt(p)}</p>`).join("")}</div>
    <h3>Useful phrases</h3>${wordList(c.phrases.map(x => [x[0], x[1], x[2]]))}`;
  if(c.units.length) h += `<h3>Goes with</h3><div class="stack rdfill" style="--c:${Math.min(c.units.length,3)}">${c.units.map(n => `<button class="topic" data-act="lesson-go" data-v="${n}"><b><span class="lnum">${n}</span>${esc(LMAP[n].title)}</b><small>Open the unit</small></button>`).join("")}</div>`;
  h += `<div class="rdnext">${next ? `<button class="btn primary" data-act="eth-note" data-v="${next.id}" data-keep="1">Next: ${esc(next.title)} ›</button>` : `<button class="btn" data-act="eth-back">‹ All notes</button>`}</div>`;
  return h;
}

// Clicks on data-act="eth-…".
function ethAct(a, v, b){
  if(a==="eth-note"){
    const fromUnit = S.mode==="course" && S.lesson ? S.lesson : null;
    ETHV = {id:v, unit: b && b.dataset.keep ? ETHV.unit : fromUnit};
    S.mode = "eth";
  }else if(a==="eth-back"){
    if(ETHV.unit && LMAP[ETHV.unit]){ S.mode = "course"; S.lesson = ETHV.unit; S.lview = "notes"; }
    ETHV = {id:null, unit:null};
  }
  render(); window.scrollTo(0,0);
}
function ethReset(){ ETHV = {id:null, unit:null}; }
