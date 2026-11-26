import {
  BEATER_CARRY, BEATER_GAME, BEATER_KEY, BEATER_PLACEMENT, BEATER_PRESS_PROP,
} from '../domain/beaterProof';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable } from './types';

export const BEATER_WORKROOM_PRESS: Interactable = {
  id: BEATER_PRESS_PROP, kind: 'fieldgame', game: `${BEATER_GAME}press`, x: 15, y: 11, w: 1, h: 1,
  label: 'the plain two-face proof block', art: 'preserved.catalogue', walkThrough: true,
  visibleIf: specimenEquipped(BEATER_KEY),
};

export const BEATER_COLD_STORE: Interactable[] = [
  { id: 'beater-proof-fitting', kind: 'fieldgame', game: `${BEATER_GAME}fitting`, x: 18, y: 13, w: 1, h: 1,
    label: 'Aster’s fitting table for the paired strips', art: 'preserved.folder', walkThrough: true,
    visibleIf: { all: [{ flagSet: BEATER_CARRY }, { not: { flagSet: BEATER_PLACEMENT } }] } },
  { id: 'beater-proof-rail', kind: 'fieldgame', game: `${BEATER_GAME}rail`, x: 21, y: 15, w: 1, h: 1,
    label: 'the paired proof and spare strip at the low rail', art: 'preserved.display-paired', walkThrough: true,
    visibleIf: { flag: BEATER_PLACEMENT, eq: 'rail' } },
  { id: 'beater-proof-bench', kind: 'fieldgame', game: `${BEATER_GAME}bench`, x: 24, y: 14, w: 1, h: 1,
    label: 'the staffed proof block at the east bench', art: 'preserved.display-records', walkThrough: true,
    visibleIf: { flag: BEATER_PLACEMENT, eq: 'bench' } },
];
