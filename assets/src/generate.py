#!/usr/bin/env python3
"""Generate candidate images for assets/src/prompts.json with Imagen 3 (Gemini API).

    export GEMINI_API_KEY=...
    python3 assets/src/generate.py --list
    python3 assets/src/generate.py --ids tex-mud-wet,lookdev-rice-heading --n 4
    python3 assets/src/generate.py --kind texture --dry-run

Candidates are written to assets/src/generated/<id>/<n>.png (git-ignored) and logged to
assets/src/generated/log.jsonl for ATTRIBUTION. Copy the approved one to
assets/src/selected/<id>.png. Standard library only.
"""
import argparse, base64, datetime, json, os, sys, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
MODEL = 'imagen-3.0-generate-002'
URL = 'https://generativelanguage.googleapis.com/v1beta/models/%s:predict'


def full_prompt(spec, item):
    style = item.get('style') or item['kind']
    parts = [spec['style'][style]]
    if item.get('cutaway'):
        parts.append(spec['style']['cutaway'])
    parts.append(item['prompt'])
    return ' '.join(parts)


def call(prompt, aspect, n, key, model):
    body = {'instances': [{'prompt': prompt}],
            'parameters': {'sampleCount': n, 'aspectRatio': aspect, 'personGeneration': 'dont_allow'}}
    req = urllib.request.Request(URL % model, json.dumps(body).encode(),
                                 {'Content-Type': 'application/json', 'x-goog-api-key': key})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit('API error %s: %s' % (e.code, e.read().decode()[:500]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', help='comma-separated ids')
    ap.add_argument('--kind', choices=['lookdev', 'texture', 'atlas'])
    ap.add_argument('--n', type=int, default=4, help='candidates per item (1-4)')
    ap.add_argument('--model', default=MODEL)
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--dry-run', action='store_true', help='print prompts, call nothing')
    a = ap.parse_args()
    spec = json.loads((HERE / 'prompts.json').read_text())
    items = spec['items']
    if a.ids:
        want = set(a.ids.split(','))
        missing = want - {i['id'] for i in items}
        if missing:
            sys.exit('unknown ids: ' + ', '.join(sorted(missing)))
        items = [i for i in items if i['id'] in want]
    if a.kind:
        items = [i for i in items if i['kind'] == a.kind]
    if a.list:
        for i in items:
            print('%-26s %-8s %s' % (i['id'], i['kind'], i['aspect']))
        return
    key = os.environ.get('GEMINI_API_KEY')
    if not key and not a.dry_run:
        sys.exit('Set GEMINI_API_KEY (or use --dry-run).')
    out = HERE / 'generated'
    for i in items:
        prompt = full_prompt(spec, i)
        if a.dry_run:
            print('[%s] %s\n  %s\n' % (i['id'], i['aspect'], prompt))
            continue
        res = call(prompt, i['aspect'], max(1, min(4, a.n)), key, a.model)
        preds = res.get('predictions') or []
        if not preds:
            print('%s: no images returned (likely filtered): %s' % (i['id'], json.dumps(res)[:200]))
            continue
        d = out / i['id']
        d.mkdir(parents=True, exist_ok=True)
        start = len(list(d.glob('*.png')))
        for k, p in enumerate(preds):
            (d / ('%d.png' % (start + k + 1))).write_bytes(base64.b64decode(p['bytesBase64Encoded']))
        with open(out / 'log.jsonl', 'a') as f:
            f.write(json.dumps({'id': i['id'], 'model': a.model, 'date': datetime.date.today().isoformat(),
                                'prompt': prompt, 'count': len(preds)}) + '\n')
        print('%s: %d candidates -> %s' % (i['id'], len(preds), d))


if __name__ == '__main__':
    main()
