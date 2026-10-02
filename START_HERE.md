> Current implementation: an automatic baseline crop simulation with a continuous timeline slider. The user has superseded the decision-game UI in the original brief below. Do not restore decision prompts or snapshot stage navigation unless explicitly requested. See `docs/BUILD_AND_RUN.md` and `docs/ANIMATION_AUDIT.md`.

# Codex build instruction

Build a polished, fully working educational decision game from this package. Working title: **A Bowl Across Two Seasons**.

Read README.md, docs/PRODUCT_AND_VISUALS.md, docs/SIMULATION.md, docs/EVIDENCE_AND_GAPS.md and data/*.json. Treat explicit user requirements as fixed; treat labelled defaults as implementation choices. Do not replace missing science with invented authoritative numbers.

## Product requirements
- Punjab, India; rice first, wheat second, same land and persistent groundwater.
- One active crop view only. Switching scenes is navigation, never an automatic time advance or groundwater reset.
- Clickable vertical growth stages from seed through maturity, with visibly distinct plants and root development.
- A real scene occupies most of the viewport: sky, crop, tubewell, soil cross-section and aquifer. Avoid turning it into a dashboard of generic cards.
- Animated rain, infiltration, delayed aquifer recharge and pumping. Rain comes from the included monthly IMD data, with seeded synthetic event days.
- Player choices matter: pump or wait, appropriate fertilizer timing/amount, inspect/control weeds, scout/manage pests. No automatic pesticide schedule.
- Top containers: pest/disease control, herbicide, fertilizer. Show cumulative product amounts, preserve g vs mL, and separate spray water.
- Per-bowl display is primary. Field-detail drawer exposes kg, litres and bag equivalents for the fixed acre.
- Harvest separates paddy from milled rice; wheat bowl is grain. Use a 100 g dry comparison unit and never label it a cooked serving.
- Past stages are replayable snapshots. Editing a past decision creates a revised run and recalculates downstream events without double-counting.
- Persist locally, export/import game JSON, restart with explicit reset, mute sound by default, and support reduced motion and keyboard use.

## Implementation approach
Inspect existing repository, instructions and stack before changing anything. If a suitable app already exists, use its conventions. For a new blank project, use one self-contained `index.html` with embedded CSS, JavaScript and data; no React or runtime dependencies required. Use SVG for botanical shapes/soil and Canvas only if particle performance benefits. Keep simulation functions logically separate from rendering even in one file. Local file opening should work; do not fetch local JSON at runtime in the standalone build.

Implement in this order:
1. Data types, unit conversions, pure reducer and deterministic random seed.
2. Both crop scenes and vertical stage navigation with original artwork.
3. Daily water balance, rainfall generation, pumping and season continuity.
4. Input choices, pest/weed events and labelled illustrative yield model.
5. Bowl reveal, evidence drawer, persistence and export/import.
6. Test the behaviours in docs/ACCEPTANCE.md and inspect desktop/mobile layouts.

Preserve verified dataset entries and source IDs. Round for display only. Keep assumptions in a named configuration object. Every numerical fact in the evidence drawer must resolve to its source or carry a simulation label. Do not call this PAU-approved, predict an actual water-table depth, or show fertilizer applied as contamination in the bowl.

Use available primary sources to resolve genuinely blocking uncertainties, but do not delay the playable prototype for a calibrated hydrological model. The labelled illustrative mode is the intended first implementation. Do not enable unsourced real-product quantities; available source examples are already supplied. Keep current legal registration verification as a condition before presenting any real-world treatment guidance.

Deliver a working local app, concise run instructions, evidence of acceptance checks and any remaining scientific limitations. Do not publish or deploy as part of this prompt.

## Confirmed unit toggle
Provide a prominent **Per bowl ↔ 1 acre** toggle in the main scene. Both modes show the same simulation. Switch all water, product and harvest quantities together; preserve crop progress and aquifer history. Acre mode shows kg/quintals and fertilizer bag equivalents; bowl mode shows allocated grams/millilitres/litres per 100 g dry food. The field-detail drawer is supplementary, not a substitute for this toggle.
