import { returnVisits } from '../content/chapterPractice';
import type { ContentPack, Weave } from '../domain/types';

/** Public activity and reporting metadata derived from the campaign's own records. */
export function teacherContentFrom(pack: ContentPack) {
  const strands: Pick<Weave, 'framework' | 'subjects' | 'thinking'>[] = [];
  const keys = new Map<string, number>();
  function strand(weave: Weave): number {
    const tags = {
      framework: weave.framework ?? [],
      subjects: weave.subjects ?? [],
      thinking: weave.thinking,
    };
    const key = JSON.stringify(tags),
      old = keys.get(key);
    if (old !== undefined) return old;
    const id = strands.push(tags) - 1;
    keys.set(key, id);
    return id;
  }
  return {
    returnVisits: returnVisits.map(({ world, stop, objective, start, change, question }) => ({
      world,
      stop,
      objective,
      start,
      change,
      question,
    })),
    strands,
    missions: pack.missions.map(({ id, title, knowledgeQuestion, objectives, world }) => ({
      id,
      title,
      knowledgeQuestion,
      chapter: Math.max(1, Number(world.slice(6)) - 1),
      objectives: objectives.map(({ id, title, essential, weave }) => ({
        id,
        title,
        essential,
        weave: weave && { concepts: weave.concepts, aoks: weave.aoks, strand: strand(weave) },
      })),
    })),
    awards: pack.awards.map(({ id, name, earnedBy }) => ({ id, name, earnedBy })),
    misconceptions: pack.misconceptions.map(({ id, title, teacherMove }) => ({ id, title, teacherMove })),
    skills: pack.skills.map(({ id, name, domain }) => ({ id, name, domain })),
    skillDomains: pack.skillDomains.map(({ id, name }) => ({ id, name })),
  };
}

export type TeacherContent = ReturnType<typeof teacherContentFrom>;
