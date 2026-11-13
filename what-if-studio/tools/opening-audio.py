"""Rebuild the opening mix from credited, selected sources. No API or paid generation.
Run from any directory: python path/to/opening-audio.py
"""
from pathlib import Path
import subprocess, json, hashlib

studio=Path(__file__).resolve().parents[1]
folder=studio/'public/ho-so-02-nguoi-lam-thay/opening-audio'
m=json.loads((folder/'sources.json').read_text(encoding='utf-8'))
assert m['duration']==48 and m['fps']==30 and m['voice'] is False
assert all(0<=e['at']<48 and 0<=e['gain']<=1 for e in m['events'])
for name,digest in m['sha256'].items():
 assert hashlib.sha256((folder/name).read_bytes()).hexdigest()==digest, 'Source changed: '+name
args=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(folder/m['music']['file'])]
# Modest room tone synthesized locally, no third-party recording or voice.
args+=['-f','lavfi','-i','anoisesrc=color=brown:amplitude=0.015:duration=48:sample_rate=48000:seed=42']
filters=["[0:a]aresample=48000,afade=t=in:d=1.5,afade=t=out:st=46.2:d=1.8,volume='if(lt(t,5),0.42,if(lt(t,15),0.13,if(lt(t,26),0.07,if(lt(t,35),0.32,0.55))))':eval=frame[music]",
 "[1:a]highpass=f=65,lowpass=f=1100,afade=t=in:d=0.25,afade=t=out:st=46.7:d=1.3,aformat=channel_layouts=stereo[room]"]
labels=['[music]','[room]']
for i,e in enumerate(m['events'],2):
 args+=['-i',str(folder/e['file'])]
 chain=f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.008"
 if e['filter']: chain+=','+e['filter']
 chain+=f",volume={e['gain']},adelay={round(e['at']*1000)}:all=1[e{i}]"
 filters.append(chain); labels.append(f'[e{i}]')
filters.append(''.join(labels)+f'amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=duration=48,loudnorm=I=-18:TP=-2:LRA=9,aresample=48000[out]')
args+=['-filter_complex',';'.join(filters),'-map','[out]','-c:a','pcm_s16le','-ar','48000','-ac','2',str(folder/'mix.wav')]
subprocess.run(args,check=True)
print('Mix ready:',folder/'mix.wav')
