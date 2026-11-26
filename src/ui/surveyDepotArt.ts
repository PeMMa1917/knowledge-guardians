import { DEPOT_RECORDS } from '../content/surveyDepot';

type Brush = CanvasRenderingContext2D;
type Art = [width: number, height: number, paint: (g: Brush) => void];
type Shape = (g: Brush, tone: string) => void;

const ink = '#262238', floor = '#294158', wood = '#8c6047', light = '#e4c38f', steel = '#6e96a6',
  metal = '#a6c7cf', paper = '#f1e2b5', wax = '#a55d4f', gold = '#d09b57';
const tones = ['#deb27a', '#b6c9a0', '#d79681', '#a99ac8', '#8baebd', '#d9c67c'];

function px(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function stroke(g: Brush, color: string, x1: number, y1: number, x2: number, y2: number) {
  const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let i = 0; i <= length; i++) px(g, color, Math.round(x1 + (x2 - x1) * i / length), Math.round(y1 + (y2 - y1) * i / length));
}

function circle(g: Brush, color: string, x: number, y: number, size: number) {
  for (let row = -size; row <= size; row++) {
    const half = Math.floor(Math.sqrt(size * size - row * row));
    px(g, color, x - half, y + row, half * 2 + 1);
  }
}

const shapes: Record<string, Shape> = {
  scope: (g, tone) => {
    px(g, ink, 8, 15, 16, 2); px(g, steel, 12, 13, 9, 2); px(g, tone, 14, 8, 4, 6);
    px(g, steel, 7, 6, 18, 3); px(g, metal, 7, 6, 18); px(g, ink, 9, 8, 5); px(g, gold, 18, 12, 4);
  },
  chest: (g, tone) => {
    px(g, ink, 6, 8, 20, 10); px(g, wood, 7, 7, 18, 4); px(g, tone, 8, 8, 16, 2);
    px(g, wood, 7, 12, 18, 5); px(g, light, 8, 12, 16); px(g, paper, 13, 13, 6, 2);
    px(g, gold, 10, 11, 2, 2); px(g, gold, 21, 11, 2, 2);
  },
  micro: (g, tone) => {
    px(g, ink, 7, 16, 18, 2); px(g, tone, 10, 15, 12); px(g, ink, 15, 7, 4, 9);
    stroke(g, metal, 18, 7, 21, 4); px(g, ink, 19, 4, 4, 2); px(g, light, 9, 9, 9, 2);
    circle(g, steel, 13, 13, 2); px(g, paper, 12, 12);
  },
  upright: (g, tone) => {
    px(g, ink, 9, 4, 13, 14); px(g, wood, 10, 5, 11, 11); px(g, tone, 11, 6, 8, 9);
    px(g, '#66795b', 15, 7, 5, 8); px(g, paper, 16, 8, 3, 3); px(g, gold, 11, 9, 2);
    px(g, ink, 13, 2, 6, 2);
  },
  sextant: (g, tone) => {
    stroke(g, tone, 8, 14, 14, 5); stroke(g, tone, 14, 5, 23, 13);
    stroke(g, tone, 8, 14, 16, 17); stroke(g, tone, 16, 17, 23, 13);
    stroke(g, gold, 14, 5, 17, 16); px(g, metal, 14, 6, 4, 2);
    px(g, paper, 22, 5, 4, 4);
  },
  dial: (g, tone) => {
    circle(g, steel, 15, 11, 7); circle(g, tone, 15, 11, 6); circle(g, paper, 15, 11, 5);
    stroke(g, floor, 15, 11, 18, 8); px(g, metal, 14, 3, 3, 2); px(g, gold, 15, 15, 2);
  },
  wallet: (g, tone) => {
    px(g, ink, 6, 7, 20, 11); px(g, tone, 8, 6, 16, 11); px(g, light, 8, 6, 16);
    px(g, wood, 8, 12, 16); px(g, gold, 14, 11, 4, 4); px(g, ink, 15, 12, 2, 2);
    px(g, wood, 9, 15, 3); px(g, wood, 20, 15, 3);
  },
  paper: (g, tone) => {
    px(g, tone, 7, 5, 12, 11); px(g, paper, 14, 9, 11, 8);
    for (let i = 0; i < 3; i++) px(g, steel, 9, 7 + i * 2, 6);
    px(g, wax, 16, 10, 7, 1); px(g, wood, 16, 13, 5, 1);
  },
  roll: (g, tone) => {
    px(g, ink, 5, 6, 22, 12); px(g, tone, 6, 7, 20, 10); px(g, floor, 8, 8, 16, 7);
    px(g, metal, 9, 10, 7, 4); px(g, light, 9, 10, 7); stroke(g, gold, 23, 9, 15, 12);
  },
  glass: (g, tone) => {
    px(g, steel, 10, 7, 11, 11); px(g, metal, 11, 8, 9, 9); px(g, '#d8e8e7', 12, 8, 2, 8);
    px(g, paper, 12, 5, 7, 3); px(g, tone, 13, 13, 6, 3); px(g, ink, 20, 7, 2, 1);
  },
  wheel: (g, tone) => {
    circle(g, ink, 14, 11, 7); circle(g, floor, 14, 11, 6);
    for (const [x, y] of [[14, 5], [20, 11], [14, 17], [8, 11], [18, 7], [10, 15]]) stroke(g, metal, 14, 11, x, y);
    circle(g, tone, 14, 11, 2); stroke(g, wood, 18, 10, 25, 4); px(g, light, 23, 4, 5);
  },
  packet: (g, tone) => {
    px(g, ink, 8, 5, 15, 13); px(g, tone, 9, 5, 14, 2); px(g, paper, 10, 9, 10, 5);
    px(g, wood, 11, 10, 7); px(g, wood, 11, 12, 5); px(g, metal, 17, 15, 4, 2);
  },
  sledge: (g, tone) => {
    px(g, light, 7, 14, 18, 1); px(g, wood, 7, 16, 18);
    stroke(g, light, 4, 11, 7, 14); stroke(g, wood, 4, 13, 7, 16);
    px(g, tone, 11, 9, 5, 5); px(g, tone, 18, 10, 5, 4); circle(g, gold, 9, 12, 2);
  },
  bundle: (g, tone) => {
    px(g, ink, 6, 7, 20, 10); px(g, tone, 8, 7, 16, 9); px(g, light, 8, 8, 16);
    px(g, floor, 13, 7, 1, 9); px(g, paper, 15, 10, 7, 4);
    px(g, floor, 16, 11, 4, 1); px(g, metal, 20, 5, 6, 2);
  },
  flag: (g, tone) => {
    px(g, light, 10, 4, 2, 14); px(g, tone, 12, 4, 13, 7); px(g, wax, 12, 7, 10);
    stroke(g, '#8098a6', 12, 6, 23, 10);
  },
  compass: (g, tone) => {
    circle(g, wood, 14, 10, 6); circle(g, tone, 14, 10, 5);
    px(g, ink, 14, 10); px(g, ink, 14, 6, 1, 2); px(g, ink, 14, 13, 1, 2);
    px(g, ink, 10, 10, 2); px(g, ink, 17, 10, 2); stroke(g, wood, 18, 14, 24, 17);
  },
  lantern: (g, tone) => {
    px(g, ink, 9, 5, 14, 13); px(g, light, 12, 5, 9, 10); px(g, tone, 12, 6, 3, 8);
    px(g, tone, 18, 6, 3, 8); px(g, ink, 15, 5, 1, 12); px(g, gold, 10, 15, 12);
  },
};

function caseView(shape: Shape, tint: string): Art {
  return [32, 24, (g) => {
    px(g, ink, 2, 2, 28, 21); px(g, floor, 3, 3, 26, 16);
    px(g, steel, 3, 3, 26); px(g, steel, 3, 3, 1, 16); px(g, steel, 3, 19, 26, 2);
    px(g, paper, 13, 20, 6, 2);
    shape(g, tint);
  }];
}

const misc: Record<string, Shape> = {
  empty: (g) => { px(g, wood, 6, 15, 20, 3); px(g, light, 10, 8, 12, 2); px(g, light, 10, 9, 2, 6); px(g, light, 20, 9, 2, 6); },
  scope: shapes.scope,
  reused: (g) => { shapes.upright(g, '#779e84'); shapes.micro(g, light); },
  paired: (g) => { px(g, wood, 5, 7, 22, 10); px(g, paper, 7, 8, 8, 7); px(g, light, 17, 8, 8, 7); px(g, steel, 9, 10, 4, 2); px(g, wax, 19, 10, 4, 2); },
  linked: (g) => { px(g, wood, 7, 5, 11, 13); px(g, paper, 8, 6, 9, 11); px(g, steel, 11, 9, 8); px(g, light, 19, 12, 8, 5); px(g, wax, 21, 13, 4); },
  ledger: shapes.paper,
  dial: shapes.dial,
  trace: (g) => {
    px(g, paper, 5, 6, 22, 12); px(g, steel, 7, 8, 1, 8); px(g, steel, 7, 16, 17);
    stroke(g, wax, 9, 9, 15, 14); stroke(g, wax, 15, 14, 22, 9); px(g, ink, 15, 14);
  },
  bundles: (g) => {
    for (const x of [7, 14, 21]) for (const y of [7, 13]) { px(g, light, x, y, 5, 4); px(g, wood, x + 2, y, 1, 4); }
  },
  slides: (g) => {
    for (const x of [7, 14, 21]) for (const y of [7, 13]) { px(g, metal, x, y, 5, 4); px(g, steel, x + 1, y + 1, 3, 2); }
  },
  'signal-low': (g) => { shapes.flag(g, wax); px(g, light, 5, 15, 10, 2); },
  'signal-high': (g) => { shapes.flag(g, metal); px(g, light, 22, 7, 4, 9); },
};

export const DEPOT_ART: Record<string, Art> = {
  ...Object.fromEntries(DEPOT_RECORDS.map((record) => [record.art, caseView(shapes[record.shape], tones[record.tone])])),
  ...Object.fromEntries(Object.entries(misc).map(([id, draw]) => [`depot.${id}`, caseView(draw, light)])),
};
