# Application acceptance results

The shipped application is `index.html`. The revised visual brief is implemented as a full-viewport, phone-first Three.js experience with a fixed camera, one botanical crop, a flat lateral soil/aquifer view, compact main controls and expandable detail sheets.

## Verified

- Package integrity validator: passed. Supplied dataset entries and source IDs remain unchanged.
- `node tests/simulation.cjs`: **13 acceptance groups passed**. Coverage includes complete-rotation determinism; monthly rainfall totals within 1e-9; daily/whole-model conservation; nursery/fallow area partition; event deduplication; aquifer exhaustion and overflow; quarter-field formulation/carrier scaling; skipped inputs; urea deadlines without duplicate doses; downstream branch recalculation; dry-food numerical fixtures and zero output; UTC anchors; invalid-import rejection.
- Playwright browser flow: **22 checks passed**, including a complete rice/fallow/wheat game through the visible controls in 145 interactions. Source is `tests/browser-flow.js`; output is `output/playwright/browser-results.txt`.
- The browser flow verified direct `file://` loading, Three.js r182 rendering, a fixed camera, unchanged ledger under units/scene/preview navigation, both harvests with no compulsory pesticide use, local reload, JSON export/import, malformed-input handling, editable dated snapshots, retained originals, changed downstream harvest, evidence labels, keyboard navigation and reduced-motion accounting.
- At 390 × 844 and 1440 × 1000: the document fills the viewport without horizontal or vertical document scrolling, and the canvas fills the viewport beneath compact overlays. Drawer content scrolls separately.
- An additional visual check covers 390 × 667: the horizontal stage strip keeps all ten stages visible while controls fit the viewport. Output: `output/playwright/visual-results.txt`.
- The tested rotation's maximum absolute daily conservation error was **1.99e-9 L**. This is numerical closure, not evidence that the physical model is calibrated.
- Sample ripe-rice rendering uses **21 draw calls** after geometry merging and grain instancing. Idle scenes render on changes, rather than continually. Event effects vary the count.
- No JavaScript errors occurred during the complete browser flow.

## Visual evidence

- `output/playwright/phone-rice.png`: one ripening rice clump and its roots.
- `output/playwright/phone-wheat.png`: distinct compact wheat ears.
- `output/playwright/phone-short.png`: short-phone layout.
- `output/playwright/desktop-3d.png`: desktop composition.

The checked phone layouts are browser viewport emulations, not performance measurements on physical phones. WebGL2 availability and browser local-file support vary; local HTTP preview is supported. A browser fullscreen request is optional and subject to browser support.

## Remaining limits

Hydrology, recharge, intermediate stage timing, daily ET, yield response, pest/weed pressure and efficacy remain labelled teaching assumptions. The game makes no real water-table, field-yield or food-residue prediction. Current legal registration and resistance are not verified; chemical controls use clearly attributed source-edition examples within the simulation. Nursery manure, seed-treatment inventory, labour costs and a full lifecycle inventory are excluded. The 3D sculpture is original procedural botanical art with schematic soil depth and root dimensions. Full reviewed Punjabi localisation and field calibration remain future work.

Nothing was published or deployed.

## Lateral view and automatic controller revision

`tests/automatic-irrigation.cjs` verifies moisture-triggered pumping, rain suppression, unsown crops, nursery area, late-rice cutoff, fallow, conservation, aquifer caps and repeatability. The controller uses separately labelled illustrative assumptions. It records daily auto decisions without rewriting previous manual decisions. The full browser flow completes the rotation without manual irrigation and verifies automatic pumping events.

`tests/lateral-flow.js` checks recorded rain animation, pumping through the visible pipe, moving groundwater, disabling future automation, and bottom horizontal stages at 390 × 844, 390 × 667 and 1440 × 1000. Latest results are in `output/playwright/lateral-results.txt`; screenshots use `lateral-*.png`.

## Plot-first interface revision

The persistent bottom card is hidden from both layout and accessibility. Side bottles expose product sheets; one floating arrow advances the simulation and opens temporary checkpoint choices. Quantities, display units and harvest remain in the menu. `tests/plot-first.js` exercises a full rotation through this revised interface and checks viewport layouts at 390 × 844, 390 × 667 and 1440 × 1000. Earlier flow reports above apply to earlier interfaces.

## Soil, seasonal months and water-path revision

The soil occupies roughly half the full screen, with narrower root spread and a deeper groundwater section. `tests/season-water.js` verifies recorded rain with clouds, crop water-use particles, pump totals, arriving recharge that increases groundwater, and rice June–October / wheat November–April labels. Results: `output/playwright/season-water-results.txt`. The 13 core simulation groups and automatic-irrigation tests continue to pass; hydrology quantities and monthly rain totals are unchanged. Daily infiltration, crop ET and queued recharge are exposed for rendering without changing stocks or the seven-day lag.
