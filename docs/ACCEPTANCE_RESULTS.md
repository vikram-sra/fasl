# Acre scene and label release — 2026-10-07

Verified with the local Chromium browser through the Playwright CLI:

- `seed-acre-labels.js`: home choices, paused seed, slow sowing, automatic playback, exact acre footprint, rice/wheat plant populations, metre heights, outside tubewell, perspective camera, plus/minus zoom bounds, adjacent Play/Field controls, all scene/input notes, visible tethers, keyboard dismissal, camera tracking, viewport fit and offline embedded GLB parsing.
- `touch-ux.js`: crop and seed hit targets at 320, 390 and 768 px widths; wheat season entry and playback target size.
- `accessibility.js`: focus, modal dismissal, touch targets, UI palette contrast, enlarged text and WebGL fallback.
- `updates.js`: 18 checks of version detection, validated reload, offline recovery, partial publication, preferences and loop guards.

Pure model verification: package/source validation plus simulation, automatic irrigation, continuous interpolation, residue and metrics suites passed. These changes do not alter the simulation reducer or agronomic assumptions.

Visual inspection used generated phone screenshots of the home, seed, rice field, wheat field and tethered soil note. Screenshots and raw CLI reports are local artifacts in `output/playwright/`.

Limitations: this is an educational, stylized scene. Plant marks simplify geometry at acre distance. Wheat density and crop heights are illustrative. Soil layers and groundwater depth are not field measurements. No physical-device performance or full WCAG audit is claimed.
