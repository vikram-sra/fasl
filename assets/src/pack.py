#!/usr/bin/env python3
"""Convert assets/build/*.png to WebP and write assets/build/pack.json ({name: data-URI}).

build.py inlines pack.json into index.html as `const ASSETS = {...}`. Needs `cwebp` (brew install webp).
Albedo/atlas: lossy q85 (atlases keep alpha). Normal q82, ORM q72 (size budget).
"""
import base64, json, shutil, subprocess, sys
from pathlib import Path

build = Path(__file__).resolve().parent.parent / 'build'
if not shutil.which('cwebp'):
    sys.exit('cwebp not found: brew install webp')
pack, total = {}, 0
for png in sorted(build.glob('*.png')):
    if 'selftest' in png.name and '--selftest' not in sys.argv:
        continue
    webp = png.with_suffix('.webp')
    mode = ['-q', '72'] if png.name.endswith('.orm.png') else ['-q', '82'] if png.name.endswith('.normal.png') else ['-q', '85', '-alpha_q', '90']
    subprocess.run(['cwebp', '-quiet', '-m', '6', *mode, str(png), '-o', str(webp)], check=True)
    data = webp.read_bytes()
    pack[png.name[:-4]] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
    total += len(data)
for mj in sorted(build.glob('mesh-*.json')):
    pack[mj.stem] = 'data:application/json;base64,' + base64.b64encode(mj.read_bytes()).decode()
    total += mj.stat().st_size
for h in json.loads((build.parent / 'src' / 'cc0.json').read_text()).get('hdri', []):
    f = build.parent / 'src' / 'cc0' / h['file']
    if f.exists():
        pack[h['id']] = 'data:application/octet-stream;base64,' + base64.b64encode(f.read_bytes()).decode()
        total += f.stat().st_size
(build / 'pack.json').write_text(json.dumps(pack, separators=(',', ':')))
print('packed %d maps, %.2f MB webp (%.2f MB base64)' % (len(pack), total / 1e6, total * 4 / 3 / 1e6))
