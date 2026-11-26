/**
 * Original procedural pixel art, drawn in code (no external files).
 * Used for exhibits, icons, the fairy guide and inspection pictures.
 *
 * Historical objects here are SIMPLIFIED ORIGINAL drawings based on the
 * written records (spec 21.1). They are not copies of museum photographs.
 * Each picture has a text description in the content data (altText).
 */
type Ctx = CanvasRenderingContext2D;

function canvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g];
}
const R = (g: Ctx, col: string, x: number, y: number, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

function pedestal(g: Ctx, x: number, y: number, w: number) {
  R(g, '#2a2440', x, y + 8, w, 1);
  R(g, '#cfc9e0', x, y, w, 2); R(g, '#9d96b8', x + 1, y + 2, w - 2, 6); R(g, '#7b7499', x + 1, y + 7, w - 2, 1);
  R(g, '#e9e5f5', x + 1, y, w - 2, 1);
  R(g, '#b7b0cf', x + 2, y + 3, 1, 4);
}

const DRAW: Record<string, [number, number, (g: Ctx) => void]> = {
  'pedestal.patent': [16, 24, (g) => {
    pedestal(g, 2, 14, 12);
    R(g, '#3b3355', 3, 4, 10, 11); R(g, '#f4ecd2', 4, 3, 8, 11); R(g, '#d9cfae', 4, 13, 8, 1);
    for (let i = 0; i < 4; i++) R(g, '#8a7f66', 5, 5 + i * 2, 6, 1);
    R(g, '#3a3a5a', 6, 6, 1, 5); R(g, '#3a3a5a', 5, 11, 3, 1); R(g, '#7a3d2a', 10, 11, 1, 1);
  }],
  'pedestal.model': [32, 24, (g) => {
    pedestal(g, 4, 14, 24);
    R(g, '#5b3b22', 8, 9, 14, 3); R(g, '#8a5a30', 8, 9, 14, 1); R(g, '#c9a24a', 22, 9, 3, 3); R(g, '#f2d27a', 22, 9, 3, 1);
    R(g, '#9aa3b5', 25, 10, 2, 2); R(g, '#e8edf5', 25, 10, 1, 1); R(g, '#3b3355', 8, 12, 17, 1);
    R(g, '#c9a24a', 12, 8, 2, 1);
  }],
  'pedestal.biro': [16, 24, (g) => {
    pedestal(g, 2, 14, 12);
    R(g, 'rgba(140,220,255,0.25)', 3, 2, 10, 12); R(g, 'rgba(190,240,255,0.35)', 4, 3, 8, 10);
    R(g, '#1d2b45', 5, 7, 7, 2); R(g, '#33507a', 5, 7, 7, 1); R(g, '#c9d4e0', 12, 7, 1, 2); R(g, '#ffffff', 13, 8, 1, 1);
    R(g, '#9fe8ff', 4, 2, 1, 1); R(g, '#9fe8ff', 11, 12, 1, 1);
  }],
  'board': [32, 16, (g) => {
    R(g, '#4a3020', 0, 0, 32, 16); R(g, '#b07a48', 1, 1, 30, 14); R(g, '#c48c55', 1, 1, 30, 1);
    const cards: [number, number, string][] = [[3, 3, '#f4ecd2'], [11, 2, '#d8ecff'], [20, 4, '#f4ecd2'], [6, 9, '#ffe3b0'], [16, 9, '#e2f5d8'], [25, 9, '#f4ecd2']];
    for (const [x, y, c] of cards) { R(g, c, x, y, 6, 5); R(g, '#c0392b', x + 2, y, 1, 1); R(g, '#8a7f66', x + 1, y + 2, 4, 1); }
    R(g, '#c0392b', 9, 6, 7, 1); R(g, '#c0392b', 15, 7, 6, 1);
  }],
  'board-stand': [16, 24, (g) => {
    R(g, '#4a3020', 2, 14, 2, 10); R(g, '#4a3020', 12, 14, 2, 10);
    R(g, '#4a3020', 0, 2, 16, 13); R(g, '#b07a48', 1, 3, 14, 11);
    R(g, '#f4ecd2', 3, 5, 4, 4); R(g, '#d8ecff', 9, 4, 4, 5); R(g, '#f4ecd2', 5, 10, 6, 3);
  }],
  'signpost': [16, 16, (g) => {
    R(g, '#4a3020', 7, 6, 2, 10); R(g, '#8a5a30', 1, 1, 14, 6); R(g, '#b07a48', 2, 2, 12, 4); R(g, '#5b3b22', 4, 3, 8, 1); R(g, '#5b3b22', 4, 5, 6, 1);
  }],
  'blade-on-counter': [48, 16, (g) => {
    R(g, '#5a2a52', 10, 7, 28, 6); R(g, '#7d3b73', 10, 7, 28, 1);
    R(g, '#3b2a1a', 12, 9, 6, 2); R(g, '#c9a24a', 18, 8, 1, 4);
    R(g, '#8d97a8', 19, 9, 16, 2); R(g, '#d6dde8', 19, 9, 16, 1); R(g, '#d6dde8', 35, 9, 1, 1);
    for (let i = 0; i < 16; i += 3) R(g, '#5f6878', 20 + i, 10, 1, 1);
  }],
  'catalogue': [48, 32, (g) => {
    R(g, '#2a2440', 15, 9, 20, 13); R(g, '#f4ecd2', 16, 8, 9, 12); R(g, '#efe4c4', 25, 8, 9, 12); R(g, '#b9ab86', 25, 8, 1, 12);
    for (let i = 0; i < 4; i++) R(g, '#3d3a3a', 18 + (i % 2) * 3, 10 + Math.floor(i / 2) * 3, 2, 2);
    for (let i = 0; i < 4; i++) R(g, '#8a7f66', 27, 10 + i * 2, 6, 1);
  }],
  'assay': [32, 32, (g) => {
    R(g, '#2a2440', 9, 13, 14, 8); R(g, '#cfd6e2', 10, 12, 12, 7);
    for (let y = 0; y < 7; y++) R(g, y % 2 ? '#7a8496' : '#aab3c4', 10, 12 + y, 12, 1);
    R(g, '#ffffff', 11, 12, 3, 1);
  }],
  'anvil': [48, 32, (g) => {
    R(g, '#26262e', 31, 6, 12, 3); R(g, '#3d3d4a', 33, 9, 8, 3); R(g, '#26262e', 31, 12, 12, 2); R(g, '#6a6a7a', 31, 6, 12, 1);
    R(g, '#f4ecd2', 4, 6, 5, 6); R(g, '#f4ecd2', 11, 5, 5, 6); R(g, '#ffe3b0', 18, 7, 5, 6); R(g, '#d8ecff', 24, 6, 5, 6);
  }],
  'portal-ring': [32, 32, (g) => {
    for (let a = 0; a < 64; a++) {
      const t = (a / 64) * Math.PI * 2;
      const x = Math.round(16 + Math.cos(t) * 13), y = Math.round(16 + Math.sin(t) * 13);
      R(g, a % 8 < 4 ? '#9fe8ff' : '#e0d0ff', x, y, 1, 1);
    }
    for (let a = 0; a < 6; a++) {
      const t = (a / 6) * Math.PI * 2;
      R(g, '#ffffff', Math.round(16 + Math.cos(t) * 9), Math.round(16 + Math.sin(t) * 9), 1, 1);
    }
  }],
  'portal-stone': [32, 32, (g) => {
    R(g, '#2a2b35', 8, 28, 16, 2);
    R(g, '#6e6e82', 10, 4, 12, 25); R(g, '#8c8ca2', 11, 3, 10, 2); R(g, '#9d9db4', 11, 5, 2, 20); R(g, '#55556a', 20, 5, 2, 23);
    R(g, '#9fe8ff', 15, 9, 2, 1); R(g, '#9fe8ff', 14, 10, 1, 4); R(g, '#9fe8ff', 17, 10, 1, 4); R(g, '#9fe8ff', 15, 14, 2, 1); R(g, '#e0faff', 15, 11, 2, 2);
  }],
  'lumen': [9, 9, (g) => {
    R(g, 'rgba(220,240,255,0.55)', 0, 2, 3, 3); R(g, 'rgba(220,240,255,0.55)', 6, 2, 3, 3);
    R(g, '#fff6c8', 3, 3, 3, 3); R(g, '#ffffff', 4, 3, 1, 1); R(g, '#ffd86b', 3, 5, 3, 1); R(g, '#ffe9a0', 4, 6, 1, 2);
  }],
  // Lumen's other forms (customisation), 9 x 9 like the fairy.
  'lumen.moth': [9, 9, (g) => {
    R(g, 'rgba(225,210,255,0.8)', 0, 1, 3, 4); R(g, 'rgba(225,210,255,0.8)', 6, 1, 3, 4); R(g, 'rgba(200,180,250,0.7)', 1, 5, 2, 2); R(g, 'rgba(200,180,250,0.7)', 6, 5, 2, 2);
    R(g, '#c39bff', 1, 2, 1, 1); R(g, '#c39bff', 7, 2, 1, 1);
    R(g, '#fff6c8', 4, 2, 1, 5); R(g, '#ffffff', 4, 2, 1, 1); R(g, '#e9cf7a', 3, 0, 1, 2); R(g, '#e9cf7a', 5, 0, 1, 2);
  }],
  'lumen.star': [9, 9, (g) => {
    R(g, '#ffe9a0', 4, 0, 1, 9); R(g, '#ffe9a0', 0, 4, 9, 1); R(g, '#fff6c8', 3, 2, 3, 5); R(g, '#fff6c8', 2, 3, 5, 3); R(g, '#ffffff', 4, 3, 1, 3); R(g, '#ffffff', 3, 4, 3, 1);
  }],
  'lumen.wisp': [9, 9, (g) => {
    R(g, 'rgba(180,240,255,0.7)', 4, 0, 1, 2); R(g, 'rgba(180,240,255,0.85)', 3, 2, 3, 2); R(g, '#e0faff', 2, 4, 5, 3); R(g, '#ffffff', 3, 4, 3, 2); R(g, 'rgba(180,240,255,0.8)', 3, 7, 3, 1);
    R(g, '#2a6a8a', 3, 5, 1, 1); R(g, '#2a6a8a', 5, 5, 1, 1);
  }],
  'lumen.firefly': [9, 9, (g) => {
    R(g, 'rgba(220,240,255,0.6)', 1, 1, 3, 2); R(g, 'rgba(220,240,255,0.6)', 5, 1, 3, 2);
    R(g, '#3b2f25', 3, 2, 3, 3); R(g, '#c0392b', 4, 1, 1, 1); R(g, '#efffa0', 3, 5, 3, 3); R(g, '#ffffff', 4, 6, 1, 1);
  }],
  'spark': [2, 2, (g) => R(g, '#ffffff', 0, 0, 2, 2)],
  'shadow': [14, 5, (g) => { R(g, 'rgba(20,16,40,0.35)', 2, 0, 10, 5); R(g, 'rgba(20,16,40,0.35)', 0, 1, 14, 3); }],
  'star': [1, 1, (g) => R(g, '#ffffff', 0, 0, 1, 1)],
  // Icons (16x16)
  'icon.journal': [16, 16, (g) => { R(g, '#5a2a52', 3, 2, 10, 12); R(g, '#7d3b73', 3, 2, 10, 1); R(g, '#f4ecd2', 12, 3, 1, 10); R(g, '#c9a24a', 6, 6, 4, 2); }],
  'icon.lens': [16, 16, (g) => { R(g, '#c9a24a', 3, 3, 7, 7); R(g, '#9fe8ff', 4, 4, 5, 5); R(g, '#e0faff', 5, 5, 2, 2); R(g, '#5b3b22', 9, 9, 2, 2); R(g, '#5b3b22', 11, 11, 3, 3); }],
  'icon.pen': [16, 16, (g) => { for (let i = 0; i < 9; i++) R(g, '#33507a', 3 + i, 12 - i, 2, 2); R(g, '#c9d4e0', 12, 2, 2, 2); R(g, '#ffffff', 13, 2, 1, 1); }],
  'icon.letter': [16, 16, (g) => { R(g, '#f4ecd2', 2, 4, 12, 9); R(g, '#b9ab86', 2, 4, 12, 1); for (let i = 0; i < 6; i++) R(g, '#b9ab86', 2 + i, 4 + i, 1, 1), R(g, '#b9ab86', 13 - i, 4 + i, 1, 1); R(g, '#c0392b', 7, 9, 2, 2); }],
  'icon.book': [16, 16, (g) => { R(g, '#2c4e8a', 3, 2, 10, 12); R(g, '#3f6fc4', 3, 2, 10, 1); R(g, '#f4ecd2', 12, 3, 1, 10); R(g, '#e0b450', 6, 5, 4, 1); }],
  'icon.card': [16, 16, (g) => { R(g, '#f4ecd2', 3, 3, 10, 10); R(g, '#c0392b', 7, 3, 2, 1); R(g, '#8a7f66', 5, 6, 6, 1); R(g, '#8a7f66', 5, 8, 4, 1); R(g, '#8a7f66', 5, 10, 5, 1); }],
  'label-stand': [16, 24, (g) => {
    R(g, '#4a3020', 7, 12, 2, 11); R(g, '#2a2440', 4, 22, 8, 2);
    R(g, '#c9a24a', 1, 2, 14, 11); R(g, '#f4ecd2', 2, 3, 12, 9);
    R(g, '#3a3a5a', 3, 5, 10, 1); R(g, '#3a3a5a', 3, 7, 7, 1); R(g, '#3a3a5a', 3, 9, 9, 1);
  }],
  'title-lock': [16, 24, (g) => {
    R(g, '#2a2440', 3, 22, 10, 2); R(g, '#4a3020', 6, 15, 4, 7);
    R(g, '#8a6a2a', 2, 3, 12, 12); R(g, '#c9a24a', 3, 4, 10, 10);
    R(g, '#e9cf7a', 4, 5, 8, 2); R(g, '#7a5a1a', 4, 8, 8, 2); R(g, '#e9cf7a', 4, 11, 8, 2);
    R(g, '#3b2a1a', 7, 1, 2, 3); R(g, '#3b2a1a', 6, 0, 4, 1); R(g, '#2a1a0a', 7, 8, 2, 2);
  }],
  'alcove': [16, 24, (g) => {
    // A stone arch with a plinth and two small lamps (original art).
    R(g, '#2a2440', 1, 22, 14, 2); R(g, '#6e6a86', 1, 3, 14, 19); R(g, '#8c88a6', 2, 2, 12, 2); R(g, '#3a3352', 4, 6, 8, 13);
    R(g, '#4a4466', 5, 5, 6, 1); R(g, '#9d99b8', 5, 16, 6, 5); R(g, '#b4b0cc', 5, 16, 6, 1);
    R(g, '#e9cf7a', 2, 8, 1, 2); R(g, '#e9cf7a', 13, 8, 1, 2); R(g, '#fff2b0', 2, 7, 1, 1); R(g, '#fff2b0', 13, 7, 1, 1);
  }],
  'notice-board': [16, 24, (g) => {
    R(g, '#2a2440', 2, 22, 12, 2); R(g, '#5b3b22', 3, 12, 2, 10); R(g, '#5b3b22', 11, 12, 2, 10);
    R(g, '#4a3020', 0, 1, 16, 13); R(g, '#8a5a30', 1, 2, 14, 11);
    R(g, '#f4ecd2', 2, 3, 5, 6); R(g, '#efe4c4', 9, 4, 5, 7); R(g, '#8a7f66', 3, 5, 3, 1); R(g, '#8a7f66', 3, 7, 2, 1); R(g, '#8a7f66', 10, 6, 3, 1); R(g, '#8a7f66', 10, 8, 3, 1);
    R(g, '#c43c3c', 4, 3, 1, 1); R(g, '#c43c3c', 11, 4, 1, 1); R(g, '#e9cf7a', 7, 11, 2, 1);
  }],
  'bridge-post': [16, 24, (g) => {
    R(g, '#2a2440', 3, 22, 10, 2); R(g, '#5b3b22', 6, 4, 4, 18); R(g, '#8a6448', 7, 4, 1, 18); R(g, '#3b2a1a', 5, 3, 6, 2);
    for (let i = 0; i < 6; i++) R(g, i % 2 ? '#e9cf7a' : '#c9a24a', 1 + i * 2, 10 + (i % 2), 2, 1);
    R(g, '#e9cf7a', 10, 8, 4, 1); R(g, '#c9a24a', 12, 9, 3, 1);
  }],
  'plaque': [16, 24, (g) => {
    R(g, '#2a2440', 3, 22, 10, 2); R(g, '#5b3b22', 6, 14, 4, 8);
    R(g, '#8a6a2a', 1, 1, 14, 14); R(g, '#c9a24a', 2, 2, 12, 12); R(g, '#e9cf7a', 2, 2, 12, 1);
    R(g, '#5b4a1a', 4, 5, 8, 1); R(g, '#5b4a1a', 4, 8, 6, 1); R(g, '#5b4a1a', 4, 11, 7, 1);
  }],
  'waystone': [16, 24, (g) => {
    R(g, '#2a2b35', 2, 22, 12, 2);
    R(g, '#6e6e82', 4, 4, 8, 19); R(g, '#8c8ca2', 5, 3, 6, 2); R(g, '#9d9db4', 5, 5, 1, 16); R(g, '#55556a', 11, 5, 1, 17);
    R(g, '#9fe8ff', 7, 8, 2, 1); R(g, '#9fe8ff', 6, 9, 1, 3); R(g, '#9fe8ff', 9, 9, 1, 3); R(g, '#9fe8ff', 7, 12, 2, 1); R(g, '#e0faff', 7, 10, 2, 2);
  }],
  'ledger': [16, 24, (g) => {
    R(g, '#2a2440', 3, 22, 10, 2); R(g, '#5b3b22', 7, 12, 2, 10);
    R(g, '#5b3b22', 0, 8, 16, 5); R(g, '#f4ecd2', 1, 6, 7, 5); R(g, '#efe4c4', 8, 6, 7, 5); R(g, '#b9ab86', 8, 6, 1, 5);
    R(g, '#8a7f66', 2, 7, 5, 1); R(g, '#8a7f66', 2, 9, 4, 1); R(g, '#8a7f66', 10, 7, 4, 1); R(g, '#8a7f66', 10, 9, 3, 1);
  }],
  'old-sign': [16, 16, (g) => {
    R(g, '#4a3020', 2, 2, 12, 12); R(g, '#8a5a30', 3, 3, 10, 10); R(g, '#5b3b22', 4, 5, 8, 1); R(g, '#5b3b22', 4, 8, 6, 1);
    R(g, '#3b2a1a', 5, 4, 5, 6); R(g, '#e9cf7a', 11, 11, 1, 1);
  }],
  'icon.thread': [16, 16, (g) => { R(g, '#c9a24a', 2, 12, 2, 2); R(g, '#c9a24a', 12, 2, 2, 2); for (let i = 0; i < 10; i++) R(g, '#e9cf7a', 3 + i, 12 - i + Math.round(Math.sin(i) * 1), 1, 1); R(g, '#3b2a1a', 10, 4, 3, 1); }],
  'icon.seal': [16, 16, (g) => { R(g, '#8a6a2a', 4, 4, 8, 8); R(g, '#c9a24a', 5, 3, 6, 10); R(g, '#c9a24a', 3, 5, 10, 6); R(g, '#e9cf7a', 6, 5, 2, 2); R(g, '#5b4a1a', 7, 7, 2, 2); }],
  'icon.blade': [16, 16, (g) => { for (let i = 0; i < 9; i++) R(g, '#aab3c4', 5 + i, 10 - i, 2, 1); R(g, '#5f6878', 6, 9, 1, 1); R(g, '#c9a24a', 3, 10, 4, 1); R(g, '#3b2a1a', 2, 11, 2, 3); }],
  'icon.tea': [16, 16, (g) => { R(g, '#e8e2d0', 4, 6, 7, 6); R(g, '#a4462a', 5, 7, 5, 2); R(g, '#e8e2d0', 11, 7, 2, 3); R(g, 'rgba(255,255,255,0.6)', 6, 3, 1, 2); R(g, 'rgba(255,255,255,0.6)', 8, 2, 1, 3); }],
  // Large inspection pictures (96x64)
  'big.patent': [96, 64, (g) => {
    R(g, '#2a2440', 0, 0, 96, 64); R(g, '#f4ecd2', 14, 4, 68, 56); R(g, '#e6dbbb', 14, 58, 68, 2);
    R(g, '#3a3a5a', 24, 14, 4, 30); R(g, '#3a3a5a', 22, 44, 8, 2); R(g, '#3a3a5a', 25, 46, 2, 2); R(g, '#7a3d2a', 25, 48, 2, 2);
    R(g, '#3a3a5a', 28, 16, 10, 1); R(g, '#3a3a5a', 28, 30, 10, 1);
    for (let i = 0; i < 10; i++) R(g, '#8a7f66', 44, 12 + i * 4, 30 - (i % 3) * 4, 1);
    R(g, '#5b5b80', 20, 8, 20, 1); R(g, '#5b5b80', 56, 52, 18, 1);
  }],
  'big.model': [96, 64, (g) => {
    R(g, '#2a2440', 0, 0, 96, 64);
    R(g, '#5b3b22', 14, 26, 50, 10); R(g, '#8a5a30', 14, 26, 50, 3); R(g, '#3b2a1a', 14, 35, 50, 1);
    R(g, '#c9a24a', 64, 25, 10, 12); R(g, '#f2d27a', 64, 25, 10, 2);
    R(g, '#9aa3b5', 74, 28, 7, 6); R(g, '#e8edf5', 75, 29, 3, 2);
    R(g, '#c9a24a', 30, 22, 8, 4); R(g, '#7b7499', 10, 44, 76, 3); R(g, '#9fe8ff', 6, 6, 18, 2);
  }],
  'big.biro': [96, 64, (g) => {
    R(g, '#14203a', 0, 0, 96, 64); R(g, 'rgba(140,220,255,0.18)', 8, 8, 80, 48);
    R(g, '#1d2b45', 14, 29, 58, 7); R(g, '#33507a', 14, 29, 58, 2); R(g, '#0f1828', 14, 35, 58, 1);
    R(g, '#c9d4e0', 72, 30, 8, 5); R(g, '#ffffff', 80, 32, 3, 2);
    R(g, '#c9d4e0', 22, 27, 18, 2);
    for (let i = 0; i < 12; i++) R(g, 'rgba(190,240,255,0.5)', 10 + i * 7, 12 + (i % 2) * 40, 2, 1);
  }],
  'big.blade': [96, 64, (g) => {
    R(g, '#2a1d30', 0, 0, 96, 64); R(g, '#5a2a52', 6, 20, 84, 26);
    R(g, '#3b2a1a', 10, 30, 16, 6); R(g, '#c9a24a', 26, 26, 3, 14);
    R(g, '#8d97a8', 29, 29, 54, 8); R(g, '#d6dde8', 29, 29, 54, 2); R(g, '#d6dde8', 83, 31, 3, 3);
    for (let x = 0; x < 54; x++) { const y = 32 + Math.round(Math.sin(x / 3) * 2); R(g, '#5f6878', 29 + x, y, 1, 1); R(g, '#b4bccb', 29 + x, y + 2 > 36 ? 36 : y + 2, 1, 1); }
  }],
  'big.ingots': [96, 64, (g) => {
    R(g, '#f4ecd2', 0, 0, 96, 64); R(g, '#e6dbbb', 0, 60, 96, 4);
    for (let i = 0; i < 10; i++) {
      const x = 10 + (i % 5) * 13, y = 14 + Math.floor(i / 5) * 18;
      R(g, '#3d3a3a', x, y + 2, 10, 6); R(g, '#3d3a3a', x + 2, y, 6, 10); R(g, '#5a5555', x + 2, y + 1, 4, 2);
    }
    R(g, '#a08060', 76, 18, 14, 22); R(g, '#7a5f45', 76, 18, 14, 3); R(g, '#7a5f45', 81, 14, 4, 5);
    R(g, '#8a7f66', 10, 52, 50, 1); R(g, '#8a7f66', 10, 56, 34, 1);
  }],
  'big.earth': [96, 64, (g) => {
    R(g, '#1e3a5a', 0, 0, 96, 64); R(g, '#f2d27a', 70, 6, 12, 12); R(g, '#fff2b0', 73, 9, 6, 6);
    R(g, '#c9a24a', 0, 48, 96, 16);
    R(g, '#8a7f66', 20, 22, 3, 26); R(g, '#8a7f66', 60, 22, 3, 26); R(g, '#5b4a1a', 63, 47, 10, 1);
    for (let i = 0; i < 12; i++) R(g, '#f4ecd2', 72 - i * 3, 18 + i * 2, 1, 1);
  }],
  'big.optics': [96, 64, (g) => {
    R(g, '#1a1426', 0, 0, 96, 64); R(g, '#3a2a1a', 10, 10, 20, 44); R(g, '#f2d27a', 28, 30, 3, 3);
    for (let i = 0; i < 40; i++) { R(g, '#f2d27a', 31 + i, 31 - Math.round(i / 3), 1, 1); R(g, '#f2d27a', 31 + i, 32 + Math.round(i / 3), 1, 1); }
    R(g, '#f4ecd2', 72, 14, 14, 36); R(g, '#c9a24a', 76, 22, 6, 4);
  }],
  'big.type': [96, 64, (g) => {
    R(g, '#2a1d14', 0, 0, 96, 64);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) {
      R(g, '#b07a48', 10 + x * 10, 8 + y * 12, 8, 9); R(g, '#5b3b22', 12 + x * 10, 10 + y * 12, 4, 1); R(g, '#5b3b22', 13 + x * 10, 11 + y * 12, 1, 4);
    }
    R(g, '#f4ecd2', 10, 56, 76, 4);
  }],
  'big.peak': [96, 64, (g) => {
    R(g, '#9fc7e8', 0, 0, 96, 64);
    for (let x = 0; x < 96; x++) { const h = 50 - Math.max(0, 34 - Math.abs(x - 48) * 1.1); R(g, '#6e6e82', x, Math.round(h), 1, 64 - Math.round(h)); }
    for (let x = 40; x < 57; x++) R(g, '#ffffff', x, 16 + Math.abs(x - 48), 1, 3);
    R(g, '#5b3b22', 8, 50, 2, 10); R(g, '#c9a24a', 6, 48, 6, 2);
  }],
  'big.flight': [96, 64, (g) => {
    R(g, '#9fd0f0', 0, 0, 96, 64); R(g, '#4f8a3a', 0, 52, 96, 12);
    R(g, '#e8e2d0', 20, 24, 30, 8); R(g, '#e8e2d0', 54, 24, 14, 8); R(g, '#5b3b22', 50, 27, 4, 2); R(g, '#5b3b22', 30, 32, 1, 8); R(g, '#5b3b22', 60, 32, 1, 8);
    R(g, '#3a3a5a', 66, 28, 8, 2); R(g, '#e8e2d0', 74, 22, 6, 14);
  }],
  'big.vote': [96, 64, (g) => {
    R(g, '#2a2440', 0, 0, 96, 64); R(g, '#f4ecd2', 14, 8, 30, 46); R(g, '#f4ecd2', 50, 8, 30, 46);
    for (let i = 0; i < 9; i++) { R(g, '#8a7f66', 18, 12 + i * 4, 22, 1); R(g, '#8a7f66', 54, 12 + i * 4, 22, 1); }
    R(g, '#c9a24a', 24, 50, 10, 2); R(g, '#c0392b', 60, 50, 10, 2);
  }],
  'big.book': [96, 64, (g) => {
    R(g, '#2a2440', 0, 0, 96, 64); R(g, '#5a2a52', 22, 8, 52, 48); R(g, '#7d3b73', 22, 8, 52, 3); R(g, '#f4ecd2', 70, 10, 3, 44);
    R(g, '#e0b450', 32, 20, 30, 2); R(g, '#e0b450', 36, 26, 22, 1); R(g, '#e0b450', 36, 40, 22, 1);
  }],
  'big.assay': [96, 64, (g) => {
    R(g, '#1e2230', 0, 0, 96, 64); R(g, '#cfd6e2', 16, 14, 64, 36);
    for (let y = 0; y < 36; y++) {
      for (let x = 0; x < 64; x++) {
        const band = Math.floor((y + Math.round(Math.sin(x / 7) * 3)) / 3) % 2;
        if (band) R(g, '#7a8496', 16 + x, 14 + y, 1, 1);
      }
    }
    R(g, '#ffffff', 18, 15, 10, 1); R(g, '#9fe8ff', 4, 4, 30, 2);
  }],
};

// The Glimmermoth (a Loreling, spec 36.1): original pixel art, two wing frames.
const MOTH_COL: Record<string, string> = { a: '#c9a24a', b: '#5a4325', W: '#f6eab8', w: '#e2c36a', s: '#fffbe6' };
const MOTH = [
  ['..a......a..', '...a....a...', 'wWWw.bb.wWWw', 'WWWWwbbwWWWW', 'WsWWwbbwWWsW', '.WWWwbbwWWW.', '..wWwbbwWw..', '...ww..ww...'],
  ['..a......a..', '...a....a...', '....wbbw....', '...WWbbWW...', '...WsbbsW...', '...WWbbWW...', '....wbbw....', '............'],
];
function moth(g: Ctx, f: number, ox = 0, oy = 0, k = 1) {
  MOTH[f].forEach((row, y) => [...row].forEach((ch, x) => { if (MOTH_COL[ch]) R(g, MOTH_COL[ch], ox + x * k, oy + y * k, k, k); }));
}
DRAW['moth.0'] = [12, 8, (g) => moth(g, 0)];
DRAW['moth.1'] = [12, 8, (g) => moth(g, 1)];
DRAW['moth.big'] = [48, 32, (g) => moth(g, 0, 0, 0, 4)];

// The Timeline Door (original art): brass plates in a stone frame; open, a warm reading niche.
DRAW['timeline-door'] = [16, 24, (g) => {
  R(g, '#2a2440', 0, 2, 16, 22); R(g, '#6e6a86', 1, 3, 14, 21); R(g, '#8a6a2a', 3, 5, 10, 19); R(g, '#c9a24a', 4, 6, 8, 17);
  for (let i = 0; i < 4; i++) { R(g, '#e9cf7a', 5, 7 + i * 4, 6, 2); R(g, '#7a5a1a', 5, 9 + i * 4, 6, 1); }
  R(g, '#3b2a1a', 11, 15, 1, 2); R(g, '#8c88a6', 2, 2, 12, 1);
}];
DRAW['timeline-door.open'] = [16, 24, (g) => {
  // Frame, then a warm niche behind; the brass door has swung in against the left jamb.
  R(g, '#2a2440', 0, 2, 16, 22); R(g, '#6e6a86', 1, 3, 14, 21); R(g, '#8c88a6', 2, 2, 12, 1);
  R(g, '#5a3418', 3, 5, 10, 19); R(g, '#8a5226', 4, 6, 8, 17); R(g, '#c27a36', 6, 7, 5, 15);
  R(g, '#ffd98a', 7, 8, 3, 3); R(g, '#fff3c4', 8, 9, 1, 1);           // lamp glow
  R(g, '#3b2414', 4, 14, 8, 1);                                         // shelf
  for (let i = 0; i < 4; i++) R(g, ['#7d5bc4', '#2f7d6d', '#b8483e', '#c9a24a'][i], 5 + i * 2, 12, 1, 2);
  R(g, '#3b2414', 4, 19, 8, 1); R(g, '#e9cf7a', 6, 17, 3, 2);           // second shelf, the brass frame
  R(g, '#8a6a2a', 3, 5, 2, 19); R(g, '#e9cf7a', 3, 7, 1, 2); R(g, '#e9cf7a', 3, 11, 1, 2); R(g, '#e9cf7a', 3, 15, 1, 2); R(g, '#e9cf7a', 3, 19, 1, 2);
  R(g, '#f2d27a', 4, 23, 8, 1);                                         // light on the floor
}];

// The practice clue board (original art): cork on two legs, pinned notes and yarn.
DRAW['cork-board'] = [16, 24, (g) => {
  R(g, '#5b3b22', 2, 14, 1, 10); R(g, '#5b3b22', 13, 14, 1, 10);
  R(g, '#5b3b22', 0, 3, 16, 13); R(g, '#b07a44', 1, 4, 14, 11); R(g, '#c58c52', 2, 5, 3, 1); R(g, '#9c6a3a', 9, 12, 4, 1);
  R(g, '#f3eee0', 2, 5, 4, 3); R(g, '#f3eee0', 10, 5, 4, 3); R(g, '#f2d27a', 6, 10, 4, 3);
  R(g, '#b8483e', 4, 5, 1, 1); R(g, '#b8483e', 12, 5, 1, 1); R(g, '#b8483e', 8, 10, 1, 1);
  R(g, '#d9534a', 5, 8, 1, 1); R(g, '#d9534a', 6, 9, 1, 1); R(g, '#e9cf7a', 11, 8, 1, 1); R(g, '#e9cf7a', 10, 9, 1, 1);
}];

// The Weigh-House balance (original art): a brass beam on a post, two pans.
DRAW['balance-scale'] = [16, 24, (g) => {
  R(g, '#5b3b22', 4, 21, 8, 3); R(g, '#8a6a2a', 7, 6, 2, 15); R(g, '#e9cf7a', 7, 4, 2, 2);
  R(g, '#c9a24a', 1, 7, 14, 1); R(g, '#6b4f19', 1, 8, 14, 1);
  R(g, '#6b4f19', 2, 8, 1, 6); R(g, '#6b4f19', 13, 8, 1, 6);
  R(g, '#c9a24a', 0, 14, 5, 1); R(g, '#8a6a2a', 1, 15, 3, 1); R(g, '#c9a24a', 11, 14, 5, 1); R(g, '#8a6a2a', 12, 15, 3, 1);
  R(g, '#7d5bc4', 1, 12, 3, 2); R(g, '#d9b45a', 12, 12, 2, 2); R(g, '#fff3c4', 8, 4, 1, 1);
}];

// The Founders' Plaque (original art): dark on the restorer's trestle; restored, it hangs on a post.
DRAW['plaque.trestle'] = [16, 24, (g) => {
  R(g, '#5b3b22', 1, 17, 1, 7); R(g, '#5b3b22', 14, 17, 1, 7); R(g, '#5b3b22', 3, 18, 1, 6); R(g, '#5b3b22', 12, 18, 1, 6);
  R(g, '#8a5a30', 0, 16, 16, 2);
  R(g, '#2a1d14', 1, 9, 14, 7); R(g, '#3b2f25', 2, 10, 12, 5); R(g, '#5e4a2a', 3, 11, 4, 1); R(g, '#5e4a2a', 8, 11, 5, 1); R(g, '#5e4a2a', 4, 13, 8, 1);
  R(g, '#e9c45a', 3, 11, 1, 1); // the swab patch
  R(g, '#efe6cf', 12, 15, 2, 1); R(g, '#9aa3b5', 13, 14, 1, 1);
}];
function plaquePost(g: Ctx, bg: string, ink: string, win?: string) {
  R(g, '#5b3b22', 7, 10, 2, 14); R(g, '#3b2a1a', 6, 22, 4, 2);
  R(g, '#3b2a1a', 0, 2, 16, 9); R(g, bg, 1, 3, 14, 7);
  R(g, ink, 2, 4, 5, 1); R(g, ink, 8, 4, 6, 1); R(g, ink, 3, 6, 10, 1); R(g, ink, 4, 8, 8, 1);
  if (win) { R(g, '#f3eee0', 1, 7, 5, 3); R(g, win, 2, 8, 3, 1); }
  R(g, '#fff3c4', 14, 3, 1, 1);
}
DRAW['plaque.strip'] = [16, 24, (g) => { plaquePost(g, '#b07a44', '#5b3b22'); R(g, '#5b3b22', 7, 7, 2, 2); }];
DRAW['plaque.clean'] = [16, 24, (g) => plaquePost(g, '#2c1d12', '#e9c45a')];
DRAW['plaque.window'] = [16, 24, (g) => plaquePost(g, '#2c1d12', '#e9c45a', '#b07a44')];
DRAW['plaque.repaint'] = [16, 24, (g) => plaquePost(g, '#7a1f24', '#ffd75e')];

// The guild clerk's map (original art): a paper map pinned on an easel, with three coloured dots.
DRAW['clerk-map'] = [16, 24, (g) => {
  R(g, '#5b3b22', 3, 12, 1, 12); R(g, '#5b3b22', 12, 12, 1, 12); R(g, '#5b3b22', 7, 14, 2, 10);
  R(g, '#3b2a1a', 1, 3, 14, 11); R(g, '#efe6cf', 2, 4, 12, 9); R(g, '#bdb4a2', 3, 5, 10, 7);
  R(g, '#9fb7c8', 7, 7, 3, 3); R(g, '#d9534a', 4, 6, 2, 2); R(g, '#a87445', 11, 5, 1, 2);
  R(g, '#e07a5f', 3, 11, 1, 1); R(g, '#5fa8d3', 12, 11, 1, 1); R(g, '#7fd3a8', 9, 5, 1, 1);
  R(g, '#4aa3ff', 4, 10, 1, 1); R(g, '#4aa3ff', 5, 9, 1, 1);
}];

// The round window (original art): an empty stone ring; when finished, coloured glass.
function roundWindow(g: Ctx, glass: boolean) {
  const cx = 7.5, cy = 9.5;
  for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d > 7.6) continue;
    if (d > 6.2) R(g, '#8b8f99', x, y);
    else if (!glass) R(g, (x + y) % 2 ? '#1d2040' : '#232850', x, y);
    else R(g, ['#c0392b', '#2e86c1', '#f1c40f', '#27ae60', '#8e44ad', '#e67e22'][(Math.floor(Math.atan2(y - cy, x - cx) * 3 / Math.PI + 3) + (d > 3 ? 1 : 0)) % 6], x, y);
  }
  if (glass) { R(g, '#2a2a33', 7, 3, 1, 13); R(g, '#2a2a33', 2, 9, 12, 1); }
  R(g, '#6f737d', 3, 18, 10, 2); R(g, '#efe6cf', 5, 20, 6, 3); R(g, '#8a7f66', 6, 21, 4, 1);
}
DRAW['round-window'] = [16, 24, (g) => roundWindow(g, false)];
DRAW['round-window.done'] = [16, 24, (g) => roundWindow(g, true)];

// The mapmaker's table (original art): a small table with an unrolled map, an inkpot and a quill.
DRAW['map-table'] = [16, 24, (g) => {
  R(g, '#5b3b22', 2, 16, 1, 8); R(g, '#5b3b22', 13, 16, 1, 8); R(g, '#8a5a30', 0, 13, 16, 3); R(g, '#a87445', 0, 13, 16, 1);
  R(g, '#efe1bd', 2, 9, 11, 5); R(g, '#c9b48a', 2, 9, 1, 5); R(g, '#c9b48a', 12, 9, 1, 5);
  R(g, '#b98d55', 3, 11, 9, 1); R(g, '#5fa8d3', 5, 10, 1, 1); R(g, '#e0607e', 9, 12, 1, 1); R(g, '#7fb3d1', 11, 9, 1, 5);
  R(g, '#2a2440', 13, 11, 2, 2); R(g, '#f3eee0', 14, 6, 1, 5); R(g, '#e9e5f5', 15, 5, 1, 2);
}];

// The brass sorter (original art): a hopper, a cog box and two chutes.
DRAW['brass-sorter'] = [16, 24, (g) => {
  R(g, '#6b4f19', 3, 4, 10, 1); R(g, '#c9a24a', 3, 5, 10, 2); R(g, '#c9a24a', 5, 7, 6, 2);
  R(g, '#c0392b', 5, 3, 2, 2); R(g, '#7cb342', 8, 3, 2, 2); R(g, '#f1c40f', 10, 3, 1, 1);
  R(g, '#d9b45a', 4, 9, 8, 6); R(g, '#6b4f19', 4, 15, 8, 1); R(g, '#e9cf7a', 7, 11, 2, 2); R(g, '#6b4f19', 7, 11, 1, 1);
  R(g, '#8a6a2a', 3, 16, 2, 2); R(g, '#8a6a2a', 1, 18, 2, 2); R(g, '#8a6a2a', 11, 16, 2, 2); R(g, '#8a6a2a', 13, 18, 2, 2);
  R(g, '#5b3b22', 0, 20, 5, 4); R(g, '#5b3b22', 11, 20, 5, 4); R(g, '#c0392b', 1, 20, 2, 1); R(g, '#7cb342', 13, 20, 2, 1);
}];

// The echo stone (original art): a flat stone with a carved ear and sound rings.
DRAW['echo-stone'] = [16, 24, (g) => {
  R(g, '#6f737d', 2, 16, 12, 6); R(g, '#8b8f99', 3, 15, 10, 2); R(g, '#b7bcc6', 4, 15, 4, 1); R(g, '#4a4d55', 2, 21, 12, 1);
  R(g, '#3b3355', 6, 17, 3, 3); R(g, '#8b8f99', 7, 18, 1, 1);
  R(g, '#cfe3ef', 10, 10, 1, 3); R(g, '#cfe3ef', 12, 8, 1, 7); R(g, '#cfe3ef', 14, 6, 1, 11);
}];

// The survey box (original art): a wooden box on a post, with a slot and paper slips.
DRAW['survey-box'] = [16, 24, (g) => {
  R(g, '#5b3b22', 7, 14, 2, 10); R(g, '#3b2a1a', 5, 22, 6, 2);
  R(g, '#3b2a1a', 2, 6, 12, 9); R(g, '#a87445', 3, 7, 10, 7); R(g, '#2a1d14', 5, 8, 6, 1);
  R(g, '#f3eee0', 6, 4, 3, 4); R(g, '#8a7f66', 6, 5, 2, 1); R(g, '#4aa3ff', 4, 11, 2, 2); R(g, '#ff8a3a', 10, 11, 2, 2);
}];

// The ferry message post (original art): a slate on a post, chalk lines and a little boat sign.
DRAW['ferry-slate'] = [16, 24, (g) => {
  R(g, '#5b3b22', 7, 13, 2, 11); R(g, '#3b2a1a', 5, 22, 6, 2);
  R(g, '#7a5230', 1, 3, 14, 11); R(g, '#2f3b3a', 2, 4, 12, 9);
  R(g, '#e8efe8', 3, 6, 5, 1); R(g, '#e8efe8', 3, 8, 8, 1); R(g, '#e8efe8', 3, 10, 4, 1); R(g, '#9fd3ff', 9, 6, 3, 1);
  R(g, '#c9a24a', 5, 0, 6, 2); R(g, '#7a5230', 6, 1, 4, 1); R(g, '#4aa3ff', 4, 2, 8, 1);
}];

// Lio's easel (original art): three legs, a small market painting with a gold frame mark.
DRAW['easel'] = [16, 24, (g) => {
  R(g, '#6b4a2a', 3, 8, 2, 16); R(g, '#6b4a2a', 11, 8, 2, 16); R(g, '#5b3b22', 7, 4, 2, 20);
  R(g, '#3b2a1a', 1, 3, 14, 11); R(g, '#9fd3ff', 2, 4, 12, 4); R(g, '#cdb894', 2, 8, 12, 5);
  R(g, '#ffd25a', 3, 5, 2, 2); R(g, '#7d8796', 10, 4, 3, 2); R(g, '#d9534a', 3, 9, 3, 2); R(g, '#4a90d9', 7, 10, 1, 2); R(g, '#16a085', 11, 10, 1, 2);
  R(g, '#f6c453', 5, 6, 6, 1); R(g, '#f6c453', 5, 12, 6, 1); R(g, '#f6c453', 5, 6, 1, 7); R(g, '#f6c453', 10, 6, 1, 7);
  R(g, '#a87445', 2, 14, 12, 1);
}];

// Maren's bell frame (original art): a small wooden frame with three bells of different sizes and a rope.
DRAW['bell-rope'] = [16, 24, (g) => {
  R(g, '#5b3b22', 1, 2, 2, 22); R(g, '#5b3b22', 13, 2, 2, 22); R(g, '#7a5230', 0, 1, 16, 2);
  R(g, '#c9a24a', 3, 4, 4, 4); R(g, '#e9cf7a', 4, 4, 2, 1); R(g, '#8a6a2a', 3, 8, 4, 1);
  R(g, '#c9a24a', 8, 4, 3, 3); R(g, '#e9cf7a', 9, 4, 1, 1); R(g, '#8a6a2a', 8, 7, 3, 1);
  R(g, '#c9a24a', 11, 4, 2, 2); R(g, '#8a6a2a', 11, 6, 2, 1);
  R(g, '#d8c08a', 7, 9, 1, 11); R(g, '#b04a3a', 6, 19, 3, 3);
}];

// Noa's forecast board (original art): a board on a post with sun and rain marks and a little dial.
DRAW['forecast-board'] = [16, 24, (g) => {
  R(g, '#5b3b22', 7, 14, 2, 10); R(g, '#3b2a1a', 5, 22, 6, 2);
  R(g, '#7a5230', 0, 2, 16, 13); R(g, '#e8dcc0', 1, 3, 14, 11);
  R(g, '#ffd25a', 2, 4, 3, 3); R(g, '#8794a6', 9, 4, 5, 2); R(g, '#4a90d9', 10, 6, 1, 2); R(g, '#4a90d9', 12, 6, 1, 2);
  R(g, '#3b2a1a', 2, 9, 12, 1); R(g, '#b03a2e', 3, 11, 2, 2); R(g, '#4a90d9', 7, 11, 2, 2); R(g, '#b03a2e', 11, 11, 2, 2);
}];

// The Diving Bell (original art): a brass bell with a round window, on a little stand.
DRAW['diving-bell'] = [16, 24, (g) => {
  R(g, '#5b3b22', 2, 21, 12, 3); R(g, '#3b2a1a', 7, 0, 2, 4);
  R(g, '#8a6a2a', 4, 4, 8, 2); R(g, '#c9a24a', 3, 6, 10, 4); R(g, '#c9a24a', 2, 10, 12, 9); R(g, '#e9cf7a', 4, 7, 2, 10);
  R(g, '#6b4f19', 1, 18, 14, 3); R(g, '#3b2a1a', 6, 11, 4, 4); R(g, '#9fe8ff', 7, 12, 2, 2); R(g, '#e8f6ff', 7, 12, 1, 1);
}];

// The door to the Guardian's quarters (original art): a round-topped oak door with a star.
DRAW['quarters-door'] = [16, 24, (g) => {
  R(g, '#3b2a1a', 1, 3, 14, 21); R(g, '#3b2a1a', 3, 1, 10, 2);
  R(g, '#7a5230', 2, 4, 12, 20); R(g, '#7a5230', 4, 2, 8, 2);
  R(g, '#5b3b22', 5, 4, 1, 20); R(g, '#5b3b22', 10, 4, 1, 20);
  R(g, '#c9a24a', 2, 9, 12, 1); R(g, '#c9a24a', 2, 18, 12, 1);
  R(g, '#e9cf7a', 7, 5, 2, 1); R(g, '#e9cf7a', 6, 6, 4, 1); R(g, '#e9cf7a', 7, 7, 2, 1);
  R(g, '#e9cf7a', 11, 13, 2, 2); R(g, '#fff3c4', 11, 13, 1, 1);
}];

// ---- The story: the Lamp Wall, the cellar door and the old Guardian's study (all original art).

// The Lamp Wall: a board of sixteen small lamps; `lamp-wall.<n>` shows n lamps lit.
for (let n = 0; n <= 16; n++) DRAW[`lamp-wall.${n}`] = [16, 24, (g) => {
  R(g, '#5b3b22', 2, 17, 2, 7); R(g, '#5b3b22', 12, 17, 2, 7);
  R(g, '#3b2a1a', 0, 1, 16, 17); R(g, '#6b4a2a', 1, 2, 14, 15); R(g, '#c9a24a', 0, 0, 16, 1);
  for (let i = 0; i < 16; i++) {
    const x = 2 + (i % 4) * 3, y = 3 + (3 - Math.floor(i / 4)) * 3.5; // lamps light from the bottom row up
    if (i < n) { R(g, '#ffd25a', x, y, 2, 2); R(g, '#fff3c4', x, y, 1, 1); } else R(g, '#2a2440', x, y, 2, 2);
  }
}];
// The cellar door: an oak hatch in the ground, shut; open, with warm light on stone steps.
DRAW['cellar-door'] = [16, 24, (g) => {
  R(g, '#3b2a1a', 0, 12, 16, 12); R(g, '#7a5230', 1, 13, 14, 10); R(g, '#5b3b22', 5, 13, 1, 10); R(g, '#5b3b22', 10, 13, 1, 10);
  R(g, '#4a6b3a', 0, 12, 4, 2); R(g, '#4a6b3a', 12, 21, 4, 2); R(g, '#8b8f99', 2, 17, 12, 1); R(g, '#c9a24a', 7, 16, 2, 3);
}];
DRAW['cellar-door.open'] = [16, 24, (g) => {
  R(g, '#3b2a1a', 0, 12, 16, 12); R(g, '#1d140e', 1, 13, 14, 10);
  R(g, '#8b8f99', 2, 14, 12, 2); R(g, '#6f737d', 3, 17, 10, 2); R(g, '#4a4d55', 4, 20, 8, 2);
  R(g, '#ffd98a', 6, 20, 4, 2); R(g, '#7a5230', 0, 2, 16, 10); R(g, '#5b3b22', 5, 2, 1, 10); R(g, '#5b3b22', 10, 2, 1, 10); R(g, '#c9a24a', 7, 6, 2, 3);
}];
DRAW['study-stairs'] = [32, 24, (g) => {
  R(g, '#4a4d55', 0, 10, 32, 14); R(g, '#8b8f99', 2, 10, 28, 3); R(g, '#6f737d', 4, 14, 24, 3); R(g, '#5b5f69', 6, 18, 20, 3);
  R(g, '#ffe0a0', 10, 10, 12, 1);
}];
// The old ferry road post: a leaning signpost with a boat and an arrow, half in the grass.
DRAW['road-post'] = [16, 24, (g) => {
  R(g, '#5b3b22', 7, 6, 2, 18); R(g, '#7a5230', 1, 4, 14, 6); R(g, '#a87445', 1, 4, 14, 1);
  R(g, '#4aa3ff', 3, 6, 6, 2); R(g, '#efe1bd', 4, 5, 1, 1); R(g, '#efe1bd', 11, 6, 3, 1); R(g, '#efe1bd', 13, 5, 1, 3);
  R(g, '#4a7a3a', 4, 20, 8, 4); R(g, '#6aa84f', 5, 21, 1, 2); R(g, '#6aa84f', 10, 20, 1, 3);
}];
// Corvan's wares: an open crate with a rolled rug, tiles and a little lamp, and a price tag.
DRAW['crate-wares'] = [16, 24, (g) => {
  R(g, '#7a5230', 1, 13, 14, 10); R(g, '#a87445', 1, 13, 14, 2); R(g, '#5b3b22', 1, 18, 14, 1);
  R(g, '#1f5a6b', 2, 8, 5, 5); R(g, '#f3c969', 3, 9, 1, 3); R(g, '#7a2e1e', 8, 9, 3, 4); R(g, '#ffad5c', 9, 10, 1, 1);
  R(g, '#c9a24a', 12, 7, 2, 6); R(g, '#ffe7a0', 12, 8, 2, 2); R(g, '#efe1bd', 5, 15, 6, 3); R(g, '#2a2440', 6, 16, 4, 1);
}];
// Gathering spots and the Maker's bench (original art).
DRAW['ore-vein'] = [16, 24, (g) => { R(g, '#6f737d', 1, 10, 14, 14); R(g, '#8b8f99', 2, 9, 11, 3); R(g, '#a0522d', 4, 13, 3, 2); R(g, '#c0642d', 9, 16, 2, 2); R(g, '#a0522d', 6, 19, 3, 2); R(g, '#4a4d55', 1, 22, 14, 2); }];
DRAW['clay-bank'] = [16, 24, (g) => { R(g, '#8a5a3a', 0, 14, 16, 10); R(g, '#b07850', 1, 13, 14, 3); R(g, '#c98d60', 4, 15, 4, 2); R(g, '#6b4a2a', 9, 18, 5, 2); R(g, '#4a7a3a', 0, 12, 4, 2); }];
DRAW['reeds'] = [16, 24, (g) => { for (const [x, h] of [[2, 14], [5, 18], [8, 15], [11, 19], [13, 13]] as [number, number][]) { R(g, '#7a8a3a', x, 24 - h, 1, h); R(g, '#b98d55', x - 1, 24 - h, 3, 3); } R(g, '#4a7a3a', 0, 21, 16, 3); }];
DRAW['workbench'] = [16, 24, (g) => {
  R(g, '#5b3b22', 1, 16, 2, 8); R(g, '#5b3b22', 13, 16, 2, 8); R(g, '#8a5a30', 0, 13, 16, 3); R(g, '#a87445', 0, 13, 16, 1);
  R(g, '#c98d60', 2, 9, 3, 4); R(g, '#8b8f99', 7, 6, 1, 7); R(g, '#4a4d55', 6, 12, 3, 1); R(g, '#b98d55', 11, 8, 1, 5); R(g, '#2a2440', 11, 12, 1, 1);
}];
// The Undercroft: a fallacy seal (a barrier of gold-violet runes) and the Hollow Archivist (dust and pages, a KEEPER label for a face).
DRAW['fray-seal'] = [16, 64, (g) => {
  R(g, '#3a2b5e', 2, 0, 12, 64); R(g, '#56408a', 4, 0, 8, 64);
  for (let y = 4; y < 60; y += 9) { R(g, '#e8c040', 6, y, 4, 1); R(g, '#e8c040', 7, y + 1, 2, 3); R(g, '#c9a2ff', 5, y + 5, 6, 1); }
  R(g, '#e8c040', 2, 0, 12, 1); R(g, '#e8c040', 2, 63, 12, 1);
}];
DRAW['hollow-archivist'] = [24, 36, (g) => {
  R(g, '#4a4458', 6, 8, 12, 26); R(g, '#6b6478', 7, 9, 10, 24); R(g, '#3a3446', 3, 14, 4, 14); R(g, '#3a3446', 17, 14, 4, 14);
  for (const [x, y] of [[2, 12], [19, 16], [4, 26], [18, 28], [8, 32], [14, 4]] as [number, number][]) { R(g, '#e8e2d0', x, y, 3, 2); R(g, '#b8ad90', x, y + 2, 3, 1); }
  R(g, '#d8c79a', 8, 4, 8, 6); R(g, '#3b2a1a', 9, 6, 6, 1); R(g, '#3b2a1a', 9, 8, 4, 1); R(g, '#e8c040', 7, 3, 10, 1);
  R(g, '#2a2440', 9, 34, 6, 2);
}];
// Wenna's barter boat: a moored boat with dye pots and bundles.
DRAW['barter-boat'] = [16, 24, (g) => { R(g, '#2b6f9a', 0, 18, 16, 6); R(g, '#6b4a2a', 1, 14, 14, 5); R(g, '#8a5a30', 2, 14, 12, 1); R(g, '#5b3b22', 7, 2, 1, 12); R(g, '#e8e2d0', 8, 3, 5, 7); R(g, '#b5452f', 2, 11, 2, 3); R(g, '#4a6a9a', 5, 11, 2, 3); R(g, '#c9b843', 9, 11, 2, 3); R(g, '#8a6240', 12, 11, 2, 3); R(g, '#9fd0ff', 1, 19, 4, 1); }];
// The rumour mill: a small tea table with a pot and two cups.
DRAW['tea-table'] = [16, 24, (g) => { R(g, '#5b3b22', 2, 17, 2, 7); R(g, '#5b3b22', 12, 17, 2, 7); R(g, '#8a5a30', 0, 14, 16, 3); R(g, '#a87445', 0, 14, 16, 1); R(g, '#b5523b', 5, 8, 6, 6); R(g, '#d06a50', 6, 8, 2, 2); R(g, '#3b2a1a', 7, 6, 2, 2); R(g, '#b5523b', 11, 10, 2, 1); R(g, '#e8e2d0', 1, 11, 3, 3); R(g, '#e8e2d0', 12, 11, 3, 3); R(g, '#9fd0ff', 2, 6, 1, 3); }];
// Field readings: where a made tool can test a claim (rain stake, plumb mark, flood post).
DRAW['rain-stake'] = [16, 24, (g) => { R(g, '#5b3b22', 7, 10, 2, 14); R(g, '#c98d60', 4, 6, 8, 6); R(g, '#9fd0ff', 5, 8, 6, 3); R(g, '#3b2a1a', 4, 12, 8, 1); for (let i = 0; i < 3; i++) R(g, '#3b2a1a', 11, 7 + i * 2, 1, 1); R(g, '#4a7a3a', 3, 22, 10, 2); }];
DRAW['plumb-mark'] = [16, 24, (g) => { R(g, '#8b8f99', 2, 2, 12, 22); R(g, '#6f737d', 3, 3, 10, 20); R(g, '#4a4d55', 5, 3, 1, 20); R(g, '#e8e2d0', 9, 3, 1, 14); R(g, '#c9a24a', 8, 17, 3, 3); R(g, '#2a2440', 9, 5, 3, 1); }];
DRAW['flood-post'] = [16, 24, (g) => { R(g, '#6b4a2a', 6, 3, 4, 21); R(g, '#8a5a30', 7, 3, 2, 21); R(g, '#2a2440', 5, 12, 6, 1); R(g, '#d8c79a', 6, 6, 4, 3); R(g, '#9a8a6a', 7, 7, 1, 1); R(g, '#2b6f9a', 2, 21, 12, 3); R(g, '#9fd0ff', 3, 21, 4, 1); }];
// Sefa's word tiles: a small table with face-down tiles, two turned up.
DRAW['tile-table'] = [16, 24, (g) => {
  R(g, '#5b3b22', 2, 17, 1, 7); R(g, '#5b3b22', 13, 17, 1, 7); R(g, '#8a5a30', 0, 13, 16, 4); R(g, '#a87445', 0, 13, 16, 1);
  for (let i = 0; i < 6; i++) R(g, i === 1 || i === 4 ? '#efe1bd' : '#3b3355', 1 + (i % 3) * 5, 7 + Math.floor(i / 3) * 3, 4, 2);
  R(g, '#c9a24a', 3, 7, 1, 1); R(g, '#c9a24a', 13, 10, 1, 1); R(g, '#8a7f66', 7, 8, 2, 1); R(g, '#8a7f66', 7, 11, 2, 1);
}];
const paper = (g: Ctx, x: number, y: number, w: number, h: number) => { R(g, '#efe1bd', x, y, w, h); R(g, '#c9b48a', x, y + h - 1, w, 1); };
const smallTable = (g: Ctx, w = 16) => { R(g, '#5b3b22', 2, 17, 1, 7); R(g, '#5b3b22', w - 3, 17, 1, 7); R(g, '#8a5a30', 0, 14, w, 3); R(g, '#a87445', 0, 14, w, 1); };
DRAW['clue.desk'] = [32, 24, (g) => {
  R(g, '#5b3b22', 1, 12, 30, 12); R(g, '#8a5a30', 0, 10, 32, 3); R(g, '#a87445', 0, 10, 32, 1);
  R(g, '#6b4a2a', 3, 14, 10, 4); R(g, '#c9a24a', 7, 15, 2, 1); R(g, '#6b4a2a', 19, 14, 10, 4); R(g, '#c9a24a', 23, 15, 2, 1);
  paper(g, 5, 6, 8, 4); R(g, '#2a2440', 22, 6, 3, 4); R(g, '#f3eee0', 24, 2, 1, 6); R(g, '#ffd25a', 27, 5, 3, 5); R(g, '#fff3c4', 28, 4, 1, 1);
}];
DRAW['clue.journal'] = [16, 24, (g) => { smallTable(g); R(g, '#6b2e2e', 3, 8, 10, 6); R(g, '#8e3b3b', 3, 8, 10, 1); R(g, '#efe1bd', 12, 9, 1, 5); R(g, '#c9a24a', 7, 10, 2, 2); }];
DRAW['clue.cards'] = [16, 24, (g) => { smallTable(g); R(g, '#7a5230', 2, 8, 12, 6); R(g, '#efe1bd', 3, 6, 10, 3); R(g, '#d8c9a3', 4, 5, 8, 1); R(g, '#c0392b', 7, 7, 2, 1); }];
DRAW['clue.clock'] = [16, 24, (g) => {
  R(g, '#5b3b22', 3, 4, 10, 20); R(g, '#7a5230', 4, 5, 8, 18); R(g, '#efe1bd', 5, 6, 6, 6); R(g, '#2a2440', 7, 7, 1, 3); R(g, '#2a2440', 8, 9, 2, 1);
  R(g, '#c9a24a', 7, 14, 2, 6); R(g, '#e9cf7a', 6, 19, 4, 2);
}];
DRAW['clue.hearth'] = [32, 24, (g) => {
  R(g, '#6f737d', 0, 2, 32, 22); R(g, '#8b8f99', 0, 2, 32, 3); R(g, '#1d1a1a', 6, 9, 20, 15);
  R(g, '#4a4d55', 8, 20, 16, 2); R(g, '#5b5f69', 12, 18, 8, 2); R(g, '#8b8f99', 13, 5, 6, 3); R(g, '#b7bcc6', 14, 6, 4, 1);
}];
DRAW['clue.painting'] = [16, 24, (g) => { R(g, '#c9a24a', 1, 2, 14, 12); R(g, '#9fd3ff', 2, 3, 12, 5); R(g, '#4a7a3a', 2, 8, 12, 5); R(g, '#7a5230', 5, 6, 4, 4); R(g, '#ffd25a', 11, 4, 2, 2); }];
DRAW['clue.margin'] = [16, 24, (g) => { smallTable(g); paper(g, 2, 7, 12, 7); R(g, '#8a7f66', 4, 9, 6, 1); R(g, '#8a7f66', 4, 11, 5, 1); R(g, '#4aa3ff', 11, 8, 2, 5); }];
DRAW['clue.cabinet'] = [16, 24, (g) => {
  R(g, '#5b3b22', 1, 4, 14, 20); R(g, '#7a5230', 2, 5, 12, 18); R(g, '#5b3b22', 2, 13, 12, 1); R(g, '#c9a24a', 7, 9, 2, 1); R(g, '#c9a24a', 7, 17, 2, 1);
  R(g, '#c9a24a', 4, 1, 3, 3); R(g, '#8a6a2a', 4, 4, 3, 1); R(g, '#c9a24a', 9, 2, 2, 2);
}];
DRAW['clue.oldmap'] = [32, 24, (g) => {
  R(g, '#5b3b22', 2, 16, 1, 8); R(g, '#5b3b22', 29, 16, 1, 8); R(g, '#8a5a30', 0, 13, 32, 3); R(g, '#a87445', 0, 13, 32, 1);
  paper(g, 2, 6, 28, 8); R(g, '#7fb3d1', 18, 6, 2, 8); R(g, '#b98d55', 4, 10, 14, 1); R(g, '#b98d55', 20, 9, 8, 1); R(g, '#c0392b', 9, 8, 2, 2); R(g, '#8a7f66', 22, 7, 1, 1);
}];
DRAW['clue.glass'] = [16, 24, (g) => { R(g, '#7a5230', 5, 2, 6, 20); R(g, '#cfe3ef', 7, 4, 2, 14); R(g, '#4a90d9', 7, 11, 2, 7); R(g, '#c9a24a', 6, 19, 4, 3); R(g, '#2a2440', 9, 6, 1, 1); R(g, '#2a2440', 9, 10, 1, 1); R(g, '#2a2440', 9, 14, 1, 1); }];
DRAW['clue.floodmark'] = [16, 24, (g) => { R(g, '#5b5f69', 0, 0, 16, 24); R(g, '#6f737d', 1, 1, 14, 22); R(g, '#3a5a7a', 0, 12, 16, 1); R(g, '#efe1bd', 6, 9, 4, 2); R(g, '#8a7f66', 7, 10, 2, 1); R(g, '#7a8a6a', 0, 13, 16, 11); }];
DRAW['clue.slips'] = [16, 24, (g) => { R(g, '#5b3b22', 1, 8, 14, 16); R(g, '#7a5230', 2, 9, 12, 6); R(g, '#efe1bd', 3, 6, 3, 4); R(g, '#efe1bd', 7, 5, 3, 5); R(g, '#efe1bd', 11, 6, 2, 4); R(g, '#c9a24a', 7, 18, 2, 1); }];
DRAW['clue.scales'] = [16, 24, (g) => { smallTable(g); R(g, '#c9a24a', 7, 4, 2, 10); R(g, '#c9a24a', 2, 4, 12, 1); R(g, '#e9cf7a', 1, 8, 4, 1); R(g, '#e9cf7a', 11, 8, 4, 1); R(g, '#8a6a2a', 2, 5, 1, 3); R(g, '#8a6a2a', 13, 5, 1, 3); }];
DRAW['clue.caseboard'] = [16, 24, (g) => { R(g, '#7a5230', 0, 2, 16, 14); R(g, '#c9a27a', 1, 3, 14, 12); paper(g, 2, 4, 4, 3); paper(g, 10, 5, 4, 3); paper(g, 5, 10, 4, 3); R(g, '#c0392b', 5, 7, 1, 3); R(g, '#f1c40f', 9, 8, 2, 1); }];
DRAW['clue.roundwin'] = [16, 24, (g) => roundWindow(g, false)];
DRAW['clue.drafts'] = [16, 24, (g) => { smallTable(g); paper(g, 1, 9, 6, 5); paper(g, 5, 8, 6, 6); paper(g, 9, 9, 6, 5); R(g, '#2a2440', 6, 10, 4, 1); R(g, '#c0392b', 6, 12, 3, 1); }];
DRAW['clue.jar'] = [16, 24, (g) => { smallTable(g); R(g, '#9fc7cf', 4, 4, 8, 10); R(g, '#cfe8ee', 5, 5, 1, 8); R(g, '#7a5230', 4, 3, 8, 2); R(g, '#efe1bd', 6, 8, 2, 1); R(g, '#efe1bd', 8, 10, 2, 1); R(g, '#efe1bd', 6, 12, 3, 1); }];
DRAW['clue.stove'] = [16, 24, (g) => { R(g, '#3b3b42', 2, 8, 12, 14); R(g, '#4a4d55', 2, 8, 12, 2); R(g, '#1d1a1a', 5, 13, 6, 5); R(g, '#3b3b42', 6, 0, 3, 8); R(g, '#2a2a33', 3, 22, 2, 2); R(g, '#2a2a33', 11, 22, 2, 2); }];
DRAW['clue.bucket'] = [16, 24, (g) => { R(g, '#6b4a2a', 3, 12, 10, 11); R(g, '#8a6a2a', 3, 14, 10, 1); R(g, '#8a6a2a', 3, 19, 10, 1); R(g, '#5b5f69', 4, 8, 1, 4); R(g, '#5b5f69', 11, 8, 1, 4); R(g, '#5b5f69', 5, 7, 6, 1); R(g, '#d8c08a', 13, 13, 2, 9); R(g, '#b98d55', 13, 16, 2, 1); }];
DRAW['clue.corner'] = [16, 24, (g) => { R(g, '#0f0c0a', 0, 6, 16, 18); R(g, '#1d1612', 2, 10, 12, 12); R(g, '#2a2440', 9, 16, 3, 2); }];
DRAW['clue.letter'] = [16, 24, (g) => { R(g, '#8b8f99', 2, 16, 12, 6); paper(g, 4, 10, 8, 7); R(g, '#c0392b', 7, 13, 2, 2); R(g, '#8a7f66', 5, 11, 5, 1); R(g, '#ffd25a', 3, 9, 1, 1); R(g, '#ffd25a', 12, 9, 1, 1); }];

// Archive icons. These are stylised props; the evidence panels identify them as illustrations.
DRAW['nile.door'] = [16, 24, (g) => { R(g, '#302849', 0, 3, 16, 21); R(g, '#ad8353', 1, 2, 14, 2); R(g, '#d6be7c', 1, 5, 2, 18); R(g, '#d6be7c', 13, 5, 2, 18); R(g, '#486479', 4, 6, 8, 15); R(g, '#a8e2cc', 7, 12, 2, 8); }];
DRAW['nile.scroll'] = [16, 24, (g) => { smallTable(g); paper(g, 2, 3, 12, 10); R(g, '#70472e', 1, 2, 2, 12); R(g, '#70472e', 13, 2, 2, 12); for (let y = 5; y <= 10; y += 2) R(g, '#76543b', 5, y, 6, 1); }];
DRAW['nile.tablet'] = [16, 24, (g) => { smallTable(g); R(g, '#8c5543', 2, 2, 10, 12); R(g, '#c48359', 3, 3, 8, 10); for (let y = 5; y <= 10; y += 2) R(g, '#6a4435', 4, y, 5, 1); R(g, '#d4ab74', 11, 8, 4, 6); }];
DRAW['nile.map'] = [16, 24, (g) => { smallTable(g); paper(g, 1, 3, 14, 12); R(g, '#b16867', 3, 5, 4, 4); R(g, '#835b4a', 10, 6, 3, 6); R(g, '#415558', 5, 9, 5, 1); R(g, '#415558', 7, 10, 1, 3); }];
DRAW['nile.slip'] = [16, 24, (g) => { R(g, '#664932', 4, 6, 8, 14); paper(g, 2, 3, 12, 8); R(g, '#8a5343', 5, 6, 6, 1); R(g, '#8a5343', 5, 8, 4, 1); }];

DRAW['nile.stone'] = [16, 24, (g) => { smallTable(g); R(g, '#644d4d', 2, 7, 12, 9); R(g, '#9c7970', 3, 5, 9, 8); R(g, '#c5a79a', 4, 5, 6, 2); R(g, '#745654', 5, 8, 4, 1); R(g, '#745654', 6, 10, 5, 1); }];

// Cold Store props and documentary diagrams. No figures of people or remains.
DRAW['preserved.door'] = [16, 24, (g) => {
  R(g, '#182a36', 0, 4, 16, 20);
  R(g, '#748c92', 1, 5, 14, 18);
  R(g, '#9ab9b7', 2, 3, 12, 2);
  R(g, '#365765', 3, 6, 10, 17);
  R(g, '#4b7380', 4, 7, 8, 5);
  R(g, '#b5d9d4', 5, 8, 6, 2);
  R(g, '#dfc17d', 10, 15, 2, 2);
  R(g, '#8398aa', 2, 22, 12, 1);
}];
DRAW['preserved.folder'] = [16, 24, (g) => {
  R(g, '#3d4b58', 4, 13, 8, 8);
  R(g, '#6f8b95', 1, 5, 14, 10);
  R(g, '#adc3c4', 2, 3, 6, 4);
  R(g, '#dce5d5', 2, 6, 12, 6);
  R(g, '#576b70', 4, 8, 8, 1);
}];
DRAW['preserved.slip'] = [16, 24, (g) => {
  R(g, '#2d4353', 5, 13, 6, 9);
  R(g, '#a29d8a', 2, 5, 12, 10);
  paper(g, 3, 4, 10, 9);
  R(g, '#9abdca', 6, 3, 4, 2);
  R(g, '#716951', 5, 7, 6, 1);
  R(g, '#716951', 5, 10, 4, 1);
}];

const preservedProps = {
  temple: (g: Ctx) => {
    R(g, '#ead0a2', 2, 6, 12, 8);
    R(g, '#976f49', 4, 8, 8, 4);
    R(g, '#ead0a2', 7, 9, 2, 3);
    R(g, '#976f49', 3, 12, 10, 1);
  },
  catalogue: (g: Ctx) => {
    R(g, '#537587', 1, 6, 14, 8);
    paper(g, 2, 4, 11, 9);
    R(g, '#ad493c', 8, 7, 3, 2);
    R(g, '#716951', 4, 10, 5, 1);
  },
  coast: (g: Ctx) => {
    R(g, '#7bb4c5', 2, 5, 12, 9);
    R(g, '#e0b279', 8, 5, 6, 9);
    R(g, '#e0b279', 6, 10, 3, 4);
    R(g, '#69516b', 9, 7, 2, 2);
    R(g, '#69516b', 11, 10, 2, 2);
  },
  context: (g: Ctx) => {
    R(g, '#adc3c4', 1, 5, 14, 9);
    R(g, '#e0b279', 2, 7, 5, 5);
    R(g, '#976f49', 2, 10, 5, 2);
    R(g, '#dab98c', 9, 7, 5, 5);
    R(g, '#9e6c62', 9, 9, 5, 2);
  },
};
for (const [key, draw] of Object.entries(preservedProps)) {
  DRAW[`preserved.${key}`] = [16, 24, (g) => { pedestal(g, 1, 14, 14); draw(g); }];
}

DRAW['preserved.display-records'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  paper(g, 3, 5, 8, 9);
  paper(g, 13, 5, 8, 9);
  R(g, '#688c9a', 4, 7, 6, 1);
  R(g, '#a37e56', 14, 7, 6, 1);
}];
DRAW['preserved.display-paired'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  R(g, '#87aeb2', 1, 4, 22, 9);
  paper(g, 2, 5, 8, 7);
  paper(g, 14, 5, 8, 7);
  R(g, '#697782', 8, 8, 8, 2);
}];
DRAW['preserved.display-delayed'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  R(g, '#455765', 3, 3, 18, 11);
  paper(g, 8, 5, 8, 8);
  R(g, '#cf9d64', 10, 4, 4, 2);
  R(g, '#7c6e5c', 10, 8, 4, 1);
}];

DRAW['big.preserved.temple'] = [96, 64, (g) => {
  R(g, '#a9ccd6', 0, 0, 96, 64);
  R(g, '#c6d9d4', 0, 22, 96, 12);
  R(g, '#dcbb90', 0, 34, 96, 30);
  R(g, '#f0d1a5', 7, 44, 83, 4);
  R(g, '#aa7b57', 15, 26, 18, 19);
  R(g, '#aa7b57', 57, 26, 17, 19);
  R(g, '#e5bb85', 17, 26, 13, 4);
  R(g, '#e5bb85', 59, 26, 13, 4);
  R(g, '#ba8d60', 29, 32, 32, 13);
  R(g, '#e2b97f', 31, 32, 27, 3);
  for (const x of [33, 39, 51, 57]) R(g, '#e0b780', x, 35, 2, 10);
  R(g, '#89644f', 44, 36, 6, 9);
  R(g, '#b99a77', 46, 46, 2, 9);
  R(g, '#b99a77', 46, 54, 31, 2);
  R(g, '#886151', 75, 53, 4, 4);
}];
DRAW['big.preserved.catalogue'] = [96, 64, (g) => {
  R(g, '#263747', 0, 0, 96, 64);
  R(g, '#3c5969', 8, 9, 79, 47);
  paper(g, 13, 7, 36, 44);
  paper(g, 53, 13, 30, 38);
  R(g, '#648491', 18, 12, 22, 3);
  R(g, '#947157', 57, 18, 14, 3);
  for (let y = 20; y <= 43; y += 6) R(g, '#a09880', 18, y, 24 - (y % 5), 1);
  for (let y = 25; y <= 42; y += 5) R(g, '#a09880', 57, y, 20 - (y % 4), 1);
  R(g, '#b36c56', 42, 7, 4, 9);
  R(g, '#a6c1c8', 77, 13, 3, 8);
}];
DRAW['big.preserved.coast'] = [96, 64, (g) => {
  R(g, '#354d57', 0, 0, 96, 64);
  R(g, '#e8cf9d', 6, 5, 84, 54);
  const shore = [37, 44, 43, 36, 29, 31, 36, 39, 35];
  for (const [i, stop] of shore.entries()) {
    R(g, '#7cbdca', 6, 5 + i * 6, stop, 6);
    R(g, '#b6d8d7', stop + 3, 5 + i * 6, 3, 6);
  }
  R(g, '#bb9d73', 66, 8, 2, 48);
  R(g, '#c7a877', 72, 8, 4, 48);
  for (const [x, y] of [[53, 14], [46, 35], [70, 43]]) {
    R(g, '#f2e1bc', x - 1, y - 1, 7, 7);
    R(g, '#694b68', x, y, 5, 5);
  }
}];
DRAW['big.preserved.context'] = [96, 64, (g) => {
  R(g, '#32404c', 0, 0, 96, 64);
  paper(g, 6, 6, 84, 52);
  for (const [i, x] of [11, 50].entries()) {
    R(g, '#78939f', x, 13, 35, 5);
    R(g, '#e6ba84', x, 18, 35, 9);
    R(g, '#be885d', x, 27, 35, 5);
    R(g, '#9b6f60', x, 32, 35, 10);
    R(g, '#d4a57b', x + 4, 23 + i * 5, 26, 2);
    R(g, '#768c95', x + 3, 47, 21, 2);
    R(g, '#a39980', x + 3, 52, 16, 1);
  }
}];

// Local equipment on the Observatory Coast.
DRAW['coast.waypost'] = [16, 24, (g) => {
  R(g, '#314858', 7, 7, 3, 16);
  R(g, '#e0c795', 2, 5, 11, 7);
  R(g, '#e0c795', 13, 6, 2, 5);
  R(g, '#707e76', 3, 10, 10, 1);
  R(g, '#425d62', 4, 8, 3, 1);
  R(g, '#425d62', 7, 7, 3, 1);
  R(g, '#425d62', 10, 6, 2, 1);
}];
DRAW['coast.gauge'] = [16, 24, (g) => {
  pedestal(g, 1, 15, 14);
  R(g, '#648e9e', 4, 2, 8, 13);
  R(g, '#d2e4da', 5, 3, 6, 11);
  R(g, '#77b2c6', 5, 10, 6, 4);
  for (const y of [5, 7, 9, 11, 13]) R(g, '#425c6f', 8, y, 3, 1);
}];
DRAW['coast.signal'] = [16, 24, (g) => {
  R(g, '#3e565f', 2, 4, 2, 20);
  R(g, '#3e565f', 12, 4, 2, 20);
  R(g, '#a38d6c', 0, 7, 16, 11);
  R(g, '#e5c896', 1, 7, 14, 2);
  paper(g, 3, 10, 9, 6);
  R(g, '#e09b38', 4, 4, 8, 3);
  R(g, '#bb6f39', 9, 6, 3, 2);
  R(g, '#6b8d92', 5, 12, 5, 1);
}];
DRAW['coast.runner'] = [16, 24, (g) => {
  smallTable(g);
  R(g, '#385367', 1, 6, 13, 8);
  paper(g, 3, 4, 11, 8);
  R(g, '#d49762', 3, 5, 2, 5);
  R(g, '#7b7766', 6, 7, 6, 1);
  R(g, '#7b7766', 6, 9, 4, 1);
}];

// Living Forest equipment and a schematic field note.
DRAW['forest.waypost'] = [16, 24, (g) => {
  R(g, '#574235', 7, 7, 3, 16);
  R(g, '#8f7752', 2, 5, 11, 8);
  R(g, '#8f7752', 13, 7, 2, 4);
  R(g, '#d5cd9c', 3, 6, 10, 1);
  R(g, '#45664d', 5, 8, 5, 2);
  R(g, '#45664d', 7, 7, 3, 4);
}];
DRAW['forest.screen'] = [16, 24, (g) => {
  R(g, '#494939', 1, 6, 2, 17);
  R(g, '#494939', 13, 6, 2, 17);
  R(g, '#567653', 2, 9, 12, 10);
  for (const x of [4, 7, 10, 12]) R(g, '#9c9b5d', x, 9 - x % 3, 1, 10);
  R(g, '#c1c48a', 4, 12, 8, 2);
  R(g, '#3a5947', 3, 16, 10, 1);
}];
DRAW['forest.ridge'] = [16, 24, (g) => {
  R(g, '#555e58', 0, 12, 16, 10);
  R(g, '#a6b098', 1, 12, 14, 4);
  R(g, '#c8c8a9', 3, 12, 10, 1);
  R(g, '#475944', 2, 6, 2, 7);
  R(g, '#475944', 12, 6, 2, 7);
  R(g, '#82936e', 2, 6, 12, 2);
  R(g, '#d5c494', 6, 8, 4, 4);
}];
DRAW['forest.notice'] = [16, 24, (g) => {
  R(g, '#544639', 3, 5, 2, 18);
  R(g, '#544639', 11, 5, 2, 18);
  R(g, '#69865e', 1, 4, 14, 12);
  R(g, '#9db284', 1, 4, 14, 2);
  paper(g, 4, 7, 8, 7);
  R(g, '#6e6851', 6, 9, 4, 1);
}];
DRAW['forest.field-diagram'] = [16, 24, (g) => {
  pedestal(g, 1, 15, 14);
  paper(g, 2, 4, 12, 10);
  R(g, '#77a18b', 4, 6, 5, 4);
  R(g, '#a4ae75', 6, 8, 5, 4);
  R(g, '#8e6756', 10, 6, 2, 2);
}];
DRAW['big.forest.field-diagram'] = [96, 64, (g) => {
  R(g, '#344e43', 0, 0, 96, 64);
  paper(g, 6, 5, 84, 55);
  R(g, '#a8bb8f', 10, 10, 53, 43);
  R(g, '#729a7d', 10, 12, 22, 20);
  R(g, '#578473', 15, 16, 17, 18);
  R(g, '#98a878', 40, 20, 23, 27);
  R(g, '#5b9ca7', 27, 29, 5, 24);
  R(g, '#5b9ca7', 27, 28, 14, 4);
  R(g, '#5b9ca7', 37, 10, 4, 20);
  for (const [x, y] of [[16, 40], [21, 36], [27, 33], [33, 27], [39, 26], [45, 22], [51, 17]]) R(g, '#745b51', x, y, 2, 2);
  for (const y of [14, 22, 30, 38, 46]) R(g, '#94886e', 69, y, 16 - y % 5, 1);
}];

DRAW['forest.guide-rail'] = [32, 16, (g) => {
  R(g, '#4d4234', 1, 10, 30, 3);
  R(g, '#b59a69', 1, 10, 30);
  R(g, '#624d37', 4, 3, 4, 11);
  R(g, '#624d37', 24, 5, 3, 9);
  R(g, '#c4a879', 5, 3, 2, 7);
  R(g, '#c4a879', 25, 5, 1, 5);
}];

// The end post covers the second line from the bank. From the rise, the gap is visible.
function railTracing(g: Ctx, x: number, hasGap: boolean) {
  R(g, '#624d37', x + 7, 12, 2, 11);
  R(g, '#686245', x + 1, 4, 14, 13);
  paper(g, x + 3, 6, 10, 9);
  R(g, '#483d3b', x + 5, 8, 2, 5);
  if (hasGap) R(g, '#483d3b', x + 10, 9, 1, 4);
  R(g, '#7c7755', x + 4, 13, 8);
}
DRAW['forest.guide-level'] = [16, 24, (g) => railTracing(g, 0, false)];
DRAW['forest.guide-rise'] = [16, 24, (g) => railTracing(g, 0, true)];
DRAW['forest.guide-hinges'] = [32, 24, (g) => {
  railTracing(g, 0, false);
  railTracing(g, 16, true);
  R(g, '#a78d5e', 14, 7, 4, 2);
  R(g, '#a78d5e', 14, 13, 4, 2);
}];

// Metalworks weighing stands and trade records.
DRAW['metalworks.waypost'] = [16, 24, (g) => {
  R(g, '#3e383b', 3, 4, 10, 20);
  R(g, '#65615b', 4, 4, 8, 2);
  R(g, '#a18765', 1, 6, 14, 10);
  R(g, '#d8bb85', 2, 7, 12, 1);
  R(g, '#567583', 4, 9, 8, 5);
  R(g, '#acc0b6', 6, 11, 4, 1);
}];
function metalPanel(g: Ctx, base: string) {
  R(g, '#383c42', 2, 13, 12, 10);
  R(g, base, 3, 13, 10, 8);
  R(g, '#596472', 1, 11, 14, 3);
  R(g, '#6c93b5', 2, 7, 12, 5);
  R(g, '#afc6d4', 3, 7, 10, 1);
  R(g, '#456784', 2, 11, 12, 1);
}
DRAW['metalworks.panel-a'] = [16, 24, (g) => metalPanel(g, '#957a61')];
DRAW['metalworks.panel-b'] = [16, 24, (g) => metalPanel(g, '#627c79')];
DRAW['metalworks.receipt'] = [16, 24, (g) => {
  smallTable(g);
  paper(g, 3, 4, 10, 9);
  R(g, '#a77e64', 5, 6, 5, 1);
  R(g, '#6d7180', 5, 8, 6, 1);
  R(g, '#6d7180', 5, 10, 4, 1);
  R(g, '#6f93a9', 9, 11, 2, 2);
}];
DRAW['metalworks.window'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  R(g, '#5d727a', 2, 4, 20, 10);
  R(g, '#8eb3bd', 3, 5, 18, 6);
  R(g, '#527ca7', 5, 6, 5, 3);
  R(g, '#527ca7', 14, 6, 5, 3);
  paper(g, 5, 10, 5, 3);
  paper(g, 14, 10, 5, 3);
}];
const cache = new Map<string, HTMLCanvasElement>();

export function drawArt(key: string): HTMLCanvasElement | null {
  if (cache.has(key)) return cache.get(key)!;
  const d = DRAW[key];
  if (!d) return null;
  const [c, g] = canvas(d[0], d[1]);
  d[2](g);
  cache.set(key, c);
  return c;
}

export function artURL(key: string): string {
  return drawArt(key)?.toDataURL() ?? '';
}

export function artKeys(): string[] { return Object.keys(DRAW); }

/** A soft radial gradient used for light pools and glows. */
export function glowCanvas(size = 128): HTMLCanvasElement {
  const [c, g] = canvas(size, size);
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  return c;
}

/** Map exhibit art keys (small) to large inspection pictures. */
export const BIG_ART: Record<string, string> = {
  'nile.scroll': 'nile.scroll', 'nile.tablet': 'nile.tablet', 'nile.map': 'nile.map', 'nile.stone': 'nile.stone',
  'preserved.temple': 'big.preserved.temple', 'preserved.catalogue': 'big.preserved.catalogue',
  'preserved.coast': 'big.preserved.coast', 'preserved.context': 'big.preserved.context',
  'forest.field-diagram': 'big.forest.field-diagram',
  'exhibit.patent': 'big.patent', 'exhibit.model': 'big.model', 'exhibit.biro': 'big.biro',
  'exhibit.blade': 'big.blade', 'exhibit.ingots': 'big.ingots', 'exhibit.assay': 'big.assay',
  'plaque.earth': 'big.earth', 'plaque.optics': 'big.optics', 'plaque.type': 'big.type', 'plaque.peak': 'big.peak',
  'plaque.flight': 'big.flight', 'plaque.vote': 'big.vote', 'plaque.book': 'big.book',
};
