# TEMP: check which letter each cut piece of the yourvoic recordings really is, using the MMS
# alignment model: for each piece, how well does it fit each letter's romanised sound.
import json, re, subprocess, numpy as np, torch, torchaudio
D='tools/tmp/yv/'
order=list(open(D+'order.txt',encoding='utf-8').read().strip())
fid=open('site/js/data/fidel.js',encoding='utf-8').read()
FR=json.loads(re.search(r"const FR = (\[.*?\]);",fid).group(1))
HASWA="ለመሠረሰሸበቨተቸነኘዘዠደጀጠጨጰጸፈ"; LV={"ቀ":0x1248,"ኀ":0x1288,"ከ":0x12B0,"ገ":0x1310}
VOW=["e","u","i","a","e","i","o"]
rom={}
for r in FR:
    c0=r[0]; s=re.sub("[^a-z]","",r[1]); s={"q":"k","gn":"ny","zh":"zh"}.get(s,s)
    for k in range(7): rom[chr(ord(c0)+k)]=(s+VOW[k]) if (s or k!=5) else "i"
    if c0 in HASWA: rom[chr(ord(c0)+7)]=s+"wa"
    if c0 in LV:
        for off,v in [(0,"we"),(2,"wi"),(3,"wa"),(4,"we"),(5,"wi")]: rom[chr(LV[c0]+off)]=s+v
for k in range(7):
    if rom[chr(0x12A0+k)]=="": rom[chr(0x12A0+k)]="a"
missing=[c for c in order if c not in rom]; print("no romanisation:",missing)
bundle=torchaudio.pipelines.MMS_FA; model=bundle.get_model(with_star=False).eval(); dic=bundle.get_dict(star=None)
print("dict",dic)
def load(p):
    subprocess.run(["ffmpeg","-v","error","-y","-i",p,"-ac","1","-ar","16000","/tmp/x.wav"],check=True)
    import soundfile as sf; y,_=sf.read("/tmp/x.wav",dtype="float32"); return torch.tensor(y)
ctc=torch.nn.CTCLoss(blank=0,reduction="sum",zero_infinity=True)
res={}
for part,letters in (("a",order[:141]),("b",order[141:])):
    y=load(D+part+".mp3"); S=json.load(open(D+part+".json")); out=[]
    for i,(s,e) in enumerate(S):
        t0=s*220/22050-0.05; t1=e*220/22050+0.08
        seg=y[max(0,int(t0*16000)):int(t1*16000)]
        with torch.inference_mode(): em,_=model(seg[None])
        lp=torch.log_softmax(em,-1)[0]
        # greedy transcript
        ids=lp.argmax(-1).tolist(); g=[]; prev=0
        inv={v:k for k,v in dic.items()}
        for t in ids:
            if t!=prev and t!=0: g.append(inv.get(t,"?"))
            prev=t
        scores={}
        for c in set(letters):
            tg=torch.tensor([dic[ch] for ch in rom[c] if ch in dic])
            if len(tg)==0: continue
            scores[c]=ctc(lp[:,None,:],tg[None],torch.tensor([lp.shape[0]]),torch.tensor([len(tg)])).item()
        best=sorted(scores,key=scores.get)[:5]
        out.append({"i":i,"heard":"".join(g),"best":best,"scores":scores})
        print(part,i,"".join(g),best)
    res[part]=out
json.dump({"rom":rom,"res":res},open(D+"fa.json","w"),ensure_ascii=False)
