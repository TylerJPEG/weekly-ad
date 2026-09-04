# Design QA

## Comparison target

- Source visual truth: `/Users/tylerjohnson/Documents/GitHub/weekly-ad/references/selected-direction.png`
- Desktop implementation: `/Users/tylerjohnson/Documents/GitHub/weekly-ad/references/implementation-desktop-open.png`
- Mobile implementation: `/Users/tylerjohnson/Documents/GitHub/weekly-ad/references/implementation-mobile-open.png`
- Combined comparison evidence: `/Users/tylerjohnson/Documents/GitHub/weekly-ad/references/qa-comparison.png`
- Desktop viewport: 1440 × 1024 CSS px at device scale factor 1
- Mobile viewport: 390 × 844 CSS px at device scale factor 1
- Source pixels: 1487 × 1058
- Desktop implementation pixels: 1440 × 1024
- Mobile implementation pixels: 390 × 844
- Comparison normalization: source and desktop implementation were proportionally normalized into adjacent 720 × 512 regions in the 1442 × 512 combined image.
- Compared state: flyer open, page 1 item list open, fit zoom, scoped scrim active.

## Full-view comparison evidence

The combined comparison confirms the locked structure is present: persistent global header, full-page flyer canvas, right-side desktop sheet, one pagination header, scoped scrim, lower-left zoom controls, and lower-right text-only `Close list` action. The implementation intentionally uses unpolished system UI styling because the current prototype goal is navigation evaluation.

A focused crop was not needed. The controls, page geometry, sheet boundary, pagination header, and scrim are all legible in the full-view comparison, while the supplied flyer itself is used as an unchanged image asset.

## Required fidelity surfaces

- Fonts and typography: neutral system typography preserves hierarchy and readable control labels. It is not a final brand match; this is an intentional P3 deferral.
- Spacing and layout rhythm: global header, native scroll canvas, opposing floating controls, and sheet proportions match the selected structure. Small spacing differences from the generated mock are P3 and do not affect navigation evaluation.
- Colors and visual tokens: high-contrast white controls and sheet on a charcoal viewer canvas make states clear. Brand-token work is intentionally deferred.
- Image quality and asset fidelity: all 22 supplied flyer pages are used directly. The first page loaded successfully at native aspect ratio in browser verification.
- Copy and content: `Weekly Ad`, `Sep 2–8`, `Show list` / `Close list`, and `Page N of 22` are present. The sheet has no duplicate title and no close control.

## Functional verification

- Desktop renders 22 pages in one horizontal native scroll surface. A direct horizontal scroll gesture moved `scrollLeft` to 1152.5px.
- Desktop zoom increased the actual first-page width to 1041px at 125% and expanded the real scroll geometry to 23,470px wide.
- Mobile renders the same pages in one vertical native scroll surface. A direct vertical scroll gesture moved `scrollTop` to 620px.
- Mobile zoom increased page width from 351px to 439px and expanded the native horizontal overflow to 463px.
- Opening the list adds `inert` to the flyer viewport and places the scrim over the scroll region while leaving the header and floating controls available.
- List pagination advanced from page 2 to page 3 and moved the underlying desktop scroll position from 1152.5px to 1970px.
- Selecting page 3 opened `Page 3 of 22`; clicking the scrim dismissed the list.
- First Escape closed the list. Second Escape closed the flyer and restored focus to `Open weekly ad`.
- Browser console errors and warnings checked: none.
- Production build completed and all four Sites packaging tests passed.

## Findings

- No actionable P0, P1, or P2 issues remain for the navigation-prototype scope.
- P3 follow-up: final typography, tokens, button styling, animation, sheet proportions, and product-row design remain intentionally unpolished.

## Comparison history

- Initial functional pass: native desktop and mobile scroll, real-geometry zoom, list blocking, page selection, pagination sync, Escape behavior, and focus restoration passed.
- Pre-QA accessibility refinement: the underlying landing content is inert while the flyer is open, initial focus moves into the flyer, and the scrim has a distinct accessible name.
- Final comparison: no P0/P1/P2 changes were required.

final result: passed
