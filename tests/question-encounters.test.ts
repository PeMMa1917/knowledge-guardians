import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { QUESTION_ROUTES } from '../src/content/questionEncounters';
import { newPermanent, restoreQuestionWays } from '../src/domain/permanent';
import { Driver } from './driver';

describe('questions that emerge from play', () => {
  const pack = buildPack();
  const worldByObjective = new Map(pack.missions.flatMap((mission) => mission.objectives.map((step) => [step.id, mission.world])));

  it('revisits 35 question families in three existing actions across the campaign', () => {
    expect(QUESTION_ROUTES).toHaveLength(35);
    const worlds = new Set<string>();
    for (const { question, encounters } of QUESTION_ROUTES) {
      expect(question.journalOnly).toBe(true);
      expect(encounters).toHaveLength(3);
      const distinctWorlds = new Set(encounters.map(([id]) => {
        const world = worldByObjective.get(id);
        expect(world, id).toBeDefined();
        return world!;
      }));
      expect(distinctWorlds.size, question.id).toBeGreaterThanOrEqual(2);
      for (const world of distinctWorlds) worlds.add(world);
    }
    expect(worlds).toEqual(new Set(pack.missions.map((mission) => mission.world)));
  });

  it('files an incidental question from two real exhibit inspections without awarding credit', () => {
    const d = new Driver();
    d.s.objectivesDone.push('market.finish');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-MKT-AM9941' });
    expect(d.p.stones['KQ-ROUTE-06']).toBeUndefined();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-MKT-OC9941' });
    expect(d.p.stones['KQ-ROUTE-06']).toEqual(['WORLD-11|tracing']);
    expect(d.p.credit).toEqual({});
  });

  it('recovers questions from finished objectives on older saves without replaying or duplicating them', () => {
    const completed = ['m01.o3.lens', 'nile.name.file'];
    const record = newPermanent();
    record.credit['crit.evidence.date-kinds'] = 20;
    const updated = restoreQuestionWays(record, pack, completed);
    expect(updated.stones['KQ-ROUTE-06']).toEqual(['WORLD-01|cataloguing', 'WORLD-03|cataloguing']);
    expect(updated.stones['KQ-ROUTE-05']).toBeUndefined();
    expect(updated.credit).toBe(record.credit);
    expect(restoreQuestionWays(updated, pack, completed)).toBe(updated);
  });
});
