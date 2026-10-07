# Current acceptance results · realism and UX overhaul · 7 October 2026

The standalone build now starts paused, offers a guided seed-to-food story and free exploration, separates camera view from units, shows optional straw comparisons, and ends with processing/bowl presentation and crop results. The scene uses 120 varied instanced crop clumps, textured soil and an explicitly illustrative groundwater cutaway.

## Executed checks

- Package validator passes. The deterministic simulation, automatic irrigation, continuous sampling, residue and metric-allocation suites pass. The simulation reducer, timeline formulas, metric formulas and data coefficients were not edited.
- 118 browser assertions pass in local Chrome: journey (35), complete guided playback (9), targeted access checks (13), live flows (17), field/camera view (13), quantity/ledger UX (15), and bilingual/theme/residue controls (16).
- The timed-playback test runs the complete journey using an isolated virtual clock and a controlled 10 fps callback schedule. It verifies both harvest holds, processing progression, pause/resume, filled bowl and automatic completion. This is a timing/behavior check, not a device-performance benchmark.
- Responsive checks cover 320×568, 390×667, 390×844, 768×1024 and 1440×1000. Short screens intentionally scroll. Final story/bowl cards do not overlap. English/Punjabi and light/dark controls remain usable.
- Targeted access checks verify modal keyboard focus, Escape/focus restoration, visible focus, 44 px primary touch targets, solid UI palette contrast, 150% text enlargement and a functional WebGL fallback. This is not a whole-page WCAG conformance or screen-reader certification.
- Direct opening of the rebuilt `index.html` through `file://` succeeds: field rendering, endpoint navigation and quantitative results work without a local server or runtime network assets.
- Syntax checks and `git diff --check` pass. The standalone page is regenerated from `app/`, and the manifest is refreshed.

Local screenshots and test reports are under ignored `output/playwright/`. Independent Punjabi review, formative layperson testing, screen-reader/device checks and named-phone performance measurement remain external validation work. No claim of calibrated agronomic prediction or measured aquifer reserves is introduced.

The records below describe earlier builds. Their paused-wind, bottle, choice-gating and no-scroll behaviors were superseded by this overhaul.

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
