import beats from '../content/hall-beats.json';
import voices from '../content/workshop-voices.json';
import { PASSAGES } from './corridor';
import type { CampaignState } from './types';

export function hallShift(chapter: number) {
  const [opening, discovery, quiet, earlyKeeper, lateKeeper] = voices[chapter - 1];
  return { ...beats[chapter - 1], opening, discovery, quiet, earlyKeeper, lateKeeper };
}

export function hallCost(chapter: number, edition: number): string {
  const beat = hallShift(chapter);
  return edition === 2 ? beat.firstCost + ' ' + beat.secondCost : edition === 1 ? beat.secondCost : beat.firstCost;
}

export function shiftReading(state: CampaignState, key: string, chapter: number): string {
  const beat = hallShift(chapter);
  return state.flags[key + '.late'] ? beat.late : beat.clock;
}

export function firstHallScene(s: CampaignState): string | undefined {
  if (s.flags['visited.map.' + s.mapId]) return;
  const index = PASSAGES.findIndex(p => p.hall === s.mapId);
  if (index > 0) return voices[index][0];
}
