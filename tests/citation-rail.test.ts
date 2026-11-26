import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { mlaCitation } from '../src/domain/mla';
import { check } from '../src/domain/rules';
import { validateContent } from '../src/domain/validate';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const prefix = 'citation.rail.';
const comb = 'item.source-rail-comb';

function mapProp(d: Driver, id: string) {
  const item = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id);
  expect(item, id).toBeDefined();
  return item!;
}

function available(d: Driver, id: string) {
  return check(mapProp(d, id).visibleIf, d.s);
}

function scene(d: Driver, key: string, ...choices: string[]) {
  const id = prefix + key;
  expect(available(d, id), id).toBe(true);
  d.walk(mapProp(d, id).node!, choices);
}

function cross(d: Driver, id: string) {
  const door = mapProp(d, id);
  expect(available(d, id) && check(door.openIf, d.s), id).toBe(true);
  expect(door.to, id).toBeDefined();
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to!.map;
}

function options(d: Driver, key: string) {
  return d.e.visibleOptions(prefix + key, d.s).map(({ option }) => option.text);
}

describe('The Line a Reader Can Follow and A Sunset on the Proof', () => {
  it('prints an undated catalogue page and a separately credited online artwork in MLA order', () => {
    const pack = buildPack();
    const page = pack.sources.find(({ id }) => id === 'HIS-MET-RONTGEN-A606881')!;
    const artwork = pack.sources.find(({ id }) => id === 'HIS-COPIES-TURNER-NG524')!;
    expect(pack.sources.filter(({ url }) => url === page.url)).toEqual([page]);
    const photoLine = mlaCitation(page);
    expect(photoLine.map(({ text }) => text).join('')).toBe(
      `“Photograph of a Radiograph of Hand Taken by Wilhelm Conrad Röntgen, Germany, 1895.” Science Museum Group Collection, ${page.url.slice(8)}. Accessed 26 Nov. 2026.`,
    );
    expect(photoLine.filter(({ cite }) => cite).map(({ text }) => text)).toEqual(['Science Museum Group Collection']);
    expect(photoLine.filter(({ href }) => href)).toEqual([{ text: page.url.slice(8), href: page.url }]);
    expect(page.mla?.author).toBeUndefined();
    expect(page.mla?.workDate).toBeUndefined();

    const turnerLine = mlaCitation(artwork);
    expect(turnerLine.map(({ text }) => text).join('')).toBe(
      `Turner, Joseph Mallord William. The Fighting Temeraire. 1839. The National Gallery, ${artwork.url.slice(8)}.`,
    );
    expect(turnerLine.filter(({ cite }) => cite).map(({ text }) => text)).toEqual(['The Fighting Temeraire', 'The National Gallery']);
    expect(turnerLine.filter(({ href }) => href)).toEqual([{ text: artwork.url.slice(8), href: artwork.url }]);
  });

  it('rejects a citation to an unformatted source and an artwork date in a page entry', () => {
    const pack = structuredClone(buildPack());
    const source = pack.sources.find(({ id }) => id === 'HIS-MET-RONTGEN-A606881')!;
    const sample = pack.dialogue.find(({ id }) => id === prefix + 'nexus.proof')!;
    sample.citationSource = pack.sources.find(({ mla }) => !mla)!.id;
    source.mla = { ...source.mla!, workDate: '1895' };
    expect(validateContent(pack)).toEqual(expect.arrayContaining([
      expect.stringContaining('unknown MLA source'),
      expect.stringContaining('an artwork date belongs to the artwork entry'),
    ]));
  });

  it.each([
    ['under', 'sheet'], ['under', 'index'], ['shelf', 'sheet'], ['shelf', 'index'],
  ])('checks a %s Nexus proof and independently a %s Copies proof', (nexus, copies) => {
    const d = new Driver();
    expect(available(d, 'copies-door')).toBe(false);
    expect(available(d, prefix + 'nexus.drawer')).toBe(false);
    expect(available(d, prefix + 'nexus.shelf')).toBe(false);
    expect(d.s.inventory[comb]).toBeUndefined();
    scene(d, 'nexus.request', 'Put the blank');
    expect(options(d, 'nexus.tray')).toEqual(['Back from the tray.']);
    // Collect the parts separately. Reading the tray or one part cannot print the proof.
    scene(d, 'nexus.drawer', 'Copy the collection', 'Set the record');
    expect(options(d, 'nexus.tray')).toEqual(['Back from the tray.']);
    scene(d, 'nexus.drawer', 'Lift the exact', 'Set the record');
    scene(d, 'nexus.tray', 'Seat the two slips', nexus === 'under' ? 'Mount the full strip' : 'Clip the short tag');
    expect(d.s.flags[prefix + 'nexus.layout']).toBe(nexus);
    expect(d.done(prefix + 'nexus.found')).toBe(false);
    if (nexus === 'under') {
      expect(available(d, prefix + 'nexus.shelf')).toBe(false);
      scene(d, 'nexus.under', 'Open the referenced record');
    } else {
      expect(options(d, 'nexus.shelf')).toEqual(['Leave the slip flat on the shelf.']);
      scene(d, 'nexus.tag', 'Carry the matching tag');
      scene(d, 'nexus.shelf', 'Match the tag');
    }
    expect(d.s.inventory[comb]).toBe(1);
    expect(d.done(prefix + 'nexus.found')).toBe(true);
    expect(available(d, prefix + `nexus.${nexus}-done`)).toBe(true);
    scene(d, `nexus.${nexus}-done`);
    expect(d.s.inventory[comb]).toBe(1);

    // Stage only the earlier main chapter. All new choices run through normal scene conditions.
    d.s.objectivesDone.push('metal.finish');
    d.s.flags['copies.response'] = 'strip';
    cross(d, 'copies-door');
    cross(d, 'copies-press-path');
    expect(available(d, prefix + 'copies.request')).toBe(true);
    scene(d, 'copies.request', 'Fit the source comb');
    expect(options(d, 'copies.tray')).toEqual(['Keep the type in the rack.']);
    scene(d, 'copies.compare', 'Slide the arrival');
    expect(options(d, 'copies.tray')).toEqual(['Keep the type in the rack.']);
    scene(d, 'copies.object', 'Set Turner’s name');
    scene(d, 'copies.tray', copies === 'sheet' ? 'Pull a full correction' : 'Set a narrow card');
    expect(d.s.flags[prefix + 'copies.layout']).toBe(copies);
    expect(d.done(prefix + 'copies.found')).toBe(false);
    if (copies === 'sheet') {
      expect(available(d, prefix + 'copies.tag')).toBe(false);
      scene(d, 'copies.sheet', 'Trace the source line');
      expect(available(d, prefix + 'copies.sheet-done')).toBe(true);
      cross(d, 'copies-press-return');
      expect(available(d, prefix + 'copies.index')).toBe(false);
    } else {
      expect(available(d, prefix + 'copies.sheet')).toBe(false);
      expect(options(d, 'copies.index')).toEqual(['Leave the two lines face up.']);
      scene(d, 'copies.tag', 'Carry “Turner, NG524”');
      cross(d, 'copies-press-return');
      scene(d, 'copies.index', 'Match Turner and NG524');
      expect(available(d, prefix + 'copies.index-done')).toBe(true);
    }
    expect(d.s.journal).toContain('j.citation.rail.nexus');
    expect(d.s.journal).toContain('j.citation.rail.copies');
    expect(d.done(prefix + 'copies.found')).toBe(true);
    expect(d.s.flags['copies.response']).toBe('strip');
  });
});
