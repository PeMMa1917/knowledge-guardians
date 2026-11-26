export const SILL_CLOCK = 'sill-clock:';
export type SillClockSite = 'bridge' | 'ferry';
export type SillPhase = 0 | 1 | 2 | 3;
export type SillRoute = 'deputy' | 'public';

export const SILL_TICKET = 'sill.bridge.ticket';
export const SILL_NEAR = 'sill.bridge.near';
export const SILL_FAR = 'sill.bridge.far';
export const SILL_CHECKED = 'sill.bridge.checked';
export const SILL_PLAN = 'sill.bridge.plan';
export const SILL_PASSAGE = 'sill.bridge.passage';
export const SILL_RECEIPT = 'sill.bridge.receipt';
export const SILL_FERRY_RECEIPT = 'sill.ferry.receipt';
export const SILL_HANDOVER = 'sill.bridge.served';
export const SILL_FERRY_CHECK = 'sill.ferry.checked';

export const SILL_PHASES: readonly SillPhase[] = [0, 1, 2, 3];

export function sillPhase(value: unknown): SillPhase {
  return value === 1 || value === 2 || value === 3 ? value : 0;
}

export function advanceSillClock(phase: SillPhase): SillPhase {
  return SILL_PHASES[Math.min(phase + 1, 3)];
}

// The ring has a marked notch of its own, before the wheel moves past it.
export function sillAccepts(site: SillClockSite, phase: SillPhase): boolean {
  return site === 'bridge' ? phase < 2 : phase > 2;
}

export function sillClockFlag(site: SillClockSite, trace: 'phase' | 'accepted' | 'closed'): string {
  return `sill.${site}.clock.${trace}`;
}

export function sillTrace(site: SillClockSite, phase: SillPhase): 'accepted' | 'closed' | undefined {
  if (sillAccepts(site, phase)) return 'accepted';
  if (phase === 2) return 'closed';
}
