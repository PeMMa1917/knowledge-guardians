/**
 * The Guardian's crest (spec 47.4 "palettes and heraldry: design a crest").
 * A shield shape, two field colours with a division, one charge (a symbol from the
 * game) and a motto from preset phrases (no free text: no student-made content
 * is shown to others). Stored as a short string in a flag. Pure data, no DOM.
 */
export const SHAPES = ['heater', 'round', 'banner', 'kite'] as const;
export const DIVISIONS = ['plain', 'pale', 'fess', 'quarterly', 'chevron', 'bend'] as const;
export const FIELDS: Record<string, string> = {
  gold: 'd9b45a', silver: 'd8dce6', violet: '6b4fb0', teal: '2f8f8a', crimson: 'a83232', forest: '2f6b3a', midnight: '1f2a52', ember: 'd46a2a', rose: 'c9607e', sand: 'c4ad7c',
};
/** Charges are 9 x 9 pixel symbols; '#' is the charge colour. */
export const CHARGES: Record<string, { name: string; rows: string[] }> = {
  lamp: { name: 'Lumen lamp', rows: ['....#....', '...###...', '...#.#...', '..##.##..', '..#...#..', '..##.##..', '...###...', '....#....', '...###...'] },
  key: { name: 'key', rows: ['..###....', '.#...#...', '.#...#...', '..###....', '...#.....', '...###...', '...#.....', '...##....', '.........'] },
  quill: { name: 'quill', rows: ['.......##', '......###', '.....###.', '....###..', '...###...', '..###....', '..##.....', '.#.......', '#........'] },
  scales: { name: 'balance', rows: ['....#....', '#########', '#...#...#', '#...#...#', '###.#.###', '....#....', '....#....', '...###...', '..#####..'] },
  moth: { name: 'Glimmermoth', rows: ['.#.....#.', '..#...#..', '###.#.###', '####.####', '####.####', '.###.###.', '..##.##..', '.........', '.........'] },
  star: { name: 'star', rows: ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'] },
  book: { name: 'open book', rows: ['.........', '##.....##', '#.##.##.#', '#...#...#', '#.#.#.#.#', '#...#...#', '#.#.#.#.#', '####.####', '.........'] },
  tower: { name: 'archive tower', rows: ['#.#.#.#.#', '#########', '.#######.', '.##.#.##.', '.#######.', '.###.###.', '.##...##.', '.##...##.', '#########'] },
  anvil: { name: 'anvil', rows: ['.........', '#######..', '.########', '..######.', '...###...', '...###...', '..#####..', '.#######.', '.........'] },
  wave: { name: 'river', rows: ['.........', '.##...##.', '#..#.#..#', '....#....', '.##...##.', '#..#.#..#', '....#....', '.........', '.........'] },
};
export const MOTTOS = [
  'Ask, then answer', 'Check the date', 'Both sides heard', 'Measure fairly', 'Light the record', 'Say how you know',
  'Patient eyes', 'The same measure for all', 'First, which first?', 'Claim no more than you can carry', 'Questions open doors', 'Keep the thread',
];

export interface Crest { shape: typeof SHAPES[number]; division: typeof DIVISIONS[number]; a: string; b: string; charge: string; ink: string; motto: number }

export const DEFAULT_CREST: Crest = { shape: 'heater', division: 'plain', a: 'violet', b: 'gold', charge: 'lamp', ink: 'gold', motto: 0 };

export function encodeCrest(c: Crest): string {
  return [c.shape, c.division, c.a, c.b, c.charge, c.ink, c.motto].join('.');
}

export function decodeCrest(s: unknown): Crest | null {
  if (typeof s !== 'string' || !s) return null;
  const [shape, division, a, b, charge, ink, motto] = s.split('.');
  const n = Number(motto);
  if (!(SHAPES as readonly string[]).includes(shape) || !(DIVISIONS as readonly string[]).includes(division) || !FIELDS[a] || !FIELDS[b]
    || !CHARGES[charge] || !FIELDS[ink] || !Number.isInteger(n) || n < 0 || n >= MOTTOS.length) return null;
  return { shape: shape as Crest['shape'], division: division as Crest['division'], a, b, charge, ink, motto: n };
}

/** Is a pixel (0..1 coordinates) inside the shield shape? */
export function inShape(shape: Crest['shape'], x: number, y: number): boolean {
  switch (shape) {
    case 'round': return Math.hypot(x - 0.5, y - 0.5) <= 0.5;
    case 'banner': return y <= 0.82 || Math.abs(x - 0.5) > (y - 0.82) * 2.6;
    case 'kite': return y <= 0.35 ? Math.abs(x - 0.5) <= 0.5 * (0.6 + y / 0.875) : Math.abs(x - 0.5) <= 0.5 * (1 - (y - 0.35) / 0.65);
    default: return y <= 0.55 || Math.abs(x - 0.5) <= 0.5 * Math.sqrt(Math.max(0, 1 - ((y - 0.55) / 0.45) ** 2));
  }
}

/** Which field colour (a or b) a pixel gets, by the division. */
export function fieldAt(division: Crest['division'], x: number, y: number): 'a' | 'b' {
  switch (division) {
    case 'pale': return x < 0.5 ? 'a' : 'b';
    case 'fess': return y < 0.5 ? 'a' : 'b';
    case 'quarterly': return (x < 0.5) === (y < 0.5) ? 'a' : 'b';
    case 'chevron': return y > 0.35 + Math.abs(x - 0.5) * 0.9 && y < 0.6 + Math.abs(x - 0.5) * 0.9 ? 'b' : 'a';
    case 'bend': return Math.abs(y - x) < 0.18 ? 'b' : 'a';
    default: return 'a';
  }
}

/** Paint the crest as RGBA pixels, `size` x `size` (with the shape's transparent corners). */
export function crestPixels(c: Crest, size: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(size * size * 4);
  const hex = (h: string) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const A = hex(FIELDS[c.a]), B = hex(FIELDS[c.b]), I = hex(FIELDS[c.ink]), edge = [42, 34, 56];
  const ch = CHARGES[c.charge].rows;
  const cs = Math.floor(size / 15) || 1, cw = 9 * cs, ox = Math.floor((size - cw) / 2), oy = Math.floor(size * 0.36 - cw / 2);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5) / size, v = (y + 0.5) / size;
    if (!inShape(c.shape, u, v)) continue;
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inShape(c.shape, (x + dx + 0.5) / size, (y + dy + 0.5) / size));
    let col = near ? edge : fieldAt(c.division, u, v) === 'a' ? A : B;
    const isInk = (px: number, py: number) => { const gx = Math.floor((px - ox) / cs), gy = Math.floor((py - oy) / cs); return px >= ox && py >= oy && gx < 9 && gy < 9 && ch[gy][gx] === '#'; };
    if (!near && isInk(x, y)) col = I;
    // A thin dark outline around the symbol, so it shows on any field colour.
    else if (!near && [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => isInk(x + dx, y + dy))) col = edge;
    const o = (y * size + x) * 4;
    out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2]; out[o + 3] = 255;
  }
  return out;
}
