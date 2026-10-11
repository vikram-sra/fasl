# Product and visual behavior · October 2026 overhaul

The current experience is an educational story for people without farming knowledge: **One field. Two harvests.** Source facts and teaching assumptions remain distinct. `REALISM_AND_UX_OVERHAUL_PLAN.md` records the rationale and proposed user-research gates.

## Journey and controls

Welcome starts paused at model day zero, with a centered, static representative rice plant and a clear title. Opening artwork always uses the single-plant framing; the chosen Field / 100 g preference applies after entry. Weather and input animations are hidden in this preview. The preview artwork does not change the day-zero ledger. Play story launches a guided rotation at 4.5 model days/second with two eight-second harvest holds; total duration is about 84 seconds. Explore starts paused. Ordinary exploration playback uses 1.5 model days/second. All displayed dates remain model dates, with acceleration disclosed.

The welcome dock contains Play story and Explore rather than disabled metrics and playback. Both opening actions have 56px minimum height. Active Play/Pause has a 104×56px minimum target, Next has a 56px minimum height, and the timeline has a 40px drag area. The dock remains enabled when returning home.

One short stage heading supports the large crop scene; longer captions remain available to assistive technology. Roots, soil and groundwater are shown directly. Next chapter, Rice/Wheat and slider controls seek directly and pause. Seeking never changes the chosen management scenario or applies an input twice.

Rice straw is retained as the disclosed baseline. There is no mandatory decision at harvest or when navigating to Wheat. Menu → Compare straw choices offers both season-end model projections; Watch this path begins at rice harvest, while Change path at the current date preserves time. Both paths use identical rain and automatic care. Similar yields are explicitly explained.

Field / 100 g coordinates representative crop framing and extensive quantities. The primary values remain active-crop pumping and edible dry grain. Four scene objects show cumulative water, fertilizer, weed-care and pest-care amounts; selecting an object opens exact ledgers. Each quantity mode uses a different container capacity and glyph size. Fill maps linearly to quantity within that capacity; the object sizes are illustrative, and small allocations are magnified. Different product units are displayed separately. A zero quantity has an empty fill. Changing presentation preserves date, scenario and reducer history.

The groundwater marker and “Illustrative cutaway” note remain visible. Exact model bucket percentage appears in evidence details. The tubewell equipment keeps its physical silhouette in both modes; only allocated flow cues and quantity objects change size.

## Art and motion

The fixed side view uses an original procedural soil texture, uneven layer horizons, mineral flecks, a saturated-sediment tint, surface pooling and a connected tubewell. These are schematic representations. Wind and rendered travel distances add no water to the reducer.

The field contains 96 instanced representative clumps with deterministic variations in height, lean and shade. Each clump uses curved stems and tapered leaf ribbons. Rice has branching panicles; wheat has compact ears and awns. Growth, grain formation, ripening, cutting, root depth and residue remain sampled from the deterministic timeline. Detailed botanical plants occupy the foreground of the field view; the 100 g view uses one large representative plant. The camera moves closer during seedling and fallow stages while keeping the ground line at 65% of scene height. Crop height is fitted with additional headroom at every growth stage, and rain clouds occupy the reserved sky above the canopy. Underground depth is compressed into the remaining 35%, retaining roots and groundwater. The above-ground pump scales with framing so it stays proportionate to seedlings.

Rain, pumping, infiltration, uptake, delayed recharge and fertilizer cues follow recorded model flows. The camera has a reserved scene region instead of spanning behind every control. Crop-care explanations are accessed through Menu, with cumulative objects visible in the scene. Fertilizer uses a bag/granule illustration; treatment ledgers use container illustrations.

Pause freezes event time as well as date progression, and the scene stops rendering after any camera transition settles. Reduced motion makes view changes immediate and uses static flow cues. Theme, scenario and resize changes invalidate a static frame so the scene stays current. Hidden tabs stop rendering and time progression. Low sustained frame rates reduce rendering pixel ratio.

## Harvest and results

The small harvest reference updates its filled grain bowl during processing; full quantitative results open on tap. Guided rice harvest holds at day 122: cutting, grain separation, husk removal and bowl filling. Wheat harvest holds at the rotation endpoint: cutting, separation and bowl filling. This is an explanatory visual sequence, not a mechanistic processing simulation. Rewinding or seeking samples harvest/cutting state directly; it does not restart an unrequested timed sequence.

The bowl represents 100 g dry food, with rice shown as uncooked milled grain and wheat as dry grain. A zero modeled harvest leaves the bowl empty and states that inputs were still used. Final results compare crop pumping, allocated rainfall and whole-acre edible dry output. Before the endpoint, season-end numbers are labeled projections. Neither view claims a lifecycle water footprint or equal nutritional portions.

## Layout and access

Desktop and phone use a compact header, dominant scene and compact bottom dock. At 390×844 the scene occupies about 79% of the viewport; at 390×667 about 73%; at 320×568 about 68%. Mature crops fill the upper scene with a clear margin above the grain heads, with roots/soil and groundwater below. Harvest and final actions are small controls rather than narrative cards. Short or enlarged-text screens may scroll. A ResizeObserver fits the renderer after container layout changes. Dialogs are native modal dialogs; Escape and visible close buttons dismiss them. The timeline has keyboard arrows, Shift + arrows, Page Up/Down and Home/End controls. Visible language switching, persistent themes and reduced motion remain available.

Text explanations, model quantities, chapter controls, comparisons and the bowl work without WebGL; a fallback explains the unavailable field rendering. Independent Punjabi review, real screen-reader testing, formative layperson testing and named-phone performance measurements remain external validation tasks.
