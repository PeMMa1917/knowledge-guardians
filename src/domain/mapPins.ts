import type { CampaignState } from './types';

export const PIN_PURPOSES = {
  trace: 'Check a trace',
  meet: 'Meet someone',
  return: 'Return here',
} as const;
export type PinPurpose = keyof typeof PIN_PURPOSES;

export type MapPin = { x: number; y: number; purpose: PinPurpose };
export const FOLLOW_PIN = 'map-pin.follow';
export const mapPinKey = (mapId: string): string => `map-pin.${mapId}`;

export function writeMapPin(pin: MapPin): string {
  return `${pin.x},${pin.y},${pin.purpose}`;
}

export function readMapPin(flags: CampaignState['flags'], mapId: string, width: number, height: number): MapPin | undefined {
  const flag = flags[mapPinKey(mapId)];
  if (typeof flag !== 'string') return;
  const match = /^(\d+),(\d+),(trace|meet|return)$/.exec(flag);
  if (!match) return;
  const x = Number(match[1]), y = Number(match[2]);
  if (x >= width || y >= height) return;
  return { x, y, purpose: match[3] as PinPurpose };
}
