/**
 * The River Crossing Inquiry panel (chapter 11 signature game). Rules in ../domain/riverCrossing.ts.
 * Read the flood-night story, rank who acted worst, hear the villager who ranks the same way, compare
 * Omi's and Sena's ranks, then learn one more fact and rank again or keep the rank. Every rank gets a
 * reply; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { AFTER, CLOSE, FACT, KEEPERS, PEOPLE, RULE, STORY, complete, ravelMoved, samePlaces, voiceFor } from '../domain/riverCrossing';
import { h } from './dom';

type Stage = 'story' | 'rank' | 'voice' | 'keepers' | 'fact' | 'rerank' | 'after' | 'done';

export function riverPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'river' });
  let stage: Stage = 'story';
  let rank: string[] = [];
  let first: string[] = [];
  let kept = false;

  const person = (id: string) => PEOPLE.find((p) => p.id === id)!;
  const ordered = (r: string[]): HTMLElement => h('ol', { class: 'river-rank' }, ...r.map((id) => h('li', {}, `${person(id).name.replace(/^./, (ch) => ch.toUpperCase())}, who ${person(id).did}`)));

  const ranker = (label: string, done: () => void): (HTMLElement | string)[] => [
    h('p', {}, label),
    h('div', { class: 'river-people', role: 'group', 'aria-label': 'People, worst first' }, ...PEOPLE.map((p) => {
      const at = rank.indexOf(p.id);
      return h('button', { type: 'button', 'aria-pressed': String(at >= 0), disabled: at >= 0, onclick: () => { rank = [...rank, p.id]; sfx('sfx.click'); render(); } },
        at >= 0 ? `${at + 1}. ${p.name}` : p.name);
    })),
    rank.length ? ordered(rank) : '',
    h('div', { class: 'row' },
      h('button', { type: 'button', disabled: !rank.length, onclick: () => { rank = []; sfx('sfx.page'); render(); } }, 'Start the order again'),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': complete(rank), disabled: !complete(rank), onclick: done }, 'Pin the order to the board')),
  ];

  const story = (): (HTMLElement | string)[] => [
    h('p', {}, "Weirkeeper Omi spreads the old ford log on the bench. 'Before the new flood rule, the village argued about one night for a whole year. Read it, then tell me who acted worst. Everyone here has an order. Nobody has the same one.'"),
    ...STORY.map((s) => h('p', { class: 'river-story' }, s)),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'rank'; sfx('sfx.page'); render(); } }, 'Rank who acted worst'),
  ];

  const voice = (): (HTMLElement | string)[] => {
    const v = voiceFor(first[0]);
    return [
      ordered(first),
      h('p', {}, `Omi taps your first name. 'You are not alone. ${v.who} put ${person(first[0]).name} first too, and said this:'`),
      h('p', { class: 'clue-view fresh', role: 'status' }, v.line),
      h('p', {}, "'That is one way of judging. Look at who the others put first.'"),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'keepers'; sfx('sfx.page'); render(); } }, 'See Omi’s and Sena’s orders'),
    ];
  };

  const keepers = (): (HTMLElement | string)[] => [
    ...KEEPERS.flatMap((k) => [h('h3', {}, k.speaker), ordered(k.rank), h('p', {}, k.why),
      h('p', { class: 'fine' }, `${samePlaces(first, k.rank)} of 5 people are in the same place as on your order.`)]),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'fact'; sfx('sfx.page'); render(); } }, 'Read the rest of the log'),
  ];

  const fact = (): (HTMLElement | string)[] => [
    h('p', { class: 'clue-view fresh', role: 'status' }, FACT),
    ordered(first),
    h('div', { class: 'row' },
      h('button', { type: 'button', onclick: () => { rank = []; stage = 'rerank'; sfx('sfx.page'); render(); } }, 'Make a new order'),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { kept = true; rank = first; stage = 'after'; sfx('sfx.page'); render(); } }, 'Keep my order')),
  ];

  const after = (): (HTMLElement | string)[] => {
    const same = kept || rank.join() === first.join();
    const moved = !same && ravelMoved(first, rank);
    return [
      ordered(rank),
      h('p', { class: 'clue-view fresh', role: 'status' }, moved ? AFTER.moved : same ? AFTER.kept : AFTER.changed),
      h('p', {}, CLOSE),
      h('p', { class: 'river-rule' }, RULE),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Close the log'),
    ];
  };

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Ravel is mending a net at the ford. 'They still argue about it at the gate. I have a new boat now. I lend it to the ford keeper.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'story' ? story()
      : stage === 'rank' ? ranker('Choose the person who acted worst, then the next, until all five are in order.', () => {
        first = rank; c.dispatch({ type: 'SetFlag', flag: 'field.river.rank', value: rank.join(',') }); stage = 'voice'; sfx('sfx.page'); render(); })
      : stage === 'voice' ? voice()
      : stage === 'keepers' ? keepers()
      : stage === 'fact' ? fact()
      : stage === 'rerank' ? ranker('Make the order again, worst first, with what you know now.', () => {
        c.dispatch({ type: 'SetFlag', flag: 'field.river.rerank', value: rank.join(',') }); stage = 'after'; sfx('sfx.page'); render(); })
      : stage === 'after' ? after()
      : done();
    box.replaceChildren(h('h2', {}, 'The River Crossing Inquiry'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
