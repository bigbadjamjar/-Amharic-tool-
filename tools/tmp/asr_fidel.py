# TEMPORARY: transcribe every fidel letter clip with an Amharic speech recogniser (MMS) to find wrong sounds.
import sys, json, subprocess, numpy as np, torch
sys.path.insert(0, "tools")
from make_audio import fidel_letters, to_tts
from transformers import Wav2Vec2ForCTC, AutoProcessor
proc = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="amh")
model = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="amh", ignore_mismatched_sizes=True)
model.eval()
def load(p):
    raw = subprocess.run(["ffmpeg","-v","quiet","-i",p,"-f","s16le","-ac","1","-ar","16000","-"],capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32)/32768
def asr(p):
    x = load(p)
    pad = np.zeros(4000, np.float32); x = np.concatenate([pad, x, pad])
    inp = proc(x, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad(): lg = model(**inp).logits
    return proc.decode(lg.argmax(-1)[0]), round(len(x)/16000, 2), round(float(np.sqrt((x**2).mean())), 4)
for w in ["ሰላም","አመሰግናለሁ","ቡና","ቸኮለ","ከተማ"]:
    print("WORD", w, asr(f"site/audio/clips/{w}.mp3") if __import__('os').path.exists(f"site/audio/clips/{w}.mp3") else "-", flush=True)
for c in fidel_letters():
    t, d, r = asr(f"site/audio/clips/{c}.mp3")
    print("LET", c, "sent=" + to_tts(c), "heard=" + t, d, r, flush=True)
