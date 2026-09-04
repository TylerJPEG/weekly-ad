# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable prototype decisions

- This prototype exists to evaluate native flyer navigation, zoom, and list-panel behavior. Prioritize working interaction and layout structure over visual polish.
- Mobile uses a native vertical scroll surface. Wide desktop layouts use a native horizontal scroll surface without snapping or carousel state.
- Desktop supplements native scrolling with vertically centered viewport-edge arrows for one-page movement and a bottom-center track containing a draggable `Page N of 22` thumb. These controls remain available while the item list is open. Do not duplicate previous/next controls in the bottom control or show a conventional range-slider thumb.
- Flyer zoom must resize the real page geometry so native scrolling continues to work; do not use a transformed carousel surface.
- Pinch gestures that begin inside the flyer canvas must zoom only the flyer-page geometry while the overlay header, floating controls, and item panel stay fixed. Preserve native one-finger scrolling and browser accessibility zoom outside the canvas; do not disable page zoom globally.
- On desktop, keep flyer pages vertically centered in the available canvas when zoomed smaller than `Fit`; oversized pages remain start-aligned so their top edge stays reachable for native panning.
- Treat the flyer as one continuous document canvas with pages as landmarks, not as a snapping carousel with pages as controlled slide states. During passive drag, wheel, trackpad, or touch scrolling, active-page state observes the viewport and must never force snapping.
- On desktop, mouse drag-to-pan is available at every zoom level on the same native scroll surface. At `Fit` or smaller this naturally moves horizontally; above `Fit` it becomes two-dimensional when vertical overflow exists. A drag must suppress page activation, while a stationary click continues to open the list.
- Anchor zoom to a normalized focal position within the active page and hold that active page through the zoom reflow; do not preserve position as a ratio across the full flyer strip.
- The item list is a nonmodal synchronized companion region. It reserves space beside the flyer on desktop and below it on mobile; do not add a scrim or make the flyer inert while the list is open.
- Continue deriving the active page from native scroll position while the list is open, and update the list to match it.
- A flyer-page click is explicit navigation: always center the clicked page and synchronize the active page, scrubber, and item list. Clicking the active flyer page while its list is open closes the list while keeping that page centered; clicking a different page keeps the list open and switches it to that page.
- During explicit page navigation from page clicks, edge arrows, list pagination, or keyboard page commands, the requested page owns active-page state until the programmatic scroll settles. The viewport observer must not overwrite the pagination label with intermediate pages; direct drag, wheel, touch, or scrubber input cancels that ownership and returns control to viewport-derived state.
- Give the item panel a separating shadow and render its content as scrollable horizontal product rows with a square image, title, and short description.
- The item list has a sticky pagination header and a second pagination control after the final product row. Both contain previous, `Page N of 22`, and next; changing pages from either control resets the list to the top.
- Zoom controls float at the lower-left of the viewable flyer area. A text-only `Show list` / `Close list` floating action button sits at the lower-right. Do not add an icon to this button.
- Treat desktop edge arrows as large Publix-green primary controls with explicit gray disabled states. Treat the lower floating controls as medium-sized controls.
- Keep all lower floating controls on one consistent medium scale: 40px tall with matching 15px semibold labels. Use inset outlines or shadows for scrubber strokes so borders never change or clip the thumb geometry.
- On desktop, visually hide the native horizontal scrollbar while preserving the native scroll surface and all trackpad, Shift-wheel, touch, keyboard, and drag-to-pan behavior.
- Use Publix's current weekly-ad experience (`https://www.publix.com/savings/weekly-ad?promotionType=1&isSneakPeek=false&langId=1&page=1`) as visual grounding for the prototype's overall look and feel.
- Use the reference page's light `#e6e6e6` flyer canvas and a slightly brighter scrubber rail. Keep the scrubber wide, button-like, and visibly progressive rather than resembling a conventional browser range slider.
- Keep the desktop scrubber's outer wrapper unclipped and shadowless. Center a substantial 16px neutral-gray rail beneath the 40px draggable `Page N of 22` control, use solid Publix green for the traversed portion, and place the only elevation on the draggable control so its shadow is never clipped.
- The bottom item-list pagination follows the final list row without a top border, and the last product row has no divider.
- Do not add a close control inside the list sheet. The header close action exits the entire flyer.
