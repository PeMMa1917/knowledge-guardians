import { BADGE_ANNEX_PREFIX, BADGE_WORK } from '../content/badgeRoom';
import { ORACLE_PRESS, oracleFlag } from '../content/oraclePress';
import { BADGE_FAMILIES, BADGE_ROOM_OPEN, badgeFamilyReady, selectedFamily } from '../content/tokBadges';
import { ORACLE_COPY, ORACLE_PACKET } from '../domain/oraclePress';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const MAP = 'nexus.badge-annex';
const START = { x: 14, y: 15 };
const DOOR = { x: 36, y: 7 };

export const BADGE_ANNEX_DOOR: Interactable = {
  id: 'badge-annex-door', kind: 'door', ...DOOR, w: 1, h: 1, label: 'Brenna’s Badge Annex', art: 'preserved.door',
  visibleIf: BADGE_ROOM_OPEN, to: { map: MAP, ...START },
};

function sign(id: string, x: number, y: number, label: string, text: string, visibleIf?: Condition, flag?: string): Interactable {
  return { id, x, y, label, text, visibleIf, flag, kind: 'sign', w: 1, h: 1, art: 'preserved.slip', walkThrough: true };
}

const noticePosition = {
  walk: { x: 7, y: 13, label: 'the approved rail notice', art: 'preserved.display-paired' },
  desk: { x: 21, y: 13, label: 'the approved desk excerpt', art: 'preserved.display-records' },
} as const;

const roomWidth = 29;

export const BADGE_ANNEX: MapDef = {
  id: MAP, name: 'The Nexus: The Badge Annex', world: 'WORLD-01', width: roomWidth, height: 18,
  spawn: START, music: 'music.archive', ambience: 'study', background: 0x2c3749,
  floor: (x, y) => x < 1 || x >= roomWidth - 1 || y < 0 || y >= 18 ? null
    : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c',
  blocks: [[1, 0, roomWidth - 2, 3]],
  zones: [],
  npcs: [
    { id: 'badge-keeper', x: 13, y: 13, facing: 'down' },
    { id: 'oracle-keeper', x: 15, y: 9, facing: 'down' },
    { id: 'oracle-reader', x: 17, y: 13, facing: 'left' },
  ],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 13, y: 1 }, { stamp: 'window', x: 23, y: 1 },
    { stamp: 'bench', x: 7, y: 11 }, { stamp: 'bench', x: 21, y: 11 },
    { stamp: 'rug-green', x: 13, y: 14 }, { stamp: 'plant-tall', x: 1, y: 14 }, { stamp: 'plant-tall', x: 27, y: 15 },
  ],
  lights: [{ x: 5, y: 7, r: 76, color: 0xa3cffa }, { x: 23, y: 7, r: 72, color: 0xffcb95 },
    { x: 14, y: 10, r: 85, color: 0xbce2d5 }, { x: 23, y: 14, r: 52, color: 0xf4b175 }],
  interactables: [
    { id: 'badge-annex-exit', kind: 'door', x: 14, y: 17, w: 1, h: 1, art: 'preserved.door',
      label: 'the Archive Hall', to: { map: 'nexus.archive', x: DOOR.x - 1, y: DOOR.y } },
    { id: 'badge-cabinet', kind: 'fieldgame', game: BADGE_ANNEX_PREFIX + 'cabinet', x: 11, y: 14, w: 1, h: 1,
      label: 'the cabinet of deeds', art: 'preserved.catalogue', walkThrough: true },
    { id: ORACLE_PRESS, kind: 'fieldgame', game: BADGE_ANNEX_PREFIX + 'press', x: 14, y: 8, w: 1, h: 1,
      label: 'Nerin’s rule reader and press', art: 'preserved.catalogue', walkThrough: true, sfx: 'sfx.page' },
    sign('oracle-holdout-rail', 11, 8, 'the sealed handrail reply', ORACLE_PACKET[2].receipt, oracleFlag('run.stamp'), 'oracle.held.rail'),
    sign('oracle-holdout-shelter', 17, 8, 'the shelter’s signed source', ORACLE_PACKET[3].receipt, oracleFlag('run.stamp'), 'oracle.held.shelter'),
    sign('oracle-cut-original', 11, 10, 'the third-bell notice before cutting', ORACLE_COPY.source, oracleFlag('checked'), 'oracle.cut.original'),
    sign('oracle-cut-log', 17, 10, 'the small press job docket', ORACLE_COPY.log, oracleFlag('checked'), 'oracle.cut.log'),
    sign('oracle-permission', 15, 12, 'the signed permission register',
      'Share the signed east-steps excerpt with its date and named role. The full notes about people at the landing stay in the source sleeve.', oracleFlag('checked'), 'oracle.permission'),
    ...(['walk', 'desk'] as const).flatMap((route): Interactable[] => {
      const pos = noticePosition[route];
      const routeAvailable = oracleFlag('route', route);
      const checked = oracleFlag('readback', route);
      return [
        { id: `oracle-reading-${route}`, kind: 'scene', node: `oracle.notice.${route}`,
          ...pos, w: 1, h: 1, walkThrough: true, visibleIf: { all: [routeAvailable, { not: checked }] } },
        { ...sign(`oracle-posted-${route}`, pos.x, pos.y, pos.label,
          route === 'walk' ? 'The checked steps are marked. The date of the check and the source tab stay together.'
            : 'The approved excerpt and its source tab are here. A reader can sit and compare the role named in each one.', checked), art: pos.art },
      ];
    }),
    ...BADGE_FAMILIES.flatMap(({ id }, index): Interactable[] => {
      const x = [4, 9, 19, 24][index % 4], y = index < 4 ? 5 : 7;
      const wornOrDone = badgeFamilyReady(id);
      const used = selectedFamily(id);
      const scene = { kind: 'scene' as const, x, y, w: 1, h: 1, walkThrough: true, label: BADGE_WORK[id].title };
      return [
        { ...scene, id: `badge-work-${id}`, node: `badge-room.${id}`, art: 'preserved.folder',
          visibleIf: { all: [wornOrDone, { not: used }] } },
        { ...scene, id: `badge-used-${id}`, node: `badge-room.${id}.done`, art: id === 'legend' ? 'lantern-stall' : 'preserved.display-paired',
          visibleIf: used },
      ];
    }),
    { id: 'badge-bench-door', kind: 'door', x: 2, y: 11, w: 1, h: 1, art: 'preserved.door',
      label: 'the visitors’ bench passage', visibleIf: selectedFamily('fellowship'), to: { map: MAP, x: 3, y: 4 } },
    { id: 'badge-grate-door', kind: 'door', x: 26, y: 5, w: 1, h: 1, art: 'preserved.door',
      label: 'the carrier’s foot return', visibleIf: selectedFamily('paths'), to: { map: MAP, x: 16, y: 16 } },
    sign('badge-visitors-bench', 2, 4, 'the visitors’ bench at the passage head',
      'The next carrier can stop by the empty seat and put a document down while they talk.', selectedFamily('fellowship')),
  ],
};
