type Brush = CanvasRenderingContext2D;
type Art = [number, number, (g: Brush) => void];

const ink = '#292b3a', rail = '#7f6356', light = '#eac68c', leaf = '#a6c0a3', blue = '#5d86ab', paper = '#e0d1ab';

function box(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function framed(paint: Art[2]): Art {
  return [32, 24, (g) => {
    box(g, ink, 2, 2, 28, 21);
    box(g, rail, 3, 3, 26, 18);
    box(g, light, 4, 4, 24);
    box(g, light, 4, 4, 1, 15);
    paint(g);
  }];
}

function cart(g: Brush, x: number, tread: boolean) {
  box(g, leaf, 5, 6, 22, 12);
  box(g, paper, 17, 9, 2, 10);
  box(g, rail, x, 9, 10, 5);
  box(g, light, x + 1, 9, 8, 1);
  box(g, ink, x + 1, 14, 2, 2);
  box(g, ink, x + 7, 14, 2, 2);
  if (tread) for (const i of [12, 14, 20, 22]) box(g, ink, i, 17, 1, 2);
}

function papers(which: 'closed' | 'open' | 'over' | 'folder'): Art {
  return framed((g) => {
    box(g, paper, 7, 7, 10, 12);
    box(g, leaf, 18, 8, 8, 10);
    box(g, ink, 9, 9, 6);
    box(g, ink, 9, 12, 5);
    box(g, blue, 20, 10, 4);
    box(g, blue, 20, 14, 3);
    if (which === 'closed') {
      box(g, rail, 17, 7, 10, 12);
      box(g, light, 17, 12, 10, 2);
    } else if (which === 'over') {
      box(g, light, 10, 9, 12, 8);
      box(g, rail, 12, 12, 8);
    } else if (which === 'folder') {
      box(g, light, 6, 15, 21, 4);
      box(g, rail, 19, 16, 4, 2);
    }
  });
}

function delivery(escorted: boolean): Art {
  return framed((g) => {
    box(g, ink, 6, 17, 21, 2);
    box(g, light, 9, 11, 10, 6);
    box(g, blue, 13, 10, 2, 7);
    if (escorted) {
      box(g, leaf, 21, 8, 3, 3);
      box(g, leaf, 20, 11, 5, 5);
    } else {
      box(g, paper, 20, 8, 6, 7);
      box(g, rail, 21, 10, 4);
      box(g, rail, 21, 12, 4);
    }
  });
}

export const MEMORY_CART_ART: Record<string, Art> = {
  'memory-cart.stop': framed((g) => { cart(g, 7, false); box(g, blue, 15, 7, 2, 11); }),
  'memory-cart.wheel': framed((g) => cart(g, 16, true)),
  'memory-cart.strap': framed((g) => {
    box(g, leaf, 5, 6, 22, 12);
    box(g, rail, 6, 15, 20, 4);
    box(g, light, 10, 9, 12, 7);
    box(g, blue, 14, 8, 2, 10);
    box(g, blue, 16, 9, 4);
    box(g, blue, 16, 16, 4);
    box(g, blue, 20, 10, 1, 6);
  }),
  'memory-cart.folder': papers('folder'),
  'memory-cart.closed': papers('closed'),
  'memory-cart.open': papers('open'),
  'memory-cart.note': papers('open'),
  'memory-cart.covered': papers('over'),
  'memory-cart.direct': delivery(false),
  'memory-cart.escort': delivery(true),
};
