#!/usr/bin/env python3
"""Make audio clips for the Amharic in the app with a free Microsoft neural voice (edge-tts).

    pip install edge-tts
    python3 tools/make_audio.py                 # every word and sentence that has no clip yet
    python3 tools/make_audio.py --voice male    # use the male voice (am-ET-AmehaNeural)
    python3 tools/make_audio.py --list          # only show what would be made
    python3 tools/make_audio.py --course-only   # just the course words and sentences
    python3 tools/make_audio.py --only "ሰላም" "ቡና"
    python3 tools/make_audio.py --from words.txt   # one phrase per line

Clips are saved to site/audio/clips/<the Amharic>.mp3 and the manifest is rebuilt.
Existing clips are never overwritten unless you pass --redo, so clips you made yourself
(for example on ttsfree.com) are safe: just name them the same way and drop them in.
Needs an internet connection. edge-tts uses Microsoft Edge's online read-aloud service,
which is free but unofficial and could change.
"""
import argparse
import asyncio
import re
import sys
import time
from audio_common import CLIPS, ETHIOPIC, SITE, existing_clips, normalize
from audio_manifest import write_manifest

VOICES = {"female": "am-ET-MekdesNeural", "male": "am-ET-AmehaNeural"}
STRING = re.compile(r'"((?:[^"\\]|\\.)*)"')


# Course words and sentences first, so a partial run still covers what matters most.
ORDER = ["course.js", "sentences.js", "tables.js", "vocab.js", "verbs.js"]
LATIN = re.compile(r"[A-Za-z]")


def phrases_from_data(course_only: bool = False) -> list:
    """Every quoted string in the data files that is Amharic only (no Latin letters)."""
    files = sorted((SITE / "js" / "data").glob("*.js"), key=lambda f: (ORDER.index(f.name) if f.name in ORDER else 99, f.name))
    files = [f for f in files if f.name != "fidel.js"]  # single letters, not words
    if course_only:
        files = [f for f in files if f.name in ("course.js", "sentences.js")]
    found = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        for m in STRING.finditer(text):
            s = m.group(1)
            if s and ETHIOPIC.match(s) and not LATIN.search(s):
                found.append(s)
        # notes write examples as {fidel|transcription}
        for m in re.finditer(r"\{([^|}]+)\|", text):
            if ETHIOPIC.match(m.group(1)) and not LATIN.search(m.group(1)):
                found.append(m.group(1))
    return [s for s in found if "✗" not in s]


async def make(text: str, voice: str, rate: str) -> None:
    import edge_tts  # imported here so --list works without it

    out = CLIPS / f"{normalize(text)}.mp3"
    tmp = out.with_suffix(".part")
    try:
        await edge_tts.Communicate(text, voice, rate=rate).save(str(tmp))
        if tmp.stat().st_size == 0:
            raise RuntimeError("empty clip")
        tmp.replace(out)
    finally:
        tmp.unlink(missing_ok=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--voice", default="female", help="female, male, or a full edge-tts voice name")
    ap.add_argument("--rate", default="-10%", help="speaking speed, e.g. -20%% for slower (default -10%%)")
    ap.add_argument("--only", nargs="+", help="make just these phrases")
    ap.add_argument("--from", dest="src", help="text file with one phrase per line")
    ap.add_argument("--list", action="store_true", help="show what would be made, make nothing")
    ap.add_argument("--redo", action="store_true", help="replace clips that already exist")
    ap.add_argument("--limit", type=int, default=0, help="stop after this many clips")
    ap.add_argument("--course-only", action="store_true", help="only the course words, notes and sentences")
    a = ap.parse_args()

    if a.only:
        wanted = a.only
    elif a.src:
        wanted = [l.strip() for l in open(a.src, encoding="utf-8") if l.strip()]
    else:
        wanted = phrases_from_data(a.course_only)

    have = existing_clips()
    todo, seen = [], set()
    for text in wanted:
        key = normalize(text)
        if not key or key in seen or (key in have and not a.redo):
            continue
        seen.add(key)
        todo.append(text)
    if a.limit:
        todo = todo[: a.limit]

    print(f"{len(todo)} clips to make ({len(have)} already exist)")
    if a.list:
        print("\n".join(todo))
        return

    voice = VOICES.get(a.voice, a.voice)
    CLIPS.mkdir(parents=True, exist_ok=True)
    failed = 0
    for i, text in enumerate(todo, 1):
        for attempt in (1, 2, 3):
            try:
                asyncio.run(make(text, voice, a.rate))
                print(f"[{i}/{len(todo)}] {text}")
                break
            except Exception as e:  # keep going; network hiccups are common
                if attempt == 3:
                    failed += 1
                    print(f"[{i}/{len(todo)}] FAILED {text}: {e}", file=sys.stderr)
                else:
                    time.sleep(2 * attempt)
    print(f"done, {failed} failed; manifest lists {write_manifest()} clips")


if __name__ == "__main__":
    main()
