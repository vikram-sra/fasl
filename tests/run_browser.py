"""Run a browser flow against an already-open Playwright CLI acceptance session."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
flow = sys.argv[1] if len(sys.argv) > 1 else 'journey.js'
allowed = {'journey.js', 'live-flow.js', 'farmer-ui.js', 'ux-metrics.js', 'acre-view.js', 'guided-playback.js', 'accessibility.js', 'crop-first.js', 'updates.js', 'touch-ux.js', 'seed-acre-labels.js'}
if flow not in allowed:
    raise SystemExit('Choose a current browser flow: ' + ', '.join(sorted(allowed)))
cli = shutil.which('playwright-cli')
command = [cli] if cli else ['npx', '--offline', '--yes', '--package', '@playwright/cli', 'playwright-cli']
result = subprocess.run(command + ['-s=acceptance', 'run-code', '--filename', str(root / 'tests' / flow)], capture_output=True, text=True, cwd=root)
output = root / 'output' / 'playwright'
output.mkdir(parents=True, exist_ok=True)
(output / (Path(flow).stem + '-results.txt')).write_text(result.stdout + result.stderr)
print(result.stdout + result.stderr)
raise SystemExit(result.returncode)
