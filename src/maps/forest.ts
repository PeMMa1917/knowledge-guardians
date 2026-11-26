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
const gapReady: Condition = { objective: 'forest.finish' };
const gapFormat = (format: string): Condition => ({ flag: 'forest.gap.format', eq: format });
const gapEdit = (format: string, edition: string): Condition =>
  ({ all: [gapFormat(format), { flag: `forest.gap.${format}`, eq: edition }] });
const mossFrame: Condition = { flag: 'forest.moss.frame', eq: true };
const mossMark: Condition = { flag: 'forest.moss.result', eq: 'mark' };
const mossRibbon: Condition = { flag: 'forest.moss.result', eq: 'ribbon' };
const forestArrived: Condition = { objective: 'forest.arrival' };
const spateChoice = (route: 'rail' | 'bend'): Condition => ({ flag: 'forest.spate.route', eq: route });
const spateCrossed: Condition = { objective: 'forest.spate.crossed' };
const mossReadings = 'Green touched five squares at the shaded creek bank and one at the shaded bridge edge. '
  + 'In the open, green touched two at the ridge edge and four below the path. '
  + 'The day before, the crew saw five boot contacts at the shaded edge and six at the open edge in one round. '
  + 'They saw none at the off-path pegs. Keep the pegs in place for another reading.';

function mossPeg(site: string, x: number, y: number, label: string): Interactable {
  const key = `forest.moss.${site}`;
  return {
    ...guideScene(`forest-moss-${site}`, x, y, label, 'forest.waypost', key, mossFrame),
    artOpen: { key: 'preserved.slip', if: { flagSet: key } },
  };
}

function spateCrossings(route: 'rail' | 'bend', y: number, eastLanding: { x: number; y: number },
  label: string, openedArt: string, closedText: string): Interactable[] {
  const openIf = spateChoice(route);
  return [
    { side: 'west', x: 13, landing: eastLanding },
    { side: 'east', x: 17, landing: { x: 12, y } },
  ].map(({ side, x, landing }) => ({
    ...door(`forest-spate-${route}-${side}`, x, y, label, { map: 'forest.trail', ...landing }),
    walkThrough: true, visibleIf: forestArrived, openIf, text: closedText,
    artOpen: { key: openedArt, if: openIf }, flag: 'forest.spate.crossed',
  }));
}

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
    guideScene('forest-moss-frame', 9, 8, 'Elian’s six-square frame', 'forest.field-diagram', 'forest.moss.loan',
      { flag: 'forest.arrived', eq: true }),
    note('forest-moss-station-sheet', 17, 12, 'the frame sheet and the bridge crew’s tally', 'preserved.display-paired',
      mossReadings, mossRibbon),
    note('forest-spate-return-slip', 15, 14, 'Ayla’s dry return slip', 'preserved.display-paired',
      'The dawn notes came back dry. Ayla filed the wet marks and the cart crew’s track beside the route used today. Her sister can read both before the next bell.',
      spateCrossed),
    { ...guideScene('forest-gap-clear', 8, 12, 'the ridge return register', 'preserved.folder', 'forest.gap.register.clear', gapReady),
      artOpen: { key: 'preserved.catalogue', if: { flag: 'forest.gap.clear', eq: true } } },
    { ...guideScene('forest-gap-blocked', 20, 12, 'the creek return register', 'preserved.folder', 'forest.gap.register.blocked', gapReady),
      artOpen: { key: 'preserved.catalogue', if: { flag: 'forest.gap.blocked', eq: true } } },
    { ...guideScene('forest-gap-press', 10, 13, 'the reader’s copy stand', 'preserved.folder', 'forest.gap.format',
      { objective: 'forest.gap.o.recover' }),
      artBy: { flag: 'forest.gap.format', keys: { table: 'preserved.display-paired', slip: 'preserved.slip' } } },
    guideScene('forest-gap-reader-table', 19, 13, 'the reader’s copy of the table', 'forest.notice', 'forest.gap.read.table', gapFormat('table')),
    guideScene('forest-gap-reader-slip', 19, 13, 'the reader’s handover slip', 'forest.notice', 'forest.gap.read.slip', gapFormat('slip')),
    note('forest-gap-table-cells', 13, 13, 'the table with a missing-count cell', 'preserved.display-records',
      'Ridge, first beat. Clear view and zero crossings. Creek, middle beat. No count because the view was blocked.', gapEdit('table', 'cells')),
    note('forest-gap-table-headings', 13, 13, 'the table with two view headings', 'preserved.display-paired',
      'Under “Ridge view clear”, the first beat has a zero. Under “Creek view blocked”, the middle beat has no count.', gapEdit('table', 'headings')),
    note('forest-gap-slip-condition', 13, 13, 'the condition-first slip', 'preserved.slip',
      'While the view was open at the creek, the observer recorded two crossings. The middle beat was hidden. At the ridge the first beat was clear, with no crossings.', gapEdit('slip', 'condition')),
    note('forest-gap-slip-lines', 13, 13, 'the three-beat record slip', 'forest.notice',
      'Creek beats one and three each show one crossing. The middle beat was hidden. On a different line, the ridge’s first beat shows zero from a clear view.', gapEdit('slip', 'lines')),
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
    { id: 'field-dig', kind: 'fieldgame', game: 'dig', x: 11, y: 15, w: 1, h: 1, label: 'Marisol\'s dig at the old charcoal camp (The Careful Dig)', art: 'ledger' },
    { id: 'cross-geese', kind: 'fieldgame', game: 'cross-geese', x: 22, y: 12, w: 1, h: 1, label: 'a row of nesting geese across the trail (a crossing)', art: 'reeds' },
    door('forest-trail-back', 2, 14, 'the path back to Fern Station', { map: 'forest.station', x: 4, y: 8 }),
    door('forest-clearing-path', 29, 12, 'the path to the bridge clearing', { map: 'forest.community', x: 20, y: 11 }),
    ...spateCrossings('rail', 3, { x: 18, y: 4 }, 'the north keeper’s rail', 'forest.guide-rail',
      'The short keeper’s rail is folded into its post. Check Ayla’s storm board in the clearing. The ordinary bridge and ford are open.'),
    ...spateCrossings('bend', 17, { x: 19, y: 17 }, 'the sheltered cart crossing', 'forest.screen',
      'The sheltered cart crossing has no route screen. Check Ayla’s storm board in the clearing. The ordinary bridge and ford are open.'),
    guideScene('forest-spate-west-mark', 10, 4, 'the two wet lines above the shortcut', 'forest.ridge',
      'forest.spate.west', { all: [forestArrived, { not: { flagSet: 'forest.spate.west' } }] }),
    note('forest-spate-west-dates', 10, 4, 'the two dated north readings', 'preserved.slip',
      'At the north post the water was higher at the morning bell and lower at the noon bell. Both marks stay visible on the post.', { flag: 'forest.spate.west', eq: true }),
    guideScene('forest-spate-east-mark', 23, 16, 'the cart tracks at the alder bend', 'forest.field-diagram',
      'forest.spate.east', { all: [forestArrived, { not: { flagSet: 'forest.spate.east' } }] }),
    note('forest-spate-east-sketch', 23, 16, 'the dated cart crew sketch', 'preserved.catalogue',
      'The noon cart check found the sheltered bend dry. The outline shows room for a cart and a longer approach than the north path.', { flag: 'forest.spate.east', eq: true }),
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
    mossPeg('creek-away', 8, 8, 'the shaded creek-bank peg'),
    mossPeg('bridge-edge', 18, 5, 'the shaded bridge-edge peg'),
    mossPeg('ridge-edge', 25, 7, 'the open ridge-edge peg'),
    mossPeg('ridge-away', 25, 11, 'the open patch below the ridge'),
    note('forest-moss-mark-bridge', 19, 5, 'the tie by the shaded bridge-edge frame', 'preserved.slip',
      'A tie points to the corner where the notch sits. The lower right square held green in the first survey. Leave room to set the same frame here again.', mossMark),
    note('forest-moss-mark-ridge', 26, 7, 'the tie by the open ridge-edge frame', 'preserved.slip',
      'A tie marks this frame corner. The top right and lower middle held green in the first survey. The full sheet is low at the clearing.', mossMark),
    note('forest-moss-ribbon-west', 5, 13, 'the ribbon at the west trail entrance', 'forest.notice',
      'Use the laid stones where you can so the next crew can see the same ground. Both crossings are open. The full sheet is at Fern Station.', mossRibbon),
    note('forest-moss-ribbon-east', 28, 11, 'the ribbon at the east trail entrance', 'forest.notice',
      'Please leave the four pegged patches undisturbed on your way across. Use the laid stones where you can. The next crew’s full sheet is at Fern Station.', mossRibbon),
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
    guideScene('forest-spate-plan', 11, 9, 'Ayla’s storm-route board', 'forest.notice',
      'forest.spate.plan', forestArrived),
    note('forest-spate-rail-notice', 9, 7, 'the north rail route strip', 'forest.guide-level',
      'The north handrail is open for one keeper at a time. A keeper can bring notes straight from the ridge. Keep carts on the ordinary bridge.', spateChoice('rail')),
    note('forest-spate-bend-notice', 9, 7, 'the sheltered crossing route strip', 'forest.guide-rise',
      'The bend has a wind screen and room for a cart. Follow the long sheltered bank. The ordinary bridge remains available.', spateChoice('bend')),
    note('forest-spate-wait-notice', 9, 7, 'Ayla’s folded route strip', 'preserved.slip',
      'Ayla’s sister took the usual round. The spare fittings are here if a later watch wants to check the two storm paths again.',
      { all: [{ flag: 'forest.spate.waited', eq: true }, { not: { flagSet: 'forest.spate.route' } }] }),
    { ...note('forest-pathbook', 6, 9, 'the bridge keeper’s route book', 'preserved.folder',
      'On early rounds the lamp crew hears wings behind the creek reeds. Bridge keepers on later shifts hear them along the ridge. These entries record the sounds people heard.'), flag: 'forest.pathbook' },
    guideScene('forest-moss-boot-log', 5, 10, 'the bridge crew’s boot tally', 'preserved.catalogue', 'forest.moss.log', mossFrame),
    { ...guideScene('forest-moss-table', 14, 9, 'the stand with the old shade notice', 'preserved.folder', 'forest.moss.table',
      { all: [mossFrame, { not: { flagSet: 'forest.moss.result' } }] }),
      artBy: { flag: 'forest.moss.top', keys: { shade: 'preserved.display-paired', open: 'preserved.display-records' } } },
    note('forest-moss-low-sheet', 14, 9, 'the full frame sheet at the low stand', 'preserved.display-paired', mossReadings, mossMark),
    note('forest-moss-revised-notice', 14, 9, 'the clearing’s trail note', 'forest.notice',
      'The old shade notice is in the folder. On this trail, we found more squares with green away from the path in both pairs. The next crew will check the pegs again. Find the full sheet at Fern Station.', mossRibbon),
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
