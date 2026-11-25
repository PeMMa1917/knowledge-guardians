/**
 * Skill Atlas (spec 76.1): each skill grows as the player uses it in new contexts.
 * Stages describe practice in the game. They are not grades, and the game never
 * says that a student has mastered a real-world skill. Pure rules, no DOM.
 *
 * A use is stored as "world|action|context|AOK,AOK" (a distinct signature, RECUR-001).
 */
export type SkillStage = 'unseen' | 'seen' | 'practised' | 'confident' | 'transferred';

export const STAGE_LABEL: Record<SkillStage, string> = {
  unseen: 'Not met yet', seen: 'Seen', practised: 'Practised', confident: 'Confident', transferred: 'Transferred',
};

export function useSignature(world: string, action: string, context: string, aoks: string[] = []): string {
  return `${world}|${action}|${context}|${[...aoks].sort().join(',')}`;
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
