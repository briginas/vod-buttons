# VOD Buttons for Twitch

Replay a moment or skip ahead in Twitch recordings with customizable seek buttons.

## Install for development

Requires Node.js 22+ and Python 3.

```sh
npm ci
npm test
npm run build
```

1. Open `chrome://extensions` in Google Chrome.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this project's `dist` directory.
4. Reload any Twitch tabs that were already open.

After changing code, run `npm run build`, reload the extension on `chrome://extensions`, then reload Twitch. The extension icon opens its settings in a separate tab.

## Use

Open a VOD at `https://www.twitch.tv/videos/…` and hover over the video. The left column rewinds; the right column skips forward. Each button immediately seeks by its labeled interval without toggling playback or pause. Seeking stops at the beginning or end of the recording.

Each side starts with **5 s, 15 s, 30 s and 1 min**. Controls support normal, theater and fullscreen viewing. When a column does not fit, use the mouse wheel, touchpad gestures or its scrollbar to reach all its buttons. Scrolling a column does not seek the video. Controls hide after 3 seconds without pointer movement, presses or scrolling, or when the pointer leaves the player. Move the pointer to show them again. Keyboard focus keeps controls visible; Tab, Enter and Space work with the buttons.

Live streams, clips and players embedded on other sites are excluded. Controls are hidden when the VOD is not ready, lacks a seek bar, or a recognized ad indicator is visible. Twitch can change its player: see [integration notes](docs/twitch-integration.md) and [verification status](docs/verification.md) before public release.

## Customize

Click the extension icon to open settings. Rewind and Forward have independent lists of **0–6 buttons**. Enter positive whole numbers and choose Seconds or Minutes. For example, use 90 Seconds for a minute and a half. Use the arrow buttons to reorder, × to remove and Add button to add. Remove all buttons on a side to hide that column.

Valid changes save automatically and update already open VODs. Invalid fields display an error and leave the previous valid interval active. **Reset to defaults** restores both lists. A storage error is shown with a Retry button.

Settings are stored only on this device with Chrome's local extension storage. There is no device sync, extension account, backend, analytics or collection of viewing history. See [privacy](PRIVACY.md). For support or bug reports, [open an issue](https://github.com/briginas/vod-buttons/issues).

## Build and release

```sh
npm run package
```

This builds `dist/` and creates `release/vod-buttons-0.1.0.zip`, with `manifest.json` at its root. Source code, tests and developer dependencies are excluded. All extension code is bundled locally. No runtime build tools or remote code are required.

Icons are original geometric assets; regenerate them with `python3 scripts/icons.py`. Release text and the remaining publication checklist are in [store materials](store/listing.md). Publication is a separate step after real-player acceptance testing.

## Development

Vanilla JavaScript, HTML and CSS. `src/settings.js` contains validation and seek math; `storage.js` wraps local storage; `twitch.js` isolates Twitch selectors; `controller.js` owns lifecycle; `overlay.js` renders isolated controls; `options.js` handles the editor. esbuild creates the two self-contained bundles. Node's test runner and happy-dom exercise the actual source modules.

For the clearly labeled local player fixture and editor preview:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/dev/`. The fixture simulates media and storage and is not shipped with the extension. It cannot establish real Twitch compatibility.
