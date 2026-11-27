import { KUNIT_KEY, KUNIT_REVISIT, TURNING_EXHIBIT, TURNING_GATE, TURNING_GROUP, TURNING_OBJECTIVE } from '../content/turningTable';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export const TURNING_DOOR: Interactable = {
  id: 'turning-room-door', kind: 'door', x: 5, y: 12, w: 1, h: 1,
  label: 'the door to the Turning Room', art: 'preserved.door', visibleIf: TURNING_GATE,
  to: { map: 'sea.turning-room', x: 11, y: 12 },
};

export const TURNING_READERS: Interactable[] = [
  { id: 'turning-rail', kind: 'fieldgame', game: `${TURNING_GROUP}:rail`, x: 7, y: 12, w: 1, h: 1,
    label: 'the public low rail at Lantern House', art: 'preserved.slip', walkThrough: true,
    visibleIf: { flag: 'turning.kunit.route', eq: 'rail' }, artOpen: { key: 'sea.shore-chart', if: { objective: TURNING_OBJECTIVE } } },
  { id: 'turning-keeper', kind: 'fieldgame', game: `${TURNING_GROUP}:keeper`, x: 15, y: 6, w: 1, h: 1,
    label: 'Renna’s speaking table by the window', art: 'sea.margin', walkThrough: true,
    visibleIf: { flag: 'turning.kunit.route', eq: 'keeper' }, artOpen: { key: 'preserved.catalogue', if: { objective: TURNING_OBJECTIVE } } },
];

export const TURNING_ROOM: MapDef = {
  id: 'sea.turning-room', name: 'Cartographers’ Sea: Lantern House Turning Room', world: 'WORLD-09',
  width: 23, height: 15, spawn: { x: 11, y: 12 }, music: 'music.archive', ambience: 'study', background: 0x253845,
  floor: (x, y) => x < 1 || x > 21 || y < 0 || y > 14 ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'voices-slate',
  blocks: [[1, 0, 21, 3]], zones: [], npcs: [],
  stamps: [{ stamp: 'window', x: 11, y: 1 }, { stamp: 'bookshelf', x: 2, y: 4 }, { stamp: 'rug-green', x: 10, y: 9 }, { stamp: 'bench', x: 18, y: 10 }],
  lights: [{ x: 7, y: 6, r: 74, color: 0xf3cd99 }, { x: 15, y: 7, r: 85, color: 0xb1dddf }],
  interactables: [
    { id: 'turning-room-return', kind: 'door', x: 11, y: 14, w: 1, h: 1, label: 'the path back to Lantern House',
      art: 'sea.waypost', to: { map: 'sea.chartroom', x: 5, y: 11 } },
    { id: 'turning-kunit-exhibit', kind: 'exhibit', exhibit: TURNING_EXHIBIT, x: 7, y: 6, w: 1, h: 1,
      label: 'the separate catalogue for Kunit’s coast piece', art: 'turning.kunit-case', walkThrough: true },
    { id: 'turning-practice-note', kind: 'sign', x: 11, y: 6, w: 1, h: 1, flag: 'turning.kunit.note',
      label: 'the trial landing note', art: 'preserved.slip', walkThrough: true,
      text: 'Our model shore has three slots. A visitor tried the flat step before they saw the notch. Turn the shore block while the offshore peg stays still. See which mark lines up, then move the peg and compare.' },
    { id: 'turning-copy-referral', kind: 'sign', x: 13, y: 9, w: 1, h: 1, art: 'preserved.folder', walkThrough: true,
      label: 'Wren’s request for a paper copy trial', visibleIf: { objective: TURNING_OBJECTIVE },
      text: 'Bring Kunit’s coast piece to my rubbing table in the Archive of Voices. I want to see what Eren can recover when only paper reaches Glass Walk. Wren.' },
    { id: 'turning-practice', kind: 'fieldgame', game: `${TURNING_GROUP}:trial`, x: 15, y: 7, w: 1, h: 1,
      label: 'the two movable practice pieces', art: 'sea.margin', walkThrough: true },
    { id: KUNIT_REVISIT.prop, kind: 'scene', node: 'turning.worked-return', x: 17, y: 10, w: 1, h: 1, walkThrough: true,
      art: 'turning.kunit-case', label: 'Renna’s second relief rack', visibleIf: {
        all: [specimenEquipped(KUNIT_KEY), { not: { flagSet: 'turning.kunit.revisit' } }],
      } },
    { id: 'turning-return-stop', kind: 'sign', x: 4, y: 9, w: 1, h: 1, art: 'sea.waypost', walkThrough: true,
      label: 'the raised end stop at the wall', flag: 'turning.kunit.revisit.used', visibleIf: { flag: 'turning.kunit.revisit', eq: 'stop' },
      text: 'A second reader hooks the smooth end against the stop. The wall side has one clear start, so they can find it with either hand.' },
    { id: 'turning-return-pair', kind: 'sign', x: 19, y: 8, w: 1, h: 1, art: 'sea.shore-chart', walkThrough: true,
      label: 'the reversible rack with two hand positions', flag: 'turning.kunit.revisit.used', visibleIf: { flag: 'turning.kunit.revisit', eq: 'pair' },
      text: 'The holder can turn this practice block to face a second reader. They try the other end after passing the block back. The start is marked on each side.' },
  ],
};
