import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const register = MAPS['copies.archive'].interactables.find((prop) => prop.id === 'copies-admission-register')!;
const desk = MAPS['copies.landing'].interactables.find((prop) => prop.id === 'copies-transfer-desk')!;
const lines = MAPS['copies.landing'].interactables.filter((prop) => prop.id.startsWith('copies-transfer-') && prop !== desk);

describe('A Rule by the Door', () => {
  it.each([
    ['door', 'Post the signed admission line'],
    ['queue', 'Send the rule and the slip’s purpose'],
  ])('checks the signed register and leaves the %s copy alongside existing City work', (route, choose) => {
    const d = new Driver();
    d.s.flags['copies.followup'] = true;
    d.s.flags['copies.response'] = 'strip';
    d.s.flags['copies.source'] = true;
    d.s.flags['stage.response'] = 'move';
    d.s.objectivesDone.push('copies.revise', 'stage.finish');
    expect(check(register.visibleIf, d.s)).toBe(false);
    d.s.mapId = 'stage.gallery';
    d.talk('stage-host', 'Take the doorstep question');
    expect(check(register.visibleIf, d.s)).toBe(true);
    expect(check(desk.visibleIf, d.s)).toBe(false);

    d.s.mapId = 'copies.archive';
    d.run({ type: 'SetFlag', flag: register.flag!, value: true });
    expect(d.done('stage.transfer.check')).toBe(true);
    expect(check(desk.visibleIf, d.s)).toBe(true);

    d.s.mapId = 'copies.landing';
    d.walk(desk.node!, [choose]);
    expect(d.done('stage.transfer.copy')).toBe(true);
    expect(check(desk.visibleIf, d.s)).toBe(false);
    expect(lines.filter((prop) => check(prop.visibleIf, d.s)).map((prop) => prop.id))
      .toEqual([`copies-transfer-${route}-line`]);
    expect(d.s.flags['copies.response']).toBe('strip');
    expect(d.s.flags['copies.followup']).toBe(true);
    expect(d.s.flags['stage.response']).toBe('move');
  });
});
