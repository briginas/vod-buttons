# Verification — 2026-11-13

Status: version **0.1.0** uploaded to a Chrome Web Store draft; not yet submitted or published. OpenSpec progress: 15/21 tasks complete. Unchecked tasks include implementation that exists but still lacks the remaining acceptance evidence required by its task.

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

## Remaining evidence and release work

| Task | Implemented / confirmed | Still required |
| --- | --- | --- |
| 1.2 | Real VOD/live container and native control markers observed and recorded | Inspect a real clip and player replacement on Twitch; real ad-marker checks waived |
| 2.2 | Local storage, corrupt data recovery, fresh-consumer persistence tests; real Chrome settings reload | Verify a customized configuration survives a full Chrome quit/relaunch; the user's browser session was not restarted |
| 3.5 | Native overflow, wheel/gesture event defaults, scrollbar styles and browser scroll tested on fixture; physical wheel/touchpad checks waived | Verify access to all six buttons by dragging the scrollbar on a small real Twitch player |
| 3.7 | Context/readiness guards, safe activation checks and simulated ad tests; real advertising checks waived | Confirm safe behavior in real unready and ambiguous VOD contexts; defensive ad markers remain unverified |
| 4.1 | Real basic seeking, modes, two tabs, navigation and keyboard checks above | Complete remaining PRD acceptance items on current stable Chrome, including real clips, boundaries, restart; updated idle hiding was confirmed by the user; ads and physical wheel/touchpad checks waived |
| 4.2 | Release candidate name, original icons, English listing/privacy text and reference screenshots | Complete public privacy/support links and publisher-facing review; two final store screenshots and the listing are saved in the dashboard |

The test browser already had other extensions installed; none were disabled or changed for this task. A clean-profile acceptance pass is still advisable. The extension remains installed unpacked for local testing. Agent-created VOD and settings tabs were closed after capture; existing user tabs were preserved.

## Reproduce

Use the [installation instructions](../README.md). Run `npm test` and `npm run package`. Follow the [Twitch integration recheck procedure](twitch-integration.md) for the remaining real-player checks. The development fixture is at `http://127.0.0.1:8765/dev/` when the documented local server is running.

Before submission, review the [store checklist](../store/listing.md), publish the privacy text at a publisher-owned HTTPS URL, and supply support details. The version 0.1.0 package was uploaded to draft item `hehnhiebaafapanfjnihnegadhemnnbk`. The English description, Entertainment category, icon, two screenshots, permission justifications, no-data-use declarations and reviewer instructions were saved. Distribution is free and public in all regions. No listing has been submitted or published yet.
