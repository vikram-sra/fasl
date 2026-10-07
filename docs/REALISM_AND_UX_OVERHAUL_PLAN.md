# Crop-first realism and UX redesign — revised plan

7 October 2026. Supersedes the previous plan. Status: implemented locally; see ACCEPTANCE_RESULTS.md for verification and outstanding external validation. The user's phone screenshot is the principal acceptance reference: the current experience gives text, navigation and a harvest card more prominence than the crop, and fails to keep the underground section visible.

## What went wrong

The previous overhaul optimized narrative and control completeness before composing the actual scene. Passing functional checks did not establish a compelling visual experience.

- The header, standalone story section and large footer compete with the field. The phone footer has a 275 px minimum height.
- The harvest card covers the scene during the interval between crops.
- The camera is not fitted to explicit visible bounds for canopy, roots and groundwater at each viewport size.
- The quantity switch changes numbers, but the renderer receives camera mode instead of quantity basis. Input quantities have no corresponding persistent visual representation.
- Fertilizer and crop-care objects were moved into a drawer. This removed a useful visual explanation.
- The tubewell is a narrow bent tube and small rectangular planes. Its pump, inlet, outlet and ground connection are difficult to recognize.

## Primary composition

The crop and its underground cutaway are the experience. Text supports this scene.

At ordinary text size, target 75–80% of the usable app viewport for the scene, excluding browser chrome and device safe areas. Keep the full surface-to-groundwater cross-section visible before scrolling. Reserve approximately 60% of the scene height for canopy and field surface, and 40% for roots, soil and saturated ground. Mature crops occupy 80–90% of scene width, with a narrow edge for the pump and input objects. Leave roughly 10–12% of the mature-crop scene as headroom above the grain heads, so the stage label does not crowd the canopy.

These are layout targets to validate in screenshots, not claims that plants fill 75% of all pixels. Seedling and post-harvest states must remain biologically honest: move closer to seedlings or show stubble and residue, rather than inventing mature crops at every date.

Phone layout, top to bottom:

1. Compact 48–56 px header: Rice / Wheat, language and an accessible menu.
2. Large continuous scene: one short stage label at its top edge, crop canopy, ground surface, visible roots, soil and groundwater. Small input objects sit along an edge without masking the canopy.
3. Compact 100–120 px control dock: Field / 100 g, play/pause, date and scrubber. Water and grain values sit next to their visual objects or in a single compact row.

On a 390 × 844 CSS viewport, aim for roughly 650 px of scene with a 56 px header and 120 px dock before safe-area adjustments. On a short phone, preserve the scene's underground section and move secondary controls into the menu. At enlarged text sizes, allow scrolling without clipping text or obscuring controls. Desktop retains the same hierarchy with wider field depth, not larger narrative panels.

## Remove the text burden

- Remove the separate headline-and-paragraph story block from ordinary playback.
- Use a single short event label, typically 3–7 words: “Roots reach water”, “Watering the rice”, “Grain turns gold”. Show detail on tap.
- Remove the permanent care sentence, representative-plant sentence and baseline sentence from the main view. Put context in the associated detail panel.
- Keep one small “Illustrative cutaway” label attached to the underground section; retain full assumptions in details.
- Replace the large welcome panel with a visible field and one Start control. Keep help available from the menu.
- Replace the large harvest overlay with a small grain/bowl object near the controls. A results sheet opens only when requested. Harvest animation should show cutting and grain collection in the scene.
- Move straw comparison, sources, playback options and detailed ledgers into the menu or contextual sheets.
- Remove the permanent Field / Plant close-up switch. The main Field / 100 g control drives a coordinated presentation; optional inspection zoom belongs in a secondary control.

## Field / 100 g must change the visible quantities

Use one primary quantity control: “Field” and “100 g”, with accessible names “Whole field: one acre” and “Per 100 grams of dry food”. Keep crop, date, playback state and management scenario unchanged.

In Field mode, show the broad canopy with substantial water and input containers. In 100 g mode, transition toward a small representative cluster while retaining large, readable plants and the underground section. Show smaller allocated water, fertilizer and treatment quantities alongside a 100 g grain reference. This is an explanatory change of presentation, not a claim that the representative cluster produces exactly 100 g.

Restore a small, persistent visual input group: fertilizer sack/granules, labeled treatment container(s), and a water measure. Tap any object for exact amounts and product breakdown. Keep unlike products and units separate; do not add kilograms and millilitres together.

- Derive displayed amounts from the existing metrics allocation: crop input quantity × (0.1 kg / final edible crop output in kg) for the 100 g view.
- Represent cumulative applied quantities at the selected date, with the same definition in both modes. Zero stays visually empty, not a decorative filled container.
- Change both the illustrated container size and its fill. Field mode can use sacks or large measures; 100 g mode uses a small packet, measure or vial. Exact values remain visibly attached.
- Within a shared container type and scale, volume maps to quantity; uniform three-dimensional scaling uses the cube root of volume ratio, not the raw ratio on each axis.
- Across field and 100 g, use explicitly different container capacities and a readable minimum glyph size. True physical ratios would make the small allocation disappear. Do not present the illustrative sizes as a common physical ruler; explain magnification on tap.
- Water measure and moving flow cues respond to quantity mode. The tubewell itself stays a recognizable piece of equipment: changing food allocation does not physically shrink a real pump or its bore.
- Make the switch visibly change container size, capacity, fill and labels together. Respect reduced motion and support repeated toggling without changing model totals.

## Underground is always part of the scene

Use a readable cut face with a continuous ground surface across the screen. Expose branching crop roots, uneven topsoil and deeper soil, wetting beneath the surface, and a clearly visible saturated zone. Keep enough contrast in dark mode for soil structure and roots to remain legible.

Show the water path: underground source → bore pipe → pump → outlet → field → soil/root uptake. Pumping and rainfall cues follow recorded events; they must not suggest unmodeled water. Keep the water-table marker inside the visible frame as its illustrative level changes. Root and aquifer depths use a schematic compressed scale.

Fit the camera to the composed crop-and-cutaway bounds after the scene container has its final size, and whenever that container resizes. Use a ResizeObserver as well as viewport handling. Protect the soil boundary, visible root zone and waterline from footer clipping. Avoid sizing solely from a fixed world height.

## Rebuild the tubewell

Create a coherent, recognizable assembly: concrete pad, motor body with cooling fins, pump housing, pipe couplings, rising bore pipe and discharge elbow/channel. Ground it at the field edge with contact shading and consistent material scale. Use worn painted metal, restrained metal highlights and an appropriately sized concrete base.

Keep the above-ground equipment visibly connected to the underground pipe and put its outlet over the field. Its silhouette must be readable at phone size. Animate discharge only while recorded pumping occurs. No floating pipe, ornamental faucet shape, or disconnected droplets.

## Crop realism priorities

Spend detail on what is large on screen: curved leaves, overlapping stems, branching rice panicles, wheat ears and awns, variation in height and maturity, and visible root structure. Dense mature canopies should read as a field rather than a grid of identical miniature tufts. Use foreground detail and cheaper background instances.

Maintain recognizable seedling, mature and harvested states. Avoid empty middle-of-screen composition between seasons: frame the residue-covered field surface and its underground history. Keep lighting and material contrast sufficient to distinguish leaves and grain in both themes.

## Delivery order and visual gates

1. **Recompose one phone screen first.** Remove narrative/overlay competition, build the compact dock and fit the crop/underground camera. Capture mature rice, seedlings and the exact between-seasons state from the user's screenshot. Pass only when the field and underground dominate without reading instructions.
2. **Connect quantities to objects.** Build the fertilizer/treatment/water visuals and coordinated Field / 100 g transition. Verify labels and fill against metrics at identical dates.
3. **Rebuild the tubewell and water path.** Verify ground contact, connected piping, visible underground source and event-driven discharge.
4. **Polish rice and wheat at the actual screen size.** Improve the canopy and foreground geometry after composition is established; preserve performance through instancing.
5. **Verify the whole rotation.** Check phone and desktop, both themes and languages, short screens, enlarged text, reduced motion, keyboard operation and WebGL fallback. Rebuild the standalone page and update the package manifest after implementation.

Do not declare visual success from browser assertion counts. Inspect matched screenshots before and after at 390 × 844, 390 × 667, 320 × 568 and desktop, covering seedling, mature rice, harvest, the between-seasons frame and mature wheat, in both quantity modes. Record scene coverage, crop readability, underground visibility and overlay obstruction. Keep the main controls comfortably tappable.

Regression checks must verify that quantity toggling changes visual amounts without mutating simulation history, that camera fitting survives container resize, that hidden result cards cannot cover the field, and that reverse scrubbing restores the correct quantities and events. Preserve existing model coefficients, offline loading and deterministic accounting.

Completion means the crop is immediately the focal point, the underground section is visible, the pump is recognizable, and switching Field / 100 g explains quantities through objects with minimal reading. User review of that visual result is separate from automated functional verification.
