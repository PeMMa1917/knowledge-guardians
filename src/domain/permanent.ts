/**
 * Permanent credit: concept XP, awards, skill milestones and badges.
 *
 * Kept apart from campaign state. Loading an older checkpoint does NOT remove
 * permanent credit, and replaying an objective cannot exceed a criterion's
 * fixed maximum (spec 24.2, 27.1 "Permanent-credit replay").
 */
import type { AwardRecord, CampaignState, Concept, ContentPack, PermanentRecord } from './types';
import { PERMANENT_SCHEMA } from './types';
import { check } from './rules';

export function newPermanent(): PermanentRecord {
  return {
    schema: PERMANENT_SCHEMA, credit: {}, awards: {}, moments: {}, signals: {}, dismissed: [], offered: [],
    met: { concepts: {}, atl: {}, subjects: {}, aoks: {} }, portfolio: [], stones: {}, skills: {},
  };
}

/** Permanent record migrations. v1 had only credit and awards. */
export function migratePermanent(raw: any): PermanentRecord {
  if (!raw || typeof raw !== 'object' || typeof raw.schema !== 'number') return newPermanent();
  if (raw.schema > PERMANENT_SCHEMA) throw new Error('Permanent record was made by a newer version.');
  let p = raw;
  if (p.schema === 1) p = { ...newPermanent(), credit: p.credit ?? {}, awards: p.awards ?? {} };
  if (p.schema === 2) p = { ...p, schema: 3, stones: {} };
  if (p.schema === 3) p = { ...p, schema: 4, skills: {} };
  return p as PermanentRecord;
}

/** Grant a criterion. Idempotent: the total never passes the criterion maximum. */
export function grantCredit(p: PermanentRecord, pack: ContentPack, criterionId: string): { record: PermanentRecord; gained: number } {
  const c = pack.criteria.find((x) => x.id === criterionId);
  if (!c) throw new Error(`Unknown criterion ${criterionId}`);
  const have = p.credit[c.id] ?? 0;
  const gained = Math.max(0, c.maximum - have);
  if (gained === 0) return { record: p, gained: 0 };
  return { record: { ...p, credit: { ...p.credit, [c.id]: c.maximum } }, gained };
}

/** Award any award whose condition now holds and that is not yet earned. */
export function checkAwards(p: PermanentRecord, pack: ContentPack, s: CampaignState, now: string): { record: PermanentRecord; newly: AwardRecord[]; xp: number } {
  let record = p;
  const newly: AwardRecord[] = [];
  let xp = 0;
  for (const a of pack.awards) {
    if (record.awards[a.id]) continue;
    if (!check(a.when, s)) continue;
    record = { ...record, awards: { ...record.awards, [a.id]: now } };
    for (const cid of a.criteria) {
      const r = grantCredit(record, pack, cid);
      record = r.record;
      xp += r.gained;
    }
    newly.push(a);
  }
  return { record, newly, xp };
}

export function conceptXP(p: PermanentRecord, pack: ContentPack): Record<Concept, number> {
  const out = {} as Record<Concept, number>;
  for (const c of pack.criteria) out[c.concept] = (out[c.concept] ?? 0) + (p.credit[c.id] ?? 0);
  return out;
}

export function totalXP(p: PermanentRecord): number {
  return Object.values(p.credit).reduce((a, b) => a + b, 0);
}
