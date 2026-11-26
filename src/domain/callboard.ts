export type CallboardLayout = 'bench' | 'separate';
export type CallboardFace = 'view' | 'record';

export const CALLBOARD_LAYOUTS = ['bench', 'separate'] as const;

/** Fictional opening bells. Waiting time is measured in turns, never in wall time. */
export function callboardLayout(layout: CallboardLayout) {
  return layout === 'bench'
    ? { first: ['view', 'record'] as const, second: [] as const, desk: 'public' as const }
    : { first: ['view'] as const, second: ['record'] as const, desk: 'staffed' as const };
}
