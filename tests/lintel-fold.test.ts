import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const fold = 'lintel-fold';

function prop(d: Driver, id: string) {
  const item = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  expect(item, id).toBeDefined();
  return item!;
}

function visible(d: Driver, id: string) {
  return check(prop(d, id).visibleIf, d.s);
}

function canCross(d: Driver, id: string) {
  return visible(d, id) && check(prop(d, id).openIf, d.s);
}

function cross(d: Driver, id: string) {
  const item = prop(d, id);
  expect(canCross(d, id), id).toBe(true);
  expect(item.to, id).toBeDefined();
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
  d.s.mapId = item.to!.map;
}

function inspect(d: Driver, id: string) {
  expect(visible(d, id), id).toBe(true);
  d.run({ type: 'InspectExhibit', exhibit: prop(d, id).exhibit! });
}

function scene(d: Driver, id: string, ...choices: string[]) {
  expect(visible(d, id), id).toBe(true);
  d.walk(prop(d, id).node!, choices);
}

function start() {
  const d = new Driver();
  d.s.flags['nile.returned'] = true;
  d.s.objectivesDone.push('civic.finish');
  cross(d, 'preserved-door');
  d.s.flags['preserved.display'] = 'paired';
  cross(d, 'preserved-door-inquiry');
  return d;
}

describe('A Door in Two Lines and The Bench at the Turning', () => {
  it('keeps the public sources specific to their own editions, dates and custodians', () => {
    const pack = buildPack();
    const book = pack.exhibits.find(({ id }) => id === 'OBJ-LINTEL-SEJARAH')!;
    expect(book).toMatchObject({ historicalLabel: 'documented', sources: ['HIS-LINTEL-01'], dateText: '1898' });
    expect(book.name).toContain('B20025340E');
    expect(book.dateKind).toContain('Jawi edition in 1896');
    expect(book.dateKind).toContain('separate English translation published in 1821');
    const bookCard = pack.cards.find(({ id }) => id === 'card.lintel.sejarah')!;
    expect(bookCard.text).toContain('Ibrahim, son of Kandu');
    const temple = pack.exhibits.find(({ id }) => id === 'OBJ-LINTEL-MARIAMMAN')!;
    expect(temple).toMatchObject({ historicalLabel: 'documented', sources: ['HIS-LINTEL-02', 'HIS-LINTEL-03'] });
    expect(temple.dateKind).toContain('oldest brick sections to about 1843');
    expect(temple.dateKind).toContain('1925');
    const templeCard = pack.cards.find(({ id }) => id === 'card.lintel.temple')!;
    expect(templeCard.limits).toContain('cannot authorize a visit');
  });

  it('changes the view at the same rail without marking it as checked', () => {
    const d = start();
    expect(visible(d, 'cold-lintel-sejarah')).toBe(false);
    d.s.objectivesDone.push('preserved.publish');
    inspect(d, 'cold-lintel-sejarah');
    expect(visible(d, 'cold-lintel-turn')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: fold });
    scene(d, 'cold-lintel-turn', 'Seat the rounded-letters', 'Set the frame back');
    expect(d.s.flags['lintel.cold.face']).toBe('ramp');
    expect(d.s.flags['lintel.cold.ramp']).toBeUndefined();
    scene(d, 'cold-lintel-turn', 'Seat the slanted-letters', 'Mark who can read');
    expect(d.s.flags['lintel.cold.face']).toBe('stairs');
    expect(visible(d, 'cold-lintel-layout')).toBe(false);
    scene(d, 'cold-lintel-turn', 'Seat the rounded-letters', 'Tilt the frame');
    expect(d.s.flags['lintel.cold.face']).toBe('ramp');
    expect(visible(d, 'cold-lintel-layout')).toBe(true);
  });

  it.each([
    { signs: 'pair', route: 'public' },
    { signs: 'pair', route: 'escort' },
    { signs: 'guide', route: 'public' },
    { signs: 'guide', route: 'escort' },
  ])('keeps $signs at Pilar’s board and carries the mat by the independently chosen $route route', ({ signs, route }) => {
    const d = start();
    const pair = signs === 'pair';
    const escort = route === 'escort';
    const credit = { ...d.p.credit };
    d.s.objectivesDone.push('preserved.publish');
    inspect(d, 'cold-lintel-sejarah');
    d.run({ type: 'EquipPerspective', keepsake: fold });
    scene(d, 'cold-lintel-turn', 'Seat the slanted-letters', 'Mark who can read');
    scene(d, 'cold-lintel-turn', 'Seat the rounded-letters', 'Tilt the frame');
    scene(d, 'cold-lintel-layout', pair ? 'Hang both forms' : 'Keep a reader');
    expect(d.done('lintel.cold.checked')).toBe(false);
    scene(d, `cold-lintel-${signs}`, pair ? 'Clip today’s' : 'Mark where the reader');
    expect(d.s.flags['lintel.cold.receipt']).toBe(signs);
    expect(d.done('lintel.cold.checked')).toBe(true);
    expect(d.s.journal).toContain('j.lintel.cold');
    cross(d, 'preserved-inquiry-back');
    cross(d, 'preserved-door-nexus');
    cross(d, 'voices-door');
    expect(d.done('voices.arrival')).toBe(true);
    d.s.flags['voices.permissions.read'] = true;
    d.s.flags['cross.last-lamp'] = 'room';
    d.s.flags['voices.revision'] = 'routes';
    cross(d, 'voices-walk-path');

    expect(canCross(d, 'walk-lintel-service')).toBe(false);
    expect(visible(d, 'walk-lintel-board')).toBe(false);
    inspect(d, 'walk-lintel-temple');
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(visible(d, 'walk-lintel-board')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: fold });
    scene(d, 'walk-lintel-board', 'Slide the public line');
    expect(canCross(d, 'walk-lintel-service')).toBe(false);
    expect(visible(d, 'walk-lintel-choose')).toBe(false);
    scene(d, 'walk-lintel-rack', 'Set the signed');
    expect(d.done('lintel.voices.compare')).toBe(true);
    expect(d.s.flags['lintel.voices.permit']).toBeUndefined();
    expect(canCross(d, 'walk-lintel-service')).toBe(false);
    scene(d, 'walk-lintel-choose', escort ? 'Ask Eren to sign' : 'Carry the mat');
    expect(canCross(d, 'walk-lintel-service')).toBe(escort);
    expect(d.s.flags['lintel.voices.route']).toBe(route);
    expect(d.s.flags['lintel.voices.permit']).toBe(escort ? 'mat-with-eren' : undefined);

    // Both benches depend on an actual passage receipt, even when the layout is chosen.
    cross(d, 'voices-walk-return');
    expect(visible(d, 'listening-lintel-public')).toBe(false);
    expect(visible(d, 'listening-lintel-escort')).toBe(false);
    cross(d, 'voices-walk-path');
    d.run({ type: 'EquipPerspective', keepsake: null });
    if (escort) {
      expect(prop(d, 'walk-lintel-service').artOpen?.if).toBeDefined();
      cross(d, 'walk-lintel-service');
      expect(d.s.flags['lintel.voices.escort-cross']).toBe(true);
      expect(visible(d, 'listening-lintel-public')).toBe(false);
      scene(d, 'listening-lintel-escort', 'Return the signed');
    } else {
      scene(d, 'walk-lintel-turn', 'Turn the mat');
      expect(canCross(d, 'voices-walk-return')).toBe(false);
      expect(canCross(d, 'walk-lintel-service')).toBe(false);
      cross(d, 'walk-lintel-public-door');
      expect(d.s.flags['lintel.voices.public-cross']).toBe(true);
      expect(visible(d, 'listening-lintel-escort')).toBe(false);
      scene(d, 'listening-lintel-public', 'Leave the checked public line');
    }
    expect(d.done('lintel.voices.checked')).toBe(true);
    expect(d.s.flags['lintel.voices.done']).toBe(route);
    expect(d.s.journal).toContain('j.lintel.voices');
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['voices.revision']).toBe('routes');
    expect(d.s.flags['voices.permissions.read']).toBe(true);
    expect(d.s.flags['cross.last-lamp']).toBe('room');

    cross(d, 'voices-walk-path');
    expect(canCross(d, 'walk-lintel-service')).toBe(false);
    expect(canCross(d, 'voices-walk-return')).toBe(true);
    cross(d, 'voices-walk-return');
    cross(d, 'voices-nexus-return');
    cross(d, 'preserved-door');
    cross(d, 'preserved-door-inquiry');
    expect(visible(d, `cold-lintel-reply-${route}`)).toBe(true);
    expect(visible(d, `cold-lintel-reply-${escort ? 'public' : 'escort'}`)).toBe(false);
  });
});
