# Run the application

Open `index.html` in Chrome, Safari, Firefox or Edge. The file contains the game, Three.js, original procedural crop art and all package data. No install, account, build step or network connection is needed to play. WebGL2 is needed for the field scene; a readable fallback keeps decisions available if WebGL cannot start.

The application fills the browser viewport. The camera is fixed, with one crop visible. The menu includes a browser full-screen option where supported. Sound starts muted. Motion follows the system preference and can be changed in the menu.

For a phone on the same Wi-Fi as this computer, run the following from this folder:

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://YOUR_COMPUTER_LAN_IP:8080` in the phone browser. Stop the local server with Ctrl+C. This is a local preview, not a published deployment. Alternatively, transfer the standalone HTML file and open it in a browser that permits local HTML.

## Play

- Plant the seed and make a choice at each checkpoint. Fertilizer and chemical use can be skipped.
- The floating pump controller runs automatically when soil water requires it, after accounting for rainfall. Settings opens manual depth and wait overrides. Pest control opens Inspect. Continue advances to an observation, recorded rain/pump/recharge event or decision. Play pauses at unresolved choices.
- Rice is followed by a chronological fallow interval and wheat. Soil, recharge and groundwater persist.
- The bottom horizontal stage strip previews future artwork or shows past snapshots. Arrow Left/Right navigates stages. Return to live resumes the actual run.
- Per bowl / 1 acre changes all displayed water, commercial product and food amounts together. A bowl means **100 g dry food**, not a cooked serving. Detailed flows and product bag equivalents are in Field details.
- Menu → Dated decisions & replay lets you revise any historical checkpoint. The original run is retained for comparison; later states are rebuilt. Up to six earlier runs are kept locally; export important runs before making many revisions.
- Export game JSON saves the seed, assumptions, decisions, event ledger and snapshots. Import validates the format and recomputes derived values. Reset explicitly replaces both seasons and their shared stocks.

## Maintain and verify

Editable source is in `app/`. `data/` retains the supplied dataset and source IDs. After source edits:

```sh
python3 build.py
python3 validate_package.py
node tests/simulation.cjs
```

Three.js r182 is bundled in `app/vendor/three.bundle.js` and embedded by the assembler. Its MIT license is in `app/vendor/THREE-LICENSE.txt`; no CDN or runtime package installation is used. Static meshes are merged and repeated grains use instancing. The idle field does not render continuously. Drawing dimensions, root lengths and water levels are schematic.

Browser verification uses the Playwright CLI, not an application dependency:

```sh
npx --yes --package @playwright/cli playwright-cli -s=acceptance open "file://ABSOLUTE_PATH_TO/index.html" --config tests/playwright.config.json
python3 tests/run_browser.py
```

The browser test currently uses this workspace's absolute file URL; change it in `tests/browser-flow.js` if you move the package. The configured file access supports testing the standalone file. Screenshots and test output are saved under `output/`.

## Scientific boundaries

This is an educational, illustrative model. The aquifer is a finite teaching bucket, not a local water-table estimate. Daily ET, recharge coefficients/lag, event timing, intermediate phenology, pressure/efficacy and yield-response coefficients are game assumptions. Monthly rain is the supplied IMD 1991–2020 Ludhiana station normal; synthetic event dates are not a forecast. The source annual 791.1 mm and rounded-month total 791.3 mm are both preserved.

The model uses a separate nursery establishment penalty and configurable latest first-nitrogen checkpoint for wheat. These additional timing/response choices are named in the configuration and labelled as assumptions. Product examples preserve source editions, formulation units, carrier water and treatment conditions. Current registration, labels and resistance must be verified before real-world guidance. Applied fertilizer or pesticides are not dietary residue measurements. Nursery manure, labour economics, heat stress, leaching and actual disease prediction are unmodelled.

Rice harvest separates paddy and total milled rice, using a chosen 0.67 recovery inside IRRI's generic range. Wheat output is dry grain. No credits are assigned to straw or husk. Further calibration and reviewed Punjabi localisation remain future work.

The scene uses a fixed frontal Three.js camera and flat soil/water planes spanning the screen. Groundwater height maps illustrative bucket storage, not measured water-table depth. Rain and water flowing through the pipe animate only for recorded events; reduced motion uses static levels. The automatic irrigation thresholds are explicitly labelled game assumptions in Sources & assumptions; they are not field guidance. Auto control changes future days, while manual choices override the current day.

Additional automatic-pump checks: `node tests/automatic-irrigation.cjs`.

## Plot-first interface

The persistent bottom information card has been removed. The main view contains the full-screen crop/soil/water scene, horizontal bottom stages, small side bottles, pump controls and one arrow to continue. Tap the arrow to respond to a pending decision in a temporary sheet. Quantities, units and harvest details are available through the menu. The camera gives the crop more vertical space, including on shorter phones.

Current UI acceptance: `tests/plot-first.js`, results in `output/playwright/plot-first-results.txt`. Older browser flows document earlier UI versions.

The soil begins near the middle of the viewport, with a thicker section between the crop and groundwater. Month groups above the bottom stages follow the configured dates: rice nursery sowing in June, transplanting in July, harvest in October; wheat November–April. A small counter beside the pump shows cumulative litres for the current crop on the model acre. Rainy events show drifting clouds and falling rain. Water particles show actual daily infiltration, crop evapotranspiration, queued drainage and arriving recharge; the groundwater level remains tied to storage. The seven-day recharge lag is preserved. Monthly average rain amounts come from the supplied IMD dataset, while individual rainy dates are deterministic synthetic timing.
