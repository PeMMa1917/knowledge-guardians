/**
 * Skill Atlas (spec 76.1): each skill grows as the player uses it in new contexts.
 * Stages describe practice in the game. They are not grades, and the game never
 * says that a student has mastered a real-world skill. Pure rules, no DOM.
 *
 * A use is stored as "world|action|context|AOK,AOK" (a distinct signature, RECUR-001).
 */
import type { ContentPack, Objective, PermanentRecord } from './types';

export const microSkillId = (number: number): string => 'SK-MICRO-' + String(number).padStart(4, '0');

export type SkillStage = 'unseen' | 'seen' | 'practised' | 'confident' | 'transferred';

export const STAGE_LABEL: Record<SkillStage, string> = {
  unseen: 'Not met yet', seen: 'Seen', practised: 'Practised', confident: 'Confident', transferred: 'Transferred',
};

export function useSignature(world: string, action: string, context: string, aoks: string[] = []): string {
  return `${world}|${action}|${context}|${[...aoks].sort().join(',')}`;
}

export function objectiveSkillUse(world: string, objective: Objective, id: string): string {
  return useSignature(world, objective.skillActions?.[id] ?? objective.kq?.action ?? 'step', objective.id, objective.weave?.aoks);
}

export function recordSkillUse(record: PermanentRecord, id: string, signature: string): PermanentRecord {
  const known = record.skills?.[id] ?? [];
  if (known.includes(signature)) return record;
  return { ...record, skills: { ...record.skills, [id]: [...known, signature] } };
}

/** Restore added evidence links only where the save already records the underlying action. */
export function restoreMicroSkillUses(record: PermanentRecord, pack: ContentPack, completed: string[]): PermanentRecord {
  const done = new Set(completed);
  let next = record;
  for (const { world, objectives } of pack.missions) {
    for (const objective of objectives) {
      if (!objective.skillActions || !done.has(objective.id)) continue;
      for (const id of Object.keys(objective.skillActions)) next = recordSkillUse(next, id, objectiveSkillUse(world, objective, id));
    }
  }
  return next;
}

export function skillStage(uses: string[] | undefined): SkillStage {
  const u = [...new Set(uses ?? [])];
  if (!u.length) return 'unseen';
  const parts = u.map((x) => x.split('|'));
  const worlds = new Set(parts.map((p) => p[0]));
  const actions = new Set(parts.map((p) => p[1]));
  const aoks = new Set(parts.flatMap((p) => (p[3] ? p[3].split(',') : [])));
  if (u.length >= 15 && aoks.size >= 2 && actions.size >= 4) return 'transferred';
  if (u.length >= 8 && worlds.size >= 3 && actions.size >= 2) return 'confident';
  if (u.length >= 3) return 'practised';
  return 'seen';
}

/** What the next stage needs, in plain words. */
export function nextStep(uses: string[] | undefined): string {
  const st = skillStage(uses);
  const n = new Set(uses ?? []).size;
  switch (st) {
    case 'unseen': return 'Use it once to see it on the map.';
    case 'seen': return `Use it in ${3 - n} more different place${3 - n === 1 ? '' : 's'} or tasks.`;
    case 'practised': return 'Use it in 8 different contexts, in 3 worlds, with 2 kinds of action.';
    case 'confident': return 'Use it in 15 contexts, across 2 areas of knowledge and 4 kinds of action.';
    default: return 'Help someone else with it in class play (Mentor).';
  }
}
