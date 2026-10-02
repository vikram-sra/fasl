# Punjab: A Bowl Across Two Seasons
Interactive crop game • researched 2 October 2026

A full-screen educational crop game for Punjab, linking rice and wheat through the same soil and groundwater. Built with a fixed Three.js side view, a mobile-first interface, seasonal rain, automatic irrigation, and month-labelled stages.

## Play

Open `index.html` in a modern browser. The application is standalone: all code, Three.js and model data are embedded, so no install or network is required.

For a local server:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Use the bottom stages to inspect growth, the side bottles for inputs, and the arrow to make a decision or continue. Rain, soil water, plant water use and delayed groundwater recharge follow the model. The pump operates automatically when needed and can be controlled manually.

See [Build and run](docs/BUILD_AND_RUN.md) for controls and maintenance, and [Acceptance results](docs/ACCEPTANCE_RESULTS.md) for verification.

## Development

Editable sources are in `app/`; the supplied datasets and references remain in `data/`. Rebuild and verify:

```sh
python3 build.py
python3 validate_package.py
node tests/simulation.cjs
node tests/automatic-irrigation.cjs
```

`tests/plot-first.js` and `tests/season-water.js` exercise the current UI through the Playwright CLI. The original project brief remains in `START_HERE.md`.

## Defaults chosen to make the build concrete
Ludhiana station rainfall; PR 126 transplanted rice; PBW 826 wheat; one underlying acre; display per 100 g uncooked milled rice or dry wheat grain. Field area stays fixed across the rotation. English UI with Punjabi crop labels. These are adjustable defaults, not additional user commitments.

## Contents
- START_HERE.md — complete Codex implementation prompt
- docs/PRODUCT_AND_VISUALS.md — interactions, scene and animation design
- docs/SIMULATION.md — deterministic state, water balance, bowl accounting and outcomes
- docs/EVIDENCE_AND_GAPS.md — verified evidence, model assumptions and limits
- docs/ACCEPTANCE.md — implementation checks
- data/*.json — structured crop, stage, input, weather and model data
- assets/references.json — official image references and reuse status
- validate_package.py — data integrity and unit-accounting checks

Run `python3 validate_package.py` from this folder to check the package.

## Evidence status
PAU Kharif 2026 and Rabi 2025–26 were retrieved directly. IMD 1991–2020 Ludhiana monthly normals are included. Every intermediate stage boundary, yield-response coefficient and aquifer parameter that is not measured is explicitly a game assumption. This is an educational model, not calibrated agronomic decision support.

Original publications/photos are linked rather than redistributed. No external image download is required to build the game; draw original botanical SVG/Canvas assets from the visual brief.

## Confirmed unit toggle
Provide a prominent **Per bowl ↔ 1 acre** toggle in the main scene. Both modes show the same simulation. Switch all water, product and harvest quantities together; preserve crop progress and aquifer history. Acre mode shows kg/quintals and fertilizer bag equivalents; bowl mode shows allocated grams/millilitres/litres per 100 g dry food. The field-detail drawer is supplementary, not a substitute for this toggle.
