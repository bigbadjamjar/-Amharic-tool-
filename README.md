# Amharic Practice

A phone-friendly app for learning Amharic: a course, the Fidel chart with typing practice, a numbers trainer,
conjugation tables for every verb, and tests. It is a plain web page with no build step.

Live site (after the deploy workflow runs on `main`): https://bigbadjamjar.github.io/-Amharic-tool-/

## Running it

Open `site/index.html` in a browser. That's it — it works straight from disk, offline too (fonts aside).

## What's where

```
site/
  index.html          page shell; loads the scripts below in order
  css/style.css
  js/data/            all the content — edit these to change what the app teaches
    course.js         the units (notes, vocabulary)
    sentences.js      practice sentences
    tables.js         conjugation and grammar tables shown in lessons
    verbs.js          the verb list fed to the conjugation engine
    vocab.js          extra vocabulary by theme
    fidel.js          the Fidel rows
  js/engine.js        the verb engine: works out every tense from a verb's dictionary form
  js/audio.js         plays saved clips
  js/app.js           the screens and quizzes
  audio/clips/        saved sound files
  audio/manifest.js   list of clips (generated)
tools/                audio scripts, native-speaker check list
docs/native-check.md  sentences for a native speaker to check
tests/run.mjs         checks the data and the verb engine:  node tests/run.mjs
```

## Audio

Any Amharic word or sentence that has a saved clip gets a ▶ button next to it.

**Adding a clip by hand** (for example one made on ttsfree.com): name the file exactly after the Amharic it says,
leaving out punctuation — `ሰላም.mp3`, `እንደምን ነህ.mp3` — and put it in `site/audio/clips/`. You can do this through the
GitHub website (Add file → Upload files). The deploy workflow rebuilds the clip list, so nothing else needs editing.
To see it locally before pushing, run `python3 tools/audio_manifest.py`.

**Making clips automatically on GitHub** (nothing to install): open the repo's **Actions** tab, pick
**Make audio clips** on the left, press **Run workflow**, choose which words and which voice, and press the green
**Run workflow** button. It takes from a few minutes to about an hour, saves the new clips into `site/audio/clips/` and
republishes the site. Run it again any time new words are added; it only makes clips that are missing.

**Making clips in bulk on your own computer** with the same free Microsoft Amharic voices:

```bash
pip install edge-tts
python3 tools/make_audio.py --list          # see what's missing
python3 tools/make_audio.py --course-only   # just the course words and sentences
python3 tools/make_audio.py                 # make them all (female voice, Mekdes)
python3 tools/make_audio.py --voice male    # Ameha instead
python3 tools/make_audio.py --only "ቡና" "ሻይ"
```

It never overwrites an existing clip unless you pass `--redo`, so hand-made clips are safe.
Without a clip, the app falls back to the browser's own Amharic voice where one exists (rare).

## Content status

The course is original: 12 topic-based units (greetings, family, food, getting around, health, plans) plus a review
after every four. Everything in it was written for this app, but **none of the Amharic has been checked by a native
speaker yet**. `docs/native-check.md` lists every practice sentence, with the doubtful ones first, ready to hand to
a reviewer (regenerate it with `node tools/native-check.mjs`). Units 16–21 are planned and listed in the app.

The conjugation tables and the verb list are standard grammar; the verb engine works out every form by rule.
