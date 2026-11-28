// Score files and the optional class board accept the same public values.
export function normalizeScoreValue(activity, value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e9) return null;
  if (activity === 'map-discovery') return value <= 100 ? Number(value.toFixed(3)) : null;
  if (activity === 'game:forecast-brier') return value <= 1 ? Number(value.toFixed(4)) : null;
  return Number.isInteger(value) ? value : null;
}
export function normalizeLeaderboardAlias(value) {
  if (typeof value !== 'string') return null;
  const alias = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  const length = Array.from(alias).length;
  return length >= 2 && length <= 24 && /^[\p{L}\p{N}][\p{L}\p{M}\p{N} _.'-]*$/u.test(alias) ? alias : null;
}
