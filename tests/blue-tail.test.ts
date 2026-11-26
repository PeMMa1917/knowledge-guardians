import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const nexus = 'nexus.archive';
const gallery = 'council.gallery';

function at(d: Driver, map: string) {
  d.s.mapId = map;
  d.run({ type: 'VisitPlace', name: MAPS[map].name });
}

function target(d: Driver, id: string, map = d.s.mapId) {
  return MAPS[map].interactables.find((prop) => prop.id === `blue-tail-${id}` && check(prop.visibleIf, d.s));
}

function act(d: Driver, id: string, ...picks: string[]) {
  const prop = target(d, id);
  expect(prop, `${d.s.mapId} ${id}`).toBeDefined();
  d.walk(prop!.node!, picks);
}

function opening(d: Driver, hunch: 'cut' | 'held', route: 'rail' | 'desk') {
  const interpretation = hunch === 'cut' ? 'Track a lost line' : 'Track a held name';
  const receiver = route === 'rail' ? 'Pin the warning here' : 'Leave the whole strip';
  act(d, 'stair', 'Catch the strip', 'Turn it over', 'Keep the tear', interpretation, receiver);
}

function comparePrints(d: Driver) {
  at(d, 'copies.press');
  expect(target(d, 'copies')).toBeUndefined();
  act(d, 'copies-proof', 'Use the blue tail');
  act(d, 'copies', 'Clip the press and runner proofs');
}

function matchCounterfoil(d: Driver) {
  at(d, 'water.gatehouse');
  expect(target(d, 'water')).toBeUndefined();
  const order = MAPS[d.s.mapId].interactables.find(({ id }) => id === 'harrowmere-order')!;
  d.run({ type: 'ReadWorldSign', id: order.id, title: order.label, text: order.text ?? '', readFlag: order.flag });
  act(d, 'water', 'Join B17 at the tear');
}

function permission(d: Driver) {
  at(d, 'voices.listening');
  act(d, 'voices', 'Ask what the witness permits', 'Leave both at the listening desk');
  expect(d.done('tail.voices')).toBe(false);
  act(d, 'voices', 'Ask what the witness permits', 'Take the approved line');
}

function recover(d: Driver) {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
}

const placements = Object.values(MAPS).flatMap((map) => map.interactables
  .filter(({ id }) => id.startsWith('blue-tail-')).map((prop) => ({ map, prop })));

/** Static clearance is pessimistic and keeps dormant actors and every solid prop occupied. */
function flood(map: MapDef) {
  const solid = new Set<string>();
  const block = (x: number, y: number, w: number, h: number) => {
    for (let iy = y; iy < y + h; iy++) for (let ix = x; ix < x + w; ix++) solid.add(`${ix},${iy}`);
  };
  for (const bounds of map.blocks) block(...bounds);
  for (const stamp of map.stamps) {
    const mask = STAMPS[stamp.stamp].collide;
    if (mask) block(stamp.x + mask[0], stamp.y + mask[1], mask[2], mask[3]);
  }
  for (const actor of map.npcs) block(actor.x, actor.y, 1, 1);
  for (const prop of map.interactables) if (!prop.walkThrough) block(prop.x, prop.y, prop.w, prop.h);
  const pass = (x: number, y: number) => !!map.floor(x, y) && !solid.has(`${x},${y}`);
  const visited = new Set<string>();
  const queue = [[map.spawn.x, map.spawn.y]];
  while (queue.length) {
    const [x, y] = queue.pop()!;
    const key = `${x},${y}`;
    if (!pass(x, y) || visited.has(key)) continue;
    visited.add(key);
    queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }
  return (x: number, y: number) => visited.has(`${x},${y}`);
}

describe('The Blue Tail', () => {
  it('starts from the stair in a fresh campaign and lets a player put down the original and return', () => {
    const d = new Driver();
    expect(d.e.visibleObjectives(d.s).filter(({ id }) => id.startsWith('tail.'))).toEqual([]);
    act(d, 'stair', 'Catch the strip', 'Bring it up to the landing');
    expect(d.s.inventory['item.blue-tail']).toBe(1);
    expect(target(d, 'stair')).toBeUndefined();
    expect(d.e.visibleObjectives(d.s).filter(({ id }) => id.startsWith('tail.')).map(({ id }) => id)).toEqual(['tail.opening']);
    recover(d);
    act(d, 'bench', 'Turn the strip over', 'Keep the tear', 'Keep both open', 'Pin the warning here');
    expect(d.done('tail.opening')).toBe(true);
    expect(d.s.inventory['item.blue-tail']).toBe(1);
    expect(d.s.flags['tail.hunch']).toBe('both');
    expect(d.done('m01.o1.look')).toBe(false);
  });

  it('distinguishes causal tests from hypotheses about an earlier event', () => {
    const d = new Driver();
    opening(d, 'cut', 'rail');
    at(d, 'metalworks.yard');
    act(d, 'metal', 'Pull the same practice strip');
    expect(d.done('tail.metal')).toBe(true);
    expect(d.e.node('tail.metal.heard').text).toContain('doesn’t tell me which bench');
    expect(d.s.flags['tail.water']).toBeUndefined();
    comparePrints(d);
    expect(d.done('tail.copies')).toBe(true);
    expect(d.e.node('tail.copies.cut').text).toContain('stitches on the runner’s later fold');
  });

  it.each([
    ['cut', 'rail', 'desk', 'copies'],
    ['held', 'desk', 'rail', 'market'],
  ] as const)('remembers %s and %s before a different final %s, via %s', (hunch, start, end, source) => {
    const d = new Driver();
    const before = structuredClone(d.p.credit);
    opening(d, hunch, start);
    const otherStart = start === 'rail' ? 'desk' : 'rail';
    const otherEnd = end === 'rail' ? 'desk' : 'rail';
    expect(target(d, `early-${otherStart}`)).toBeUndefined();
    act(d, `early-${start}`, start === 'rail' ? 'Move the warning down' : 'Take the porter');
    expect(d.s.flags['tail.first-reader']).toBe(start);
    expect(d.done('tail.early')).toBe(true);
    expect(target(d, `early-${start}-receipt`)?.art).toBe(start === 'rail' ? 'blue-tail.rail-low' : 'blue-tail.desk-marked');
    at(d, gallery);
    expect(target(d, 'council-missing')).toBeDefined();
    expect(target(d, 'council')).toBeUndefined();

    if (source === 'copies') comparePrints(d);
    else {
      at(d, 'market.square');
      expect(target(d, 'market')).toBeUndefined();
      // Rook joining is an existing chapter prerequisite. The account still has to be taken here.
      d.run({ type: 'SetFlag', flag: 'rook.joined', value: true });
      act(d, 'market', 'Accept Rook’s signed account');
    }
    matchCounterfoil(d);
    at(d, gallery);
    expect(target(d, 'council')).toBeUndefined();
    permission(d);
    at(d, gallery);
    act(d, 'council', 'Put the matched edges', 'Leave both receivers');
    expect(d.s.flags[`node.tail.council.context.${hunch}`]).toBe(true);
    expect(d.done('tail.decision')).toBe(false);
    expect(target(d, 'council-resume')).toBeDefined();
    recover(d);
    act(d, 'council-resume', 'Return to the receiver choice', end === 'rail' ? 'Pin the approved dusk warning' : 'Open a staffed hand-off');
    expect(d.done('tail.decision')).toBe(true);
    expect(target(d, `end-${otherEnd}`)).toBeUndefined();
    expect(target(d, `nexus-${end}`, nexus)).toBeUndefined();
    act(d, `end-${end}`, end === 'rail' ? 'Check the arrow' : 'Hand the next keeper');
    expect(d.done('tail.return')).toBe(true);
    recover(d);
    expect(target(d, `end-${end}-done`)?.art).toBe(end === 'rail' ? 'blue-tail.rail-low' : 'blue-tail.desk-marked');
    at(d, nexus);
    expect(target(d, `nexus-${end}`)?.label).toMatch(end === 'rail' ? /lowered warning/ : /two bell times/);
    expect(target(d, `nexus-${otherEnd}`)).toBeUndefined();
    expect(d.s.inventory['item.blue-tail']).toBe(1);
    expect(d.s.flags['ending.council']).toBeUndefined();
    expect(d.done('council.finish')).toBe(false);
    expect(d.p.credit).toEqual(before);
  });

  it('gives distinct playable checks to every intermediate chapter', () => {
    const d = new Driver();
    opening(d, 'cut', 'rail');
    for (const [map, id, pick] of [
      ['nile.hall', 'nile', 'Turn the receiving fold'],
      ['preserved.archive', 'cold', 'Check the thread ends'],
      ['observatory.harbour', 'coast', 'Hang each slate'],
      ['sea.harbour', 'sea', 'Follow the crew’s two landmarks'],
      ['civic.steps', 'civic', 'Separate the marked dispatch'],
    ]) {
      at(d, map);
      expect(d.done(`tail.${id}`)).toBe(false);
      act(d, id, pick);
      expect(d.done(`tail.${id}`)).toBe(true);
      expect(target(d, `${id}-heard`)).toBeDefined();
    }
    at(d, 'forest.station');
    expect(target(d, 'forest')).toBeUndefined();
    at(d, 'forest.trail');
    act(d, 'forest-bend', 'Mark the post visible');
    at(d, 'forest.station');
    act(d, 'forest', 'Join the two sight marks');
    expect(d.done('tail.forest')).toBe(true);
    at(d, 'stage.gallery');
    expect(target(d, 'stage')).toBeUndefined();
    act(d, 'stage-rear', 'Repeat the words');
    act(d, 'stage', 'Give the caller the words');
    expect(d.done('tail.stage')).toBe(true);
    at(d, 'island.workshop');
    act(d, 'island', 'Run both wooden feet', 'Leave the markers here');
    recover(d);
    act(d, 'island', 'Return to the keeper’s position', 'Move the practice keeper');
    expect(d.done('tail.island')).toBe(true);
  });

  it('reserves reachable, unoccupied approaches and provides four grounded hint depths', () => {
    const pack = buildPack();
    const dialogue = new Set(pack.dialogue.map(({ id }) => id));
    const arrivals = Object.values(MAPS).flatMap((map) => [...map.interactables, ...map.zones].flatMap(({ to }) => to ? [to] : []));
    const floors = new Map<string, ReturnType<typeof flood>>();
    expect(new Set(placements.map(({ map }) => map.world)).size).toBe(15);
    for (const { map, prop } of placements) {
      let reachable = floors.get(map.id);
      if (!reachable) { reachable = flood(map); floors.set(map.id, reachable); }
      expect(reachable(prop.x, prop.y + 1), prop.id).toBe(true);
      expect(arrivals.some(({ map: id, x, y }) => id === map.id && x === prop.x && y === prop.y), prop.id).toBe(false);
      expect(map.interactables.some((old) => !old.id.startsWith('blue-tail-') && prop.x >= old.x && prop.x < old.x + old.w
        && prop.y >= old.y - 1 && prop.y <= old.y + old.h), prop.id).toBe(false);
      expect(artKeys()).toContain(prop.art);
      expect(dialogue.has(prop.node!)).toBe(true);
    }
    const objectives = pack.missions.filter(({ id }) => id.endsWith('-BLUE-TAIL')).flatMap(({ objectives }) => objectives);
    expect(objectives).toHaveLength(17);
    for (const { id, weave } of objectives) {
      expect(pack.hints.filter(({ objective }) => objective === id).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
      expect(weave?.framework?.length).toBeGreaterThan(0);
    }
  });
});
