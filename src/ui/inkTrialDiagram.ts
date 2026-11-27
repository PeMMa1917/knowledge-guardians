import { inkTrialAt } from '../domain/inkTrials';
import { playNotes } from '../app/ambience';
import { h } from './dom';

// A diagram is a second way of reading the observation. All controls are
// ordinary dialogue buttons and the full reading is also spoken and printed.
export function inkTrialDiagram(node: string, volume: number) {
  const trial = inkTrialAt(node);
  if (!trial) return null;
  const canvas = h('canvas', { width: 104, height: 42, class: 'ink-trial-diagram', 'aria-hidden': 'true' });
  const g = canvas.getContext('2d');
  if (!g) return null;
  const gold = '#ffd77d', ink = '#28243d', paper = '#f4e4bd', teal = '#83d8d0', red = '#fa9583';
  const box = (x: number, y: number, w: number, h: number, colour: string) => {
    g.fillStyle = colour;
    g.fillRect(x, y, w, h);
  };
  function ray(x: number, y: number, endX: number, endY: number, colour: string) {
    const steps = Math.max(Math.abs(endX - x), Math.abs(endY - y));
    for (let j = 0; j <= steps; j++) box(Math.round(x + (endX - x) * j / steps), Math.round(y + (endY - y) * j / steps), 1, 1, colour);
  }
  const a = Boolean(trial.state & 1), b = Boolean(trial.state & 2);
  box(0, 0, 104, 42, ink);
  if (trial.kind === 'pinhole') {
    const screen = b ? 92 : 67;
    const rise = Math.round((screen - 44) / 4);
    box(11, 13, 4, 14, teal); box(8, 15, 9, 4, teal); box(10, 27, 7, 2, paper);
    box(44, 3, 2, 35, paper); box(screen, 3, 2, 35, paper);
    ray(14, 13, 44, 21, gold); ray(14, 29, 44, 21, teal);
    if (!a) {
      box(44, 21, 2, 1, ink);
      ray(45, 21, screen, 21 + rise, gold); ray(45, 21, screen, 21 - rise, teal);
      box(screen + 3, 21 - rise, 2, rise * 2, teal); box(screen + 2, 21 + rise - 3, 5, 3, teal);
    }
  } else if (trial.kind === 'eclipse') {
    const y = a ? 26 : 18, shadow = a ? 34 : 18, observer = b ? 34 : 18;
    box(8, 15, 5, 7, gold); box(82, 3, 4, 36, paper);
    ray(12, 18, 83, shadow - 6, gold); ray(12, 18, 83, shadow + 6, gold);
    box(45, y - 3, 7, 7, teal); box(82, shadow - 6, 4, 12, '#635270');
    box(89, observer - 2, 5, 5, red); box(88, observer, 2, 1, red);
  } else if (trial.kind === 'ledger') {
    box(12, 11, 18, 14, paper); box(14, 10, 14, 2, ink);
    if (a) { box(15, 15, 5, 4, gold); box(22, 15, 5, 4, gold); }
    box(39, 20, 52, 1, paper);
    for (let j = -3; j <= 2; j++) box(70 + j * 9, 18, 1, 6, j === 0 ? gold : paper);
    if (b) for (let j = 0; j < 3; j++) box(13 + j * 6, 28, 4, 3, red);
    box(68 + ((a ? 2 : 0) - (b ? 3 : 0)) * 9, 13, 5, 4, teal);
  } else {
    const tones = a ? [196, 330, 98, 0] : [196, 330, 0, 0];
    const loop = b ? [0, ...tones.slice(0, 3)] : tones;
    loop.forEach((tone, i) => {
      const x = 7 + i * 23;
      box(x, 28, 17, 1, paper);
      if (tone) box(x + 4, 28 - Math.round(tone / 20), 9, Math.round(tone / 20), i === 0 ? gold : teal);
    });
    box(8, 32, 3, 3, gold);
    let stop: (() => void) | undefined;
    const preview = h('button', { type: 'button', onclick: () => {
      stop?.();
      stop = playNotes(loop.flatMap((f, at) => f ? [{ f, at, beats: 0.65 }] : []), 0.28, 'pluck', volume);
    } }, 'Listen to this four-beat reel');
    return h('div', {}, canvas, preview);
  }
  return canvas;
}
