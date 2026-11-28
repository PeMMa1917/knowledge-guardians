import type { Condition } from '../domain/types';
import { specimenEquipped } from '../domain/specimenGear';
import { easternCopy, stacksShop, stacksWalk } from '../domain/turningStacks';
import { stackHosts } from '../content/turningStacks';
import type { MapDef, Interactable } from './types';
const canal = 'civic.canal',
  bound: Condition = { flag: 'stacks.bound', eq: true };
function passage(
  id: string,
  label: string,
  x: number,
  y: number,
  map: string,
  tx: number,
  ty: number,
  visibleIf?: Condition,
): Interactable {
  return {
    id: 'stacks-' + id,
    label,
    kind: 'door',
    x,
    y,
    w: 1,
    h: 1,
    to: { map, x: tx, y: ty },
    art: 'stacks.door',
    walkThrough: true,
    visibleIf,
  };
}
export function stackProps(map: string): Interactable[] {
  if (map === canal)
    return [passage('canal-door', 'the upright suitcase with hinges for a roof', 4, 9, stacksShop, 8, 11)];
  if (map !== stacksWalk) return [];
  return [
    {
      id: 'stacks-quay-book',
      label: 'the suitcase under a lamp that turns',
      kind: 'fieldgame',
      game: 'turning-stacks',
      x: 16,
      y: 11,
      w: 1,
      h: 1,
      art: 'stacks.case',
      walkThrough: true,
      visibleIf: bound,
    },
    passage('quay-stairs', 'the rope stairs back to Opal’s model', 16, 13, stacksShop, 8, 11, bound),
    {
      id: 'stacks-boat-heading',
      label: 'brass letters facing the ferry windows',
      kind: 'sign',
      x: 17,
      y: 12,
      w: 1,
      h: 1,
      art: 'stacks.lamp',
      text: 'A child on the boat sounds out the publisher’s name. An older passenger leans over to catch the second one before their window passes.',
      walkThrough: true,
      visibleIf: { flag: 'stacks.facing', eq: 'street' },
    },
    {
      id: 'stacks-bench-heading',
      label: 'a reading lamp on the inside bench',
      kind: 'sign',
      x: 17,
      y: 12,
      w: 1,
      h: 1,
      art: 'stacks.lamp',
      text: 'A woman on the bench has found a date in the small print. Outside, the ferry child draws the shape of the brass hinge in the mist on the window.',
      walkThrough: true,
      visibleIf: { flag: 'stacks.facing', eq: 'inside' },
    },
  ];
}
export function stackPeople(map: string): MapDef['npcs'] {
  if (map !== stacksWalk) return [];
  return [
    { id: stackHosts.opal, x: 15, y: 9, facing: 'right', visibleIf: bound },
    { id: stackHosts.tallis, x: 17, y: 9, facing: 'left', visibleIf: bound },
  ];
}
export const turningRoom: MapDef = {
  id: stacksShop,
  name: 'Civic Machine: The house with six names',
  world: 'WORLD-13',
  width: 17,
  height: 14,
  spawn: { x: 8, y: 11 },
  background: 0x243c45,
  music: 'music.archive',
  ambience: 'study',
  floor: (x, y) =>
    x < 1 || x > 15 || y < 0 || y > 12
      ? null
      : y < 3
        ? ['wall-top', 'wall-mid', 'wall-base'][y]
        : x === 8
          ? 'civic-cobbles-a'
          : 'island-boards',
  blocks: [[0, 0, 17, 3]],
  zones: [],
  stamps: [
    { stamp: 'window', x: 3, y: 1 },
    { stamp: 'window', x: 12, y: 1 },
    { stamp: 'rug-green', x: 6, y: 7 },
  ],
  lights: [
    { x: 5, y: 5, r: 62, color: 0xffbc78 },
    { x: 12, y: 7, r: 55, color: 0x99d8dd },
  ],
  npcs: [
    { id: stackHosts.opal, x: 5, y: 5, facing: 'down', visibleIf: { not: bound } },
    { id: stackHosts.tallis, x: 12, y: 6, facing: 'left', visibleIf: { not: bound } },
  ],
  interactables: [
    {
      id: 'stacks-floor',
      kind: 'fieldgame',
      game: 'turning-stacks',
      label: 'Opal’s hinged reading room and two visitors',
      x: 8,
      y: 6,
      w: 1,
      h: 1,
      walkThrough: true,
      art: 'stacks.floor',
    },
    {
      id: 'stacks-signature',
      kind: 'fieldgame',
      game: 'stacks-signature',
      label: 'the certificate’s sliding signature lamp',
      x: 10,
      y: 8,
      w: 1,
      h: 1,
      walkThrough: true,
      art: 'stacks.cert',
      visibleIf: specimenEquipped(easternCopy),
    },
    {
      id: 'stacks-pin',
      kind: 'sign',
      label: 'a hinge pin with a groove',
      x: 4,
      y: 8,
      w: 1,
      h: 1,
      walkThrough: true,
      art: 'stacks.case',
      text: 'Someone has wound cloth round the groove in the hinge. Inside the toolbox a second strip is neatly folded, as though the repairer plans to come back.',
    },
    passage('home', 'the canal steps under the suitcase lid', 8, 12, canal, 4, 10),
    passage('rope', 'the rope stairs down to the Lamp Quay', 13, 10, stacksWalk, 16, 12, bound),
  ],
};
