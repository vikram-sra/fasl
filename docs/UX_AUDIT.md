# UX audit · centered crop and live units

## Fixes

- Centered the crop base, seed and root system horizontally; uptake particles follow the same center. The enlarged botanical view represents the acre rather than drawing hundreds of thousands of plants.
- Added a persistent Per bowl / 1 acre selector beside the stage heading. Acre is the initial farmer-facing default. Changing units does not advance time or change water, weather, residue choice or crop state.
- Integrated three compact values into the timeline: estimated standing plants, cumulative crop pumping and dry grain forming/harvested. Tapping them opens the remaining metrics, including estimated shoots, rainfall, ET and projected final output.
- Removed the duplicate pump overlay, wrapped weather naturally below the date, widened short-phone fertilizer labels and adjusted the smallest-phone framing so groundwater stays above the timeline.
- Application quantities in input drawers now interpolate partial doses within a day. Product units stay separate: mass converts from kg to g for a bowl, while liquid formulation stays mL.

## Quantity definitions

`app/metrics.js` samples existing simulation and timeline state without mutating either. Bowl share is 0.1 kg divided by the active crop's final modeled edible dry harvest; keeping that denominator fixed within a scenario avoids changing historic allocations while scrubbing. All extensive values use this field share. Percentages, rainfall depth and research observations keep their scale. Soil and water-balance drawers label their whole-rotation allocation separately from active-crop metrics.

Rice population target is derived from PAU flat-puddled transplant spacing of 20×15 cm with two seedlings per hill (2026 package, PDF page 15). Wheat density of 250 plants/m², emergence curves, shoots per plant, no mortality and grain accumulation are illustrative presentation assumptions recorded in `data/model_assumptions.json`. Nursery plants represent the seedlings destined for the acre; the nursery area remains 160m² in the water model. Standing counts rise during emergence and fall through harvest; tillering increases shoots separately. Fallow shows zero standing plants and the harvested rice output. These counts are estimates, not measured populations.

## Acceptance

- `tests/metrics.cjs`: both crop/strategy allocations, product units, emergence, stable plant count during tillering, increasing shoots, harvest removal, grain accumulation, reversible sampling and final 100g bowl.
- `tests/ux-metrics.js`: 19 browser checks covering unit preservation, partial-input drawer labels, crop centering, controls and groundwater separation at 390×844, 390×667, 320×568 and 1440×1000, wheat metrics, harvest and preference persistence.
- Existing water-model, continuous-timeline, residue, live-flow and bilingual/theme checks remain part of regression validation.
