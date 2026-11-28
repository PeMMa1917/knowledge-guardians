import { trySleeves, type Cast } from '../domain/giantSleeve';

type Draw = CanvasRenderingContext2D;
const blue = '#80bdc5',
  pale = '#f5daab',
  gold = '#ecc46e',
  shadow = '#272636',
  red = '#d88879';
function rect(g: Draw, colour: string, x: number, y: number, w: number, h: number) {
  g.fillStyle = colour;
  g.fillRect(x, y, w, h);
}
/** Four wooden actors and their projected arms. Front-row colours remain legible without motion. */
export function drawSleeves(
  g: Draw,
  cast: Cast,
  mask: number,
  curtain?: { face: string; first: boolean; curve: boolean; hinge?: unknown },
) {
  const rows = trySleeves(cast, mask);
  g.clearRect(0, 0, 136, 54);
  rect(g, shadow, 0, 0, 136, 54);
  rect(g, '#45405b', 5, 4, 126, 40);
  for (let i = 0; i < 9; i++) rect(g, i % 2 ? '#92606d' : '#a76b70', 5 + i * 15, 3, 12, 5);
  rect(g, '#785440', 5, 43, 126, 3);
  rect(g, '#b78d61', 5, 43, 126, 1);
  if (curtain?.hinge === 'chalk') {
    rect(g, pale, 56, 8, 8, 6);
    rect(g, pale, 58, 6, 4, 10);
    rect(g, '#45405b', 61, 6, 4, 6);
  } else if (curtain?.hinge === 'chalk-dust') {
    for (let i = 0; i < 12; i++) rect(g, gold, 8 + i * 10, 12 + ((i * 7) % 13), 2, 2);
  }
  rows.forEach((p, i) => {
    const x = 15 + i * 32,
      high = 37 - (curtain?.first && i === 3 ? 5 : 0),
      tint = [gold, blue, red, pale][i];
    rect(g, '#938a87', x + 3, 9, 1, high - 16);
    rect(g, tint, x, high - 14, 6, 5);
    rect(g, '#c0a689', x - 1, high - 9, 8, 9);
    rect(g, '#4e4143', x + 1, high, 2, 5);
    rect(g, '#4e4143', x + 5, high, 2, 5);
    rect(g, tint, x + 6, high - 8, Math.floor(p.reach / 2), 2);
    const elbow = x + 6 + Math.floor(p.reach / 2);
    rect(g, p.joint ? gold : '#8c6256', elbow - 2, high - 9, 3, 4);
    if (p.fits) {
      rect(g, pale, elbow, high - 12, 2, 5);
      rect(g, tint, elbow, high - 13, 4, 2);
    } else {
      rect(g, pale, elbow, high - 6, 2, 5);
      rect(g, tint, elbow, high - 2, 4, 2);
    }
    if (curtain?.face === 'seam')
      for (let n = 0; n < 3; n++) rect(g, '#7a635c', x + n * 2, high - 6 + (n % 2), 1, 2);
    if (curtain?.face === 'writing') rect(g, '#7e504f', x, high - 6, 6, 1);
    if (curtain?.curve && i === 3) {
      rect(g, gold, x + 8, high - 14, 6, 2);
      rect(g, pale, x + 6, high - 15, 3, 2);
    }
  });
}
type Drawing = [number, number, (g: Draw) => void];
export const elbowArt: Record<string, Drawing> = {
  'elbow.knock': [
    23,
    27,
    (g) => {
      rect(g, '#64455b', 3, 2, 17, 21);
      rect(g, '#39354b', 5, 4, 13, 15);
      rect(g, '#bd9a70', 5, 19, 14, 2);
      rect(g, '#d9c49f', 5, 13, 6, 3);
      rect(g, pale, 10, 10, 6, 4);
      rect(g, gold, 15, 8, 2, 5);
      rect(g, blue, 5, 15, 4, 2);
    },
  ],
  'elbow.pattern': [
    26,
    24,
    (g) => {
      rect(g, '#684637', 2, 17, 22, 3);
      rect(g, '#916b4c', 4, 20, 2, 4);
      rect(g, '#916b4c', 21, 20, 2, 4);
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 6;
        rect(g, blue, x, 7 + (i % 2) * 2, 4, 6);
        rect(g, pale, x + 2, 12, 3, 4);
        rect(g, gold, x + 3, 11, 2, 2);
      }
    },
  ],
  'elbow.hinge': [
    26,
    24,
    (g) => {
      rect(g, '#795847', 2, 14, 22, 5);
      rect(g, shadow, 3, 19, 20, 2);
      for (let i = 0; i < 6; i++) {
        const x = 3 + i * 3;
        rect(g, pale, x, 12 - i, 2, 5 + i);
        rect(g, i % 2 ? red : blue, x, 11 - i, 2, 2);
      }
      rect(g, gold, 22, 4, 2, 13);
      rect(g, gold, 18, 4, 4, 2);
    },
  ],
};
