import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { check } from '../src/domain/rules';
import { auditCourseFloor, courseTags, estimatedCourseEncounters } from '../tools/tok-floor';
import { playPath } from '../src/domain/learningPaths';
import {
  hatchHall,
  hatchReading,
  hatchStudy,
  heldPair,
  issuedSleeve,
  sleeveLabels,
  sleeves,
  wrapperReading,
  type HatchCommand,
} from '../src/domain/hatchSleeve';
import { MAPS } from '../src/maps';

type Move = HatchCommand extends infer C ? (C extends HatchCommand ? Omit<C, 'type'> : never) : never;
const move = (d: Driver, c: Move) => d.run({ type: 'WorkHatchSleeve', ...c });
function enterStudy(d: Driver) {
  d.s.mapId = hatchStudy;
  d.run({ type: 'ReadClue', clue: 'letter' });
}
function prepare(d: Driver) {
  enterStudy(d);
  for (const author of ['elsbet', 'orrin'] as const) move(d, { work: 'unfold', author });
  move(d, { work: 'strike', surface: 'board', listener: 'peg', tooth: false });
  for (const tooth of [false, true])
    move(d, { work: 'strike', surface: 'brass', listener: 'table', tooth });
}
describe('the nick in Corvan’s sign and the cricket in Elsbet’s sleeve', () => {
  for (const [wrapper, label] of [
    ['nick', "Let's take it to Ise"],
    ['hour', 'Put the hour inside'],
  ] as const)
    it.each(['rail', 'desk', 'round'] as const)(
      'carries the ' + wrapper + ' to the %s and lets each action keep its own witness',
      (custody) => {
        const d = new Driver();
        d.run({ type: 'SetFlag', flag: 'sd.corvan.outcome', value: 'narrowed' });
        d.run({ type: 'EnterNode', node: 'kip.seal' });
        d.run({ type: 'EnterNode', node: 'kip.seal' });
        expect(d.s.inventory['item.gold-seal']).toBe(1);
        expect(d.s.flags['seal.found']).toBeUndefined();
        d.talk('kip-arden', 'tiny seal', label);
        expect(d.s.flags['hatch.wrapper']).toBe(wrapper);
        expect(d.s.inventory['item.gold-seal']).toBe(1);
        d.s.mapId = hatchHall;
        const address = { rail: 'public hatch', desk: 'staffed desk', round: 'shift changes' }[custody];
        d.talk('warden-ise', address);
        expect(d.s.flags['chapter.done']).toBe(true);
        expect(d.s.flags['hatch.custody']).toBe(custody);
        enterStudy(d);
        move(d, { work: 'lay' });
        expect(wrapperReading(d.s)).toContain(
          wrapper === 'nick' ? 'which edge was up' : 'neither of them saw it pressed',
        );
        expect(d.s.flags['hatch.wrapped.' + wrapper]).toBe(true);
      },
    );
  it.each([
    ['rail', 'Sew the ridge', 'thread'],
    ['rail', 'Keep the glove', 'watch'],
    ['desk', 'appointment tab', 'tab'],
    ['desk', 'Keep her seat', 'seat'],
    ['round', 'Keep walking', 'walk'],
    ['round', 'Wait on this step', 'hold'],
  ] as const)('lets the caller at the %s carry out %s', (place, choice, answer) => {
    const d = new Driver();
    d.s.mapId = place === 'round' ? 'aethelgard.emberford' : hatchHall;
    const prop = MAPS[d.s.mapId].interactables.find((x) => x.id === 'hatch-' + place + '-reply')!;
    expect(check(prop.visibleIf, d.s)).toBe(false);
    d.s.flags['hatch.custody'] = place;
    expect(check(prop.visibleIf, d.s)).toBe(true);
    d.walk(prop.node!, [choice]);
    expect(d.s.flags['hatch.answer.' + place]).toBe(answer);
    expect(d.s.journal).toContain('j.hatch.reply.' + place + '.' + answer);
  });
  it('lets an existing Guardian take a dated finding back to the desk without receiving a second seal', () => {
    const d = new Driver();
    d.s.inventory['item.gold-seal'] = 1;
    d.s.flags['chapter.done'] = true;
    d.s.flags['seal.found'] = true;
    d.talk('kip-arden', 'first rubbing', 'Put the hour inside');
    d.talk('warden-ise', 'older finding', 'public hatch');
    expect(d.s.inventory['item.gold-seal']).toBe(1);
    expect(d.s.flags['hatch.custody']).toBe('rail');
  });
  it('compares controlled knocks with a quiet patch of historical evidence and can recover after changing two things', () => {
    const d = new Driver();
    enterStudy(d);
    expect(() => move(d, { work: 'lay' })).toThrow('wrapper');
    expect(() => move(d, { work: 'clip', sleeve: 'words' })).toThrow('folded');
    move(d, { work: 'strike', surface: 'brass', listener: 'peg', tooth: true });
    move(d, { work: 'strike', surface: 'brass', listener: 'table', tooth: false });
    expect(heldPair(d.s)).toBe(false);
    expect(() => move(d, { work: 'probe', box: 'boot' })).toThrow('table');
    move(d, { work: 'strike', surface: 'brass', listener: 'table', tooth: true });
    expect(heldPair(d.s)).toBe(true);
    expect(hatchReading('brass', 'table', false).trace).toBe('quiet');
    expect(hatchReading('brass', 'table', true).trace).toBe('ring');
    expect(hatchReading('board', 'peg', false).trace).toBe('felt');
    expect(hatchReading('brass', 'peg', false).trace).toBe('click');
    move(d, { work: 'probe', box: 'boot' });
    expect(() => move(d, { work: 'reveal' })).toThrow('each pocket');
    move(d, { work: 'probe', box: 'apron' });
    move(d, { work: 'reveal' });
    expect(d.done('hatch.absence')).toBe(true);
    expect(
      d.s.adventureDiary.entries.some((e) =>
        e.text.includes('nobody had checked whether her knock could reach'),
      ),
    ).toBe(true);
  });
  for (const edition of sleeves)
    it.each(['print', 'read', 'pair'])(
      'sends ' + sleeveLabels[edition] + ' to the %s packet and lets the next caller answer',
      (packet) => {
        const d = new Driver();
        prepare(d);
        move(d, { work: 'clip', sleeve: edition });
        expect(issuedSleeve(d.s)).toBe(edition);
        expect(d.done('hatch.read') && d.done('hatch.control') && d.done('hatch.issue')).toBe(true);
        const rack = MAPS[hatchHall].interactables.find((x) => x.id === 'hatch-readers')!;
        expect(check(rack.visibleIf, d.s)).toBe(false);
        expect(() => move(d, { work: 'receive' })).toThrow('installed');
        d.s.mapId = hatchHall;
        d.s.flags['nile.dispatch'] = packet;
        d.s.flags['nile.returned'] = true;
        expect(check(rack.visibleIf, d.s)).toBe(true);
        expect(() => move(d, { work: 'visitor' })).toThrow('first reader');
        move(d, { work: 'receive' });
        move(d, { work: 'visitor' });
        expect(d.s.flags['hatch.packet']).toBe(packet);
        expect(d.done('hatch.return')).toBe(true);
        expect(
          d.s.adventureDiary.entries.some(
            (e) => e.event?.key === 'hatch-sleeve:receive.' + edition + '.' + packet,
          ),
        ).toBe(true);
        d.s.mapId = hatchStudy;
        move(d, { work: 'clip', sleeve: sleeves.find((e) => e !== edition)! });
        d.s.mapId = hatchHall;
        expect(() => move(d, { work: 'visitor' })).toThrow('first reader');
      },
    );
  it('meets the six-concept course floor across the entire modeled story itinerary at both widths', () => {
    const { pack } = new Driver().e;
    const { duration, encounters } = estimatedCourseEncounters(
      playPath(pack, 'story'),
      courseTags(pack),
    );
    const route = auditCourseFloor(duration, encounters);
    expect(route.rolling.map((w) => [w.width, w.minutesWithGap])).toEqual([
      [20, 0],
      [30, 0],
    ]);
  });
});
