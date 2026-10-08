"""Assemble the zero-dependency, file://-compatible application."""
import hashlib
import base64
import json
from pathlib import Path
root = Path(__file__).parent
payload = {p.stem: json.loads(p.read_text()) for p in sorted((root/'data').glob('*.json'))}
html = (root/'app/shell.html').read_text()
html = html.replace('/* APP_CSS */', (root/'app/style.css').read_text())
html = html.replace('/* PACKAGE_DATA */', 'const DATA = '+json.dumps(payload, ensure_ascii=False).replace('</', '<\\/')+';')
html = html.replace('/* THREE */', (root/'app/vendor/three.bundle.js').read_text())
html = html.replace('/* MODEL_LOADER */', (root/'app/vendor/gltf-loader.bundle.js').read_text())
html = html.replace('/* CROP_MODELS */', 'const CROP_MODELS = '+json.dumps({crop:base64.b64encode((root/f'assets/models/{crop}-mature.glb').read_bytes()).decode() for crop in ['rice','wheat']})+';')
html = html.replace('/* FIELD_3D */', (root/'app/field3d.js').read_text())
html = html.replace('/* SCENE_3D */', (root/'app/scene3d.js').read_text())
html = html.replace('/* SIMULATION */', (root/'app/simulation.js').read_text())
html = html.replace('/* TIMELINE */', (root/'app/timeline.js').read_text())
html = html.replace('/* METRICS */', (root/'app/metrics.js').read_text())
html = html.replace('/* APPLICATION */', (root/'app/application.js').read_text())
html = html.replace('/* APP_UPDATES */', (root/'app/updates.js').read_text())
# Stable content revision: identical source builds produce the same release.
version = hashlib.sha256(html.encode()).hexdigest()
html = html.replace('APP_VERSION', version)
(root/'index.html').write_text(html)
(root/'version.json').write_text(json.dumps({'schema': 1, 'version': version}, indent=2)+'\n')
print('Built index.html — embedded art, simulation and all package data.')
