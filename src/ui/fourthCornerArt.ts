type Draw = [number, number, (g: CanvasRenderingContext2D) => void];
type Surface = 'old' | 'repeat' | 'cut' | 'review';

const border = '#91605e';
const light = '#e0b977';
const paper = '#f1deaa';
const cord = '#dd976c';
const blue = '#375575';
const pale = '#91d7db';

function bar(g: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function diamond(g: CanvasRenderingContext2D, x: number, y: number, color: string, outline = false) {
  bar(g, color, x, y - 2, 1, 1);
  bar(g, color, x - 2, y, 1, 1);
  bar(g, color, x + 2, y, 1, 1);
  bar(g, color, x, y + 2, 1, 1);
  if (!outline) {
    bar(g, color, x - 1, y - 1, 3, 3);
    bar(g, '#566881', x, y, 1, 1);
  }
}

function hanging(g: CanvasRenderingContext2D, mode: Surface) {
  bar(g, '#321f34', 1, 3, 14, 16);
  bar(g, border, 1, 3, 14, 2);
  bar(g, light, 2, 3, 12, 1);
  bar(g, blue, 2, 5, 12, 13);
  diamond(g, 5, 8, light);
  diamond(g, 10, 8, light);
  diamond(g, 5, 14, light);
  if (mode === 'repeat') {
    bar(g, '#556a86', 8, 11, 6, 7);
    diamond(g, 10, 14, pale, true);
    return;
  }
  bar(g, '#251c31', 9, 12, 5, 6);
  bar(g, '#846377', 9, 11, 4, 1);
  if (mode === 'cut' || mode === 'review') {
    bar(g, '#8f727d', 9, 12, 3, 3);
    bar(g, '#8f727d', 9, 15, 2, 2);
    bar(g, cord, 12, 14, 1, 6);
    bar(g, cord, 11, 18, 2, 1);
  }
  if (mode === 'review') {
    bar(g, paper, 1, 18, 6, 4);
    bar(g, border, 2, 19, 4, 1);
  }
}

function station(g: CanvasRenderingContext2D, type: 'rail' | 'cloth' | 'stitch' | 'sample') {
  const stitch = type === 'stitch' || type === 'sample';
  const finished = type === 'sample' || type === 'cloth';
  bar(g, '#462d36', 2, 13, 2, 10);
  bar(g, '#462d36', 12, 13, 2, 10);
  bar(g, border, 1, 12, 14, 3);
  bar(g, light, 1, 12, 14, 1);
  bar(g, stitch ? '#7b5b74' : blue, 3, 6, 10, 7);
  bar(g, stitch ? cord : pale, 3, 6, 10, 1);
  if (stitch) {
    bar(g, '#282034', 10, 8, 3, 4);
    bar(g, cord, 10, 10, 4, 1);
    if (finished) bar(g, cord, 13, 7, 1, 4);
  } else {
    diamond(g, 6, 9, light);
    diamond(g, 10, 10, finished ? light : pale, !finished);
  }
}

export const FOURTH_CORNER_ART: Record<string, Draw> = {
  'corner.old': [16, 24, (g) => hanging(g, 'old')],
  'corner.repeat': [16, 24, (g) => hanging(g, 'repeat')],
  'corner.cut': [16, 24, (g) => hanging(g, 'cut')],
  'corner.review': [16, 24, (g) => hanging(g, 'review')],
  'corner.order': [16, 24, (g) => {
    bar(g, '#4a303a', 2, 12, 12, 9);
    bar(g, paper, 3, 10, 10, 7);
    bar(g, '#9d7873', 4, 12, 7, 1);
    bar(g, '#9d7873', 4, 14, 5, 1);
    bar(g, light, 11, 9, 2, 4);
  }],
  'corner.rail': [16, 24, (g) => station(g, 'rail')],
  'corner.cloth': [16, 24, (g) => station(g, 'cloth')],
  'corner.stitch': [16, 24, (g) => station(g, 'stitch')],
  'corner.sample': [16, 24, (g) => station(g, 'sample')],
};
