import { starStation, starStationOpen } from '../content/starPaths';
import { STAR_GAME, STAR_METHODS, starFlag } from '../domain/starPaths';
import type { Interactable } from './types';

export function starStations(id: string, board: [number, number], notice: [number, number]): Interactable[] {
  const site = starStation(id);
  if (!site) throw new Error(`Unknown star path: ${id}`);
  const readbacks = site.path.skills.flatMap((skill) => STAR_METHODS.map((value) => ({ flag: `${starFlag(site.path, skill)}.layout`, eq: value })));
  return [
    { id: `star-path-board-${id}`, kind: 'fieldgame', game: `${STAR_GAME}${id}:work`, x: board[0], y: board[1], w: 1, h: 1,
      label: site.name, art: 'ledger', walkThrough: true, visibleIf: starStationOpen(site) },
    { id: `star-path-notice-${id}`, kind: 'fieldgame', game: `${STAR_GAME}${id}:notice`, x: notice[0], y: notice[1], w: 1, h: 1,
      label: `the ${site.path.name.toLowerCase()} field notices`, art: 'preserved.display-paired', walkThrough: true, visibleIf: { any: readbacks } },
  ];
}
