# Run and maintain

Open the standalone `index.html` or serve the project with `python3 -m http.server 8080`. Open `http://127.0.0.1:8080/`. All runtime code, geometry, texture generation and model data are embedded; no CDN is required. The live GitHub Pages site changes after the built files are published.

## Controls

- Start: guided rice → straw → wheat journey, about 84 seconds including two harvest holds. Explore: paused day zero.
- Play/Pause: starts or freezes both progression and event motion. Replay at the endpoint restarts the journey.
- Next chapter or Rice/Wheat: jump to that chapter and pause. Timeline scrubbing restores continuous, reversible state.
- Arrow keys: one day; Shift + arrows: seven; Page Up/Down: fourteen; Home/End: rotation endpoints.
- Field / 100 g: coordinated crop presentation and allocated input quantities, with visibly different container sizes/capacities. Date and history are preserved.
- Care sheet: inspect automatic crop care and product ledgers. These controls do not apply inputs.
- Compare straw choices: see projected results for both paths, watch either from harvest, or change the path at the current date. Mulch is the disclosed baseline.
- Visible English/Punjabi switch; About includes theme, reduced motion and model JSON download. Preferences persist locally.
- About these estimates: source facts, calculated allocations, illustrative aquifer percentage and model limitations.

A static welcome preview is artwork, separate from the day-zero ledger. Short screens intentionally scroll. Without WebGL, chapter explanations, quantities, comparisons and the bowl still work. Reduced motion and Pause stop recurring field rendering after transitions settle. Hidden tabs freeze progression.

## Build and verify

```sh
python3 build.py
python3 validate_package.py
node tests/simulation.cjs
node tests/automatic-irrigation.cjs
node tests/continuous.cjs
node tests/residue.cjs
node tests/metrics.cjs
```

With a server running, open a CLI browser session named acceptance:

```sh
npx --yes --package @playwright/cli playwright-cli -s=acceptance open http://127.0.0.1:8080/ --config tests/playwright.config.json
python3 tests/run_browser.py seed-acre-labels.js
python3 tests/run_browser.py live-flow.js
python3 tests/run_browser.py farmer-ui.js
python3 tests/run_browser.py ux-metrics.js
python3 tests/run_browser.py acre-view.js
python3 tests/run_browser.py guided-playback.js
python3 tests/run_browser.py crop-first.js
python3 tests/run_browser.py accessibility.js
```

The runner uses a globally installed CLI when available, otherwise the cached npm CLI in offline mode. Install/cache `@playwright/cli` with the open command above first. Browser checks capture artifacts under `output/playwright/`, which is ignored by Git. Legacy UI scripts under `tests/legacy/` describe superseded interfaces.

## Files and release

`app/simulation.js` is the deterministic model. `app/timeline.js` samples daily balances and botanical state. `app/metrics.js` allocates quantities. `app/scene3d.js` renders the representative cutaway; `app/field3d.js` owns the perspective acre, embedded models, population marks and seed transition. `app/application.js` owns journey, playback, camera, units, dialogs and comparison state. Do not edit generated `index.html` directly.

GitHub Pages serves the repository root with `.nojekyll`. For release, rebuild, verify, refresh tracked-file manifest hashes, commit and publish using the project's normal process. Three.js r182 is bundled under its MIT license. Pushes to main trigger the managed Pages deployment.

## Publication and cache refresh

GitHub Pages publishes the repository root from `main` using its managed Pages build. A push is not confirmed as deployed until the corresponding Pages run succeeds and the live artifact matches the build.

`python3 build.py` produces both `index.html` and `version.json`; commit and publish them together. The HTML embeds the same deterministic content revision as the version file. Hosted tabs check on startup, every 60 seconds in the foreground, focus/visibility return and reconnect. Newer deployed content reloads automatically through a cache-busting URL after the candidate HTML revision is verified. Failed/offline checks keep the current app running. A one-minute retry guard also uses URL state when session storage is unavailable. Local `file://` pages do not perform update checks.

Run `python3 tests/run_browser.py updates.js` for update detection, real navigation, preserved preferences/URL state, partial publication, offline recovery, periodic checking and retry guards. Older tabs from before this feature need one manual refresh before they can detect future releases.
