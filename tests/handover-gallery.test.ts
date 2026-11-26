import { describe, expect, it } from 'vitest';
import { handoverKey, HANDOVER_BUNDLES, HANDOVER_CASES, HANDOVER_FLAG, HANDOVER_PLACES, lastHandover, nextHandover } from '../src/domain/handoverGallery';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { STAMPS } from '../src/scenes/art';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const coda = MAPS['nexus.next-bench'];
const gallery = MAPS['nexus.handover'];
const entry = coda.interactables.find(({ id }) => id === 'next-bench-gallery')!;

function openGallery(d: Driver, edition: 'public' | 'loan') {
  expect(check(entry.visibleIf, d.s)).toBe(false);
  d.run({ type: 'SetFlag', flag: 'ending.council', value: 'both' });
  d.walk('postgame.open', ['Take the pen']);
  d.s.mapId = coda.id;
  d.talk('lia-vann');
  d.walk('postgame.copy');
  d.walk('postgame.place', [edition === 'public' ? 'Set both records' : 'Lend Lia the pen']);
  d.walk(`postgame.read.${edition}`);
  expect(check(entry.visibleIf, d.s)).toBe(false);
  d.s.mapId = 'nexus.archive';
  d.walk(`postgame.back.${edition}`);
  expect(d.done('postgame.complete')).toBe(true);
  expect(check(entry.visibleIf, d.s)).toBe(true);
  expect(entry.to?.map).toBe(gallery.id);
  d.s.mapId = gallery.id;
  d.run({ type: 'SetFlag', flag: entry.flag!, value: true });
}

describe('Room for the Next Check', () => {
  it('rotates three different bundles using the last actual handover', () => {
    expect(nextHandover(undefined)).toBe('origin');
    expect(nextHandover('old-save-value')).toBe('origin');
    expect(lastHandover(false)).toBeNull();
    for (const place of HANDOVER_PLACES) {
      expect(nextHandover(handoverKey('origin', place))).toBe('condition');
      expect(nextHandover(handoverKey('condition', place))).toBe('precision');
      expect(nextHandover(handoverKey('precision', place))).toBe('origin');
    }
    expect(HANDOVER_BUNDLES.origin.pieces[0].text).toContain('same West Window entry');
    expect(HANDOVER_BUNDLES.condition.pieces[1].text).toContain('still leaves a damp corner');
    expect(HANDOVER_BUNDLES.precision.pieces[0].text).toContain('6.8 to 7.2');
  });

  it.each(['public', 'loan'] as const)('leaves the %s coda intact through six gallery choices', (edition) => {
    const d = new Driver();
    openGallery(d, edition);
    const credits = { ...d.p.credit };
    const marks = d.s.marks;
    const displays = () => gallery.interactables.filter((prop) => prop.id.startsWith('handover-') && prop.visibleIf && check(prop.visibleIf, d.s));
    expect(displays()).toEqual([]);
    for (const place of HANDOVER_PLACES) {
      for (const card of HANDOVER_CASES) {
        expect(nextHandover(d.s.flags[HANDOVER_FLAG])).toBe(card);
        d.run({ type: 'SetFlag', flag: HANDOVER_FLAG, value: handoverKey(card, place) });
        expect(displays().map((prop) => prop.id)).toEqual([`handover-${card}-${place}`]);
      }
    }
    expect(d.s.flags['ending.council']).toBe('both');
    expect(d.s.flags['postgame.edition']).toBe(edition);
    expect(d.p.credit).toEqual(credits);
    expect(d.s.marks).toBe(marks);
    expect(d.s.journal.filter((entry) => entry === 'j.handover.first')).toEqual(['j.handover.first']);
    expect(nextHandover(d.s.flags[HANDOVER_FLAG])).toBe('origin');
    expect(gallery.interactables.find(({ id }) => id === 'handover-return')?.to?.map).toBe(coda.id);
  });

  it('places every room prop by a walkable tile, with clear door arrivals', () => {
    const clear = (map: typeof gallery, x: number, y: number) => {
      const inside = (part: number[]) => {
        const [left, top, w, h] = part;
        return x >= left && x < left + w && y >= top && y < top + h;
      };
      return !!map.floor(x, y) && !map.blocks.some(inside) && !map.stamps.some((position) => {
        const stamp = STAMPS[position.stamp].collide;
        return stamp && inside([position.x + stamp[0], position.y + stamp[1], stamp[2], stamp[3]]);
      }) && !map.interactables.some((it) => !it.walkThrough && inside([it.x, it.y, it.w, it.h]))
        && !map.npcs.some((npc) => npc.x === x && npc.y === y);
    };
    const next = entry.to!;
    expect(clear(gallery, next.x, next.y)).toBe(true);
    const art = new Set(artKeys());
    const reachable = new Set<string>([`${next.x},${next.y}`]);
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const queue = [[next.x, next.y]];
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const [dx, dy] of directions) {
        const point = `${x + dx},${y + dy}`;
        if (reachable.has(point) || !clear(gallery, x + dx, y + dy)) continue;
        reachable.add(point);
        queue.push([x + dx, y + dy]);
      }
    }
    for (const prop of gallery.interactables) {
      expect(directions.some(([dx, dy]) => reachable.has(`${prop.x + dx},${prop.y + dy}`)), prop.id).toBe(true);
      if (prop.art) expect(art.has(prop.art), prop.id).toBe(true);
      if (prop.to) expect(clear(MAPS[prop.to.map], prop.to.x, prop.to.y), prop.id).toBe(true);
    }
  });
});
