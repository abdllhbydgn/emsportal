# Tanıtım videosu birleştirme: sahne klipleri + ivmeli geçişler (xfade) + anlatım + dinamik müzik (music2.py) + geçiş whoosh'u + tıklama sesleri
import json,subprocess,sys,os,numpy as np,wave
from scipy.signal import lfilter
D=os.environ.get('TVDIR','/tmp/claude-0/-home-user/5d050a5c-9efe-5868-b7c0-331c83134422/scratchpad/tv/')
AUD='/home/user/ems/tanitim/audio2/'
SC=json.load(open('/home/user/ems/tanitim/script2.json'))
XF=0.55;SR=44100
TR=['zoomin','slideleft','circleopen','smoothleft','wipeleft','radial','coverleft','hlwind','smoothright','squeezeh','revealleft','diagtl']
def run(c):
    r=subprocess.run(c,capture_output=True,text=True)
    if r.returncode: print(' '.join(c)[:300],r.stderr[-800:]);sys.exit(1)
n=len(SC);metas=[json.load(open(D+f'out/{i:02d}.json')) for i in range(1,n+1)]
os.makedirs(D+'clips',exist_ok=True)
for i,m in enumerate(metas,1):
    out=D+f'clips/{i:02d}.mp4'
    if os.path.exists(out) and os.path.getmtime(out)>os.path.getmtime(D+f'out/{i:02d}.json'): continue
    run(['ffmpeg','-y','-ss',f"{max(0,m['off']-0.1):.3f}",'-i',D+f'out/{i:02d}.webm','-t',f"{m['total']:.3f}",'-vf','scale=1280:720,fps=25','-c:v','libx264','-preset','veryfast','-crf','21','-g','50','-pix_fmt','yuv420p',out])
lens=[float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',D+f'clips/{i:02d}.mp4'],capture_output=True,text=True).stdout) for i in range(1,n+1)]
ins=[];fc=[]
for i in range(n): ins+=['-i',D+f'clips/{i+1:02d}.mp4']
prev='[0:v]';cum=lens[0];tnames=[]
for i in range(1,n):
    o=cum-XF;out=f'[x{i}]'
    tn='fadeblack' if i==1 else ('fade' if i==n-1 else TR[(i-2)%len(TR)]);tnames.append(tn)
    fc.append(f"{prev}[{i}:v]xfade=transition={tn}:duration={XF}:offset={o:.3f}{out}");prev=out;cum=o+lens[i]
run(['ffmpeg','-y']+ins+['-filter_complex',';'.join(fc),'-map',prev,'-c:v','libx264','-preset','veryfast','-crf','22','-g','50','-pix_fmt','yuv420p',D+'tv_silent.mp4'])
starts=[];t=0
for l in lens: starts.append(t);t+=l-XF
total=t+XF
N=int((total+1)*SR);narr=np.zeros(N,dtype=np.float32);sfx=np.zeros(N,dtype=np.float32)
def pcm(f):
    r=subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True);return np.frombuffer(r.stdout,dtype=np.float32)
for i,m in enumerate(metas):
    for k,(a,b) in enumerate(m['sent']):
        x=pcm(AUD+f'en_{i+1:02d}_{k+1:02d}.mp3');p=int((starts[i]+a)*SR);narr[p:p+len(x)]+=x[:max(0,N-p)]
rng=np.random.default_rng(5)
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR);return lfilter([1-a],[1,-a],x)
def whoosh(d=0.7,up=True):
    n=int(d*SR);x=rng.standard_normal(n);t=np.linspace(0,1,n);y=np.zeros(n)
    fcs=np.geomspace(250,7000,10) if up else np.geomspace(7000,250,10)
    for k,fc in enumerate(fcs):
        w=np.exp(-((t*9-k-0.5)**2)/1.6);y+=(lp(x,fc)-lp(x,fc*0.55))*w
    return (y*np.sin(np.pi*t)**1.5*1.4).astype(np.float32)
def tick():
    n=int(0.09*SR);t=np.arange(n)/SR
    return (np.sin(2*np.pi*1900*t)*np.exp(-t*70)*0.6+np.sin(2*np.pi*950*t)*np.exp(-t*45)*0.5).astype(np.float32)
def ding():
    n=int(0.5*SR);t=np.arange(n)/SR
    return ((np.sin(2*np.pi*1318*t)+0.5*np.sin(2*np.pi*1975*t))*np.exp(-t*7)*0.35).astype(np.float32)
for i in range(1,n):
    w=whoosh(0.7,i%2==0);p=int((starts[i]+XF-0.7+0.15)*SR);sfx[max(0,p):p+len(w)]+=w[:max(0,N-max(0,p))]*0.55
for i,m in enumerate(metas):
    for c in m.get('clicks',[]):
        tk=tick();p=int((starts[i]+c+0.1)*SR);sfx[p:p+len(tk)]+=tk[:max(0,N-p)]*0.8
    if SC[i]['id'] not in ('welcome','closing'):
        d=ding();p=int((starts[i]+0.55)*SR);sfx[p:p+len(d)]+=d[:max(0,N-p)]*0.6
mus=wave.open(D+'music2.wav');mm=np.frombuffer(mus.readframes(mus.getnframes()),dtype=np.int16).reshape(-1,2).astype(np.float32)/32768;mus.close()
if len(mm)<N: mm=np.tile(mm,(N//len(mm)+1,1))
mm=mm[:N]
env=np.abs(narr);k=int(0.25*SR);env=np.convolve(env,np.ones(k)/k,mode='same');act=(env>0.012).astype(np.float32)
k2=int(0.5*SR);act=np.convolve(act,np.hanning(k2)/np.hanning(k2).sum(),mode='same');act=np.clip(act*1.6,0,1)
duck=1-0.62*act;g_m=0.50
Lc=narr+mm[:,0]*g_m*duck+sfx;Rc=narr+mm[:,1]*g_m*duck+sfx
peak=max(abs(Lc).max(),abs(Rc).max());g=0.92/peak if peak>0.92 else 1
out=(np.stack([Lc,Rc],1)*g*32767).astype(np.int16)
w=wave.open(D+'tv_mix.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(out.tobytes());w.close()
run(['ffmpeg','-y','-i',D+'tv_silent.mp4','-i',D+'tv_mix.wav','-c:v','libx264','-preset','medium','-crf','27','-maxrate','3000k','-bufsize','6000k','-g','50','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',D+'tanitim_nscs.mp4'])
print('hazır',round(total,1),tnames[:6])
