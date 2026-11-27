/**
 * The Reassembly Line panel (chapter 2 field game). Rules in ../domain/reassemblyLine.ts.
 * Rebuild three torn notices (claim, then evidence, then limit), then choose which line goes at the
 * top. A wrong strip is handed back with a reason and can be tried again (X-007). Every order gets
 * replies from both keepers; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { INTRO, KINDS, ORDERS, ORDER_REPLIES, PIECES, TEXT, fixedLine, left, tryPiece, type Kind, type Piece } from '../domain/reassemblyLine';
import { h } from './dom';

type Stage = 'build' | 'order' | 'done';
const LABEL: Record<Kind, string> = { claim: 'Claim', evidence: 'Evidence', limit: 'Where it stops' };

export function reassemblyPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'reassembly' });
  let stage: Stage = 'build';
  const used = new Set<string>();
  const built: Piece[][] = [];
  let current: Piece[] = [];
  let note = '';
  let order: string | null = null;

  const need = (): Kind => KINDS[current.length];
  const notice = (ps: Piece[], done: boolean): HTMLElement => h('div', { class: `reassembly-notice${done ? ' done' : ''}` },
    ...KINDS.map((k, i) => h('p', {}, h('strong', {}, `${LABEL[k]}: `), ps[i] ? ps[i].text : '…')));

  const pick = (p: Piece): void => {
    if (p.kind === 'claim') { current = [p]; used.add(p.id); note = ''; sfx('sfx.click'); render(); return; }
    const why = tryPiece(current[0], p);
    if (why) { note = why; sfx('sfx.page'); render(); return; }
    current = [...current, p]; used.add(p.id); note = '';
    if (current.length === KINDS.length) {
      built.push(current); note = fixedLine(current[0].notice!); current = []; sfx('sfx.sparkle');
      if (built.length === 3) { stage = 'order'; c.dispatch({ type: 'SetFlag', flag: 'field.reassembly.built', value: true }); }
    } else sfx('sfx.click');
    render();
  };

  const build = (): (HTMLElement | string)[] => {
    const k = need();
    const options = k === 'evidence' ? PIECES.filter((p) => p.kind === 'evidence' && !used.has(p.id)) : left(k, used);
    return [
      h('p', {}, INTRO),
      ...built.map((ps) => notice(ps, true)),
      current.length ? notice(current, false) : '',
      note ? h('p', { class: 'clue-view fresh', role: 'status' }, note) : '',
      h('h3', {}, k === 'claim' ? 'Choose a claim to start a notice' : `Choose the ${LABEL[k].toLowerCase()} for this notice`),
      h('div', { class: 'reassembly-strips', role: 'group', 'aria-label': 'Torn strips' }, ...options.map((p) => h('button', {
        type: 'button', class: 'reassembly-strip', onclick: () => pick(p) }, p.text))),
      current.length ? h('button', { type: 'button', onclick: () => { for (const p of current) used.delete(p.id); current = []; note = ''; render(); } }, 'Put these strips back') : '',
    ];
  };

  const orderStage = (): (HTMLElement | string)[] => [
    ...built.map((ps) => notice(ps, true)),
    note && !order ? h('p', { class: 'clue-view' }, note) : '',
    h('p', {}, TEXT.orderAsk),
    ...(order
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, h('strong', {}, 'Marek: '), ORDER_REPLIES[order].marek),
        h('p', { class: 'clue-view' }, h('strong', {}, 'Nasir: '), ORDER_REPLIES[order].nasir),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Pin the notices up')]
      : [h('div', { class: 'row' }, ...ORDERS.map((o) => h('button', { type: 'button', onclick: () => {
        order = o.id; c.dispatch({ type: 'SetFlag', flag: 'field.reassembly.order', value: o.id }); sfx('sfx.page'); render();
      } }, o.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, TEXT.close),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'build' ? build() : stage === 'order' ? orderStage() : done();
    box.replaceChildren(h('h2', {}, 'The Reassembly Line'), ...parts);
    ((box.querySelector('[data-autofocus]') ?? box.querySelector('.reassembly-strip')) as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
