import { elbowKey, hemLoft, proofRoom, receivingRoom } from '../domain/giantSleeve';
import type { Interactable, MapDef } from './types';

function prop(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  extra: Partial<Interactable>,
): Interactable {
  return { id: 'elbow-' + id, kind: 'fieldgame', x, y, w: 1, h: 1, walkThrough: true, label, art, ...extra };
}
export function elbowAt(map: string): Interactable[] {
  if (map === 'stage.foyer')
    return [
      prop('stairs', 10, 6, 'the paper hand knocking on a loft window', 'elbow.knock', {
        kind: 'door',
        to: { map: hemLoft, x: 8, y: 9 },
      }),
    ];
  if (map === proofRoom)
    return [
      prop('lottery', 19, 9, 'the strip lottery with six wooden pegs', 'elbow.hinge', {
        game: 'giant-lottery',
        visibleIf: { flagSet: elbowKey('hung') },
      }),
    ];
  if (map === receivingRoom)
    return [
      prop('curtain', 23, 9, 'the cuff in the rehearsal light', 'elbow.knock', {
        game: 'giant-curtain',
        visibleIf: { flagSet: elbowKey('printed') },
      }),
    ];
  return [];
}
export const sleeveRoom: MapDef = {
  id: hemLoft,
  world: 'WORLD-10',
  name: 'The giant’s hem loft',
  background: 0x262035,
  width: 18,
  height: 14,
  spawn: { x: 8, y: 9 },
  music: 'music.archive',
  ambience: 'study',
  floor: (x, y) =>
    x < 1 || x > 16 || y < 1 || y > 12
      ? null
      : y === 1
        ? 'wall-mid'
        : y === 2
          ? 'wall-base'
          : 'island-boards',
  blocks: [[0, 0, 18, 3]],
  zones: [],
  lights: [
    { x: 8, y: 6, r: 92, color: 0xf6c87f },
    { x: 13, y: 4, r: 40, color: 0x8fcbd0 },
  ],
  stamps: [
    { stamp: 'barrel', x: 3, y: 4 },
    { stamp: 'bench', x: 13, y: 9 },
  ],
  npcs: [
    { id: 'elbow-pip', x: 5, y: 6, facing: 'down' },
    { id: 'elbow-vee', x: 12, y: 6, facing: 'left' },
    { id: 'model-record-maker-stoppages', x: 4, y: 9, facing: 'right' },
  ],
  interactables: [
    prop('patterns', 8, 5, 'the sleeves of the winter and summer companies', 'elbow.pattern', {
      game: 'giant-fitting',
    }),
    prop('stairs-back', 8, 11, 'the stairs back to the theatre', 'elbow.knock', {
      kind: 'door',
      to: { map: 'stage.foyer', x: 10, y: 7 },
    }),
  ],
};
