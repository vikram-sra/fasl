"""Assemble the zero-dependency, file://-compatible application."""
import json
from pathlib import Path
root = Path(__file__).parent
payload = {p.stem: json.loads(p.read_text()) for p in sorted((root/'data').glob('*.json'))}
html = (root/'app/shell.html').read_text()
html = html.replace('/* APP_CSS */', (root/'app/style.css').read_text())
html = html.replace('/* PACKAGE_DATA */', 'const DATA = '+json.dumps(payload, ensure_ascii=False).replace('</', '<\\/')+';')
html = html.replace('/* THREE */', (root/'app/vendor/three.bundle.js').read_text())
html = html.replace('/* SCENE_3D */', (root/'app/scene3d.js').read_text())
html = html.replace('/* SIMULATION */', (root/'app/simulation.js').read_text())
html = html.replace('/* APPLICATION */', (root/'app/application.js').read_text())
(root/'index.html').write_text(html)
print('Built index.html — embedded art, simulation and all package data.')
