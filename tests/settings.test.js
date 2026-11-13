import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults, seconds, parseInterval, normalizeSettings, validSettings, label, seekTarget} from '../src/settings.js';
import {createStore} from '../src/storage.js';
import {storageAPI} from './helpers.js';

test('independent defaults, labels and units', () => {
  const config = defaults();
  assert.deepEqual(config.rewind.map(i => label(i, 'rewind')), ['−5 s', '−15 s', '−30 s', '−1 min']);
  assert.equal(label(config.forward[3], 'forward'), '+1 min');
  config.rewind.pop(); assert.equal(config.forward.length, 4);
  assert.equal(seconds({value: 2, unit: 'minutes'}), 120);
  assert.deepEqual(parseInterval('90', 'seconds').interval, {value: 90, unit: 'seconds'});
});

test('positive whole intervals and safe conversion only', () => {
  for (const value of ['', '0', '-1', '1.5', 'NaN', '1e2', 'Infinity', 'abc', '9007199254740992'])
    assert.ok(parseInterval(value, 'seconds').error, value);
  assert.ok(parseInterval(String(Number.MAX_SAFE_INTEGER), 'minutes').error);
  assert.equal(seconds({value: 2, unit: 'hours'}), null);
  assert.equal(seconds({value: '5', unit: 'seconds'}), null);
  assert.equal(parseInterval(' 005 ', 'seconds').interval.value, 5);
});

test('zero through six buttons supported, seven and corrupt data recovered safely', () => {
  for (const count of [0, 1, 6, 7]) {
    const config = {...defaults(), rewind: Array.from({length: count}, () => ({value: 5, unit: 'seconds'}))};
    assert.equal(validSettings(config), count <= 6);
    assert.equal(normalizeSettings(config).rewind.length, count <= 6 ? count : 4);
  }
  for (const data of [null, {}, {...defaults(), version: 2}, {...defaults(), rewind: [null]}, {...defaults(), forward: new Array(3)}])
    assert.deepEqual(normalizeSettings(data), defaults());
  assert.deepEqual(normalizeSettings({...defaults(), rewind: [], forward: []}), {version: 1, rewind: [], forward: []});
});

test('seek positions clamp in both directions and reject invalid media', () => {
  assert.equal(seekTarget(100, 600, -15), 85);
  assert.equal(seekTarget(100, 600, 15), 115);
  assert.equal(seekTarget(2, 600, -15), 0);
  assert.equal(seekTarget(590, 600, 60), 600);
  assert.equal(seekTarget(590, 600, Number.MAX_SAFE_INTEGER), 600);
  for (const duration of [0, NaN, Infinity, -2]) assert.equal(seekTarget(10, duration, 5), null);
});

test('storage persists across consumers and notifies local subscribers only', async () => {
  const api = storageAPI(); const a = createStore(api); const b = createStore(api);
  assert.deepEqual(await a.read(), defaults());
  const received = []; const off = b.subscribe(value => received.push(value));
  const config = {...defaults(), rewind: [], forward: [{value: 90, unit: 'seconds'}]};
  await a.write(config);
  assert.deepEqual(await createStore(api).read(), config);
  assert.deepEqual(received, [config]);
  off(); assert.equal(api.listenerCount(), 0);
  await assert.rejects(a.write({...config, version: 5}));
  assert.deepEqual(await createStore(storageAPI({seekSettings: 'broken'})).read(), defaults());
});
