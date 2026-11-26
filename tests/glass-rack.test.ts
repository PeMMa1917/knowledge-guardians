import { describe, expect, it } from 'vitest';
import { GLASS_RACK_CASES, glassRackContent, glassRackEntries } from '../src/content/glassRack';
import voices from '../src/content/glass-rack-lines.json';
import { check } from '../src/domain/rules';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function target(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

describe('The Missing Face', () => {
  it('opens one unoccupied door after the first display and returns to a free tile', () => {
    const d = new Driver();
    d.s.mapId = 'preserved.archive';
    expect(target(d, 'cold-glass-rack-door')).toBeUndefined();
    d.s.objectivesDone.push('preserved.publish');
    const door = target(d, 'cold-glass-rack-door');
    expect(door?.to?.map).toBe('preserved.glass-rack');
    const room = MAPS[d.s.mapId];
    expect(room.interactables.filter(({ x, y }) => x === door?.x && y === door?.y).map(({ id }) => id))
      .toEqual(['cold-glass-rack-door']);
    const exit = MAPS['preserved.glass-rack'].interactables.find(({ id }) => id === 'glass-rack-return')!;
    expect(exit.to?.map).toBe('preserved.archive');
    expect(room.interactables.filter(({ x, y }) => x === exit.to?.x && y === exit.to?.y)).toEqual([]);
    expect(new Set(GLASS_RACK_CASES.map(({ key }) => key)).size).toBe(40);
    expect(new Set(GLASS_RACK_CASES.flatMap(({ wholeAsset, otherAsset }) => [wholeAsset, otherAsset])).size).toBe(80);
  });

  it('gives each photo pair its own work, reader and physical return lines', () => {
    expect(Object.keys(voices).sort()).toEqual(GLASS_RACK_CASES.map(({ slug }) => slug).sort());
    const registry = new Map(glassRackContent.dialogue.map(node => [node.id, node]));
    const fields = ['work', 'comparison', 'rail', 'railDone', 'pocket', 'pocketDone', 'revisit', 'boardDone', 'deskDone'] as const;
    const unique = new Set<string>();
    for (const record of GLASS_RACK_CASES) {
      for (const field of fields) {
        const line = record.story[field];
        expect(line.trim().length, record.slug + ' ' + field).toBeGreaterThan(20);
        expect(unique.has(line), record.slug + ' ' + field).toBe(false);
        unique.add(line);
      }
      for (const field of ['work', 'rail', 'pocket', 'revisit'] as const) {
        expect(registry.get(record.nodes[field])?.text).toBe(record.story[field]);
      }
    }
    expect(unique.size).toBe(360);
  });

  it('offers a clue for each photograph and remembers what its reader could actually see', () => {
    const clues = new Set<string>();
    const diaryLines = new Set<string>();
    const questions = new Set<string>();
    for (const object of GLASS_RACK_CASES) {
      for (const [objective, first] of [[object.earned, object.story.hintAtCase], [object.returned, object.story.hintAtReturn]]) {
        const hints = glassRackContent.hints.filter((hint) => hint.objective === objective);
        expect(hints.map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
        expect(hints[0].text).toBe(first);
        clues.add(first);
      }
      const note = glassRackContent.journal.find(({ id }) => id === `j.${object.earned}`)!;
      expect(note.text).toMatch(/^(I|My|We|Our)\b/);
      diaryLines.add(note.text);
      const entry = { id: `quest:${object.earned}`, kind: 'quest' as const, title: 'The Missing Face' };
      const question = diaryQuestions(entry)['mount-reading'];
      expect(question).toMatch(/\?$/);
      questions.add(question);
      expect(diaryQuestions(entry, { quest: 'I followed the edge.' })).toHaveProperty('quest');
    }
    expect(clues.size).toBe(GLASS_RACK_CASES.length * 2);
    expect(diaryLines.size).toBe(GLASS_RACK_CASES.length);
    expect(questions.size).toBe(GLASS_RACK_CASES.length);
  });

  it.each(GLASS_RACK_CASES)('earns and equips $accession through either reading space, and mounts the chosen return view', (object) => {
    for (const [mount, slot, cabinet] of [['rail', 3, 'board'], ['pocket', 4, 'desk']] as const) {
      const d = new Driver();
      const choose = (node: string, index: number) => d.run({ type: 'ChooseDialogueOption', node, index });
      d.s.mapId = 'preserved.glass-rack';
      d.s.objectivesDone.push('preserved.publish');
      expect(target(d, `glass-case-${object.slug}`)?.exhibit).toBe(object.exhibit);
      expect(glassRackEntries(target(d, `glass-frame-${object.slug}`)!.game!)).toEqual([object.nodes.work]);
      expect(() => choose(object.nodes.work, 0)).toThrow(/not available/);
      d.run({ type: 'InspectExhibit', exhibit: object.exhibit });
      choose(object.nodes.work, 0);
      expect(() => choose(object.nodes.work, slot)).toThrow(/not available/);
      choose(object.nodes.work, 1);
      expect(() => choose(object.nodes.work, slot)).toThrow(/not available/);
      choose(object.nodes.work, 2);
      choose(object.nodes.work, slot);
      expect(() => d.run({ type: 'ClaimSpecimen', exhibit: object.exhibit })).toThrow(/Finish the object/);
      if (mount === 'pocket') {
        expect(() => choose(object.nodes.pocket, 1)).toThrow(/not available/);
        choose(object.nodes.pocket, 0);
        choose(object.nodes.pocket, 1);
      } else choose(object.nodes.rail, 0);
      expect(d.done(object.earned)).toBe(true);
      d.run({ type: 'ClaimSpecimen', exhibit: object.exhibit });
      expect(d.s.inventory[specimenItemId(object.key)]).toBe(1);

      d.s.mapId = 'nile.route';
      expect(target(d, object.revisit.prop)).toBeUndefined();
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(object.key) });
      expect(glassRackEntries(target(d, object.revisit.prop)!.game!)).toContain(object.nodes.revisit);
      choose(object.nodes.revisit, 0);
      expect(() => choose(object.nodes.revisit, 2)).toThrow(/not available/);
      choose(object.nodes.revisit, 1);
      choose(object.nodes.revisit, cabinet === 'board' ? 2 : 3);
      expect(d.done(object.returned)).toBe(true);
      expect(d.s.flags[`${object.flag}.nile`]).toBe(cabinet);
      expect(target(d, 'nile-glass-reader-board')).toBeDefined();
      expect(!!target(d, 'nile-glass-reading-desk')).toBe(cabinet === 'desk');
    }
  });

  it('gives the three return stations and both view readbacks their own reachable tiles', () => {
    const room = MAPS['nile.route'];
    for (const prop of room.interactables.filter(({ id }) => id.startsWith('nile-glass-'))) {
      expect(room.interactables.filter(({ x, y }) => x === prop.x && y === prop.y).map(({ id }) => id)).toEqual([prop.id]);
      expect(room.floor(prop.x + 1, prop.y)).toBe('stone-c');
      expect(room.interactables.filter(({ x, y }) => x === prop.x + 1 && y === prop.y)).toEqual([]);
    }
  });
});
