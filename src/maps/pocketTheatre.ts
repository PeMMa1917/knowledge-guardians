import { theatreStops } from '../domain/pocketTheatre';
import type { Interactable } from './types';

export function pocketTheatreAt(mapId: string): Interactable[] {
  const stop = theatreStops.find((p) => p.map === mapId);
  return stop
    ? [
        {
          id: 'travelling-pocket-theatre',
          kind: 'fieldgame',
          game: 'pocket-theatre',
          x: stop.x,
          y: stop.y,
          w: 1,
          h: 1,
          label: 'the pocket theatre with a letter stitched into its lid',
          art: 'pocket.case',
          walkThrough: true,
        },
      ]
    : [];
}
