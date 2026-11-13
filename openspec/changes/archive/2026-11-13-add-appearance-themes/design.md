# Design

## Context

See proposal.md for motivation. Vanilla JS modules render settings and an isolated Shadow DOM overlay. Seek settings have an existing versioned schema and subscribers. The reference's current artwork is assets/icon-plush.png, and src/lib/appearance.css defines its two palettes.

## Goals / Non-Goals

**Goals:** Share exact palette tokens across settings and overlays, keep storage errors recoverable, preserve focus and independent interval data.

**Non-Goals:** System/automatic themes, localization, restyling Twitch, changing seek timing, or changing seek semantics.

## Decisions

- Store `appearanceTheme` separately in chrome.storage.local. This avoids migrating interval data or losing themes on interval reset. Use `light` fallback; reject invalid writes.
- Define shared palette CSS in an appearance module, mounted under :root on settings and :host inside the overlay shadow root. This keeps a single palette source without adding CSS import handling to the Node test runner.
- Keep interval value, unit and action buttons on a single row at narrow widths, shrinking the numeric input while retaining action button sizes. Size the native unit dropdown to its label and normal text-to-arrow gap, with a decorative arrow inset 14px from its right edge. Use VOD Buttons as the page heading with the selected plush icon.
- Use native labelled radio controls for explicit Light/Dark selection. Apply immediately, serialize saves, and keep a separate theme status/retry so failures do not mask interval status.
- Observe storage with a revision guard against stale initial reads and clean up subscriptions on disposal. Controller updates only the overlay's theme attribute, preserving active buttons, focus and scroll.
- Adapt the development storage shim to support both keys.
- User selected icon concept 1: paired plush rewind/forward keycaps. Save all three concepts, keep the selected PNG as assets/icon-plush.png, and generate 16/32/48/128 PNGs with sharp (build only). Preserve alpha and padding; retain the old SVG as historical artwork, no longer the production source.

## Risks / Trade-offs

- Light controls over bright video → opaque palette surfaces, visible borders and focus outline provide stable text contrast.
- Failed initial reads → show retry in settings and keep safe Light styling without writing defaults.
- The delay reduction was archived first as requested; the style delta retains the now-synced 1.5-second behavior.

## Migration Plan

No interval migration or permission changes. Build and reload the unpacked extension. Reverting restores the prior fixed style while leaving interval storage intact.
