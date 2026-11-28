/**
 * The Three Trees panel (chapter 5 field game). Rules in ../domain/threeTrees.ts. The grove is an SVG
 * map with one button per tree, so the game works with a keyboard and a screen reader. Choosing
 * three trees in a line is retried at once (X-007, mini-game retry); no stage fails.
 */
import type { GameController } from '../app/controller';
import { OTHERS, TREES, VIEWS, paces, shapeOf, sides, type Tree } from '../domain/threeTrees';
import { h } from './dom';

const NS = 'http://www.w3.org/2000/svg';
const svg = (tag: string, attrs: Record<string, string | number>): SVGElement => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

type Stage = 'pick' | 'others' | 'view' | 'pace' | 'done';
const SCALE = 30;

export function treesPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'trees' });
  let stage: Stage = 'pick';
  let chosen: string[] = [];
  let mine: string[] = [];
  let note = '';
  let view: string | null = null;
  let side: [string, string] | null = null;

  const tree = (id: string): Tree => TREES.find((t) => t.id === id)!;

  /** The grove: shapes as lines, trees as circles. */
  const grove = (shapes: { ids: string[]; cls: string }[]): SVGElement => {
    const s = svg('svg', { viewBox: `0 0 ${12 * SCALE} ${9.5 * SCALE}`, class: 'trees-map', role: 'img', 'aria-label': 'Map of the grove from above' });
    for (const sh of shapes) {
      if (sh.ids.length < 2) continue;
      const pts = sh.ids.map((id) => `${tree(id).x * SCALE},${tree(id).y * SCALE}`).join(' ');
      s.append(svg(sh.ids.length >= 3 ? 'polygon' : 'polyline', { points: pts, class: `trees-shape ${sh.cls}` }));
    }
    for (const t of TREES) {
      s.append(svg('circle', { cx: t.x * SCALE, cy: t.y * SCALE, r: 11, class: `trees-tree${chosen.includes(t.id) ? ' on' : ''}` }));
    }
    return s;
  };

  const pick = (): (HTMLElement | SVGElement | string)[] => [
    h('p', {}, "Elian stops at the old grove. 'There is a triangle in this grove. Everyone who walks here sees it. Show me.'"),
    grove([{ ids: chosen, cls: 'mine' }]),
    h('div', { class: 'trees-buttons', role: 'group', 'aria-label': 'Trees' }, ...TREES.map((t) => h('button', {
      type: 'button', 'aria-pressed': String(chosen.includes(t.id)), disabled: !chosen.includes(t.id) && chosen.length >= 3,
      onclick: () => { chosen = chosen.includes(t.id) ? chosen.filter((x) => x !== t.id) : [...chosen, t.id]; note = ''; sfx('sfx.click'); render(); },
    }, t.name))),
    note ? h('p', { class: 'clue-view fresh', role: 'status' }, note) : '',
    h('button', { type: 'button', class: 'primary', disabled: chosen.length !== 3, onclick: tryShape }, 'Show Elian'),
  ];
  function tryShape(): void {
    const shape = shapeOf(chosen);
    if (shape === 'line') {
      note = "Elian squints along the trees. 'Those three stand in one straight line. That is a line, not a triangle. You can choose any trees you like, but you cannot make a line into a triangle by wanting it.'";
      chosen = []; sfx('sfx.page');
    } else if (shape === 'triangle') {
      mine = chosen; stage = 'others'; note = ''; sfx('sfx.sparkle');
    }
    render();
  }

  const others = (): (HTMLElement | SVGElement | string)[] => [
    h('p', {}, `'Yes,' says Elian. 'That one: ${mine.map((id) => tree(id).name).join(', ').replace(/, ([^,]*)$/, ' and $1')}.'`),
    ...OTHERS.map((o) => h('p', {}, o.line)),
    grove([{ ids: mine, cls: 'mine' }, ...OTHERS.map((o, i) => ({ ids: o.trees, cls: `other${i}` }))]),
    h('p', { class: 'fine' }, 'Gold: your triangle. Blue: Ayla’s triangle. Green: Elian’s four-sided field. One grove, three shapes.'),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'view'; sfx('sfx.page'); render(); } }, 'Answer Elian'),
  ];

  const viewStage = (): (HTMLElement | string)[] => [
    h('p', {}, "Elian sits on a root. 'So where was the triangle? In the grove, or in us?'"),
    ...(view
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, VIEWS.find((v) => v.id === view)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { side = sides(mine)[0]; stage = 'pace'; sfx('sfx.page'); render(); } }, 'Walk one side')]
      : [h('div', { class: 'row' }, ...VIEWS.map((v) => h('button', { type: 'button', onclick: () => {
        view = v.id; c.dispatch({ type: 'SetFlag', flag: 'field.trees.view', value: v.id }); sfx('sfx.page'); render();
      } }, v.text)))]),
  ];

  const pace = (): (HTMLElement | SVGElement | string)[] => {
    const [a, b] = side!;
    const n = paces(a, b);
    return [
      h('p', {}, `Ayla starts at ${tree(a).name} and walks to ${tree(b).name}, counting aloud. Elian starts at the other end and walks back. '${n},' says Ayla. '${paces(b, a)},' says Elian.`),
      grove([{ ids: [a, b], cls: 'mine' }]),
      h('p', {}, "Ayla grins. 'We chose different shapes. We do not get to choose different paces.'"),
      h('div', { class: 'row' }, ...sides(mine).filter(([x, y]) => !(x === a && y === b)).map(([x, y]) => h('button', {
        type: 'button', onclick: () => { side = [x, y]; sfx('sfx.click'); render(); },
      }, `Walk from ${tree(x).name} to ${tree(y).name}`)),
      h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Leave the grove')),
    ];
  };

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "On the way out, Ayla ties a ribbon round one of your three trees. 'So the next walker can find your triangle, if they want it. Or make their own.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'pick' ? pick() : stage === 'others' ? others() : stage === 'view' ? viewStage() : stage === 'pace' ? pace() : done();
    box.replaceChildren(h('h2', {}, 'The Three Trees'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
