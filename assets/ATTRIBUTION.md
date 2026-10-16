# Reference image attribution
“Growth stages of rice” — IRRI Photos / International Rice Research Institute, 3 April 2014.
Source: https://www.flickr.com/photos/ricephotos/13597007274
License: Creative Commons Attribution–NonCommercial–ShareAlike 2.0 Generic.
https://creativecommons.org/licenses/by-nc-sa/2.0/
The included reference JPG, if present, is unmodified. It is a botanical reference, not part of the proposed game artwork. The license applies to that image; it does not constitute institutional endorsement. Any adaptation must observe the image license. Use original artwork for runtime unless the intended use is compatible.
Other official publications and images are linked, not bundled. No reuse license is asserted for them.

## Runtime texture and lighting assets (embedded in index.html)

All CC0 1.0 (public domain); attribution is courtesy, not required. Built by `assets/src/cc0.py` and `assets/src/pack.py` from `assets/src/cc0.json`.

- Textures from ambientCG (https://ambientcg.com): Ground103, Ground109, Ground106, Ground037, Ground054, Ground079S, Gravel043, ThatchedRoof001A, Bricks097, Concrete034, PaintedMetal004, Fabric085. Some are tinted, darkened, green-suppressed or channel-swapped; `tex-cutaway-strip` is composed from several of them.
- Lighting: "Dry Field" HDRI by Greg Zaal, Poly Haven (https://polyhaven.com/a/dry_field), 1K, highlights clamped for fill lighting only.
- The `assets/src/prompts.json` / `generate.py` path for AI-generated images is unused so far; if used, log model and date per asset here.

## Plant textures and spikelet meshes

`assets/src/plants.py` (Blender + numpy) generates the leaf, husk and spikelet assets procedurally. They are original works with no third-party imagery or AI generation: `tex-leaf-rice`, `tex-leaf-wheat`, `tex-husk`, `mesh-rice-spikelet`, `mesh-wheat-spikelet`.

## Gurmukhi font

`assets/fonts/NotoSansGurmukhi-var.woff2`: Noto Sans Gurmukhi (variable, Gurmukhi subset), SIL Open Font License 1.1, from Google Fonts (https://fonts.google.com/noto/specimen/Noto+Sans+Gurmukhi). It is embedded in `index.html` as a data URI so Punjabi renders consistently with no network request.
