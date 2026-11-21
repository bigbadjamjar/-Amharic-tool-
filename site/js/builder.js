/* ---------- sentence builder ----------
   The learner sees an English sentence and builds the Amharic one word at a time.
   Each slot offers the right word plus wrong ones, drawn fresh every time a slot is filled:
     verb      the same verb in the wrong person or tense, or a different verb in the right form
     pronoun   the other pronouns
     when/what other time words, other nouns
     anything  words from course sentences of nearby units
   A question stores only plain data ("d" says how to make wrong answers), so it can be
   saved with the mistakes and rebuilt later.  Needs engine.js and the data files. */

const bRand = n => Math.floor(Math.random()*n);
const bPick = a => a[bRand(a.length)];
const bShuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=bRand(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; };
const B_PUNCT = /[?!.,;:"“”‘’()…።፣፤፡፥፦፧]/g;
const bClean = w => w.replace(B_PUNCT,"").trim();

// where each tense is first taught (99 = not yet). Keep in step with TMIN in app.js.
const B_TMIN = {past:9,pastNeg:9,pres:8,presNeg:8,cmd:12};
const B_TENSES = ["past","pastNeg","pres","presNeg","cmd"];
const B_SUBJ = ["I","you (m)","you (f)","he","she","we","you (pl)","they"];

// spellings that mean the same thing: never offer one as a wrong answer for the other
const B_SAME = [["ነች","ናት"]];
const bSame = (a,b) => a===b || B_SAME.some(g=>g.includes(a)&&g.includes(b));
const bVerb = h => VLIST.find(v=>v.head===h);
const bForm = (h,t,i) => { const v=bVerb(h); const f=v&&vforms(v)[t]; return f&&f[i]; };
const bUsable = x => x && x.am && !/[…\-]/.test(x.am);

/* --- wrong answers for one slot --- */
function bVerbPool(kind){
  if(kind==="b") return BVERBS.map(b=>b[0]);
  if(kind==="fixed") return VLIST.filter(v=>v.fixed).map(v=>v.head||v.rom);
  return VLIST.filter(v=>v.lesson<99&&!v.fixed).map(v=>v.head);
}
function bHead(v){ return v.head||v.rom; }      // fixed verbs (ነው, አለ, ነበረ) have no head
function bVerbByKey(k){ return VLIST.find(v=>bHead(v)===k); }
/* Settings (all optional):
     mode    "forms"  only other forms of the same word: the verb in other persons and tenses
                      (other slots use words of the same kind: pronouns, time words, nouns)
             "mixed"  forms of the same word plus other words of the same kind (the default)
             "any"    words drawn from anywhere in the course, so you need to know the meaning
     n       how many tiles to show, the right one included
     tenses  which tenses to use, both for made-up sentences and for wrong-tense choices
     upto    only use course units up to this one */
const B_DEFAULT = {mode:"mixed",n:4,tenses:B_TENSES.slice(),upto:0};
const bOpt = o => { const r=Object.assign({},B_DEFAULT); for(const k in (o||{})) if(o[k]!=null) r[k]=o[k]; if(!r.tenses.length) r.tenses=B_TENSES.slice(); return r; };
let B_ANY=null;
function bAnyPool(){            // every word from the course sentences and the made-up ones, plus some verb forms
  if(B_ANY) return B_ANY;
  const seen=new Set(); B_ANY=[];
  const add=(x,l)=>{ if(x&&x.am&&!seen.has(x.am)){seen.add(x.am);B_ANY.push({am:x.am,rom:x.rom||"",l});} };
  SENT.forEach(s=>bTokens(s).forEach(t=>add(t,s.l)));
  BTIME.concat(BWHEN_MORE,Object.values(BOBJ).flat()).forEach(x=>add({am:x[0],rom:x[1]},1));
  BVERBS.forEach(b=>{ const v=bVerb(b[0]); if(!v)return; const f=vforms(v); B_TENSES.forEach(t=>[0,3,5,7].forEach(i=>bUsable(f[t]&&f[t][i])&&add(f[t][i],v.lesson))); });
  return B_ANY;
}
// The candidates for one slot, sorted by kind of mistake.
function bWrongs(w,o){
  o=bOpt(o);
  const d=w.d||{}, ok=w.am, K={person:[],tense:[],verb:[],same:[],forms:[],any:[]};
  if(d.k==="verb"){
    const v=bVerbByKey(d.h); const f=v&&vforms(v);
    if(f&&d.t==="vn"){         // "to do", "to go": other verbs' -ing nouns, and this verb in other forms
      bVerbPool(d.p).forEach(h=>{ if(h===d.h)return; const x=bVerbByKey(h), g=x&&vforms(x).vn; if(bUsable(g)) K.verb.push(g); });
      K.forms=["pres","past","cmd","presNeg"].map(t=>f[t]&&f[t][t==="cmd"?1:3]).filter(bUsable);
    }else if(f){
      for(let j=0;j<8;j++) if(j!==d.i&&f[d.t]&&bUsable(f[d.t][j])) K.person.push(f[d.t][j]);
      const ts=o.tenses.filter(t=>t!==d.t&&f[t]&&bUsable(f[t][d.i]));
      ts.forEach(t=>K.tense.push(f[t][d.i]));
      bVerbPool(v.fixed?"fixed":d.p).forEach(h=>{ if(h===d.h)return; const x=bVerbByKey(h), g=x&&vforms(x)[d.t]; if(g&&bUsable(g[d.i])) K.verb.push(g[d.i]); });
    }
  }else if(d.k==="pr"){
    K.same=PR.filter((_,j)=>j!==d.i);
  }else if(d.k==="set"){
    const set = d.s==="when" ? BTIME.concat(BWHEN_MORE) : Object.values(BOBJ).flat();
    K.same=set.map(x=>({am:x[0],rom:x[1]}));
  }else if(d.k==="near"){
    const skip=new Set(d.skip||[]), seen=new Set();
    SENT.filter(s=>Math.abs(s.l-d.l)<=3).forEach(s=>bTokens(s).forEach(t=>{ if(!skip.has(t.am)&&!seen.has(t.am)){seen.add(t.am);K.same.push(t);} }));
  }
  const skip=new Set(d.skip||[]);
  K.any=bAnyPool().filter(x=>(!o.upto||x.l<=o.upto)&&!skip.has(x.am));
  for(const k in K) if(Array.isArray(K[k])){ const seen=new Set(); K[k]=K[k].filter(x=>x&&x.am&&!bSame(x.am,ok)&&!seen.has(x.am)&&seen.add(x.am)); }
  return K;
}
// The right word plus n-1 wrong ones. The kinds the mode asks for come first, one of each,
// and only if they run out are other kinds used to make up the number.
function bOptions(w,o){
  if(typeof o==="number") o={n:o};
  o=bOpt(o);
  const K=bWrongs(w,o), n=o.n, picked=[], seen=new Set([w.am]);
  const want = o.mode==="forms" ? [K.person,K.tense,K.forms,K.same]
             : o.mode==="any"   ? [K.any]
             :                    [K.person,K.tense,K.verb,K.forms,K.same];
  const backup = [K.person,K.tense,K.verb,K.forms,K.same,K.any];
  const take=x=>{ if(x&&!seen.has(x.am)&&!bSame(x.am,w.am)){seen.add(x.am);picked.push({am:x.am,rom:x.rom||""});} };
  const kinds=want.map(bShuffle);
  bShuffle(kinds).forEach(k=>{ if(picked.length<n-1) take(k[0]); });
  bShuffle(kinds.flat()).forEach(x=>{ if(picked.length<n-1) take(x); });
  bShuffle(backup.flat()).forEach(x=>{ if(picked.length<n-1) take(x); });
  return bShuffle(picked.concat([{am:w.am,rom:w.rom||"",ok:true}]));
}

/* --- made-up sentences from the verb engine --- */
const bCap = s => s[0].toUpperCase()+s.slice(1);
function bEnglish(b,t,i,time,obj){
  const [,base,third,past]=b, he=i===3||i===4, o=obj?" "+obj[2]:"", when=time&&time[2]!=="always"?" "+time[2]:"";
  if(t==="cmd"){
    if(i===5) return "Let's "+base+o+when;
    return bCap(base)+o+when+"! ("+(i===1?"to a man":i===2?"to a woman":"to a group")+")";
  }
  let vp;
  if(t==="past") vp=past;
  else if(t==="pastNeg") vp="did not "+base;
  else if(t==="pres") vp=time&&time[0]==="ነገ"?"will "+base : time&&time[2]==="always"?"always "+(he?third:base) : (he?third:base);
  else vp=time&&time[0]==="ነገ"?"will not "+base : (he?"does not ":"do not ")+base;
  return bCap(B_SUBJ[i])+" "+vp+o+when;
}
// upto: only verbs and tenses the course has reached by that unit (leave out for all); only: tenses to choose from
function bMakeVerbSentence(upto,only){
  const N=upto||99;
  const verbs=BVERBS.filter(b=>{const v=bVerb(b[0]);return v&&v.lesson<=N;});
  const tenses=B_TENSES.filter(t=>B_TMIN[t]<=N&&(!only||!only.length||only.includes(t)));
  if(!verbs.length||!tenses.length) return null;
  const b=bPick(verbs), t=bPick(tenses);
  const i = t==="cmd" ? bPick([1,2,6,5]) : bRand(8);
  const f=bForm(b[0],t,i); if(!bUsable(f)) return null;
  const times=BTIME.filter(x=>x[3].split(" ").includes(t));
  const time = t!=="cmd"&&times.length&&Math.random()<0.75 ? bPick(times) : null;
  const obj = b[4] ? bPick(BOBJ[b[4]]) : null;
  const words=[];
  if(t!=="cmd") words.push({am:PR[i].am,rom:PR[i].rom,d:{k:"pr",i}});
  if(time) words.push({am:time[0],rom:time[1],d:{k:"set",s:"when"}});
  if(obj) words.push({am:obj[0],rom:obj[1],d:{k:"set",s:"what"}});
  words.push({am:f.am,rom:f.rom,d:{k:"verb",h:b[0],t,i,p:"b"}});
  return {en:bEnglish(b,t,i,time,obj),words};
}

/* --- course sentences, with each word tagged so it gets sensible wrong answers --- */
let B_INDEX=null;    // Amharic word -> {h,t,i} for every course verb form
function bIndex(){
  if(B_INDEX) return B_INDEX;
  B_INDEX=new Map();
  VLIST.filter(v=>v.lesson<99).forEach(v=>{ const f=vforms(v);
    B_TENSES.forEach(t=>(f[t]||[]).forEach((x,i)=>{ if(bUsable(x)&&!x.am.includes(" ")&&!B_INDEX.has(x.am)) B_INDEX.set(x.am,{k:"verb",h:bHead(v),t,i,p:"c"}); }));
    if(bUsable(f.vn)&&!f.vn.am.includes(" ")&&!B_INDEX.has(f.vn.am)) B_INDEX.set(f.vn.am,{k:"verb",h:bHead(v),t:"vn",i:0,p:"c"}); });
  B_SAME.forEach(g=>g.forEach(a=>{ const b=g.find(x=>B_INDEX.has(x)); if(b&&!B_INDEX.has(a)) B_INDEX.set(a,B_INDEX.get(b)); }));
  return B_INDEX;
}
function bTokens(s){
  const am=s.am.split(/\s+/).map(bClean).filter(Boolean);
  const rom=s.rom.split(/\s+/).map(w=>w.replace(/[?!.,;:"“”()…]/g,"")).filter(Boolean);
  return am.map((w,j)=>({am:w,rom:rom.length===am.length?rom[j]:""}));
}
function bCourseSentence(s){
  const toks=bTokens(s), idx=bIndex(), all=toks.map(t=>t.am);
  return {en:s.en, words:toks.map(t=>{
    const p=PR.findIndex(x=>x.am===t.am);
    const d = p>=0 ? {k:"pr",i:p} : idx.get(t.am) || {k:"near",l:s.l,skip:all};
    return {am:t.am,rom:t.rom,d};
  })};
}
