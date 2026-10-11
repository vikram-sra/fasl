# Current acceptance results · crop-first redesign · 7 October 2026

The crop and underground cutaway now dominate the screen. Field / 100 g coordinates crop framing, allocated quantities and visible input-container sizes/fills. A compact dock replaces the large footer, a short title replaces the narrative strip, and small harvest controls replace the covering cards. The tubewell has a grounded motor/pump assembly, couplings and a connected bore/outlet. Mature crops use 96 varied background clumps plus detailed foreground plants; the camera moves closer to seedlings and the residue-covered surface.

## Executed checks

- Package validation and all existing simulation, automatic-irrigation, continuous sampling, residue and metric-allocation suites pass. Model coefficients, reducer, timeline formulas and metric formulas were preserved.
- 161 browser assertions pass in local Chrome: journey (35), guided-playback (9), accessibility (13), live-flow (17), acre-view (12), ux-metrics (15), farmer-ui (16), crop-first (44).
- The new crop-first suite checks scene coverage, visible soil/water, container sizing, unit-specific ledger amounts and fills, date/history preservation, reduced motion, focus restoration and a harvest reference that leaves the tubewell clear. It tests quantities at days 0, 34.15, 90, 150, 250 and 304.
- Measured scene coverage: 78.6% at 390×844, 72.9% at 390×667, 68.1% at 320×568, 82.3% at 768×1024 and 85.5% at 1440×1000. These are scene-region measurements, not claims that crop leaves occupy that percentage of pixels. Soil and groundwater remain inside the frame. At ordinary text size these tested viewports fit without scrolling; enlarged text may scroll.
- Screenshots were visually inspected for mature rice and wheat, Field and 100 g, seedlings and the between-seasons state. Crops fill the upper scene with headroom above the canopy, roots/soil and saturated ground stay visible below, and the large harvest overlay is removed. Local screenshots are under ignored `output/playwright/`.
- The full guided story passes with an isolated virtual clock and controlled 10 fps callback schedule: both harvest holds, processing progression, pause/resume, filled bowl and automatic completion. This is a timing check, not a physical-phone performance benchmark.
- Targeted accessibility checks pass for modal focus, Escape/focus restoration, visible focus, 44 px primary targets, solid UI palette contrast, 150% text enlargement and WebGL fallback. These are targeted checks, not a full WCAG or screen-reader certification.
- Direct `file://` opening of the rebuilt page successfully renders the embedded scene and opens final quantitative results without runtime downloads.
- JavaScript syntax checks and `git diff --check` pass. The standalone page is rebuilt from `app/`; the package manifest records current bytes and hashes.

Container sizes are magnified illustrations with different capacities in the two modes. Their fill is proportional within the stated capacity; the visible size difference is not a common physical ruler. Exact amounts and unlike product units remain available on tap.

Independent Punjabi review, formative layperson testing, screen-reader testing and named-phone performance measurement remain external validation. The cutaway depicts illustrative groundwater, not a measured local reserve or aquifer depth.

---

# Earlier implementation results · historical

The application is a full-screen automatic rice → fallow → wheat simulation with a continuous bottom slider, a living plant, connected water animation, changing bottles and a groundwater marker.

- Package validator passes with the supplied source references and unit fixtures intact.
- `tests/simulation.cjs`: 13 core groups pass, including monthly rain totals, conservation, nursery area, aquifer caps, product scaling, calendar dates and deterministic reconstruction.
- `tests/automatic-irrigation.cjs`: moisture triggers, rain suppression, nursery scaling, fallow, pre-harvest cutoff, aquifer limits and repeatability pass.
- `tests/continuous.cjs`: 5 groups pass. All 304 daily baseline states resolve automatically; interpolated stocks meet every daily endpoint; surface pooling precedes infiltration; recharge raises groundwater after the preserved seven-day lag; growth and inventory are continuous and reversible.
- `tests/live-flow.js`: 15 browser checks pass. Coverage includes no decision prompts, stable geometry during scrubbing, wind while paused, bottle depletion and restoration, outside pipe discharge, pooling/infiltration, animated rain clouds, groundwater recharge/marker, both crops, reduced motion and zero JavaScript errors.
- Responsive layouts pass at 390 × 844, 390 × 667 and 1440 × 1000 without document scrolling. Mature rice renders with approximately two dozen draw calls; droplet groups use instancing.

The largest absolute daily conservation error in the automatic rotation is approximately 1.99e-9 L. This demonstrates numerical closure, not physical calibration. Images and current browser logs are generated locally under `output/playwright/`; temporary outputs are not published to the repository. Superseded decision UI tests are retained under `tests/legacy/` and are not current acceptance criteria.

See `ANIMATION_AUDIT.md` for findings, changes and physical limits.

## Farmer interface and residue update · 2026-10-02

- Existing core model: 13 groups pass; automatic irrigation and 5 continuous-timeline groups pass.
- New residue test: branches share pre-harvest history, remain deterministic and conserve water; residue events and fertilizer products are unique; N accounting uses correct product fractions; sampled nutrient application is reversible.
- Existing live browser flow: 15 checks pass.
- New farmer browser flow: 16 checks pass, covering choice gating, fire/ash/mulch, branch changes, rewind, evidence, Punjabi, dark mode persistence, fertilizer animation, reduced-motion rendering and theme refresh.
- Automatic playback stops at harvest and resumes after a choice.
- Visual checks at 390×844, 390×667, 320×568 and 1440×1000; no document overflow. Explicit Punjabi month names avoid missing browser locale data.
- Local Chrome, 390×844 mature crop: 120-frame sample median 16.7ms, p95 16.7ms, 24 draw calls. This is desktop-browser testing, not a claim about every phone.
- In the illustrative normal-rain run, burning and mulch produce equal wheat grain output while mulch lowers cumulative pumping. No guaranteed yield penalty is imposed.
- Scientific and translation limitations are documented in FARMER_UI_AND_RESIDUE.md.

## UX audit and live unit quantities · 2026-10-02

Added 19 passing UX/metrics browser checks and a passing pure metric-allocation test. The existing 15 live-flow and 16 farmer-interface checks also pass (50 browser checks total). Centering and non-overlapping controls were checked on four portrait/desktop sizes. Population and grain presentation assumptions, unit semantics and source details are recorded in UX_AUDIT.md.

## Acre field visualization

12 new browser checks pass for instanced field rows, smooth zoom, reversible view switching, mobile fit, wheat and reduced motion. Metric allocation and residue model tests pass. Representative plant rendering does not modify the model population or water balance.

## Automatic update detection · 7 October 2026

The previous Pages deployment for `fd60ff3` completed successfully, and the publicly fetched HTML matched the committed `index.html` byte for byte. The live response allowed caching for 600 seconds. A persistent old tab can also retain its already-loaded document.

The new content-hash version file and embedded HTML revision are deterministic across repeated builds. 18 passing browser checks cover startup and periodic version detection, cache-busting project-relative URLs, unchanged/invalid/error responses, offline reconnect, matching HTML before reload, preserved preferences and query/hash state, stale-cache retry cooldowns, blocked session storage and the standalone file build. Version checking is silent and does not change the simulation.


## Phone proportions · 7 October 2026

The ground boundary stays at 65% of scene height across growth stages. Soil, roots and saturated ground share the remaining 35%; above-ground pump size follows the camera framing. Young field perspective depth is reduced so distant rows do not consume the crop area. The cutaway remains illustrative, not a physical depth scale.

68 crop-first checks pass, including five viewport sizes, seedlings matching the reported June 21 state, both quantity modes, crop height, groundwater visibility and pump proportions. The 17 live-flow, 12 acre-view and 35 journey checks also pass. Dark phone screenshots were inspected for seedling and mature rice in both quantity modes; crop headroom is retained.


## Opening and touch controls · 7 October 2026

Removed the welcome screen’s inert footer and redundant Start gate. A centered static plant preview has dedicated headroom, with weather hidden. Play story and Explore live in the bottom dock; inactive quantities and playback are hidden until entry. Enlarged Play/Pause, Next and timeline targets remain in the active dock.

18 opening/touch checks pass across 390×844, 390×667, 320×568 and 768×1024, including edge taps, clear title space, centered opening, no overflow and direct entry. 68 crop-first, 35 journey, 13 accessibility, 9 full guided-playback, 17 live-flow and 18 update checks pass (178 browser checks in total). Dark opening and active phone screenshots were inspected.
