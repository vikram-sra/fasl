# UX audit and quantity definitions · October 2026

The revised experience prioritizes visible crops and a continuous underground cutaway. A short stage title, compact control dock and tap-to-open details replace the narrative strip and large harvest cards. Input objects return to the scene, showing cumulative applied quantities.

Field / 100 g coordinates crop framing, allocated amounts and object sizes. Field uses 96 background clumps with detailed foreground plants. The 100 g presentation uses one large representative plant and smaller quantity containers. These are magnified illustrations with separate capacities; glyph size is not a common physical scale. Fill is proportional to the cumulative quantity within the active capacity. Water, fertilizer and treatment units are kept distinct. No presentation control changes time, model history or management scenario.

Menu discloses the retained-straw baseline and provides optional straw comparison, care, results and sources. Wheat navigation has no mandatory choice. Soil, roots, groundwater and connected bore piping remain visible across states and responsive sizes. Between seasons the camera frames residue-covered ground more closely. The harvest reference occupies less than 4% of the phone scene. Enlarged text can scroll rather than clipping controls.

## Quantity definitions

`app/metrics.js` samples simulation and timeline state without mutating them. Bowl share is 0.1 kg divided by the active crop's final modeled edible dry harvest; this denominator stays fixed within a scenario while scrubbing. All extensive values use that field share. Percentages, rainfall depth and research observations retain their scale. Soil/water drawers explicitly label whole-rotation allocation separately from active-crop metrics.

The main pumping quantity is **this crop's** gross underground withdrawal. Rain is separate. Results are season-end projections before the endpoint, and modeled final outputs after the endpoint. Per-bowl pumping is an allocation to equal dry food mass, not cooked volume, calories or a lifecycle water footprint.

Product application amounts interpolate partial doses within a day. Solid formulations convert kg to g in bowl mode; liquid formulations remain mL. Product mass and nitrogen content remain separate. No soil-health score, immediate SOC gain or arbitrary burn yield penalty is added.

Rice population uses PAU's 20×15 cm transplant spacing and two seedlings per hill (2026 package, PDF page 15). Wheat density of 250 plants/m², emergence, shoots per plant, no mortality and grain accumulation are presentation assumptions in `data/model_assumptions.json`. Nursery plants represent seedlings destined for the acre; the water model retains the 160 m² nursery. Standing plants rise during emergence and disappear with harvest; shoots rise separately during tillering. These are estimates, not measured populations.

## Checks

Pure metric tests cover crop/strategy allocations, product units, emergence, tillering, shoots, removal at harvest, reversible sampling and final 100 g output. Browser flows cover coordinated quantities/camera, quantitative object fills, scene coverage, current-date choice changes, translated controls, paused motion, ledger sampling, short-screen scrolling, responsive endings and WebGL fallback. Palette and focus checks are targeted checks, not a full accessibility certification.

Actual layperson comprehension, native Punjabi copy review, screen-reader testing and named-phone performance remain to be validated with people/devices. See `ACCEPTANCE_RESULTS.md` for the executed checks and their limits.
