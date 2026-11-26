import type { CampaignState, Condition } from './types';

export interface StarStep { action: string; objectives: string[] }
export interface StarChoice { label: string; result: string; short: string }
export interface StarSkill { id: string; name: string; steps: StarStep[]; task: string; choices: StarChoice[] }
export interface StarPath { id: string; name: string; color: string; focus: string; skills: StarSkill[] }

export const STAR_STAGES = ['Notice', 'Try', 'Carry over', 'Pass on'] as const;
export const STAR_METHODS = ['first', 'second'] as const;
export const STAR_GAME = 'star-path:';
export const starFlag = (path: StarPath, skill: StarSkill) => `star-path.${path.id}.${skill.id}`;

export function triedStarStep(state: CampaignState, step: StarStep): boolean {
  return step.objectives.some((id) => state.objectivesDone.includes(id));
}

export function starMethodReady(skill: StarSkill): Condition {
  return { all: skill.steps.slice(0, 2).map(({ objectives }) => ({ any: objectives.map((objective) => ({ objective })) })) };
}

export function starRouteRead(path: StarPath, skill: StarSkill): Condition {
  const key = starFlag(path, skill);
  return { any: STAR_METHODS.map((value) => ({ all: [{ flag: `${key}.layout`, eq: value }, { flag: `${key}.checked`, eq: value }] })) };
}
