import { describe, expect, it } from 'vitest';
import {
  FERRY_WINDOW_CASES, WINDOW_LAST_RETURN, WINDOW_METHODS, shutterOpen,
} from '../src/content/ferryWindow';
import { check } from '../src/domain/rules';
import { ownsSpecimen, SPECIMEN_BASE, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { FERRY_WINDOW, FERRY_WINDOW_DOOR } from '../src/maps/ferryWindow';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function prop(map: MapDef, id: string) {
  const found = map.interactables.find((it) => it.id === id);
  expect(found, id).toBeDefined();
  return found!;
}

function walkable(map: MapDef, driver: Driver, x: number, y: number): boolean {
  const inside = ([left, top, w, h]: readonly [number, number, number, number]) => x >= left && x < left + w && y >= top && y < top + h;
  return !!map.floor(x, y) && !map.blocks.some(inside) && !map.stamps.some((stamp) => {
    const box = STAMPS[stamp.stamp].collide;
    return box && inside([stamp.x + box[0], stamp.y + box[1], box[2], box[3]]);
  }) && !map.conditionalBlocks?.some((tile) => tile.x === x && tile.y === y && check(tile.when, driver.s))
    && !map.npcs.some((npc) => npc.x === x && npc.y === y && check(npc.visibleIf, driver.s))
    && !map.interactables.some((it) => !it.walkThrough && inside([it.x, it.y, it.w, it.h]));
}

const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function hasApproach(map: MapDef, driver: Driver, x: number, y: number) {
  return offsets.some(([dx, dy]) => walkable(map, driver, x + dx, y + dy));
}

describe('The View from the Rope', () => {
  it('places every dated photo once, with its specific credited maker and earlier repeat method', () => {
    const d = new Driver();
    const ember = MAPS['aethelgard.emberford'];
    const ferry = MAPS['aethelgard.ferry'];
    expect(prop(MAPS[FERRY_WINDOW.id], 'ferry-window-exit').to).toEqual(prop(FERRY_WINDOW, 'ferry-window-exit').to);
    expect(ferry.interactables).toContain(FERRY_WINDOW_DOOR);
    expect(check(FERRY_WINDOW_DOOR.visibleIf, d.s)).toBe(false);
    d.s.flags['clue.oldmap.folded-map'] = true;
    expect(check(FERRY_WINDOW_DOOR.visibleIf, d.s)).toBe(true);
    const exit = prop(FERRY_WINDOW, 'ferry-window-exit').to!;
    expect(walkable(ferry, d, exit.x, exit.y)).toBe(true);
    expect(hasApproach(ferry, d, FERRY_WINDOW_DOOR.x, FERRY_WINDOW_DOOR.y)).toBe(true);
    expect(hasApproach(ember, d, 35, 20)).toBe(true);
    expect(FERRY_WINDOW_CASES).toHaveLength(43);
    expect(new Set(FERRY_WINDOW_CASES.map(({ key }) => key)).size).toBe(43);
    expect(new Set(FERRY_WINDOW_CASES.map(({ revisit }) => revisit.method)).size).toBe(43);
    const art = new Set(artKeys());
    for (const item of FERRY_WINDOW.interactables) {
      expect(hasApproach(FERRY_WINDOW, d, item.x, item.y), item.id).toBe(true);
      expect(art.has(item.art!), item.id).toBe(true);
    }

    for (const entry of FERRY_WINDOW_CASES) {
      const places = Object.values(MAPS).flatMap((map) => map.interactables
        .filter((item) => item.exhibit === entry.exhibit).map(() => map.id));
      expect(places, entry.accession).toEqual([FERRY_WINDOW.id]);
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit).toMatchObject({
        dateText: entry.date, historicalLabel: 'documented',
        specimen: { key: entry.key, accession: entry.accession, source: entry.source,
          objective: entry.objective, pixelAsset: entry.asset, revisit: entry.revisit },
      });
      expect(exhibit?.specimen?.people?.[0]?.source).toBe(entry.source);
      expect(check(prop(ember, entry.revisit.prop).visibleIf, d.s)).toBe(false);
    }
    expect(FERRY_WINDOW_CASES.find(({ slug }) => slug === 'mount-agde-composite')?.medium).toContain('two glass negatives');
    expect(FERRY_WINDOW_CASES.find(({ slug }) => slug === 'yosemite-falls')?.date).toMatch(/printed ca\. 1875/);
  });

  it.each(WINDOW_METHODS)('runs %s, retains the use, and takes every working copy to Emberford', (method) => {
    const d = new Driver();
    const ember = MAPS['aethelgard.emberford'];
    const eye = prop(FERRY_WINDOW, 'ferry-window-eye');
    const hinge = prop(FERRY_WINDOW, 'ferry-window-hinge');
    const opened = prop(FERRY_WINDOW, 'ferry-window-open');
    const ledge = prop(FERRY_WINDOW, 'ferry-window-edge');
    const handover = prop(FERRY_WINDOW, 'ferry-window-handover');
    const through = method === 'hinge';
    d.s.flags['clue.oldmap.folded-map'] = true;

    for (const entry of FERRY_WINDOW_CASES) {
      d.s.mapId = FERRY_WINDOW.id;
      d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
      const take = prop(FERRY_WINDOW, `ferry-window-${entry.slug}-take`);
      expect(check(take.visibleIf, d.s)).toBe(true);
      d.walk(take.node!, ['Clip this working sheet']);
      expect(check(eye.visibleIf, d.s)).toBe(true);
      expect(check(ledge.visibleIf, d.s)).toBe(false);
      expect(check(hinge.visibleIf, d.s)).toBe(false);
      expect(walkable(FERRY_WINDOW, d, 22, 24)).toBe(false);
      expect(d.done(entry.objective)).toBe(false);
      d.walk(eye.node!, [entry.anchor]);
      expect(check(ledge.visibleIf, d.s)).toBe(true);
      expect(check(hinge.visibleIf, d.s)).toBe(true);
      expect(check(opened.visibleIf, d.s)).toBe(false);
      expect(check(handover.visibleIf, d.s)).toBe(false);
      if (through) {
        d.walk(hinge.node!, [entry.anchor]);
        expect(check(opened.visibleIf, d.s)).toBe(true);
        expect(check(ledge.visibleIf, d.s)).toBe(false);
        expect(walkable(FERRY_WINDOW, d, 22, 24)).toBe(true);
        d.walk(opened.node!, [entry.anchor]);
      } else d.walk(ledge.node!, [entry.anchor]);
      expect(d.done(entry.objective)).toBe(false);
      expect(check(handover.visibleIf, d.s)).toBe(true);
      d.walk(handover.node!, [entry.anchor]);
      expect(d.done(entry.objective)).toBe(true);
      expect(check(shutterOpen, d.s)).toBe(through);
      expect(check(prop(FERRY_WINDOW, `ferry-window-${entry.slug}-${method}-readback`).visibleIf, d.s)).toBe(true);
      expect(check(prop(FERRY_WINDOW, `ferry-window-${method}-mounted`).visibleIf, d.s)).toBe(true);
      expect(d.s.journal).toContain(`j.${entry.flag}.${method}`);

      d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit });
      expect(ownsSpecimen(d.s, entry.key)).toBe(true);
      d.s.mapId = ember.id;
      const action = prop(ember, entry.revisit.prop);
      expect(check(action.visibleIf, d.s)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(entry.key) });
      expect(check(action.visibleIf, d.s)).toBe(true);
      d.walk(action.node!, [entry.revisit.method]);
      expect(d.s.flags[WINDOW_LAST_RETURN]).toBe(entry.slug);
      expect(d.s.journal).toContain(`j.${entry.flag}.ember`);
      expect(check(action.visibleIf, d.s)).toBe(false);
      expect(check(prop(ember, `${entry.revisit.prop}-readback`).visibleIf, d.s)).toBe(true);
      d.s.mapId = SPECIMEN_BASE;
      d.run({ type: 'CarrySpecimen', key: entry.key, carry: false });
    }
    expect(d.done('m02.o5.showdown')).toBe(false);
  }, 20_000); // One persistent campaign completes and returns all 43 exhibits in this itinerary.

  it('sets an unfinished work back on the hook and restores the last installed screen', () => {
    const d = new Driver();
    const [first, second] = FERRY_WINDOW_CASES;
    d.s.flags['clue.oldmap.folded-map'] = true;
    d.s.mapId = FERRY_WINDOW.id;
    for (const entry of [first, second]) d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
    d.walk(`${first.flag}.take`, ['Clip this']);
    for (const place of ['eye', 'hinge', 'open', 'handover']) d.walk(`ferry-window.stop.${place}`, [first.anchor]);
    d.walk(`${second.flag}.take`, ['Clip this']);
    expect(check(shutterOpen, d.s)).toBe(false);
    d.walk(`${second.flag}.pause`, ['Hang it back']);
    expect(check(shutterOpen, d.s)).toBe(true);
    expect(d.done(second.objective)).toBe(false);
    expect(d.done(first.objective)).toBe(true);
  });
});
