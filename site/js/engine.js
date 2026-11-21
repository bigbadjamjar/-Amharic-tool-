/* ---------- verb engine ----------
   Stems are worked out in a precise notation (ä ə š č ǧ ñ ṭ ṣ, doubled letters = gemination, "|" = join that must not merge),
   then turned into fidel and into the everyday Latin spelling. */
function modern(s){
  const D="̣";
  s=s.normalize("NFC").replace(/\|/g,"").split("č"+D+"č"+D).join("č"+D).split("p"+D+"p"+D).join("p"+D)
     .replace(/ṭṭ/g,"ṭ").replace(/ṣṣ/g,"ṣ").replace(/šš/g,"š").replace(/žž/g,"ž").replace(/ññ/g,"ñ").replace(/čč(?!̣)/g,"č");
  s=s.replace(/e/g,"é").replace(/ä/g,"e").replace(/ə/g,"i");
  return s.split("č"+D).join("ch'").split("p"+D).join("p'").replace(/ṭ/g,"t'").replace(/ṣ/g,"ts'").replace(/š/g,"sh").replace(/č/g,"ch").replace(/ǧ/g,"j").replace(/ž/g,"zh").replace(/ñ/g,"gn");
}
const VV="äuiaeəo";
const isV=u=>u.length===1&&VV.includes(u);
const isC=u=>u&&u!=="|"&&u!==" "&&!isV(u);
function units(s){const a=Array.from(s.normalize("NFC")),o=[];for(let i=0;i<a.length;i++){let ch=a[i];if(a[i+1]==="̣"){ch+=a[i+1];i++;}o.push(ch);}return o;}

/* --- precise notation -> fidel --- */
const ROW={h:"ሀ",l:"ለ",m:"መ",r:"ረ",s:"ሰ","š":"ሸ",q:"ቀ",b:"በ",v:"ቨ",t:"ተ","č":"ቸ",n:"ነ","ñ":"ኘ","":"አ",k:"ከ",w:"ወ",z:"ዘ","ž":"ዠ",y:"የ",d:"ደ","ǧ":"ጀ",g:"ገ","ṭ":"ጠ","č̣":"ጨ","p̣":"ጰ","ṣ":"ጸ",f:"ፈ",p:"ፐ"};
const ORD={"ä":0,u:1,i:2,a:3,e:4,"ə":5,o:6};
const LAB={q:0x1248,h:0x1288,k:0x12B0,g:0x1310}, LABO={"ä":0,i:2,a:3,e:4,"ə":5};
const WAOK="lmrsšbvtčnñzždǧṭfṣ";
function toFidel(s,rows){
  const u=units(s); let out="";
  for(let i=0;i<u.length;i++){
    const x=u[i];
    if(x==="|")continue;
    if(x===" "){out+=" ";continue;}
    if(isV(x)){out+=String.fromCharCode("አ".charCodeAt(0)+(x==="a"?0:x==="ä"?7:ORD[x]));continue;}
    if(u[i+1]===x)i++;                                   // doubled letter: written once
    const base=((rows&&rows[x])||ROW[x]||"አ").charCodeAt(0);
    const n1=u[i+1], n2=u[i+2];
    if(n1==="w"&&n2!==undefined&&isV(n2)){
      if(LAB[x]&&LABO[n2]!==undefined&&(rows===undefined||!rows[x]||rows[x]===ROW[x])){out+=String.fromCharCode(LAB[x]+LABO[n2]);i+=2;continue;}
      if(n2==="a"&&(WAOK.includes(x)||x==="č̣"||x==="p̣")){out+=String.fromCharCode(base+7);i+=2;continue;}
    }
    if(n1!==undefined&&isV(n1)){
      let o=ORD[n1]; if(o===0&&(x==="h")&&false)o=3;
      out+=String.fromCharCode(base+o);i++;continue;
    }
    out+=String.fromCharCode(base+5);
  }
  return out;
}
// which twin letter a verb uses for a sound, read off its dictionary form
function rowsOf(am){
  const m={};
  for(const ch of am){const f=FID.find(x=>x.ch===ch);if(!f)continue;const r=FR[f.row];const snd=REV[r[0]];if(snd!==undefined&&snd!==""&&!(snd in m))m[snd]=r[0];}
  return m;
}
const REV={}; for(const k in ROW)REV[ROW[k]]=k;
Object.assign(REV,{"ሐ":"h","ኀ":"h","ኸ":"h","ሠ":"s","ፀ":"ṣ","ዐ":""});

/* --- dictionary form -> syllables --- */
function syls(w){
  const u=units(w), S=[];
  for(let i=0;i<u.length;i++){
    if(isV(u[i])){S.push({c:"",g:false,v:u[i]});continue;}
    const s={c:u[i],g:false,v:""};
    if(u[i+1]===u[i]){s.g=true;i++;}
    if(u[i+1]==="w"&&u[i+2]&&isV(u[i+2])&&"qgkh".includes(s.c)){s.c+="w";i++;}
    if(u[i+1]&&isV(u[i+1])){s.v=u[i+1];i++;}
    S.push(s);
  }
  return S;
}
const tj=x=>x+(x.endsWith("t")?"|t":"t");
const gm=c=>c.endsWith("w")?c.slice(0,-1)+c:c+c;
const PAL={d:"ǧ",t:"č","ṭ":"č̣",n:"ñ",s:"š",z:"ž","ṣ":"č̣",l:"y"};

/* --- core stems for an unprefixed shape --- */
function core(S,B){
  const n=S.length, C=S.map(x=>x.c), V=S.map(x=>x.v), G=S.map(x=>x.g);
  const [a,b,c,d]=C, v=V[0];
  if(n===2&&G[1]){
    if(V[1]==="a") return B?{k:"SAMMA",P:a+v+gm(b)+"a",Pt:"a",I:a+v+gm(b)+"a",J:a+v+gm(b)+"a",Imp:a+v+gm(b)+"a",G:a+v+gm(b)+"ət",VN:"mä"+a+v+gm(b)+"at",Part:a+v+gm(b),a,b,v}
                         :{k:"SAMMA",P:a+v+gm(b)+"a",Pt:"a",I:a+v+b+"a",J:v==="ä"?a+b+"a":a+v+b+"a",Imp:v==="ä"?a+"ə"+b+"a":a+v+b+"a",G:tj(a+v+b),VN:"mä"+(v==="ä"?a+b:a+v+b)+"at",Part:a+v+b,a,b,v};
    if(V[1]==="ä") return (B||v==="o")?{k:"QARRA",P:a+v+gm(b),Pt:"ä",I:a+v+gm(b),J:a+v+gm(b),Imp:a+v+gm(b),G:a+v+gm(b)+"ət",VN:"mä"+a+v+gm(b)+"ät",Part:a+v+gm(b),a,b,v}
                         :{k:"QARRA",P:a+v+gm(b),Pt:"ä",I:a+v+b,J:a+"ə"+b,Imp:a+"ə"+b,G:tj(a+v+b),VN:"mä"+a+b+"ät",Part:a+v+b,a,b,v};
  }
  if(n===2&&!G[1]&&V[1]==="ä"){
    if(v==="a") return {k:"SAM",P:a+"a"+b,Pt:"C",I:a+"ə"+b,J:a+"a"+b,Imp:a+"a"+b,G:a+"ə"+b,VN:"mä"+a+"a"+b,Part:a+"a"+b,a,b,v};
    if(v==="o") return {k:"QOM",P:a+"o"+b,Pt:"C",I:a+"o"+b,J:a+"u"+b,Imp:a+"u"+b,G:a+"o"+b,VN:"mä"+a+"o"+b,Part:a+"wa"+b,a,b,v};
    if(v==="e") return {k:"HED",P:a+"e"+b,Pt:"C",I:a+"e"+b,J:a+"i"+b,Imp:a+"i"+b,G:a+"e"+b,VN:"mä"+a+"e"+b,Part:a+"iya"+b,a,b,v};
    if(v==="ä") return {k:"SHAT",P:a+"ä"+b,Pt:"C",I:a+"ä"+b,J:a+"ə"+b,Imp:a+"ə"+b,G:a+"ä"+b,VN:"mä"+a+"ä"+b,Part:a+"a"+b,a,b,v};
  }
  if(n===3&&G[1]&&!G[2]&&V[2]==="ä"&&V[1]==="ä"){
    if(v==="a") return {k:"CTYPE",P:a+"a"+gm(b)+"ä"+c,Pt:"C",I:a+"a"+gm(b)+"ə"+c,J:a+"a"+b+c,Imp:a+"a"+b+c,G:a+"a"+b+c,VN:"mä"+a+"a"+b+"ä"+c,Part:a+"a"+b+"a"+c,a,b,c,v};
    if(B) return {k:"TRI",B:1,P:a+v+gm(b)+"ä"+c,Pt:"C",I:a+v+gm(b)+"ə"+c,J:a+v+gm(b)+"ə"+c,Imp:a+v+gm(b)+"ə"+c,G:a+v+gm(b)+"ə"+c,VN:"mä"+a+v+gm(b)+"ä"+c,Part:a+v+gm(b)+"a"+c,a,b,c,v};
    const o=v==="o";
    return {k:"TRI",P:a+v+gm(b)+"ä"+c,Pt:"C",I:a+v+b+c,J:o?a+"u"+b+"ä"+c:a+b+"ä"+c,Imp:o?a+"u"+b+"ä"+c:a+"ə"+b+"ä"+c,G:a+v+b+c,VN:"mä"+(o?a+"u":a)+b+"ä"+c,Part:a+v+b+"a"+c,a,b,c,v};
  }
  if(n===3&&G[2]&&!G[1]){
    if(V[2]==="a"&&V[1]==="ä") return {k:"BARATTA",P:a+v+b+"ä"+gm(c)+"a",Pt:"a",I:a+v+b+"ä"+gm(c)+"a",J:a+v+b+c+"a",Imp:a+v+b+c+"a",G:a+v+b+c+"ət",VN:"mä"+a+v+b+c+"at",Part:a+v+b+c,a,b,c,v};
    if(V[2]==="a"&&V[1]==="a") return {k:"BAR2",P:a+v+b+"a"+gm(c)+"a",Pt:"a",I:a+v+b+"a"+gm(c)+"a",J:a+v+b+"a"+c+"a",Imp:a+v+b+"a"+c+"a",G:tj(a+v+b+"a"+c),VN:"mä"+a+v+b+"a"+c+"at",Part:a+v+b+"a"+c,a,b,c,v};
    if(V[2]==="ä"&&V[1]==="ä") return {k:"SALACCA",P:a+v+b+"ä"+gm(c),Pt:"ä",I:a+v+b+"ä"+gm(c),J:a+v+b+c,Imp:a+v+b+c,G:a+v+b+c+"ət",VN:"mä"+a+v+b+c+"ät",Part:a+v+b+c,a,b,c,v};
    if(V[2]==="ä"&&V[1]==="a") return {k:"SAL2",P:a+v+b+"a"+gm(c),Pt:"ä",I:a+v+b+"a"+gm(c),J:a+v+b+"a"+c,Imp:a+v+b+"a"+c,G:a+v+b+"a"+c+"ət",VN:"mä"+a+v+b+"a"+c+"ät",Part:a+v+b+"a"+c,a,b,c,v};
  }
  if(n===3&&!G[1]&&!G[2]&&v==="a"&&V[1]==="a"&&V[2]==="ä")
    return {k:"RSAM",P:a+"a"+b+"a"+c,Pt:"C",I:a+"a"+b+"ə"+c,J:a+"a"+b+"a"+c,Imp:a+"a"+b+"a"+c,G:a+"a"+b+"ə"+c,VN:"mä"+a+"a"+b+"a"+c,Part:a+"a"+b+"a"+c};
  if(n===4&&G[2]&&V[3]==="ä"&&V[2]==="ä"){
    const m=V[1]; if(m!=="ä"&&m!=="a") return null;
    const J=m==="ä"?a+v+b+c+"ə"+d:a+v+b+"a"+c+d;
    return {k:m==="ä"?"QUAD1":"QUAD2",P:a+v+b+m+gm(c)+"ä"+d,Pt:"C",I:a+v+b+m+gm(c)+"ə"+d,J,Imp:J,G:J,VN:"mä"+a+v+b+(m==="a"?"a":"")+c+"ä"+d,Part:a+v+b+(m==="a"?"a":"")+c+"a"+d,a,b,c,d,v,m};
  }
  return null;
}
const g1=s=>{const u=units(s);return gm(u[0])+u.slice(1).join("");};   // double the first consonant

/* --- full stem set for a dictionary form --- */
const VSPECIAL={
  "alä":{P:"al",Pt:"C",I:"l",J:"bäl",Imp:"bäl",G:"bəl",VN:"malät",Part:"bay",PartFull:1},
  "ayyä":{P:"ayy",Pt:"ä",I:"ay",J:"y",Imp:"əy",G:"ayt",VN:"mayät",Part:"ayi",PartFull:1},
  "asayyä":{P:"asayy",Pt:"ä",I:"asayy",J:"asay",Imp:"asay",G:"asayyət",VN:"masayät",Part:"asayi",PartFull:1},
  "molla":{P:"molla",Pt:"a",I:"mola",J:"mula",Imp:"mula",G:"molt",VN:"mämulat",Part:"moli",PartFull:1},
  "täkkosä":{P:"täkkos",Pt:"C",I:"täkkus",J:"täkkus",Imp:"täkkus",G:"täkkus",VN:"mätäkkos",Part:"täkkwaš",PartFull:1},
  "täräggomä":{P:"täräggom",Pt:"C",I:"täräggum",J:"tärgum",Imp:"tärgum",G:"tärgum",VN:"mätärgom",Part:"tärgwami",PartFull:1},
  "astämarä":{P:"astämar",Pt:"C",I:"astämr",J:"astämr",Imp:"astämr",G:"astämr",VN:"mastämar",Part:"astämari",PartFull:1}
};
const VFORCE={"assärra":["AS","särra"],"assänadda":["AT","sänadda"]};
const A_B=new Set(["anäkkäsä","anäqqäfä","abäddärä","abäṭṭärä"]);
function withPre(p,c,o){  // put a vowel-type prefix (a / as) in front of a core
  const r={k:p.toUpperCase()+"+"+c.k,Pt:c.Pt};
  r.P=p+c.P; r.I=p+(o.I||c.I); r.J=p+(o.J||c.J); r.Imp=r.J; r.G=p+(o.G||c.G); r.VN="m"+p+(o.VN||c.VN.slice(2)); r.Part=p+(o.Part||c.Part);
  return r;
}
function aStem(c){
  const {a,b,v}=c, cc=c.c;
  switch(c.k){
    case "TRI": return withPre("a",c,{I:c.B||c.aB?a+v+gm(b)+"ə"+cc:a+v+b+cc,J:a+b+"ə"+cc,G:a+b+"ə"+cc,VN:a+b+"ä"+cc,Part:a+b+"a"+cc});
    case "SAMMA": return withPre("a",c,{I:a+v+b+"a",J:a+(v==="ä"?"":v)+b+"a",G:a+(v==="ä"?"":v)+b+"ət",VN:a+(v==="ä"?"":v)+b+"at",Part:a+b});
    case "QARRA": return v==="o"?withPre("a",c,{J:a+"o"+b,G:tj(a+"o"+b),VN:a+"o"+b+"ät"}):withPre("a",c,{I:a+v+b,J:a+"ə"+b,G:a+b+"ət",VN:a+b+"ät",Part:a+b});
    case "SAM": return withPre("a",c,{I:a+"ə"+b,J:a+"ə"+b,G:a+"ə"+b});
    case "QOM": return withPre("a",c,{G:a+"u"+b});
    case "SHAT": return withPre("a",c,{G:a+"ə"+b});
    default: return withPre("a",c,{});
  }
}
function asStem(c){
  const {a,b,v}=c, cc=c.c;
  switch(c.k){
    case "TRI": {const X=a+v+gm(b)+"ə"+cc;return withPre("as",c,{I:X,J:X,G:X,VN:a+v+gm(b)+"ä"+cc,Part:a+v+gm(b)+"a"+cc});}
    case "CTYPE": return withPre("as",c,{J:a+"a"+b+"ə"+cc});
    case "SAMMA": {const X=a+v+gm(b)+"a";return withPre("as",c,{I:X,J:X,G:a+v+gm(b)+"ət",VN:X+"t",Part:a+v+gm(b)});}
    case "QARRA": {const X=a+v+gm(b);return withPre("as",c,{I:X,J:X,G:X+"ət",VN:X+"ät",Part:X});}
    case "SAM": return withPre("as",c,{I:a+"ə"+b,J:a+"ə"+b,G:a+"ə"+b});
    case "QOM": return withPre("as",c,{G:a+"u"+b});
    case "HED": return withPre("as",c,{J:a+(a==="k"||a==="h"?"i":"e")+b});
    default: return withPre("as",c,{});
  }
}
function taStem(c,B,S){
  const {a,b,v}=c, cc=c.c, A=gm(a);
  const r={k:"TÄ+"+c.k,Pt:c.Pt,P:"tä"+c.P};
  switch(c.k){
    case "TRI": r.I=A+"ä"+gm(b)+"ä"+cc; r.J=B?r.I:A+"ä"+b+"ä"+cc; r.Imp="tä"+(B?a+"ä"+gm(b)+"ä"+cc:a+"ä"+b+"ä"+cc); r.G="tä"+(B?a+"ä"+gm(b)+"ə"+cc:a+"ä"+b+cc); r.VN="mä"+A+"ä"+(B?gm(b):b)+"ä"+cc; r.Part="tä"+a+"ä"+b+"a"+cc; break;
    case "CTYPE": r.I=A+"a"+gm(b)+"ä"+cc; r.J=A+"a"+b+"ä"+cc; r.Imp="tä"+a+"a"+b+"ä"+cc; r.G="tä"+a+"a"+b+cc; r.VN="mä"+A+"a"+b+"ä"+cc; r.Part="tä"+c.Part; break;
    case "QUAD1": r.I=A+v+b+"ä"+gm(cc)+"ä"+c.d; r.J=A+v+b+cc+"ä"+c.d; r.Imp="tä"+a+v+b+cc+"ä"+c.d; r.G="tä"+c.G; r.VN="mä"+r.J; r.Part="tä"+c.Part; break;
    case "QUAD2": r.I=A+v+b+"a"+gm(cc)+"ä"+c.d; r.J=A+v+b+"a"+cc+"ä"+c.d; r.Imp="tä"+a+v+b+"a"+cc+"ä"+c.d; r.G="tä"+c.G; r.VN="mä"+r.J; r.Part="tä"+c.Part; break;
    case "SAM": case "QOM": case "HED": case "SHAT": r.I=A+v+b; r.J=r.I; r.Imp="tä"+a+v+b; r.G="tä"+a+(c.k==="QOM"?"u":c.k==="HED"?"e":"")+b; r.VN="mä"+r.I; r.Part="tä"+a+v+b; break;
    case "SAMMA": r.I=A+v+gm(b)+"a"; r.J=B?r.I:A+v+b+"a"; r.Imp="tä"+a+v+(B?gm(b):b)+"a"; r.G=tj("tä"+a+v+b); r.VN="mä"+A+v+b+"at"; r.Part="tä"+a+v+b; break;
    case "QARRA": r.I=A+v+gm(b); r.J=A+v+b; r.Imp="tä"+a+v+b; r.G=tj("tä"+a+v+b); r.VN="mä"+A+v+b+"ät"; r.Part="tä"+a+v+b; break;
    default: r.I=g1(c.I); r.J=g1(c.J); r.Imp="tä"+c.J; r.G="tä"+c.G; r.VN="mä"+g1(c.VN.slice(2)); r.Part="tä"+c.Part;
  }
  return r;
}
function stemsFor(w,type){
  if(VSPECIAL[w]) return Object.assign({k:"special"},VSPECIAL[w]);
  if(VFORCE[w]){const c=core(syls(VFORCE[w][1]),false);if(VFORCE[w][0]==="AS")return asStem(c);const g=Object.assign({},c);for(const k of["P","I","J","Imp","G","Part"])g[k]=g1(c[k]);g.VN="mä"+g1(c.VN.slice(2));return withPre("a",g,{});}
  const S=syls(w), n=S.length, B=type==="B";
  const C=S.map(x=>x.c), V=S.map(x=>x.v), G=S.map(x=>x.g);
  if(C[0]===""&&V[0]==="a"){
    if(n>=3&&C[1]==="s"&&!V[1]&&!G[1]){const c=core(S.slice(2),false);return c&&asStem(c);}
    if(n===4&&C[1]==="s"&&V[1]==="a"&&!G[1]&&G[2]){const b=C[2],c=C[3],X="asa"+gm(b)+"ə"+c;return {k:"AS+ATRI",P:"asa"+gm(b)+"ä"+c,Pt:"C",I:X,J:X,Imp:X,G:X,VN:"masa"+gm(b)+"ä"+c,Part:"asa"+gm(b)+"a"+c};}
    if(n===3&&G[1]&&!G[2]&&V[1]==="ä"&&V[2]==="ä"){const b=C[1],c=C[2];
      if(B){const X="a"+gm(b)+"ə"+c;return {k:"ATRI",P:"a"+gm(b)+"ä"+c,Pt:"C",I:X,J:X,Imp:X,G:X,VN:"ma"+gm(b)+"ä"+c,Part:"a"+gm(b)+"a"+c};}
      return {k:"ATRI",P:"a"+gm(b)+"ä"+c,Pt:"C",I:"a"+b+c,J:b+"ä"+c,Imp:"ə"+b+"ä"+c,G:"a"+b+c,VN:"ma"+b+"ä"+c,Part:"a"+b+"a"+c};}
    if(n===3&&G[1]&&G[2]&&V[1]==="a"&&V[2]==="a"){const a=gm(C[1]),b=C[2];return {k:"AT+bi",P:"a"+a+"a"+gm(b)+"a",Pt:"a",I:"a"+a+"a"+gm(b)+"a",J:"a"+a+"a"+b+"a",Imp:"a"+a+"a"+b+"a",G:tj("a"+a+"a"+b),VN:"ma"+a+"a"+b+"at",Part:"a"+a+"a"+b};}
    const rest=S.slice(1).map(x=>Object.assign({},x));
    if(rest[0].g&&n>=4){rest[0].g=false;const c=core(rest,true)||core(rest,false);if(!c)return null;const g=Object.assign({},c);for(const k of["P","I","J","Imp","G","Part"])g[k]=g1(c[k]);g.VN="mä"+g1(c.VN.slice(2));const r=withPre("a",g,{});r.k="AT+"+c.k;return r;}
    const c=core(rest,B); if(!c)return null; if(A_B.has(w))c.aB=1;
    return aStem(c);
  }
  if(C[0]==="t"&&V[0]==="a"&&n===3&&G[1]&&V[1]==="ä"){const b=C[1],c=C[2];return {k:"TA",P:"ta"+gm(b)+"ä"+c,Pt:"C",I:"tta"+gm(b)+"ä"+c,J:"tta"+b+"ä"+c,Imp:"ta"+b+"ä"+c,G:"ta"+b+c,VN:"mätta"+b+"ä"+c,Part:"ta"+b+"a"+c};}
  if(C[0]==="t"&&V[0]==="ä"&&!G[0]&&n>=3&&!(n===3&&G[1]&&V[1]!=="a")){
    const rest=S.slice(1);
    if(!rest[0].v&&rest.length===3){const a=rest[0].c,b=rest[1].c,c=rest[2].c,X=a+b+"a"+gm(c)+"a";return {k:"TSM",P:"tä"+X,Pt:"a",I:X,J:X,Imp:"tä"+X,G:tj("tä"+a+b+"a"+c),VN:"mä"+a+b+"a"+c+"at",Part:"tä"+a+b+"a"+c};}
    const c=core(rest,false); if(c) return taStem(c,B,S);
  }
  return core(S,B);
}

/* --- person forms --- */
function lastC(s){const u=units(s);let i=u.length-1;const c=u[i];let j=i;if(u[i-1]===c)j=i-1;return {head:u.slice(0,j).join(""),c,g:j!==i};}
function pal(s){const {head,c,g}=lastC(s);return PAL[c]?head+(g?gm(PAL[c]):PAL[c]):null;}
const endV=s=>isV(s[s.length-1]);
const mEnd=s=>s+(endV(s)?"m":"əm");
const cluster=s=>{const u=units(s);return isC(u[0])&&isC(u[1]);};
function fem(st){ // "you (f)" shape of a stem: [short form, form before -alläš]
  if(st.endsWith("a")){const b=st.slice(0,-1),p=pal(b);return p?[p+"i",p]:[b+"i",b+"iy"];}
  if(st.endsWith("y"))return [st+"i",st];
  const p=pal(st);return p?[p,p]:[st+"i",st+"iy"];
}
const plu=st=>st.endsWith("a")?st.slice(0,-1)+"u":st+"u";
function conj(st){
  const {P,Pt,I,J,Imp,G}=st, T={};
  T.past = Pt==="C" ? [P+"|ku",P+"|k",P+"|š",P+"ä",P+"äčč",P+"|n",P+"aččəhu",P+"u"]
         : Pt==="a" ? [P+"hu",P+"h",P+"š",P,P+"čč",P+"n",P+"ččəhu",P.slice(0,-1)+"u"]
                    : [P+"ähu",P+"äh",P+"äš",P+"ä",P+"äčč",P+"än",P+"aččəhu",P+"u"];
  T.pastNeg = T.past.map(f=>mEnd("al|"+f));
  const aI=I[0]==="a", pre=aI?["","t","t","y","t","ənn","t","y"]:["ə","tə","tə","yə","tə","ənnə","tə","yə"];
  const [fS,fL]=fem(I), base=I.endsWith("a")?I.slice(0,-1):I;
  T.short=[pre[0]+I,pre[1]+I,pre[2]+fS,pre[3]+I,pre[4]+I,pre[5]+I,pre[6]+plu(I),pre[7]+plu(I)];
  T.pres=[pre[0]+base+"allähu",pre[1]+base+"alläh",pre[2]+fL+"alläš",pre[3]+base+"al",pre[4]+base+"alläčč",pre[5]+base+"allän",pre[6]+base+"allaččəhu",pre[7]+base+"allu"];
  const np=s=>s[0]==="a"?["al","att","att","ay","att","ann","att","ay"]:cluster(s)?["alə","attə","attə","ayə","attə","annə","attə","ayə"]:["al|","at|","at|","ay|","at|","an|","at|","ay|"];
  const n1=np(I);
  T.presNeg=[n1[0]+I,n1[1]+I,n1[2]+fS,n1[3]+I,n1[4]+I,n1[5]+I,n1[6]+plu(I),n1[7]+plu(I)].map(mEnd);
  const aJ=J[0]==="a", jp=aJ?["l","t","t","y","t","ənn","t","y"]:["lə","tə","tə","yə","tə","ənnə","tə","yə"];
  const im=st.ImpForms||[Imp,fem(Imp)[0],plu(Imp)];
  T.cmd=[jp[0]+J,im[0],im[1],jp[3]+J,jp[4]+J,jp[5]+J,im[2],jp[7]+plu(J)];
  const n2=np(J);
  T.cmdNeg=[n2[0]+J,n2[1]+J,n2[2]+fem(J)[0],n2[3]+J,n2[4]+J,n2[5]+J,n2[6]+plu(J),n2[7]+plu(J)];
  const L=lastC(G), pc=PAL[L.c]||L.c, hu=units(L.head), g1sg=L.head+(hu.length&&isC(hu[hu.length-1])?"ə":"")+gm(pc)+"e";
  T.ger=[g1sg,G+"äh",G+"äš",G+"o",G+"a",G+"än",G+"aččəhu",G+"äw"];
  T.perf=[g1sg+"yallähu",G+"ähal",G+"äšal",G+"wal",G+"alläčč",G+"änal",G+"aččəhwal",G+"äwal"];
  return T;
}
const TENSES=[["past","Past","did"],["pastNeg","Past, negative","did not"],["pres","Present / future","does, is doing, will do"],["presNeg","Present / future, negative","does not, will not"],
  ["short","Short present","used after ስ-, ብ-, እንድ- and with ነበር"],["cmd","Command, “let…”","do! · let him do"],["cmdNeg","Negative command","don't! · let him not"],
  ["ger","Gerundive","having done"],["perf","Has done","has done, is in that state"]];

/* --- the verb list --- */
const VLIST=[]; const VBAD=[];
VRAW.forEach(([am,rom,en,lesson,type])=>{
  const rw=rom.split(" "), aw=am.split(" "), head=rw.pop(), ahead=aw.pop();
  const st=stemsFor(head,type);
  if(!st){VBAD.push(rom);return;}
  if(head==="mäṭṭa")st.ImpForms=["na","näy","nu"];
  VLIST.push({am,rom,en,lesson,type,st,head,ahead,preAm:aw.join(" "),preRom:rw.join(" "),rows:null,T:null});
});
const VFIXED=[
  {am:"ነው",rom:"näw",en:"be (am, is, are)",lesson:2,map:{pres:"be",presNeg:"aydallam"},was:1},
  {am:"አለ",rom:"allä",en:"be present, there is",lesson:6,map:{pres:"alla",presNeg:"yallam"},was:1},
  {am:"ነበረ",rom:"näbbärä",en:"was, there was (past of ነው and አለ)",lesson:9,map:{},was:1}
];
VFIXED.slice().reverse().forEach(f=>VLIST.unshift(Object.assign({type:"A",fixed:1,T:null},f)));
function vforms(v){
  if(v.fixed&&!v.T){
    const out={}, n=conj(stemsFor("näbbärä","A"));
    for(const k in v.map){const t=T[v.map[k]];out[k]=t.am.map((a,i)=>({am:a,rom:t.rom[i]}));}
    if(v.was){out.past=n.past.map(f=>({am:toFidel(f),rom:modern(f)}));out.pastNeg=n.pastNeg.map(f=>({am:toFidel(f),rom:modern(f)}));}
    v.T=out;
  }
  if(!v.T){
    v.rows=rowsOf(v.ahead);
    const T=conj(v.st), out={};
    const mk=f=>({am:(v.preAm?v.preAm+" ":"")+toFidel(f,v.rows),rom:(v.preRom?modern(v.preRom)+" ":"")+modern(f)});
    for(const k in T)out[k]=T[k].map(mk);
    const part=v.st.PartFull?v.st.Part:(pal(v.st.Part)||v.st.Part+"i");
    out.vn=mk(v.st.VN); out.part=mk(part);
    v.T=out;
  }
  return v.T;
}

