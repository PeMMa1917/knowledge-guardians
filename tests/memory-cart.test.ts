import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { EMBERFORD } from '../src/maps/emberford';
import { CART_MEMORY_ACTORS, CART_MEMORY_PROPS } from '../src/maps/memoryCart';
import { Driver } from './driver';

function prop(id: string) {
  const found = CART_MEMORY_PROPS.find((entry) => entry.id === `memory-cart-${id}`);
  if (!found) throw new Error(`Could not find ${id}`);
  return found;
}

function appears(d: Driver, id: string) {
  return check(prop(id).visibleIf, d.s);
}

function use(d: Driver, id: string, choice?: string) {
  expect(appears(d, id), id).toBe(true);
  const here = prop(id);
  if (here.node) d.walk(here.node, choice ? [choice] : []);
  if (here.flag) d.run({ type: 'SetFlag', flag: here.flag, value: true });
  return here.text;
}

const paths = [
  ['wheel', 'over', 'direct'],
  ['wheel', 'beside', 'escort'],
  ['strap', 'over', 'escort'],
  ['strap', 'beside', 'direct'],
] as const;

describe('The Cart Before the Bell', () => {
  it('puts two first views beside the early path without moving established Emberford interactions', () => {
    const d = new Driver();
    expect(appears(d, 'launch-wheel')).toBe(false);
    expect(appears(d, 'launch-strap')).toBe(false);
    d.run({ type: 'SetFlag', flag: 'reached.emberford', value: true });
    expect(appears(d, 'launch-wheel')).toBe(true);
    expect(appears(d, 'launch-strap')).toBe(true);
    expect(appears(d, 'guide')).toBe(false);
    expect(CART_MEMORY_ACTORS.some((actor) => check(actor.visibleIf, d.s))).toBe(false);

    const newIds = new Set(CART_MEMORY_PROPS.map((entry) => entry.id));
    for (const place of [...CART_MEMORY_PROPS, ...CART_MEMORY_ACTORS]) {
      expect(EMBERFORD.floor(place.x, place.y), place.id).not.toBeNull();
      expect(EMBERFORD.interactables.some((entry) => !newIds.has(entry.id)
        && place.x >= entry.x && place.x < entry.x + entry.w
        && place.y >= entry.y && place.y < entry.y + entry.h), place.id).toBe(false);
    }
  });

  it.each(paths)('starts from %s before the suggestion, uses %s and leaves a distinct %s handover', (view, fold, plan) => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    d.run({ type: 'SetFlag', flag: 'reached.emberford', value: true });
    const other = view === 'wheel' ? 'strap' : 'wheel';

    expect(appears(d, `first-${view}`)).toBe(false);
    use(d, `launch-${view}`, 'Lower the stop');
    expect(appears(d, 'guide')).toBe(false);
    use(d, `first-${view}`, 'Clip the');
    expect(d.s.flags['memory-cart.first']).toBe(view);
    expect(d.done('memory-cart.initial')).toBe(true);
    expect(appears(d, `launch-${other}`)).toBe(false);

    use(d, 'guide', 'Leave both slips loose');
    expect(appears(d, 'notice')).toBe(false);
    use(d, 'guide', fold === 'over' ? 'over my first sketch' : 'beside my first sketch');
    expect(d.s.flags['memory-cart.working']).toBe(fold);
    expect(appears(d, 'clip')).toBe(false);
    expect(appears(d, 'wheel')).toBe(false);
    expect(use(d, 'notice')).toContain('None of those copies went past the covered stall');
    expect(appears(d, 'wheel')).toBe(false);
    use(d, 'clip', 'Untie the flap');
    expect(use(d, 'clip-open')).toContain('discard every west reading unopened');

    const observe = view === 'wheel' ? 'strap' : 'wheel';
    use(d, observe, observe === 'wheel' ? 'Open the west view' : 'Set the crate');
    use(d, `${observe}-proof`);
    expect(appears(d, 'publish')).toBe(false);
    use(d, view, view === 'wheel' ? 'Open the west view' : 'Set the crate');
    use(d, `${view}-proof`);
    expect(appears(d, 'publish')).toBe(false);
    expect(appears(d, `original-${other}`)).toBe(false);
    expect(use(d, `original-${view}`)).toContain('taken before Edrin spoke');
    expect(d.s.flags['memory-cart.first']).toBe(view);
    expect(d.done('memory-cart.sources')).toBe(true);
    expect(d.s.journal).toContain(`j.memory-cart.first.${view}`);
    expect(d.s.journal).not.toContain(`j.memory-cart.first.${other}`);
    expect(d.s.journal.indexOf(`j.memory-cart.first.${view}`)).toBeLessThan(d.s.journal.indexOf('j.memory-cart.guide'));
    const covered = d.e.pack.missions.flatMap((mission) => mission.objectives).find(({ id }) => id === 'memory-cart.sources');
    expect(covered?.skills).toEqual(expect.arrayContaining(['SK-MICRO-0201', 'SK-MICRO-0202']));

    use(d, 'publish', 'Keep the rail open');
    expect(appears(d, plan)).toBe(false);
    use(d, 'publish', plan === 'direct' ? 'Post the two checked limits' : 'Keep the reported stop');
    expect(appears(d, plan === 'direct' ? 'escort' : 'direct')).toBe(false);
    expect(d.done('memory-cart.handover')).toBe(false);
    expect(use(d, plan)).toContain(plan === 'direct' ? 'public notice' : 'own walk');
    expect(d.done('memory-cart.handover')).toBe(true);
    expect(d.s.flags['memory-cart.first']).toBe(view);
    expect(d.s.flags['memory-cart.working']).toBe(fold);
    expect(d.p.credit).toEqual({});
  });
});
