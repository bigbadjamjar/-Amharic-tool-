/* ---------- fidel ---------- */
// [first-order letter, sound, group]: group "h" = first order sounds like the fourth (ha); "v" = vowel carrier
const FR = [["ሀ","h","h"],["ለ","l"],["ሐ","h","h"],["መ","m"],["ሠ","s"],["ረ","r"],["ሰ","s"],["ሸ","sh"],["ቀ","q"],["በ","b"],["ቨ","v"],["ተ","t"],["ቸ","ch"],["ኀ","h","h"],["ነ","n"],["ኘ","gn"],["አ","","v"],["ከ","k"],["ኸ","h"],["ወ","w"],["ዐ","","v"],["ዘ","z"],["ዠ","zh"],["የ","y"],["ደ","d"],["ጀ","j"],["ገ","g"],["ጠ","t'"],["ጨ","ch'"],["ጰ","p'"],["ጸ","ts'"],["ፀ","ts'"],["ፈ","f"],["ፐ","p"]];
const VOW = ["e","u","i","a","é","(i)","o"];
const HASWA = "ለመሠረሰሸበቨተቸነኘዘዠደጀጠጨጰጸፈ";
const LV = {"ቀ":0x1248,"ኀ":0x1288,"ከ":0x12B0,"ገ":0x1310};
const LVO = [[0,"we"],[2,"wi"],[3,"wa"],[4,"wé"],[5,"w(i)"]];

// every letter, built from the rows above (the verb engine and the app both use these)
const FID = [];            // every letter: {ch, snd, row, ord, key}
const CAN = {};            // letter -> sound key, so twin letters count as the same answer
FR.forEach((r,ri)=>{
  const base=r[0].charCodeAt(0), ck=r[2]==="v"?"ʔ":r[1];
  r.forms=[];
  for(let o=0;o<7;o++){
    const ch=String.fromCharCode(base+o);
    const v=(r[2]&&o===0)?"a":VOW[o];
    const key=ck+((r[2]&&o===0)?3:o);
    const f={ch,snd:r[1]+v,row:ri,ord:o,key}; r.forms.push(f); FID.push(f); CAN[ch]=key;
  }
  r.extra=[];
  if(HASWA.includes(r[0])){const ch=String.fromCharCode(base+7),f={ch,snd:r[1]+"wa",row:ri,ord:7,key:ck+"wa"};r.extra.push(f);FID.push(f);CAN[ch]=f.key;}
  if(LV[r[0]]) LVO.forEach(([off,v])=>{const ch=String.fromCharCode(LV[r[0]]+off),f={ch,snd:r[1]+v,row:ri,ord:8,key:ck+v};r.extra.push(f);FID.push(f);CAN[ch]=f.key;});
});
