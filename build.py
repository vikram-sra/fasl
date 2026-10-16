"""Assemble the zero-dependency, file://-compatible application."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).parent
payload = {p.stem: json.loads(p.read_text()) for p in sorted((root/'data').glob('*.json'))}
html = (root/'app/shell.html').read_text()
import base64
font = base64.b64encode((root/'assets/fonts/NotoSansGurmukhi-var.woff2').read_bytes()).decode()
face = "@font-face{font-family:'Noto Sans Gurmukhi';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:U+0951-0952,U+0964-0965,U+0A01-0A76,U+200C-200D,U+20B9,U+25CC,U+262C,U+A830-A839}" % font
html = html.replace('/* APP_CSS */', ''.join((root/'app/css'/f).read_text() for f in ('tokens.css', 'layout.css', 'components.css')).replace('/* FONT_FACE */', face))
html = html.replace('/* PACKAGE_DATA */', 'const DATA = '+json.dumps(payload, ensure_ascii=False).replace('</', '<\\/')+';')
pack = root/'assets/build/pack.json'
html = html.replace('/* ASSET_PACK */', 'const ASSETS = '+(pack.read_text() if pack.exists() else '{}').replace('</', '<\\/')+';')
html = html.replace('/* THREE */', (root/'app/vendor/three.bundle.js').read_text())
html = html.replace('/* SCENE_3D */', (root/'app/scene3d.js').read_text())
html = html.replace('/* SIMULATION */', (root/'app/simulation.js').read_text())
html = html.replace('/* TIMELINE */', (root/'app/timeline.js').read_text())
html = html.replace('/* METRICS */', (root/'app/metrics.js').read_text())
for key, name in (('STATE', 'state'), ('STORY', 'story'), ('DETAILS', 'details'), ('UI', 'ui')):
    html = html.replace('/* %s */' % key, (root/'app'/(name+'.js')).read_text())
html = html.replace('/* APPLICATION */', (root/'app/application.js').read_text())
html = html.replace('/* APP_UPDATES */', (root/'app/updates.js').read_text())
# Stable content revision: identical source builds produce the same release.
version = hashlib.sha256(html.encode()).hexdigest()
html = html.replace('APP_VERSION', version)
(root/'index.html').write_text(html)
(root/'version.json').write_text(json.dumps({'schema': 1, 'version': version}, indent=2)+'\n')
print('Built index.html — embedded art, simulation and all package data.')
