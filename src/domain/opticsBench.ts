/** The board is a side-view model of a lamp and an opaque pointer at fixed depths. */
export const OPTICS_GAMES = ['coast-shadow-board', 'council-shadow-board'] as const;
export type OpticsGame = typeof OPTICS_GAMES[number];

export const OPTICS_TRIALS = [
  { id: 'left', lamp: 11, pointer: 39, label: 'Light the left socket. Keep the pointer on its notch.' },
  { id: 'right', lamp: 69, pointer: 39, label: 'Light the right socket. Keep the pointer on its notch.' },
  { id: 'turn', lamp: 69, pointer: 46, label: 'Keep the right lamp lit. Move the pointer.' },
] as const;
export type OpticsTrial = typeof OPTICS_TRIALS[number];

export const OPTICS_DEPTHS = { lamp: 30, pointer: 55, card: 80 };

export function opticalReading(trial: OpticsTrial) {
  const stretch = (OPTICS_DEPTHS.card - OPTICS_DEPTHS.lamp) / (OPTICS_DEPTHS.pointer - OPTICS_DEPTHS.lamp);
  return { shadow: trial.lamp + (trial.pointer - trial.lamp) * stretch, pointer: trial.pointer };
}
