/**
 * Shared references between the Phaser world and the HTML interface.
 * Set once in main.ts.
 */
import type { GameController } from './controller';
import type { Settings } from './settings';

export interface UIApi {
  isModalOpen(): boolean;
  openDialogue(characterId: string): void;
  openExhibit(exhibitId: string): void;
  openBench(): void;
  openLabel(kit: string): void;
  openLock(lock: string): void;
  openAlcove(alcove: string): void;
  openPuzzle(puzzle: string): void;
  openClueBoard(board: string): void;
  openLoreling(loreling: string, sighting?: string): void;
  openForge(): void;
  openAssay(exhibitId: string): void;
  followThread(thread: string, node: string): void;
  openWaystone(place: string): void;
  playScene(node: string): void;
  showSign(title: string, text: string): void;
  setPrompt(text: string | null): void;
  toast(text: string, kind?: string): void;
  refreshHud(): void;
  chapterEnd(): void;
}

export interface WorldApi {
  changeMap(mapId: string, x: number, y: number): void;
  lumenBurst(): void;
  setPaused(p: boolean): void;
  applySettings(): void;
  playSfx(key: string): void;
  snapshotPosition(): void;
  /** Photo mode: camera zoom, a colour filter, and who is in the picture. */
  photoSet(o: { zoom: number; filter: string; lumen: boolean; pet: boolean } | null): boolean;
  photoSnap(cb: (img: HTMLImageElement | null) => void): void;
  photoZoom(): number;
  photoSubjects(): import('../domain/album').PhotoSubject[];
  emote(id: string): void;
  /** Redraw state-driven visuals: Fray glows, the Provenance Thread, visible objects. */
  refreshWorld(): void;
}

export const ctx = {
  controller: null as unknown as GameController,
  ui: null as unknown as UIApi,
  world: null as WorldApi | null,
  settings: null as unknown as Settings,
};
