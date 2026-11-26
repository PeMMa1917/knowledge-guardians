import { SKIFF_BERTHS, SKIFF_LOADS } from '../domain/islandSkiff';
import type { Interactable } from './types';

export const SKIFF_LANDINGS = {
  stair: { map: 'island.margin', x: 7, y: 11 },
  ramp: { map: 'island.margin', x: 20, y: 12 },
} as const;

export const ISLAND_SKIFF_LAUNCH: Interactable = {
  id: 'island-skiff-launch', kind: 'fieldgame', game: 'island-skiff', x: 22, y: 15, w: 1, h: 1,
  label: 'Joss’s skiff at the lower landing', art: 'sea.skiff', walkThrough: true, visibleIf: { objective: 'island.finish' },
};

export const ISLAND_SKIFF_RECEIVERS: Interactable[] = SKIFF_BERTHS.flatMap((berth) => SKIFF_LOADS.map((load) => ({
  id: `island-skiff-landing-${berth}-${load}`, kind: 'sign', x: SKIFF_LANDINGS[berth].x, y: SKIFF_LANDINGS[berth].y - 1, w: 1, h: 1,
  label: berth === 'stair' ? 'the north stair’s signed receiving slip' : 'the south ramp’s signed receiving slip',
  text: (load === 'bundles' ? 'Two wrapped bundles arrived.' : 'Three tool crates arrived.') + (berth === 'stair'
    ? ' The shelter crew signs at the stair. They carry each load up. The cart stays available to the ramp crew.'
    : ' The ramp crew signs at the cart. Both crews can reach the ledge without taking the stair. This load takes the cart’s last trip. The other runner waits.'),
  art: berth === 'stair' ? 'island.card' : 'preserved.display-paired', walkThrough: true,
  visibleIf: { flag: `island.skiff.delivery.${berth}.load`, eq: load },
  flag: `island.skiff.received.${berth}`,
})));
