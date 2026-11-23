/* ---------- audio ----------
   Saved clips live in audio/clips/. Each file is named after the Amharic it says, e.g. "ሰላም.mp3"
   or "እንደምን ነህ.mp3" (punctuation left out). audio/manifest.js lists them; it is rebuilt by
   tools/audio_manifest.py, which the deploy workflow runs, so dropping a file in is enough.
   If there is no clip, the browser's own Amharic voice is used when it has one (most don't). */
const AUDIO_FILES = (typeof window!=="undefined" && window.AUDIO_FILES) || {};
// Male-voice clips (audio/clips/m/) for the men in dialogues. Anything without one uses the main clip.
const AUDIO_MALE = (typeof window!=="undefined" && window.AUDIO_MALE) || {};
// Must match normalize() in tools/audio_common.py.
const SAY_STRIP = /[?!.,;:"'“”‘’()\[\]\/\\*<>|…።፣፤፡፥፦፧፨]/g;
const sayKey = s => String(s).normalize("NFC").replace(SAY_STRIP," ").replace(/\s+/g," ").trim();
let amVoice = null;
function findVoice(){
  if(typeof speechSynthesis==="undefined") return;
  amVoice = speechSynthesis.getVoices().find(v=>/^am(-|_|$)/i.test(v.lang)) || null;
}
if(typeof speechSynthesis!=="undefined"){ findVoice(); speechSynthesis.addEventListener?.("voiceschanged",()=>{findVoice(); if(typeof render==="function") render();}); }
// Either voice will do when the preferred one has no clip: a man's dialogue line only has a male clip,
// and it should still play (with a button) in search results, flash cards and tests.
const clipFor = (am, voice) => { const k = sayKey(am); return voice==="m" ? (AUDIO_MALE[k] || AUDIO_FILES[k]) : (AUDIO_FILES[k] || AUDIO_MALE[k]); };
// "clips/ሀ.mp3?3f9a1c" -> "audio/clips/%E1%88%80.mp3?v=3f9a1c". The ?v= part changes when a clip is replaced,
// so a saved old copy (see sw.js) is never played instead of the new one.
const clipURL = c => { const [p, v] = String(c).split("?"); return "audio/" + p.split("/").map(encodeURIComponent).join("/") + (v ? "?v=" + v : ""); };
const canSay = am => !!(clipFor(am) || amVoice);
let nowPlaying = null;
// Playback speed, set from the header (1, 0.75 or 0.5). Saved clips keep their pitch when slowed.
let sayRate = 1;
const SAY_RATES = [1, .75, .5];
// voice: "m" to prefer the male clip. done: called once when it has finished (or straight away if nothing can play).
function playAm(am, rate, voice, done){
  rate = rate || sayRate;
  const clip = clipFor(am, voice);
  if(nowPlaying){ const p=nowPlaying; nowPlaying=null; p.onended=p.onerror=null; p.pause(); }
  if(typeof speechSynthesis!=="undefined") speechSynthesis.cancel();
  let fin = done ? ()=>{ const f=fin; fin=null; if(f) done(); } : null;
  if(clip){
    const a = nowPlaying = new Audio(clipURL(clip));
    a.preservesPitch = a.mozPreservesPitch = a.webkitPreservesPitch = true;
    a.defaultPlaybackRate = a.playbackRate = rate;
    if(fin){ a.onended = ()=>fin&&fin(); a.onerror = ()=>fin&&fin(); }
    a.play().catch(()=>speakAm(am, rate, fin));
    return;
  }
  speakAm(am, rate, fin);
}
// Stop whatever is playing without calling its done().
function stopAm(){ if(nowPlaying){ const p=nowPlaying; nowPlaying=null; p.onended=p.onerror=null; p.pause(); } if(typeof speechSynthesis!=="undefined") speechSynthesis.cancel(); }
function speakAm(am, rate, done){
  if(!amVoice){ if(done) setTimeout(done, 0); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(am); u.voice = amVoice; u.lang = amVoice.lang; u.rate = .85*(rate||sayRate);
  if(done){ u.onend = done; u.onerror = done; }
  speechSynthesis.speak(u);
}
const sayBtn = (am, cls="") => canSay(am) ? `<button class="say ${cls}" data-act="say" data-v="${esc(am)}" aria-label="Listen" title="Listen">▶</button>` : "";
// After each render: put a play button after every Amharic word that has a clip,
// except inside other buttons (quiz answers, flash cards, the fidel chart) where a tap already means something.
function addSayButtons(root){
  root.querySelectorAll(".am").forEach(el=>{
    if(el.closest("button,.say,.nosay")) return;
    const am = el.textContent;
    const nx = el.nextElementSibling;
    if(!canSay(am) || el.querySelector(".say") || (nx && (nx.classList.contains("say") || nx.classList.contains("sbtns")))) return;
    // a word on a line of its own gets the button beside it, not on the next line
    // inside a list marked .canrec, a 🎙 record-yourself button follows (recorder.js)
    const mic = el.closest(".canrec") && typeof micBtn==="function" ? micBtn(am) : "";
    el.insertAdjacentHTML(getComputedStyle(el).display==="block" ? "beforeend" : "afterend", mic ? `<span class="sbtns">${sayBtn(am)}${mic}</span>` : sayBtn(am));
  });
}
