/**
 * The Pattern Book panel (chapter 10 field game). Rules in ../domain/patternBook.ts.
 * Read three real cases (each people separately, with sources), meet the weavers' elder, then make an
 * offer on consent, credit and share. The weavers answer each term; the player can change the offer
 * or suggest buying from the weavers instead.
 */
import type { GameController } from '../app/controller';
import { CASES, ELDER, INTRO, SOURCES, TERMS, TEXT, objections, refused, type Offer } from '../domain/patternBook';
import { h } from './dom';

type Stage = 'book' | 'offer' | 'answer' | 'done';

export function patternPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'pattern' });
  let stage: Stage = 'book';
  const offer: Offer = {};
  let bought = false;

  const src = (id: string) => SOURCES.find((s) => s.id === id)!;
  const link = (id: string) => h('a', { href: src(id).url, target: '_blank', rel: 'noopener noreferrer' }, src(id).title);

  const book = (): (HTMLElement | string)[] => [
    h('p', {}, INTRO),
    ...CASES.map((cs) => h('section', { class: 'pattern-case' }, h('h3', {}, cs.people), h('p', {}, cs.text),
      h('p', { class: 'fine' }, h('strong', {}, 'How they said it: '), cs.tool), h('p', { class: 'fine' }, 'Source: ', link(cs.source),
        ...(cs.id === 'maasai' ? [' and ', link('HIS-PAT-MAASAI-MIPI')] : [])))),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'offer'; sfx('sfx.page'); render(); } }, 'Ask the weavers'),
  ];

  const offerStage = (): (HTMLElement | string)[] => [
    h('p', {}, ELDER),
    ...TERMS.map((t) => h('fieldset', { class: 'pattern-term' }, h('legend', {}, t.label), ...t.options.map((o) => h('label', { class: 'check' },
      h('input', { type: 'radio', name: `pattern-${t.id}`, checked: offer[t.id] === o.id, onchange: () => { offer[t.id] = o.id; syncGive(); } }), h('span', {}, o.text))))),
    h('div', { class: 'row' },
      h('button', { type: 'button', onclick: () => { bought = true; stage = 'answer'; c.dispatch({ type: 'SetFlag', flag: 'field.pattern.offer', value: 'buy' }); sfx('sfx.page'); render(); } }, TEXT.buy.text),
      h('button', { type: 'button', class: 'primary pattern-give', disabled: TERMS.some((t) => !offer[t.id]), onclick: () => {
        bought = false; stage = 'answer';
        c.dispatch({ type: 'SetFlag', flag: 'field.pattern.offer', value: TERMS.map((t) => offer[t.id]).join(',') });
        sfx('sfx.page'); render();
      } }, 'Give Yeva the offer')),
  ];

  const answer = (): (HTMLElement | string)[] => {
    if (bought) return [h('p', { class: 'clue-view fresh', role: 'status' }, TEXT.buy.reply), next()];
    const objs = refused(offer) ? [TEXT.answers['consent.none']] : objections(offer);
    return [
      ...(objs.length ? objs.map((o) => h('p', { class: 'clue-view fresh' }, o)) : [h('p', { class: 'clue-view fresh', role: 'status' }, TEXT.accept)]),
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => { stage = 'offer'; sfx('sfx.page'); render(); } }, 'Change the offer'),
        next()),
    ];
  };
  /** Enable the offer button without re-rendering, so keyboard focus stays in the radio group. */
  function syncGive(): void {
    const b = box.querySelector<HTMLButtonElement>('.pattern-give');
    if (b) b.disabled = TERMS.some((t) => !offer[t.id]);
  }
  function next(): HTMLElement {
    return h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Close the pattern book');
  }

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, TEXT.close),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'book' ? book() : stage === 'offer' ? offerStage() : stage === 'answer' ? answer() : done();
    box.replaceChildren(h('h2', {}, 'The Pattern Book'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
