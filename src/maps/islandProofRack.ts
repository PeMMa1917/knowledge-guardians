import { ISLAND_PROOF_KEYS, ISLAND_PROOF_TOOL, islandProofFlag, islandProofProp,
  type IslandProofCase, type IslandProofRoute } from '../domain/islandProofRack';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable } from './types';

function tile(x: number, y: number) {
  return { x, y, w: 1, h: 1, walkThrough: true };
}

function rack(id: IslandProofCase, x: number, y: number, label: string): Interactable {
  return { ...tile(x, y), id: islandProofProp(id), kind: 'fieldgame', game: `${ISLAND_PROOF_TOOL}${id}`,
    label, art: 'preserved.display-paired', visibleIf: specimenEquipped(ISLAND_PROOF_KEYS[id]) };
}

function receiver(id: IslandProofCase, route: IslandProofRoute, x: number, y: number, label: string, art: string): Interactable {
  const planned = { flag: islandProofFlag(id, 'plan'), eq: route } as const;
  const served = { flag: islandProofFlag(id, 'served'), eq: route } as const;
  return { ...tile(x, y), id: `${islandProofProp(id)}-${route}`, kind: 'scene', node: islandProofFlag(id, `receive.${route}`),
    label, art, artOpen: { key: 'departure.strip', if: served },
    visibleIf: { any: [served, { all: [specimenEquipped(ISLAND_PROOF_KEYS[id]), { objective: islandProofFlag(id, 'checked') }, planned] }] } };
}

export const ISLAND_SPECIMEN_RACKS: Interactable[] = [
  rack('paired-views', 20, 7, 'Ivo’s three-slot cart rack'),
  rack('scale-bar', 7, 9, 'Ivo’s pocket with two scale prints'),
];

export const ISLAND_SPECIMEN_DOCK: Interactable[] = [
  receiver('paired-views', 'dock', 14, 11, 'Joss’s cart tally by the pier', 'island.card'),
  receiver('scale-bar', 'dock', 11, 8, 'Joss’s measured sleeve by the loading card', 'fold.strip'),
];

export const ISLAND_SPECIMEN_MARGIN: Interactable[] = [
  receiver('paired-views', 'margin', 8, 10, 'Ivo’s one-job tray with two envelopes', 'preserved.display-paired'),
  receiver('scale-bar', 'margin', 20, 9, 'Ivo’s two matched prints at the low stand', 'fold.paired'),
];
