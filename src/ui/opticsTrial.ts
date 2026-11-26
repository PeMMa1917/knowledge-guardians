import type { GameController } from '../app/controller';
import { opticalReading, OPTICS_DEPTHS, OPTICS_TRIALS, type OpticsGame, type OpticsTrial } from '../domain/opticsBench';
import { h } from './dom';

export function opticsTrial(game: OpticsGame, c: GameController, sound: (key: string) => void): HTMLElement {
  const coast = game === 'coast-shadow-board';
  const title = coast ? 'The headland shadow board' : 'The shadow on the bell card';
  const prefix = coast ? 'coast.optics' : 'council.optics';
  const board = h('canvas', { width: 180, height: 100, class: 'optics-board', 'aria-hidden': 'true' });
  const feedback = h('p', { role: 'status' }, 'Choose a lamp socket to cast the first shadow.');

  function draw(trial?: OpticsTrial) {
    const g = board.getContext('2d');
    if (!g) return;
    const x = (position: number) => 20 + position * 1.7;
    const box = (color: string, left: number, top: number, width: number, height: number) => {
      g.fillStyle = color;
      g.fillRect(x(left), top, width, height);
    };
    g.clearRect(0, 0, board.width, board.height);
    g.fillStyle = '#283747'; g.fillRect(0, 0, board.width, board.height);
    box('#cfc19e', 0, OPTICS_DEPTHS.card - 2, 140, 8);
    for (const slot of [11, 69]) box('#916f59', slot - 2, OPTICS_DEPTHS.lamp - 3, 8, 7);
    box('#77adab', 39, OPTICS_DEPTHS.pointer + 3, 3, 8);
    if (!trial) return;
    const reading = opticalReading(trial);
    g.strokeStyle = '#ffe5a7'; g.setLineDash([4, 2]); g.beginPath();
    g.moveTo(x(trial.lamp), OPTICS_DEPTHS.lamp); g.lineTo(x(reading.shadow), OPTICS_DEPTHS.card); g.stroke();
    g.setLineDash([]);
    box('#ffcf74', trial.lamp - 2, OPTICS_DEPTHS.lamp - 3, 8, 7);
    box('#91e1d9', reading.pointer - 2, OPTICS_DEPTHS.pointer - 3, 8, 6);
    box('#3c536c', reading.shadow - 2, OPTICS_DEPTHS.card - 1, 8, 6);
  }

  function run(trial: OpticsTrial) {
    const reading = opticalReading(trial);
    c.dispatch({ type: 'SetFlag', flag: `${prefix}.trial.${trial.id}`, value: true });
    draw(trial);
    feedback.textContent = `The shadow reaches mark ${reading.shadow}. The pointer itself is ${trial.id === 'turn' ? 'off its original notch' : 'still on its original notch'}.`;
    sound('sfx.page');
  }

  draw();
  return h('section', {}, h('h2', {}, title),
    h('p', {}, coast ? 'Neri wants to know why a signal mark seems to move during the handover.'
      : 'Essi needs to know whether a pointer moved before a time call goes down the ramp. Compare it with its fixed notch.'),
    board, feedback,
    h('div', { class: 'row wrap' }, ...(coast ? OPTICS_TRIALS.slice(0, 2) : OPTICS_TRIALS).map((trial) =>
      h('button', { type: 'button', onclick: () => run(trial) }, trial.label))));
}
