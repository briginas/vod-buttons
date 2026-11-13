import {defaults} from './settings.js';
import {findContext, vodRoute} from './twitch.js';
import {attachOverlay} from './overlay.js';
import {observeTheme} from './appearance.js';

export function startController({doc = document, win = window, store, themeStore,
  resolve = findContext, mount = attachOverlay} = {}) {
  let settings = defaults();
  let theme = 'light';
  let current = null;
  let overlay = null;
  let frame = null;
  let stopped = false;
  let settingsRevision = 0;
  let lastRoute = vodRoute(win.location);
  let pendingVideo = null;
  let pendingSource = null;
  const abort = new AbortController();

  const schedule = () => {
    if (!stopped && frame === null) frame = win.requestAnimationFrame(reconcile);
  };
  function eligible() {
    const next = resolve(doc, win.location);
    const route = vodRoute(win.location);
    if (route !== lastRoute) {
      // Twitch can reuse the old media element while the next VOD loads.
      pendingVideo = current?.video ?? null;
      pendingSource = pendingVideo?.currentSrc;
      lastRoute = route;
    }
    if (pendingVideo && next?.video === pendingVideo && next.video.currentSrc === pendingSource) return null;
    if (next) pendingVideo = null;
    return next;
  }
  function reconcile() {
    frame = null;
    if (stopped) return;
    const next = eligible();
    if (next && current && next.player === current.player && next.video === current.video &&
        next.route === current.route && overlay?.host.isConnected) {overlay.resize(); return;}
    overlay?.destroy();
    overlay = null;
    current = next;
    if (next) {
      overlay = mount(next, settings, () => {
        const live = eligible();
        const valid = live?.video === next.video && live?.player === next.player && live?.route === next.route;
        if (!valid) schedule();
        return valid;
      });
      overlay.setTheme?.(theme);
    }
  }
  const observer = new MutationObserver(records => {
    if (records.some(record => !record.target.closest?.('vod-buttons-controls'))) schedule();
  });
  observer.observe(doc.documentElement, {childList: true, subtree: true, attributes: true,
    attributeFilter: ['src', 'data-a-target', 'data-test-selector', 'class', 'hidden']});
  for (const event of ['loadedmetadata', 'durationchange', 'progress', 'emptied', 'loadstart', 'error'])
    doc.addEventListener(event, event => {
      if (event.type === 'loadedmetadata' && event.target === pendingVideo) pendingVideo = null;
      schedule();
    }, {capture: true, signal: abort.signal});
  for (const event of ['popstate', 'hashchange', 'pageshow'])
    win.addEventListener(event, schedule, {signal: abort.signal});
  doc.addEventListener('fullscreenchange', schedule, {signal: abort.signal});
  // Navigation API covers pushState/replaceState without patching Twitch's JS world.
  win.navigation?.addEventListener('navigatesuccess', schedule, {signal: abort.signal});
  const unsubscribe = store.subscribe(next => {
    settingsRevision++;
    settings = next;
    overlay?.update(settings);
    schedule();
  });
  const revision = settingsRevision;
  const appearance = themeStore && observeTheme(themeStore, next => {
    theme = next; overlay?.setTheme?.(theme);
  });
  const settingsReady = store.read().then(next => {
    if (!stopped && settingsRevision === revision) { settings = next; overlay?.update(settings); }
  }).catch(() => { /* Keep safe defaults; the settings page reports storage errors. */ }).finally(schedule);
  const ready = Promise.all([settingsReady, appearance?.ready.catch(() => {})]);
  schedule();
  return {ready, reconcile, stop() {
    stopped = true;
    if (frame !== null) win.cancelAnimationFrame(frame);
    observer.disconnect(); abort.abort(); unsubscribe(); appearance?.dispose(); overlay?.destroy(); current = null;
  }};
}
