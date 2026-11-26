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
