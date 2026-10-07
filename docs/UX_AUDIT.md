# UX audit and quantity definitions · October 2026

The overhaul replaces automatic entry with a paused invitation, guided story and free exploration. Everyday stage headings and cause/effect captions orient non-farmers. The main values are crop pumping and forming/harvested dry grain; estimated plants and shoots remain in details. Three side bottles have been replaced with a crop-care sheet and product ledgers.

Camera view and quantity basis are independent. Field shows 120 representative clumps; Plant close-up shows enlarged botanical geometry. Whole field refers to one acre; Per 100 g dry food allocates the same scenario's quantities. Neither control changes time, weather, model history or management path. The groundwater annotation says illustrative; the section is labeled not to scale. Exact model storage percentage appears in evidence details.

Mulch is the disclosed baseline. Wheat navigation has no mandatory decision dialog. Optional straw comparison explains both season-end scenarios using identical weather and care. Harvest now has processing/bowl presentation and a final comparison. Short screens scroll to keep controls usable; the final narrative and bowl participate in layout instead of overlapping.

## Quantity definitions

`app/metrics.js` samples simulation and timeline state without mutating them. Bowl share is 0.1 kg divided by the active crop's final modeled edible dry harvest; this denominator stays fixed within a scenario while scrubbing. All extensive values use that field share. Percentages, rainfall depth and research observations retain their scale. Soil/water drawers explicitly label whole-rotation allocation separately from active-crop metrics.

The main pumping quantity is **this crop's** gross underground withdrawal. Rain is separate. Results are season-end projections before the endpoint, and modeled final outputs after the endpoint. Per-bowl pumping is an allocation to equal dry food mass, not cooked volume, calories or a lifecycle water footprint.

Product application amounts interpolate partial doses within a day. Solid formulations convert kg to g in bowl mode; liquid formulations remain mL. Product mass and nitrogen content remain separate. No soil-health score, immediate SOC gain or arbitrary burn yield penalty is added.

Rice population uses PAU's 20×15 cm transplant spacing and two seedlings per hill (2026 package, PDF page 15). Wheat density of 250 plants/m², emergence, shoots per plant, no mortality and grain accumulation are presentation assumptions in `data/model_assumptions.json`. Nursery plants represent seedlings destined for the acre; the water model retains the 160 m² nursery. Standing plants rise during emergence and disappear with harvest; shoots rise separately during tillering. These are estimates, not measured populations.

## Checks

Pure metric tests cover crop/strategy allocations, product units, emergence, tillering, shoots, removal at harvest, reversible sampling and final 100 g output. Browser flows cover independent camera/units, current-date choice changes, translated controls, paused motion, ledger sampling, short-screen scrolling, responsive endings and WebGL fallback. Palette and focus checks are targeted checks, not a full accessibility certification.

Actual layperson comprehension, native Punjabi copy review, screen-reader testing and named-phone performance remain to be validated with people/devices. See `ACCEPTANCE_RESULTS.md` for the executed checks and their limits.
