import { lensBench, lensTheatre } from '../domain/lensLoan';
import { lensPeople } from '../content/lensLoan';
import type { Condition } from '../domain/types';
import type { MapDef, Interactable } from './types';
const depot = 'observatory.survey-depot';
const sent: Condition = { flag: 'optics.sealed', eq: true };
const theatreRoute: Condition = { all: [sent, { objective: 'stage.arrival' }] };
const door = (
  id: string,
  label: string,
  x: number,
  y: number,
  to: NonNullable<Interactable['to']>,
  visibleIf?: Condition,
): Interactable => ({
  id,
  kind: 'door',
  label,
  x,
  y,
  w: 1,
  h: 1,
  to,
  art: 'optic.steps',
  walkThrough: true,
  visibleIf,
});
const stand = (
  id: string,
  title: string,
  game: string,
  x: number,
  y: number,
  art: string,
  visibleIf?: Condition,
): Interactable => ({
  id,
  kind: 'fieldgame',
  label: title,
  game,
  x,
  y,
  w: 1,
  h: 1,
  art,
  walkThrough: true,
  visibleIf,
});
const homeReading: Condition = { not: sent };
export const lensRoom: MapDef = {
  id: lensBench,
  name: 'The drawer with two places',
  world: 'WORLD-05',
  width: 20,
  height: 16,
  background: 0x353346,
  spawn: { x: 9, y: 12 },
  ambience: 'study',
  music: 'music.archive',
  floor: (x, y) =>
    x < 1 || x > 18 || y < 0 || y > 14
      ? null
      : y < 3
        ? ['wall-top', 'wall-mid', 'wall-base'][y]
        : 'island-boards',
  blocks: [[0, 0, 20, 3]],
  zones: [],
  lights: [
    { x: 8, y: 6, r: 70, color: 0xe6ba74 },
    { x: 15, y: 5, r: 55, color: 0x94bccb },
  ],
  stamps: [
    { stamp: 'window', x: 5, y: 1 },
    { stamp: 'window', x: 14, y: 1 },
    { stamp: 'cabinet', x: 2, y: 4 },
    { stamp: 'rug-green', x: 7, y: 7 },
    { stamp: 'bench', x: 11, y: 9 },
  ],
  npcs: [
    { id: lensPeople.mayle, x: 5, y: 6, facing: 'right', visibleIf: homeReading },
    { id: lensPeople.nim, x: 13, y: 5, facing: 'left', visibleIf: homeReading },
    { id: lensPeople.cajal, x: 4, y: 9, facing: 'up' },
    { id: lensPeople.huygens, x: 16, y: 9, facing: 'left' },
  ],
  interactables: [
    stand('optics-sled', 'the felt drawer and the frosted square', 'optics-loft', 9, 5, 'optic.drawer'),
    {
      id: 'optics-hems',
      kind: 'sign',
      x: 14,
      y: 8,
      w: 1,
      h: 1,
      label: 'a single loose button in the hem',
      text: 'Two initials lie a stitch apart. The silver thread leads out from one and past the other. The little hook on the back of the cloth is empty.',
      art: 'optic.curtain',
      walkThrough: true,
    },
    {
      id: 'optics-await',
      kind: 'sign',
      x: 16,
      y: 12,
      w: 1,
      h: 1,
      label: 'Nim’s forwarding address',
      text: 'HOUSE OF PERFORMANCE • REHEARSAL ROOM. The lighting crew will open the connecting stair once you have visited the House. The sealed envelope can go ahead.',
      visibleIf: { all: [sent, { not: { objective: 'stage.arrival' } }] },
      art: 'optic.frame',
      walkThrough: true,
    },
    door('optics-down', 'the steps down to the survey cases', 9, 13, { map: depot, x: 21, y: 23 }),
    door(
      'optics-wing-door',
      'the stair to the rehearsal wing',
      16,
      12,
      { map: lensTheatre, x: 22, y: 14 },
      theatreRoute,
    ),
  ],
};
export function lensAt(map: string): Interactable[] {
  if (map === depot)
    return [
      door(
        'optics-up',
        'wooden steps beside two empty hooks',
        21,
        22,
        { map: lensBench, x: 9, y: 12 },
        { flag: 'coast.arrived', eq: true },
      ),
    ];
  if (map !== lensTheatre) return [];
  return [
    stand(
      'optics-rail',
      'the river curtain and the two drawings',
      'optics-curtain',
      22,
      13,
      'optic.curtain',
      sent,
    ),
    door('optics-back', 'the service stair to the loan loft', 24, 14, { map: lensBench, x: 16, y: 11 }, sent),
    {
      id: 'optics-stitch',
      kind: 'sign',
      x: 18,
      y: 14,
      w: 1,
      h: 1,
      label: 'a button at the side of the audience',
      art: 'optic.frame',
      walkThrough: true,
      visibleIf: { flag: 'optics.purpose', eq: 'cue' },
      text: 'A button catches the wing light twice. The understudy puts one foot beside a little chalk star. The dresser who sewed it there gets to call the entrance.',
    },
    {
      id: 'optics-second-seat',
      kind: 'sign',
      x: 18,
      y: 14,
      w: 1,
      h: 1,
      label: 'the open card for a second rehearsal',
      art: 'optic.frame',
      walkThrough: true,
      visibleIf: { flag: 'optics.purpose', eq: 'test' },
      text: 'Three little seat slips hang from a string. Underneath, someone has left two hooks for tomorrow’s drawings and one more chair.',
    },
  ];
}
export function lensVisitors(map: string): MapDef['npcs'] {
  return map === lensTheatre
    ? [
        { id: lensPeople.mayle, x: 19, y: 13, facing: 'right', visibleIf: sent },
        { id: lensPeople.nim, x: 23, y: 13, facing: 'left', visibleIf: sent },
        { id: lensPeople.cajal, x: 14, y: 13, facing: 'right', visibleIf: sent },
        { id: lensPeople.huygens, x: 16, y: 14, facing: 'down', visibleIf: sent },
      ]
    : [];
}
