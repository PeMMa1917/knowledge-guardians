import { studentName } from './studentNames.mjs';
// Personal records and legacy score files use the original numeric format.
export function normalizeScoreValue(activity, value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e9) return null;
  if (activity === 'map-discovery') return value <= 100 ? Number(value.toFixed(3)) : null;
  if (activity === 'game:forecast-brier') return value <= 1 ? Number(value.toFixed(4)) : null;
  return Number.isInteger(value) ? value : null;
}
export function normalizeLeaderboardAlias(value) {
  return studentName(value, 'alias');
}
