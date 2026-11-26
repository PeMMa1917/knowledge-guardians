import {
  CORRESPONDENCE_CASES, CORRESPONDENCE_KEEPER, CORRESPONDENCE_OPEN, CORRESPONDENCE_PLANS, CORRESPONDENCE_READER, CORRESPONDENCE_RETURN,
  correspondenceCompose, correspondenceReply, correspondenceSeal, letterCurrent, letterDisplay, letterDone, letterEmpty, letterReturned,
  type CorrespondenceCase,
} from '../content/correspondenceRoom';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const CORRESPONDENCE_DOOR: Interactable = {
  id: 'copies-correspondence-door', kind: 'door', x: 21, y: 13, w: 1, h: 1, label: 'the door to the Correspondence Room',
  art: 'preserved.door', visibleIf: CORRESPONDENCE_OPEN, to: { map: 'copies.correspondence', x: 17, y: 26 },
};

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, node, x, y, w: 1, h: 1, label, art, visibleIf, kind: 'scene', walkThrough: true, sfx: 'sfx.page' };
}

function caseProps(record: CorrespondenceCase, index: number): Interactable[] {
  const x = 3 + (index % 7) * 5;
  const y = 5 + Math.floor(index / 7) * 3;
  return [
    { id: `${record.flag}-exhibit`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
      label: `${record.title} · ${record.accession}`, art: record.asset ? 'collection-stand' : 'correspondence.crowther-book' },
    scene(`${record.flag}-take`, `${record.flag}.take`, x + 2, y, `the working slip for ${record.accession}`, 'preserved.slip', {
      all: [{ card: record.card }, letterEmpty, { not: { objective: record.objective } }],
    }),
    scene(`${record.flag}-hook`, `${record.flag}.cancel`, x + 2, y, 'the empty slip hook', 'board-stand', letterCurrent(record)),
    ...CORRESPONDENCE_PLANS.map((plan) => scene(`${record.flag}-${plan}-signed`, `${record.flag}.${plan}`, x + 2, y,
      plan === 'front' ? 'the signed short wrapper and its tucked source' : 'the signed working fold with two readings',
      plan === 'front' ? 'preserved.display-records' : 'preserved.display-paired', letterDone(record, plan))),
  ];
}

const leafFrameRecord: Condition = { card: 'card.correspondence.kalpa-two-sides' };
const LEAF_FRAME_COPIES = [
  { ...scene('leaf-frame-object', 'leaf-frame.object', 9, 22, 'the ornament frame and Kalpa-sutra record', 'board-stand', leafFrameRecord),
    artOpen: { key: 'fold.strip', if: { flag: 'leaf-frame.object', eq: true } } },
  { ...scene('leaf-frame-account', 'leaf-frame.account', 12, 22, 'the workshop frame and commissioning account', 'ledger', leafFrameRecord),
    artOpen: { key: 'fold.strip', if: { flag: 'leaf-frame.account', eq: true } } },
  scene('leaf-frame-layout', 'leaf-frame.layout', 14, 22, 'Mera’s two-context sleeve', 'preserved.display-paired', {
    all: [{ objective: 'leaf-frame.compared' }, { not: { item: 'item.leaf-frame.sleeve' } }],
  }),
];

const W = 38;
const H = 30;

export const CORRESPONDENCE_ROOM: MapDef = {
  id: 'copies.correspondence', name: 'City of Copies: Correspondence Room', world: 'WORLD-08', width: W, height: H,
  spawn: { x: 17, y: 26 }, music: 'music.archive', ambience: 'study', background: 0x40354c,
  floor: (x, y) => {
    if (x < 1 || x >= W - 1 || y < 0 || y >= H - 1) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return (y >= 22 || (x >= 16 && x <= 18)) ? 'voices-inlay' : 'stone-c';
  },
  blocks: [[0, 0, W, 3]], zones: [],
  stamps: [
    ...[5, 16, 27].map((x) => ({ stamp: 'window', x, y: 1 })),
    { stamp: 'rug-green', x: 16, y: 25 }, { stamp: 'bench', x: 9, y: 24 },
    { stamp: 'bench', x: 28, y: 24 }, { stamp: 'cabinet', x: 33, y: 23 }, { stamp: 'plant-tall', x: 5, y: 24 },
  ],
  lights: [
    ...[6, 18, 29].flatMap((x) => [6, 16].map((y) => ({ x, y, r: 83, color: 0xdac6aa }))),
    { x: 7, y: 24, r: 75, color: 0xa8cdc6 }, { x: 27, y: 24, r: 79, color: 0xe2c29a },
    { x: 16, y: 26, r: 65, color: 0xdbc7dd, flicker: true },
  ],
  npcs: [
    { id: CORRESPONDENCE_KEEPER, x: 14, y: 24, facing: 'right' },
    { id: CORRESPONDENCE_READER, x: 24, y: 25, facing: 'up' },
  ],
  interactables: [
    ...CORRESPONDENCE_CASES.flatMap(caseProps),
    ...LEAF_FRAME_COPIES,
    { id: 'correspondence-room-return', kind: 'door', x: 17, y: 28, w: 1, h: 1,
      to: { map: 'copies.archive', x: 20, y: 14 }, label: 'the way back to the Copies Record Room', art: 'preserved.door' },
    { id: 'correspondence-guide', kind: 'sign', x: 15, y: 25, w: 1, h: 1, walkThrough: true,
      label: 'the sign for the two delivery approaches', art: 'forest.notice',
      text: 'After you inspect a case, take its working slip to the folding bench. Go west for the quick wrapper or east for the opened fold. The centre hook keeps the signed reply.' },
    scene('correspondence-compose', 'correspondence.compose', 17, 22, 'Mera’s folding bench with two wrappers', 'workbench', correspondenceCompose),
    scene('correspondence-west-rail', 'correspondence.receive-front', 7, 24, 'the short note at the west rail', 'copies.strip', correspondenceReply('front')),
    scene('correspondence-east-desk', 'correspondence.receive-fold', 27, 24, 'the open fold on the staffed east desk', 'preserved.display-paired', correspondenceReply('fold')),
    scene('correspondence-seal', 'correspondence.seal', 18, 25, 'the reply hook and its outgoing seal', 'voices.register', correspondenceSeal),
    { id: 'correspondence-west-done', kind: 'sign', x: 7, y: 24, w: 1, h: 1, walkThrough: true,
      label: 'the outside line and signed rail reply', art: 'preserved.display-records',
      text: 'The narrow reply rests where an arriving runner can find it. The source and longer wording are still inside the wrapper.', visibleIf: letterDisplay('front') },
    { id: 'correspondence-east-done', kind: 'sign', x: 27, y: 24, w: 1, h: 1, walkThrough: true,
      label: 'the two open lines with the reader’s reply', art: 'preserved.display-paired', visibleIf: letterDisplay('fold'),
      text: 'Ansel leaves the two forms open for the next reader. His signed reply names what he put to use.' },
  ],
};

const anyCorrespondenceGear: Condition = { any: CORRESPONDENCE_CASES.map(({ key }) => specimenEquipped(key)) };

export const NEXUS_CORRESPONDENCE: Interactable[] = CORRESPONDENCE_CASES.flatMap((record) => {
  const tool = specimenEquipped(record.key);
  const used = letterReturned(record);
  return [
    scene(record.revisit.prop, `${record.flag}.nexus`, 29, 14,
      `Venn’s east letter stand and ${record.accession}`, 'voices.permission', { all: [tool, { not: used }] }),
    { ...scene(`${record.revisit.prop}-readback`, `${record.flag}.nexus-read`, 29, 14,
      `Venn’s checked reply for ${record.accession}`, 'preserved.display-paired', {
        all: [used, { any: [tool, { all: [{ not: anyCorrespondenceGear }, { flag: CORRESPONDENCE_RETURN, eq: record.slug }] }] }],
      }), artBy: { flag: record.objective, keys: { front: 'preserved.display-records', fold: 'preserved.display-paired' } } },
  ];
});
