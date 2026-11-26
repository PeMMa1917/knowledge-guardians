import { describe, expect, it } from 'vitest';
import { DEPOT_RECORDS } from '../src/content/surveyDepot';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const harbour = 'observatory.harbour';
const depot = 'observatory.survey-depot';

function entry(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((e) => e.id === `depot-${id}`);
  if (!prop) throw new Error(`Missing Depot prop ${id}`);
  return { prop, visible: check(prop.visibleIf, d.s) };
}

function go(d: Driver, id: string, pick?: string) {
  const { prop, visible } = entry(d, id);
  if (!visible || !check(prop.openIf, d.s)) throw new Error(`Unavailable Depot prop ${id}`);
  if (prop.exhibit) d.run({ type: 'InspectExhibit', exhibit: prop.exhibit });
  if (prop.node) d.walk(prop.node, pick ? [pick] : []);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  if (prop.to) d.s.mapId = prop.to.map;
  return prop.text;
}

function enter() {
  const d = new Driver();
  d.s.mapId = harbour;
  expect(entry(d, 'door').visible).toBe(false);
  d.run({ type: 'SetFlag', flag: 'coast.arrived', value: true });
  go(d, 'door');
  expect(d.s.mapId).toBe(depot);
  return d;
}

function group(d: Driver, id: string) {
  for (const record of DEPOT_RECORDS.filter(({ group }) => group === id)) go(d, `case-${record.slug}`);
}

describe('A Lid with Two Names', () => {
  it('places 30 dated records and two undated related objects at independent inspectable locations', () => {
    const d = enter();
    const displayed = MAPS[depot].interactables.filter(({ kind }) => kind === 'exhibit');
    expect(displayed).toHaveLength(32);
    expect(new Set(displayed.map(({ x, y }) => `${x},${y}`)).size).toBe(32);
    const records = d.e.pack.exhibits.filter(({ id }) => id.startsWith('OBJ-DEPOT-'));
    expect(new Set(records.flatMap(({ specimen }) => specimen ? [specimen.key] : [])).size).toBe(30);
    expect(records.filter(({ specimen }) => !specimen).map(({ dateText }) => dateText)).toEqual(['Undated', 'Undated']);
    for (const record of DEPOT_RECORDS) {
      expect(displayed.find(({ exhibit }) => exhibit === record.exhibit)?.art).toBe(record.art);
      expect(d.e.pack.sources.find(({ id }) => id === record.source)?.url).toBe(`https://www.spri.cam.ac.uk/museum/catalogue/article/${record.path}/`);
    }
    expect(d.e.pack.cards.find(({ id }) => id === 'card.depot.bundle-3')?.text).toContain('Instituto Antártico Argentino');
    expect(d.e.pack.cards.find(({ id }) => id === 'card.depot.wheel')?.limits).toContain('Type history does not prove');
  });

  it.each(['paired', 'linked'] as const)('checks two independent sights per pair and honours the %s quay handover', (mode) => {
    const d = enter();
    expect(entry(d, 'load').visible).toBe(false);
    group(d, 'identity');
    go(d, 'load', 'known linked scope');
    expect(go(d, 'known-body')).toContain('16166');
    expect(d.done('depot.known')).toBe(false);
    expect(go(d, 'known-lid')).toContain('N: 115a');
    expect(d.done('depot.known')).toBe(true);
    expect(entry(d, 'compare').visible).toBe(false);
    go(d, 'load', 'reused microscope');
    expect(go(d, 'reused-lid')).toContain('30607');
    expect(d.done('depot.reused')).toBe(false);
    expect(go(d, 'reused-body')).toContain('serial 16616');
    expect(d.done('depot.reused')).toBe(true);
    go(d, 'compare', 'Leave the intake card');
    expect(d.s.flags['depot.index']).toBeUndefined();
    go(d, 'compare', mode === 'paired' ? 'Mount the lid clip' : 'File the body for loans');
    expect(go(d, `index-${mode}`)).toContain(mode === 'paired' ? 'open tray' : 'staffed appointment');
    expect(d.done('depot.proof')).toBe(false);
    go(d, 'return');
    expect(d.s.mapId).toBe(harbour);
    const other = mode === 'paired' ? 'linked' : 'paired';
    expect(entry(d, `proof-${other}`).visible).toBe(false);
    go(d, `proof-${mode}`, 'Leave this receipt');
    expect(d.done('depot.proof')).toBe(false);
    go(d, `proof-${mode}`, 'Record the');
    expect(d.done('depot.proof')).toBe(true);
    expect(go(d, `used-${mode}`)).toContain(mode === 'paired' ? 'next loan awaits' : 'at once');
    expect(d.s.flags['coast.updated']).toBeUndefined();
    expect(d.p.credit).toEqual({});
  });

  it.each([false, true])('uses evidence in six separate side decisions (second path: %s)', (other) => {
    const d = enter();
    group(d, 'date');
    go(d, 'date', other ? 'their own rows' : 'one line');
    expect(go(d, other ? 'date-rows' : 'date-line')).toContain(other ? 'separate rows' : 'recovery dates');

    group(d, 'pressure');
    go(d, 'pressure', 'final dial');
    expect(go(d, 'pressure-dial')).toContain('no value for the middle');
    expect(entry(d, 'pressure-pin').visible).toBe(false);
    go(d, 'pressure', 'trace facing');
    expect(go(d, 'pressure-trace')).toContain('Middle: two');
    go(d, 'pressure-pin', other ? 'three timed marks' : 'by the current');
    expect(go(d, other ? 'pressure-history' : 'pressure-current')).toContain(other ? 'temporary drop' : 'current four');

    group(d, 'models');
    go(d, 'models', other ? 'dated evidence trail' : 'handling copies');
    expect(go(d, other ? 'models-trail' : 'models-touch')).toContain(other ? 'actual journey' : 'under glass');

    group(d, 'counts');
    go(d, 'count', 'package tabs');
    expect(go(d, 'count-bundles')).toContain('six package positions');
    expect(entry(d, 'count-pin').visible).toBe(false);
    go(d, 'count', 'slide tallies');
    expect(go(d, 'count-slides')).toContain('97 recorded slides');
    go(d, 'count-pin', other ? 'accession tallies' : 'package tabs');
    expect(go(d, other ? 'count-study' : 'count-pack')).toContain(other ? 'check the count' : 'package places');

    group(d, 'signal');
    go(d, 'signal', 'toward the low');
    expect(go(d, 'signal-low')).toContain('unmarked back');
    go(d, 'signal', 'toward the far');
    expect(go(d, 'signal-high')).toContain('far post sees');
    go(d, 'signal-pin', other ? 'toward the far post' : 'tested low');
    expect(go(d, other ? 'signal-post' : 'signal-rail')).toContain(other ? 'runner puts a copy' : 'seated reader');

    group(d, 'water');
    go(d, 'water', other ? 'empty model bottle' : 'dated height');
    expect(go(d, other ? 'water-sample' : 'water-height')).toContain(other ? 'later date and location' : 'dated height');
    expect(d.done('depot.proof')).toBe(false);
    for (const objective of ['date', 'pressure', 'models', 'count', 'signal', 'water']) expect(d.done(`depot.${objective}`)).toBe(true);
  });
});
