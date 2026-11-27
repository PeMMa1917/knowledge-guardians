import { UNDERPAN_ART } from './underpanArt';
import { SPARE_MOON_ART } from './spareMoonArt';
import { FOURTH_CORNER_ART } from './fourthCornerArt';
import { BLUE_TAIL_ART } from './blueTailArt';
/**
 * Original procedural pixel art, drawn in code (no external files).
 * Used for exhibits, icons, the fairy guide and inspection pictures.
 *
 * Historical objects here are SIMPLIFIED ORIGINAL drawings based on the
 * written records (spec 21.1). They are not copies of museum photographs.
 * Each picture has a text description in the content data (altText).
 */
import { POLAR_ART } from './polarStoreArt';
import { WINDOW_ART } from './windowShopArt';
import { READING_WORKS_ART } from './readingWorksArt';
import { STORY_ARCHIVE_ART, STORY_ARCHIVE_LARGE_ART } from './storyArchiveArt';
import { NUMBER_LEAF_ART } from './numberLeafArt';
import { DEPOT_ART } from './surveyDepotArt';
import { REFERENCE_STATION_ART } from './referenceStationArt';
import { MODEL_RECORD_ART } from './modelRecordArt';
import { LOAD_BAY_ART } from './loadingBayArt';
import { BEARING_ART } from './bearingBayArt';
import { PRISM_ART } from './prismViewerArt';
import { ALIGNMENT_ART } from './mapAlignmentArt';
import { SECOND_READING_ART } from './secondReadingArt';
import { SHORE_REPLY_ART } from './shoreReplyArt';
import { JIG_SHOP_ART } from './jigShopArt';
import { MEMORY_CART_ART } from './memoryCartArt';
import { PRICE_DRAWERS_ART } from './priceDrawersArt';
import { REFERENCE_PROOF_ART } from './referenceProofArt';
import { MAKER_ROOM_ART } from './makerRoomArt';
import { PASSAGE_DOCUMENTARY_ART, PASSAGE_DOCUMENTARY_LARGE_ART } from './specimenPassageArt';
import { TURNING_ART } from './turningTableArt';

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
  ...SPARE_MOON_ART,
  ...UNDERPAN_ART,
  ...FOURTH_CORNER_ART,
  ...BLUE_TAIL_ART,
  'collection-stand': [16, 24, (g) => {
    pedestal(g, 1, 14, 14);
    R(g, '#66868b', 2, 2, 12, 12);
    R(g, '#aacbd2', 3, 3, 10, 10);
    R(g, '#384b58', 4, 4, 8, 8);
    R(g, '#e8c788', 8, 15, 5, 2);
  }],
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
  'icon.lamp': [16, 16, (g) => { R(g, '#c9a24a', 6, 3, 4, 2); R(g, '#e8c040', 5, 5, 6, 6); R(g, '#ffd98a', 7, 6, 2, 3); R(g, '#9c7426', 4, 11, 8, 2); R(g, '#c9a24a', 11, 6, 2, 1); R(g, '#c9a24a', 12, 6, 1, 4); }],
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
for (const [perch, sign] of [['moon.perch','moon.sign'], ['moon.perch-open','moon.open']]) {
  DRAW[perch] = [18, 24, (g) => {
    g.save();
    g.translate(0, 4);
    SPARE_MOON_ART[sign][2](g);
    g.restore();
    moth(g, 0, 6, 0);
  }];
}

function straightedgeTray(g: Ctx, keeper: boolean) {
  R(g, '#473748', 1, 11, 23, 4);
  R(g, '#7f5746', 2, 10, 20, 3);
  R(g, '#d6ab80', 3, 10, 18);
  R(g, '#674b39', 3, 6, 18, 4);
  R(g, '#cb8564', 4, 6, 16, 3);
  R(g, '#efbb8d', 4, 6, 16);
  R(g, '#644747', 18, 6, 1, 2);
  if (keeper) {
    R(g, '#cebc93', 6, 11, 8, 4);
    R(g, '#7e6a63', 7, 12, 5);
  } else {
    R(g, '#e9d3a6', 7, 3, 12, 3);
    R(g, '#b2987c', 8, 4, 9);
  }
}
DRAW['linked-note.ruler'] = [24, 16, (g) => straightedgeTray(g, false)];
DRAW['linked-note.cradle'] = [24, 16, (g) => straightedgeTray(g, true)];

function stiltfrog(g: Ctx, x: number, y: number, unit = 1) {
  const block = (colour: string, dx: number, dy: number, w: number, h: number) =>
    R(g, colour, x + dx * unit, y + dy * unit, w * unit, h * unit);
  block('#33544a', 4, 5, 8, 4);
  block('#46745b', 2, 7, 11, 3);
  block('#598965', 5, 4, 7, 4);
  block('#86b476', 5, 2, 3, 3);
  block('#86b476', 10, 2, 3, 3);
  block('#d8c477', 6, 3, 2, 2);
  block('#d8c477', 10, 3, 2, 2);
  block('#243645', 7, 3, 1, 1);
  block('#243645', 11, 3, 1, 1);
  block('#a1be7b', 7, 7, 5, 1);
  block('#71945d', 1, 9, 5, 1);
  block('#71945d', 11, 9, 4, 1);
}

function reedHollow(g: Ctx, high: boolean, checked = false) {
  R(g, '#333a49', 3, 3, 26, 18); R(g, '#633f34', 4, 4, 24, 16);
  R(g, '#9a6a4d', 5, 4, 22, 2); R(g, '#e4a774', 6, 4, 20);
  R(g, '#8ea989', 7, 7, 18, 11); R(g, '#79968c', 7, 15, 18, 3);
  R(g, '#374f55', 8, 15, 16, 2); R(g, '#739fa3', 8, 16, 13);
  R(g, '#527762', 12, 11, 1, 5); R(g, '#527762', 15, 10, 1, 5);
  R(g, '#527762', 19, 12, 1, 4); R(g, '#b7c98d', 13, 11, 1, 4);
  if (high) {
    R(g, '#e1d1ab', 7, 9, 10, 2); R(g, '#555e63', 17, 10, 7, 2);
    R(g, '#395458', 7, 15, 16, 2);
  } else {
    R(g, '#e1d1ab', 9, 14, 10, 2);
    R(g, '#466457', 7, 7, 18, 3);
  }
  if (checked) {
    R(g, '#f2cd85', 5, 13, 2, 5); R(g, '#f2cd85', 25, 13, 2, 5);
  }
}

function dryRim(g: Ctx, lit: boolean) {
  R(g, '#49777d', 1, 17, 22, 3); R(g, '#7ea6a7', 3, 17, 16);
  R(g, '#526269', 1, 13, 7, 4); R(g, '#86908a', 2, 13, 6, 1);
  R(g, '#526269', 7, 12, 8, 4); R(g, '#86908a', 8, 12, 7, 1);
  R(g, '#526269', 14, 10, 9, 5); R(g, '#86908a', 15, 10, 8, 1);
  if (lit) {
    R(g, '#eed193', 4, 11, 3, 2); R(g, '#eed193', 18, 8, 3, 2);
  } else {
    for (const x of [5, 9, 13, 19]) R(g, '#57745a', x, 11, 1, 6);
  }
}

function seepStaff(g: Ctx, checked: boolean) {
  R(g, '#555652', 4, 19, 15, 3); R(g, '#809c8d', 5, 19, 14);
  R(g, '#5e443d', 10, 4, 4, 16); R(g, '#b88a60', 11, 5, 2, 14);
  for (const y of [6, 9, 12]) R(g, '#efe1b3', 12, y, 3);
  R(g, '#75bdcb', 7, 15, 10, 2);
  if (checked) R(g, '#e7c977', 16, 11, 3, 3);
}

DRAW['stiltfrog.pet'] = [16, 12, (g) => stiltfrog(g, 0, 0)];
DRAW['stiltfrog.portrait'] = [48, 32, (g) => {
  R(g, '#36585c', 0, 0, 48, 32);
  R(g, '#638483', 3, 23, 41, 5); R(g, '#89a29b', 9, 23, 25, 2);
  stiltfrog(g, 8, 5, 2);
}];
DRAW['stiltfrog.window-low'] = [32, 24, (g) => reedHollow(g, false)];
DRAW['stiltfrog.window-high'] = [32, 24, (g) => reedHollow(g, true)];
DRAW['stiltfrog.sight-lower'] = [32, 24, (g) => reedHollow(g, false, true)];
DRAW['stiltfrog.sight-upper'] = [32, 24, (g) => reedHollow(g, true, true)];
DRAW['stiltfrog.rim-hidden'] = [24, 20, (g) => dryRim(g, false)];
DRAW['stiltfrog.rim'] = [24, 20, (g) => dryRim(g, true)];
DRAW['stiltfrog.tide-staff'] = [24, 24, (g) => seepStaff(g, false)];
DRAW['stiltfrog.staff-checked'] = [24, 24, (g) => seepStaff(g, true)];
DRAW['stiltfrog.seat'] = [24, 24, (g) => {
  R(g, '#435b59', 2, 16, 20, 4); R(g, '#99a287', 3, 14, 18, 4);
  R(g, '#c1c29a', 5, 14, 8); R(g, '#648e65', 19, 8, 1, 7);
}];
DRAW['stiltfrog.track'] = [24, 24, (g) => {
  R(g, '#435b59', 2, 16, 20, 4); R(g, '#99a287', 3, 14, 18, 4);
  stiltfrog(g, 4, 5);
}];

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
// Field games: Pell's lantern stall (three crates), the ferry guest book on a stand, and the Weigh-House slate.
DRAW['lantern-stall'] = [32, 24, (g) => { R(g, '#5b3b22', 1, 8, 2, 16); R(g, '#5b3b22', 29, 8, 2, 16); R(g, '#c43c3c', 0, 4, 32, 4); R(g, '#e6dcc0', 4, 4, 4, 4); R(g, '#e6dcc0', 14, 4, 4, 4); R(g, '#e6dcc0', 24, 4, 4, 4);
  for (const x of [4, 13, 22]) { R(g, '#8a5a30', x, 15, 7, 8); R(g, '#a87445', x, 15, 7, 1); R(g, '#5b3b22', x + 3, 16, 1, 7); } R(g, '#ffd25a', 15, 10, 2, 3); R(g, '#3b2a1a', 15, 9, 2, 1); }];
DRAW['guest-book'] = [16, 24, (g) => { R(g, '#5b3b22', 7, 12, 2, 12); R(g, '#5b3b22', 4, 22, 8, 2); R(g, '#6b2b3a', 2, 6, 12, 7); R(g, '#e6dcc0', 3, 6, 5, 6); R(g, '#e6dcc0', 8, 6, 5, 6); R(g, '#2a2440', 4, 8, 3, 1); R(g, '#2a2440', 9, 8, 3, 1); R(g, '#2a2440', 4, 10, 2, 1); }];
DRAW['slate-board'] = [16, 24, (g) => { R(g, '#5b3b22', 2, 14, 2, 10); R(g, '#5b3b22', 12, 14, 2, 10); R(g, '#8a5a30', 0, 3, 16, 12); R(g, '#2a2f2a', 1, 4, 14, 10); R(g, '#f4f0e6', 3, 6, 2, 1); R(g, '#f4f0e6', 6, 6, 1, 1); R(g, '#f4f0e6', 8, 6, 4, 1); R(g, '#f4f0e6', 3, 9, 7, 1); R(g, '#f4f0e6', 11, 9, 2, 1); }];
// Sefa's dice table: a low table with two dice and a lantern.
DRAW['dice-table'] = [16, 24, (g) => { R(g, '#5b3b22', 2, 17, 2, 7); R(g, '#5b3b22', 12, 17, 2, 7); R(g, '#7a4a2a', 0, 14, 16, 3); R(g, '#a87445', 0, 14, 16, 1); R(g, '#f4f0e6', 3, 11, 3, 3); R(g, '#2a2440', 4, 12, 1, 1); R(g, '#e8c040', 8, 11, 3, 3); R(g, '#2a2440', 8, 11, 1, 1); R(g, '#2a2440', 10, 13, 1, 1); R(g, '#5b3b22', 13, 6, 1, 8); R(g, '#ffd98a', 12, 3, 3, 4); R(g, '#e8a040', 12, 6, 3, 1); }];
// Wenna's barter boat: a moored boat with dye pots and bundles.
DRAW['barter-boat'] = [16, 24, (g) => { R(g, '#2b6f9a', 0, 18, 16, 6); R(g, '#6b4a2a', 1, 14, 14, 5); R(g, '#8a5a30', 2, 14, 12, 1); R(g, '#5b3b22', 7, 2, 1, 12); R(g, '#e8e2d0', 8, 3, 5, 7); R(g, '#b5452f', 2, 11, 2, 3); R(g, '#4a6a9a', 5, 11, 2, 3); R(g, '#c9b843', 9, 11, 2, 3); R(g, '#8a6240', 12, 11, 2, 3); R(g, '#9fd0ff', 1, 19, 4, 1); }];
// The rumour mill: a small tea table with a pot and two cups.
DRAW['tea-table'] = [16, 24, (g) => { R(g, '#5b3b22', 2, 17, 2, 7); R(g, '#5b3b22', 12, 17, 2, 7); R(g, '#8a5a30', 0, 14, 16, 3); R(g, '#a87445', 0, 14, 16, 1); R(g, '#b5523b', 5, 8, 6, 6); R(g, '#d06a50', 6, 8, 2, 2); R(g, '#3b2a1a', 7, 6, 2, 2); R(g, '#b5523b', 11, 10, 2, 1); R(g, '#e8e2d0', 1, 11, 3, 3); R(g, '#e8e2d0', 12, 11, 3, 3); R(g, '#9fd0ff', 2, 6, 1, 3); }];
// Field readings: where a made tool can test a claim (rain stake, plumb mark, flood post).
DRAW['rain-stake'] = [16, 24, (g) => { R(g, '#5b3b22', 7, 10, 2, 14); R(g, '#c98d60', 4, 6, 8, 6); R(g, '#9fd0ff', 5, 8, 6, 3); R(g, '#3b2a1a', 4, 12, 8, 1); for (let i = 0; i < 3; i++) R(g, '#3b2a1a', 11, 7 + i * 2, 1, 1); R(g, '#4a7a3a', 3, 22, 10, 2); }];
DRAW['plumb-mark'] = [16, 24, (g) => { R(g, '#8b8f99', 2, 2, 12, 22); R(g, '#6f737d', 3, 3, 10, 20); R(g, '#4a4d55', 5, 3, 1, 20); R(g, '#e8e2d0', 9, 3, 1, 14); R(g, '#c9a24a', 8, 17, 3, 3); R(g, '#2a2440', 9, 5, 3, 1); }];
DRAW['flood-post'] = [16, 24, (g) => { R(g, '#6b4a2a', 6, 3, 4, 21); R(g, '#8a5a30', 7, 3, 2, 21); R(g, '#2a2440', 5, 12, 6, 1); R(g, '#d8c79a', 6, 6, 4, 3); R(g, '#9a8a6a', 7, 7, 1, 1); R(g, '#2b6f9a', 2, 21, 12, 3); R(g, '#9fd0ff', 3, 21, 4, 1); }];
// Sefa's stitching table with two work-slip halves turned up.
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

function drawLampSlip(g: Ctx, side: boolean) {
  smallTable(g);
  paper(g, 3, 5, 11, 10);
  const lampX = side ? 0 : 6;
  const lampY = side ? 8 : 1;
  R(g, '#523d38', lampX, lampY + 2, 4, 2);
  R(g, '#ffcf6a', lampX + 1, lampY, 2, 2);
  R(g, '#7a533d', 5, 7, 7, 1);
  R(g, '#7a533d', 5, 9, 7, 1);
  if (side) R(g, '#7a533d', 5, 11, 7, 1);
  R(g, '#a98f6d', 3, 5, 1, 2);
  R(g, '#a98f6d', 13, 13, 1, 2);
}

DRAW['nile.lamp-above'] = [16, 24, (g) => drawLampSlip(g, false)];
DRAW['nile.lamp-side'] = [16, 24, (g) => drawLampSlip(g, true)];

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

// Generic teaching silhouettes derived from the written collection records.
DRAW['preserved.binak-diagram'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#815734', 3, 7, 18, 3);
  R(g, '#ba8753', 5, 10, 14, 3);
  R(g, '#dfb777', 4, 7, 16, 1);
  R(g, '#697b7b', 7, 13, 10, 2);
}];
DRAW['big.preserved.binak-diagram'] = [96, 64, (g) => {
  R(g, '#273a42', 0, 0, 96, 64);
  R(g, '#e6cf9f', 7, 7, 82, 49);
  R(g, '#9d7750', 24, 30, 48, 4);
  R(g, '#bc9462', 27, 34, 42, 5);
  R(g, '#d8af73', 33, 39, 30, 4);
  R(g, '#745037', 25, 28, 46, 2);
  R(g, '#6a8280', 29, 46, 38, 4);
  R(g, '#7e9b93', 35, 43, 26, 3);
  R(g, '#537c7a', 77, 19, 4, 3);
  R(g, '#537c7a', 77, 25, 4, 3);
}];
DRAW['sea.dugout-diagram'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#557b84', 3, 5, 18, 9);
  R(g, '#9e714c', 4, 8, 16, 3);
  R(g, '#d9aa70', 7, 9, 10, 1);
  R(g, '#ead1a1', 15, 12, 5, 2);
}];
DRAW['big.sea.dugout-diagram'] = [96, 64, (g) => {
  R(g, '#263944', 0, 0, 96, 64);
  R(g, '#e6cf9f', 7, 7, 82, 49);
  R(g, '#637e81', 12, 15, 72, 24);
  R(g, '#825832', 15, 25, 66, 5);
  R(g, '#b88856', 19, 23, 58, 9);
  R(g, '#573d31', 23, 25, 50, 5);
  R(g, '#f1dbac', 15, 43, 29, 8);
  R(g, '#f1dbac', 53, 43, 28, 8);
  for (const x of [19, 57]) R(g, '#5c777b', x, 46, 17, 1);
}];

// Invented workshop parts and blank catalogue mounts for the two-face study.
DRAW['plate.front'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#59463a', 3, 3, 18, 12);
  R(g, '#cc956e', 5, 4, 14, 10);
  for (const x of [6, 11, 16]) {
    R(g, '#785243', x, 5, 3, 4);
    R(g, '#f2cc97', x, 5, 3);
  }
  R(g, '#614e40', 10, 10, 1, 3);
  R(g, '#614e40', 13, 10, 1, 3);
}];
DRAW['plate.back'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#59463a', 2, 5, 20, 10);
  R(g, '#c3977e', 4, 6, 16, 8);
  R(g, '#675567', 5, 7, 10, 2);
  R(g, '#675567', 5, 11, 10, 2);
  paper(g, 15, 5, 6, 8);
  R(g, '#a67854', 16, 8, 4);
}];
DRAW['plate.print'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  paper(g, 3, 6, 18, 9);
  for (const x of [6, 11, 16]) R(g, '#7c6c62', x, 8, 2, 2);
  R(g, '#7c6c62', 10, 12);
  R(g, '#7c6c62', 13, 12);
}];
DRAW['plate.frame'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#694f45', 2, 4, 20, 10);
  R(g, '#deb090', 3, 4, 18, 9);
  R(g, '#55606a', 5, 6, 5, 4);
  R(g, '#55606a', 12, 6, 7, 4);
  R(g, '#f3d59f', 4, 5, 16);
}];
for (const set of [false, true]) {
  const key = set ? 'plate.case-set' : 'plate.case-fold';
  DRAW[key] = [24, 24, (g) => {
    pedestal(g, 2, 15, 20);
    paper(g, 3, 6, 18, 8);
    R(g, '#78968b', 6, 5, 3, 5);
    R(g, '#b68766', 14, 5, 3, 5);
    if (set) R(g, '#907252', 11, 6, 1, 6);
  }];
  DRAW[`big.${key}`] = [96, 64, (g) => {
    R(g, '#302734', 0, 0, 96, 64);
    R(g, '#483c48', 5, 6, 86, 49);
    if (set) {
      for (const x of [11, 35, 59]) {
        R(g, '#9b795f', x, 12, 21, 25);
        R(g, '#d4ae87', x + 1, 13, 19, 22);
      }
      R(g, '#719785', 49, 34, 28, 4);
      R(g, '#769686', 63, 28, 4, 10);
      paper(g, 26, 37, 36, 12);
    } else {
      R(g, '#ac8062', 17, 16, 63, 33);
      paper(g, 14, 19, 63, 32);
      R(g, '#b88b68', 15, 20, 61, 3);
      R(g, '#7f9e8d', 25, 13, 12, 12);
      R(g, '#aa7f73', 51, 13, 12, 12);
      R(g, '#896b5d', 30, 40, 32, 2);
    }
  }];
}

// Original fictional writing guides and catalogue material samples.
for (const position of ['fold', 'stairs', 'ramp']) {
  DRAW[`lintel.${position}`] = [24, 24, (g) => {
    pedestal(g, 2, 15, 20);
    R(g, '#67504f', 2, 5, 20, 9);
    paper(g, 4, 6, 16, 7);
    const upper = position === 'stairs';
    R(g, '#85717a', 3, 10, 18, 1);
    R(g, '#cb8668', 5, upper ? 5 : 11, 14, 2);
    R(g, '#6fa99e', 4, upper ? 13 : 6, 15, 2);
    R(g, '#6a4d47', 3, 8, 1, 5);
    if (position === 'fold') R(g, '#b59767', 10, 5, 4, 8);
  }];
}
for (const open of [false, true]) {
  DRAW[open ? 'lintel.door.open' : 'lintel.door'] = [28, 30, (g) => {
    R(g, '#353544', 4, 3, 20, 25);
    R(g, '#a799a1', 5, 5, 18, 2);
    R(g, '#b5a4a9', 5, 7, 2, 20);
    R(g, '#8f8290', 21, 7, 2, 20);
    R(g, open ? '#9d885c' : '#635466', 8, 8, 12, 18);
    R(g, open ? '#e5cc91' : '#775b67', 9, 8, 10, 15);
    if (open) R(g, '#a2acab', 8, 24, 12, 2);
    else R(g, '#d5ad79', 17, 15, 2, 2);
    R(g, '#c8b7ac', 3, 27, 22, 2);
  }];
}
for (const building of [false, true]) {
  const key = building ? 'lintel.case-building' : 'lintel.case-page';
  DRAW[key] = [24, 24, (g) => {
    pedestal(g, 2, 15, 20);
    if (building) {
      R(g, '#9c7859', 3, 8, 6, 6);
      R(g, '#bd9f6f', 9, 6, 6, 8);
      R(g, '#a87366', 15, 4, 6, 10);
    } else {
      paper(g, 3, 5, 8, 8);
      paper(g, 13, 5, 8, 8);
      R(g, '#769b99', 4, 6, 6, 2);
      R(g, '#9d786a', 14, 6, 6, 2);
    }
  }];
  DRAW[`big.${key}`] = [96, 64, (g) => {
    R(g, '#34313d', 0, 0, 96, 64);
    R(g, '#9c8387', 4, 8, 88, 47);
    if (building) {
      R(g, '#88634d', 10, 29, 23, 15);
      R(g, '#be9a73', 11, 31, 20, 3);
      R(g, '#c19e61', 36, 20, 23, 24);
      for (const x of [38, 42, 46, 50, 54]) R(g, '#dfba7b', x, 23, 1, 19);
      R(g, '#a6645b', 63, 15, 23, 29);
      R(g, '#df9980', 64, 23, 21, 2);
      R(g, '#df9980', 64, 33, 21, 2);
      R(g, '#d3ad83', 9, 48, 79, 4);
    } else {
      R(g, '#4c6264', 13, 14, 30, 36);
      R(g, '#755d59', 53, 14, 30, 36);
      paper(g, 16, 15, 24, 31);
      paper(g, 56, 15, 24, 31);
      R(g, '#79a7a0', 20, 20, 14, 4);
      R(g, '#b38a74', 60, 20, 14, 4);
      R(g, '#cba871', 23, 34, 18, 10);
      R(g, '#cba871', 59, 36, 18, 10);
    }
  }];
}

// Original abstract backdrop and case mounts. The real images are kept in their source catalogues.
DRAW['seam.rule'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#545966', 2, 5, 20, 8);
  R(g, '#a7a399', 3, 5, 18, 6);
  R(g, '#f2cc8d', 6, 6, 4, 4);
  R(g, '#f2cc8d', 14, 6, 4, 4);
  R(g, '#665849', 11, 10, 2, 2);
}];
for (const [mode, left, right] of [['free', 6, 10], ['support', 7, 7]] as const) {
  DRAW[`seam.hang-${mode}`] = [26, 26, (g) => {
    pedestal(g, 2, 17, 22);
    R(g, '#68544e', 2, 4, 22, 12);
    if (mode === 'support') R(g, '#bc9d7a', 4, 6, 18, 8);
    R(g, '#d8b795', 4, left - 1, 7, 6);
    R(g, '#cba185', 15, right - 1, 7, 6);
    R(g, '#4e7894', 4, left, 7, 2);
    R(g, '#4e7894', 15, right, 7, 2);
    R(g, '#f3cb89', 3, 6, 2, 3);
    R(g, '#f3cb89', 21, 6, 2, 3);
  }];
}
DRAW['seam.paper'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  paper(g, 3, 6, 8, 8);
  paper(g, 13, 6, 8, 8);
  R(g, '#5f86a5', 4, 8, 6, 2);
  R(g, '#5f86a5', 14, 8, 6, 2);
  R(g, '#a78464', 10, 11, 5, 1);
}];
for (const open of [false, true]) {
  DRAW[open ? 'seam.open-view' : 'seam.baffle'] = [28, 28, (g) => {
    pedestal(g, 2, 16, 24);
    R(g, '#554765', 3, 3, 22, 12);
    R(g, '#98aeb1', 4, 4, 20, 9);
    R(g, '#3f6989', 5, 8, 7, 2);
    R(g, '#3f6989', 16, 8, 7, 2);
    R(g, '#4b5772', 5, open ? 12 : 8, 18, 2);
    R(g, '#c68771', 3, 13, 22, 2);
  }];
}
for (const photo of [false, true]) {
  const key = photo ? 'seam.case-photo' : 'seam.case-textile';
  DRAW[key] = [24, 24, (g) => {
    pedestal(g, 2, 15, 20);
    if (photo) {
      for (const x of [3, 8, 13, 18]) R(g, '#c5c0b2', x, 5, 4, 8);
      R(g, '#707a8d', 8, 11, 8, 1);
    } else {
      R(g, '#b08771', 3, 5, 8, 9);
      R(g, '#b1a694', 4, 8, 6, 3);
      paper(g, 13, 4, 8, 10);
      R(g, '#7b88a0', 15, 6, 4, 2);
    }
  }];
  DRAW[`big.${key}`] = [96, 64, (g) => {
    R(g, '#322b3a', 0, 0, 96, 64);
    R(g, '#6b5a67', 6, 8, 84, 48);
    if (photo) {
      for (const x of [12, 30, 48, 66]) {
        R(g, '#3e3d46', x, 14, 16, 23);
        R(g, '#bbb5a6', x + 2, 16, 12, 18);
      }
      R(g, '#ad897a', 28, 43, 40, 1);
      R(g, '#e8c88c', 46, 41, 4, 5);
    } else {
      R(g, '#91736c', 13, 16, 32, 26);
      R(g, '#c9a488', 14, 16, 29, 23);
      R(g, '#b48976', 17, 18, 24, 3);
      R(g, '#b48976', 17, 34, 24, 3);
      paper(g, 53, 14, 30, 30);
      R(g, '#7d879a', 58, 19, 21, 2);
      R(g, '#ab7e6f', 59, 22, 8, 2);
    }
  }];
}

// Original archive cards and a fictional ferry kit. The catalogue card shows no historical map marks.
DRAW['departure.catalogue'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  paper(g, 3, 5, 8, 8);
  paper(g, 13, 5, 8, 8);
  R(g, '#377f88', 4, 6, 6, 2);
  R(g, '#9c6544', 14, 6, 6, 2);
  R(g, '#b89652', 9, 10, 6, 3);
}];
DRAW['big.departure.catalogue'] = [96, 64, (g) => {
  R(g, '#233945', 0, 0, 96, 64);
  paper(g, 9, 10, 33, 35);
  paper(g, 54, 10, 33, 35);
  R(g, '#377f88', 12, 13, 27, 4);
  R(g, '#9c6544', 57, 13, 27, 4);
  for (const x of [14, 59]) {
    R(g, '#8b7c62', x, 21, 20);
    R(g, '#8b7c62', x, 25, 16);
    R(g, '#8b7c62', x, 29, 19);
  }
  R(g, '#536771', 25, 35, 46, 2);
  R(g, '#a77843', 36, 31, 24, 21);
  R(g, '#f0cb86', 38, 33, 20, 16);
  for (const x of [41, 45, 49, 53]) R(g, '#755247', x, 39, 2, 4);
}];
DRAW['departure.strip'] = [24, 24, (g) => {
  pedestal(g, 2, 15, 20);
  R(g, '#603d2b', 2, 7, 20, 7);
  R(g, '#c59155', 3, 8, 18, 4);
  R(g, '#ebcd8b', 3, 8, 18);
  R(g, '#8cd0c0', 5, 5, 4, 8);
  R(g, '#d57f61', 15, 6, 4, 8);
  R(g, '#5c5948', 7, 10, 10);
}];
for (const marked of [false, true]) {
  DRAW[marked ? 'departure.peg-marked' : 'departure.peg'] = [16, 24, (g) => {
    R(g, '#4d533b', 4, 20, 8, 2);
    R(g, '#795435', 6, 7, 4, 14);
    R(g, '#c98c56', 6, 7, 1, 13);
    R(g, '#8cd0a1', 5, 6, 6, 3);
    if (marked) paper(g, 8, 10, 6, 7);
  }];
}

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

function drawClearFrame(g: Ctx, reading: 'ready' | 'row' | 'edge') {
  smallTable(g);
  R(g, '#734e39', 0, 2, 16, 13);
  R(g, '#263536', 2, 4, 12, 9);
  for (const x of [3, 6, 9, 12]) R(g, '#a1b1a0', x, 4, 1, 9);
  for (const y of [5, 8, 11]) R(g, '#a1b1a0', 2, y, 12, 1);
  R(g, '#f0ddaa', 8, 1, 5, 3);
  if (reading === 'row') {
    R(g, '#61d7de', 0, 7, 16, 1);
    R(g, '#cfeddb', 13, 6, 3, 1);
  }
  if (reading === 'edge') {
    R(g, '#61d7de', 0, 12, 10, 1);
    R(g, '#61d7de', 9, 11, 1, 2);
    R(g, '#61d7de', 9, 11, 2, 1);
  }
}

DRAW['coast.clear-frame'] = [16, 24, (g) => drawClearFrame(g, 'ready')];
DRAW['coast.clear-frame-row'] = [16, 24, (g) => drawClearFrame(g, 'row')];
DRAW['coast.clear-frame-edge'] = [16, 24, (g) => drawClearFrame(g, 'edge')];

// Loan turns and the little book rests used in the Nexus reading room.
DRAW['nexus.loan-counters'] = [24, 16, (g) => {
  R(g, '#4c3840', 1, 3, 22, 12);
  R(g, '#8a6546', 2, 4, 20, 9);
  R(g, '#b78a5e', 2, 4, 20);
  for (const x of [3, 8, 13, 18]) {
    R(g, '#5b4740', x, 7, 4, 4);
    R(g, '#d4b472', x, 6, 4, 3);
    R(g, '#e8cf92', x + 1, 6, 2);
  }
}];
function readingRest(g: Ctx, x: number) {
  R(g, '#483b37', x + 2, 19, 12, 3);
  R(g, '#725644', x + 3, 12, 9, 7);
  R(g, '#a5805a', x + 4, 15, 7, 2);
  R(g, '#e8d6ae', x + 2, 8, 6, 6);
  R(g, '#eddcbc', x + 8, 8, 6, 6);
  R(g, '#937757', x + 7, 8, 1, 6);
  R(g, '#ad9777', x + 3, 11, 3);
  R(g, '#ad9777', x + 10, 11, 3);
}
DRAW['nexus.reading-rest'] = [16, 24, (g) => readingRest(g, 0)];
DRAW['nexus.reading-rests'] = [32, 24, (g) => { readingRest(g, 0); readingRest(g, 16); }];

// The date ribbon uses a brass peg for one day and a paper sleeve for a range.
function dateStand(g: Ctx) {
  R(g, '#302843', 2, 21, 36, 2);
  R(g, '#513a37', 6, 12, 4, 9);
  R(g, '#513a37', 30, 12, 4, 9);
  R(g, '#99704f', 7, 13, 1, 7);
  R(g, '#99704f', 31, 13, 1, 7);
}
function dateRail(g: Ctx, y: number) {
  R(g, '#89624d', 2, y, 36, 5);
  R(g, '#efd8a6', 3, y, 34, 2);
  R(g, '#bc9b71', 4, y + 2, 32, 1);
  R(g, '#513a37', 4, y + 4, 32, 1);
}
function datePeg(g: Ctx, y: number) {
  R(g, '#6b4837', 6, y + 1, 3, 5);
  R(g, '#ffd477', 7, y, 1, 5);
  R(g, '#ffe7aa', 6, y, 3, 2);
}
function dateSleeve(g: Ctx, y: number) {
  R(g, '#35697d', 29, y, 6, 8);
  R(g, '#b1dfdd', 29, y, 6, 2);
  R(g, '#69aeb3', 30, y + 3, 4, 3);
  R(g, '#d4f1e6', 30, y + 3, 1, 3);
}
function sharedDateRail(g: Ctx) {
  dateStand(g);
  dateRail(g, 10);
  datePeg(g, 8);
  dateSleeve(g, 9);
}
function separateDateRails(g: Ctx) {
  dateStand(g);
  dateRail(g, 5);
  dateRail(g, 14);
  datePeg(g, 4);
  dateSleeve(g, 12);
}
DRAW['nexus.ribbon-setup'] = [40, 24, (g) => {
  dateStand(g);
  dateRail(g, 10);
  R(g, '#e8c398', 3, 15, 34, 2);
}];
DRAW['nexus.ribbon-single'] = [40, 24, sharedDateRail];
DRAW['nexus.ribbon-split'] = [40, 24, separateDateRails];
DRAW['nexus.ribbon-marked'] = [40, 24, (g) => {
  sharedDateRail(g);
  R(g, '#e6cba5', 17, 13, 7, 6);
  R(g, '#7e5d51', 18, 15, 4, 1);
  R(g, '#7e5d51', 18, 17, 3, 1);
}];
DRAW['nexus.ribbon-bridged'] = [40, 24, (g) => {
  separateDateRails(g);
  R(g, '#9a6042', 15, 4, 2, 14);
  R(g, '#ffd477', 15, 4, 1, 14);
  R(g, '#ffd477', 14, 4, 4, 1);
  R(g, '#ffd477', 14, 17, 4, 1);
}];

// The thin sheet carries the red marks separately from the indigo print.
function ferryPrint(g: Ctx, x: number, y: number) {
  R(g, '#78513d', x - 1, y - 1, 31, 17);
  R(g, '#f1dfb4', x, y, 29, 15);
  R(g, '#6198a5', x + 2, y + 6, 25, 5);
  R(g, '#4e8191', x + 2, y + 6, 25, 1);
  R(g, '#84b9b7', x + 8, y + 9, 16, 1);
  R(g, '#304d59', x + 7, y + 3, 1, 5);
  R(g, '#304d59', x + 6, y + 7, 3, 1);
  R(g, '#304d59', x + 20, y + 9, 3, 1);
  R(g, '#304d59', x + 21, y + 10, 1, 4);
}
function ferryPrintMarks(g: Ctx, x: number, y: number) {
  R(g, '#ac513d', x + 6, y + 6, 3, 2);
  R(g, '#ac513d', x + 20, y + 8, 3, 2);
  R(g, '#dd7650', x + 7, y + 6);
  R(g, '#dd7650', x + 21, y + 8);
}
function ferryPrintPins(g: Ctx) {
  R(g, '#77523b', 5, 5, 3, 3);
  R(g, '#fbd280', 5, 5, 2, 2);
  R(g, '#77523b', 29, 15, 3, 3);
  R(g, '#fbd280', 29, 15, 2, 2);
}
DRAW['nexus.print-setup'] = [38, 24, (g) => {
  ferryPrint(g, 4, 4);
  R(g, '#e5bd88', 25, 2, 10, 16);
  R(g, '#ac513d', 28, 8, 3, 2);
  R(g, '#ac513d', 31, 12, 3, 2);
  ferryPrintPins(g);
}];
DRAW['nexus.print-edge'] = [38, 24, (g) => {
  ferryPrint(g, 4, 4);
  ferryPrintMarks(g, 8, 5);
  ferryPrintPins(g);
}];
DRAW['nexus.print-pinned'] = [38, 24, (g) => {
  ferryPrint(g, 4, 4);
  ferryPrintMarks(g, 4, 4);
  ferryPrintPins(g);
}];
DRAW['nexus.print-joined'] = [38, 24, (g) => {
  R(g, '#6b4b42', 1, 2, 36, 20);
  ferryPrint(g, 4, 4);
  ferryPrintMarks(g, 4, 4);
  R(g, '#f3ce80', 14, 18, 11, 3);
}];
DRAW['nexus.print-layers'] = [38, 24, (g) => {
  ferryPrint(g, 3, 5);
  R(g, '#b8875d', 23, 2, 13, 20);
  R(g, '#f0d4a0', 25, 4, 10, 15);
  R(g, '#ac513d', 27, 8, 2, 2);
  R(g, '#ac513d', 31, 12, 2, 2);
  R(g, '#866653', 26, 5);
  R(g, '#866653', 33, 17);
}];

// Source slips either cross the gate inside the wallets or stay under the crate lid.
function packSketches(g: Ctx, x: number, y: number, colour: string) {
  for (const offset of [0, 2, 4]) R(g, colour, x, y + offset, 5, 1);
}
function packWallet(g: Ctx, x: number, colour: string, slipInside: boolean) {
  R(g, colour, x, 8, 10, 11);
  R(g, '#c98851', x + 1, 9, 8, 9);
  packSketches(g, x + 2, 10, '#f3e1bc');
  if (slipInside) R(g, '#f3785d', x + 2, 16, 5, 1);
}
function packCrate(g: Ctx, slipInside: boolean) {
  R(g, '#563b34', 1, 3, 34, 18);
  R(g, '#966951', 2, 4, 32, 15);
  R(g, '#b58761', 2, 4, 32, 2);
  R(g, '#6f493c', 2, 7, 32, 2);
  packWallet(g, 5, '#684839', slipInside);
  packWallet(g, 17, '#684839', slipInside);
  if (!slipInside) {
    R(g, '#a74537', 9, 5, 6, 2);
    R(g, '#a74537', 18, 5, 6, 2);
  }
}
function packTested(g: Ctx, slipInside: boolean) {
  R(g, '#563b34', 1, 3, 18, 18);
  R(g, '#966951', 2, 4, 16, 15);
  R(g, '#b58761', 2, 4, 16, 2);
  packWallet(g, 5, '#684839', slipInside);
  packWallet(g, 23, '#684839', slipInside);
  if (!slipInside) {
    R(g, '#a74537', 4, 5, 5, 2);
    R(g, '#a74537', 11, 5, 5, 2);
  }
}
function packRouteTag(g: Ctx, slipInside: boolean) {
  R(g, '#715447', 2, 4, 32, 15);
  R(g, '#f0ddb1', 3, 5, 30, 13);
  for (const x of [5, 16]) {
    R(g, '#927153', x, 7, 9, 10);
    R(g, '#f0ddb1', x + 1, 8, 7, 8);
    packSketches(g, x + 2, 9, '#526467');
    if (slipInside) R(g, '#ab4b3b', x + 2, 15, 5, 1);
  }
  if (!slipInside) {
    R(g, '#ab4b3b', 27, 10, 4, 2);
    R(g, '#ab4b3b', 27, 14, 4, 2);
  }
}
DRAW['nexus.pack-prep'] = [36, 24, (g) => {
  R(g, '#6a493b', 1, 4, 34, 17);
  R(g, '#b98e62', 2, 5, 32, 13);
  packSketches(g, 6, 8, '#f8e6c0');
  packSketches(g, 16, 8, '#f8e6c0');
  R(g, '#a74537', 25, 8, 6, 2);
  R(g, '#a74537', 25, 12, 6, 2);
}];
DRAW['nexus.pack-kits'] = [36, 24, (g) => packCrate(g, true)];
DRAW['nexus.pack-outer'] = [36, 24, (g) => packCrate(g, false)];
DRAW['nexus.pack-tested-kits'] = [36, 24, (g) => packTested(g, true)];
DRAW['nexus.pack-tested-outer'] = [36, 24, (g) => packTested(g, false)];
DRAW['nexus.pack-kits-route'] = [36, 24, (g) => packRouteTag(g, true)];
DRAW['nexus.pack-outer-route'] = [36, 24, (g) => packRouteTag(g, false)];
DRAW['nexus.pack-tally'] = [36, 24, (g) => {
  R(g, '#715447', 2, 4, 32, 15);
  R(g, '#f0ddb1', 3, 5, 30, 13);
  for (const x of [8, 11, 14, 17, 20, 23]) R(g, '#526467', x, 8, 1, 3);
  R(g, '#ab4b3b', 8, 13, 2, 2);
  R(g, '#ab4b3b', 12, 13, 2, 2);
}];

// Kip’s practice-strip case takes a shared pair of cords or a quiet stitch repair.
function handleCase(g: Ctx, grip: 'torn' | 'paired' | 'mended', open: boolean) {
  R(g, '#352c3d', 1, 20, 22, 2);
  R(g, '#624737', 2, 10, 20, 10);
  R(g, '#b08258', 3, 11, 18, 6);
  R(g, '#694a39', 3, 17, 18, 2);
  R(g, '#d0a367', 4, 11, 16);
  if (open) {
    R(g, '#835d44', 3, 4, 18, 6);
    R(g, '#c29162', 3, 4, 18, 1);
    R(g, '#4e443f', 4, 10, 16, 3);
    R(g, '#a6c0c2', 5, 10, 3, 2);
    R(g, '#cbd7cb', 9, 10, 3, 2);
    R(g, '#a6c0c2', 13, 10, 5, 2);
  }
  if (grip === 'paired') {
    for (const x of [5, 15]) {
      R(g, '#486267', x, 13, 5, 5);
      R(g, '#9ec1a1', x, 13, 5, 1);
      R(g, '#a78462', x + 1, 14, 3, 2);
    }
  } else if (grip === 'mended') {
    R(g, '#604141', 8, 13, 8, 4);
    R(g, '#d6a783', 9, 14, 6);
    for (const x of [10, 12, 14]) R(g, '#f2d5a5', x, 14, 1, 2);
  } else {
    R(g, '#604141', 7, 13, 4, 2);
    R(g, '#604141', 13, 14, 4, 2);
    R(g, '#d6a783', 10, 13);
    R(g, '#d6a783', 13, 14);
  }
}
DRAW['nexus.handle-torn'] = [24, 24, (g) => handleCase(g, 'torn', false)];
DRAW['nexus.handle-paired'] = [24, 24, (g) => handleCase(g, 'paired', false)];
DRAW['nexus.handle-mended'] = [24, 24, (g) => handleCase(g, 'mended', false)];
DRAW['nexus.handle-paired-ready'] = [24, 24, (g) => handleCase(g, 'paired', true)];
DRAW['nexus.handle-mended-ready'] = [24, 24, (g) => handleCase(g, 'mended', true)];

// The loan frame has handles at both ends and rests in real places between moves.
function carriedLoanFrame(g: Ctx, rest: 'trestle' | 'held' | 'cart' | 'parked' | 'low' | 'upper') {
  const top = rest === 'upper' ? 2 : rest === 'low' ? 9 : 6;
  if (rest === 'cart' || rest === 'parked') {
    R(g, '#3a3543', 4, 18, 23, 2);
    R(g, '#92543e', 3, 16, 23, 2); R(g, '#d5895b', 3, 16, 23);
    for (const wheel of [7, 20]) {
      R(g, '#353544', wheel, 18, 4, 4); R(g, '#aaa594', wheel + 1, 19, 2, 2);
    }
    if (rest === 'parked') {
      R(g, '#806b53', 8, 12, 5, 4); R(g, '#d4ae70', 8, 12, 5);
      R(g, '#806b53', 16, 13, 5, 3); R(g, '#d4ae70', 16, 13, 5);
      return;
    }
  } else if (rest === 'held') {
    R(g, '#5e4a49', 5, 15, 3, 6); R(g, '#5e4a49', 22, 15, 3, 6);
    R(g, '#e7ad75', 4, 14, 4, 2); R(g, '#e7ad75', 22, 14, 4, 2);
    R(g, '#415755', 7, 18, 2, 4); R(g, '#415755', 21, 18, 2, 4);
  } else {
    const edge = rest === 'upper' ? 14 : 18;
    R(g, '#594149', 7, edge, 16, 2); R(g, '#c78d5c', 6, edge, 18);
    R(g, '#594149', 8, edge + 1, 2, 21 - edge); R(g, '#594149', 20, edge + 1, 2, 21 - edge);
    R(g, '#aa7955', 8, edge + 1, 1, 20 - edge); R(g, '#aa7955', 20, edge + 1, 1, 20 - edge);
  }
  R(g, '#7a4c3b', 4, top + 4, 4, 4); R(g, '#e4ae70', 4, top + 4, 4);
  R(g, '#7a4c3b', 22, top + 4, 4, 4); R(g, '#e4ae70', 22, top + 4, 4);
  R(g, '#463d4e', 7, top, 16, 11);
  R(g, '#bc855a', 8, top + 1, 14, 9); R(g, '#f4c489', 8, top + 1, 14);
  R(g, '#417271', 10, top + 3, 10, 5); R(g, '#a5cdc2', 10, top + 3, 10);
  R(g, '#dce7c8', 11, top + 5, 3); R(g, '#dce7c8', 16, top + 6, 3);
  if (rest === 'cart') R(g, '#e6b25f', 14, top + 1, 2, 11);
}
DRAW['shared-carry.trestle'] = [30, 24, (g) => carriedLoanFrame(g, 'trestle')];
DRAW['shared-carry.held'] = [30, 24, (g) => carriedLoanFrame(g, 'held')];
DRAW['shared-carry.cart'] = [30, 24, (g) => carriedLoanFrame(g, 'cart')];
DRAW['shared-carry.parked'] = [30, 24, (g) => carriedLoanFrame(g, 'parked')];
DRAW['shared-carry.low'] = [30, 24, (g) => carriedLoanFrame(g, 'low')];
DRAW['shared-carry.upper'] = [30, 24, (g) => carriedLoanFrame(g, 'upper')];
DRAW['shared-carry.barrier'] = [16, 24, (g) => {
  R(g, '#563d49', 2, 12, 2, 10); R(g, '#563d49', 12, 12, 2, 10);
  R(g, '#ac593e', 1, 13, 14, 4); R(g, '#f2bc78', 1, 13, 14);
  for (const x of [3, 7, 11]) R(g, '#e89b55', x, 14, 2, 2);
}];

// Brass folding gauge, the old tray jig, and the receipt left at the found shelf.
function foldingGauge(g: Ctx, x: number, y: number, opened: boolean) {
  R(g, '#775036', x, y + 6, 16, 4);
  R(g, '#e5bc6f', x, y + 6, 15, 2);
  R(g, '#b67a43', x + 11, y + 7, 2, 2);
  if (opened) {
    R(g, '#a46e40', x + 1, y, 4, 7);
    R(g, '#edcb7f', x + 1, y, 2, 6);
    R(g, '#614a47', x + 3, y + 3, 2, 2);
  } else {
    R(g, '#aa7746', x + 1, y + 3, 11, 3);
    R(g, '#f0ca7b', x + 1, y + 3, 9, 1);
    R(g, '#614a47', x + 8, y + 4, 2, 2);
  }
  R(g, '#74523d', x + 1, y + 7, 3, 2);
  R(g, '#f1d491', x + 2, y + 7);
}
function gaugeReceipt(g: Ctx, closed: boolean, loan: boolean) {
  R(g, '#564150', 2, 8, 22, 12);
  R(g, '#e6d0a7', 4, 8, 17, 10);
  R(g, '#ac8f75', 6, 10, 7);
  R(g, '#ac8f75', 6, 13, 7);
  R(g, '#648c9c', 3, 6, 3, 13);
  if (closed) {
    R(g, '#537a65', 16, 12, 2, 2);
    R(g, '#537a65', 18, 10, 2, 2);
  }
  if (loan) {
    R(g, '#c79c81', 20, 5, 5, 11);
    R(g, '#874b51', 21, 8, 3, 1);
    R(g, '#874b51', 21, 11, 3, 1);
  }
}
function gaugeBench(g: Ctx) {
  R(g, '#4f3c41', 1, 9, 25, 12);
  R(g, '#a48968', 3, 10, 21, 8);
  R(g, '#685853', 3, 16, 21, 2);
  R(g, '#c0a082', 3, 10, 20, 1);
}
DRAW['lost-gauge.found'] = [26, 24, (g) => {
  gaugeBench(g);
  foldingGauge(g, 5, 5, false);
  R(g, '#6babb0', 12, 7, 2, 10);
}];
DRAW['lost-gauge.pouch'] = [26, 24, (g) => {
  R(g, '#554445', 3, 9, 20, 12);
  R(g, '#88775d', 4, 10, 18, 9);
  R(g, '#b09a72', 6, 10, 14, 2);
  R(g, '#6597a2', 13, 8, 2, 14);
  R(g, '#e5cb98', 15, 10, 6, 5);
}];
DRAW['lost-gauge.stub'] = [26, 24, (g) => gaugeReceipt(g, false, false)];
DRAW['lost-gauge.receipt'] = [26, 24, (g) => {
  gaugeReceipt(g, false, false);
  R(g, '#f3ddb6', 16, 6, 8, 6);
  R(g, '#8c6358', 18, 8, 4, 1);
}];
DRAW['lost-gauge.closed'] = [26, 24, (g) => gaugeReceipt(g, true, false)];
DRAW['lost-gauge.loan-note'] = [26, 24, (g) => gaugeReceipt(g, true, true)];
DRAW['lost-gauge.jig'] = [26, 24, (g) => {
  gaugeBench(g);
  foldingGauge(g, 6, 5, true);
  R(g, '#6d6256', 9, 8, 2, 2);
}];
DRAW['lost-gauge.bench-owner'] = [26, 24, (g) => {
  gaugeBench(g);
  foldingGauge(g, 5, 7, true);
  R(g, '#cbb496', 10, 3, 3, 10);
}];
DRAW['lost-gauge.bench-loan'] = [26, 24, (g) => {
  gaugeBench(g);
  foldingGauge(g, 5, 6, true);
  R(g, '#e8bf9c', 19, 7, 5, 6);
  R(g, '#914958', 20, 9, 3, 1);
}];
DRAW['lost-gauge.divider'] = [26, 24, (g) => {
  gaugeBench(g);
  R(g, '#d3bb99', 10, 4, 3, 12);
  R(g, '#f0d9b2', 10, 4, 1, 11);
}];
DRAW['lost-gauge.hook'] = [26, 24, (g) => {
  gaugeBench(g);
  foldingGauge(g, 5, 5, false);
  R(g, '#647b7b', 10, 5, 2, 5);
  R(g, '#e8bf9c', 19, 7, 5, 7);
  R(g, '#914958', 20, 9, 3, 2);
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

// The Narrow Line: printed copies, recall board and one authored character scene.
function narrowLineNotice(g: Ctx, corrected: boolean, returned = false) {
  R(g, '#483b54', 2, 8, 26, 19);
  R(g, '#65797c', 4, 9, 22, 15);
  paper(g, 6, 5, 18, 17);
  R(g, corrected ? '#4f8e85' : '#bd9254', 8, 7, 14, 5);
  R(g, '#f6dd9b', 9, 8, 12, 1);
  R(g, '#897967', 9, 14, 11, 1);
  R(g, '#897967', 9, 16, corrected ? 10 : 4, 1);
  if (corrected) {
    R(g, '#4f8e85', 17, 18, 4, 2);
    R(g, '#537b80', 16, 19, 4, 1);
  }
  if (returned) {
    R(g, '#6a6f83', 20, 17, 8, 8);
    R(g, '#c59c59', 21, 16, 5, 5);
    R(g, '#f3cc79', 22, 16, 3, 1);
  }
}
DRAW['vesper-line.old-notice'] = [30, 28, (g) => narrowLineNotice(g, false)];
DRAW['vesper-line.signed'] = [30, 28, (g) => narrowLineNotice(g, true)];
DRAW['vesper-line.returned'] = [30, 28, (g) => narrowLineNotice(g, true, true)];
DRAW['vesper-line.order'] = [30, 26, (g) => {
  R(g, '#4a4057', 2, 9, 26, 16);
  paper(g, 4, 6, 18, 14);
  R(g, '#759098', 6, 8, 14, 3);
  R(g, '#8a7968', 7, 13, 11, 1);
  R(g, '#8a7968', 7, 15, 9, 1);
  R(g, '#6d5769', 23, 10, 3, 8);
  R(g, '#e8be7d', 22, 10, 5, 2);
}];
DRAW['vesper-line.slot'] = [28, 27, (g) => {
  R(g, '#57465e', 2, 5, 24, 21);
  R(g, '#76667b', 3, 6, 22, 9);
  R(g, '#383848', 4, 10, 20, 3);
  R(g, '#8a6d68', 4, 15, 20, 3);
  R(g, '#d0ab80', 17, 14, 7, 2);
  paper(g, 6, 17, 8, 6);
  R(g, '#637d82', 7, 19, 5, 1);
}];
DRAW['vesper-line.letter'] = [28, 26, (g) => {
  R(g, '#58485f', 3, 10, 22, 15);
  paper(g, 5, 7, 18, 14);
  R(g, '#8c7867', 7, 10, 13, 1);
  R(g, '#8c7867', 7, 12, 13, 1);
  R(g, '#8c7867', 7, 14, 9, 1);
  R(g, '#a77478', 16, 17, 4, 2);
}];
DRAW['vesper-line.waiting'] = [34, 28, (g) => {
  R(g, '#4f4058', 3, 10, 28, 17);
  R(g, '#819295', 5, 8, 24, 15);
  R(g, '#d5e0bc', 7, 10, 17, 3);
  R(g, '#d5e0bc', 10, 9, 5, 1);
  R(g, '#d5e0bc', 10, 13, 5, 1);
  paper(g, 17, 16, 10, 6);
  R(g, '#637d82', 18, 18, 7, 1);
  R(g, '#c49261', 7, 19, 3, 3);
}];
DRAW['vesper-line.vesper'] = [42, 36, (g) => {
  R(g, '#302b44', 13, 11, 17, 19);
  R(g, '#6c405c', 12, 15, 19, 11);
  R(g, '#ad8369', 17, 6, 9, 9);
  R(g, '#453643', 15, 3, 13, 5);
  R(g, '#453643', 14, 7, 3, 6);
  R(g, '#453643', 26, 7, 2, 8);
  R(g, '#4c3943', 19, 9, 2, 1);
  R(g, '#4c3943', 24, 9, 1, 1);
  R(g, '#e1a87e', 18, 12, 6, 2);
  R(g, '#c8a56a', 13, 22, 4, 3);
  R(g, '#b88a6b', 27, 22, 5, 3);
  R(g, '#735868', 4, 25, 35, 7);
  R(g, '#b58a75', 4, 24, 35, 2);
  paper(g, 18, 24, 9, 4);
  R(g, '#586d74', 20, 25, 5, 1);
}];
DRAW['vesper-line.open-door'] = [20, 30, (g) => {
  R(g, '#493c58', 2, 6, 16, 23);
  R(g, '#78657b', 3, 4, 14, 3);
  R(g, '#e3b078', 6, 7, 10, 21);
  R(g, '#7c5b68', 8, 8, 6, 17);
  R(g, '#b98970', 4, 8, 4, 20);
  R(g, '#f0ca8a', 12, 19, 3, 2);
}];

// The bench debate keeps separate time marks, work slips and a signed edition.
function debateTray(g: Ctx, plan?: 'whole' | 'split', signed = false) {
  R(g, '#493e54', 1, 8, 34, 19);
  R(g, '#936f60', 2, 7, 32, 16);
  R(g, '#c5a58a', 3, 7, 30, 2);
  paper(g, 5, 10, 26, 10);
  R(g, '#6d8294', 16, 11, 3, 8);
  R(g, '#6d8294', 8, 11, 2, 2);
  R(g, '#6d8294', 25, 11, 2, 2);
  if (plan === 'whole') {
    R(g, '#8f615e', 7, 14, 22, 4);
    R(g, '#ca997e', 9, 14, 18, 1);
  }
  if (plan === 'split') {
    R(g, '#628283', 7, 14, 8, 4);
    R(g, '#749b88', 21, 14, 8, 4);
    R(g, '#a5ba9a', 8, 14, 6, 1);
    R(g, '#a5ba9a', 22, 14, 6, 1);
  }
  if (signed) {
    R(g, '#574a67', 19, 21, 11, 3);
    R(g, '#b68e99', 21, 21, 7, 1);
    paper(g, 3, 19, 8, 6);
    R(g, '#8a7779', 4, 21, 5, 1);
  }
}
DRAW['bench-debate.trial'] = [36, 28, (g) => debateTray(g)];
DRAW['bench-debate.whole'] = [36, 28, (g) => debateTray(g, 'whole')];
DRAW['bench-debate.split'] = [36, 28, (g) => debateTray(g, 'split')];
DRAW['bench-debate.minute-whole'] = [36, 28, (g) => debateTray(g, 'whole', true)];
DRAW['bench-debate.minute-split'] = [36, 28, (g) => debateTray(g, 'split', true)];
DRAW['bench-debate.docket'] = [30, 26, (g) => {
  R(g, '#5f4d62', 2, 7, 26, 18);
  paper(g, 4, 6, 22, 15);
  R(g, '#938185', 14, 7, 1, 12);
  R(g, '#8f615e', 6, 9, 7, 3);
  R(g, '#628283', 17, 9, 7, 3);
  R(g, '#8a7779', 7, 15, 6, 1);
  R(g, '#8a7779', 17, 15, 6, 1);
}];
DRAW['bench-debate.paper'] = [26, 26, (g) => {
  R(g, '#54455d', 2, 9, 22, 15);
  paper(g, 4, 7, 18, 14);
  R(g, '#8a7779', 6, 10, 13, 1);
  R(g, '#8a7779', 6, 13, 11, 1);
  R(g, '#8a7779', 6, 16, 14, 1);
  R(g, '#c38b79', 16, 18, 4, 2);
}];
DRAW['bench-debate.slot'] = [30, 25, (g) => {
  R(g, '#53465d', 2, 7, 26, 17);
  R(g, '#a28783', 4, 7, 22, 12);
  R(g, '#4c4a5b', 5, 10, 20, 3);
  paper(g, 11, 10, 8, 6);
}];
DRAW['bench-debate.checked'] = [30, 25, (g) => {
  R(g, '#53465d', 2, 7, 26, 17);
  R(g, '#a28783', 4, 7, 22, 12);
  paper(g, 5, 6, 9, 13);
  paper(g, 16, 7, 9, 13);
  R(g, '#648a86', 7, 9, 5, 2);
  R(g, '#648a86', 18, 10, 5, 2);
  R(g, '#d4ad8d', 12, 18, 6, 2);
}];

// The Library's three bindings and the separate fictional proofs for The Same Red.
function threeLibraryVolumes(g: Ctx) {
  R(g, '#38384d', 1, 6, 42, 22);
  R(g, '#736c80', 2, 7, 40, 16);
  for (const [x, y, width] of [[6, 8, 7], [15, 6, 8], [25, 9, 7]]) {
    R(g, '#b0a28f', x, y, width, 16);
    R(g, '#e7d9b9', x + 1, y, width - 1, 15);
    R(g, '#c7b492', x + 2, y + 3, width - 3, 1);
    R(g, '#c7b492', x + 2, y + 10, width - 3, 1);
    R(g, '#eddfbf', x + 2, y + 4, 1, 5);
  }
  R(g, '#454359', 4, 23, 34, 3);
  paper(g, 33, 14, 7, 8);
  R(g, '#9b7469', 34, 17, 4, 1);
  R(g, '#9b7469', 34, 19, 4, 1);
}
// The same swatch shape survives only in the viewing tray. The sealed window
// has one notch, and the R13 sleeve and tray show the later piece's two notches.
function pigmentSampleStation(g: CanvasRenderingContext2D, view: 'window' | 'sleeve' | 'tray' | 'report' | 'labels'): void {
  pedestal(g, 1, 15, 22);
  R(g, '#3b2d38', 2, 4, 20, 12);
  R(g, view === 'window' ? '#73958c' : '#8f775c', 3, 5, 18, 10);
  R(g, '#362d3f', 4, 6, 16, 8);
  if (view === 'report' || view === 'labels') {
    paper(g, 5, 7, 6, 6);
    paper(g, 13, 7, 6, 6);
    R(g, '#836353', 6, 9, 3, 1);
    R(g, '#514763', 14, 9, 3, 1);
    if (view === 'report') R(g, '#d2bc8f', 6, 11, 4, 1);
    return;
  }
  R(g, '#b6a188', 5, 7, 14, 6);
  R(g, '#8d6595', 6, 8, 12, 4);
  R(g, '#ae83ae', 7, 8, 9, 1);
  R(g, '#362d3f', 8, 11, 2, 2);
  if (view !== 'window') R(g, '#362d3f', 14, 11, 2, 2);
  if (view === 'window') {
    R(g, '#a0b9a1', 5, 6, 10, 1);
    R(g, '#d8c78d', 18, 12, 2, 2);
  } else if (view === 'sleeve') R(g, '#d8c78d', 17, 7, 3, 3);
}

DRAW['pigment-sample.window'] = [24, 24, (g) => pigmentSampleStation(g, 'window')];
DRAW['pigment-sample.sleeve'] = [24, 24, (g) => pigmentSampleStation(g, 'sleeve')];
DRAW['pigment-sample.tray'] = [24, 24, (g) => pigmentSampleStation(g, 'tray')];
DRAW['pigment-sample.report'] = [24, 24, (g) => pigmentSampleStation(g, 'report')];
DRAW['pigment-sample.labels'] = [24, 24, (g) => pigmentSampleStation(g, 'labels')];

DRAW['same-red.exhibit'] = [44, 30, threeLibraryVolumes];
DRAW['big.same-red.exhibit'] = [96, 64, (g) => {
  g.save();
  g.translate(4, 2);
  g.scale(2, 2);
  threeLibraryVolumes(g);
  g.restore();
}];
function redReference(g: Ctx, marked: 'leaf' | 'methods' | 'open') {
  R(g, '#57495f', 2, 6, 24, 18);
  paper(g, 4, 7, 19, 12);
  R(g, '#89786d', 6, 10, 13, 1);
  R(g, '#89786d', 6, 13, 10, 1);
  R(g, '#89786d', 6, 16, 10, 1);
  if (marked !== 'open') R(g, '#b4595a', 15, 15, 4, 7);
  if (marked === 'methods') R(g, '#60868c', 9, 16, 4, 6);
}
DRAW['same-red.catalogue'] = [28, 25, (g) => redReference(g, 'open')];
DRAW['same-red.slip-leaf'] = [28, 25, (g) => redReference(g, 'leaf')];
DRAW['same-red.slip-methods'] = [28, 25, (g) => redReference(g, 'methods')];
function redProofs(g: Ctx, method: 'type' | 'hand', checked: boolean, filed = false) {
  R(g, '#50445a', 1, 8, 34, 17);
  R(g, '#a18b7d', 2, 8, 32, 13);
  for (const x of [4, 19]) {
    paper(g, x, 5, 13, 15);
    R(g, '#75626c', x + 2, 12, 9, 1);
    R(g, '#75626c', x + 2, 15, 8, 1);
  }
  if (checked || method === 'type') R(g, '#aa4f5a', 21, 8, 9, 2);
  if (method === 'type' && checked) R(g, '#aa4f5a', 6, 8, 9, 2);
  if (method === 'hand') {
    R(g, '#6b667b', 26, 19, 5, 3);
    R(g, '#4b4359', 30, 16, 2, 6);
  }
  if (filed) {
    R(g, '#53767b', 16, 18, 5, 6);
    R(g, '#97b7ae', 17, 19, 3, 1);
  }
}
DRAW['same-red.type'] = [36, 26, (g) => redProofs(g, 'type', false)];
DRAW['same-red.hand'] = [36, 26, (g) => redProofs(g, 'hand', false)];
DRAW['same-red.type-checked'] = [36, 26, (g) => redProofs(g, 'type', true)];
DRAW['same-red.hand-checked'] = [36, 26, (g) => redProofs(g, 'hand', true)];
DRAW['same-red.kept-type'] = [36, 26, (g) => redProofs(g, 'type', true, true)];
DRAW['same-red.kept-hand'] = [36, 26, (g) => redProofs(g, 'hand', true, true)];

// Original custody diagram and fictional fitting views.
function fittingRecordCase(g: Ctx) {
  R(g, '#403c56', 1, 3, 42, 24);
  R(g, '#786a7b', 3, 4, 38, 2);
  R(g, '#9b92a0', 5, 8, 14, 12);
  R(g, '#403c56', 6, 9, 12, 10);
  R(g, '#a2adab', 23, 8, 15, 12);
  R(g, '#687d84', 24, 9, 13, 10);
  R(g, '#d2cc9e', 28, 11, 5, 5);
  R(g, '#687d84', 29, 12, 3, 3);
  R(g, '#cda37e', 7, 22, 10, 2);
  R(g, '#c4dfd5', 25, 22, 11, 2);
}
DRAW['fitting-views.case'] = [44, 30, fittingRecordCase];
DRAW['big.fitting-views.case'] = [96, 64, (g) => {
  g.save();
  g.translate(4, 2);
  g.scale(2, 2);
  fittingRecordCase(g);
  g.restore();
}];
// The empty mount identifies the exposure. The study of a hand and ring belongs to A606881.
DRAW['big.fitting-views.photograph'] = [96, 64, (g) => {
  R(g, '#2c3542', 0, 0, 96, 64);
  R(g, '#86777b', 9, 13, 32, 36);
  R(g, '#303541', 12, 16, 26, 30);
  R(g, '#bc956f', 16, 51, 18, 3);

  R(g, '#9ea99f', 47, 6, 40, 50);
  R(g, '#dae1cb', 49, 8, 36, 46);
  R(g, '#27363d', 51, 10, 32, 42);
  R(g, '#58767a', 60, 34, 17, 13);
  R(g, '#829d95', 65, 45, 9, 6);
  for (const [x, y, end] of [[58, 23, 36], [63, 16, 38], [68, 13, 40], [73, 17, 39]]) {
    for (let joint = y; joint < end; joint += 5) {
      R(g, '#adc8b5', x, joint, 2, Math.min(4, end - joint));
    }
  }
  R(g, '#adc8b5', 77, 31, 3, 5);
  R(g, '#adc8b5', 75, 37, 3, 6);
  R(g, '#adc8b5', 65, 43, 2, 5);
  R(g, '#adc8b5', 71, 43, 2, 5);
  R(g, '#e1c98a', 61, 24, 6, 2);
  R(g, '#e1c98a', 61, 27, 6, 1);
  R(g, '#77a8a0', 55, 58, 25, 2);
}];
function practiceFitting(g: Ctx, x: number, y: number, side = false) {
  R(g, '#8b766e', x, y + (side ? 4 : 1), 17, side ? 7 : 10);
  R(g, '#d7aa8d', x + 2, y + (side ? 3 : 0), 13, side ? 5 : 8);
  R(g, '#f0c4a5', x + 2, y + (side ? 3 : 0), 10, 2);
  R(g, '#534c57', x + 13, y + (side ? 5 : 3), 2, 2);
}
function fittingFrame(g: Ctx, beam: string) {
  R(g, '#47394d', 2, 6, 32, 18);
  R(g, '#685160', 3, 7, 30, 14);
  R(g, beam, 5, 8, 26, 10);
  R(g, '#4b5d65', 5, 16, 3, 2);
  R(g, '#4b5d65', 5, 13, 2, 4);
}
DRAW['fitting-views.lamp'] = [36, 26, (g) => {
  fittingFrame(g, '#f6d1a0');
  R(g, '#aa7f67', 11, 2, 12, 4);
  R(g, '#efc08b', 12, 5, 10, 2);
  practiceFitting(g, 10, 9);
}];
DRAW['fitting-views.surface'] = [36, 26, (g) => {
  fittingFrame(g, '#ead4a7');
  R(g, '#a97f70', 12, 10, 13, 6);
  R(g, '#ead4a7', 13, 11, 11, 4);
  R(g, '#845f60', 22, 11, 2, 2);
}];
DRAW['fitting-views.plate'] = [36, 26, (g) => {
  fittingFrame(g, '#9bc7c4');
  practiceFitting(g, 10, 9);
}];
DRAW['fitting-views.plate-face'] = [36, 26, (g) => {
  fittingFrame(g, '#9bc7c4');
  R(g, '#709f9f', 10, 10, 17, 6);
  R(g, '#496b78', 17, 11, 3, 3);
  R(g, '#f1d8a9', 28, 10, 2, 7);
}];
DRAW['fitting-views.plate-side'] = [36, 26, (g) => {
  fittingFrame(g, '#9bc7c4');
  practiceFitting(g, 10, 7, true);
  R(g, '#4e7180', 17, 14, 3, 3);
  R(g, '#f1d8a9', 28, 13, 2, 5);
}];
function fittingStandards(g: Ctx, checked: boolean) {
  fittingFrame(g, checked ? '#9bc7c4' : '#e0cdb0');
  R(g, '#6f746b', 9, 10, 8, 6);
  R(g, '#6f746b', 21, 10, 8, 6);
  R(g, '#aec1ac', 10, 11, 6, 4);
  R(g, '#aec1ac', 22, 11, 6, 4);
  R(g, checked ? '#365663' : '#715e75', 24, 12, 2, 2);
}
DRAW['fitting-views.standards'] = [36, 26, (g) => fittingStandards(g, false)];
DRAW['fitting-views.standards-read'] = [36, 26, (g) => fittingStandards(g, true)];
DRAW['fitting-views.dispatch'] = [28, 26, (g) => {
  R(g, '#634858', 2, 8, 24, 16);
  R(g, '#b48367', 3, 8, 22, 11);
  paper(g, 7, 5, 14, 10);
  R(g, '#e3ab7a', 3, 12, 22, 2);
}];
DRAW['fitting-views.packet-surface'] = [28, 26, (g) => {
  paper(g, 4, 7, 19, 13);
  R(g, '#af886e', 7, 10, 13, 6);
  R(g, '#f6dbab', 8, 11, 11, 4);
}];
DRAW['fitting-views.packet-pair'] = [28, 26, (g) => {
  paper(g, 4, 5, 9, 15);
  paper(g, 14, 6, 10, 15);
  R(g, '#729d9d', 6, 9, 5, 6);
  R(g, '#729d9d', 16, 10, 6, 6);
  R(g, '#4a6774', 8, 10, 2, 2);
  R(g, '#4a6774', 19, 13, 2, 2);
}];
function teachingFitting(g: Ctx, route: 'surface' | 'pair', fit: boolean, signed = false) {
  const outer = route === 'surface';
  fittingFrame(g, outer ? '#edd3a2' : '#9bc7c4');
  practiceFitting(g, 8, 9, !outer);
  const markerX = outer && fit ? 20 : 25;
  const markerY = outer ? (fit ? 12 : 7) : (fit ? 7 : 14);
  R(g, '#8b4e5b', markerX, markerY, 7, 2);
  R(g, '#d08a85', markerX, markerY - 1, 2, 4);
  if (signed) {
    R(g, '#f0d8a3', 24, 17, 8, 4);
    R(g, '#647e79', 25, 18, 5, 1);
  }
}
DRAW['fitting-views.board-surface'] = [36, 26, (g) => teachingFitting(g, 'surface', false)];
DRAW['fitting-views.board-pair'] = [36, 26, (g) => teachingFitting(g, 'pair', false)];
DRAW['fitting-views.used-surface'] = [36, 26, (g) => teachingFitting(g, 'surface', true)];
DRAW['fitting-views.used-pair'] = [36, 26, (g) => teachingFitting(g, 'pair', true)];
DRAW['fitting-views.checked-surface'] = [36, 26, (g) => teachingFitting(g, 'surface', true, true)];
DRAW['fitting-views.checked-pair'] = [36, 26, (g) => teachingFitting(g, 'pair', true, true)];

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

// Print Workshop equipment and the different copies it sends out.
DRAW['copies.waypost'] = [16, 24, (g) => {
  R(g, '#413349', 3, 4, 10, 20);
  R(g, '#765d73', 4, 4, 8, 2);
  R(g, '#98765c', 1, 6, 14, 11);
  paper(g, 3, 6, 10, 8);
  R(g, '#607985', 5, 8, 6, 1);
  R(g, '#9e8267', 5, 11, 4, 1);
}];
DRAW['copies.source'] = [16, 24, (g) => {
  smallTable(g);
  paper(g, 2, 3, 12, 11);
  R(g, '#ab714e', 6, 2, 4, 2);
  R(g, '#607985', 4, 6, 8, 1);
  R(g, '#5c706d', 4, 9, 7, 1);
  R(g, '#5c706d', 4, 11, 5, 1);
}];
DRAW['copies.press'] = [16, 24, (g) => {
  R(g, '#4b3a3a', 1, 4, 2, 20);
  R(g, '#4b3a3a', 13, 4, 2, 20);
  R(g, '#9c7252', 1, 4, 14, 3);
  R(g, '#52606e', 7, 3, 2, 7);
  R(g, '#d0a575', 5, 2, 6, 2);
  R(g, '#687380', 4, 9, 8, 3);
  R(g, '#8b6b52', 2, 14, 12, 5);
  paper(g, 3, 12, 10, 4);
}];
DRAW['copies.landing'] = [16, 24, (g) => {
  R(g, '#514359', 2, 6, 12, 16);
  R(g, '#728c91', 1, 4, 14, 10);
  paper(g, 3, 4, 9, 8);
  R(g, '#9e8267', 5, 7, 5, 1);
  R(g, '#a97652', 2, 2, 12, 2);
}];
DRAW['copies.reprint'] = [16, 24, (g) => {
  R(g, '#574453', 2, 3, 12, 19);
  paper(g, 3, 4, 10, 12);
  R(g, '#83a0a0', 4, 6, 8, 2);
  for (const y of [9, 11, 13]) R(g, '#796d59', 5, y, 6, 1);
}];
DRAW['copies.strip'] = [16, 24, (g) => {
  R(g, '#574453', 2, 4, 12, 18);
  paper(g, 4, 5, 8, 9);
  R(g, '#a78463', 5, 7, 6, 1);
  R(g, '#83a0a0', 2, 10, 12, 2);
  R(g, '#cadeca', 4, 10, 8, 1);
}];

// Cartographers’ Sea chart boards and skiff.
DRAW['sea.waypost'] = [16, 24, (g) => {
  R(g, '#344a50', 7, 7, 3, 16);
  R(g, '#907558', 1, 5, 14, 8);
  R(g, '#d2b884', 2, 5, 12, 2);
  R(g, '#72a8ac', 3, 8, 10, 3);
  R(g, '#40666a', 3, 10, 7, 1);
  R(g, '#e5d0a2', 9, 8, 2, 3);
}];
DRAW['sea.skiff'] = [16, 24, (g) => {
  R(g, '#335c6c', 1, 19, 14, 5);
  R(g, '#594852', 2, 13, 12, 6);
  R(g, '#a68162', 1, 12, 14, 3);
  R(g, '#c6a17a', 4, 12, 8, 1);
  R(g, '#84aab0', 2, 20, 5, 1);
  R(g, '#84aab0', 8, 22, 6, 1);
  R(g, '#dcc18b', 6, 10, 7, 1);
  R(g, '#dcc18b', 11, 8, 4, 2);
}];
function mountedChart(g: Ctx) {
  R(g, '#435257', 2, 4, 2, 19);
  R(g, '#435257', 12, 4, 2, 19);
  paper(g, 1, 5, 14, 11);
  R(g, '#b29d75', 1, 4, 14, 2);
}
DRAW['sea.shore-chart'] = [16, 24, (g) => {
  mountedChart(g);
  R(g, '#79a9b0', 2, 10, 12, 5);
  R(g, '#bea87e', 3, 8, 7, 3);
  R(g, '#616f65', 4, 8, 6, 1);
  R(g, '#616f65', 7, 9, 2, 1);
}];
DRAW['sea.shoal-chart'] = [16, 24, (g) => {
  mountedChart(g);
  R(g, '#79a9b0', 2, 7, 12, 8);
  R(g, '#71918e', 3, 11, 10, 2);
  R(g, '#d1c094', 4, 8, 3, 2);
  R(g, '#d1c094', 9, 11, 3, 2);
}];
DRAW['sea.margin'] = [16, 24, (g) => {
  mountedChart(g);
  R(g, '#7a948f', 3, 7, 8, 2);
  R(g, '#9e8465', 3, 11, 5, 1);
  R(g, '#9e8465', 3, 13, 7, 1);
  R(g, '#ac7868', 10, 9, 3, 1);
  R(g, '#ac7868', 11, 10, 2, 1);
  R(g, '#ac7868', 12, 11, 1, 1);
}];

// Sora's fictional paper play and the Cold Store practice dispatch slips.
function paperLandingBoard(g: Ctx, position: 'rail' | 'shelter', mark?: 'rail' | 'shelter') {
  R(g, '#393e52', 1, 6, 30, 17);
  paper(g, 2, 5, 28, 15);
  R(g, '#91bfc6', 4, 9, 24, 9);
  R(g, '#69959f', 4, 15, 24, 2);
  R(g, '#795e64', 5, 10, 6, 1);
  R(g, '#795e64', 6, 11, 1, 3);
  R(g, '#795e64', 9, 11, 1, 3);
  R(g, '#745f67', 21, 9, 6, 4);
  R(g, '#a86f6b', 22, 8, 4, 1);
  R(g, '#efcd99', 23, 10, 2, 3);
  const landing = position === 'rail' ? 6 : 21;
  R(g, '#be8367', landing, 13, 6, 3);
  R(g, '#f4d49d', landing + 1, 13, 4, 1);
  if (mark) {
    const peg = mark === 'rail' ? 8 : 23;
    R(g, '#493e5d', peg, 12, 2, 6);
    R(g, '#bf89c4', peg - 1, 11, 4, 2);
  }
}
DRAW['paper-landing.near'] = [32, 24, (g) => paperLandingBoard(g, 'rail')];
DRAW['paper-landing.near-tagged'] = [32, 24, (g) => paperLandingBoard(g, 'rail', 'rail')];
DRAW['paper-landing.far'] = [32, 24, (g) => paperLandingBoard(g, 'shelter')];
DRAW['paper-landing.trail'] = [32, 24, (g) => paperLandingBoard(g, 'shelter', 'rail')];
DRAW['paper-landing.arrival'] = [32, 24, (g) => paperLandingBoard(g, 'shelter', 'shelter')];
DRAW['paper-landing.peg'] = [18, 22, (g) => {
  R(g, '#57495b', 2, 16, 14, 5);
  R(g, '#a28783', 3, 15, 12, 2);
  R(g, '#6f4e75', 8, 8, 3, 9);
  R(g, '#c899ce', 6, 6, 7, 3);
}];
DRAW['paper-landing.wheel'] = [18, 22, (g) => {
  R(g, '#634d61', 7, 5, 4, 16);
  R(g, '#634d61', 2, 8, 14, 8);
  R(g, '#daa479', 4, 7, 10, 2);
  R(g, '#daa479', 4, 15, 10, 2);
  R(g, '#a47c70', 2, 10, 2, 5);
  R(g, '#a47c70', 14, 10, 2, 5);
  R(g, '#f2cf96', 7, 10, 4, 4);
}];
DRAW['paper-landing.press'] = [24, 24, (g) => {
  R(g, '#694a60', 4, 9, 3, 14);
  R(g, '#694a60', 17, 9, 3, 14);
  paper(g, 4, 13, 16, 5);
  R(g, '#bd946f', 3, 9, 18, 4);
  R(g, '#f1c796', 3, 8, 18, 2);
  R(g, '#8a6274', 11, 3, 3, 5);
  R(g, '#d98986', 7, 2, 11, 2);
}];
function paperLandingSlip(g: Ctx, paired: boolean, tone: 'play' | 'desk', checked = false) {
  R(g, '#584454', 3, 8, 26, 14);
  const sheetWidth = paired ? 11 : 21;
  const line = tone === 'play' ? '#9974a7' : '#5b969c';
  const columns = paired ? [4, 17] : [6];
  for (const x of columns) {
    paper(g, x, 6, sheetWidth, 13);
    R(g, line, x + 2, 9, sheetWidth - 4, 2);
    R(g, '#8f7869', x + 2, 13, sheetWidth - 6, 1);
    R(g, '#8f7869', x + 2, 15, sheetWidth - 5, 1);
  }
  if (checked) {
    R(g, '#b4816a', 22, 15, 7, 5);
    R(g, '#f0bd7b', 23, 16, 5, 2);
  }
}
DRAW['paper-landing.proof-trail'] = [32, 24, (g) => paperLandingSlip(g, true, 'play')];
DRAW['paper-landing.proof-arrival'] = [32, 24, (g) => paperLandingSlip(g, false, 'play')];
DRAW['paper-landing.receipt'] = [32, 24, (g) => paperLandingSlip(g, true, 'desk')];
DRAW['paper-landing.ticket-trail'] = [32, 24, (g) => paperLandingSlip(g, true, 'desk')];
DRAW['paper-landing.ticket-arrival'] = [32, 24, (g) => paperLandingSlip(g, false, 'desk')];
DRAW['paper-landing.checked-trail'] = [32, 24, (g) => paperLandingSlip(g, true, 'desk', true)];
DRAW['paper-landing.checked-arrival'] = [32, 24, (g) => paperLandingSlip(g, false, 'desk', true)];
DRAW['paper-landing.empty-clip'] = [20, 24, (g) => {
  R(g, '#55485e', 2, 7, 16, 16);
  R(g, '#887176', 3, 7, 14, 2);
  R(g, '#d8a97d', 7, 5, 6, 5);
}];

// House of Performance stage, printed programmes and two cue boards.
DRAW['stage.waypost'] = [16, 24, (g) => {
  R(g, '#503b4a', 3, 4, 10, 20);
  R(g, '#99725f', 1, 6, 14, 9);
  R(g, '#d6af75', 2, 5, 12, 2);
  R(g, '#a76372', 3, 7, 4, 6);
  R(g, '#a76372', 9, 7, 4, 6);
  R(g, '#e4cc95', 7, 10, 2, 2);
}];
DRAW['stage.rehearsal'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  R(g, '#533d52', 2, 4, 20, 12);
  R(g, '#944f62', 2, 4, 4, 10);
  R(g, '#944f62', 18, 4, 4, 10);
  R(g, '#d0a579', 6, 12, 12, 3);
  R(g, '#b9b1c5', 11, 6, 5, 7);
  R(g, '#493e4f', 12, 7, 3, 6);
  R(g, '#ad795d', 8, 10, 3, 3);
  R(g, '#e2c399', 8, 10, 3, 1);
}];
DRAW['stage.programme'] = [16, 24, (g) => {
  smallTable(g);
  paper(g, 2, 4, 12, 11);
  R(g, '#9f5c76', 3, 4, 10, 2);
  for (const y of [8, 10, 12]) R(g, '#7d6f6d', 4, y, 7, 1);
}];
DRAW['stage.cues'] = [16, 24, (g) => {
  R(g, '#4e405d', 2, 5, 12, 18);
  paper(g, 2, 4, 12, 10);
  R(g, '#9d8daa', 3, 6, 4, 6);
  R(g, '#c39670', 9, 7, 3, 3);
  R(g, '#736f83', 7, 9, 3, 1);
}];

function stageCueBoard(g: Ctx, pauseFirst: boolean) {
  R(g, '#5a485c', 3, 4, 10, 18);
  paper(g, 2, 3, 12, 12);
  const pause = pauseFirst ? 5 : 9;
  const move = pauseFirst ? 9 : 5;
  R(g, '#aa8ba5', 4, pause, 8, 1);
  R(g, '#637e91', 4, move, 8, 2);
  R(g, '#b7d2cd', 9, move, 2, 1);
}
DRAW['stage.pause'] = [16, 24, (g) => stageCueBoard(g, true)];
DRAW['stage.move'] = [16, 24, (g) => stageCueBoard(g, false)];

/** Original paper-stage relief. Only lighting and shadow change between views. */
function stageDoorRelief(g: Ctx, side: boolean) {
  R(g, '#21152c', 1, 2, 34, 19);
  R(g, '#a47454', 2, 2, 32, 1);
  R(g, '#684152', 2, 20, 32, 1);
  R(g, side ? '#45304d' : '#76556a', 3, 4, 30, 15);
  R(g, side ? '#b77953' : '#c4986e', 24, 5, 8, 2);
  R(g, '#af7d56', 24, 7, 2, 10);
  R(g, '#a67857', 30, 7, 2, 10);
  R(g, '#61414c', 26, 7, 4, 10);
  R(g, side ? '#835773' : '#a6757b', 3, 17, 30, 2);

  // Raking light leaves a longer shadow, drawn in stepped strips.
  R(g, side ? '#3a2946' : '#794e6f', 14, 18, side ? 16 : 7, 1);
  if (side) {
    R(g, '#3a2946', 17, 17, 11, 1);
    R(g, '#3a2946', 21, 16, 5, 1);
  }

  // The figure, outstretched hand and basket stay in the same place.
  R(g, '#e8bc93', 15, 8, 3, 3);
  R(g, '#683c50', 15, 7, 3, 1);
  R(g, side ? '#b37768' : '#dc9e7c', 14, 11, 5, 5);
  R(g, '#ddb399', 19, 12, 2, 1);
  R(g, '#624052', 15, 16, 1, 2);
  R(g, '#624052', 17, 16, 1, 2);
  R(g, '#bb875a', 20, 13, 4, 3);
  R(g, side ? '#d49b69' : '#f1ca88', 20, 13, 4, 1);
  R(g, side ? '#9e6f5f' : '#724b5f', 15, 14, 3, 1);
  R(g, '#684152', 6, 21, 2, 3);
  R(g, '#684152', 28, 21, 2, 3);
}

DRAW['stage.relief-side'] = [36, 24, (g) => stageDoorRelief(g, true)];
DRAW['stage.relief-front'] = [36, 24, (g) => stageDoorRelief(g, false)];

// Three pictures keep the place of the basket and the movement of the hand visible.
function basketFrame(g: Ctx, x: number, y: number, pose: number) {
  R(g, '#60464e', x, y, 8, 11);
  R(g, '#f0d7a7', x + 1, y + 1, 6, 9);
  R(g, '#535459', x + 2, y + 3, 1, 4);
  R(g, '#535459', x + 2, y + 2, 2, 1);
  R(g, '#bc8a63', x + 4, y + 8, 3, 1);
  const height = pose === 0 ? 5 : 7;
  R(g, '#a65e46', x + 4, y + height, 3, 2);
  R(g, '#535459', x + 3, y + (pose >= 2 ? 4 : height), 1, 1);
  if (pose === 3) R(g, '#5a8e87', x + 4, y + 3, 2, 1);
}
function basketStrip(g: Ctx, x: number, y: number, dock = false) {
  basketFrame(g, x, y, dock ? 3 : 0);
  basketFrame(g, x + 9, y, dock ? 0 : 1);
  basketFrame(g, x + 18, y, 2);
}
function frameRail(g: Ctx, checked: boolean, dock = false) {
  R(g, '#513f42', 2, 21, 33, 2);
  R(g, '#7d594b', 6, 14, 3, 7);
  R(g, '#7d594b', 28, 14, 3, 7);
  R(g, '#97794e', 3, 13, 30, 3);
  basketStrip(g, 5, 3, dock);
  R(g, '#679792', 3, 8, 3, 5);
  R(g, '#679792', 30, 8, 3, 5);
  if (checked) {
    R(g, '#deb86e', 14, 20, 10, 2);
    R(g, '#eed097', 19, 19, 3, 1);
  }
}
function frameFolio(g: Ctx, supported: boolean, hook: boolean, dock = false) {
  if (supported) {
    R(g, '#564348', 5, 13, 27, 8);
    R(g, '#a57b53', 5, 13, 27, 2);
    R(g, '#7a594d', 8, 16, 21, 2);
  }
  basketStrip(g, 5, 4, dock);
  R(g, '#b67964', 13, 5, 1, 9);
  R(g, '#b67964', 22, 5, 1, 9);
  if (hook) {
    R(g, '#85a9a1', 26, 15, 2, 5);
    R(g, '#85a9a1', 24, 18, 3, 2);
    R(g, '#d0a778', 22, 20, 9, 3);
  }
}
DRAW['frames.samples'] = [36, 24, (g) => {
  basketStrip(g, 5, 1);
  R(g, '#e3c396', 5, 14, 26, 8);
  R(g, '#bd7868', 13, 14, 2, 8);
  R(g, '#bd7868', 22, 14, 2, 8);
}];
DRAW['frames.tested-hinges'] = [36, 24, (g) => {
  basketStrip(g, 5, 1);
  R(g, '#f1d2a4', 13, 2, 2, 7);
  R(g, '#dbc193', 5, 14, 26, 8);
  R(g, '#6a9c91', 13, 14, 2, 8);
  R(g, '#6a9c91', 22, 14, 2, 8);
}];
DRAW['frames.still'] = [36, 24, (g) => {
  R(g, '#6f514d', 5, 9, 26, 13);
  R(g, '#947358', 7, 9, 22, 10);
  basketFrame(g, 14, 5, 1);
}];
DRAW['frames.sequence'] = [36, 24, (g) => basketStrip(g, 5, 7)];
DRAW['frames.rail'] = [36, 24, (g) => frameRail(g, false)];
DRAW['frames.rail-mark'] = [36, 24, (g) => frameRail(g, true)];
DRAW['frames.folio'] = [36, 24, (g) => frameFolio(g, false, false)];
DRAW['frames.folio-rest'] = [36, 24, (g) => frameFolio(g, true, false)];
DRAW['frames.dock-sequence'] = [36, 24, (g) => basketStrip(g, 5, 7, true)];
DRAW['frames.dock-rail'] = [36, 24, (g) => frameRail(g, false, true)];
DRAW['frames.dock-rail-mark'] = [36, 24, (g) => frameRail(g, true, true)];
DRAW['frames.dock-folio'] = [36, 24, (g) => frameFolio(g, false, false, true)];
DRAW['frames.dock-rest'] = [36, 24, (g) => frameFolio(g, true, false, true)];
DRAW['frames.dock-hook'] = [36, 24, (g) => frameFolio(g, true, true, true)];
DRAW['frames.proof'] = [36, 24, (g) => {
  R(g, '#76544b', 2, 2, 32, 20);
  R(g, '#e1bf9a', 3, 3, 30, 17);
  basketStrip(g, 5, 4);
  R(g, '#638f85', 6, 17, 10, 2);
  R(g, '#a56758', 20, 17, 10, 2);
}];

DRAW['market.waypost'] = [16, 24, (g) => {
  R(g, '#514751', 6, 7, 4, 16);
  R(g, '#6c8e83', 2, 5, 12, 10);
  R(g, '#96ad98', 2, 5, 12, 2);
  R(g, '#e5c589', 7, 8, 2, 5);
  R(g, '#e5c589', 4, 8, 8, 1);
  R(g, '#d4a678', 4, 11, 2, 2);
  R(g, '#d4a678', 10, 11, 2, 2);
}];
DRAW['market.window'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  R(g, '#5c7779', 2, 3, 20, 12);
  paper(g, 4, 4, 16, 10);
  R(g, '#76928d', 5, 7, 14, 1);
  R(g, '#9a765d', 5, 10, 14, 1);
  R(g, '#806653', 11, 6, 1, 6);
}];
// Original catalogue mount diagram. The banknote's engraving and serial are separate from this drawing.
DRAW['market.note-mount'] = [42, 28, (g) => {
  R(g, '#4f4a47', 1, 8, 40, 18);
  R(g, '#aa8968', 1, 6, 40, 17);
  R(g, '#d6bc8d', 3, 7, 36, 14);
  R(g, '#345459', 5, 9, 27, 9);
  R(g, '#7fada1', 6, 10, 25, 7);
  R(g, '#345459', 9, 12, 3, 3);
  R(g, '#d9deb1', 15, 12, 13, 1);
  R(g, '#d9deb1', 15, 14, 10, 1);
  R(g, '#6d5a65', 34, 10, 3, 7);
  R(g, '#8b876e', 12, 23, 18, 2);
}];
DRAW['market.rest-mat'] = [24, 16, (g) => {
  R(g, '#2b484c', 1, 9, 22, 6);
  R(g, '#44787a', 2, 8, 20, 6);
  R(g, '#a7cfc3', 3, 9, 18, 1);
  R(g, '#a7cfc3', 3, 12, 18, 1);
  R(g, '#655241', 4, 14, 16, 1);
  R(g, '#ad775c', 15, 3, 6, 6);
  R(g, '#f3d19a', 16, 3, 4, 2);
  R(g, '#e1b782', 21, 4, 2, 2);
}];

// Water Commons posts and the paper records pinned in the council yard.
DRAW['water.waypost'] = [16, 24, (g) => {
  R(g, '#6e6255', 6, 6, 4, 17);
  R(g, '#466e77', 1, 5, 14, 10);
  R(g, '#8cb3ad', 2, 5, 12, 2);
  R(g, '#bfd0b7', 3, 9, 5, 1);
  R(g, '#bfd0b7', 7, 11, 6, 1);
}];
function waterLever(g: Ctx, checked: boolean) {
  pedestal(g, 1, 15, 14);
  R(g, '#604e4b', 4, 12, 8, 3);
  R(g, '#53646a', 6, 7, 4, 6);
  R(g, '#a98263', 7, 4, 2, 7);
  R(g, '#d1b27e', 5, 3, 6, 2);
  R(g, checked ? '#8ab39d' : '#c28570', 10, 11, 3, 2);
}
DRAW['water.lever'] = [16, 24, (g) => waterLever(g, false)];
DRAW['water.lever-repaired'] = [16, 24, (g) => waterLever(g, true)];
DRAW['water.notice'] = [16, 24, (g) => {
  R(g, '#645c51', 4, 6, 8, 17);
  paper(g, 2, 4, 12, 11);
  R(g, '#6d9b96', 4, 6, 8, 2);
  R(g, '#7f765b', 4, 10, 7, 1);
  R(g, '#7f765b', 4, 12, 5, 1);
}];
function allocationRecord(g: Ctx, dividingLine: number) {
  smallTable(g);
  paper(g, 1, 4, 14, 11);
  R(g, '#a6ac72', 3, 7, dividingLine, 3);
  R(g, '#78a3a8', 3 + dividingLine, 7, 10 - dividingLine, 3);
  R(g, '#88735a', 3, 12, 10, 1);
}
DRAW['water.fields'] = [16, 24, (g) => allocationRecord(g, 7)];
DRAW['water.split'] = [16, 24, (g) => allocationRecord(g, 5)];
DRAW['water.channel'] = [16, 24, (g) => allocationRecord(g, 3)];
DRAW['water-loop.course'] = [32, 24, (g) => {
  R(g, '#474749', 2, 19, 28, 4);
  R(g, '#8f7c68', 1, 17, 30, 3);
  R(g, '#6a8c87', 4, 12, 17, 5);
  R(g, '#a7c4b6', 5, 12, 15, 1);
  R(g, '#83b9bc', 7, 14, 10, 2);
  R(g, '#d5ccb0', 11, 3, 5, 9);
  R(g, '#97c4bb', 12, 5, 2, 6);
  R(g, '#e5a767', 23, 6, 4, 11);
  R(g, '#ad6e52', 26, 5, 4, 3);
  R(g, '#87aaa6', 20, 17, 7, 2);
}];
// Original sectional diagram based on the feature names in the project record.
DRAW['water-loop.jewel'] = [52, 32, (g) => {
  R(g, '#263c49', 0, 0, 52, 32);
  R(g, '#75999b', 4, 15, 10, 2);
  R(g, '#75999b', 9, 11, 12, 2);
  R(g, '#b9cdc5', 16, 8, 20, 3);
  R(g, '#75999b', 31, 11, 12, 2);
  R(g, '#75999b', 38, 15, 10, 2);
  R(g, '#30525c', 22, 8, 8, 3);
  R(g, '#b0d5cb', 25, 9, 3, 16);
  R(g, '#74adb3', 23, 13, 1, 11);
  R(g, '#8cbbb5', 29, 12, 1, 12);
  R(g, '#729370', 2, 24, 20, 3);
  R(g, '#67876b', 30, 22, 20, 5);
  R(g, '#a2b37e', 3, 22, 8, 4);
  R(g, '#afb681', 39, 19, 8, 5);
  R(g, '#638890', 20, 26, 13, 3);
}];

// Civic Machine destination markers and the original paper records that stay in each district.
DRAW['civic.waypost'] = [20, 24, (g) => {
  R(g, '#69595b', 8, 7, 4, 16);
  R(g, '#817176', 1, 4, 18, 13);
  R(g, '#a9b6a1', 2, 5, 16, 10);
  R(g, '#d4ad88', 2, 5, 16, 2);
  R(g, '#585d72', 8, 7, 3, 8);
  R(g, '#585d72', 5, 8, 10, 2);
  R(g, '#806276', 5, 10, 3, 2);
  R(g, '#527e7c', 12, 10, 3, 2);
}];
DRAW['civic.console'] = [24, 24, (g) => {
  pedestal(g, 2, 14, 20);
  R(g, '#536575', 2, 4, 20, 12);
  R(g, '#b3b7a0', 4, 5, 16, 2);
  R(g, '#cfe2bd', 5, 7, 10, 6);
  R(g, '#818a76', 6, 9, 8, 1);
  R(g, '#818a76', 6, 11, 5, 1);
  R(g, '#a68c7a', 17, 8, 3, 2);
  R(g, '#ccba78', 17, 11, 3, 2);
}];
DRAW['civic.ledger'] = [16, 24, (g) => {
  smallTable(g);
  paper(g, 2, 4, 12, 11);
  R(g, '#889ca2', 3, 6, 4, 2);
  R(g, '#a08080', 9, 6, 4, 2);
  for (const y of [10, 12]) {
    R(g, '#7f7769', 4, y, 3, 1);
    R(g, '#7f7769', 9, y, 3, 1);
  }
}];
DRAW['civic.notice'] = [20, 24, (g) => {
  R(g, '#705c5b', 7, 7, 6, 16);
  paper(g, 2, 3, 16, 13);
  R(g, '#738a96', 3, 5, 14, 2);
  R(g, '#8b7964', 5, 9, 10, 1);
  R(g, '#8b7964', 5, 12, 7, 1);
}];
DRAW['civic.wide'] = [24, 24, (g) => {
  R(g, '#674f55', 3, 6, 18, 17);
  paper(g, 1, 3, 22, 14);
  R(g, '#718b8b', 3, 5, 18, 2);
  R(g, '#997a6b', 4, 10, 16, 1);
  R(g, '#7d727b', 4, 13, 16, 1);
}];

function civicWindows(g: Ctx, stepsWindows: number) {
  R(g, '#6d5357', 7, 7, 6, 16);
  paper(g, 1, 3, 18, 13);
  for (let i = 0; i < 4; i++) {
    R(g, i < stepsWindows ? '#927289' : '#5c8e8f', 3 + i * 4, 7, 3, 4);
  }
  R(g, '#8b7964', 4, 13, 11, 1);
}
DRAW['civic.rank'] = [20, 24, (g) => civicWindows(g, 0)];
DRAW['civic.reserve'] = [20, 24, (g) => civicWindows(g, 1)];
DRAW['civic.even'] = [20, 24, (g) => civicWindows(g, 2)];

// Archive of Voices record trays and landmarks made for the fictional walk.
DRAW['voices.waypost'] = [20, 24, (g) => {
  R(g, '#725b67', 8, 8, 4, 15);
  R(g, '#7e667e', 1, 4, 18, 12);
  R(g, '#ad97a7', 2, 5, 16, 2);
  R(g, '#dfbf9d', 3, 9, 5, 4);
  R(g, '#dfbf9d', 12, 9, 5, 4);
  R(g, '#596e7c', 9, 7, 2, 7);
}];
DRAW['voices.desk'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  R(g, '#656372', 2, 6, 20, 10);
  R(g, '#a7888e', 2, 5, 20, 2);
  R(g, '#9b9c99', 4, 8, 7, 6);
  R(g, '#ddb6a0', 6, 9, 3, 4);
  paper(g, 13, 7, 7, 7);
  R(g, '#83737c', 14, 9, 5, 1);
  R(g, '#83737c', 14, 11, 4, 1);
}];
DRAW['voices.permission'] = [16, 24, (g) => {
  smallTable(g);
  paper(g, 2, 4, 12, 11);
  R(g, '#9c788c', 2, 4, 12, 2);
  R(g, '#84748a', 4, 8, 8, 1);
  R(g, '#84748a', 4, 10, 6, 1);
  R(g, '#ae8b72', 10, 11, 2, 2);
}];
DRAW['voices.register'] = [22, 24, (g) => {
  pedestal(g, 1, 15, 20);
  R(g, '#756470', 2, 4, 18, 12);
  paper(g, 3, 5, 16, 9);
  R(g, '#a98e86', 10, 5, 2, 9);
  R(g, '#898463', 4, 8, 5, 1);
  R(g, '#898463', 13, 8, 4, 1);
  R(g, '#aa866d', 14, 10, 3, 2);
}];
DRAW['voices.paired'] = [24, 24, (g) => {
  R(g, '#715e6c', 3, 7, 18, 16);
  paper(g, 1, 3, 11, 12);
  paper(g, 12, 3, 11, 12);
  R(g, '#a08093', 2, 4, 8, 2);
  R(g, '#6d8b90', 13, 4, 8, 2);
  for (const x of [3, 14]) {
    R(g, '#80766e', x, 9, 6, 1);
    R(g, '#80766e', x, 12, 4, 1);
  }
}];
DRAW['voices.guide'] = [20, 24, (g) => {
  R(g, '#74636c', 8, 7, 4, 16);
  paper(g, 1, 3, 18, 12);
  R(g, '#6f858b', 3, 5, 14, 2);
  R(g, '#8b657c', 4, 9, 7, 1);
  R(g, '#8b657c', 10, 8, 2, 4);
  R(g, '#8b657c', 12, 9, 2, 2);
}];
DRAW['voices.arch'] = [20, 24, (g) => {
  R(g, '#665862', 8, 7, 4, 16);
  paper(g, 1, 3, 18, 12);
  R(g, '#7c9a96', 4, 8, 3, 5);
  R(g, '#7c9a96', 13, 8, 3, 5);
  R(g, '#7c9a96', 7, 6, 6, 3);
  R(g, '#a98b82', 5, 11, 9, 1);
}];
DRAW['voices.railing'] = [16, 24, (g) => {
  R(g, '#716670', 6, 7, 4, 16);
  R(g, '#d0b9a5', 2, 5, 12, 8);
  R(g, '#668689', 3, 8, 9, 2);
  R(g, '#668689', 9, 7, 3, 5);
}];
DRAW['voices.lamp'] = [16, 32, (g) => {
  R(g, '#665c64', 6, 7, 4, 24);
  R(g, '#746568', 4, 3, 8, 12);
  R(g, '#987b68', 5, 2, 6, 2);
  R(g, '#dfb68a', 5, 5, 6, 8);
  R(g, '#ffdf9f', 7, 7, 3, 5);
  R(g, '#9f7c65', 5, 26, 6, 2);
}];

// Map parts made for the Island of Models' three hypothetical routes.
DRAW['island.waypost'] = [20, 24, (g) => {
  R(g, '#695b53', 8, 7, 4, 16);
  R(g, '#707b6a', 1, 4, 18, 12);
  R(g, '#a7b096', 2, 5, 16, 2);
  R(g, '#d4b68c', 4, 9, 6, 2);
  R(g, '#a893a1', 8, 7, 2, 7);
  R(g, '#8eb2a7', 10, 10, 6, 2);
}];
DRAW['island.plan'] = [26, 24, (g) => {
  pedestal(g, 1, 15, 24);
  R(g, '#678c90', 2, 4, 22, 12);
  R(g, '#b4aa82', 5, 7, 16, 6);
  R(g, '#9aa07c', 8, 5, 10, 3);
  R(g, '#a1926c', 11, 5, 3, 7);
  R(g, '#baa183', 5, 10, 5, 2);
  R(g, '#8f6c6d', 17, 8, 3, 4);
  R(g, '#bb986e', 7, 11, 3, 2);
  R(g, '#9d8398', 11, 9, 3, 2);
}];
DRAW['island.card'] = [16, 24, (g) => {
  smallTable(g);
  paper(g, 2, 4, 12, 11);
  R(g, '#a19271', 3, 5, 10, 2);
  for (const y of [9, 11, 13]) R(g, '#817b6a', 4, y, 7, 1);
}];
DRAW['island.landing'] = [20, 24, (g) => {
  R(g, '#806d5d', 7, 6, 5, 17);
  paper(g, 1, 4, 18, 12);
  R(g, '#789b95', 2, 8, 16, 2);
  R(g, '#a78e70', 4, 7, 4, 5);
  R(g, '#74806e', 10, 11, 7, 2);
}];
DRAW['island.signal'] = [20, 24, (g) => {
  R(g, '#705a51', 3, 4, 3, 19);
  R(g, '#7a6256', 14, 12, 3, 11);
  R(g, '#b09978', 13, 12, 5, 2);
  R(g, '#8d685c', 2, 4, 8, 8);
  R(g, '#c7a076', 3, 5, 6, 6);
  R(g, '#ad8d70', 14, 16, 5, 2);
}];
DRAW['island.margin'] = [20, 24, (g) => {
  R(g, '#685f50', 8, 8, 4, 15);
  R(g, '#95886b', 1, 4, 18, 13);
  paper(g, 2, 5, 16, 10);
  for (const x of [4, 8, 12]) {
    R(g, '#829671', x, 7, 2, 6);
    R(g, '#9f9d77', x + 2, 8, 1, 4);
  }
}];

function islandRouteNotice(g: Ctx, route: 'ridge' | 'ferry' | 'marsh') {
  const colours = { ridge: '#8a7296', ferry: '#59918e', marsh: '#84956c' };
  R(g, '#785f54', 7, 8, 6, 15);
  paper(g, 1, 4, 18, 12);
  R(g, colours[route], 3, 6, 14, 3);
  R(g, '#8f7966', 4, 11, 10, 1);
  R(g, '#8f7966', 4, 13, 7, 1);
}
DRAW['island.ridge'] = [20, 24, (g) => islandRouteNotice(g, 'ridge')];
DRAW['island.ferry'] = [20, 24, (g) => islandRouteNotice(g, 'ferry')];
DRAW['island.marsh'] = [20, 24, (g) => islandRouteNotice(g, 'marsh')];

// Council of Inquiry instruments and reading room display cards.
DRAW['council.waypost'] = [20, 24, (g) => {
  R(g, '#6f595e', 8, 8, 4, 15);
  R(g, '#6b6b82', 1, 4, 18, 12);
  R(g, '#9a94a4', 2, 5, 16, 2);
  R(g, '#c4a882', 4, 7, 5, 7);
  R(g, '#e2c59b', 11, 7, 5, 7);
  R(g, '#827272', 6, 8, 1, 4);
  R(g, '#827272', 13, 8, 1, 4);
}];

function councilDial(g: Ctx, x: number, y: number, edge: string, hand: string) {
  R(g, edge, x + 2, y, 6, 11);
  R(g, edge, x, y + 2, 10, 7);
  R(g, '#d9c5a5', x + 2, y + 2, 6, 7);
  R(g, hand, x + 5, y + 3, 1, 5);
}
DRAW['council.clock'] = [24, 24, (g) => {
  pedestal(g, 1, 15, 22);
  councilDial(g, 1, 3, '#806970', '#6c5c62');
  councilDial(g, 13, 3, '#779099', '#5e7177');
  R(g, '#a88975', 2, 14, 20, 2);
}];
DRAW['council.record'] = [22, 24, (g) => {
  R(g, '#735e6c', 7, 7, 7, 16);
  paper(g, 1, 3, 20, 13);
  R(g, '#7d8e99', 3, 5, 16, 2);
  R(g, '#967d83', 4, 9, 13, 1);
  R(g, '#867764', 4, 12, 13, 1);
  R(g, '#9a856e', 17, 10, 2, 3);
}];
DRAW['council.relay'] = [22, 24, (g) => {
  R(g, '#6b626d', 7, 7, 7, 16);
  paper(g, 1, 3, 20, 13);
  R(g, '#7a829a', 4, 8, 4, 5);
  R(g, '#9c818b', 14, 8, 4, 5);
  R(g, '#8d7e6e', 8, 8, 5, 1);
  R(g, '#8d7e6e', 9, 10, 4, 1);
}];
DRAW['council.optics'] = [20, 24, (g) => {
  pedestal(g, 1, 15, 18);
  paper(g, 2, 4, 16, 11);
  R(g, '#9a8398', 3, 5, 14, 2);
  R(g, '#8e826d', 4, 10, 6, 1);
  R(g, '#a78b75', 11, 8, 3, 5);
  R(g, '#779288', 14, 10, 2, 1);
}];
DRAW['council.letter'] = [20, 24, (g) => {
  pedestal(g, 1, 15, 18);
  paper(g, 2, 4, 16, 11);
  R(g, '#758d97', 3, 5, 14, 2);
  for (const y of [9, 11, 13]) R(g, '#84796c', 4, y, 10 - y % 3, 1);
}];

for (const position of ['empty', 'masked', 'open', 'wide', 'hinge']) {
  DRAW[`lower-rail.${position}`] = [16, 24, (g) => {
    R(g, '#4e372d', 6, 13, 4, 9);
    R(g, '#7f5c42', 3, 20, 10, 2);
    R(g, '#624535', 1, 3, 14, 13);
    R(g, '#bf9e65', 2, 4, 12, 1);
    if (position !== 'empty') {
      paper(g, 3, 5, 10, 10);
      R(g, '#53433c', 5, 7, 6, 1);
      R(g, '#53433c', 5, 9, 5, 1);
      R(g, '#57736f', 5, 12, 6, 1);
    }
    if (position === 'empty' || position === 'masked') R(g, '#936746', 1, 11, 14, 3);
    if (position === 'wide') R(g, '#d3a76b', 0, 14, 16, 2);
    if (position === 'hinge') {
      R(g, '#987a59', 13, 5, 2, 10);
      R(g, '#d3a76b', 12, 3, 3, 2);
    }
    R(g, '#f1cc84', 2, 12, 1, 1);
    R(g, '#f1cc84', 13, 12, 1, 1);
  }];
}
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

// Original schematics from the records’ material and form fields.
DRAW['big.accession-khipu'] = [40, 29, (g) => {
  R(g, '#302d40', 0, 0, 40, 29);
  R(g, '#ead8aa', 3, 5, 34, 2);
  for (const [x, end] of [[7, 21], [11, 25], [15, 19], [19, 24], [23, 23], [27, 26], [31, 19], [34, 22]]) {
    R(g, '#d1ad7d', x, 6, 1, end - 6);
    R(g, '#f3dbad', x - 1, end - 8, 3, 2);
    R(g, '#b68b5e', x - 1, end - 3, 3, 2);
  }
}];
DRAW['big.accession-shell'] = [40, 29, (g) => {
  R(g, '#302d40', 0, 0, 40, 29);
  R(g, '#879693', 27, 16, 2, 8);
  R(g, '#879693', 28, 23, 7, 2);
  R(g, '#879693', 34, 18, 2, 6);
  R(g, '#879693', 31, 17, 4, 2);
  R(g, '#88685c', 7, 11, 5, 10);
  R(g, '#be8a71', 11, 8, 8, 15);
  R(g, '#d8b292', 18, 9, 7, 12);
  R(g, '#ead0ad', 24, 10, 5, 9);
  R(g, '#ead0ad', 28, 11, 5, 5);
  R(g, '#594652', 9, 13, 2, 5);
  for (const [x, top, tall] of [[15, 9, 12], [21, 10, 10], [26, 11, 7]]) R(g, '#7f665d', x, top, 1, tall);
}];

// The two books use their documented features in original schematics.
DRAW['big.door-century-book'] = [40, 28, (g) => {
  R(g, '#3f4655', 3, 3, 34, 22);
  R(g, '#e8d8ac', 4, 4, 15, 19); R(g, '#ece1c2', 20, 4, 16, 19);
  R(g, '#9e6956', 19, 4, 1, 19); R(g, '#8b654b', 6, 6, 11, 2);
  for (const y of [10, 13, 16, 19]) R(g, '#9c8263', 6, y, 11, 1);
  for (const [width, y] of [[2, 7], [4, 8], [6, 9], [8, 10], [10, 11]]) R(g, '#587079', 28 - width / 2, y, width, 1);
  R(g, '#587079', 22, 12, 12, 2); R(g, '#587079', 23, 19, 10, 2);
  for (const x of [24, 27, 30]) R(g, '#587079', x, 14, 1, 5);
}];
DRAW['big.door-green-book'] = [40, 28, (g) => {
  R(g, '#3f4655', 3, 3, 34, 22);
  R(g, '#505c45', 10, 2, 20, 24); R(g, '#c8be86', 12, 4, 16, 20); R(g, '#363e35', 13, 5, 14, 18);
  R(g, '#dbca96', 14, 6, 12, 16); R(g, '#626550', 15, 7, 10, 2);
  R(g, '#8e785c', 16, 11, 8, 7); R(g, '#ead69a', 17, 11, 6, 6); R(g, '#ead69a', 15, 11, 2, 2);
  R(g, '#78664d', 18, 13, 4, 1); R(g, '#78664d', 18, 15, 4, 1); R(g, '#626550', 16, 20, 8, 1);
}];
DRAW['fold.open-door'] = [16, 16, (g) => {
  R(g, '#28364c', 3, 2, 10, 12); R(g, '#d9ae69', 4, 3, 8, 11);
  R(g, '#263c4b', 6, 5, 4, 9); R(g, '#4f8f85', 6, 6, 3, 7); R(g, '#d7dd8d', 8, 9, 1, 1);
}];
DRAW['fold.strip'] = [16, 16, (g) => {
  R(g, '#5b473f', 3, 4, 10, 11); R(g, '#e7d6ae', 4, 5, 8, 10); R(g, '#6f7958', 5, 7, 6, 1);
  R(g, '#945d54', 8, 10, 3, 3); R(g, '#a69170', 5, 10, 2, 1);
}];
DRAW['fold.two-hinges'] = [16, 16, (g) => {
  R(g, '#57616b', 1, 5, 14, 9); R(g, '#eccb86', 2, 5, 5, 8); R(g, '#e3b874', 9, 5, 5, 8);
  R(g, '#665b4d', 7, 6, 2, 6); R(g, '#547c77', 3, 8, 3, 2); R(g, '#a65f56', 10, 8, 2, 3);
}];
DRAW['fold.paired'] = [16, 16, (g) => {
  R(g, '#67514b', 2, 4, 12, 11); R(g, '#dfc38b', 3, 5, 10, 8);
  R(g, '#507c77', 4, 6, 3, 6); R(g, '#9e624f', 9, 7, 2, 3); R(g, '#645f53', 8, 11, 4, 1);
}];
DRAW['shelf-room.layer'] = [16, 16, (g) => {
  R(g, '#24344d', 2, 2, 12, 12); R(g, '#abcbe1', 3, 3, 10, 10);
  R(g, '#44647e', 4, 4, 8, 8); R(g, '#9ad7cb', 6, 4, 2, 8);
  R(g, '#f0d29a', 8, 7, 4, 2); R(g, '#dcebef', 11, 3, 2, 3);
}];
DRAW['shelf-room.staple'] = [16, 16, (g) => {
  R(g, '#46688a', 2, 3, 12, 10); R(g, '#b8dee6', 3, 4, 10, 8); R(g, '#758fb0', 4, 8, 8, 2);
  R(g, '#407f89', 6, 5, 1, 5); R(g, '#407f89', 9, 5, 1, 5);
}];
DRAW['shelf-room.tear'] = [16, 16, (g) => {
  R(g, '#46688a', 2, 3, 12, 10); R(g, '#b8dee6', 3, 4, 10, 8);
  for (const [x, y] of [[4, 6], [7, 7], [10, 8]]) R(g, '#4b7791', x, y, 2, 1);
  R(g, '#66869c', 9, 5, 2, 1); R(g, '#68849c', 7, 10, 1, 1);
}];
DRAW['drawer-board'] = [16, 16, (g) => {
  R(g, '#322d43', 1, 4, 14, 10); R(g, '#a57b58', 2, 5, 12, 8);
  for (const x of [3, 7, 11]) { R(g, '#dbc195', x, 6, 2, 2); R(g, '#ca9e6e', x, 10, 2, 2); }
}];
DRAW['big.drawer-cases'] = [40, 28, (g) => {
  R(g, '#39334b', 3, 3, 34, 22);
  for (const x of [5, 15, 25]) {
    R(g, '#ad815a', x, 6, 10, 16); R(g, '#dcbc78', x + 1, 7, 8, 5); R(g, '#c39d5e', x + 1, 14, 8, 6);
    R(g, '#58575d', x + 4, 9, 2, 1); R(g, '#58575d', x + 4, 16, 2, 1);
  }
}];

/** Map exhibit art keys (small) to large inspection pictures. */
Object.assign(DRAW, POLAR_ART, WINDOW_ART, READING_WORKS_ART, STORY_ARCHIVE_ART, NUMBER_LEAF_ART, DEPOT_ART, REFERENCE_STATION_ART,
  MODEL_RECORD_ART, SECOND_READING_ART, SHORE_REPLY_ART, JIG_SHOP_ART, MEMORY_CART_ART, PRICE_DRAWERS_ART);
Object.assign(DRAW, REFERENCE_PROOF_ART, PASSAGE_DOCUMENTARY_ART);
Object.assign(DRAW, MAKER_ROOM_ART);

// A proportioned conservation diagram. Pale divisions show folds, not glyphs or folio order.
DRAW['register.codex-fold'] = [16, 24, (g) => {
  pedestal(g, 1, 15, 14);
  R(g, '#46636f', 2, 5, 12, 10);
  R(g, '#d6bc8c', 3, 6, 10, 3); R(g, '#e9d3a7', 3, 11, 9, 3);
  for (const x of [4, 6, 8, 10]) { R(g, '#a58c6b', x, 6, 1, 3); R(g, '#b39c79', x, 11, 1, 3); }
}];
DRAW['big.register.codex-fold'] = [120, 72, (g) => {
  R(g, '#273a45', 0, 0, 120, 72);
  R(g, '#172832', 7, 8, 106, 19); R(g, '#d9bf90', 12, 13, 96, 8);
  for (let fold = 1; fold < 39; fold++) R(g, '#a38562', 12 + Math.round(96 * fold / 39), 13, 1, 8);
  R(g, '#243847', 12, 43, 52, 19); R(g, '#91afab', 13, 42, 51, 15); R(g, '#cfb588', 14, 47, 49, 6);
  R(g, '#243847', 66, 43, 49, 19); R(g, '#91afab', 66, 42, 49, 15); R(g, '#e4cca0', 67, 47, 47, 6);
  R(g, '#b9cdce', 12, 35, 65, 1); R(g, '#b9cdce', 12, 33, 1, 5); R(g, '#b9cdce', 76, 33, 1, 5);
}];

Object.assign(DRAW, TURNING_ART, LOAD_BAY_ART, BEARING_ART, PRISM_ART, ALIGNMENT_ART);

// A closed catalogue folder beside two fictional skyline slips.
DRAW['timbuktu.horizon-case'] = [16, 24, (g) => {
  pedestal(g, 1, 14, 14);
  R(g, '#776052', 2, 4, 12, 10); R(g, '#bc8f63', 2, 3, 12, 9);
  R(g, '#f0cf9f', 3, 4, 10, 1); R(g, '#6fa9b1', 9, 8, 4, 3);
}];
DRAW['big.timbuktu.horizon-case'] = [64, 40, (g) => {
  R(g, '#213549', 0, 0, 64, 40); R(g, '#385264', 1, 1, 62, 37);
  R(g, '#293842', 6, 30, 51, 3);
  R(g, '#71523f', 8, 6, 24, 25); R(g, '#b6865e', 8, 5, 24, 24);
  R(g, '#edc992', 9, 6, 22, 1); R(g, '#d4aa79', 10, 24, 18, 2);
  R(g, '#e9d1ab', 38, 7, 18, 10); R(g, '#e9d1ab', 40, 19, 18, 10);
  R(g, '#456776', 40, 11, 14, 2); R(g, '#456776', 42, 24, 14, 2);
  R(g, '#a06748', 49, 9, 2, 2); R(g, '#a06748', 47, 22, 2, 2);
}];

// An original drawing of the museum mount based on its catalogue description.
DRAW['callboard.gage-mount'] = [16, 24, (g) => {
  pedestal(g, 1, 15, 14);
  R(g, '#6c4738', 2, 12, 12, 2); R(g, '#c2a274', 3, 11, 2, 2); R(g, '#c2a274', 11, 11, 2, 2);
  R(g, '#738189', 2, 9, 12, 2); R(g, '#a6a9a1', 2, 9, 12, 1); R(g, '#d7d3a4', 6, 9, 3, 1);
}];
DRAW['big.callboard.gage-mount'] = [96, 64, (g) => {
  R(g, '#283c45', 0, 0, 96, 64);
  R(g, '#412e2a', 9, 41, 78, 10); R(g, '#795744', 11, 39, 74, 8);
  R(g, '#ae8c60', 20, 34, 7, 8); R(g, '#b29a71', 70, 34, 7, 8);
  R(g, '#4e5a62', 13, 26, 68, 8); R(g, '#7a8990', 13, 26, 68, 3);
  R(g, '#6f7c84', 6, 29, 9, 3); R(g, '#a4aaa8', 7, 28, 8, 1);
  R(g, '#c1baa0', 34, 28, 28, 4); R(g, '#d1c7ab', 35, 28, 27, 1);
  R(g, '#daca9a', 56, 48, 23, 5); R(g, '#9f876e', 58, 50, 15, 1);
}];

// Original reading-room model of a printed volume and its separate title slip.
DRAW['correspondence.crowther-book'] = [16, 24, (g) => {
  pedestal(g, 1, 15, 14);
  R(g, '#362747', 3, 5, 10, 9); R(g, '#53536a', 3, 4, 9, 8);
  R(g, '#f1debb', 5, 11, 8, 2); R(g, '#947a72', 4, 4, 1, 9);
  R(g, '#cfad7b', 8, 15, 5, 2);
}];
DRAW['big.correspondence.crowther-book'] = [96, 64, (g) => {
  R(g, '#2d3047', 0, 0, 96, 64); R(g, '#3b4057', 6, 7, 84, 48);
  R(g, '#3e304e', 12, 45, 67, 9); R(g, '#282236', 15, 18, 56, 29);
  R(g, '#666680', 15, 16, 54, 23); R(g, '#85849e', 16, 17, 51, 1);
  R(g, '#ac8e79', 16, 20, 4, 23); R(g, '#eedeb7', 21, 40, 50, 5);
  R(g, '#bca681', 22, 42, 47, 1); R(g, '#f0d2a0', 63, 31, 24, 17);
  R(g, '#8b695b', 66, 35, 16, 1); R(g, '#8b695b', 66, 39, 13, 1);
}];

export const BIG_ART: Record<string, string> = {
  'correspondence.crowther-book': 'big.correspondence.crowther-book',
  'callboard.gage-mount': 'big.callboard.gage-mount',
  'maker-exact-jiahu': 'maker-exact-jiahu', 'maker-exact-disk': 'maker-exact-disk',
  'maker-exact-laguna': 'maker-exact-laguna',
  'timbuktu.horizon-case': 'big.timbuktu.horizon-case',
  'turning.kunit-case': 'big.turning.kunit-case',
  ...PASSAGE_DOCUMENTARY_LARGE_ART,
  'window.case.trieste': 'window.case.trieste',
  'reading-works.braille': 'reading-works.braille',
  'depot.case.micro': 'depot.case.micro',
  'depot.case.micro-case': 'depot.case.micro-case',
  ...STORY_ARCHIVE_LARGE_ART,
  'reference-bone-tabs': 'reference-bone-tabs', 'reference-jikji-type': 'reference-jikji-type',
  'reference-rasulid-dial': 'reference-rasulid-dial',
  'register.codex-fold': 'big.register.codex-fold',
  'water-loop.jewel': 'water-loop.jewel',
  'drawer-cases': 'big.drawer-cases',
  'market.note-mount': 'market.note-mount',
  'door-century-book': 'big.door-century-book', 'door-green-book': 'big.door-green-book',
  'accession-khipu': 'big.accession-khipu', 'accession-shell': 'big.accession-shell',
  'nile.scroll': 'nile.scroll', 'nile.tablet': 'nile.tablet', 'nile.map': 'nile.map', 'nile.stone': 'nile.stone',
  'preserved.temple': 'big.preserved.temple', 'preserved.catalogue': 'big.preserved.catalogue',
  'departure.catalogue': 'big.departure.catalogue',
  'seam.case-textile': 'big.seam.case-textile',
  'seam.case-photo': 'big.seam.case-photo',
  'lintel.case-page': 'big.lintel.case-page',
  'lintel.case-building': 'big.lintel.case-building',
  'plate.case-fold': 'big.plate.case-fold',
  'plate.case-set': 'big.plate.case-set',
  'preserved.coast': 'big.preserved.coast', 'preserved.context': 'big.preserved.context',
  'preserved.binak-diagram': 'big.preserved.binak-diagram', 'sea.dugout-diagram': 'big.sea.dugout-diagram',
  'fitting-views.case': 'big.fitting-views.photograph',
  'same-red.exhibit': 'big.same-red.exhibit',
  'forest.field-diagram': 'big.forest.field-diagram',
  'exhibit.patent': 'big.patent', 'exhibit.model': 'big.model', 'exhibit.biro': 'big.biro',
  'exhibit.blade': 'big.blade', 'exhibit.ingots': 'big.ingots', 'exhibit.assay': 'big.assay',
  'plaque.earth': 'big.earth', 'plaque.optics': 'big.optics', 'plaque.type': 'big.type', 'plaque.peak': 'big.peak',
  'plaque.flight': 'big.flight', 'plaque.vote': 'big.vote', 'plaque.book': 'big.book',
};

/** Schematic icons for the original-copy viewer in the Nexus. */
for (const view of ['sheet', 'detail'] as const) {
  for (const fixed of [false, true]) {
    DRAW[`nexus.viewer-${fixed ? 'fixed-' : ''}${view}`] = [23, 23, (g) => {
      g.fillStyle = '#40344a'; g.fillRect(2, 6, 19, 15);
      g.fillStyle = '#d6b67c'; g.fillRect(4, 5, 15, 14);
      g.fillStyle = '#f3dba3'; g.fillRect(5, 6, 13, 12);
      g.fillStyle = '#625069';
      if (view === 'sheet') {
        g.fillRect(7, 8, 7, 1); g.fillRect(7, 15, 8, 1);
        g.fillRect(10, 10, 2, 3);
        g.fillStyle = '#79554e'; g.fillRect(10, 13, 2, 2);
        if (fixed) { g.strokeStyle = '#557c83'; g.lineWidth = 1; g.strokeRect(8.5, 9.5, 5, 6); }
      } else {
        g.fillRect(7, 7, 2, 7); g.fillRect(15, 7, 2, 7);
        g.fillStyle = '#79554e';
        g.beginPath(); g.arc(12, 14, 3.5, 0, Math.PI * 2); g.fill();
        if (fixed) { g.fillStyle = '#6d9ca2'; g.fillRect(16, 15, 6, 4); }
      }
      g.fillStyle = '#728889'; g.fillRect(2, 10, 2, 4);
    }];
  }
}
