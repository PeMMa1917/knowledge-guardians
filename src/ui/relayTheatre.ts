import { relayRun } from '../domain/lastBell';
import { relayRuns } from '../content/lastBell';
import { h } from './dom';

type Point = readonly [number, number];
const quay: Point = [18, 43],
  tower: Point = [78, 14],
  houses: Point[] = [
    [127, 29],
    [128, 58],
  ];
function between(a: Point, b: Point, part: number): Point {
  const n = Math.max(0, Math.min(1, part));
  return [Math.round(a[0] + (b[0] - a[0]) * n), Math.round(a[1] + (b[1] - a[1]) * n)];
}

/** A clockwork replay. All beats can be inspected without timing, colour vision or sound. */
export function relayTheatre(runner: number, fog: boolean, measured: boolean) {
  const { beats } = relayRun(runner, fog, measured);
  const footbridge = measured ? [1, 4][runner] : 2;
  const last = 3 + footbridge;
  const canvas = h('canvas', { width: 152, height: 72, 'aria-hidden': 'true' });
  const tick = h('input', {
    type: 'range',
    min: 0,
    max: last,
    value: 0,
    step: 1,
    'aria-label': 'Inspect the relay one beat at a time',
  });
  const report = h('output', { 'aria-live': 'polite' });
  const back = h('button', { type: 'button', onclick: () => move(-1) }, 'Previous beat');
  const forward = h('button', { type: 'button', onclick: () => move(1) }, 'Next beat');
  const box = h(
    'figure',
    { class: 'bell-theatre' },
    canvas,
    h('figcaption', {}, 'Quay at left · tower on the ridge · kiln above the sail loft'),
    h('div', { class: 'lantern-controls' }, back, tick, forward),
    report,
  );
  function move(delta: number) {
    tick.value = String(Number(tick.value) + delta);
    draw();
    if ((delta < 0 && back.disabled) || (delta > 0 && forward.disabled)) tick.focus();
  }
  function draw() {
    const t = Number(tick.value);
    const status = relayRuns.map((s, i) => s + (beats[i] <= t ? ' warned' : ' waiting')).join('. ');
    report.textContent =
      'Beat ' +
      t +
      '. ' +
      (fog ? 'Tower hidden. ' : t < 1 ? 'Tower waiting. ' : 'Tower lit. ') +
      status +
      '. ' +
      (t < 4 ? 'Crossing open.' : t === 4 ? 'The crossing shuts on this beat.' : 'Crossing closed.');
    tick.setAttribute('aria-valuetext', report.textContent);
    back.disabled = t === 0;
    forward.disabled = t === last;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = (colour: string, x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = colour;
      ctx.fillRect(x, y, w, h);
    };
    function path(a: Point, b: Point, colour: string) {
      const steps = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
      for (let i = 0; i <= steps; i++) {
        const [x, y] = between(a, b, i / steps);
        rect(colour, x, y, 2, 2);
      }
    }
    rect('#19283e', 0, 0, 152, 72);
    for (let x = 0; x < 152; x += 4) {
      const top = 18 + Math.floor(Math.abs(x - 76) / 4);
      rect('#38534b', x, top, 4, 72 - top);
      if (x % 16 === 0) rect('#799475', x, top, 3, 1);
    }
    rect('#28495f', 0, 50, 28, 22);
    for (let x = 1; x < 28; x += 7) rect('#739da8', x, 52 + (x % 9), 4, 1);
    path(quay, houses[0], '#a18766');
    path(quay, houses[1], '#a18766');
    path(houses[0], houses[1], '#d1af79');
    rect('#9d7759', 9, 45, 23, 3);
    rect('#8b9596', tower[0] - 3, 12, 7, 10);
    rect('#483d48', tower[0] - 5, 10, 11, 3);
    rect(!fog && t >= 1 ? '#ffdf91' : '#adab9c', tower[0] - 2, 13, 5, 3);
    if (fog) {
      rect('#8ca6ad', 64, 13, 27, 3);
      rect('#c5ced0', 71, 16, 23, 2);
    }
    if (!fog && t === 1) path(quay, tower, '#ffe193');
    if (!fog && t === 2) for (const house of houses) path(tower, house, '#ffe193');
    houses.forEach(([x, y], i) => {
      rect('#ad8261', x - 5, y - 4, 10, 7);
      rect(i === 0 ? '#c46f50' : '#809eb1', x - 6, y - 5, 12, 2);
      if (i === 0) rect('#835342', x + 1, y - 9, 3, 4);
      else rect('#a7b9bf', x - 3, y - 7, 6, 2);
      rect(beats[i] <= t ? '#ffe69b' : '#242938', x - 2, y - 3, 3, 3);
    });
    const [x, y] =
      t <= 3
        ? between(quay, houses[runner], t / 3)
        : between(houses[runner], houses[1 - runner], (t - 3) / footbridge);
    rect('#31243c', x - 2, y, 6, 3);
    rect('#d57556', x - 1, y - 3, 3, 4);
    rect('#ffe1aa', x, y - 5, 2, 2);
  }
  tick.addEventListener('input', draw);
  draw();
  return box;
}
