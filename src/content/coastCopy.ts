import type { Condition, ContentPack, Hint } from '../domain/types';
import { specimenEquipped, specimenItemId } from '../domain/specimenGear';
import { KUNIT_KEY, TURNING_OBJECTIVE } from './turningTable';

export const COAST_COPY_DESK = 'coast-copy-desk';
export const COAST_COPY_READER = 'coast-copy-reader';
export const COAST_COPY_POCKET = 'coast-copy-pocket';
export const COAST_COPY_OBJECTIVE = 'coast-copy.delivered';
export const coastCopyFlag = (key: string) => `coast-copy.${key}`;
export const coastCopyIs = (key: string, value: string | boolean = true): Condition => ({ flag: coastCopyFlag(key), eq: value });
export const coastCopyReady: Condition = { all: [
  { objective: 'voices.arrival' }, { objective: TURNING_OBJECTIVE }, { item: specimenItemId(KUNIT_KEY) },
] };
export const coastCopyAvailable: Condition = { all: [
  coastCopyReady, { any: [specimenEquipped(KUNIT_KEY), coastCopyIs('started')] },
] };
export const coastCopyCompared: Condition = { all: [coastCopyIs('rubbing'), coastCopyIs('account')] };

export const coastCopyLayouts = {
  sleeve: {
    action: 'Fit both leaves into a larger sleeve.',
    benefit: 'The next reader can compare the pieces at the bench in one visit.',
    receipt: 'Eren lifts both leaves at the bench and finds the shape and Kunit’s reported explanation together. A remote reading request waits for the sleeve to come back.',
  },
  pockets: {
    action: 'File the leaves in two places with a shared tab number.',
    benefit: 'One person can handle the shape while another requests the account.',
    receipt: 'A bench visitor uses the rubbing while a courier takes the indexed account to a reader elsewhere. Eren checks that both tabs point to BR-17. To compare the two, ask for the other leaf by that number.',
  },
} as const;
export type CoastCopyLayout = keyof typeof coastCopyLayouts;
export const coastCopyAccepted: Condition = { any: (Object.keys(coastCopyLayouts) as CoastCopyLayout[]).map((layout) => ({ all: [
  coastCopyIs('layout', layout), coastCopyIs('received', layout),
  ...(layout === 'pockets' ? [coastCopyIs('bench-tab')] : []),
] })) };

export const coastCopyContent = {
  missions: [{
    id: 'KG-CH13-R19', title: 'The Other Half of the Copy', world: 'WORLD-14', available: coastCopyReady,
    stake: 'A single-leaf sleeve can carry a contour or a reported explanation. Eren needs a later reader to be able to find both.',
    knowledgeQuestion: 'What travels when a shape is copied, and whose explanation can a later reader trace?',
    caseVisits: [[COAST_COPY_OBJECTIVE]],
    objectives: [{
      id: COAST_COPY_OBJECTIVE, title: 'Check what reaches Glass Walk, then leave a copy that lets a reader trace both leaves.',
      essential: false, visible: coastCopyReady,
      done: { all: [coastCopyAvailable, coastCopyCompared, coastCopyAccepted, { any: ['rubbing', 'account']
        .map((leaf) => ({ all: [coastCopyIs('trial', leaf), coastCopyIs('gap', leaf)] })) }] },
      onComplete: [{ journal: 'j.coast-copy.receipt' }],
      weave: {
        concepts: ['evidence', 'interpretation', 'perspective', 'responsibility', 'power'],
        framework: ['methods-and-tools', 'perspectives', 'scope', 'ethics'],
        atl: ['research', 'communication', 'thinking'], aoks: ['HIS', 'ART'],
        subjects: ['history', 'design-tech', 'lang-langlit'],
        thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' }, minutes: 6,
      },
    }],
  }],
  journal: [{
    id: 'j.coast-copy.receipt', claimKind: 'observation',
    text: 'A test sleeve carried one leaf to Glass Walk. I found the missing part and sent both with traceable tabs. I kept Kunit as maker and the person who explained the piece, with Holm named as the writer of the published report.',
  }],
  hints: [
    'See what survives the trip from Wren’s table to Eren’s bench.',
    'Use Kunit’s earned working copy at the Listening Room’s rubbing table. Try the relief and the separate account leaf.',
    'Send one leaf in the test sleeve. Read it at the copy bench on Glass Walk. Notice what the second reader cannot follow.',
    'Return to the rubbing table and pair both leaves in a sleeve or link two filing pockets under BR-17. Check the bench again. For linked pockets, follow BR-17 to the courier pocket farther along the walk.',
  ].map((text, index) => ({ id: `h.coast-copy.${index + 1}`, objective: COAST_COPY_OBJECTIVE, depth: (index + 1) as Hint['depth'], text })),
} satisfies Partial<ContentPack>;
