# Acceptance checklist for Codex

## Experience
- Only one crop scene is visible; rice and wheat look botanically distinct at all ten stages.
- Main-view Per bowl / 1 acre toggle switches every quantity and harvest display consistently, preserves unit labels, and makes zero changes to the event ledger or aquifer.
- Vertical stage navigation works by mouse, touch and keyboard; active, preview and replay states are distinct.
- Pump pipe visibly connects aquifer and field. Motor/flow only animate for an actual pumping event.
- Rain wets soil, may pond/run off, and causes delayed recharge; pause and reduced motion preserve all accounting.
- All three input containers work; no g+mL total, no pesticide-in-food animation, and no mandatory spray to advance.
- Harvest rice includes milling; wheat is grain. Bowl amount and field yield agree; zero harvest renders safely.
- Phone viewport at 390 px and desktop at 1440 px have readable controls, no overlap and no sideways document scrolling.

## Determinism and accounting
- Identical seed/actions -> identical daily weather, input ledger, yield and final water stocks.
- Monthly generated rainfall matches included monthly value × multiplier within 1e-9 before display rounding.
- Stage previews/replays, repeated tab switches and unit switches generate no water/input events.
- Editing rice decisions recomputes downstream wheat and fallow history; no duplicated recharge or fertilizer applications.
- Reload and export/import restore the run; derived totals are recomputed and malicious/nonfinite imported values rejected.
- Daily conservation equation in SIMULATION.md closes to numerical tolerance, including pending recharge and capped-storage overflow.
- Nursery rain covers only the nursery subplot as crop rain; remainder is fallow. Combined zonal rain equals full-acre rainfall.
- Irrigation cannot withdraw more groundwater than remains. Surface runoff is not also counted as recharge.
- A product application to 25% of the field uses 25% of a full-acre product and carrier amount.
- A skipped input records a decision but zero applied quantity. A zero-pressure season can finish with zero pest-control use.
- Wheat rain delay changes timing without repeating a fertilizer event. Irrigation at a later date does not add a second dose already applied at its deadline.
- 1 mm/acre = 4046.8564224 L; 1 quintal = 100 kg; no hectare/acre interchange.
- Test numerical fixtures in SIMULATION.md and the zero-yield case. Totals stay full precision internally.

## Evidence
- Sources drawer resolves every source ID and distinguishes facts, calculations and assumptions.
- Stage-day ranges and modelled yield/aquifer outputs are visibly approximate.
- Rain baseline explicitly names station and period; source annual vs rounded-month discrepancy is retained.
- Chemical examples retain formulation and condition; no broad pest cure or generic dose inferred.
- Original official graphics remain reference-only unless their license permits the intended use.

Stop optional testing once these risks are covered. Report failures or remaining limitations plainly.
