import type { MakerTrial } from '../content/makerTrials';
import { h } from './dom';

/** Decorative pixel view. The complete reference, value and mark are printed beside it. */
export function makerIllustration(t: MakerTrial, mount: 0 | 1, standard: 0 | 1) {
  const canvas = h('canvas', {
    width: 112,
    height: 46,
    class: 'maker-imprint',
    'aria-hidden': 'true',
  });
  const g = canvas.getContext('2d');
  if (!g) return canvas;
  const rect = (colour: string, x: number, y: number, w: number, h: number) => {
    g.fillStyle = colour;
    g.fillRect(x, y, w, h);
  };
  const ink = '#392d38',
    faded = '#856c57',
    brass = '#a66936',
    blue = '#32738b';
  rect('#efe2b9', 0, 0, 112, 46);
  if (t.tool === 'reed-pen') {
    const digit = standard
      ? ['11111', '00001', '00010', '00100', '00100', '00100', '00100']
      : ['11110', '00001', '00001', '01110', '00001', '00001', '11110'];
    for (const x of [14, 62]) {
      rect('#fcf1d1', x - 4, 4, 31, 37);
      rect(faded, x - 4, 39, 31, 1);
      digit.forEach((row, y) =>
        [...row].forEach((bit, i) => {
          if (bit === '1') rect(ink, x + i * 4, 7 + y * 4, x === 14 || mount === 1 ? 4 : 5, 4);
        }),
      );
    }
    if (mount === 1) rect('#fcf1d1', standard ? 69 : 77, standard ? 21 : 18, 5, 1);
    return canvas;
  }
  if (t.tool === 'plumb-line') {
    for (const [i, x] of [23, 72].entries()) {
      const datum = x + (standard ? 6 : 0),
        hanging = datum + (i === 0 ? 0 : mount ? -3 : 3);
      rect(brass, datum - 3, 7, 9, 3);
      rect(faded, datum, 11, 1, 28);
      rect(ink, hanging, 11, 1, 18);
      rect(blue, hanging - 2, 28, 5, 5);
      rect(ink, hanging, 33, 1, 2);
      rect(ink, x - 7, 37, 24, 1);
      for (let j = -2; j <= 5; j++) rect(ink, x + j * 3, 37, 1, j === 0 ? 5 : 3);
    }
    return canvas;
  }
  const level = standard ? 10 : 5;
  for (const [i, x] of [18, 66].entries()) {
    const correction = i === 0 ? 0 : mount ? -1 : 2;
    rect(ink, x, 5, 2, 34);
    rect(ink, x + 21, 5, 2, 34);
    rect(ink, x, 38, 23, 2);
    rect(blue, x + 2, 38 - level * 2, 19, level * 2);
    rect('#96c8bb', x + 2, 38 - level * 2, 19, 2);
    for (let j = 0; j < 15; j++) rect(i ? brass : ink, x + 22, 38 - (j - correction) * 2, j % 5 ? 3 : 6, 1);
  }
  return canvas;
}
