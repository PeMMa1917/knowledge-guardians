import worldChapters from '../content/world-chapters.json';
import newSkills from '../content/research-practice-catalog.json';
import type { ContentPack } from './types';
import type { MicroSkillEvidence } from '../content/microSkillEvidence';

export const AUDIT_AXES = ['player', 'mode', 'game', 'story', 'dok', 'fink', 'solo', 'bloom'] as const;
export type AuditAxis = (typeof AUDIT_AXES)[number];

/** The HTML supplies the full first block. Six numbered blocks have been received. */
export const NEW_SKILL_NAMES = newSkills.map(({number,name})=>({number,name}));
export const SUPPLIED_SKILL_IDS = [...Array.from({ length: 1000 }, (_, i) => i + 1), ...newSkills.map(s => s.number)];

export function microSkillRows(pack: ContentPack, evidence: readonly MicroSkillEvidence[]) {
  const context = new Map(pack.missions.flatMap((mission) =>
    mission.objectives.map((step) => [step.id, { mission, step }] as const)));
  return evidence.flatMap((skill) => skill.uses.flatMap((use) => {
    const place = context.get(use.objective);
    if (!place) return [];
    return [{
      skill: skill.number,
      name: skill.name,
      ...use,
      mission: place.mission.id,
      chapter: worldChapters[place.mission.world as keyof typeof worldChapters],
      world: place.mission.world,
      thinking: place.step.weave?.thinking,
    }];
  }));
}

type Row = ReturnType<typeof microSkillRows>[number];

/** Every grouping of two or more axes, including all eight together. */
export function axisGroups(): AuditAxis[][] {
  return Array.from({ length: 1 << AUDIT_AXES.length }, (_, mask) =>
    AUDIT_AXES.filter((_axis, index) => (mask & (1 << index)) !== 0)).filter((axes) => axes.length >= 2);
}

function axisValues(row: Row, axis: AuditAxis): string[] {
  switch (axis) {
    case 'player': return row.styles;
    case 'mode': return row.modes;
    case 'game': return [String(row.game)];
    case 'story': return [String(row.story)];
    default: return row.thinking ? [String(row.thinking[axis])] : [];
  }
}

/** Count recorded skill/chapter opportunities, giving no credit for open rows. */
export function measureAxisGroups(rows: readonly Row[]) {
  return axisGroups().map((axes) => {
    let uses = 0;
    const skillChapters = new Set<string>();
    const combinations = new Set<string>();
    for (const row of rows) {
      const values = axes.map((axis) => axisValues(row, axis));
      if (values.some((list) => !list.length)) continue;
      uses++;
      const skillChapter = `${row.skill}/${row.chapter}`;
      skillChapters.add(skillChapter);
      const paths = values.reduce((prefixes, list) => prefixes.flatMap((prefix) => list.map((value) => `${prefix}|${value}`)), [skillChapter]);
      for (const path of paths) combinations.add(path);
    }
    return { axes, uses, skillChapters: skillChapters.size, combinations: combinations.size };
  });
}
