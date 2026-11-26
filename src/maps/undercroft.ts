/**
 * WORLD-02 Aethelgard: the Undercroft, Elsbet's records vault under her study (the chapter 1
 * 'dungeon'). A hatch in the study opens after her letter is found. Three fallacy seals block the
 * corridor (src/domain/undercroft.ts); the Hollow Archivist waits at the end. 32 x 9 tiles. Fictional.
 */
import type { MapDef } from './types';

const W = 32, H = 9;

function floor(x: number, y: number): string | null {
  if (x < 1 || x > W - 2 || y < 0 || y > H - 2) return null;
  if (y <= 2) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
  if (y === 3) return x === 1 ? 'stone-tl' : x === W - 2 ? 'stone-tr' : 'stone-t';
  if (y === H - 2) return x === 1 ? 'stone-bl' : x === W - 2 ? 'stone-br' : 'stone-b';
  if (x === 1) return 'stone-l';
  if (x === W - 2) return 'stone-r';
  return 'stone-c';
}

const seal = (id: string, x: number, label: string) =>
  ({ id: `seal-${id}`, kind: 'seal' as const, seal: id, x, y: 3, w: 1, h: 4, label, art: 'fray-seal', visibleIf: { not: { flag: `trap.${id}.open`, eq: true } } });

export const UNDERCROFT: MapDef = {
  id: 'aethelgard.undercroft',
  name: "Emberford: the Undercroft (Elsbet's records vault)",
  world: 'WORLD-02',
  width: W, height: H,
  music: 'music.box',
  ambience: 'study',
  background: 0x0d0a10,
  floor,
  stamps: [
    { stamp: 'bookshelf', x: 3, y: 0 }, { stamp: 'bookshelf', x: 11, y: 0 }, { stamp: 'bookshelf', x: 19, y: 0 }, { stamp: 'bookshelf', x: 27, y: 0 },
    { stamp: 'crates', x: 6, y: 6 }, { stamp: 'barrel', x: 14, y: 6 }, { stamp: 'crates', x: 21, y: 6 },
  ],
  blocks: [[0, 0, 1, H], [W - 1, 0, 1, H], [1, 0, W - 2, 3], [0, H - 1, W, 1]],
  npcs: [],
  interactables: [
    { id: 'undercroft-stairs', kind: 'door', x: 2, y: 3, w: 1, h: 1, label: 'the ladder up to the study', art: 'study-stairs', to: { map: 'aethelgard.study', x: 5, y: 10 } },
    { id: 'undercroft-sign', kind: 'sign', x: 4, y: 3, w: 1, h: 1, label: "a note pinned to a shelf", art: 'ledger', flag: 'undercroft.entered',
      text: "In Elsbet's hand: 'RECORDS VAULT. Every box here can be wrong; that is why it is kept where anyone can check it. If nobody comes to check, lock the door and light no lamp.' Below, in fresh dust, something has scratched: NOBODY CAME." },
    seal('many', 9, 'the seal of many voices'),
    seal('twogates', 17, 'the seal of two gates'),
    seal('chosen', 25, 'the seal of chosen pages'),
    { id: 'archivist', kind: 'boss', x: 29, y: 4, w: 1, h: 2, label: 'the Hollow Archivist', art: 'hollow-archivist', visibleIf: { not: { flag: 'undercroft.done', eq: true } } },
    { id: 'vault-index', kind: 'sign', x: 29, y: 4, w: 1, h: 1, label: "Elsbet's index of the vault", art: 'ledger', visibleIf: { flag: 'undercroft.done', eq: true },
      text: "The first line, in Elsbet's small hand: 'Every record here can be wrong. That is why they are kept where anyone can check them.' The rest is a list of boxes: wells, floods, prices, the toll survey, the plaque. Each has a line: 'last checked by ...'. The last name is yours. One box near the bottom is different: 'Weir report, Harrowmere'. Its line says only 'last checked by' and then nothing. The name has been left blank." },
  ],
  zones: [{ id: 'undercroft', x: 0, y: 0, w: W, h: H }],
  lights: [
    { x: 4, y: 4, r: 40, color: 0xffd98a, flicker: true },
    { x: 13, y: 5, r: 30, color: 0x9a7bff },
    { x: 21, y: 5, r: 30, color: 0x9a7bff },
    { x: 29, y: 5, r: 46, color: 0xe8c040, flicker: true },
  ],
  spawn: { x: 3, y: 5 },
};
