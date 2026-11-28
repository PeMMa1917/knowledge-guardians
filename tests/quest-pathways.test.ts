import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { Engine, newCampaign } from '../src/domain/engine';

const pack = buildPack();
const engine = new Engine(pack);

describe('open quests as pathways (C-010)', () => {
  it('gives each open quest its world and how many steps are done, for grouping and a good place to stop', () => {
    const state = newCampaign(pack, 'Pathways', 'pathway-player', 7);
    const view = adventureJournalView(pack, state, engine.visibleObjectives(state));
    expect(view.quests.length).toBeGreaterThan(0);
    for (const q of view.quests) {
      const mission = pack.missions.find((m) => m.id === q.id)!;
      expect(q.world).toBe(mission.world);
      expect(q.total).toBe(mission.objectives.length);
      expect(q.done).toBeGreaterThanOrEqual(0);
      expect(q.done).toBeLessThan(q.total);
    }
  });
});
