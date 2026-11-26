import { describe, expect, it } from 'vitest';
import {
  TIMBUKTU_AUTHOR, TIMBUKTU_CARD, TIMBUKTU_EXHIBIT, TIMBUKTU_FLAG, TIMBUKTU_MARC, TIMBUKTU_OBJECTIVE, TIMBUKTU_SOURCE,
} from '../src/content/timbuktuManuscript';
import people from '../src/content/workshop-history-people.json';
import { firstVisiblePositions, HORIZON_VIEWS } from '../src/domain/timbuktuHorizon';
import { check } from '../src/domain/rules';
import { specimenReferences } from '../src/domain/specimenReferences';
import { MAPS } from '../src/maps';
import type { Interactable } from '../src/maps/types';
import { Driver } from './driver';

function prop(d: Driver, id: string): Interactable {
  const found = MAPS[d.s.mapId].interactables.find((entry) => entry.id === id);
  expect(found, id).toBeDefined();
  return found!;
}

const routes = [
  { name: 'quay', doors: ['coast-archive-return'], map: 'observatory.harbour' },
  { name: 'headland', doors: ['coast-archive-return', 'coast-headland-path'], map: 'observatory.station' },
] as const;
const key = 'loc:2021667561';
const displaySource = 'https://www.loc.gov/exhibits/mali/mali-exhibit.html#obj1';

describe('Past the Roof Line', () => {
  it('links the exact astronomical copy, the date of copying, and named documentary roles', () => {
    const d = new Driver();
    const book = d.e.pack.exhibits.find(({ id }) => id === TIMBUKTU_EXHIBIT)!;
    expect(book.specimen).toMatchObject({ key, institution: 'Library of Congress', accession: '2021667561',
      source: TIMBUKTU_SOURCE, objective: TIMBUKTU_OBJECTIVE });
    expect(book.dateText).toBe('Copy dated 1733');
    expect(book.summary).toContain('Mamma Haidara Commemorative Library in Timbuktu, Mali');
    expect(book.summary).toContain(TIMBUKTU_AUTHOR);
    expect(book.sources).toEqual([TIMBUKTU_SOURCE, TIMBUKTU_MARC]);
    expect(people[key].map((person) => person.source)).toEqual([TIMBUKTU_SOURCE, TIMBUKTU_SOURCE, TIMBUKTU_MARC]);
    expect(d.e.pack.sources.find(({ id }) => id === TIMBUKTU_MARC)?.url).toBe('https://lccn.loc.gov/2021667561/marcxml');
    expect(specimenReferences(d.e.pack).find((reference) => reference.key === key)?.url).toBe(displaySource);
  });

  it('holds the marker paths constant while checking the visible beginnings against each skyline', () => {
    expect(HORIZON_VIEWS[0].paths).toEqual(HORIZON_VIEWS[1].paths);
    expect(firstVisiblePositions(HORIZON_VIEWS[0])).toEqual([5, 6]);
    expect(firstVisiblePositions(HORIZON_VIEWS[1])).toEqual([3, 4]);
  });

  it.each(routes)('persists a separate $name handoff after the two readings', ({ name, doors, map }) => {
    const d = new Driver();
    d.s.mapId = 'observatory.archive';
    expect(check(prop(d, 'timbuktu-manuscript').visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('coast.revise');
    expect(check(prop(d, 'timbuktu-manuscript').visibleIf, d.s)).toBe(true);
    expect(check(prop(d, 'timbuktu-horizon-board').visibleIf, d.s)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: prop(d, 'timbuktu-manuscript').exhibit! });
    expect(d.s.cards).toContain(TIMBUKTU_CARD);
    expect(specimenReferences(d.e.pack, d.s).find((reference) => reference.key === key)).toBeUndefined();
    expect(check(prop(d, 'timbuktu-horizon-board').visibleIf, d.s)).toBe(true);

    d.run({ type: 'SetFlag', flag: `${TIMBUKTU_FLAG}.read.0`, value: true });
    d.run({ type: 'SetFlag', flag: `${TIMBUKTU_FLAG}.sent`, value: name });
    for (const id of doors) d.s.mapId = prop(d, id).to!.map;
    expect(d.s.mapId).toBe(map);
    const receiver = prop(d, `timbuktu-${name}-receiver`);
    expect(check(receiver.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: `${TIMBUKTU_FLAG}.read.1`, value: true });
    expect(check(receiver.visibleIf, d.s)).toBe(true);
    expect(check(receiver.artOpen!.if, d.s)).toBe(false);
    expect(d.s.objectivesDone).not.toContain(TIMBUKTU_OBJECTIVE);
    d.run({ type: 'SetFlag', flag: TIMBUKTU_OBJECTIVE, value: name });
    expect(check(receiver.artOpen!.if, d.s)).toBe(true);
    expect(d.s.objectivesDone).toContain(TIMBUKTU_OBJECTIVE);
    expect(specimenReferences(d.e.pack, d.s).find((reference) => reference.key === key)).toBeUndefined();
    d.s.mapId = 'observatory.archive';
    d.run({ type: 'ClaimSpecimen', exhibit: prop(d, 'timbuktu-manuscript').exhibit! });
    expect(specimenReferences(d.e.pack, d.s).find((reference) => reference.key === key)?.url).toBe(displaySource);
  });
});
