# Privacy

VOD Buttons for Twitch stores your rewind and forward button configuration locally on your device using `chrome.storage.local`. Configuration consists of interval values, units and list order.

The extension does not collect, retain or transmit viewing history, video titles, Twitch account information or other personal data. It does not use analytics, tracking, cookies, a remote server or Chrome Sync. It makes no network requests of its own. Twitch operates independently under its own policies.

The `storage` permission is used for settings. The content script runs only on `https://www.twitch.tv/*` and `https://twitch.tv/*`, in the top-level page, to add controls to supported VOD players. It does not run on embedded players on other websites.

Reset to defaults replaces your custom configuration with the default intervals. Uninstalling the extension removes its local extension storage.
