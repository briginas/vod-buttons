export const STORAGE_KEY = 'seekSettings';
export const MAX_BUTTONS = 6;
export const DIRECTIONS = ['rewind', 'forward'];

export function defaults() {
  const intervals = () => [5, 15, 30].map(value => ({value, unit: 'seconds'}))
    .concat({value: 1, unit: 'minutes'});
  return {version: 1, rewind: intervals(), forward: intervals()};
}

export function seconds(interval) {
  if (!interval || !['seconds', 'minutes'].includes(interval.unit) ||
      !Number.isSafeInteger(interval.value) || interval.value <= 0) return null;
  const result = interval.value * (interval.unit === 'minutes' ? 60 : 1);
  return Number.isSafeInteger(result) ? result : null;
}

export function parseInterval(text, unit) {
  if (!/^\d+$/.test(text.trim())) return {error: 'Enter a positive whole number.'};
  const interval = {value: Number(text), unit};
  if (seconds(interval) === null) return {error: 'Enter a positive whole number small enough to store safely.'};
  return {interval};
}

export function validSettings(value) {
  return value?.version === 1 && DIRECTIONS.every(direction =>
    Array.isArray(value[direction]) && value[direction].length <= MAX_BUTTONS &&
    Array.from(value[direction]).every(interval => seconds(interval) !== null));
}

export function normalizeSettings(value) {
  if (!validSettings(value)) return defaults();
  return {version: 1, ...Object.fromEntries(DIRECTIONS.map(direction =>
    [direction, value[direction].map(({value, unit}) => ({value, unit}))]))};
}

export function label(interval, direction) {
  return `${direction === 'rewind' ? '−' : '+'}${interval.value} ${interval.unit === 'minutes' ? 'min' : 's'}`;
}

export function accessibleLabel(interval, direction) {
  const unit = interval.unit === 'minutes' ? 'minute' : 'second';
  return `${direction === 'rewind' ? 'Rewind' : 'Forward'} ${interval.value} ${unit}${interval.value === 1 ? '' : 's'}`;
}

export function seekTarget(current, duration, offset) {
  if (![current, duration, offset].every(Number.isFinite) || duration <= 0) return null;
  return Math.max(0, Math.min(duration, current + offset));
}
