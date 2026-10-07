# Realism and first-time-user overhaul

Plan prepared 7 October 2026. Scope: a compelling educational experience for people with no farming knowledge, with deeper field details available. The implementation is now in `app/` and the rebuilt standalone page. Automated checks and local browser review cover the delivered behavior; participant testing, independent Punjabi review and physical-phone performance measurement remain outstanding external validation.

## Direction

**Follow one Punjab field from seed to food, and understand where its water goes.**

Build a believable, tactile field with a clear beginning, visible cause and effect, and a rewarding harvest. Preserve the continuous rice–wheat rotation, reversible timeline, deterministic accounting, offline operation, English/Punjabi support and reduced-motion option.

Realism has three separate requirements: believable plants and materials; physically coherent actions; honest communication of the model's limits. Better graphics must not make illustrative aquifer storage or synthetic weather appear measured.

## Current experience: reviewed findings

Inspected the source and existing specifications, then exercised the local build in Chrome at 1440×1100 and 390×844. Checked playback, the Wheat transition, mulch choice, timeline endpoint and bowl mode. Screenshots are in `output/playwright/overhaul-{desktop,mobile,ending}.png`. These are expert-review findings, not results from participant testing; contrast, screen readers and physical-device performance still need dedicated validation.

| Priority | Current observation | Proposed change |
|---|---|---|
| P0 | Playback begins immediately; the first heading is a crop stage rather than an explanation of the experience. | Start paused with a short premise and one prominent “Start the story” button. Provide “Explore freely” as a secondary route. |
| P0 | “Tillering”, “Baseline”, “Pumped”, plant counts and abbreviated large numbers require interpretation. | Lead with a plain-language sentence, show units and scope nearby, and reveal technical terminology in details. |
| P0 | Selecting Wheat opens the straw-choice dialog and initially shows rice harvest. | Make chapter navigation predictable: preview wheat with a clearly disclosed baseline; offer the straw experiment separately. |
| P0 | The groundwater label says, for example, “71.4%”, with the explanatory limitation hidden in Menu. | Label the visible section “Illustrative groundwater store · not to scale”; move exact percentages into model details. |
| P0 | The observed ending is cut stalks and “100 g”; there is no visible bowl or concluding explanation. | Add harvest, processing and a bowl reveal followed by a concise seasonal result. |
| P1 | Acre mode uses 48 repeated clumps with thin triangular leaves; the desktop field is visually slight. | Give the canopy readable density, depth, leaf curvature and deterministic variation. |
| P1 | Soil is composed of straight colored bands; underground water resembles an open reservoir. | Add irregular soil structure and depict saturated sediment, with a clear schematic annotation. |
| P1 | On the phone, three input buttons occupy the right side of the crop view. | Move care details into one “How this field is cared for” sheet; show an input cue only during a relevant event. |
| P1 | “Per bowl / 1 acre” changes both amounts and camera framing. | Separate “Field / Plant close-up” from “Whole field / Per 100 g dry food”. Preserve date and scenario under either switch. |
| P1 | Timeline pause stops progression while environmental effects can continue. | Make Pause freeze all event motion; provide an explicit reduced-motion preference and static event explanation. |
| P1 | Older documents describe incompatible automatic/decision-driven behavior. | Reconcile the README, product specification and run instructions with the accepted experience. |

## Proposed first visit

1. **Invite.** A recognizable field and the title “One field. Two harvests.” Supporting text: “Follow rice and wheat from seed to food—and see the water used along the way.” Visible English / ਪੰਜਾਬੀ choice. No advancing dates before Start.
2. **Orient.** Introduce the plant, soil and underground water with three short, dismissible annotations. Explain: “The field is cared for automatically. You can pause or skip ahead.”
3. **Show cause and effect.** Present a short guided sequence: seedlings → growing field → water movement → grain filling → rice harvest → straw → wheat → final harvest. A caption explains the event currently in view. Skip uneventful intervals; disclose that time is accelerated.
4. **Offer agency.** At rice harvest, offer “Compare what happens to the straw” and “Continue the story”. The latter uses a disclosed retained-straw baseline. Comparison uses the same rainfall and crop-care policy on both paths, with no invented yield bonus.
5. **Deliver the payoff.** Show rice threshing and milling, or wheat threshing, before grain fills the bowl. Label it “100 g dry food”; do not imply cooked portions or nutritional equivalence. Show model-estimated pumping, rainfall contribution and harvested output using the existing accounting definitions.
6. **Invite exploration.** Finish with “Compare rice and wheat”, “Try the other straw choice” and “Replay”. Keep comparison to a few understandable facts. Explain explicitly when two strategies have similar harvests.

Target guided duration: roughly 60–90 seconds, excluding reading and optional comparison. This is a prototype target to test, not a measured user preference. Free exploration retains the full continuous timeline and chapter jumps.

## Screen hierarchy and language

Desktop: compact title/navigation, a dominant field, one caption near the active event, and a bottom control strip. Phone: header, caption, reserved scene region and compact playback/chapter controls; expandable metrics and care details. At short heights or enlarged text, allow document scrolling instead of compressing every element into a locked viewport.

Use one focal message at a time. Show water and harvest as the primary quantities; put estimated plant counts and product ledgers in details. Surface “About these estimates” near results. Keep language switching outside Menu and obtain native Punjabi review before calling localization complete.

| Current label | Proposed everyday copy |
|---|---|
| Tillering | More stems are growing |
| Pumped | Water drawn from underground |
| Grain forming: 0 kg | Grain has not formed yet |
| Soil · Baseline | Soil at the start of the story |
| Per bowl | Per 100 g dry food |
| Auto care | Watering and crop care happen automatically |

Use “New stems (tillering)” inside details. Keep quantitative labels precise: crop pumping is not total water use, and applied nitrogen is not available soil nitrogen. Prefer understandable rounded numbers; keep exact values in expandable tables. Do not use a single-season “soil health” score.

## Visual realism work

**Plants first.** Distinct rice panicles and wheat ears; curved, tapered leaves; plausible tiller emergence; visible grain filling and senescence. Add seeded variation in height, leaf angle, ripeness and wind phase without changing the modeled population. Use dense, inexpensive instances for the field and higher-detail geometry for close-ups. Explicitly label representative plants and enlarged roots.

**Field and light.** Give the field a defined edge, shallow bunds, readable row spacing and restrained depth. Introduce soft contact shading, matte soil and leaf highlights. Keep a controlled camera so the cutaway remains understandable. Prototype lighting on representative phones before committing to expensive shadows or postprocessing.

**Soil and water.** Use uneven horizons, clods, residue and branching roots. Wetness should spread near the surface and through the root zone in response to model state. Depict the water table within porous ground, not an underground swimming pool. Pump discharge should meet the field surface; ponding and runoff should follow the field bounds. Preserve the model's delayed recharge, with the delay identified as illustrative.

**Events and harvest.** Reuse ledger-driven rain, pumping and fertilizer timing. Use appropriate bags/granules and spray cues rather than three interchangeable liquid bottles. Stage cutting, straw remaining, threshing and food presentation so users can follow the transformation. Avoid decorative weather that suggests additional water or animation that credits unmodeled inputs.

## Implementation sequence

| Phase | Concrete deliverable | Main files | Exit condition |
|---|---|---|---|
| 1 — Comprehension | Paused entry, plain-language captions, predictable chapter navigation, visible model context, simpler phone controls | `app/shell.html`, `app/style.css`, `app/application.js` | A newcomer can start, pause, identify automatic care and reach wheat without an unexplained modal. |
| 2 — Realism prototype | One representative rice scene and one wheat scene across seedling, mature and harvest states | `app/scene3d.js`, `app/timeline.js` | Crops are distinguishable without labels; canopy, soil and water remain legible on a phone. Benchmark before expanding. |
| 3 — Story and payoff | Guided chapters, harvest/processing/bowl sequence, final results, optional straw comparison | `app/application.js`, `app/scene3d.js`, `app/metrics.js` | The journey ends with a visible food result and an accurate explanation of water and units. |
| 4 — Validation and polish | Punjabi review, keyboard/screen-reader checks, responsive/performance checks, synchronized docs and rebuilt standalone output | `tests/`, `docs/`, `build.py`, `index.html` | Usability and regression gates below pass. |

Keep the simulation reducer separate from presentation. Add explicit journey, playback, view and quantity-basis state; do not hide simulation mutations inside camera or unit controls. Drive event captions and effects from sampled state so reverse scrubbing reproduces them. Consolidate the layered CSS overrides into layout tokens and intentional responsive rules. Do not edit the generated `index.html` directly.

The first release should preserve current model coefficients. A calibrated agronomy edition needs separate evidence work—cultivar phenology, measured water flows, local aquifer behavior and validated responses—as already recorded in `EVIDENCE_AND_GAPS.md`. No new agronomic claims are established by this plan.

## Acceptance and usability checks

- Recruit five people without farming expertise for a formative prototype test. Proposed gate: at least four can start/pause unaided, explain automatic care, distinguish pumped water from rain, and identify the bowl as dry food. Any interpretation of the groundwater display as a measured Punjab reserve triggers a copy/design revision.
- Observe whether participants notice grain formation and understand the ending; ask them to explain one cause and effect in their own words. Record guided completion and optional exploration as baseline measures rather than inventing an engagement uplift.
- Check 320×568, 390×844, tablet and desktop, English/Punjabi, both themes, enlarged text and reduced motion. No overlapping controls, obscured field events, trapped focus or inaccessible results. Provide a meaningful static/text fallback without WebGL.
- Use 44×44 CSS px as the product target for primary touch controls. This is more generous than WCAG 2.2 AA's 24×24 minimum with exceptions; do not misstate it as the AA threshold. See [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Verify visible keyboard focus, dialog focus restoration, non-color status cues and readable text contrast. Pause must stop the journey and animated events; reduced motion must retain the same facts. See [W3C guidance on pausing moving and updating content](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- Run the existing simulation, irrigation, continuous-timeline, residue and metrics tests after implementation. Add focused journey checks for preview versus committed choice, end/replay, view/unit invariance and rewind across harvest; adapt existing browser flows to the new controls.
- Set a provisional performance target of at least 30 fps on a named representative midrange phone, then measure it. Check repeated seeking for memory growth and geometry rebuilding. Prefer instancing, bounded particles and adaptive quality; preserve offline loading and stop rendering in hidden tabs.
- Rebuild and validate the standalone package; reconcile the manifest and documentation according to existing project practice.

Implementation status: the guided entry, controls, crop/soil art, harvest payoff, straw comparison and documentation are delivered. Participant comprehension testing, independent Punjabi review and physical-phone performance measurements remain follow-up validation tasks. The model coefficients were preserved.
