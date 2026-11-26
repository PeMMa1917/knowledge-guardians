import { JIG_CASES } from '../content/jigShop';

type Brush = CanvasRenderingContext2D;
type Art = [width: number, height: number, draw: (g: Brush) => void];

const dark = '#2a2536', plank = '#674e5b', brass = '#e0c096', shine = '#eed8ac', iron = '#8fa8ae';

function box(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function frame(draw: Art[2]): Art {
  return [32, 24, (g) => {
    box(g, dark, 2, 3, 28, 19);
    box(g, plank, 3, 4, 26, 16);
    box(g, brass, 4, 4, 24);
    box(g, shine, 4, 5, 1, 13);
    box(g, brass, 5, 19, 22, 2);
    draw(g);
  }];
}

const tint = ['#c5a77e', '#8fb2a6', '#bd9ba3', '#d1a282', '#b5b1ce', '#e4c59b', '#b0bec1'];

// Original silhouettes of catalogue-visible forms. The other cases show practice diagrams.
const catalogueForms: Partial<Record<string, Art[2]>> = {
  'portslade-anvil': (g) => {
    box(g, iron, 6, 8, 13, 3);
    box(g, iron, 18, 10, 9, 1);
    box(g, '#5c767d', 8, 11, 16, 1);
    box(g, '#5c767d', 10, 12, 9, 2);
    box(g, '#5c767d', 11, 14, 6, 2);
    box(g, iron, 9, 16, 10, 2);
  },
  'hirata-workholder': (g) => {
    box(g, '#6899b8', 6, 12, 9, 2);
    box(g, '#6899b8', 7, 13, 1, 5);
    box(g, '#6899b8', 13, 13, 1, 5);
    box(g, iron, 12, 8, 2, 4);
    box(g, '#e4bd53', 7, 7, 8, 2);
    box(g, '#e4bd53', 17, 10, 4, 8);
    box(g, '#e4bd53', 23, 10, 4, 8);
    box(g, shine, 17, 10, 4);
    box(g, shine, 23, 10, 4);
  },
  'garrett-guard-model': (g) => {
    box(g, iron, 6, 11, 20, 3);
    box(g, '#5c767d', 8, 14, 2, 4);
    box(g, '#5c767d', 22, 14, 2, 4);
    box(g, iron, 13, 8, 7, 3);
    box(g, shine, 14, 7, 5);
    box(g, '#5c767d', 13, 14, 7, 2);
    box(g, '#5c767d', 15, 16, 3);
  },
  'jarboe-plate-vise': (g) => {
    // The selected catalogue photos show plate cases. This is an external catalogue slip.
    box(g, shine, 9, 6, 14, 11);
    box(g, iron, 11, 8, 5);
    box(g, iron, 11, 10, 10);
    box(g, '#ad8190', 11, 12, 3, 3);
    box(g, plank, 15, 13, 6);
  },
  'concave-plane': (g) => {
    box(g, '#a77750', 7, 12, 18, 3);
    box(g, '#a77750', 8, 15, 16, 1);
    box(g, brass, 10, 16, 12, 1);
    box(g, '#cba372', 8, 11, 4, 2);
    box(g, '#cba372', 12, 9, 2, 4);
    box(g, iron, 11, 7, 2, 3);
  },
  'angell-loom-temple': (g) => {
    box(g, '#5c767d', 7, 12, 20, 4);
    box(g, '#5c767d', 10, 11, 17, 1);
    box(g, '#5c767d', 7, 16, 16, 1);
    box(g, brass, 10, 14, 3);
    box(g, brass, 22, 12, 3);
    box(g, iron, 16, 11, 4, 4);
    box(g, shine, 17, 11, 2);
  },
};

const diagrams = Object.fromEntries(JIG_CASES.map((entry, i): [string, Art] => [entry.art, frame((g) => {
  const catalogueForm = catalogueForms[entry.slug];
  if (catalogueForm) {
    catalogueForm(g);
    return;
  }
  const color = tint[i % tint.length];
  const shift = i % 6;
  if (entry.family === 'hold') {
    box(g, iron, 7, 15, 18, 2);
    box(g, brass, 9 + shift % 3, 8, 3, 7);
    box(g, brass, 21 - shift % 3, 8, 3, 7);
    box(g, color, 12 + shift % 3, 11, 9 - 2 * (shift % 3), 3);
  } else if (entry.family === 'measure') {
    box(g, shine, 7, 9, 18, 5);
    for (let x = 8; x <= 23; x += 2) box(g, dark, x, 11, 1, x % 4 === 0 ? 3 : 2);
    box(g, color, 11 + shift, 7, 2, 9);
  } else if (entry.family === 'shape') {
    box(g, shine, 6, 7, 20, 11);
    box(g, iron, 8, 15, 16);
    box(g, color, 9, 10 + shift % 3, 12, 3 + shift % 2);
    box(g, dark, 11 + shift, 10 + shift % 3, 3, 2);
  } else {
    box(g, shine, 8, 7, 17, 11);
    box(g, color, 10, 9, 7, 2 + shift % 2);
    box(g, plank, 10, 12 + shift % 3, 13);
    box(g, iron, 18, 9, 5, 2);
  }
})]));

function stand(fitted: boolean | null): Art {
  return frame((g) => {
    box(g, iron, 6, 16, 20, 2);
    if (fitted === null) {
      box(g, dark, 7, 10, 18, 5);
      box(g, shine, 8, 11, 16, 2);
      return;
    }
    box(g, fitted ? '#e1a579' : '#a1c9b1', 7, 11, 5, 5);
    box(g, brass, 12, fitted ? 9 : 11, 8, fitted ? 6 : 4);
    box(g, fitted ? '#e1a579' : '#a1c9b1', 20, fitted ? 13 : 11, 5, fitted ? 3 : 5);
  });
}

export const JIG_SHOP_ART: Record<string, Art> = {
  ...diagrams,
  'jig-shop.closed': stand(null),
  'jig-shop.common': stand(false),
  'jig-shop.fitted': stand(true),
};
