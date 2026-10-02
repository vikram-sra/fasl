# Farmer interface and residue simulation

The field remains a single, front-facing Three.js scene. The only new management choice is at rice harvest (timeline position 121): burn straw or retain it as mulch. Seeking into wheat asks for the choice first. Escape dismisses the dialog but leaves playback at the boundary; replaying asks again. Changing strategy recomputes downstream history using identical rain and automatic care. Rewinding never applies inputs twice.

## Readability and access

Primary controls use bold labels and generous touch areas. Month labels thin out on phones. Pump totals and soil condition are small overlays; details stay in drawers. English/Punjabi and System/Light/Dark preferences persist locally. Punjabi labels are a first translation and have not received independent agronomist review. Source titles and product identifiers remain in their original language. Reduced motion preserves all calculations and stops decorative motion; theme changes still redraw.

## Evidence and assumptions

`data/model_assumptions.json` contains the residue demonstration parameters: 3,000 kg straw/acre, 0.6% straw nitrogen, 90% residue-N loss on burning, exponential decay with a 180-day time constant, and a starting 12% reduction of modeled combined ET under retained residue, diminishing with cover. These are explicitly uncalibrated illustrative parameters, not values inferred from the cited experiment. This compact model does not distinguish transpiration and soil evaporation, so the ET factor approximates the moisture-conservation pathway. Water conservation still holds.

Fertilizer nitrogen is calculated from product mass and the package composition fractions (urea 46%, DAP 18%). Applied N is not available soil N. Residue N returned is informational; it is not immediately credited toward crop-available nitrogen or yield. No SOC stock or lab-measured health score is invented. Soil status reports the management trend: baseline, improving under retention, declining under burning. There is no fixed wheat yield penalty or bonus. Automatic care may produce equal yields with different pumping totals.

The soil drawer analyzes published surface SOC values: 5.15 g/kg under Happy Seeder retention versus 4.61 under conventional tillage; difference 0.54 g/kg, 11.7% relative. This is a study comparison, not a burn comparison or a forecast of one-season change. See source `RESIDUE_SOIL_2025`. Source `RESIDUE_WHEAT_2024` reports that residue methods did not significantly affect several growth measurements, supporting the absence of an arbitrary burn yield penalty.

## Animation and performance

One mature geometry per crop continues to morph continuously. Instanced straw, flames, smoke and fertilizer add only a few draw calls. Fertilizer travel is driven by the sampled day fraction and starts at the visible bottle location. Fire is active during positions 121–125, followed by ash; mulch remains through wheat and gradually decays. Wind, rain and flowing water continue while the timeline is paused. A sustained slow-frame detector lowers pixel ratio to 1. Hidden documents skip rendering.

## Verification

Run `node tests/simulation.cjs`, `node tests/automatic-irrigation.cjs`, `node tests/continuous.cjs`, `node tests/residue.cjs`, and the Playwright CLI flows `tests/live-flow.js` and `tests/farmer-ui.js`. Regenerate the standalone page with `python3 build.py` after source changes.
