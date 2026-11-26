type Picture = [width: number, height: number, draw: (g: CanvasRenderingContext2D) => void];
type Shape = (g: CanvasRenderingContext2D, phase: number) => void;

const palette = {
  ink: '#252239', dim: '#3c4858', nickel: '#627786', mint: '#a7c9c7',
  paper: '#f4deb1', shadow: '#bd926b', light: '#fff3c9', ocean: '#374f97',
  ochre: '#d9ac5e', red: '#b75048', lime: '#a7ce94',
};

function px(g: CanvasRenderingContext2D, color: string, x: number, y: number, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function stage(shape: Shape, phase: number): Picture {
  return [32, 24, (g) => {
    px(g, palette.ink, 2, 3, 28, 20);
    px(g, palette.dim, 3, 3, 26, 15);
    px(g, palette.nickel, 4, 4, 24, 1);
    px(g, palette.mint, 3, 18, 26, 1);
    px(g, palette.nickel, 3, 19, 26, 3);
    px(g, palette.paper, 13, 20, 6, 1);
    shape(g, phase);
  }];
}

function book(g: CanvasRenderingContext2D, left: number, top: number, width: number, height: number): void {
  px(g, palette.shadow, left, top + 1, width, height);
  px(g, palette.paper, left + 1, top, width - 2, height - 1);
  px(g, palette.light, left + 1, top, width - 2);
  px(g, palette.shadow, left + Math.floor(width / 2), top + 1, 1, height - 2);
}

const map: Shape = (g, phase) => {
  book(g, 5, 5, 22, 13);
  for (const [i, width] of [5, 9, 11, 11, 13, 13, 13, 11, 11, 9, 5].entries()) {
    px(g, palette.ocean, 16 - Math.floor(width / 2), 6 + i, width);
  }
  const y = phase === 2 ? 9 : 13;
  px(g, palette.paper, 11, y, 8, 2);
  px(g, palette.ochre, 17, y - 2, 4, 2);
  px(g, palette.shadow, 16, 6, 1, 11);
  if (phase !== 0) {
    px(g, palette.red, 7, phase === 2 ? 14 : 8, 2, 2);
    px(g, palette.lime, 23, phase === 2 ? 8 : 14, 2, 2);
  }
};

const raised: Shape = (g, phase) => {
  book(g, 7, 5, 17, 12);
  for (const [x, y] of [[10, 7], [11, 9], [14, 7], [13, 8], [18, 8], [20, 7], [20, 11], [18, 12]]) {
    px(g, palette.shadow, x, y);
  }
  if (phase !== 0) {
    px(g, palette.ochre, 8, 14, 6, 2);
    px(g, palette.ochre, 17, phase === 2 ? 12 : 14, 6, 2);
    px(g, palette.light, 9, 13, 2, 1);
    px(g, palette.light, 18, phase === 2 ? 11 : 13, 2, 1);
  }
};

const motion: Shape = (g, phase) => {
  px(g, palette.shadow, 6, 6, 20, 11);
  px(g, palette.paper, 7, 7, 18, 9);
  px(g, palette.shadow, 12, 7, 1, 9);
  px(g, palette.shadow, 19, 7, 1, 9);
  px(g, palette.shadow, 7, 13, 18);
  px(g, palette.ink, 8, 10, 4, 2);
  px(g, palette.ink, 14, 9, 4, 2);
  px(g, palette.ink, 21, 11, 3, 2);
  if (phase === 1) px(g, palette.lime, 7, 14, 18);
  if (phase === 2) {
    px(g, palette.red, 23, 9, 4, 1);
    px(g, palette.ochre, 26, 9, 2, 4);
  }
};

const authorProof: Shape = (g, phase) => {
  px(g, palette.red, 5, 6, 22, 12);
  book(g, 7, 5, 18, 12);
  for (const [x, y] of [[10, 7], [12, 7], [12, 9], [19, 7], [22, 9]]) {
    px(g, palette.shadow, x, y);
  }
  px(g, palette.dim, 9, 13, 6, 1);
  px(g, palette.shadow, 12, 11, 3);
  if (phase === 1) px(g, palette.lime, 19, 13, 4, 2);
  if (phase === 2) {
    px(g, palette.ochre, 17, 11, 7, 2);
    px(g, palette.lime, 18, 14, 6, 2);
  }
};

const network: Shape = (g, phase) => {
  px(g, palette.ink, 9, 7, 14, 10);
  px(g, palette.nickel, 11, 5, 12, 2);
  px(g, palette.dim, 10, 7, 3, 9);
  px(g, palette.paper, 15, 9, 5, 2);
  px(g, phase === 1 ? palette.lime : palette.ochre, 18, 14, 2, 1);
  if (phase === 1) px(g, palette.mint, 5, 16, 7, 1);
  if (phase === 2) {
    px(g, palette.paper, 22, 12, 5, 4);
    px(g, palette.shadow, 23, 14, 3, 1);
  }
};

const plate: Shape = (g, phase) => {
  px(g, palette.dim, 6, 5, 20, 13);
  px(g, palette.nickel, 7, 6, 18, 11);
  px(g, palette.ink, 8, 7, 16, 9);
  for (const [x, y] of [[10, 8], [13, 9], [14, 13], [19, 12], [21, 8], [22, 15]]) {
    px(g, palette.light, phase === 1 ? 32 - x : x, y);
  }
  const marks = phase === 1 ? [20, 13] : [12, 19];
  px(g, palette.ochre, marks[0], 11, 2, 1);
  px(g, palette.lime, marks[1], 14, 2, 1);
  if (phase === 2) {
    px(g, palette.mint, 10, 14, 2, 2);
    px(g, palette.paper, 21, 10, 2, 2);
  }
};

export const READING_WORKS_ART: Record<string, Picture> = Object.fromEntries(
  Object.entries({ idrisi: map, braille: raised, muybridge: motion, next: network, 'perkins-procede': authorProof, leavitt: plate }).flatMap(([name, shape]) => [
    [`reading-works.${name}`, stage(shape, 0)],
    [`reading-works.${name}.first`, stage(shape, 1)],
    [`reading-works.${name}.second`, stage(shape, 2)],
  ]),
);
