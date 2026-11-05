"""Step 2 (paid engine): the voice. ElevenLabs text-to-speech with character timestamps, then the pauses tightened to the genre's pace.

python <skill>/scripts/voice_elevenlabs.py <slug> [--force]   (voice.py calls this when "engine" is "elevenlabs")
Reads  src/episodes/<slug>/episode.json  (script, voice, gaps)
Writes public/<slug>/voice_raw.mp3, public/<slug>/voice.wav (tightened), src/episodes/<slug>/words.json (word timings
       after tightening, used by plan.py) and out/<slug>/words_raw.json. Prints the credits it used.
The API is only called when the text or the voice settings change (cached by a hash), so re-running to retune the
gaps is free.

episode.json "voice" (all optional): {"id": "HXqqNj3PDxRdHVH1pXog", "model": "eleven_v4", "lang": "vi", "settings": {}}
  Trung Lê Quốc on Eleven v4 (multilingual_v2 doesn't list Vietnamese). Empty settings use the voice's own; v4 takes only
  stability and similarity_boost. Audio tags like [warmly] go to the model but never become words.
episode.json "gaps" (seconds, all optional): {"word": 0.12, "comma": 0.2, "sentence": 0.3, "question": 0.45,
  "pairs": {"anything|One": 0.6}}  -> every pause longer than its limit is cut to the limit, from its middle.
"""
import base64, hashlib, json, re, sys, time, unicodedata

import numpy as np

from wi import SR, api, apply_pads, spent_since, decode, ep_dir, load_episode, load_json, log_cost, out_dir, pub_dir, save_json, write_wav

if sys.argv[1] == '--find':
    # python voice_elevenlabs.py --find "Viết Linh": the voice's id, from your own voices and the shared library
    import urllib.parse
    q = sys.argv[2]
    mine = json.loads(api('/v1/voices'))['voices']
    for v in mine:
        if q.lower() in v['name'].lower():
            print(f"yours   {v['voice_id']}  {v['name']}")
    shared = json.loads(api('/v1/shared-voices?page_size=20&search=' + urllib.parse.quote(q)))['voices']
    for v in shared:
        print(f"library {v['voice_id']}  {v['name']}  ({v.get('language', '')}, {v.get('accent', '')})")
    sys.exit(0)

slug = sys.argv[1]
force = '--force' in sys.argv
ep = load_episode(slug)
V = {'id': 'HXqqNj3PDxRdHVH1pXog', 'model': 'eleven_v4', 'lang': 'vi', 'settings': {}}
V.update(ep.get('voice', {}))
text = unicodedata.normalize('NFC', ' '.join(b['text'].strip() for b in ep['script']))
sig = hashlib.sha1(json.dumps([text, V], sort_keys=True).encode()).hexdigest()[:12]
raw_mp3 = pub_dir(slug) / 'voice_raw.mp3'
raw_words = out_dir(slug) / 'words_raw.json'
meta = load_json(out_dir(slug) / 'voice_meta.json', {})

if force or meta.get('sig') != sig or not raw_mp3.exists() or not raw_words.exists():
    print(f'{len(text)} characters to ElevenLabs (voice {V["id"]})')
    t0 = time.time()
    body = {'text': text, 'model_id': V['model']}
    if V['settings']:
        body['voice_settings'] = V['settings']
    if V.get('lang') or V.get('language'):
        body['language_code'] = V.get('lang') or V.get('language')
    res = json.loads(api(f'/v1/text-to-speech/{V["id"]}/with-timestamps?output_format=mp3_44100_128', body))
    raw_mp3.write_bytes(base64.b64decode(res['audio_base64']))
    al = res['alignment']
    words, cur, in_tag = [], None, False
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch == '[':
            in_tag = True
        if in_tag:  # an audio tag is direction for the model, not a word
            in_tag = ch != ']'
            continue
        if re.match(r"[\w'’]", ch):
            if cur is None:
                cur = {'w': '', 's': s, 'e': e, 'p': ''}
            cur['w'] += ch
            cur['e'] = e
        else:
            if cur is not None:
                words.append(cur)
                cur = None
            if words and ch.strip():
                words[-1]['p'] += ch  # punctuation after the word decides how long its pause may be
    if cur:
        words.append(cur)
    for w in words:
        w['s'], w['e'] = round(w['s'], 3), round(w['e'], 3)
    save_json(raw_words, words)
    save_json(out_dir(slug) / 'voice_meta.json', {'sig': sig, 'chars': len(text)})
    used, n = spent_since(t0, expect=1)
    log_cost(slug, 'voice', used, f'{len(text)} characters' + ('' if n else '; not in the history yet, check the usage page'))
else:
    print('Voice unchanged since the last call: reusing it (no credits).')

# ---------------------------------------------------------------- tighten the pauses
words = load_json(raw_words)
G = {'word': 0.12, 'comma': 0.2, 'sentence': 0.3, 'question': 0.45, 'pairs': {}}
G.update(ep.get('gaps', {}))
x = decode(raw_mp3)
cuts = []


def bare(w):
    return re.sub(r'[^\w]', '', w)


for a, b in zip(words, words[1:]):
    gap = b['s'] - a['e']
    key = bare(a['w']) + '|' + bare(b['w'])
    if key in G['pairs']:
        keep = G['pairs'][key]
    elif '?' in a['p'] or '!' in a['p']:
        keep = G['question']
    elif '.' in a['p'] or ':' in a['p'] or ';' in a['p'] or '…' in a['p']:
        keep = G['sentence']
    elif ',' in a['p'] or '—' in a['p'] or '-' in a['p']:
        keep = G['comma']
    else:
        keep = G['word']
    if gap > keep:
        mid = (a['e'] + b['s']) / 2
        rm = gap - keep
        cuts.append((mid - rm / 2, mid + rm / 2))
parts, last = [], 0.0
for s, e in cuts:
    parts.append(x[int(last * SR):int(s * SR)])
    last = e
parts.append(x[int(last * SR):])
fade = int(0.004 * SR)  # a 4 ms fade either side of each join, so no click
for i, part in enumerate(parts):
    part = part.copy()
    if i > 0 and len(part) > fade:
        part[:fade] *= np.linspace(0, 1, fade)
    if i < len(parts) - 1 and len(part) > fade:
        part[-fade:] *= np.linspace(1, 0, fade)
    parts[i] = part
y = np.concatenate(parts)


def shift(t):
    return t - sum(min(e, t) - s for s, e in cuts if t > s)


out = [{'w': w['w'], 's': round(shift(w['s']), 3), 'e': round(shift(w['e']), 3), 'p': w.get('p', '')} for w in words]
y, padded = apply_pads(y, out, ep.get('pads'))  # same "pads" as the free engines, so the edit keeps its breathing room
write_wav(pub_dir(slug) / 'voice.wav', y)
save_json(ep_dir(slug) / 'words.json', out)
if padded:
    print(f'Padded pauses: +{padded:.2f} s')
print(f'Tightened {len(cuts)} pauses, removed {sum(e - s for s, e in cuts):.2f} s: {len(x) / SR:.2f} s -> {len(y) / SR:.2f} s')
print(' '.join(f"{w['w']}@{w['s']}" for w in out))
