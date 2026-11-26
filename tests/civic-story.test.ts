import { describe, expect, it } from 'vitest';
import { CIVIC_ARRIVAL_TRAYS, civicReceivingArrangements, civicReceivingLoad } from '../src/domain/civicArrivals';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const rules = ['rank', 'reserve', 'even'] as const;
const choices = {
  rank: 'Send all four windows',
  reserve: 'Leave one starting window',
  even: 'Give each district two windows',
};
const revisions = {
  evening: 'Leave an evening request stop',
  walk: 'Give the walking crew a place-and-time line',
};

function visit(d: Driver, id: string): void {
  const door = MAPS[d.s.mapId].interactables.find((item) => item.kind === 'door' && item.id === id);
  if (!door?.to || !check(door.visibleIf, d.s) || !check(door.openIf, d.s)) {
    throw new Error(`Cannot use ${id} here`);
  }
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function read(d: Driver, id: string): void {
  const item = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'sign' && p.id === id);
  if (!item?.flag || !check(item.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function visible(d: Driver, id: string): boolean {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return !!prop && check(prop.visibleIf, d.s);
}

function scene(d: Driver, id: string, ...choices: string[]): void {
  const item = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'scene' && p.id === id);
  if (!item?.node || !check(item.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  d.walk(item.node, choices);
}

describe('A Place on the Route', () => {
  const routes = rules.flatMap((rule) =>
    (['evening', 'walk'] as const).map((revision) => ({ rule, revision })));

  it.each(routes)('publishes $rule and opens the $revision follow-up with equal credit', ({ rule, revision }) => {
    const d = new Driver();
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH12-M01')).toBe(false);
    d.s.objectivesDone.push('water.finish');
    visit(d, 'civic-door');
    expect(d.done('civic.arrival')).toBe(true);
    d.run({ type: 'RunCivicTrial', sample: 'desk', rule });
    expect(d.done('civic.compare')).toBe(false);

    visit(d, 'civic-steps-path');
    expect(visible(d, 'civic-ledger-draft')).toBe(true);
    expect(visible(d, 'civic-ledger-checked')).toBe(false);
    read(d, 'civic-desk-slip');
    expect(d.done('civic.sources')).toBe(false);
    visit(d, 'civic-steps-to-canal');
    expect(visible(d, 'civic-reader-note')).toBe(false);
    read(d, 'civic-walk-slip');
    expect(d.done('civic.sources')).toBe(true);
    visit(d, 'civic-canal-return');

    const other = rules.find((candidate) => candidate !== rule)!;
    const untested = rules.find((candidate) => candidate !== other && candidate !== rule)!;
    d.run({ type: 'RunCivicTrial', sample: 'combined', rule: other });
    expect(d.done('civic.compare')).toBe(false);
    d.run({ type: 'RunCivicTrial', sample: 'combined', rule });
    expect(d.done('civic.compare')).toBe(true);
    expect(d.done('civic.rules')).toBe(true);
    expect(d.e.visibleOptions('civic.clerk.choose', d.s).some(({ option }) =>
      option.text.startsWith(choices[untested]))).toBe(false);

    visit(d, 'civic-steps-path');
    expect(visible(d, 'civic-ledger-draft')).toBe(false);
    expect(visible(d, 'civic-ledger-checked')).toBe(true);
    d.talk('civic-clerk', choices[rule]);
    expect(d.done('civic.publish')).toBe(true);
    expect(d.s.flags['civic.response']).toBe(rule);
    expect(d.e.talkEntry('civic-clerk', d.s)).toBe('civic.clerk.wait');
    const results = () => MAPS['civic.steps'].interactables
      .filter((prop) => prop.id.startsWith('civic-result-') && check(prop.visibleIf, d.s))
      .map((prop) => prop.id);
    expect(results()).toEqual([`civic-result-${rule}`]);

    visit(d, 'civic-steps-to-canal');
    read(d, 'civic-reader-note');
    expect(d.done('civic.reader')).toBe(true);
    visit(d, 'civic-canal-to-steps');
    d.talk('civic-clerk', revisions[revision]);
    expect(d.done('civic.finish')).toBe(true);
    expect(d.s.flags['civic.revision']).toBe(revision);
    expect(d.s.flags['civic.response']).toBe(rule);
    expect(results()).toEqual([`civic-result-${rule}`]);
    expect(visible(d, 'civic-revised')).toBe(true);
    expect(d.p.credit['credit.civic.publish']).toBe(8);
    expect(d.p.credit['credit.civic.finish']).toBe(8);

    d.talk('civic-clerk', 'Leave a wider route notice');
    expect(d.done('civic.access')).toBe(true);
    expect(d.e.talkEntry('civic-clerk', d.s)).toBe('civic.clerk.copy-ready');
    expect(visible(d, 'civic-wide-notice')).toBe(true);
    visit(d, 'civic-steps-to-canal');
    expect(visible(d, 'civic-evening-call')).toBe(revision === 'evening');
    expect(visible(d, 'civic-route-log')).toBe(revision === 'walk');
  });

  it('recalls the Nexus waiting tally only for a player who actually checked it', () => {
    const d = new Driver();
    d.s.objectivesDone.push('water.finish', 'civic.reader');
    d.s.flags['civic.response'] = 'even';
    const recall = () => d.e.visibleOptions('civic.clerk.review', d.s)
      .find(({ option }) => option.next === 'civic.review.nexus');
    expect(recall()).toBeUndefined();
    d.s.flags['nexus.rest.used'] = true;
    expect(recall()).toBeDefined();
    d.talk('civic-clerk', 'I kept a separate waiting tally', revisions.walk);
    expect(d.s.flags['civic.revised']).toBe(true);
    expect(d.s.flags['civic.response']).toBe('even');
  });
});

describe('Three Loads, Four Marks', () => {
  it('counts each ordered arrival and distinguishes open marks from waiting loads', () => {
    expect(civicReceivingLoad(CIVIC_ARRIVAL_TRAYS.red)).toEqual({ waiting: 1, free: 2 });
    expect(civicReceivingLoad(CIVIC_ARRIVAL_TRAYS.blue)).toEqual({ waiting: 0, free: 1 });
    const marks = [1, 2, 3, 4] as const;
    const trays = marks.flatMap((a) => marks.flatMap((b) => marks.map((c) => [a, b, c] as const)));
    const separate = trays.filter((tray) => civicReceivingLoad(tray).waiting === 0).length;
    expect(civicReceivingArrangements()).toEqual({ all: trays.length, separate, shared: trays.length - separate });
    expect(civicReceivingArrangements()).toEqual({ all: 64, separate: 24, shared: 40 });
  });

  it.each([
    { layout: 'buffer', choice: 'Ask a helper', first: 'red', second: 'blue', path: 'civic-canal-path' },
    { layout: 'stagger', choice: 'Give the three couriers', first: 'blue', second: 'red', path: 'civic-steps-path' },
  ])('keeps a $layout practice run separate from the published route', ({ layout, choice, first, second, path }) => {
    const d = new Driver();
    d.s.objectivesDone.push('water.finish');
    visit(d, 'civic-door');
    expect(visible(d, 'civic-overlap-rack')).toBe(false);
    expect(visible(d, 'civic-overlap-plan')).toBe(false);
    scene(d, `civic-overlap-${first}`, 'Leave the clips');
    expect(visible(d, `civic-overlap-${first}`)).toBe(true);
    scene(d, `civic-overlap-${first}`, 'Unclip the three slips');
    expect(visible(d, `civic-overlap-${first}-loaded`)).toBe(true);
    expect(visible(d, `civic-overlap-${first}`)).toBe(false);
    expect(visible(d, 'civic-overlap-rack')).toBe(false);
    scene(d, `civic-overlap-${second}`, 'Unclip the three slips');
    expect(d.done('civic.overlap.trays')).toBe(true);
    scene(d, 'civic-overlap-rack', 'Start filling the rack', 'Leave the rows');
    expect(visible(d, 'civic-overlap-count')).toBe(false);
    scene(d, 'civic-overlap-rack', 'Start filling the rack', 'Group the remaining rows');
    expect(visible(d, 'civic-overlap-count')).toBe(true);
    expect(visible(d, 'civic-overlap-plan')).toBe(false);
    visit(d, 'civic-canal-path');
    read(d, 'civic-overlap-local');
    expect(d.done('civic.overlap.evidence')).toBe(true);
    visit(d, 'civic-canal-return');
    scene(d, 'civic-overlap-plan', choice);
    expect(visible(d, 'civic-overlap-plan')).toBe(false);
    expect(d.done('civic.overlap.finish')).toBe(false);
    visit(d, path);
    expect(visible(d, `civic-overlap-${layout}`)).toBe(true);
    read(d, `civic-overlap-${layout}`);
    expect(d.done('civic.overlap.finish')).toBe(true);
    expect(d.s.flags['civic.overlap.layout']).toBe(layout);
    expect(d.done('civic.publish')).toBe(false);
    expect(d.done('civic.finish')).toBe(false);
    expect(d.p.credit['credit.civic.finish']).toBeUndefined();
  });
});
