/**
 * The Fog Chart panel (chapter 8 signature game). Rules in ../domain/fogChart.ts.
 * A grid of buttons, one per square, so it works with a keyboard and a screen reader. Sound squares,
 * read what each found feature rests on, check the sailors' reports, then decide how to print the rest.
 * Running out of soundings is an ending, not a failure screen (X-007). Every print choice gets a reply.
 */
import type { GameController } from '../app/controller';
import { CLAIMS, KINDS, PRINTS, SIZE, SOUNDINGS, TEXT, claimAt, found, reportAt, reportTrue, squareKey } from '../domain/fogChart';
import { h } from './dom';

type Stage = 'intro' | 'sound' | 'end' | 'done';

export function fogPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'fog' });
  let stage: Stage = 'intro';
  const sounded = new Set<string>();
  let line = '';
  let print: string | null = null;
  let last = -1;

  const left = (): number => SOUNDINGS - sounded.size;
  const allFound = (): boolean => CLAIMS.every((cl) => found(cl, sounded));

  const sound = (x: number, y: number): void => {
    sounded.add(squareKey(x, y));
    last = y * SIZE + x;
    const cl = claimAt(x, y);
    const rep = reportAt(x, y);
    if (cl && found(cl, sounded)) { line = `You have all of ${cl.name}. ${cl.claim} ${cl.support}`; sfx('sfx.sparkle'); }
    else if (cl) { line = `The lead line touches ${cl.name}.`; sfx('sfx.click'); }
    else { line = 'Open water.'; sfx('sfx.page'); }
    if (rep) line += ` ${reportTrue(x, y) ? TEXT.trueReport : TEXT.falseReport}`;
    if (allFound() || left() === 0) {
      stage = 'end';
      c.dispatch({ type: 'SetFlag', flag: 'field.fog.found', value: CLAIMS.filter((cl2) => found(cl2, sounded)).map((cl2) => cl2.id).join(',') });
    }
    render();
  };

  const grid = (): HTMLElement => {
    const g = h('div', { class: 'fog-grid', role: 'group', 'aria-label': 'The bay, six rows of six squares' });
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      const k = squareKey(x, y);
      const done = sounded.has(k);
      const cl = done ? claimAt(x, y) : null;
      const rep = reportAt(x, y);
      const mark = done ? (cl ? cl.name.split(' ').pop()![0].toUpperCase() : '~') : rep ? '?' : '';
      const state = done ? (cl ? `${cl.name}` : 'open water') : rep ? 'a sailor’s report, not sounded' : 'fog';
      g.append(h('button', { type: 'button', class: `fog-sq${done ? (cl ? ' hit' : ' water') : rep ? ' report' : ''}`,
        'aria-label': `Row ${y + 1}, square ${x + 1}: ${state}`, disabled: done || stage !== 'sound', onclick: () => sound(x, y) }, mark));
    }
    return g;
  };

  const intro = (): (HTMLElement | string)[] => [
    h('p', {}, TEXT.intro),
    h('p', {}, TEXT.reportsIntro),
    h('ul', { class: 'fog-reports' }, ...TEXT.reports.map((r) => h('li', {}, `Row ${r.y + 1}, square ${r.x + 1}. ${r.text}`))),
    grid(),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'sound'; sfx('sfx.page'); render(); } }, 'Take out the boat'),
  ];

  const soundStage = (): (HTMLElement | string)[] => [
    h('p', { class: 'fine', role: 'status' }, `Soundings left: ${left()} of ${SOUNDINGS}. A question mark is a sailor’s report. A letter is something you sounded.`),
    grid(),
    line ? h('p', { class: 'clue-view fresh' }, line) : h('p', {}, 'Choose a square to sound.'),
  ];

  const end = (): (HTMLElement | string)[] => {
    const have = CLAIMS.filter((cl) => found(cl, sounded));
    const part = CLAIMS.filter((cl) => !found(cl, sounded) && cl.cells.some(([x, y]) => sounded.has(squareKey(x, y))));
    return [
      line ? h('p', { class: 'clue-view' }, line) : '',
      h('p', {}, allFound() ? TEXT.endFull : TEXT.endShort),
      grid(),
      ...have.map((cl) => h('div', { class: 'fog-found' }, h('strong', {}, cl.claim), h('p', {}, cl.support), h('p', { class: 'fine' }, KINDS[cl.kind]))),
      part.length ? h('p', {}, `Touched but not finished: ${part.map((cl) => cl.name).join(', ')}.`) : '',
      h('p', {}, "Renna holds up the printer's proof. 'It goes to the press tonight. What do we do with everything we did not sound ourselves?'"),
      ...(print
        ? [h('p', { class: 'clue-view fresh', role: 'status' }, PRINTS.find((p) => p.id === print)!.reply),
          h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Send the chart to the press')]
        : [h('div', { class: 'row' }, ...PRINTS.map((p) => h('button', { type: 'button', onclick: () => {
          print = p.id; c.dispatch({ type: 'SetFlag', flag: 'field.fog.print', value: p.id }); sfx('sfx.page'); render();
        } }, p.text)))]),
    ];
  };

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Sora pins the proof by the quay door. 'Next fog, we start from this. Not from grey.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'intro' ? intro() : stage === 'sound' ? soundStage() : stage === 'end' ? end() : done();
    box.replaceChildren(h('h2', {}, 'The Fog Chart'), ...parts);
    const auto = box.querySelector('[data-autofocus]') as HTMLElement | null;
    if (auto) auto.focus();
    else if (stage === 'sound' && last >= 0) {
      // Keep keyboard users in the grid: focus the next square that can still be sounded.
      const squares = [...box.querySelectorAll<HTMLButtonElement>('.fog-sq')];
      (squares.slice(last).find((b) => !b.disabled) ?? squares.find((b) => !b.disabled))?.focus();
    }
  }
  render();
  return box;
}
