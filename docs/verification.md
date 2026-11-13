# Verification — 2026-11-13

Status: version **0.1.0** submitted to Chrome Web Store on 2026-11-13; dashboard confirmed **Pending review**. Automatic publication is disabled. The extension is not published yet. OpenSpec change [twitch-vod-mvp](../openspec/changes/archive/2026-11-13-twitch-vod-mvp/tasks.md) was archived at the user's request on 2026-11-13, with 16/21 tasks complete. Main specs were synchronized; the five remaining verification tasks were preserved as incomplete. Unchecked tasks include implementation that exists but still lacks the remaining acceptance evidence required by its task.

### Checks waived by the user — 2026-11-13

Real advertising checks and physical mouse-wheel/touchpad checks are skipped for this release by explicit user decision. They are not pending release gates and are not recorded as passed. Product behavior requirements and defensive guards remain unchanged. Other checks in the same tasks remain pending as listed below.

## Automated checks

`npm test`: 14 passing tests using Node's test runner and happy-dom. They exercise interval validation and safe integer conversion, 0/1/6/7 counts, independent defaults, corrupt storage recovery, persistence across store consumers, local change delivery, editor mouse actions and invalid drafts, storage failure/retry, seek boundaries and play/pause preservation, event isolation, lifecycle cleanup and simulated ad rejection. Idle-visibility tests cover the 3-second timeout, activity resetting it, reappearance, immediate hiding on leave, keyboard versus mouse focus, preservation across settings updates, native wheel defaults and timer/listener cleanup. The user confirmed the updated idle-hiding behavior on real Twitch on 2026-11-13; it was not manually retested by the agent.

The lifecycle test covers VOD → VOD → stream/clip → VOD, replacement media, update delivery and aborting removed listeners. These are fixtures, not real Twitch or physical-device checks.

`npm run package`: builds the self-contained extension and creates `release/vod-buttons-0.1.0.zip`. The archive contains only runtime extension files with `manifest.json` at the root.

## Browser checks actually performed

Native Google Chrome **157.0.8103.40 (Official Build, arm64)**, macOS. This records the observed installed version, not an assertion that the latest stable release was independently established.

- Loaded `dist/` through Load unpacked. Chrome showed **Extension loaded**, the extension enabled and no manifest error.
- Clicking its toolbar icon opened the actual extension options page. Added, moved, removed and reset intervals with mouse controls. Reloading the settings page succeeded.
- On real completed VOD `https://www.twitch.tv/videos/2926833499`, controls appeared when ready. At paused `00:00:09`, +1 min produced `00:01:09`; −5 s produced `00:01:04`. Paused state remained. A forward seek while playing retained the playing state.
- Checked normal, theater and fullscreen. Columns remained in the video area and the native bottom bar remained available. Native pause and fullscreen controls worked.
- Opened two copies of that VOD. Adding two rewind buttons in settings changed both open players from four to six rewind buttons without reloading. Reset restored four buttons.
- Tab moved between real extension buttons, Space activated the focused button and the focus outline was visible. Native playback remained paused.
- Followed Watch live from VOD to the channel: extension controls disappeared. Browser Back returned to the VOD and one set of default controls reappeared.
- On the separate **local fixture**, six-button columns in a 440×230 player had 154 px scroll viewports and 288 px content. Browser scrolling moved the left column from 0 to 134 px without changing the displayed video position. Keyboard focus reached the final right button and scrolled it into view (button bottom 284 px, viewport bottom 288 px).

Store captures: [actual settings](../store/screenshots/settings.jpg), [actual Twitch VOD](../store/screenshots/vod.jpg), both 1280×800 JPEG. Original full-browser references and the local overflow fixture capture remain local and are excluded from Git. Fixture images are not evidence of Twitch compatibility.

## Acceptance evidence and release work

| Task | Implemented / confirmed | Still required |
| --- | --- | --- |
| 1.2 | Real VOD/live container and native control markers observed and recorded | Inspect a real clip and player replacement on Twitch; real ad-marker checks waived |
| 2.2 | Local storage, corrupt data recovery, fresh-consumer persistence tests; real Chrome settings reload | Verify a customized configuration survives a full Chrome quit/relaunch; the user's browser session was not restarted |
| 3.5 | Native overflow, wheel/gesture event defaults, scrollbar styles and browser scroll tested on fixture; physical wheel/touchpad checks waived | Verify access to all six buttons by dragging the scrollbar on a small real Twitch player |
| 3.7 | Context/readiness guards, safe activation checks and simulated ad tests; real advertising checks waived | Confirm safe behavior in real unready and ambiguous VOD contexts; defensive ad markers remain unverified |
| 4.1 | Real basic seeking, modes, two tabs, navigation and keyboard checks above | Complete remaining PRD acceptance items on current stable Chrome, including real clips, boundaries, restart; updated idle hiding was confirmed by the user; ads and physical wheel/touchpad checks waived |
| 4.2 | Final name, original icons, English listing/privacy text, two store screenshots and public privacy/support URLs reviewed; task complete | None for store-material preparation |

The test browser already had other extensions installed; none were disabled or changed for this task. A clean-profile acceptance pass is still advisable. The extension remains installed unpacked for local testing. Agent-created VOD and settings tabs were closed after capture; existing user tabs were preserved.

## Reproduce

Use the [installation instructions](../README.md). Run `npm test` and `npm run package`. Follow the [Twitch integration recheck procedure](twitch-integration.md) for the remaining real-player checks. The development fixture is at `http://127.0.0.1:8765/dev/` when the documented local server is running.

See the [store checklist](../store/listing.md). The public [repository](https://github.com/briginas/vod-buttons), [privacy policy](https://github.com/briginas/vod-buttons/blob/main/PRIVACY.md) and [support Issues](https://github.com/briginas/vod-buttons/issues) were created with the user's approval and linked in the listing. The version 0.1.0 package was uploaded to draft item `hehnhiebaafapanfjnihnegadhemnnbk`. The English description, Entertainment category, icon, two screenshots, permission justifications, no-data-use declarations and reviewer instructions were saved. Distribution is free and public in all regions. Submission succeeded and the dashboard showed **Pending review**. Automatic publication was unchecked before submission; publishing after approval requires a separate manual action. The dashboard states staged items expire 30 days after passing review. Submission evidence is saved locally at `docs/screenshots/store-submitted.jpg` and excluded from the public repository. Remaining acceptance checks above are still open and are not implied to have passed by the store submission.


## Theme and icon update — 2026-11-13

- Added Light (cream) and Dark (plum/peach) using the reference extension palettes. Shared tokens style options and Shadow DOM controls; theme storage is independent of intervals.
- `npm test`: 19 passing tests, including rapid theme selection, save/load errors and retry, external changes, stale initial reads, reset independence, player focus/seek preservation and listener cleanup.
- In-app browser local settings preview: checked both themes, keyboard radio selection, persistence after reload and responsive layouts at observed widths 388, 473 and 1454 CSS pixels. No horizontal overflow; value inputs shrink while units and action buttons remain on the same row. Confirmed the VOD Buttons heading and selected plush icon. These are local preview checks; the updated appearance was not manually retested on real Twitch.
- Selected icon concept 1 (paired plush seek keys); all three concepts are saved in assets/icon-concepts. `npm run icons` generates transparent 16/32/48/128 PNGs from the saved source. Dimensions and alpha were verified.
- `npm run package` rebuilt dist and release/vod-buttons-0.1.1.zip. Strict change validation passed. sharp 0.35.5 is build-only; npm install audit reported zero vulnerabilities.

## Settings header update — 2026-11-13

- Local preview checked at actual CSS viewport widths 763px and 320px. The icon remains left of FOR TWITCH and VOD Buttons; all three vertical centers match within 0.01px, and there is no horizontal overflow.
- The introductory replay/skip sentence is absent. Settings and preview share the same header markup and CSS.
- Screenshot: `docs/screenshots/settings-header.png` (local, ignored by git).
