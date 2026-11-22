# TEMPORARY: make the fidel letters with yourvoic.com's Amharic voice (key in the YOURVOIC_API_KEY secret).
import os, sys, json, requests, subprocess
sys.path.insert(0, "tools")
from make_audio import fidel_letters
KEY = os.environ.get("YOURVOIC_API_KEY", "")
if not KEY: sys.exit("No YOURVOIC_API_KEY secret")
URL = "https://yourvoic.com/api/v1/tts/generate"
H = {"X-API-Key": KEY, "Content-Type": "application/json"}
OUT = "site/audio/try/yv"; os.makedirs(OUT, exist_ok=True)
# try to list voices
for u in ["https://yourvoic.com/api/v1/voices", "https://yourvoic.com/api/v1/tts/voices"]:
    try:
        r = requests.get(u, headers=H, timeout=30); print("VOICES", u, r.status_code, r.text[:3000].replace(KEY, "***"), flush=True)
    except Exception as e: print("VOICES", u, e)
combos = []
for model in ["aura-prime", "aura-max", "aura-lite"]:
    for lang in ["am-ET", "am"]:
        for voice in [None, "ብርሃን", "Birhan", "Berhan"]:
            combos.append({"model": model, "language": lang, **({"voice": voice} if voice else {})})
ok = None
for c in combos:
    r = requests.post(URL, json={"text": "ሰላም", "format": "mp3", **c}, headers=H, timeout=60)
    ct = r.headers.get("content-type", "")
    print("TRY", c, r.status_code, ct, len(r.content), (r.text[:200] if "json" in ct or "text" in ct else ""), flush=True)
    if r.status_code == 200 and "audio" in ct and len(r.content) > 2000:
        ok = c; open(f"{OUT}/_test.mp3", "wb").write(r.content); break
if not ok: sys.exit("No working Amharic voice found")
print("USING", ok, flush=True)
for ch in fidel_letters():
    r = requests.post(URL, json={"text": ch, "format": "mp3", "speed": 0.9, **ok}, headers=H, timeout=60)
    if r.status_code != 200 or "audio" not in r.headers.get("content-type", ""):
        print("FAIL", ch, r.status_code, r.text[:200], flush=True); continue
    open("/tmp/y.mp3", "wb").write(r.content)
    subprocess.run(["ffmpeg","-v","quiet","-y","-i","/tmp/y.mp3","-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.1","-ar","24000","-b:a","48k",f"{OUT}/{ch}.mp3"], check=True)
print("YV done", len(os.listdir(OUT)), flush=True)
