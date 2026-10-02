# Simulation and accounting contract

## Two views, one field
The visible unit toggle is **Per bowl | 1 acre**. It is always available near the totals, including at harvest. It changes units and scene emphasis only, never land area, current time, weather seed or state. In acre view show the whole field and crop yield in kg/quintals; in bowl view foreground the food bowl and allocated resources. Both use the same ledger. Store the selected display mode separately from simulation state.

Acre = 4046.8564224 m²; 1 mm over 1 m² = 1 L. Per-bowl denominator is 0.1 kg edible dry output. One acre remains the same acre through rice, fallow and wheat. Nursery is a 160 m² subplot within that acre; the remainder is fallow until transplant. Do not count full-acre rice irrigation during the nursery phase. Each zone gets rainfall once.

## Calendar and state
Use date-only UTC arithmetic for simulation; local time zone must not shift a sowing date. The proposed run starts with rice nursery on 8 June 2027, transplanting 27 days later, then harvest 93 days after transplant. Wheat starts 10 November 2027, with harvest 148 days later. These are demonstration dates, not a weather forecast. Recompute from anchors if dates change; do not hardcode month/day stage labels.

Top-level state: schemaVersion, datasetVersion, runId, branchParent, randomSeed, absoluteDate, activeScene, displayMode, paused, cropStates, soilZones, aquiferStorageL, pendingRechargeByDate, cumulativeWaterLedger, productLedger, decisions, snapshots, rngState.
Crop state: phase, daysAfterSowing, daysAfterTransplanting (null for wheat and pre-transplant rice), referenceYieldKg, projectedYieldKg, actualYieldKg, stressIntegrals, inputEvents, harvested, outputBoundary.
Event fields: id, date, cropId or fallow, zoneAreaM2, type, quantity, unit, productId where relevant, sourceIds, status, userDecisionId, waterSource, treatedAreaFraction.

One reducer processes each unique event ID exactly once. UI animation never changes quantities. Selecting/replaying a snapshot must never dispatch treatment, rain or pumping events. Restart is explicit and resets both crops together.

## Weather generator
Use the 12 included monthly normals. Seed the generator. For each month, choose max(1, round(mean rainy days)) distinct dates and positive event weights; normalize amounts so their sum equals that month's normal × scenario multiplier. Assign the rounding residual to the last event. This preserves totals, not the exact climatological frequency of rain. Decimal mean rainy-day frequencies are metadata, not literally fractional days.
Generate whole calendar months before clipping to a crop's dates; never pour a full month's rain into a partial-month crop stage. Simulate fallow periods too. Dry/wet multipliers are game scenarios, not historical percentiles. Same seed plus same inputs must yield identical weather. Pause halts model time. Animation duration is independent of the agronomic day.

## Daily water balance (illustrative bucket model)
Track volumes in litres. Soil capacities and pond depths in the config are converted using each zone area. ET, drainage and recharge coefficients are assumptions, not verified farm measurements. No groundwater depth in metres can be inferred from them.

For every day:
1. Release recharge scheduled for today: move it from pending storage to aquifer; cap at aquifer capacity and account for overflow as boundary outflow.
2. Apply rainfall R = rainMm × zoneArea to surface storage once. Keep rain and pumped inputs as separate ledger columns.
3. If the player irrigates, requested gross pumping P = requested net field depth × area / conveyanceEfficiency. Limit P to available aquifer storage. Deduct actual P immediately. Delivered water = P × efficiency; the rest is explicit conveyance loss leaving the model. Spray carrier water sourced from the pump is also deducted and delivered to the zone; sand carriers contain no spray water.
4. Infiltrate min(surface water, daily infiltration limit × area, soil capacity minus current soil storage). Remaining surface water above pond capacity becomes runoff. Paddy has pond capacity; other zones do not retain a standing pond overnight.
5. Apply potential ET = monthly reference ET × crop multiplier × area. Remove water from pond first, then soil. Actual ET cannot exceed available water; record ET deficit for crop stress. Nursery uses rice multiplier on its subplot, fallow uses fallow multiplier.
6. Drain min(max(soil storage minus drainage threshold × area, 0), drainage limit × area). Deduct all drainage from soil. Queue drainage × recharge fraction for arrival after the configured lag; remainder leaves the model as deep/lateral outflow.
7. Record end-of-day stocks and check conservation. Every litre must be in a stock, an output or an input.

Whole-model conservation: end stocks (aquifer + soil + pond + pending recharge) = start stocks + rainfall - ET - runoff - conveyance loss - deep/lateral outflow - aquifer overflow. Pumping and recharge are internal transfers, not additional external losses/sources. An initially imported rain event must not also be counted as external recharge. Cap stocks through accounted flows, never silent clipping.

The isolated groundwater equation is Δaquifer = arrived recharge - pumped withdrawals - overflow. Show pumped litres and replenished litres separately. Keep pending recharge visible in details. Do not convert state-wide groundwater extraction percentages into an initial tank fill or predict Punjab's depletion date.

PAU irrigation rules in irrigation.json drive contextual prompts. A game refill target is an assumption; the 100 mm paddy standing-water ceiling is not the amount of every irrigation. For wheat's first relatively light irrigation the numeric depth is a configurable assumption. Never combine the older WH-1105 experiment's day ranges with the current manual's PBW 826 calendar as if they were one trial.

## Fertilizer and crop protection
All product counters use commercial formulation amounts. Distinguish nutrient kg from fertilizer kg. Nursery quantities = rate per nursery acre × (160 / 4046.8564224). These are in addition to main-field inputs and should be tagged nursery, so the user can inspect them.
For baseline wheat, DAP and urea are the selected route; do not add the alternative SSP route on top. Fertilizer event triggers must only fire once, even when irrigation is postponed. Rice and wheat start with the explicit P-sufficient soil assumption; carry crop history for subsequent rotations. More fertilizer must never produce unlimited yield.

An optional herbicide branch is a choice, not a compulsory task. Offer manual weed removal as a game action. Pest-control events require a detected/scouted scenario and a matching crop/pest example. A treatment for WBPH is not a generic cure for leaf folder or fungal rust. For wheat aphid border treatment, applied formulation and carrier water scale by treated-area fraction, not automatically the entire acre. Store g and mL separately; do not convert liquid formulation to active-ingredient mass without product density and concentration basis.
The third container holds fertilizer products; the first groups insecticides/fungicides while explicitly excluding herbicides to avoid double counting. A tooltip can clarify that herbicides are technically pesticides too. Product-use counters are not dietary residue measurements.

## Transparent illustrative yield response
This is deliberately a simple teaching model. Do not label its result PAU-predicted yield.
- For days with a crop, water stress = sum(max(potential ET - actual ET, 0)) / sum(potential ET); clamp 0..1. This ignores some real phenological differences; display as simplified.
- On each scheduled fertilizer checkpoint, nutrient deficit = missing scheduled product fraction at deadline; average across checkpoints. For wheat use the first/second irrigation or latest-day exception; for rice use the dated checkpoints. Nursery deficiencies can affect establishment but must not be counted twice as main-field deficit.
- Weed/pest pressure is 0..1; optional seeded events raise it. Scout reveals pressure without increasing it. Manual/appropriate chemical management reduces pressure by the config factor. Apply no damage penalty when no pressure occurred. Integrated pressure = mean daily pressure over eligible crop days.
- penalty = 0.6 × waterStress + 0.2 × nutrientDeficit + 0.1 × meanWeedPressure + 0.1 × meanPestPressure.
- Excess nitrogen penalty = min(0.15, 0.15 × max(0, applied baseline-equivalent nitrogen / baseline - 1)); all coefficients are game choices. Account for N supplied by DAP when converting to nitrogen; if composition is not configured, compare the chosen product schedule only and label the approximation.
- yieldMultiplier = clamp(1 - penalty - excessPenalty, 0, 1). A fully unestablished/dead crop yields 0 regardless of this formula. Reference yield is a ceiling for this first model, not a regional maximum.
- modelYieldKg = referenceYieldKg × yieldMultiplier; multiply by processing recovery for edible output. Do not infer extra yield from applying more than the baseline.
This model does not claim to predict disease, heat stress, lodging, nutrient leaching or actual aquifer behaviour. These may appear as explanatory observations; no quantitative effect is implied without a defined model.

## Per-bowl allocation
Bowl count B = edible output kg / 0.1. Per-bowl pumped L = crop-attributed pumped L / B. Per-bowl product g = crop product kg × 1000 / B. Per-bowl liquid mL = crop product mL / B. Bags = product kg / configured bag kg; show fractional equivalents, not a rounded count of bags purchased.
Before harvest divide by projected output and label Projection. At zero output show undefined per-bowl intensity and retain all field totals. Never divide by zero or pretend failed crops used no inputs.
Do not allocate wheat's water to rice bowls or vice versa. Rice nursery pumping belongs to rice. Fallow water/recharge remains a separate rotation category. Show rainfall, pumping, ET and recharge separately; do not add them into a misleading universal water footprint. A simple gross attribution assigns all crop inputs to grain, excludes straw/husk co-product credits, and must be stated in details.

## Numerical fixture
Given 3000 kg paddy, 0.67 milling recovery, 0.1 kg bowl and hypothetical 1,000,000 L pumping: edible rice = 2010 kg, bowl equivalents = 20,100, pumping per bowl = 49.75124378 L. That pumping total is a test input, not a sourced crop requirement.
For 2400 kg wheat grain, bowls = 24,000; the same hypothetical pumping gives 41.66666667 L/bowl. This is a conversion fixture, not an agronomic comparison.

## Import/export
Save schema version, all assumptions, seed, dates and event ledger, not only final counters. Reject unknown schema or negative/nonfinite units gracefully. Recompute derived totals on import; never trust arbitrary supplied final totals. No network/backend required for the prototype.

## Zone transition and initial conditions
At start, nursery and fallow share the one-acre area, each initialised to the same configured soil-water depth. At transplant merge soil and pond volumes by summation, not by resetting moisture; canopy becomes rice over the whole field. Pending recharge is global and survives every crop/zone transition. At harvest switch to fallow demand and zero pond capacity; drain residual pond water into the soil subject to capacity/infiltration rules and account for overflow. Never destroy water at scene transitions. Use one aquifer for both zones.

## Completion
After rice harvest, advance the fallow interval chronologically (with a visible time-lapse) to wheat sowing. After wheat harvest, show separate season totals and rotation water balance. A next-year replay is optional; if implemented, continue dates and aquifer instead of resetting unless the player explicitly chooses New game.
