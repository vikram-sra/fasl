# Animation and hydrology audit

The preceding interface presented a decision game through discrete stage snapshots. That conflicted with the requested living, automatically managed demonstration.

| Finding | Change | Verification |
| --- | --- | --- |
| Stage selection swapped whole plant models | A fractional timeline controls shader height, spread, root growth, flowering and ripening on stable geometry | Browser scrub passes through intermediate times; geometry build count remains one per crop |
| Idle plants and water stopped rendering | Continuous wind and waterline waves remain alive while the model clock is paused | Frame and wind-time checks; reduced motion stops decorative movement |
| Tube water followed a different hand-coded path | One curve defines both the pipe geometry and water positions | Visible pipe-flow and outside-discharge browser checks |
| Water effectively went straight underground | Surface stock is drawn as a pool above the soil; rain/pumping precedes infiltration | Continuous-model test shows the pool rising, then falling while soil water increases |
| Daily stocks jumped and the aquifer had no marker | Continuous water stocks and a persistent marker show recharge and pumping | Every daily endpoint matches the conserved model; recharge test verifies an upward marker |
| Bottles remained static | Bottle liquid decreases with automatic application and reverses on rewind | Inventory and rewind browser tests |
| Stages were clickable snapshot buttons | One range slider spans rice, fallow and wheat with actual calendar-month positions | Phone, short-phone, desktop and keyboard checks |
| Users had to make crop decisions | One deterministic baseline resolves nutrition, irrigation, weeds and detected pest scenarios | Every checkpoint across 304 days is resolved without UI choices |
| Adult flowering branches were visible on tiny plants | Reproductive branches fade in during booting/heading; grains develop later | Reviewed young and mature crop renders |
| Many water particles created separate draw calls | Repeated droplets use instancing | Mature rice requires roughly two dozen draw calls |

## Physical interpretation

The automatic baseline retains the supplied model’s rain, nursery/main-field areas, bounded aquifer, conveyance losses, soil capacity, runoff, evapotranspiration, drainage and seven-day recharge lag. Individual rainy dates are synthetic, while full-month totals preserve the supplied IMD normals. Groundwater is a storage bucket; the marker must not be interpreted as measured water-table depth.

The sampler spreads daily flows into an illustrative within-day sequence. Surface water occupies a real visible stock above ground until infiltration removes it. The reducer tracks combined evapotranspiration rather than a calibrated root-uptake/evaporation split. Root particles illustrate the plant-use route qualitatively; they are not a separate measured transpiration volume. The ET ledger includes both soil and pond water loss. Queued drainage particles approach the aquifer, while arriving recharge has its own event and changes actual storage. Particle speed, wind and wave motion are illustrative; pausing or replaying an animation never repeats a water withdrawal or product application.

This is an automatically managed educational baseline, not a calibrated agronomic optimum. Historical product rates, intermediate growth dates, irrigation thresholds, hydraulic parameters and response coefficients retain their original evidence/assumption labels.
