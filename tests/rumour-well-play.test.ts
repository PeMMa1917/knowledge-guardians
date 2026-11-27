import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { STAMPS } from '../src/scenes/art';
import { Driver } from './driver';

const guild = MAPS['aethelgard.emberford'];
const ferry = MAPS['aethelgard.ferry'];
const rumour = 'clever-well';
const guildRead = 'well.records.guild-read';
const ferryRead = 'well.records.route-read';

function follow(d: Driver, id: string, ...picks: string[]) {
  const prop = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id)!;
  if (!check(prop.visibleIf, d.s)) throw new Error(`Cannot reach ${id}`);
  d.walk(prop.node!, picks);
}

function checked(d: Driver) {
  for (const source of [1, 2]) d.run({ type: 'CheckRumourSource', rumour, source });
}

function route(d: Driver, desk: 'ledger' | 'ferry') {
  d.s.mapId = guild.id;
  d.run({ type: 'RouteRumour', rumour, desk });
}

function reload(d: Driver) {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
}

function receipt(d: Driver, branch: 'guild' | 'ferry') {
  return d.e.node(`well.records.${branch}-reply`).text;
}

describe('Two Ways to the East Well', () => {
  it('checks the sources, pairs Noa’s leaves through play and preserves the alternate destination across a save', () => {
    const d = new Driver();
    const initialMarks = d.s.marks;
    expect(() => route(d, 'ledger')).toThrow(/listed sources/);
    d.run({ type: 'CheckRumourSource', rumour, source: 1 });
    expect(() => route(d, 'ledger')).toThrow(/listed sources/);
    d.run({ type: 'CheckRumourSource', rumour, source: 2 });
    route(d, 'ledger');
    expect(d.s.marks).toBe(initialMarks + 5);
    expect(d.s.flags['mill.clever-well.tries']).toBeUndefined();
    expect(d.e.visibleOptions('well.records.guild', d.s).map(({ option }) => option.text))
      .not.toContain('Line up the matching mineral headings for the visitor.');

    follow(d, 'east-well-ledger', 'Clip the east', 'Return to the board', 'Leave the leaves');
    expect(d.s.flags['well.records.east']).toBe(true);
    expect(d.done(guildRead)).toBe(false);
    reload(d);
    follow(d, 'east-well-ledger', 'Clip the west', 'Return to the board', 'Line up the matching');
    expect(d.s.flags['well.records.guild']).toBe(true);
    expect(d.done(guildRead)).toBe(true);
    expect(receipt(d, 'guild')).toMatch(/nearly the same amounts.*no record of learning/);
    expect(d.s.flags['mill.clever-well.tries']).toBeUndefined();

    route(d, 'ferry');
    expect(() => follow(d, 'east-well-ledger')).toThrow(/Cannot reach/);
    d.s.mapId = ferry.id;
    expect(() => follow(d, 'east-well-school-peg')).toThrow(/Cannot reach/);
    follow(d, 'east-well-road-peg', 'Set the east-well peg');
    expect(d.s.flags['well.records.ferry']).toBeUndefined();
    reload(d);
    follow(d, 'east-well-school-peg', 'Run Efua’s route strip');
    expect(d.s.flags['well.records.ferry']).toBe(true);
    expect(d.done(ferryRead)).toBe(true);
    expect(receipt(d, 'ferry')).toMatch(/reason to gather.*does not show.*learning/);
    expect(d.s.flags['well.records.guild']).toBe(true);
    expect(d.s.flags['mill.clever-well.tries']).toBeUndefined();
    expect(d.s.flags['count.rumours']).toBe(1);
    expect(d.s.journal.filter((entry) => entry.startsWith('j.well.records.'))).toEqual(['j.well.records.guild', 'j.well.records.ferry']);
    expect(d.p.stones['KQ-NEW-005']).toEqual(['WORLD-02|compare', 'WORLD-02|follow']);
    expect(d.p.skills['SK-THK-14']).toEqual([
      'WORLD-02|compare|well.records.guild-read|NAT',
      'WORLD-02|follow|well.records.route-read|HUM',
    ]);
    expect(d.s.marks).toBe(initialMarks + 5);
  });

  it('plays the ferry choice first and allows an older verdict save to use either branch at equal credit', () => {
    const d = new Driver();
    d.s.mapId = guild.id;
    checked(d);
    d.run({ type: 'JudgeRumour', rumour, verdict: 2 });
    const oldMarks = d.s.marks;
    reload(d);
    route(d, 'ferry');
    d.s.mapId = ferry.id;
    follow(d, 'east-well-road-peg', 'Set the east-well peg');
    follow(d, 'east-well-school-peg', 'Run Efua’s route strip');
    expect(d.done(ferryRead)).toBe(true);
    expect(d.s.flags['well.records.guild']).toBeUndefined();
    route(d, 'ledger');
    follow(d, 'east-well-ledger', 'Clip the west', 'Return to the board', 'Clip the east', 'Return to the board', 'Line up the matching');
    expect(d.s.flags['well.records.guild']).toBe(true);
    expect(d.s.flags['well.records.ferry']).toBe(true);
    expect(d.s.flags['mill.clever-well.tries']).toBe(1);
    expect(d.s.flags['count.rumours']).toBe(1);
    expect(d.s.marks).toBe(oldMarks);
    expect(d.p.credit).toEqual({});
  });

  it.each([
    { map: guild, id: 'east-well-ledger', arrival: guild.spawn },
    { map: ferry, id: 'east-well-road-peg', arrival: { x: 1, y: 5 } },
    { map: ferry, id: 'east-well-school-peg', arrival: { x: 1, y: 5 } },
  ])('keeps $id clear of ordinary map targets and reachable from the road', ({ map, id, arrival }) => {
    const target = map.interactables.find((prop) => prop.id === id)!;
    const { x, y } = target;
    const contains = (r: { x: number; y: number; w: number; h: number }, tx: number, ty: number) =>
      tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h;
    const otherProps = map.interactables.filter((prop) => prop.id !== id);
    expect(otherProps.filter((prop) => contains(prop, x, y)).map((prop) => prop.id), 'prop footprint').toEqual([]);
    expect(otherProps.filter((prop) => contains({ ...prop, y: prop.y - 1, h: prop.h + 1 }, x, y)).map((prop) => prop.id), 'existing tap targets').toEqual([]);
    expect(otherProps.filter((prop) => contains({ ...target, y: y - 1, h: target.h + 1 }, prop.x, prop.y)).map((prop) => prop.id), 'new tap target').toEqual([]);
    expect(map.npcs.filter((npc) => npc.x === x && npc.y === y), 'actor footprint').toEqual([]);

    const solids = [
      ...map.blocks.map(([x, y, w, h]) => ({ x, y, w, h })),
      ...map.stamps.flatMap((stamp) => {
        const collision = STAMPS[stamp.stamp].collide;
        return collision ? [{ x: stamp.x + collision[0], y: stamp.y + collision[1], w: collision[2], h: collision[3] }] : [];
      }),
      ...map.npcs.map(({ x, y }) => ({ x, y, w: 1, h: 1 })),
      ...otherProps.filter((prop) => !prop.walkThrough),
    ];
    const floor = (x: number, y: number) => map.floor(x, y) !== null && !solids.some((solid) => contains(solid, x, y));
    expect(floor(x, y), 'clear placement').toBe(true);
    expect(floor(arrival.x, arrival.y), 'clear inbound door tile').toBe(true);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const queue = [arrival];
    const seen = new Set([`${arrival.x},${arrival.y}`]);
    for (const point of queue) for (const [dx, dy] of directions) {
      const next = { x: point.x + dx, y: point.y + dy };
      const key = `${next.x},${next.y}`;
      if (!seen.has(key) && floor(next.x, next.y)) {
        seen.add(key);
        queue.push(next);
      }
    }
    expect(directions.some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`))).toBe(true);
  });
});
