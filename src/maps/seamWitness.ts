import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const coldReady: Condition = { objective: 'preserved.publish' };
const ruleOut: Condition = { flag: 'perspective.active', eq: 'edge-rule' };
const coldTools: Condition = { all: [coldReady, ruleOut] };
const coldCompared: Condition = { objective: 'seam.cold.compare' };
const brace: Condition = { flag: 'seam.cold.plan', eq: 'brace' };
const trace: Condition = { flag: 'seam.cold.plan', eq: 'trace' };
const seen: Condition = { objective: 'seam.stage.checked' };
const away: Condition = { all: [brace, { not: seen }] };

const stageReady: Condition = { all: [{ objective: 'stage.arrival' }, { objective: 'seam.cold.checked' }] };
const stageTools: Condition = { all: [stageReady, ruleOut, { card: 'card.seam.point' }, { not: seen }] };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node: `seam.${node}`, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function notice(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, walkThrough: true };
}

export const WORKROOM_SEAM: Interactable[] = [
  { id: 'cold-seam-garjjat', kind: 'exhibit', exhibit: 'OBJ-SEAM-GARJJAT', x: 6, y: 4, w: 1, h: 1,
    label: 'the two material records for Garjját', art: 'seam.case-textile', walkThrough: true, visibleIf: coldReady },
  {
    ...scene('cold-seam-jig', 'cold.jig', 6, 8, 'the backdrop jig and its fixed pegs', 'seam.hang-free',
      { all: [coldTools, { not: away }] }),
    artBy: { flag: 'seam.cold.face', keys: { free: 'seam.hang-free', support: 'seam.hang-support' } },
  },
  notice('cold-seam-away', 6, 8, 'the flat substitute in the jig', 'seam.paper',
    'The cloth is out on its support. A flat substitute keeps the two end marks visible during the loan. The theatre has the cloth’s support date.',
    away),
  {
    ...scene('cold-seam-marks', 'cold.witness-marks', 14, 6, 'the maker’s tab and the support record', 'seam.case-textile', coldTools),
    artOpen: { key: 'seam.rule', if: { flag: 'seam.cold.marks', eq: true } },
  },
  scene('cold-seam-pack', 'cold.pack', 18, 5, 'Pilar’s two packing racks', 'seam.rule',
    { all: [coldCompared, { not: { flagSet: 'seam.cold.plan' } }] }),
  scene('cold-seam-brace-receipt', 'cold.brace-receipt', 17, 11, 'the loan and return docket', 'seam.hang-support', brace),
  scene('cold-seam-trace-receipt', 'cold.trace-receipt', 6, 11, 'the carrier’s two traces and docket', 'seam.paper', trace),
  notice('cold-seam-play-reply', 12, 11, 'Hari’s reply from the stage wing', 'seam.hang-support',
    'Pilar logs the staged wide view. The gap stayed visible. The reply names what moved along the rail. The cloth is on its own workroom support again.',
    { flag: 'seam.stage.used', eq: 'play' }),
  notice('cold-seam-bench-reply', 12, 11, 'Hari’s reply from the low bench', 'seam.case-textile',
    'Pilar sets the close-view receipt beside the cloth. The next visitor can compare the blue ends and the later support here. Hari’s card records what was at the bench.',
    { flag: 'seam.stage.used', eq: 'bench' }),
];

type Mount = 'play' | 'bench';
const mount = (mode: Mount): Condition => ({ flag: 'seam.stage.mode', eq: mode });

function outcome(mode: Mount, x: number, y: number, label: string): Interactable[] {
  return ([
    ['brace', brace, 'seam.hang-support'],
    ['trace', trace, 'seam.paper'],
  ] as const).map(([form, condition, art]) =>
    scene(`stage-seam-${mode}-${form}`, `stage.${mode}-${form}`, x, y, label, art,
      { all: [mount(mode), condition, { not: seen }] }));
}

export const GALLERY_SEAM: Interactable[] = [
  { id: 'stage-seam-point', kind: 'exhibit', exhibit: 'OBJ-SEAM-NUUGAARSUK', x: 10, y: 5, w: 1, h: 1,
    label: 'the four prints from Pia Arke’s Nuugaarsuk', art: 'seam.case-photo', walkThrough: true, visibleIf: stageReady },
  {
    ...scene('stage-seam-near', 'stage.near', 6, 6, 'the areas by the near stand', 'seam.rule', stageTools),
    artOpen: { key: 'seam.hang-support', if: { all: [brace, { flag: 'seam.stage.near', eq: true }] } },
    artBy: { flag: 'seam.cold.plan', keys: { trace: 'seam.paper' } },
  },
  {
    ...scene('stage-seam-far', 'stage.far', 21, 10, 'the baffle beside the last row', 'seam.baffle', stageTools),
    artOpen: { key: 'seam.open-view', if: { flag: 'seam.stage.far', eq: true } },
  },
  scene('stage-seam-choose', 'stage.choose', 19, 14, 'Hari’s rail and low mounts', 'seam.rule',
    { all: [stageTools, { objective: 'seam.stage.compare' }, { not: { flagSet: 'seam.stage.mode' } }] }),
  ...outcome('play', 23, 9, 'the crew and its checked mount at the wing'),
  ...outcome('bench', 8, 15, 'the two ends laid near the low seat'),
  notice('stage-seam-play-reply', 23, 9, 'the signed wide view on the wing rail', 'seam.open-view',
    'The wide stage sheet leaves the space between the blue ends and gives the repair date at the wing. A viewer can compare this view to the cloth back at the Cold Store.',
    { all: [mount('play'), seen] }),
  notice('stage-seam-bench-reply', 8, 15, 'the signed close-view record', 'seam.case-photo',
    'The low bench retains the two edge marks and a note of what the visitor examined. Its source line leads back to the Cold Store cloth and the dated backing.',
    { all: [mount('bench'), seen] }),
];
