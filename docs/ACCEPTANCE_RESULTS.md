# Current acceptance results

The application is a full-screen automatic rice → fallow → wheat simulation with a continuous bottom slider, a living plant, connected water animation, changing bottles and a groundwater marker.

- Package validator passes with the supplied source references and unit fixtures intact.
- `tests/simulation.cjs`: 13 core groups pass, including monthly rain totals, conservation, nursery area, aquifer caps, product scaling, calendar dates and deterministic reconstruction.
- `tests/automatic-irrigation.cjs`: moisture triggers, rain suppression, nursery scaling, fallow, pre-harvest cutoff, aquifer limits and repeatability pass.
- `tests/continuous.cjs`: 5 groups pass. All 304 daily baseline states resolve automatically; interpolated stocks meet every daily endpoint; surface pooling precedes infiltration; recharge raises groundwater after the preserved seven-day lag; growth and inventory are continuous and reversible.
- `tests/live-flow.js`: 15 browser checks pass. Coverage includes no decision prompts, stable geometry during scrubbing, wind while paused, bottle depletion and restoration, outside pipe discharge, pooling/infiltration, animated rain clouds, groundwater recharge/marker, both crops, reduced motion and zero JavaScript errors.
- Responsive layouts pass at 390 × 844, 390 × 667 and 1440 × 1000 without document scrolling. Mature rice renders with approximately two dozen draw calls; droplet groups use instancing.

The largest absolute daily conservation error in the automatic rotation is approximately 1.99e-9 L. This demonstrates numerical closure, not physical calibration. Images and current browser logs are generated locally under `output/playwright/`; temporary outputs are not published to the repository. Superseded decision UI tests are retained under `tests/legacy/` and are not current acceptance criteria.

See `ANIMATION_AUDIT.md` for findings, changes and physical limits.
