# TEMPORARY: two more ways to make fidel letter sounds, for Rob to compare by ear.
#  mms: Meta's Amharic voice (facebook/mms-tts-amh)
#  vc:  eSpeak's Amharic letters, re-voiced with kNN-VC to sound like the app's Mekdes clips
import os, sys, glob, random, subprocess, numpy as np, torch
sys.path.insert(0, "tools")
from make_audio import fidel_letters
L = fidel_letters()
OUT = "site/audio/try"; os.makedirs(f"{OUT}/mms", exist_ok=True); os.makedirs(f"{OUT}/vc", exist_ok=True); os.makedirs("/tmp/es", exist_ok=True)
def wav16(src, dst): subprocess.run(["ffmpeg","-v","quiet","-y","-i",src,"-ac","1","-ar","16000",dst], check=True)
def mp3(src, dst): subprocess.run(["ffmpeg","-v","quiet","-y","-i",src,"-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.1","-ar","24000","-b:a","48k",dst], check=True)
import soundfile as sf
# --- kNN-VC
import torchaudio
def _load(path, normalize=True, **k):
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    return torch.from_numpy(x.T.copy()), sr
torchaudio.load = _load
knn = torch.hub.load("bshall/knn-vc", "knn_vc", prematched=True, trust_repo=True, skip_validation=True, pretrained=True, device="cpu")
refs = sorted(glob.glob("site/audio/clips/*.mp3")); random.seed(0); refs = [r for r in refs if len(os.path.basename(r)) > 8]; random.shuffle(refs)
ref_w = []
for i, r in enumerate(refs[:400]):
    p = f"/tmp/ref{i}.wav"; wav16(r, p); ref_w.append(p)
mset = knn.get_matching_set(ref_w, vad_trigger_level=0)
for c in L:
    subprocess.run(["espeak-ng","-v","am","-s","110","-p","45","-w","/tmp/es/e.wav",c], check=True)
    wav16("/tmp/es/e.wav", "/tmp/es/e16.wav")
    q = knn.get_features("/tmp/es/e16.wav", vad_trigger_level=0)
    out = knn.match(q, mset, topk=4)
    sf.write("/tmp/v.wav", out.numpy(), 16000); mp3("/tmp/v.wav", f"{OUT}/vc/{c}.mp3")
print("VC done", flush=True)
