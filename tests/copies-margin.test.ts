import { describe, expect, it } from 'vitest';
import { vignettesFor } from '../src/domain/epilogue';
import { check } from '../src/domain/rules';
import { COPIES_LANDING, COPIES_PRESS } from '../src/maps/copies';
import { COUNCIL_GALLERY } from '../src/maps/council';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

function visible(d: Driver, map: MapDef, id: string) {
  return map.interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

function use(d: Driver, map: MapDef, id: string, ...picks: string[]) {
  const prop = visible(d, map, id);
  if (!prop) throw new Error(`Unavailable prop ${id}`);
  d.s.mapId = map.id;
  if (prop.node) d.walk(prop.node, picks);
  else if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function pullProofs(d: Driver) {
  use(d, COPIES_PRESS, 'copies.margin.wide', 'Slide in a full sheet');
  expect(visible(d, COPIES_PRESS, 'copies-margin-wide-proof')).toBeDefined();
  expect(visible(d, COPIES_PRESS, 'copies-margin-press-tray')).toBeUndefined();
  use(d, COPIES_PRESS, 'copies.margin.short', 'Slide in a short sheet');
  expect(visible(d, COPIES_PRESS, 'copies-margin-short-proof')).toBeDefined();
  expect(d.done('copies.margin.compare')).toBe(false);
  expect(visible(d, COPIES_PRESS, 'copies-margin-press-tray')).toBeUndefined();
  use(d, COPIES_LANDING, 'copies-margin-master');
  expect(d.done('copies.margin.compare')).toBe(true);
}

describe('The Crooked Margin', () => {
  it('lets players walk away during the comparison and change a bundle before sending it', () => {
    const d = new Driver();
    use(d, COPIES_PRESS, 'copies.margin.short', 'Leave the guide alone');
    expect(visible(d, COPIES_PRESS, 'copies-margin-short-proof')).toBeUndefined();
    pullProofs(d);
    use(d, COPIES_PRESS, 'copies-margin-press-tray', 'Fold the full order');
    use(d, COPIES_LANDING, 'copies-margin-fold', 'Keep the sheet folded');
    expect(d.done('copies.margin.deliver')).toBe(false);
    expect(vignettesFor(d.s)).toEqual([]);
    use(d, COPIES_PRESS, 'copies-margin-press-tray', 'Clip a turn arrow');
    expect(visible(d, COPIES_LANDING, 'copies-margin-fold')).toBeUndefined();
    expect(visible(d, COPIES_LANDING, 'copies-margin-pair')).toBeDefined();
  });

  it.each([
    ['fold', 'Fold the full order', 'Tie the lower fold', 'folded', 'whole sheet'],
    ['pair', 'Clip a turn arrow', 'Hang the arrow', 'paired', 'matched strips'],
    ['wait', 'Hand back the proofs', '', 'held', 'spare caller'],
  ])('saves the %s outcome in the landing, Council rack and epilogue', (route, pick, action, proof, ending) => {
    const d = new Driver();
    const xp = d.p.credit;
    pullProofs(d);
    use(d, COPIES_PRESS, 'copies-margin-press-tray', pick);
    if (route !== 'wait') {
      expect(visible(d, COUNCIL_GALLERY, `council-${proof}-ramp-proof`)).toBeUndefined();
      use(d, COPIES_LANDING, `copies-margin-${route}`, action);
    }
    expect(d.s.flags['copies.margin.sent']).toBe(route);
    expect(d.done('copies.margin.deliver')).toBe(true);
    expect(d.s.journal).toContain('j.copies.margin');
    expect(visible(d, COPIES_LANDING, `copies-margin-${route === 'wait' ? 'waited' : proof}`)).toBeDefined();
    expect(COUNCIL_GALLERY.interactables.filter((prop) => prop.id.endsWith('-ramp-proof') && check(prop.visibleIf, d.s))
      .map((prop) => prop.id)).toEqual([`council-${proof}-ramp-proof`]);
    expect(vignettesFor(d.s).find((v) => v.who === 'Printer Lark')?.text).toContain(ending);
    expect(visible(d, COPIES_PRESS, 'copies-margin-press-tray')).toBeUndefined();
    expect(d.s.flags['copies.response']).toBeUndefined();
    expect(d.p.credit).toEqual(xp);
  });
});
