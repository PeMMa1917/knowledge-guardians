/**
 * The Survey Bell panel (chapter 12 signature game). Rules in ../domain/surveyBell.ts.
 * Three design choices, each with a note on what it gains and costs; warnings for risky pairs; then a
 * trial week summary. Every design gets a summary; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { STEPS, flagFor, option, warnings } from '../domain/surveyBell';
import { h } from './dom';

export function surveyPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'survey' });
  let step = 0;
  let chosen: Record<string, string> = {};
  let stage: 'intro' | 'design' | 'week' | 'done' = 'intro';

  const intro = (): (HTMLElement | string)[] => [
    h('p', {}, "Keeper Ade rings a small brass bell. 'The council wants to know how people use the lanes, so it can plan the new ones. That means a study of people. You have read the folders in the Quiet Records Room. Help us design it.'"),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'design'; sfx('sfx.page'); render(); } }, 'Design the study'),
  ];

  const design = (): (HTMLElement | string)[] => {
    const s = STEPS[step];
    const pick = chosen[s.id];
    return [
      h('p', { class: 'fine' }, `Question ${step + 1} of ${STEPS.length}`),
      h('p', {}, s.ask),
      ...(pick
        ? [h('p', { class: 'clue-view fresh', role: 'status' }, option(s.id, pick).note),
          h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => {
            if (step + 1 < STEPS.length) step += 1; else stage = 'week';
            sfx('sfx.page'); render();
          } }, step + 1 < STEPS.length ? 'Next question' : 'Run a trial week')]
        : [h('div', { class: 'row' }, ...s.options.map((o) => h('button', { type: 'button', onclick: () => {
          chosen = { ...chosen, [s.id]: o.id }; c.dispatch({ type: 'SetFlag', flag: flagFor(s.id), value: o.id }); sfx('sfx.click'); render();
        } }, o.text)))]),
    ];
  };

  const week = (): (HTMLElement | string)[] => [
    h('p', {}, 'The bells ring for a week. Clerk Lin pins up what the study did:'),
    h('ul', {}, ...STEPS.map((s) => h('li', {}, option(s.id, chosen[s.id]).note))),
    ...warnings(chosen).map((w) => h('p', { class: 'clue-view fresh' }, w)),
    h('p', {}, "Ade reads it all. 'Every study buys some knowledge with somebody's trust. Now we know the price of this one.'"),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Put the bell away'),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Lin files the design in the Civic Machine's records. 'Whatever we collect, someone will want to use for something else one day. Write down what it was for.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'intro' ? intro() : stage === 'design' ? design() : stage === 'week' ? week() : done();
    box.replaceChildren(h('h2', {}, 'The Survey Bell'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
