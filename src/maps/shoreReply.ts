import {
  PIER_STOPS, SHORE_REPLY_CASES, SHORE_REPLY_GATE, SHORE_REPLY_ROOM, SHORE_STEPS,
  shoreDelivered, shoreEquipped, shoreOpen, shoreReceipt, shoreSeen, shoreSet,
} from '../content/shoreReply';
import type { Interactable, MapDef } from './types';

export const SHORE_REPLY_DOOR: Interactable = {
  id: 'shore-reply-door', kind: 'door', x: 22, y: 14, w: 1, h: 1, art: 'sea.waypost',
  label: 'the boardwalk to the signal shed', visibleIf: SHORE_REPLY_GATE,
  to: { map: SHORE_REPLY_ROOM, x: 20, y: 28 },
};

const equipment = {
  chart: { first: 'the outgoing chart stand', second: 'the independent footmark', firstArt: 'chart', secondArt: 'chart-linked' },
  signal: { first: 'the sending window', second: 'the receiving window', firstArt: 'signal', secondArt: 'signal-linked' },
  ledger: { first: 'the issue tray', second: 'the receiver’s intake', firstArt: 'ledger', secondArt: 'ledger-linked' },
};

const cases = SHORE_REPLY_CASES.flatMap((entry, n): Interactable[] => {
  const x = 4 + n % 6 * 6;
  const y = 4 + Math.floor(n / 6) * 4;
  const id = `shore-reply-${entry.slug}`;
  const instruments = equipment[entry.family as keyof typeof equipment];
  return [{
    id: `${id}-case`, kind: 'exhibit', exhibit: entry.exhibit, x, y, w: 1, h: 1, art: entry.art, label: entry.title,
  }, ...SHORE_STEPS.flatMap((step): Interactable[] => {
    const first = step === 'first';
    const instrumentX = first ? x + 1 : entry.family === 'ledger' ? x - 1 : x + 2;
    const instrumentY = first ? y : entry.family === 'signal' ? y + 1 : y + 2;
    return [{
      id: `${id}-${step}`, kind: 'scene', node: `${entry.flag}.${step}`,
      x: instrumentX, y: instrumentY, w: 1, h: 1, walkThrough: true,
      label: `${instruments[step]} for ${entry.accession}`, art: `shore-reply.${instruments.firstArt}`,
      artOpen: { key: `shore-reply.${instruments.secondArt}`, if: shoreSet(entry, step) },
      visibleIf: first ? shoreOpen(entry) : { all: [shoreOpen(entry), shoreSeen(entry, 'first')] },
    }, {
      id: `${id}-${step}-view`, kind: 'sign', x: first ? x + 1 : x - 1,
      y: first ? y + 2 : y + 1, w: 1, h: 1, walkThrough: true,
      label: `the ${first ? 'first sight' : 'returned reading'} for ${entry.accession}`,
      art: `shore-reply.${instruments.secondArt}`,
      flag: `${entry.flag}.${step}.seen`, visibleIf: shoreSet(entry, step), sfx: 'sfx.sparkle',
      text: first ? entry.firstView : entry.secondView,
    }];
  })];
});

export const SHORE_REPLY_RETURNS = SHORE_REPLY_CASES.flatMap((entry): Interactable[] => [{
  id: entry.returnProp, kind: 'scene', node: `${entry.flag}.return`, x: 20, y: 14, w: 1, h: 1,
  label: `Anwen’s working cabinet for ${entry.accession}`, art: entry.art, visibleIf: shoreEquipped(entry), walkThrough: true,
}, ...PIER_STOPS.map((stop): Interactable => ({
  id: `shore-reply-${entry.slug}-${stop}`, kind: 'sign',
  x: stop === 'high' ? 23 : 20, y: stop === 'high' ? 15 : 16, w: 1, h: 1, walkThrough: true,
  label: stop === 'high' ? `the lookout’s posted use of ${entry.accession}` : `the lower pier’s reply for ${entry.accession}`,
  art: stop === 'high' ? 'shore-reply.high' : 'shore-reply.low',
  visibleIf: shoreDelivered(entry, stop), flag: `${entry.flag}.landed`, sfx: 'sfx.sparkle',
  text: shoreReceipt(entry, stop),
}))]);

const width = 39;
const height = 30;
export const SHORE_REPLY_SHED: MapDef = {
  id: SHORE_REPLY_ROOM, world: 'WORLD-09', name: 'Cartographers’ Sea: The Signal Shed',
  width, height, background: 0x2b4350, music: 'music.archive', ambience: 'study', spawn: { x: 20, y: 28 },
  floor: (x, y) => {
    if (x < 1 || x >= width - 1 || y < 0 || y >= height) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    if (x === 19 || x === 20 || y === 27) return 'stone-b';
    return y % 4 === 3 ? 'stone-c' : 'voices-slate';
  },
  blocks: [[1, 0, width - 2, 3]], zones: [],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 32, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 35, y: 2 },
    { stamp: 'bench', x: 3, y: 27 }, { stamp: 'bench', x: 32, y: 27 }, { stamp: 'rug-green', x: 18, y: 27 },
  ],
  lights: [
    { x: 5, y: 6, r: 75, color: 0xf7d6a0 }, { x: 28, y: 7, r: 100, color: 0xacd8d9 },
    { x: 8, y: 13, r: 63, color: 0xb0d6cc }, { x: 31, y: 15, r: 66, color: 0xe4b8a1 },
    { x: 7, y: 23, r: 83, color: 0xdae1c2 }, { x: 22, y: 25, r: 72, color: 0xf1d8ad },
  ],
  npcs: [
    { id: 'shore-reply-velna', x: 16, y: 27, facing: 'down' },
    { id: 'shore-reply-miri', x: 25, y: 27, facing: 'left' },
  ],
  interactables: [...cases, {
    id: 'shore-reply-exit', kind: 'door', x: 20, y: 29, w: 1, h: 1, art: 'sea.waypost',
    label: 'the boardwalk to Shoal Shelf', to: { map: 'sea.shoal', x: 21, y: 14 },
  }],
};
