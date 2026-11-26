import { describe, expect, it } from 'vitest';
import { captionFor } from '../src/app/captions';
import { buildPack } from '../src/content';
import { COMMUNITY_LETTERS, communityLetterFlag, dueCommunityLetters, receivedCommunityLetters } from '../src/domain/communityLetters';
import { conversationHistory } from '../src/domain/conversationHistory';
import { LETTERS, composeLetter } from '../src/domain/letters';
import { check } from '../src/domain/rules';
import { storyMotif, storyMotifKey, STORY_MOTIFS } from '../src/domain/storyMotifs';
import { VOICES_LISTENING, VOICES_WALK } from '../src/maps/voices';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

const pack = buildPack();

function mapProp(d: Driver, map: MapDef, id: string) {
  return map.interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

describe('campaign recurrence', () => {
  it('recalls only entered lines in reverse first-heard order', () => {
    const d = new Driver();
    d.run({ type: 'EnterNode', node: 'cold.open' });
    d.run({ type: 'EnterNode', node: 'cold.open2' });
    d.run({ type: 'EnterNode', node: 'cold.open' });
    d.run({ type: 'SetFlag', flag: 'node.removed-in-an-old-build', value: true });
    const sameAsLoaded = JSON.parse(JSON.stringify(d.s.flags));
    expect(conversationHistory(pack.dialogue, sameAsLoaded).map(({ id }) => id)).toEqual(['cold.open2', 'cold.open']);
  });

  it('puts one recognizable motif at the opening, optional opponent, reveal and every ending', () => {
    const actualNodes = Object.fromEntries(pack.dialogue.map((node) => [node.id, node.motif]));
    expect(actualNodes['cold.open']).toBe('first-light');
    expect(actualNodes['vesper.stage.start']).toBe('gold-thread');
    expect(actualNodes['vesper.lamp']).toBe('first-light');
    for (const key of ['correct', 'recruit', 'expose', 'both']) expect(actualNodes[`vesper.end.${key}`]).toBe('in-the-open');
    const [first, rival, restored] = STORY_MOTIFS.map(storyMotif);
    expect(rival.notes[0].f).toBeCloseTo(first.notes[0].f / 2, 1);
    expect(rival.notes[2].f / rival.notes[0].f).toBeLessThan(first.notes[2].f / first.notes[0].f);
    expect(restored.notes.slice(0, first.notes.length)).toEqual(first.notes);
    expect(restored.notes.length).toBeGreaterThan(first.notes.length);
    for (const key of STORY_MOTIFS) expect(captionFor(storyMotifKey(key))).toBeTruthy();
  });

  it('links each local letter to real quests and sends the chosen version once after later progress', () => {
    const objectiveIds = new Set(pack.missions.flatMap((m) => m.objectives.map((o) => o.id)));
    expect(new Set(COMMUNITY_LETTERS.map((letter) => letter.id)).size).toBe(COMMUNITY_LETTERS.length);
    for (const letter of COMMUNITY_LETTERS) {
      expect(pack.characters.some((character) => character.id === letter.sender)).toBe(true);
      for (const objective of letter.prerequisites) expect(objectiveIds.has(objective)).toBe(true);
      const versions = Object.keys(letter.byOutcome);
      expect(new Set(Object.values(letter.byOutcome)).size).toBeGreaterThan(1);
      for (const outcome of versions) {
        const d = new Driver();
        d.s.flags[letter.outcomeFlag] = outcome;
        expect(dueCommunityLetters(d.s)).toEqual([]);
        d.s.objectivesDone.push(...letter.prerequisites);
        const [due] = dueCommunityLetters(d.s);
        expect(due?.body).toBe(letter.byOutcome[outcome]);
        d.run({ type: 'SetFlag', flag: communityLetterFlag(letter.id), value: due.outcome });
        d.s.flags[letter.outcomeFlag] = versions.find((other) => other !== outcome)!;
        expect(dueCommunityLetters(d.s)).toEqual([]);
        expect(receivedCommunityLetters(d.s)[0]?.body).toBe(letter.byOutcome[outcome]);
      }
    }
  });
});

describe('The Second Take', () => {
  it.each([
    ['desk', 'Keep the public reel'], ['bench', 'Set the first passage'],
  ])('checks two takes and brings the %s index to Vesper', (edition, choice) => {
    const d = new Driver();
    expect(mapProp(d, VOICES_LISTENING, 'voices-elsbet-reel-first')).toBeUndefined();
    expect(mapProp(d, VOICES_WALK, 'voices-elsbet-register')).toBeUndefined();
    d.s.objectivesDone.push('voices.finish');
    const letter = LETTERS.find((entry) => entry.id === 'l13')!;
    expect(composeLetter(letter, d.s).join(' ')).not.toContain('you heard her');
    d.walk(mapProp(d, VOICES_LISTENING, 'voices-elsbet-reel-first')!.node!);
    expect(mapProp(d, VOICES_LISTENING, 'voices-elsbet-reel-second')).toBeUndefined();
    const register = mapProp(d, VOICES_WALK, 'voices-elsbet-register')!;
    expect(register.text).toContain('Two bands by one speaker');
    d.run({ type: 'SetFlag', flag: register.flag!, value: true });
    d.walk(mapProp(d, VOICES_LISTENING, 'voices-elsbet-reel-second')!.node!);
    expect(d.done('voices.elsbet.heard')).toBe(true);
    const slot = mapProp(d, VOICES_LISTENING, 'voices-elsbet-copy-slot')!;
    d.walk(slot.node!, ['Leave the reel']);
    expect(d.s.inventory['item.elsbet.index']).toBeUndefined();
    d.walk(slot.node!, [choice]);
    expect(d.done('voices.elsbet.handled')).toBe(true);
    expect(d.s.inventory['item.elsbet.index']).toBe(1);
    expect(mapProp(d, VOICES_LISTENING, `voices-elsbet-${edition}-copy`)).toBeDefined();
    expect(composeLetter(letter, d.s).join(' ')).toContain(edition === 'desk' ? 'at the desk' : 'at the bench');
    d.walk('vesper.meet', ['Slide Elsbet’s listening index', 'I do not have', 'Go on', 'Not yet']);
    expect(d.s.flags['node.vesper.index']).toBe(true);
    expect(d.s.inventory['item.elsbet.index']).toBeUndefined();
    expect(d.s.flags['ending.council']).toBeUndefined();
  });
});
