import type { ContentPack } from '../domain/types';

/** Public activity and reporting metadata derived from the campaign's own records. */
export function teacherContentFrom(pack: ContentPack) {
  return {
    missions: pack.missions.map(({ id, title, knowledgeQuestion, objectives }) => ({
      id,
      title,
      knowledgeQuestion,
      objectives: objectives.map(({ id, title, essential, weave }) => ({
        id, title, essential, weave: weave && { concepts: weave.concepts, aoks: weave.aoks },
      })),
    })),
    awards: pack.awards.map(({ id, name, earnedBy }) => ({ id, name, earnedBy })),
    misconceptions: pack.misconceptions.map(({ id, title, teacherMove }) => ({ id, title, teacherMove })),
    skills: pack.skills.map(({ id, name, domain }) => ({ id, name, domain })),
    skillDomains: pack.skillDomains.map(({ id, name }) => ({ id, name })),
  };
}

export type TeacherContent = ReturnType<typeof teacherContentFrom>;
