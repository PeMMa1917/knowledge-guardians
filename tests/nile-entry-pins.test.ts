import { expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const hall = MAPS['nile.hall'];
const pins = hall.interactables.filter(({ id }) => id.startsWith('nile-pins-'));
const visible = (d: Driver, name: string) => check(pins.find(({ id }) => id === `nile-pins-${name}`)!.visibleIf, d.s);
function use(d: Driver, name: string, pick?: string) {
  const prop = pins.find(({ id }) => id === `nile-pins-${name}`)!;
  expect(visible(d, name), name).toBe(true);
  if (prop.node) d.walk(prop.node, pick ? [pick] : []);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  return prop.text;
}

it.each([
  ['rail', 'punched handling copy', 'keeps both hands'],
  ['tray', 'printed guide', 'leaves their load'],
])('tests both tags and leaves the %s copy before either inquiry', (choice, pick, result) => {
  const d = new Driver();
  const checkSkills = ['SK-MICRO-0260', 'SK-MICRO-0411', 'SK-MICRO-0919'];
  const guideSkill = 'SK-MICRO-0079';
  expect(visible(d, 'rack')).toBe(false);
  d.s.mapId = hall.id;
  d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
  use(d, 'rack', 'Leave the rail');
  expect(visible(d, 'printed')).toBe(false);
  use(d, 'rack', 'Set the reading room');
  expect(use(d, 'printed')).toContain('The pins meet paper');
  expect(visible(d, 'choose')).toBe(false);
  use(d, 'rack', 'Set the reading room');
  use(d, 'printed');
  expect(visible(d, 'choose')).toBe(false);
  expect(checkSkills.every((skill) => !d.p.skills[skill])).toBe(true);
  use(d, 'rack', 'Set the carrier');
  expect(use(d, 'punched')).toContain('Both pins pass through');
  expect(d.done('nile.opening-pins.compare')).toBe(true);
  for (const skill of checkSkills) {
    expect(d.p.skills[skill]).toEqual([expect.stringMatching(/^WORLD-03\|.*\|nile\.opening-pins\.compare\|/)]);
  }
  expect(d.p.skills[guideSkill]).toBeUndefined();
  use(d, 'choose', 'Leave both copies');
  expect(d.done('nile.opening-pins.placed')).toBe(false);
  use(d, 'choose', pick);
  expect(use(d, choice)).toContain(result);
  expect(d.done('nile.opening-pins.placed')).toBe(true);
  use(d, choice);
  expect(d.p.skills[guideSkill]).toEqual([expect.stringMatching(/^WORLD-03\|.*\|nile\.opening-pins\.placed\|/)]);
  expect(d.done('nile.two')).toBe(false);
  expect(d.s.flags['nile.dispatch']).toBeUndefined();
});

it('keeps the two stations free of existing actors and props', () => {
  for (const { x, y } of pins) {
    expect(hall.floor(x, y)).toBeTruthy();
    expect(hall.npcs.some((npc) => npc.x === x && npc.y === y)).toBe(false);
    expect(hall.interactables.some((item) => !item.id.startsWith('nile-pins-') &&
      x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h)).toBe(false);
  }
});
