import { BREEZE_PLAN, BREEZE_START, BREEZE_TOOL, breezeReceiptFlag, type BreezePlan } from '../domain/coastBreeze';
import type { Interactable } from './types';

export const BREEZE_HEADLAND: Interactable = {
  id: 'coast-breeze-headland', kind: 'fieldgame', game: `${BREEZE_TOOL}headland`, x: 18, y: 14,
  w: 1, h: 1, walkThrough: true, label: 'Neri’s practice wind pointer', art: 'coast.clear-frame',
  visibleIf: { objective: BREEZE_START },
};

function receivingStand(plan: BreezePlan, x: number, y: number, label: string, art: string): Interactable {
  return {
    id: `coast-breeze-${plan}`, kind: 'fieldgame', game: `${BREEZE_TOOL}${plan}`, x, y,
    w: 1, h: 1, walkThrough: true, label, art,
    visibleIf: { any: [{ flag: BREEZE_PLAN, eq: plan }, { flag: breezeReceiptFlag(plan), eq: true }] },
    artOpen: { key: 'departure.strip', if: { flag: breezeReceiptFlag(plan), eq: true } },
  };
}

export const BREEZE_ARCHIVE = receivingStand('archive', 22, 10, 'Olwen’s hooded comparison stand', 'coast.signal');
export const BREEZE_HARBOUR = receivingStand('harbour', 5, 8, 'Ruan’s second-gust stand', 'coast.signal');
