import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { homecomingMap } from '../src/content/originHomecomings';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { newCampaign } from '../src/domain/engine';
import {
  keeps,
  itemNeeded,
  touringInstrument,
} from '../src/content/originTours';
import {
  originPlaces,
  origins,
  originFlag,
  impression,
  scores,
  positions,
  readyToSend,
  type Origin,
  type InstrumentCommand,
} from '../src/domain/originInstruments';

const helpers = {
  archive: 'curator-dace',
  harbour: 'fruit-seller',
  traveller: 'clerk-venn',
  workshop: 'smith-hesper',
  singer: 'scholar-sefa',
};
function start(o: Origin, side: number) {
  const d = new Driver();
  d.s = newCampaign(d.e.pack, 'Neri', 'player-a', 100, { origin: o });
  d.s.mapId = originPlaces[o][0];
  const who = originPlaces[o][2];
  d.talk(who);
  d.talk(helpers[o]);
  const id = d.e.talkEntry(who, d.s)!;
  d.run({ type: 'EnterNode', node: id });
  const answer = d.e.visibleOptions(id, d.s)[side];
  const next = d.run({
    type: 'ChooseDialogueOption',
    node: id,
    index: answer.index,
  }).nextNode!;
  d.run({ type: 'EnterNode', node: next });
  return { d, first: next };
}
const set = (d: Driver, o: Origin, control: number, value: number) =>
  d.run({
    type: 'WorkOriginInstrument',
    origin: o,
    action: 'set',
    control,
    value,
  });
const play = (d: Driver, o: Origin) =>
  d.run({ type: 'WorkOriginInstrument', origin: o, action: 'try' });
function take(d: Driver, o: Origin, v: number[]) {
  v.forEach((n, i) => set(d, o, i, n));
  play(d, o);
}
const dest = (o: Origin) =>
  MAPS[originPlaces[o][1]].npcs.find((n) => n.id === originPlaces[o][2])!;
describe('the five instruments at the beginning of an old friendship', () => {
  for (const o of origins) {
    it(
      o +
        ' keeps four distinct first decisions and lets either receiver put every tried arrangement back to work',
      () => {
        const writes = new Set<string>();
        const starts = new Set<string>();
        for (let side = 0; side < 4; side++) {
          const { d, first } = start(o, side);
          const score = scores[o];
          starts.add(d.e.node(first).text);
          writes.add(positions(d.s, o).join('.'));
          const open = d.e
            .visibleOptions(first, d.s)
            .find((b) => b.option.open)!;
          expect(touringInstrument(open.option.open!.split(':')[1])).toEqual({
            o,
            away: false,
          });
          expect(d.done('os.' + o + '.o3')).toBe(true);
          expect(check(dest(o).visibleIf, d.s)).toBe(false);
          const positionsToTest = score.controls.reduce<number[][]>(
            (last, control) =>
              last.flatMap((row) =>
                control.positions.map((_, i) => [...row, i]),
              ),
            [[]],
          );
          for (const v of positionsToTest) {
            take(d, o, v);
            expect(d.s.flags[originFlag(o, 'last')]).toBe(v.join('.'));
            expect(impression(o, v).marks.length).toBeGreaterThan(1);
          }
          expect(readyToSend(d.s, o)).toBe(true);
          // Loading another arrangement without running it cannot silently publish somebody else’s result.
          set(d, o, 0, 0);
          expect(() =>
            d.run({
              type: 'WorkOriginInstrument',
              origin: o,
              action: 'send',
              side: 0,
            }),
          ).toThrow(/Run this arrangement/);
          play(d, o);
          for (const send of [0, 1] as const) {
            d.s.mapId = originPlaces[o][0];
            d.run({
              type: 'WorkOriginInstrument',
              origin: o,
              action: 'send',
              side: send,
            });
            expect(d.done('origin-tour.' + o + '.pack')).toBe(true);
            expect(check(dest(o).visibleIf, d.s)).toBe(true);
            const edition = d.s.flags[originFlag(o, 'edition')];
            set(d, o, 0, 1);
            expect(d.s.flags[originFlag(o, 'edition')]).toBe(edition);
            expect(() =>
              d.run({
                type: 'WorkOriginInstrument',
                origin: o,
                action: 'return',
                side: 0,
              }),
            ).toThrow(/Find/);
            d.s = JSON.parse(JSON.stringify(d.s));
            d.s.mapId = originPlaces[o][1];
            expect(d.e.talkEntry(originPlaces[o][2], d.s)).toBe(
              'origin-tour.' + o + '.away',
            );
            for (const next of [0, 1] as const) {
              d.run({
                type: 'WorkOriginInstrument',
                origin: o,
                action: 'return',
                side: next,
              });
              expect(d.s.flags[originFlag(o, 'returned')]).toBe(
                next === 0 ? 'first' : 'second',
              );
            }
            expect(d.done('origin-tour.' + o + '.tour')).toBe(true);
            d.s.mapId = originPlaces[o][0];
            play(d, o);
          }
          expect(d.p.portfolio).toHaveLength(1);
          expect(
            d.s.adventureDiary.entries.some((e) =>
              e.event?.key.startsWith('origin-work:' + o + '.return.'),
            ),
          ).toBe(true);
        }
        expect(writes.size).toBe(4);
        expect(starts.size).toBe(4);
      },
    );
    it(
      o +
        ' follows the actual receiver to both Council endings and carries their trace back to the first room',
      () => {
        const { d } = start(o, 0);
        const [home, away, who] = originPlaces[o];
        const keeper = MAPS[homecomingMap].npcs.find((n) => n.id === who)!;
        expect(check(keeper.visibleIf, d.s)).toBe(false);
        const initial = positions(d.s, o);
        take(d, o, initial);
        for (let i = 0; i < scores[o].controls.length; i++) {
          const next = [...initial];
          next[i] = (initial[i] + 1) % scores[o].controls[i].positions.length;
          take(d, o, next);
        }
        d.run({
          type: 'WorkOriginInstrument',
          origin: o,
          action: 'send',
          side: 1,
        });
        d.s.mapId = away;
        expect(check(keeper.visibleIf, d.s)).toBe(false);
        for (const side of [0, 1] as const) {
          d.s.mapId = away;
          d.run({
            type: 'WorkOriginInstrument',
            origin: o,
            action: 'return',
            side,
          });
          const answered = d.s.flags[originFlag(o, 'replyEdition')];
          d.s.mapId = home;
          d.run({
            type: 'WorkOriginInstrument',
            origin: o,
            action: 'send',
            side: 0,
          });
          expect(d.s.flags[originFlag(o, 'replyEdition')]).toBe(answered);
          d.s.mapId = homecomingMap;
          const entry = d.e.talkEntry(who, d.s)!;
          const visible = d.e.visibleOptions(entry, d.s);
          expect(visible.map((v) => v.index)).toEqual([side]);
          expect(check(keeper.visibleIf, d.s)).toBe(true);
          const offer = d.e.node('origin-final.' + o + '.offer');
          const replies = offer.options!;
          for (const [index, choice] of replies.entries()) {
            d.s.mapId = homecomingMap;
            d.talk(who, visible[0].option.text, choice.text);
            expect(d.s.flags[originFlag(o, 'homecoming')]).toBe(
              index ? 'given' : 'kept',
            );
            expect(d.done('origin-tour.' + o + '.homecoming')).toBe(true);
            d.s = JSON.parse(JSON.stringify(d.s));
            for (const room of [home, away]) {
              d.s.mapId = room;
              const n = d.e.talkEntry(who, d.s)!;
              const echo = d.e
                .visibleOptions(n, d.s)
                .filter((v) => v.option.next?.startsWith('origin-final.'));
              expect(echo.map((v) => v.option.next)).toEqual([
                'origin-final.' + o + '.home.' + index,
              ]);
              d.talk(who, echo[0].option.text);
            }
          }
        }
      },
    );
    it(
      o +
        ' also welcomes the other four backgrounds with their own earned object',
      () => {
        for (const visitor of origins.filter((k) => k !== o))
          for (const k of keeps[o]) {
            const d = new Driver();
            d.s.player.origin = visitor;
            d.s.mapId = originPlaces[o][1];
            expect(check(dest(o).visibleIf, d.s)).toBe(false);
            if (k.item === 'sign-splinter') {
              d.s.flags['sd.corvan.outcome'] = 'narrowed';
              d.run({ type: 'VisitPlace', name: 'The theatre foyer' });
              d.run({ type: 'EquipPerspective', keepsake: k.item });
            } else d.s.inventory[k.item] = 1;
            expect(
              check(itemNeeded(k.item), d.s) && check(dest(o).visibleIf, d.s),
            ).toBe(true);
            const who = originPlaces[o][2],
              node = d.e.talkEntry(who, d.s)!;
            expect(
              d.e.visibleOptions(node, d.s).some((q) => q.option.open),
            ).toBe(false);
            for (const [i, label] of ['a', 'b'].entries()) {
              const second = 'origin-tour.' + o + '.' + k.scene;
              d.talk(who, k.verb, d.e.node(second).options![i].text);
              expect(d.s.flags[originFlag(o, 'book.' + k.scene)]).toBe(label);
            }
            expect(() => play(d, o)).toThrow(/old neighbour/);
          }
      },
    );
  }
  it('fits the old wood into two separate rails, with four recoverable public consequences', () => {
    const d = new Driver();
    d.s.flags['sd.corvan.outcome'] = 'narrowed';
    d.run({ type: 'VisitPlace', name: 'The old board' });
    for (const [map, id, route] of [
      ['stage.foyer', 'origin-splinter-foyer-notch', 'foyer'],
      ['council.gallery', 'origin-splinter-council-notch', 'gallery'],
    ]) {
      d.s.mapId = map;
      const prop = MAPS[map].interactables.find((p) => p.id === id)!;
      d.run({ type: 'EquipPerspective', keepsake: 'sign-splinter' });
      expect(check(prop.visibleIf, d.s)).toBe(true);
      for (const option of d.e.node(prop.node!).options!) {
        d.walk(prop.node!, [option.text]);
        expect(d.s.flags['origin-splinter.' + route]).toBe(
          option.next?.split('.').at(-1),
        );
      }
    }
  });
  it('carries a single original, preserves the missing price, and distinguishes paired from confounded runs', () => {
    expect(impression('archive', [1, 3, 2]).line).toContain('single slip');
    expect(impression('harbour', [0, 1, 1]).line).toContain(
      'peg they need is missing',
    );
    expect(impression('traveller', [2, 0]).line).not.toBe(
      impression('traveller', [2, 2]).line,
    );
    expect(impression('singer', [0, 2]).line).toContain('empty');
    const { d } = start('workshop', 0);
    take(d, 'workshop', [0, 0]);
    take(d, 'workshop', [1, 1]);
    expect(readyToSend(d.s, 'workshop')).toBe(false);
    take(d, 'workshop', [0, 1]);
    expect(readyToSend(d.s, 'workshop')).toBe(true);
    expect(() =>
      d.run({
        type: 'WorkOriginInstrument',
        origin: 'workshop',
        action: 'set',
        control: 0,
        value: -1,
      } as InstrumentCommand),
    ).toThrow(/outside/);
  });
});
