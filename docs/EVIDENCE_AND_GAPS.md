# Evidence and limits

## What was established
The package uses primary PAU crop manuals, official PAU variety/advisory pages, an IMD station normal, IRRI morphology/milling references and an ICAR-hosted PAU wheat study. Full URLs, access dates and downloaded-manual hashes are in data/sources.json. Source editions matter: the same PAU URL can later serve a newer edition.

| File | Evidence | What is deliberately not claimed |
|---|---|---|
| crops.json | Variety maturity/yield and seed anchors; established botanical sequence | Intermediate day boundaries are not observed PR 126/PBW 826 phenology |
| inputs.json | Selected baseline schedules and conditional product examples | A comprehensive spray program; compulsory pesticide use; current registration verification |
| irrigation.json | PAU scheduling/depth rules and rainfall response | Fixed universal litres per kg for either crop |
| rainfall.json | Ludhiana station 1991–2020 monthly normals | Actual 2027 weather, a forecast, or a Punjab-wide average |
| model_assumptions.json | Explicit design configuration | Measured aquifer storage, recharge rate, daily ET, or calibrated yield response |

## Pinpoint locations
- PAU Kharif 2026: printed pp. 4–5 for nursery (PDF pp. 12–13); printed p. 10 for fertilizer table (PDF p. 18); irrigation begins printed p. 11 and continues p. 12; leaf-folder section PDF p. 23. Preserve the conditional wording in the manual.
- PAU Rabi 2025–26: printed pp. 9–10 for fertilizer table and schedule (PDF pp. 17–18); printed p. 16 irrigation (PDF p. 24); printed pp. 17–18 pest control. Check surrounding context before extending a product option.
- PAU variety sources: PR 126 comparison row, PBW 826 release paragraph.
- IMD station 42099: 1991–2020 monthly table, Jan–Dec and annual row. Source reports annual 791.1 mm; rounded monthly values total 791.3 mm. Do not silently adjust the months to hide this.
- IRRI milling: multi-stage modern-mill row. Total edible milled rice includes broken grains; head rice is a separate measure. 0.67 is our chosen scenario value inside the published interval, not a PR 126-specific result.

## Scope and reproducibility
The selected rice system is transplanted non-basmati PR 126, not direct-seeded rice, basmati or Pusa 44. Selected wheat is conventionally sown, irrigated, timely PBW 826. A field soil test is not available; the baseline assumes medium fertility and sufficient P/K for the rice phase after prior wheat. Actual soil deficiency, cultivar and establishment method require another scenario. The final default bowl comparison is equal dry mass, not equal calories or equal cooked volume.

## Remaining research for a calibrated edition
1. Cultivar-specific phenology by sowing date/thermal time; stage lengths currently remain illustration timings.
2. Measured daily evapotranspiration, percolation and irrigation volumes for the chosen field/system; current buckets are teaching assumptions.
3. Local aquifer geometry, specific yield, recharge lag, lateral flows and surrounding pumping; no finite one-acre aquifer is claimed in reality.
4. Measured yield-response functions and pest/weed economic loss relationships; current coefficients teach tradeoffs only.
5. Nursery manure and seed-treatment inventory if a full lifecycle-input inventory is desired; omitted from current bag totals. This omission should be visible in field details.
6. PR 126-specific processing recovery and grain moisture standardisation; IRRI generic milling range is currently used.
7. Contemporary product registration/label constraints and local resistance before using the app for actual treatment advice. Stored product examples remain attributed to their source edition.
8. Fully reviewed Punjabi translations and full wheat-stage image licensing.

These gaps do not prevent the requested game from being built. They prevent presenting the first version as a scientific predictor. Codex should implement the explicit illustrative mode now and retain these items as a calibration backlog.

## Image policy
Use original SVG/Canvas art for runtime. The IRRI reference image has a non-commercial/share-alike license; retain attribution and license alongside any included reference copy. Do not embed it in a commercial product without permission or a compatible replacement. PAU and ICAR publication images are linked references only; public access does not establish reuse permission. No claim of institutional endorsement.
