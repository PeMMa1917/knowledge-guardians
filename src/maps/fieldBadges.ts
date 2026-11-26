import { FIELD_INDEX, FIELD_WORK, fieldWorkReady } from '../content/fieldBadges';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const crossed = 'field-work.dry.crossed';
const set = (flag: string, eq: string | boolean = true): Condition => ({ flag, eq });

export const FERRY_FIELD_BADGES: Interactable[] = [
  { id: 'field-badge-dry-bench', kind: 'scene', node: 'field-work.dry', x: 4, y: 8, w: 1, h: 1, walkThrough: true,
    label: 'Tova’s old footboard', art: 'bridge-post', visibleIf: fieldWorkReady('dry') },
  { id: 'field-badge-dry-bridge', kind: 'door', x: 3, y: 8, w: 1, h: 1, walkThrough: true,
    label: 'the marked footboard to the receiving bag', art: 'departure.peg-marked',
    visibleIf: set(FIELD_WORK.dry.ready), flag: crossed, to: { map: 'aethelgard.ferry', x: 11, y: 10 } },
  { id: 'field-badge-dry-receipt', kind: 'sign', x: 11, y: 11, w: 1, h: 1, walkThrough: true,
    label: 'the dry receiving bag', art: 'departure.strip', visibleIf: set(crossed), flag: FIELD_WORK.dry.seen,
    text: 'A carrier walked the board with the bag. The bottom stayed dry. The wheeled tray still takes the old cart path.' },
];

export const NEXUS_FIELD_CUES: Interactable[] = [
  { id: 'field-badge-cue-rest', kind: 'scene', node: 'field-work.cue', x: 16, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'Ethren’s spare cue rest', art: 'board-stand', visibleIf: fieldWorkReady('cue') },
  { id: 'field-badge-cue-rail', kind: 'sign', x: 15, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the rail with raised cue marks', art: 'preserved.display-paired', visibleIf: set(FIELD_WORK.cue.ready, 'rail'),
    flag: FIELD_WORK.cue.seen,
    text: 'You can see each turn from the standing line. A carrier keeps both hands on the case and can still wait for the third mark.' },
  { id: 'field-badge-cue-bench', kind: 'sign', x: 18, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the bench pocket with both cue copies', art: 'preserved.display-records', visibleIf: set(FIELD_WORK.cue.ready, 'bench'),
    flag: FIELD_WORK.cue.seen,
    text: 'The bench lets a visitor read the early cue and the later pause at their own pace. They can try it once before moving to the line.' },
];

export const ANNEX_FIELD_INDEX: Interactable = {
  id: 'field-badge-docket-loan', kind: 'scene', node: 'field-work.docket', x: 6, y: 15, w: 1, h: 1, walkThrough: true,
  label: 'Brenna’s split receipt index', art: 'preserved.display-paired', visibleIf: fieldWorkReady('docket'),
};

const docketPlaced = set(FIELD_WORK.docket.seen);
const receiptSpot = { x: 29, y: 22, w: 1, h: 1, walkThrough: true };
export const EMBERFORD_FIELD_ORDER: Interactable[] = [
  { ...receiptSpot, id: 'field-badge-docket-return', kind: 'scene', node: 'field-work.docket.return',
    label: 'the loose order with one signature', art: 'preserved.folder',
    visibleIf: { all: [{ item: FIELD_INDEX }, { not: docketPlaced }] } },
  { ...receiptSpot, id: 'field-badge-docket-result', kind: 'sign', label: 'the checked split receipt',
    art: 'preserved.display-paired', visibleIf: docketPlaced,
    text: 'Sleeve delivered. The receiving mark stays on this line. Date still open. The empty second clip is ready for the exact dated record.' },
];
