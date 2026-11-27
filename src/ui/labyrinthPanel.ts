/**
 * The Labyrinth Lens panel (chapter 14 signature game). Rules in ../domain/labyrinthLens.ts.
 * An SVG map of the island with the paths the current lens shows; direction buttons to step; lens
 * buttons to switch. Reaching the ferry leads to a question with a reply for each answer.
 */
import type { GameController } from '../app/controller';
import { GOAL, LENSES, SIZE, START, VIEWS, step, visible, type Pt } from '../domain/labyrinthLens';
import { h } from './dom';

const NS = 'http://www.w3.org/2000/svg';
const svg = (tag: string, attrs: Record<string, string | number>): SVGElement => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
const S = 60, PAD = 30;
const DIRS: { label: string; d: Pt }[] = [
  { label: 'North', d: [0, -1] }, { label: 'West', d: [-1, 0] }, { label: 'East', d: [1, 0] }, { label: 'South', d: [0, 1] },
];

export function labyrinthPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'maze' });
  let at: Pt = [...START] as Pt;
  let lens = LENSES[0].id;
  let note = '';
  let switches = 0;
  let view: string | null = null;
  let stage: 'walk' | 'ask' | 'done' = 'walk';

  const map = (): SVGElement => {
    const w = PAD * 2 + S * (SIZE - 1);
    const s = svg('svg', { viewBox: `0 0 ${w} ${w}`, class: `maze-map lens-${lens}`, role: 'img',
      'aria-label': `Island map through ${LENSES.find((l) => l.id === lens)!.name}. You are at column ${at[0] + 1}, row ${at[1] + 1}. The ferry is at the top right.` });
    for (const e of visible(lens)) s.append(svg('line', { x1: PAD + e.a[0] * S, y1: PAD + e.a[1] * S, x2: PAD + e.b[0] * S, y2: PAD + e.b[1] * S, class: 'maze-path' }));
    for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) s.append(svg('circle', { cx: PAD + x * S, cy: PAD + y * S, r: 5, class: 'maze-node' }));
    s.append(svg('circle', { cx: PAD + GOAL[0] * S, cy: PAD + GOAL[1] * S, r: 12, class: 'maze-goal' }));
    s.append(svg('circle', { cx: PAD + at[0] * S, cy: PAD + at[1] * S, r: 10, class: 'maze-you' }));
    return s;
  };

  const walk = (): (HTMLElement | SVGElement | string)[] => [
    h('p', {}, "Plan Keeper Ivo spreads three sheets on the harbour table. 'The last ferry leaves from the north-east point. Get there. You can look through any of these, but you can only walk a path you can see.'"),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Lenses' }, ...LENSES.map((l) => h('button', {
      type: 'button', 'aria-pressed': String(lens === l.id), title: l.about,
      onclick: () => { if (lens !== l.id) { lens = l.id; switches += 1; note = l.about; sfx('sfx.page'); render(); } },
    }, l.name))),
    map(),
    note ? h('p', { class: 'clue-view fresh', role: 'status' }, note) : '',
    h('div', { class: 'maze-dirs', role: 'group', 'aria-label': 'Walk' }, ...DIRS.map(({ label, d }) => h('button', { type: 'button', onclick: () => {
      const r = step(at, d, lens);
      if (r.ok) {
        at = r.to; note = ''; sfx('sfx.click');
        if (at[0] === GOAL[0] && at[1] === GOAL[1]) {
          stage = 'ask'; sfx('sfx.sparkle');
          c.dispatch({ type: 'SetFlag', flag: 'field.maze.switches', value: switches });
        }
      } else note = r.why === 'gone' ? r.text! : `No path ${label.toLowerCase()} on ${LENSES.find((l) => l.id === lens)!.name}.`;
      render();
    } }, label))),
  ];

  const ask = (): (HTMLElement | string)[] => [
    h('p', {}, `You reach the ferry point${switches ? `, after changing lens ${switches === 1 ? 'once' : `${switches} times`}` : ''}. Landing Keeper Joss is already there. 'So which of those sheets is the real map of the island?'`),
    ...(view
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, VIEWS.find((v) => v.id === view)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Board the ferry')]
      : [h('div', { class: 'row' }, ...VIEWS.map((v) => h('button', { type: 'button', onclick: () => {
        view = v.id; c.dispatch({ type: 'SetFlag', flag: 'field.maze.view', value: v.id }); sfx('sfx.page'); render();
      } }, v.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "As the ferry pulls out, Joss pins a note to the plan: 'Footbridge gone. Ask at the landing.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'walk' ? walk() : stage === 'ask' ? ask() : done();
    box.replaceChildren(h('h2', {}, 'The Labyrinth Lens'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
