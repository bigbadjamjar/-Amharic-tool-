#!/usr/bin/env python3
"""Make audio clips for the Amharic in the app with a free Microsoft neural voice (edge-tts).

    pip install edge-tts
    python3 tools/make_audio.py                 # every word and sentence that has no clip yet
    python3 tools/make_audio.py --voice male    # use the male voice (am-ET-AmehaNeural)
    python3 tools/make_audio.py --list          # only show what would be made
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
from audio_common import CLIPS, ETHIOPIC, SITE, existing_clips, normalize
from audio_manifest import write_manifest

VOICES = {"female": "am-ET-MekdesNeural", "male": "am-ET-AmehaNeural"}
STRING = re.compile(r'"((?:[^"\\]|\\.)*)"')


def phrases_from_data() -> list:
    """Every quoted string in the data files that starts with Amharic script."""
    found = []
    for f in sorted((SITE / "js" / "data").glob("*.js")):
        for m in STRING.finditer(f.read_text(encoding="utf-8")):
            s = m.group(1)
            if s and ETHIOPIC.match(s):
                found.append(s)
        # notes write examples as {fidel|transcription}
        for m in re.finditer(r"\{([^|}]+)\|", f.read_text(encoding="utf-8")):
            if ETHIOPIC.match(m.group(1)):
                found.append(m.group(1))
    return found


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
    a = ap.parse_args()

    if a.only:
        wanted = a.only
    elif a.src:
        wanted = [l.strip() for l in open(a.src, encoding="utf-8") if l.strip()]
    else:
        wanted = phrases_from_data()

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
        try:
            asyncio.run(make(text, voice, a.rate))
            print(f"[{i}/{len(todo)}] {text}")
        except Exception as e:  # keep going; network hiccups are common
            failed += 1
            print(f"[{i}/{len(todo)}] FAILED {text}: {e}", file=sys.stderr)
    print(f"done, {failed} failed; manifest lists {write_manifest()} clips")


if __name__ == "__main__":
    main()
