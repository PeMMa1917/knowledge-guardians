import { describe, expect, it } from 'vitest';
import { BEND_CARD, BEND_MAPS, SITE_TRIALS, bendLayout, bendRecord, stripReading } from '../src/domain/stripBend';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { STAMPS } from '../src/scenes/art';
import { Driver } from './driver';

function visible(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((entry) => entry.id === id && check(entry.visibleIf, d.s));
}

function readReceipt(d: Driver, id: string) {
  const prop = visible(d, id);
  expect(prop?.kind).toBe('sign');
  expect(prop?.flag).toBeDefined();
  d.run({ type: 'SetFlag', flag: prop!.flag!, value: true });
  return prop!.text;
}

describe('The Bend That Stayed', () => {
  it('keeps load deflection and remaining bend separate, including the worn starting line', () => {
    expect(SITE_TRIALS.nile.map(stripReading)).toEqual([
      { start: 0, loaded: 2, released: 0 },
      { start: 0, loaded: 6, released: 0 },
      { start: 0, loaded: 1, released: 0 },
      { start: 0, loaded: 3, released: 2 },
    ]);
    expect(SITE_TRIALS.landing.map(stripReading)).toEqual([
      { start: 2, loaded: 3, released: 2 },
      { start: 0, loaded: 1, released: 0 },
      { start: 0, loaded: 6, released: 0 },
    ]);
  });

  it('keeps each practice station and result at its own walkable target', () => {
    const inBox = (tx: number, ty: number, x: number, y: number, w: number, h: number) =>
      tx >= x && tx < x + w && ty >= y && ty < y + h;
    for (const id of Object.values(BEND_MAPS)) {
      const map = MAPS[id];
      const entries = map.interactables.filter((item) => /^(nile|copies)-bend-/.test(item.id));
      expect(entries).toHaveLength(3);
      for (const { id: prop, x, y } of entries) {
        expect(map.floor(x, y), prop).not.toBeNull();
        expect(map.interactables.filter((item) => inBox(x, y, item.x, item.y, item.w, item.h)).map((item) => item.id), prop).toEqual([prop]);
        // WorldScene lets the painted top of an interaction extend one tile upward.
        const hitBox = (tx: number, ty: number) => map.interactables.filter((item) =>
          tx >= item.x && tx < item.x + item.w && ty >= item.y - 1 && ty < item.y + item.h);
        expect(hitBox(x + .5, y + .5).map((item) => item.id), prop).toEqual([prop]);
        expect(hitBox(x + .5, y - .5).map((item) => item.id), prop).toEqual([prop]);
        expect(map.npcs.some((npc) => npc.x === x && npc.y === y), prop).toBe(false);
        expect(map.blocks.some(([sx, sy, w, h]) => inBox(x, y, sx, sy, w, h)), prop).toBe(false);
        for (const stamp of map.stamps) {
          const bounds = STAMPS[stamp.stamp].collide;
          if (bounds) expect(inBox(x, y, stamp.x + bounds[0], stamp.y + bounds[1], bounds[2], bounds[3]), prop).toBe(false);
        }
      }
    }
  });

  it.each([
    { early: 'reading', earlyOther: 'return', final: 'long', finalOther: 'short', harm: 'waiting reader takes a seat' },
    { early: 'return', earlyOther: 'reading', final: 'short', finalOther: 'long', harm: 'brings the wide bundle over' },
  ] as const)('transfers $early and allows a different $final setup with a distinct receipt', ({ early, earlyOther, final, finalOther, harm }) => {
    const d = new Driver();
    d.s.mapId = BEND_MAPS.nile;
    expect(visible(d, 'nile-bend-board')).toBeUndefined();
    expect(() => d.run({ type: 'RecordBendTrial', trial: 'spring-near' })).toThrow(/Mine Map/);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    expect(visible(d, 'nile-bend-board')).toBeDefined();
    expect(() => d.run({ type: 'FileBendPlan', plan: early })).toThrow(/load and lift/);
    expect(() => d.run({ type: 'RecordBendTrial', trial: 'worn' })).toThrow(/other board/);
    SITE_TRIALS.nile.forEach((trial) => d.run({ type: 'RecordBendTrial', trial }));
    expect(d.done('bend.nile.compare')).toBe(true);
    expect(d.done('nile.routes')).toBe(false);
    expect(() => d.run({ type: 'FileBendPlan', plan: final })).toThrow(/for this room/);
    d.run({ type: 'FileBendPlan', plan: early });
    expect(d.s.inventory[BEND_CARD]).toBe(1);
    expect(d.done('bend.nile.issue')).toBe(false);
    expect(visible(d, `nile-bend-${earlyOther}`)).toBeUndefined();
    expect(readReceipt(d, `nile-bend-${early}`)).toContain('Landing crew');
    expect(d.done('bend.nile.issue')).toBe(true);
    expect(() => d.run({ type: 'FileBendPlan', plan: earlyOther })).toThrow(/already/);

    // A new visit and JSON round-trip preserve the issued card and selected view.
    d.s = JSON.parse(JSON.stringify(d.s));
    d.s.mapId = BEND_MAPS.landing;
    expect(visible(d, 'copies-bend-board')).toBeDefined();
    expect(d.s.flags[bendLayout('nile')]).toBe(early);
    expect(() => d.run({ type: 'RecordBendTrial', trial: final })).toThrow(/used strip/);
    expect(d.s.flags[bendRecord(final)]).toBeUndefined();
    SITE_TRIALS.landing.forEach((trial) => d.run({ type: 'RecordBendTrial', trial }));
    expect(d.done('bend.landing.compare')).toBe(true);
    d.run({ type: 'FileBendPlan', plan: final });
    expect(visible(d, `copies-bend-${finalOther}`)).toBeUndefined();
    expect(readReceipt(d, `copies-bend-${final}`)).toContain(harm);
    expect(d.done('bend.landing.finish')).toBe(true);
    expect(() => d.run({ type: 'FileBendPlan', plan: finalOther })).toThrow(/already/);
    expect(d.s.inventory[BEND_CARD]).toBe(1);
  });

  it('keeps the earlier City gate and new board separate on an old save', () => {
    const d = new Driver();
    d.s.mapId = 'nexus.archive';
    expect(visible(d, 'copies-door')).toBeUndefined();
    d.s.objectivesDone.push('metal.finish');
    expect(visible(d, 'copies-door')).toBeDefined();
    d.s.mapId = BEND_MAPS.landing;
    expect(visible(d, 'copies-bend-board')).toBeUndefined();
    expect(() => d.run({ type: 'RecordBendTrial', trial: 'worn' })).toThrow(/bring Marek’s trial card/);
  });
});
