/* ---------- audio ----------
   Saved clips live in audio/clips/. Each file is named after the Amharic it says, e.g. "ሰላም.mp3"
   or "እንደምን ነህ.mp3" (punctuation left out). audio/manifest.js lists them; it is rebuilt by
   tools/audio_manifest.py, which the deploy workflow runs, so dropping a file in is enough.
   If there is no clip, the browser's own Amharic voice is used when it has one (most don't). */
const AUDIO_FILES = (typeof window!=="undefined" && window.AUDIO_FILES) || {};
// Must match normalize() in tools/audio_common.py.
const SAY_STRIP = /[?!.,;:"'“”‘’()\[\]\/\\*<>|…።፣፤፡፥፦፧፨]/g;
const sayKey = s => String(s).normalize("NFC").replace(SAY_STRIP," ").replace(/\s+/g," ").trim();
let amVoice = null;
function findVoice(){
  if(typeof speechSynthesis==="undefined") return;
  amVoice = speechSynthesis.getVoices().find(v=>/^am(-|_|$)/i.test(v.lang)) || null;
}
if(typeof speechSynthesis!=="undefined"){ findVoice(); speechSynthesis.addEventListener?.("voiceschanged",()=>{findVoice(); if(typeof render==="function") render();}); }
const clipFor = am => AUDIO_FILES[sayKey(am)];
const canSay = am => !!(clipFor(am) || amVoice);
let nowPlaying = null;
// Playback speed, set from the header (1, 0.75 or 0.5). Saved clips keep their pitch when slowed.
let sayRate = 1;
const SAY_RATES = [1, .75, .5];
function playAm(am, rate){
  rate = rate || sayRate;
  const clip = clipFor(am);
  if(nowPlaying){ nowPlaying.pause(); nowPlaying=null; }
  if(clip){
    nowPlaying = new Audio("audio/"+clip.split("/").map(encodeURIComponent).join("/"));
    nowPlaying.preservesPitch = nowPlaying.mozPreservesPitch = nowPlaying.webkitPreservesPitch = true;
    nowPlaying.defaultPlaybackRate = nowPlaying.playbackRate = rate;
    nowPlaying.play().catch(()=>speakAm(am, rate));
    return;
  }
  speakAm(am, rate);
}
function speakAm(am, rate){
  if(!amVoice) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(am); u.voice = amVoice; u.lang = amVoice.lang; u.rate = .85*(rate||sayRate);
  speechSynthesis.speak(u);
}
const sayBtn = (am, cls="") => canSay(am) ? `<button class="say ${cls}" data-act="say" data-v="${esc(am)}" aria-label="Listen" title="Listen">▶</button>` : "";
// After each render: put a play button after every Amharic word that has a clip,
// except inside other buttons (quiz answers, flash cards, the fidel chart) where a tap already means something.
function addSayButtons(root){
  root.querySelectorAll(".am").forEach(el=>{
    if(el.closest("button,.say,.nosay")) return;
    const am = el.textContent;
    if(!canSay(am) || el.querySelector(".say") || (el.nextElementSibling && el.nextElementSibling.classList.contains("say"))) return;
    // a word on a line of its own gets the button beside it, not on the next line
    el.insertAdjacentHTML(getComputedStyle(el).display==="block" ? "beforeend" : "afterend", sayBtn(am));
  });
}
