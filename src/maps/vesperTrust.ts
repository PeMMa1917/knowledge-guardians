import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const prefix = 'vesper.line.';
const coastReady: Condition = { objective: 'coast.revise' };
const quayReady: Condition = { objective: 'voices.finish' };
const started: Condition = { flag: prefix + 'begun', eq: true };
const coastDone: Condition = { objective: prefix + 'coast.done' };
const seen: Condition = { flag: prefix + 'seen', eq: true };
const admitted: Condition = { flagSet: prefix + 'basis' };
const agreed: Condition = { flagSet: prefix + 'edition' };
const mounted: Condition = { flag: prefix + 'mounted', eq: true };
const done: Condition = { objective: prefix + 'quay.done' };
const coastMode = (mode: string): Condition => ({ flag: prefix + 'coast', eq: mode });
const edition = (mode: string): Condition => ({ flag: prefix + 'edition', eq: mode });

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition, node = id): Interactable {
  return { id: `vesper-line-${id}`, kind: 'scene', node: prefix + node, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

export const COAST_VESPER_TRUST: Interactable[] = [
  scene('coast-open', 5, 11, 'the notice board along the Headland’s lower turn', 'vesper-line.old-notice', { all: [coastReady, { not: started }] }, 'coast.open'),
  scene('coast-order', 8, 12, 'the order received at the upper desk', 'vesper-line.order', started, 'coast.order'),
  scene('coast-witness', 15, 12, 'Tavia beside the sealed copy slot', 'vesper-line.slot', started, 'coast.witness'),
  scene('coast-choice', 12, 11, 'Vesper’s reply against the two checks', 'vesper-line.letter',
    { all: [{ objective: prefix + 'coast.checked' }, { not: { flagSet: prefix + 'coast' } }] }, 'coast.choice'),
  ...([
    ['signed', 5, 11, 'the corrected notice on the original board', 'vesper-line.signed'],
    ['walked', 7, 13, 'the low turn with a new arrow and a shift slate', 'vesper-line.waiting'],
  ] as const).flatMap(([mode, x, y, label, art]) => [
    scene(`coast-mount-${mode}`, x, y, label, 'vesper-line.letter', { all: [coastMode(mode), { not: coastDone }] }, `coast.mount.${mode}`),
    scene(`coast-kept-${mode}`, x, y, label, art, { all: [coastMode(mode), coastDone] }, `coast.kept.${mode}`),
  ]),
];

export const QUAY_VESPER_TRUST: Interactable[] = [
  scene('quay-open', 20, 12, 'the old OPEN card on the rail', 'vesper-line.old-notice', { all: [quayReady, { not: seen }] }, 'quay.open'),
  scene('quay-copy', 26, 10, 'the printer’s counterfoil from the same sheet', 'vesper-line.order', seen, 'quay.copy'),
  scene('quay-latch', 27, 13, 'the closed rail and the afternoon handover book', 'vesper-line.slot', seen, 'quay.latch'),
  scene('quay-keeper', 28, 9, 'Wren’s case for checking access slips', 'vesper-line.letter', { all: [seen, { not: admitted }] }, 'quay.keeper'),
  { id: 'vesper-line-proof-door', kind: 'door', x: 28, y: 11, w: 1, h: 1, label: 'the door to the Proof Room',
    art: 'preserved.door', to: { map: 'voices.proof-room', x: 8, y: 11 }, visibleIf: quayReady, openIf: admitted,
    artOpen: { key: 'vesper-line.open-door', if: admitted },
    text: 'Wren keeps the Proof Room closed while the rail’s notice is disputed. Take a checked slip to Wren’s case above the door.' },
  ...([
    ['print', 9, 12, 'the replacement notice on the incoming rail', 'vesper-line.signed', 'vesper-line.returned'],
    ['cover', 24, 13, 'the handover at the former dead end', 'vesper-line.vesper', 'vesper-line.waiting'],
  ] as const).flatMap(([mode, x, y, label, art, keptArt]) => [
    scene(`quay-use-${mode}`, x, y, label, art, { all: [edition(mode), mounted, { not: done }] }, `quay.use.${mode}`),
    scene(`quay-kept-${mode}`, x, y, label, keptArt, { all: [edition(mode), done] }, `quay.kept.${mode}`),
  ]),
];

export const VESPER_PROOF_ROOM: MapDef = {
  id: 'voices.proof-room', name: 'Archive of Voices: Proof Room', world: 'WORLD-14',
  width: 18, height: 14, background: 0x3c364d, music: 'music.archive', ambience: 'study',
  floor: (x, y) => {
    if (x < 1 || x > 16 || y < 0 || y >= 14) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x >= 7 && x <= 11 && y >= 7 ? 'voices-inlay' : 'voices-slate';
  },
  blocks: [[1, 0, 16, 3]], zones: [], npcs: [], spawn: { x: 8, y: 11 },
  stamps: [
    { stamp: 'window', x: 8, y: 1 }, { stamp: 'voices-cabinet', x: 3, y: 3 },
    { stamp: 'voices-screen', x: 13, y: 4 }, { stamp: 'voices-bench', x: 3, y: 10 },
    { stamp: 'plant-tall', x: 15, y: 10 },
  ],
  interactables: [
    { id: 'vesper-line-proof-return', kind: 'door', x: 8, y: 13, w: 1, h: 1, label: 'the passage back to Lamp Quay',
      art: 'preserved.door', to: { map: 'voices.quay', x: 28, y: 12 } },
    scene('proof-plain', 6, 7, 'the uncut lines of the original type proof', 'vesper-line.order', admitted, 'proof.plain'),
    scene('proof-vesper', 11, 7, 'Vesper at the proof table', 'vesper-line.vesper', { all: [admitted, { not: agreed }] }, 'proof.vesper'),
    scene('proof-worker', 5, 9, 'Tavia and two later copies', 'vesper-line.slot', admitted, 'proof.worker'),
    ...(['print', 'cover'] as const).flatMap((mode) => [
      scene(`proof-mount-${mode}`, 11, 7, 'Vesper and the tray for the checked slips', 'vesper-line.vesper',
        { all: [edition(mode), { not: mounted }] }, `proof.mount.${mode}`),
      scene(`proof-kept-${mode}`, 11, 7, 'the signed working proof left on the table', 'vesper-line.order',
        { all: [edition(mode), mounted] }, `proof.kept.${mode}`),
    ]),
  ],
  lights: [
    { x: 8, y: 5, r: 65, color: 0xabbdc6 }, { x: 11, y: 7, r: 65, color: 0xf0c991 },
    { x: 5, y: 9, r: 51, color: 0xe0a9a6 },
  ],
};
