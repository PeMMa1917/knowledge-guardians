/**
 * Shared references between the Phaser world and the HTML interface.
 * Set once in main.ts.
 */
import type { GameController } from './controller';
import type { Settings } from './settings';

export interface UIApi {
  isModalOpen(): boolean;
  setCompass(deg: number | null, label: string): void;
  openDialogue(characterId: string): void;
  openExhibit(exhibitId: string): void;
  openBench(): void;
  openLabel(kit: string): void;
  openLock(lock: string): void;
  openAlcove(alcove: string): void;
  openPuzzle(puzzle: string): void;
  openClueBoard(board: string): void;
  openQuarters(): void;
  openDive(): void;
  openLamps(): void;
  openTiles(): void;
  openTown(): void;
  openShop(): void;
  openWorkbench(): void;
  openReading(reading: string): void;
  openRumours(): void;
  openTrader(): void;
  openSeal(seal: string): void;
  openBoss(): void;
  openNileModel(): void;
  openForestWatch(site: string): void;
  openMetalTrial(sample: string): void;
  openCopyComparison(edition: string): void;
  openSeaChart(chart: string): void;
  openStageRehearsal(): void;
  openMarketScale(): void;
  openWaterGate(): void;
  openTalents(atWaystone?: boolean): void;
  openLedger(): void;
  openClue(id: string): void;
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
  /** Lumen's form or glow changed: swap the picture and tint. */
  refreshLumen(): void;
  playSfx(key: string): void;
  snapshotPosition(): void;
  /** Photo mode: camera zoom, a colour filter, and who is in the picture. */
  photoSet(o: { zoom: number; filter: string; lumen: boolean; pet: boolean } | null): boolean;
  photoSnap(cb: (img: HTMLImageElement | null) => void): void;
  photoZoom(): number;
  /** A picture of the whole map, and a function from world pixels to picture pixels. */
  mapSnap(cb: (r: { img: HTMLImageElement; at: (wx: number, wy: number) => [number, number]; marks: { kind: 'you' | 'new' | 'place' | 'waystone' | 'portal'; x: number; y: number; label: string }[]; fog: { x: number; y: number; w: number; h: number }[]; explored: number } | null) => void): void;
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
