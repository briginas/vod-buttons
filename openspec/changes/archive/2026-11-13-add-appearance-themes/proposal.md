# Proposal

## Why

VOD Buttons currently has a single fixed dark appearance. Viewers should be able to choose the same warm light and plum dark styles as the adjacent watch-youtube-with-friends extension.

## What Changes

- Add an accessible Light / Dark theme selector to settings, defaulting to Light as in the reference extension.
- Reuse the reference palette and rounded surfaces for settings and isolated player controls.
- Persist appearance separately from seek intervals, apply it to open VODs and settings tabs, and report save failures with retry.
- Prepare three plush icon concepts and install the user-selected variant 1 (paired rewind/forward keycaps) in all extension icon sizes.

## Capabilities

### New Capabilities

- `appearance`: Two shared themes with local persistence and live application.

### Modified Capabilities

- `vod-seek-controls`: Replace the fixed dark button style with the selected appearance; preserve the already implemented 1.5-second idle behavior from reduce-controls-hide-delay.

## Impact

Settings markup/styles, a shared appearance module, content/controller/overlay integration, development preview storage, targeted tests and README. No new runtime dependencies or permissions. Use sharp as a build-only dependency to rasterize the saved selected artwork reproducibly.
