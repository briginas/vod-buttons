import test from 'node:test';
import assert from 'node:assert/strict';
import {dom, player, storageAPI} from './helpers.js';
import {defaults} from '../src/settings.js';
import {createStore} from '../src/storage.js';
import {findContext, vodRoute} from '../src/twitch.js';
import {startController} from '../src/controller.js';
import {attachOverlay, POINTER_IDLE_MS} from '../src/overlay.js';

test('adapter rejects live, clips, embeds, ambiguity, ads and unready media', () => {
  const win = dom(); const {container, video} = player(win.document);
  assert.equal(findContext(win.document, win.location).video, video);
  for (const url of ['https://www.twitch.tv/channel', 'https://www.twitch.tv/channel/clip/slug', 'https://clips.twitch.tv/slug', 'https://player.twitch.tv/?video=100', 'https://example.com/videos/100'])
    assert.equal(vodRoute(new URL(url)), null, url);
  const ad = win.document.createElement('span'); ad.dataset.aTarget = 'video-ad-label';
  ad.getClientRects = () => [{}]; container.append(ad);
  assert.equal(findContext(win.document, win.location), null); ad.remove();
  Object.defineProperty(video, 'duration', {configurable: true, get: () => Infinity});
  assert.equal(findContext(win.document, win.location), null);
  Object.defineProperty(video, 'duration', {configurable: true, get: () => 600});
  player(win.document); assert.equal(findContext(win.document, win.location), null);
  win.happyDOM.abort();
});

test('seek buttons preserve paused state, stop player click, keep wheel native and clean up', () => {
  const win = dom(); const {container, video} = player(win.document);
  let nativeClicks = 0, wheels = 0;
  container.addEventListener('click', () => nativeClicks++);
  container.addEventListener('wheel', () => wheels++);
  const overlay = attachOverlay(findContext(win.document, win.location), defaults(), () => true);
  const root = overlay.host.shadowRoot;
  const rewind = root.querySelector('.rewind button'); const forward = root.querySelector('.forward button');
  assert.equal(root.querySelectorAll('button').length, 8);
  assert.equal(rewind.getAttribute('aria-label'), 'Rewind 5 seconds');
  for (const paused of [true, false]) {
    Object.defineProperty(video, 'paused', {configurable: true, value: paused});
    video.currentTime = 100; rewind.click(); assert.equal(video.currentTime, 95); assert.equal(video.paused, paused);
    forward.click(); assert.equal(video.currentTime, 100); assert.equal(video.paused, paused);
  }
  assert.equal(nativeClicks, 0);
  const wheel = new win.WheelEvent('wheel', {bubbles: true, composed: true, cancelable: true, deltaY: 80});
  rewind.dispatchEvent(wheel); assert.equal(wheels, 0); assert.equal(wheel.defaultPrevented, false); assert.equal(video.currentTime, 100);
  container.dispatchEvent(new win.Event('pointerenter')); assert.equal(overlay.host.hasAttribute('data-hover'), true);
  container.dispatchEvent(new win.Event('pointerleave')); assert.equal(overlay.host.hasAttribute('data-hover'), false);
  overlay.update({...defaults(), rewind: [], forward: [{value: 2, unit: 'minutes'}]});
  assert.equal(root.querySelector('.rewind'), null); assert.equal(root.querySelectorAll('button').length, 1);
  rewind.click(); assert.equal(video.currentTime, 100, 'removed listeners cannot seek');
  overlay.destroy(); assert.equal(container.querySelector('vod-buttons-controls'), null);
  forward.click(); assert.equal(video.currentTime, 100);
  win.happyDOM.abort();
});

test('controller handles VOD → VOD → stream/clip → VOD, replacement, settings and cleanup', async () => {
  const win = dom(); const first = player(win.document); const api = storageAPI(); const store = createStore(api);
  const controller = startController({doc: win.document, win, store});
  await controller.ready; controller.reconcile(); controller.reconcile();
  assert.equal(win.document.querySelectorAll('vod-buttons-controls').length, 1);
  const oldButton = first.container.querySelector('vod-buttons-controls').shadowRoot.querySelector('button');
  win.history.pushState({}, '', '/videos/200'); controller.reconcile();
  assert.equal(win.document.querySelectorAll('vod-buttons-controls').length, 0, 'old media is suspended during navigation');
  first.container.remove(); const second = player(win.document); controller.reconcile();
  assert.equal(win.document.querySelectorAll('vod-buttons-controls').length, 1);
  oldButton.click(); assert.equal(first.video.currentTime, 100);
  await store.write({...defaults(), rewind: [], forward: [{value: 90, unit: 'seconds'}]});
  let root = second.container.querySelector('vod-buttons-controls').shadowRoot;
  assert.equal(root.querySelectorAll('button').length, 1); assert.equal(root.querySelector('button').textContent, '+90 s');
  for (const path of ['/channel', '/channel/clip/slug']) {
    win.history.pushState({}, '', path); controller.reconcile();
    assert.equal(win.document.querySelectorAll('vod-buttons-controls').length, 0);
  }
  win.history.pushState({}, '', '/videos/300'); controller.reconcile();
  assert.equal(win.document.querySelectorAll('vod-buttons-controls').length, 1);
  controller.stop(); assert.equal(api.listenerCount(), 0);
  assert.equal(win.document.querySelectorAll('vod-buttons-controls').length, 0);
  await win.happyDOM.abort();
});

test('seek rechecks context at activation, including newly appeared ads', async () => {
  const win = dom(); const {container, video} = player(win.document);
  const controller = startController({doc: win.document, win, store: createStore(storageAPI())});
  await controller.ready; controller.reconcile();
  const button = container.querySelector('vod-buttons-controls').shadowRoot.querySelector('button');
  const ad = win.document.createElement('span'); ad.dataset.aTarget = 'video-ad-countdown';
  ad.getClientRects = () => [{}]; container.append(ad);
  button.click(); assert.equal(video.currentTime, 100);
  controller.reconcile(); assert.equal(container.querySelector('vod-buttons-controls'), null);
  controller.stop(); await win.happyDOM.abort();
});

test('pointer inactivity hides controls, activity restarts the timer and leaving hides immediately', t => {
  const win = dom(); const {container} = player(win.document);
  t.mock.timers.enable({apis: ['setTimeout']});
  const overlay = attachOverlay(findContext(win.document, win.location), defaults(), () => true);
  const visible = () => overlay.host.hasAttribute('data-hover');
  container.dispatchEvent(new win.Event('pointerenter'));
  t.mock.timers.tick(POINTER_IDLE_MS - 1); assert.equal(visible(), true);
  container.dispatchEvent(new win.Event('pointermove'));
  t.mock.timers.tick(POINTER_IDLE_MS - 1); assert.equal(visible(), true);
  t.mock.timers.tick(1); assert.equal(visible(), false);
  container.dispatchEvent(new win.Event('pointermove')); assert.equal(visible(), true);
  const button = overlay.host.shadowRoot.querySelector('button');
  t.mock.timers.tick(2000);
  const wheel = new win.WheelEvent('wheel', {bubbles: true, composed: true, cancelable: true});
  button.dispatchEvent(wheel); assert.equal(wheel.defaultPrevented, false);
  t.mock.timers.tick(2000); assert.equal(visible(), true);
  container.dispatchEvent(new win.Event('pointerleave')); assert.equal(visible(), false);
  t.mock.timers.tick(POINTER_IDLE_MS); assert.equal(visible(), false);
  overlay.destroy(); win.happyDOM.abort();
});

test('keyboard focus remains visible after idle, but mouse focus does not pin controls', t => {
  const win = dom(); const {container} = player(win.document);
  t.mock.timers.enable({apis: ['setTimeout']});
  const overlay = attachOverlay(findContext(win.document, win.location), defaults(), () => true);
  const button = overlay.host.shadowRoot.querySelector('button');
  container.dispatchEvent(new win.Event('pointerenter'));
  button.focus();
  button.dispatchEvent(new win.KeyboardEvent('keydown', {key: 'Tab', bubbles: true, composed: true}));
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), true);
  t.mock.timers.tick(POINTER_IDLE_MS);
  assert.equal(overlay.host.hasAttribute('data-hover'), false);
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), true);
  overlay.update(defaults());
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), true, 'settings preserve keyboard visibility');
  const nextButton = overlay.host.shadowRoot.querySelector('button');
  container.dispatchEvent(new win.Event('pointermove'));
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), false, 'pointer movement resumes idle hiding');
  nextButton.dispatchEvent(new win.KeyboardEvent('keydown', {key: 'Enter', bubbles: true, composed: true}));
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), true);
  nextButton.blur();
  nextButton.dispatchEvent(new win.Event('pointerdown', {bubbles: true, composed: true}));
  nextButton.focus();
  nextButton.click();
  assert.equal(overlay.host.shadowRoot.activeElement, nextButton);
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), false);
  t.mock.timers.tick(POINTER_IDLE_MS);
  assert.equal(overlay.host.hasAttribute('data-hover'), false);
  nextButton.dispatchEvent(new win.KeyboardEvent('keydown', {key: 'Enter', bubbles: true, composed: true}));
  nextButton.blur();
  assert.equal(overlay.host.hasAttribute('data-keyboard-focus'), false, 'leaving focus removes keyboard visibility');
  overlay.destroy(); win.happyDOM.abort();
});

test('destroying the overlay cancels idle timer and pointer listeners', t => {
  const win = dom(); const {container} = player(win.document);
  t.mock.timers.enable({apis: ['setTimeout']});
  const overlay = attachOverlay(findContext(win.document, win.location), defaults(), () => true);
  container.dispatchEvent(new win.Event('pointerenter'));
  assert.equal(overlay.host.hasAttribute('data-hover'), true);
  overlay.destroy();
  t.mock.timers.tick(POINTER_IDLE_MS);
  assert.equal(overlay.host.hasAttribute('data-hover'), true, 'cancelled timer does not mutate the detached host');
  overlay.host.removeAttribute('data-hover');
  container.dispatchEvent(new win.Event('pointermove'));
  assert.equal(overlay.host.hasAttribute('data-hover'), false);
  win.happyDOM.abort();
});
