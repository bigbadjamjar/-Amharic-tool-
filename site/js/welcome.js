/* ---------- welcome page ----------
   A front page for someone opening the app for the first time (or sent a link by a friend):
   what the app is, who it's for, what's inside, how to start, and an honest note about the content.
   Shown each time the app opens, unless "Don't show this page when the app opens" is ticked on this
   device. Also any time from the app name in the header, the "About this app" links, or the address
   ending #welcome, which is handy for sharing. */
const WL_KEY = "amharic-welcome";        // set once someone has tapped past the welcome page on this device
const WL_SKIP = "amharic-welcome-skip";  // set when they ticked "don't show this page when the app opens"
const wlStore = {get(){ try { return localStorage.getItem(WL_KEY); } catch (e) { return null; } }, set(){ try { localStorage.setItem(WL_KEY, "1"); } catch (e) {} }};
const wlSkip = {get(){ try { return localStorage.getItem(WL_SKIP) === "1"; } catch (e) { return false; } },
  set(on){ try { on ? localStorage.setItem(WL_SKIP, "1") : localStorage.removeItem(WL_SKIP); } catch (e) {} }};
const wlAsked = () => typeof location !== "undefined" && /^#welcome$/i.test(location.hash);

function wlCounts(){
  const units = LESSONS.filter(l => !l.review);
  return {
    units: LESSONS.length,               // every unit in the Course list, reviews included
    reviews: LESSONS.length - units.length,
    words: units.reduce((n, l) => n + l.vocab.length, 0),
    verbs: VLIST.length,
    dialogues: DIALOGUES.length,
    letters: FID.length,
    clips: Object.keys(AUDIO_FILES).length + Object.keys(AUDIO_MALE).length,
  };
}

function renderWelcome(){
  const c = wlCounts(), back = PROF.list().length > 0;
  const feat = (icon, title, text) => `<div class="wlfeat"><span class="wlicon nosay" aria-hidden="true">${icon}</span><div><b>${title}</b><small>${text}</small></div></div>`;
  return `<section class="wlhero">
      <p class="wlname">Amharic App</p>
      <p class="wlhi"><span class="am">ሰላም!</span> <span class="rom">selam</span></p>
      <h2>Learn everyday Amharic, one small step at a time</h2>
      <p class="lead">A free practice app for reading, hearing and speaking Amharic, the main language of Ethiopia. It works on your phone or computer, needs no account, and keeps your progress on your own device.</p>
      ${back && PROF.cur() && typeof goalWelcome === "function" ? goalWelcome(S.goal, S.srs.act, PROF.cur().name) : ""}
      <button class="btn primary wide wlgo" data-act="wl-start">${back ? "Continue learning" : "Start learning"}</button>
      <label class="wlskip"><input type="checkbox" id="wl-skip" ${wlSkip.get() ? "checked" : ""}> Don't show this page when the app opens</label>
      <button class="link wlcol" data-act="scheme-jump">🎨 Change the colours</button>
    </section>

    <h3>Who it's for</h3>
    <div class="note"><p>Complete beginners, and anyone picking Amharic back up: friends and family of Ethiopians, people heading to Ethiopia, or heritage learners who understand some but want to read and speak with more confidence. You don't need to know the alphabet yet; the app teaches it.</p></div>

    <h3>What's inside</h3>
    <div class="wlfeats">
      ${feat("📘", `${c.units} short units`, `Greetings, family, food, getting around and more, with about ${Math.round(c.words / 10) * 10} words. Grammar comes in as each topic needs it${c.reviews ? `, and ${c.reviews} of the units are reviews` : ""}.`)}
      ${feat("<span class=\"am\">ፊ</span>", "The fidel alphabet", `All ${c.letters} letters, each with its sound, plus a typing keyboard to practise writing.`)}
      ${feat("▶", "Real audio", `${c.clips.toLocaleString()} recorded clips. Tap any ▶ to listen, and slow it down with the 1× button at the top.`)}
      ${feat("💬", `${c.dialogues} dialogues`, "A short conversation in each unit, with a woman's and a man's voice. You can take one part yourself.")}
      ${feat("🎧", "Listening and tests", "Hear it and pick the meaning, type what you hear, build sentences, and a 20-question session each day.")}
      ${feat("📋", `${c.verbs} verbs`, "Every verb in every tense, set out in tables, with flashcards.")}
    </div>

    <h3>How to start</h3>
    <ol class="wlsteps">
      <li><b>Type your name.</b> Your scores and mistakes are kept under it. If others share the device, they can add their own name.</li>
      <li><b>Look at the letters.</b> Open <b>Learn</b> at the top, then <b>Fidel</b>, and tap a few letters to hear them. You don't need to learn them all before starting.</li>
      <li><b>Do Unit 1.</b> In <b>Learn</b>, read the notes, listen to the words, try the dialogue, then take the unit test.</li>
      <li><b>Come back most days.</b> Today's session on the Learn page mixes in what you've learned and anything you got wrong.</li>
    </ol>
    <div class="tip">Not reading fidel yet? The <b>Transcription</b> switch at the top shows every word in English letters too, like <span class="rom">selam</span>. Turn it off when you're ready.</div>

    <h3>Put it on your phone</h3>
    <div class="note">${typeof offInstallSteps === "function" ? offInstallSteps() : "<p>Open this page on your phone and add it to your home screen.</p>"}</div>

    ${typeof renderSchemes === "function" ? renderSchemes(S.scheme) : ""}

    <h3>Good to know</h3>
    <div class="note wlhonest">
      <p><b>Written for this app.</b> The lessons, sentences and dialogues are original, not copied from a textbook.</p>
      <p><b>Not yet checked by a native speaker.</b> Treat it as practice, and if something sounds odd, ask an Amharic speaker. Corrections are very welcome.</p>
      <p><b>Computer voices.</b> The audio is made by text-to-speech, so it is clear but not always perfectly natural.</p>
      <p><b>Private.</b> Nothing is sent anywhere. Use Profiles to back up your progress or move it to another device.</p>
    </div>

    <button class="btn primary wide wlgo" data-act="wl-start" style="margin-top:22px">${back ? "Continue learning" : "Start learning"}</button>
    <p class="count wllink">You can open this page again by tapping the app name at the top.</p>`;
}

/* Where "Start learning" goes: a name first if there's nobody yet, otherwise the course. */
function wlStart(){
  wlStore.set();
  if (wlAsked()) history.replaceState(null, "", location.pathname + location.search);
  const n = PROF.list().length;
  return n === 0 || n > 1 ? "who" : "course";
}
const wlFirst = () => wlAsked() || !wlSkip.get();
// shown centred at the bottom of every page except the welcome page itself
const wlLink = () => `<footer class="wlfoot"><button class="link" data-act="mode" data-v="welcome">About this app</button>${typeof repOpen==="function"?`<span aria-hidden="true">·</span><button class="link" data-rep="open">Report a problem</button>`:""}</footer>`;
