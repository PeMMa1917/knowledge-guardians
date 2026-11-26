import {
  JOINED_CLOTH_DESTINATION, JOINED_CLOTH_GAME, JOINED_CLOTH_KEY, JOINED_CLOTH_PROP, JOINED_CLOTH_USED,
} from '../domain/joinedCloth';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable } from './types';

export const JOINED_CLOTH_FRAME: Interactable = {
  id: JOINED_CLOTH_PROP, kind: 'fieldgame', game: `${JOINED_CLOTH_GAME}frame`, x: 24, y: 6, w: 1, h: 1,
  label: 'the practice cover on two panels', art: 'preserved.catalogue', walkThrough: true,
  visibleIf: specimenEquipped(JOINED_CLOTH_KEY),
};

export const JOINED_CLOTH_RACK: Interactable = {
  id: 'joined-cloth-rack', kind: 'fieldgame', game: `${JOINED_CLOTH_GAME}rack`, x: 7, y: 12, w: 1, h: 1,
  label: 'the covered rack for two draft sheets', art: 'preserved.folder', walkThrough: true,
  visibleIf: { flag: JOINED_CLOTH_DESTINATION, eq: 'rack' },
  artOpen: { key: 'preserved.display-paired', if: { flag: JOINED_CLOTH_USED, eq: 'rack' } },
};

export const JOINED_CLOTH_LEDGE: Interactable = {
  id: 'joined-cloth-ledge', kind: 'fieldgame', game: `${JOINED_CLOTH_GAME}ledge`, x: 27, y: 7, w: 1, h: 1,
  label: 'the outside shelf with separate supports', art: 'island.card', walkThrough: true,
  visibleIf: { flag: JOINED_CLOTH_DESTINATION, eq: 'ledge' },
  artOpen: { key: 'preserved.display-records', if: { flag: JOINED_CLOTH_USED, eq: 'ledge' } },
};
