#!/usr/bin/env python3
"""TEMPORARY: try several spellings of each Fidel letter with the voice and measure how audible each is.
Writes audition/<n>-<name>.mp3 and audition/report.tsv. Not part of the app."""
import asyncio, array, subprocess, sys, json
from pathlib import Path
sys.argv = sys.argv[:1]
from make_audio import fidel_letters, to_tts, VOICES

OUT = Path("audition"); OUT.mkdir(exist_ok=True)
TWIN = {"ሐ": "ሀ", "ኀ": "ሀ", "ሠ": "ሰ", "ዐ": "አ", "ፀ": "ጸ", "ጸ": "ፀ"}
HROW = "ሀሐኀአዐ"

def row_base(c):
    o = ord(c)
    for b, s in [(0x1248, "ቀ"), (0x1288, "ኀ"), (0x12B0, "ከ"), (0x1310, "ገ")]:
        if b <= o < b + 8: return s, None
    return chr(0x1200 + (o - 0x1200) // 8 * 8), (o - 0x1200) % 8

def cands(c):
    base, k = row_base(c)
    six = chr(ord(base) + 5)
    out = [("cur", to_tts(c), "-10%"), ("slow", to_tts(c), "-35%")]
    if k is not None and base in TWIN:
        out.append(("twin", chr(ord(TWIN[base]) + k) + ".", "-10%"))
    if k == 0 and base in HROW:
        out.append(("ha", chr(ord(base) + 3) + ".", "-10%"))
    if k == 5:
        out += [("six_e", six + "እ.", "-10%"), ("six_e_slow", six + "እ.", "-35%"), ("six_dbl", six + six + ".", "-10%"),
                ("six_comma", six + "፣ " + six + ".", "-10%")]
    if k == 7:
        out.append(("wa", six + "ዋ.", "-10%"))
    return out

def measure(path):
    def rms(extra):
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path)] + extra + ["-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
        a = array.array("h", pcm); W = 320
        return [(sum(x * x for x in a[i:i + W]) / W) ** .5 for i in range(0, len(a) - W, W)]
    e = rms([]); lo = rms(["-af", "lowpass=f=900"])
    return int(max(e or [0])), round(sum(x > 1000 for x in e) * .02, 2), round(sum(x > 700 for x in lo) * .02, 2)

async def one(text, rate, path):
    import edge_tts
    for t in range(3):
        try:
            await edge_tts.Communicate(text, VOICES["female"], rate=rate).save(str(path)); return
        except Exception as ex:
            await asyncio.sleep(2 + t * 3)

rows = []
for i, c in enumerate(fidel_letters()):
    for name, text, rate in cands(c):
        p = OUT / f"{ord(c):04X}-{name}.mp3"
        asyncio.run(one(text, rate, p))
        m = measure(p) if p.exists() and p.stat().st_size else (0, 0, 0)
        rows.append([c, name, text, rate, *m])
        print("\t".join(map(str, rows[-1])), flush=True)
(OUT / "report.tsv").write_text("\n".join("\t".join(map(str, r)) for r in rows) + "\n", encoding="utf-8")
