#!/usr/bin/env python3
"""Make audio clips for the Amharic in the app with a free Microsoft neural voice (edge-tts).

    pip install edge-tts
    python3 tools/make_audio.py                 # every word and sentence that has no clip yet
    python3 tools/make_audio.py --male-copies   # also a male-voice copy of everything, in clips/m/
    python3 tools/make_audio.py --list          # only show what would be made
    python3 tools/make_audio.py --course-only   # just the course words and sentences
    python3 tools/make_audio.py --fidel         # just the letters of the Fidel chart
    python3 tools/make_audio.py --only "ሰላም" "ቡና"
    python3 tools/make_audio.py --from words.txt   # one phrase per line

Clips are saved to site/audio/clips/<the Amharic>.mp3 and the manifest is rebuilt.
Both Amharic voices are used in every run, so there is nothing to choose:
  - clips/      the female voice (Mekdes): all words, sentences, letters, and the women's dialogue lines
  - clips/m/    the male voice (Ameha): the men's dialogue lines (site/js/data/dialogues.js)
With --male-copies, every phrase also gets a male-voice copy in clips/m/ (for a voice switch later).
Clips this script made are listed in site/audio/generated.json with the exact text spoken.
If that text changes in the app (say, a comma is added), the clip is remade. Clips you made
yourself (for example on ttsfree.com) are not in that list and are never replaced, unless you
pass --redo-all. Just name them the same way and drop them in.
Needs an internet connection. edge-tts uses Microsoft Edge's online read-aloud service,
which is free but unofficial and could change.
"""
import argparse
import asyncio
import json
import re
import sys
import time
from audio_common import AUDIO, CLIPS, ETHIOPIC, MALE_DIR, SITE, existing_clips, normalize
from audio_manifest import write_manifest

VOICES = {"female": "am-ET-MekdesNeural", "male": "am-ET-AmehaNeural"}
STRING = re.compile(r'"((?:[^"\\]|\\.)*)"')


# Course words and sentences first, so a partial run still covers what matters most.
ORDER = ["course.js", "sentences.js", "stories.js", "culture.js", "everyday.js", "tables.js", "vocab.js", "verbs.js"]
# The "course words and sentences" run: the course itself, plus the reading stories, culture notes and everyday drills.
COURSE_FILES = ("course.js", "sentences.js", "stories.js", "culture.js", "everyday.js")   # everyday: the time, price and date drills
LATIN = re.compile(r"[A-Za-z]")


def phrases_from_data(course_only: bool = False) -> list:
    """Every quoted string in the data files that is Amharic only (no Latin letters)."""
    files = sorted((SITE / "js" / "data").glob("*.js"), key=lambda f: (ORDER.index(f.name) if f.name in ORDER else 99, f.name))
    files = [f for f in files if f.name not in ("fidel.js", "dialogues.js")]  # letters; dialogues are read below
    if course_only:
        files = [f for f in files if f.name in COURSE_FILES]
    found = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        for m in STRING.finditer(text):
            s = m.group(1)
            if s and ETHIOPIC.match(s) and not LATIN.search(s):
                found.append(s)
        found += note_examples(text)
    # the everyday drill pages (site/js/drills.js) write their examples the same way
    found += note_examples((SITE / "js" / "drills.js").read_text(encoding="utf-8"))
    return [s for s in found if "✗" not in s]


def note_examples(text: str) -> list:
    """Notes write examples as {fidel|transcription}. The fidel part may not contain braces or quotes,
    so an opening { of a data object is never mistaken for the start of an example."""
    out = []
    for m in re.finditer(r'\{([^|{}"]+)\|', text):
        a = re.sub(r"[?።፣]", "", m.group(1)).strip()
        if re.search(r"[-…_.]", a):   # word parts (ለ-, -ኝ) and frames with a gap (ስሜ … ነው) are not said on their own
            continue
        if a and ETHIOPIC.match(a) and not LATIN.search(a):
            out.append(a)
    return out


def dialogue_lines() -> list:
    """(Amharic, "f" or "m") for every line in dialogues.js, by the speaker's gender."""
    text = (SITE / "js" / "data" / "dialogues.js").read_text(encoding="utf-8")
    data = json.loads(text[text.index("= [") + 2: text.rindex("]") + 1])
    return [(line[1], d["who"][line[0]]["g"]) for d in data for line in d["lines"]]


# The voice pauses reliably on Latin punctuation, so Ethiopic marks are swapped for their
# Latin equivalents in what is sent to it (the app keeps showing the Ethiopic ones).
TTS_PUNCT = {"።": ".", "፣": ",", "፤": ";", "፥": ":", "፦": ":", "፧": "?", "፨": ".", "፡": " "}
PUNCT_COUNT = re.compile(r"[።፣፤፥፦፧?!.,;:]")
GENERATED = AUDIO / "generated.json"


# A few rare Fidel letters make the voice return an empty clip. On their own they are sent
# as a common spelling of the same sound instead (the clip keeps the letter's own name).
TTS_LETTER = {
    "ቈ": "ቅወ", "ቊ": "ቅዊ", "ቌ": "ቅዌ", "ቍ": "ቅው",
    "ኈ": "ህወ", "ኊ": "ህዊ", "ኌ": "ህዌ", "ኍ": "ህው",
    "ኰ": "ክወ", "ኲ": "ክዊ", "ኴ": "ክዌ", "ኵ": "ክው",
    "ጐ": "ግወ", "ጒ": "ግዊ", "ጔ": "ግዌ", "ጕ": "ግው",
    "ሢ": "ሲ", "ኆ": "ሆ",
}


def to_tts(text: str) -> str:
    """The exact text sent to the voice."""
    lone = len(text) == 1
    t = "".join(TTS_PUNCT.get(c, c) for c in TTS_LETTER.get(text, text))
    if lone:
        t += "."   # a lone syllable, said on its own rather than run into silence
    t = re.sub(r"\s*([.,;:?!])\s*", r"\1 ", t)   # no space before a mark, one after
    return re.sub(r"\s+", " ", t).strip()


def load_generated() -> dict:
    try:
        return json.loads(GENERATED.read_text(encoding="utf-8")).get("clips", {})
    except FileNotFoundError:
        return {}


def save_generated(clips: dict) -> None:
    GENERATED.write_text(json.dumps({
        "_about": "Clips made automatically by tools/make_audio.py: file key -> the exact text sent to the voice. "
                  "When the text in the app changes, these are remade. Clips not listed here (e.g. ones you add "
                  "yourself) are never replaced.",
        "clips": dict(sorted(clips.items())),
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def fidel_letters() -> list:
    """Every letter in the Fidel chart, built the same way site/js/data/fidel.js builds it."""
    text = (SITE / "js" / "data" / "fidel.js").read_text(encoding="utf-8")
    rows = re.findall(r'\["(.)","', re.search(r"const FR = (\[.*?\]);", text).group(1))
    haswa = re.search(r'const HASWA = "([^"]*)"', text).group(1)
    lv = {k: int(v, 16) for k, v in re.findall(r'"(.)":0x([0-9A-Fa-f]+)', re.search(r"const LV = \{(.*?)\}", text).group(1))}
    out = []
    for r in rows:
        base = ord(r)
        out += [chr(base + o) for o in range(7)]
        if r in haswa:
            out.append(chr(base + 7))
        if r in lv:
            out += [chr(lv[r] + off) for off in (0, 2, 3, 4, 5)]
    return out


async def make(text: str, voice: str, rate: str, male: bool = False) -> None:
    import edge_tts  # imported here so --list works without it

    out = (CLIPS / MALE_DIR if male else CLIPS) / f"{normalize(text)}.mp3"
    tmp = out.with_suffix(".part")
    try:
        await edge_tts.Communicate(to_tts(text), voice, rate=rate).save(str(tmp))
        if tmp.stat().st_size == 0:
            raise RuntimeError("empty clip")
        tmp.replace(out)
    finally:
        tmp.unlink(missing_ok=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--male-copies", action="store_true", help="also make a male-voice copy of every phrase in clips/m/")
    ap.add_argument("--rate", default="-10%", help="speaking speed, e.g. -20%% for slower (default -10%%)")
    ap.add_argument("--only", nargs="+", help="make just these phrases")
    ap.add_argument("--from", dest="src", help="text file with one phrase per line")
    ap.add_argument("--list", action="store_true", help="show what would be made, make nothing")
    ap.add_argument("--redo", action="store_true", help="remake every automatically made clip, even if its text is unchanged")
    ap.add_argument("--redo-all", action="store_true", help="remake every clip, INCLUDING ones you added yourself")
    ap.add_argument("--limit", type=int, default=0, help="stop after this many clips")
    ap.add_argument("--course-only", action="store_true", help="only the course words, notes and sentences, the reading stories and the culture notes")
    ap.add_argument("--fidel", action="store_true", help="only the letters of the Fidel chart")
    a = ap.parse_args()

    male = []   # dialogue lines spoken by a man: always the male voice, saved in clips/m/
    if a.only:
        wanted = a.only
    elif a.src:
        wanted = [l.strip() for l in open(a.src, encoding="utf-8") if l.strip()]
    elif a.fidel:
        wanted = fidel_letters()
    else:
        dl = dialogue_lines()
        wanted = phrases_from_data(a.course_only) + [t for t, g in dl if g == "f"] + ([] if a.course_only else fidel_letters())
        male = [t for t, g in dl if g == "m"]
    if a.male_copies:
        male = male + list(wanted)

    # Male clips are tracked under "m/<key>" in generated.json.
    have = existing_clips()
    have.update({MALE_DIR + "/" + k: v for k, v in existing_clips(male=True).items()})
    made = load_generated()

    # One clip per key. Where the same words appear more than once (a word list and a sentence, say),
    # use the most fully punctuated version, since that is what tells the voice where to pause.
    best, order = {}, []
    for text, pre in [(t, "") for t in wanted] + [(t, MALE_DIR + "/") for t in male]:
        key = normalize(text)
        if not key:
            continue
        key = pre + key
        if key not in best:
            order.append(key)
            best[key] = text
        elif len(PUNCT_COUNT.findall(text)) > len(PUNCT_COUNT.findall(best[key])):
            best[key] = text

    todo, remake = [], 0
    for key in order:
        text, m = best[key], key.startswith(MALE_DIR + "/")
        if key not in have:
            todo.append((text, m))
        elif a.redo_all or (key in made and (a.redo or made[key] != to_tts(text))):
            todo.append((text, m))
            remake += 1
    if a.limit:
        todo = todo[: a.limit]

    print(f"{len(todo)} clips to make, {remake} of them remakes ({len(have)} exist, {len(made)} made automatically)")
    if a.list:
        print("\n".join(f"{t}   ->   {to_tts(t)}" + ("   (male voice)" if m else "") for t, m in todo))
        return

    (CLIPS / MALE_DIR).mkdir(parents=True, exist_ok=True)
    failed = 0
    for i, (text, m) in enumerate(todo, 1):
        for attempt in (1, 2, 3):
            try:
                asyncio.run(make(text, VOICES["male" if m else "female"], a.rate, m))
                made[(MALE_DIR + "/" if m else "") + normalize(text)] = to_tts(text)
                print(f"[{i}/{len(todo)}] {to_tts(text)}")
                break
            except Exception as e:  # keep going; network hiccups are common
                if attempt == 3:
                    failed += 1
                    print(f"[{i}/{len(todo)}] FAILED {text}: {e}", file=sys.stderr)
                else:
                    time.sleep(2 * attempt)
        if i % 25 == 0:
            save_generated(made)
    save_generated(made)
    print(f"done, {failed} failed; manifest lists {write_manifest()} clips")


if __name__ == "__main__":
    main()
