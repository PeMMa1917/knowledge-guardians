/** A fictional island dock order investigated from a workshop and field paths. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';
import { MODEL_RECORD_EXITS } from './modelRecords';
import { ISLAND_LANTERN_FAIR } from './lanternfair';
import { ISLAND_MOVEMENT_DOCK, ISLAND_MOVEMENT_WORKSHOP } from './island-movement';
import { ISLAND_DOCK_FRAMES, ISLAND_WORKSHOP_FRAMES } from './frames';
import { ISLAND_SKIFF_LAUNCH, ISLAND_SKIFF_RECEIVERS } from './islandSkiff';
import { ISLAND_WATER_LOOP, MARGIN_WATER_LOOP } from './waterLoop';
import { ISLAND_INCENTIVE_DOCK, ISLAND_INCENTIVE_WORKSHOP } from './civicIncentive';
import { LABEL_LOFT_OUTSIDE } from './asiaLabelLoft';
import { JOINED_CLOTH_FRAME, JOINED_CLOTH_LEDGE, JOINED_CLOTH_RACK } from './joinedCloth';

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, art = 'island.waypost'): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

function ground(width: number, height: number, tile: (x: number, y: number) => string) {
  return (x: number, y: number) => x < 1 || y < 0 || x >= width - 1 || y >= height ? null : tile(x, y);
}

const bay = ['island-bay-a', 'island-bay-b'];
const published: Condition = { objective: 'island.publish' };
const retested: Condition = { objective: 'island.retest' };
const signalPosted: Condition = { objective: 'island.signal' };

export const ISLAND_WORKSHOP: MapDef = {
  id: 'island.workshop', name: 'Island of Models: Plan Workshop', world: 'WORLD-15',
  width: 29, height: 18, music: 'music.archive', ambience: 'study', background: 0x3c4a43,
  floor: ground(29, 18, (x, y) => {
    if (y < 3) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return (x >= 11 && x <= 17) || (y >= 9 && y <= 12) ? 'island-path' : 'island-slate';
  }),
  blocks: [[1, 0, 27, 3]], zones: [], spawn: { x: 12, y: 12 },
  npcs: [{ id: 'island-planner', x: 12, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'island-wall-plan', x: 11, y: 2 }, { stamp: 'island-maker-bench', x: 4, y: 5 },
    { stamp: 'island-maker-bench', x: 22, y: 5 }, { stamp: 'civic-bookcases', x: 3, y: 3 },
    { stamp: 'civic-bookcases', x: 22, y: 3 }, { stamp: 'window', x: 7, y: 1 },
    { stamp: 'window', x: 20, y: 1 }, { stamp: 'market-planter', x: 7, y: 13 },
    { stamp: 'market-planter', x: 20, y: 13 }, { stamp: 'voices-bench', x: 5, y: 14 },
  ],
  interactables: [
    ...MODEL_RECORD_EXITS,
    ...ISLAND_INCENTIVE_WORKSHOP,
    ...ISLAND_MOVEMENT_WORKSHOP,
    ...ISLAND_WORKSHOP_FRAMES,
    ...ISLAND_WATER_LOOP,
    JOINED_CLOTH_RACK,
    door('island-dock-path', 4, 10, 'the west path to the dock', { map: 'island.dock', x: 7, y: 10 }),
    door('island-margin-path', 24, 10, 'the east path to the quiet margin', { map: 'island.margin', x: 5, y: 10 }),
    door('island-nexus-return', 13, 15, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 34, y: 12 }, 'preserved.door'),
    { id: 'island-plan', kind: 'island-plan', x: 15, y: 9, w: 1, h: 1,
      label: 'the tabletop route model', art: 'island.plan' },
    { id: 'island-workshop-waystone', kind: 'waystone', x: 9, y: 10, w: 1, h: 1,
      label: 'the Plan Workshop Waystone', place: 'the Plan Workshop', art: 'waystone' },
    sign('island-workshop-directory', 11, 9, 'the workshop route key', 'island.waypost',
      'The dock log is to the west. Walk east to see where the quiet strip lines were marked. The three scaled routes meet on the model.'),
    sign('island-draft-plan', 18, 9, 'the draft ferry claim', 'preserved.slip',
      'THE FERRY ALWAYS HAS ROOM FOR FOUR. The heading was copied from the upper landing trial.',
      { visibleIf: { not: retested } }),
    sign('island-checked-plan', 18, 9, 'the checked ferry plan', 'island.landing',
      'The upper landing carries four crates per circuit. The lower landing carries two. The estimate describes this model.',
      { visibleIf: retested }),
  ],
  lights: [
    { x: 14, y: 9, r: 75, color: 0xf3d29e }, { x: 4, y: 10, r: 57, color: 0xdac19d },
    { x: 24, y: 10, r: 57, color: 0xc6d7ad }, { x: 13, y: 14, r: 52, color: 0xc3d3b6 },
  ],
};

const upperPlans = [
  ['ridge', 'the upper landing ridge plan',
    'Upper landing trial. The ridge moves eight crates in 36 minutes, with two marked-strip crossings in the model. The first load takes 18 minutes. The route climbs the steeper wheeled lane.'],
  ['ferry', 'the upper landing ferry plan',
    'Upper landing trial. The ferry moves eight crates in 24 minutes, with four marked-strip crossings in the model. The upper berth fits four crates per circuit and avoids the steep wheeled lane.'],
  ['marsh', 'the upper landing marsh plan',
    'Upper landing trial. The marsh path moves eight crates in 40 minutes, with twelve marked-strip crossings in the model. The first pair can arrive after one ten-minute circuit.'],
] as const;

const lowerPlans = [
  ['ridge', 'the lower landing ridge plan',
    'Lower landing trial. The ridge still moves eight crates in 36 minutes, with two marked-strip crossings. The first posted trial stays beside this one.'],
  ['ferry', 'the lower landing ferry plan',
    'Lower landing trial. The ferry now takes 48 minutes and eight marked-strip crossings to move all eight crates. The lower berth takes two crates each circuit. The upper result stays on its own line.'],
  ['marsh', 'the lower landing marsh plan',
    'Lower landing trial. The marsh path still takes 40 minutes and twelve marked-strip crossings. The first pair arrives after ten minutes. These crossings count passages through marks in the model.'],
] as const;

export const ISLAND_DOCK: MapDef = {
  id: 'island.dock', name: 'Island of Models: Two-Tide Dock', world: 'WORLD-15',
  width: 30, height: 18, music: 'music.town', ambience: 'town', background: 0x3c5a58,
  floor: ground(30, 18, (x, y) => {
    if ((x >= 11 && x <= 14 && y >= 12 && y <= 15) || (x >= 20 && x <= 23 && y >= 12 && y <= 16)) return 'island-boards';
    if (y >= 14) return bay[(x + y) % bay.length];
    if (y >= 12) return 'island-shallow';
    if (x >= 7 && x <= 14 && y >= 6) return 'island-path';
    return 'island-sand';
  }),
  blocks: [[1, 12, 10, 6], [11, 16, 4, 2], [15, 12, 5, 6], [20, 17, 4, 1], [24, 12, 5, 6]],
  zones: [], spawn: { x: 7, y: 10 },
  npcs: [
    { id: 'island-dockhand', x: 13, y: 8, facing: 'down' },
    { id: 'island-caller', x: 17, y: 9, facing: 'down' },
  ],
  stamps: [
    { stamp: 'island-dock-shelter', x: 7, y: 2 }, { stamp: 'island-dock-shelter', x: 20, y: 3 },
    { stamp: 'island-dock-stage', x: 11, y: 13 }, { stamp: 'island-dock-stage', x: 20, y: 14 },
    { stamp: 'island-mast', x: 10, y: 9 }, { stamp: 'island-mast', x: 24, y: 9 },
    { stamp: 'crates', x: 7, y: 6 }, { stamp: 'crates', x: 21, y: 8 },
    { stamp: 'market-planter', x: 14, y: 3 }, { stamp: 'voices-bench', x: 4, y: 7 },
  ],
  interactables: [
    ...ISLAND_INCENTIVE_DOCK,
    ...ISLAND_MOVEMENT_DOCK,
    ...ISLAND_DOCK_FRAMES,
    JOINED_CLOTH_FRAME,
    JOINED_CLOTH_LEDGE,
    ISLAND_SKIFF_LAUNCH,
    { id: 'cross-launch', kind: 'fieldgame', game: 'cross-launch', x: 18, y: 6, w: 1, h: 1, label: 'the launch board on the dock (a crossing)', art: 'signpost' },
    ...ISLAND_LANTERN_FAIR,
    door('island-dock-return', 5, 10, 'the dock path back to the workshop', { map: 'island.workshop', x: 5, y: 10 }),
    door('island-dock-to-margin', 26, 10, 'the beach path to the quiet margin', { map: 'island.margin', x: 23, y: 10 }),
    sign('island-route-card', 10, 7, 'the loading-cycle route card', 'island.card',
      'Move eight crates within 50 minutes. The ridge cart carries four in an 18-minute circuit. At the upper berth, the ferry takes four in 12 minutes. The handcart through the marsh takes two in ten minutes. Each circuit includes the return for the next load.',
      { flag: 'island.route.read' }),
    sign('island-upper-pier', 12, 13, 'the upper landing beam', 'island.landing',
      'The upper berth faces the wider ferry platform. A loaded crossing still includes the time to be ready for the next load.'),
    sign('island-square-claim', 13, 11, 'the copied square-board line', 'preserved.slip',
      'THE SQUARE BOARD CLOSES THIS RAMP. Someone copied this line from an older chart.',
      { flag: 'island.signal.claim', visibleIf: { not: signalPosted } }),
    sign('island-square-checked', 13, 11, 'the checked square-board line', 'island.signal',
      'The copied chart called this ramp closed. The raised square asks the approaching crew to wait for the ramp hand. The swing rail can stand open while it is raised.',
      { visibleIf: signalPosted }),
    sign('island-signal-rail', 14, 14, 'the square board over the open ramp', 'island.signal',
      'The swing rail stands open while the square board is up. Two ramp hands are waiting at the opening.',
      { flag: 'island.signal.rail' }),
    sign('island-signal-hand', 15, 9, 'the landing crew’s hand signal', 'island.card',
      'The south-bank boat crews taught their apprentices to wait when the square is raised. Step on after a ramp hand turns a palm up. The board can be raised while the rail is open.',
      { flag: 'island.signal.hand' }),
    sign('island-signal-pair', 22, 10, 'the square board’s paired notice', 'island.signal',
      'Square up. Wait for a palm-up call from the ramp hand. The board comes from the south-bank crews.',
      { visibleIf: { flag: 'island.signal.layout', eq: 'pair' } }),
    sign('island-signal-gloss', 22, 10, 'the square board’s local guide notice', 'island.margin',
      'The square stays in the lookout’s sightline. Find the local guide at Joss’s shelter. Its source line names the south-bank crews.',
      { visibleIf: { flag: 'island.signal.layout', eq: 'gloss' } }),
    sign('island-lower-pier', 21, 14, 'the lower landing beam', 'island.landing',
      'The lower berth has a narrower loading ledge. The loading crew will mark its allowance when it is needed.',
      { visibleIf: { not: published } }),
    sign('island-low-landing', 21, 14, 'the lower landing’s loading slip', 'island.landing',
      'The falling tide has uncovered the lower berth. Its narrow ledge takes two crates per ferry circuit. The circuit remains twelve minutes in this trial.',
      { flag: 'island.lower.read', visibleIf: published }),
    ...upperPlans.map(([route, label, text]) => sign('island-result-' + route, 16, 7, label, 'island.' + route, text,
      { visibleIf: { flag: 'island.response', eq: route } })),
    ...lowerPlans.map(([route, label, text]) => sign('island-revised-' + route, 19, 9, label, 'island.' + route, text,
      { visibleIf: { flag: 'island.revision', eq: route } })),
  ],
  lights: [
    { x: 12, y: 8, r: 69, color: 0xf7d5a1 }, { x: 22, y: 10, r: 65, color: 0xe8c69a },
    { x: 12, y: 13, r: 50, color: 0xc0e0c9 }, { x: 21, y: 14, r: 54, color: 0xa1c7bd },
  ],
};

export const ISLAND_MARGIN: MapDef = {
  id: 'island.margin', name: 'Island of Models: Quiet Margin', world: 'WORLD-15',
  width: 30, height: 18, music: 'music.town', ambience: 'town', background: 0x45564a,
  floor: ground(30, 18, (x, y) => {
    const boardwalk = (y >= 9 && y <= 11) || (x >= 14 && x <= 16 && y >= 6 && y <= 13);
    if (boardwalk) return 'island-boards';
    if ((y >= 14 && x >= 10 && x <= 20) || (x >= 25 && y < 8)) return 'island-shallow';
    return (x + y) % 3 === 0 ? 'island-marsh-a' : 'island-marsh-b';
  }),
  blocks: [[10, 14, 11, 4], [25, 0, 4, 8]], zones: [], spawn: { x: 5, y: 10 }, npcs: [],
  stamps: [
    { stamp: 'island-reeds', x: 4, y: 5 }, { stamp: 'island-reeds', x: 8, y: 12 },
    { stamp: 'island-reeds', x: 17, y: 3 }, { stamp: 'island-reeds', x: 21, y: 12 },
    { stamp: 'island-margin-mark', x: 9, y: 7 }, { stamp: 'island-margin-mark', x: 17, y: 7 },
    { stamp: 'island-margin-mark', x: 21, y: 7 }, { stamp: 'market-planter', x: 5, y: 13 },
    { stamp: 'voices-bench', x: 5, y: 6 }, { stamp: 'tree', x: 22, y: 3 },
  ],
  interactables: [
    door('island-margin-return', 3, 10, 'the quiet path back to the workshop', { map: 'island.workshop', x: 23, y: 10 }),
    door('island-margin-to-dock', 25, 10, 'the beach path back to the dock', { map: 'island.dock', x: 25, y: 10 }),
    sign('island-quiet-strip', 13, 8, 'the quiet-strip field card', 'island.margin',
      'Each loaded circuit touches one marked strip on the ridge, two on the ferry and three on the marsh route. The tally counts passages across these marks. The margin crew has a separate line for sound observed from the path.',
      { flag: 'island.quiet.read' }),
    sign('island-margin-window', 18, 11, 'the observation ledge above the margin', 'island.margin',
      'The crew can see where each strip starts. A route crossing this ledge passes a marked line. Counts made here cannot show what happens farther out among the reeds.'),
    sign('island-listener-note', 16, 13, 'the listener’s slip at the bend', 'island.card',
      'I heard a short rattle at the bend when a handcart turned. I could not tell how far it carried. Can someone leave a place and time if they hear it again?',
      { flag: 'island.listener.read', visibleIf: { objective: 'island.finish' } }),
    sign('island-quiet-log', 22, 10, 'the quiet margin’s new listening slip', 'island.margin',
      'A new slip leaves room for a place, time and what a listener heard. The strip tally keeps its own page. The crew can make a fresh observation at the bend.',
      { visibleIf: { flag: 'island.margin.log', eq: true } }),
    ...ISLAND_SKIFF_RECEIVERS,
    ...MARGIN_WATER_LOOP,
    ...LABEL_LOFT_OUTSIDE,
  ],
  lights: [
    { x: 12, y: 10, r: 72, color: 0xf1d9a4 }, { x: 18, y: 11, r: 71, color: 0xcee1b4 },
    { x: 15, y: 7, r: 53, color: 0xcfe0b5 }, { x: 23, y: 10, r: 50, color: 0xebd5a3 },
  ],
};
