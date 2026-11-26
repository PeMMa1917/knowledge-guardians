import recordPack from '../content/polar-store.json';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const archive = 'preserved.archive';
const recordsRoom = 'preserved.polar-records';
const trialRoom = 'preserved.polar-store';
const published = { objective: 'preserved.publish' };
const flag = (key: string, eq: string | true = true): Condition => ({ flag: `polar.${key}`, eq });
const set = (key: string): Condition => ({ flagSet: `polar.${key}` });
const objective = (key: string): Condition => ({ objective: `polar.${key}` });
const all = (...causes: Condition[]): Condition => ({ all: causes });
const before = (condition: Condition): Condition => ({ not: condition });

function site(id: string, name: string, width: number, height: number, detail: Pick<MapDef, 'spawn' | 'interactables' | 'lights' | 'stamps' | 'npcs' | 'conditionalBlocks'>, interior: MapDef['blocks'] = []): MapDef {
  return {
    ...detail, id, name, width, height, world: 'WORLD-04', music: 'music.archive', ambience: 'study', background: 0x182c3a,
    floor: (x, y) => {
      if (x < 1 || x >= width - 1 || y < 0 || y >= height) return null;
      if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
      if (interior.some(([left, top, wide, tall]) => x >= left && x < left + wide && y >= top && y < top + tall)) return 'wall-base';
      return (x + y) % 4 === 1 ? 'stone-b' : 'stone-c';
    },
    blocks: [[1, 0, width - 2, 3], ...interior], zones: [],
  };
}

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition, node = id): Interactable {
  return { id: `polar-${id}`, kind: 'scene', node: `polar.${node}`, x, y, w: 1, h: 1, label, art: `polar.${art}`, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf?: Condition, readFlag?: string): Interactable {
  return { id: `polar-${id}`, kind: 'sign', x, y, w: 1, h: 1, label, art: `polar.${art}`, text, visibleIf, flag: readFlag && `polar.${readFlag}`, walkThrough: true };
}

function door(id: string, x: number, y: number, label: string, map: string, toX: number, toY: number): Interactable {
  return { id: `polar-${id}`, kind: 'door', x, y, w: 1, h: 1, label, art: 'polar.door', to: { map, x: toX, y: toY } };
}

type RecordGroup = 'frame' | 'surface' | 'stores' | 'screen' | 'fix' | 'sample';

function sources(group: RecordGroup): Condition {
  return all(...recordPack.exhibits.filter((record) => record.specimen.objective === `polar.${group}`).map((record) => ({ card: record.grantsCard })));
}

const casePlaces: Record<RecordGroup, [number, number][]> = {
  frame: [[4, 5], [7, 5]], surface: [[4, 10]], stores: [[10, 5], [13, 5], [16, 5], [19, 5]],
  screen: [[9, 10], [12, 10], [15, 10], [18, 10], [21, 10]],
  fix: [[4, 16], [7, 16], [10, 16], [13, 16]], sample: [[18, 16], [22, 16]],
};

const exhibits = Object.entries(casePlaces).flatMap(([group, places]) =>
  recordPack.exhibits.filter((record) => record.specimen.objective === `polar.${group}`).map((record, index): Interactable => {
    const [x, y] = places[index];
    return { id: `polar-${record.grantsCard.split('.').at(-1)}-case`, exhibit: record.id, kind: 'exhibit',
      x, y, w: 1, h: 1, label: record.name, art: record.art };
  }));

export const POLAR_ARCHIVE_PROPS: Interactable[] = [
  { ...door('archive-door', 22, 14, 'the Polar Store door', recordsRoom, 14, 21), visibleIf: published },
  sign('archive-low', 20, 14, 'the proof copy from the practice shed', 'sleeve',
    'Orsa’s signed sleeve is on the far desk. The two practice parcels wait with Quillan. This copy names which material reached the desk before the bell.', flag('published', 'low')),
  sign('archive-high', 20, 14, 'the freight copy from the practice shed', 'parcels',
    'Orsa’s checked count puts two practice parcels on the far bench. The source sleeve still waits by the loading peg. The archive keeps the count and the pending source check on different lines.', flag('published', 'high')),
];

const bothMats = all(flag('mat.soft'), flag('mat.hard'));
const bothFilters = all(flag('filter.pale'), flag('filter.dark'));
const recordDoorX = 25;

export const POLAR_RECORDS = site(recordsRoom, 'Preserved Lives: Polar Store Records', 29, 24, {
  spawn: { x: 14, y: 21 },
  npcs: [{ id: 'polar-keeper-anwen', x: 5, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 13, y: 1 }, { stamp: 'window', x: 22, y: 1 },
    { stamp: 'bookshelf', x: 25, y: 2 }, { stamp: 'bookshelf', x: 1, y: 2 },
    { stamp: 'rug-green', x: 13, y: 20 }, { stamp: 'bench', x: 2, y: 20 }, { stamp: 'bench', x: 25, y: 20 },
  ],
  lights: [{ x: 5, y: 5, r: 84, color: 0xafdde9 }, { x: 15, y: 6, r: 95, color: 0xd4e6f0 },
    { x: 19, y: 11, r: 82, color: 0xf0ce9d }, { x: 20, y: 18, r: 87, color: 0xafdde9 }, { x: 14, y: 20, r: 94, color: 0xe5d4ae }],
  interactables: [
    ...exhibits,
    door('archive-return', 14, 23, 'the way back to the Cold Store', archive, 23, 14),
    door('practice-door', recordDoorX, 13, 'the trial shed', trialRoom, 14, 16),
    sign('directory', 13, 18, 'the Polar Store directory', 'card',
      'The two sledge cases are in the north-west corner, near Anwen. The load-out trial is through the east door. The other tables hold marine labels, drawing instruments, provisions and shaded views.'),

    scene('surface', 3, 12, 'the casting tray with two surfaces', 'sole', all(sources('surface'), before(bothMats))),
    scene('surface-pin', 3, 12, 'the casting tray and hanging clips', 'impressions', all(bothMats, before(set('mat.layout'))), 'surface.pin'),
    sign('surface-soft', 3, 12, 'the countable soft impression', 'sole',
      'Five toe marks and three heel marks can be counted on this sheet. The pale strip tells a visitor which mat made them.', flag('mat.layout', 'soft')),
    sign('surface-pair', 3, 12, 'the pair of surface marks', 'impressions',
      'A separate front and heel pattern on one mat. A long streak on the other. The same cast touched both materials.', flag('mat.layout', 'pair')),

    scene('stores', 14, 7, 'the moveable provision shelf', 'shelf', all(sources('stores'), before(set('stores')))),
    sign('stores-packing', 13, 7, 'the packing rail with two height outlines', 'parcels',
      'Quillan can put different tall and low outlines against this rail. The loose leather tag is under review beside the source tabs.', flag('stores', 'packing')),
    sign('stores-custody', 17, 7, 'the two separate recovery shelves', 'shelf',
      'Two Elephant Island labels stay side by side. The third tin has its own Cape Royds label. A separate clip keeps the depot bag’s possible earlier use open.', flag('stores', 'custody')),

    { ...scene('screen', 15, 12, 'the fixed lamp and filter slide', 'filter-neutral', all(sources('screen'), before(bothFilters))),
      artBy: { flag: 'polar.filter', keys: { pale: 'polar.filter-pale', dark: 'polar.filter-dark' } } },
    sign('screen-view-pale', 17, 12, 'the side panel through pale grey', 'filter-pale',
      'The label’s small numbers stand out. A bright stripe still crosses the wide painted seam. The lamp stays in its slot.',
      all(flag('filter', 'pale'), before(set('screen'))), 'filter.pale'),
    sign('screen-view-dark', 17, 12, 'the side panel through dark grey', 'filter-dark',
      'The broad seam runs continuously where the glare stripe lay. The label’s smaller numbers disappear into its grey field.',
      all(flag('filter', 'dark'), before(set('screen'))), 'filter.dark'),
    scene('screen-pin', 15, 12, 'the tested filter slide and reading note', 'filter-neutral', all(bothFilters, before(set('screen'))), 'screen.pin'),
    sign('screen-label', 14, 12, 'the small-label view', 'filter-pale',
      'The reader can copy the little label. The seam checker takes a ticket for a separate view.', flag('screen', 'label')),
    sign('screen-seam', 16, 12, 'the broad-seam view', 'filter-dark',
      'The checker follows the seam across the panel. The date goes to the brighter desk before it is copied.', flag('screen', 'seam')),

    scene('fix', 8, 18, 'the copied sight on the survey table', 'band', all(sources('fix'), before(set('fix')))),
    sign('fix-band', 6, 18, 'the band on the wall map', 'band',
      'The single sight mark gives a band to revisit. The empty time clip remains visible at one end. There is no exact point on this practice map.', flag('fix', 'band')),
    sign('fix-ledger', 9, 18, 'the two facing survey record slots', 'ledger',
      'One slot holds a drawn sight. The opposite slot waits for a time. The wall map has no new point and the source remains at this table.', flag('fix', 'ledger')),

    scene('sample', 20, 18, 'the two sample drawers and linking tab', 'sample-pair', all(sources('sample'), before(set('sample')))),
    sign('sample-bridge', 20, 18, 'the shared comparison tab', 'sample-bridge',
      'USNM 128653 and USNM 122242 have separate ends. The common tab gives 17 February 1955 and 68 metres. The sampling method line is open.', flag('sample', 'bridge')),
    sign('sample-separate', 22, 18, 'the separate dated copy tabs', 'sample-pair',
      'Each drawer gives its own identity, date and depth. A finding slip points to the other drawer so a visitor can compare. The sampling method line is open.', flag('sample', 'separate')),
  ],
});

const bothFrames = objective('frame');
const route = (which: 'low' | 'high') => flag('route', which);
const receipt = (which: 'low' | 'high') => flag('delivered', which);
const lowX = 8;
const highX = 20;
const crossbarY = 9;

export const POLAR_TRIAL = site(trialRoom, 'Preserved Lives: Polar Store Trial Shed', 29, 19, {
  spawn: { x: 14, y: 16 },
  npcs: [{ id: 'polar-runner-quillan', x: 12, y: 12, facing: 'down' },
    { id: 'polar-reader-orsa', x: 14, y: 5, facing: 'down' }],
  stamps: [{ stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 25, y: 2 },
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 20, y: 1 },
    { stamp: 'rug-green', x: 13, y: 3 }, { stamp: 'bench', x: 24, y: 14 }],
  lights: [{ x: 8, y: 6, r: 73, color: 0xb3dff3 }, { x: 20, y: 6, r: 73, color: 0xffdca9 },
    { x: 14, y: 13, r: 95, color: 0xe5e1c2 }, { x: 6, y: 15, r: 52, color: 0xb3dff3 }],
  conditionalBlocks: [{ x: lowX, y: crossbarY, when: before(route('low')) },
    { x: highX, y: crossbarY, when: before(route('high')) }],
  interactables: [
    door('practice-return', 14, 18, 'the way to the Polar Store cases', recordsRoom, recordDoorX - 1, 13),
    sign('practice-note', 6, 15, 'the store’s practice notice', 'card',
      'These are indoor demonstration loads and empty silhouettes. The distances, 60 cm opening and nine-minute trial belong to this model shed.'),
    { ...scene('fit', 7, 12, 'the outline stands at the opening', 'frame-empty', all(sources('frame'), before(bothFrames))),
      artBy: { flag: 'polar.frame', keys: { low: 'polar.frame-low', high: 'polar.frame-high' } } },
    sign('fit-missing', 7, 12, 'the empty height clips', 'frame-empty',
      'The two specific sledge dimensions belong here. The record cases are beside Anwen in the other room.', before(sources('frame'))),
    sign('fit-low', 9, 12, 'the white mark with the low outline', 'frame-low',
      'The 18.5 cm outline clears the 60 cm bar with both feet on the line. This is the height of the empty dog-sledge outline.',
      all(flag('frame', 'low'), before(bothFrames)), 'tested.low'),
    sign('fit-high', 9, 12, 'the white mark with the high outline', 'frame-high',
      'The 67.5 cm outline meets the bar while standing upright. It rises 7.5 cm higher than the 60 cm opening. The frame says nothing about how much weight a sledge can carry.',
      all(flag('frame', 'high'), before(bothFrames)), 'tested.high'),
    sign('fit-ready', 7, 12, 'the two checked height marks', 'frame-high',
      'Low: 18.5 cm. Opening: 60 cm. High: 67.5 cm. These measurements compare two museum outlines in one practice opening.', bothFrames),
    scene('choice', 14, 12, 'the empty loading peg below the nine-minute bell', 'shelf', all(bothFrames, before(set('route')))),
    sign('old-card', 15, 14, 'the old all-delivered card', 'card',
      'A neat stamp says ALL DELIVERED. There is no arrival count on the card.', before(set('delivered'))),
    { ...sign('low-hatch', lowX, crossbarY, 'the screened hatch in the low lane', 'raised', 'The low crossing holds only the flat tray.'),
      artOpen: { key: 'polar.open-low', if: route('low') } },
    { ...sign('high-hatch', highX, crossbarY, 'the tall freight opening', 'raised', 'The broad lane uses the upright parcel stand.'),
      artOpen: { key: 'polar.open-high', if: route('high') } },

    sign('low-loaded', 8, 10, 'the flat tray at the screened hatch', 'sleeve',
      'The sleeve’s clip is closed. Its two height tabs travel flat under the rail.', all(route('low'), before(set('delivered')))),
    sign('high-loaded', 20, 10, 'the two marked parcels at the freight opening', 'parcels',
      'Both parcel marks are here at departure. Orsa will count them again at the other end.', all(route('high'), before(set('delivered')))),
    sign('low-cargo-left', 12, 14, 'the two packages still queued', 'parcels',
      'The two parcels remain by the departure peg. The sleeve took the one low tray.', route('low')),
    sign('high-copy-left', 17, 14, 'the source sleeve still at its loading clip', 'sleeve',
      'The source sleeve waits here. The two parcels took the broad lane before the bell.', route('high')),
    scene('deliver-low', 8, 5, 'Orsa’s receiving sleeve clip', 'sleeve', all(route('low'), before(set('delivered'))), 'deliver.low'),
    scene('deliver-high', 20, 5, 'Orsa’s parcel bench', 'parcels', all(route('high'), before(set('delivered'))), 'deliver.high'),
    sign('arrived-low', 8, 5, 'the received sleeve at the desk', 'sleeve-open',
      'Orsa has both dated sources and the upright height comparison. She signs for one sleeve and no parcels in the five-minute slot.', receipt('low')),
    sign('arrived-high', 20, 5, 'the two received parcels on the bench', 'parcels-delivered',
      'Orsa counts two practice parcels received. She saves room for a check of the supporting sleeve when it comes.', receipt('high')),
    sign('missing-low', 20, 5, 'the open parcel spaces', 'shelf',
      'Orsa keeps two spaces for the parcels on another run. The far shelf is still empty.', receipt('low')),
    sign('missing-high', 8, 5, 'the empty sleeve clip at the far desk', 'card',
      'The checking copy is still at the loading peg. The clip records what Orsa has to ask for next.', receipt('high')),

    scene('publish-low', 15, 14, 'the old notice and Orsa’s sleeve receipt', 'sleeve-open', all(receipt('low'), before(set('published'))), 'publish.low'),
    scene('publish-high', 15, 14, 'the old notice and Orsa’s parcel receipt', 'parcels-delivered', all(receipt('high'), before(set('published'))), 'publish.high'),
    sign('published-low', 15, 14, 'the notice with one sleeve arrival', 'sleeve-open',
      '1 source sleeve reached the low desk. 2 practice parcels await the next cart. Orsa checked the sleeve and its two tabs.', flag('published', 'low')),
    sign('published-high', 15, 14, 'the notice with two counted arrivals', 'parcels-delivered',
      '2 practice parcels reached the far bench. 1 source sleeve waits at departure. Orsa counted both parcels.', flag('published', 'high')),
  ],
}, [[1, crossbarY, lowX - 1, 1], [lowX + 1, crossbarY, highX - lowX - 1, 1], [highX + 1, crossbarY, 7, 1]]);
