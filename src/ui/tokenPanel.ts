/**
 * The Token Drawer panel (chapter 3 signature game). Rules in ../domain/tokenDrawer.ts.
 * A content note first. Then: choose what a billet keeps, match three returning parents' words to sealed
 * packets, and label a case of tokens whose billets were lost. Every choice gets a reply (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { BILLET_SIZE, DISPLAY, FIELDS, INTRO, LABELS, MATCHED, NOTE, NOT_MATCHED, RETURN, SOURCES, TOKENS, matches, notKept, returning } from '../domain/tokenDrawer';
import { h } from './dom';

type Stage = 'note' | 'billet' | 'kept' | 'return' | 'display' | 'done';

export function tokenPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'tokens' });
  let stage: Stage = 'note';
  let chosen: string[] = [];
  const parents = returning(Number(c.state.flags['field.tokens.plays'] ?? 0));
  let at = 0;
  let reply = '';
  const opened: string[] = [];
  let label: string | null = null;

  const note = (): (HTMLElement | string)[] => [
    h('p', { class: 'collage-note', role: 'note' }, NOTE),
    h('div', { class: 'row' },
      h('button', { type: 'button', onclick: close }, 'Come back later'),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'billet'; sfx('sfx.page'); render(); } }, 'Open the drawer')),
  ];

  const billet = (): (HTMLElement | string)[] => [
    h('p', {}, INTRO),
    h('p', {}, `'You are the clerk tonight. A billet has room for ${BILLET_SIZE} lines. What do you write?'`),
    h('div', { class: 'token-fields', role: 'group', 'aria-label': 'Lines on the billet' }, ...FIELDS.map((f) => h('button', {
      type: 'button', 'aria-pressed': String(chosen.includes(f.id)), disabled: !chosen.includes(f.id) && chosen.length >= BILLET_SIZE,
      onclick: () => { chosen = chosen.includes(f.id) ? chosen.filter((x) => x !== f.id) : [...chosen, f.id]; sfx('sfx.click'); render(); } }, f.text))),
    h('button', { type: 'button', class: 'primary', disabled: chosen.length !== BILLET_SIZE, onclick: () => {
      c.dispatch({ type: 'SetFlag', flag: 'field.tokens.billet', value: chosen.join(',') }); stage = 'kept'; sfx('sfx.page'); render();
    } }, 'Seal the billet'),
  ];

  const kept = (): (HTMLElement | string)[] => {
    const lost = notKept(chosen);
    return [
      h('ul', { class: 'token-replies' }, ...chosen.map((id) => h('li', {}, FIELDS.find((f) => f.id === id)!.reply))),
      lost.length ? '' : h('p', { class: 'clue-view fresh' }, FIELDS.find((f) => f.id === 'name')!.reply),
      h('p', {}, "Aster: 'And see what your billet cannot hold: who the parent was, why they came, what they hoped. The token had to carry all of that.'"),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'return'; sfx('sfx.page'); render(); } }, 'Go to the inquiry desk'),
    ];
  };

  const ret = (): (HTMLElement | string)[] => {
    const parent = parents[at];
    return [
      h('p', {}, RETURN),
      h('p', { class: 'token-clue' }, `Parent ${at + 1} of ${parents.length}: '${parent.clue}'`),
      reply ? h('p', { class: 'clue-view fresh', role: 'status' }, reply) : '',
      h('div', { class: 'token-packets', role: 'group', 'aria-label': 'Sealed packets' }, ...TOKENS.map((t, i) => h('button', {
        type: 'button', class: 'token-packet', disabled: opened.includes(t.id),
        onclick: () => {
          if (matches(parent, t.id)) {
            opened.push(t.id); reply = `${MATCHED} ${t.text}`; sfx('sfx.sparkle');
            if (at + 1 < parents.length) at += 1; else { stage = 'display'; c.dispatch({ type: 'SetFlag', flag: 'field.tokens.plays', value: Number(c.state.flags['field.tokens.plays'] ?? 0) + 1 }); }
          } else { reply = NOT_MATCHED; sfx('sfx.page'); }
          render();
        } }, h('strong', {}, `Packet ${i + 1}`), h('span', {}, opened.includes(t.id) ? 'Opened' : `Billet note: ${t.billet}`)))),
    ];
  };

  const display = (): (HTMLElement | string)[] => [
    reply ? h('p', { class: 'clue-view' }, reply) : '',
    h('p', {}, DISPLAY),
    ...(label
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, LABELS.find((l) => l.id === label)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Close the drawer')]
      : [h('div', { class: 'row' }, ...LABELS.map((l) => h('button', { type: 'button', onclick: () => {
        label = l.id; c.dispatch({ type: 'SetFlag', flag: 'field.tokens.label', value: l.id }); sfx('sfx.page'); render();
      } }, l.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Aster slides the drawer shut. 'Our own board has one heading for two places. A billet had one line for a whole life. Every record chooses what to keep.'"),
    h('details', { class: 'collage-sources' }, h('summary', {}, 'Where these tokens are kept'),
      h('ul', {}, ...SOURCES.map((s) => h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title))))),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'note' ? note() : stage === 'billet' ? billet() : stage === 'kept' ? kept() : stage === 'return' ? ret() : stage === 'display' ? display() : done();
    box.replaceChildren(h('h2', {}, 'The Token Drawer'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
