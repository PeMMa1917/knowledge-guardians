/**
 * The Lens Table panel (chapter 9 signature game). Rules in ../domain/lensTable.ts.
 * Choose two lenses and two objects, read the account, hear what it leaves out, then give it a title.
 * Every account and every title gets a reply; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { EVENT, LENSES, OBJECTS, TITLES, account, leftOut } from '../domain/lensTable';
import { h } from './dom';

export function lensPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'lens' });
  let lenses: string[] = [];
  let objects: string[] = [];
  let title: string | null = null;
  let stage: 'choose' | 'account' | 'title' | 'done' = 'choose';

  const toggle = (list: string[], id: string): string[] => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const cards = (label: string, all: { id: string; name: string }[], chosen: string[], set: (v: string[]) => void): HTMLElement =>
    h('div', { class: 'lens-cards', role: 'group', 'aria-label': label }, h('h3', {}, label), ...all.map((x) => h('button', {
      type: 'button', 'aria-pressed': String(chosen.includes(x.id)), disabled: !chosen.includes(x.id) && chosen.length >= 2,
      onclick: () => { set(toggle(chosen, x.id)); sfx('sfx.click'); render(); } }, x.name)));

  const choose = (): (HTMLElement | string)[] => [
    h('p', {}, `Director Edda lays the cards on the green table. 'Last spring. ${EVENT} Everyone in this house tells it a different way. Choose two people to see it through, and two things it left behind. Then tell me what happened.'`),
    cards('Lens cards (choose two)', LENSES, lenses, (v) => { lenses = v; }),
    cards('Object cards (choose two)', OBJECTS, objects, (v) => { objects = v; }),
    h('button', { type: 'button', class: 'primary', disabled: lenses.length !== 2 || objects.length !== 2, onclick: () => {
      stage = 'account'; sfx('sfx.page');
      c.dispatch({ type: 'SetFlag', flag: 'field.lens.cards', value: [...lenses, ...objects].join(',') });
      render();
    } }, 'Lay out the account'),
  ];

  const accountStage = (): (HTMLElement | string)[] => {
    const missing = leftOut(lenses, objects);
    return [
      h('ol', { class: 'lens-account' }, ...account(lenses, objects).map((l) => h('li', {}, l))),
      missing.length
        ? h('p', { class: 'clue-view fresh', role: 'status' }, missing[0])
        : h('p', { class: 'clue-view fresh', role: 'status' }, "Edda reads it twice. 'You found the reason and the cost. Your account still has only two people in it. That is all any account has: a few people, and a few things.'"),
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => { lenses = []; objects = []; stage = 'choose'; sfx('sfx.page'); render(); } }, 'Choose other cards'),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'title'; render(); } }, 'Give the account a title')),
    ];
  };

  const titleStage = (): (HTMLElement | string)[] => [
    h('p', {}, "Host Hari holds up a blank programme. 'This goes in next season's programme, under one heading. What do we call that night?'"),
    ...(title
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, TITLES.find((t) => t.id === title)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Put the cards away')]
      : [h('div', { class: 'row' }, ...TITLES.map((t) => h('button', { type: 'button', onclick: () => {
        title = t.id; c.dispatch({ type: 'SetFlag', flag: 'field.lens.title', value: t.id }); sfx('sfx.page'); render();
      } }, t.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Bram comes in from the wings for his coat and sees his note on the table. 'You read the log, then. Good. Somebody should.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'choose' ? choose() : stage === 'account' ? accountStage() : stage === 'title' ? titleStage() : done();
    box.replaceChildren(h('h2', {}, 'The Lens Table'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
