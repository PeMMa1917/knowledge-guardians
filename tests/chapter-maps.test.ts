import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { artKeys, BIG_ART } from '../src/ui/illustrations';

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
