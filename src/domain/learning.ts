/**
 * Learning records that live in the permanent record (Part L):
 * learner profile moments (spec 90), misconception signals and alerts
 * (spec 95), the evidence portfolio (spec 94.4) and weave counts for the
 * class dashboard (spec 94.2). Also the event deck (spec 93).
 *
 * Rules: no character grades (PROFILE-001); alerts never fire on values
 * (MISC-002); randomness never removes learning credit (RAND-001).
 */
import type {
  CampaignState, ContentPack, EventRecord, MisconceptionRecord, MomentRule, PermanentRecord, PortfolioEntry, Weave,
} from './types';
import { check, nextRandom } from './rules';

const DAY = 24 * 3600 * 1000;

export function recordWeave(p: PermanentRecord, w: Weave | undefined): PermanentRecord {
  if (!w) return p;
  const met = structuredClone(p.met);
  for (const c of w.concepts) met.concepts[c] = (met.concepts[c] ?? 0) + 1;
  for (const a of w.atl) met.atl[a] = (met.atl[a] ?? 0) + 1;
  for (const s of w.subjects ?? []) met.subjects[s] = (met.subjects[s] ?? 0) + 1;
  for (const k of w.aoks ?? []) met.aoks[k] = (met.aoks[k] ?? 0) + 1;
  return { ...p, met };
}

/** New learner-profile moments whose condition now holds. Recorded once each. */
export function checkMoments(p: PermanentRecord, pack: ContentPack, s: CampaignState, now: string): { record: PermanentRecord; newly: MomentRule[] } {
  const newly = pack.moments.filter((m) => !p.moments[m.id] && check(m.when, s));
  if (!newly.length) return { record: p, newly };
  const moments = { ...p.moments };
  for (const m of newly) moments[m.id] = now;
  return { record: { ...p, moments }, newly };
}

function countInWindow(times: string[], days: number, now: string): number {
  const t = Date.parse(now);
  return times.filter((x) => t - Date.parse(x) <= days * DAY).length;
}

/**
 * Record a misconception signal. Returns the reflection to offer the student
 * when the student threshold is reached for the first time (spec 95.1 step 2).
 */
export function addSignal(p: PermanentRecord, pack: ContentPack, id: string, now: string): { record: PermanentRecord; offer: MisconceptionRecord | null } {
  const m = pack.misconceptions.find((x) => x.id === id);
  if (!m) return { record: p, offer: null };
  const list = [...(p.signals[id] ?? []), now].slice(-50);
  let record: PermanentRecord = { ...p, signals: { ...p.signals, [id]: list } };
  let offer: MisconceptionRecord | null = null;
  if (countInWindow(list, m.student.days, now) >= m.student.count && !record.offered.includes(id)) {
    offer = m;
    record = { ...record, offered: [...record.offered, id] };
  }
  return { record, offer };
}

export interface Alert { misconception: MisconceptionRecord; count: number; level: 'watch' | 'alert' }

/**
 * Alerts for one student. "alert" means the teacher threshold is reached
 * (spec 95.1 step 3). "watch" means signals were seen but below it. Each
 * alert says it may be wrong (MISC-001).
 */
export function studentAlerts(p: PermanentRecord, pack: ContentPack, now: string): Alert[] {
  const out: Alert[] = [];
  for (const m of pack.misconceptions) {
    if (p.dismissed.includes(m.id)) continue;
    const n = countInWindow(p.signals[m.id] ?? [], m.teacher.days, now);
    if (n === 0) continue;
    out.push({ misconception: m, count: n, level: n >= m.teacher.count ? 'alert' : 'watch' });
  }
  return out;
}

export function addPortfolio(p: PermanentRecord, e: Omit<PortfolioEntry, 'id' | 'shared' | 'reflection'>): PermanentRecord {
  const id = `pf-${p.portfolio.length + 1}-${Date.parse(e.at) || 0}`;
  const entry: PortfolioEntry = { ...e, id, shared: false, reflection: '' };
  return { ...p, portfolio: [...p.portfolio, entry].slice(-500) };
}

// ---------------------------------------------------------------------------
// Event deck (spec 93)
// ---------------------------------------------------------------------------

/** Seconds of exploration between events: 10 to 15 minutes (spec 93.1). */
export const EVENT_MIN = 600;
export const EVENT_SPREAD = 300;

/**
 * Advance the event clock by exploration seconds. The shell calls this only
 * while the player explores (never in a Showdown, reading or reflection).
 * Returns a new pending event when one is due. Seeded (RAND-003); no repeat
 * of a seen event (RAND-006); every event is free (RAND-002).
 */
export function tickEvents(pack: ContentPack, s0: CampaignState, seconds: number): CampaignState {
  if (s0.events.pending || seconds <= 0) return s0;
  let s = { ...s0, events: { ...s0.events, clock: s0.events.clock + seconds } };
  if (s.events.clock < s.events.next) return s;
  const pool = eligibleEvents(pack, s);
  if (!pool.length) { s.events.clock = 0; return s; }
  // Bad-luck protection (RAND-004): prefer a type the player has not met yet.
  const seenTypes = new Set(s.events.seen.map((id) => pack.events.find((e) => e.id === id)?.type));
  const fresh = pool.filter((e) => !seenTypes.has(e.type));
  const from = fresh.length ? fresh : pool;
  let r: number;
  [r, s] = nextRandom(s);
  const ev = from[Math.floor(r * from.length)];
  [r, s] = nextRandom(s);
  s.events.pending = ev.id;
  s.events.clock = 0;
  s.events.next = EVENT_MIN + Math.floor(r * EVENT_SPREAD);
  return s;
}

export function eligibleEvents(pack: ContentPack, s: CampaignState): EventRecord[] {
  return pack.events.filter((e) => e.maps.includes(s.mapId) && !s.events.seen.includes(e.id) && check(e.when, s));
}
