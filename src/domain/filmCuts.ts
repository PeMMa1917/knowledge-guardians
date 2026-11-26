import type { CampaignState, Effect } from './types';

export const FILM_STATIONS = ['front', 'wing'] as const;
export type FilmStation = typeof FILM_STATIONS[number];
export const FILM_CUTS = ['cue', 'motion'] as const;
export type FilmCut = typeof FILM_CUTS[number];

const beats = [
  { id: 'signal', time: 1, cart: 10, handRaised: true, title: 'The signal' },
  { id: 'crossing', time: 2, cart: 17, handRaised: false, title: 'The cart crosses' },
  { id: 'arrival', time: 3, cart: 27, handRaised: false, title: 'The cart stops' },
] as const;

export const CAMERA_BLOCKING = {
  keeper: 5, stripe: 15, doorway: 23,
} as const;

const cameras = {
  front: { title: 'Front camera', left: 0, width: 35 },
  wing: { title: 'Wing camera', left: 9, width: 24 },
} as const;

export interface FilmFrame {
  time: number;
  title: string;
  cart: number;
  handRaised: boolean;
  left: number;
  width: number;
  description: string;
}

export function isFilmStation(id: string): id is FilmStation {
  return (FILM_STATIONS as readonly string[]).includes(id);
}

export function isFilmCut(id: string): id is FilmCut {
  return (FILM_CUTS as readonly string[]).includes(id);
}

export function filmTake(station: FilmStation): FilmFrame[] {
  const { title, left, width } = cameras[station];
  const keeperVisible = CAMERA_BLOCKING.keeper >= left && CAMERA_BLOCKING.keeper < left + width;
  return beats.map((beat) => {
    const description = beat.id === 'signal'
      ? keeperVisible ? 'The keeper raises a palm while the cart is behind the stripe.'
        : 'The cart is behind the stripe. The keeper is outside this frame.'
      : beat.id === 'crossing' ? 'The cart is crossing the stripe near the doorway.'
        : 'The cart has stopped past the doorway.';
    return { ...beat, left, width, description: title + '. ' + description };
  });
}

export function filmEdit(cut: FilmCut): FilmFrame[] {
  const front = filmTake('front');
  const wing = filmTake('wing');
  return cut === 'cue' ? [front[0], wing[1], front[2]] : [wing[1], front[0], front[2]];
}

export const FILM_READER: Record<FilmCut, string> = {
  cue: 'The first viewer sees the hand, pauses at the stripe and looks up for the keeper. The doorway takes a second frame to find.',
  motion: 'The first viewer finds the doorway at once. They start after the cart, then stop when the second frame shows the earlier hand signal.',
};

export type FilmAction =
  | { type: 'CaptureFilmTake'; station: FilmStation }
  | { type: 'ScreenFilmCut'; cut: FilmCut }
  | { type: 'PostFilmCut'; cut: FilmCut };

export function filmEffects(cmd: FilmAction, state: CampaignState): Effect[] {
  if (state.mapId !== 'stage.rehearsal' || state.flags['film.stage.started'] !== true) {
    throw new Error('Open Edda’s camera or editing bench in the Rehearsal Room first.');
  }
  if (cmd.type === 'CaptureFilmTake') {
    if (!isFilmStation(cmd.station)) throw new Error('That camera position is not on the rehearsal plan.');
    return [{ setFlag: 'film.take.' + cmd.station, value: true }];
  }
  if (!isFilmCut(cmd.cut)) throw new Error('That cut is not on the editing bench.');
  if (!FILM_STATIONS.every((station) => state.flags['film.take.' + station] === true)) {
    throw new Error('Bring takes from both camera positions to this bench.');
  }
  if (cmd.type === 'ScreenFilmCut') return [{ setFlag: 'film.screen.' + cmd.cut, value: true }];
  if (!FILM_CUTS.every((cut) => state.flags['film.screen.' + cut] === true)) {
    throw new Error('Let the reader see both editing orders before you post a cut.');
  }
  if (state.flags['film.stage.cut']) throw new Error('This strip is already posted in the House.');
  return [{ setFlag: 'film.stage.cut', value: cmd.cut }];
}
