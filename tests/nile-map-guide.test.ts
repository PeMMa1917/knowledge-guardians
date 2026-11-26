import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { totalXP } from '../src/domain/permanent';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const props = MAPS['nile.route'].interactables;
const find = (id: string) => props.find((prop) => prop.id === id)!;
const seen = (d: Driver, id: string) => check(find(id).visibleIf, d.s);

function read(d: Driver, id: string): void {
  const prop = find(id);
  if (prop.kind !== 'sign' || !prop.flag || !seen(d, id)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

describe('Both Ends of the Drawing', () => {
  it('uses opposite sides of the same board and two fixed landmarks', () => {
    const board = find('nile-way-board');
    expect(find('nile-way-aisle-view').y).toBeGreaterThan(board.y);
    expect(find('nile-way-shelf-view').y).toBeLessThan(board.y);
    expect(find('nile-case-mine').x).toBeLessThan(board.x);
    expect(find('nile-way-carrier-note').x).toBeGreaterThan(board.x);
    expect(find('nile-way-aisle-view').text).toContain('case is on your left');
    expect(find('nile-way-shelf-view').text).toContain('case is now on your right');
  });

  it.each([
    { layout: 'fixed', choice: 'Put one guide on the board', guides: ['nile-way-fixed-read'], returned: false },
    { layout: 'paired', choice: 'Put a guide at each approach', guides: ['nile-way-aisle-read', 'nile-way-shelf-read'], returned: true },
  ])('publishes the $layout guide and checks it in the room', ({ layout, choice, guides, returned }) => {
    const d = new Driver();
    d.s.mapId = 'nile.route';
    d.s.flags['nile.arrived'] = true;
    if (returned) {
      d.s.flags['nile.dispatch'] = 'pair';
      d.s.flags['nile.returned'] = true;
    }
    const xp = totalXP(d.p);
    const board = find('nile-way-board');
    expect(seen(d, board.id)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    expect(seen(d, board.id)).toBe(true);

    read(d, 'nile-way-aisle-view');
    read(d, 'nile-way-carrier-note');
    const choices = () => d.e.visibleOptions(board.node!, d.s).map(({ option }) => option.text);
    expect(choices()).toEqual(['Leave the sketch on the peg.']);
    read(d, 'nile-way-shelf-view');
    expect(choices().some((label) => label.startsWith('Hold the room marks steady'))).toBe(true);

    d.walk(board.node!, ['Hold the room marks steady', 'Leave the sketch turned']);
    expect(d.s.flags['nile.way.turned']).toBe('reversed');
    expect(board.artBy?.keys.reversed).toBeTruthy();
    expect(d.done('nile.way.compare')).toBe(true);
    expect(d.done('nile.way.publish')).toBe(false);
    const results = () => props.filter((prop) =>
      /^nile-way-.+-read$/.test(prop.id) && check(prop.visibleIf, d.s)).map(({ id }) => id);
    expect(results()).toEqual([]);

    d.walk(board.node!, ['Set out the revised room guide', choice]);
    expect(d.s.flags['nile.way.layout']).toBe(layout);
    expect(seen(d, board.id)).toBe(false);
    expect(results()).toEqual(guides);
    for (const guide of guides) {
      expect(d.done('nile.way.publish')).toBe(false);
      read(d, guide);
    }
    expect(d.done('nile.way.publish')).toBe(true);
    expect(d.done('nile.routes')).toBe(false);
    expect(d.s.flags['nile.dispatch']).toBe(returned ? 'pair' : undefined);
    expect(totalXP(d.p)).toBe(xp);
  });
});
