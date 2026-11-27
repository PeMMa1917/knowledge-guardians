import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const display = MAPS['nexus.archive'].interactables.filter(({ id }) => id.startsWith('fourth-corner-'));

function visible(d: Driver, id: string) {
  return display.find((prop) => prop.id === 'fourth-corner-' + id && check(prop.visibleIf, d.s));
}

const compare = 'corner.compare';
const receive = 'corner.receive';

describe('The Fourth Corner', () => {
  it('opens a hidden repair shelf and keeps the display closed until both fitting methods and the source are checked', () => {
    const d = new Driver();
    d.walk('cold.open', ['Copy the stand number']);
    expect(d.done('m01.o1.look')).toBe(false);
    expect(display.filter((prop) => check(prop.visibleIf, d.s)).map(({ id }) => id)).toEqual(['fourth-corner-frame']);
    expect(d.e.visibleOptions('corner.try', d.s)).toHaveLength(0);
    d.walk(visible(d, 'frame')!.node!, ['Lift the loose corner']);
    expect(visible(d, 'order')).toBeDefined();
    expect(visible(d, 'inserts')?.art).toBe('corner.old');
    expect(visible(d, 'review')).toBeUndefined();
    d.run({ type: 'EnterNode', node: visible(d, 'inserts')!.node! });
    expect(d.s.flags['corner.preview']).toBeUndefined();
    d.walk(visible(d, 'inserts')!.node!, ['Turn the square insert']);
    expect(visible(d, 'repeat-preview')?.art).toBe('corner.repeat');

    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(visible(d, 'repeat-preview')).toBeDefined();
    expect(d.e.visibleOptions('corner.try', d.s).map(({ index }) => index)).toEqual([1]);
    d.walk(visible(d, 'repeat-preview')!.node!, ['Slide the clipped insert']);
    expect(visible(d, 'cut-preview')?.art).toBe('corner.cut');
    expect(d.e.visibleOptions('corner.choose', d.s)).toHaveLength(0);
    expect(d.done(compare)).toBe(false);
    d.walk(visible(d, 'order')!.node!, ['Pin the dated order']);
    expect(d.done(compare)).toBe(true);
    expect(visible(d, 'review')).toBeDefined();
    expect(d.e.node('corner.order').text).toContain('no date or sketch for the first weaving');
  });

  it.each([
    ['repeat', 'the complete repeat', 'cutting-rail', 'Hold the tracing', 'rehearsal-cloth', 'cloth', 'stitch-shelf'],
    ['gap', 'the repair order beside', 'stitch-shelf', 'Hold the cord', 'liftable-sample', 'sample', 'cutting-rail'],
  ])('publishes %s and leaves the matching physical result', (route, choice, station, action, receipt, art, other) => {
    const d = new Driver();
    d.walk('corner.frame', ['Lift the loose corner']);
    d.walk('corner.order', ['Pin the dated order']);
    d.walk('corner.try', ['Slide the clipped insert']);
    expect(d.done(compare)).toBe(false);
    d.walk('corner.try', ['Turn the square insert']);
    expect(d.done(compare)).toBe(true);
    expect(d.e.visibleOptions('corner.choose', d.s)).toHaveLength(2);
    d.walk(visible(d, 'review')!.node!, [choice]);

    expect(d.done(receive)).toBe(false);
    expect(visible(d, other)).toBeUndefined();
    expect(visible(d, 'hung-' + route)).toBeDefined();
    const response = visible(d, station)!;
    const credits = d.p.credit;
    d.walk(response.node!, [action]);
    expect(d.p.credit).toEqual(credits);
    expect(d.s.flags['corner.checked']).toBe(route);
    expect(d.done(receive)).toBe(true);
    expect(visible(d, station)).toBeUndefined();
    expect(visible(d, receipt)).toMatchObject({ x: response.x, y: response.y, art: 'corner.' + art });
    expect(d.e.visibleOptions('corner.choose', d.s)).toHaveLength(0);
  });

  it('provides distinct art, progressive clues and narrow vocabulary sources', () => {
    const pack = buildPack();
    expect(new Set(display.map(({ art }) => art)).size).toBe(9);
    for (const prop of display) expect(artKeys()).toContain(prop.art);
    for (const objective of [compare, receive]) {
      expect(pack.hints.filter((hint) => hint.objective === objective).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
    }
    for (const term of ['trace', 'symmetry']) {
      const source = pack.sources.find(({ id }) => id === 'LEX-CORNER-' + term.toUpperCase())!;
      expect(source.url).toBe('https://www.ahdictionary.com/word/search.html?q=' + term);
      expect(pack.glossary.find(({ id }) => id === term)?.history?.url).toBe(source.url);
      expect(pack.dialogue.some(({ citationSource }) => citationSource === source.id)).toBe(true);
    }
  });
});
