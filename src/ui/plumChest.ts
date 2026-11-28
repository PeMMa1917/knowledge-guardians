import type { GameController } from '../app/controller';
import {
  oppositeFace,
  chestPose,
  chestPosition,
  chestStep,
  chestFaces,
  type Face,
  type ChestMove,
  type Pose,
} from '../domain/plumChest';
import { h } from './dom';
import './plumChest.css';

const faceEdge: Record<Face, Face> = {
  boot: 'plum',
  plum: 'bell',
  bell: 'plum',
  root: 'plum',
  moon: 'comb',
  comb: 'moon',
};
const actionGroups: [string, [ChestMove, string][]][] = [
  [
    'Turn the chest',
    [
      ['left', 'Bring the left face forward'],
      ['right', 'Bring the right face forward'],
      ['up', 'Tip the top towards me'],
      ['down', 'Tip the bottom towards me'],
      ['set-down', 'Set the boot down facing me'],
    ],
  ],
  [
    'Work the face towards you',
    [
      ['trace', 'Trace the carving'],
      ['short', 'Set the short notch'],
      ['long', 'Set the long notch'],
      ['slide', 'Slide the tongue'],
      ['press', 'Press the stud'],
    ],
  ],
];

export function plumChest(c: GameController, sound: (id: string) => void) {
  const prop = h('div', { class: 'plum-prop', 'aria-hidden': 'true' });
  const view = h('p', { class: 'plum-position' });
  const response = h('p', { role: 'status', 'aria-live': 'polite' });
  const drawers = h('p', { class: 'plum-drawers' });
  const buttons = new Map<ChestMove, HTMLButtonElement>();
  function showSides(p: Pose) {
    const [front, top, right] = p;
    const surfaces: [string, Face, Face[]][] = [
      ['front', front, [top, right, oppositeFace[top], oppositeFace[right]]],
      ['top', top, [oppositeFace[front], right, front, oppositeFace[right]]],
      ['right', right, [top, oppositeFace[front], oppositeFace[top], front]],
    ];
    prop.replaceChildren(
      ...surfaces.map(([side, face, neighbours]) => {
        const carving = h('span', { class: 'plum-carving' });
        carving.style.setProperty(
          '--face-offset',
          chestFaces.indexOf(face) * 20 + '%',
        );
        carving.style.transform =
          'rotate(' + 90 * neighbours.indexOf(faceEdge[face]) + 'deg)';
        return h('div', { class: 'plum-face plum-' + side }, carving);
      }),
    );
  }
  function draw() {
    const f = c.state.flags,
      pose = chestPose(f);
    showSides(pose);
    view.textContent = chestPosition(pose);
    drawers.textContent =
      'Collar: ' +
      (f['plum.ring'] === 'long' ? 'long' : 'short') +
      '. Brass drawer: ' +
      (f['plum.open.plum'] ? 'open' : 'closed') +
      '. Quiet drawer: ' +
      (f['plum.open.moon'] ? 'open' : 'closed') +
      '.';
    for (const value of ['short', 'long'] as const)
      buttons
        .get(value)
        ?.setAttribute(
          'aria-pressed',
          String(value === (f['plum.ring'] === 'long' ? 'long' : 'short')),
        );
  }
  function work(move: ChestMove) {
    const result = chestStep(c.state.flags, move);
    const error = c
      .dispatch({ type: 'WorkPlumChest', move })
      .find((e) => e.kind === 'error');
    if (error) {
      response.textContent = error.message;
      return;
    }
    sound(move === 'press' ? 'sfx.page' : 'sfx.click');
    draw();
    response.textContent = result.text;
  }
  const controls = actionGroups.map(([label, actions]) =>
    h(
      'fieldset',
      {},
      h('legend', {}, label),
      actions.map(([move, name]) => {
        const button = h(
          'button',
          { type: 'button', onclick: () => work(move) },
          name,
        );
        buttons.set(move, button);
        return button;
      }),
    ),
  );
  draw();
  response.textContent =
    'Something inside knocks three times, then waits. Fen built each drawer so it can open on its own.';
  return h(
    'div',
    { class: 'plum-work' },
    h('div', { class: 'plum-stage', 'aria-hidden': 'true' }, prop),
    view,
    drawers,
    response,
    ...controls,
  );
}

import { currentOrchardBar, orchardBeat, type Beat } from '../domain/plumChest';
export function plumDrum(c: GameController, sound: (id: string) => void) {
  const strip = h('ol', { class: 'orchard-beats', 'aria-label': 'Four beats' });
  const report = h('p', { role: 'status', 'aria-live': 'polite' });
  const marks: Record<string, string> = { B: 'Board', R: 'Rim', '–': 'Rest' };
  function draw() {
    const bar = currentOrchardBar(c.state.flags);
    strip.replaceChildren(
      ...Array.from({ length: 4 }, (_, i) =>
        h('li', {}, marks[bar[i]] ?? 'Open'),
      ),
    );
  }
  function play(beat: Beat) {
    const result = orchardBeat(c.state.flags, beat);
    const fault = c
      .dispatch({ type: 'StrikeOrchardBeat', beat })
      .find((e) => e.kind === 'error');
    if (fault) {
      report.textContent = fault.message;
      return;
    }
    if (beat === 'rim') sound('sfx.metal');
    if (beat === 'board') sound('sfx.step');
    draw();
    report.textContent = result.report;
  }
  draw();
  report.textContent =
    'Pia stands above the drum. The shell rests on the floorboards. Try a call of three taps and space for an answer.';
  const labels: [Beat, string][] = [
    ['rim', 'Strike the suspended rim'],
    ['board', 'Knock the floorboard'],
    ['rest', 'Leave a rest'],
    ['clear', 'Still the drum and start again'],
  ];
  return h(
    'div',
    { class: 'plum-work' },
    strip,
    report,
    labels.map(([beat, label]) =>
      h('button', { type: 'button', onclick: () => play(beat) }, label),
    ),
  );
}
