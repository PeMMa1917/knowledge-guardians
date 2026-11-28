/**
 * Drawing for the Guardian's quarters (original pixel art, drawn in code).
 * The room is 192 x 128 logical pixels and is scaled up with CSS.
 */
import { FLOORS, LAMPS, PETS, PLANTS, RUGS, VIEWS, WALLS, starPoints, type Room } from '../domain/quarters';
import { crestPixels, type Crest } from '../domain/crest';

type G = CanvasRenderingContext2D;
const R = (g: G, c: string, x: number, y: number, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
export const ROOM_W = 192, ROOM_H = 128;
/** Shelf slot positions (left x, shelf top y) for the six slots. */
export const SLOT_POS: [number, number][] = [[68, 52], [89, 52], [110, 52], [131, 52], [68, 76], [89, 76], [110, 76], [131, 76]];

/** Keepsake icons, 12 x 12. Each line is a row; letters index the palette. */
const ICONS: Record<string, { pal: Record<string, string>; rows: string[] }> = {
  'pen-tip': { pal: { a: '#9aa3b5', b: '#e8edf5', c: '#3b3355' }, rows: ['', '', '         b', '        ba', '       ba', '      ba', '     ba', '    ca', '   cc', '  c', '', ''] },
  'date-lens': { pal: { a: '#c9a24a', b: '#9fe8ff', c: '#6b4f19' }, rows: ['', '   aaaa', '  abbbba', ' abbbbbba', ' abbbbbba', ' abbbbbba', ' abbbbbba', '  abbbba', '   aaaa', '       cc', '        cc', ''] },
  'door-key': { pal: { a: '#e9c45a', b: '#6b4f19' }, rows: ['', '  aaa', ' a   a', ' a   a', '  aaa', '   a', '   a', '   aa', '   a', '   aa', '', ''] },
  'moth-lamp': { pal: { a: '#ffe9a8', b: '#9fe8ff', c: '#5b3b22', d: '#c39bff' }, rows: ['  d   d', ' ddd ddd', '  d b d', '    b', '   aaa', '  aaaaa', '  aaaaa', '  aaaaa', '   aaa', '   ccc', '  ccccc', ''] },
  'so-what': { pal: { a: '#8b8f99', b: '#b7bcc6', c: '#2a2440' }, rows: ['', '', '   bbbb', '  bbbbbb', ' baacaaab', ' baccaaab', ' baacaaab', ' baacaaab', '  aaaaaa', '   aaaa', '', ''] },
  'glass-piece': { pal: { a: '#2e86c1', b: '#9fe8ff', c: '#2a2a33' }, rows: ['', '    c', '   cac', '  caabc', '  caaabc', ' caaaaabc', ' caaaaaac', '  caaaac', '   caac', '    cc', '', ''] },
  notice: { pal: { a: '#f3eee0', b: '#8a7f66', c: '#b8483e' }, rows: ['', ' aaaaaaaa', ' a  c   a', ' abbbbb a', ' a      a', ' abbbb  a', ' a      a', ' abbbbbba', ' a      a', ' aaaaaaaa', '', ''] },
  'thread-knot': { pal: { a: '#e9cf7a', b: '#c9a24a' }, rows: ['', 'a', ' a', '  a  bb', '   abbab', '    bab', '   babba', '    bb  a', '         a', '          a', '', ''] },
  'check-weight': { pal: { a: '#d9b45a', b: '#6b4f19', c: '#fff3c4' }, rows: ['', '', '    bb', '   b  b', '   bbbb', '  aaaaaa', '  acaaaa', ' aaaaaaaa', ' aaaaaaaa', ' bbbbbbbb', '', ''] },
  'copper-pot': { pal: { a: '#c87533', b: '#8a4a22', c: '#f2b880' }, rows: ['', '', '  bbbbbbb', '   accaa', '  aacaaaa', ' baacaaaab', ' baaaaaaab', '  aaaaaaa', '  aaaaaaa', '   bbbbb', '', ''] },
  'folded-map': { pal: { a: '#efe1bd', b: '#c9b48a', c: '#e0607e', d: '#b98d55' }, rows: ['', '', ' aaabbbaaa', ' aaabbbaaa', ' adddbddda', ' aaabcbaaa', ' aaabbbaca', ' acabbbaaa', ' aaabbbaaa', ' aaabbbaaa', '', ''] },
  'brass-cog': { pal: { a: '#d9b45a', b: '#6b4f19', c: '#fff3c4' }, rows: ['', '    a a', '  aaaaaaa', '  aabbbaa', ' aaab bcaa', '  aab baa', ' aaab baaa', '  aabbbaa', '  aaaaaaa', '    a a', '', ''] },
  'knot-rope': { pal: { a: '#c9a27a', b: '#8a6a4a' }, rows: ['', '', ' a', '  a', '   a  bb', '    abbab', '     bab', '    babba', '   a  bb', '  a', ' a', ''] },
  yarn: { pal: { a: '#d9534a', b: '#e9cf7a' }, rows: ['', '', '   aab', '  aabba', ' aabbaab', ' abbaabb', ' bbaabba', '  aabba', '   bba  a', '         a', '          b', ''] },
  'soot-jar': { pal: { a: '#cfe3ef', b: '#3b2f25', c: '#8a5a30' }, rows: ['', '', '   cccc', '   a  a', '  a    a', '  a    a', '  abbbba', '  abbbba', '  abbbba', '   aaaa', '', ''] },
  'sign-splinter': { pal: { a: '#b07a44', b: '#5b3b22', c: '#e9c45a' }, rows: ['', '', '         a', '       aab', '     aacb', '   aaab', ' aaabb', 'abbb', '', '', '', ''] },
  'rumour-shard': { pal: { a: '#c39bff', b: '#7d5bc4', c: '#f3eee0' }, rows: ['', '     c', '    aa', '    aab', '   aaab', '   aaabb', '  aaaabb', '  aabbbb', '   bbbb', '    bb', '', ''] },
  'well-rope': { pal: { a: '#c9a27a', b: '#8a6a4a' }, rows: ['  a', '  a', '  ab', '  a', '  ab', ' aaa', '  ab', '  a', '  ab', ' aaa', '  a', '  b'] },
  'survey-slip': { pal: { a: '#efe6cf', b: '#8a7a5a', c: '#3f7f5c' }, rows: ['', '  aaaaaaaa', '  abbbbbba', '  aaaaaaaa', '  ac abbba', '  aaaaaaaa', '  ac abbba', '  aaaaaaaa', '  a  abbba', '  aaaaaaaa', '', ''] },
  'ferry-chalk': { pal: { a: '#e8efe8', b: '#b9c9c3', c: '#2f3b3a' }, rows: ['', '', '', '    cccccc', '   caaaaac', '  caaaaabc', '  cbbbbbbc', '   cccccc', '', '', '', ''] },
  'paper-frame': { pal: { a: '#f6c453', b: '#9fd3ff', c: '#cdb894' }, rows: ['', '  aaaaaaaa', '  abbbbbba', '  abbbbbba', '  acccccca', '  acccccca', '  aaaaaaaa', '', '', '', '', ''] },
  'tiny-bell': { pal: { a: '#c9a24a', b: '#e9cf7a', c: '#8a6a2a' }, rows: ['', '     cc', '    abba', '   aabbaa', '   aaabaa', '   aaaaaa', '  aaaaaaaa', '  cccccccc', '     cc', '', '', ''] },
  'weather-glass': { pal: { a: '#a87445', b: '#f3eee0', c: '#b03a2e' }, rows: ['', '   aaaaaa', '  abbbbbba', ' abbbbbbbba', ' abbbcbbbba', ' abbcbbbbba', ' abcbbbbbba', ' abbbbbbbba', '  abbbbbba', '   aaaaaa', '', ''] },
  seal: { pal: { a: '#b8483e', b: '#8a2f28', c: '#e9cf7a' }, rows: ['', '   aaaa', '  aaaaaa', ' aabccbaa', ' aacbbcaa', ' aacbbcaa', ' aabccbaa', '  aaaaaa', '   aaaa', '', '', ''] },
};

export function drawIcon(g: G, id: string, x: number, y: number): void {
  const ic = ICONS[id];
  if (!ic) { R(g, '#c9a24a', x + 3, y + 4, 6, 6); R(g, '#6b4f19', x + 3, y + 9, 6, 1); return; }
  ic.rows.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ic.pal[ch]) R(g, ic.pal[ch], x + rx, y + ry); }));
}

export function iconCanvas(id: string, scale = 3): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = 12 * scale; c.height = 12 * scale;
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false; g.scale(scale, scale); drawIcon(g, id, 0, 0);
  c.className = 'keepsake-icon'; c.setAttribute('aria-hidden', 'true');
  return c;
}

export interface RoomExtras { rings: { got: number; max: number; colour: string }[]; crest: Crest | null; lumen: string; selected: number | null; t: number }

/** The room companion, on the rug. `t` (ms) moves tails, blinks eyes and lifts the 'z'. */
function drawPet(g: G, pet: string, t: number): void {
  if (!PETS[pet]) return;
  const px = 92, py = 112; // feet line
  const sh = (x: number, w: number) => { g.globalAlpha = 0.25; R(g, '#000', x, py, w, 2); g.globalAlpha = 1; };
  const blink = Math.floor(t / 180) % 24 === 0;
  const zzz = (x: number, y: number) => { const k = (t / 900) % 1; g.globalAlpha = 1 - k; R(g, '#e8efe8', x + Math.round(k * 4), y - Math.round(k * 10), 3, 1); R(g, '#e8efe8', x + 2 + Math.round(k * 4), y + 1 - Math.round(k * 10), 1, 1); R(g, '#e8efe8', x + Math.round(k * 4), y + 2 - Math.round(k * 10), 3, 1); g.globalAlpha = 1; };
  if (pet === 'cat') {
    sh(px - 2, 20); R(g, '#d9822b', px, py - 8, 14, 8); R(g, '#d9822b', px + 10, py - 13, 8, 7); R(g, '#d9822b', px + 10, py - 15, 2, 2); R(g, '#d9822b', px + 16, py - 15, 2, 2);
    R(g, '#f3c27a', px + 2, py - 4, 10, 4); R(g, '#b0621a', px + 3, py - 8, 2, 4); R(g, '#b0621a', px + 7, py - 8, 2, 4);
    if (!blink) { R(g, '#2a1d14', px + 12, py - 11, 1, 1); R(g, '#2a1d14', px + 15, py - 11, 1, 1); } else { R(g, '#2a1d14', px + 12, py - 10, 1, 1); R(g, '#2a1d14', px + 15, py - 10, 1, 1); }
    R(g, '#e07a8a', px + 13, py - 9, 2, 1);
    const sw = Math.round(Math.sin(t / 400) * 3); for (let k = 0; k < 7; k++) R(g, '#d9822b', px - 1 - k, py - 3 - Math.round((k * k) / 8) + (k > 3 ? sw : 0), 2, 2);
  } else if (pet === 'owl') {
    sh(px + 2, 12); R(g, '#7a5a3a', px + 2, py - 14, 12, 14); R(g, '#a07a50', px + 4, py - 8, 8, 8); R(g, '#7a5a3a', px + 2, py - 16, 2, 2); R(g, '#7a5a3a', px + 12, py - 16, 2, 2);
    if (!blink) { R(g, '#ffd25a', px + 4, py - 13, 3, 3); R(g, '#ffd25a', px + 9, py - 13, 3, 3); R(g, '#1b1b1b', px + 5, py - 12, 1, 1); R(g, '#1b1b1b', px + 10, py - 12, 1, 1); }
    else { R(g, '#3b2a1a', px + 4, py - 12, 3, 1); R(g, '#3b2a1a', px + 9, py - 12, 3, 1); }
    R(g, '#c9a24a', px + 7, py - 10, 2, 2); R(g, '#c9a24a', px + 5, py, 2, 1); R(g, '#c9a24a', px + 9, py, 2, 1);
  } else if (pet === 'tortoise') {
    const hx = Math.round((Math.sin(t / 1400) + 1) * 1.5);
    sh(px - 2, 22); R(g, '#8a9a5a', px + 15 + hx, py - 6, 5, 4); R(g, '#1b1b1b', px + 18 + hx, py - 5, 1, 1);
    R(g, '#8a9a5a', px, py - 2, 3, 2); R(g, '#8a9a5a', px + 12, py - 2, 3, 2);
    R(g, '#6b4a2a', px, py - 9, 16, 7); R(g, '#6b4a2a', px + 2, py - 11, 12, 2); R(g, '#a07a40', px + 3, py - 8, 4, 3); R(g, '#a07a40', px + 9, py - 8, 4, 3); R(g, '#a07a40', px + 6, py - 11, 4, 2);
  } else if (pet === 'hedgehog') {
    const br = Math.round(Math.sin(t / 600)); sh(px, 18);
    R(g, '#5b4632', px, py - 8 - br, 14, 8 + br); for (let k = 0; k < 7; k++) R(g, '#3b2a1a', px + k * 2, py - 10 - br - (k % 2), 1, 3);
    R(g, '#d8b890', px + 12, py - 5, 6, 5); R(g, '#1b1b1b', px + 17, py - 4, 1, 1); if (!blink) R(g, '#1b1b1b', px + 14, py - 4, 1, 1);
  } else if (pet === 'fox') {
    const br = Math.sin(t / 700) > 0 ? 1 : 0; sh(px - 2, 22);
    R(g, '#d9622b', px, py - 7 - br, 18, 7 + br); R(g, '#d9622b', px + 12, py - 10 - br, 7, 5); R(g, '#d9622b', px + 13, py - 12 - br, 2, 2); R(g, '#d9622b', px + 17, py - 12 - br, 2, 2);
    R(g, '#f3eee0', px + 16, py - 7 - br, 4, 2); R(g, '#2a1d14', px + 14, py - 8 - br, 2, 1);
    R(g, '#d9622b', px - 4, py - 4, 8, 4); R(g, '#f3eee0', px - 6, py - 4, 3, 3);
    zzz(px + 20, py - 16);
  } else if (pet === 'axolotl') {
    const bob = Math.round(Math.sin(t / 500) * 1.5);
    sh(px - 2, 22); g.globalAlpha = 0.55; R(g, '#cfe8ef', px - 2, py - 16, 22, 16); g.globalAlpha = 1; R(g, '#9fc4e8', px - 2, py - 10, 22, 10);
    R(g, '#e9eef0', px - 2, py - 17, 22, 1); R(g, '#7aa06a', px + 1, py - 4, 2, 4); R(g, '#7aa06a', px + 16, py - 5, 2, 5);
    R(g, '#f2a7b8', px + 4, py - 8 + bob, 10, 3); R(g, '#f2a7b8', px + 12, py - 10 + bob, 4, 4); R(g, '#e0607e', px + 12, py - 12 + bob, 1, 2); R(g, '#e0607e', px + 15, py - 12 + bob, 1, 2); R(g, '#1b1b1b', px + 14, py - 9 + bob, 1, 1);
    R(g, '#f2a7b8', px + 2, py - 7 + bob, 3, 1);
  }
}

export function drawRoom(g: G, r: Room, x: RoomExtras): void {
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, ROOM_W, ROOM_H);
  // Ceiling: the Star Chart.
  R(g, '#10142e', 0, 0, ROOM_W, 22); R(g, '#3b2a1a', 0, 22, ROOM_W, 2);
  for (let i = 0; i < 40; i++) R(g, '#2a3160', (i * 53) % ROOM_W, (i * 29) % 20 + 1);
  x.rings.forEach((ring, i) => {
    const n = ring.max > 0 && ring.got > 0 ? Math.max(1, Math.min(5, Math.floor((ring.got / ring.max) * 5 + 1e-9))) : 0;
    const pts = starPoints(i, n, ROOM_W, 20);
    if (n === 5) { g.strokeStyle = ring.colour; g.globalAlpha = 0.5; g.lineWidth = 0.6; g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px + 0.5, py + 1.5) : g.moveTo(px + 0.5, py + 1.5))); g.stroke(); g.globalAlpha = 1; }
    pts.forEach(([px, py], k) => {
      const tw = 0.6 + 0.4 * Math.sin(x.t / 500 + i * 1.7 + k);
      g.globalAlpha = tw; R(g, ring.colour, px, py + 1); R(g, ring.colour, px - 1, py + 1, 3, 1); R(g, ring.colour, px, py, 1, 3); R(g, '#ffffff', px, py + 1); g.globalAlpha = 1;
    });
  });
  // Wall.
  const w = WALLS[r.wall];
  R(g, w.base, 0, 24, ROOM_W, 64);
  for (let yy = 24; yy < 88; yy++) for (let xx = 0; xx < ROOM_W; xx++) {
    if (w.kind === 'stripe' && xx % 12 < 4) R(g, w.line, xx, yy);
    else if (w.kind === 'brick' && ((yy - 24) % 6 === 5 || (xx + (Math.floor((yy - 24) / 6) % 2) * 6) % 12 === 0)) R(g, w.line, xx, yy);
    else if (w.kind === 'panel' && (xx % 24 === 0 || yy === 60 || yy === 61)) R(g, w.line, xx, yy);
    else if (w.kind === 'dots' && xx % 10 === 4 && (yy - 24) % 10 === 4) R(g, w.line, xx, yy);
    else if (w.kind === 'plain' && (xx * 7 + yy * 13) % 41 === 0) R(g, w.line, xx, yy);
  }
  R(g, '#3b2a1a', 0, 86, ROOM_W, 2);
  // Window with its view.
  const v = VIEWS[r.view];
  R(g, '#3b2a1a', 12, 32, 40, 40); R(g, v.sky, 14, 34, 36, 36);
  if (v.kind === 'stars') { for (let i = 0; i < 14; i++) R(g, '#f3eee0', 15 + (i * 17) % 34, 35 + (i * 11) % 24); R(g, '#e9cf7a', 40, 38, 3, 3); }
  if (v.kind === 'roofs') { R(g, '#ffd28a', 36, 38, 5, 5); for (let i = 0; i < 4; i++) { R(g, v.ground, 14 + i * 9, 56 - (i % 2) * 3, 8, 14); R(g, '#5b2a1e', 14 + i * 9, 55 - (i % 2) * 3, 8, 2); } R(g, '#ffd28a', 18, 60); R(g, '#ffd28a', 36, 62); }
  if (v.kind === 'sea') { R(g, v.ground, 14, 54, 36, 16); for (let i = 0; i < 6; i++) R(g, '#cfe3ef', 16 + i * 6 + Math.round(Math.sin(x.t / 700 + i) * 1.5), 58 + (i % 3) * 4, 3, 1); }
  if (v.kind === 'hills') { for (let xx = 14; xx < 50; xx++) { const hgt = 10 + Math.round(5 * Math.sin(xx / 6)); R(g, v.ground, xx, 70 - hgt, 1, hgt); } R(g, '#fff3c4', 22, 38, 4, 4); }
  R(g, '#3b2a1a', 31, 34, 2, 36); R(g, '#3b2a1a', 14, 51, 36, 2); R(g, '#5b3b22', 10, 72, 44, 3);
  // Crest banner.
  if (x.crest) {
    R(g, '#3b2a1a', 152, 28, 26, 1);
    const px = crestPixels(x.crest, 24);
    for (let yy = 0; yy < 24; yy++) for (let xx = 0; xx < 24; xx++) {
      const o = (yy * 24 + xx) * 4;
      if (px[o + 3] > 0) R(g, `rgb(${px[o]},${px[o + 1]},${px[o + 2]})`, 153 + xx, 30 + yy);
    }
  } else { R(g, '#3b2a1a', 152, 28, 26, 1); R(g, '#e9e0c8', 156, 30, 18, 24); R(g, '#c7b58f', 158, 34, 14, 1); R(g, '#c7b58f', 158, 38, 10, 1); }
  // Shelves and keepsakes.
  for (const sy of [52, 76]) { R(g, '#5b3b22', 63, sy, 88, 3); R(g, '#8a5a30', 63, sy, 88, 1); R(g, '#3b2a1a', 67, sy + 3, 2, 4); R(g, '#3b2a1a', 145, sy + 3, 2, 4); }
  SLOT_POS.forEach(([sx, sy], i) => {
    const id = r.shelf[i];
    if (x.selected === i) { g.globalAlpha = 0.35 + 0.2 * Math.sin(x.t / 200); R(g, '#fff3c4', sx - 1, sy - 13, 16, 13); g.globalAlpha = 1; }
    if (id) drawIcon(g, id, sx + 1, sy - 12);
  });
  // Floor.
  const f = FLOORS[r.floor];
  R(g, f.a, 0, 88, ROOM_W, 40);
  for (let yy = 88; yy < ROOM_H; yy++) for (let xx = 0; xx < ROOM_W; xx++) {
    if (f.kind === 'boards' && ((yy - 88) % 6 === 5 || (xx + ((yy - 88) / 6 | 0) * 17) % 40 === 0)) R(g, f.b, xx, yy);
    if (f.kind === 'tiles' && (((xx / 8) | 0) + (((yy - 88) / 8) | 0)) % 2 === 0) R(g, f.b, xx, yy);
    if (f.kind === 'stone' && ((yy - 88) % 10 === 9 || (xx + (((yy - 88) / 10) | 0) * 9) % 18 === 0)) R(g, f.b, xx, yy);
  }
  const rug = RUGS[r.rug];
  if (rug) {
    for (let yy = 0; yy < 22; yy++) for (let xx = 0; xx < 90; xx++) {
      const dx = (xx - 45) / 45, dy = (yy - 11) / 11, d = dx * dx + dy * dy;
      if (d <= 1) R(g, d > 0.72 || (d > 0.3 && d < 0.4) ? rug.b : rug.a, 52 + xx, 100 + yy);
    }
  }
  // Lamp and glow.
  const lamp = LAMPS[r.lamp];
  const glow = r.lamp === 'lumen' ? x.lumen : lamp.glow;
  const fl = 0.9 + 0.1 * Math.sin(x.t / 130) * Math.sin(x.t / 310);
  const grad = g.createRadialGradient(170, 92, 2, 170, 92, 46 * fl);
  grad.addColorStop(0, `${glow}88`); grad.addColorStop(1, `${glow}00`);
  g.fillStyle = grad; g.fillRect(120, 46, 72, 82);
  R(g, '#3b2a1a', 169, 98, 2, 22); R(g, '#3b2a1a', 164, 119, 12, 2);
  if (r.lamp === 'lantern') { R(g, '#6b4f19', 164, 86, 12, 2); R(g, '#c9a24a', 165, 88, 10, 10); R(g, glow, 167, 90, 6, 6); R(g, '#6b4f19', 164, 98, 12, 1); }
  if (r.lamp === 'moonshade') {
    R(g, '#63556d', 164, 84, 12, 2); R(g, '#bb8793', 162, 86, 16, 9);
    R(g, '#dfabb3', 164, 95, 12, 3); R(g, glow, 166, 87, 2, 6);
    R(g, glow, 168, 92, 5, 2); R(g, glow, 173, 91, 1, 2);
  }
  if (r.lamp === 'candle') { R(g, '#c9a24a', 165, 96, 10, 2); R(g, '#f3eee0', 168, 84, 4, 12); R(g, glow, 169, 80 + Math.round(Math.sin(x.t / 90)), 2, 4); }
  if (r.lamp === 'lumen') { R(g, '#cfe3ef', 164, 84, 12, 14); R(g, '#8a5a30', 165, 82, 10, 2); R(g, glow, 168 + Math.round(Math.sin(x.t / 400) * 2), 88 + Math.round(Math.cos(x.t / 330) * 2), 3, 3); }
  if (r.lamp === 'forge') { R(g, '#4a4d55', 162, 92, 16, 6); R(g, '#ff6a3a', 164, 90, 12, 3); R(g, '#ffd28a', 167 + Math.round(Math.sin(x.t / 120)), 88, 3, 2); }
  // Plant.
  const pl = PLANTS[r.plant];
  if (pl) {
    R(g, '#a0522d', 6, 112, 12, 10); R(g, '#7a3d22', 6, 112, 12, 2);
    if (r.plant === 'cactus') { R(g, pl.leaf, 10, 96, 4, 16); R(g, pl.leaf, 7, 102, 3, 2); R(g, pl.leaf, 7, 99, 2, 4); R(g, pl.leaf, 14, 100, 3, 2); R(g, pl.leaf, 15, 97, 2, 4); }
    else for (let k = 0; k < 7; k++) { const a = -1.4 + k * 0.47; for (let s = 0; s < 12; s++) R(g, pl.leaf, 12 + Math.round(Math.sin(a) * s * 0.8), 112 - Math.round(Math.cos(a) * s)); }
    if (pl.flower) for (let k = 0; k < 4; k++) R(g, pl.flower, 6 + k * 4, 98 + (k % 2) * 3, 2, 2);
  }
  if (r.pet) drawPet(g, r.pet, x.t);
}
