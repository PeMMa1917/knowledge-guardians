import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { BADGE_DEFINITIONS, BADGE_FAMILIES, BADGE_ROOM_OPEN, TOK_BADGES, badgeFamilyReady } from '../src/content/tokBadges';
import { checkAwards, newPermanent, totalXP } from '../src/domain/permanent';
import { oracleRun } from '../src/domain/oraclePress';
import { check } from '../src/domain/rules';
import type { Condition } from '../src/domain/types';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const pack = buildPack();
const now = '2026-11-26T10:35:00.000Z';
const byId = Object.fromEntries(TOK_BADGES.map((record) => [record.id, record]));
const objectiveIds = new Set(pack.missions.flatMap(({ objectives }) => objectives.map(({ id }) => id)));

function objectivesUsed(condition: Condition): string[] {
  if ('objective' in condition) return [condition.objective];
  if ('not' in condition) return objectivesUsed(condition.not);
  if ('any' in condition) return condition.any.flatMap(objectivesUsed);
  if ('all' in condition) return condition.all.flatMap(objectivesUsed);
  return [];
}

function used(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

describe('TOK recognition through gameplay', () => {
  it('maps every badge to implemented play, with distinct eight-family IDs and no score', () => {
    expect(BADGE_FAMILIES.map(({ id }) => BADGE_DEFINITIONS.filter(({ family }) => family === id).length))
      .toEqual([36, 18, 11, 10, 5, 4, 5, 4]);
    expect(Object.keys(byId)).toHaveLength(93);
    expect(pack.awards.filter(({ id }) => id.startsWith('badge.tok.'))).toHaveLength(93);
    for (const badge of TOK_BADGES) {
      const proofs = objectivesUsed(badge.when);
      expect(proofs.length, badge.id).toBeGreaterThan(0);
      expect(proofs.filter((id) => !objectiveIds.has(id)), badge.id).toEqual([]);
      expect(badge.criteria, badge.id).toHaveLength(0);
    }
  });

  it('preserves earned evidence even after loading an earlier campaign and uses the worn title to reopen the work', () => {
    const badge = byId['badge.tok.pillars.evidence.1'];
    const empty = new Driver();
    const active = new Driver();
    active.s.objectivesDone.push('m01.o3.lens');
    const first = checkAwards(newPermanent(), pack, active.s, now);
    expect(first.record.awards[badge.id]).toBe(now);
    expect(first.record.awards['badge.tok.pillars.evidence.2']).toBeUndefined();
    expect(totalXP(first.record)).toBe(0);
    const restored = checkAwards(first.record, pack, empty.s, '2026-11-27T11:40:00.000Z');
    expect(restored.newly).toEqual([]);
    expect(restored.record.awards[badge.id]).toBe(now);
    expect(check(badgeFamilyReady('pillars'), empty.s)).toBe(false);
    empty.s.flags['title.worn'] = badge.title!;
    expect(check(badgeFamilyReady('pillars'), empty.s)).toBe(true);
  });

  it('requires the earlier encounters for each later tier and accepts four genuine Areas of Knowledge', () => {
    const d = new Driver();
    const higher = byId['badge.tok.pillars.evidence.3'];
    d.s.objectivesDone.push('sea.compare', 'forest.compare');
    expect(check(higher.when, d.s)).toBe(false);
    d.s.objectivesDone.push('m01.o3.lens');
    expect(check(higher.when, d.s)).toBe(true);

    const finish = (key: string) => d.s.objectivesDone.push(...objectivesUsed(byId[`badge.tok.realms.${key}.3`].when));
    const capstone = byId['badge.tok.legend.realms'];
    for (const key of ['history', 'nature', 'arts', 'technology']) finish(key);
    expect(check(capstone.when, d.s)).toBe(false);
    finish('maths');
    expect(check(capstone.when, d.s)).toBe(true);
  });

  it('opens the visitors’ side passage only when its eligible task is carried out', () => {
    const d = new Driver();
    const door = used(d, 'badge-annex-door');
    expect(door).toBeUndefined();
    d.s.objectivesDone.push('m01.o6.label');
    expect(check(BADGE_ROOM_OPEN, d.s)).toBe(true);
    expect(used(d, 'badge-annex-door')?.to?.map).toBe('nexus.badge-annex');
    d.s.mapId = 'nexus.badge-annex';
    expect(used(d, 'badge-work-fellowship')).toBeUndefined();
    d.s.objectivesDone.push('council.team.trial', 'council.team.post');
    expect(used(d, 'badge-bench-door')).toBeUndefined();
    d.walk(used(d, 'badge-work-fellowship')!.node!, ['Open the side passage']);
    expect(used(d, 'badge-bench-door')?.to).toMatchObject({ map: 'nexus.badge-annex', x: 3, y: 4 });
    expect(used(d, 'badge-visitors-bench')).toBeDefined();
  });
});

describe('Nerin’s authored press', () => {
  it('holds the unseen slips fixed and makes the limitations of the two features visible', () => {
    const narrow = oracleRun('narrow', 'ink');
    const broad = oracleRun('broad', 'ink');
    const stamped = oracleRun('broad', 'stamp');
    expect(narrow.rows.map(({ copy }) => copy.id)).toEqual(['quay', 'landing', 'rail', 'shelter']);
    expect(broad.rows.map(({ copy }) => copy.id)).toEqual(narrow.rows.map(({ copy }) => copy.id));
    expect(stamped.rows.map(({ copy }) => copy.id)).toEqual(narrow.rows.map(({ copy }) => copy.id));
    expect(narrow.rows.map(({ call }) => call)).toEqual(['supported', 'unresolved', 'supported', 'unresolved']);
    expect(broad.rows.map(({ call }) => call)).toEqual(['defer', 'defer', 'defer', 'defer']);
    expect(stamped.rows.map(({ call }) => call)).toEqual(['unresolved', 'supported', 'supported', 'unresolved']);
    expect(stamped.rows.slice(2).every(({ call, copy }) => call !== copy.file)).toBe(true);
  });

  it.each([['walk', 7], ['desk', 8]] as const)('finishes the %s practice with both receipts and permission', (destination, placement) => {
    const d = new Driver();
    d.s.mapId = 'nexus.badge-annex';
    const choose = (index: number) => d.run({ type: 'ChooseDialogueOption', node: 'oracle.press', index });
    expect(() => choose(0)).toThrow(/not available/);
    d.s.objectivesDone.push('m01.o6.label');
    expect(used(d, 'oracle-holdout-rail')).toBeUndefined();
    choose(0); choose(1); choose(2);
    expect(d.done('oracle.examples')).toBe(true);
    expect(d.done('oracle.switch')).toBe(true);
    expect(() => choose(3)).toThrow(/not available/);
    for (const sign of ['oracle-holdout-rail', 'oracle-holdout-shelter']) {
      d.run({ type: 'SetFlag', flag: used(d, sign)!.flag!, value: true });
    }
    choose(3); choose(4); choose(5);
    for (const sign of ['oracle-cut-original', 'oracle-cut-log']) {
      d.run({ type: 'SetFlag', flag: used(d, sign)!.flag!, value: true });
    }
    choose(6);
    expect(() => choose(placement)).toThrow(/not available/);
    d.run({ type: 'SetFlag', flag: used(d, 'oracle-permission')!.flag!, value: true });
    choose(placement);
    expect(d.done('oracle.publish')).toBe(false);
    expect(used(d, 'oracle-reading-' + (destination === 'walk' ? 'desk' : 'walk'))).toBeUndefined();
    const scene = used(d, 'oracle-reading-' + destination)!;
    d.run({ type: 'ChooseDialogueOption', node: scene.node!, index: 0 });
    expect(used(d, 'oracle-posted-' + destination)).toBeDefined();
    expect(d.done('oracle.publish')).toBe(true);
    expect(Object.keys(d.p.awards).filter((id) => id.startsWith('badge.tok.oracle.'))).toHaveLength(10);
    expect(d.p.awards['badge.tok.legend.oracle']).toBeTruthy();
    expect(totalXP(d.p)).toBe(0);
  });
});
