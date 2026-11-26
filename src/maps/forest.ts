/** The Living Forest field exercise takes place in a fictional woodland. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, art: 'forest.waypost', label, to };
}

function note(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf?: Condition): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, visibleIf };
}

function guideScene(id: string, x: number, y: number, label: string, art: string, node: string,
  visibleIf?: Condition): Interactable {
  return { id, kind: 'scene', x, y, w: 1, h: 1, label, art, node, walkThrough: true, visibleIf };
}

function grassyFloor(width: number, height: number, path: (x: number, y: number) => boolean) {
  return (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    return path(x, y) ? 'stone-c' : 'grass';
  };
}

const quiet: Condition = { flag: 'forest.response', eq: 'quiet' };
const brief: Condition = { flag: 'forest.response', eq: 'brief' };
const reviewed: Condition = { flag: 'forest.followup', eq: true };
const lowRoute: Condition = { flag: 'forest.low-route', eq: true };
const splitGuide: Condition = { flag: 'forest.guide.form', eq: 'split' };
const hingedGuide: Condition = { flag: 'forest.guide.form', eq: 'hinged' };

export const FOREST_STATION: MapDef = {
  id: 'forest.station', name: 'Living Forest: Fern Station', world: 'WORLD-06',
  width: 26, height: 17, music: 'music.town', ambience: 'town', background: 0x203b35,
  floor: grassyFloor(26, 17, (x, y) => (y >= 7 && y <= 10) || (x >= 11 && x <= 13 && y >= 6)),
  spawn: { x: 12, y: 12 }, blocks: [], zones: [],
  npcs: [{ id: 'forest-naturalist', x: 12, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'house-b', x: 10, y: 1 }, { stamp: 'long-table', x: 5, y: 10 }, { stamp: 'long-table', x: 17, y: 10 },
    { stamp: 'tree', x: 1, y: 1 }, { stamp: 'tree', x: 5, y: 3 }, { stamp: 'tree', x: 18, y: 2 },
    { stamp: 'tree', x: 23, y: 2 }, { stamp: 'tree', x: 22, y: 12 }, { stamp: 'tree', x: 2, y: 12 },
    { stamp: 'flowers-small', x: 9, y: 11 }, { stamp: 'flowers-white', x: 16, y: 13 },
    { stamp: 'bench', x: 7, y: 13 },
  ],
  interactables: [
    door('forest-trail-path', 3, 8, 'the path to the listening trail', { map: 'forest.trail', x: 4, y: 14 }),
    door('forest-community-path', 23, 8, 'the path to the bridge clearing', { map: 'forest.community', x: 12, y: 12 }),
    { ...door('forest-nexus-return', 12, 15, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 25, y: 16 }), art: 'preserved.door' },
    { id: 'forest-station-waystone', kind: 'waystone', x: 15, y: 12, w: 1, h: 1,
      label: 'the station Waystone', place: 'Fern Station', art: 'waystone' },
    { id: 'forest-gombe-field-notes', kind: 'exhibit', exhibit: 'OBJ-FOREST-GOMBE', x: 7, y: 9, w: 1, h: 1,
      label: 'the Gombe field record', art: 'preserved.catalogue' },
    { id: 'forest-gombe-context', kind: 'exhibit', exhibit: 'OBJ-FOREST-GOMBE-CONTEXT', x: 18, y: 9, w: 1, h: 1,
      label: 'the Gombe context record', art: 'forest.field-diagram' },
    note('forest-gombe-credit', 15, 8, 'the credited Gombe reference slip', 'preserved.slip',
      'The timeline records Jane Goodall’s observation in 1960. In a separate account, a visiting researcher names field assistant Baraka Daniel beside a datasheet they collected together.',
      { flag: 'forest.gombe.credited', eq: true }),
    note('forest-trail-directory', 10, 11, 'the station directory', 'forest.notice',
      'Fern Station. West for the listening trail. East for the bridge clearing. The two cases carry field records from Gombe. The local trail is a Guardian field exercise.'),
  ],
  lights: [
    { x: 12, y: 7, r: 76, color: 0xcbe2ac }, { x: 7, y: 9, r: 56, color: 0xffdeab },
    { x: 18, y: 9, r: 57, color: 0xccdebd }, { x: 12, y: 14, r: 45, color: 0x9bcca8 },
  ],
};

const trailWidth = 32;
const trailHeight = 19;

function trailFloor(x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= trailWidth || y >= trailHeight) return null;
  const bank = y < 5 ? 14 : y < 10 ? 15 : y < 15 ? 13 : 14;
  if (x >= bank && x <= bank + 2) {
    // Low ford and upper footbridge stay open on every story branch.
    return (y >= 6 && y <= 7) || (y >= 12 && y <= 13) ? 'stone-c' : null;
  }
  if ((y >= 6 && y <= 7 && x >= 7) || (y >= 12 && y <= 14 && x <= 23)) return 'stone-c';
  if (x >= 22 && x <= 28 && y >= 4 && y <= 10) return 'stone-c';
  return 'grass';
}

export const FOREST_TRAIL: MapDef = {
  id: 'forest.trail', name: 'Living Forest: Listening Trail', world: 'WORLD-06',
  width: trailWidth, height: trailHeight, music: 'music.town', ambience: 'town',
  background: 0x265953, floor: trailFloor,
  spawn: { x: 4, y: 14 }, blocks: [], zones: [],
  npcs: [],
  stamps: [
    { stamp: 'tree', x: 1, y: 8 }, { stamp: 'tree', x: 4, y: 7 }, { stamp: 'tree', x: 5, y: 2 },
    { stamp: 'tree', x: 9, y: 2 }, { stamp: 'tree', x: 2, y: 16 }, { stamp: 'tree', x: 8, y: 15 },
    { stamp: 'tree', x: 18, y: 2 }, { stamp: 'tree', x: 24, y: 1 }, { stamp: 'tree', x: 28, y: 3 },
    { stamp: 'tree', x: 26, y: 13 }, { stamp: 'tree', x: 29, y: 15 }, { stamp: 'tree', x: 18, y: 15 },
    { stamp: 'bush', x: 12, y: 10 }, { stamp: 'bush', x: 20, y: 8 },
    { stamp: 'bench', x: 7, y: 10 }, { stamp: 'bench', x: 23, y: 8 },
    { stamp: 'flowers-small', x: 11, y: 11 }, { stamp: 'flowers-white', x: 27, y: 7 },
  ],
  interactables: [
    door('forest-trail-back', 2, 14, 'the path back to Fern Station', { map: 'forest.station', x: 4, y: 8 }),
    door('forest-clearing-path', 29, 12, 'the path to the bridge clearing', { map: 'forest.community', x: 20, y: 11 }),
    { id: 'forest-watch-creek', kind: 'forest-watch', node: 'creek', x: 11, y: 9, w: 1, h: 1,
      label: 'the creek reed screen', art: 'forest.screen', walkThrough: true },
    { id: 'forest-watch-ridge', kind: 'forest-watch', node: 'ridge', x: 24, y: 6, w: 1, h: 1,
      label: 'the ridge overlook', art: 'forest.ridge', walkThrough: true },
    note('forest-crossing-guide', 10, 13, 'the crossings sign', 'forest.waypost',
      'Follow the lower path to the creek screen. Both crossings lead to the ridge. The bridge clearing lies east. Two sketch frames face the rail at the upper bridge.'),
    note('forest-guide-rail', 16, 6, 'the old bridge rail', 'forest.guide-rail',
      'A tall end post and a lower post hold the rail. The bridge deck is the long line beneath both posts. The joiner keeps sketch frames at two standing places on the banks.'),
    guideScene('forest-guide-west-frame', 12, 6, 'the west-bank sketch frame', 'forest.guide-level',
      'forest.guide.trace-west'),
    guideScene('forest-guide-east-frame', 20, 9, 'the east-rise sketch frame', 'forest.guide-rise',
      'forest.guide.trace-east'),
    guideScene('forest-guide-west-panel', 13, 7, 'the panel for the west approach', 'forest.guide-level',
      'forest.guide.panel-west', splitGuide),
    guideScene('forest-guide-east-panel', 22, 8, 'the panel for the east rise', 'forest.guide-rise',
      'forest.guide.panel-east', splitGuide),
    note('forest-quiet-screen', 10, 8, 'the quiet-route marker', 'forest.notice',
      'The marker asks walkers to leave a gap at the screen. A second opening still leads to the bridge from the north.', quiet),
    note('forest-bridge-copy', 19, 7, 'the bridge’s observation cards', 'preserved.folder',
      'Two cards mark where the watchers sat and when their watches ended. The cards leave a space for the next observer’s record.', brief),
  ],
  lights: [
    { x: 11, y: 9, r: 64, color: 0xb5dfb7 }, { x: 24, y: 6, r: 73, color: 0xffdb9b },
    { x: 14, y: 13, r: 72, color: 0x9dc6cc }, { x: 17, y: 6, r: 53, color: 0xc7e5ad },
  ],
};

export const FOREST_COMMUNITY: MapDef = {
  id: 'forest.community', name: 'Living Forest: Bridge Clearing', world: 'WORLD-06',
  width: 24, height: 16, music: 'music.town', ambience: 'town', background: 0x2a4030,
  floor: grassyFloor(24, 16, (x, y) => (y >= 9 && y <= 11) || (x >= 10 && x <= 14 && y >= 6)),
  spawn: { x: 12, y: 12 }, blocks: [], zones: [],
  npcs: [{ id: 'forest-steward', x: 12, y: 6, facing: 'down' }],
  stamps: [
    { stamp: 'house-a', x: 2, y: 1 }, { stamp: 'house-b', x: 17, y: 1 },
    { stamp: 'long-table', x: 3, y: 7 }, { stamp: 'bench', x: 18, y: 7 },
    { stamp: 'tree', x: 8, y: 2 }, { stamp: 'tree', x: 14, y: 2 },
    { stamp: 'tree', x: 0, y: 10 }, { stamp: 'tree', x: 21, y: 12 },
    { stamp: 'flowers-small', x: 6, y: 12 }, { stamp: 'flowers-white', x: 16, y: 11 },
  ],
  interactables: [
    door('forest-community-back', 12, 14, 'the path back to Fern Station', { map: 'forest.station', x: 22, y: 8 }),
    door('forest-bridge-to-trail', 22, 11, 'the path back to the ridge', { map: 'forest.trail', x: 28, y: 12 }),
    { ...note('forest-pathbook', 6, 9, 'the bridge keeper’s route book', 'preserved.folder',
      'On early rounds the lamp crew hears wings behind the creek reeds. Bridge keepers on later shifts hear them along the ridge. These entries record the sounds people heard.'), flag: 'forest.pathbook' },
    note('forest-response-quiet', 8, 10, 'the quiet-route notice', 'forest.notice',
      'The quiet-screen note points larger groups to the open ridge path. It keeps the creek counts beside a sketch of the stretch of water visible from the screen.', quiet),
    note('forest-response-brief', 16, 8, 'the public observation board', 'preserved.display-paired',
      'A reader at the bridge sets the two crossing logs side by side. The lower path reaches the record. Both lookouts stay open, each with its own line of sight.', brief),
    note('forest-followup-note', 15, 10, 'the later watch slip', 'preserved.slip',
      'The return watch recorded two crossings from each lookout. The creek reeds hid part of that watch. Leave a gap in the record for the time behind the reeds.', reviewed),
    note('forest-low-route', 10, 12, 'the low viewing route', 'forest.waypost',
      'A low bench holds both field notes with the view limits and the observers’ names. Readers can reach the notes here. The ridge still has its own lookout.', lowRoute),
    guideScene('forest-guide-bench', 7, 8, 'the joiner’s layout board', 'forest.field-diagram',
      'forest.guide.bench', { not: { flagSet: 'forest.guide.form' } }),
    guideScene('forest-guide-hinges', 7, 8, 'the hinged guide on the joiner’s board', 'forest.guide-hinges',
      'forest.guide.hinges', hingedGuide),
    guideScene('forest-guide-bench-after', 7, 8, 'the joiner’s empty outlines', 'forest.field-diagram',
      'forest.guide.bench-after', splitGuide),
  ],
  lights: [
    { x: 12, y: 6, r: 76, color: 0xf8dfaa }, { x: 7, y: 10, r: 52, color: 0xb9cf9e },
    { x: 17, y: 9, r: 52, color: 0xc5d9af },
  ],
};
