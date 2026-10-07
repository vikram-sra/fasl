# A Bowl Across Two Seasons

**One field. Two harvests.** Follow a Punjab field from rice and wheat seed to dry food, and see where its water comes from.

Play the published version at [vikram-sra.github.io/fasl](https://vikram-sra.github.io/fasl/). Local changes appear there after publication. Open `index.html` in a modern browser for the current standalone build; code, Three.js and datasets are embedded, with no runtime download required.

For a local preview:

```sh
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Experience

The first visit starts paused. **Start the story** follows the rice → straw → wheat rotation in about 80 seconds, with harvest/processing/bowl reveals. **Explore freely** provides a paused timeline, crop navigation and chapter skips. All crop care is automatic.

Straw is retained as the visibly disclosed baseline. **Compare straw choices** shows season-end projections for retaining or burning straw using identical rain and care. You can watch either path or change it at the current date. Wheat navigation works immediately; it does not require a management decision.

**Field / Plant close-up** changes the camera independently of **Whole field / Per 100 g dry food**, which changes quantities. The field contains 120 representative crop clumps; the detailed plant and roots are enlarged. View and unit changes preserve model history and the displayed date.

The primary amounts are crop pumping and forming/harvested edible dry grain. Tap them for estimated plants, shoots, rainfall and water details. Crop-care details show product ledgers. Pause freezes the date and event motion. Reduced motion retains all facts; short screens can scroll to keep controls readable. English/Punjabi and theme preferences persist locally.

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

The browser runner defaults to `tests/journey.js`. Pass `live-flow.js`, `farmer-ui.js`, `ux-metrics.js`, `acre-view.js`, `guided-playback.js`, or `accessibility.js` to check that flow. Screenshots and reports are written under ignored `output/playwright/`. The original brief and older specifications are historical context; current behavior is described in the documents below.

- [Build and run](docs/BUILD_AND_RUN.md)
- [Product and visual behavior](docs/PRODUCT_AND_VISUALS.md)
- [Farmer interface and straw model](docs/FARMER_UI_AND_RESIDUE.md)
- [Quantity definitions](docs/UX_AUDIT.md)
- [Overhaul plan](docs/REALISM_AND_UX_OVERHAUL_PLAN.md)
- [Acceptance results](docs/ACCEPTANCE_RESULTS.md)
