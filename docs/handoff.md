# Weekly ad navigation prototype

This prototype evaluates navigation behavior rather than final visual styling.

## Interaction model

- Opening the weekly ad locks the underlying page and shows a full-viewport dialog.
- At widths below 900px, flyer pages use one native vertical scroll surface.
- At widths of 900px and above, flyer pages use one native horizontal scroll surface.
- There is no carousel or snapping; the most-visible page is continuously identified from native scroll position.
- Desktop adds viewport-edge previous and next controls for sequential page movement.
- A bottom-center track contains a draggable `Page N of 22` thumb that reports the most-visible page and scrubs the native horizontal scroll position.
- Left and right arrow keys mirror the edge controls unless focus is on the scrubber.
- The edge controls and scrubber remain available while the item list is open.
- The page most visible in the viewport supplies the default context for `Show list`.
- Selecting a page opens its item sheet directly.
- The item list is a nonmodal companion region: it reserves space beside the flyer on desktop and below it on mobile without blocking native flyer scrolling.
- Scrolling, scrubbing, or paging the flyer updates the open list to match the most-visible page.
- `Close list` closes only the companion region.
- Escape closes the item sheet first, then the full flyer.
- The global `Close` action exits the entire flyer from any state.

## Zoom behavior

- Mobile browser pinch zoom remains enabled through the standard viewport configuration and unmodified touch behavior.
- The explicit zoom controls resize the flyer page geometry instead of applying a transform.
- Enlarged pages therefore remain part of the native scroll surface and can be panned normally.
- Desktop mouse dragging pans the native scroll surface in both axes when zoom is above `Fit`; it does not translate or advance a carousel.
- A six-pixel movement threshold separates panning from page activation, so a stationary click still opens the item list.
- Zoom preserves the focal position within the active page rather than a ratio across the entire multi-page strip.
- Active-page observation pauses during zoom reflow so zoom cannot accidentally change the list context.
- `Fit` restores the breakpoint-appropriate fitted page size.

## List paging

- The list contains one header: previous page, `Page N of 22`, and next page.
- Paging updates the list context and scrolls the same native flyer surface to the corresponding page.
- Closing and reopening the list preserves the last selected page.

## Production translation

The behavior can map to Vue components such as `WeeklyAdOverlay`, `FlyerViewport`, `FlyerPage`, `ViewerControls`, and `PageItemPanel`. Keep scroll ownership and active-page derivation in `FlyerViewport`; list and zoom state should not replace it with carousel state.
