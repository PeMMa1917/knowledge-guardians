/** Original teaching silhouettes from the written Polar Store records. All coordinates are whole pixels. */
type Paint = CanvasRenderingContext2D;
type PixelPicture = [width: number, height: number, draw: (g: Paint) => void];

const color = {
  ink: '#211f32', floor: '#283e51', rim: '#55798a', pale: '#b5daec', snow: '#e2eff4',
  oak: '#855843', lightOak: '#ce9963', cloth: '#c9ae8d', note: '#f3e5b2',
  moss: '#5f9987', rust: '#a55951', sun: '#f0b666', indigo: '#465c7d', steel: '#819fae',
};

function px(g: Paint, tone: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = tone;
  g.fillRect(x, y, w, h);
}

function steps(g: Paint, tone: string, from: [number, number], to: [number, number]) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const distance = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= distance; i++) px(g, tone, Math.round(from[0] + dx * i / distance), Math.round(from[1] + dy * i / distance));
}

function disc(g: Paint, tone: string, cx: number, cy: number, r: number) {
  for (let row = -r; row <= r; row++) {
    const half = Math.floor(Math.sqrt(r * r - row * row));
    px(g, tone, cx - half, cy + row, half * 2 + 1);
  }
}

function caseDraw(shape: PixelPicture[2]): PixelPicture {
  return [32, 23, (g) => {
    px(g, color.ink, 2, 2, 28, 20); px(g, color.floor, 3, 2, 26, 16); px(g, color.rim, 3, 2, 26);
    px(g, color.rim, 3, 2, 1, 16); px(g, color.rim, 28, 2, 1, 16);
    px(g, color.indigo, 4, 16, 24, 2); px(g, color.steel, 3, 18, 26, 2);
    px(g, color.pale, 3, 18, 26); px(g, color.note, 13, 20, 6, 2); px(g, color.rust, 15, 21, 3);
    shape(g);
  }];
}

function sledge(g: Paint, raised: boolean) {
  px(g, raised ? color.rust : color.oak, 6, 15, 19, 2);
  steps(g, color.lightOak, [4, 12], [7, 15]); steps(g, color.lightOak, [23, 15], [26, 12]);
  px(g, color.lightOak, 6, 11, 19); px(g, color.cloth, 7, 10, 16);
  for (const x of [7, 11, 15, 19, 23]) px(g, color.oak, x, 11, 1, 4);
  steps(g, color.cloth, [4, 13], [8, 11]);
  if (raised) {
    px(g, color.lightOak, 24, 5, 2, 8); px(g, color.lightOak, 20, 5, 5, 2);
    steps(g, color.oak, [20, 11], [24, 6]); px(g, color.rust, 22, 5);
  }
}

function sole(g: Paint, y = 8) {
  px(g, color.oak, 5, y, 9, 7); px(g, color.oak, 13, y + 2, 6, 4); px(g, color.oak, 18, y + 1, 7, 6);
  px(g, color.lightOak, 6, y + 1, 7, 5); px(g, color.lightOak, 19, y + 2, 5, 4);
  for (const [x, dy] of [[6, 1], [6, 5], [9, 0], [9, 6], [11, 3], [20, 2], [20, 6], [23, 4]]) px(g, color.snow, x, y + dy);
}

function tin(g: Paint, tall: boolean) {
  const [x, y, w, h] = tall ? [11, 4, 11, 13] : [6, 8, 20, 9];
  px(g, color.oak, x, y + 2, w, h - 2); px(g, color.lightOak, x + 2, y, w - 4, 2);
  px(g, color.cloth, x + 1, y + 2, w - 4, h - 3); px(g, tall ? color.note : color.sun, x + 3, y + 4, w - 7, h - 6);
  px(g, color.oak, x + 4, y + 5, w - 10); px(g, color.sun, x + w - 3, y + h - 4, 2, 3);
}

function lenses(g: Paint, green: boolean) {
  const rim = green ? color.cloth : color.oak;
  px(g, rim, 4, 8, 24, 2); px(g, color.steel, 14, 7, 4, 2);
  for (const x of [10, 22]) {
    disc(g, rim, x, 9, green ? 4 : 5);
    disc(g, green ? color.moss : color.indigo, x, 9, 3);
    px(g, color.pale, x - 1, 7, 2);
  }
  if (green) {
    for (const x of [5, 26]) px(g, color.steel, x, 9, 1, 3);
  } else {
    disc(g, '#5b6872', 11, 16, 2); disc(g, '#889da2', 16, 16, 2); disc(g, color.pale, 21, 16, 2);
  }
}

function spider(g: Paint, offset: number) {
  // Shape sketch only. It is deliberately unscaled and leaves identifying anatomy to the catalogue.
  px(g, color.cloth, 14, 7, 3, 8);
  px(g, color.lightOak, 15, 8, 1, 7);
  for (let i = 0; i < 4; i++) {
    const y = 8 + i;
    const spread = (i * 3) - 5;
    steps(g, color.lightOak, [14, y], [10 + offset, y + spread / 2]);
    steps(g, color.lightOak, [17, y], [21 - offset, y + spread / 2]);
    steps(g, color.cloth, [10 + offset, y + spread / 2], [7, y + spread]);
    steps(g, color.cloth, [21 - offset, y + spread / 2], [25, y + spread]);
  }
}

const cases: Record<string, PixelPicture[2]> = {
  cargo: (g) => sledge(g, true), dog: (g) => sledge(g, false), crampon: (g) => sole(g),
  tent: (g) => {
    px(g, color.oak, 8, 13, 16, 4); px(g, color.lightOak, 10, 10, 12, 3); px(g, color.cloth, 12, 7, 8, 3);
    px(g, color.cloth, 12, 6, 8, 2); px(g, color.note, 13, 6, 6);
    steps(g, color.ink, [13, 8], [11, 15]); steps(g, color.ink, [18, 8], [21, 15]);
  },
  bag: (g) => {
    px(g, color.oak, 9, 8, 13, 9); px(g, color.cloth, 10, 5, 11, 7); px(g, color.note, 12, 5, 7);
    px(g, color.lightOak, 10, 12, 11, 4); px(g, color.indigo, 13, 8, 2, 2);
    for (const x of [11, 13, 15, 17, 19]) px(g, color.note, x, 12);
    steps(g, color.cloth, [21, 7], [24, 11]); px(g, color.rust, 23, 12, 3, 4);
  },
  chocolate: (g) => tin(g, false), cocoa: (g) => tin(g, true),
  pemmican: (g) => {
    px(g, color.steel, 12, 5, 9); px(g, color.snow, 11, 6, 11, 2); px(g, color.rust, 11, 8, 11, 8);
    px(g, color.moss, 12, 10, 9, 4); px(g, color.sun, 13, 11, 7, 2); px(g, color.indigo, 11, 16, 11);
  },
  goggles: (g) => lenses(g, false), green: (g) => lenses(g, true),
  thermometer: (g) => {
    px(g, color.oak, 5, 7, 22, 7); px(g, color.lightOak, 6, 7, 20, 2); px(g, color.pale, 7, 10, 17);
    disc(g, color.steel, 24, 10, 2);
    for (const x of [9, 14, 20]) px(g, color.floor, x, 8, 1, 5);
  },
  candle: (g) => {
    px(g, color.steel, 10, 9, 12, 7); px(g, color.cloth, 12, 7, 8, 3); px(g, color.ink, 10, 16, 12);
    px(g, color.rim, 11, 12, 10, 3); disc(g, color.ink, 16, 9, 2);
    for (const [x, y] of [[11, 12], [12, 10], [16, 13], [20, 14], [19, 9]]) px(g, color.rust, x, y);
  },
  sextant: (g) => {
    steps(g, color.sun, [8, 14], [15, 5]); steps(g, color.sun, [15, 5], [23, 14]);
    steps(g, color.sun, [8, 14], [14, 17]); steps(g, color.sun, [14, 17], [23, 14]);
    steps(g, color.lightOak, [15, 5], [16, 15]); px(g, color.pale, 12, 6, 3, 2); px(g, color.steel, 18, 9, 3, 2);
  },
  watch: (g) => {
    disc(g, color.steel, 16, 11, 6); disc(g, color.snow, 16, 11, 5);
    disc(g, color.indigo, 16, 14, 2); px(g, color.pale, 16, 14);
    steps(g, color.indigo, [16, 11], [17, 8]); steps(g, color.indigo, [16, 11], [13, 10]);
    px(g, color.cloth, 15, 5, 3, 1); disc(g, color.steel, 16, 4, 2); px(g, color.floor, 16, 3);
  },
  drawing: (g) => {
    px(g, color.oak, 5, 5, 22, 12); px(g, color.lightOak, 6, 5, 20); px(g, color.indigo, 6, 7, 20, 9);
    steps(g, color.pale, [13, 8], [8, 12]); steps(g, color.pale, [13, 8], [17, 12]);
    steps(g, color.steel, [22, 8], [20, 12]); steps(g, color.steel, [22, 8], [24, 12]);
    for (const y of [14, 16]) px(g, color.cloth, 9, y, 14);
  },
  notebook: (g) => {
    px(g, color.oak, 9, 5, 14, 12); px(g, color.ink, 9, 5, 2, 12); px(g, color.note, 13, 8, 7, 4);
    px(g, color.cloth, 11, 16, 12); px(g, color.lightOak, 22, 6, 1, 10);
  },
  austroraptus: (g) => spider(g, 0), achelia: (g) => spider(g, 2),
};

function upright(g: Paint, height?: 'low' | 'high') {
  px(g, color.ink, 2, 20, 28, 2); px(g, color.lightOak, 4, 8, 24, 2);
  px(g, color.oak, 4, 10, 2, 10); px(g, color.oak, 26, 10, 2, 10);
  px(g, color.note, 11, 19, 10, 1);
  if (!height) return;
  const top = height === 'high' ? 7 : 16;
  px(g, color.steel, 12, top, 9, 2); px(g, color.rim, 13, top + 2, 1, 17 - top);
  px(g, color.rim, 19, top + 2, 1, 17 - top);
  if (height === 'high') px(g, color.rust, 20, 8, 4, 2);
}

function parcels(g: Paint, delivered = false) {
  px(g, color.oak, 4, 18, 24, 3); px(g, color.lightOak, 4, 18, 24);
  for (const x of [6, 18]) {
    px(g, color.ink, x - 1, 9, 10, 9); px(g, color.cloth, x, 10, 8, 7);
    px(g, color.oak, x + 3, 10, 1, 7); px(g, delivered ? color.moss : color.note, x + 4, 13, 3, 2);
  }
}

function sleeve(g: Paint, open = false) {
  px(g, color.ink, 6, 8, 20, 12); px(g, color.oak, 7, 8, 18, 11);
  px(g, color.lightOak, 8, 8, 16, 3); px(g, color.cloth, 8, 11, 16, 7);
  if (open) {
    px(g, color.note, 10, 5, 12, 12); px(g, color.moss, 11, 7, 3, 3); px(g, color.indigo, 17, 7, 3, 3);
    px(g, color.oak, 11, 12, 9); px(g, color.oak, 11, 14, 7);
  } else px(g, color.rust, 14, 13, 4, 3);
}

function filter(g: Paint, tint: string, view: 'pale' | 'dark' | 'neutral') {
  px(g, color.ink, 6, 4, 20, 17); px(g, color.lightOak, 7, 5, 18, 15);
  px(g, tint, 8, 6, 16, 13); steps(g, color.snow, [10, 15], [21, 12]);
  if (view === 'dark') return;
  px(g, color.note, 9, 7, 6, 3); px(g, color.rust, 10, 8, 4);
  if (view === 'pale') px(g, color.sun, 16, 7, 3, 12);
}

function hatch(g: Paint, variant: 'raised' | 'low' | 'high') {
  const y = variant === 'low' ? 10 : 3;
  px(g, color.floor, 5, y, 22, 20 - y); px(g, color.steel, 5, y, 22, 2);
  px(g, color.rim, 5, y + 2, 3, 19 - y); px(g, color.rim, 24, y + 2, 3, 19 - y);
  px(g, color.sun, 6, y + 4, 1, 2); px(g, color.sun, 25, y + 4, 1, 2);
  if (variant === 'raised') {
    for (const x of [10, 15, 20]) px(g, color.steel, x, 7, 2, 13);
    px(g, color.rim, 8, 13, 16, 2);
  } else px(g, color.pale, 8, 20, 16, 1);
}

const objects: Record<string, PixelPicture[2]> = {
  'frame-empty': (g) => upright(g), 'frame-low': (g) => upright(g, 'low'), 'frame-high': (g) => upright(g, 'high'),
  'raised': (g) => hatch(g, 'raised'), 'open-low': (g) => hatch(g, 'low'), 'open-high': (g) => hatch(g, 'high'),
  door: (g) => hatch(g, 'high'),
  parcels: (g) => parcels(g), 'parcels-delivered': (g) => parcels(g, true),
  sleeve: (g) => sleeve(g), 'sleeve-open': (g) => sleeve(g, true),
  'filter-neutral': (g) => filter(g, color.indigo, 'neutral'),
  'filter-pale': (g) => filter(g, color.steel, 'pale'),
  'filter-dark': (g) => filter(g, color.floor, 'dark'),
  sole: (g) => sole(g, 9),
  impressions: (g) => { sole(g, 5); px(g, color.cloth, 5, 14, 20, 5); px(g, color.oak, 7, 16, 16); },
  card: (g) => { px(g, color.oak, 6, 5, 20, 16); px(g, color.note, 8, 6, 16, 13); px(g, color.indigo, 10, 9, 12, 2); px(g, color.oak, 10, 13, 8); },
  shelf: (g) => {
    px(g, color.ink, 4, 5, 24, 16); px(g, color.lightOak, 5, 12, 22, 2); px(g, color.lightOak, 5, 18, 22, 2);
    px(g, color.oak, 5, 5, 2, 15); px(g, color.oak, 25, 5, 2, 15); px(g, color.cloth, 10, 8, 9, 4);
  },
  band: (g) => { px(g, color.oak, 4, 5, 24, 16); px(g, color.note, 6, 6, 20, 13); steps(g, color.moss, [7, 17], [22, 8]); steps(g, color.moss, [11, 17], [24, 8]); },
  ledger: (g) => {
    px(g, color.oak, 4, 6, 24, 14); px(g, color.note, 6, 6, 10, 12); px(g, color.cloth, 17, 6, 9, 12);
    px(g, color.rim, 7, 10, 7, 1); px(g, color.rim, 7, 13, 7, 1); px(g, color.snow, 19, 8, 4, 8);
  },
  'sample-pair': (g) => drawers(g), 'sample-bridge': (g) => drawers(g, true),
};

function drawers(g: Paint, joined = false) {
  for (const x of [5, 18]) {
    px(g, color.oak, x, 11, 9, 8); px(g, color.steel, x, 10, 9, 2); px(g, color.note, x + 2, 13, 5, 3);
  }
  if (joined) {
    px(g, color.moss, 9, 8, 14, 1); px(g, color.moss, 9, 8, 1, 3); px(g, color.moss, 22, 8, 1, 3);
    px(g, color.note, 13, 7, 6, 3);
  }
}

export const POLAR_ART: Record<string, PixelPicture> = {
  ...Object.fromEntries(Object.entries(cases).map(([id, picture]) => [`polar.case.${id}`, caseDraw(picture)])),
  ...Object.fromEntries(Object.entries(objects).map(([id, picture]) => [`polar.${id}`, [32, 23, picture] as PixelPicture])),
};
