// Development preview only. Never included in dist/.
export function previewStorage() {
  const listeners = new Set();
  const keys = {seekSettings: 'vod-buttons-preview', appearanceTheme: 'vod-buttons-preview-theme'};
  window.addEventListener('storage', event => {
    const key = Object.keys(keys).find(key => keys[key] === event.key);
    if (key) {
      const next = event.newValue ? JSON.parse(event.newValue) : undefined;
      for (const fn of listeners) fn({[key]: {newValue: next}}, 'local');
    }
  });
  return {
    local: {
      async get(key) {return {[key]: JSON.parse(localStorage.getItem(keys[key]) ?? 'null')};},
      async set(values) {
        const changes = {};
        for (const [key, value] of Object.entries(values)) {
          localStorage.setItem(keys[key], JSON.stringify(value));
          changes[key] = {newValue: value};
        }
        for (const fn of listeners) fn(changes, 'local');
      }
    },
    onChanged: {addListener(fn) {listeners.add(fn);}, removeListener(fn) {listeners.delete(fn);}}
  };
}
