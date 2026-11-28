import type { Origin } from '../domain/originInstruments';
import { h } from './dom';

// Original pixel scenery. The ordered text reading alongside it carries the same instrument results.
export function originStage() {
  const el = h('canvas', {
    class: 'origin-pixel-stage',
    'aria-hidden': 'true',
    width: 144,
    height: 44,
  }) as HTMLCanvasElement;
  const g = el.getContext('2d');
  function draw(o: Origin, v: number[], played: boolean) {
    if (!g) return;
    const ink = '#19182a',
      sand = '#f0ce94',
      wood = '#a27750',
      light = '#f7e6b9',
      red = '#d86b62',
      sea = '#73c7cc',
      fern = '#87b185',
      shade = '#484369';
    function rect(
      x: number,
      y: number,
      w: number,
      height: number,
      color: string,
    ) {
      g!.fillStyle = color;
      g!.fillRect(x, y, w, height);
    }
    function person(x: number, y: number, coat: string, face = 0) {
      rect(x + 1, y, 3, 2, ink);
      rect(x + 1, y + 2, 3, 3, sand);
      rect(x + face, y + 5, 5, 5, coat);
      rect(x, y + 10, 2, 3, ink);
      rect(x + 3, y + 10, 2, 3, ink);
    }
    function slip(x: number, y: number, c: string) {
      rect(x, y, 10, 6, c);
      rect(x + 2, y + 1, 6, 1, wood);
      rect(x + 2, y + 3, 4, 1, wood);
    }
    g.imageSmoothingEnabled = false;
    rect(0, 0, 144, 44, ink);
    rect(1, 1, 142, 42, shade);
    rect(2, 31, 140, 11, wood);
    const [a, b, c] = v;
    if (o === 'archive') {
      for (let i = 0; i < 3; i++) {
        const x = 11 + i * 41;
        rect(x, 7, 30, 24, ink);
        rect(x + 2, 9, 26, 19, wood);
        rect(x + 4, 11, 22, 15, i === c && played ? '#372d34' : '#bb8550');
        rect(x + 8, 25, 15, 2, sand);
        if (i === a) slip(x + 10, 13, light);
        else if (i + 1 === b) {
          rect(x + 9, 16, 11, 2, sea);
          rect(x + 17, 14, 2, 6, sea);
          rect(x + 19, 15, 2, 4, sea);
        }
        if (i === c) {
          person(x + 19, 27, red);
          rect(x + 24, 32, 4, 1, sand);
        }
      }
    } else if (o === 'traveller') {
      rect(5, 27, 133, 2, sand);
      for (const x of [18, 118]) {
        rect(x, 8, 2, 20, wood);
        rect(x + 2, 8, 10, 3, x === 18 ? fern : red);
      }
      const movers = [
        [11, 8, 4],
        [80, 45, 57],
        [117, 110, 126],
      ][a];
      for (let i = 0; i < 3; i++) {
        const x = movers[i],
          y = [17, 13, 21][i];
        person(x, y, [sea, red, fern][i]);
        if (i === 1) {
          rect(x + 5, y - 3, 1, 10, light);
          rect(x + 6, y - 3, 7, 3, red);
        }
        if (i === 2) {
          rect(x - 7, y + 7, 7, 4, sand);
          rect(x - 6, y + 11, 2, 2, ink);
        }
      }
      if (played) {
        const x = movers[[0, 1, 2][b]];
        rect(x - 1, 36, 8, 1, light);
        rect(x + 2, 33, 2, 5, light);
      }
    } else if (o === 'harbour') {
      rect(12, 23, 120, 19, '#396e89');
      for (const x of [18, 49, 71, 105]) {
        rect(x, 34, 13, 1, sea);
        rect(x + 3, 38, 8, 1, sea);
      }
      const x = played ? 90 : 27;
      rect(x - 7, 20, 36, 5, sand);
      rect(x - 4, 25, 29, 3, wood);
      rect(x, 28, 20, 2, ink);
      for (const [i, n] of [a, b].entries()) {
        const px = x + i * 14;
        rect(px, 12, 2, 9, light);
        rect(px + 2, 12, 7, 6, [red, sea, fern][n]);
        for (let j = 0; j < n + 1; j++) rect(px + 3 + j * 2, 14, 1, 2, ink);
      }
      person(121, 12, [sea, red, fern][c]);
      rect(3, 20, 14, 3, wood);
      rect(121, 26, 19, 3, wood);
    } else if (o === 'workshop') {
      const gaps = [
        [0, 1, 1],
        [1, 2, 1],
        [3, 4, 2],
        [6, 5, 7],
      ][a * 2 + b];
      gaps.forEach((gap, i) => {
        const x = 9 + i * 45;
        rect(x, 28, 36, 3, wood);
        rect(x + 1, 27, 16, 1, light);
        let last = 0;
        for (let j = 0; j < 16; j++) {
          const height = played ? Math.round((gap * j * j) / 225) : 0;
          rect(x + 17 + j, 27 - height, 1, 1 + height - last, light);
          last = height;
        }
        rect(x + 2, 24, 4, 4, ink);
        rect(x + 34, 9, 2, 21, sea);
        for (let j = 0; j < 9; j++) rect(x + 32, 28 - j * 2, 2, 1, sand);
        if (a) {
          rect(x + 10, 12, 1, 3, sea);
          rect(x + 7, 15, 1, 1, sea);
        }
        if (b) {
          rect(x + 16, 25, 2, 2, red);
        }
      });
    } else {
      for (let i = 0; i < 4; i++) {
        const x = 14 + i * 32;
        rect(x, 25, 17, 3, sand);
        rect(x + 2, 28, 2, 9, wood);
        rect(x + 13, 28, 2, 9, wood);
        if (i < 3 || a !== 0) {
          person(x + 6, 12, i < 3 ? fern : a === 1 ? sea : red);
          if (i === 3 && a === 2) rect(x + 11, 15, 5, 1, light);
        } else {
          rect(x + 4, 11, 7, 1, light);
          rect(x + 6, 13, 3, 1, light);
        }
        if (i === 3 && played) {
          const y = 6;
          for (let j = 0; j <= b; j++) {
            rect(x + j * 4, y, 1, 4, sea);
            rect(x - 1 + j * 4, y + 3, 2, 1, sea);
          }
        }
      }
    }
  }
  return { el, draw };
}
