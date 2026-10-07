# A Bowl Across Two Seasons

**One field. Two harvests.** Follow a Punjab field from rice and wheat seed to dry food, and see where its water comes from.

Play the published version at [vikram-sra.github.io/fasl](https://vikram-sra.github.io/fasl/). Local changes appear there after publication. Open `index.html` in a modern browser for the current standalone build; code, Three.js and datasets are embedded, with no runtime download required.

For a local preview:

```sh
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Experience

The first visit starts paused. **Start** follows the rice → straw → wheat rotation in about 80 seconds, with harvest/processing/bowl reveals. **Explore** provides a paused timeline, crop navigation and chapter skips. All crop care is automatic.

Straw is retained as the baseline disclosed in Menu. **Menu → Compare straw choices** shows season-end projections for retaining or burning straw using identical rain and care. You can watch either path or change it at the current date. Wheat navigation works immediately; it does not require a management decision.

**Field / 100 g** coordinates the crop view and quantities. Field shows 96 varied clumps with detailed foreground plants; 100 g shows a large representative plant. Both retain the underground cutaway and preserve date and model history. Container sizes and fills change together: water, fertilizer, weed care and pest care show cumulative allocated quantities. Their capacities differ between modes, and small allocations are magnified illustrations, not a common physical scale.

The scene occupies about 79% of a 390×844 viewport. One short stage title replaces the narrative strip, while a compact dock holds quantities and playback. Roots, soil horizons, saturated ground and a motor/pump assembly with connected bore piping stay visible. The camera moves closer to seedlings and the residue-covered surface between seasons. A small harvest reference opens results on tap.

Tap an input object for its product ledger or water details; tap the main metrics for population, shoots and grain definitions. Menu contains automatic-care information, straw comparisons, results, sources and preferences. Pause freezes time and event motion. Reduced motion retains static flow cues. English/Punjabi and theme preferences persist locally.

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

The browser runner defaults to `tests/journey.js`. Pass `live-flow.js`, `farmer-ui.js`, `ux-metrics.js`, `acre-view.js`, `guided-playback.js`, `accessibility.js`, or `crop-first.js` to check that flow. Screenshots and reports are written under ignored `output/playwright/`. The original brief and older specifications are historical context; current behavior is described in the documents below.

- [Build and run](docs/BUILD_AND_RUN.md)
- [Product and visual behavior](docs/PRODUCT_AND_VISUALS.md)
- [Farmer interface and straw model](docs/FARMER_UI_AND_RESIDUE.md)
- [Quantity definitions](docs/UX_AUDIT.md)
- [Overhaul plan](docs/REALISM_AND_UX_OVERHAUL_PLAN.md)
- [Acceptance results](docs/ACCEPTANCE_RESULTS.md)
