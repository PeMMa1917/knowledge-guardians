import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import {
  castShadows,
  lamps,
  shadowEffects,
  shadowReading,
  SUPPER_ROOM,
  type Lamps,
  type Screen,
} from '../src/domain/supperShadow';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { adventureJournalView } from '../src/domain/adventureJournal';

function arrive(d: Driver, room = SUPPER_ROOM) {
  d.s.mapId = room;
  d.run({ type: 'VisitPlace', name: MAPS[room].name });
}
function show(d: Driver, spoons: 1 | 2, lights: Lamps, screen: Screen) {
  d.run({ type: 'CastSupperShadow', spoons, lamps: lights, screen });
}
function choose(d: Driver, node: string, line: string) {
  const option = d.e
    .visibleOptions('supper.' + node, d.s)
    .find((s) => s.option.text.includes(line));
  expect(option, 'line ' + line + ' at ' + node).toBeDefined();
  const next = d.run({
    type: 'ChooseDialogueOption',
    node: 'supper.' + node,
    index: option!.index,
  }).nextNode;
  if (next) d.run({ type: 'EnterNode', node: next });
}
describe('Supper for a Shadow', () => {
  it('projects every working configuration and retains the lighting evidence discarded by chalk', () => {
    const single = castShadows('sides', 1),
      pair = castShadows('centre', 2);
    expect(single.map((s) => s.at)).toEqual([-4, 4]);
    expect(pair.map((s) => s.at)).toEqual([-4, 4]);
    expect(single.every((s) => !s.full)).toBe(true);
    expect(pair.every((s) => s.full)).toBe(true);
    expect(castShadows('sides', 1, 'near').map((s) => s.at)).toEqual([-2, 2]);
    expect(castShadows('centre', 2, 'near').map((s) => s.at)).toEqual([-3, 3]);
    expect(castShadows('sides', 2)).toEqual([
      { at: -8, full: false },
      { at: 0, full: true },
      { at: 8, full: false },
    ]);
    for (const setting of Object.keys(lamps) as Lamps[])
      for (const spoons of [1, 2] as const) {
        const cast = castShadows(setting, spoons);
        expect(new Set(cast.map((s) => s.at)).size).toBe(cast.length);
        for (const screen of ['chalk', 'lit'] as const)
          expect(
            shadowReading({ lamps: setting, spoons, screen }).length,
          ).toBeGreaterThan(50);
      }
    const d = new Driver();
    expect(() => show(d, 1, 'sides', 'chalk')).toThrow(/hatch/);
    arrive(d);
    expect(() =>
      shadowEffects(d.s, {
        type: 'CastSupperShadow',
        spoons: 3 as 2,
        lamps: 'centre',
        screen: 'chalk',
      }),
    ).toThrow(/Choose/);
  });
  it('requires independent traces at both bar stops before the Thursday caveat is available', () => {
    const d = new Driver();
    arrive(d);
    for (const depth of ['near', 'middle'] as const) {
      for (const [spoons, lamps] of [
        [1, 'sides'],
        [2, 'centre'],
      ] as const)
        d.run({
          type: 'CastSupperShadow',
          spoons,
          lamps,
          screen: 'chalk',
          depth,
        });
      expect(d.done('supper.moved')).toBe(depth === 'middle');
    }
    choose(d, 'curtain', 'Thursday’s rail position');
    expect(d.s.flags['supper.edition']).toBeUndefined();
  });
  it.each([
    ['hall', 'Untie', 'Hold the cloth', 'copies.landing'],
    ['kitchen', 'Draw the kitchen', 'Keep the type', 'copies.press'],
    ['booth', 'Rig both', 'Leave both', 'copies.archive'],
  ])(
    'enacts the %s ending with its own witness and a return in Emberford',
    (route, choice, reply, dest) => {
      const d = new Driver();
      arrive(d);
      const options = () =>
        d.e.visibleOptions('supper.curtain', d.s).map((o) => o.option.text);
      expect(options()).toHaveLength(1);
      show(d, 1, 'sides', 'chalk');
      show(d, 2, 'centre', 'chalk');
      expect(d.done('supper.trace')).toBe(true);
      expect(options()).toHaveLength(4);
      show(d, 1, 'sides', 'lit');
      show(d, 2, 'centre', 'lit');
      expect(d.done('supper.light')).toBe(true);
      expect(options()).toHaveLength(5);
      choose(d, 'curtain', choice);
      const stair = MAPS[SUPPER_ROOM].interactables.find(
        (p) => p.id === 'supper-stair-' + route,
      )!;
      expect(check(stair.visibleIf, d.s)).toBe(true);
      expect(
        MAPS[SUPPER_ROOM].interactables.filter(
          (p) => p.id.startsWith('supper-stair-') && check(p.visibleIf, d.s),
        ),
      ).toEqual([stair]);
      expect(stair.to?.map).toBe(dest);
      arrive(d, dest);
      const witness = MAPS[dest].interactables.find(
        (p) => p.node === 'supper.' + route + '-reader',
      )!;
      expect(check(witness.visibleIf, d.s)).toBe(true);
      choose(d, route + '-reader', reply);
      expect(d.done('supper.supper')).toBe(true);
      expect(
        d.e
          .visibleOptions('supper.market-later', d.s)
          .some(
            (s) =>
              s.option.next ===
              'supper.market-' +
                (
                  { hall: 'show', kitchen: 'letter', booth: 'booth' } as Record<
                    string,
                    string
                  >
                )[route],
          ),
      ).toBe(true);
      const view = adventureJournalView(
        d.e.pack,
        d.s,
        d.e.visibleObjectives(d.s),
      );
      expect(
        view.entries.filter((e) => e.event?.ref === 'supper.lamps'),
      ).toHaveLength(4);
    },
  );
  it.each(['share it with Kip', 'waiting porter'])(
    'uses exactly one cup at the bench and leaves a reply for %s',
    (line) => {
      const d = new Driver();
      arrive(d);
      d.s.inventory['item.tea'] = 2;
      choose(d, 'tea', line);
      expect(d.s.inventory['item.tea']).toBe(1);
      expect(
        d.e
          .visibleOptions('supper.tea', d.s)
          .some((o) => o.option.effects?.some((e) => 'takeItem' in e)),
      ).toBe(false);
      expect(
        d.e
          .visibleOptions('supper.tea', d.s)
          .some((o) => o.option.next?.startsWith('supper.tea-')),
      ).toBe(true);
    },
  );
  it('gives seven earlier possessions specific jobs and recognises the returning optics visitor', () => {
    const d = new Driver();
    arrive(d);
    for (const [prop, goal, actions] of [
      ['book', 'witness', ['where Kip stood', 'who added']],
      ['pen', 'pen', ['two outlines', 'dot where']],
      ['seal', 'impression', ['toward the wick', 'quarter turn']],
      ['map', 'walk', ['market corner', 'on foot']],
      ['deputy', 'proxy', ['tonight’s carrier']],
      ['pair', 'faces', ['Nest the two']],
      ['scale', 'width', ['four little', 'two large']],
    ] as [string, string, string[]][]) {
      const table = MAPS[SUPPER_ROOM].interactables.find(
        (p) => p.id === 'supper-' + prop,
      )!;
      const item = (table.visibleIf as { item: string }).item;
      expect(d.e.pack.items.some((i) => i.id === item)).toBe(true);
      delete d.s.inventory[item];
      expect(check(table.visibleIf, d.s)).toBe(false);
      expect(
        d.e
          .visibleOptions(table.node!, d.s)
          .some((o) => o.option.effects?.length),
      ).toBe(false);
      d.s.inventory[item] = 1;
      expect(check(table.visibleIf, d.s)).toBe(true);
      for (const action of actions) choose(d, prop, action);
      expect(d.done('supper.' + goal)).toBe(true);
      expect(d.s.inventory[item]).toBe(1);
    }
    const peg = MAPS[SUPPER_ROOM].interactables.find(
      (p) => p.id === 'supper-optics',
    )!;
    expect(check(peg.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'thinker.haytham.test.tube', value: true });
    expect(check(peg.visibleIf, d.s)).toBe(true);
    show(d, 1, 'left', 'lit');
    choose(d, 'optics', 'left shutter');
    show(d, 1, 'right', 'lit');
    choose(d, 'optics', 'right shutter');
    show(d, 1, 'sides', 'lit');
    choose(d, 'optics', 'Overlay both');
    expect(d.done('supper.prediction')).toBe(true);
  });
});
