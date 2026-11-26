import { describe, expect, it } from 'vitest';
import { guideObjectives } from '../src/domain/guidance';
import { totalXP } from '../src/domain/permanent';
import { KEY_SLOTS, SaveService, emptyPair, memoryStore, serialisePair, writeSuspend } from '../src/domain/saves';
import { Driver } from './driver';

describe('Lumen’s workbench guidance', () => {
  it('prefers the opened case among a player’s visible goals and leaves later worlds out', () => {
    const d = new Driver();
    const live = d.e.visibleObjectives(d.s);
    const clues = guideObjectives(live, 'WORLD-01', 'm01.o1.look');
    expect(clues[0]?.id).toBe('m01.o1.look');
    expect(clues.length).toBeLessThanOrEqual(6);
    expect(clues.every(({ mission }) => mission.world === 'WORLD-01')).toBe(true);
    expect(guideObjectives(live, 'WORLD-03', 'nile.dispatch')).toEqual([]);
    d.s.objectivesDone.push('m01.o1.look');
    expect(guideObjectives(d.e.visibleObjectives(d.s), 'WORLD-01', 'm01.o1.look').map(({ id }) => id)).not.toContain('m01.o1.look');
  });

  it('offers the four clues in order, allows a repeat and keeps award credit steady', () => {
    const d = new Driver();
    const startingXP = totalXP(d.p);
    const initialAwards = { ...d.p.awards };
    const depths = Array.from({ length: 5 }, () => {
      const event = d.run({ type: 'RequestHint', objective: 'm01.o1.look' }).events.find(({ kind }) => kind === 'hint');
      return event?.kind === 'hint' ? event.hint.depth : undefined;
    });
    expect(depths).toEqual([1, 2, 3, 4, 4]);
    expect(totalXP(d.p)).toBe(startingXP);
    expect(d.p.awards).toEqual(initialAwards);
    const previous = d.s;
    expect(() => d.run({ type: 'RequestHint', objective: 'missing.example' })).toThrow('Choose a quest step with a clue');
    expect(d.s).toBe(previous);
  });

  it('prioritizes Dov’s drawers through play and filters out the later visit and the completed step', () => {
    const d = new Driver();
    d.s.mapId = 'aethelgard.emberford';
    d.s.objectivesDone.push('m01.o7.portal', 'm02.o1.arrive');
    const clues = () => guideObjectives(d.e.visibleObjectives(d.s), 'WORLD-02', 'drawer.cases.opened').map(({ id }) => id);

    expect(clues()[0]).toBe('drawer.cases.opened');
    for (const face of [0, 1, 2, 3, 4]) {
      d.run({ type: 'OpenDrawerCase', face });
      expect(clues()[0]).toBe('drawer.cases.opened');
    }
    d.run({ type: 'OpenDrawerCase', face: 5 });
    expect(d.s.inventory['item.drawer-stencil']).toBe(1);
    expect(clues()).not.toContain('drawer.cases.opened');
    expect(clues()).not.toContain('drawer.fold.finish');
  });

  it('prioritizes the Nile story over the unfinished optional Firsts step from Chapter 1', () => {
    const d = new Driver();
    for (const mission of d.e.pack.missions.filter(({ id }) => ['KG-CH1-M01', 'KG-CH1-M02'].includes(id))) {
      d.s.objectivesDone.push(...mission.objectives.filter(({ essential }) => essential).map(({ id }) => id));
    }
    expect(d.e.currentObjective(d.s)?.id).toBe('m01.side.firsts');
    d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
    expect(d.e.currentObjective(d.s)?.id).toBe('nile.door');
    d.s.mapId = 'nile.hall';
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    expect(d.e.visibleObjectives(d.s).find(({ id }) => id === 'm01.side.firsts')?.complete).toBe(false);
    expect(d.e.currentObjective(d.s)?.id).toBe('nile.two');
  });

  it.each([
    ['ridge', 'wash'],
    ['wash', 'ridge'],
  ] as const)('offers the missing Mine Map, then the other road when resuming a saved %s run', (first, remaining) => {
    const d = new Driver();
    d.s.mapId = 'nile.route';
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    const objective = 'nile.routes';
    const goals = () => guideObjectives(d.e.visibleObjectives(d.s), 'WORLD-03', objective);
    const ask = () => {
      const event = d.run({ type: 'RequestHint', objective }).events.find(({ kind }) => kind === 'hint');
      return event?.kind === 'hint' ? event.hint : undefined;
    };
    expect(goals()[0]?.id).toBe(objective);
    const before = d.s;
    expect(() => d.run({ type: 'NileRouteTrial', road: first })).toThrow('Read the Mine Map');
    expect(d.s).toBe(before);
    for (const depth of [1, 2, 3]) expect(ask()?.depth).toBe(depth);
    expect(ask()).toMatchObject({ depth: 4, text: 'Read the Mine Map west of this model. Come back to the shelf to run the cart.' });

    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    expect(ask()?.text).toContain('“Run the cart on the ridge” and “Run the cart on the wash”');
    d.run({ type: 'NileRouteTrial', road: first });
    const slots = writeSuspend(emptyPair(), {
      kind: 'suspend', label: 'One road', location: 'Map Room', savedAt: '2026-11-26T00:00:00Z', state: d.s,
    });
    const loaded = new SaveService(memoryStore({ [KEY_SLOTS]: serialisePair(slots) })).load();
    if (!loaded.ok || !loaded.pair.continue) throw new Error('Could not continue the Map Room trial');
    d.s = loaded.pair.continue.state;
    expect(d.s.flags[`nile.trial.${first}`]).toBe(true);
    expect(d.s.flags[`nile.trial.${remaining}`]).toBeUndefined();
    expect(() => d.run({ type: 'NileDelivery', choice: 'copy' })).toThrow('Try both roads');
    expect(ask()).toMatchObject({ depth: 4, text: expect.stringContaining(`Choose “Run the cart on the ${remaining}”`) });

    d.run({ type: 'NileRouteTrial', road: remaining });
    expect(ask()?.text).toContain('Both readings are recorded. Choose one delivery tag');
    d.run({ type: 'NileDelivery', choice: 'copy' });
    expect(d.done(objective)).toBe(true);
    expect(goals().map(({ id }) => id)).not.toContain(objective);
  });
});
