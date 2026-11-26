export type TableFace = 'near' | 'other';
export type IslandTrack = 'left' | 'right';
export type TurningStop = 'rail' | 'keeper';

/** Coordinates belong to a fictional two-piece landing model. */
export function turningView(face: TableFace, track: IslandTrack) {
  const reversed = face === 'other';
  return {
    relief: reversed ? 'An inset notch sits by the shallow slip.' : 'A raised ledge stands beside a flat step.',
    coastMark: reversed ? 2 : 0,
    islandMark: track === 'left' ? 0 : 2,
  };
}
