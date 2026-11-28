import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import {
  courierCases,
  courierFlag,
  dispatchLift,
  carriedMark,
  lastCourierOpening,
  liftLandings,
  type CourierCase,
} from '../src/domain/courierLift';
import { ownsSpecimen, specimenToolId } from '../src/domain/specimenGear';

function collect(d: Driver, c: CourierCase) {
  const original = Object.values(MAPS).filter((m) =>
    m.interactables.some((p) => p.exhibit === c.exhibit),
  );
  expect(original).toHaveLength(1);
  d.s.mapId = original[0].id;
  d.run({ type: 'InspectExhibit', exhibit: c.exhibit });
  expect(() => d.run({ type: 'ClaimSpecimen', exhibit: c.exhibit })).toThrow(
    /quest/,
  );
  // Resume this case at the end of its established earning quest.
  d.s.objectivesDone.push(c.objective);
  d.run({ type: 'ClaimSpecimen', exhibit: c.exhibit });
  d.run({ type: 'EquipPerspective', keepsake: specimenToolId(c.key) });
}
const cmd = (d: Driver, handle: number) =>
  d.run({ type: 'WorkCourierLift', act: 'tip', handle });
describe('the counterweight letters', () => {
  for (const c of courierCases)
    it(
      c.key +
        ' retains one registered object through three views, four receiver openings and a saved trip home',
      () => {
        const d = new Driver();
        const elm = d.e.pack.exhibits.find((e) => e.id === c.exhibit)!;
        expect(elm.specimen?.source).toBe(c.source);
        expect(d.e.pack.sources.find((s) => s.id === c.source)?.url).toMatch(
          /^https:/,
        );
        collect(d, c);
        expect(ownsSpecimen(d.s, c.key)).toBe(true);
        d.s.mapId = dispatchLift;
        expect(() => cmd(d, -1)).toThrow(/tab/);
        cmd(d, 0);
        expect(() =>
          d.run({ type: 'WorkCourierLift', act: 'send', landing: 'market' }),
        ).toThrow(/two ways/);
        cmd(d, 1);
        for (const [index] of c.handles.entries()) {
          d.s.mapId = dispatchLift;
          cmd(d, index);
          for (const stop of ['market', 'theatre'] as const) {
            const g = 'courier.' + c.shape + '.' + stop;
            d.s.mapId = dispatchLift;
            d.run({ type: 'WorkCourierLift', act: 'send', landing: stop });
            expect(carriedMark(d.s, c, stop)).toEqual(c.handles[index]);
            const desk = MAPS[liftLandings[stop]].interactables.find(
              (p) => p.id === 'courier-' + stop,
            )!;
            expect(check(desk.visibleIf, d.s)).toBe(true);
            expect(() =>
              d.run({
                type: 'WorkCourierLift',
                act: 'receive',
                landing: stop,
                opening: 'person',
              }),
            ).toThrow(/Follow/);
            d.s = JSON.parse(JSON.stringify(d.s));
            d.s.mapId = liftLandings[stop];
            for (const opening of ['object', 'person'] as const) {
              d.run({
                type: 'WorkCourierLift',
                act: 'receive',
                landing: stop,
                opening,
              });
              expect(d.done(g)).toBe(true);
              expect(d.s.flags[courierFlag(c, stop + '.opening')]).toBe(
                opening,
              );
              const notes = d.s.adventureDiary.entries.filter((e) =>
                e.event?.key.startsWith('courier:' + c.shape + '.receive.'),
              );
              const entry = notes.at(-1)!;
              expect(entry.event?.sourceIds).toEqual([c.source]);
              expect(diaryQuestions(entry)).toEqual(opening === 'person'
                ? { person: c.questions.person, landing: c.questions[stop] }
                : { mark: c.questions.mark, landing: c.questions[stop] });
            }
          }
        }
        const hatch = MAPS[dispatchLift].interactables.find(
          (p) => p.id === 'courier-hatch',
        )!;
        expect(check(hatch.visibleIf, d.s)).toBe(true);
        d.s.mapId = hatch.to!.map;
        d.talk('courier-bew', 'Let Pella', 'Knot a second cord');
        expect(d.s.flags['courier.family']).toBe('bell');
        d.talk('courier-pella', 'Turn over', 'Put the three fees');
        expect(d.s.flags['courier.family']).toBe('receipt');
      },
    );
  it('leaves a readdressed parcel pending until its own facing mark reaches the recipient', () => {
    const d = new Driver(),
      c = courierCases[0];
    collect(d, c);
    d.s.mapId = dispatchLift;
    cmd(d, 0);
    cmd(d, 1);
    d.run({ type: 'WorkCourierLift', act: 'send', landing: 'market' });
    d.s.mapId = liftLandings.market;
    d.run({
      type: 'WorkCourierLift',
      act: 'receive',
      landing: 'market',
      opening: 'person',
    });
    expect(lastCourierOpening(d.s, c, 'market')).toBe('person');
    d.s.mapId = dispatchLift;
    cmd(d, 2);
    d.run({ type: 'WorkCourierLift', act: 'send', landing: 'market' });
    expect(lastCourierOpening(d.s, c, 'market')).toBeUndefined();
    d.s.mapId = liftLandings.market;
    d.run({
      type: 'WorkCourierLift',
      act: 'receive',
      landing: 'market',
      opening: 'object',
    });
    expect(lastCourierOpening(d.s, c, 'market')).toBe('object');
  });
  it('keeps the route attached to the actual carried item even when a previous address remains open', () => {
    const d = new Driver(),
      [c, other] = courierCases;
    collect(d, c);
    d.s.mapId = dispatchLift;
    cmd(d, 0);
    cmd(d, 2);
    d.run({ type: 'WorkCourierLift', act: 'send', landing: 'market' });
    collect(d, other);
    d.s.mapId = liftLandings.market;
    expect(() =>
      d.run({
        type: 'WorkCourierLift',
        act: 'receive',
        landing: 'market',
        opening: 'object',
      }),
    ).toThrow(/issued address/);
    expect(ownsSpecimen(d.s, c.key)).toBe(true);
    expect(d.s.inventory['item.specimen.' + c.key]).toBe(1);
  });
});
