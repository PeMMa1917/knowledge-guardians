export const PACKING_TOOL = 'ferry-packing';
export const PACKING_LATEST = 'ferry.pack.latest';
export const PACKING_POSITIONS = ['outside', 'inside'] as const;
export type TagPosition = (typeof PACKING_POSITIONS)[number];
export type PackingModel = { spray: number; resistance: number; opening: number };

export const PACKING_STAGES = [
  'Set the packet on the departure hook',
  'Cross the spray mark',
  'Reach the reading table',
] as const;

export function tagReading(model: PackingModel, position: TagPosition, step: number, shelter = false) {
  const rain = step >= 2 && position === 'outside' && !shelter ? model.spray : 0;
  const available = step >= PACKING_STAGES.length || (step > 0 && position === 'outside');
  const legible = rain < model.resistance;
  const delay = step >= PACKING_STAGES.length ? (position === 'inside' ? model.opening : 0) + Number(shelter) : 0;
  return { available, legible, rain, delay };
}

export function intakeModel(model: PackingModel): PackingModel {
  return { ...model, spray: model.spray + 1 };
}

export const tagFlag = (stem: string, position: TagPosition) => `${stem}.checked.${position}`;
export const postedTag = (stem: string) => `${stem}.posted`;
export const receiptTag = (stem: string) => `${stem}.received`;
export const pickupTag = (stem: string) => `${stem}.pickup`;

export function handoffText(model: PackingModel, position: TagPosition): string {
  if (position === 'inside') {
    return `Wenna takes the load to the drying table and uses ${model.opening} extra handling ${model.opening === 1 ? 'move' : 'moves'} before reading. The entire source line reaches her ledger.`;
  }
  return tagReading(model, position, PACKING_STAGES.length).legible
    ? 'Tova reads the source line as soon as it reaches the queue rail. The carrier collects the first slot.'
    : 'Tova can sort the load at the queue rail. The source line has run, so she holds the slot while the carrier confirms it.';
}
