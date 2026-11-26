import type { ContentPack } from '../domain/types';

export const MICRO_SKILL_DOMAIN = 'MICRO';
export const MICRO_STYLES = ['strategist', 'explorer', 'maker', 'helper', 'performer', 'challenger', 'collector', 'companion'] as const;
export const MICRO_MODES = ['visual', 'spatial', 'auditory', 'reading', 'writing', 'physical', 'linguistic', 'analytical', 'social', 'reflective', 'nature'] as const;

export type MicroSkillUse = {
  objective: string;
  action: string;
  styles: (typeof MICRO_STYLES)[number][];
  modes: (typeof MICRO_MODES)[number][];
  game: number;
  story: number;
};

export type MicroSkillEvidence = { number: number; name: string; uses: MicroSkillUse[] };

const sources = import.meta.glob<MicroSkillEvidence[]>('./microSkills*.json', { eager: true, import: 'default' });
export const MICRO_SKILLS = Object.values(sources).flat().sort((a, b) => a.number - b.number);

/** Identifier stays stable as an illustrative use gains new approaches. */
export const microSkillId = (number: number): string => `SK-MICRO-${String(number).padStart(4, '0')}`;

export function addMicroSkills(pack: ContentPack): void {
  if (!MICRO_SKILLS.length) return;
  pack.skillDomains.push({ id: MICRO_SKILL_DOMAIN, name: 'Field practice' });
  const at = new Map<string, Record<string, string>>();
  for (const skill of MICRO_SKILLS) {
    const id = microSkillId(skill.number);
    pack.skills.push({ id, name: skill.name, domain: MICRO_SKILL_DOMAIN });
    for (const use of skill.uses) {
      const actions = at.get(use.objective) ?? {};
      actions[id] = `game-${use.game}`;
      at.set(use.objective, actions);
    }
  }
  pack.missions = pack.missions.map((mission) => ({
    ...mission,
    objectives: mission.objectives.map((objective) => {
      const skillActions = at.get(objective.id);
      return skillActions ? { ...objective, skillActions, skills: [...(objective.skills ?? []), ...Object.keys(skillActions)] } : objective;
    }),
  }));
}
