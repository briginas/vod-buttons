import test from 'node:test';
import assert from 'node:assert/strict';
import {storageAPI} from './helpers.js';
import {createThemeStore, observeTheme, THEME_KEY} from '../src/appearance.js';
import {readFile} from 'node:fs/promises';
import {dom, player} from './helpers.js';
import {startThemeOptions} from '../src/theme-options.js';
import {startOptions} from '../src/options.js';
import {createStore} from '../src/storage.js';
import {startController} from '../src/controller.js';

test('theme fallback, persistence and subscriptions stay independent of seek settings', async () => {
  const api = storageAPI({seekSettings: {custom: true}, [THEME_KEY]: 'invalid'});
  const store = createThemeStore(api);
  assert.equal(await store.read(), 'light');
  const values = []; const off = store.subscribe(theme => values.push(theme));
  await store.write('dark');
  assert.equal(await createThemeStore(api).read(), 'dark');
  assert.deepEqual(values, ['dark']);
  assert.deepEqual((await api.local.get('seekSettings')).seekSettings, {custom: true});
  await assert.rejects(store.write('auto'));
  off(); assert.equal(api.listenerCount(), 0);
});

test('newer theme notifications win over stale initial reads; disposal ignores reads', async () => {
  let complete; let notify;
  const values = [];
  const store = {read: () => new Promise(resolve => {complete = resolve;}), subscribe: fn => {notify = fn; return () => {};}};
  const observer = observeTheme(store, value => values.push(value));
  notify('dark'); complete('light'); await observer.ready;
  assert.deepEqual(values, ['dark']);
  const refresh = observer.refresh(); observer.dispose(); complete('light'); await refresh;
  assert.deepEqual(values, ['dark']);
});

async function optionsDocument() {
  const win = dom('https://extension.test/options.html');
  win.document.body.innerHTML = (await readFile('extension/options.html', 'utf8')).match(/<body>([\s\S]*)<\/body>/)[1];
  return win;
}

function selectTheme(win, theme) {
  const input = win.document.querySelector(`input[value="${theme}"]`);
  input.checked = true; input.dispatchEvent(new win.Event('change', {bubbles: true}));
}

test('theme selection serializes rapid writes, retries failures and survives interval reset', async () => {
  const win = await optionsDocument(); const doc = win.document;
  const api = storageAPI(); const base = createThemeStore(api);
  let fail = false;
  const store = {...base, async write(value) {if (fail) throw new Error('quota'); await base.write(value);}};
  const themes = startThemeOptions(doc, store); await themes.ready;
  const intervals = startOptions(doc, createStore(api)); await intervals.ready;
  selectTheme(win, 'dark'); selectTheme(win, 'light'); selectTheme(win, 'dark');
  await themes.flushed();
  assert.equal(await base.read(), 'dark');
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  doc.querySelector('#reset').click(); await intervals.flushed();
  assert.equal(await base.read(), 'dark');
  fail = true; selectTheme(win, 'light'); await themes.flushed();
  assert.equal(doc.querySelector('#theme-status').hasAttribute('data-error'), true);
  assert.equal(await base.read(), 'dark');
  fail = false; doc.querySelector('#theme-retry').click(); await themes.flushed();
  assert.equal(await base.read(), 'light');
  assert.equal(doc.querySelector('#theme-retry').hidden, true);
  await base.write('dark');
  assert.equal(doc.querySelector('input[value="dark"]').checked, true);
  themes.dispose(); assert.equal(api.listenerCount(), 0);
  await win.happyDOM.abort();
});

test('theme read failure allows retry without writing over saved preferences', async () => {
  const win = await optionsDocument(); const doc = win.document;
  const base = createThemeStore(storageAPI({[THEME_KEY]: 'dark'}));
  let fail = true; let writes = 0;
  const themes = startThemeOptions(doc, {...base,
    async read() {if (fail) throw new Error('unavailable'); return base.read();},
    async write(value) {writes++; return base.write(value);}});
  await themes.ready;
  assert.equal(doc.querySelector('#theme-selector').disabled, true);
  assert.equal(doc.querySelector('#theme-retry').hidden, false);
  fail = false; doc.querySelector('#theme-retry').click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.querySelector('#theme-selector').disabled, false);
  assert.equal(writes, 0);
  themes.dispose(); await win.happyDOM.abort();
});

test('live controller theme updates preserve buttons, focus, seek state and clean up', async () => {
  const win = dom(); const {container, video} = player(win.document);
  const api = storageAPI({[THEME_KEY]: 'dark'}); const themeStore = createThemeStore(api);
  const controller = startController({doc: win.document, win, store: createStore(api), themeStore});
  await controller.ready; controller.reconcile();
  const host = container.querySelector('vod-buttons-controls');
  assert.equal(host.dataset.theme, 'dark');
  const button = host.shadowRoot.querySelector('button'); button.focus();
  await themeStore.write('light');
  assert.equal(host.dataset.theme, 'light');
  assert.equal(host.shadowRoot.activeElement, button);
  assert.equal(video.currentTime, 100);
  button.click(); assert.equal(video.currentTime, 95);
  assert.equal(win.document.documentElement.hasAttribute('data-theme'), false);
  controller.stop(); assert.equal(api.listenerCount(), 0);
  await themeStore.write('dark'); assert.equal(host.dataset.theme, 'light');
  await win.happyDOM.abort();
});
