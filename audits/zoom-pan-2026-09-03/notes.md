# Desktop zoom and pan interaction audit

## Scope

Desktop flyer navigation at fitted size and 200% zoom, including native scrolling, pointer dragging, and active-page tracking.

## Steps

1. **Fitted flyer — healthy.** The native horizontal strip, page arrows, and labeled scrubber provide clear ways to move between pages.
2. **Zoom to 200% — needs attention.** The page geometry grows inside the native scroll container and creates both horizontal and vertical overflow, but zoom currently preserves a ratio across the entire 22-page strip. This can leave the viewport between pages instead of anchored to the active page. A desktop mouse drag does not pan the viewport.
3. **Native pan — partially healthy.** A mouse wheel pans vertically and two-axis scrolling pans horizontally. Vertical panning keeps the active page. Horizontal panning updates the active page when the neighboring page becomes more visible, so an open item list can remain synchronized.

## Recommendation

- Keep the native scroll architecture; it cleanly separates viewport movement from page navigation.
- Anchor zoom to the active page and a normalized focal point within that page, rather than to the full strip's scroll ratio.
- Add mouse pointer drag-to-pan only while zoomed above Fit. Update the viewport's native `scrollLeft` and `scrollTop`; do not translate the page track.
- Use pointer capture and a small movement threshold so a stationary click opens the list while a drag pans and suppresses the click.
- Hold the active page during the zoom relayout, then resume center-based tracking with a small hysteresis so page context does not flicker at boundaries.

## Evidence limits

This pass covers a desktop mouse and native two-axis scrolling. Touch pinch behavior, screen-reader announcements, and full keyboard focus order were not audited.
