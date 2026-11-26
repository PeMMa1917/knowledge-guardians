/** Local period totals and separate, player-authorized school score files. */
import { AOK_NAMES, CONCEPT_NAMES } from './curriculum';
import { dayOf } from './ledger';
import { FRAMEWORK } from './learningLevels';
import { CONCEPTS, type AOK, type PermanentRecord } from './types';

export const LEADERBOARD_PERIODS = ['daily', 'weekly', 'monthly', 'ytd'] as const;
export type LeaderboardPeriod = typeof LEADERBOARD_PERIODS[number];
export const LEADERBOARD_AOKS = ['HIS', 'NAT', 'HUM', 'ART', 'MAT'] as const satisfies readonly AOK[];

export interface LeaderboardMetric {
  id: string;
  label: string;
  unit: string;
  direction: 'higher' | 'lower';
}

const metric = (id: string, label: string, unit: string, direction: LeaderboardMetric['direction'] = 'higher'): LeaderboardMetric =>
  ({ id, label, unit, direction });

export const LEADERBOARD_METRICS: readonly LeaderboardMetric[] = [
  metric('xp', 'XP earned', 'XP'),
  metric('active-seconds', 'Active play time', 'seconds'),
  metric('quests', 'Quest completions', 'quests'),
  metric('npcs-met', 'New characters met', 'characters'),
  metric('npcs-befriended', 'New friendships', 'characters'),
  metric('map-discovery', 'Map discovered', 'percentage points'),
  metric('game:dive-depth', 'Deep Dive depth', 'm'),
  metric('game:forecast-brier', 'Forecast Board Brier score', '', 'lower'),
  metric('game:stitch-moves', 'Sefa’s stitching moves', 'moves', 'lower'),
  metric('game:stitch-seconds', 'Sefa’s stitching time', 'seconds', 'lower'),
  ...CONCEPTS.map(id => metric('concept:' + id, CONCEPT_NAMES[id], 'practices')),
  ...LEADERBOARD_AOKS.map(id => metric('aok:' + id, AOK_NAMES[id], 'practices')),
  ...FRAMEWORK.map(id => metric('framework:' + id,
    ({ scope: 'Scope', perspectives: 'Perspectives', 'methods-and-tools': 'Methods and tools', ethics: 'Ethics' })[id], 'practices')),
];
const metrics = new Map(LEADERBOARD_METRICS.map(entry => [entry.id, entry]));

export interface LeaderboardSharing {
  id: string;
  enabled: boolean;
  alias: string | null;
  revision: number;
}

export interface LeaderboardRecord {
  startedOn: string;
  /** Day totals only. Per-event dates, paths, dialogue, patron names and writing stay outside this ledger. */
  days: Record<string, Record<string, number>>;
  /** Stable completion IDs prevent replaying a rollback from raising first-time counts. */
  seen: string[];
  /** Union of map reveal chunks. It is private and used only for discovery deduplication. */
  maps: Record<string, string>;
  mapChunks: number;
  sharing?: LeaderboardSharing;
}

export function emptyLeaderboard(day: string, mapChunks: number): LeaderboardRecord {
  return { startedOn: day, days: {}, seen: [], maps: {}, mapChunks };
}

function calendarDate(day: unknown): Date | null {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(day + 'T12:00:00');
  return Number.isFinite(date.getTime()) && dayOf(date) === day ? date : null;
}

export function leaderboardPeriodRange(period: LeaderboardPeriod, now: Date = new Date()): { from: string; through: string } {
  const through = dayOf(now);
  const date = new Date(now.getTime());
  if (period === 'weekly') date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  if (period === 'monthly' || period === 'ytd') date.setDate(1);
  if (period === 'ytd') date.setMonth(0);
  return { from: dayOf(date), through };
}

type Values = Record<string, number | null>;
export interface PeriodHistory {
  period: LeaderboardPeriod;
  from: string;
  through: string;
  /** Earliest recorded date of the newer measures. Legacy time and XP can predate this. */
  availableFrom: string | null;
  values: Values;
}

function aggregateValue(key: string, previous: number | null, value: number): number {
  return key.startsWith('game:')
    ? previous === null ? value : metrics.get(key)?.direction === 'lower' ? Math.min(previous, value) : Math.max(previous, value)
    : (previous ?? 0) + value;
}

export function periodHistory(permanent: PermanentRecord, period: LeaderboardPeriod, now: Date = new Date()): PeriodHistory {
  const { from, through } = leaderboardPeriodRange(period, now);
  const record = permanent.leaderboard;
  const availableFrom = record && record.startedOn <= through ? record.startedOn : null;
  const inPeriod = (day: string) => day >= from && day <= through;
  const values: Values = Object.fromEntries(LEADERBOARD_METRICS.map(({ id }) =>
    [id, availableFrom && !id.startsWith('game:') && id !== 'map-discovery' ? 0 : null]));
  if (availableFrom && record?.mapChunks) values['map-discovery'] = 0;

  for (const [day, entry] of Object.entries(permanent.activity ?? {})) {
    if (!calendarDate(day) || !inPeriod(day) || !entry) continue;
    if (validNumber(entry.xp)) values.xp = (values.xp ?? 0) + entry.xp;
    if (validNumber(entry.secs)) values['active-seconds'] = (values['active-seconds'] ?? 0) + entry.secs;
  }
  for (const [day, summary] of Object.entries(record?.days ?? {})) {
    if (!inPeriod(day)) continue;
    for (const [key, value] of Object.entries(summary)) {
      if (key === 'map-discovery' && record?.mapChunks) values[key] = (values[key] ?? 0) + 100 * value / record.mapChunks;
      else if (Object.hasOwn(values, key) && key !== 'xp' && key !== 'active-seconds') {
        values[key] = aggregateValue(key, values[key], value);
      }
    }
  }
  for (const id of ['map-discovery', 'game:forecast-brier']) {
    if (values[id] !== null) values[id] = Number(values[id].toFixed(id === 'map-discovery' ? 3 : 4));
  }
  return { period, from, through, availableFrom, values };
}

const FORMAT = 'knowledge-guardians-leaderboard';
interface FileIdentity {
  format: typeof FORMAT;
  version: 1;
  id: string;
  revision: number;
  exportedAt: string;
}
export type LeaderboardFile = FileIdentity & (
  | ({ kind: 'scores'; alias: string } & PeriodHistory)
  | { kind: 'withdrawal' }
);

const validId = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{32}$/.test(value);
const validRevision = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const validNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e9;
const dictionary = (raw: unknown): raw is Record<string, unknown> => !!raw && typeof raw === 'object' && !Array.isArray(raw);
const validTimestamp = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

export function normalizeLeaderboardAlias(value: string): string | null {
  const alias = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  if (Array.from(alias).length < 2 || Array.from(alias).length > 24
    || !/^[\p{L}\p{N}][\p{L}\p{M}\p{N} _.'-]*$/u.test(alias)) return null;
  return alias;
}

export function leaderboardSharing(record: LeaderboardRecord, value: string | null, newId: () => string): LeaderboardRecord {
  const current = record.sharing;
  if (value === null && !current?.enabled) return record;
  const alias = value === null ? null : normalizeLeaderboardAlias(value);
  if (value !== null && !alias) throw new Error('Choose a nickname of 2–24 letters, numbers, spaces, or simple punctuation.');
  if (current?.enabled && current.alias === alias) return record;
  const id = current?.id ?? newId();
  if (!validId(id)) throw new Error('Could not create a private sharing identifier.');
  return { ...record, sharing: { id, enabled: alias !== null, alias, revision: (current?.revision ?? 0) + 1 } };
}

function identity(sharing: LeaderboardSharing, now: Date): FileIdentity {
  return { format: FORMAT, version: 1, id: sharing.id, revision: sharing.revision, exportedAt: now.toISOString() };
}

export function leaderboardFile(permanent: PermanentRecord, period: LeaderboardPeriod, now: Date = new Date(),
  metric?: string): LeaderboardFile | null {
  const sharing = permanent.leaderboard?.sharing;
  if (!sharing?.enabled || !sharing.alias) return null;
  if (metric !== undefined && !metrics.has(metric)) return null;
  const history = periodHistory(permanent, period, now);
  if (metric !== undefined) {
    history.values = { [metric]: history.values[metric] };
    if (metric === 'xp' || metric === 'active-seconds') {
      const firstDatedActivity = Object.entries(permanent.activity ?? {}).filter(([day, entry]) =>
        calendarDate(day) && day <= history.through && entry && validNumber(metric === 'xp' ? entry.xp : entry.secs))
        .map(([day]) => day).sort()[0];
      if (firstDatedActivity && (!history.availableFrom || firstDatedActivity < history.availableFrom)) {
        history.availableFrom = firstDatedActivity;
      }
    }
  }
  return { ...identity(sharing, now), kind: 'scores', alias: sharing.alias, ...history };
}

export function leaderboardWithdrawal(permanent: PermanentRecord, now: Date = new Date()): LeaderboardFile | null {
  const sharing = permanent.leaderboard?.sharing;
  return sharing && !sharing.enabled ? { ...identity(sharing, now), kind: 'withdrawal' } : null;
}

export function readLeaderboard(raw: unknown): { ok: true; file: LeaderboardFile } | { ok: false; reason: string } {
  if (!dictionary(raw) || raw.format !== FORMAT) return { ok: false, reason: 'This is not a Knowledge Guardians leaderboard file.' };
  if (raw.version !== 1) return { ok: false, reason: 'This leaderboard file uses another version.' };
  const damaged = { ok: false, reason: 'This leaderboard file is incomplete or damaged.' } as const;
  const { id, revision, exportedAt } = raw;
  if (!validId(id) || !validRevision(revision) || !validTimestamp(exportedAt)) return damaged;
  const file = { format: FORMAT, version: 1, id, revision, exportedAt } as const;
  if (raw.kind === 'withdrawal') return { ok: true, file: { ...file, kind: 'withdrawal' } };
  const { alias, period, from, through, availableFrom, values } = raw;
  if (raw.kind !== 'scores' || typeof alias !== 'string' || normalizeLeaderboardAlias(alias) !== alias
    || !LEADERBOARD_PERIODS.some(p => p === period) || typeof from !== 'string' || typeof through !== 'string'
    || !dictionary(values) || (availableFrom !== null && (typeof availableFrom !== 'string'
      || !calendarDate(availableFrom) || availableFrom > through))) return damaged;
  const anchor = calendarDate(through);
  if (!anchor || leaderboardPeriodRange(period as LeaderboardPeriod, anchor).from !== from) return damaged;
  const clean: Values = {};
  for (const metric of LEADERBOARD_METRICS) {
    if (!Object.hasOwn(values, metric.id)) continue;
    const value = values[metric.id];
    if (value !== null && (!validNumber(value) || (metric.id === 'map-discovery' && value > 100)
      || (metric.id === 'game:forecast-brier' && value > 1)
      || (!['map-discovery', 'game:forecast-brier'].includes(metric.id) && !Number.isInteger(value)))) return damaged;
    clean[metric.id] = typeof value === 'number' && ['map-discovery', 'game:forecast-brier'].includes(metric.id)
      ? Number(value.toFixed(metric.id === 'map-discovery' ? 3 : 4)) : value;
  }
  if (!Object.keys(clean).length) return damaged;
  return { ok: true, file: { ...file, kind: 'scores', alias, period: period as LeaderboardPeriod, from, through,
    availableFrom: availableFrom as string | null, values: clean } };
}

export function rankLeaderboard(files: readonly LeaderboardFile[], period: LeaderboardPeriod, metric: string,
  now: Date = new Date()): { id: string; rank: number; alias: string; value: number; availableFrom: string | null; through: string }[] {
  const setting = metrics.get(metric);
  if (!setting) return [];
  const { from, through } = leaderboardPeriodRange(period, now);
  const newest = new Map<string, LeaderboardFile>();
  for (const file of files) {
    const previous = newest.get(file.id);
    if (!previous || previous.revision < file.revision || (previous.revision === file.revision && file.kind === 'withdrawal')) newest.set(file.id, file);
  }
  const entries = new Map<string, Extract<LeaderboardFile, { kind: 'scores' }>>();
  for (const file of files) {
    const consent = newest.get(file.id);
    if (file.kind !== 'scores' || consent?.kind !== 'scores' || consent.revision !== file.revision || consent.alias !== file.alias
      || file.period !== period || file.from !== from || file.through > through || !Object.hasOwn(file.values, metric)) continue;
    const prior = entries.get(file.id);
    if (!prior || prior.through < file.through || (prior.through === file.through && prior.exportedAt < file.exportedAt)) entries.set(file.id, file);
  }
  const ordered = [...entries.values()].flatMap(file => {
    const value = file.values[metric];
    return typeof value === 'number' ? [{ id: file.id, alias: file.alias, value, availableFrom: file.availableFrom, through: file.through }] : [];
  }).sort((a, b) => (setting.direction === 'higher' ? b.value - a.value : a.value - b.value)
    || a.alias.localeCompare(b.alias) || a.id.localeCompare(b.id));
  let rank = 0;
  return ordered.map((row, index) => {
    if (index === 0 || ordered[index - 1].value !== row.value) rank = index + 1;
    return { ...row, rank };
  });
}

/**
 * Compact imports in memory. A withdrawal or alias revision supersedes previous
 * files for the same opaque participant, including older imports made afterward.
 */
export function mergeLeaderboardFiles(current: readonly LeaderboardFile[], incoming: readonly LeaderboardFile[]): LeaderboardFile[] {
  const groups = new Map<string, LeaderboardFile[]>();
  for (const file of [...current, ...incoming]) {
    const rows = groups.get(file.id);
    const known = rows?.[0];
    if (known && known.revision > file.revision) continue;
    if (!known || file.revision > known.revision) {
      groups.set(file.id, [file]);
    } else if (known.kind !== 'withdrawal') {
      if (file.kind === 'withdrawal') groups.set(file.id, [file]);
      else if (file.alias === known.alias) rows!.push(file);
    }
  }
  const files: LeaderboardFile[] = [];
  for (const rows of groups.values()) {
    const withdrawn = rows.find(row => row.kind === 'withdrawal');
    if (withdrawn) { files.push(withdrawn); continue; }
    const latest = new Map<string, Extract<LeaderboardFile, { kind: 'scores' }>>();
    for (const row of rows) if (row.kind === 'scores') for (const [metric, value] of Object.entries(row.values)) {
      const key = row.period + ':' + row.from + ':' + row.through + ':' + metric;
      const prior = latest.get(key);
      if (!prior || row.through > prior.through || row.through === prior.through && row.exportedAt > prior.exportedAt) {
        latest.set(key, { ...row, values: { [metric]: value } });
      }
    }
    const combined = new Map<string, Extract<LeaderboardFile, { kind: 'scores' }>>();
    for (const row of latest.values()) {
      const key = row.period + ':' + row.from + ':' + row.through + ':' + row.exportedAt;
      const found = combined.get(key);
      combined.set(key, found ? { ...found, values: { ...found.values, ...row.values } } : row);
    }
    files.push(...combined.values());
  }
  return files;
}

/** Older saves may have no dated measures. Recover local history without inventing dates for it. */
export function normalizeLeaderboard(raw: unknown): LeaderboardRecord | undefined {
  if (!dictionary(raw) || typeof raw.startedOn !== 'string' || !calendarDate(raw.startedOn)) return undefined;
  const result = emptyLeaderboard(raw.startedOn, Number.isSafeInteger(raw.mapChunks) && validNumber(raw.mapChunks) ? raw.mapChunks : 0);
  if (dictionary(raw.days)) for (const [day, row] of Object.entries(raw.days)) {
    if (day < result.startedOn || !calendarDate(day) || !dictionary(row)) continue;
    const clean: Record<string, number> = {};
    for (const [key, val] of Object.entries(row)) if (metrics.has(key) && validNumber(val)
      && key !== 'xp' && key !== 'active-seconds') clean[key] = val;
    result.days[day] = clean;
  }
  if (Array.isArray(raw.seen)) result.seen = [...new Set(raw.seen.filter((id): id is string =>
    typeof id === 'string' && /^(objective|quest|met|friend):[a-zA-Z0-9.:-]{1,140}$/.test(id)))];
  if (dictionary(raw.maps)) for (const [key, val] of Object.entries(raw.maps)) {
    if (/^[\w.-]{1,120}$/.test(key) && typeof val === 'string' && /^[0-9a-f]{1,4096}$/.test(val)) {
      Object.defineProperty(result.maps, key, { value: val, enumerable: true, writable: true, configurable: true });
    }
  }
  const s = raw.sharing;
  if (dictionary(s) && validId(s.id) && validRevision(s.revision)) {
    if (s.enabled === true && typeof s.alias === 'string' && normalizeLeaderboardAlias(s.alias) === s.alias) {
      result.sharing = { id: s.id, revision: s.revision, enabled: true, alias: s.alias };
    } else if (s.enabled === false) {
      result.sharing = { id: s.id, revision: s.revision, enabled: false, alias: null };
    }
  }
  return result;
}
