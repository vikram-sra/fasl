> Farmer interface update: bilingual controls, themes, and one rice-residue choice are now implemented. See [farmer UI and residue model](FARMER_UI_AND_RESIDUE.md) for current behavior, evidence and assumptions. Earlier automatic-only descriptions below predate this update.

# Run and maintain

Play at https://vikram-sra.github.io/fasl/, or open `index.html` in a modern browser. The standalone file includes Three.js, original botanical geometry, the daily model, continuous timeline sampler and supplied data. It needs no runtime install or network connection. WebGL2 renders the field; timeline values and details remain available when it cannot start.

For a local preview:

```sh
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/. A phone on the same Wi-Fi can use the computer’s LAN address if the server is bound to `0.0.0.0`.

## Controls

- The demonstration plays automatically at 1.5 model days per second. Pause/play is beside the bottom timeline.
- Drag the slider to any fractional day. Plant growth, inventory and water stocks interpolate continuously. Reverse scrubbing restores earlier amounts rather than changing the trajectory.
- Rice/Wheat selects the beginning of that season. The slider includes the chronological fallow interval; wheat shares the preceding soil and aquifer history.
- The bottles show remaining quantities from each crop’s total planned applications. A treatment bottle stays full if no treatment is required. Tap a bottle for its source-rate ledger.
- The groundwater marker displays the bucket’s storage percentage and direction. It is not a measured depth.
- Arrow keys move one day, Shift + Arrow moves seven days, Page Up/Down moves fourteen; Home/End select the rotation endpoints.
- About contains sources, live model amounts, reduced motion and JSON export. System reduced motion disables autoplay and decorative movement by default.

This iteration automatically selects source baseline nutrition, moisture-triggered irrigation, weed management and condition-triggered pest management. It has no decision prompts, stage-snapshot previews or branching. Earlier decision-game saves are neither loaded nor overwritten.

## Build and verify

```sh
python3 build.py
python3 validate_package.py
node tests/simulation.cjs
node tests/automatic-irrigation.cjs
node tests/continuous.cjs
```

Browser checks use the Playwright CLI without adding an application dependency:

```sh
mkdir -p output/playwright
npx --yes --package @playwright/cli playwright-cli -s=acceptance open http://127.0.0.1:8080/ --config tests/playwright.config.json
python3 tests/run_browser.py
```

The model is in `app/simulation.js`. `app/timeline.js` samples its daily balances as continuous, reversible values. `app/scene3d.js` creates one botanical geometry per crop, applies continuous shader growth and wind, and animates the connected water paths. `app/application.js` coordinates the timeline and small UI. Original source facts remain in `data/`.

The daily visual sequence applies arriving recharge during fraction 0–0.2, rain/pumping during 0–0.3, infiltration/runoff during 0.3–0.65, evapotranspiration during 0.65–0.9 and drainage during 0.9–1. These fractions are presentation assumptions; every daily endpoint matches the reducer’s stocks. Wind, waves, moving particles and visual height exaggeration do not add ledger water. The supplied seven-day recharge lag remains intact.

## Publish

GitHub Pages publishes the root of `main`. `.nojekyll` serves the self-contained HTML directly. After edits, rebuild `index.html`, verify, update the manifest, commit and push to `main`. No CDN or remote asset is needed. Three.js r182 is bundled with its MIT license in `app/vendor/THREE-LICENSE.txt`.

The standalone build also embeds `app/metrics.js`: a read-only presentation sampler for plant/shoot estimates and per-bowl allocations. Run `node tests/metrics.cjs` and the browser flow `tests/ux-metrics.js` to validate unit behavior. See UX_AUDIT.md for the definitions.
