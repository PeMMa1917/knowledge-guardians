import { describe, expect, it } from 'vitest';
import { JIG_CASES, JIG_RETURN, JIG_SHOP, type JigMode } from '../src/content/jigShop';
import people from '../src/content/jig-shop-people.json';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { JIG_SHOP_ART } from '../src/ui/jigShopArt';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  const here = MAPS[d.s.mapId].interactables.find((entry) => entry.id === `jig-shop-${id}`);
  if (!here) throw new Error(`Missing ${id} in ${d.s.mapId}`);
  return here;
}

function use(d: Driver, id: string, choice?: string) {
  const here = prop(d, id);
  expect(check(here.visibleIf, d.s), id).toBe(true);
  if (here.node) d.walk(here.node, choice ? [choice] : []);
  if (here.exhibit) d.run({ type: 'InspectExhibit', exhibit: here.exhibit });
  if (here.flag) d.run({ type: 'SetFlag', flag: here.flag, value: true });
  if (here.to) d.s.mapId = here.to.map;
  return here;
}

function closedLanes(d: Driver) {
  return (MAPS[JIG_SHOP].conditionalBlocks ?? []).filter(({ when }) => check(when, d.s)).map(({ x, y }) => `${x},${y}`);
}

describe('The Parts You Can Replace', () => {
  it('renders a distinct case diagram for every record and describes the catalogue forms', () => {
    const d = new Driver();
    const pixelIdentities = new Set<string>();
    const singledOut = new Set([
      'portslade-anvil', 'hirata-workholder', 'garrett-guard-model',
      'jarboe-plate-vise', 'concave-plane', 'angell-loom-temple',
    ]);
    for (const entry of JIG_CASES) {
      const [width, height, draw] = JIG_SHOP_ART[entry.art];
      const cells = Array<string>(width * height).fill('');
      const brush = {
        fillStyle: '',
        fillRect(x: number, y: number, w: number, h: number) {
          for (let row = y; row < y + h; row++) {
            cells.fill(this.fillStyle, row * width + x, row * width + x + w);
          }
        },
      };
      draw(brush as CanvasRenderingContext2D);
      const identity = cells.join(',');
      expect(pixelIdentities.has(identity), entry.accession).toBe(false);
      pixelIdentities.add(identity);
      if (singledOut.has(entry.slug)) {
        const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
        expect(entry.artDescription, entry.accession).toBeTruthy();
        expect(exhibit?.altText).toBe(entry.artDescription);
      }
    }
  });

  it('keeps a distinct dated placement for each of 40 exact records and validates the physical lanes', () => {
    const d = new Driver();
    d.s.mapId = 'metalworks.yard';
    expect(check(prop(d, 'door').visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('metal.arrival');
    use(d, 'door');
    expect(d.s.mapId).toBe(JIG_SHOP);
    expect(JIG_CASES).toHaveLength(40);
    expect(new Set(JIG_CASES.map(({ institution }) => institution)).size).toBe(4);
    const positions = new Set<string>();
    for (const entry of JIG_CASES) {
      expect(d.e.pack.sources.find(({ id }) => id === entry.source)?.url).toBe(entry.url);
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit?.specimen?.accession).toBe(entry.accession);
      expect(exhibit?.dateText).toBe(entry.date);
      const credited = (people as Record<string, { source: string }[]>)[entry.key];
      if (credited) expect(exhibit?.specimen?.people).toMatchObject(credited);
      const { x, y } = prop(d, `${entry.slug}-case`);
      expect(positions.has(`${x},${y}`)).toBe(false);
      positions.add(`${x},${y}`);
    }
    const map = MAPS[JIG_SHOP];
    const bridge = Array.from({ length: map.width }, (_, x) => map.floor(x, 31) === null ? null : x).filter((x) => x !== null);
    expect(bridge).toEqual([14, 26]);
    expect(closedLanes(d)).toEqual(['14,31', '26,31']);
    use(d, 'exit');
    expect(d.s.mapId).toBe('metalworks.yard');
  });

  it.each(JIG_CASES)('offers the common and fitted paths for $accession, then takes the checked loan south of Hesper’s bench', (entry) => {
    const d = new Driver();
    d.s.objectivesDone.push('metal.arrival');
    d.s.mapId = JIG_SHOP;
    const propName = (suffix: string) => `${entry.slug}-${suffix}`;
    expect(check(prop(d, propName('sample')).visibleIf, d.s)).toBe(false);
    use(d, propName('case'));
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit })).toThrow('Finish the object’s quest first');
    use(d, propName('sample'), 'Carry this case’s practice blank');
    expect(closedLanes(d)).toEqual(['14,31', '26,31']);
    const first: JigMode = entry.family === 'hold' ? 'fitted' : 'common';
    const other: JigMode = first === 'common' ? 'fitted' : 'common';
    use(d, propName('fit'), entry[`${first}Action`]);
    expect(closedLanes(d)).toEqual([first === 'common' ? '26,31' : '14,31']);
    expect(check(prop(d, propName(other)).visibleIf, d.s)).toBe(false);
    expect(d.done(entry.checked)).toBe(false);
    expect(use(d, propName(first)).text).toBe(entry[`${first}Result`]);
    expect(d.done(entry.checked)).toBe(true);
    use(d, propName('fit'), entry[`${other}Action`]);
    expect(closedLanes(d)).toEqual([other === 'common' ? '26,31' : '14,31']);
    expect(use(d, propName(other)).text).toBe(entry[`${other}Result`]);
    d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit });
    expect(d.s.inventory[specimenItemId(entry.key)]).toBe(1);

    d.s.mapId = JIG_RETURN;
    expect(check(prop(d, propName('return')).visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(entry.key) });
    use(d, propName('return'), 'Keep the loan in hand');
    expect(check(prop(d, propName('bench')).visibleIf, d.s)).toBe(false);
    expect(check(prop(d, propName('tray')).visibleIf, d.s)).toBe(false);
    const mode = first === 'common' ? 'bench' : 'tray';
    use(d, propName('return'), entry[mode]);
    expect(d.done(entry.returned)).toBe(false);
    expect(use(d, propName(mode)).text).toContain(entry.limit);
    expect(d.done(entry.returned)).toBe(true);

    d.s.mapId = SPECIMEN_BASE;
    d.run({ type: 'CarrySpecimen', carry: false, key: entry.key });
    d.s.mapId = JIG_RETURN;
    expect(check(prop(d, propName('return')).visibleIf, d.s)).toBe(false);
    expect(check(prop(d, propName(mode)).visibleIf, d.s)).toBe(true);
  });
});
