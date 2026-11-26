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

export function addQuestionWay(record: PermanentRecord, id: string, way: string): PermanentRecord {
  const ways = record.stones?.[id] ?? [];
  if (ways.includes(way)) return record;
  return { ...record, stones: { ...record.stones, [id]: [...ways, way] } };
}

/** Incidental question links can be added after a keeper has finished the action. */
export function restoreQuestionWays(record: PermanentRecord, pack: ContentPack, completed: string[]): PermanentRecord {
  const done = new Set(completed);
  let updated = record;
  for (const { world, objectives } of pack.missions) {
    for (const objective of objectives) {
      if (!done.has(objective.id)) continue;
      for (const way of objective.questionWays ?? []) updated = addQuestionWay(updated, way.id, `${world}|${way.action}`);
    }
  }
  return updated;
}

const WATER_DELIVERY_USES: Readonly<Record<string, string>> = {
  'SK-MICRO-0233': 'game-22|parcel.o.appeal|HUM,POL',
  'SK-MICRO-0237': 'game-284|parcel.o.finish|HUM,POL',
  'SK-MICRO-0630': 'game-263|boundary.water.deliver|HUM',
  'SK-MICRO-0840': 'game-231|parcel.o.finish|HUM,POL',
};

/** These uses were filed under the sending mission. Preserve a single use under the receiving world. */
function restoreWaterAttribution(record: PermanentRecord): PermanentRecord {
  let skills = record.skills;
  for (const [id, evidence] of Object.entries(WATER_DELIVERY_USES)) {
    const old = `WORLD-13|${evidence}`;
    const current = `WORLD-12|${evidence}`;
    const uses = skills?.[id];
    if (!Array.isArray(uses) || !uses.includes(old)) continue;
    let recorded = false;
    const corrected = uses.flatMap((use) => {
      if (use !== old && use !== current) return [use];
      if (recorded) return [];
      recorded = true;
      return [current];
    });
    skills = { ...skills, [id]: corrected };
  }
  return skills === record.skills ? record : { ...record, skills };
}

export class NewerPermanentRecord extends Error {}

/** Permanent record migrations. v1 had only credit and awards. */
export function migratePermanent(raw: any): PermanentRecord {
  if (!raw || typeof raw !== 'object' || !Number.isSafeInteger(raw.schema) || raw.schema < 1) {
    throw new Error('Permanent record has an unknown format.');
  }
  if (raw.schema > PERMANENT_SCHEMA) throw new NewerPermanentRecord('Permanent record was made by a newer version.');
  let p = raw;
  if (p.schema === 1) p = { ...newPermanent(), credit: p.credit ?? {}, awards: p.awards ?? {} };
  if (p.schema === 2) p = { ...p, schema: 3, stones: {} };
  if (p.schema === 3) p = { ...p, schema: 4, skills: {} };
  const dictionary = (value: unknown) => !!value && typeof value === 'object' && !Array.isArray(value);
  if (![p.credit, p.awards, p.moments, p.signals, p.stones, p.skills, p.met?.concepts, p.met?.atl, p.met?.subjects, p.met?.aoks]
    .every(dictionary) || ![p.dismissed, p.offered, p.portfolio].every(Array.isArray)) {
    throw new Error('Permanent record is missing required data.');
  }
  return restoreWaterAttribution(p as PermanentRecord);
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

/** Competency rings (spec 47, C1): credited XP out of the most this chapter can give, per concept. */
export function conceptRings(p: PermanentRecord, pack: ContentPack): { concept: Concept; got: number; max: number }[] {
  const got = conceptXP(p, pack);
  const max = {} as Record<Concept, number>;
  for (const c of pack.criteria) max[c.concept] = (max[c.concept] ?? 0) + c.maximum;
  return (Object.keys(max) as Concept[]).map((k) => ({ concept: k, got: Math.min(got[k] ?? 0, max[k]), max: max[k] }));
}

export function totalXP(p: PermanentRecord): number {
  return Object.values(p.credit).reduce((a, b) => a + b, 0);
}
