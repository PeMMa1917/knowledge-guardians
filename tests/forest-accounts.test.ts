import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const community = 'forest.community';
const prefix = 'forest.account-copy';
const layouts = [
  {
    mode: 'words',
    report: 'Keep the crews’ own words',
    send: 'Fold the crew’s own words',
    handover: 'Hang the fold',
    response: 'hooks a listening stop',
    receipt: 'The lookout count line is blank',
  },
  {
    mode: 'lines',
    report: 'Give heard and seen notes',
    send: 'Make separate heard and seen lines',
    handover: 'Fit the card',
    response: 'puts the one mark under Seen',
    receipt: 'one pass on the walker’s signed lookout slip',
  },
] as const;

function prop(id: string, map = community) {
  const target = MAPS[map].interactables.find((entry) => entry.id === id);
  if (!target) throw new Error(`Missing ${id} in ${map}`);
  return target;
}

function enterClearing(d: Driver) {
  d.resumeAfter('coast.revise');
  const crossing = prop('forest-door', 'nexus.archive');
  expect(check(crossing.visibleIf, d.s)).toBe(true);
  d.s.mapId = crossing.to!.map;
  d.run({ type: 'SetFlag', flag: crossing.flag!, value: true });
  const path = prop('forest-community-path', d.s.mapId);
  expect(check(path.openIf, d.s)).toBe(true);
  d.s.mapId = path.to!.map;
}

function hasProp(d: Driver, id: string) {
  return check(prop(id).visibleIf, d.s);
}

function use(d: Driver, id: string, ...choices: string[]) {
  expect(d.s.mapId).toBe(community);
  const target = prop(id);
  expect(check(target.visibleIf, d.s)).toBe(true);
  d.walk(target.node!, choices);
}

function readRouteBook(d: Driver) {
  d.run({ type: 'SetFlag', flag: prop('forest-pathbook').flag!, value: true });
}

function roundTrip(d: Driver) {
  const text = serialisePair(writeSuspend(emptyPair(), {
    kind: 'suspend', label: 'Bridge Clearing', location: 'Bridge Clearing',
    savedAt: '2026-01-01T00:00:00.000Z', state: d.s,
  }));
  const result = parsePair(text);
  if (!result.ok || !result.pair.continue) throw new Error('Campaign did not reopen.');
  d.s = result.pair.continue.state;
}

describe('What the Wings Left', () => {
  it('requires the route book, an actual account, both records and a carried copy', () => {
    const d = new Driver();
    enterClearing(d);
    expect(hasProp(d, 'forest-account-copy')).toBe(false);
    readRouteBook(d);
    expect(hasProp(d, 'forest-account-copy')).toBe(false);
    d.talk('forest-steward', layouts[0].report);
    expect(hasProp(d, 'forest-account-copy')).toBe(true);
    expect(d.e.visibleOptions(prefix + '.compare', d.s).map(({ option }) => option.text))
      .toEqual(['Leave both records in their pockets.']);
    use(d, 'forest-account-copy', 'Lift the lamp crew’s slip', 'Close the cover');
    expect(d.s.flags[prefix + '.lamp']).toBe(true);
    expect(d.s.flags[prefix + '.compared']).toBeUndefined();
    expect(d.e.visibleOptions(prefix + '.compare', d.s)).toHaveLength(1);
    use(d, 'forest-account-copy', 'Lift the lamp crew’s slip', 'Unfold the lookout’s card', 'Leave both records');
    expect(d.s.flags[prefix + '.compared']).toBe(true);
    expect(hasProp(d, 'forest-account-receive-words')).toBe(false);
    expect(hasProp(d, 'forest-account-receive-lines')).toBe(false);
    expect(d.done(prefix + '.readback')).toBe(false);
    expect(d.s.flags['forest.report']).toBe(true);
  });

  it.each(layouts)('carries only the $mode copy and preserves its distinct use across Continue', (layout) => {
    const d = new Driver();
    enterClearing(d);
    readRouteBook(d);
    d.talk('forest-steward', layout.report);
    expect(d.s.flags['forest.report']).toBe(true);
    expect(d.s.flags['forest.account.layout']).toBe(layout.mode);
    expect(d.done('forest.account')).toBe(true);
    expect(d.e.talkEntry('forest-steward', d.s)).toBe('forest.steward.revisit');

    use(d, 'forest-account-copy', 'Lift the lamp crew’s slip', 'Unfold the lookout’s card', 'Leave both');
    const other = layouts.find(({ mode }) => mode !== layout.mode)!;
    expect(d.e.visibleOptions(prefix + '.compare', d.s).map(({ option }) => option.text))
      .not.toContainEqual(expect.stringContaining(other.send));
    use(d, 'forest-account-copy', 'Lift the lamp crew’s slip', 'Unfold the lookout’s card', layout.send);
    const carried = `item.${prefix}.${layout.mode}`;
    expect(d.s.inventory[carried]).toBe(1);
    expect(hasProp(d, 'forest-account-copy')).toBe(false);
    expect(hasProp(d, 'forest-account-receive-' + other.mode)).toBe(false);
    expect(d.e.visibleOptions(prefix + '.receive.' + other.mode, d.s)).toHaveLength(1);
    expect(d.done(prefix + '.readback')).toBe(false);
    roundTrip(d);

    use(d, 'forest-account-receive-' + layout.mode, 'my satchel for now');
    expect(d.s.inventory[carried]).toBe(1);
    expect(d.p.skills['SK-MICRO-0533']).toBeUndefined();
    use(d, 'forest-account-receive-' + layout.mode, layout.handover);
    expect(d.p.skills['SK-MICRO-0533']).toEqual([expect.stringContaining('WORLD-06|game-179|' + prefix + '.readback' + '|')]);
    expect(d.s.inventory[carried] ?? 0).toBe(0);
    expect(d.s.flags[prefix + '.used']).toBe(layout.mode);
    expect(d.e.node(prefix + '.used.' + layout.mode).text).toContain(layout.response);
    expect(d.done(prefix + '.readback')).toBe(true);
    expect(hasProp(d, 'forest-account-receive-' + layout.mode)).toBe(false);
    expect(hasProp(d, 'forest-account-kept-' + other.mode)).toBe(false);
    expect(hasProp(d, 'forest-account-kept-' + layout.mode)).toBe(true);
    expect(prop('forest-account-kept-' + layout.mode).text).toContain(layout.receipt);
    expect(d.s.journal).toContain('j.' + prefix + '.readback');
    expect(d.done('forest.publish')).toBe(false);
    roundTrip(d);
    expect(hasProp(d, 'forest-account-kept-' + layout.mode)).toBe(true);
    expect(d.e.visibleOptions(prefix + '.receive.' + layout.mode, d.s)).toHaveLength(1);
  });

  it('preserves an old report with no stored format and offers both new copies after reopening', () => {
    const d = new Driver();
    enterClearing(d);
    readRouteBook(d);
    d.talk('forest-steward', layouts[0].report);
    delete d.s.flags['forest.account.layout'];
    roundTrip(d);
    expect(d.s.flags['forest.report']).toBe(true);
    expect(d.done('forest.account')).toBe(true);
    expect(d.s.flags['forest.account.layout']).toBeUndefined();
    expect(d.done(prefix + '.readback')).toBe(false);
    use(d, 'forest-account-copy', 'Lift the lamp crew’s slip', 'Unfold the lookout’s card', 'Leave both');
    const offers = d.e.visibleOptions(prefix + '.compare', d.s).map(({ option }) => option.text);
    for (const { send } of layouts) expect(offers).toContainEqual(expect.stringContaining(send));
    use(d, 'forest-account-copy', 'Lift the lamp crew’s slip', 'Unfold the lookout’s card', layouts[1].send);
    use(d, 'forest-account-receive-lines', layouts[1].handover);
    expect(d.done(prefix + '.readback')).toBe(true);
    expect(d.s.flags['forest.report']).toBe(true);
    expect(d.s.flags['forest.account.layout']).toBeUndefined();
  });
});
