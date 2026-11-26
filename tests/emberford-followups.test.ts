import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { EMBERFORD } from '../src/maps/emberford';
import { Driver } from './driver';

function prop(id: string) {
  const found = EMBERFORD.interactables.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown prop: ${id}`);
  return found;
}

function visible(d: Driver, id: string): boolean {
  return check(prop(id).visibleIf, d.s);
}

function use(d: Driver, id: string, ...choices: string[]) {
  const target = prop(id);
  if (!visible(d, id) || !target.node) throw new Error(`Unavailable scene: ${id}`);
  d.walk(target.node, choices);
}

function afterShowdown() {
  const d = new Driver();
  d.s.mapId = EMBERFORD.id;
  d.run({ type: 'SetFlag', flag: 'sd.corvan.outcome', value: 'split' });
  d.run({ type: 'SetFlag', flag: 'sign.state', value: 'note' });
  return d;
}

describe('The Copy in the Square', () => {
  it('offers the case after the market dispute and only opens the board when its records have been compared', () => {
    const initial = new Driver();
    expect(visible(initial, 'copy-spare')).toBe(false);
    expect(visible(initial, 'copy-order')).toBe(false);

    const d = afterShowdown();
    d.talk('merchant-corvan', 'anyone left with the old sign', 'Leave the spare');
    expect(visible(d, 'copy-spare')).toBe(true);
    expect(d.e.visibleObjectives(d.s).some((objective) => objective.id === 'copy.o.trace')).toBe(false);
    use(d, 'copy-spare', 'Take the spare');
    expect(visible(d, 'copy-spare')).toBe(false);

    use(d, 'copy-consent');
    use(d, 'copy-anchor');
    expect(d.s.cards).toContain('card.dpma-history');
    expect(visible(d, 'copy-board')).toBe(false);
    use(d, 'copy-order');
    expect(d.done('copy.o.trace')).toBe(true);
    expect(visible(d, 'copy-board')).toBe(true);
  });

  it.each([
    ['ledger', 'Pin a dated copy', 'south', 'Match the numbers', 'west'],
    ['market', 'Ask Hana', 'west', 'Let Hana read back', 'south'],
  ])('lets players deliver the repair via the %s with the same credit', (route, plan, place, deliver, otherPlace) => {
    const d = afterShowdown();
    const credit = { ...d.p.credit };
    d.talk('merchant-corvan', 'anyone left with the old sign', 'Take the spare');
    use(d, 'copy-order');
    use(d, 'copy-consent');
    use(d, 'copy-anchor');
    use(d, 'copy-board', plan);
    expect(d.s.flags['copy.route']).toBe(route);
    expect(visible(d, 'copy-board')).toBe(false);
    expect(visible(d, `copy-${otherPlace}-handover`)).toBe(false);
    expect(visible(d, `copy-${place}-outcome`)).toBe(false);

    use(d, `copy-${place}-handover`, deliver);
    d.talk('merchant-corvan', 'happened to the two slips');
    expect(d.done('copy.o.relay')).toBe(true);
    expect(d.s.journal).toContain('j.copy.arrived');
    expect(visible(d, `copy-${place}-handover`)).toBe(false);
    expect(visible(d, `copy-${place}-outcome`)).toBe(true);
    expect(visible(d, `copy-${otherPlace}-outcome`)).toBe(false);
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['sign.state']).toBe('note');
  });
});

describe('The Two-Bell Order', () => {
  it('keeps the independent order inquiry optional until the market Showdown', () => {
    const d = new Driver();
    expect(visible(d, 'bell-order-clerk')).toBe(false);
    expect(visible(d, 'bell-order-ferry')).toBe(false);
    expect(d.e.activeMissions(d.s).some(({ id }) => id === 'KG-CH1-S07')).toBe(false);
    d.s.objectivesDone.push('m02.o5.showdown');
    expect(visible(d, 'bell-order-clerk')).toBe(true);
    expect(visible(d, 'bell-order-ferry')).toBe(true);
    expect(d.e.activeMissions(d.s).some(({ id }) => id === 'KG-CH1-S07')).toBe(true);
  });

  it.each([
    ['clerk', 'Clip the guild stub', 'ferry', 'Clip the ferry strip', 'Set both records', 'pair', 'key'],
    ['ferry', 'Clip the ferry strip', 'clerk', 'Clip the guild stub', 'Keep the ferry marks', 'key', 'pair'],
  ])('matches the two records after taking the %s first and leaves the arrival open', (first, pickFirst, second, pickSecond, publish, format, otherFormat) => {
    const d = afterShowdown();
    d.s.objectivesDone.push('m02.o5.showdown');
    const credit = { ...d.p.credit };
    use(d, `bell-order-${first}`, pickFirst);
    expect(visible(d, 'bell-order-board')).toBe(false);
    use(d, `bell-order-${second}`, pickSecond);
    expect(visible(d, 'bell-order-proof')).toBe(false);
    use(d, 'bell-order-board', 'Line up the two Order 34 notches');
    use(d, 'bell-order-proof', publish);
    expect(d.done('bell.order.o.post')).toBe(true);
    expect(visible(d, `bell-order-${format}`)).toBe(true);
    expect(visible(d, `bell-order-${otherFormat}`)).toBe(false);
    expect(prop(`bell-order-${format}`).text).toMatch(/no recorded arrival time|open arrival line/);
    expect(d.s.journal).toContain('j.bell.order');
    expect(d.p.moments['moment.bell.order']).toBeTruthy();
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['sign.state']).toBe('note');
    expect(d.s.flags['copy.started']).toBeUndefined();
  });
});

describe('A Dry Step for the Washhouse', () => {
  function arrived() {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    return d;
  }

  it('can be started on arrival and uses both downstream readings for a repair order', () => {
    const d = arrived();
    expect(visible(d, 'washhouse-intake')).toBe(true);
    expect(visible(d, 'washhouse-tail')).toBe(false);
    expect(visible(d, 'washhouse-screen')).toBe(false);
    use(d, 'washhouse-intake', 'Leave the reading');
    expect(d.e.activeMissions(d.s).some(({ id }) => id === 'KG-CH1-S08')).toBe(false);
    use(d, 'washhouse-intake', 'Clip the head-peg reading');
    use(d, 'washhouse-screen', 'Follow the little side run');
    expect(visible(d, 'washhouse-board')).toBe(false);
    use(d, 'washhouse-tail', 'Clip the tail-peg reading');
    expect(visible(d, 'washhouse-board')).toBe(true);
    expect(d.done('washhouse.o.trace')).toBe(true);
    expect(visible(d, 'ferry-road')).toBe(false);
    expect(d.s.flags['heard.corvan']).toBeUndefined();
  });

  it.each([
    ['clear', 'Clear the leaves', 'Mark flow restored', 'step', /reached the tray/],
    ['step', 'Open the side crossing', 'Mark the crossing open', 'clear', /tray repair/],
  ])('requires the same upstream mark after choosing %s and records its own downstream effect', (route, order, result, other, note) => {
    const d = arrived();
    const credit = { ...d.p.credit };
    use(d, 'washhouse-intake', 'Clip the head-peg reading');
    use(d, 'washhouse-tail', 'Clip the tail-peg reading');
    use(d, 'washhouse-screen', 'Follow the little side run');
    use(d, 'washhouse-board', order);
    expect(visible(d, `washhouse-${route}-check`)).toBe(false);
    use(d, 'washhouse-head-again', 'Keep the second head-peg reading');
    expect(visible(d, `washhouse-${other}-check`)).toBe(false);
    use(d, `washhouse-${route}-check`, result);
    expect(d.done('washhouse.o.recheck')).toBe(true);
    expect(d.s.flags['washhouse.order']).toBe(route);
    expect(visible(d, `washhouse-${route}-note`)).toBe(true);
    expect(visible(d, `washhouse-${other}-note`)).toBe(false);
    expect(prop(`washhouse-${route}-note`).text).toMatch(note);
    expect(d.s.journal).toContain('j.washhouse.recheck');
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['well.shared']).toBeUndefined();
  });
});

describe('The Mark and the Hands', () => {
  it('opens at arrival and needs the actual counterexample from the specimen tray', () => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    expect(visible(d, 'hands-strap')).toBe(true);
    expect(visible(d, 'hands-tray')).toBe(false);
    use(d, 'hands-strap', 'Keep his example');
    expect(visible(d, 'hands-return')).toBe(false);
    use(d, 'hands-tray', 'Take that entry');
    expect(d.s.cards).toEqual(expect.arrayContaining(['card.biro-object', 'card.dpma-history']));
    expect(d.done('hands.o.compare')).toBe(true);
    expect(visible(d, 'hands-return')).toBe(true);
    expect(d.s.flags['heard.corvan']).toBeUndefined();
  });

  it.each([
    ['concede', 'Grant that a short mark', 'pair'],
    ['pair', 'Put the short tag', 'concede'],
  ])('gives the %s conversation one relationship change and a lasting route prop', (response, choice, other) => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    const credit = { ...d.p.credit };
    use(d, 'hands-strap', 'Keep his example');
    use(d, 'hands-tray', 'Take that entry');
    use(d, 'hands-return', choice);
    expect(d.s.flags['hands.response']).toBe(response);
    expect(d.s.relations['porter-idris']).toBe(1);
    expect(visible(d, `hands-${response}`)).toBe(true);
    expect(visible(d, `hands-${other}`)).toBe(false);
    expect(d.e.visibleOptions('hands.review', d.s).map(({ option }) => option.text))
      .toEqual(['Leave the papers at the strap for now.']);
    expect(d.s.journal).toContain('j.hands');
    expect(d.p.credit).toEqual(credit);
  });
});
