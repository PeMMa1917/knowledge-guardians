import { PERKINS_KEY, PERKINS_REVISIT } from '../content/readingWorks';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const marked: Condition = { flag: 'reading-works.perkins.cold.used', eq: true };

export const PERKINS_COLD_REVISIT: Interactable[] = [
  { id: PERKINS_REVISIT.prop, kind: 'scene', node: 'reading-works.perkins.cold', x: 20, y: 13, w: 1, h: 1,
    label: 'the two author slips at the east bench', art: 'reading-works.perkins-procede', walkThrough: true, sfx: 'sfx.page',
    visibleIf: { all: [specimenEquipped(PERKINS_KEY), { not: marked }] } },
  { id: 'perkins-cold-two-stops', kind: 'scene', node: 'reading-works.perkins.cold-reply', x: 20, y: 13, w: 1, h: 1,
    label: 'the raised stops for author and copyist', art: 'reading-works.perkins-procede.second', walkThrough: true,
    visibleIf: marked },
];
