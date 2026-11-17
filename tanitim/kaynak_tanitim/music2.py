# Daha dinamik tanıtım müziği (numpy ile üretilir): 124 BPM, enerjik bas/arp/lead, kick+hat+clap, 16 ölçülük bölümler, build-up + drop. Kullanım: python3 music2.py 560
import numpy as np, wave, sys
from scipy.signal import lfilter
SR=44100;DUR=float(sys.argv[1]) if len(sys.argv)>1 else 480
BPM=124;beat=60/BPM;bar=beat*4
rng=np.random.default_rng(11)
N=int(DUR*SR)+SR*4;L=np.zeros(N);R=np.zeros(N)
def add(buf,start,sig,gain=1.0):
    i=int(start*SR);j=min(N,i+len(sig))
    if i<N and j>i: buf[i:j]+=sig[:j-i]*gain
def env(n,a,r):
    e=np.ones(n);ai=max(1,int(a*SR));ri=max(1,int(r*SR))
    e[:ai]=np.linspace(0,1,ai);e[-ri:]=np.minimum(e[-ri:],np.linspace(1,0,ri));return e
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR);return lfilter([1-a],[1,-a],x)
def saw(f,t,det=0.0):
    ph=(f*(1+det)*t)%1.0;return 2*ph-1
def lead(f,d):
    n=int(d*SR);t=np.arange(n)/SR
    s=(saw(f,t,0.0)+saw(f,t,0.006)+saw(f,t,-0.006))/3
    return lp(s,2600)*np.exp(-t*3.2)*env(n,0.004,0.08)
def arp(f,d):
    n=int(d*SR);t=np.arange(n)/SR
    s=0.6*np.sign(np.sin(2*np.pi*f*t))*0.5+np.sin(2*np.pi*f*t)
    return lp(s,3800)*np.exp(-t*11)*env(n,0.002,0.02)
def bass(f,d):
    n=int(d*SR);t=np.arange(n)/SR
    s=np.sin(2*np.pi*f*t)+0.5*saw(f,t)*0.6+0.3*np.sin(2*np.pi*2*f*t)
    return lp(s,700)*env(n,0.004,0.04)*np.exp(-t*2.2)
def pad(f,d):
    n=int(d*SR);t=np.arange(n)/SR
    s=sum(saw(f,t,k*0.004) for k in (-1,0,1))/3
    return lp(s,1400)*env(n,0.25,0.4)
def kick():
    n=int(0.3*SR);t=np.arange(n)/SR;f=150*np.exp(-t*26)+48
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*11)
def hat(open_=False):
    n=int((0.22 if open_ else 0.045)*SR);x=rng.standard_normal(n)
    x=x-lp(x,6000);return x*np.exp(-np.arange(n)/SR*(18 if open_ else 95))
def clap():
    n=int(0.2*SR);x=rng.standard_normal(n);x=lp(x,5000)-lp(x,500);return x*np.exp(-np.arange(n)/SR*26)
def riser(d):
    n=int(d*SR);x=rng.standard_normal(n);t=np.linspace(0,1,n);y=np.zeros(n)
    for k,fc in enumerate(np.geomspace(300,9000,12)):
        y+=(lp(x,fc)-lp(x,fc*0.6))*(((t*12)-k).clip(0,1)*(1-((t*12)-k-1).clip(0,1)))
    return y*t**2*0.9
# Am - F - C - G (parlak, enerjik)
prog=[(55.0,[220.0,261.63,329.63]),(43.65,[174.61,220.0,261.63]),(65.41,[261.63,329.63,392.0]),(49.0,[196.0,246.94,293.66])]
lead_notes=[[0,2,4,2],[2,1,0,1],[1,2,4,2],[2,4,5,4]]  # akor/oktav indeksleri
bars=int(DUR/bar)+2
for b in range(bars):
    t0=b*bar;root,chord=prog[b%4];sec=(b//16)%3;ph=b%16
    drop=(ph==0 and b>0)          # 16 ölçüde bir: vuruşlu giriş (drop)
    brk=(ph in (14,15))           # build-up: kick yok, riser + snare roll
    intro=b<4
    # pad (pompalı: her vuruşta hafif çekilir)
    for f in chord:
        p=pad(f,bar);pump=np.resize(np.tile(np.concatenate([np.linspace(0.35,1,int(beat*SR*0.8)),np.ones(int(beat*SR*0.2))]),4),len(p))
        add(L,t0,p*pump,0.045);add(R,t0,p*pump,0.045)
    # bas: 8'likler, oktav zıplamalı
    if not intro:
        for q in range(8):
            f=root*(2 if q%4==3 else 1)
            add(L,t0+q*beat/2,bass(f,beat*0.45),0.30);add(R,t0+q*beat/2,bass(f,beat*0.45),0.30)
    # arp 16'lıklar
    for q in range(16 if ph>=2 or b>=16 else 8):
        step=beat/4 if (ph>=2 or b>=16) else beat/2
        idx=[0,1,2,1][q%4];f=chord[idx]*(2 if (q//4)%2 else 1)
        pan=0.5+0.35*np.sin(q*0.7+b)
        add(L,t0+q*step,arp(f,step*0.9),0.050*(1-pan));add(R,t0+q*step,arp(f,step*0.9),0.050*pan)
    # lead (sec 1-2'de)
    if sec>=1 and ph>=4 and not brk:
        for q in range(4):
            ni=lead_notes[b%4][q];f=chord[min(ni,2)]*(2 if ni>=3 else 1)*2
            add(L,t0+q*beat,lead(f,beat*0.95),0.075);add(R,t0+q*beat,lead(f*1.002,beat*0.95),0.075)
    # ritim
    if not brk and not intro:
        for q in range(4): add(L,t0+q*beat,kick(),0.42);add(R,t0+q*beat,kick(),0.42)
        for q in range(8): add(L,t0+q*beat/2+beat/4,hat(q%4==3),0.06);add(R,t0+q*beat/2+beat/4,hat(q%4==3),0.06)
        for q in (1,3): add(L,t0+q*beat,clap(),0.10);add(R,t0+q*beat,clap(),0.10)
    if intro and b>=2:
        for q in range(4): add(L,t0+q*beat,kick(),0.28);add(R,t0+q*beat,kick(),0.28)
    if brk:
        if ph==14: r=riser(bar*2);add(L,t0,r,0.10);add(R,t0,r,0.10)
        for q in range(8 if ph==14 else 16):
            st=bar/(8 if ph==14 else 16);c=clap();add(L,t0+q*st,c,0.05+0.06*q/(8 if ph==14 else 16));add(R,t0+q*st,c,0.05+0.06*q/(8 if ph==14 else 16))
fade=int(2.5*SR);L[:fade]*=np.linspace(0,1,fade);R[:fade]*=np.linspace(0,1,fade)
end=int(DUR*SR);L=L[:end+SR*2];R=R[:end+SR*2]
L[-fade*2:]*=np.linspace(1,0,fade*2);R[-fade*2:]*=np.linspace(1,0,fade*2)
m=max(abs(L).max(),abs(R).max());L/=m;R/=m
out=(np.stack([L,R],1)*0.9*32767).astype(np.int16)
w=wave.open('music2.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(out.tobytes());w.close();print('ok',len(out)/SR)
