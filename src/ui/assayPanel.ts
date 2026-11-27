/**
 * The Assay Trial panel (chapter 6 signature game). Rules in ../domain/assayTrial.ts.
 * Four rounds; a wrong call restarts that round (X-007). Looks are always shown; the two tests are run
 * by choice. At the end the player says which test they trust, and Corra or Bea replies.
 */
import type { GameController } from '../app/controller';
import { ROUNDS, SAMPLES, TRUST, judge, reading, type Call, type Test } from '../domain/assayTrial';
import { h } from './dom';

const TESTS: { id: Test; label: string }[] = [
  { id: 'streak', label: 'Rub both on the white tile (streak)' },
  { id: 'density', label: 'Weigh both in the water jar (density)' },
];

export function assayPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'assay' });
  let round = 0;
  let run: Test[] = [];
  let note = '';
  let restarts = 0;
  let trust: string | null = null;
  let stage: 'intro' | 'round' | 'trust' | 'done' = 'intro';

  const intro = (): (HTMLElement | string)[] => [
    h('p', {}, "Inspector Corra clears the sample bench. 'Four claims came through the yard gate today. Each one comes with two samples. Tell me if each pair is the same stone or not. Look as long as you like. Run a test if you want one. A wrong call and we start that claim again.'"),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'round'; sfx('sfx.page'); render(); } }, 'Start the first claim'),
  ];

  const sampleCard = (id: string, label: string): HTMLElement => h('div', { class: 'assay-sample' },
    h('h3', {}, label),
    h('p', {}, `Looks: ${SAMPLES[id].look}.`),
    ...run.map((t) => h('p', { class: 'assay-reading' }, `${t === 'streak' ? 'Streak' : 'Density'}: ${reading(id, t)}`)));

  const roundStage = (): (HTMLElement | string)[] => {
    const r = ROUNDS[round];
    return [
      h('p', { class: 'fine' }, `Claim ${round + 1} of ${ROUNDS.length}`),
      h('p', {}, `${r.speaker} says: '${r.claim}'`),
      h('div', { class: 'assay-pair' }, sampleCard(r.a, 'Left sample'), sampleCard(r.b, 'Right sample')),
      note ? h('p', { class: 'clue-view fresh', role: 'status' }, note) : '',
      h('div', { class: 'row', role: 'group', 'aria-label': 'Tests' }, ...TESTS.filter((t) => !run.includes(t.id)).map((t) => h('button', {
        type: 'button', onclick: () => { run = [...run, t.id]; note = ''; sfx('sfx.click'); render(); } }, t.label))),
      h('div', { class: 'row', role: 'group', 'aria-label': 'Your call' },
        ...(['same', 'different'] as Call[]).map((call) => h('button', { type: 'button', class: 'primary', onclick: () => decide(call) },
          call === 'same' ? 'They are the same stone' : 'They are different stones'))),
    ];
  };

  function decide(call: Call): void {
    const r = ROUNDS[round];
    const out = judge(r, call);
    run = [];
    if (!out.ok) {
      note = out.why; restarts += 1; sfx('sfx.page');
    } else {
      note = ''; sfx('sfx.sparkle');
      round += 1;
      if (round >= ROUNDS.length) {
        stage = 'trust';
        c.dispatch({ type: 'SetFlag', flag: 'field.assay.restarts', value: restarts });
      }
    }
    render();
  }

  const trustStage = (): (HTMLElement | string)[] => [
    h('p', {}, `Corra wipes the tile clean. 'Four claims, four calls${restarts ? `, and ${restarts} ${restarts === 1 ? 'restart' : 'restarts'}` : ''}. Steward Bea wants to know what to write on the sample labels. Which test do you trust?'`),
    ...(trust
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, TRUST.find((t) => t.id === trust)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Close the sample box')]
      : [h('div', { class: 'row' }, ...TRUST.map((t) => h('button', { type: 'button', onclick: () => {
        trust = t.id; c.dispatch({ type: 'SetFlag', flag: 'field.assay.trust', value: t.id }); sfx('sfx.page'); render();
      } }, t.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Steward Bea closes the sample box. 'From today, a label in this yard says which tests a sample passed. \"Matched\" alone is not enough.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'intro' ? intro() : stage === 'round' ? roundStage() : stage === 'trust' ? trustStage() : done();
    box.replaceChildren(h('h2', {}, 'The Assay Trial'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
