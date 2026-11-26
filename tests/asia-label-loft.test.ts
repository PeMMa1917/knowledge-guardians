import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { LABEL_LOFT_CASES } from '../src/content/asiaLabelCases';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { ASIA_LABEL_LOFT } from '../src/maps/asiaLabelLoft';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
}

function cross(d: Driver, id: string) {
  const door = prop(d, id);
  if (!door?.to || !check(door.openIf, d.s)) throw new Error(`Cannot cross ${id}`);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function use(d: Driver, id: string, action: string) {
  const stand = prop(d, id);
  if (!stand?.node) throw new Error(`Cannot use ${id} in ${d.s.mapId}`);
  d.walk(stand.node, [action]);
}

function start() {
  const d = new Driver();
  d.s.mapId = 'island.workshop';
  cross(d, 'island-margin-path');
  expect(prop(d, 'label-loft-door')).toBeUndefined();
  d.s.objectivesDone.push('island.finish');
  cross(d, 'label-loft-door');
  return d;
}

function study(d: Driver, record: (typeof LABEL_LOFT_CASES)[number]) {
  const front = `loft-front-${record.slug}`;
  const reverse = `loft-reverse-${record.slug}`;
  expect(prop(d, front)).toBeUndefined();
  expect(prop(d, reverse)).toBeUndefined();
  expect(prop(d, `loft-case-${record.slug}`)?.exhibit).toBe(record.exhibit);
  d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
  expect(d.s.cards).toContain(record.card);
  expect(prop(d, front)?.art).toBe('preserved.slip');
  expect(prop(d, reverse)).toBeUndefined();
  use(d, front, record.front);
  expect(d.done(record.objective)).toBe(false);
  const turned = prop(d, reverse);
  expect(turned?.x).toBe(prop(d, front)!.x + 1);
  expect(turned?.art).toBe('fold.strip');
  use(d, reverse, record.reverse);
  expect(d.done(record.objective)).toBe(true);
  expect(check(turned?.artOpen?.if, d.s)).toBe(true);
}

function reached(d: Driver, x: number, y: number): boolean {
  const { spawn, floor, blocks, conditionalBlocks } = ASIA_LABEL_LOFT;
  const queue = [spawn];
  const seen = new Set<string>();
  for (const tile of queue) {
    const id = `${tile.x},${tile.y}`;
    if (seen.has(id)) continue;
    seen.add(id);
    if (!floor(tile.x, tile.y)
      || blocks.some(([left, top, w, h]) => tile.x >= left && tile.x < left + w && tile.y >= top && tile.y < top + h)
      || conditionalBlocks?.some((gate) => gate.x === tile.x && gate.y === tile.y && check(gate.when, d.s))) continue;
    if (tile.x === x && tile.y === y) return true;
    queue.push({ x: tile.x - 1, y: tile.y }, { x: tile.x + 1, y: tile.y },
      { x: tile.x, y: tile.y - 1 }, { x: tile.x, y: tile.y + 1 });
  }
  return false;
}

describe('A Slip for Both Berths', () => {
  it('gives every exact specimen a unique physical display and two scoped evidence actions', () => {
    const d = start();
    const pack = buildPack();
    for (const record of LABEL_LOFT_CASES) {
      const exhibit = pack.exhibits.find((e) => e.id === record.exhibit);
      expect(exhibit).toMatchObject({
        historicalLabel: 'documented',
        dateText: record.date,
        specimen: { accession: record.accession, source: record.source, objective: record.objective, pixelAsset: record.image },
      });
      expect(exhibit?.dateKind).toBe(record.datedAs);
      expect(pack.sources.find((source) => source.id === record.source)?.url).toBe(record.catalogue);
      const display = Object.values(MAPS).flatMap((map) => map.interactables).filter((item) => item.exhibit === exhibit?.id);
      expect(display).toHaveLength(1);
      const reverseNode = pack.dialogue.find((node) => node.id === `${record.stem}.reverse`);
      expect(reverseNode?.text).toBe(record.limit);
      study(d, record);
    }
    expect(d.done('asia.loft.compare')).toBe(false);
    use(d, 'loft-copy', 'Fit a per-circuit tab');
    expect(d.done('asia.loft.compare')).toBe(true);
    expect(prop(d, 'loft-copy-mark-measure')?.text).toContain('one circuit each');
    expect(d.done('asia.loft.outcome')).toBe(false);
  });

  it('uses distinct methods, then changes the open physical lane and public notice on replay', () => {
    const d = start();
    expect(d.e.visibleOptions('asia.loft.dispatch', d.s).map(({ option }) => option.text)).toEqual([
      'Leave the hooks empty. I have a copy to prepare at the board.',
    ]);

    const caseOf = (slug: string) => LABEL_LOFT_CASES.find((record) => record.slug === slug)!;
    study(d, caseOf('dragon-ewer'));
    study(d, caseOf('bagobo-basket'));
    expect(d.done('asia.loft.compare')).toBe(false);
    expect(d.e.visibleOptions('asia.loft.copy', d.s)).toHaveLength(1);
    expect(reached(d, 4, 17)).toBe(false);
    expect(reached(d, 24, 17)).toBe(false);
    study(d, caseOf('ofuke-bowl'));
    const options = d.e.visibleOptions('asia.loft.copy', d.s).map(({ option }) => option.text);
    expect(options).toEqual([
      'Clip each figure to its own drawing of the tested berth.',
      'Move each place tag down from the common heading to its own row.',
      'Keep the current draft.',
    ]);
    use(d, 'loft-copy', 'Move each place tag down');
    expect(prop(d, 'loft-copy-mark-attribution')?.text).toContain('name of the berth');
    expect(d.done('asia.loft.compare')).toBe(true);

    const before = { ...d.p.credit };
    for (const route of ['rail', 'bench'] as const) {
      const other = route === 'rail' ? 'bench' : 'rail';
      if (route === 'bench') use(d, 'loft-copy', 'Clip each figure to its own drawing');
      use(d, 'loft-dispatch', route === 'rail' ? 'Hang two berth rows' : 'Put the two trial sheets');
      expect(reached(d, 4, 17)).toBe(route === 'rail');
      expect(reached(d, 24, 17)).toBe(route === 'bench');
      expect(prop(d, `loft-${other}-copy`)).toBeUndefined();
      const current = prop(d, `loft-${route}-copy`);
      expect(current).toBeDefined();
      use(d, `loft-${route}-copy`, route === 'rail' ? 'Take a copy' : 'Carry a pointer');
      cross(d, 'label-loft-return');
      expect(prop(d, `loft-margin-posted-${other}`)).toBeUndefined();
      expect(prop(d, `loft-margin-posted-${route}`)).toBeUndefined();
      use(d, `loft-margin-${route}`, route === 'rail' ? 'Clip the two trial rows' : 'Clip the bench pointer');
      expect(d.done('asia.loft.outcome')).toBe(true);
      expect(prop(d, `loft-margin-${route}`)).toBeUndefined();
      expect(prop(d, `loft-margin-posted-${route}`)?.text).toContain(route === 'rail' ? 'four crates' : 'work desk');
      expect(d.s.journal).toContain(`j.asia.loft.${route}`);
      cross(d, 'label-loft-door');
    }
    expect(d.p.credit).toEqual(before);
  });
});
