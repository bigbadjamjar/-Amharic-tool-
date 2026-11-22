/* longest profile name allowed (it has to fit the button in the header) */
const NAME_MAX=10;
/* Profiles: each person on this device gets their own saved progress and settings,
   and a profile can be saved as a backup (file or code) and loaded on another device.
   Everything stays in this browser's localStorage; nothing is sent anywhere.

   Storage layout
     amharic-profiles      {list:[{id,name}], cur:id}
     amharic-p:<id>        that profile's data: {best, rom, miss, upto, day, kbhints, builder}
   Before profiles existed the app kept one person's data in separate amharic-* keys.
   The first time this runs it moves that into a profile called "Me" (the old keys are left as they were). */

const OLD_KEYS = ["amharic-best","amharic-rom","amharic-miss","amharic-upto","amharic-day","amharic-kbhints","amharic-builder"];
const BACKUP_APP = "amharic-practice";

function memoryStore(){ const m={}; return {getItem:k=>k in m?m[k]:null, setItem:(k,v)=>{m[k]=String(v);}, removeItem:k=>{delete m[k];}}; }
function safeStore(){
  try{ const s=globalThis.localStorage; const t="amharic-test"; s.setItem(t,"1"); s.removeItem(t); return s; }
  catch(e){ return memoryStore(); }   // private browsing etc.: still works, just isn't kept
}

function makeProfiles(st){
  const PKEY="amharic-profiles", DKEY="amharic-p:";
  const get=(k,d)=>{ try{ const v=st.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } };
  const put=(k,v)=>{ try{ st.setItem(k,JSON.stringify(v)); }catch(e){} };
  const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  // names are kept short so they always fit the profile button in the header
  const clean=n=>String(n||"").replace(/\s+/g," ").trim().slice(0,NAME_MAX).trim();

  let idx=get(PKEY,null);
  if(!idx||!Array.isArray(idx.list)){
    idx={list:[],cur:null};
    // move the old single-person progress into a first profile
    if(OLD_KEYS.some(k=>st.getItem(k)!=null)){
      const raw=k=>st.getItem(k), js=(k,d)=>{try{const v=raw(k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
      const d={best:js("amharic-best",{}), rom:raw("amharic-rom")!=="0", miss:js("amharic-miss",[]),
        upto:+raw("amharic-upto")||null, day:raw("amharic-day")||"", kbhints:raw("amharic-kbhints")!=="0", builder:js("amharic-builder",null)};
      const id=newId(); idx.list.push({id,name:"Me"}); idx.cur=id; put(DKEY+id,d);
    }
    put(PKEY,idx);
  }
  idx.list=idx.list.filter(p=>p&&p.id);
  if(!idx.list.some(p=>p.id===idx.cur)) idx.cur=idx.list.length?idx.list[0].id:null;
  const saveIdx=()=>put(PKEY,idx);
  const uniq=(name,except)=>{ let n=clean(name)||"Learner", b=n, i=2; while(idx.list.some(p=>p.id!==except&&p.name.toLowerCase()===n.toLowerCase())) { const t=" ("+(i++)+")"; n=b.slice(0,NAME_MAX-t.length).trim()+t; } return n; };

  return {
    list:()=>idx.list.slice(),
    cur:()=>idx.list.find(p=>p.id===idx.cur)||null,
    byName:n=>idx.list.find(p=>clean(p.name).toLowerCase()===clean(n).toLowerCase())||null,
    use(id){ if(idx.list.some(p=>p.id===id)){ idx.cur=id; saveIdx(); } },
    add(name,data){ const id=newId(); idx.list.push({id,name:uniq(name)}); idx.cur=id; put(DKEY+id,data||{}); saveIdx(); return id; },
    rename(id,name){ const p=idx.list.find(x=>x.id===id); if(p&&clean(name)){ p.name=uniq(name,id); saveIdx(); } },
    remove(id){ idx.list=idx.list.filter(p=>p.id!==id); try{st.removeItem(DKEY+id);}catch(e){} if(idx.cur===id) idx.cur=idx.list.length?idx.list[0].id:null; saveIdx(); },
    load:id=>get(DKEY+(id||idx.cur),{}),
    save(data,id){ id=id||idx.cur; if(id) put(DKEY+id,data); },
    backup(id){ id=id||idx.cur; const p=idx.list.find(x=>x.id===id); return {app:BACKUP_APP,v:1,name:p?p.name:"Learner",saved:new Date().toISOString(),data:get(DKEY+id,{})}; }
  };
}

/* ---- backup codes: the backup as JSON, squeezed (where the browser can) and turned into copyable text ---- */
const b64=bytes=>{ let s=""; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000)); return btoa(s); };
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function squeeze(bytes,how){
  const cs=how==="in"?new CompressionStream("deflate-raw"):new DecompressionStream("deflate-raw");
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(cs)).arrayBuffer());
}
async function backupToCode(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));
  if(typeof CompressionStream==="function"){ try{ return "AMZ1."+b64(await squeeze(bytes,"in")); }catch(e){} }
  return "AM1."+b64(bytes);
}
/* Accepts a code, or the text of a backup file. Returns the backup object, or throws an Error with a plain message. */
async function readBackup(text){
  text=String(text||"").trim();
  if(!text) throw new Error("Paste a backup code or choose a backup file first.");
  let obj;
  try{
    if(text[0]==="{") obj=JSON.parse(text);
    else{
      const m=text.replace(/\s+/g,"").match(/^(AMZ?1)\.([A-Za-z0-9+/=]+)$/);
      if(!m) throw 0;
      let bytes=unb64(m[2]);
      if(m[1]==="AMZ1"){
        if(typeof DecompressionStream!=="function") throw new Error("This browser is too old to read that code. Try the backup file instead, or a newer browser.");
        bytes=await squeeze(bytes,"out");
      }
      obj=JSON.parse(new TextDecoder().decode(bytes));
    }
  }catch(e){ if(e instanceof Error&&/browser/.test(e.message)) throw e; throw new Error("That doesn't look like a backup from this app. Check you copied the whole code."); }
  if(!obj||obj.app!==BACKUP_APP||typeof obj.data!=="object"||!obj.data) throw new Error("That doesn't look like a backup from this app.");
  return obj;
}
