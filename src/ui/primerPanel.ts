/**
 * The Primer Page panel (chapter 9 field game). Rules in ../domain/primerPage.ts.
 * Choose one picture and one caption, hear what the page shows and hides, then answer a child's
 * question. Every choice gets a reply; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { ANSWERS, CAPTIONS, INTRO, PICTURES, TEXT, childAsks, together } from '../domain/primerPage';
import { h } from './dom';

type Stage = 'choose' | 'page' | 'child' | 'done';

export function primerPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'primer' });
  let stage: Stage = 'choose';
  let picture: string | null = null;
  let caption: string | null = null;
  let answer: string | null = null;

  const group = (label: string, items: { id: string; text: string; name?: string }[], chosen: string | null, set: (id: string) => void): HTMLElement =>
    h('div', { class: 'primer-group', role: 'group', 'aria-label': label }, h('h3', {}, label), ...items.map((x) => h('button', {
      type: 'button', class: 'primer-card', 'aria-pressed': String(chosen === x.id), onclick: () => { set(x.id); sfx('sfx.click'); render(); } },
      x.name ? h('strong', {}, x.name) : '', h('span', {}, x.text))));

  const choose = (): (HTMLElement | string)[] => [
    h('p', {}, INTRO),
    group('Pictures (choose one)', PICTURES, picture, (id) => { picture = id; }),
    group('Captions (choose one)', CAPTIONS, caption, (id) => { caption = id; }),
    h('button', { type: 'button', class: 'primary', disabled: !picture || !caption, onclick: () => {
      c.dispatch({ type: 'SetFlag', flag: 'field.primer.page', value: `${picture}+${caption}` }); stage = 'page'; sfx('sfx.page'); render();
    } }, 'Set the page'),
  ];

  const page = (): (HTMLElement | string)[] => {
    const p = PICTURES.find((x) => x.id === picture)!;
    const cap = CAPTIONS.find((x) => x.id === caption)!;
    return [
      h('figure', { class: 'primer-proof' }, h('div', { class: 'primer-picture' }, p.text), h('figcaption', {}, cap.text)),
      h('p', { class: 'clue-view fresh' }, p.shows),
      h('p', { class: 'clue-view' }, p.hides),
      h('p', {}, together(picture!, caption!)),
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => { stage = 'choose'; sfx('sfx.page'); render(); } }, 'Try another page'),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'child'; sfx('sfx.page'); render(); } }, 'Send the proof down')),
    ];
  };

  const child = (): (HTMLElement | string)[] => [
    h('p', {}, childAsks(picture!)),
    ...(answer
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, ANSWERS.find((a) => a.id === answer)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Sign the proof')]
      : [h('div', { class: 'row' }, ...ANSWERS.map((a) => h('button', { type: 'button', onclick: () => {
        answer = a.id; c.dispatch({ type: 'SetFlag', flag: 'field.primer.child', value: a.id }); sfx('sfx.page'); render();
      } }, a.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, TEXT.close),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'choose' ? choose() : stage === 'page' ? page() : stage === 'child' ? child() : done();
    box.replaceChildren(h('h2', {}, 'The Primer Page'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
