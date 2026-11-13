# Twitch integration

Observed on 2026-11-13. Twitch does not publish a stable DOM API for browser overlays. Selectors are centralized in `src/twitch.js`.

## Confirmed on the real site

- Top-level VOD URLs use `/videos/<numeric-id>`; channel live pages and `/<channel>/clip/<slug>` are different contexts.
- Player: `[data-a-target="video-player"][data-test-selector="video-player__video-layout"]`.
- Video: `[data-a-target="video-ref"] > video` inside that player. A live stream uses the same video and container markers, so those markers alone do not identify a VOD.
- VOD seek bar: `[data-a-target="player-seekbar"]`.
- Native controls: `[data-a-target="player-controls"]`; time labels include `player-seekbar-current-time` and `player-seekbar-duration`.
- The actual extension attached to VOD `https://www.twitch.tv/videos/2926833499` in Chrome. Paused seeking, normal/theater/fullscreen layout were observed.
- The in-app browser exposed the DOM but could not play the media. Real playback checks were performed separately in native Google Chrome.

## Safety checks

Only the top frame of `https://www.twitch.tv/*` and `https://twitch.tv/*` receives the content script. A supported numeric VOD route, exactly one displayed player and its video, a seek bar, finite media duration, loaded metadata and a nonempty seekable range are required together. Fullscreen must contain the player. Context is checked again synchronously on activation.

The adapter suppresses controls while visible elements match `video-ad-label`, `video-ad-countdown` or `ad-banner-default-text`. **These ad markers are defensive candidates, not yet confirmed by an observed real ad.** The absence of a VOD seek bar and unready media also suppress controls. A real pre-roll/mid-roll test remains required before release. This is not an ad-skipping feature.

The controller observes DOM changes in batches, media readiness events, fullscreen, history events and the browser Navigation API. On a VOD route transition it suspends a reused old video until a new source or loaded metadata arrives. Removed controls abort their event handlers and disconnect observers. The test fixture covers replacement of the player and navigation VOD → VOD → stream/clip → VOD.

## Recheck procedure

1. Load the unpacked extension and reload Twitch. On a completed VOD, confirm one set of controls after media is ready.
2. Navigate through Twitch links to another completed VOD, a live channel and a clip, then back. Confirm that old controls disappear and there are no duplicates.
3. Test native player replacement, theater, fullscreen and a small player with six intervals on each side.
4. Test a real pre-roll and mid-roll. Inspect the player DOM for visible ad markers, record their selectors, and verify no extension seek can affect the ad. Do not count a simulated ad as this check.
5. If Twitch changes these markers or media integration, keep the release blocked until updated and retested.
