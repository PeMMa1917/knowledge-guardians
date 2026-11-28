import { almanacPrinters } from '../content/almanacPrinters';
import { specimenEquipped } from '../domain/specimenGear';
import { issuedScore } from '../content/streetAlmanac';
import { composingRoom, paradeRoom, calendarCases } from '../domain/streetAlmanac';
import { SPECIMEN_BASE } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export function almanacAt(map: string): Interactable[] {
  if (map === SPECIMEN_BASE)
    return [
      {
        id: 'street-music-door',
        kind: 'door',
        x: 3,
        y: 12,
        w: 1,
        h: 1,
        label: 'the street musicians’ room',
        art: 'street.awning',
        to: { map: composingRoom, x: 8, y: 10 },
      },
    ];
  if (map === paradeRoom)
    return [
      {
        id: 'street-parade-window',
        kind: 'fieldgame',
        game: 'street-evening',
        x: 7,
        y: 8,
        w: 1,
        h: 1,
        label: 'the striped awning over Jori’s window',
        art: 'street.awning',
        walkThrough: true,
        visibleIf: issuedScore,
      },
    ];
  return [];
}

export function almanacVisitors(map: string): MapDef['npcs'] {
  if (map !== composingRoom && map !== paradeRoom) return [];
  return calendarCases.map((c) => ({
    id: almanacPrinters[c.id as keyof typeof almanacPrinters].character,
    x: map === composingRoom ? 4 : 9,
    y: map === composingRoom ? 5 : 8,
    facing: 'down',
    visibleIf:
      map === composingRoom
        ? specimenEquipped(c.key)
        : { all: [specimenEquipped(c.key), { flagSet: 'almanac.' + c.id + '.sentBar' }] },
  }));
}

export const almanacRoom: MapDef = {
  id: composingRoom,
  world: 'WORLD-01',
  name: 'A room over the parade',
  background: 0x33273e,
  width: 17,
  height: 14,
  spawn: { x: 8, y: 10 },
  music: 'music.archive',
  ambience: 'study',
  floor: (x, y) =>
    x < 1 || x > 15 || y < 0 || y > 12 ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'island-boards',
  blocks: [[0, 0, 17, 3]],
  zones: [],
  lights: [
    { x: 12, y: 5, r: 72, color: 0xb2d9e9 },
    { x: 5, y: 7, r: 55, color: 0xe6af6b },
  ],
  stamps: [
    { stamp: 'window', x: 11, y: 1 },
    { stamp: 'bench', x: 3, y: 8 },
    { stamp: 'plant-tall', x: 14, y: 3 },
  ],
  npcs: [
    { id: 'almanac-rix', x: 6, y: 5, facing: 'right' },
    { id: 'almanac-jori', x: 12, y: 6, facing: 'left' },
  ],
  interactables: [
    {
      id: 'street-score-desk',
      kind: 'fieldgame',
      game: 'street-compose',
      label: 'the six-beat strip and three calendar leaves',
      x: 8,
      y: 6,
      w: 1,
      h: 1,
      art: 'street.strip',
      walkThrough: true,
    },
    {
      id: 'street-music-back',
      kind: 'door',
      label: 'the steps to your collection',
      x: 8,
      y: 11,
      w: 1,
      h: 1,
      art: 'courier.hatch',
      to: { map: SPECIMEN_BASE, x: 4, y: 12 },
    },
  ],
};
