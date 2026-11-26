import { CARRY, carryArtBy, carryGame, carryStopCondition, type CarrySite, type CarryStop } from '../domain/sharedCarry';
import type { Interactable } from './types';

export function carriedFrame(site: CarrySite, stop: CarryStop, x: number, y: number, label: string): Interactable {
  return {
    id: carryGame(site, stop).replaceAll('.', '-'), kind: 'fieldgame', game: carryGame(site, stop),
    x, y, w: 1, h: 1, label, art: CARRY[site].phases.start.art, artBy: carryArtBy(site, stop),
    walkThrough: true, visibleIf: carryStopCondition(site, stop),
  };
}
