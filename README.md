# A Bowl Across Two Seasons

**One field. Two harvests.** Follow a Punjab field from rice and wheat seed to dry food, and see where its water comes from.

Play the published version at [vikram-sra.github.io/fasl](https://vikram-sra.github.io/fasl/). Local changes appear there after publication. Open `index.html` in a modern browser for the current standalone build; code, Three.js and datasets are embedded, with no runtime download required.

For a local preview:

```sh
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Experience

The home screen has two choices: **Rice** and **Wheat**. Choose one to see a seed, then tap it to start an eight-second sowing and camera transition into the selected season. Playback starts automatically. Reduced motion shortens the transition.

**Field** shows a perspective view of a 4,046.8564224 m² acre. Drag or use the left/right arrows to turn; **+ / −** zoom from the full acre to 6×. Play sits beside Field / 100 g in the bottom dock. Controls fade in as the growing season begins.

The modeled population is approximately 269,790 rice seedlings (20 × 15 cm hills, two seedlings each) or 1,011,714 wheat plants (an illustrative 250 plants/m²). A GPU canopy mark represents each plant at acre distance, with up to 96 embedded GLB instances replacing marks. Model heights are illustrative 0.82 m rice / 1.12 m wheat, not variety measurements. The tubewell stands outside the planted boundary. Soil layers and the water table remain illustrative. No new textures are used.

**100 g** shows the representative plant cutaway and allocates quantities to 100 g of final dry food. View changes preserve the date and model history. Containers are magnified quantity illustrations, not objects at field scale.

Tap soil, groundwater, the field, tubewell, weather, cutaway or an input container for a short floating note with a connector to its subject. Notes pause playback, follow the camera, dismiss with Escape, and offer full details. English/Punjabi and theme preferences persist locally.

Straw remains the disclosed mulch baseline. Menu provides straw comparisons, crop-care ledgers, results, sources and preferences. This is an educational model; density, growth and asset proportions are not a measured field survey.

## Automatic updates

Hosted tabs check `version.json` on startup, every 60 seconds while visible, and when focus, visibility or connectivity returns. A new content revision reloads automatically after confirming that the deployed HTML carries the same revision. Version requests and reload URLs bypass caches; partial deployment, offline/error responses and stale navigation responses do not create rapid reload loops. Language, theme and quantity preferences persist. An older tab opened before this updater was added needs one refresh to enable future automatic updates.

`build.py` generates matching HTML metadata and `version.json` from a deterministic content hash. Publish both files together. The standalone `file://` build makes no update requests.

## Evidence

Defaults: Ludhiana rainfall normals, PR 126 transplanted rice, PBW 826 wheat, one acre, and equal 100 g dry-food portions. Rice means uncooked milled grain; wheat means dry grain. These are not equal cooked volumes or equal calories.

PAU publications and IMD 1991–2020 monthly normals provide source anchors. Growth timing, water parameters, synthetic rainy days, recharge delay and responses are teaching assumptions. The underground cutaway shows an illustrative storage bucket, not measured Punjab reserves or aquifer depth. Pumping and rainfall are separate quantities; the app does not calculate a total lifecycle water footprint. Punjabi copy awaits independent review.

See [evidence and gaps](docs/EVIDENCE_AND_GAPS.md), [simulation definitions](docs/SIMULATION.md), and [the implemented overhaul](docs/PRODUCT_AND_VISUALS.md).

## Development and verification

Edit `app/` and rebuild the standalone output:

```sh
python3 build.py
python3 validate_package.py
node tests/simulation.cjs
node tests/automatic-irrigation.cjs
node tests/continuous.cjs
node tests/residue.cjs
node tests/metrics.cjs
```

Browser checks use the Playwright CLI, with a local server running:

```sh
npx --yes --package @playwright/cli playwright-cli -s=acceptance open http://127.0.0.1:8080/ --config tests/playwright.config.json
python3 tests/run_browser.py
```

The browser runner defaults to `tests/journey.js`. Pass `live-flow.js`, `farmer-ui.js`, `ux-metrics.js`, `acre-view.js`, `guided-playback.js`, `accessibility.js`, `crop-first.js`, or `updates.js`, or `touch-ux.js` to check that flow. Screenshots and reports are written under ignored `output/playwright/`. The original brief and older specifications are historical context; current behavior is described in the documents below.

- [Build and run](docs/BUILD_AND_RUN.md)
- [Product and visual behavior](docs/PRODUCT_AND_VISUALS.md)
- [Farmer interface and straw model](docs/FARMER_UI_AND_RESIDUE.md)
- [Quantity definitions](docs/UX_AUDIT.md)
- [Overhaul plan](docs/REALISM_AND_UX_OVERHAUL_PLAN.md)
- [Acceptance results](docs/ACCEPTANCE_RESULTS.md)
