# Product and visual specification

## Art direction
A quiet, tactile agricultural diorama: warm cream sky, deep green rice, straw-gold wheat, layered ochre soil, muted blue groundwater. Clean editorial typography, broad negative space, botanical silhouettes with enough detail to distinguish branched rice panicles from compact wheat ears. A grain bowl is the emotional endpoint. Avoid generic farm clipart, emoji plants, neon gradients or a dense analytics dashboard.

Suggested palette: sky #F4EFE3; ink #23352A; rice #537C45; wheat #C99943; topsoil #8B6546; subsoil #B88D65; water #4E94A1; accent #C56C38. Values are design tokens, not crop measurements.

## Screen arrangement
Top: season switch (Rice / Wheat), date/day, play/pause, sound toggle; directly below, the three illustrated input containers and compact cumulative totals.
Left: ten vertically ordered stage buttons, current stage prominent. In the centre: field diorama, crop above the surface and roots below. The tubewell stays visible near the right edge, pipe reaching into groundwater. Bottom: an open soil/aquifer section occupying about a third of the scene, followed by bowl preview and primary action.
On narrow screens: keep a vertical stage rail, shorten labels, allow a details sheet, and keep plant/soil in one continuous composition. Never open both crop scenes side-by-side. A completed-results table is allowed in a separate summary drawer.

## Interactions
At a live checkpoint, show one short observation and a few relevant choices: inspect, irrigate/wait, apply/skip input, remove weeds or scout. Let users manually advance a day or continue to the next decision. Play mode pauses at unresolved decisions. Future stage selection previews its artwork with a clear Preview label; it cannot advance the actual ledger or expose future random events. Past stage selection shows the historical snapshot. Resume returns to the live day.

Editing a past action makes a new branch, retains the old run for comparison, and rebuilds all later snapshots. Rice edits invalidate/recompute the linked wheat run. Simply switching seasons preserves all state. Wheat can be previewed before rice harvest; playing it begins only after rice harvest and the chronological fallow interval.

## Animation contracts
- Growth: interpolate leaves, tillers and stems over 700–1200 ms; flowering and grain formation use distinct shapes, not just a scaled sprite.
- Pump: motor vibration, water moving upward inside pipe, stream to field; only while a real irrigation event occurs. Stop when storage is empty.
- Rain: clouds gather; particle rate corresponds to event intensity; visible soil wetting and ponding. Every animation corresponds to recorded rainfall; idle decorative rain must not imply water addition.
- Infiltration: descending blue paths fade through soil. An illustrative delay precedes recharge. A small caption states that vertical distance and timing are schematic.
- Recharge: aquifer surface rises smoothly to its computed value. Drainage that has not reached the aquifer must remain in a pending-recharge counter.
- Evapotranspiration: optional subtle upward wisps; separate from aquifer pumping.
- Runoff: overflow moves sideways off the soil section; it cannot simultaneously be counted as recharge.
- Fertilizer: measured grains fall onto soil. Sprays go to crop/field, never into the edible bowl. Bag icons fill fractionally; kg is authoritative.
- Harvest: cut crop, thresh grain, show rice husk/milling step, then fill bowl. Display actual output/reference output so poor choices reduce fill; show overflow or extra bowls separately.
- Reduced motion: no particles or camera travel; cross-fades and numerical updates retain every fact. Audio is opt-in and stops when paused/hidden.

## Bowl presentation
Label “Per 100 g dry food”. Rice: uncooked milled grain; wheat: dry grain. Keep per-bowl input intensity alongside the crop illustration. During growth use an explicitly labelled projection; after harvest replace it with actual model output. Show failed harvest as “No harvest; inputs still used”, never infinity or zero resource use. Field detail is available without displacing the bowl focus.

## Evidence drawer
Each metric shows its unit, basis (acre or bowl), source title/year and a short interpretation. Badge entries as Source fact, Calculated conversion, or Game assumption. Rain label says IMD 1991–2020 Ludhiana station normal, not today’s weather. Groundwater label says illustrative storage, never “Punjab has X% water left”.

## Sound and language
Optional restrained pump/rain/rustle audio; never autoplay sound. English first version; Punjabi crop labels supplied. Keep all strings in a dictionary so full Gurmukhi localisation can follow after review.

## Confirmed unit toggle
Provide a prominent **Per bowl ↔ 1 acre** toggle in the main scene. Both modes show the same simulation. Switch all water, product and harvest quantities together; preserve crop progress and aquifer history. Acre mode shows kg/quintals and fertilizer bag equivalents; bowl mode shows allocated grams/millilitres/litres per 100 g dry food. The field-detail drawer is supplementary, not a substitute for this toggle.
