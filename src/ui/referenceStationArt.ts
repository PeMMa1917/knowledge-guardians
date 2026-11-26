type Brush = CanvasRenderingContext2D;
type Drawing = (g: Brush) => void;
type Artwork = [width: number, height: number, draw: Drawing];

const ink = '#201f36', blue = '#315068', water = '#5d8ba2', silver = '#c5e8ef', wood = '#936851', cream = '#edd3a0',
  gold = '#dba96b', pale = '#f1e7be', violet = '#86759c', rose = '#bd6960', sea = '#79b3a2';

function dot(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function row(g: Brush, color: string, x: number, y: number, r: number) {
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy));
    dot(g, color, x - half, y + dy, 2 * half + 1);
  }
}

function mark(g: Brush, color: string, x1: number, y1: number, x2: number, y2: number) {
  const distance = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let i = 0; i <= distance; i++) dot(g, color, Math.round(x1 + (x2 - x1) * i / distance), Math.round(y1 + (y2 - y1) * i / distance));
}

function frame(draw: Drawing): Artwork {
  return [32, 24, (g) => {
    dot(g, ink, 2, 2, 28, 21); dot(g, blue, 3, 3, 26, 17); dot(g, water, 3, 3, 26);
    dot(g, water, 3, 4, 1, 16); dot(g, water, 3, 19, 26, 2); dot(g, silver, 4, 19, 24);
    dot(g, pale, 13, 21, 6, 1);
    draw(g);
  }];
}

function globe(g: Brush) {
  row(g, wood, 16, 11, 7); row(g, gold, 16, 10, 6); row(g, cream, 15, 9, 5);
  mark(g, wood, 10, 10, 22, 12); mark(g, wood, 11, 13, 18, 6); mark(g, wood, 13, 15, 20, 8);
  for (const [x, y] of [[12, 10], [15, 8], [17, 12], [18, 8], [20, 11]]) dot(g, silver, x, y);
  dot(g, wood, 14, 17, 4, 2); dot(g, gold, 11, 18, 10);
}

function tube(g: Brush) {
  dot(g, water, 6, 9, 20, 5); dot(g, silver, 8, 9, 16); dot(g, sea, 11, 10, 12, 3);
  dot(g, silver, 19, 7, 5, 2); dot(g, water, 23, 9, 4, 4); dot(g, silver, 25, 10, 2, 2);
  dot(g, ink, 7, 15, 18, 2); dot(g, wood, 11, 14, 12, 2);
}

function horn(g: Brush, color: string) {
  for (let col = 7; col < 22; col++) {
    const bump = Math.floor((col - 7) / 3);
    dot(g, color, col, 11 - bump, 1, 3 + bump * 2);
  }
  dot(g, ink, 20, 8, 2, 8); dot(g, silver, 21, 7, 2, 10);
  dot(g, wood, 12, 15, 4, 3); dot(g, water, 9, 18, 11);
}

function chart(g: Brush, which: 'inside' | 'outside') {
  dot(g, cream, 6, 6, 20, 11);
  for (const y of [9, 13]) dot(g, wood, 8, y, 16);
  const peg = which === 'inside' ? 22 : 9;
  const star = which === 'inside' ? 9 : 22;
  row(g, water, peg, 11, 2); dot(g, silver, peg, 11);
  row(g, gold, 16, 11, 2); dot(g, cream, 17, 10, 2, 3);
  dot(g, violet, star - 1, 11, 3); dot(g, violet, star, 10, 1, 3);
}

function strip(g: Brush, shift: number) {
  dot(g, pale, 6, 7, 20, 10);
  for (const x of [9, 12, 16, 20, 23]) dot(g, water, x, 14, 1, 2);
  dot(g, violet, 16, 8, 1, 7);
  dot(g, rose, 16 + shift, 10, 2, 4);
}

function reading(g: Brush, level: number, hue: string) {
  dot(g, cream, 6, 6, 20, 12);
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 4;
    dot(g, water, x, 14, 3, 1); dot(g, hue, x, 14 - level, 3, level);
  }
}

function page(g: Brush, two: boolean) {
  dot(g, wood, 6, 6, 20, 12); dot(g, pale, 8, 7, two ? 8 : 16, 9);
  if (two) dot(g, cream, 17, 7, 7, 9);
  dot(g, violet, 9, 9, 6); dot(g, water, 9, 12, 5); dot(g, sea, two ? 18 : 10, 14, 5);
  if (two) dot(g, rose, 18, 9, 5);
}

export const REFERENCE_STATION_ART: Record<string, Artwork> = {
  'refstation.case.globe': frame(globe),
  'refstation.case.tube': frame(tube),
  'refstation.case.horn': frame((g) => horn(g, violet)),
  'refstation.globe-out': frame((g) => chart(g, 'outside')),
  'refstation.globe-in': frame((g) => chart(g, 'inside')),
  'refstation.trace-left': frame((g) => strip(g, -4)),
  'refstation.trace-right': frame((g) => strip(g, 4)),
  'refstation.receiver': frame((g) => horn(g, sea)),
  'refstation.blank': frame((g) => reading(g, 1, violet)),
  'refstation.ridge': frame((g) => reading(g, 3, gold)),
  'refstation.sky': frame((g) => reading(g, 3, water)),
  'refstation.draft': frame((g) => { page(g, false); dot(g, rose, 9, 9, 12, 1); }),
  'refstation.local': frame((g) => page(g, false)),
  'refstation.repeat': frame((g) => page(g, true)),
};
