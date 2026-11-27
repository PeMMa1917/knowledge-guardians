import {millSites,millAccounts} from '../content/millShift';
import { nightSites, nightWorks, type NightSite } from '../domain/nightRegister';
import type { Interactable, MapDef } from './types';

export const registerThresholds = [
  [2, 15],
  [18, 9],
  [11, 13],
  [14, 14],
  [10, 8],
  [9, 7],
  [6, 11],
  [8, 11],
  [11, 10],
  [16, 15],
  [13, 8],
  [15, 11],
  [11, 9],
  [13, 9],
  [11, 8],
];
export function nightDoor(map: string): Interactable[] {
  const site = nightSites.find((s) => s.doorMap === map);
  if (!site) return [];
  const [x, y] = registerThresholds[site.index];
  return [
    {
      id: site.room + '.entrance',
      x,
      y,
      w: 1,
      h: 1,
      kind: 'door',
      walkThrough: true,
      art: 'preserved.door',
      flag: site.room + '.open',
      label: site.title + ' · through to the night register',
      to: { map: site.room, x: 16, y: 24 },
    },
  ];
}
function room(site: NightSite): MapDef {
  const [x, y] = registerThresholds[site.index];
  const exhibits = nightWorks
    .filter((w) => w.site === site)
    .map(
      (w): Interactable => ({
        id: 'night-case-' + w.id,
        kind: 'exhibit',
        exhibit: w.exhibit,
        label: w.title + ' · ' + w.accession,
        x: 3 + (w.slot % 8) * 4,
        y: 4 + Math.floor(w.slot / 8) * 2,
        w: 1,
        h: 1,
        art: 'preserved.catalogue',
      }),
    );
  return {
    id: site.room,
    name: site.title + ' · Night Register',
    world: site.world,
    width: 35,
    height: 27,
    spawn: { x: 16, y: 24 },
    music: 'music.archive',
    ambience: 'study',
    background: 0x242338,
    floor: (x, y) =>
      x < 1 || x > 33 || y < 1 || y > 25
        ? null
        : y < 3
          ? ['wall-top', 'wall-mid', 'wall-base'][y]
          : x === 16 || y === 22 || y === 12
            ? 'stone-c'
            : 'island-boards',
    blocks: [
      [0, 0, 35, 3],
      [0, 26, 35, 1],
      [0, 0, 1, 27],
      [34, 0, 1, 27],
    ],
    stamps: [],
    zones: [],
    npcs: [{ id: site.actor, x: 21, y: 23, facing: 'left' }],
    lights: [
      { x: 16, y: 23, r: 80, color: 0xeab86c },
      { x: 7, y: 9, r: 80, color: 0xb5d6c1 },
      { x: 27, y: 14, r: 76, color: 0xe7aec4 },
    ],
    interactables: [
      ...exhibits,
      ...(site.site==='press'?[
        {id:'mill-shift.workers-stair',x:25,y:23,art:'preserved.door',label:'the workers’ stair to the Metalworks mill',
          visibleIf:{flag:'mill-shift.press.stair',eq:true},to:{map:'night-register.yard',x:9,y:24}},
        {id:'mill-shift.letter-chute',x:29,y:23,art:'preserved.door',label:'the folded-letter chute to the Nile pay chest',
          visibleIf:{flag:'mill-shift.press.wharf',eq:true},to:{map:'night-register.nile',x:9,y:24}},
      ].map((exit):Interactable=>({...exit,kind:'door',w:1,h:1})):[]),
      ...millSites.filter(key=>key===site.site).map((key):Interactable=>({
        id:'mill-shift.'+key, x:9,y:23,w:1,h:1,kind:'fieldgame',game:'mill-shift',art:'mill-shift.'+key,label:millAccounts[key].title,
      })),
      {
        id: site.room + '.coat', kind: 'fieldgame', game: 'shift-coat', x: 12, y: 23, w: 1, h: 1,
        art: 'coat.peg', label: 'the blue shift coat on its peg',
      },
      {
        id: site.room + '.perch',
        kind: 'fieldgame',
        game: 'night-perch',
        x: 15,
        y: 23,
        w: 1,
        h: 1,
        art: 'ink-post.bird',
        label: 'the creatures on the night perch',
      },
      {
        id: site.room + '.desk',
        kind: 'fieldgame',
        game: 'night-desk',
        x: 18,
        y: 23,
        w: 1,
        h: 1,
        art: 'nile.lamp-above',
        label: site.keeper + '’s register desk',
      },
      {
        id: site.room + '.back',
        kind: 'door',
        x: 16,
        y: 25,
        w: 1,
        h: 1,
        art: 'preserved.door',
        label: 'return to the chapter lamp',
        to: { map: site.doorMap, x, y: y + 1 },
      },
    ],
  };
}
export const nightRooms = nightSites.map(room);
