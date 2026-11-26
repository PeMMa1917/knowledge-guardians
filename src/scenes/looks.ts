/**
 * Builds a player sheet at runtime from the base sheet and the player's look
 * (src/domain/appearance.ts). Ready-made looks use the sheets on disk.
 */
import Phaser from 'phaser';
import { decodeLook, recolour } from '../domain/appearance';
import { CHAR_FRAME } from './art';

export const BASE_SHEET_KEY = 'charbase';
export const BASE_SHEET_URL = 'assets/art/armm1998/character.png';

/**
 * Returns the sheet id for `look` (the texture is `char.<id>`), making it if needed.
 * `threads` are cloak embroidery colours (spec 32.6); a look with threads gets its own sheet.
 */
export function ensureLook(scene: Phaser.Scene, look0: string, threads: string[] = []): string {
  const look = threads.length ? `${look0}~${threads.join('-')}` : look0;
  if (scene.textures.exists(`char.${look}`)) return look;
  const base = scene.textures.get(BASE_SHEET_KEY)?.getSourceImage() as HTMLImageElement | undefined;
  if (!base || !base.width) return 'player-a';
  const w = 272, h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.drawImage(base, 0, 0, w, h, 0, 0, w, h);
  const img = g.getImageData(0, 0, w, h);
  recolour(img.data, w, h, decodeLook(look0), threads);
  g.putImageData(img, 0, 0);
  scene.textures.addSpriteSheet(`char.${look}`, canvas as unknown as HTMLImageElement, { frameWidth: CHAR_FRAME.w, frameHeight: CHAR_FRAME.h });
  ['down', 'right', 'up', 'left'].forEach((d, row) => {
    const k = `${look}.walk.${d}`;
    if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: scene.anims.generateFrameNumbers(`char.${look}`, { start: row * 17, end: row * 17 + 3 }), frameRate: 8, repeat: -1 });
  });
  return look;
}

/** A small preview canvas of the front-facing frame, for the menus (no Phaser needed). */
let baseImg: Promise<HTMLImageElement> | null = null;
export function previewLook(look: string, scale = 4, threads: string[] = []): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 16 * scale; c.height = 32 * scale;
  c.setAttribute('aria-hidden', 'true');
  baseImg ??= new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = BASE_SHEET_URL; });
  baseImg.then((img) => {
    const t = document.createElement('canvas'); t.width = 16; t.height = 32;
    const g = t.getContext('2d')!;
    g.drawImage(img, 0, 0, 16, 32, 0, 0, 16, 32);
    const d = g.getImageData(0, 0, 16, 32);
    recolour(d.data, 16, 32, decodeLook(look), threads);
    g.putImageData(d, 0, 0);
    const out = c.getContext('2d')!;
    out.imageSmoothingEnabled = false;
    out.drawImage(t, 0, 0, 16 * scale, 32 * scale);
  }).catch(() => { /* preview is optional */ });
  return c;
}
