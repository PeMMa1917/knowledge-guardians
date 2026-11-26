import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { artKeys, BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const maps = Object.values(MAPS).filter((map) => ['WORLD-04', 'WORLD-05', 'WORLD-06', 'WORLD-07', 'WORLD-08', 'WORLD-09', 'WORLD-10', 'WORLD-11', 'WORLD-12', 'WORLD-13', 'WORLD-14', 'WORLD-15', 'WORLD-16'].includes(map.world));
const art = new Set(artKeys());

/** The same walkable tiles as the world scene, including furniture and actors. */
function walkable(map: MapDef) {
  const blocked = new Set<string>();
  const block = (x: number, y: number, w: number, h: number) => {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) blocked.add(`${i},${j}`);
    }
  };

  for (const [x, y, w, h] of map.blocks) block(x, y, w, h);
  for (const stamp of map.stamps) {
    const collision = STAMPS[stamp.stamp].collide;
    if (collision) block(stamp.x + collision[0], stamp.y + collision[1], collision[2], collision[3]);
  }
  for (const npc of map.npcs) block(npc.x, npc.y, 1, 1);
  for (const prop of map.interactables) {
    if (!prop.walkThrough) block(prop.x, prop.y, prop.w, prop.h);
  }

  return (x: number, y: number) => map.floor(x, y) !== null && !blocked.has(`${x},${y}`);
}

it('keeps always available interactions from sharing an identical physical target', () => {
  const conflicts: string[] = [];
  for (const map of Object.values(MAPS)) {
    const targets = new Map<string, typeof map.interactables>();
    for (const prop of map.interactables) {
      const place = `${prop.x},${prop.y},${prop.w},${prop.h}`;
      const samePlace = targets.get(place) ?? [];
      samePlace.push(prop);
      targets.set(place, samePlace);
    }
    for (const group of targets.values()) {
      if (group.length > 1 && group.some((prop) => !prop.visibleIf)) {
        conflicts.push(`${map.id} ${group.map((prop) => prop.id).join(', ')}`);
      }
    }
  }
  expect(conflicts).toEqual([]);
});

it('leaves the Emberford portal post clear for Kip after the market Showdown', () => {
  const map = MAPS['aethelgard.emberford'];
  // WorldScene moves Kip to this post when the player must collect the gold seal.
  const post = { x: 21, y: 23 };
  const isWalkable = walkable(map);
  expect(isWalkable(post.x, post.y)).toBe(true);
  expect(isWalkable(post.x, post.y - 1)).toBe(true);
  expect(map.npcs.some(({ id, x, y }) => id !== 'kip-arden' && x === post.x && y === post.y)).toBe(false);

  const idris = map.npcs.find(({ id }) => id === 'porter-idris')!;
  expect(map.interactables.some(({ x, y, w, h }) => x <= idris.x && idris.x < x + w && y <= idris.y && idris.y < y + h)).toBe(false);
  expect(isWalkable(idris.x, idris.y - 1) || isWalkable(idris.x + 1, idris.y)).toBe(true);
});

it('gives Hesper’s return drawer and the City of Copies door separate facing targets in the Nexus', () => {
  const map = MAPS['nexus.archive'];
  const approach = walkable(map);
  // Both can be present after the debrief, including when a legacy save has no visit arrangement.
  for (const [id, y] of [['copies-door', 14], ['hesper-checked-drawer', 15]] as const) {
    const point = map.interactables.find((prop) => prop.id === id)!;
    expect([point.x, point.y]).toEqual([21, y]);
    expect(approach(20, y)).toBe(true);

    // Position at the centre of the western tile and face right, as WorldScene does.
    const frontX = 20 * 16 + 8 + 12;
    const frontY = y * 16 + 12;
    const targets = map.interactables.filter(({ x, y, w, h }) => x * 16 <= frontX && frontX <= (x + w) * 16
      && y * 16 <= frontY && frontY <= (y + h) * 16 + 6);
    expect(targets.map(({ id }) => id)).toEqual([id]);
  }
});

it('keeps Market kettle stages separate from the open Price Drawers door', () => {
  const d = new Driver();
  d.s.flags['market.arrived'] = true;
  d.s.inventory['item.kettle.service-card'] = 1;
  const map = MAPS['market.square'];
  checkFacingTarget(map, d, 'price-drawers-door', 5, 12, 5, 11, 'down');
  checkFacingTarget(map, d, 'market-kettle-card', 6, 12, 6, 11, 'down');
  d.s.objectivesDone.push('market.kettle.compare');
  checkFacingTarget(map, d, 'market-kettle-plan', 6, 12, 6, 11, 'down');
  d.s.flags['market.kettle.layout'] = 'table';
  checkFacingTarget(map, d, 'market-kettle-table', 6, 12, 6, 11, 'down');
});

it('keeps both exhibition-packet stages separate from the open Metalworks Pattern Shop door', () => {
  const d = new Driver();
  d.s.objectivesDone.push('metal.arrival');
  d.s.flags['metal.exhibit.layout'] = 'window';
  const map = MAPS['metalworks.records'];
  checkFacingTarget(map, d, 'metal-reference-shop', 18, 13, 18, 14, 'up');
  checkFacingTarget(map, d, 'metal-exhibition-packet', 19, 13, 19, 14, 'up');
  d.s.flags['metal.exhibit.carrier'] = 'local';
  checkFacingTarget(map, d, 'metal-exhibition-packet-ready', 19, 13, 19, 14, 'up');
});

it('lets Observatory readers inspect drafts and choose a checked dispatch at separate targets', () => {
  const d = new Driver();
  const windows = MAPS['observatory.window-shop'];
  d.s.objectivesDone.push('window.compare');
  checkFacingTarget(windows, d, 'window-trial-draft', 20, 14, 20, 15, 'up');
  checkFacingTarget(windows, d, 'window-publish', 21, 14, 21, 15, 'up');
  d.s.flags['window.post'] = 'deck';
  checkFacingTarget(windows, d, 'window-desk-detail', 16, 13, 16, 14, 'up');

  const references = MAPS['observatory.reference-station'];
  d.s.objectivesDone.push('refstation.globe', 'refstation.tube', 'refstation.horn');
  checkFacingTarget(references, d, 'refstation-first-claim', 17, 14, 17, 15, 'up');
  checkFacingTarget(references, d, 'refstation-send', 18, 14, 18, 15, 'up');
  d.s.flags['refstation.plan'] = 'local';
  checkFacingTarget(references, d, 'refstation-sent-local', 17, 14, 17, 15, 'up');
});

it('keeps both Emberford circular runner phases clear of the bridge and the standing gauge', () => {
  const d = new Driver();
  d.s.inventory['item.ember.circle-packet'] = 1;
  d.s.flags['ember.circle.choice'] = 'runner';
  const emberford = MAPS['aethelgard.emberford'];
  checkFacingTarget(emberford, d, 'circlereport-receive.runner', 30, 19, 30, 18, 'down');
  d.s.flags['ember.circle.placed'] = 'runner';
  checkFacingTarget(emberford, d, 'circlereport-result.runner', 30, 19, 30, 18, 'down');
});

it('gives the Harbour date receiver a tap target beside Irven and the bell relay', () => {
  const d = new Driver();
  d.s.objectivesDone.push('sea.arrival', 'sea.finish');
  const harbour = MAPS['sea.harbour'];
  const irven = harbour.npcs.find((npc) => npc.id === 'peg-reader-irven');
  expect([irven?.x, irven?.y]).toEqual([6, 8]);
  checkFacingTarget(harbour, d, 'sea-date-market', 7, 9, 7, 8, 'down');
});

function checkFacingTarget(
  map: MapDef, d: Driver, id: string, x: number, y: number, standX: number, standY: number, facing: 'up' | 'down',
) {
  const prop = map.interactables.find((entry) => entry.id === id);
  expect([prop?.x, prop?.y], id).toEqual([x, y]);
  expect(walkable(map)(standX, standY), id).toBe(true);

  const frontX = standX * 16 + 8;
  const frontY = standY * 16 + 12 + (facing === 'up' ? -12 : 12);
  const visible = map.interactables.filter((entry) => check(entry.visibleIf, d.s));
  const exactUnderFront = visible.filter((p) => frontX >= p.x * 16 && frontX <= (p.x + p.w) * 16
    && frontY >= p.y * 16 && frontY <= (p.y + p.h) * 16 + 6);
  expect(exactUnderFront.map((entry) => entry.id)).toEqual([id]);

  const pointX = x * 16 + 8;
  const pointY = y * 16 + 8;
  const pointerTargets = visible.filter((p) => pointX >= p.x * 16 && pointX < (p.x + p.w) * 16
    && pointY >= (p.y - 1) * 16 && pointY < (p.y + p.h) * 16);
  expect(pointerTargets.map((entry) => entry.id)).toEqual([id]);
}

describe('Chapter layouts after the Nile Archive', () => {
  it.each(maps)('$name has an approach to every actor and prop, and clear arrival tiles', (map) => {
    const isWalkable = walkable(map);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    expect(isWalkable(map.spawn.x, map.spawn.y)).toBe(true);
    const reachable = new Set<string>([`${map.spawn.x},${map.spawn.y}`]);
    const queue = [[map.spawn.x, map.spawn.y]];
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const [dx, dy] of directions) {
        const position = `${x + dx},${y + dy}`;
        if (reachable.has(position) || !isWalkable(x + dx, y + dy)) continue;
        reachable.add(position);
        queue.push([x + dx, y + dy]);
      }
    }

    for (const spot of [...map.npcs, ...map.interactables]) {
      expect(directions.some(([dx, dy]) => reachable.has(`${spot.x + dx},${spot.y + dy}`)), spot.id).toBe(true);
    }
    for (const prop of map.interactables) {
      if (prop.art) expect(art.has(prop.art), prop.id).toBe(true);
      if (prop.kind === 'exhibit' && prop.art && BIG_ART[prop.art]) expect(art.has(BIG_ART[prop.art]), prop.id).toBe(true);
      if (prop.to) {
        const destination = MAPS[prop.to.map];
        expect(destination, `${prop.id} points to ${prop.to.map}`).toBeDefined();
        expect(walkable(destination)(prop.to.x, prop.to.y), prop.id).toBe(true);
      }
    }
  });
});
