export const THEME_KEY = 'appearanceTheme';
export const normalizeTheme = value => value === 'dark' ? 'dark' : 'light';

// Palettes from watch-youtube-with-friends/src/lib/appearance.css.
export const THEME_CSS = `
  :root, :host {
    color-scheme: light;
    --page: #fff3e8; --surface: #fffaf5; --surface-hover: #f4e7e3;
    --text: #3b241f; --muted: #7b615a; --border: #e8d4cd;
    --accent: #79516d; --accent-hover: #653e5a; --accent-text: #fff8ee;
    --focus: #7250a2; --error: #a13735; --connected: #4b7b38;
    --shadow: 0 2px 8px #6b34240a;
  }
  :root[data-theme='dark'], :host([data-theme='dark']) {
    color-scheme: dark;
    --page: #30202c; --surface: #422f3c; --surface-hover: #543e4d;
    --text: #fff0dc; --muted: #d4b4cd; --border: #705264;
    --accent: #ffc18e; --accent-hover: #ffd3ad; --accent-text: #3b241f;
    --focus: #e0b9fa; --error: #ffb6aa; --connected: #a2d982;
    --shadow: 0 2px 8px #10081018;
  }
`;

export function createThemeStore(api = chrome.storage) {
  return {
    async read() { return normalizeTheme((await api.local.get(THEME_KEY))[THEME_KEY]); },
    async write(theme) {
      if (!['light', 'dark'].includes(theme)) throw new Error('Invalid theme');
      await api.local.set({[THEME_KEY]: theme});
    },
    subscribe(listener) {
      const changed = (changes, area) => {
        if (area === 'local' && Object.hasOwn(changes, THEME_KEY))
          listener(normalizeTheme(changes[THEME_KEY].newValue));
      };
      api.onChanged.addListener(changed);
      return () => api.onChanged.removeListener(changed);
    }
  };
}

export function observeTheme(store, apply) {
  let revision = 0;
  let disposed = false;
  const unsubscribe = store.subscribe(theme => {
    revision++;
    if (!disposed) apply(theme);
  });
  async function refresh() {
    const current = ++revision;
    try {
      const theme = await store.read();
      if (!disposed && revision === current) apply(theme);
    } catch (error) {
      if (!disposed && revision === current) throw error;
    }
  }
  return {ready: refresh(), refresh, dispose() {disposed = true; unsubscribe();}};
}
