import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import {
  OPEN_PLACE_CANAL, OPEN_PLACE_CANAL_ACTORS, OPEN_PLACE_COUNCIL, OPEN_PLACE_COUNCIL_ACTORS, OPEN_PLACE_COUNCIL_INTAKE,
  OPEN_PLACE_DISPATCH, OPEN_PLACE_STEPS, OPEN_PLACE_STEPS_ACTORS,
} from '../src/maps/openPlace';
import { Driver } from './driver';

const scope = 'open.place.';
const docket = 'item.open-place-docket';
const dissent = 'Keep corrections open until our shift can reply.';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function actor(d: Driver, id: string) {
  const person = MAPS[d.s.mapId].npcs.find((entry) => entry.id === 'open-place-' + id);
  return !!person && check(person.visibleIf, d.s);
}

function talk(d: Driver, id: string, action: string) {
  expect(actor(d, id), id).toBe(true);
  d.talk('open-place-' + id, action);
}

function read(d: Driver, id: string, action: string) {
  const prop = visible(d, 'open-place-' + id);
  expect(prop?.node, id).toBeDefined();
  d.walk(prop!.node!, [action]);
}

function cross(d: Driver, id: string) {
  const prop = visible(d, id);
  expect(prop?.to, id).toBeDefined();
  expect(check(prop?.openIf, d.s)).toBe(true);
  d.s.mapId = prop!.to!.map;
  if (prop?.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function prepare(d: Driver) {
  d.resumeAfter('water.finish');
  cross(d, 'civic-door');
  expect(visible(d, 'open-place-draft')).toBeUndefined();
  d.resumeAfter('civic.finish');
  read(d, 'draft', 'Take the first-bell invitation');
  cross(d, 'civic-steps-path');
  expect(actor(d, 'blythe')).toBe(true);
  expect(actor(d, 'ione')).toBe(false);
  read(d, 'empty', 'Mark the empty place');
  expect(d.done(scope + 'miss')).toBe(true);
  talk(d, 'blythe', 'Keep Blythe’s printing request');
  cross(d, 'civic-steps-to-canal');
  talk(d, 'ione', 'Keep Ione’s signed dissent');
  expect(d.e.node(scope + 'ione.first').text).toContain(dissent);
  cross(d, 'civic-canal-return');
  expect(visible(d, 'open-place-retime')).toBeUndefined();
  cross(d, 'civic-canal-path');
  read(d, 'shift', 'Clip the two signed handover marks');
  cross(d, 'civic-canal-return');
  read(d, 'retime', 'Move the practice call');
  expect(d.s.inventory[docket]).toBeUndefined();
  cross(d, 'civic-steps-path');
  talk(d, 'blythe', 'Record Blythe’s second-bell reply');
  talk(d, 'ione', 'Record Ione’s later attendance');
  expect(visible(d, 'open-place-first-attendance')?.text).toContain('invited and absent');
  cross(d, 'civic-steps-return');
  read(d, 'file', 'Bind both attendance lines');
  expect(d.s.inventory[docket]).toBe(1);
  expect(d.done(scope + 'retest')).toBe(true);
  cross(d, 'civic-nexus-return');
}

describe('The Place Left Open', () => {
  it('keeps the ordinary Council gate and both voices in the physically checked retest', () => {
    const d = new Driver();
    prepare(d);
    expect(visible(d, 'council-door')).toBeUndefined();
    expect(d.s.journal).toContain('j.open.place.retest');
  });

  it('takes the same signed dissent through distinct participants, documents and return paths with equal credit', () => {
    const marks = (['hearing', 'written'] as const).map((mode) => {
      const d = new Driver();
      prepare(d);
      d.resumeAfter('island.finish');
      cross(d, 'council-door');
      read(d, 'intake', mode === 'hearing' ? 'Book the second-bell public hearing' : 'Arrange the signed witness pocket');
      cross(d, 'council-gallery-path');
      expect(actor(d, 'blythe')).toBe(mode === 'hearing');
      expect(actor(d, 'ione')).toBe(mode === 'hearing');
      expect(actor(d, 'edvin')).toBe(mode === 'written');
      expect(visible(d, 'open-place-post.' + mode)).toBeUndefined();
      if (mode === 'hearing') {
        talk(d, 'blythe', 'Record Blythe’s public printing reply');
        expect(visible(d, 'open-place-post.hearing')).toBeUndefined();
        talk(d, 'ione', 'Record Ione’s public dissent');
      } else {
        expect(d.e.node(scope + 'written.check').text).toContain('names stay under the inner flap');
        talk(d, 'edvin', 'Check both signatures');
      }
      expect(d.e.node(scope + 'post.' + mode).text).toContain(dissent);
      read(d, 'post.' + mode, mode === 'hearing' ? 'Send the open minutes' : 'Send the written receipt');
      expect(d.done(scope + 'channel')).toBe(true);
      expect(d.done(scope + 'return')).toBe(false);
      expect(d.s.inventory[docket]).toBe(1);
      cross(d, 'council-gallery-return');
      cross(d, 'council-nexus-return');
      cross(d, 'civic-door');
      cross(d, mode === 'hearing' ? 'civic-steps-path' : 'civic-canal-path');
      read(d, 'return.' + mode, mode === 'hearing' ? 'Leave a return slip' : 'Keep both the public summary');
      expect(d.done(scope + 'return')).toBe(true);
      expect(visible(d, 'open-place-' + mode + '-return')).toBeDefined();
      expect(d.s.journal).toContain('j.open.place.return');
      expect(d.s.flags['ending.council']).toBeUndefined();
      return d.p.credit;
    });
    expect(marks[0]).toEqual(marks[1]);
  });

  it.each([
    ['civic.dispatch', OPEN_PLACE_DISPATCH, []],
    ['civic.steps', OPEN_PLACE_STEPS, OPEN_PLACE_STEPS_ACTORS],
    ['civic.canal', OPEN_PLACE_CANAL, OPEN_PLACE_CANAL_ACTORS],
    ['council.hall', [OPEN_PLACE_COUNCIL_INTAKE], []],
    ['council.gallery', OPEN_PLACE_COUNCIL, OPEN_PLACE_COUNCIL_ACTORS],
  ] as const)('reserves separate physical spaces from existing objects and actors in %s', (mapId, props, actors) => {
    const map = MAPS[mapId];
    for (const target of [...props, ...actors]) {
      const strangers = [...map.interactables, ...map.npcs].filter(({ id, x, y, ...other }) =>
        !id.startsWith('open-place-') && target.x >= x && target.x < x + ('w' in other ? other.w : 1)
        && target.y >= y && target.y < y + ('h' in other ? other.h : 1),
      );
      expect(strangers.map(({ id }) => id), target.id).toEqual([]);
    }
  });
});
