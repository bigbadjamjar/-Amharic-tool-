/* ---------- English meaning of each verb form ----------
   enForm(v, tense, i) turns a verb's English gloss into the English for one
   cell of the verb table, so learners see what the Amharic form says:
   "I walked", "you did not walk", "she walks / will walk", "let us walk".
   Person i follows PR: I, you (m), you (f), he, she, we, you (pl), they. */

// Irregular verbs: base -> [past, past participle]
const EN_IRR = {
  be:["was","been"], have:["had","had"], do:["did","done"], go:["went","gone"], say:["said","said"],
  eat:["ate","eaten"], drink:["drank","drunk"], come:["came","come"], get:["got","got"], speak:["spoke","spoken"],
  sleep:["slept","slept"], read:["read","read"], write:["wrote","written"], hear:["heard","heard"], see:["saw","seen"],
  ring:["rang","rung"], begin:["began","begun"], buy:["bought","bought"], give:["gave","given"], sell:["sold","sold"],
  pay:["paid","paid"], stand:["stood","stood"], sit:["sat","sat"], hurt:["hurt","hurt"], meet:["met","met"],
  become:["became","become"], wear:["wore","worn"], put:["put","put"], send:["sent","sent"], fit:["fitted","fitted"],
  choose:["chose","chosen"], strike:["struck","struck"], hit:["hit","hit"], forget:["forgot","forgotten"], run:["ran","run"],
  steal:["stole","stolen"], hang:["hung","hung"], break:["broke","broken"], sew:["sewed","sewn"], draw:["drew","drawn"],
  make:["made","made"], cut:["cut","cut"], grow:["grew","grown"], feel:["felt","felt"], lend:["lent","lent"],
  spend:["spent","spent"], think:["thought","thought"], show:["showed","shown"], keep:["kept","kept"], teach:["taught","taught"],
  leave:["left","left"], bring:["brought","brought"], tell:["told","told"], find:["found","found"], fall:["fell","fallen"],
  take:["took","taken"], know:["knew","known"], sing:["sang","sung"], catch:["caught","caught"], shut:["shut","shut"],
  sweep:["swept","swept"], set:["set","set"], bear:["bore","borne"], wake:["woke","woken"], drive:["drove","driven"],
  feed:["fed","fed"], hold:["held","held"], let:["let","let"], understand:["understood","understood"], burst:["burst","burst"],
  lie:["lay","lain"], weep:["wept","wept"], light:["lit","lit"], mean:["meant","meant"], win:["won","won"], lose:["lost","lost"],
  build:["built","built"], fly:["flew","flown"], swim:["swam","swum"], throw:["threw","thrown"], blow:["blew","blown"],
  forbid:["forbade","forbidden"], shake:["shook","shaken"], rise:["rose","risen"], arise:["arose","arisen"], bite:["bit","bitten"],
  hide:["hid","hidden"], ride:["rode","ridden"], tear:["tore","torn"], beat:["beat","beaten"], seek:["sought","sought"],
  spread:["spread","spread"], cost:["cost","cost"], quit:["quit","quit"], dig:["dug","dug"], stick:["stuck","stuck"],
  overcome:["overcame","overcome"], withdraw:["withdrew","withdrawn"], undo:["undid","undone"]
};
// Longer verbs that still double the last letter in British spelling
const EN_DOUBLE = /^(permit|admit|cancel|prefer|refer|quarrel|compel|control|equip|travel|label|model|signal|worship|regret|commit|occur|omit|patrol|rebel|transfer|propel|kidnap|annul|level|total|marvel|fulfil|instil|appal|enrol|distil|expel|excel|repel|dispel|unwrap|upset)$/;
// Glosses that read better with a different English verb
const EN_SPECIAL = { "it became evening":"reach evening", "was, there was (past of ነው and አለ)":"be", "be (am, is, are)":"be",
  "become morning, dawn":"reach morning", "have made, have repaired":"have something made" };

function enRegPast(b){
  if(/e$/.test(b)) return b+"d";
  if(/[^aeiou]y$/.test(b)) return b.slice(0,-1)+"ied";
  if(EN_DOUBLE.test(b) || /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(b)) return b+b.slice(-1)+"ed";
  return b+"ed";
}
function en3sg(b){
  if(b==="be") return "is";
  if(b==="have") return "has";
  if(/(s|sh|ch|x|z|o)$/.test(b)) return b+"es";
  if(/[^aeiou]y$/.test(b)) return b.slice(0,-1)+"ies";
  return b+"s";
}
// "get used to (a place, each other)" -> {b:"get", rest:"used to"}
function enParse(gloss){
  let g = EN_SPECIAL[gloss] || gloss;
  g = g.replace(/\((something|someone)\)/g,"$1").replace(/\([^)]*\)/g,"");
  g = g.split(/[;,]/)[0].replace(/\s+/g," ").trim();
  if(!g) g = "do";
  const w = g.split(" ");
  return {b:w[0].toLowerCase(), rest:w.slice(1).join(" ")};
}
function enVerb(v){
  if(v._en) return v._en;
  const {b,rest} = enParse(v.en||"");
  const irr = EN_IRR[b];
  return v._en = {b, rest, s:en3sg(b), past:irr?irr[0]:enRegPast(b), pp:irr?irr[1]:enRegPast(b)};
}

const EN_WHO = ["I","you","you","he","she","we","you","they"];
const EN_TAG = ["","m","f","","","","pl",""];
const EN_OBJ = ["me","","","him","her","us","","them"];
const EN_SELF = ["myself","yourself","yourself","himself","herself","ourselves","yourselves","themselves"];
const enIs3 = i => i===3||i===4;

/* Returns {text, tag}: tag is "m", "f" or "pl" for the three kinds of "you". */
function enForm(v, tense, i){
  const e = enVerb(v), who = EN_WHO[i], be = e.b==="be", r = e.rest ? " "+e.rest.replace(/\boneself\b/,EN_SELF[i]) : "";
  const am = i===0?"am":enIs3(i)?"is":"are", was = (i===0||enIs3(i))?"was":"were";
  const pres = be ? am : enIs3(i) ? e.s : e.b;
  let t;
  switch(tense){
    case "past":    t = `${who} ${be?was:e.past}${r}`; break;
    case "pastNeg": t = be ? `${who} ${was} not${r}` : `${who} did not ${e.b}${r}`; break;
    case "pres":    t = `${who} ${pres}${r} / will ${e.b}${r}`; break;
    case "presNeg": t = be ? `${who} ${am} not${r} / won't be${r}`
                           : `${who} ${enIs3(i)?"doesn't":"don't"} ${e.b}${r} / won't ${e.b}${r}`; break;
    case "short":   t = `(that) ${who} ${pres}${r}`; break;
    case "cmd":     t = EN_OBJ[i] ? `let ${EN_OBJ[i]} ${e.b}${r}` : `${e.b}${r}!`; break;
    case "cmdNeg":  t = EN_OBJ[i] ? `let ${EN_OBJ[i]} not ${e.b}${r}` : `don't ${e.b}${r}!`; break;
    case "ger":     t = `${who} ${be?was:e.past}${r} and …`; break;
    case "perf":    t = `${who} ${enIs3(i)?"has":"have"} ${e.pp}${r}`; break;
    default:        t = who;
  }
  return {text:t, tag:EN_TAG[i]};
}
