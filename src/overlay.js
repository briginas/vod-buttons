import {DIRECTIONS, label, accessibleLabel, seconds, seekTarget} from './settings.js';
import {CONTROL_BAR} from './twitch.js';
import {THEME_CSS, normalizeTheme} from './appearance.js';

export const POINTER_IDLE_MS = 1500;

const CSS = THEME_CSS + `
  :host { all: initial !important; position: absolute !important; inset: 0 !important;
    z-index: 20 !important; pointer-events: none !important; display: block !important; }
  .area { position: absolute; top: 12px; bottom: var(--bottom, 72px); left: 12px; right: 12px;
    display: flex; align-items: center; justify-content: space-between; pointer-events: none; }
  .column { position: relative; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px;
    max-height: 100%; overflow-y: auto; overflow-x: hidden; padding: 4px;
    overscroll-behavior: contain; touch-action: pan-y; scrollbar-width: auto;
    scrollbar-color: var(--muted) var(--surface); pointer-events: none; opacity: 0; min-height: 0;
    max-width: calc(50% - 4px); }
  .column::-webkit-scrollbar { width: 10px; }
  .column::-webkit-scrollbar-track { background: var(--surface); border-radius: 6px; }
  .column::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 6px; border: 2px solid var(--surface); }
  :host([data-hover]) .column, :host([data-keyboard-focus]) .column { opacity: 1; pointer-events: auto; }
  .forward { margin-left: auto; }
  button { box-sizing: border-box; flex: 0 0 auto; min-width: 88px; min-height: 40px; padding: 8px 12px;
    border: 1px solid var(--border); border-radius: 14px; background: var(--surface); color: var(--text); box-shadow: var(--shadow);
    font: 600 15px/1.35 system-ui, sans-serif; text-align: center; cursor: pointer;
    overflow-wrap: anywhere; }
  button:hover { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
  button:focus-visible { outline: 3px solid var(--focus); outline-offset: -3px; }
  @media (prefers-reduced-motion: no-preference) { .column { transition: opacity 100ms; } }
`;

export function attachOverlay(context, settings, isCurrent) {
  const {player, video} = context;
  const doc = player.ownerDocument;
  const host = doc.createElement('vod-buttons-controls');
  const root = host.attachShadow({mode: 'open'});
  const style = doc.createElement('style');
  style.textContent = CSS;
  const area = doc.createElement('div');
  area.className = 'area';
  root.append(style, area);
  const abort = new AbortController();
  let renderAbort;
  let idleTimer;
  const on = (target, event, callback, options = {}) =>
    target.addEventListener(event, callback, {...options, signal: abort.signal});
  // Bubbling stops here; native button activation and wheel/touch scrolling keep their defaults.
  for (const event of ['click', 'dblclick', 'pointerdown', 'pointerup', 'mousedown', 'mouseup',
    'touchstart', 'touchmove', 'touchend', 'wheel', 'keydown', 'keyup'])
    on(area, event, event => event.stopPropagation(), {passive: !['keydown', 'keyup', 'click'].includes(event)});
  function pointerActivity() {
    clearTimeout(idleTimer);
    host.removeAttribute('data-keyboard-focus');
    host.setAttribute('data-hover', '');
    idleTimer = setTimeout(() => {
      idleTimer = undefined;
      host.removeAttribute('data-hover');
    }, POINTER_IDLE_MS);
  }
  function pointerLeave() {
    clearTimeout(idleTimer);
    idleTimer = undefined;
    host.removeAttribute('data-hover');
  }
  on(player, 'pointerenter', pointerActivity);
  on(player, 'pointermove', pointerActivity, {passive: true});
  on(player, 'pointerdown', () => {
    host.removeAttribute('data-keyboard-focus');
    pointerActivity();
  }, {capture: true, passive: true});
  // Capture runs before the overlay stops bubbling, keeping native scrolling intact.
  on(player, 'wheel', pointerActivity, {capture: true, passive: true});
  on(player, 'pointerleave', pointerLeave);
  on(area, 'focusin', event => {
    host.toggleAttribute('data-keyboard-focus', event.target.matches('button:focus-visible'));
  });
  on(area, 'keydown', event => {
    if (event.target.matches('button')) host.setAttribute('data-keyboard-focus', '');
  });
  on(area, 'focusout', event => {
    if (!area.contains(event.relatedTarget)) host.removeAttribute('data-keyboard-focus');
  });
  if (player.matches(':hover')) pointerActivity();

  function update(next) {
    // Preserve the focused direction/index when settings are updated from another tab.
    const active = root.activeElement;
    const focus = active?.dataset.direction ? [active.dataset.direction, Number(active.dataset.index)] : null;
    const keyboardFocus = host.hasAttribute('data-keyboard-focus');
    const scroll = Object.fromEntries(Array.from(area.children).map(e => [e.dataset.direction, e.scrollTop]));
    renderAbort?.abort();
    renderAbort = new AbortController();
    area.replaceChildren();
    for (const direction of DIRECTIONS) {
      if (!next[direction].length) continue;
      const column = doc.createElement('div');
      column.className = `column ${direction}`;
      column.dataset.direction = direction;
      column.setAttribute('role', 'group');
      column.setAttribute('aria-label', direction === 'rewind' ? 'Rewind controls' : 'Forward controls');
      next[direction].forEach((interval, index) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.textContent = label(interval, direction);
        button.setAttribute('aria-label', accessibleLabel(interval, direction));
        button.dataset.direction = direction;
        button.dataset.index = index;
        button.addEventListener('focus', () => {
          // Only scroll the column, never the Twitch page.
          if (button.offsetTop < column.scrollTop) column.scrollTop = button.offsetTop;
          else if (button.offsetTop + button.offsetHeight > column.scrollTop + column.clientHeight)
            column.scrollTop = button.offsetTop + button.offsetHeight - column.clientHeight;
        }, {signal: renderAbort.signal});
        button.addEventListener('click', () => {
          if (!isCurrent()) return;
          const target = seekTarget(video.currentTime, video.duration,
            seconds(interval) * (direction === 'rewind' ? -1 : 1));
          if (target === null) return;
          // Setting currentTime does not call play/pause; Twitch handles natural completion.
          try { video.currentTime = target; } catch { /* Media was removed or became unavailable. */ }
        }, {signal: renderAbort.signal});
        column.append(button);
      });
      area.append(column);
      column.scrollTop = scroll[direction] ?? 0;
    }
    if (focus) {
      const buttons = area.querySelectorAll(`.${focus[0]} button`);
      buttons[Math.min(focus[1], buttons.length - 1)]?.focus({preventScroll: true});
      host.toggleAttribute('data-keyboard-focus', keyboardFocus && !!root.activeElement);
    }
  }
  function resize() {
    const rect = player.getBoundingClientRect();
    const bar = player.querySelector(CONTROL_BAR);
    const barRect = bar?.getBoundingClientRect();
    const bottom = barRect?.height > 0 ? Math.max(64, rect.bottom - barRect.top + 12) : 72;
    host.style.setProperty('--bottom', `${bottom}px`);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(player);
  const bar = player.querySelector(CONTROL_BAR);
  if (bar) resizeObserver.observe(bar);
  on(doc, 'fullscreenchange', resize);
  player.append(host);
  update(settings);
  resize();
  return {host, update, resize, setTheme(theme) {host.dataset.theme = normalizeTheme(theme);}, destroy() {
    clearTimeout(idleTimer);
    abort.abort(); renderAbort?.abort(); resizeObserver.disconnect(); host.remove();
  }};
}
