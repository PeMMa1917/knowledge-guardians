import type { Condition } from '../domain/types';
import type { Interactable } from './types';

/** A prop that changes after a dialogue choice and shows the result when revisited. */
export function sceneProp(
  id: string, x: number, y: number, label: string,
  art: string, outcomes: Record<string, string>, available?: Condition,
): Interactable[] {
  const base = { kind: 'scene', x, y, w: 1, h: 1, label, walkThrough: true } as const;
  const when = (condition: Condition): Condition => available ? { all: [available, condition] } : condition;
  return [
    { ...base, id, node: id, art, visibleIf: when({ not: { flagSet: id } }) },
    ...Object.entries(outcomes).map(([choice, outcomeArt]) => ({
      ...base, id: `${id}.${choice}`, node: `${id}.${choice}`, art: outcomeArt,
      visibleIf: when({ flag: id, eq: choice }),
    })),
  ];
}
