import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";

/********************
 * Global settings
 ********************/
const SettingsCtx = createContext({ showTranslit:false, setShowTranslit:()=>{}, tts:true, setTts:()=>{} });
const useSettings = ()=>useContext(SettingsCtx);

/********************
 * Utils
 ********************/
const STORAGE_KEY = "amharic-learning-data-v8";
const SR_KEY = "amharic-learning-sr-v1";
const ORDERS = ["ä","u","i","a","e","ə","o"];
const makeTranslit = (roman) => ORDERS.map((v, idx) => (idx===5? roman : roman+v));
const randInt = (n)=> Math.floor(Math.random()*n);
const sample = (arr)=> arr[randInt(arr.length)];
const shuffle = (arr)=> arr.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);

function speak(text, lang="am-ET"){ try{ const u = new SpeechSynthesisUtterance(text); u.lang = lang; if (window?.speechSynthesis) window.speechSynthesis.speak(u);}catch{} }

/********************
 * Data
 ********************/
const FIDEL_SERIES = [
  { roman: "h", label: "ሀ hä", series: ["ሀ","ሁ","ሂ","ሃ","ሄ","ህ","ሆ"] },
  { roman: "l", label: "ለ lä", series: ["ለ","ሉ","ሊ","ላ","ሌ","ል","ሎ"] },
  { roman: "ḥ", label: "ሐ ḥä", series: ["ሐ","ሑ","ሒ","ሓ","ሔ","ሕ","ሖ"] },
  { roman: "m", label: "መ mä", series: ["መ","ሙ","ሚ","ማ","ሜ","ም","ሞ"] },
  { roman: "s", label: "ሰ sä", series: ["ሰ","ሱ","ሲ","ሳ","ሴ","ስ","ሶ"] },
  { roman: "r", label: "ረ rä", series: ["ረ","ሩ","ሪ","ራ","ሬ","ር","ሮ"] },
  { roman: "š", label: "ሸ šä", series: ["ሸ","ሹ","ሺ","ሻ","ሼ","ሽ","ሾ"] },
  { roman: "q", label: "ቀ qä", series: ["ቀ","ቁ","ቂ","ቃ","ቄ","ቅ","ቆ"] },
  { roman: "b", label: "በ bä", series: ["በ","ቡ","ቢ","ባ","ቤ","ብ","ቦ"] },
  { roman: "t", label: "ተ tä", series: ["ተ","ቱ","ቲ","ታ","ቴ","ት","ቶ"] },
  { roman: "č", label: "ቸ čä", series: ["ቸ","ቹ","ቺ","ቻ","ቼ","ች","ቾ"] },
  { roman: "x", label: "ኀ xä", series: ["ኀ","ኁ","ኂ","ኃ","ኄ","ኅ","ኆ"] },
  { roman: "n", label: "ነ nä", series: ["ነ","ኑ","ኒ","ና","ኔ","ን","ኖ"] },
  { roman: "ñ", label: "ኘ ñä", series: ["ኘ","ኙ","ኚ","ኛ","ኜ","ኝ","ኞ"] },
  { roman: "ʔ", label: "አ ʔä", series: ["አ","ኡ","ኢ","ኣ","ኤ","እ","ኦ"] },
  { roman: "k", label: "ከ kä", series: ["ከ","ኩ","ኪ","ካ","ኬ","ክ","ኮ"] },
  { roman: "ḥ", label: "ኸ ḥä", series: ["ኸ","ኹ","ኺ","ኻ","ኼ","ኽ","ኾ"] },
  { roman: "w", label: "ወ wä", series: ["ወ","ዉ","ዊ","ዋ","ዌ","ው","ዎ"] },
  { roman: "ʕ", label: "ዐ ʕä", series: ["ዐ","ዑ","ዒ","ዓ","ዔ","ዕ","ዖ"] },
  { roman: "z", label: "ዘ zä", series: ["ዘ","ዙ","ዚ","ዛ","ዜ","ዝ","ዞ"] },
  { roman: "ž", label: "ዠ žä", series: ["ዠ","ዡ","ዢ","ዣ","ዤ","ዥ","ዦ"] },
  { roman: "y", label: "የ yä", series: ["የ","ዩ","ዪ","ያ","ዬ","ይ","ዮ"] },
  { roman: "d", label: "ደ dä", series: ["ደ","ዱ","ዲ","ዳ","ዴ","ድ","ዶ"] },
  { roman: "ǧ", label: "ጀ ǧä", series: ["ጀ","ጁ","ጂ","ጃ","ጄ","ጅ","ጆ"] },
  { roman: "g", label: "ገ gä", series: ["ገ","ጉ","ጊ","ጋ","ጌ","ግ","ጎ"] },
  { roman: "ṭ", label: "ጠ ṭä", series: ["ጠ","ጡ","ጢ","ጣ","ጤ","ጥ","ጦ"] },
  { roman: "čʼ", label: "ጨ čʼä", series: ["ጨ","ጩ","ጪ","ጫ","ጬ","ጭ","ጮ"] },
  { roman: "pʼ", label: "ጰ pʼä", series: ["ጰ","ጱ","ጲ","ጳ","ጴ","ጵ","ጶ"] },
  { roman: "ṣ", label: "ጸ ṣä", series: ["ጸ","ጹ","ጺ","ጻ","ጼ","ጽ","ጾ"] },
  { roman: "ṣʼ", label: "ፀ ṣʼä", series: ["ፀ","ፁ","ፂ","ፃ","ፄ","ፅ","ፆ"] },
  { roman: "f", label: "ፈ fä", series: ["ፈ","ፉ","ፊ","ፋ","ፌ","ፍ","ፎ"] },
  { roman: "p", label: "ፐ pä", series: ["ፐ","ፑ","ፒ","ፓ","ፔ","ፕ","ፖ"] },
];

const DEFAULT_DATA = {
  fidel: FIDEL_SERIES.map(({roman,label,series})=>({ base: label, series, translit: makeTranslit(roman) })),
  verbs: [
    { root:"መሆን", translit:"mähon", meaning:"to be", tenses:{
      infinitive:"መሆን",
      present:{I:"ነኝ",you_m:"ነህ",you_f:"ነሽ",he:"ነው",she:"ናት",we:"ነን",you_pl:"ናችሁ",they:"ናቸው"},
      past:{I:"ነበርኩ",you_m:"ነበርህ",you_f:"ነበርሽ",he:"ነበረ",she:"ነበረች",we:"ነበርን",you_pl:"ነበራችሁ",they:"ነበሩ"},
      perfect:{I:"ሆኛለሁ",you_m:"ሆንህ",you_f:"ሆንሽ",he:"ሆነው",she:"ሆነች",we:"ሆነን",you_pl:"ሆናችሁ",they:"ሆነው"},
      continuous:{I:"እየነበርኩ ነው",he:"እየነበረ ነው",they:"እየነበሩ ነው"},
      negative:{present:{I:"አይደለኝም",he:"አይደለም",they:"አይደሉም"}}
    }},
    { root:"መሄድ", translit:"mähed", meaning:"to go", tenses:{
      infinitive:"መሄድ",
      present:{I:"እሄዳለሁ",you_m:"ትሄዳለህ",you_f:"ትሄዳለሽ",he:"ይሄዳል",she:"ትሄዳለች",we:"እንሄዳለን",you_pl:"ትሄዳላችሁ",they:"ይሄዳሉ"},
      past:{I:"ሄድኩ",you_m:"ሄድህ/ሄድክ",you_f:"ሄድሽ",he:"ሄደ",she:"ሄደች",we:"ሄድን",you_pl:"ሄዳችሁ",they:"ሄዱ"},
      perfect:{I:"ሄድኩ",you_m:"ሄድክ",you_f:"ሄድሽ",he:"ሄደ",she:"ሄደች",we:"ሄድን",you_pl:"ሄዳችሁ",they:"ሄዱ"},
      continuous:{he:"እየሄደ ነው",they:"እየሄዱ ናቸው"},
      negative:{present:{I:"አልሄድም",he:"አይሄድም",they:"አይሄዱም"}}
    }},
    { root:"መናገር", translit:"mänägär", meaning:"to speak", tenses:{
      infinitive:"መናገር",
      present:{I:"እናገራለሁ",you_m:"ትናገራለህ",you_f:"ትናገራለሽ",he:"ይናገራል",she:"ትናገራለች",we:"እንናገራለን",you_pl:"ትናገራላችሁ",they:"ይናገራሉ"},
      past:{I:"ተናገርኩ",you_m:"ተናገርክ",you_f:"ተናገርሽ",he:"ተናገረ",she:"ተናገረች",we:"ተናገርን",you_pl:"ተናገራችሁ",they:"ተናገሩ"},
      perfect:{I:"ተናገርኩ",you_m:"ተናገርክ",you_f:"ተናገርሽ",he:"ተናገረ",she:"ተናገረች",we:"ተናገርን",you_pl:"ተናገራችሁ",they:"ተናገሩ"},
      continuous:{he:"እየናገረ ነው",they:"እየናገሩ ናቸው"},
      negative:{present:{I:"አልናገርም",he:"አይናገርም",they:"አይናገሩም"}}
    }},
    { root:"ማየት", translit:"mäyät", meaning:"to see", tenses:{
      infinitive:"ማየት",
      present:{I:"እያለሁ",you_m:"ታያለህ",you_f:"ታያለሽ",he:"ያያል",she:"ታያለች",we:"እንያለን",you_pl:"ታያላችሁ",they:"ያያሉ"},
      past:{I:"አየሁ",you_m:"አየህ",you_f:"አየሽ",he:"አየ",she:"አየች",we:"አየን",you_pl:"አያችሁ",they:"አዩ"},
      perfect:{I:"አየሁ",you_m:"አየህ",you_f:"አየሽ",he:"አየ",she:"አየች",we:"አየን",you_pl:"አያችሁ",they:"አዩ"},
      continuous:{he:"እያየ ነው",they:"እየዩ ናቸው"},
      negative:{present:{I:"አላይም",he:"አያይም",they:"አያዩም"}}
    }},
    { root:"ማንበብ", translit:"mänbäb", meaning:"to read", tenses:{
      infinitive:"ማንበብ",
      present:{I:"እነበባለሁ",you_m:"ትነበባለህ",you_f:"ትነበባለሽ",he:"ይነበባል",she:"ትነበባለች",we:"እንነበባለን",you_pl:"ትነበባላችሁ",they:"ይነበባሉ"},
      past:{I:"አነበብኩ",you_m:"አነበብክ",you_f:"አነበብሽ",he:"አነበበ",she:"አነበበች",we:"አነበብን",you_pl:"አነበባችሁ",they:"አነበቡ"},
      perfect:{I:"አነበብኩ",you_m:"አነበብክ",you_f:"አነበብሽ",he:"አነበበ",she:"አነበበች",we:"አነበብን",you_pl:"አነበባችሁ",they:"አነበቡ"},
      continuous:{he:"እየነበበ ነው",they:"እየነበቡ ናቸው"},
      negative:{present:{I:"አልነበብም",he:"አይነበብም",they:"አይነበቡም"}}
    }},
    { root:"ማወቅ", translit:"mäwäq", meaning:"to know", tenses:{
      infinitive:"ማወቅ",
      present:{I:"አውቃለሁ",you_m:"ታውቃለህ",you_f:"ታውቃለሽ",he:"ያውቃል",she:"ታውቃለች",we:"እናውቃለን",you_pl:"ታውቃላችሁ",they:"ያውቃሉ"},
      past:{I:"አወቅኩ",you_m:"አወቅክ",you_f:"አወቅሽ",he:"አወቀ",she:"አወቀች",we:"አወቅን",you_pl:"አወቃችሁ",they:"አወቁ"},
      perfect:{I:"አወቅኩ",you_m:"አወቅክ",you_f:"አወቅሽ",he:"አወቀ",she:"አወቀች",we:"አወቅን",you_pl:"አወቃችሁ",they:"አወቁ"},
      continuous:{he:"እየወቀ ነው",they:"እየወቁ ናቸው"},
      negative:{present:{I:"አላውቅም",he:"አያውቅም",they:"አያውቁም"}}
    }},
    { root:"መፈለግ", translit:"mäfäläg", meaning:"to want", tenses:{
      infinitive:"መፈለግ",
      present:{I:"እፈልጋለሁ",you_m:"ትፈልጋለህ",you_f:"ትፈልጋለሽ",he:"ይፈልጋል",she:"ትፈልጋለች",we:"እንፈልጋለን",you_pl:"ትፈልጋላችሁ",they:"ይፈልጋሉ"},
      past:{I:"ፈለግሁ",you_m:"ፈለግህ",you_f:"ፈለግሽ",he:"ፈለገ",she:"ፈለገች",we:"ፈለግን",you_pl:"ፈለጋችሁ",they:"ፈለጉ"},
      perfect:{I:"ፈለግሁ",you_m:"ፈለግህ",you_f:"ፈለግሽ",he:"ፈለገ",she:"ፈለገች",we:"ፈለግን",you_pl:"ፈለጋችሁ",they:"ፈለጉ"},
      continuous:{he:"እየፈለገ ነው",they:"እየፈለጉ ናቸው"},
      negative:{present:{I:"አልፈልግም",he:"አይፈልግም",they:"አይፈልጉም"}}
    }},
    { root:"መቻል", translit:"mäčʼal", meaning:"to be able to", tenses:{
      infinitive:"መቻል",
      present:{I:"እችላለሁ",you_m:"ትችላለህ",you_f:"ትችላለሽ",he:"ይችላል",she:"ትችላለች",we:"እንችላለን",you_pl:"ትችላላችሁ",they:"ይችላሉ"},
      past:{I:"ቻልኩ",you_m:"ቻልክ",you_f:"ቻልሽ",he:"ቻለ",she:"ቻለች",we:"ቻልን",you_pl:"ቻላችሁ",they:"ቻሉ"},
      perfect:{I:"ቻልኩ",you_m:"ቻልክ",you_f:"ቻልሽ",he:"ቻለ",she:"ቻለች",we:"ቻልን",you_pl:"ቻላችሁ",they:"ቻሉ"},
      continuous:{he:"እየቻለ ነው",they:"እየቻሉ ናቸው"},
      negative:{present:{I:"አልችልም",he:"አይችልም",they:"አይችሉም"}}
    }},
    { root:"መወደድ", translit:"mäwädäd", meaning:"to love", tenses:{
      infinitive:"መወደድ",
      present:{I:"እወዳለሁ",you_m:"ትወዳለህ",you_f:"ትወዳለሽ",he:"ይወዳል",she:"ትወዳለች",we:"እንወዳለን",you_pl:"ትወዳላችሁ",they:"ይወዳሉ"},
      past:{I:"ወደድኩ",you_m:"ወደድክ",you_f:"ወደድሽ",he:"ወደደ",she:"ወደደች",we:"ወደድን",you_pl:"ወደዳችሁ",they:"ወደዱ"},
      perfect:{I:"ወደድኩ",you_m:"ወደድክ",you_f:"ወደድሽ",he:"ወደደ",she:"ወደደች",we:"ወደድን",you_pl:"ወደዳችሁ",they:"ወደዱ"},
      continuous:{he:"እየወደደ ነው",they:"እየወደዱ ናቸው"},
      negative:{present:{I:"አልወድም",he:"አይውድም",they:"አይውዱም"}}
    }},
  ],
  pronouns: [
    { am:"እኔ", translit:"ʔɨne", english:"I" },
    { am:"አንተ", translit:"änta", english:"you (m)" },
    { am:"አንቺ", translit:"änči", english:"you (f)" },
    { am:"እሱ", translit:"ʔɨsu", english:"he" },
    { am:"እሷ", translit:"ʔɨswa", english:"she" },
    { am:"እኛ", translit:"ʔɨñña", english:"we" },
    { am:"እናንተ", translit:"ʔɨnanɨta", english:"you (pl.)" },
    { am:"እነሱ", translit:"ʔɨnässu", english:"they" }
  ]
};

function useLocalData(){
  const [data, setData] = useState(()=>{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): DEFAULT_DATA; });
  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  return [data, setData];
}

/********************
 * SR engine (very light SM-2)
 ********************/
function useSR(){
  const [state, setState] = useState(()=>{ const raw = localStorage.getItem(SR_KEY); return raw? JSON.parse(raw): { items:{} }; });
  useEffect(()=>{ localStorage.setItem(SR_KEY, JSON.stringify(state)); }, [state]);
  function review(id, grade){
    const now = Date.now();
    const it = state.items[id] || { ef:2.5, interval:0, due:0 };
    const q = Math.max(0, Math.min(5, grade));
    const ef = Math.max(1.3, it.ef + (0.1 - (5-q)*(0.08 + (5-q)*0.02)));
    const interval = q < 3 ? 1 : (it.interval===0?1: Math.round(it.interval*ef));
    const due = now + interval*24*60*60*1000;
    setState(s=>({ ...s, items:{...s.items, [id]:{ ef, interval, due }}}));
  }
  return { state, review };
}

/********************
 * Flashcards (Learn) core
 ********************/
function Flashcards({ items, renderFront, renderBack, idOf }){
  const { tts } = useSettings();
  const { review } = useSR();
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const cur = items.length? items[idx % items.length] : null;
  function again(){ if(!cur) return; review(idOf(cur), 2); setIdx(i=>i+1); setShow(false); }
  function good(){ if(!cur) return; review(idOf(cur), 4); setIdx(i=>i+1); setShow(false); }
  function easy(){ if(!cur) return; review(idOf(cur), 5); setIdx(i=>i+1); setShow(false); }
  return (
    <div className="card">
      <h3>Flashcards (Learn) <small className="pill"> {items.length} items</small></h3>
      <div className="panel">
        {cur ? (!show? renderFront(cur, {tts, speak}) : renderBack(cur, {tts, speak})) : <div className="muted">No items selected.</div>}
      </div>
      <div className="row">
        {!show ? (
          <button className="btn" onClick={()=>setShow(true)} disabled={!cur}>Show answer</button>
        ) : (
          <>
            <button className="btn danger" onClick={again} disabled={!cur}>Again</button>
            <button className="btn" onClick={good} disabled={!cur}>Good</button>
            <button className="btn primary" onClick={easy} disabled={!cur}>Easy</button>
          </>
        )}
        <button className="btn ghost" onClick={()=>{ setIdx(i=>i+1); setShow(false); }} disabled={!cur}>Next ↻</button>
      </div>
    </div>
  );
}

/********************
 * Fidel Trainer (MC) — with Show base toggle
 ********************/
function FidelQuiz({ data }){
  const { showTranslit } = useSettings();
  const ALL = useMemo(()=> data.fidel.flatMap((base)=> base.series.map((g,i)=>({ base, glyph:g, order:i }))), [data]);
  const [item, setItem] = useState(()=> sample(ALL));
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showBase, setShowBase] = useState(true);

  useEffect(()=>{ makeRound(); },[]);
  function makeRound(){
    const it = sample(ALL);
    const correct = it.base.translit[it.order];
    const wrongs = shuffle(it.base.translit.filter((_,idx)=>idx!==it.order)).slice(0,3);
    setItem(it); setChoices(shuffle([correct, ...wrongs])); setPicked(null);
  }
  const correct = item.base.translit[item.order];

  return (
    <div className="card">
      <h3>Fidel Trainer <small className="pill">Streak {streak}</small></h3>
      <div className="center big" title={showTranslit?correct:undefined} style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}}>{item.glyph}</div>
      <div className="grid">
        {choices.map((opt)=> {
          const isCorrect = opt===correct;
          const isPicked = picked===opt;
          const variant = picked==null? "secondary" : (isCorrect? "correct" : (isPicked? "danger":"secondary"));
          return (
            <button key={opt} className={`btn ${variant}`} onClick={()=>{ setPicked(opt); setStreak(s=> opt===correct? s+1:0); }}>{opt}</button>
          );
        })}
      </div>
      <div className="row">
        <button className="btn" onClick={makeRound}>Next ↻</button>
        <label className="switch"><input type="checkbox" checked={showBase} onChange={(e)=>setShowBase(e.target.checked)}/> Show base</label>
      </div>
      {showBase && <div className="muted">Base: <b>{item.base.base}</b></div>}
    </div>
  );
}

/********************
 * Verb Trainer (MC default, reversible, Random selectors, Pattern drill)
 ********************/
const PRONOUNS = [
  { key:"I", label:"I" },{ key:"you_m", label:"you (m)" },{ key:"you_f", label:"you (f)" },{ key:"he", label:"he" },{ key:"she", label:"she" },{ key:"we", label:"we" },{ key:"you_pl", label:"you (pl.)" },{ key:"they", label:"they" }
];
const ALL_TENSES = ["infinitive","present","past","perfect","continuous","negative"];

function formLookup(verb, tense, pron){
  if(tense === "infinitive") return verb.tenses.infinitive;
  if(tense === "negative") return verb.tenses.negative?.present?.[pron] || verb.tenses.negative?.[pron];
  if(tense === "continuous") return verb.tenses.continuous?.[pron];
  return verb.tenses[tense]?.[pron];
}
const englishLabel = (verb, tense, pronKey)=>{
  if (tense==="infinitive") return `${verb.meaning} (infinitive)`;
  const p = PRONOUNS.find(x=>x.key===pronKey)?.label || pronKey;
  return `${p} – ${verb.meaning} (${tense})`;
};

function VerbQuiz({ data }){
  const { showTranslit } = useSettings();
  const verbs = data.verbs;

  // UI selections (Random by default)
  const [tenseSel, setTenseSel] = useState("random");
  const [direction, setDirection] = useState("am->en"); // default Amharic → English
  const [mode, setMode] = useState("choice"); // "type" | "choice" | "pattern"
  const [verbSel, setVerbSel] = useState("random");
  const [pronSel, setPronSel] = useState("random");

  // Pattern drill controls
  const [patternPronSel, setPatternPronSel] = useState("random");
  const [patternTenseSel, setPatternTenseSel] = useState("random");

  const [showSettings, setShowSettings] = useState(true);

  // Round state
  const [rv, setRv] = useState(()=> sample(verbs));
  const [rp, setRp] = useState(()=> sample(PRONOUNS));
  const [rt, setRt] = useState(()=> sample(ALL_TENSES.filter(t=>t!=="negative"))); // default sensible
  const [answer, setAnswer] = useState("");
  const [show, setShow] = useState(false);
  const [streak, setStreak] = useState(0);
  const [choices, setChoices] = useState([]); // {label,hint,speakText}
  const [lastCorrect, setLastCorrect] = useState(null);

  const pronKey = mode === 'pattern'
    ? (patternPronSel === "random" ? rp.key : patternPronSel)
    : (pronSel === "random" ? rp.key : pronSel);

  const correctAm = rt==="infinitive" ? rv.tenses.infinitive : formLookup(rv, rt, pronKey);
  const correctEn = englishLabel(rv, rt, pronKey);

  useEffect(()=>{ resetRound(); }, [tenseSel, direction, mode, verbSel, pronSel, patternPronSel, patternTenseSel]);

  function pickFrom(sel, pool){
    if (sel==="random") return sample(pool);
    if (typeof sel === "string") return sel;
    return sel;
  }

  function buildChoices(verb, pron, tense){
    const isInf = tense==="infinitive";
    let pool = [];

    if (mode==="pattern"){
      // same pronoun & tense, across verbs
      for (const vb of verbs){
        if (isInf){
          const lab = (direction==="am->en") ? englishLabel(vb,"infinitive",pron.key) : vb.tenses.infinitive;
          if (lab) pool.push({ label:lab, speakText: vb.tenses.infinitive, hint: `${vb.root} · ${vb.meaning}`});
        } else {
          const am = formLookup(vb, tense, pron.key);
          if (!am) continue;
          if (direction==="am->en"){
            pool.push({ label: englishLabel(vb, tense, pron.key), speakText: am, hint:`${vb.root} · ${pron.label} · ${tense}`});
          } else {
            pool.push({ label: am, speakText: am, hint:`${vb.root} · ${pron.label} · ${tense}`});
          }
        }
      }
    } else {
      // normal: mix verbs & pronouns
      if (isInf){
        for(const vb of verbs){
          const lab = (direction==="am->en") ? englishLabel(vb,"infinitive",pron.key) : vb.tenses.infinitive;
          if (lab) pool.push({ label:lab, speakText: vb.tenses.infinitive, hint: `${vb.root}`});
        }
      } else {
        for(const vb of verbs){
          for(const p of PRONOUNS){
            const am = formLookup(vb, tense, p.key);
            if(!am) continue;
            if (direction==="am->en"){
              pool.push({ label: englishLabel(vb, tense, p.key), speakText: am, hint:`${vb.root} · ${p.label} · ${tense}`});
            } else {
              pool.push({ label: am, speakText: am, hint:`${vb.root} · ${p.label} · ${tense}`});
            }
          }
        }
      }
    }

    const correctObj = (()=>{
      if(direction==="am->en"){
        const am = isInf? verb.tenses.infinitive : formLookup(verb, tense, pron.key);
        return { label: englishLabel(verb, tense, pron.key), speakText: am||"", hint: `${verb.root}` };
      }else{
        const am = isInf? verb.tenses.infinitive : formLookup(verb, tense, pron.key);
        return { label: am, speakText: am||"", hint: `${verb.root}` };
      }
    })();

    const uniq = new Map(); uniq.set(String(correctObj.label), correctObj);
    const clean = pool.filter(o=>o && o.label && String(o.label).trim()!=="");
    while(uniq.size<4 && clean.length){ uniq.set(String(sample(clean).label), sample(clean)); }
    while(uniq.size<4){ uniq.set(Math.random().toString(36).slice(2), {label:"—", speakText:"", hint:""}); }
    setChoices(shuffle(Array.from(uniq.values())));
  }

  function resetRound(){
    const chosenVerb = pickFrom(verbSel, verbs);
    const nv = typeof chosenVerb === 'string' ? (verbs.find(v=>v.root===chosenVerb) || sample(verbs)) : (chosenVerb||sample(verbs));
    const baseTenseSel = mode==='pattern' ? patternTenseSel : tenseSel;
    const nt = pickFrom(baseTenseSel, ALL_TENSES);
    // pronoun sampling
    let np;
    if (mode==='pattern'){
      const base = patternPronSel==="random"? sample(PRONOUNS) : (PRONOUNS.find(p=>p.key===patternPronSel)||sample(PRONOUNS));
      np = base;
      setRp(base);
    }else{
      np = pronSel==="random"? sample(PRONOUNS) : (PRONOUNS.find(p=>p.key===pronSel)||sample(PRONOUNS));
      setRp(np);
    }
    setRv(nv); setRt(nt); setAnswer(""); setShow(false);
    buildChoices(nv, np, nt);
    setLastCorrect(null);
  }

  function check(){
    const correctLabel = direction==="am->en" ? correctEn : correctAm;
    const ok = (mode === "type") ? (answer.trim() === String(correctLabel)) : (answer === String(correctLabel));
    setShow(true); setStreak(s=> ok ? s+1 : 0); setLastCorrect(ok);
  }

  const pronLabel = PRONOUNS.find(p=>p.key===pronKey)?.label;
  const pillStyle = lastCorrect==null ? {} : (lastCorrect ? {background:"#16a34a", color:"#fff"} : {background:"#dc2626", color:"#fff"});

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h3>Verb Trainer <small className="pill" style={pillStyle}>Streak {streak}</small></h3>
        <button className="btn" onClick={()=>setShowSettings(v=>!v)}>{showSettings? 'Hide settings':'Show settings'}</button>
      </div>

      {showSettings && (
      <div className="row wrap">
        <label> Mode{" "}
          <select value={mode} onChange={(e)=>{ setMode(e.target.value); setLastCorrect(null); }}>
            <option value="choice">Multiple choice</option>
            <option value="type">Type</option>
            <option value="pattern">Pattern drill (same pronoun across verbs)</option>
          </select>
        </label>
        <label> Direction{" "}
          <select value={direction} onChange={(e)=>{ setDirection(e.target.value); setLastCorrect(null); }}>
            <option value="am->en">Amharic → English</option>
            <option value="en->am">English → Amharic</option>
          </select>
        </label>

        {mode!=="pattern" ? (
          <>
            <label> Tense{" "}
              <select value={tenseSel} onChange={(e)=> setTenseSel(e.target.value)}>
                <option value="random">(Random)</option>
                {ALL_TENSES.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label> Verb{" "}
              <select value={typeof verbSel==='string'?verbSel:"random"} onChange={(e)=> setVerbSel(e.target.value)}>
                <option value="random">(Random)</option>
                {verbs.map(x=> <option key={x.root} value={x.root} title={showTranslit?x.translit:undefined}>{x.root} — {x.meaning}</option>)}
              </select>
            </label>
            <label> Pronoun{" "}
              <select value={typeof pronSel==='string'?pronSel:"random"} onChange={(e)=> setPronSel(e.target.value)}>
                <option value="random">(Random)</option>
                {PRONOUNS.map(p=> <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </label>
          </>
        ) : (
          <>
            <label> Pattern tense{" "}
              <select value={patternTenseSel} onChange={(e)=> setPatternTenseSel(e.target.value)}>
                <option value="random">(Random)</option>
                {ALL_TENSES.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label> Pronoun{" "}
              <select value={typeof patternPronSel==='string'?patternPronSel:"random"} onChange={(e)=> setPatternPronSel(e.target.value)}>
                <option value="random">(Random each round)</option>
                {PRONOUNS.map(p=> <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </label>
          </>
        )}
      </div>
      )}

      <div className="panel">
        {direction === "am->en" ? (
          <div className="big" style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}} title={showTranslit? rv.translit: undefined}>
            {rt==="infinitive" ? rv.tenses.infinitive : (formLookup(rv, rt, pronKey)||"")}
          </div>
        ) : rt === "infinitive" ? (
          <div>Give the <b>infinitive</b> for <em>{rv.meaning}</em></div>
        ) : (
          <div>Conjugate <b style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}}>{rv.root}</b>{showTranslit? <span className="muted"> ({rv.translit})</span>: null} for <b>{pronLabel}</b> — <em>{rt}</em></div>
        )}
        <div className="row">
          <button className="btn ghost" onClick={()=>speak(rt==="infinitive"? rv.tenses.infinitive : (formLookup(rv, rt, pronKey)||""))}>🔊 Play</button>
        </div>
      </div>

      {mode === "type" ? (
        <div className="row">
          <input className="input" placeholder={direction === "en->am" ? (rt==="infinitive"?"Type infinitive" : "Type Amharic form") : "Type English (e.g., 'I – to go (present)')"} value={answer} onChange={(e)=>setAnswer(e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter") check(); }}/>
          <button className="btn primary" onClick={check}>Check</button>
          <button className="btn" onClick={resetRound}>Next ↻</button>
        </div>
      ) : (
        <div className="stack">
          <div className="grid">
            {(choices||[]).map((opt)=> {
              const correctLabel = direction === "am->en" ? correctEn : (rt==="infinitive"? rv.tenses.infinitive : correctAm);
              const isCorrect = String(opt.label) === String(correctLabel);
              const isPicked = show && String(answer) === String(opt.label);
              const variant = show ? (isCorrect ? 'correct' : (isPicked ? 'danger' : 'secondary')) : 'secondary';
              return (
                <div key={opt.label} className="row" title={opt.hint}>
                  <button className={`btn flex1 ${variant}`} onClick={()=>{ setAnswer(opt.label); const ok = String(opt.label)===String(correctLabel); setShow(true); setStreak(s=> ok ? s+1 : 0); setLastCorrect(ok); }}>{opt.label}</button>
                  <button className="btn ghost" onClick={()=>speak(opt.speakText||opt.label)}>🔊</button>
                </div>
              );
            })}
          </div>
          <div className="row">
            <button className="btn" onClick={()=>{ const usePron = (mode==="pattern") ? (patternPronSel==="random"? rp : PRONOUNS.find(x=>x.key===patternPronSel)) : rp; buildChoices(rv, usePron||rp, rt); setShow(false); setAnswer(""); setLastCorrect(null); }}>Shuffle choices ↻</button>
            <button className="btn" onClick={resetRound}>New round</button>
          </div>
        </div>
      )}

      {show && (<div className="note">Correct: <b style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}}>{rt==="infinitive"? rv.tenses.infinitive : correctAm}</b> — {correctEn}</div>)}

      {mode==='pattern' && (
        <div className="muted" style={{marginTop:8}}>
          Pattern drill: tests recognition of the <b>same pronoun</b> (or random per round) and <b>chosen/random tense</b> across different verbs.
        </div>
      )}
    </div>
  );
}

/********************
 * Pronoun Trainer (MC reversible)
 ********************/
function PronounQuiz({ data }){
  const { showTranslit } = useSettings();
  const [direction, setDirection] = useState("en->am");
  const [current, setCurrent] = useState(()=> sample(data.pronouns));
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(()=>{ makeRound(); }, [direction]);
  function makeRound(){
    const q = sample(data.pronouns);
    const pool = [...data.pronouns];
    const opts = new Set([q]);
    while(opts.size < 4){ opts.add(sample(pool)); }
    setCurrent(q); setChoices(shuffle(Array.from(opts))); setPicked(null);
  }

  const question = direction === "en->am" ? current.english : current.am;

  function select(opt){
    const correct = direction === "en->am" ? current.am : current.english;
    const isRight = (direction === "en->am" ? opt.am : opt.english) === correct;
    setPicked(opt); setStreak(s=> isRight ? s+1 : 0);
  }

  return (
    <div className="card">
      <h3>Pronoun Trainer <small className="pill">Streak {streak}</small></h3>
      <div className="row wrap">
        <label>Direction{" "}
          <select value={direction} onChange={(e)=>setDirection(e.target.value)}>
            <option value="en->am">English → Amharic</option>
            <option value="am->en">Amharic → English</option>
          </select>
        </label>
        <button className="btn" onClick={makeRound}>Next ↻</button>
      </div>
      <div className="center big" style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}} title={direction==="am->en"&&showTranslit?current.translit:undefined}>
        {question}
      </div>
      <div className="grid">
        {choices.map((opt)=>{
          const label = direction === "en->am" ? opt.am : opt.english;
          const correct = direction === "en->am" ? current.am : current.english;
          const isPicked = picked && ((direction === "en->am" ? picked.am : picked.english)===label);
          const isCorrect = label===correct;
          const variant = picked ? (isCorrect? 'correct' : (isPicked? 'danger' : 'secondary')) : 'secondary';
          return (
            <button key={opt.am} className={`btn ${variant}`} onClick={()=>select(opt)} title={direction==="am->en"&&showTranslit?opt.translit:undefined}>
              <span style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/********************
 * Dictionary (local)
 ********************/
function Dictionary({ data }){
  const [q, setQ] = useState("");
  const entries = useMemo(()=>{
    const list = [];
    for(const v of data.verbs){
      list.push({ type:"verb", am:v.root, translit:v.translit, en:v.meaning });
      for(const t of ["present","past","perfect","continuous"]){
        const forms = v.tenses[t]; if(!forms) continue;
        for(const k of Object.keys(forms)){
          list.push({ type:"verb-form", am:forms[k], translit:v.translit, en:`${k} – ${v.meaning} (${t})` });
        }
      }
      const neg = v.tenses.negative?.present || v.tenses.negative;
      if(neg){
        for(const k of Object.keys(neg)){
          list.push({ type:"verb-form", am:neg[k], translit:v.translit, en:`${k} – ${v.meaning} (negative)` });
        }
      }
      list.push({ type:"infinitive", am:v.tenses.infinitive, translit:v.translit, en:`${v.meaning} (infinitive)` });
    }
    for(const p of data.pronouns){ list.push({ type:"pronoun", am:p.am, translit:p.translit, en:p.english }); }
    for(const f of data.fidel){ f.series.forEach((g,i)=>{ list.push({ type:"fidel", am:g, translit:f.translit[i], en:f.base }); }); }
    return list;
  }, [data]);

  const results = entries.filter(e=> e.am.includes(q) || (e.en && e.en.toLowerCase().includes(q.toLowerCase())) || (e.translit && e.translit.toLowerCase().includes(q.toLowerCase()))).slice(0,200);

  return (
    <div className="card">
      <h3>Dictionary (local)</h3>
      <div className="row"><input className="input" placeholder="Search Amharic, English, or transliteration" value={q} onChange={(e)=>setQ(e.target.value)} /></div>
      <div className="list">
        {results.map((r, idx)=> (
          <div key={idx} className="list-item" title={r.translit||undefined}>
            <div className="am" style={{fontFamily:"'Noto Sans Ethiopic', system-ui, sans-serif"}}>{r.am}</div>
            <div className="small muted">{r.en}{r.translit?` · ${r.translit}`:""}</div>
            <button className="btn ghost" onClick={()=>speak(r.am)}>🔊</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/********************
 * Data Manager
 ********************/
function DataManager({ data, setData }){
  const taRef = useRef(null);
  const [valid, setValid] = useState(true);
  function exportJSON(){ const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="amharic-learning-data.json"; a.click(); URL.revokeObjectURL(url);}  
  function importJSON(e){ const file = e.target.files?.[0]; if(!file) return; const reader = new FileReader(); reader.onload = ()=>{ try{ setData(JSON.parse(String(reader.result))); setValid(true);}catch{ setValid(false);} }; reader.readAsText(file);}  
  function applyText(){ const raw = taRef.current?.value || ""; try{ setData(JSON.parse(raw)); setValid(true);}catch{ setValid(false);} }

  return (
    <div className="card">
      <h3>Word Bank & Data</h3>
      <div className="row wrap">
        <button className="btn" onClick={exportJSON}>Export</button>
        <label className="btn">Import<input type="file" accept="application/json" style={{display:'none'}} onChange={importJSON}/></label>
      </div>
      <div className="stack">
        <label>Live JSON (edit then Apply)</label>
        <textarea ref={taRef} defaultValue={JSON.stringify(data, null, 2)} rows={18} className="code"/>
        <div className="row">
          <button className="btn primary" onClick={applyText}>Apply</button>
          {!valid && <span className="warn">Invalid JSON</span>}
        </div>
      </div>
    </div>
  );
}

/********************
 * Help Panel & Diagnostics
 ********************/
function HelpPanel(){
  return (
    <div className="card">
      <h3>Help</h3>
      <ul className="bullets">
        <li><b>Verb Trainer:</b> Random Verb/Pronoun/Tense (default). Multiple‑choice by default (Amharic → English). <b>Pattern drill</b> = same pronoun, tense selectable or random, verbs vary.</li>
        <li><b>Pronoun Trainer:</b> multiple‑choice with reversible direction.</li>
        <li><b>Fidel Trainer:</b> multiple‑choice for 7 orders, with “Show base” toggle.</li>
        <li><b>Flashcards:</b> learn first; spaced repetition stored in your browser.</li>
        <li><b>Dictionary:</b> offline reference built from your deck (verbs & forms, pronouns, fidel).</li>
        <li>Toggle <b>Transliteration</b> & <b>Audio</b> in the header.</li>
      </ul>
    </div>
  );
}

function Diagnostics({ data }){
  const [tests, setTests] = useState([]);
  useEffect(()=>{
    const t = [];
    try {
      const go = data.verbs.find(v=>v.meaning==='to go');
      t.push({name:'forms-present-he-go', pass: !!go?.tenses?.present?.he});
      const poolPerfectHe = data.verbs.map(v=> v.tenses.perfect?.he).filter(Boolean).length;
      const poolPresentHe = data.verbs.map(v=> v.tenses.present?.he).filter(Boolean).length;
      t.push({name:'pattern-pool-perfect>=4', pass: poolPerfectHe>=4});
      t.push({name:'pattern-pool-present>=4', pass: poolPresentHe>=4});
      const negHe = data.verbs.map(v=> v.tenses.negative?.present?.he || v.tenses.negative?.he).filter(Boolean).length;
      t.push({name:'dictionary-has-negative>=3', pass: negHe>=3});
    } catch(e){ t.push({name:'diagnostics-runtime', pass:false, note:String(e)}); }
    setTests(t);
  }, [data]);

  const failed = tests.filter(x=>!x.pass);
  return (
    <div className="card">
      <h3>Diagnostics</h3>
      <ul className="bullets">
        {tests.map((t,i)=> (
          <li key={i} style={{color:t.pass? 'green':'#b45309'}}>{t.pass? '✓':'✗'} {t.name}{t.note?` — ${t.note}`:''}</li>
        ))}
      </ul>
      {failed.length? <div className="warn">Some checks failed — tell me which behaviour you expected.</div> : <div className="muted">All checks passed.</div>}
    </div>
  );
}

/********************
 * Flashcards Page (with content selectors, incl. negative)
 ********************/
function FlashcardsPage({ data }){
  const [incFidel, setIncFidel] = useState(true);
  const [incPron, setIncPron] = useState(true);
  const [incVerbRoots, setIncVerbRoots] = useState(true);
  const [incForms, setIncForms] = useState(true);
  const [tenses, setTenses] = useState({ present:true, past:true, perfect:true, continuous:true, negative:true });

  const items = useMemo(()=>{
    const list = [];
    if(incFidel){ list.push(...data.fidel.flatMap((f)=> f.series.map((g,idx)=>({type:"fidel", g, r:f.translit[idx], base:f.base })))); }
    if(incPron){ list.push(...data.pronouns.map(p=>({type:"pron", ...p}))); }
    if(incVerbRoots){ list.push(...data.verbs.map(v=>({type:"verb", ...v}))); }
    if(incForms){
      for(const v of data.verbs){
        if(tenses.present) for(const k of Object.keys(v.tenses.present||{})) list.push({ type:"verb-form", am:v.tenses.present[k], translit:v.translit, en:`${k} – ${v.meaning} (present)` });
        if(tenses.past) for(const k of Object.keys(v.tenses.past||{})) list.push({ type:"verb-form", am:v.tenses.past[k], translit:v.translit, en:`${k} – ${v.meaning} (past)` });
        if(tenses.perfect) for(const k of Object.keys(v.tenses.perfect||{})) list.push({ type:"verb-form", am:v.tenses.perfect[k], translit:v.translit, en:`${k} – ${v.meaning} (perfect)` });
        if(tenses.continuous) for(const k of Object.keys(v.tenses.continuous||{})) list.push({ type:"verb-form", am:v.tenses.continuous[k], translit:v.translit, en:`${k} – ${v.meaning} (continuous)` });
        if(tenses.negative) {
          const neg = v.tenses.negative?.present || v.tenses.negative;
          for(const k of Object.keys(neg||{})) list.push({ type:"verb-form", am:neg[k], translit:v.translit, en:`${k} – ${v.meaning} (negative)` });
        }
      }
    }
    return list;
  }, [data, incFidel, incPron, incVerbRoots, incForms, tenses]);

  return (
    <div className="stack">
      <div className="card">
        <h3>Flashcard content</h3>
        <div className="row wrap">
          <label><input type="checkbox" checked={incFidel} onChange={(e)=>setIncFidel(e.target.checked)}/> Fidel</label>
          <label><input type="checkbox" checked={incPron} onChange={(e)=>setIncPron(e.target.checked)}/> Pronouns</label>
          <label><input type="checkbox" checked={incVerbRoots} onChange={(e)=>setIncVerbRoots(e.target.checked)}/> Verb roots (infinitives)</label>
          <label><input type="checkbox" checked={incForms} onChange={(e)=>setIncForms(e.target.checked)}/> Conjugated forms</label>
        </div>
        {incForms && (
          <div className="row wrap">
            {Object.keys(tenses).map(k=> (
              <label key={k}><input type="checkbox" checked={tenses[k]} onChange={(e)=> setTenses(s=> ({...s, [k]: e.target.checked}))}/> {k}</label>
            ))}
          </div>
        )}
      </div>
      <Flashcards
        items={items}
        idOf={(it)=> it.type+":"+(it.g||it.am||it.root)}
        renderFront={(it)=> {
          if(it.type==="fidel") return <div className="center big" style={{fontFamily:"'Noto Sans Ethiopic'"}}>{it.g}</div>;
          if(it.type==="pron") return <div className="center big" style={{fontFamily:"'Noto Sans Ethiopic'"}}>{it.am}</div>;
          if(it.type==="verb-form") return <div className="center big" style={{fontFamily:"'Noto Sans Ethiopic'"}}>{it.am}</div>;
          return <div className="center"><div className="big" style={{fontFamily:"'Noto Sans Ethiopic'"}}>{it.root}</div><div className="muted">{it.translit}</div></div>;
        }}
        renderBack={(it)=>{
          if(it.type==="fidel") return <div className="center">{it.r}</div>;
          if(it.type==="pron") return <div className="center">{it.english} · {it.translit}</div>;
          if(it.type==="verb-form") return <div className="center">{it.en}</div>;
          return <div className="center">{it.meaning}</div>;
        }}
      />
    </div>
  );
}

/********************
 * App
 ********************/
function App(){
  const [data, setData] = useLocalData();
  const [tab, setTab] = useState("verbs");
  const [showTranslit, setShowTranslit] = useState(false);
  const [tts, setTts] = useState(true);

  return (
    <SettingsCtx.Provider value={{ showTranslit, setShowTranslit, tts, setTts }}>
      <div className="container">
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;600&display=swap" rel="stylesheet"/>

        <header className="header">
          <h1>Amharic Learning Tool</h1>
          <div className="spacer"/>
          <label className="switch"><input type="checkbox" checked={showTranslit} onChange={(e)=>setShowTranslit(e.target.checked)}/> Show transliteration</label>
          <label className="switch"><input type="checkbox" checked={tts} onChange={(e)=>setTts(e.target.checked)}/> Audio</label>
        </header>

        <nav className="tabs">
          {["fidel","verbs","pron","flash","dict","data","help"].map((id)=> (
            <button key={id} className={`tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{({fidel:'Fidel',verbs:'Verbs',pron:'Pronouns',flash:'Flashcards',dict:'Dictionary',data:'Word Bank',help:'Help'})[id]}</button>
          ))}
        </nav>

        <main className="main">
          {tab==="fidel" && <FidelQuiz data={data}/>} 
          {tab==="verbs" && <VerbQuiz data={data}/>} 
          {tab==="pron" && <PronounQuiz data={data}/>} 
          {tab==="flash" && <FlashcardsPage data={data}/>} 
          {tab==="dict" && <Dictionary data={data}/>} 
          {tab==="data" && <DataManager data={data} setData={setData}/>} 
          {tab==="help" && (<><HelpPanel/><Diagnostics data={data}/></>)}
        </main>

        <style>{`
          :root { --fg:#111; --bg:#fff; --muted:#666; --pri:#f59e0b; --sec:#e5e7eb; --danger:#dc2626; --success:#16a34a; }
          *{ box-sizing:border-box; }
          body,html,#root{ margin:0; height:100%; }
          .container{ padding:16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color:var(--fg); background:var(--bg); min-height:100vh; }
          .header{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }
          .spacer{ flex:1; }
          .tabs{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
          .tab{ padding:6px 10px; border:1px solid var(--sec); background:#fff; border-radius:8px; }
          .tab.active{ background:var(--pri); color:#fff; border-color:var(--pri); }
          .main{ display:block; }
          .card{ border:1px solid var(--sec); border-radius:12px; padding:12px; margin:8px auto; max-width:960px; background:#fff; }
          .panel{ border:1px solid var(--sec); border-radius:12px; padding:12px; background:#fafafa; margin:8px 0; }
          .row{ display:flex; align-items:center; gap:8px; }
          .row.wrap{ flex-wrap:wrap; }
          .grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:8px; margin:8px 0; }
          .stack{ display:flex; flex-direction:column; gap:8px; }
          .btn{ padding:8px 10px; border:1px solid var(--sec); border-radius:10px; background:#fff; cursor:pointer; }
          .btn.primary{ background:var(--pri); color:#fff; border-color:var(--pri); }
          .btn.secondary{ background:#f3f4f6; }
          .btn.danger{ background:var(--danger); color:#fff; border-color:var(--danger); }
          .btn.correct{ background:var(--success); color:#fff; border-color:var(--success); }
          .btn.ghost{ background:#fff; }
          .flex1{ flex:1; }
          .input{ padding:8px 10px; border:1px solid var(--sec); border-radius:10px; min-width:260px; }
          .code{ width:100%; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; padding:8px; border:1px solid var(--sec); border-radius:10px; }
          .center{ text-align:center; }
          .big{ font-size:38px; }
          .muted{ color:var(--muted); }
          .pill{ font-size:12px; background:#eef2ff; color:#3730a3; padding:2px 8px; border-radius:999px; margin-left:8px; }
          .note{ font-size:14px; color:#0f5132; background:#d1e7dd; border:1px solid #badbcc; padding:8px 10px; border-radius:10px; margin-top:8px; }
          .warn{ color:#b45309; }
          .list{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:8px; }
          .list-item{ border:1px solid var(--sec); border-radius:10px; padding:10px; display:flex; gap:10px; align-items:center; justify-content:space-between; }
          .list-item .am{ font-size:24px; }
          .switch{ display:flex; align-items:center; gap:6px; padding:6px 8px; border:1px solid var(--sec); border-radius:10px; }
          .bullets{ margin:0; padding-left:18px; }
        `}</style>
      </div>
    </SettingsCtx.Provider>
  );
}

export default App;