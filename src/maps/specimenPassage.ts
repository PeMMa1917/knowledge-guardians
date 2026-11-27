import { PASSAGE_CASES, PASSAGE_GATE, PASSAGE_GROUP, YIRRKALA_REFERRAL_OPEN, YIRRKALA_REFERRAL_ROUTE } from '../content/passageCases';
import { passageDone, type PassageStop } from '../domain/specimenPassage';
import type { Interactable, MapDef } from './types';

export const SHOAL_PROOF_DOOR: Interactable = {
  id: 'sea-reading-shelter-door', kind: 'door', x: 20, y: 12, w: 1, h: 1, art: 'preserved.door',
  label: 'the door to Shoal Shelf Reading Shelter', visibleIf: PASSAGE_GATE,
  to: { map: 'sea.proof-shelter', x: 18, y: 23 },
};

function readingStop(stop: PassageStop, x: number, y: number, label: string): Interactable {
  return {
    id: `${PASSAGE_GROUP}-${stop}`, kind: 'fieldgame', game: `${PASSAGE_GROUP}:${stop}`, x, y, w: 1, h: 1,
    label, art: 'preserved.slip', walkThrough: true, visibleIf: PASSAGE_GATE,
    artOpen: { key: stop === 'lower' ? 'sea.shore-chart' : 'sea.margin', if: {
      any: PASSAGE_CASES.map(({ slug }) => ({ flag: passageDone(slug), eq: stop })),
    } },
  };
}

export const SHOAL_PROOF_LOWER = readingStop('lower', 15, 12, 'Halen’s low rail beside the plank path');
export const SHOAL_PROOF_UPPER = readingStop('upper', 20, 7, 'Clio’s shelf of reference leaves');
export const SHOAL_PROOF_READERS: MapDef['npcs'] = [
  { id: 'passage-halen', x: 15, y: 11, facing: 'down', visibleIf: PASSAGE_GATE },
  { id: 'passage-clio', x: 21, y: 7, facing: 'left', visibleIf: PASSAGE_GATE },
];

export const SHOAL_PROOF_SHELTER: MapDef = {
  id: 'sea.proof-shelter', name: 'Cartographers’ Sea: Shoal Shelf Reading Shelter', world: 'WORLD-09',
  width: 37, height: 26, music: 'music.archive', ambience: 'study', background: 0x293947,
  spawn: { x: 18, y: 23 }, blocks: [[1, 0, 35, 3]], zones: [], npcs: [],
  floor: (x, y) => {
    if (x < 1 || x > 35 || y < 0 || y > 25) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : x === 18 || y % 4 === 2 ? 'stone-c' : 'voices-slate';
  },
  stamps: [
    { stamp: 'bookshelf', x: 1, y: 3 }, { stamp: 'bookshelf', x: 32, y: 3 },
    { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 27, y: 1 },
    { stamp: 'bench', x: 2, y: 22 }, { stamp: 'bench', x: 31, y: 22 }, { stamp: 'rug-green', x: 16, y: 23 },
  ],
  interactables: [
    { id: 'sea-reading-shelter-return', kind: 'door', x: 18, y: 25, w: 1, h: 1, art: 'sea.waypost',
      label: 'the path out to Shoal Shelf', to: { map: 'sea.shoal', x: 20, y: 13 } },
    { id: 'sea-reading-shelter-note', kind: 'sign', x: 18, y: 22, w: 1, h: 1, art: 'sea.margin', walkThrough: true,
      label: 'the Reading Shelter route note',
      text: 'Read a museum record and open its stand’s two leaves. Take a strip to Halen at the low rail or a folio to Clio uphill. Set the guide in their rack. One keeper can use each copy.' },
    // C-023, X-006: how Yolŋu describe the petitions. Sources: National Museum of Australia, Yirrkala bark
    // petitions (Defining Moments); East Arnhem Regional Council, the fourth petition coming home (2023).
    { id: 'yirrkala-yolngu-account', kind: 'sign', x: 7, y: 21, w: 1, h: 1, art: 'preserved.folder', walkThrough: true,
      label: 'the Yolŋu account card', visibleIf: YIRRKALA_REFERRAL_OPEN,
      text: 'How the makers describe it. The petitions are called Näku Dhäruk: bark, and word or message. The National Museum of Australia says that for Yolŋu they were an offering between equal powers, not a plea to a higher one. Senior artists from the two clans most affected by mining painted the designs. In December 2023 one of the four petitions, kept until then in Derby in Western Australia, was returned to Yirrkala at the Buku-Larrŋgay Mulka Centre. A receipt in Canberra is one record. This is another.' },
    { id: 'yirrkala-referral-request', kind: 'scene', node: 'passage.yirrkala.referral.start', x: 12, y: 23, w: 1, h: 1,
      label: 'the teacher’s two-part request', art: 'preserved.slip', walkThrough: true,
      visibleIf: { all: [YIRRKALA_REFERRAL_OPEN, { not: { flagSet: YIRRKALA_REFERRAL_ROUTE } }] } },
    { id: 'yirrkala-referral-rail', kind: 'scene', node: 'passage.yirrkala.referral.rail', x: 24, y: 22, w: 1, h: 1,
      label: 'two dated locators at the walk-up rail', art: 'preserved.display-paired', walkThrough: true,
      visibleIf: { flag: YIRRKALA_REFERRAL_ROUTE, eq: 'rail' } },
    { id: 'yirrkala-referral-desk', kind: 'scene', node: 'passage.yirrkala.referral.desk', x: 30, y: 23, w: 1, h: 1,
      label: 'Clio’s reply by the east bench', art: 'preserved.folder', walkThrough: true,
      visibleIf: { flag: YIRRKALA_REFERRAL_ROUTE, eq: 'desk' } },
    ...PASSAGE_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + 6 * (index % 6);
      const y = 5 + 4 * Math.floor(index / 6);
      return [
        { id: `${PASSAGE_GROUP}-${record.slug}-exhibit`, kind: 'exhibit', x, y, w: 1, h: 1, exhibit: record.exhibit,
          art: record.art, walkThrough: true, label: `the public record for ${record.name}` },
        { id: `${PASSAGE_GROUP}-${record.slug}-stand`, kind: 'fieldgame', game: `${PASSAGE_GROUP}:${record.slug}`,
          x: x + 2, y, w: 1, h: 1, art: 'sea.margin', walkThrough: true, label: `the two-leaf stand for ${record.name}`,
          artOpen: { key: 'sea.shore-chart', if: { objective: record.objective } } },
      ];
    }),
  ],
  lights: [
    { x: 7, y: 6, r: 97, color: 0xf1d0a0 }, { x: 18, y: 7, r: 89, color: 0xbfe4de }, { x: 30, y: 7, r: 103, color: 0xaed0dc },
    { x: 7, y: 17, r: 92, color: 0xb6d0d1 }, { x: 18, y: 17, r: 88, color: 0xf9d6a7 }, { x: 30, y: 17, r: 102, color: 0xf3d3ad },
  ],
};
