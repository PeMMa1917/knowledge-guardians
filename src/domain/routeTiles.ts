/** Two fictional routing benches. Each has one piece that can fit either socket. */
export const ROUTE_SOCKETS = ['first', 'second'] as const;
export type RouteSocket = typeof ROUTE_SOCKETS[number];
export type RouteLayout = 'plain' | RouteSocket;

export const RELIEF_PULSES = [6, 8] as const;
export type ReliefPulse = typeof RELIEF_PULSES[number];
export const RELIEF_BASIN_CAPACITY = 2;
export const RELIEF_TARGETS = { rows: 4, channel: 5 } as const;

export function reliefRouting(pulse: ReliefPulse, layout: RouteLayout) {
  const rows = Math.min(pulse, layout === 'first' ? 4 : 2);
  const channel = Math.min(pulse - rows, layout === 'second' ? 5 : 3);
  const surplus = pulse - rows - channel;
  const basin = Math.min(RELIEF_BASIN_CAPACITY, surplus);
  return { rows, channel, basin, spill: surplus - basin };
}

export const TRIAL_REQUESTS = { stepFree: 2, flexible: 2 } as const;
const STOP_PLACES = 3;

function tryStop(hasRamp: boolean) {
  const stepFreeServed = hasRamp ? TRIAL_REQUESTS.stepFree : 0;
  const flexibleServed = Math.min(TRIAL_REQUESTS.flexible, STOP_PLACES - stepFreeServed);
  return {
    served: stepFreeServed + flexibleServed,
    empty: STOP_PLACES - stepFreeServed - flexibleServed,
    waitingStepFree: TRIAL_REQUESTS.stepFree - stepFreeServed,
    waitingFlexible: TRIAL_REQUESTS.flexible - flexibleServed,
  };
}

/** At the ramp the desk offers step-free places before filling remaining spaces. */
export function civicLaneRouting(layout: RouteLayout) {
  return { steps: tryStop(layout === 'first'), canal: tryStop(layout === 'second') };
}

export function reliefReading(result: ReturnType<typeof reliefRouting>): string {
  return `Seed rows ${result.rows} · Lower channel ${result.channel} · Basin ${result.basin} · Spill ${result.spill}`;
}

export function civicLaneReading(result: ReturnType<typeof civicLaneRouting>['steps']): string {
  return `served ${result.served}, waiting for step-free access ${result.waitingStepFree}, waiting for a place ${result.waitingFlexible}, empty ${result.empty}`;
}
