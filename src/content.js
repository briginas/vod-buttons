import {createStore} from './storage.js';
import {startController} from './controller.js';

// Content scripts run in the top frame only, in Chrome's isolated world.
if (window.top === window) {
  const controller = startController({store: createStore()});
  window.addEventListener('pagehide', event => {
    if (!event.persisted) controller.stop();
  }, {once: true});
}
