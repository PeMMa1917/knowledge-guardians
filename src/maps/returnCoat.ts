import sites from '../content/return-coat-sites.json';
import {
  coatEndings,
  coatFlag,
  coatPass,
  coatPolicy,
} from '../content/returnCoat';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const policyArt = { hook: 'coat.quiet', book: 'coat.fare', stage: 'coat.show' };
const node = (short: string) => 'returned-coat.' + short;
const labels = {
  hook: 'the low dry hook on the other side',
  book: 'the guarantor’s signing desk',
  stage: 'the wardrobe’s paid entrance',
};
function rainRig(x: number, y: number): Interactable {
  return {
    id: 'indoor-rain-rig',
    kind: 'fieldgame',
    game: 'coat-rain',
    x,
    y,
    w: 1,
    h: 1,
    walkThrough: true,
    art: 'coat.cuff',
    label: 'the four-beat rain rig',
  };
}
export function returnCoatAt(map: string): Interactable[] {
  const s = sites.find((x) => x.map === map);
  if (!s) return [];
  const prop = (
    slug: string,
    x: number,
    y: number,
    kind: Interactable['kind'],
    label: string,
    art: string,
    extra: Partial<Interactable>,
  ): Interactable => ({
    id: 'return-coat-' + s.id + '-' + slug,
    x,
    y,
    w: 1,
    h: 1,
    kind,
    label,
    art,
    walkThrough: true,
    ...extra,
  });
  const met = coatFlag(s.id + '.met');
  const active: Condition = { all: [met, { not: coatFlag('policy') }] };
  return [
    ...(s.map === 'stage.foyer' ? [rainRig(13, 13)] : []),
    prop('first', s.x, s.y, 'scene', s.name, 'coat.pair', {
      node: node(s.id + '.start'),
      visibleIf: { not: met },
      sfx: 'sfx.chime',
    }),
    prop(
      'work',
      s.x,
      s.y,
      'scene',
      'the coat with the chipped green pear',
      'coat.pair',
      { node: node(s.id + '.work'), visibleIf: active },
    ),
    ...coatEndings.map((e) =>
      prop(e, s.x, s.y, 'scene', labels[e], policyArt[e], {
        node: node(s.id + '.work'),
        visibleIf: { all: [met, coatPolicy(e)] },
        sfx: e === 'stage' ? 'sfx.chime' : 'sfx.page',
      }),
    ),
    prop(
      'lining',
      s.cx,
      s.cy,
      'clue',
      'the underside of the red coat',
      'coat.cuff',
      { clue: node(s.id + '.clue'), visibleIf: met },
    ),
    ...(s.id === 'hook'
      ? [
          prop(
            'pass',
            29,
            12,
            'door',
            'the hidden door behind the lost-property rail',
            'coat.quiet',
            {
              visibleIf: coatPass,
              to: { map: 'nexus.coat-lining', x: 6, y: 8 },
              sfx: 'sfx.page',
            },
          ),
        ]
      : []),
  ];
}
export const liningLanding: MapDef = {
  id: 'nexus.coat-lining',
  name: 'Nexus · The quiet side of the coat rail',
  world: 'WORLD-01',
  width: 13,
  height: 11,
  music: 'music.archive',
  ambience: 'study',
  background: 0x392b47,
  spawn: { x: 6, y: 8 },
  floor: (x, y) =>
    x < 1 || x > 11 || y < 0 || y > 9
      ? null
      : y < 3
        ? ['wall-top', 'wall-mid', 'wall-base'][y]
        : y === 8
          ? 'island-boards'
          : 'stone-c',
  blocks: [
    [0, 0, 13, 3],
    [0, 3, 1, 8],
    [12, 3, 1, 8],
    [0, 10, 13, 1],
  ],
  stamps: [],
  npcs: [
    {
      id: 'kip-arden',
      x: 4,
      y: 6,
      facing: 'right',
      visibleIf: coatPolicy('hook'),
    },
    {
      id: 'warden-ise',
      x: 8,
      y: 4,
      facing: 'down',
      visibleIf: coatPolicy('book'),
    },
    {
      id: 'optics-nim',
      x: 8,
      y: 7,
      facing: 'left',
      visibleIf: coatPolicy('stage'),
    },
  ],
  zones: [],
  lights: [{ x: 7, y: 5, color: 0xffdea0, r: 63 }],
  interactables: [
    rainRig(4, 4),
    {
      id: 'coat-inside-cuff',
      kind: 'scene',
      node: node('inside'),
      x: 6,
      y: 5,
      w: 1,
      h: 1,
      art: 'coat.cuff',
      label: 'the low rail beside the speaking pipe',
      sfx: 'sfx.page',
    },
    {
      id: 'coat-inside-back',
      kind: 'door',
      x: 6,
      y: 9,
      w: 1,
      h: 1,
      art: 'coat.quiet',
      label: 'the door back to the lost-property hatch',
      walkThrough: true,
      to: { map: 'nexus.archive', x: 29, y: 13 },
    },
  ],
};
