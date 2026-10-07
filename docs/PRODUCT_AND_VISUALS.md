# Product and visual behavior · October 2026 overhaul

The current experience is an educational story for people without farming knowledge: **One field. Two harvests.** Source facts and teaching assumptions remain distinct. `REALISM_AND_UX_OVERHAUL_PLAN.md` records the rationale and proposed user-research gates.

## Journey and controls

Welcome starts paused at model day zero, with a static representative rice field behind the invitation. The preview artwork does not change the day-zero ledger. Start launches a guided rotation at 4.5 model days/second with two eight-second harvest holds; total duration is about 84 seconds. Explore starts paused. Ordinary exploration playback uses 1.5 model days/second. All displayed dates remain model dates, with acceleration disclosed.

Orientation explains crop, soil, roots and water. Stage headings use everyday language and captions explain the current change. Dismiss orientation or let eight seconds of playback pass. Next chapter, Rice/Wheat and slider controls seek directly and pause. Seeking never changes the chosen management scenario or applies an input twice.

Rice straw is retained as the disclosed baseline. There is no mandatory decision at harvest or when navigating to Wheat. Compare straw choices offers both season-end model projections; Watch this path begins at rice harvest, while Change path at the current date preserves time. Both paths use identical rain and automatic care. Similar yields are explicitly explained.

Field / Plant close-up controls only the camera. Whole field / Per 100 g dry food controls only extensive quantities. The primary metrics show pumping for the active crop and edible dry grain. Details retain estimated population, shoots, source product units and the allocation basis. Groundwater has a visible illustrative label and a cutaway scale note; its exact bucket percentage appears in evidence details.

## Art and motion

The fixed side view uses an original procedural soil texture, uneven layer horizons, mineral flecks, a saturated-sediment tint, surface pooling and a connected tubewell. These are schematic representations. Wind and rendered travel distances add no water to the reducer.

The field contains 120 instanced representative clumps with deterministic variations in height, lean and shade. Each clump uses curved stems and tapered leaf ribbons. Rice has branching panicles; wheat has compact ears and awns. Growth, grain formation, ripening, cutting, root depth and residue remain sampled from the deterministic timeline. The separate detailed botanical plant remains available in close-up.

Rain, pumping, infiltration, uptake, delayed recharge and fertilizer cues follow recorded model flows. The camera has a reserved scene region instead of spanning behind every control. Crop care is accessed from one sheet. Fertilizer uses a bag/granule illustration; treatment ledgers use container illustrations.

Pause freezes event time as well as date progression, and the scene stops rendering after any camera transition settles. Reduced motion makes view changes immediate and uses static flow cues. Theme, scenario and resize changes invalidate a static frame so the scene stays current. Hidden tabs stop rendering and time progression. Low sustained frame rates reduce rendering pixel ratio.

## Harvest and results

Guided rice harvest holds at day 122: cutting, grain separation, husk removal and bowl filling. Wheat harvest holds at the rotation endpoint: cutting, separation and bowl filling. This is an explanatory visual sequence, not a mechanistic processing simulation. Rewinding or seeking samples harvest/cutting state directly; it does not restart an unrequested timed sequence.

The bowl represents 100 g dry food, with rice shown as uncooked milled grain and wheat as dry grain. A zero modeled harvest leaves the bowl empty and states that inputs were still used. Final results compare crop pumping, allocated rainfall and whole-acre edible dry output. Before the endpoint, season-end numbers are labeled projections. Neither view claims a lifecycle water footprint or equal nutritional portions.

## Layout and access

Desktop uses a compact header, narrative strip, field and bottom controls. Phones use the same order, fewer overlays and vertically stacked final story/bowl cards. Short screens scroll. Dialogs are native modal dialogs; Escape and visible close buttons dismiss them. The timeline has keyboard arrows, Shift + arrows, Page Up/Down and Home/End controls. Visible language switching, persistent themes and reduced motion remain available.

Text explanations, model quantities, chapter controls, comparisons and the bowl work without WebGL; a fallback explains the unavailable field rendering. Independent Punjabi review, real screen-reader testing, formative layperson testing and named-phone performance measurements remain external validation tasks.
