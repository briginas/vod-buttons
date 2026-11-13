import {STORAGE_KEY, normalizeSettings, validSettings} from './settings.js';

export function createStore(api = chrome.storage) {
  return {
    async read() {
      const data = await api.local.get(STORAGE_KEY);
      return normalizeSettings(data[STORAGE_KEY]);
    },
    async write(settings) {
      if (!validSettings(settings)) throw new Error('Invalid settings');
      await api.local.set({[STORAGE_KEY]: normalizeSettings(settings)});
    },
    subscribe(listener) {
      const changed = (changes, area) => {
        if (area === 'local' && Object.hasOwn(changes, STORAGE_KEY))
          listener(normalizeSettings(changes[STORAGE_KEY].newValue));
      };
      api.onChanged.addListener(changed);
      return () => api.onChanged.removeListener(changed);
    }
  };
}
