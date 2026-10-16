# Hyper-realism plan

16 October 2026. Status: CC0 texture library and first renderer pass (soil, HDRI, shadows) done locally; AI-generated images, Blender plant models and perspective camera still to do. Builds on the crop-first composition in REALISM_AND_UX_OVERHAUL_PLAN.md. The layout, quantities, simulation and honesty rules stay as they are; this plan replaces how the scene *looks*.

## Where we are

- Every visual is procedural code in `app/scene3d.js`: tube stems, ribbon leaves, sphere grains, canvas-drawn soil, a gradient env map. Flat-coloured `MeshStandardMaterial`, no textures beyond the soil canvas.
- Orthographic camera, no shadow maps, no post-processing. Field mode is 96 instanced clumps.
- Ships as one `file://`-safe `index.html` (~0.9 MB) with nothing fetched at runtime.
- Tools on this machine: Blender 5.2.2 LTS (`/Applications/Blender.app`), Node, Python 3. No image-generation API key is set.

The gap to "realistic" is mostly material and light, then geometry. Better leaf shapes under flat light will still look like a diagram; textured, translucent leaves under a real sky with soft shadows and AO already read as photographic.

## Target look

Late-morning Punjab light: hazy warm sky, soft long shadows, leaves that glow when backlit, wet mud with sky reflections in puddled paddy, dusty dry soil in wheat. The cutaway reads like a museum soil monolith: alluvial loam bands, root hairs, moist darkening above the water table, sand and gravel in the saturated zone. Tubewell is a real mono-block pump on a brick plinth with a delivery pipe into a pucca outlet (khal). Windbreak of poplar/eucalyptus in aerial haze.

The grounding reference is real photography: IRRI growth stages (already in `assets/reference-only`), PAU package-of-practices images, and Punjab field photos. Botanical accuracy beats cinematic flourish.

## Tool roles

| Tool | Used for | Not used for |
|---|---|---|
| Image generation (Imagen 3, or gpt-image / Flux if preferred) | Look-dev frames per stage; tileable albedo for soil, mud, straw, brick, rust, concrete; leaf and glume texture atlases; soil-horizon strip | Runtime "photos"; HDRI skies (equirect output is unreliable); anything presented as a real record |
| Blender 5.2, scripted with `bpy` (headless, reproducible) | Plant models per growth stage, LODs, impostor cards; tubewell, sacks, containers; baking normal/AO/roughness; glTF export | Hand-sculpted one-offs that can't be rebuilt |
| Image-to-3D (Hunyuan3D / Tripo / Meshy) — optional | Hard-surface props from a concept (pump, sack, jerrycan), then retopologised in Blender | Plants: thin leaves come out as blobs |
| CC0 libraries (Poly Haven, ambientCG) | HDRI sky, fallback PBR sets where generation is weak | — |
| three.js r182 (already bundled) | Physical materials, shadows, post-processing, instancing/LOD | — |

## Phases

### 0. Decisions before work starts

1. **Image generator and key.** Imagen 3 needs a Gemini/Vertex API key in the environment. Generated assets carry SynthID; record prompt, model and date per asset in `assets/ATTRIBUTION.md`.
2. **Size budget.** Realistic textures and meshes will not fit in 0.9 MB. Options: (a) standalone stays procedural, hosted build lazy-loads a high-quality asset pack (recommended); (b) embed everything as base64, ~12–20 MB `index.html`.
3. **Device floor.** Proposed: 30 fps on a mid-range 2023 Android at DPR 1.6; desktop 60 fps.
4. **Uncommitted work.** The working tree holds changes after the revert of 25d2fef. Commit or stash them first so the realism work starts from a known state.

### 1. Reference and look-dev (≈2 days)

- Collect 30–50 licensed or link-only reference photos per crop and stage into `assets/reference-only/` (not shipped).
- Generate look-dev frames with the image model for: rice seedling, tillering, booting, heading, grain fill, maturity, stubble+straw; the same for wheat; underground cutaway; tubewell; sky/haze. Same camera framing as the app (65/35 canopy/underground split, 390×844 and desktop).
- Review against references, especially panicle/spike structure, awns, leaf ligule colour, tiller counts. Reject frames that are botanically wrong. Approved frames become the acceptance targets in `docs/look-dev/`.

### 2. Texture library (≈3 days)

Generate, make seamless (offset + inpaint seam), then derive normal/roughness/AO in Blender bake or a height-from-albedo pass. Output 1K/2K KTX2 (Basis UASTC for normals, ETC1S for albedo).

- Ground: puddled paddy mud (wet, reflective), dry tilled wheat soil, straw-mulched surface, burnt residue, bund (daul) grass.
- Cutaway: one tall vertical strip — Ap horizon, B horizon with kankar, moist zone, capillary fringe, saturated sand/gravel. Tiles horizontally only.
- Plant atlases (alpha + translucency mask): rice leaf blade with midrib, wheat leaf, leaf sheath, rice spikelet/husk, wheat glume, awn, root hair card; each in green, yellowing and straw-gold variants.
- Props: brick, cement plaster, painted and rusted steel, PVC, jute sack weave, plastic container.

### 3. 3D models in Blender (≈5 days)

Everything built by a script in `assets/src/blender/` so models can be regenerated after tuning.

- **Plants.** Geometry Nodes rig per crop: tiller count, height, leaf count/angle/droop, panicle or spike density, grain ripeness as inputs, driven by the same stage table as `Sim`. Leaves are curved quad strips (8–16 segments) with the atlas, not single cards. Export per stage:
  - Hero LOD0 (15–30k tris) for 100 g mode and foreground clumps.
  - LOD1 (3–5k) for mid-field.
  - Octahedral impostor cards for far field, so Field mode can show thousands of hills instead of 96.
  - Stages share topology inside each crop, so growth morphs (blend shapes) instead of popping. The existing shader growth/wind stays as the fine motion layer.
- **Roots.** Separate fibrous-root meshes per stage with root-hair cards, sized to the current root-depth model.
- **Tubewell set.** Mono-block motor pump, starter box, delivery pipe, bore casing visible in cutaway, brick outlet chamber, field channel, electric pole and cable.
- **Inputs.** Urea/DAP sack, small packet, sprayer, measuring jug, scaled per the existing quantity rules.
- **Context.** Bunds, distant windbreak trees (cards), a farm hut silhouette.
- Export glTF 2.0 with meshopt compression and KTX2 textures; one `.glb` per crop plus one for the set.

### 4. Rendering upgrade in `app/scene3d.js` (≈5 days)

- **Camera.** Switch to a perspective camera with a long lens (~25–30° FOV) fitted to the same canopy/underground bounds, keeping the cutaway readable. Ortho stays as a reduced-quality fallback.
- **Light.** HDRI sky (CC0) for environment and background, sun matched to its direction; PCF soft shadow map from the sun with a tight frustum around the hero area; contact shadows under plants.
- **Materials.** `MeshPhysicalMaterial` for leaves: alpha-tested atlas, `transmission`/thin translucency for backlight, sheen for wheat glaucous bloom. Mud: low roughness with a ripple normal and screen-space or planar reflections in flooded paddy. Pump: proper metal/rust PBR.
- **Water.** Field flood surface with reflection + Fresnel; groundwater cutaway with a subtle refracting, moving caustic layer instead of a flat band; pipe flow as particles with motion-blurred streaks.
- **Atmosphere and post.** Height fog for aerial perspective, GTAO/SSAO, mild bloom on the sun and wet highlights, filmic grade (keep ACES), slight depth of field in 100 g mode. Use three.js `EffectComposer` passes added to the vendor bundle.
- **Field scale.** GPU instancing with per-instance colour/height jitter, LOD switching by distance, impostors at the back; row spacing matching transplanted rice (20×15 cm) and drilled wheat (~22.5 cm rows).
- **Loader.** `GLTFLoader` + `KTX2Loader` + `MeshoptDecoder` added to the bundle; assets load progressively behind the current procedural scene, which remains the instant first frame and the WebGL fallback.

### 5. Quality tiers and performance (≈2 days)

- Three tiers chosen at start and adjusted by the existing slow-frame counter: High (all of §4), Medium (no SSAO/reflections, LOD1 nearer), Low (today's procedural scene plus textures).
- Budgets: ≤150 draw calls, ≤600k visible tris high tier, ≤120 MB GPU texture memory on phones.
- Reduced-motion and paused states still freeze wind, water and particles.

### 6. Build and packaging (≈1 day)

- `assets/src/` (prompts, blend scripts, raw generations) is not shipped; `assets/build/` holds compressed `.glb`/`.ktx2`.
- `build.py` hashes assets into the release version so auto-update picks up new art; publish `assets/build/` alongside `index.html` and `version.json`.
- If option (b) was chosen, inline assets as base64 and drop lazy loading.

### 7. Verification (≈2 days)

- Existing node tests and Playwright journeys stay green; `Scene3D.info()` gains tier, loaded-asset and triangle counts.
- New Playwright capture of every stage at 390×844 and 1440×900, compared side by side with the approved look-dev frames; a reviewer signs off per stage.
- Botanical review against IRRI/PAU references (tiller numbers, panicle droop at maturity, wheat awn length, leaf colour change).
- Performance runs on a real mid-range phone; record fps per tier in ACCEPTANCE_RESULTS.md.

## Honesty rules that still apply

- The cutaway stays labelled "Illustrative cutaway". Realistic texture must not imply measured aquifer depth or Punjab reserves.
- Generated imagery is never presented as photographs of real fields or farmers.
- Quantity containers keep their stated magnification; realism does not change the scale rules.

## Risks

- **Size and load time**: mitigated by tiers, KTX2/meshopt, and the procedural first frame.
- **AI botanical errors**: image models routinely draw wrong panicles and awns; every generated texture and frame is checked against real references before use.
- **Phone GPUs**: alpha-tested leaves with shadows are expensive; impostors and tiering are required, not optional.
- **Licensing**: keep generated, CC0 and reference-only material separated and recorded.

## Rough total

About 20 working days for one person, with the first visible win (HDRI, shadows, textured soil and leaves on the current geometry) available after phases 0–2 plus part of 4, roughly a week in.

## Decisions (16 October 2026)

- **Packaging: option (b).** All assets are embedded in `index.html` as WebP data URIs (`const ASSETS`), so the standalone `file://` build keeps working. Expect 12–20 MB once the full library is in; budget: ≤16 MB for the page.
- **Generator:** Imagen 3 via the Gemini API (`GEMINI_API_KEY`). Prompts, per-item tiling and PBR ranges live in `assets/src/prompts.json`.

## Pipeline (phases 1–2)

```sh
export GEMINI_API_KEY=...
python3 assets/src/generate.py --list                       # 12 look-dev frames, 10 textures, 5 atlases
python3 assets/src/generate.py --kind lookdev --n 4         # candidates -> assets/src/generated/<id>/ (ignored)
# review against references, copy the approved one to assets/src/selected/<id>.png
/Applications/Blender.app/Contents/MacOS/Blender -b --python assets/src/process.py
python3 assets/src/pack.py                                  # WebP + assets/build/pack.json
python3 build.py                                            # inlines pack.json into index.html
```

`process.py` makes textures seamless (per-axis cross-fade), derives normal, AO and roughness maps, and cuts atlas alpha from the white backdrop. `--selftest` proves it without an API key (seam error 0.005 vs 0.003 interior; alpha 0–1). The renderer does not consume `ASSETS` yet; that is phase 4.

Not covered here: KTX2 (no `toktx`/`basisu` installed; WebP decodes to full-size GPU textures, so 2K sets cost memory), and the licence check of generated output, which still needs a human review.

## Update: CC0 route taken (16 October 2026)

No image-generation key was available, so the texture library uses CC0 sets (`assets/src/cc0.json`, `cc0.py`). 40 maps plus a 1K HDRI are embedded; `index.html` is 8.1 MB.

Done in `app/scene3d.js` (`Look` helper; falls back to the old procedural look when `ASSETS` is empty):
- Real PBR soil: topsoil mud, loam, kankar gravel and wet sand on the four cutaway strata, plus normal, roughness and AO maps.
- Bug fix: the strata meshes were wound back-facing and culled, so the wavy horizons never rendered. They are now `DoubleSide` and visible.
- HDRI image-based lighting (sun clamped, fill only), a soft sun shadow map for leaf self-shadowing, textured acre-view ground and pump plinth, normal/roughness detail on the pump paint.

Still open: leaf/panicle atlases and Blender plant models (phase 3), perspective camera, flooded-paddy reflections, SSAO/bloom/fog (phase 4), quality tiers, phone performance runs. Browser journey tests were not rerun; simulation and metrics tests and `validate_package.py` pass.

## Update: plants (phase 3, first pass)

`assets/src/plants.py` builds rice and wheat leaf textures (fibres, midrib, veins, waxy bloom on wheat; albedo, normal, AO/roughness) and a husk texture, plus rice and wheat spikelet meshes modelled in Blender with bmesh. `scene3d.js` now builds leaves as UV-mapped blades (V-folded at the midrib, rippled edges, twist) with the leaf texture, uses the spikelet mesh for every grain, carries UVs through `mergeStatic`, and textures the 96-clump field blades.

Limits of this pass: leaves are a few pixels wide at the current camera, so the gain shows mainly in silhouette and shading, not visible veins; there are no full Blender tiller models, no per-leaf colour variation, and field-mode panicles are still flat triangle soup. Next: a perspective close-up camera for 100 g mode so the textures resolve, then full tiller models (stem, sheath, nodes) exported from Blender.
