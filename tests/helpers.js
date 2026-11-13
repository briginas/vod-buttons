import {Window} from 'happy-dom';

export function dom(url = 'https://www.twitch.tv/videos/100') {
  const win = new Window({url});
  for (const name of ['document', 'window', 'MutationObserver', 'ResizeObserver', 'AbortController', 'getComputedStyle'])
    globalThis[name] = name === 'window' ? win : (typeof win[name] === 'function' && name === 'getComputedStyle' ? win[name].bind(win) : win[name]);
  return win;
}

export function player(doc) {
  const container = doc.createElement('div');
  container.setAttribute('data-a-target', 'video-player');
  container.setAttribute('data-test-selector', 'video-player__video-layout');
  container.innerHTML = '<div data-a-target="video-ref"><video></video></div><div data-a-target="player-seekbar"></div><div data-a-target="player-controls"></div>';
  const rect = {top: 0, bottom: 480, left: 0, right: 800, width: 800, height: 480};
  container.getClientRects = () => [rect];
  container.getBoundingClientRect = () => rect;
  const video = container.querySelector('video');
  Object.defineProperties(video, {
    readyState: {configurable: true, get: () => 4},
    duration: {configurable: true, get: () => 600},
    seekable: {configurable: true, get: () => ({length: 1, start: () => 0, end: () => 600})}
  });
  video.currentTime = 100;
  doc.body.append(container);
  return {container, video};
}

export function storageAPI(initial = {}) {
  let data = structuredClone(initial);
  const listeners = new Set();
  return {
    local: {
      async get(key) { return structuredClone({[key]: data[key]}); },
      async set(next) {
        const changes = Object.fromEntries(Object.entries(next).map(([key, newValue]) => [key, {oldValue: data[key], newValue}]));
        data = {...data, ...structuredClone(next)};
        for (const listener of listeners) listener(structuredClone(changes), 'local');
      }
    },
    onChanged: {addListener(listener) {listeners.add(listener);}, removeListener(listener) {listeners.delete(listener);}},
    listenerCount: () => listeners.size
  };
}
