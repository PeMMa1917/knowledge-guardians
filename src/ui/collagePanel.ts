/**
 * The Collage Wall panel (chapter 13 signature game). Rules in ../domain/collageWall.ts.
 * A content note first. Then the player joins pairs of cards with thread and reads what each join shows,
 * hears which voice the wall lacks, and says which card tells most. Every answer gets a reply (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { ASKS, CARDS, JOINS_TO_STEP_BACK, MISSING, NOTE, SOURCES, join, joinKey } from '../domain/collageWall';
import { h } from './dom';

type Stage = 'note' | 'wall' | 'ask' | 'done';

export function collagePanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'collage' });
  let stage: Stage = 'note';
  let held: string | null = null;
  const joined: string[] = [];
  let latest: string | null = null;
  let ask: string | null = null;

  const name = (id: string) => CARDS.find((x) => x.id === id)!.name;
  const pick = (id: string): void => {
    if (!held) { held = id; sfx('sfx.click'); render(); return; }
    if (held === id) { held = null; render(); return; }
    const key = joinKey(held, id);
    if (!joined.includes(key)) { joined.push(key); c.dispatch({ type: 'SetFlag', flag: 'field.collage.joins', value: joined.join(',') }); }
    latest = key; held = null; sfx('sfx.page'); render();
  };

  const note = (): (HTMLElement | string)[] => [
    h('p', { class: 'collage-note', role: 'note' }, NOTE),
    h('div', { class: 'row' },
      h('button', { type: 'button', onclick: close }, 'Come back later'),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'wall'; sfx('sfx.page'); render(); } }, 'Look at the wall')),
  ];

  const wall = (): (HTMLElement | string)[] => [
    h('p', {}, "Listener Wren pins the last card up. 'Four things from the same work, made by four different hands. Run a thread between two of them, and tell me what the pair says that one card cannot.'"),
    h('div', { class: 'collage-cards', role: 'group', 'aria-label': 'Cards on the wall' }, ...CARDS.map((card) => h('button', {
      type: 'button', class: 'collage-card', 'aria-pressed': String(held === card.id), onclick: () => pick(card.id) },
      h('strong', {}, `${card.name} (${card.date})`), h('span', {}, card.text)))),
    h('p', { class: 'fine', role: 'status' }, held ? `Thread tied to ${name(held)}. Choose a second card.` : 'Choose a card to tie the thread to.'),
    latest ? h('p', { class: 'clue-view fresh' }, `${name(latest.split('.')[0])} and ${name(latest.split('.')[1]).toLowerCase()}: ${join(...(latest.split('.') as [string, string]))}`) : '',
    h('p', { class: 'fine' }, `Threads on the wall: ${joined.length} of 6.`),
    h('button', { type: 'button', class: 'primary', disabled: joined.length < JOINS_TO_STEP_BACK, 'data-autofocus': joined.length >= JOINS_TO_STEP_BACK,
      onclick: () => { stage = 'ask'; sfx('sfx.page'); render(); } }, 'Step back from the wall'),
  ];

  const askStage = (): (HTMLElement | string)[] => [
    h('p', { class: 'clue-view' }, MISSING),
    h('p', {}, "Walk Clerk Eren holds up a blank label. 'If a visitor wants to know what climbing was like, which card do we send them to?'"),
    ...(ask
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, ASKS.find((a) => a.id === ask)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Write the label')]
      : [h('div', { class: 'row' }, ...ASKS.map((a) => h('button', { type: 'button', onclick: () => {
        ask = a.id; c.dispatch({ type: 'SetFlag', flag: 'field.collage.ask', value: a.id }); sfx('sfx.page'); render();
      } }, a.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "The label under the wall reads: 'Four records made by adults. The children who climbed left almost none of their own. Look for them in the joins, and in the gap.'"),
    h('details', { class: 'collage-sources' }, h('summary', {}, 'Where these records are kept'),
      h('ul', {}, ...SOURCES.map((s) => h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title))))),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'note' ? note() : stage === 'wall' ? wall() : stage === 'ask' ? askStage() : done();
    box.replaceChildren(h('h2', {}, 'The Collage Wall'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
