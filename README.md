# A Bowl Across Two Seasons

**One field. Two harvests.** Follow a Punjab field from rice and wheat seed to dry food, and see where its water comes from.

Play the published version at [vikram-sra.github.io/fasl](https://vikram-sra.github.io/fasl/). Local changes appear there after publication. Open `index.html` in a modern browser for the current standalone build; code, Three.js and datasets are embedded, with no runtime download required.

For a local preview:

```sh
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Experience

The first visit shows a plant preview and two choices: **Play story** (about 80 seconds, nine chapters, each with its own view and one line of copy) or **Explore**. Touching any view, the timeline or a sheet pauses the story and offers **Resume story**.

**Views** change where you look; date, crop and straw choice are shared by all of them:

- **Field**: a real 3D paddy or wheat field in perspective, with flood water, soil, straw mulch, ash and fire on the burn path, rain, haze and a distant windbreak. Drag to orbit, scroll or pinch to zoom.
- **Plant**: a close-up of one plant standing on open soil with the field behind it, and a label on its grain head.
- **Underground**: the sectional cutaway of roots, soil horizons, the tubewell and groundwater (illustrative, not to scale).
- **Ledger**: cumulative water and inputs, in a bottom sheet on phones and a side panel on wide screens. Unlike units are never added together.

**Acre / 100 g** changes only the quantity basis everywhere; it never moves the camera. The timeline shows season bands (rice, between seasons, wheat) and event markers for sowing, irrigation, rain, fertilizer, weed and pest care, harvest and straw handling; tapping a marker jumps to it and opens its details. Arrow keys step a day, PageUp/PageDown a chapter, Home/End the season.

Details open in the sheet: crop care, sources, straw comparison, results and settings. Pause freezes time and event motion. Reduced motion removes camera easing and ambient motion. English/Punjabi (with an embedded Gurmukhi font) and theme preferences persist locally.

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
python3 tests/run_browser.py ui-overhaul.js
python3 tests/run_browser.py updates.js
```

`ui-overhaul.js` covers layout at four viewports, the view and unit controls, sheet focus handling, the ledger, timeline markers, the story and Punjabi. The earlier flows are kept in `tests/legacy/` for reference; they target the previous interface and no longer run.

Source layout: `app/css/` (tokens, layout, components), `app/state.js` (helpers and store), `app/story.js` (chapters), `app/details.js` (sheet content), `app/ui.js` (rendering and controls), `app/application.js` (playback and frame loop), `app/scene3d.js` (renderer). Texture and model pipelines are in `assets/src/`.

- [Build and run](docs/BUILD_AND_RUN.md)
- [Product and visual behavior](docs/PRODUCT_AND_VISUALS.md)
- [Farmer interface and straw model](docs/FARMER_UI_AND_RESIDUE.md)
- [Quantity definitions](docs/UX_AUDIT.md)
- [Overhaul plan](docs/REALISM_AND_UX_OVERHAUL_PLAN.md)
- [Realism plan](docs/HYPERREALISM_PLAN.md)
- [Experience and UI overhaul](docs/EXPERIENCE_AND_UI_OVERHAUL_PLAN.md)
- [Acceptance results](docs/ACCEPTANCE_RESULTS.md)
