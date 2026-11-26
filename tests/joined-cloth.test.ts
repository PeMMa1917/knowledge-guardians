import { describe, expect, it } from 'vitest';
import { RELAY_CASES } from '../src/content/relayCases';
import {
  JOINED_CLOTH_DESTINATION, JOINED_CLOTH_KEY, JOINED_CLOTH_OBJECTIVE, JOINED_CLOTH_SOURCE, JOINED_CLOTH_USED,
  JOINT_LOADS, JOINT_SUPPORTS, comparedJointTrials, jointReceipt, jointTrial, jointTrialFlag,
} from '../src/domain/joinedCloth';
import { check } from '../src/domain/rules';
import { relayMove } from '../src/domain/specimenRelay';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { JOINED_CLOTH_FRAME, JOINED_CLOTH_LEDGE, JOINED_CLOTH_RACK } from '../src/maps/joinedCloth';
import { Driver } from './driver';

const record = RELAY_CASES.find(({ source }) => source === JOINED_CLOTH_SOURCE)!;

function earnRelay(d: Driver) {
  d.s.objectivesDone.push('sea.arrival');
  d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
  const move = (action: Parameters<typeof relayMove>[2]) => {
    const effect = relayMove(record.key, d.s.flags, action)!;
    d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
  };
  move({ type: 'thread', first: 'record' });
  move({ type: 'trial', weather: 'still' });
  move({ type: 'trial', weather: 'gust' });
  move({ type: 'send', channel: 'trace' });
  move({ type: 'reunite', channel: 'trace' });
  expect(d.done(record.objective)).toBe(true);
}

describe('The Two Supports', () => {
  it('holds the packet constant and compares travel and clearance at the two positions', () => {
    expect(jointTrial('beam', 'centre')).toEqual({ travel: 1, clears: true });
    expect(jointTrial('separate', 'centre')).toEqual({ travel: 1, clears: true });
    expect(jointTrial('beam', 'edge')).toEqual({ travel: 5, clears: false });
    expect(jointTrial('separate', 'edge')).toEqual({ travel: 3, clears: true });
    expect(jointReceipt('rack', 'edge')).toMatchObject({ clears: false, arrives: false });
    expect(jointReceipt('rack', 'centre')).toMatchObject({ clears: true, arrives: true });
    expect(jointReceipt('ledge', 'centre')).toMatchObject({ clears: true, arrives: false });
    expect(jointReceipt('ledge', 'edge')).toMatchObject({ clears: true, arrives: true });
  });

  it('preserves the exact record and opens the normal Island fixture after earning and equipping', () => {
    const d = new Driver();
    const exhibit = d.e.pack.exhibits.find(({ id }) => id === record.exhibit)!;
    expect(exhibit.specimen).toMatchObject({ key: JOINED_CLOTH_KEY, source: JOINED_CLOTH_SOURCE,
      pixelAsset: record.asset, objective: 'relay.hawaii-join.received', revisit: { map: 'island.dock', prop: JOINED_CLOTH_FRAME.id } });
    expect(exhibit.summary).toContain('Probably mulberry bark');
    expect(MAPS['island.dock'].interactables).toContain(JOINED_CLOTH_FRAME);
    expect(check(JOINED_CLOTH_FRAME.visibleIf, d.s)).toBe(false);
    earnRelay(d);
    d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
    expect(check(JOINED_CLOTH_FRAME.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(JOINED_CLOTH_KEY) });
    expect(check(JOINED_CLOTH_FRAME.visibleIf, d.s)).toBe(true);
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(check(JOINED_CLOTH_FRAME.visibleIf, d.s)).toBe(false);
  });

  it.each([
    ['rack', JOINED_CLOTH_RACK, 'ledge', JOINED_CLOTH_LEDGE],
    ['ledge', JOINED_CLOTH_LEDGE, 'rack', JOINED_CLOTH_RACK],
  ] as const)('requires four trials and a matching %s receiver', (destination, prop, other, otherProp) => {
    const d = new Driver();
    earnRelay(d);
    const set = (flag: string, value: boolean | string) => d.run({ type: 'SetFlag', flag, value });
    expect(check(prop.visibleIf, d.s)).toBe(false);
    for (const support of JOINT_SUPPORTS) for (const load of JOINT_LOADS) {
      if (support === 'separate' && load === 'edge') continue;
      set(jointTrialFlag(support, load), true);
    }
    expect(comparedJointTrials(d.s.flags)).toBe(false);
    set(JOINED_CLOTH_DESTINATION, destination);
    set(JOINED_CLOTH_USED, other);
    expect(d.done(JOINED_CLOTH_OBJECTIVE)).toBe(false);
    set(jointTrialFlag('separate', 'edge'), true);
    expect(comparedJointTrials(d.s.flags)).toBe(true);
    expect(check(prop.visibleIf, d.s)).toBe(true);
    expect(check(otherProp.visibleIf, d.s)).toBe(false);
    expect(d.done(JOINED_CLOTH_OBJECTIVE)).toBe(false);
    set(JOINED_CLOTH_USED, destination);
    expect(check(prop.artOpen?.if, d.s)).toBe(true);
    expect(d.done(JOINED_CLOTH_OBJECTIVE)).toBe(true);
    expect(d.s.journal.filter((id) => id === `j.${JOINED_CLOTH_OBJECTIVE}`)).toHaveLength(1);
  });
});
