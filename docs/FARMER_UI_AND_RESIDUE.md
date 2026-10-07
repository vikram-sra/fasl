# Farmer interface and residue simulation

The current interface starts paused and offers a guided story or free exploration. A retained-straw baseline is disclosed in Menu. Crop navigation and scrubbing do not require a straw decision. The optional comparison sheet shows both season-end paths with identical weather and automatic care; users can watch a path from rice harvest or change it at their current date. Rewinding never applies inputs twice.

## Readability and access

A short stage title supports the dominant crop and underground scene. Water, fertilizer, weed-care and pest-care objects show cumulative quantities and open their detailed ledgers. Field / 100 g changes crop framing, quantities and illustrated container sizes together. Separate capacities keep small allocations visible; these sizes are not a common physical scale. A small harvest reference replaces the large bowl/story cards. Enlarged text and short screens can scroll.

English/Punjabi and theme preferences persist locally. Punjabi labels remain a first translation awaiting independent review. Source titles and product identifiers stay in their original language. Pause freezes date and event motion. Reduced motion retains calculations and static flow cues, and theme/resize/scenario changes redraw a paused field.

## Evidence and assumptions

`data/model_assumptions.json` contains the residue demonstration parameters: 3,000 kg straw/acre, 0.6% straw nitrogen, 90% residue-N loss on burning, exponential decay with a 180-day time constant, and a starting 12% reduction of modeled combined ET under retained residue, diminishing with cover. These are explicitly uncalibrated illustrative parameters, not values inferred from the cited experiment. This compact model does not distinguish transpiration and soil evaporation, so the ET factor approximates the moisture-conservation pathway. Water conservation still holds.

Fertilizer nitrogen is calculated from product mass and the package composition fractions (urea 46%, DAP 18%). Applied N is not available soil N. Residue N returned is informational; it is not immediately credited toward crop-available nitrogen or yield. No SOC stock or lab-measured health score is invented. Soil status reports the management trend: baseline, improving under retention, declining under burning. There is no fixed wheat yield penalty or bonus. Automatic care may produce equal yields with different pumping totals.

The soil drawer analyzes published surface SOC values: 5.15 g/kg under Happy Seeder retention versus 4.61 under conventional tillage; difference 0.54 g/kg, 11.7% relative. This is a study comparison, not a burn comparison or a forecast of one-season change. See source `RESIDUE_SOIL_2025`. Source `RESIDUE_WHEAT_2024` reports that residue methods did not significantly affect several growth measurements, supporting the absence of an arbitrary burn yield penalty.

## Animation and performance

The detailed plant is continuously deformed; the field uses 96 inexpensive instanced clumps plus detailed foreground plants with varied curved leaves and crop-specific ears/panicles. Straw, flames, smoke and fertilizer particles retain bounded instance counts. Fire is active during positions 121–125, followed by ash; mulch persists through wheat and gradually decays. Model timing and accounting are unchanged.

Fertilizer cues descend toward the field on the sampled application day. Soil texture and mineral flecks are original, generated offline. The groundwater display is explicitly illustrative. Pause stops recurring renders once any camera transition has settled. A sustained slow-frame detector lowers pixel ratio to 1; hidden documents freeze rendering and playback. The full guided journey retains processing holds and a dry-food bowl without modifying the reducer.

## Verification

Run `node tests/simulation.cjs`, `node tests/automatic-irrigation.cjs`, `node tests/continuous.cjs`, `node tests/residue.cjs`, and the Playwright CLI flow `tests/crop-first.js` along with `tests/journey.js`, `tests/guided-playback.js`, `tests/live-flow.js`, `tests/farmer-ui.js`, `tests/ux-metrics.js`, `tests/acre-view.js`, and `tests/accessibility.js`. Regenerate the standalone page with `python3 build.py` after source changes.
