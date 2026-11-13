import {createThemeStore, observeTheme, THEME_CSS} from './appearance.js';

export function startThemeOptions(doc = document, store = createThemeStore()) {
  const style = doc.createElement('style'); style.textContent = THEME_CSS; doc.head.append(style);
  const selector = doc.querySelector('#theme-selector');
  const status = doc.querySelector('#theme-status');
  const retry = doc.querySelector('#theme-retry');
  let theme = 'light';
  let loaded = false;
  let pending = 0;
  let selection = 0;
  let queue = Promise.resolve();
  const abort = new AbortController();
  function apply(value) {
    theme = value; doc.documentElement.dataset.theme = theme;
    for (const input of selector.querySelectorAll('input')) input.checked = input.value === theme;
  }
  function announce(text, error = false) {
    status.textContent = text; status.toggleAttribute('data-error', error); retry.hidden = !error;
  }
  apply(theme);
  const observer = observeTheme(store, value => {
    if (!pending) apply(value);
  });
  async function load(operation) {
    try {
      await operation;
      loaded = true; selector.disabled = false;
      announce('Your theme is saved on this device.');
    } catch {
      announce('Could not load your theme. Retry to keep your saved preference.', true);
    }
  }
  function save() {
    const next = theme;
    const current = ++selection;
    pending++;
    announce('Saving theme…');
    queue = queue.catch(() => {}).then(() => store.write(next)).then(() => {
      if (selection === current) announce('Theme saved on this device.');
    }).catch(() => {
      if (selection === current) announce('Could not save your theme. Retry to save your selection.', true);
    }).finally(() => {pending--;});
    return queue;
  }
  selector.addEventListener('change', event => {
    if (event.target.matches('input[name="theme"]') && loaded) {apply(event.target.value); save();}
  }, {signal: abort.signal});
  retry.addEventListener('click', () => {
    if (loaded) save(); else load(observer.refresh());
  }, {signal: abort.signal});
  return {ready: load(observer.ready), flushed: () => queue,
    dispose() {observer.dispose(); abort.abort(); style.remove();}};
}
