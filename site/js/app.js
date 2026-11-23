/* ---------- verbs: look up, flashcards, questions ---------- */
const TNAME={}; TENSES.forEach(t=>TNAME[t[0]]=t[1]);
const inLesson=(v,L)=>L==="all"||v.lesson===+L||!!(LMAP[+L].review&&LMAP[+L].review.includes(v.lesson));
const vTenses=v=>TENSES.filter(t=>vforms(v)[t[0]]);
const vMatch=()=>{
  const q=S.v.q.trim().toLowerCase(), L=S.v.lesson;
  return VLIST.map((v,i)=>[v,i]).filter(([v])=>inLesson(v,L)&&(!q||v.en.toLowerCase().includes(q)||v.am.includes(q)||modern(v.rom).includes(q)));
};
const lessonSelect=(id,val)=>`<select id="${id}" class="sel" aria-label="Unit"><option value="all">All units</option>`+
  LESSONS.filter(l=>VLIST.some(v=>inLesson(v,l.n))).map(l=>`<option value="${l.n}" ${String(val)===String(l.n)?"selected":""}>Unit ${l.n}${l.review?" (review)":""}</option>`).join("")+`</select>`;
function vListHTML(){
  const m=vMatch(), show=m.slice(0,60);
  if(!m.length) return `<p class="count">No verbs match.</p>`;
  return `<div class="vgrid">`+show.map(([v,i])=>`<button class="vitem" data-act="vsel" data-v="${i}" aria-pressed="${i===S.v.sel}"><span class="am">${esc(v.am)}</span><small>${esc(v.en)}</small></button>`).join("")+`</div>`+
    (m.length>show.length?`<p class="count">Showing 60 of ${m.length}. Search or pick a unit to narrow the list.</p>`:"");
}
function vPanel(){
  const v=VLIST[S.v.sel], f=vforms(v), av=vTenses(v); if(!f[S.v.tense])S.v.tense=av[0][0];
  const t=S.v.tense, info=TENSES.find(x=>x[0]===t);
  let h=`<div class="note" id="vpanel"><h4><span class="am" style="font-size:1.5rem">${esc(v.am)}</span> <span class="rom">${esc(modern(v.rom))}</span></h4>
    <p><b>${esc(v.en)}</b> ${LMAP[v.lesson]?`<span class="count">· unit ${v.lesson}</span>`:""}</p>
    ${f.vn?`<p class="count">“-ing” noun: <span class="am">${esc(f.vn.am)}</span> <span class="rom">${esc(f.vn.rom)}</span> · doer: <span class="am">${esc(f.part.am)}</span> <span class="rom">${esc(f.part.rom)}</span></p>`:`<p class="count">This verb has only the forms below. For “will be” use <span class="am">ሆነ</span>; for commands use <span class="am">ሁን</span> “be!”.</p>`}</div>`;
  h+=chips("vtense",av.map(x=>[x[0],x[1]]),t)+`<p class="count" style="margin:6px 0 8px">${esc(info[2])}</p><div class="tbl vtbl">`;
  PR.forEach((p,i)=>{h+=`<div class="row"><span class="who">${p.am}</span><span class="form">${A(f[t][i].am,f[t][i].rom)}</span>${enCell(v,t,i)}</div>`;});
  return h+`</div><p class="count" style="margin-top:6px">The English on the right shows what each form means${t==="pres"||t==="presNeg"?". This tense covers both now and the future":""}. <span class="ptag">m</span> <span class="ptag">f</span> <span class="ptag">pl</span> mark “you” said to a man, a woman, or more than one person.</p>`;
}
// make an over-long name (from an old profile or backup) smaller until it fits its fixed box
function fitName(el){
  if(!el) return; el.style.fontSize="";
  for(let f=0.8; f>=0.6 && el.scrollWidth>el.clientWidth+1; f-=0.05) el.style.fontSize=f.toFixed(2)+"rem";
}
addEventListener("resize",()=>fitName(document.querySelector("#whobtn .nm")));
function enCell(v,t,i){
  const e=enForm(v,t,i);
  return `<span class="en">${esc(e.text)}${e.tag?` <span class="ptag">${e.tag}</span>`:""}</span>`;
}
function vNewCard(){
  const C=S.v, pool=VLIST.filter(v=>inLesson(v,C.clesson));
  const v=pick(pool.length?pool:VLIST);
  if(C.deck==="mean"){C.card={v};}
  else{let w=v, t=C.ctense==="any"?pick(vTenses(w))[0]:C.ctense;
    if(!vforms(w)[t]){const ok=(pool.length?pool:VLIST).filter(x=>vforms(x)[t]);if(ok.length)w=pick(ok);else t=pick(vTenses(w))[0];}
    C.card={v:w,t,i:ri(8)};}
  C.flip=false;
}
function vCards(){
  const C=S.v; if(!C.card||(C.deck==="conj")!==("t" in C.card)) vNewCard();
  const {v,t,i}=C.card;
  let h=`<div class="bar">${mini("vdeck",[["mean","Meanings"],["conj","Conjugations"]],C.deck)}${lessonSelect("vclesson",C.clesson)}</div>`;
  if(C.deck==="conj") h+=`<select id="vctense" class="sel" aria-label="Tense" style="margin-bottom:10px;width:100%"><option value="any">Any tense</option>`+TENSES.map(x=>`<option value="${x[0]}" ${C.ctense===x[0]?"selected":""}>${x[1]}</option>`).join("")+`</select>`;
  if(C.deck==="mean"){
    h+=`<button class="flash" data-act="vflip" aria-label="Flip card">${A(v.am,modern(v.rom))}`+(C.flip?`<span class="en">${esc(v.en)}</span>`:`<span class="hint">Tap to see the meaning</span>`)+`</button><div class="bigbtns">${sayBtn(v.am,"big")}${canSay(v.am)?micBtn(v.am):""}</div>`;
  }else{
    const f=vforms(v)[t][i];
    h+=`<button class="flash" data-act="vflip" aria-label="Flip card"><span class="count">${esc(TNAME[t])}</span>
      <span class="am" style="font-size:1.7rem">${PR[i].am} · ${esc(v.am)}</span><span class="count">${esc(subj(i))} · ${esc(v.en)}</span>`+
      (C.flip?`<span class="am" style="margin-top:8px">${esc(f.am)}</span><span class="rom">${esc(f.rom)}</span><span class="en">${esc(enForm(v,t,i).text)}</span>`:`<span class="hint">Say the form, then tap to check</span>`)+`</button>`+(C.flip?sayBtn(f.am,"big"):"");
  }
  return h+`<div class="btns" style="grid-template-columns:1fr 2fr"><button class="btn" data-act="vflip">${C.flip?"Hide":"Show"}</button><button class="btn primary" data-act="vnext">Next card</button></div>
    <p class="count" style="text-align:center;margin-top:10px">Cards are drawn at random from ${C.clesson==="all"?"all "+VLIST.length+" verbs":"unit "+C.clesson}. Only units that teach verbs are listed.</p>`;
}
function refVerbs(){
  let h=`<h2>Verbs</h2><p class="lead">All ${VLIST.length} verbs, each in nine tenses for every person. The ones used in the course are tagged with their unit.</p>
    <div class="bar">${mini("vview",[["look","Look up"],["cards","Flashcards"]],S.v.view)}</div>`;
  if(S.v.view==="cards") return h+vCards();
  h+=`<div class="bar" style="margin-top:0"><input id="vsearch" class="sel" style="flex:1;min-width:0" type="search" placeholder="Search English or Amharic" value="${esc(S.v.q)}" autocomplete="off">${lessonSelect("vlesson",S.v.lesson)}</div>
    <div id="vlist">${vListHTML()}</div>`;
  return h+vPanel()+`<div class="tip">The forms are built by rule from each verb's class, and checked against the tables in the course. For a rare verb, treat an unusual-looking form with care.</div>`;
}
function qVerbType(v0,TS0){
  for(let g=0;g<60;g++){
    const v=v0||pick(VLIST), f=vforms(v), t=pick(TS0||vTenses(v))[0], i=ri(8), x=f[t][i];
    if(x&&x.am&&x.am.length>1&&!/[…\-]/.test(x.am)) return {type:"type",kind:"Verbs · type it",big:PR[i].am+" · "+v.am,bigAm:true,sub:`${subj(i)} · ${v.en} · ${TNAME[t].toLowerCase()}`,answer:x.am,rom:x.rom,srs:"v:"+v.am};
  }
}
function qVerb(v0,TS0){
  const v=v0||pick(VLIST), f=vforms(v), TS=vTenses(v), t=pick(TS0||TS)[0], i=ri(8), ok=f[t][i];
  const alt=[];
  for(let j=0;j<8;j++) if(j!==i&&f[t][j].am!==ok.am) alt.push({k:[t,j],x:f[t][j]});
  TS.forEach(x=>{if(x[0]!==t&&f[x[0]][i].am!==ok.am) alt.push({k:[x[0],i],x:f[x[0]][i]});});
  if(ri(2)) return tag(mk("Verbs · "+TNAME[t],PR[i].am+" · "+v.am,true,`${subj(i)} · ${v.en}`,{l:ok.am,r:ok.rom},alt.map(a=>({l:a.x.am,r:a.x.rom})),true),"v:"+v.am);
  const lab=(tt,j)=>subj(j)+" · "+TNAME[tt];
  const same=k=>f[k[0]][k[1]].am===ok.am;
  const wr=[];
  for(let j=0;j<8;j++) if(j!==i&&!same([t,j])) wr.push({l:lab(t,j)});
  TS.forEach(x=>{if(x[0]!==t&&!same([x[0],i])) wr.push({l:lab(x[0],i)});});
  return tag(mk("Verbs",ok.am,true,`${v.am} · ${v.en}`,{l:lab(t,i)},wr,false),"v:"+v.am);
}

/* ---------- numbers: words and Ethiopic numerals ---------- */
const N1=["","አንድ","ሁለት","ሦስት","አራት","አምስት","ስድስት","ሰባት","ስምንት","ዘጠኝ"], N1R=["","and","hulett","sost","aratt","ammist","siddist","sebatt","simmint","zet'egn"];
const N10=["","አሥር","ሃያ","ሠላሳ","አርባ","ሃምሳ","ስልሳ","ሰባ","ሰማንያ","ዘጠና"], N10R=["","assir","haya","selasa","arba","hamsa","silsa","seba","semanya","zet'ena"];
const S1=["","፩","፪","፫","፬","፭","፮","፯","፰","፱"], S10=["","፲","፳","፴","፵","፶","፷","፸","፹","፺"];
const NMAX=9999;
function numWord(n){           // -> [fidel, latin]
  if(n===0) return ["ዜሮ","zéro"];
  const a=[], r=[], put=(x,y)=>{a.push(x);r.push(y);};
  const th=Math.floor(n/1000), h=Math.floor(n%1000/100), t=Math.floor(n%100/10), u=n%10;
  if(th){put(N1[th],N1R[th]);put("ሺ","shi");}
  if(h){if(h>1)put(N1[h],N1R[h]);put("መቶ","meto");}
  if(t===1&&u){put("አሥራ","asra");put(N1[u],N1R[u]);}
  else{ if(t)put(N10[t],N10R[t]); if(u)put(N1[u],N1R[u]); }
  return [a.join(" "),r.join(" ")];
}
// The number word in pieces that each have a clip: [thousands, hundreds, the rest], e.g. 2365 -> ሁለት ሺ | ሦስት መቶ | ስልሳ አምስት
function numParts(n){
  if(n<1) return [numWord(n)[0]];
  const th=Math.floor(n/1000), h=Math.floor(n%1000/100), r=n%100, out=[];
  if(th) out.push(numWord(th*1000)[0]);
  if(h) out.push(numWord(h*100)[0]);
  if(r) out.push(numWord(r)[0]);
  return out;
}
const sym2 = n => S10[Math.floor(n/10)]+S1[n%10];
function numSym(n){            // Ethiopic numerals, 1 to 9999
  if(n<1) return "";
  const hi=Math.floor(n/100), lo=n%100;
  return (hi?(hi>1?sym2(hi):"")+"፻":"")+sym2(lo);
}
const numNorm = s => String(s).replace(/[ሃሐሓኀኃ]/g,"ሀ").replace(/ሺህ/g,"ሺ").replace(/አንድ\s+(መቶ|ሺ)/g,"$1").replace(/አስር/g,"አሥር").replace(/አስራ/g,"አሥራ");
const NBASE=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,1000];
const NRULES=[
 {h:"Eleven to nineteen",p:["Ten is {አሥር|assir}. For 11 to 19 it becomes {አሥራ|asra} followed by the unit: {አሥራ አንድ|asra and} 11, {አሥራ ሁለት|asra hulett} 12, {አሥራ ዘጠኝ|asra zet'egn} 19.","In everyday writing you will also see it spelt with the other s: አስር, አስራ. Both are accepted in the tests."]},
 {h:"Tens and units",p:["Say the ten, then the unit, with nothing in between: {ሃያ አንድ|haya and} 21, {አርባ ሰባት|arba sebatt} 47, {ዘጠና ዘጠኝ|zet'ena zet'egn} 99.","The tens are worth learning as a set: {ሃያ|haya} 20, {ሠላሳ|selasa} 30, {አርባ|arba} 40, {ሃምሳ|hamsa} 50, {ስልሳ|silsa} 60, {ሰባ|seba} 70, {ሰማንያ|semanya} 80, {ዘጠና|zet'ena} 90."]},
 {h:"Hundreds and thousands",p:["A hundred is {መቶ|meto}. Put the number of hundreds in front: {ሁለት መቶ|hulett meto} 200, {አምስት መቶ|ammist meto} 500. Then carry on with the rest: {መቶ ሃምሳ|meto hamsa} 150, {ሦስት መቶ ስልሳ አምስት|sost meto silsa ammist} 365.","A thousand is {ሺ|shi}, also written ሺህ: {አንድ ሺ|and shi} 1,000, {ሁለት ሺ|hulett shi} 2,000, {አሥር ሺ|assir shi} 10,000. A million is {ሚሊዮን|miliyon}.","You can say {አንድ መቶ|and meto} or just {መቶ|meto} for 100. The tests accept either."]},
 {h:"The Amharic number symbols",p:["Amharic has its own numerals. There is one symbol for each of 1 to 9, one for each ten from 10 to 90, one for 100 (፻) and one for 10,000 (፼). There is no symbol for zero.","Below 100, write the ten then the unit: ፲፩ is 11, ፳፭ is 25, ፺፱ is 99.","For hundreds, write how many hundreds, then ፻, then the rest: ፪፻ is 200, ፫፻፷፭ is 365. One hundred is just ፻.","A thousand is written as ten hundreds: ፲፻ is 1,000, ፲፱፻፺፮ is 1996, ፳፻፲፱ is 2019."]},
 {h:"Where you will see them",p:["In daily life (prices, phone numbers, times) Ethiopians mostly write Western digits and say the Amharic words. The Amharic symbols appear on calendars, dates, church texts, page numbers of books and formal documents, so it is worth being able to read them."]},
 {h:"First, second, third",p:["Add {-ኛ|-gna} to the number to make “first, second …”: {አንደኛ|andegna} first, {ሁለተኛ|hulettegna} second, {ሦስተኛ|sostegna} third, {አሥረኛ|assiregna} tenth."]}
];
const NTESTS=["num-words","num-sym","num-type","num-pad"];
const nCard = n => {const w=numWord(n);return `<div class="ncard"><span class="sym am">${numSym(n)}</span><span class="dig">${n.toLocaleString("en")}</span>${A(w[0],w[1])}</div>`;};
function numOut(){
  const n=Math.floor(+S.num.n);
  if(S.num.n===""||isNaN(n)||n<0||n>NMAX) return `<p class="count" style="text-align:center">Enter a number from 0 to ${NMAX.toLocaleString("en")}.</p>`;
  const w=numWord(n);
  // Played in pieces (thousands, hundreds, the rest), each of which has a clip, so any number can be heard.
  return `<div class="q"><div class="kind">${n.toLocaleString("en")}</div><div class="big am">${n?numSym(n):"no symbol"}</div><div style="margin-top:6px"><span class="am nosay" style="font-size:1.5rem">${esc(w[0])}</span> ${drSayBtn(numParts(n))}</div><div class="rom">${esc(w[1])}</div></div>`;
}
function renderNum(){
  const t=S.num.tab;
  let h=fnSwitch()+chips("ntab",[["chart","Chart"],["rules","Rules"],["try","Try any"],["cards","Cards"]],t)+`<h2>Numbers</h2><p class="lead">Learn the Amharic words for numbers and the Amharic number symbols, then test yourself.</p>`;
  if(t==="chart"){
    h+=`<h3>One to ten</h3><div class="grid2">${NBASE.slice(0,10).map(nCard).join("")}</div>
        <h3>Tens</h3><div class="grid2">${NBASE.slice(10,18).map(nCard).join("")}</div>
        <h3>Hundred and thousand</h3><div class="grid2">${nCard(100)}${nCard(1000)}<div class="ncard"><span class="sym am">፼</span><span class="dig">10,000</span>${A("አሥር ሺ","assir shi")}</div><div class="ncard"><span class="sym am">–</span><span class="dig">0</span>${A("ዜሮ","zéro")}</div></div>`;
  }else if(t==="rules"){
    h+=NRULES.map(nt=>`<div class="note"><h4>${esc(nt.h)}</h4>`+nt.p.map(p=>`<p>${fmt(p)}</p>`).join("")+`</div>`).join("");
  }else if(t==="try"){
    h+=`<p class="lead">Type any number to see how it is said and written.</p>
        <div class="ntry"><input id="nin" type="number" inputmode="numeric" min="0" max="${NMAX}" value="${esc(S.num.n)}" aria-label="A number"><button class="btn" data-act="nrand">Random</button></div>
        <div id="nout">${numOut()}</div>`;
  }else{
    const deck=S.num.deck, ns=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,30,40,50,60,70,80,90,100,1000];
    const words=deck==="words"?ns.map(n=>{const w=numWord(n);return [w[0],w[1],n.toLocaleString("en")];})
      :NBASE.concat([11,25,48,99,150,365,1996,2019]).map(n=>[numSym(n),"",n.toLocaleString("en")+" · "+numWord(n)[0]]);
    h+=`<div class="bar">${mini("ndeck",[["words","Words"],["symbols","Symbols"]],deck)}</div>`+flashHTML(words,"num-"+deck);
  }
  h+=`<h3>Test yourself</h3><div class="stack">${NTESTS.map(id=>{const tp=topic(id);return `<button class="topic" data-act="start" data-v="${id}"><b>${esc(tp.name)}</b><small>${esc(tp.desc)}</small>${bestChip(id)}</button>`;}).join("")}</div>`;
  return h;
}
/* questions */
function nPick(kind){
  const r=Math.random();
  if(kind==="sym") return r<.45?pick(NBASE):r<.8?11+ri(89):r<.92?100+ri(900):1000+ri(1100);
  if(kind==="type") return r<.35?ri(21):r<.85?21+ri(79):100+ri(900);
  return r<.35?ri(21):r<.75?21+ri(79):r<.9?100+ri(900):1000+ri(9000);
}
function nNear(n){
  const d=String(n), c=[n+1,n-1,n+2,n+10,n-10,n+100,n-100,n*10,Math.floor(n/10),+d.split("").reverse().join(""),n+1000,n-1000];
  if(n<100) for(let i=0;i<6;i++) c.push(1+ri(99)); else for(let i=0;i<6;i++) c.push(Math.pow(10,d.length-1)+ri(9*Math.pow(10,d.length-1)));
  return [...new Set(c)].filter(x=>x>0&&x<=NMAX&&x!==n);
}
const nStr = n => n.toLocaleString("en");
function qNumWord(max){
  let n=nPick("word"); if(max) n=1+ri(max);
  const w=numWord(n), near=nNear(n);
  if(ri(2)) return mk("Numbers",nStr(n),false,"Choose the Amharic",{l:w[0],r:w[1]},near.map(x=>{const y=numWord(x);return {l:y[0],r:y[1]};}),true);
  return mk("Numbers",w[0],true,"Which number is this?",{l:nStr(n)},near.map(x=>({l:nStr(x)})),false);
}
function qNumSym(){
  const n=nPick("sym"), near=nNear(n), r=ri(3);
  if(r===0) return mk("Number symbols",nStr(n),false,"Choose the Amharic numeral",{l:numSym(n)},near.map(x=>({l:numSym(x)})),true);
  if(r===1) return mk("Number symbols",numSym(n),true,"Which number is this?",{l:nStr(n)},near.map(x=>({l:nStr(x)})),false);
  const w=numWord(n); return mk("Number symbols",numSym(n),true,"Choose the word",{l:w[0],r:w[1]},near.map(x=>{const y=numWord(x);return {l:y[0],r:y[1]};}),true);
}
function qNumType(){const n=nPick("type"), w=numWord(n);return {type:"type",kind:"Numbers · type it",big:nStr(n),sub:"Type this number in words",answer:w[0],rom:w[1],num:1};}
function qNumPad(){const n=nPick("sym");return {type:"type",kind:"Number symbols · type it",big:nStr(n),sub:"Tap the Amharic numerals",answer:numSym(n),rom:numWord(n)[1],pad:1};}
function numPad(inp){
  return `<div class="kbd">${inp}<div class="keys npad">`+S1.slice(1).concat(S10.slice(1),["፻","፼"]).map(c=>`<button data-act="k-form" data-v="${c}">${c}</button>`).join("")+
    `<button class="fn" data-act="k-clear">clear</button><button class="fn w2" data-act="k-del">delete</button><button class="fn w2 go" data-act="k-check">Check</button></div></div>`;
}

/* ---------- derived data ---------- */
const LMAP = {}; LESSONS.forEach(l=>LMAP[l.n]=l);
const FULL = LESSONS.filter(l=>!l.review).map(l=>l.n);
const canon = s => Array.from(String(s).replace(/[\s፡።፣፤?!.…]/g,"")).map(c=>CAN[c]||c).join("|");
const typable = w => w[0].length>1 && !/[…\-]/.test(w[0]) && !/name\)/.test(w[2]);
const lessonWords = ns => ns.flatMap(n=>LMAP[n].vocab||[]);
const EXTRA_ALL = Object.values(EXTRA).flat();
const ECATS = Object.keys(EXTRA);

const tEn = (t,i) => t.full ? t.en[i] : subj(i)+" "+t.en[i];
const LASTL = Math.max(...LESSONS.map(l=>l.n)), LASTF = Math.max(...LESSONS.filter(l=>!l.review).map(l=>l.n));

/* ---------- state ---------- */
const S = {bs:{how:"step",mode:"mixed",n:4,tenses:["past","pastNeg","pres","presNeg","cmd"],upto:0},bsOpen:false,mode:"course",lesson:null,lview:"notes",ftab:"chart",pick:"ለ",rtab:"pronouns",v:{view:"look",q:"",lesson:"all",sel:0,tense:"past",deck:"mean",clesson:"all",ctense:"any",card:null,flip:false},cat:ECATS[0],eview:"list",
  fc:{key:"",order:[],i:0,flip:false},rom:true,gloss:false,quiz:null,best:{},miss:[],upto:null,day:"",num:{tab:"chart",n:"25",deck:"words"},
  find:{q:"",from:false},kb:{cons:null,native:false,hints:true},prac:{src:"letters",lesson:"all",q:null,typed:"",result:null,shown:false}};
S.ls=JSON.parse(JSON.stringify(LS_DEF));
S.gm=GM_DEF();   // games.js: settings and best scores
S.pf={add:"",ren:null,del:false,code:"",msg:"",inText:"",inErr:"",incoming:null};
/* Saved progress lives in the current profile (see profiles.js). */
const BS_DEF=JSON.stringify(S.bs);
const PROF=makeProfiles(safeStore());
function applyData(d){
  d=d&&typeof d==="object"?d:{};
  S.best=d.best&&typeof d.best==="object"?d.best:{};
  S.rom=d.rom!==false;
  S.gloss=d.gloss===true;   // word by word (gloss.js)
  S.miss=Array.isArray(d.miss)?d.miss.filter(x=>x&&x.k&&x.q):[];
  S.upto=d.upto&&LMAP[+d.upto]?+d.upto:null;
  S.day=typeof d.day==="string"?d.day:"";
  S.kb.hints=d.kbhints!==false;
  sayRate=SAY_RATES.includes(+d.rate)?+d.rate:1;
  S.ls=Object.assign({},LS_DEF,d.listen&&typeof d.listen==="object"?d.listen:{});
  S.bs=JSON.parse(BS_DEF); if(d.builder&&typeof d.builder==="object") Object.assign(S.bs,d.builder);
  S.srs=d.srs?srsClean(d.srs):srsMigrate(d);   // spaced repetition (srs.js); profiles from before it get a starting point
  S.gm=gmClean(d.games); gmStop();
  S.goal=goalClean(d.goal);   // daily goal and streak (goal.js)
  // colour scheme (schemes.js): this profile's own choice, or else the one last picked on this device
  S.schemePicked=schemeOk(d.scheme); S.scheme=S.schemePicked?d.scheme:schemeDevice.get();
  S.quiz=null; S.lesson=null; S.fc.key="";
}
const profileData=()=>({best:S.best,rom:S.rom,gloss:S.gloss,miss:S.miss,upto:S.upto,day:S.day,kbhints:S.kb.hints,rate:sayRate,builder:S.bs,listen:S.ls,srs:S.srs,goal:S.goal,games:S.gm,...(S.schemePicked?{scheme:S.scheme}:{})});
const save=()=>{ if(!PROF.cur()) PROF.add("Learner"); PROF.save(profileData()); };
const keep=()=>{ if(PROF.cur()) save(); };   // before switching profile: store the current one, if there is one
applyData(PROF.load());
// Several people on this device: ask who's practising each time the app opens. Nobody yet: ask for a name.
if(PROF.list().length!==1) S.mode="who";
// Each time the app opens (unless switched off on the welcome page), or opened with #welcome: show the welcome page first.
if(wlFirst()) S.mode="welcome";

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ri=n=>Math.floor(Math.random()*n);
const pick=a=>a[ri(a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const A=(am,rom)=>`<span class="am">${esc(am)}</span>`+(rom?`<span class="rom">${esc(rom)}</span>`:"");
// Table titles write the transcription in plain text ("ሰበረ sebbere, break", "ቤት (bét)"): mark it so the switch hides it.
const ttl=s=>esc(s).replace(/^([\u1200-\u137C ]+) ([^,]+),/,'<span class="am">$1</span> <span class="rom">$2</span>,').replace(/([\u1200-\u137C]+) \(([^)]+)\)/g,'<span class="am">$1</span> <span class="rom">$2</span>');
const fmt=s=>esc(s).replace(/\{([^|}]+)\|([^}]*)\}/g,(_,a,r)=>`<span class="am">${a}</span> <span class="rom">${r}</span>`);
const chips=(act,items,sel)=>`<div class="chips${items.length>9?" many":""}">`+items.map(([v,l])=>`<button class="chip" data-act="${act}" data-v="${v}" aria-selected="${String(v)===String(sel)}">${l}</button>`).join("")+`</div>`;
const mini=(act,items,sel)=>`<div class="mini">`+items.map(([v,l])=>`<button data-act="${act}" data-v="${v}" aria-selected="${v===sel}">${l}</button>`).join("")+`</div>`;

function tableHTML(t){
  let h=`<div class="tbl">`;
  PR.forEach((p,i)=>{h+=`<div class="row"><span class="who">${p.am}</span><span class="form">${A(t.am[i],t.rom[i])}</span><span class="en">${esc(tEn(t,i))}</span></div>`;});
  return h+`</div>`;
}
function partsHTML(p){
  return `<div class="tbl">`+PL.map((l,i)=>`<div class="row" style="grid-template-columns:8.6rem 1fr"><span class="count">${l}</span><span class="form">${A(p.am[i],p.rom[i])}</span></div>`).join("")+`</div>`;
}
// gl: these are sentences or phrases, so each gets its word-by-word line when that switch is on (gloss.js)
function wordList(words,gl){
  return `<div class="tbl canrec wl2">`+words.map(w=>`<div class="row vrow"><span class="form">${A(w[0],w[1])}</span><span class="en">${esc(w[2])}</span>${gl?glossHTML(w[0],w[1]):""}</div>`).join("")+`</div>`;
}
function flashHTML(words,key){
  const F=S.fc;
  if(F.key!==key||F.order.length!==words.length){F.key=key;F.order=words.map((_,i)=>i);F.i=0;F.flip=false;}
  const w=words[F.order[F.i%words.length]];
  return `<button class="flash" data-act="flip" aria-label="Flip card">${A(w[0],w[1])}`+
    (F.flip?`<span class="en">${esc(w[2])}</span>`:`<span class="hint">Tap to see the meaning</span>`)+`</button><div class="bigbtns">${sayBtn(w[0],"big")}${canSay(w[0])?micBtn(w[0]):""}</div>
    <div class="btns"><button class="btn" data-act="card" data-v="-1">Back</button>
    <button class="btn" data-act="mix">Shuffle</button>
    <button class="btn primary" data-act="card" data-v="1">Next</button></div>
    <p class="count" style="text-align:center;margin-top:10px">Card ${F.i%words.length+1} of ${words.length}</p>`;
}
const bestChip = id => S.best[id]!=null ? `<span class="best"><strong>${S.best[id]}/${id==="daily"?20:10}</strong>best</span>` : `<span class="best untried">not tried</span>`;

/* ---------- course ---------- */
function renderCourse(){
  if(RD.view) return rdHTML();   // reading stories and culture notes (reader.js)
  if(S.lesson) return renderLesson(LMAP[S.lesson]);
  let h=`<h2>Course</h2><p class="lead">${LASTL} short units built around everyday situations: greetings, family, food, getting around. Grammar comes in as each topic needs it, and every fifth unit is a review.</p>${dailyCard()}${rdCourseCards()}<div class="stack" style="margin-top:14px">`;
  LESSONS.forEach(l=>{
    h+= l.review
      ? `<button class="topic" data-act="start" data-v="R${l.n}"><b><span class="lnum">${l.n}</span>${esc(l.title)}</b><small>Mixed test</small>${bestChip("R"+l.n)}</button>`
      : `<button class="topic" data-act="lesson" data-v="${l.n}"><b><span class="lnum">${l.n}</span>${esc(l.title)}</b><small>${l.vocab.length} words</small>${bestChip("L"+l.n)}</button>`;
  });
  h+=`</div>`;
  if(LATER.length){h+=`<h3>Still to add</h3><div class="stack">`;LATER.forEach(([n,t])=>{h+=`<button class="topic" disabled><b><span class="lnum">${n}</span>${esc(t)}</b></button>`;});h+=`</div>`;}
  return h;
}
function renderLesson(l){
  let h=`<button class="back" data-act="lesson" data-v="">‹ All units</button>
   <h2>Unit ${l.n}: ${esc(l.title)}</h2>
   <div class="bar">${mini("lview",[["notes","Notes"],["words","Words"]].concat(sentOf([l.n]).length?[["sent","Sentences"]]:[],DMAP[l.n]?[["dlg","Dialogue"]]:[],[["cards",DMAP[l.n]?"Cards":"Flashcards"]]),S.lview)}</div>`;
  if(S.lview==="notes"){
    l.notes.forEach(nt=>{
      h+=`<div class="note"><h4>${esc(nt.h)}</h4>`+nt.p.map(p=>`<p>${fmt(p)}</p>`).join("")+`</div>`;
      if(nt.pron){h+=`<div class="grid2" style="margin-top:10px">`+PR.concat(POLITE).map(p=>`<div class="pcard">${A(p.am,p.rom)}<span class="en">${esc(p.en)}</span></div>`).join("")+`</div>`;}
      (nt.show||[]).concat(nt.tables||[]).forEach(k=>{h+=`<h3>${ttl(T[k].title)} <small>· ${ttl(T[k].ex)}</small></h3>`+tableHTML(T[k]);});
      (nt.parts||[]).forEach(k=>{h+=`<h3>${ttl(PARTS[k].title)}</h3>`+partsHTML(PARTS[k]);});
    });
    h+=rdUnitLinks(l.n);
  }else if(S.lview==="words"){
    h+=wordList(l.vocab);
  }else if(S.lview==="sent"&&sentOf([l.n]).length){
    h+=`<div class="glbar"><p class="lead">Short sentences made from the words and grammar up to this unit.</p>${glossBtn()}</div>`+wordList(sentOf([l.n]).map(x=>[x.am,x.rom,x.en]),true);
  }else if(S.lview==="dlg"&&DMAP[l.n]){
    h+=dialogueHTML(l);
  }else h+=flashHTML(l.vocab,"L"+l.n);
  h+=`<div class="stack" style="margin-top:18px"><button class="btn primary wide" data-act="start" data-v="L${l.n}">Test unit ${l.n}</button>
      <button class="btn wide" data-act="typelesson" data-v="${l.n}">Practise typing these words</button></div>`;
  return h;
}

/* ---------- fidel ---------- */
function fidelChart(){
  const p=FID.find(f=>f.ch===S.pick)||FID[0], r=FR[p.row];
  const ordName=p.ord<7?["1st","2nd","3rd","4th","5th","6th","7th"][p.ord]+" order":p.ord===7?"“wa” form":"rounded form";
  let h=`<p class="lead">Each letter is a consonant plus a vowel. Rows are consonants, columns are the seven vowel orders. Tap any letter to see it up close${Object.keys(AUDIO_FILES).length?", then press ▶ to hear it":""}.</p>
   <div class="peek"><span class="am nosay"><span class="pkch">${p.ch}</span></span><div class="pktxt"><b>${esc(p.snd||"(vowel only)")}</b><small>${ordName}</small><small>${p.ord===5?"also the bare consonant":"&nbsp;"}</small></div>${sayBtn(p.ch,"pk")||`<span class="say pk pkgap" aria-hidden="true"></span>`}</div>
   <div class="chartbox"><table class="chart"><tr><th></th>${VOW.map(v=>`<th>${v}</th>`).join("")}<th>wa</th></tr>`;
  FR.forEach(r=>{
    h+=`<tr><td>${r[1]||"–"}</td>`+r.forms.map(f=>`<td><button data-act="pick" data-v="${f.ch}" aria-pressed="${f.ch===S.pick}">${f.ch}</button></td>`).join("");
    const wa=r.extra.find(f=>f.ord===7);
    h+=`<td>${wa?`<button data-act="pick" data-v="${wa.ch}" aria-pressed="${wa.ch===S.pick}">${wa.ch}</button>`:""}</td></tr>`;
  });
  h+=`</table></div><h3>Rounded letters <small>· q, h, k, g + w</small></h3><div class="chartbox"><table class="chart"><tr><th></th>${LVO.map(x=>`<th>${x[1]}</th>`).join("")}</tr>`;
  FR.filter(r=>LV[r[0]]).forEach(r=>{h+=`<tr><td>${r[1]}</td>`+r.extra.filter(f=>f.ord===8).map(f=>`<td><button data-act="pick" data-v="${f.ch}" aria-pressed="${f.ch===S.pick}">${f.ch}</button></td>`).join("")+`</tr>`;});
  h+=`</table></div>
   <div class="tip"><b>Twin letters.</b> Some sounds have more than one letter: <span class="am">ሀ ሐ ኀ</span> are all h, <span class="am">ሰ ሠ</span> are s, <span class="am">አ ዐ</span> carry a bare vowel, and <span class="am">ጸ ፀ</span> are ts'. Spelling decides which one a word uses. When you type here, either twin is marked correct.</div>
   <div class="tip"><b>First and fourth order.</b> For the h letters and for <span class="am">አ ዐ</span>, the first order sounds the same as the fourth: <span class="am">ሀ</span> and <span class="am">ሃ</span> are both ha.</div>
   <div class="tip"><b>Sixth order.</b> The same letter stands for the consonant alone and for the consonant with a very short i, so the chart labels it (i): <span class="am">ልብስ</span> is libs, with only one vowel sounded. Doubled consonants are not shown in fidel either.</div>
   <div class="tip"><b>Numerals and marks.</b> ፩ 1, ፪ 2, ፫ 3, ፬ 4, ፭ 5, ፮ 6, ፯ 7, ፰ 8, ፱ 9, ፲ 10, ፳ 20. Sentences end with <span class="am">።</span>. Older texts also separate words with <span class="am">፡</span>; modern writing uses a space. <button class="link" data-act="fn" data-v="num">See all the numbers ›</button></div>`;
  return h;
}
function fidelKey(){
  const rows=[["e","a short, relaxed “e”, like the first sound of “about”"],["é","as in “they”, without the glide: bét “house”"],["u","as in “rule”"],["i","as in “machine”; in a 6th-order letter it is very short, like the i in “bit”, or silent"],["a","as in “father”"],["o","as in “more”"],
   ["sh","as in “ship”"],["ch","as in “church”"],["j","as in “judge”"],["zh","the s in “pleasure”"],["gn","ny as in “canyon”: dehna negn"],
   ["t', ch', p', ts'","“popped” versions of t, ch, p, ts: stop the breath in the throat and release the sound sharply"],["q","a popped k"],
   ["'","between two vowels, a slight catch: se'at"],["bb, ll…","a doubled letter is held longer: alle “is present”, ale “said”. Doubling of sh, ch, gn and the popped sounds is not shown"],["kw, gw…","consonant with rounded lips, as in sikkwar"]];
  return `<p class="lead">The Latin spellings here follow everyday modern usage. They are a guide to the sound, so trust the fidel for the exact spelling.</p>
   <div class="tbl"><table class="keytab">`+rows.map(r=>`<tr><td>${r[0]}</td><td>${esc(r[1])}</td></tr>`).join("")+`</table></div>`;
}
function kbHTML(t,prac){
  const done=t.result!==null&&t.result!==undefined;
  const inp=`<input class="tin am ${t.result==="ok"?"ok":t.result==="no"?"no":""}" id="tin" value="${esc(t.typed)}" inputmode="${S.kb.native?"text":"none"}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer in fidel" placeholder="${S.kb.native?"Type here":"Your answer"}" ${done||!S.kb.native?"readonly":""}>`;
  if(done) return inp;
  if(!prac&&t.qs&&t.qs[t.i].pad) return numPad(inp);
  const links=`<div class="kbar"><button class="link" data-act="k-native">${S.kb.native?"Use the on-screen keys":"Use my phone's keyboard"}</button>`+
     (prac?`<button class="link" data-act="p-show">${t.shown?"Hide answer":"Show answer"}</button>`:"")+
     `</div>`+(S.kb.native||S.mode==="test"?"":`<p class="count" style="margin-top:4px">${S.rom?"To hide the sounds on the keys, turn off Transcription at the top.":"Sounds on the keys are hidden. Turn on Transcription at the top to show them."}</p>`);
  const shown=prac&&t.shown?`<p class="fb" style="text-align:center;margin:0 0 6px">Answer: <span class="am">${esc(t.q.answer)}</span></p>`:"";
  if(S.kb.native) return shown+inp+`<button class="btn primary wide" data-act="k-check" style="margin-top:8px">Check</button>`+links;
  let h=shown+`<div class="kbd">${inp}<div class="forms">`;
  if(S.kb.cons!==null){const r=FR[S.kb.cons]; h+=r.forms.concat(r.extra).map(f=>`<button data-act="k-form" data-v="${f.ch}">${f.ch}${S.rom&&S.mode!=="test"?`<small>${esc(f.snd)}</small>`:""}</button>`).join("");}
  else h+=`<span class="hint">Tap a consonant, then pick the form with the vowel you need.</span>`;
  h+=`</div><div class="keys">`+FR.map((r,i)=>`<button data-act="k-cons" data-v="${i}" aria-pressed="${S.kb.cons===i}">${r[0]}</button>`).join("")+
     `<button class="fn" data-act="k-clear">clear</button><button class="fn w2" data-act="k-space">space</button><button class="fn w2" data-act="k-del">delete</button><button class="fn w3 go" data-act="k-check">Check</button></div></div>`;
  return h+links;
}
function newPrac(){
  const P=S.prac; P.typed="";P.result=null;P.shown=false;S.kb.cons=null;
  if(P.src==="letters"){const f=pick(FID.filter(f=>f.ord<7));P.q={big:f.snd||"(vowel) "+VOW[f.ord],sub:"Type the letter for this sound",answer:f.ch};}
  else{
    let pool = P.src==="extra"?EXTRA_ALL : lessonWords(P.lesson==="all"?FULL:[+P.lesson]);
    pool=pool.filter(typable); const w=pick(pool);
    P.q={big:w[2],sub:w[1],subRom:true,answer:w[0]};
  }
}
function fidelType(){
  const P=S.prac; if(!P.q) newPrac();
  let h=`<div class="bar">${mini("psrc",[["letters","Letters"],["words","Course words"],["extra","Extra words"]],P.src)}</div>`;
  if(P.src==="words") h+=chips("plesson",[["all","All"]].concat(FULL.map(n=>[n,"Unit "+n])),P.lesson);
  h+=`<div class="q slim"><div class="kind">Type in fidel</div><div class="big">${esc(P.q.big)}</div><div class="sub ${P.q.subRom?"rom":""}">${esc(P.q.sub)}</div></div>`;
  if(P.result) h+=kbHTML(P,true)+`<p class="fb ${P.result==="ok"?"good":"bad"}">${P.result==="ok"?"Correct":"Not quite. It is"} <span class="am">${P.result==="ok"?"":esc(P.q.answer)}</span></p>
        <button class="btn primary wide" data-act="p-next" style="margin-top:12px">Next</button>`;
  else h+=kbHTML(P,true);
  return h;
}
// Fidel and Numbers share one tab: this switch at the top flips between the two halves.
const fnSwitch = () => `<div class="fnsw norom-auto" role="group" aria-label="Letters or numbers">`+[["fidel","<span class=\"am nosay\">ፊ</span> Letters"],["num","<span class=\"am nosay\">፩</span> Numbers"]].map(([v,l])=>`<button data-act="fn" data-v="${v}" aria-pressed="${S.mode===v}">${l}</button>`).join("")+`</div>`;
function renderFidel(){
  return fnSwitch()+chips("ftab",[["chart","Chart"],["type","Typing practice"],["key","Sound guide"]],S.ftab)+
    (S.ftab==="type"?"":`<h2>${S.ftab==="chart"?"The fidel":"Sound guide"}</h2>`)+
    (S.ftab==="chart"?fidelChart():S.ftab==="type"?fidelType():fidelKey());
}

/* ---------- reference ---------- */
function refPronouns(){
  let h=`<h2>Pronouns</h2><div class="grid2" style="margin-top:10px">`+PR.concat(POLITE).map(p=>`<div class="pcard">${A(p.am,p.rom)}<span class="en">${esc(p.en)}</span></div>`).join("")+`</div>`;
  for(const k of ["be","alla","have","poss"]) h+=`<h3>${ttl(T[k].title)} <small>· ${ttl(T[k].ex)}</small></h3>`+tableHTML(T[k]);
  return h;
}
function refExtra(){
  const words=EXTRA[S.cat];
  return `<h2>Extra words</h2><p class="lead">${EXTRA_ALL.length} everyday words in ${ECATS.length} topics. None of them are in the course units.</p>`+chips("cat",ECATS.map(c=>[c,c]),S.cat)+
   `<div class="bar">${mini("eview",[["list","List"],["cards","Flashcards"]],S.eview)}<span class="count">${words.length} words</span></div>`+
   (S.eview==="list"?wordList(words):flashHTML(words,"E"+S.cat));
}
function renderRef(){
  return chips("rtab",[["pronouns","Pronouns"],["verbs","Verbs"],["extra","Extra words"]],S.rtab)+
    (S.rtab==="pronouns"?refPronouns():S.rtab==="verbs"?refVerbs():refExtra());
}

/* ---------- tests ---------- */
function mk(kind,big,bigAm,sub,correct,wrongs,optAm){
  const seen=new Set([correct.l]), opts=[correct];
  for(const w of shuffle(wrongs)){ if(opts.length>=4)break; if(!seen.has(w.l)){seen.add(w.l);opts.push(w);} }
  const o=shuffle(opts);
  return {type:"mc",kind,big,bigAm,sub,opts:o,ans:o.indexOf(correct),optAm};
}
const tag = (q,k) => { if(q) q.srs=k; return q; };   // which spaced-repetition item a question tests (srs.js)
const others8 = i => [0,1,2,3,4,5,6,7].filter(j=>j!==i);
const othersT = (t,i) => others8(i).filter(j=>t.am[j]!==t.am[i]);
function qTable(k,kind){
  const t=T[k], i=ri(8), o=j=>({l:t.am[j],r:t.rom[j]});
  if(k==="be") return mk(kind||"To be",PR[i].am+" ተማሪ ___",true,`${subj(i)} ${t.en[i]} a student`,o(i),others8(i).map(o),true);
  const rest=othersT(t,i);
  if(ri(2)) return mk(kind||t.title,tEn(t,i),false,"Choose the Amharic",o(i),rest.map(o),true);
  return mk(kind||t.title,t.am[i],true,"What does this mean?",{l:tEn(t,i)},rest.map(j=>({l:tEn(t,j)})),false);
}
function qParts(k,kind){
  const p=PARTS[k], i=1+ri(8), o=j=>({l:p.am[j],r:p.rom[j]});
  const rest=[0,1,2,3,4,5,6,7,8].filter(j=>j!==i&&p.am[j]!==p.am[i]).map(o);
  return mk(kind,p.am[0]+" → "+PL[i].toLowerCase(),true,"Choose this form of the verb",o(i),rest,true);
}
function qPronoun(){
  const type=ri(5), all=PR.concat(POLITE);
  if(type===0){const i=ri(all.length);return mk("Pronouns",all[i].am,true,"What does this mean?",{l:all[i].en},all.filter((_,j)=>j!==i).map(p=>({l:p.en})),false);}
  if(type===1){const i=ri(all.length);return mk("Pronouns",all[i].en,false,"Choose the Amharic pronoun",{l:all[i].am,r:all[i].rom},all.filter((_,j)=>j!==i).map(p=>({l:p.am,r:p.rom})),true);}
  return qTable(["be","have","poss"][type-2]);
}
function qWord(words,kind,backup,w0){
  const w=w0||pick(words);
  let others=words.filter(x=>x[0]!==w[0]&&x[2]!==w[2]);
  if(others.length<6&&backup) others=others.concat(backup.filter(x=>x[0]!==w[0]&&x[2]!==w[2]));
  if(ri(2)) return tag(mk(kind,w[0],true,"What does this mean?",{l:w[2]},others.map(x=>({l:x[2]})),false),"w:"+w[0]);
  return tag(mk(kind,w[2],false,"Choose the Amharic",{l:w[0],r:w[1]},others.map(x=>({l:x[0],r:x[1]})),true),"w:"+w[0]);
}
function qTypeWord(words,kind,w0){
  const w=w0||pick(words.filter(typable));
  return {type:"type",kind,big:w[2],sub:w[1],subRom:true,answer:w[0],rom:w[1],srs:"w:"+w[0]};
}
function qLesson(ns){
  const n=pick(ns), l=LMAP[n], kind="Unit "+n, r=Math.random();
  const tabs=l.notes.flatMap(x=>(x.tables||[]).map(k=>[0,k]).concat((x.parts||[]).map(k=>[1,k])));
  if(r<0.2) return qTypeWord(l.vocab,kind+" · type it");
  if(r>0.82&&sentOf([n]).length) return qSent([n],kind+" · sentence");
  if(tabs.length&&r<0.5){const t=pick(tabs);return t[0]?qParts(t[1],kind):qTable(t[1],kind);}
  return qWord(l.vocab,kind,lessonWords(FULL));
}
function qFidRec(f0){
  const f=f0&&f0.snd?f0:pick(FID.filter(x=>x.snd));
  const near=FID.filter(x=>x.snd&&x.key!==f.key&&x.snd!==f.snd&&(x.row===f.row||x.ord===f.ord));
  if(ri(2)) return tag(mk("Fidel",f.ch,true,"Which sound is this?",{l:f.snd},near.map(x=>({l:x.snd})),false),"f:"+f.ch);
  const seen=new Set([f.snd]), wr=[]; shuffle(near).forEach(x=>{if(!seen.has(x.snd)){seen.add(x.snd);wr.push({l:x.ch});}});
  return tag(mk("Fidel",f.snd,false,"Choose the letter",{l:f.ch},wr,true),"f:"+f.ch);
}
function qFidType(f0){
  const f=f0&&f0.snd&&f0.ord<8?f0:pick(FID.filter(x=>x.snd&&x.ord<8));
  return {type:"type",kind:"Fidel · type it",big:f.snd,sub:"Type the letter for this sound",answer:f.ch,srs:"f:"+f.ch};
}
function topic(id){
  if(id.startsWith("lis-")) return lsTopic(id);
  if(id.startsWith("dr-")) return drTopic(id);
  if(id==="fid-rec") return {name:"Recognise letters",desc:"See a letter, pick its sound, and the reverse",gen:qFidRec};
  if(id==="fid-type") return {name:"Type letters",desc:"Read a sound, type the letter",gen:qFidType};
  if(id==="fid-words") return {name:"Type words",desc:`Spell words from units 1–${LASTF} in fidel`,gen:()=>qTypeWord(lessonWords(FULL),"Type the word")};
  if(id[0]==="L"&&id!=="Lall"){const n=+id.slice(1);return {name:"Unit "+n,desc:LMAP[n].title,gen:()=>qLesson([n])};}
  if(id[0]==="R"){const l=LMAP[+id.slice(1)];return {name:"Unit "+l.n+": review",desc:l.title,gen:()=>qLesson(l.review)};}
  if(id==="Lall") return {name:"All units so far",desc:`Units 1–${LASTF} mixed`,gen:()=>qLesson(FULL)};
  if(id==="pronouns") return {name:"Pronouns",desc:"Who, to be, to have, my / your / his",gen:qPronoun};
  if(id==="verbs-type") return {name:"Type verb forms",desc:"Read the person and tense, type the form in fidel",gen:()=>qVerbType()};
  if(id==="sent-order") return {name:"Build sentences",desc:`Put the words in order · ${SENT.length} sentences`,gen:()=>qOrder(SENT)};
  if(id==="build-verbs") return {name:"Verbs in sentences",desc:"Made-up sentences that practise verbs: get the right person, tense and verb",gen:()=>qBuildVerb()};
  if(id==="build-course") return {name:"Course sentences",desc:`Build the sentences from the course units · ${SENT.length} sentences`,gen:()=>qBuildCourse(SENT.filter(x=>!S.bs.upto||x.l<=S.bs.upto))};
  if(id==="sent-mean") return {name:"Sentence meanings",desc:"Read a whole sentence and pick its meaning",gen:()=>qSentMean(SENT)};
  if(id==="num-words") return {name:"Number words",desc:"Match numbers and their Amharic words",gen:()=>qNumWord()};
  if(id==="num-sym") return {name:"Number symbols",desc:"Read and choose the Amharic numerals",gen:qNumSym};
  if(id==="num-type") return {name:"Type number words",desc:"See a number, spell it in fidel",gen:qNumType};
  if(id==="num-pad") return {name:"Type number symbols",desc:"See a number, tap it out in Amharic numerals",gen:qNumPad};
  if(id==="miss") return {name:"My mistakes",desc:"Things you got wrong, until you get each right three times"};
  if(id==="daily") return {name:"Today's session",desc:"20 mixed questions"};
  if(id==="due") return {name:"Review",desc:"Words, sentences and letters that are due to come back"};
  if(id==="verbs") return {name:"Verb conjugations",desc:`${VLIST.length} verbs, nine tenses`,gen:qVerb};
  if(id==="extra") return {name:"Extra words",desc:`${ECATS.length} topics, ${EXTRA_ALL.length} words`,gen:()=>{const c=pick(ECATS);return qWord(EXTRA[c],c,EXTRA_ALL);}};
  return {name:"Everything mixed",desc:"Fidel, course, pronouns and verbs",gen:()=>pick([qFidRec,qFidType,()=>qLesson(FULL),()=>qLesson(FULL),qPronoun,qVerb])()};
}
const QN=10;
const qAns = q => q.type==="mc"?q.opts[q.ans].l:q.answer;
const qKey = q => q.type+"|"+q.big+"|"+qAns(q);
/* sentences */
const sentOf = ns => SENT.filter(x=>ns.includes(x.l));
const sWords = x => x.am.replace(/[?!።፣፤]/g,"").split(" ").filter(Boolean);
function qOrder(pool,kind,x0){
  const long=pool.filter(x=>sWords(x).length>=3); if(!x0&&!long.length) return qSentMean(pool,kind);
  if(x0&&sWords(x0).length<3) return qSentMean(pool,kind,x0);
  const x=x0||pick(long), w=sWords(x), rw=x.rom.replace(/[?!.,;:"“”()…]/g,"").split(/\s+/).filter(Boolean);
  const t=orderTiles(w.map((am,j)=>({am,rom:rw.length===w.length?rw[j]:""})));
  return {type:"order",kind:kind||"Build the sentence",big:x.en,sub:"Tap the words in the right order",answer:w.join(" "),rom:x.rom,tiles:t.tiles,tileRom:t.tileRom,srs:"s:"+x.am};
}
function qSentMean(pool,kind,x0){
  const x=x0||pick(pool), rest=SENT.filter(y=>y.am!==x.am&&y.en!==x.en), near=rest.filter(y=>Math.abs(y.l-x.l)<=6);
  const others=near.length>=6?near:rest;
  if(ri(2)) return tag(mk(kind||"Sentences",x.am,true,"What does this mean?",{l:x.en},others.map(y=>({l:y.en})),false),"s:"+x.am);
  return tag(mk(kind||"Sentences",x.en,false,"Choose the Amharic",{l:x.am,r:x.rom},others.map(y=>({l:y.am,r:y.rom})),true),"s:"+x.am);
}
// shuffle the words of a sentence into tiles (never left in the right order), each with its transcription
function orderTiles(words){
  let p=shuffle(words.slice()), g=0;
  while(words.length>1&&p.map(x=>x.am).join(" ")===words.map(x=>x.am).join(" ")&&g++<20) p=shuffle(words.slice());
  return {tiles:p.map(x=>x.am),tileRom:p.map(x=>tRom(x.am,x.rom))};
}
/* Transcription in tests follows the Transcription switch at the top, like everywhere else.
   Exceptions: tests of reading the letters themselves (fidel, hear a letter), where the sound is the
   answer, so it only appears once you've answered. */
const tRom = (am,rom) => rom || (ETH_RE.test(am||"") ? romOf(am) : "");
const romTag = r => r ? `<small class="rom">${esc(r)}</small>` : "";
const qNoRom = q => !!(q.noRom || /Fidel|letters/i.test(q.kind||""));
// Amharic inside an English line (like "ሄደ · go"): each run of fidel followed by its transcription
const romRuns = s => esc(s).replace(/[ሀ-ፚ][ሀ-ፚ\s]*[ሀ-ፚ]|[ሀ-ፚ]/g, run => `<span class="am nosay">${run}</span> <span class="rom">${esc(romOf(run))}</span>`);
/* sentence builder (builder.js): one word at a time, from choices that change after each word,
   or (setting "All the words") every word of the sentence at once, to put in order */
const bsAll = q => q.type==="slot" && S.bs.how==="all";
function slotAsOrder(q){
  if(!q.tiles){ const t=orderTiles(q.words.map(w=>({am:w.am,rom:w.rom}))); q.tiles=t.tiles; q.tileRom=t.tileRom; }
}
function qBuild(x,kind){
  return {type:"slot",kind,big:x.en,sub:"Choose each word in turn",words:x.words,answer:x.words.map(w=>w.am).join(" "),rom:x.words.map(w=>w.rom).join(" ")};
}
function qBuildVerb(upto){ for(let g=0;g<40;g++){const x=bMakeVerbSentence(upto||S.bs.upto,S.bs.tenses); if(x) return qBuild(x,"Build it · verbs");} return qOrder(SENT); }
function qBuildCourse(pool,kind){ const ok=pool.filter(s=>bTokens(s).length>=2); if(!ok.length) return qSentMean(pool,kind); const x=pick(ok); return tag(qBuild(bCourseSentence(x),kind||"Build it · course"),"s:"+x.am); }
const qSent = (ns,kind) => ri(2)?qOrder(sentOf(ns),kind):qSentMean(sentOf(ns),kind);
/* every answer: moves its item between review boxes (srs.js), counts towards today's streak,
   and wrong answers also go on the mistakes list until answered right three times */
function record(q,ok){
  const sk=srsKeyOf(q); if(sk) srsAnswer(S.srs,sk,ok); srsActivity(S.srs);
  if(goalTick(S.goal,S.srs.act)&&S.quiz) S.quiz.goalHit=true;   // goal.js: reached today's goal with this answer
  const k=qKey(q), i=S.miss.findIndex(m=>m.k===k);
  if(!ok){ if(i>=0) S.miss[i].s=0; else {S.miss.unshift({k,q,s:0}); if(S.miss.length>150) S.miss.length=150;} }
  else if(i>=0){ if(++S.miss[i].s>=3) S.miss.splice(i,1); }
  save();
}
/* a question about one particular item, for reviews. Items you know well are sometimes typed instead of picked. */
function srsQuestion(k){
  const ix=srsIndex(), am=k.slice(2);
  if(k[0]==="l"){
    const x=lsItems(0,"both").find(y=>y.am===am);
    const q=x&&(ri(2)?qListenMean(0,"both",x):qListenWord(0,"both",x));
    return q?tag(q,k):srsQuestion((ix["w:"+am]?"w:":"s:")+am);
  }
  const e=ix[k]; if(!e) return null;
  const strong=srsBox(S.srs,k)>=SRS_KNOWN;
  if(e.kind==="word"||e.kind==="extra"){
    if(strong&&typable(e.x)&&ri(5)<2) return qTypeWord(null,"Review · type it",e.x);
    return e.kind==="word"?qWord(LMAP[e.unit].vocab,"Review · unit "+e.unit,lessonWords(FULL),e.x):qWord(EXTRA_ALL,"Review · extra words",null,e.x);
  }
  if(e.kind==="sent") return ri(2)||strong?qOrder(SENT,"Review · sentence",e.x):qSentMean(SENT,"Review · sentence",e.x);
  if(e.kind==="verb"){ const vp=verbPool(upto()).find(p=>p[0]===e.x); return vp?(strong&&ri(2)?qVerbType(vp[0],vp[1]):qVerb(vp[0],vp[1])):qVerb(e.x); }
  if(e.kind==="letter") return e.x.ord<8&&ri(2)?qFidType(e.x):qFidRec(e.x);
  return null;
}
const srsQs = (keys,max) => { const out=[]; for(const k of keys){ if(out.length>=max) break; const q=srsQuestion(k); if(q) out.push(tag(q,k)); } return out; };
// words and sentences not met yet, from units 1 to N, earliest unit first
function srsNew(N,max){
  const ix=srsIndex();
  return Object.keys(ix).filter(k=>(ix[k].kind==="word"||ix[k].kind==="sent")&&ix[k].unit&&ix[k].unit<=N&&!S.srs.it[k]&&(ix[k].kind!=="word"||ix[k].x[0].length>1))
    .sort((a,b)=>ix[a].unit-ix[b].unit||(ix[a].kind==="word"?0:1)-(ix[b].kind==="word"?0:1)).slice(0,max);
}
function fresh(q){
  q=JSON.parse(JSON.stringify(q));
  if(q.type==="mc"){const c=q.opts[q.ans]; q.opts=shuffle(q.opts); q.ans=q.opts.indexOf(c);}
  if(q.type==="order"){let g=0; do q.tiles=shuffle(q.tiles); while(q.tiles.join(" ")===q.answer&&g++<20);}
  return q;
}
/* daily session */
const today = () => {const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();};
const upto = () => S.upto || Math.max(1,...FULL.filter(n=>S.best["L"+n]!=null));
// the unit where each tense is first taught (99 = not in the course yet)
const TMIN={past:9,pastNeg:9,pres:8,presNeg:8,short:14,cmd:12,cmdNeg:12,ger:16,perf:13};
function verbPool(N){
  const vs=VLIST.filter(v=>v.lesson<=N).map(v=>[v,vTenses(v).filter(t=>v.fixed?v.lesson<=N&&(t[0]!=="past"&&t[0]!=="pastNeg"||N>=TMIN.past):TMIN[t[0]]<=N)]).filter(x=>x[1].length);
  return vs;
}
function dailyQs(){
  const N=upto(), done=FULL.filter(n=>n<=N), recent=done.slice(-5), sp=SENT.filter(x=>x.l<=N), vp=verbPool(N);
  const lessonQ=ns=>()=>qLesson(ns), verbQ=typed=>()=>{ if(!vp.length) return qLesson(recent); const x=pick(vp); return typed?qVerbType(x[0],x[1]):qVerb(x[0],x[1]); };
  const sentQ=order=>()=>sp.length?(order?qOrder(sp):qSentMean(sp)):qLesson(done);
  const lis=g=>()=>g(N)||qLesson(recent);
  const gens=[lis(qListenMean),lis(qListenWord),()=>qNumWord(N<11?10:100),qFidRec,qFidType,qFidRec,lessonQ(recent),lessonQ(recent),lessonQ(recent),lessonQ(recent),lessonQ(done),lessonQ(done),lessonQ(done),verbQ(0),verbQ(0),verbQ(1),sentQ(1),()=>N>=8?qBuildVerb(N):qLesson(done),sentQ(0)];
  // first whatever is due for review (up to 12), then a few saved mistakes, then up to 4 new words and sentences, then a mix
  const qs=srsQs(srsDue(S.srs),12), items=new Set(qs.map(q=>q.srs));
  shuffle(S.miss).filter(m=>{const k=srsKeyOf(m.q);return !k||!items.has(k);}).slice(0,Math.max(0,Math.min(3,16-qs.length))).forEach(m=>{const q=fresh(m.q);qs.push(q);const k=srsKeyOf(q);if(k)items.add(k);});
  srsQs(srsNew(N,Math.min(4,20-qs.length)),4).forEach(q=>{q.kind="New · "+q.kind.replace(/^Review · /,"");qs.push(q);items.add(q.srs);});
  const seen=new Set(qs.map(qKey));
  gens.push(...Array(20).fill(lessonQ(done)));
  for(const g of gens){ if(qs.length>=20) break; let n=0; while(n++<30){const q=g(), k=qKey(q), sk=q&&q.srs; if(!seen.has(k)&&!(sk&&items.has(sk))){seen.add(k);if(sk)items.add(sk);qs.push(q);break;}} }
  return shuffle(qs);
}
function dailyCard(){
  const N=upto(), done=S.day===today();
  const due=srsDue(S.srs).length;
  return `<div class="daily"><div><b>Today's session</b><small>${done?"Done today. Do another whenever you like.":"20 mixed questions: "+(due?plural(due,"review")+" due, then new words, verbs, sentences and letters":"letters, words, verbs, sentences"+(S.miss.length?" and your mistakes":""))}</small></div>
   <label class="sel">I'm up to <select id="upto">${FULL.map(n=>`<option value="${n}" ${n===N?"selected":""}>Unit ${n}</option>`).join("")}</select></label>
   <button class="btn primary wide" data-act="start" data-v="daily">${done?"Another session":"Start"}</button></div>`;
}
function startQuiz(id){
  let qs=[];
  if(id==="miss") qs=shuffle(S.miss).slice(0,QN).map(m=>fresh(m.q));
  else if(id==="due") qs=srsQs(srsDue(S.srs),QN);
  else if(id==="daily") qs=dailyQs();
  else{ const seen=new Set(), t=topic(id); let guard=0;
    while(qs.length<QN&&guard++<300){const q=t.gen(); if(!q) break; const key=qKey(q); if(!seen.has(key)){seen.add(key);qs.push(q);}} }
  if(!qs.length) return;
  S.quiz={id,qs,n:qs.length,i:0,score:0,picked:null,typed:"",built:[],result:null,misses:[],done:false,slot:null};
  S.kb.cons=null;
}
/* The Test tab: an overview (today's session, mistakes, review, then a card for each kind of test),
   and one page per kind. The sections are also listed across the top, so you can jump between them. */
const noH3 = h => h.replace(/^\s*<h3[^>]*>.*?<\/h3>/, "");
const TSECS = [
  ["listen","🎧","Listening","Hear Amharic and pick the meaning, choose what you heard, type it, or name a letter.",()=>LS_TESTS.length,()=>noH3(lsMenu())],
  ["fidel","<span class=\"am nosay\">ፊ</span>","Fidel","Read and type the letters of the alphabet, then whole words.",()=>3,()=>tStack(["fid-rec","fid-type","fid-words"])],
  ["units","📘","Units","A test for each course unit, the review units, and one across the whole course.",()=>LESSONS.length+1,()=>tStack(LESSONS.map(l=>(l.review?"R":"L")+l.n).concat("Lall"))],
  ["num","🔢","Numbers","Number words and the Amharic numerals, both ways round.",()=>NTESTS.length,()=>tStack(NTESTS)],
  ["sent","🧩","Sentences","Build Amharic sentences word by word, or pick what a sentence means.",()=>3,()=>bsIntro()+tStack(["build-course","build-verbs","sent-mean"])+bsHTML(true)],
  ["dlg","💬","Dialogues","Hear one side of a short conversation and answer as the other person.",()=>DIALOGUES.length,()=>noH3(dgMenu())],
  ["general","📋","General practice","Pronouns, verbs, verb forms, extra words, and everything mixed.",()=>5,()=>tStack(["pronouns","verbs","verbs-type","extra","mixed"])],
  ["everyday","🕒","Everyday Amharic","Telling the time the Ethiopian way, prices in birr, dates and the Ethiopian calendar.",()=>Object.keys(DR_TESTS).length,()=>drMenu()],
  ["games","🎲","Games","Matching pairs, a 60-second speed round and fidel bingo.",()=>3,()=>gmMenu(),"game"]
];
const tItem=id=>{const t=topic(id);return `<button class="topic" data-act="start" data-v="${id}"><b>${esc(t.name)}</b><small>${esc(t.desc)}</small>${bestChip(id)}</button>`;};
const tStack=ids=>`<div class="stack">${ids.map(tItem).join("")}</div>`;
function testMenu(){
  const sec=TSECS.find(x=>x[0]===S.tsec);
  let h=chips("tsec",[["all","Overview"]].concat(TSECS.map(x=>[x[0],x[2]])),sec?sec[0]:"all").replace(/class="chips[^"]*"/,'class="chips tsecs"');
  if(sec){
    return h+`<div class="tsechead"><h2>${sec[2]}</h2><p class="lead">${esc(sec[3])}</p></div>`+sec[5]()+
      `<button class="back" data-act="tsec" data-v="all">‹ All kinds of test</button>`;
  }
  h+=`<h2>Test yourself</h2><p class="lead">Each test has ${QN} questions. Your best score is kept on this device.</p>${dailyCard()}
   <div class="stack duo" style="margin-top:10px"><button class="topic" data-act="start" data-v="miss" ${S.miss.length?"":"disabled"}><b>My mistakes</b><small>${S.miss.length?"Each one stays until you get it right three times":"Nothing to review. Wrong answers from any test are kept here."}</small><span class="best"><strong>${S.miss.length}</strong>to review</span></button>${dueButton()}</div>
   <h3>Choose a kind of test</h3>
   <div class="tgrid">${TSECS.map(([id,icon,name,desc,n,,unit])=>`<button class="tcard" data-act="tsec" data-v="${id}"><span class="ticon" aria-hidden="true">${icon}</span><b>${name}</b><small>${esc(desc)}</small><span class="tn">${plural(n(),unit||"test")} ›</span></button>`).join("")}</div>`;
  return h;
}
function dueButton(){
  const n=srsDue(S.srs).length, f=srsForecast(S.srs,2)[1];
  return `<button class="topic" data-act="start" data-v="due" ${n?"":"disabled"}><b>Review</b><small>${n?"Words, sentences and letters due to come back today. Up to "+QN+" at a time.":"Nothing due right now."+(f?" "+plural(f,"item")+" tomorrow.":"")}</small><span class="best"><strong>${n}</strong>due</span></button>`;
}
/* sentence builder: what it is, then its settings (how the words are given, what the wrong choices are,
   how many, which units and tenses, and the Transcription switch) */
const BS_HOW=[["all","All the words","Every word of the sentence is there from the start, mixed up. Tap them in the right order."],
  ["step","One word at a time","Choose each word in turn from a few choices, which change after every word. Harder: you have to recall each word, not just order them."]];
const BS_MODES=[["forms","Same word","Only other forms of the right word: the verb in other persons and tenses. Good for learning how forms change."],
  ["mixed","Mixed","Other forms of the word, plus other words of the same kind (other verbs, pronouns, nouns)."],
  ["any","Any word","Words from anywhere in the course, so you need to know what each one means."]];
function bsIntro(){
  const tried=["build-course","build-verbs","sent-order"].some(k=>S.best[k]!=null);
  return `<details class="note bintro"${tried?"":" open"}><summary><b>How sentence building works</b></summary>
    <p>You see a sentence in English and make it in Amharic by tapping the Amharic words in the right order. After each sentence you see and can hear the whole thing.</p>
    <p><b>Why it helps:</b> Amharic puts words in a different order from English (the verb comes last: <i>I coffee drink</i>), and one verb changes its ending for who does it and when. Building sentences yourself practises both, and pulls together the words, verbs and grammar from the units.</p>
    <ul>
      <li><b>Course sentences</b> are the sentences from the course units.</li>
      <li><b>Verbs in sentences</b> are new sentences made for you each time, so you have to get the verb right for the person (I, you, she…) and the tense (did, does, will, don't).</li>
      <li><b>Sentence meanings</b> shows a whole sentence: pick what it means.</li>
    </ul>
    <p><b>Make it easier or harder</b> with the settings below:</p>
    <ul>
      <li><b>All the words</b> (easier): every word is there, you just put them in order.</li>
      <li><b>One word at a time</b> (harder): pick each word from a few choices that change after every word. <b>Wrong choices</b> and <b>Choices for each word</b> set how tricky those are.</li>
      <li><b>Transcription</b> shows each Amharic word in English letters too. Turn it off when you can read fidel. It is the same switch as at the top of the app, and it works in every test.</li>
      <li><b>Units</b> keeps to the units you've reached. <b>Tenses</b> picks which verb forms you practise.</li>
    </ul></details>`;
}
function bsHTML(page){
  const B=S.bs, h0=BS_HOW.find(x=>x[0]===B.how)||BS_HOW[1], m=BS_MODES.find(x=>x[0]===B.mode)||BS_MODES[1];
  return `<div class="note bset"><h4>${page?"Settings for building sentences":"Settings"}</h4>
    <p class="count">How the words are given</p>${mini("bs-how",BS_HOW.map(x=>[x[0],x[1]]),B.how)}<p class="count bhelp">${esc(h0[2])}</p>`+
    (B.how==="step"?`<p class="count">Wrong choices</p>${mini("bs-mode",BS_MODES.map(x=>[x[0],x[1]]),B.mode)}<p class="count bhelp">${esc(m[2])}</p>
    <p class="count">Choices for each word</p>${mini("bs-n",[2,3,4,6].map(n=>[String(n),String(n)]),String(B.n))}`:"")+`
    <p class="count">Transcription</p>${mini("bs-rom",[["on","Show"],["off","Hide"]],S.rom?"on":"off")}<p class="count bhelp">${S.rom?"Each Amharic word also shows in English letters. Easier if you're still learning to read fidel.":"Amharic shows in fidel only. Harder: you read the letters yourself."} Same as the Transcription switch at the top.</p>
    <p class="count">Word by word</p>${mini("bs-gloss",[["on","Show"],["off","Hide"]],S.gloss?"on":"off")}<p class="count bhelp">After each answer, the English meaning shows under each Amharic word, in Amharic word order, so you can see how the sentence is built.</p>
    <p class="count">Units</p><select id="bs-upto" class="sel" aria-label="Units"><option value="0">All units</option>${FULL.map(n=>`<option value="${n}" ${B.upto===n?"selected":""}>Units 1 to ${n}</option>`).join("")}</select>
    <p class="count">Tenses</p><div class="chips wrapchips">${TENSES.filter(t=>B_TENSES.includes(t[0])).map(t=>`<button class="chip" data-act="bs-tense" data-v="${t[0]}" aria-selected="${B.tenses.includes(t[0])}">${esc(t[1])}</button>`).join("")}</div>
    <p class="count bhelp">Tenses set which verb forms the made-up sentences use, and which tenses appear as wrong choices.</p></div>`;
}
function bsChanged(){ save(); const Q=S.quiz; if(Q&&Q.slot&&Q.result===null){Q.slot.opts=null;Q.slot.bad=[];} }
/* sentence builder: the slots filled so far, then fresh choices for the next one */
function slotHTML(Q,q){
  const W=q.words, done=Q.result!==null;
  if(!Q.slot) Q.slot={n:0,opts:null,bad:[],errs:[]};
  const st=Q.slot; if(!done&&!st.opts) st.opts=bOptions(W[st.n],S.bs);
  let h=`<div class="built slots ${done?(Q.result==="ok"?"right":"wrong"):""}">`+W.map((w,j)=>
    j<st.n?`<span class="tile am filled">${esc(w.am)}${romTag(tRom(w.am,w.rom))}</span>`
    :`<span class="tile gap ${j===st.n&&!done?"now":""}" aria-label="${j===st.n?"next word":"word to come"}">${j===st.n&&!done?"?":"…"}</span>`).join("")+`</div>`;
  if(!done){
    h+=`<div class="bar" style="margin:10px 0 0"><span class="count">Word ${st.n+1} of ${W.length}</span><button class="link" data-act="bs-open">${S.bsOpen?"Hide settings":"Settings"}</button></div><div class="tiles slot-opts">`+st.opts.map((o,j)=>{const bad=st.bad.includes(j);
      return `<button class="tile am ${bad?"no":""}" data-act="s-pick" data-v="${j}" ${bad?"disabled":""}>${esc(o.am)}${romTag(tRom(o.am,o.rom))}</button>`;}).join("")+`</div>`;
  }
  if(!done&&S.bsOpen) h+=bsHTML();
  return h;
}
function slotPick(Q,j){
  const q=Q.qs[Q.i], st=Q.slot, o=st.opts[j]; if(!o||st.bad.includes(j)) return;
  if(!o.ok){ st.bad.push(j); st.errs.push(o.am); return; }
  st.n++; st.bad=[]; st.opts=null;
  if(st.n===q.words.length){
    Q.result=st.errs.length?"no":"ok";
    if(Q.result==="ok")Q.score++; else Q.misses.push({q,p:st.errs.join(" · ")});
    record(q,Q.result==="ok");
  }
}
function renderTest(){
  const Q=S.quiz;
  if(!Q&&G) return gmRender();   // a game (games.js)
  if(!Q) return testMenu();
  const tp=topic(Q.id), QN=Q.n;
  if(Q.done){
    const msg=Q.score===QN?"Perfect score.":Q.score>=QN*.8?"Strong result.":Q.score>=QN*.5?"Good start. Review the ones below.":"Go back over the notes, then try again.";
    let h=`<div class="score"><div class="count">${esc(tp.name)}</div><div class="n">${Q.score}/${QN}</div><p style="margin:6px auto">${msg}</p>${goalAfter(S.goal,S.srs.act,Q.goalHit)}</div>`;
    if(Q.misses.length){h+=`<h3>To review</h3><div class="tbl">`;
      Q.misses.forEach(m=>{const q=m.q, am=q.type!=="mc"||q.optAm, rom=q.type!=="mc"?q.rom:q.opts[q.ans].r;
        if(q.listen){ h+=`<div class="miss">🔊 <span class="am">${esc(q.listen)}</span>`+(q.heardRom?` <span class="rom">${esc(q.heardRom)}</span>`:"")+(q.heardEn?` · ${esc(q.heardEn)}`:"")+
          `<br><span class="count">You ${q.type==="type"?"typed":"chose"} <s class="${am?"am":""}">${esc(m.p||"nothing")}</s></span></div>`; return; }
        h+=`<div class="miss"><span class="${q.bigAm?"am":""}">${esc(q.big)}</span> → <b class="${am?"am":""}">${esc(qAns(q))}</b>`+(rom?` <span class="rom">${esc(rom)}</span>`:"")+
           `<br><span class="count">You ${q.type==="type"?"typed":q.type==="order"||m.built?"built":q.type==="slot"?"also tried":"chose"} <s class="${am?"am":""}">${esc(m.p||"nothing")}</s></span></div>`;});
      h+=`</div>`;}
    return h+`<div class="stack" style="margin-top:16px">${Q.id==="miss"&&!S.miss.length||Q.id==="due"&&!srsDue(S.srs).length?"":`<button class="btn primary wide" data-act="start" data-v="${Q.id}">${Q.id==="miss"?"More mistakes":Q.id==="due"?"Review more":Q.id==="daily"?"Another session":"Try again"}</button>`}<button class="btn wide" data-act="mode" data-v="prog">See my progress</button><button class="btn wide" data-act="quit">Choose another test</button></div>`;
  }
  const q=Q.qs[Q.i], answered=q.type==="mc"?Q.picked!==null:Q.result!==null;
  const bigR=!q.listen&&!qNoRom(q)&&q.bigAm?tRom(q.big,q.bigRom):"";
  if(bsAll(q)) slotAsOrder(q);
  let h=`<div class="prog"><i style="width:${(Q.i+(answered?1:0))/QN*100}%"></i></div>
   <div class="bar" style="margin:0"><span class="count">Question ${Q.i+1} of ${QN}</span><button class="link" data-act="quit">End test</button></div>
   <div class="q ${q.type==="type"&&!q.listen?"slim":""} ${q.listen?"lsq":""}">`+(q.listen?lsHead(q,answered):`<div class="kind">${esc(q.kind)}</div><div class="big ${q.bigAm?"am":""} ${q.kind==="Fidel"&&!answered||q.parts?"nosay":""}">${esc(q.big)}</div>${bigR?`<div class="rom bigrom">${esc(bigR)}</div>`:""}${q.clock?clockSVG(q.clock[0],q.clock[1],92):""}${q.parts?drSayBtn(q.parts):""}<div class="sub ${q.subRom?"rom":""}">${bsAll(q)?"Tap the words in the right order":!q.subRom&&!qNoRom(q)&&ETH_RE.test(q.sub||"")?romRuns(q.sub):esc(q.sub)}</div>`)+`</div>`;
  let ok;
  if(q.type==="type"){
    h+=kbHTML(Q); ok=Q.result==="ok";
  }else if(q.type==="slot"&&!bsAll(q)){
    ok=Q.result==="ok"; h+=slotHTML(Q,q);
  }else if(q.type==="order"||q.type==="slot"){
    ok=Q.result==="ok";
    const tr=j=>romTag(q.tileRom?q.tileRom[j]:tRom(q.tiles[j]));
    h+=`<div class="built ${answered?(ok?"right":"wrong"):""}">`+(Q.built.length?Q.built.map((j,p)=>`<button class="tile am" data-act="o-rem" data-v="${p}" ${answered?"disabled":""}>${esc(q.tiles[j])}${tr(j)}</button>`).join(""):`<span class="count">Your sentence appears here</span>`)+`</div>`;
    if(q.type==="slot"&&!answered) h+=`<div class="bar" style="margin:10px 0 0"><span class="count">Put the ${q.tiles.length} words in order</span><button class="link" data-act="bs-open">${S.bsOpen?"Hide settings":"Settings"}</button></div>`;
    h+=`<div class="tiles">`+q.tiles.map((w,j)=>`<button class="tile am ${Q.built.includes(j)?"used":""}" data-act="o-add" data-v="${j}" ${answered||Q.built.includes(j)?"disabled":""}>${esc(w)}${tr(j)}</button>`).join("")+`</div>`;
    if(!answered) h+=`<button class="btn primary wide" data-act="o-check" style="margin-top:14px" ${Q.built.length===q.tiles.length?"":"disabled"}>Check</button>`;
    if(q.type==="slot"&&!answered&&S.bsOpen) h+=bsHTML();
  }else{
    h+=`<div class="stack">`; ok=Q.picked===q.ans;
    q.opts.forEach((o,j)=>{
      const cls=answered?(j===q.ans?" right":j===Q.picked?" wrong":""):"";
      h+=`<button class="opt${cls}" data-act="ans" data-v="${j}" ${answered?"disabled":""}>`+
         (q.optAm?`<span class="am">${esc(o.l)}</span>`+(answered?(o.r?`<span class="rom">${esc(o.r)}</span>`:""):qNoRom(q)?"":(r=>r?`<span class="rom">${esc(r)}</span>`:"")(tRom(o.l,o.r))):`<span>${esc(o.l)}</span>`)+`</button>`;
    });
    h+=`</div>`;
  }
  if(answered){
    h+=`<p class="fb ${ok?"good":"bad"}">${ok?"Correct":q.type==="slot"&&Q.slot&&!bsAll(q)?`Built, with ${Q.slot.errs.length} wrong ${Q.slot.errs.length===1?"pick":"picks"}. The sentence is:`:q.type==="order"||q.type==="slot"?"Not quite. The right order is:":q.type==="type"?`Not quite. It is <span class="am">${esc(q.answer)}</span>`:"Not quite. The answer is highlighted in green."}</p>${q.type==="order"||q.type==="slot"?`<p class="ans"><span class="am">${esc(q.answer)}</span><span class="rom">${esc(q.rom)}</span></p>`:""}
${q.parts&&q.bigRom?`<p class="drans"><span class="am nosay norom-auto">${esc(q.parts.join(" "))}</span>${drSayBtn(q.parts)}${bigR?"":` <span class="rom">${esc(q.bigRom)}</span>`}</p>`:""}${q.ansParts?`<p class="drans">${drSayBtn(q.ansParts,"Hear the answer")}</p>`:""}
${glossQHTML(q)}
        <button class="btn primary wide" data-act="next" style="margin-top:12px">${Q.i===QN-1?"See result":"Next question"}</button>`;
  }
  return h;
}

/* ---------- profiles and backups ---------- */
const plural=(n,w)=>n+" "+w+(n===1?"":"s");
function statLine(d){
  d=d||{}; const t=Object.keys(d.best||{}).length, m=(d.miss||[]).length, it=d.srs&&d.srs.it?Object.values(d.srs.it):[], ms=it.filter(r=>r[0]>=SRS_MASTER).length;
  const k=goalStreak(goalClean(d.goal),d.srs&&d.srs.act||{}), sk=k.now?goalStreakText(k)+", ":"";
  return t||m||it.length ? sk+plural(t,"test")+" with scores"+(it.length?", "+it.length+" items met"+(ms?" ("+ms+" mastered)":""):"")+(m?", "+plural(m,"mistake")+" to review":"") : "No scores yet";
}
function renderWho(){
  const L=PROF.list(), P=S.pf;
  let h=`<h2>${L.length?"Who's practising?":"What's your name?"}</h2><p class="lead">${L.length?"Each person has their own scores, mistakes and settings.":"Type your name to start. If other people use this device they can add their own name later, and everyone's progress is kept separately."}</p>`;
  if(L.length) h+=`<div class="stack" style="margin-top:14px">`+L.map(p=>`<button class="topic" data-act="pf-use" data-v="${p.id}"><b>${esc(p.name)}</b><small>${esc(statLine(PROF.load(p.id)))}</small></button>`).join("")+`</div><h3>Someone new</h3>`;
  h+=`<div class="ntry pfrow"><input id="pf-add" type="text" maxlength="${NAME_MAX}" autocomplete="off" placeholder="Name (up to ${NAME_MAX} letters)" value="${esc(P.add)}"><button class="btn primary" data-act="pf-add">${L.length?"Add":"Start"}</button></div>`;
  if(!L.length) h+=`<p class="count" style="margin-top:14px">Moving from another device? <button class="link" data-act="mode" data-v="me">Restore a backup</button></p>`;
  return h;
}
function renderMe(){
  const P=S.pf, cur=PROF.cur(), L=PROF.list();
  let h=`<h2>Profiles</h2><p class="lead">Each person has their own scores, mistakes and settings on this device. ${L.length>1?" Tap a name to switch.":""}</p><div class="stack" style="margin-top:14px">`;
  L.forEach(p=>{ const on=cur&&p.id===cur.id;
    h+=`<button class="topic${on?" on":""}" data-act="pf-use" data-v="${p.id}"><b>${esc(p.name)}</b><small>${esc(statLine(PROF.load(p.id)))}</small><span class="best">${on?"<strong>✓</strong>using now":"switch"}</span></button>`; });
  h+=`</div>`;
  if(cur){
    if(P.ren!==null) h+=`<div class="ntry pfrow" style="margin-top:10px"><input id="pf-ren" type="text" maxlength="${NAME_MAX}" autocomplete="off" value="${esc(P.ren)}"><button class="btn primary" data-act="pf-ren-ok">Save</button><button class="btn" data-act="pf-ren-x">Cancel</button></div>`;
    else if(P.del) h+=`<div class="note warn"><p>Delete ${esc(cur.name)} and all their progress from this device? This can't be undone, so download a backup first if you might want it.</p><div class="pfrow" style="margin-top:8px"><button class="btn danger" data-act="pf-del-ok">Delete</button><button class="btn" data-act="pf-del-x">Cancel</button></div></div>`;
    else h+=`<div class="bar" style="justify-content:flex-start;gap:16px"><button class="link" data-act="pf-ren">Rename ${esc(cur.name)}</button><button class="link" data-act="pf-del">Delete ${esc(cur.name)}</button></div>`;
  }
  h+=`<h3>Add someone</h3><div class="ntry pfrow"><input id="pf-add" type="text" maxlength="${NAME_MAX}" autocomplete="off" placeholder="Name (up to ${NAME_MAX} letters)" value="${esc(P.add)}"><button class="btn primary" data-act="pf-add">Add</button></div>`;
  if(cur){
    h+=`<h3>Back up or move to another device</h3><div class="note"><p>Save ${esc(cur.name)}'s progress as a file or a code. On the other phone or computer, open this app, go to Profiles and restore it.</p>
      <div class="pfrow" style="margin-top:10px"><button class="btn" data-act="pf-file">Download backup file</button><button class="btn" data-act="pf-code">Show backup code</button></div>`;
    if(P.code) h+=`<textarea id="pf-codebox" class="codebox" readonly rows="4">${esc(P.code)}</textarea><div class="pfrow"><button class="btn primary" data-act="pf-copy">Copy code</button></div>`;
    if(P.msg) h+=`<p class="count" role="status">${esc(P.msg)}</p>`;
    h+=`</div>`;
  }
  h+=`<h3>Restore a backup</h3><div class="note">`;
  if(P.incoming){
    const b=P.incoming, same=PROF.byName(b.name), when=new Date(b.saved);
    h+=`<p><b>Backup of ${esc(b.name)}</b>${isNaN(when)?"":", saved "+esc(when.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}))}. ${esc(statLine(b.data))}.</p><div class="pfrow" style="margin-top:10px">`+
      (same?`<button class="btn primary" data-act="pf-in-replace">Replace ${esc(same.name)}'s progress</button><button class="btn" data-act="pf-in-new">Add as a new profile</button>`:`<button class="btn primary" data-act="pf-in-new">Add ${esc(b.name)}</button>`)+
      `<button class="btn" data-act="pf-in-x">Cancel</button></div>`;
  }else{
    h+=`<p>Paste a backup code, or choose a backup file.</p><textarea id="pf-in" class="codebox" rows="3" placeholder="Paste code here">${esc(P.inText)}</textarea>
      <div class="pfrow"><button class="btn primary" data-act="pf-in-read">Restore code</button><label class="btn filebtn">Choose file<input type="file" id="pf-infile" accept=".json,.txt,application/json,text/plain"></label></div>`;
    if(P.inErr) h+=`<p class="count bad" role="alert">${esc(P.inErr)}</p>`;
  }
  return h+`</div>`+recHTML()+offlineHTML();
}
function useProfile(id){ recCount=null; keep(); PROF.use(id); applyData(PROF.load()); S.pf.ren=null; S.pf.del=false; S.pf.code=""; S.pf.msg=""; }
async function readIncoming(text){
  try{ S.pf.incoming=await readBackup(text); S.pf.inErr=""; S.pf.inText=""; }
  catch(e){ S.pf.incoming=null; S.pf.inErr=e.message; }
  render();
}

/* ---------- render + events ---------- */
const MODES=["course","fidel","eth","ref","test","prog"];
function render(){
  schemeApply(S.scheme);
  document.body.classList.toggle("norom",!S.rom);
  document.body.classList.toggle("welcoming",S.mode==="welcome");
  // quizzes, typing practice and dialogues keep a reading width on a wide screen (see "laptop and desktop" in style.css)
  document.body.classList.toggle("focus",!!(S.mode==="test"&&(S.quiz||G))||(S.mode==="fidel"&&S.ftab==="type")||(S.mode==="course"&&S.lesson&&S.lview==="dlg")||rdFocus());
  $("#romtoggle").setAttribute("aria-pressed",S.rom);
  MODES.forEach(m=>$("#tab-"+m).setAttribute("aria-selected",S.mode===m||(m==="fidel"&&S.mode==="num")));
  if(S.mode==="fidel"||S.mode==="num") S.fnLast=S.mode;   // the ፊደል (Fidel) tab reopens whichever half you used last
  const rb=$("#ratebtn"); rb.textContent=sayRate+"×"; rb.setAttribute("aria-label","Audio speed "+sayRate+" times. Tap to change."); rb.classList.toggle("slow",sayRate<1);
  const cur=PROF.cur(), wb=$("#whobtn"); wb.innerHTML=`<span class="av">${cur?esc((cur.name.trim()[0]||"?").toUpperCase()):"?"}</span><span class="nm">${esc(cur?cur.name:"Profiles")}</span>`; fitName(wb.querySelector(".nm")); wb.title=cur?`${cur.name}: profiles and backup`:"Profiles and backup"; $("#whobtn").setAttribute("aria-pressed",S.mode==="me"||S.mode==="who");
  $("#findbtn").setAttribute("aria-pressed",S.mode==="find");
  $("#app").innerHTML = (S.find.from&&S.mode!=="find"?`<button class="back findback" data-act="find-back">‹ Back to search</button>`:"")+(S.mode==="welcome"?renderWelcome():S.mode==="who"?renderWho():S.mode==="me"?renderMe():S.mode==="find"?renderFind():S.mode==="course"?renderCourse():S.mode==="fidel"?renderFidel():S.mode==="eth"?renderEth():S.mode==="ref"?renderRef():S.mode==="num"?renderNum():S.mode==="prog"?renderProgress():renderTest())+(S.mode==="welcome"?"":wlLink());
  autoRom($("#app"));
  addSayButtons($("#app"));
  // listening questions play by themselves, once, when they first appear
  const Q=S.quiz; if(S.mode==="test"&&Q&&!Q.done){const q=Q.qs[Q.i]; if(q.listen&&Q.heard!==Q.i){Q.heard=Q.i; playAm(q.listen);}}
}
const typing = () => (S.mode==="test"&&S.quiz&&!S.quiz.done&&S.quiz.qs[S.quiz.i].type==="type") ? S.quiz : (S.mode==="fidel"&&S.ftab==="type") ? S.prac : null;
function check(){
  const t=typing(); if(!t||t.result) return;
  const q=t===S.prac?t.q:t.qs[t.i];
  const nz=q.num?numNorm:x=>x; t.result = canon(nz(t.typed))===canon(nz(q.answer))&&t.typed.trim()!=="" ? "ok":"no";
  if(t===S.quiz){ if(t.result==="ok")t.score++; else t.misses.push({q,p:t.typed}); record(q,t.result==="ok"); }
}
document.addEventListener("input",e=>{
  if(e.target.id==="nin"){S.num.n=e.target.value;$("#nout").innerHTML=numOut();}
  if(e.target.id==="tin"){const t=typing(); if(t) t.typed=e.target.value;}
  if(e.target.id==="findq"){S.find.q=e.target.value;findRefresh();}
  if(e.target.id==="pf-add") S.pf.add=e.target.value;
  if(e.target.id==="pf-ren") S.pf.ren=e.target.value;
  if(e.target.id==="pf-in") S.pf.inText=e.target.value;
  if(e.target.id==="vsearch"){S.v.q=e.target.value;const m=vMatch();if(m.length&&!m.some(x=>x[1]===S.v.sel))S.v.sel=m[0][1];$("#vlist").innerHTML=vListHTML();const p=$("#vpanel");}
});
document.addEventListener("change",e=>{
  const id=e.target.id, val=e.target.value;
  if(id==="vlesson"){S.v.lesson=val;const m=vMatch();if(m.length)S.v.sel=m[0][1];render();}
  else if(id==="vclesson"){S.v.clesson=val;vNewCard();render();}
  else if(id==="vctense"){S.v.ctense=val;vNewCard();render();}
  else if(id==="vsearch"){render();}
  else if(id==="upto"){S.upto=+val;save();render();}
  else if(id==="pf-infile"&&e.target.files[0]){const f=e.target.files[0]; f.text().then(readIncoming,()=>{S.pf.inErr="Couldn't read that file.";render();});}
  else if(id==="ls-upto"){S.ls.upto=+val;save();render();}
  else if(id==="bs-upto"){S.bs.upto=+val;bsChanged();render();}
  else if(id==="wl-skip"){wlSkip.set(e.target.checked);}
  else if(id==="goal-rest"){S.goal.rest=e.target.checked;save();render();}
  else if(id.startsWith("dr-")){drChange(id,val);render();}
  else if(id.startsWith("gm-")){gmChange(id,val);render();}
});
document.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.id==="tin"){check();render();}
  if(e.key==="Enter"&&(e.target.id==="pf-add"||e.target.id==="pf-ren")) document.querySelector(`[data-act="${e.target.id==="pf-add"?"pf-add":"pf-ren-ok"}"]`).click(); });
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b||b.disabled) return;
  const a=b.dataset.act, v=b.dataset.v, Q=S.quiz, F=S.fc, t=typing(); let top=false;
  if(a==="say"){playAm(v);return;}
  if(a==="goal-n"){S.goal.n=+v;goalTick(S.goal,S.srs.act);save();render();return;}   // goal.js
  if(a.startsWith("gm-")){ if(!gmAct(a,v)) render(); return; }   // games.js
  if(a.startsWith("dr-")){ if(!drAct(a,v)) render(); return; }   // drills.js
  if(a.startsWith("rec-")){recAct(a,v,b.dataset.g);return;}
  if(a==="find-go"){dgStop();S.find.from=true;findGo(v);return;}
  if(a==="find-back"){dgStop();S.mode="find";render();window.scrollTo(0,0);const i=$("#findq");if(i)i.focus({preventScroll:true});return;}
  if(a==="find-try"){S.find.q=v;const i=$("#findq");if(i)i.value=v;findRefresh();return;}
  if(a.startsWith("dg-")&&a!=="dg-open"){ if(!dgAct(a,v)) render(); return; }
  if(a.startsWith("rd-")){ if(!rdAct(a,v,b)) render(); return; }
  if(a.startsWith("eth-")){ dgStop(); S.find.from=false; ethAct(a,v,b); return; }   // ethiopia.js
  if(a==="mode"&&v==="eth") ethReset();   // the Ethiopia tab always opens on its list of notes
  if(a==="mode"||a==="lesson"||a==="lesson-go"||a==="dg-open"||a==="start") rdLeave();
  if(a==="mode"||a==="lesson"||a==="lview"||a==="dg-open") dgStop();
  if(a==="mode"||a==="fn"||a==="lesson"||a==="rtab"||a==="ftab"||a==="dg-open") S.find.from=false;   // "‹ Back to search" lasts until you go elsewhere
  if(a==="dg-open"){S.mode="course";S.lesson=+v;S.lview="dlg";dgReset(+v,true);render();window.scrollTo(0,0);return;}
  if(a==="say-slow"){playAm(v,lsSlow());return;}
  if(a==="rom"){S.rom=!S.rom;save();}
  else if(a==="gloss"){S.gloss=!S.gloss;save();}
  else if(a==="rate"){sayRate=SAY_RATES[(SAY_RATES.indexOf(sayRate)+1)%SAY_RATES.length];save();}
  else if(a==="fn"){S.mode=v;top=true;}
  else if(a==="mode"){S.mode=(v==="fidel"&&S.mode!=="fidel"&&S.mode!=="num"&&S.fnLast==="num")?"num":v;top=true; if(v==="find"){render();window.scrollTo(0,0);const i=$("#findq");if(i){i.focus();i.select();}return;} if(v==="me"){S.pf.ren=null;S.pf.del=false;S.pf.code="";S.pf.msg="";S.pf.inErr="";}}
  else if(a==="wl-start"){S.mode=wlStart();top=true;}
  else if(a==="scheme"){S.scheme=v; S.schemePicked=true; schemeDevice.set(v); if(PROF.cur()) save();}
  else if(a==="scheme-jump"){const el=$("#colours"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); return;}
  else if(a==="pf-use"){useProfile(v); if(S.mode==="who")S.mode="course"; top=S.mode!=="me";}
  else if(a==="pf-add"){const n=S.pf.add.trim(); if(!n){const i=$("#pf-add"); if(i)i.focus(); return;} keep(); PROF.add(n); applyData({}); S.pf.add=""; if(S.mode==="who")S.mode="course"; top=true;}
  else if(a==="pf-ren"){S.pf.ren=PROF.cur().name;S.pf.del=false;}
  else if(a==="pf-ren-ok"){PROF.rename(PROF.cur().id,S.pf.ren||"");S.pf.ren=null;}
  else if(a==="pf-ren-x"){S.pf.ren=null;}
  else if(a==="pf-del"){S.pf.del=true;S.pf.ren=null;}
  else if(a==="pf-del-x"){S.pf.del=false;}
  else if(a==="pf-del-ok"){recDelAll(PROF.cur().id); recCount=null; PROF.remove(PROF.cur().id); S.pf.del=false; S.pf.code=""; applyData(PROF.load()); if(!PROF.cur())S.mode="who";}
  else if(a==="pf-file"){save(); const b=PROF.backup(), url=URL.createObjectURL(new Blob([JSON.stringify(b,null,1)],{type:"application/json"})), l=document.createElement("a");
    l.href=url; l.download="amharic-"+b.name.replace(/[^\w-]+/g,"-").toLowerCase()+"-"+b.saved.slice(0,10)+".json"; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    S.pf.msg="Backup file saved to your downloads.";}
  else if(a==="pf-code"){save(); backupToCode(PROF.backup()).then(c=>{S.pf.code=c;S.pf.msg="";render();}); return;}
  else if(a==="pf-copy"){const c=S.pf.code; const done=ok=>{S.pf.msg=ok?"Code copied. Paste it somewhere you can reach from the other device, such as an email or message to yourself.":"Couldn't copy automatically. Select the code above and copy it.";render();};
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(c).then(()=>done(true),()=>done(false)); else done(false); return;}
  else if(a==="pf-in-read"){readIncoming(S.pf.inText); return;}
  else if(a==="pf-in-x"){S.pf.incoming=null;}
  else if(a==="pf-in-replace"){const b=S.pf.incoming, p=PROF.byName(b.name); if(p){PROF.save(b.data,p.id); PROF.use(p.id); applyData(b.data);} S.pf.incoming=null; S.pf.msg=""; S.mode="course"; top=true;}
  else if(a==="pf-in-new"){const b=S.pf.incoming; keep(); PROF.add(b.name,b.data); applyData(b.data); S.pf.incoming=null; S.mode="course"; top=true;}
  else if(a==="lesson"){S.lesson=v?+v:null;S.lview="notes";top=true;}
  else if(a==="lesson-go"){S.mode="course";S.lesson=+v;S.lview="notes";top=true;}
  else if(a==="lview"){S.lview=v;}
  else if(a==="ftab"){S.ftab=v;top=true;}
  else if(a==="pick"){S.pick=v;}   // just shows the letter; its ▶ button plays it
  else if(a==="rtab"){S.rtab=v;top=true;}
  else if(a==="cat"){S.cat=v;}
  else if(a==="eview"){S.eview=v;}
  else if(a==="flip"){F.flip=!F.flip;}
  else if(a==="card"){const n=F.order.length;F.i=(F.i+ +v+n)%n;F.flip=false;}
  else if(a==="mix"){F.order=shuffle(F.order);F.i=0;F.flip=false;}
  else if(a==="psrc"){S.prac.src=v;newPrac();}
  else if(a==="plesson"){S.prac.lesson=v;newPrac();}
  else if(a==="typelesson"){S.mode="fidel";S.ftab="type";S.prac.src="words";S.prac.lesson=v;newPrac();top=true;}
  else if(a==="p-next"){newPrac();}
  else if(a==="p-show"){S.prac.shown=!S.prac.shown;}
  else if(a==="k-native"){S.kb.native=!S.kb.native;S.kb.cons=null;}
  else if(a==="vview"){S.v.view=v;}
  else if(a==="vsel"){S.v.sel=+v;}
  else if(a==="vtense"){S.v.tense=v;}
  else if(a==="vdeck"){S.v.deck=v;vNewCard();}
  else if(a==="vflip"){S.v.flip=!S.v.flip;}
  else if(a==="vnext"){vNewCard();}
  else if(a==="k-cons"){S.kb.cons=S.kb.cons===+v?null:+v;}
  else if(a==="k-form"&&t){t.typed+=v;S.kb.cons=null;}
  else if(a==="k-space"&&t){t.typed+=" ";}
  else if(a==="k-del"&&t){t.typed=Array.from(t.typed).slice(0,-1).join("");}
  else if(a==="k-clear"&&t){t.typed="";}
  else if(a==="k-check"){check();}
  else if(a==="start"){gmStop();startQuiz(v);if(S.quiz)S.mode="test";top=true;}
  else if(a==="quit"){S.quiz=null;top=true;}
  else if(a==="ntab"){S.num.tab=v;}
  else if(a==="ndeck"){S.num.deck=v;}
  else if(a==="nrand"){S.num.n=String(pick([ri(100),ri(100),ri(1000),ri(NMAX+1)]));}
  else if(a==="o-add"&&Q&&Q.result===null){if(!Q.built.includes(+v))Q.built.push(+v);}
  else if(a==="o-rem"&&Q&&Q.result===null){Q.built.splice(+v,1);}
  else if(a==="o-check"&&Q&&Q.result===null){const q=Q.qs[Q.i], said=Q.built.map(j=>q.tiles[j]).join(" "); Q.result=canon(said)===canon(q.answer)?"ok":"no"; if(Q.result==="ok")Q.score++; else Q.misses.push({q,p:said,built:1}); record(q,Q.result==="ok");}
  else if(a==="s-pick"&&Q&&Q.result===null&&Q.slot){slotPick(Q,+v);}
  else if(a==="ls-hint"&&Q){Q.hint=Q.i;}
  else if(a==="ls-what"){S.ls.what=v;save();}
  else if(a==="bs-open"){S.bsOpen=!S.bsOpen;}
  else if(a==="tsec"){S.tsec=v==="all"?null:v;top=true;}
  else if(a==="bs-mode"){S.bs.mode=v;bsChanged();}
  else if(a==="bs-how"){S.bs.how=v==="all"?"all":"step"; if(Q&&Q.result===null){Q.slot=null;Q.built=[];} save();}
  else if(a==="bs-rom"){S.rom=v==="on";save();}
  else if(a==="bs-gloss"){S.gloss=v==="on";save();}
  else if(a==="bs-n"){S.bs.n=+v;bsChanged();}
  else if(a==="bs-tense"){const T0=S.bs.tenses,k=T0.indexOf(v); if(k>=0){if(T0.length>1)T0.splice(k,1);} else T0.push(v); bsChanged();}
  else if(a==="ans"&&Q&&Q.picked===null){Q.picked=+v; const q=Q.qs[Q.i]; if(Q.picked===q.ans)Q.score++; else Q.misses.push({q,p:q.opts[Q.picked].l}); record(q,Q.picked===q.ans);}
  else if(a==="next"&&Q){ if(Q.i===Q.n-1){Q.done=true; if(Q.id==="daily")S.day=today(); if(Q.id!=="miss"&&Q.id!=="due"&&(S.best[Q.id]==null||Q.score>S.best[Q.id]))S.best[Q.id]=Q.score; save();} else {Q.i++;Q.picked=null;Q.typed="";Q.built=[];Q.result=null;Q.slot=null;S.kb.cons=null;} top=true;}
  render();
  if(top) window.scrollTo(0,0);
});
// A shared link ending #welcome opens the welcome page, even in a tab that is already open.
window.addEventListener("hashchange",()=>{ if(wlAsked()){ dgStop(); S.mode="welcome"; render(); window.scrollTo(0,0); } });
render();
