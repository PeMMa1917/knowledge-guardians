import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { CALLBOARD_CASES, GAGE } from '../src/content/callboardCases';
import { FIELD_BADGES, FIELD_INDEX } from '../src/content/fieldBadges';
import { checkAwards, totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const pack = buildPack();
const date = '2026-11-26T10:58:00.000Z';
const badgeIds = pack.awards.filter(({ id }) => id.startsWith('badge.field.'));
const allObjectives = new Set(pack.missions.flatMap(({ objectives }) => objectives.map(({ id }) => id)));

const prop = (d: Driver, id: string) =>
  MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id && check(candidate.visibleIf, d.s));

function read(d: Driver, id: string) {
  const sign = prop(d, id);
  expect(sign?.kind).toBe('sign');
  d.run({ type: 'SetFlag', flag: sign!.flag!, value: true });
}

describe('What the Work Leaves', () => {
  it('adds twelve zero-credit badges with existing deed requirements and distinct titles', () => {
    expect(badgeIds).toHaveLength(12);
    expect(new Set(badgeIds.map(({ title }) => title)).size).toBe(12);
    for (const badge of badgeIds) {
      const definition = FIELD_BADGES.find(({ id }) => badge.id === 'badge.field.' + id)!;
      expect(badge.criteria).toEqual([]);
      if ('all' in definition.earned) for (const condition of definition.earned.all) {
        expect('objective' in condition && allObjectives.has(condition.objective), badge.id).toBe(true);
      }
      expect(pack.awards.filter(({ title }) => title === badge.title)).toHaveLength(1);
    }
  });

  it('needs actual equipment follow-through for the source-return title', () => {
    const d = new Driver();
    const record = CALLBOARD_CASES.find(({ key }) => key === GAGE)!;
    d.run({ type: 'InspectExhibit', exhibit: record.artifact });
    expect(d.p.awards['badge.field.source-return']).toBeUndefined();
    d.s.objectivesDone.push(record.objective);
    d.run({ type: 'ClaimSpecimen', exhibit: record.artifact });
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(GAGE) });
    expect(d.p.awards['badge.field.source-return']).toBeUndefined();
    d.s.mapId = record.revisit.map;
    for (const index of [0, 1, 2]) d.run({ type: 'ChooseDialogueOption', node: record.nodes.return, index });
    expect(d.p.awards['badge.field.source-return']).toBeDefined();
  });

  it('opens the alternate dry footpath only after both repairs and a real installation', () => {
    const d = new Driver();
    d.s.mapId = 'aethelgard.ferry';
    d.s.objectivesDone.push('washhouse.o.recheck');
    expect(prop(d, 'field-badge-dry-bench')).toBeUndefined();
    d.s.objectivesDone.push('water.routing.finish');
    const awards = checkAwards(d.p, pack, d.s, date);
    expect(awards.record.awards['badge.field.dry-step']).toBe(date);
    expect(totalXP(awards.record) - totalXP(d.p)).toBe(0);
    expect(prop(d, 'field-badge-dry-bridge')).toBeUndefined();
    d.walk(prop(d, 'field-badge-dry-bench')!.node!, ['Lay the dry board']);
    const bridge = prop(d, 'field-badge-dry-bridge')!;
    expect(bridge.to).toMatchObject({ map: d.s.mapId, x: 11, y: 10 });
    expect(prop(d, 'field-badge-dry-receipt')).toBeUndefined();
    d.run({ type: 'SetFlag', flag: bridge.flag!, value: true });
    read(d, 'field-badge-dry-receipt');
    expect(d.done('field-work.dry.receipt')).toBe(true);
  });

  it.each([['rail', 'Raise the three'], ['bench', 'Slide the cue']] as const)(
    'keeps one persistent %s cue placement after its own visitor test', (side, choice) => {
      const d = new Driver();
      d.s.objectivesDone.push('curtain.workmen', 'stage.finish');
      expect(prop(d, 'field-badge-cue-rail')).toBeUndefined();
      d.walk(prop(d, 'field-badge-cue-rest')!.node!, [choice]);
      expect(prop(d, 'field-badge-cue-' + (side === 'rail' ? 'bench' : 'rail'))).toBeUndefined();
      read(d, 'field-badge-cue-' + side);
      expect(d.done('field-work.cue.receipt')).toBe(true);
    },
  );

  it('retains the title and lends the split index on an earlier checkpoint', () => {
    const complete = new Driver();
    complete.s.objectivesDone.push('copy.o.relay', 'nile.handoff.send');
    const earned = checkAwards(complete.p, pack, complete.s, date);
    const badgeId = 'badge.field.signed-copy';
    expect(earned.record.awards[badgeId]).toBe(date);
    const earlier = new Driver();
    earlier.s.mapId = 'nexus.badge-annex';
    expect(checkAwards(earned.record, pack, earlier.s, date).record.awards[badgeId]).toBe(date);
    expect(prop(earlier, 'field-badge-docket-loan')).toBeUndefined();
    earlier.s.flags['title.worn'] = badgeIds.find(({ id }) => id === badgeId)!.title!;
    earlier.walk(prop(earlier, 'field-badge-docket-loan')!.node!, ['Take the split index']);
    expect(earlier.s.inventory[FIELD_INDEX]).toBe(1);
    expect(prop(earlier, 'field-badge-docket-loan')).toBeUndefined();
    earlier.s.mapId = 'aethelgard.emberford';
    earlier.walk(prop(earlier, 'field-badge-docket-return')!.node!, ['Fit the index']);
    expect(prop(earlier, 'field-badge-docket-result')?.text).toContain('Date still open');
    expect(earlier.done('field-work.docket.receipt')).toBe(true);
  });

  it('leaves clear approach tiles and keeps the earlier Tupaia path arrival clear', () => {
    const exclusive = ['nexus.archive', 'nexus.badge-annex', 'aethelgard.ferry', 'aethelgard.emberford'];
    for (const room of exclusive.map((id) => MAPS[id])) {
      for (const spot of room.interactables.filter(({ id }) => id.startsWith('field-badge-'))) {
        expect(room.interactables.filter(({ id, x, y }) => !id.startsWith('field-badge-') && x === spot.x && y === spot.y), spot.id).toEqual([]);
        expect(room.npcs.filter(({ x, y }) => x === spot.x && y === spot.y), spot.id).toEqual([]);
        expect(room.floor(spot.x, spot.y), spot.id).toBeTruthy();
      }
    }
    const ferry = MAPS['aethelgard.ferry'];
    const tupaia = ferry.interactables.find(({ id }) => id === 'ferry-tupaia-footpath')!.to!;
    expect(ferry.interactables.filter(({ id, x, y }) => id.startsWith('field-badge-') && x === tupaia.x && y === tupaia.y)).toEqual([]);
  });
});
