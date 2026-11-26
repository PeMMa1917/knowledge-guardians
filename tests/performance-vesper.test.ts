import { describe, expect, it } from 'vitest';
import { arrivedLetters, composeLetter, dueLetters } from '../src/domain/letters';
import { check } from '../src/domain/rules';
import type { ShowdownMove } from '../src/domain/showdown';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const stage = MAPS['stage.foyer'];
const vesper = stage.npcs.find((actor) => actor.id === 'vesper-quill')!;
const cards = ['card.stage.vesper.cues', 'card.stage.vesper.seats', 'card.stage.vesper.usher'] as const;
const cue = { move: 'claim', claim: 'cue' } as const;
const comparison = { move: 'claim', claim: 'comparison' } as const;
const usher = { move: 'support', card: cards[2] } as const;
const rest = { move: 'rest' } as const;

function afterRevision(d: Driver) {
  d.s.mapId = stage.id;
  d.s.objectivesDone.push('stage.finish');
  d.s.flags['stage.response'] = 'move';
  d.s.flags['stage.followup'] = true;
  return d;
}

function debate(d: Driver) {
  const node = d.e.talkEntry(vesper.id, d.s);
  expect(node).toBe('vesper.stage.start');
  d.run({ type: 'EnterNode', node: node! });
  const entry = d.e.visibleOptions(node!, d.s).find(({ option }) => option.open === 'showdown:stage-vesper');
  expect(entry).toBeTruthy();
  const choice = d.run({ type: 'ChooseDialogueOption', node: node!, index: entry!.index });
  expect(choice.nextNode).toBeNull();
  d.run({ type: 'ShowdownStart', showdown: 'stage-vesper' });
  expect(d.s.cards).toEqual(expect.arrayContaining([...cards]));
}

describe('One Line Before the Bell', () => {
  it('lets the player pass through the foyer and keeps the Council conversation separate', () => {
    const d = new Driver();
    expect(check(vesper.visibleIf, d.s)).toBe(false);
    afterRevision(d);
    expect(check(vesper.visibleIf, d.s)).toBe(true);
    d.talk(vesper.id, 'Leave the foyer');
    expect(d.s.showdown).toBeNull();
    expect(d.s.cards).not.toContain(cards[0]);
    expect(dueLetters(d.s).some((letter) => letter.id === 'l09')).toBe(false);

    // Older saves received the chapter letter simply for revising the programme.
    d.run({ type: 'SetFlag', flag: 'letter.l09', value: true });
    const legacy = arrivedLetters(d.s).find((letter) => letter.id === 'l09')!;
    expect(composeLetter(legacy, d.s).join(' ')).not.toMatch(/Harrowmere|you won/i);

    d.s.objectivesDone.push('council.arrival');
    d.s.mapId = 'council.hall';
    expect(check(vesper.visibleIf, d.s)).toBe(false);
    expect(d.e.talkEntry(vesper.id, d.s)).toBe('vesper.meet');
    d.run({ type: 'SetFlag', flag: 'node.vesper.choose', value: true });
    expect(d.e.talkEntry(vesper.id, d.s)).toBe('vesper.ready');
    d.run({ type: 'SetFlag', flag: 'ending.council', value: 'correct' });
    expect(d.e.talkEntry(vesper.id, d.s)).toBe('vesper.after');
  });

  const routes: [string, ShowdownMove[], string][] = [
    ['exposed', [cue, usher, { move: 'challenge', link: 'pause', card: cards[0] }, { move: 'challenge', link: 'view', card: cards[1] }], 'took down my refusal caption'],
    ['narrowed', [cue, usher, { move: 'counter', card: cards[1] }, rest], 'crossed out “refused”'],
    ['won-over', [cue, usher, { move: 'concede' }, { move: 'reframe' }, rest], 'doorway call'],
    ['split', [comparison, rest], 'left two stacks'],
    ['lost-ground', [comparison, { move: 'attack' }, { move: 'attack' }, rest], 'carried my first card'],
  ];

  it.each(routes)('%s leads to its own board and letter without changing the programme', (outcome, moves, remembered) => {
    const d = afterRevision(new Driver());
    const credit = { ...d.p.credit };
    debate(d);
    d.moves(moves[0]);
    expect(dueLetters(d.s).some((letter) => letter.id === 'l09')).toBe(false);
    d.run({ type: 'ShowdownStart', showdown: 'stage-vesper' });
    expect(d.s.showdown?.claim).toBe((moves[0] as typeof cue | typeof comparison).claim);
    d.moves(...moves.slice(1));
    expect(d.s.flags['sd.stage-vesper.outcome']).toBe(outcome);
    expect(d.s.flags['sd.stage-vesper.conceded']).toBe(outcome === 'won-over');

    const displays = stage.interactables.filter((prop) => prop.id.startsWith('stage-vesper-') && check(prop.visibleIf, d.s));
    expect(displays.map(({ id }) => id)).toEqual([`stage-vesper-${outcome}`]);
    const farewell = d.e.talkEntry(vesper.id, d.s);
    expect(farewell).toBe('vesper.stage.after');
    expect(d.e.node(farewell!).text).toContain('Ask Ise about Harrowmere.');
    const letter = dueLetters(d.s).find((entry) => entry.id === 'l09')!;
    expect(composeLetter(letter, d.s).join(' ')).toContain(remembered);
    expect(d.s.flags['harrowmere.found']).toBeUndefined();
    expect(d.s.flags['stage.response']).toBe('move');
    expect(d.s.flags['stage.followup']).toBe(true);
    expect(d.p.credit).toEqual(credit);
  });
});
