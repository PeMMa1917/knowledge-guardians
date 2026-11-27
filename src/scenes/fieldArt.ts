import type Phaser from 'phaser';
import { drawArt } from '../ui/illustrations';

/** Register original field art the first time this game needs to draw it. */
export function ensureFieldArt(textures: Phaser.Textures.TextureManager, key: string): boolean {
  if (textures.exists(key)) return true;
  const canvas = drawArt(key);
  return !!canvas && !!textures.addCanvas(key, canvas);
}
