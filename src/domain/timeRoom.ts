export const TIME_TOOL = 'time-keeping';
export const TIME_PULSES = 3;
export const STANDARDS = ['start', 'pace'] as const;
export type TimeStandard = (typeof STANDARDS)[number];
export type InstrumentType = 'dial' | 'case' | 'sound' | 'calendar' | 'shadow' | 'water';

export type ModelClock = { offset: number; drift: number };
export type TimeReading = { reference: number; display: number; difference: number };

export function clockReading(pulse: number, model: ModelClock, division = 8): TimeReading {
  const reference = division * pulse;
  const display = model.offset + (division + model.drift) * pulse;
  return { reference, display, difference: display - reference };
}

export function trialModel(clock: ModelClock, standard: TimeStandard): ModelClock {
  return standard === 'start' ? { ...clock, offset: 0 } : { ...clock, drift: 0 };
}

export function shiftedTrial(model: ModelClock): ModelClock {
  return { offset: model.offset + 2, drift: -model.drift };
}

export const trialFlag = (stem: string, standard: TimeStandard) => `${stem}.observed.${standard}`;
export const timeChoice = (stem: string) => `${stem}.notice`;
export const timeReturn = (stem: string) => `${stem}.return`;
