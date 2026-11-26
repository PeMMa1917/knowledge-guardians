import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { validateContent } from '../src/domain/validate';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const room = MAPS['preserved.royal'];
const prop = (id: string) => room.interactables.find((item) => item.id === `preserved-scale-${id}`)!;

function start() {
  const d = new Driver();
  d.s.mapId = room.id;
  d.s.inventory['tool.provenance-thread'] = 1;
  d.run({ type: 'SetFlag', flag: 'preserved.arrived', value: true });
  return d;
}

describe('The Space Between Stops', () => {
  it('keeps the bracket and physical pegs on one straight path of two and six paving strips', () => {
    const zero = prop('board');
    expect(prop('near')).toMatchObject({ x: zero.x + 2, y: zero.y });
    expect(prop('far')).toMatchObject({ x: zero.x + 6, y: zero.y });
    for (let x = zero.x; x <= zero.x + 6; x += 1) {
      expect(room.floor(x, zero.y)).toBe('stone-c');
      expect(room.blocks.some(([bx, by, w, h]) => x >= bx && x < bx + w && zero.y >= by && zero.y < by + h)).toBe(false);
      expect(room.interactables.some((item) => !item.walkThrough && x >= item.x && x < item.x + item.w
        && zero.y >= item.y && zero.y < item.y + item.h)).toBe(false);
    }
    expect(validateContent(new Driver().e.pack)).toEqual([]);
  });

  it.each([
    ['floor', 'Clip a measured floor guide', 'loads the nearer parcel first'],
    ['file', 'File a', 'leaves the distance blank'],
  ] as const)('opens a checked %s handover after a recoverable draft', (result, pick, feedback) => {
    const d = start();
    expect(check(prop('board').visibleIf, d.s)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-PRES-RAM-CUSTODY' });
    expect(check(prop('board').visibleIf, d.s)).toBe(false);
    for (const node of ['burial', 'cache', 'catalogue']) d.run({ type: 'FollowThread', thread: 'preserved-royal', node });
    expect(check(prop('board').visibleIf, d.s)).toBe(true);
    expect(d.done('preserved.royal')).toBe(false);
    expect(d.e.visibleOptions(prop('board').node!, d.s).some(({ option }) => option.next === 'preserved.scale.choose')).toBe(false);

    d.walk(prop('board').node!, ['Copy the equal spacing', 'Leave the draft']);
    expect(d.s.flags['preserved.scale.draft']).toBe(true);
    expect(check(prop('near').visibleIf, d.s)).toBe(false);
    d.walk(prop('board').node!, ['Set zero at the bracket']);
    for (const id of ['far', 'near']) {
      expect(check(prop(id).visibleIf, d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: prop(id).flag!, value: true });
      expect(d.done('preserved.scale.compare')).toBe(id === 'near');
    }
    d.walk(prop('board').node!, ['Put the two floor readings', pick]);
    expect(d.s.flags['preserved.scale.outcome']).toBe(result);
    expect(d.done('preserved.scale.receive')).toBe(false);
    expect(check(prop(result).visibleIf, d.s)).toBe(true);
    expect(check(prop(result === 'floor' ? 'file' : 'floor').visibleIf, d.s)).toBe(false);
    expect(prop(result).text).toContain(feedback);
    d.run({ type: 'SetFlag', flag: prop(result).flag!, value: true });
    expect(d.done('preserved.scale.receive')).toBe(true);
    expect(d.done('preserved.royal')).toBe(false);
    expect(d.done('preserved.publish')).toBe(false);
  });
});
