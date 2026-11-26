import { PRICE_CASES } from '../content/priceDrawers';

type Brush = CanvasRenderingContext2D;
type Art = [number, number, (g: Brush) => void];

function box(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

const ink = '#2b2837', plank = '#7b5e56', brass = '#e1b585', paper = '#ebd5a8', blue = '#709daf';
const colors = ['#b99c9d', '#d29c70', '#a9b48b', '#9ba5c9', '#b6c4ac', '#966f79', '#dac8a9'];

function panel(draw: Art[2]): Art {
  return [32, 24, (g) => {
    box(g, ink, 2, 3, 28, 19);
    box(g, plank, 3, 4, 26, 17);
    box(g, brass, 4, 5, 24);
    box(g, brass, 5, 18, 22, 2);
    draw(g);
  }];
}

function drawer(open: boolean, checked = false): Art {
  return panel((g) => {
    box(g, ink, 7, 8, 18, 9);
    box(g, blue, 8, open ? 10 : 8, 16, 7);
    box(g, paper, 10, open ? 7 : 11, 12, open ? 6 : 2);
    if (checked) box(g, brass, 21, 7, 3, 3);
  });
}

export const PRICE_DRAWERS_ART: Record<string, Art> = {
  ...Object.fromEntries(PRICE_CASES.map((entry, index): [string, Art] => [entry.art, panel((g) => {
    const tint = colors[index % colors.length];
    const mark = 9 + index % 9;
    if (entry.family === 'token') {
      box(g, paper, 11, 7, 10, 10);
      box(g, tint, 9, 9, 14, 6);
      box(g, ink, mark, 11, 5, 1 + index % 3);
    } else {
      box(g, paper, 7, 7, 18, 10);
      box(g, tint, 8, 8, 16, 4);
      box(g, ink, mark, entry.family === 'count' ? 9 : 14, 5, 2);
      box(g, blue, 22, 9, 2, 6);
    }
  })])),
  'price-drawers.closed': drawer(false),
  'price-drawers.offer': drawer(true),
  'price-drawers.check': drawer(true, true),
};
