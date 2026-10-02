"""Run CLI browser acceptance checks, without adding an application dependency."""
from pathlib import Path
import subprocess
code=Path('tests/live-flow.js').read_text()
result=subprocess.run(['npx','--yes','--package','@playwright/cli','playwright-cli','-s=acceptance','run-code',code],capture_output=True,text=True)
Path('output/playwright/live-results.txt').write_text(result.stdout+result.stderr)
print(result.stdout+result.stderr)
raise SystemExit(result.returncode)
