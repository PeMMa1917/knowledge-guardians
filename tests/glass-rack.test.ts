import { describe, expect, it } from 'vitest';
import { GLASS_RACK_CASES, glassRackEntries } from '../src/content/glassRack';
import { check } from '../src/domain/rules';
import { specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function target(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

describe('The Missing Face', () => {
  it('opens one unoccupied door after the first display and returns to a free tile', () => {
    const d = new Driver();
    d.s.mapId = 'preserved.archive';
    expect(target(d, 'cold-glass-rack-door')).toBeUndefined();
    d.s.objectivesDone.push('preserved.publish');
    const door = target(d, 'cold-glass-rack-door');
    expect(door?.to?.map).toBe('preserved.glass-rack');
    const room = MAPS[d.s.mapId];
    expect(room.interactables.filter(({ x, y }) => x === door?.x && y === door?.y).map(({ id }) => id))
      .toEqual(['cold-glass-rack-door']);
    const exit = MAPS['preserved.glass-rack'].interactables.find(({ id }) => id === 'glass-rack-return')!;
    expect(exit.to?.map).toBe('preserved.archive');
    expect(room.interactables.filter(({ x, y }) => x === exit.to?.x && y === exit.to?.y)).toEqual([]);
    expect(new Set(GLASS_RACK_CASES.map(({ key }) => key)).size).toBe(40);
    expect(new Set(GLASS_RACK_CASES.flatMap(({ wholeAsset, otherAsset }) => [wholeAsset, otherAsset])).size).toBe(80);
  });

  it.each(GLASS_RACK_CASES)('earns and equips $accession through either reading space, and mounts the chosen return view', (object) => {
    for (const [mount, slot, cabinet] of [['rail', 3, 'board'], ['pocket', 4, 'desk']] as const) {
      const d = new Driver();
      const choose = (node: string, index: number) => d.run({ type: 'ChooseDialogueOption', node, index });
      d.s.mapId = 'preserved.glass-rack';
      d.s.objectivesDone.push('preserved.publish');
      expect(target(d, `glass-case-${object.slug}`)?.exhibit).toBe(object.exhibit);
      expect(glassRackEntries(target(d, `glass-frame-${object.slug}`)!.game!)).toEqual([object.nodes.work]);
      expect(() => choose(object.nodes.work, 0)).toThrow(/not available/);
      d.run({ type: 'InspectExhibit', exhibit: object.exhibit });
      choose(object.nodes.work, 0);
      expect(() => choose(object.nodes.work, slot)).toThrow(/not available/);
      choose(object.nodes.work, 1);
      expect(() => choose(object.nodes.work, slot)).toThrow(/not available/);
      choose(object.nodes.work, 2);
      choose(object.nodes.work, slot);
      expect(() => d.run({ type: 'ClaimSpecimen', exhibit: object.exhibit })).toThrow(/Finish the object/);
      if (mount === 'pocket') {
        expect(() => choose(object.nodes.pocket, 1)).toThrow(/not available/);
        choose(object.nodes.pocket, 0);
        choose(object.nodes.pocket, 1);
      } else choose(object.nodes.rail, 0);
      expect(d.done(object.earned)).toBe(true);
      d.run({ type: 'ClaimSpecimen', exhibit: object.exhibit });
      expect(d.s.inventory[specimenItemId(object.key)]).toBe(1);

      d.s.mapId = 'nile.route';
      expect(target(d, object.revisit.prop)).toBeUndefined();
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(object.key) });
      expect(glassRackEntries(target(d, object.revisit.prop)!.game!)).toContain(object.nodes.revisit);
      choose(object.nodes.revisit, 0);
      expect(() => choose(object.nodes.revisit, 2)).toThrow(/not available/);
      choose(object.nodes.revisit, 1);
      choose(object.nodes.revisit, cabinet === 'board' ? 2 : 3);
      expect(d.done(object.returned)).toBe(true);
      expect(d.s.flags[`${object.flag}.nile`]).toBe(cabinet);
      expect(target(d, 'nile-glass-reader-board')).toBeDefined();
      expect(!!target(d, 'nile-glass-reading-desk')).toBe(cabinet === 'desk');
    }
  });

  it('gives the three return stations and both view readbacks their own reachable tiles', () => {
    const room = MAPS['nile.route'];
    for (const prop of room.interactables.filter(({ id }) => id.startsWith('nile-glass-'))) {
      expect(room.interactables.filter(({ x, y }) => x === prop.x && y === prop.y).map(({ id }) => id)).toEqual([prop.id]);
      expect(room.floor(prop.x + 1, prop.y)).toBe('stone-c');
      expect(room.interactables.filter(({ x, y }) => x === prop.x + 1 && y === prop.y)).toEqual([]);
    }
  });
});
