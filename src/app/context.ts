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
  openBoard(): void;
  openSort(): void;
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
}

export const ctx = {
  controller: null as unknown as GameController,
  ui: null as unknown as UIApi,
  world: null as WorldApi | null,
  settings: null as unknown as Settings,
};
