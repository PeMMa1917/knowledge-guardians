import {classroom} from '../classroom/client';
/**
 * The photo album lives only on this device (localStorage), like saved pictures.
 * Pictures are small JPEG thumbnails. Never sent anywhere, never in a progress file.
 */
import type { CaptionLine } from '../domain/album';

export interface AlbumPhoto {
  id: string;
  at: string;
  place: string;
  thumb: string;               // data URL (JPEG)
  lines: CaptionLine[];
  answers: Record<string, 'shows' | 'thinks'>;
  checked: boolean;
}

const albumKey = () => classroom?.albumKey ?? 'kg.album';
export const ALBUM_MAX = 12;

export function loadAlbum(): AlbumPhoto[] {
  try { const a = JSON.parse(localStorage.getItem(albumKey()) ?? '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}

/** Saves the album; drops the oldest pictures if storage is full. Returns false if nothing could be saved. */
export function saveAlbum(list: AlbumPhoto[]): boolean {
  let l = list.slice(-ALBUM_MAX);
  while (l.length) {
    try { localStorage.setItem(albumKey(), JSON.stringify(l)); return true; } catch { l = l.slice(1); }
  }
  try { localStorage.removeItem(albumKey()); } catch { /* storage blocked */ }
  return false;
}
