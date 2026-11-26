import type { CampaignState } from './types';

export const INK_CHARGES = [
  { key: 'light', name: 'Light charge', threshold: 84 },
  { key: 'even', name: 'Even charge', threshold: 140 },
  { key: 'deep', name: 'Deep charge', threshold: 192 },
] as const;
export type InkCharge = (typeof INK_CHARGES)[number]['key'];
export type ImprintRoute = 'counter' | 'drawer';

const offset = [-24, 10, -12, 21, 14, -17, 24, -6, -10, 19, -21, 8, 24, -4, 12, -16];

/** Simulated single-ink press. The same source is held constant across pulls. */
export function pullInk(rgba: Uint8ClampedArray, width: number, charge: InkCharge): Uint8Array {
  const threshold = INK_CHARGES.find(({ key }) => key === charge)!.threshold;
  const ink = new Uint8Array(rgba.length / 4);
  for (let i = 0; i < ink.length; i++) {
    const start = i * 4;
    if (rgba[start + 3] < 128) continue;
    const y = Math.floor(i / width);
    const x = i % width;
    const tone = (rgba[start] * 54 + rgba[start + 1] * 183 + rgba[start + 2] * 19) / 256;
    ink[i] = Number(tone + offset[(y % 4) * 4 + x % 4] <= threshold);
  }
  return ink;
}

export const pullFlag = (stem: string, charge: InkCharge) => `${stem}.ink.${charge}`;
export const pressFlag = (stem: string) => `${stem}.sent`;
export const installFlag = (stem: string) => `${stem}.mounted`;

export function pressedCharges(state: Pick<CampaignState, 'flags'>, stem: string): InkCharge[] {
  return INK_CHARGES.filter(({ key }) => state.flags[pullFlag(stem, key)] === true).map(({ key }) => key);
}

export function imprintPacket(route: ImprintRoute, charge: InkCharge): string {
  return `${route}.${charge}`;
}

export function readPacket(value: unknown): { route: ImprintRoute; charge: InkCharge } | null {
  if (typeof value !== 'string') return null;
  const [route, charge, extra] = value.split('.');
  if (extra !== undefined || (route !== 'counter' && route !== 'drawer')) return null;
  const ink = INK_CHARGES.find(({ key }) => key === charge);
  return ink ? { route, charge: ink.key } : null;
}
