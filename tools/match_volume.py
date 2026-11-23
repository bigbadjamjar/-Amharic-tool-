#!/usr/bin/env python3
"""Make your own recorded clips as loud as the voice-generated ones.

Clips you record or download yourself (like the fidel letters) are often louder or quieter than
the clips made by make_audio.py, so one button blares and the next is faint. This measures the
loudness of the speech in each clip (the silent parts are ignored) and turns it up or down to
match the generated clips, then rebuilds the manifest so phones fetch the new files.

    python3 tools/match_volume.py                 # every clip not made by make_audio.py
    python3 tools/match_volume.py ሀ ሁ ሂ           # just these clips
    python3 tools/match_volume.py --check         # only print the measurements, change nothing

The old files stay in git history, so any change can be undone. Needs ffmpeg and numpy.
"""
import argparse
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor

import numpy as np

from audio_common import AUDIO
from audio_manifest import write_manifest

CLIPS = AUDIO / "clips"
# Speech loudness of the short generated words (one- to three-letter clips, measured 2026-11-23):
# median -18.6, most between -20 and -16. A touch under that, as single syllables sound louder.
TARGET = -19.0
PEAK_LIMIT = -3.0   # never boost a quiet clip so far that its loudest point gets near clipping
TOLERANCE = 0.5     # clips already this close to the target are left alone


def speech_level(path) -> tuple[float, float]:
    """(loudness of the speech in dB, loudest single point in dB). Weighted a little towards the
    frequencies the ear hears most, and only counting the 25 ms slices within 20 dB of the loudest."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-af", "highpass=f=60,highshelf=f=1500:g=4",
         "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32)
    frames = x[: len(x) // 400 * 400].reshape(-1, 400)
    energy = (frames ** 2).mean(1)
    db = 10 * np.log10(energy + 1e-12)
    level = 10 * np.log10(energy[db > db.max() - 20].mean())
    peak = 20 * np.log10(np.abs(x).max() + 1e-9)
    return level, peak


def own_clips() -> list[str]:
    made = json.loads((AUDIO / "generated.json").read_text(encoding="utf-8"))["clips"]
    return sorted(p.stem for p in CLIPS.glob("*.mp3") if p.stem not in made)


def adjust(name: str, check: bool) -> str:
    path = CLIPS / f"{name}.mp3"
    level, peak = speech_level(path)
    gain = min(TARGET - level, PEAK_LIMIT - peak)
    line = f"{name}\tspeech {level:6.1f} dB\tpeak {peak:5.1f} dB\tchange {gain:+5.1f} dB"
    if check or abs(gain) < TOLERANCE:
        return line + ("" if check else "\t(left alone)")
    tmp = path.with_suffix(".tmp.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-af", f"volume={gain:.2f}dB",
                    "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "64k",
                    "-map_metadata", "-1", str(tmp)], check=True)
    tmp.replace(path)
    return line


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clips", nargs="*", help="clip names without .mp3 (default: all your own clips)")
    ap.add_argument("--check", action="store_true", help="only measure, change nothing")
    a = ap.parse_args()
    names = a.clips or own_clips()
    with ThreadPoolExecutor(8) as ex:
        for line in ex.map(lambda n: adjust(n, a.check), names):
            print(line)
    if not a.check:
        print(f"manifest lists {write_manifest()} clips")


if __name__ == "__main__":
    main()
