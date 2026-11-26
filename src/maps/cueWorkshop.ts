import { CUE_CASES, CUE_GATE, CUE_GROUP } from '../content/cueWorkshop';
import { cueKey, type CueReader } from '../domain/cueWorkshop';
import type { Interactable, MapDef } from './types';

export const CUE_WORKSHOP_DOOR: Interactable = {
  id: 'cue-workshop-door', kind: 'door', w: 1, h: 1, x: 27, y: 10, art: 'voices.waypost',
  label: 'the door to the Cue Workshop', to: { map: 'voices.cue-workshop', x: 18, y: 24 }, visibleIf: CUE_GATE,
};

function cueReader(route: CueReader, x: number, y: number, label: string): Interactable {
  return {
    id: `cue-workshop-${route}`, kind: 'fieldgame', game: `${CUE_GROUP}:${route}`, x, y, w: 1, h: 1,
    label, art: 'voices.permission', walkThrough: true, visibleIf: CUE_GATE,
    artOpen: { key: route === 'walk' ? 'voices.guide' : 'stage.cues', if: {
      any: CUE_CASES.map(({ slug }) => ({ flag: `${cueKey(slug)}.received`, eq: route })),
    } },
  };
}

export const CUE_WALK_READER = cueReader('walk', 20, 14, 'Eren’s live cue indicator');
export const CUE_HOUSE_READER = cueReader('house', 19, 13, 'Hari’s side-seat timing table');

export const CUE_WORKSHOP: MapDef = {
  id: 'voices.cue-workshop', name: 'Archive of Voices: Cue Workshop', world: 'WORLD-14',
  width: 37, height: 27, spawn: { x: 18, y: 24 }, music: 'music.archive', ambience: 'study', background: 0x273643,
  floor: (x, y) => x < 1 || y < 0 || x > 35 || y > 26 ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y]
    : (y % 4 === 2 || x === 18) ? 'voices-inlay' : 'voices-slate',
  blocks: [[1, 0, 35, 3]], zones: [], npcs: [],
  stamps: [
    { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 27, y: 1 },
    { stamp: 'voices-reel-shelf', x: 1, y: 3 }, { stamp: 'voices-reel-shelf', x: 32, y: 3 },
    { stamp: 'voices-bench', x: 2, y: 24 }, { stamp: 'voices-bench', x: 30, y: 24 },
  ],
  lights: [
    { x: 7, y: 6, r: 97, color: 0xf2c5a1 }, { x: 18, y: 7, r: 89, color: 0xc9d3e3 }, { x: 30, y: 7, r: 99, color: 0xbce5d0 },
    { x: 7, y: 18, r: 90, color: 0xc6b7df }, { x: 18, y: 18, r: 98, color: 0xfbd5aa }, { x: 30, y: 18, r: 100, color: 0xc4d6df },
  ],
  interactables: [
    { id: 'cue-workshop-return', kind: 'door', x: 18, y: 26, w: 1, h: 1, label: 'the passage to Lamp Quay',
      art: 'voices.waypost', to: { map: 'voices.quay', x: 27, y: 11 } },
    { id: 'cue-workshop-note', kind: 'sign', x: 18, y: 23, w: 1, h: 1, label: 'the workshop’s cue board note',
      art: 'voices.guide', walkThrough: true, text: 'The blue tables try timing from a quiet side and a busy service side. Choose a cue from our three-marks board. Eren uses live cues at Glass Walk. Hari keeps a paper timing line in the House’s audience gallery.' },
    ...CUE_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + 6 * (index % 6);
      const y = 5 + 4 * Math.floor(index / 6);
      return [
        { id: `cue-${record.slug}-exhibit`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1, walkThrough: true,
          label: `the exact record for ${record.name}`, art: 'voices.permission' },
        { id: `cue-${record.slug}-stand`, kind: 'fieldgame', game: `${CUE_GROUP}:${record.slug}`, x: x + 2, y, w: 1, h: 1, walkThrough: true,
          label: `the timing table by ${record.name}`, art: 'voices.desk', artOpen: { key: 'voices.paired', if: { objective: record.objective } } },
      ];
    }),
  ],
};
