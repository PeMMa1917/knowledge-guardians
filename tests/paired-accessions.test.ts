import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { artKeys, BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const market = 'market.square';
const gallery = 'council.gallery';
const reference = 'item.accession-pair';

function prop(d: Driver, map: string, id: string) {
  return MAPS[map].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
}

describe('Two Objects, One Number', () => {
  it('provides the two separately sourced objects with readable, specific catalogue identities', () => {
    const d = new Driver();
    const records = d.e.pack.exhibits.filter((record) => record.id.startsWith('OBJ-MKT-'));
    const source = (id: string) => d.e.pack.sources.find((record) => record.id === id);
    expect(records).toHaveLength(2);
    expect(new Set(records.map((record) => source(record.sources[0])?.url)).size).toBe(2);
    expect(records.map((record) => record.name)).toEqual(['Am.9941, a cotton khipu from Peru', 'Oc.9941, a shell trumpet from Mangaia']);
    expect(records[1].dateText).toContain('unstated');
    expect(records[1].dateText).toContain('gift on 18 November 1876');
    for (const record of records) expect(artKeys()).toContain(BIG_ART[record.art]);
  });

  it.each([
    ['covers', 'Show both complete', 'written', 'Clip the two full'],
    ['desk', 'Keep the full stubs', 'spoken', 'Give the two full'],
  ])('carries the %s references into a new %s handover', (marketEdition, pack, councilEdition, place) => {
    const d = new Driver();
    expect(prop(d, market, 'market-accession-khipu')).toBeUndefined();
    d.s.objectivesDone.push('market.finish');
    for (const id of ['market-accession-khipu', 'market-accession-shell']) {
      expect(prop(d, market, 'market-accession-pack')).toBeUndefined();
      const stand = prop(d, market, id)!;
      d.run({ type: 'InspectExhibit', exhibit: stand.exhibit! });
    }
    d.walk(prop(d, market, 'market-accession-pack')!.node!, [pack]);
    expect(d.s.inventory[reference]).toBeUndefined();
    expect(d.done('accession.market.read')).toBe(false);
    const pickup = prop(d, market, `market-accession-${marketEdition}`)!;
    d.run({ type: 'SetFlag', flag: pickup.flag!, value: true });
    expect(d.s.inventory[reference]).toBe(1);
    expect(d.p.stones['KQ-ACC-001']).toEqual(['WORLD-11|trace']);
    expect(prop(d, gallery, 'council-accession-call')).toBeUndefined();
    d.s.objectivesDone.push('council.arrival');
    d.walk(prop(d, gallery, 'council-accession-call')!.node!);
    d.walk(prop(d, gallery, 'council-accession-plan')!.node!, [place]);
    expect(d.done('accession.council.hand')).toBe(false);
    d.run({ type: 'SetFlag', flag: prop(d, gallery, `council-accession-${councilEdition}`)!.flag!, value: true });
    expect(d.p.stones['KQ-ACC-001']).toEqual(['WORLD-11|trace', 'WORLD-16|fieldwork']);
    expect(d.s.journal).toContain('j.accession.council');
    expect(d.p.credit).toEqual({});
    expect(d.s.flags['ending.council']).toBeUndefined();
  });
});
