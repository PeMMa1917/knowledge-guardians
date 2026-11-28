import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const settings = ['fields', 'split', 'channel'] as const;
const choices = {
  fields: { first: 'Send seven to the rows', revised: 'Run the repaired gate for the rows' },
  split: { first: 'Split it five and five', revised: 'Keep two more in the lower channel' },
  channel: { first: 'Give the lower channel seven', revised: 'Send the repaired flow first' },
};

function read(d: Driver, id: string): void {
  const item = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && prop.kind === 'sign');
  if (!item?.flag || !check(item.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function enter(): Driver {
  const d = new Driver();
  const gate = MAPS['nexus.archive'].interactables.find((item) => item.id === 'water-door')!;
  expect(check(gate.visibleIf, d.s)).toBe(false);
  d.resumeAfter('market.finish');
  expect(check(gate.visibleIf, d.s)).toBe(true);
  d.s.mapId = gate.to!.map;
  d.run({ type: 'SetFlag', flag: gate.flag!, value: true });
  expect(d.done('water.arrival')).toBe(true);
  return d;
}

describe('The Agreement at the Weir', () => {
  const plans = settings.flatMap((first) => settings.map((revised) => ({ first, revised })));
  it.each(plans)('keeps the $first drought order beside the $revised revised order', ({ first, revised }) => {
    const d = enter();
    const reserve = settings.find((setting) => setting !== first)!;
    const untested = settings.find((setting) => setting !== first && setting !== reserve)!;
    d.run({ type: 'RunWaterTrial', setting: first });
    d.run({ type: 'RunWaterTrial', setting: first });
    expect(d.done('water.drought')).toBe(false);
    d.run({ type: 'RunWaterTrial', setting: reserve });
    expect(d.done('water.drought')).toBe(true);

    d.s.mapId = 'water.lower-channel';
    read(d, 'water-farm-card');
    expect(d.done('water.needs')).toBe(false);
    read(d, 'water-channel-marker');
    expect(d.done('water.needs')).toBe(true);

    d.s.mapId = 'water.council';
    expect(d.e.visibleOptions('water.scribe.agree', d.s).some(({ option }) =>
      option.text.startsWith(choices[untested].first))).toBe(false);
    d.talk('water-scribe', choices[first].first);
    expect(d.done('water.publish')).toBe(true);
    expect(d.s.flags['water.response']).toBe(first);
    expect(d.e.talkEntry('water-keeper', d.s)).toBe('water.keeper.wait-repair');
    read(d, 'water-repair-note');

    d.s.mapId = 'water.gatehouse';
    d.talk('water-keeper', 'Fit the repaired gate');
    expect(d.done('water.repair')).toBe(true);
    for (const s of settings.filter((setting) => setting !== first)) {
      d.run({ type: 'RunWaterTrial', setting: s });
    }
    expect(d.done('water.retest')).toBe(false);
    d.run({ type: 'RunWaterTrial', setting: first });
    expect(d.done('water.retest')).toBe(true);
    expect(d.e.talkEntry('water-scribe', d.s)).toBe('water.scribe.audit');

    d.s.mapId = 'water.council';
    read(d, 'water-contested-slip');
    d.talk('water-scribe', choices[revised].revised);
    expect(d.done('water.finish')).toBe(true);
    expect(d.s.flags['water.response']).toBe(first);
    expect(d.s.flags['water.revision']).toBe(revised);
    expect(MAPS['water.council'].interactables
      .filter((prop) => /^water-(result|revised)-/.test(prop.id) && check(prop.visibleIf, d.s))
      .map((prop) => prop.id)).toEqual([`water-result-${first}`, `water-revised-${revised}`]);
    expect(d.p.credit['credit.water.publish']).toBe(8);
    expect(d.p.credit['credit.water.finish']).toBe(8);

    d.talk('water-scribe', 'Leave a wider register copy');
    expect(d.done('water.register')).toBe(true);
  });

  it('lets players bring their Emberford observation method without requiring the side quest', () => {
    const d = enter();
    d.s.objectivesDone.push('water.publish');
    d.s.flags['water.repair.read'] = true;
    const transfer = (driver: Driver) => driver.e.visibleOptions('water.keeper.fit', driver.s)
      .find(({ option }) => option.next === 'water.keeper.washhouse');
    expect(transfer(d)).toBeUndefined();
    d.s.flags['washhouse.order'] = 'step';
    expect(transfer(d)).toBeUndefined();
    d.s.objectivesDone.push('washhouse.o.recheck');
    expect(transfer(d)).toBeDefined();
    d.talk('water-keeper', 'I followed the water', 'Fit the repaired gate');
    expect(d.s.flags['water.repaired']).toBe(true);
  });
});
