import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dom, storageAPI} from './helpers.js';
import {defaults} from '../src/settings.js';
import {createStore} from '../src/storage.js';
import {startOptions} from '../src/options.js';

test('editor adds, removes, reorders, validates independently, resets and persists', async () => {
  const win = dom('https://extension.test/options.html'); const doc = win.document;
  doc.body.innerHTML = (await readFile('extension/options.html', 'utf8')).match(/<body>([\s\S]*)<\/body>/)[1];
  const store = createStore(storageAPI()); const options = startOptions(doc, store); await options.ready;
  const input = doc.querySelector('input'); input.value = '0'; input.dispatchEvent(new win.Event('input'));
  assert.equal(input.getAttribute('aria-invalid'), 'true'); assert.equal((await store.read()).rewind[0].value, 5);
  input.value = '90'; input.dispatchEvent(new win.Event('input')); await options.flushed();
  assert.equal((await store.read()).rewind[0].value, 90); assert.equal((await store.read()).forward[0].value, 5);
  doc.querySelector('[aria-label="Move rewind interval 1 down"]').click(); await options.flushed();
  assert.deepEqual((await store.read()).rewind.map(i => i.value), [15, 90, 30, 1]);
  doc.querySelector('#add-rewind').click(); doc.querySelector('#add-rewind').click(); await options.flushed();
  assert.equal(doc.querySelector('#add-rewind').disabled, true); assert.equal((await store.read()).rewind.length, 6);
  for (let i = 0; i < 6; i++) doc.querySelector('[aria-label="Remove rewind interval 1"]').click();
  await options.flushed(); assert.deepEqual((await store.read()).rewind, []);
  assert.equal((await store.read()).forward.length, 4);
  doc.querySelector('#reset').click(); await options.flushed(); assert.deepEqual(await store.read(), defaults());
  await win.happyDOM.abort();
});

test('storage failure is visible and retries the latest valid configuration', async () => {
  const win = dom(); const doc = win.document;
  doc.body.innerHTML = '<div id="editors"></div><button id="reset"></button><p id="status"></p><button id="retry" hidden></button>';
  const api = storageAPI(); const base = createStore(api); let fail = true;
  const store = {...base, write: async value => {if (fail) throw new Error('quota'); return base.write(value);}};
  const options = startOptions(doc, store); await options.ready;
  doc.querySelector('#add-forward').click(); await options.flushed();
  assert.equal(doc.querySelector('#status').hasAttribute('data-error'), true);
  assert.equal((await base.read()).forward.length, 4);
  fail = false; doc.querySelector('#retry').click(); await options.flushed();
  assert.equal((await base.read()).forward.length, 5);
  assert.equal(doc.querySelector('#retry').hidden, true);
  await win.happyDOM.abort();
});
