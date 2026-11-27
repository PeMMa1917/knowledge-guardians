import tourUses from './origin-tour-skill-uses.json';
import newGuests from './lamplight-voices.json';
import instruments from './lamplight-instruments.json';
import lampSkills from './lamplight-skills.json';
import letters from './ink-post-letters.json';
import postSkills from './ink-post-skills.json';
import { microSkillId } from '../domain/skills';
export { microSkillId } from '../domain/skills';
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
const postUses = new Map<number, MicroSkillUse[]>((tourUses as { number: number; uses: MicroSkillUse[] }[]).map(row => [row.number, row.uses.slice()]));
for (const letter of letters) {
  const uses = postUses.get(letter.practice) ?? [];
  uses.push({ objective: 'ink.' + letter.id + '.landed', action: letter.title + ' · '
    + letter.folds.map((fold) => fold.action).join(' / ') + '. Hear the effect of the chosen action at the receiving post.',
    styles: ['explorer', 'helper'], modes: ['reading', 'linguistic'], game: 21, story: 114 });
  postUses.set(letter.practice, uses);
}
const guests = new Map([...letters, ...newGuests].map((guest) => [guest.id, guest]));
for (const [id, kit] of Object.entries(instruments)) {
  const guest = guests.get(id)!;
  const uses = postUses.get(kit.practice) ?? [];
  const modes: MicroSkillUse['modes'] = ['reading', 'analytical'];
  if (kit.kind === 'score') modes.push('auditory');
  if (['route', 'frame', 'layers', 'scale'].includes(kit.kind)) modes.push('spatial');
  uses.push({ objective: 'lamplight.' + kit.home + '.' + id + '.received', action: guest.title + ' · '
    + kit.pieces.map((p) => p.label).join(', ') + '. Compare two settings and carry the selected reading to a second person. ' + guest.question,
    styles: ['explorer', 'maker'], modes, game: kit.kind === 'route' ? 13 : 234, story: 29 });
  postUses.set(kit.practice, uses);
}
export const MICRO_SKILLS: MicroSkillEvidence[] = [...Object.values(sources).flat(), ...[...postSkills, ...lampSkills].map((s) => ({ ...s, uses: [] }))]
  .map((s) => ({ ...s, uses: [...s.uses, ...(postUses.get(s.number) ?? [])] })).sort((a, b) => a.number - b.number);

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
