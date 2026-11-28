/**
 * The Time Mirror panel (chapter 15 signature game). Rules in ../domain/timeMirror.ts.
 * Shows the player's first and latest journal entries, asks how they would rewrite the first, and lets
 * the past self answer. Every choice gets a reply; none is marked right.
 */
import type { GameController } from '../app/controller';
import { journalText } from '../domain/adventureJournal';
import { QUESTION, REWRITE, thenAndNow } from '../domain/timeMirror';
import { h } from './dom';

export function mirrorPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'mirror' });
  let choice: string | null = null;
  let stage: 'look' | 'rewrite' | 'done' = 'look';
  const entry = (id: string): string => {
    const j = c.pack.journal.find((x) => x.id === id);
    return j ? journalText(j, c.state) : '';
  };

  const look = (): (HTMLElement | string)[] => {
    const { then, now } = thenAndNow(c.state.journal);
    return [
      h('p', {}, "Workshop Keeper Hale draws a cloth off a tall, old mirror. 'Elsbet's. She said it shows the guardian who first came through the door. Look.'"),
      h('p', {}, 'In the glass is someone who looks like you, but younger, holding the first page of your journal.'),
      h('div', { class: 'mirror-pair' },
        h('div', {}, h('h3', {}, 'Then'), then.length ? h('ol', {}, ...then.map((id) => h('li', {}, entry(id)))) : h('p', {}, 'The page in the mirror is still blank.')),
        h('div', {}, h('h3', {}, 'Now'), now.length ? h('ol', {}, ...now.map((id) => h('li', {}, entry(id)))) : h('p', {}, 'Your newest pages are the same as your first ones. You have not travelled far yet.'))),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'rewrite'; sfx('sfx.page'); render(); } }, 'Answer the guardian in the mirror'),
    ];
  };

  const rewrite = (): (HTMLElement | string)[] => [
    h('p', {}, "The guardian in the mirror holds out the first page. 'You know more than I did. Would you change what I wrote?'"),
    ...(choice
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, REWRITE.find((r) => r.id === choice)!.reply),
        h('p', {}, QUESTION),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Let the glass clear')]
      : [h('div', { class: 'row' }, ...REWRITE.map((r) => h('button', { type: 'button', onclick: () => {
        choice = r.id; c.dispatch({ type: 'SetFlag', flag: 'field.mirror.rewrite', value: r.id }); sfx('sfx.page'); render();
      } }, r.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Hale puts the cloth back. 'Elsbet looked in it every year. She said it was the only record in the Nexus that argued back.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'look' ? look() : stage === 'rewrite' ? rewrite() : done();
    box.replaceChildren(h('h2', {}, 'The Time Mirror'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
