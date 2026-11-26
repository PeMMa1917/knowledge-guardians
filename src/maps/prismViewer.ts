import { PRISM_AVAILABLE, PRISM_EXHIBIT, PRISM_GROUP, PRISM_KEY, PRISM_REVISIT } from '../content/prismViewer';
import { PRISM_LENSES } from '../domain/prismViewer';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable } from './types';

export const PRISM_ANNEX: Interactable[] = [
  { id: 'prism-webb-case', kind: 'exhibit', exhibit: PRISM_EXHIBIT, x: 3, y: 11, w: 1, h: 1, art: 'prism.image',
    label: 'the Webb Tarantula Nebula image and filter note', walkThrough: true, visibleIf: PRISM_AVAILABLE },
  { id: 'prism-practice', kind: 'fieldgame', game: `${PRISM_GROUP}:view`, x: 7, y: 11, w: 1, h: 1, art: 'prism.image',
    label: 'the Annex’s three-band viewer', walkThrough: true, visibleIf: PRISM_AVAILABLE },
  ...PRISM_LENSES.map((lens, index): Interactable => ({
    id: `prism-reader-${lens}`, game: `${PRISM_GROUP}:${lens}`, kind: 'fieldgame', x: index === 0 ? 2 : 16, y: index === 0 ? 8 : 10, w: 1, h: 1,
    art: 'prism.image', walkThrough: true, label: lens === 'seam' ? 'Nell’s low drying rack' : 'Venn’s window tracing table',
    visibleIf: { any: [{ flag: 'prism.first', eq: lens }, { flag: `prism.fitted.${PRISM_LENSES[1 - index]}`, eq: true }] },
    artOpen: { key: `prism.${lens}`, if: { flag: `prism.fitted.${lens}`, eq: true } },
  })),
];

export const PRISM_STUDY: Interactable = {
  id: PRISM_REVISIT.prop, game: `${PRISM_GROUP}:access`, kind: 'fieldgame', x: 12, y: 11, w: 1, h: 1, walkThrough: true,
  art: 'prism.image', label: 'the Study’s dim reading light', visibleIf: specimenEquipped(PRISM_KEY),
  artBy: { flag: 'prism.access', keys: { key: 'prism.dots', grey: 'prism.mono' } },
};
