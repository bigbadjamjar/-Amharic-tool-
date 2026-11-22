# TEMPORARY experiment: have the voice recite each fidel row ("ቸ፣ ቹ፣ ቺ ...") and cut it into letters.
import asyncio, json, re, subprocess, sys, os
import edge_tts
sys.path.insert(0, "tools")
text = open("site/js/data/fidel.js", encoding="utf-8").read()
rows = re.findall(r'\["(.)","', re.search(r"const FR = (\[.*?\]);", text).group(1))
OUT = "site/audio/try"; os.makedirs(OUT, exist_ok=True)
VOICE = "am-ET-MekdesNeural"
report = {}
def silences(path):
    err = subprocess.run(["ffmpeg","-i",path,"-af","silencedetect=noise=-38dB:d=0.10","-f","null","-"],capture_output=True,text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()[2]) + 60*float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()[1])
    return st, en, dur
async def main():
    for r in rows:
        base = ord(r); letters = [chr(base+k) for k in range(7)]
        full = f"{OUT}/row-{r}.mp3"
        await edge_tts.Communicate(". ".join(letters) + ".", VOICE, rate="-20%").save(full)
        st, en, dur = silences(full)
        # sound segments = gaps between silences
        segs, t = [], 0.0
        pairs = list(zip(st, en + [dur]*(len(st)-len(en))))
        for s, e in pairs:
            if s - t > 0.08: segs.append((t, s))
            t = e
        if dur - t > 0.08: segs.append((t, dur))
        report[r] = {"segments": len(segs), "times": [[round(a,2), round(b,2)] for a,b in segs]}
        print("ROW", r, len(segs), report[r]["times"], flush=True)
        if len(segs) == 7:
            for ch, (a, b) in zip(letters, segs):
                a2, b2 = max(0, a-0.05), b+0.08
                subprocess.run(["ffmpeg","-v","quiet","-y","-i",full,"-ss",str(a2),"-to",str(b2),"-af","afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse","-b:a","48k",f"{OUT}/{ch}.mp3"])
    json.dump(report, open(f"{OUT}/report.json","w"), ensure_ascii=False, indent=1)
asyncio.run(main())
