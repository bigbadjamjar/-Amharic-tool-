# Amharic App

A phone-friendly app for learning Amharic: a course, the Fidel chart with typing practice, a numbers trainer,
conjugation tables for every verb, and tests. It is a plain web page with no build step.

Live site: https://amharicapp.com/ (the old address https://bigbadjamjar.github.io/-Amharic-tool-/ redirects there)

## Running it

Open `site/index.html` in a browser. That's it — it works straight from disk, offline too (fonts aside).

## What's where

```
site/
  index.html          page shell; loads the scripts below in order
  css/style.css
  js/data/            all the content — edit these to change what the app teaches
    course.js         the units (notes, vocabulary) and LEVELS, the Beginner / Intermediate / Advanced split
    sentences.js      practice sentences
    dialogues.js      one short conversation per unit (two speakers, a woman and a man)
    tables.js         conjugation and grammar tables shown in lessons
    verbs.js          the verb list fed to the conjugation engine
    vocab.js          extra vocabulary by theme
    fidel.js          the Fidel rows
    everyday.js       words for the Everyday drills: telling the time, prices, dates, the Ethiopian calendar
    gloss.js          word by word: the English meaning of each word of every sentence, in Amharic order
  js/engine.js        the verb engine: works out every tense from a verb's dictionary form
  js/audio.js         plays saved clips
  js/dialogue.js      the Dialogue tab: read, play it all, or take one part
  js/drills.js        Test tab > Everyday Amharic: time, money and dates, with the Ethiopian clock and calendar
  js/games.js         Test tab > Games: matching pairs, speed round, fidel bingo
  js/gloss.js         the "Word by word" switch: shows each word's meaning under a sentence
  js/app.js           the screens and quizzes
  audio/clips/        saved sound files
  audio/manifest.js   list of clips (generated)
tools/                audio scripts, native-speaker check list
docs/native-check.md  sentences for a native speaker to check
tests/run.mjs         checks the data and the verb engine:  node tests/run.mjs
```

## Phone app and offline use

The site can be added to a phone's home screen and then works with no signal. `site/sw.js` (a service worker) keeps a
copy of the app and of every clip that has been played; `site/js/offline.js` shows install steps for iPhone and
Android at the bottom of the Profiles page, with a **Save all clips** button that downloads every clip in one go.
New scripts added to `index.html` are picked up automatically. Icons are in `site/icons/`, settings in
`site/manifest.webmanifest`.

## Audio

Any Amharic word or sentence that has a saved clip gets a ▶ button next to it.

**Adding a clip by hand** (for example one made on ttsfree.com): name the file exactly after the Amharic it says,
leaving out punctuation — `ሰላም.mp3`, `እንደምን ነህ.mp3` — and put it in `site/audio/clips/`. You can do this through the
GitHub website (Add file → Upload files). The deploy workflow rebuilds the clip list, so nothing else needs editing.
To see it locally before pushing, run `python3 tools/audio_manifest.py`.

**Making clips automatically on GitHub** (nothing to install): open the repo's **Actions** tab, pick
**Make audio clips** on the left, press **Run workflow**, choose which words, and press the green
**Run workflow** button. It takes from a few minutes to about an hour, saves the new clips into `site/audio/clips/` and
republishes the site. Run it again any time new words are added; it only makes clips that are missing.

**Dialogues** use two voices: lines spoken by a woman use the normal clips, and lines spoken by a man use clips in
`site/audio/clips/m/` (same naming), made with the male voice. There is no voice to pick: every run of
**Make audio clips** uses the female voice (Mekdes) for the normal clips and the male voice (Ameha) for the men's lines,
and “course words and sentences” or “everything” includes the dialogues. A man's line with no male clip falls back to the normal clip if there is one.

**Making clips in bulk on your own computer** with the same free Microsoft Amharic voices:

```bash
pip install edge-tts
python3 tools/make_audio.py --list          # see what's missing (number words and verb words come from tools/code_phrases.mjs, which needs Node.js)
python3 tools/make_audio.py --course-only   # just the course words and sentences
python3 tools/make_audio.py --fidel         # just the letters of the Fidel chart
python3 tools/make_audio.py                 # make them all (Mekdes, and Ameha for the men's dialogue lines)
python3 tools/make_audio.py --male-copies   # also a male-voice copy of everything in clips/m/ (for a voice switch later)
python3 tools/make_audio.py --only "ቡና" "ሻይ"
```

Clips it makes are recorded in `site/audio/generated.json` with the exact text spoken; if that text changes in the app
(a comma added, a word fixed), the next run remakes them. Clips you add yourself are never listed there, so they are never replaced.

**Punctuation matters for the sound.** End statements with `።`, use `፣` for a comma and `፤` for a semicolon. The script
turns these into the Latin marks the voice pauses on.
Without a clip, the app falls back to the browser's own Amharic voice where one exists (rare).

## Content status

The course is original: 17 topic-based units (greetings, family, food, getting around, health, plans, telling a story,
object endings, when/if/because, describing people, derived verbs) plus a review after every four. Everything in it was written for this app, but **none of the Amharic has been checked by a native
speaker yet**. `docs/native-check.md` lists every practice sentence, with the doubtful ones first, ready to hand to
a reviewer (regenerate it with `node tools/native-check.mjs`).

The conjugation tables and the verb list are standard grammar; the verb engine works out every form by rule.

## Copyright

© 2026 Rob. All rights reserved. See [LICENSE](LICENSE).
