import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { DATE_REGISTER_CASES, dateRegisterEntries, rangeCaption } from '../src/content/dateRegisterCases';
import { BROOKLYN_KHIPU_KEY, BROOKLYN_RETURN, DRESDEN_CODEX_KEY, DRESDEN_RETURN, codexRail, dateRegisterGap, khipuRack, registerOrder } from '../src/domain/dateRegister';
import { playPath } from '../src/domain/learningPaths';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { STAMPS } from '../src/scenes/art';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
}

function move(d: Driver, id: string) {
  const passage = prop(d, id);
  if (!passage?.to || !check(passage.openIf, d.s)) throw new Error(`No passage: ${id}`);
  d.s.mapId = passage.to.map;
  if (passage.flag) d.run({ type: 'SetFlag', flag: passage.flag, value: true });
}

const measured = new Set([DRESDEN_CODEX_KEY, BROOKLYN_KHIPU_KEY]);

describe('The Beside Date and The Borrowed Date Guide', () => {
  it('distinguishes modelled event order, broad making bounds and the conservation shapes', () => {
    expect(dateRegisterGap({ first: -200, last: 300, eventYear: 1966, eventKind: 'display' })).toEqual({ first: 1666, last: 2165 });
    expect(registerOrder(dateRegisterGap({ first: 1801, last: 1900, eventYear: 1889, eventKind: 'custody' }))).toBe('touches');
    expect(registerOrder(dateRegisterGap({ first: 1902, last: 1902, eventYear: 1885, eventKind: 'source' }))).toBe('earlier');
    expect(codexRail('strip')).toEqual({ spans: [356], clears: false });
    expect(codexRail('pieces')).toEqual({ spans: [182.5, 174.3], clears: true });
    expect(khipuRack('wide')).toEqual({ width: 77, height: 39, clears: false });
    expect(khipuRack('tall')).toEqual({ width: 39, height: 77, clears: true });
  });

  it('hides the room before chart revision and the Civic stand until a cover is signed', () => {
    const d = new Driver();
    d.s.mapId = 'sea.date-room';
    expect(prop(d, 'sea-date-register-door')).toBeUndefined();
    d.s.objectivesDone.push('sea.finish');
    move(d, 'sea-date-register-door');
    expect(d.s.mapId).toBe('sea.register-room');
    d.s.mapId = 'civic.dispatch';
    d.s.objectivesDone.push('civic.arrival');
    expect(prop(d, 'date-register-civic')).toBeUndefined();
  });

  it('provides artwork for every register-room floor tile', () => {
    const room = MAPS['sea.register-room'];
    const art = new Set<string>();
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const tile = room.floor(x, y);
        if (tile) art.add(tile);
      }
    }
    for (const key of art) expect(STAMPS[key], key).toBeDefined();
  });

  it('keeps matching receipts on representative itineraries and includes every case in the full collection visit', () => {
    const pack = buildPack();
    const stops = (visit: number | 'all') => playPath(pack, 'explorer', visit).filter(({ id }) => id.startsWith('date-register.'));
    for (const visit of [0, DATE_REGISTER_CASES.length - 1]) {
      const c = DATE_REGISTER_CASES[visit];
      expect(stops(visit).map(({ id, chapter }) => [id, chapter])).toEqual([[c.objective, 8], [c.civicObjective, 12]]);
    }
    expect(stops('all')).toHaveLength(2 * DATE_REGISTER_CASES.length);
  });

  it.each([
    { key: DRESDEN_CODEX_KEY, prop: DRESDEN_RETURN.prop, picks: ['Lay the extended-strip', 'Set each 1835', 'Leave the two-frame'],
      result: 'two-frames', visible: '182.5 and 174.3' },
    { key: BROOKLYN_KHIPU_KEY, prop: BROOKLYN_RETURN.prop, picks: ['Place the object number', 'Give the readers four lookup'],
      result: 'linked', visible: '70.177.69' },
  ])('revises a different earlier-room notice when carrying $key', ({ key, prop: slot, picks, result, visible }) => {
    const d = new Driver();
    const record = DATE_REGISTER_CASES.find((entry) => entry.key === key)!;
    d.s.mapId = 'copies.archive';
    d.s.objectivesDone.push(record.objective);
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
    expect(prop(d, slot)).toBeUndefined();
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(key) });
    d.walk(prop(d, slot)!.node!, picks);
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(prop(d, `${slot}-${result}`)?.text).toContain(visible);
  });

  it.each(DATE_REGISTER_CASES)('uses $accession on each physical route including the Civic continuation', (record) => {
    for (const [route, alternative, pack, use] of [['porch', 'runner', 3, 0], ['runner', 'porch', 4, 1]] as const) {
      const d = new Driver();
      const choose = (node: string, index: number) => d.run({ type: 'ChooseDialogueOption', node, index });
      d.s.objectivesDone.push('sea.finish');
      d.s.mapId = 'sea.date-room';
      move(d, 'sea-date-register-door');
      expect(prop(d, `register-exhibit-${record.slug}`)?.exhibit).toBe(record.exhibit);
      const stand = prop(d, `date-register-${record.slug}`)!;
      expect(dateRegisterEntries(stand.game!)).toEqual([record.nodes.work]);
      expect(() => choose(record.nodes.work, 0)).toThrow(/not available/);
      d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
      expect(d.s.cards).toContain(record.card);
      choose(record.nodes.work, 0);
      expect(() => choose(record.nodes.work, 2)).toThrow(/not available/);
      choose(record.nodes.work, 1);
      if (measured.has(record.key)) {
        expect(() => choose(record.nodes.work, 2)).toThrow(/not available/);
        choose(record.nodes.work, 5);
        expect(() => choose(record.nodes.work, 2)).toThrow(/not available/);
        choose(record.nodes.work, 6);
      }
      choose(record.nodes.work, 2);
      expect(() => choose(record.nodes.civic, use)).toThrow(/not available/);
      expect(rangeCaption(record).length).toBeGreaterThan(40);
      choose(record.nodes.work, pack);
      expect(d.s.inventory[record.item]).toBe(1);
      expect(() => choose(record.nodes.work, pack)).toThrow(/not available/);
      move(d, 'date-register-return');
      move(d, 'sea-date-annex-return');
      move(d, 'sea-chartroom-return');
      expect(prop(d, `date-register-${route}`)?.game).toBe(`date-register:${route}`);
      expect(() => choose(record.nodes[alternative], 0)).toThrow(/not available/);
      choose(record.nodes[route], 0);
      expect(d.done(record.objective)).toBe(true);
      expect(d.s.inventory[record.item]).toBe(1);
      expect(d.s.journal).toContain(`j.${record.objective}`);
      move(d, 'sea-nexus-return');
      d.s.objectivesDone.push('water.finish');
      move(d, 'civic-door');
      expect(d.done('civic.arrival')).toBe(true);
      expect(prop(d, 'date-register-civic')).toBeDefined();
      expect(() => choose(record.nodes.civic, 1 - use)).toThrow(/not available/);
      choose(record.nodes.civic, use);
      expect(d.done(record.civicObjective)).toBe(true);
      expect(d.s.flags[`${record.flag}.copy`]).toBe(route === 'porch' ? 'object' : 'event');
      expect(d.s.journal).toContain(`j.${record.civicObjective}`);
      expect(d.s.inventory[record.item]).toBe(1);
    }
  });
});
