// Keep Twitch-specific selectors together: none are a public Twitch API.
export const PLAYER = '[data-a-target="video-player"][data-test-selector="video-player__video-layout"]';
export const SEEK_BAR = '[data-a-target="player-seekbar"]';
export const CONTROL_BAR = '[data-a-target="player-controls"]';
const AD_MARKERS = '[data-a-target="video-ad-label"], [data-a-target="video-ad-countdown"], [data-test-selector="ad-banner-default-text"], [data-test-selector="video-ad-label"]';

export function vodRoute(location) {
  if (location.protocol !== 'https:' || !['www.twitch.tv', 'twitch.tv'].includes(location.hostname)) return null;
  return /^\/videos\/(\d+)\/?$/.exec(location.pathname)?.[1] ?? null;
}

export function mediaReady(video) {
  return video.isConnected && !video.error && video.readyState >= 1 &&
    Number.isFinite(video.currentTime) && Number.isFinite(video.duration) &&
    video.duration > 0 && video.seekable.length > 0;
}

function displayed(element) {
  return element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
}

export function findContext(doc, location) {
  const route = vodRoute(location);
  if (!route) return null;
  const candidates = Array.from(doc.querySelectorAll(PLAYER)).filter(displayed);
  if (candidates.length !== 1) return null;
  const player = candidates[0];
  const videos = player.querySelectorAll('[data-a-target="video-ref"] > video');
  if (videos.length !== 1 || !player.querySelector(SEEK_BAR)) return null;
  if (Array.from(player.querySelectorAll(AD_MARKERS)).some(displayed)) return null;
  const video = videos[0];
  if (!mediaReady(video)) return null;
  const fullscreen = doc.fullscreenElement;
  // Fullscreening the video itself cannot display HTML overlays.
  if (fullscreen && (!fullscreen.contains(player) || fullscreen === video)) return null;
  return {route, player, video};
}
