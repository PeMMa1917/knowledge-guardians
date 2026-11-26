import type { Mission, Objective } from './types';

export type GuideObjective = Objective & { mission: Mission; complete: boolean };

/** Put the opened case first and keep unsolicited suggestions to this world. */
export function guideObjectives(visible: readonly GuideObjective[], world: string, preferred?: string): GuideObjective[] {
  const open = visible.filter((step) => !step.complete);
  const local = open.filter((step) => step.mission.world === world && step.id !== preferred);
  const exact = preferred ? open.find((step) => step.id === preferred) : undefined;
  return (exact ? [exact, ...local] : local).slice(0, 6);
}
