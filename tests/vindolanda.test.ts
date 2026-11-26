import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((entry) => entry.id === id && check(entry.visibleIf, d.s));
}

function openScene(d: Driver, id: string, choice: string) {
  const entry = prop(d, id);
  if (!entry?.node) throw new Error('No reachable scene at ' + id);
  d.walk(entry.node, [choice]);
}

function read(d: Driver, id: string) {
  const entry = prop(d, id);
  if (entry?.kind !== 'sign') throw new Error('No reachable notice at ' + id);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  return entry.text;
}

function cross(d: Driver, id: string) {
  const entry = prop(d, id);
  if (!entry?.to || !check(entry.openIf, d.s)) throw new Error('No reachable door ' + id);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  d.s.mapId = entry.to.map;
}

const folio = 'item.vindolanda.folio';
const firstRead = ['nexus-vind-earlier', 'Place the earlier slip'] as const;
const secondRead = ['nexus-vind-later', 'Place the later slip'] as const;

describe('Vindolanda tablet and the next Metalworks docket', () => {
  it('distinguishes the primary object record from the scholarly restoration', () => {
    const pack = buildPack();
    const object = pack.cards.find((card) => card.id === 'card.vindolanda.tablet');
    const reading = pack.cards.find((card) => card.id === 'card.vindolanda.edition');
    expect(object).toMatchObject({ historicalLabel: 'documented', sources: ['HIS-VIND-01'] });
    expect(reading).toMatchObject({ historicalLabel: 'scholarly-interpretation', sources: ['HIS-VIND-02'] });
    expect(reading?.limits).toContain('does not settle who came');
    const catalogue = pack.dialogue.find((node) => node.id === 'vindolanda.catalogue');
    expect(catalogue?.text).toContain('97–103 CE');
    expect(catalogue?.text).toContain('97–105 CE');
  });

  it('can be deferred at the opening and leaves the pen investigation counts alone', () => {
    const d = new Driver();
    expect(prop(d, 'nexus-vind-trace')).toBeUndefined();
    expect(prop(d, 'nexus-vind-place')).toBeUndefined();
    openScene(d, 'nexus-vind-case', 'Leave both where');
    expect(d.s.cards).not.toContain('card.vindolanda.tablet');
    openScene(d, 'nexus-vind-case', 'Open the catalogue card');
    openScene(d, 'nexus-vind-trace', 'Put the trace');
    openScene(d, ...firstRead);
    expect(d.done('vindolanda.compare')).toBe(false);
    expect(prop(d, 'nexus-vind-place')).toBeUndefined();
    expect(d.s.flags['count.inspected']).toBeUndefined();
    expect(d.s.flags['count.lens']).toBeUndefined();
    expect(d.s.inventory[folio]).toBeUndefined();
    d.s.objectivesDone.push('forest.finish');
    cross(d, 'metalworks-door');
    expect(prop(d, 'metal-vind-witness')).toBeUndefined();
    cross(d, 'metal-records-path');
    expect(prop(d, 'metal-vind-fold')).toBeUndefined();
  });

  const routes = [
    ['caption', 'Set an invitation caption', 'nexus-vind-caption', 'sleeve', 'Clip the addressed sleeve', false],
    ['trace', 'Set both readings', 'nexus-vind-editors', 'separate', 'Hang the approval', true],
    ['caption', 'Set an invitation caption', 'nexus-vind-caption', 'separate', 'Hang the approval', false],
    ['trace', 'Set both readings', 'nexus-vind-editors', 'sleeve', 'Clip the addressed sleeve', true],
  ] as const;

  it.each(routes)('transfers the %s edition and independently places a workshop record',
    (layout, openingChoice, openingResult, records, hallChoice, reverse) => {
      const d = new Driver();
      const credit = { ...d.p.credit };
      openScene(d, 'nexus-vind-case', 'Open the catalogue card');
      openScene(d, 'nexus-vind-trace', 'Put the trace');
      for (const [id, choice] of reverse ? [secondRead, firstRead] : [firstRead, secondRead]) {
        openScene(d, id, choice);
      }
      expect(d.done('vindolanda.compare')).toBe(true);
      openScene(d, 'nexus-vind-place', openingChoice);
      expect(d.s.flags['vindolanda.nexus.layout']).toBe(layout);
      expect(prop(d, openingResult)).toBeDefined();
      expect(d.s.inventory[folio]).toBe(1);

      d.s.objectivesDone.push('forest.finish');
      cross(d, 'metalworks-door');
      cross(d, 'metal-records-path');
      openScene(d, 'metal-vind-fold', 'Fold the copy');
      expect(prop(d, 'metal-vind-place')).toBeUndefined();
      cross(d, 'metal-yard-return');
      expect(read(d, 'metal-vind-witness')).toContain('person who sees the fit');
      expect(d.done('vindolanda.hall.compare')).toBe(true);
      cross(d, 'metal-records-path');
      openScene(d, 'metal-vind-place', hallChoice);
      expect(d.done('vindolanda.hall.done')).toBe(false);
      if (records === 'separate') {
        expect(prop(d, 'metal-vind-sleeve')).toBeUndefined();
        cross(d, 'metal-yard-return');
        expect(read(d, 'metal-vind-separate')).toContain('separate approval');
      } else {
        expect(read(d, 'metal-vind-sleeve')).toContain('separate fit-witness signature');
      }
      expect(d.done('vindolanda.hall.done')).toBe(true);
      expect(d.done('metal.publish')).toBe(false);
      expect(d.s.inventory[folio]).toBe(1);
      expect(d.p.credit).toEqual(credit);
    });
});
