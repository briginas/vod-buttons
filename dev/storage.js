// Development preview only. Never included in dist/.
export function previewStorage() {
  const listeners = new Set();
  window.addEventListener('storage', event => {
    if (event.key === 'vod-buttons-preview') {
      const next = event.newValue ? JSON.parse(event.newValue) : undefined;
      for (const fn of listeners) fn({seekSettings: {newValue: next}}, 'local');
    }
  });
  return {
    local: {
      async get() {return {seekSettings: JSON.parse(localStorage.getItem('vod-buttons-preview') ?? 'null')};},
      async set({seekSettings}) {
        localStorage.setItem('vod-buttons-preview', JSON.stringify(seekSettings));
        for (const fn of listeners) fn({seekSettings: {newValue: seekSettings}}, 'local');
      }
    },
    onChanged: {addListener(fn) {listeners.add(fn);}, removeListener(fn) {listeners.delete(fn);}}
  };
}
