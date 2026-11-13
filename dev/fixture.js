import {startController} from '../src/controller.js';
import {findContext} from '../src/twitch.js';
import {createStore} from '../src/storage.js';
import {defaults} from '../src/settings.js';
import {previewStorage} from './storage.js';
import {createThemeStore} from '../src/appearance.js';

const mount = document.querySelector('#mount');
const result = document.querySelector('#result');
const api = previewStorage();
const store = createStore(api);
let route = '/videos/100', sequence = 100, time = 120, paused = true, player;
function renderPlayer() {
  time = 120;
  mount.innerHTML = '<div data-a-target="video-player" data-test-selector="video-player__video-layout"><div data-a-target="video-ref"><video></video></div><div class="caption"><strong>Local player fixture</strong>Hover for seek controls</div><div data-a-target="player-seekbar"></div><div data-a-target="player-controls">Native player controls · unobstructed</div></div>';
  player = mount.firstElementChild;
  const video = player.querySelector('video');
  Object.defineProperties(video, {
    readyState: {get: () => 4}, duration: {get: () => 600},
    seekable: {get: () => ({length: 1, start: () => 0, end: () => 600})},
    currentTime: {get: () => time, set: value => {time = value; status();}}, paused: {get: () => paused}
  });
  player.addEventListener('click', () => {paused = !paused; status();});
  status();
}
function status() { result.textContent = `Context: ${route} · Position: ${time} / 600 s · ${paused ? 'Paused' : 'Playing'}`; }
renderPlayer();
const controller = startController({store, themeStore: createThemeStore(api), resolve: doc => findContext(doc, new URL(`https://www.twitch.tv${route}`))});
document.querySelector('#vod').onclick = () => {route = `/videos/${++sequence}`; renderPlayer(); controller.reconcile();};
for (const [id, path] of [['live', '/channel'], ['clip', '/channel/clip/example']])
  document.querySelector(`#${id}`).onclick = () => {route = path; controller.reconcile(); status();};
document.querySelector('#ad').onclick = () => {
  const ad = player.querySelector('[data-a-target="video-ad-label"]');
  if (ad) ad.remove(); else {const label = document.createElement('div'); label.dataset.aTarget = 'video-ad-label'; label.textContent = 'Simulated ad'; player.append(label);}
};
document.querySelector('#size').onclick = () => mount.classList.toggle('small');
document.querySelector('#full').onclick = () => player.requestFullscreen();
document.querySelector('#state').onclick = () => {paused = !paused; status();};
document.querySelector('#six').onclick = () => store.write({...defaults(), rewind: [5,15,30,60,90,120].map(value => ({value,unit:'seconds'})), forward: [5,15,30,60,90,120].map(value => ({value,unit:'seconds'}))});
