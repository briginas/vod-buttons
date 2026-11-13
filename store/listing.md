# Chrome Web Store materials

Release candidate name: **VOD Buttons for Twitch**. English only. This name is used consistently in the manifest and settings. Independent project; not affiliated with or endorsed by Twitch.

## Short description

Skip ahead or replay moments in Twitch VODs with customizable mouse-friendly seek buttons.

## Detailed description

Watch Twitch recordings at your own pace, even when your keyboard is out of reach.

Move your pointer over a VOD to reveal rewind buttons on the left and forward buttons on the right. Click an interval to revisit a moment or skip ahead while keeping your current playback or pause state. Controls hide after 3 seconds of pointer inactivity and reappear when you move the pointer. Keyboard focus keeps them visible.

- Start with 5 seconds, 15 seconds, 30 seconds and 1 minute on each side.
- Customize the two sides independently, with up to six buttons each.
- Choose positive whole numbers in seconds or minutes.
- Add, remove and reorder intervals, or reset both sides to defaults.
- Changes save automatically and update open VODs.
- Scroll inside a column with your mouse wheel, touchpad or scrollbar when space is limited.
- Use normal, theater or fullscreen viewing on twitch.tv.

Designed for Twitch VOD pages. Live streams, clips and Twitch players embedded on other websites are not supported. This extension does not skip ads.

Settings stay on your device. No extension account, device sync, analytics or viewing history collection.

Not affiliated with or endorsed by Twitch.

## Single purpose and permissions

Single purpose: add configurable rewind/forward controls to Twitch VOD playback.

- `storage`: save interval lists locally and apply changes to open tabs.
- Content-script access to `https://www.twitch.tv/*` and `https://twitch.tv/*`: observe Twitch navigation and render controls only on supported VOD pages. Navigation can start on a non-VOD Twitch page, so the script loads on the domain and then gates controls by context.
- No tabs, history, scripting, remote-code, external API or analytics permission.

Data-use disclosure: no user data collected or transmitted. Local preferences only. Public privacy URL: https://github.com/briginas/vod-buttons/blob/main/PRIVACY.md. Support URL: https://github.com/briginas/vod-buttons/issues.

## Assets

- Original icon: `assets/icon.svg`; packaged PNGs: 16, 32, 48 and 128 px in `extension/icons/`. The 128 px asset has transparent padding around a 96 px icon.
- Store screenshot 1: [real Twitch VOD with controls](screenshots/vod.jpg).
- Store screenshot 2: [actual extension settings](screenshots/settings.jpg).
- Both store assets are 1280×800 JPEG files captured from the actual extension in Chrome. The VOD capture was cropped to the player viewport and resized; the settings capture was converted to JPEG. No fixture content was used. Full browser reference captures stay local and are excluded from Git.

## Submission checklist

- [ ] Finish the remaining real-player acceptance checks in [verification](../docs/verification.md).
- [x] Produce final store-sized screenshots and review visible content and branding.
- [x] Provide public support/contact and privacy URLs from the publisher.
- [x] Recheck listing and policy declarations in the publisher dashboard immediately before submission.
- [x] Upload `release/vod-buttons-0.1.0.zip` and save the English listing, icon, two screenshots, permission justifications, data-use declarations and reviewer instructions as a draft.
- [x] Submit the completed listing for review. Dashboard confirmed **Pending review** on 2026-11-13. Automatic publication is disabled; publication is a separate manual action after approval.

Dashboard item: [VOD Buttons for Twitch](https://chrome.google.com/u/2/webstore/devconsole/8826c801-e0f6-4f1a-9cf8-545a8290d3bd/hehnhiebaafapanfjnihnegadhemnnbk/edit/listing). Distribution: free, public, all regions.

Checked 2026-11-13 against the official [image requirements](https://developer.chrome.com/docs/webstore/images), [Manifest V3 policy](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements) and [developer policies](https://developer.chrome.com/docs/webstore/program-policies/policies). The store requires a PNG icon and at least one screenshot; use the official page for final dimensions and presentation rules.
