import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const tabs = 'item.two-place-tabs';
const prop = (d: Driver, id: string) => MAPS[d.s.mapId].interactables.find((p) => p.id === id);

function visible(d: Driver, id: string): boolean {
  const found = prop(d, id);
  return !!found && check(found.visibleIf, d.s);
}

function door(d: Driver, id: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'door' || !found.to || !visible(d, id) || !check(found.openIf, d.s)) {
    throw new Error(`Cannot use ${id}`);
  }
  if (found.flag) d.run({ type: 'SetFlag', flag: found.flag, value: true });
  d.s.mapId = found.to.map;
}

function read(d: Driver, id: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'sign' || !found.flag || !visible(d, id)) throw new Error(`Cannot read ${id}`);
  d.run({ type: 'SetFlag', flag: found.flag, value: true });
}

function inspect(d: Driver, id: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'exhibit' || !found.exhibit || !visible(d, id)) throw new Error(`Cannot inspect ${id}`);
  d.run({ type: 'InspectExhibit', exhibit: found.exhibit });
}

function scene(d: Driver, id: string, choice: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'scene' || !found.node || !visible(d, id)) throw new Error(`Cannot use ${id}`);
  d.walk(found.node, [choice]);
}

const support = {
  edge: 'Rest the same practice model on its narrow edge',
  base: 'Set the practice model flat on the base cradle',
};

function openRim(d: Driver, display: 'cradle' | 'profile') {
  expect(() => door(d, 'preserved-door')).toThrow(/Cannot use/);
  d.s.flags['nile.returned'] = true;
  door(d, 'preserved-door');
  inspect(d, 'preserved-binak-case');
  expect(d.done('preserved.binak.sources')).toBe(false);
  read(d, 'preserved-binak-dates');
  expect(d.done('preserved.binak.sources')).toBe(true);
  door(d, 'preserved-door-royal');
  const order = display === 'cradle' ? ['edge', 'base'] as const : ['base', 'edge'] as const;
  for (const view of order) {
    scene(d, 'preserved-binak-support', support[view]);
    expect(d.done('preserved.binak.compare')).toBe(false);
    expect(visible(d, 'preserved-binak-edge-mark')).toBe(view === 'edge');
    expect(visible(d, 'preserved-binak-base-mark')).toBe(view === 'base');
    read(d, `preserved-binak-${view}-mark`);
  }
  expect(d.done('preserved.binak.compare')).toBe(true);
  door(d, 'preserved-royal-back');
  scene(d, 'preserved-binak-mount', display === 'cradle' ? 'Put the level practice cradle' : 'Hang the side view');
  expect(d.s.inventory[tabs]).toBeUndefined();
  expect(visible(d, 'preserved-binak-mount')).toBe(false);
  expect(prop(d, `preserved-binak-${display}`)?.text).toContain('Date Made field gives 2011 and the catalogue heading gives 2012');
  read(d, `preserved-binak-${display}`);
  expect(d.s.inventory[tabs]).toBe(1);
  expect(d.done('preserved.binak.finish')).toBe(true);
  expect(d.done('preserved.publish')).toBe(false);
  door(d, 'preserved-door-royal');
  expect(visible(d, 'preserved-binak-parked')).toBe(display === 'profile');
  expect(visible(d, 'preserved-binak-edge-mark')).toBe(false);
  expect(visible(d, 'preserved-binak-base-mark')).toBe(false);
  door(d, 'preserved-royal-back');
  door(d, 'preserved-door-nexus');
}

function nameThatTravels(d: Driver, layout: 'rail' | 'skiff', hasTabs: boolean) {
  door(d, 'sea-door');
  expect(visible(d, 'sea-name-publish')).toBe(false);
  read(d, 'sea-name-step');
  door(d, 'sea-chartroom-path');
  inspect(d, 'sea-name-canoe');
  expect(visible(d, 'sea-name-desk')).toBe(false);
  door(d, 'sea-chartroom-to-shoal');
  read(d, 'sea-name-crew');
  expect(d.done('sea.name.sources')).toBe(true);
  door(d, 'sea-shoal-to-chartroom');
  scene(d, 'sea-name-desk', hasTabs ? 'Use the Cold Store tabs' : 'Use two chart-room slips');
  expect(d.s.flags['sea.name.tabs']).toBe(hasTabs ? 'cold' : 'local');
  expect(visible(d, 'sea-name-lines')).toBe(true);
  door(d, 'sea-chartroom-return');
  scene(d, 'sea-name-publish', layout === 'rail' ? 'Pin the full name' : 'Clip a point-of-use strip');
  expect(visible(d, 'sea-name-load')).toBe(false);
  read(d, `sea-name-${layout}`);
  expect(d.done('sea.name.finish')).toBe(false);
  expect(visible(d, 'sea-name-step')).toBe(false);
  read(d, 'sea-name-load');
  expect(d.done('sea.name.finish')).toBe(true);
  expect(d.done('sea.finish')).toBe(false);
  expect(d.s.flags['sea.response']).toBeUndefined();
}

describe('The Open Rim and A Name That Travels', () => {
  const routes = (['cradle', 'profile'] as const).flatMap((basket) =>
    (['rail', 'skiff'] as const).map((boat) => ({ basket, boat })));

  it.each(routes)('carries the $basket route’s tabs to the $boat loading key', ({ basket, boat }) => {
    const d = new Driver();
    const xp = totalXP(d.p);
    openRim(d, basket);
    expect(visible(d, 'sea-door')).toBe(true);
    d.resumeAfter('copies.revise');
    nameThatTravels(d, boat, true);
    expect(d.s.inventory[tabs]).toBe(1);
    expect(totalXP(d.p)).toBe(xp);
  });

  it('offers the same local chart decisions when a player skipped the Cold Store task', () => {
    const d = new Driver();
    d.resumeAfter('copies.revise');
    nameThatTravels(d, 'skiff', false);
    expect(d.s.inventory[tabs]).toBeUndefined();
  });

  it('preserves the recorded dates, creators and separate cultural contexts', () => {
    const pack = buildPack();
    const basket = pack.exhibits.find((exhibit) => exhibit.id === 'OBJ-PRES-BINAK-X104841');
    const canoe = pack.exhibits.find((exhibit) => exhibit.id === 'OBJ-SEA-RRA-00001826');
    expect(basket).toMatchObject({ dateText: expect.stringMatching(/2011.*2012/), historicalLabel: 'documented', sources: ['HIS-BINAK-01'] });
    expect(canoe).toMatchObject({ dateText: '1988', historicalLabel: 'documented', sources: ['HIS-CANOE-01'] });
    expect(pack.cards.find((card) => card.id === 'card.preserved.binak')?.text).toContain('Mikaela Rose Cottingham, who is Wurundjeri');
    expect(pack.cards.find((card) => card.id === 'card.sea.rra')?.text).toContain('Issac Walayunkuma, who was Garrawa');
    for (const exhibit of [basket!, canoe!]) {
      expect(exhibit.altText).toMatch(/original pixel/);
      expect(BIG_ART[exhibit.art]).toBeTruthy();
    }
  });
});
