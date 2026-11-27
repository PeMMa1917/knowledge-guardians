/**
 * The Value Fair panel (chapter 10 signature game). Rules in ../domain/valueFair.ts.
 * Spend tokens on claims, see which are kept and which clash, compare with Tellen and Dagny, then say
 * what the largest bid protected. Every answer gets a reply; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { CLAIMS, KEEP, OTHERS, TOKENS, VALUES, clashes, kept, largest, spent, type Bids } from '../domain/valueFair';
import { h } from './dom';

export function fairPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'value-fair' });
  let bids: Bids = {};
  let value: string | null = null;
  let stage: 'bid' | 'meeting' | 'value' | 'done' = 'bid';
  const text = (id: string) => CLAIMS.find((x) => x.id === id)!.text;

  const bid = (): (HTMLElement | string)[] => {
    const left = TOKENS - spent(bids);
    return [
      h('p', {}, `Clerk Dagny pours ${TOKENS} wooden tokens into your hand. 'Tomorrow the town meets to set the market rules. Each token is an hour of getting ready: finding witnesses, checking weights, writing it out. A claim with fewer than ${KEEP} tokens will not be defended, and it will be dropped. Spend them on what you care about.'`),
      h('p', { class: 'fine', role: 'status' }, `Tokens left: ${left}`),
      h('ul', { class: 'vfair-claims' }, ...CLAIMS.map((cl) => h('li', {},
        h('span', {}, cl.text),
        h('span', { class: 'vfair-count', 'aria-label': `${bids[cl.id] ?? 0} tokens` }, String(bids[cl.id] ?? 0)),
        h('button', { type: 'button', 'aria-label': `Take a token from: ${cl.text}`, disabled: !(bids[cl.id] ?? 0),
          onclick: () => { bids = { ...bids, [cl.id]: (bids[cl.id] ?? 0) - 1 }; sfx('sfx.click'); render(); } }, '−'),
        h('button', { type: 'button', 'aria-label': `Add a token to: ${cl.text}`, disabled: left <= 0,
          onclick: () => { bids = { ...bids, [cl.id]: (bids[cl.id] ?? 0) + 1 }; sfx('sfx.click'); render(); } }, '+')))),
      h('button', { type: 'button', class: 'primary', disabled: left !== 0, onclick: () => {
        stage = 'meeting'; sfx('sfx.page');
        c.dispatch({ type: 'SetFlag', flag: 'field.fair.kept', value: kept(bids).join(',') });
        render();
      } }, 'Go to the town meeting'),
    ];
  };

  const meeting = (): (HTMLElement | string)[] => {
    const mine = kept(bids);
    return [
      h('p', {}, 'At the meeting, the claims you prepared are defended. The others are read out once and dropped.'),
      h('ul', {}, ...CLAIMS.map((cl) => h('li', {}, `${mine.includes(cl.id) ? 'Kept' : 'Dropped'}: ${cl.text}`))),
      ...clashes(bids).map((l) => h('p', { class: 'clue-view fresh' }, l)),
      ...OTHERS.map((o) => h('div', { class: 'vfair-other' },
        h('h3', {}, `${o.who} would have kept`),
        h('p', {}, kept(o.bids).map(text).join(' ')),
        h('p', { class: 'fine' }, o.why))),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'value'; render(); } }, 'Talk it over'),
    ];
  };

  const valueStage = (): (HTMLElement | string)[] => {
    const top = largest(bids);
    return [
      h('p', {}, `Tellen points at your biggest pile${top ? `, on “${text(top)}”` : ''}. 'Same market, three sets of rules. Nobody here lied. So what did your biggest pile protect?'`),
      ...(value
        ? [h('p', { class: 'clue-view fresh', role: 'status' }, VALUES.find((v) => v.id === value)!.reply),
          h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Hand back the tokens')]
        : [h('div', { class: 'row' }, ...VALUES.map((v) => h('button', { type: 'button', onclick: () => {
          value = v.id; c.dispatch({ type: 'SetFlag', flag: 'field.fair.value', value: v.id }); sfx('sfx.page'); render();
        } }, v.text)))]),
    ];
  };

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Dagny drops the tokens back in their bag. 'Every rule in this market was paid for by somebody's evening. Now you know whose.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'bid' ? bid() : stage === 'meeting' ? meeting() : stage === 'value' ? valueStage() : done();
    box.replaceChildren(h('h2', {}, 'The Value Fair'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
