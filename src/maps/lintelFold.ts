import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const coldReady: Condition = { objective: 'preserved.publish' };
const activeFold: Condition = { flag: 'perspective.active', eq: 'lintel-fold' };
const coldTools: Condition = { all: [coldReady, activeFold] };
const voicesReady: Condition = { all: [{ objective: 'voices.arrival' }, { objective: 'lintel.cold.checked' }] };
const voicesTools: Condition = { all: [voicesReady, activeFold, { card: 'card.lintel.temple' }] };
const publicRoute: Condition = { flag: 'lintel.voices.route', eq: 'public' };
const publicChecked: Condition = { flag: 'lintel.voices.public-check', eq: true };
const publicCrossed: Condition = { flag: 'lintel.voices.public-cross', eq: true };
export const MAT_READY_AT_PUBLIC_DOOR: Condition = { all: [publicRoute, publicChecked, { not: publicCrossed }] };
const escortRoute: Condition = { flag: 'lintel.voices.route', eq: 'escort' };
const escortCrossed: Condition = { flag: 'lintel.voices.escort-cross', eq: true };
const signedMatSlip: Condition = { flag: 'lintel.voices.permit', eq: 'mat-with-eren' };
const delivered: Condition = { objective: 'lintel.voices.checked' };
const servicePassage: Condition = { all: [escortRoute, signedMatSlip, { not: delivered }] };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node: `lintel.${node}`, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function notice(id: string, x: number, y: number, label: string, text: string, visibleIf: Condition): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art: 'lintel.fold', text, visibleIf, walkThrough: true };
}

export const COLD_LINTEL: Interactable[] = [
  { id: 'cold-lintel-sejarah', kind: 'exhibit', exhibit: 'OBJ-LINTEL-SEJARAH', x: 11, y: 4, w: 1, h: 1,
    label: 'the 1898 Sejarah Malayu case and edition record', art: 'lintel.case-page', walkThrough: true, visibleIf: coldReady },
  {
    ...scene('cold-lintel-turn', 'cold.fold', 8, 7, 'Pilar’s turning rail for the two written forms', 'lintel.fold', coldTools),
    artBy: { flag: 'lintel.cold.face', keys: { stairs: 'lintel.stairs', ramp: 'lintel.ramp' } },
  },
  scene('cold-lintel-layout', 'cold.set', 10, 9, 'Pilar’s clips for a new layout', 'lintel.fold',
    { all: [{ objective: 'lintel.cold.compare' }, { not: { flagSet: 'lintel.cold.place' } }] }),
  {
    ...scene('cold-lintel-pair', 'cold.result-pair', 3, 10, 'both sets of letters at the low bench', 'lintel.case-page',
      { flag: 'lintel.cold.place', eq: 'pair' }),
    artOpen: { key: 'lintel.ramp', if: { flag: 'lintel.cold.receipt', eq: 'pair' } },
  },
  {
    ...scene('cold-lintel-guide', 'cold.result-guide', 15, 10, 'the reader’s copy and waiting cart', 'lintel.case-page',
      { flag: 'lintel.cold.place', eq: 'guide' }),
    artOpen: { key: 'lintel.stairs', if: { flag: 'lintel.cold.receipt', eq: 'guide' } },
  },
  notice('cold-lintel-reply-public', 6, 11, 'the reply from the public bench',
    'Glass Walk, dry mat received through the public door. Eren’s desk stayed open. Pilar sets the receipt beside the direction. The next visitor can still use the same public route.',
    { flag: 'lintel.voices.done', eq: 'public' }),
  notice('cold-lintel-reply-escort', 6, 11, 'the returned service slip',
    'Glass Walk, dry mat received from Eren’s escorted carry. Pilar keeps the checked job and its return date on one line. The public directions still lead to the bench. Ask Eren for a new slip if a new job needs the service door.',
    { flag: 'lintel.voices.done', eq: 'escort' }),
];

export const WALK_LINTEL: Interactable[] = [
  { id: 'walk-lintel-temple', kind: 'exhibit', exhibit: 'OBJ-LINTEL-MARIAMMAN', x: 7, y: 4, w: 1, h: 1,
    label: 'the South Bridge Road temple’s architectural and stewardship records', art: 'lintel.case-building',
    walkThrough: true, visibleIf: voicesReady },
  {
    ...scene('walk-lintel-board', 'voices.board', 14, 10, 'the way to the public bench', 'lintel.fold', voicesTools),
    artOpen: { key: 'lintel.ramp', if: { flag: 'lintel.voices.public-read', eq: true } },
  },
  {
    ...scene('walk-lintel-rack', 'voices.offer', 22, 12, 'Wren’s signed instructions and Eren’s empty slot', 'lintel.fold', voicesTools),
    artOpen: { key: 'lintel.stairs', if: { flag: 'lintel.voices.authority-read', eq: true } },
  },
  scene('walk-lintel-choose', 'voices.choose', 13, 7, 'Eren’s mat and two handover pockets', 'lintel.fold',
    { all: [voicesTools, { objective: 'lintel.voices.compare' }, { not: { flagSet: 'lintel.voices.route' } }] }),
  scene('walk-lintel-turn', 'voices.west-turn', 10, 14, 'the mat at the public stairs', 'lintel.ramp', publicRoute),
  {
    id: 'walk-lintel-service', kind: 'door', x: 22, y: 13, w: 1, h: 1,
    label: 'the workers’ service door', art: 'lintel.door', walkThrough: true,
    visibleIf: voicesReady, openIf: servicePassage, flag: 'lintel.voices.escort-cross',
    artOpen: { key: 'lintel.door.open', if: servicePassage },
    to: { map: 'voices.listening', x: 23, y: 12 },
    text: 'The service door takes a signed carry slip from Eren and a steward at the other end of the mat. The public west passage leads to the bench.',
  },
];

export const LISTENING_LINTEL: Interactable[] = [
  {
    ...scene('listening-lintel-public', 'voices.public-check', 14, 11, 'the reader with the mat at the public bench', 'lintel.ramp',
      { all: [publicRoute, publicCrossed] }),
    artOpen: { key: 'lintel.case-page', if: delivered },
  },
  {
    ...scene('listening-lintel-escort', 'voices.escort-check', 24, 11, 'Eren and the mat at the far bench', 'lintel.stairs',
      { all: [escortRoute, signedMatSlip, escortCrossed] }),
    artOpen: { key: 'lintel.case-page', if: delivered },
  },
];
