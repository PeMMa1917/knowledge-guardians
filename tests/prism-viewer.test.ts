import { describe, expect, it } from 'vitest';
import { PRISM_AVAILABLE, PRISM_DONE, PRISM_EXHIBIT, PRISM_KEY, PRISM_RETURN } from '../src/content/prismViewer';
import { PRISM_LENSES, PRISM_PIXELS, prismColour, prismMove, prismProgress, prismTone, type PrismMove } from '../src/domain/prismViewer';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { PRISM_ANNEX, PRISM_STUDY } from '../src/maps/prismViewer';
import { Driver } from './driver';

function move(d: Driver, action: PrismMove) {
  const effect = prismMove(d.s.flags, action);
  expect(effect).toBeDefined();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}

describe('Three Bands Through One Window', () => {
  it('uses the same 36 readings to emphasise a seam or three isolated short-band marks', () => {
    const before = PRISM_PIXELS.map((pixel) => [...pixel]);
    const seam = PRISM_PIXELS[14];
    const pinhole = PRISM_PIXELS[16];
    expect(seam).toEqual([0, 2, 4]);
    expect(pinhole).toEqual([4, 2, 0]);
    expect(PRISM_PIXELS.filter(([short]) => short >= 3)).toHaveLength(3);
    expect(prismColour(seam, 'seam')[1]).toBeGreaterThan(prismColour(seam, 'dots')[1]);
    expect(prismColour(pinhole, 'dots')[0]).toBeGreaterThan(prismColour(pinhole, 'seam')[0]);
    expect(prismTone(seam)).toBe(prismTone(pinhole));
    expect(PRISM_PIXELS).toEqual(before);
  });

  it('keeps the exact observation credit and equivalent filters separate from the practice readings', () => {
    const d = new Driver();
    const e = d.e.pack.exhibits.find(({ id }) => id === PRISM_EXHIBIT);
    expect(e).toMatchObject({ dateText: '6 September 2022', dateKind: expect.stringContaining('Release date'),
      sources: ['HIS-PRISM-WEBB', 'HIS-PRISM-NASA'], specimen: { key: PRISM_KEY, objective: PRISM_DONE,
        pixelAsset: 'specimens/webb-weic2212a.jpg', revisit: { map: 'aethelgard.study', prop: PRISM_STUDY.id } } });
    expect(d.e.pack.sources.find(({ id }) => id === 'HIS-PRISM-NASA')?.supports).toContain('F444W red');
    expect(check(PRISM_AVAILABLE, d.s)).toBe(false);
    d.s.flags['study.letter'] = true;
    expect(check(PRISM_AVAILABLE, d.s)).toBe(true);
    expect(MAPS['aethelgard.shelf-room'].interactables).toEqual(expect.arrayContaining(PRISM_ANNEX));
    expect(MAPS['aethelgard.study'].interactables).toContain(PRISM_STUDY);
  });

  it.each(PRISM_LENSES)('uses %s first, fits each receiver and preserves an equipped dim-light adjustment', (first) => {
    const d = new Driver();
    d.s.flags['study.letter'] = true;
    d.run({ type: 'InspectExhibit', exhibit: PRISM_EXHIBIT });
    const other = first === 'seam' ? 'dots' : 'seam';
    const finish = first === 'seam' ? 'key' : 'grey';
    const firstProp = PRISM_ANNEX.find(({ id }) => id === `prism-reader-${first}`)!;
    const otherProp = PRISM_ANNEX.find(({ id }) => id === `prism-reader-${other}`)!;
    move(d, { kind: 'view', lens: first });
    expect(prismMove(d.s.flags, { kind: 'send', lens: first })).toBeUndefined();
    move(d, { kind: 'view', lens: other });
    move(d, { kind: 'send', lens: first });
    expect(prismProgress(d.s.flags).first).toBe(first);
    expect(check(firstProp.visibleIf, d.s)).toBe(true);
    expect(check(otherProp.visibleIf, d.s)).toBe(false);
    expect(prismMove(d.s.flags, { kind: 'fit', lens: other })).toBeUndefined();
    move(d, { kind: 'fit', lens: first });
    expect(check(firstProp.artOpen?.if, d.s)).toBe(true);
    expect(check(otherProp.visibleIf, d.s)).toBe(true);
    expect(d.done(PRISM_DONE)).toBe(false);
    move(d, { kind: 'fit', lens: other });
    expect(check(otherProp.artOpen?.if, d.s)).toBe(true);
    expect(d.done(PRISM_DONE)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: PRISM_EXHIBIT });
    expect(check(PRISM_STUDY.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(PRISM_KEY) });
    expect(check(PRISM_STUDY.visibleIf, d.s)).toBe(true);
    move(d, { kind: 'preview', method: 'key' });
    expect(prismMove(d.s.flags, { kind: 'install', method: finish })).toBeUndefined();
    move(d, { kind: 'preview', method: 'grey' });
    move(d, { kind: 'install', method: finish });
    expect(prismProgress(d.s.flags).access).toBe(finish);
    expect(d.done(PRISM_RETURN)).toBe(true);
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(check(PRISM_STUDY.visibleIf, d.s)).toBe(false);
    expect(d.done(PRISM_RETURN)).toBe(true);
  });
});
