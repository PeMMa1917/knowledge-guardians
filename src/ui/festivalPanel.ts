/**
 * The Festival Dilemma panel (chapter 11 field game). Rules in ../domain/festivalDilemma.ts.
 * Hear four friends' advice, try new facts on them and see whose advice moves, then advise Tess.
 * Every choice gets a reply; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { CHOICES, FACTS, FRIENDS, FRIENDS_TO_HEAR, PROBLEM, SUMMARIES, heardAll, respond } from '../domain/festivalDilemma';
import { h } from './dom';

type Stage = 'problem' | 'table' | 'advise' | 'done';

export function festivalPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'festival' });
  let stage: Stage = 'problem';
  let friend = FRIENDS[0].id;
  const tried = new Set<string>();
  let line = '';
  let advice: string | null = null;

  const heard = (): number => FRIENDS.filter((f) => heardAll(tried, f.id)).length;
  const nameOf = (id: string): string => FRIENDS.find((f) => f.id === id)!.name;

  const problem = (): (HTMLElement | string)[] => [
    h('p', {}, PROBLEM),
    ...FRIENDS.map((f) => h('p', {}, h('strong', {}, `${f.name}: `), f.advice)),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'table'; sfx('sfx.page'); render(); } }, 'Sit down on the wall'),
  ];

  const tally = (): HTMLElement => h('table', { class: 'festival-tally' },
    h('caption', {}, 'What you have tried'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Friend'), ...FACTS.map((fa, i) => h('th', { scope: 'col', title: fa.text }, `Fact ${i + 1}`)))),
    h('tbody', {}, ...FRIENDS.map((fr) => h('tr', {}, h('th', { scope: 'row' }, fr.name), ...FACTS.map((fa) => {
      const k = `${fr.id}.${fa.id}`;
      return h('td', {}, tried.has(k) ? (respond(fr.id, fa.id).moves ? 'changes' : 'holds') : '·');
    })))));

  const table = (): (HTMLElement | string)[] => [
    h('p', {}, "Tess pulls three folded notes from her pocket. 'Things I found out this evening. Try them on the others. See whose mind changes.'"),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Choose a friend' }, ...FRIENDS.map((f) => h('button', {
      type: 'button', 'aria-pressed': String(friend === f.id), onclick: () => { friend = f.id; line = ''; sfx('sfx.click'); render(); } }, f.name))),
    h('div', { class: 'festival-facts', role: 'group', 'aria-label': `Tell ${nameOf(friend)} a fact` }, ...FACTS.map((fa, i) => h('button', {
      type: 'button', onclick: () => {
        const k = `${friend}.${fa.id}`;
        tried.add(k); const r = respond(friend, fa.id);
        line = `${r.line} (${r.moves ? 'This changes their advice.' : 'Their advice holds.'})`;
        if (heardAll(tried, friend)) line += ` ${SUMMARIES[friend]}`;
        c.dispatch({ type: 'SetFlag', flag: 'field.festival.tried', value: [...tried].join(',') });
        sfx('sfx.page'); render();
      } }, `Fact ${i + 1}: ${fa.text}`))),
    line ? h('p', { class: 'clue-view fresh', role: 'status' }, line) : '',
    tally(),
    h('p', { class: 'fine' }, `Friends heard out on every fact: ${heard()}. Hear out at least ${FRIENDS_TO_HEAR} before you answer Tess.`),
    h('button', { type: 'button', class: 'primary', disabled: heard() < FRIENDS_TO_HEAR, onclick: () => { stage = 'advise'; sfx('sfx.page'); render(); } }, 'Answer Tess'),
  ];

  const advise = (): (HTMLElement | string)[] => [
    h('p', {}, "Tess turns to you. 'You have heard all of them now. What do you think I should do?'"),
    ...(advice
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, CHOICES.find((x) => x.id === advice)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Walk back along the lanterns')]
      : [h('div', { class: 'row' }, ...CHOICES.map((x) => h('button', { type: 'button', onclick: () => {
        advice = x.id; c.dispatch({ type: 'SetFlag', flag: 'field.festival.advice', value: x.id }); sfx('sfx.page'); render();
      } }, x.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Weirkeeper Omi is lighting the last lantern. 'Four friends, four honest answers, and none of them wrong to care about what they care about. Your journal has names for the four ways they judged.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'problem' ? problem() : stage === 'table' ? table() : stage === 'advise' ? advise() : done();
    box.replaceChildren(h('h2', {}, 'The Festival Dilemma'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
