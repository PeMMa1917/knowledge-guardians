import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { artKeys, BIG_ART } from '../src/ui/illustrations';

const maps = Object.values(MAPS).filter((map) => ['WORLD-04', 'WORLD-05', 'WORLD-06', 'WORLD-07'].includes(map.world));
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
      if (prop.to) expect(walkable(MAPS[prop.to.map])(prop.to.x, prop.to.y), prop.id).toBe(true);
    }
  });
});
