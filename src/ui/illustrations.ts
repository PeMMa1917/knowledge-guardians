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
  'exhibit.patent': 'big.patent', 'exhibit.model': 'big.model', 'exhibit.biro': 'big.biro',
  'exhibit.blade': 'big.blade', 'exhibit.ingots': 'big.ingots', 'exhibit.assay': 'big.assay',
  'plaque.earth': 'big.earth', 'plaque.optics': 'big.optics', 'plaque.type': 'big.type', 'plaque.peak': 'big.peak',
  'plaque.flight': 'big.flight', 'plaque.vote': 'big.vote', 'plaque.book': 'big.book',
};
