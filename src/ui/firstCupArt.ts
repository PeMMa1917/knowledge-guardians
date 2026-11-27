type Brush = CanvasRenderingContext2D;
type Picture = [number, number, (g: Brush) => void];
const ink = '#3d3543',
  wood = '#9f684b',
  brass = '#d39258',
  light = '#f4d5a0',
  felt = '#9f4156',
  red = '#d56b71',
  cream = '#f3e1bf',
  blue = '#519297',
  deep = '#506271';
function box(g: Brush, color: string, x: number, y: number, w: number, h: number) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}
function wheel(g: Brush, x: number, y: number) {
  box(g, ink, x + 1, y, 4, 6);
  box(g, ink, x, y + 1, 6, 4);
  box(g, brass, x + 1, y + 1, 4, 4);
  box(g, ink, x + 2, y + 2, 2, 2);
}
function canopy(g: Brush) {
  box(g, ink, 2, 2, 18, 3);
  box(g, red, 3, 2, 16, 2);
  for (let x = 2; x < 20; x += 4) {
    box(g, felt, x, 4, 3, 3);
    box(g, cream, x + 2, 3, 2, 3);
  }
  box(g, wood, 3, 6, 2, 8);
  box(g, wood, 17, 6, 2, 8);
}
function pitcher(g: Brush, x: number, y: number, c: string) {
  box(g, ink, x + 1, y, 4, 2);
  box(g, c, x + 1, y + 1, 3, 2);
  box(g, ink, x, y + 3, 6, 6);
  box(g, c, x + 1, y + 3, 4, 5);
  box(g, light, x + 1, y + 3, 1, 4);
  box(g, ink, x + 6, y + 3, 2, 4);
  box(g, c, x + 5, y + 4, 2, 1);
}
export const cupArt: Record<string, Picture> = {
  'cup.cart': [
    22,
    22,
    (g) => {
      canopy(g);
      pitcher(g, 6, 6, brass);
      box(g, ink, 1, 14, 20, 4);
      box(g, wood, 2, 15, 18, 2);
      wheel(g, 3, 16);
      wheel(g, 14, 16);
      box(g, cream, 14, 13, 3, 1);
    },
  ],
  'cup.pots': [
    22,
    22,
    (g) => {
      box(g, ink, 1, 17, 20, 3);
      box(g, light, 2, 17, 18, 1);
      for (const x of [3, 7, 11, 15]) {
        box(g, brass, x, 18, 3, 2);
        box(g, deep, x + 1, 18, 1, 1);
      }
      pitcher(g, 2, 8, brass);
      pitcher(g, 12, 6, blue);
      box(g, cream, 5, 5, 1, 2);
      box(g, cream, 6, 3, 1, 2);
    },
  ],
  'cup.flap': [
    22,
    22,
    (g) => {
      canopy(g);
      box(g, wood, 3, 13, 2, 6);
      box(g, wood, 17, 13, 2, 6);
      box(g, deep, 8, 10, 5, 3);
      box(g, wood, 6, 13, 9, 2);
      box(g, brass, 4, 16, 13, 2);
      box(g, cream, 2, 19, 17, 1);
    },
  ],
  'cup.rain': [
    22,
    22,
    (g) => {
      box(g, deep, 1, 15, 20, 2);
      box(g, blue, 3, 17, 13, 1);
      for (const [x, y] of [
        [3, 6],
        [9, 2],
        [14, 7],
        [18, 4],
        [7, 11],
      ]) {
        box(g, blue, x, y, 1, 3);
        box(g, '#acd4cd', x - 1, y + 3, 2, 1);
      }
      box(g, blue, 17, 18, 3, 1);
    },
  ],
  'cup.slips': [
    22,
    22,
    (g) => {
      box(g, cream, 5, 7, 7, 6);
      box(g, red, 6, 8, 4, 1);
      box(g, light, 11, 6, 5, 7);
      box(g, wood, 12, 8, 3, 1);
      box(g, ink, 2, 11, 16, 2);
      box(g, blue, 4, 13, 12, 5);
      box(g, ink, 6, 18, 8, 1);
      box(g, cream, 16, 12, 3, 2);
      box(g, cream, 17, 14, 2, 2);
      box(g, cream, 5, 13, 2, 4);
    },
  ],
  'cup.board': [
    22,
    22,
    (g) => {
      box(g, wood, 3, 6, 16, 11);
      box(g, ink, 4, 7, 14, 9);
      box(g, light, 6, 9, 4, 1);
      box(g, light, 9, 10, 1, 2);
      box(g, light, 7, 12, 3, 1);
      box(g, light, 6, 13, 1, 1);
      box(g, brass, 4, 17, 2, 3);
      box(g, brass, 16, 17, 2, 3);
      box(g, red, 12, 13, 3, 1);
    },
  ],
};
