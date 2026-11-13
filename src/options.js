import {defaults, DIRECTIONS, MAX_BUTTONS, parseInterval} from './settings.js';
import {createStore} from './storage.js';
import {startThemeOptions} from './theme-options.js';

export function startOptions(doc = document, store = createStore()) {
  const editors = doc.querySelector('#editors');
  const reset = doc.querySelector('#reset');
  const status = doc.querySelector('#status');
  const retry = doc.querySelector('#retry');
  let rows;
  let id = 0;
  let loaded = false;
  let queue = Promise.resolve();
  let revision = 0;
  let failed = false;
  const announce = (text, error = false) => {
    status.textContent = text;
    status.toggleAttribute('data-error', error);
  };
  function setRows(settings) {
    rows = Object.fromEntries(DIRECTIONS.map(direction => [direction,
      settings[direction].map(interval => ({id: ++id, interval, text: String(interval.value), unit: interval.unit}))]));
  }
  function save() {
    const settings = {version: 1, ...Object.fromEntries(DIRECTIONS.map(direction =>
      [direction, rows[direction].map(row => ({...row.interval}))]))};
    const currentRevision = ++revision;
    announce('Saving…');
    queue = queue.catch(() => {}).then(() => store.write(settings)).then(() => {
      if (revision === currentRevision) {
        failed = false; retry.hidden = true;
        announce(doc.querySelector('[aria-invalid="true"]') ? 'Valid changes saved. Fix the highlighted fields.' : 'All changes saved on this device.');
      }
    }).catch(() => {
      if (revision === currentRevision) {
        failed = true; retry.hidden = false;
        announce('Could not save changes. Your previous saved settings are still active. Retry to save.', true);
      }
    });
    return queue;
  }
  function button(text, name, action, disabled = false) {
    const element = doc.createElement('button');
    element.type = 'button'; element.textContent = text; element.setAttribute('aria-label', name);
    element.disabled = disabled; element.addEventListener('click', action); return element;
  }
  function render(focusId) {
    editors.replaceChildren();
    for (const direction of DIRECTIONS) {
      const name = direction === 'rewind' ? 'Rewind' : 'Forward';
      const section = doc.createElement('section'); section.className = 'editor';
      const heading = doc.createElement('div'); heading.className = 'editor-heading';
      const title = doc.createElement('h2'); title.textContent = `${direction === 'rewind' ? '←' : '→'} ${name}`;
      const count = doc.createElement('span'); count.className = 'count'; count.textContent = `${rows[direction].length} / ${MAX_BUTTONS}`;
      heading.append(title, count);
      const description = doc.createElement('p'); description.className = 'description';
      description.textContent = `${direction === 'rewind' ? 'Left' : 'Right'} side of the player · top to bottom`;
      const list = doc.createElement('ol'); list.setAttribute('aria-label', `${name} intervals`);
      rows[direction].forEach((row, index) => {
        const li = doc.createElement('li'); li.className = 'interval';
        const fields = doc.createElement('div'); fields.className = 'fields';
        const input = doc.createElement('input'); input.type = 'text'; input.inputMode = 'numeric';
        input.value = row.text; input.id = `value-${row.id}`;
        input.setAttribute('aria-label', `${name} interval ${index + 1}`);
        input.setAttribute('aria-describedby', `error-${row.id}`);
        const unit = doc.createElement('select'); unit.setAttribute('aria-label', `${name} unit ${index + 1}`);
        const unitField = doc.createElement('span'); unitField.className = 'unit-field'; unitField.append(unit);
        for (const [value, text] of [['seconds', 'Seconds'], ['minutes', 'Minutes']]) {
          const option = doc.createElement('option'); option.value = value; option.textContent = text; unit.append(option);
        }
        unit.value = row.unit;
        const error = doc.createElement('p'); error.className = 'error'; error.id = `error-${row.id}`; error.setAttribute('aria-live', 'polite');
        function validate(persist = true) {
          row.text = input.value; row.unit = unit.value;
          const result = parseInterval(row.text, row.unit);
          input.setAttribute('aria-invalid', result.error ? 'true' : 'false');
          error.textContent = result.error ?? '';
          if (result.interval) { row.interval = result.interval; if (persist) save(); }
          else if (persist && !failed) announce('Fix the highlighted fields. Previous valid intervals remain active.');
        }
        input.addEventListener('input', () => validate()); unit.addEventListener('change', () => validate());
        const actions = doc.createElement('div'); actions.className = 'actions';
        const move = offset => {
          const target = index + offset;
          [rows[direction][index], rows[direction][target]] = [rows[direction][target], rows[direction][index]];
          render(`value-${row.id}`); save();
        };
        actions.append(
          button('↑', `Move ${name.toLowerCase()} interval ${index + 1} up`, () => move(-1), index === 0),
          button('↓', `Move ${name.toLowerCase()} interval ${index + 1} down`, () => move(1), index === rows[direction].length - 1),
          button('×', `Remove ${name.toLowerCase()} interval ${index + 1}`, () => {
            rows[direction].splice(index, 1); render();
            doc.querySelector(`#add-${direction}`).focus(); save();
          }));
        fields.append(input, unitField, actions); li.append(fields, error); list.append(li); validate(false);
      });
      if (!rows[direction].length) {
        const empty = doc.createElement('p'); empty.className = 'empty';
        empty.textContent = 'This side is hidden. Add a button to show it.'; list.append(empty);
      }
      const add = button('+ Add button', `Add ${name.toLowerCase()} button`, () => {
        const row = {id: ++id, interval: {value: 5, unit: 'seconds'}, text: '5', unit: 'seconds'};
        rows[direction].push(row); render(`value-${row.id}`); save();
      }, rows[direction].length >= MAX_BUTTONS);
      add.className = 'add'; add.id = `add-${direction}`;
      section.append(heading, description, list, add); editors.append(section);
    }
    if (focusId) doc.getElementById(focusId)?.focus();
  }
  async function load() {
    try {
      setRows(await store.read()); loaded = true; failed = false; retry.hidden = true;
      render(); editors.setAttribute('aria-busy', 'false'); reset.disabled = false;
      announce('Changes save automatically on this device.');
    } catch {
      announce('Could not load your settings. Retry to keep your saved configuration.', true);
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', () => {if (loaded && failed) save(); else load();});
  reset.addEventListener('click', () => {setRows(defaults()); render(); save();});
  return {ready: load(), flushed: () => queue};
}

if (typeof document !== 'undefined' && document.querySelector('#editors')) {
  startOptions();
  const appearance = startThemeOptions();
  window.addEventListener('pagehide', event => {if (!event.persisted) appearance.dispose();}, {once: true});
}
