/**
 * The Copyists' Ladder panel (chapter 2 field game). Rules and words live in ../domain/wordLadder.ts
 * and ../content/word-ladder.json. Four stages: make a ladder, test patterns, build the proof arch,
 * say what the proof covers. Wrong steps are retried at once (X-007, mini-game retry); no stage fails.
 */
import type { GameController } from '../app/controller';
import {
  APPRENTICES, CHAIN, END, FIFTH, PATTERNS, PREMISES, SCOPES, START, checkStep, holds, neighbours, stepText, testArch,
  type Pattern,
} from '../domain/wordLadder';
import { h } from './dom';

type Stage = 'build' | 'table' | 'arch' | 'scope' | 'done';

export function ladderPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'ladder' });
  let stage: Stage = 'build';
  let ladder = [START];
  let note = '';
  let hint: string[] = [];
  const tested = new Map<string, 'broke' | 'held' | 'broke-late'>();
  let shown: Pattern | null = null;
  const chosen = new Set<string>();
  let scope: string | null = null;

  const rungs = (words: readonly string[], cls = '') => h('ol', { class: `ladder-rungs ${cls}` }, ...words.map((w) => h('li', {}, w)));

  const build = (): (HTMLElement | string)[] => {
    const input = h('input', { type: 'text', maxlength: 4, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Next word', 'data-autofocus': true,
      onkeydown: (e: KeyboardEvent) => { if (e.key === 'Enter') add(input.value); } });
    return [
      h('p', {}, "Nasir pushes a slate across the desk. 'Every new copyist starts here. Turn ship into dock. Change one letter at a time, and every rung must be a real word on our list. A copyist who changes two letters at once makes the mistakes I lose sleep over.'"),
      rungs(ladder),
      h('p', { class: 'fine' }, `From "${ladder[ladder.length - 1]}" to "${END}".`),
      note ? h('p', { class: 'clue-view', role: 'status' }, note) : '',
      h('div', { class: 'row' }, input,
        h('button', { type: 'button', class: 'primary', onclick: () => add(input.value) }, 'Add the rung'),
        ladder.length > 1 ? h('button', { type: 'button', onclick: () => { ladder = ladder.slice(0, -1); note = ''; hint = []; sfx('sfx.click'); render(); } }, 'Take back a rung') : ''),
      h('button', { type: 'button', class: 'mini', onclick: () => { hint = neighbours(ladder[ladder.length - 1]).filter((w) => !ladder.includes(w)).slice(0, 10); render(); } },
        'Show words one letter away'),
      hint.length ? h('p', { class: 'fine' }, `One letter away: ${hint.join(', ')}.`) : '',
    ];
  };
  const add = (raw: string) => {
    const w = raw.trim().toLowerCase();
    const r = checkStep(ladder[ladder.length - 1], w, ladder);
    note = stepText(r, w);
    hint = [];
    if (r === 'ok') {
      ladder = [...ladder, w];
      sfx('sfx.click');
      if (w === END) { stage = 'table'; note = ''; sfx('sfx.sparkle'); c.dispatch({ type: 'SetFlag', flag: 'field.ladder.rungs', value: ladder.length }); }
    } else sfx('sfx.page');
    render();
  };

  const table = (): (HTMLElement | string)[] => {
    const all = [{ id: 'you', who: 'Your ladder', ladder }, ...APPRENTICES];
    const pair = tested.get('pair');
    return [
      h('p', {}, `Nasir lays your slate beside three others. 'Four ladders, four copyists, four ways down. Look for what they share. Pick a pattern and test it.'`),
      h('div', { class: 'ladder-table' }, ...all.map((a) => h('section', {}, h('h4', {}, a.who),
        rungs(a.ladder, shown && !holds(shown, a.ladder) ? 'broken' : ''),
        shown ? h('p', { class: 'fine' }, holds(shown, a.ladder) ? '✓ fits' : '✗ breaks the pattern') : ''))),
      shown && tested.get(shown.id) === 'broke-late' ? h('section', { class: 'ladder-fifth' }, h('h4', {}, `And ${FIFTH.who}`), rungs(FIFTH.ladder, 'broken'), h('p', { class: 'fine' }, '✗ breaks the pattern')) : '',
      note ? h('p', { class: 'clue-view fresh', role: 'status' }, note) : '',
      h('div', { class: 'row' }, ...PATTERNS.map((p) => h('button', { type: 'button', 'aria-pressed': String(shown?.id === p.id), onclick: () => test(p) },
        `${tested.has(p.id) ? (tested.get(p.id) === 'held' ? '✓ ' : '✗ ') : ''}${p.text}`))),
      pair === 'held' ? h('button', { type: 'button', class: 'primary', onclick: () => { stage = 'arch'; note = ''; sfx('sfx.page'); render(); } }, 'Help Nasir prove it') : '',
    ];
  };
  const test = (p: Pattern) => {
    shown = p;
    const all = [ladder, ...APPRENTICES.map((a) => a.ladder)];
    if (!all.every((l) => holds(p, l))) {
      tested.set(p.id, 'broke');
      note = "Nasir: 'One ladder that breaks it is enough. However many fit, the pattern is not a rule.'";
    } else if (!holds(p, FIFTH.ladder)) {
      tested.set(p.id, 'broke-late');
      note = "Nasir: 'It fits every ladder on the table. Now look at this old sheet from my drawer.' It does not fit. 'Four out of four felt like a rule. It was only four.'";
    } else {
      tested.set(p.id, 'held');
      note = "Nasir: 'It fits all four, and my old sheet too. Marek would say: make a hundred more and see. I say: let us find out if it MUST fit, before anyone makes the hundred.'";
    }
    sfx(tested.get(p.id) === 'held' ? 'sfx.sparkle' : 'sfx.page');
    render();
  };

  const arch = (): (HTMLElement | string)[] => [
    h('p', {}, "Nasir sets six stone blocks on the desk, each with a line cut into it. 'An arch stands on the stones it needs, and no others. A loose stone brings it down as fast as a missing one. Choose the stones that make the pattern true for every ladder, even ladders nobody has made.'"),
    h('ul', { class: 'gym-objects' }, ...PREMISES.map((p) => h('li', {}, h('button', {
      type: 'button', 'aria-pressed': String(chosen.has(p.id)),
      onclick: () => { if (chosen.has(p.id)) chosen.delete(p.id); else chosen.add(p.id); note = ''; sfx('sfx.click'); render(); },
    }, chosen.has(p.id) ? `✓ ${p.text}` : p.text)))),
    note ? h('p', { class: 'clue-view fresh', role: 'status' }, note) : '',
    h('button', { type: 'button', class: 'primary', onclick: setArch }, 'Set the arch'),
  ];
  function setArch(): void {
    const r = testArch([...chosen]);
    if (r.kind === 'loose') { note = `The arch slips. The stone "${r.premise.text}" holds nothing up. ${r.premise.why ?? ''}`; sfx('sfx.page'); }
    else if (r.kind === 'gap') { note = `The arch slips. ${r.premise.gap ?? ''}`; sfx('sfx.page'); }
    else { stage = 'scope'; note = ''; sfx('sfx.sparkle'); c.dispatch({ type: 'SetFlag', flag: 'field.ladder.arch', value: true }); }
    render();
  }

  const scopeView = (): (HTMLElement | string)[] => [
    h('p', {}, 'The arch stands. Nasir reads it aloud:'),
    h('p', { class: 'slate-line' }, CHAIN),
    h('p', {}, "'Now be careful, copyist. What exactly does the arch hold up?'"),
    ...(scope
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, SCOPES.find((s) => s.id === scope)!.reply),
        ...SCOPES.filter((s) => s.id !== scope).map((s) => h('p', { class: 'fine' }, `If you had said "${s.text}": ${s.reply}`)),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Hand back the slate')]
      : [h('div', { class: 'row' }, ...SCOPES.map((s) => h('button', { type: 'button', onclick: () => {
        scope = s.id; c.dispatch({ type: 'SetFlag', flag: 'field.ladder.scope', value: s.id }); sfx('sfx.page'); render();
      } }, s.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Nasir files your slate with the others. 'Tidy copies, tidy proofs. Both can be wrong in ways that look tidy. The difference is that a proof tells you exactly where to look.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'build' ? build() : stage === 'table' ? table() : stage === 'arch' ? arch() : stage === 'scope' ? scopeView() : done();
    box.replaceChildren(h('h2', {}, "The Copyists' Ladder"), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
