# Experience, views and UI overhaul — plan

16 October 2026. Status: implemented 16 October 2026; see "Implementation notes" at the end for what differs from this plan. Builds on the realism work in HYPERREALISM_PLAN.md (textures, HDRI, shadows, textured plants). The simulation, metrics and evidence rules stay as they are; this plan changes how people move through the story and how the interface is built.

## What is wrong today

These problems come from this session's screenshots at 375×812 and 900×1100.

- **One camera does every job.** A single orthographic side view has to serve as the acre field, the plant close-up and the underground cutaway. The field looks like a stage flat, the close-up never gets close enough for the leaf textures to show, and the cutaway shares its frame with both.
- **One switch does two jobs.** Field / 100 g changes the camera framing *and* the quantity basis. People can't look closely at the plant while keeping whole-field numbers, or the other way round.
- **Overlays collide.** The four input cards sit on top of the cutaway and the pump. The "Illustrative groundwater" tag slides up under the header. The stage title, the welcome copy and the "Soil & roots" chip all float over the sky with no shared grid.
- **The dock is dense.** Units, two metrics, Play, the date, Next, the slider and month ticks are packed into about 120 px. On a phone the metric labels wrap and the month labels are about 8 px.
- **Story and Explore are hard to tell apart.** Both use the same screen. The story is the same timeline playing faster, with no camera direction or chapter structure you can see.
- **Details open in modal dialogs.** These cover the scene they describe and break the connection between a number and the object it belongs to.
- **The code is monolithic.** `application.js` is 184 very long lines mixing state, DOM and copy, and `style.css` has 1,100 lines with 7 media queries. Every UI change risks breaking something else.
- **Rendering issues that show in the UI:** field-mode panicles blow out to flat yellow, the sky is a flat gradient, and nothing on screen anchors a label to the object it names.

## Principles

1. **The field is the interface.** Information is attached to things in the scene (the pump, the roots, the water table, the grain), not placed in panels next to it.
2. **One clock, several lenses.** Date and scenario are global. Views only change *where you look*, never *what is true*.
3. **Quantity basis is a unit, not a camera.** "Per acre" and "Per 100 g" relabel numbers everywhere. They never move the camera.
4. **Progressive detail.** A glance gives one label and one number. A tap opens a sheet with the full ledger, the source and the assumptions.
5. **Honest by construction.** "Illustrative cutaway", magnification notes and source links stay attached to the visuals they qualify.

## The experience model

### Views (lenses)

All views share the date, crop, straw scenario and units.

| View | Camera | What it is for | Key on-scene annotations |
|---|---|---|---|
| **Field** | Perspective, eye height ~1.6 m, looking across the acre to a hazy windbreak | Scale and the season's look: flooded paddy, drilled wheat rows, straw, burning | Field size, standing water depth, weather event |
| **Plant** | Perspective macro, 35–50 mm equivalent, shallow depth of field | Growth stages and organs, where the realism work shows | Tillers, flag leaf, panicle/spike, grain fill %, stage name |
| **Underground** | Orthographic or long-lens cutaway (today's strength, kept and cleaned up) | Roots, soil horizons, water table, tubewell, recharge | Root depth, water table depth, pump on/off, "Illustrative cutaway" |
| **Water & inputs** | 2D screen over a blurred, dimmed scene | The ledger: pumped water vs rain, fertilizer, weed and pest care, cumulative to date | Every value tappable to its source |
| **Harvest** | Plant view, then a cut to the bowl | End of season: grain, straw, 100 g dry food, water per bowl | Comparison with the other crop and the straw choice |

The view switcher is a segmented control: **Field · Plant · Underground · Ledger**. Harvest is not a tab; it opens automatically at a harvest date, or from the timeline's harvest marker.

### Story vs Explore

- **Story (about 90 s):** a directed sequence of chapters. Each chapter sets the date range, view, camera move and one line of copy, for example *Transplanting → Field*, *Tillering → Plant*, *Roots reach water → Underground*, *Pumping season → Underground + Ledger*. Chapter cards show progress (1/9). Pause, skip and back work at any time. The scripted camera stops the moment the user touches a view or the timeline, then the story offers **Resume story**.
- **Explore:** the same views, free camera within limits (orbit ±25° in Field and Plant, pinch zoom in Plant), the timeline scrubber, and event markers to jump to.

### Timeline as the spine

- The scrubber shows season bands (Rice · Fallow · Wheat), month ticks at a readable size, and **event markers**: transplanting/sowing, irrigation runs, rain, fertilizer, harvest, straw handling. Tapping a marker jumps there and opens its sheet.
- The current stage name rides above the thumb. Keyboard: arrows step a day, PageUp/PageDown a chapter, Home/End the season.

## Layout

### Phone (≤ 480 px wide)

```
┌───────────────────────────────┐
│ ◧  Rice | Wheat        ⋯       │  48px top bar: crop, menu
├───────────────────────────────┤
│  Tillering · Jul 23           │  stage chip (one line)
│                               │
│        [ 3D scene ]           │  ~68% of height, edge to edge
│     anchored labels ↘         │
│                               │
├───────────────────────────────┤
│ Field  Plant  Under  Ledger   │  44px view switcher
│ ▷  ━━━━━●━━━━━━━━━━  Jul 23   │  play + scrubber with markers
│ 987,779 L pumped · 0 kg grain │  one metric row (tap → ledger)
└───────────────────────────────┘
```

Details open as a **bottom sheet** (peek at 40%, expand to 90%, drag to dismiss) that keeps the top of the scene visible. The input cards are removed from the scene and their content moves to the Ledger view and the metric row.

### Tablet and desktop (≥ 900 px)

The scene sits on the left at about 70% width, with a 320–380 px **side panel** on the right holding the stage card, metrics and ledger. Sheets open in the side panel, not over the scene. The timeline runs full width under both.

## Components

- **Top bar:** crop toggle, language, menu (sources, straw comparison, preferences, about).
- **View switcher:** segmented control with icons and text labels, matching the visual style of the crop toggle.
- **Stage chip:** stage name and date, tappable to open stage details.
- **Anchored annotation:** a label with a leader line that tracks a 3D point projected to screen each frame. It hides when off-screen or occluded, and labels that would collide are merged into a "+2" bubble. This replaces `#groundwater-marker`, `#soil-status` and `.cutaway-note`.
- **Scrubber:** season bands, event markers, current stage label, accessible as a range input with `aria-valuetext` ("Day 46, Jul 23, tillering").
- **Metric row / metric card:** value, unit, label and basis ("per acre" / "per 100 g"), tapping through to the ledger line.
- **Bottom sheet / side panel:** one component, two placements. Focus is trapped while it is open, Escape closes it, and focus returns to its trigger.
- **Ledger table:** rows grouped by category with cumulative totals, sparklines over the season, and a source link per row. Kilograms, millilitres and litres are never summed together.
- **Comparison card:** rice vs wheat and burn vs retain, showing the same metrics side by side.
- **Chapter card (story):** step count, one line of copy, and Back / Pause / Next.

## Design system

Defined once as CSS tokens on `:root`, with a dark set under `prefers-color-scheme` and `[data-theme]`.

- **Colour:** neutrals (ground, surface, ink, muted, line) plus semantic colours with fixed meanings: `--water-pumped`, `--water-rain`, `--groundwater`, `--fertilizer`, `--weed-care`, `--pest-care`, `--grain`, `--fire`. The same colour is used in the scene effects, the ledger, markers and the legend. All text pairs meet WCAG AA in both themes.
- **Type:** one sans for UI (system stack) and one serif for stage titles only. Scale is 12 / 14 / 16 / 20 / 28 / 36. No text below 12 px, so month labels grow from 8 to 12. Gurmukhi uses Noto Sans Gurmukhi, subset and embedded (~60–90 KB) so Punjabi doesn't fall back to whatever the device happens to have.
- **Space and shape:** 4 px grid, radii 8 / 12 / 20 / full, two elevation levels.
- **Motion:** 150 ms for controls, 250 ms for sheets, 700–900 ms for camera moves (ease-in-out). Reduced motion replaces camera moves with 150 ms crossfades and freezes ambient motion.
- **Icons:** one inline SVG set at 1.5 px stroke for views, inputs and events.

## Rendering work the UI depends on

- **Perspective cameras for Field and Plant.** Underground keeps its fitted orthographic framing. Transitions interpolate position and target, and a dissolve hides the projection switch.
- A `Scene3D.anchor(name)` API that returns screen positions for named points (pump outlet, root tip, water table, panicle, field edge), for the annotations.
- Scene-side fixes: panicle exposure in Field, a real sky (HDRI backdrop or a better haze gradient), and depth of field in Plant.
- A **text description of the scene** generated per date for the canvas's `aria-label`, so screen-reader users get the same facts.

## Code structure

Stay framework-free and keep the single-file `file://` build. Split `application.js` into small modules, which `build.py` concatenates in order:

- `state.js` — one store: date, crop, view, units, scenario, story chapter, playing. Changes go through `set()`, and subscribers re-render.
- `story.js` — the chapter script as data (date range, view, camera preset, copy key).
- `ui/*.js` — top bar, switcher, scrubber, metric row, sheet, ledger, comparison, annotations.
- `copy.js` — all English/Punjabi strings, keyed, replacing inline `tr()` pairs.
- `style.css` is split into `tokens.css`, `layout.css` and `components.css`.

## Phases

| # | Deliverable | Done when |
|---|---|---|
| 1 | Store, copy table, module split; no visual change | All current tests pass against the refactor |
| 2 | Tokens, type scale, top bar, view switcher, metric row, sheet component | Phone and desktop screenshots match the wireframes; contrast check passes |
| 3 | Decoupled units; Ledger view; input cards removed from the scene | Switching units never moves the camera; ledger totals equal `Metrics` output |
| 4 | Perspective Field and Plant cameras, transitions, `anchor()` API, anchored annotations | Labels track objects through camera moves without overlapping at 375 px |
| 5 | Scrubber with season bands and event markers; keyboard model | Every event in the model has a marker; keyboard-only run-through works |
| 6 | Story chapters with camera choreography; Harvest sequence; comparison card | 90 s story runs end to end; touching anything pauses it with a resume offer |
| 7 | Accessibility pass, Punjabi font, reduced motion, 200% text, performance | axe clean; 30 fps on a mid-range phone; Punjabi copy reviewed |

Each phase ships on its own. The Playwright scripts in `tests/` that target today's IDs (`crop-first.js`, `touch-ux.js`, `acre-view.js` and others) are updated in the same phase that changes those IDs.

## Decisions for you

1. **Decouple units from the camera** (recommended). This reverses the coupling chosen in REALISM_AND_UX_OVERHAUL_PLAN.md, where Field / 100 g drives both.
2. **Underground keeps the orthographic "diagram" look**, or moves to a perspective trench cut to match the realistic views.
3. **Embed a Gurmukhi font** (~60–90 KB) for consistent Punjabi rendering.
4. **Story length:** about 90 s across 9 chapters, or a shorter 60 s cut.

## Implementation notes (16 October 2026)

Done: the store/module split (`state.js`, `story.js`, `details.js`, `ui.js`, `application.js`), tokens and a three-file stylesheet, top bar, view switcher, bottom sheet and side panel, decoupled units, the Ledger, season bands and event markers with keyboard stepping, nine story chapters with pause/resume, an embedded Gurmukhi font, a scene description for screen readers, and light/dark contrast checks (all text pairs at least 4.5:1).

Differs from the plan:
- **Cameras.** Field and Plant use one real perspective world (ground, instanced 3D crop hills, sky dome, fog, hero plant) with orbit and zoom. Underground keeps the orthographic cutaway. The older flat field facade is still in `scene3d.js` but is no longer shown. There is no depth of field.
- **Annotations.** The groundwater label and a plant label follow scene points every frame. A general collision-merging annotation system was not built.
- **Copy table.** New strings use `tr(en, pa)` pairs as before; only the story chapters are data-driven. A full keyed copy table was not built.
- **Punjabi** copy for the new chapters, labels and ledger awaits independent review.
- **Straw and fire** on the burn path are rendered in the new field view as ash, smoke and flame shapes; they are simpler than the old facade's effects.
- **Not done:** a real-phone performance run (the preview pane measured 100+ fps on desktop graphics), a screen-reader pass with real assistive technology, and a keyboard-only run of the whole story.
