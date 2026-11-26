import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';
import records from './ferry-window-specimens.json';

export const FERRY_WINDOW_OPEN: Condition = { flag: 'clue.oldmap.folded-map', eq: true };
export const WINDOW_SHUTTER = 'ferry-window.shutter';
export const WINDOW_LAST_RETURN = 'ferry-window.last-return';
export const WINDOW_KEEPER = 'ferry-window-nessa';
export const WINDOW_READER = 'ferry-window-merrit';
const CURRENT = 'ferry-window.current';
const PANEL = 'ferry-window.last-panel';
const INSTITUTION = 'The Metropolitan Museum of Art';
export const WINDOW_METHODS = ['hinge', 'edge'] as const;
type Method = typeof WINDOW_METHODS[number];
export const WINDOW_STOPS = ['eye', 'hinge', 'open', 'edge', 'handover'] as const;
type Stop = typeof WINDOW_STOPS[number];
type Stage = 'ready' | 'front' | 'opened' | Method;

export const FERRY_WINDOW_CASES = records.map((record) => ({
  ...record,
  flag: `ferry-window.${record.slug}`,
  exhibit: `OBJ-FERRY-WINDOW-${record.slug.toUpperCase()}`,
  source: `HIS-FERRY-WINDOW-${record.slug.toUpperCase()}`,
  card: `card.ferry-window.${record.slug}`,
  objective: `ferry-window.${record.slug}.mounted`,
  asset: `specimens/window-${record.slug}.jpg`,
  revisit: {
    map: 'aethelgard.emberford', prop: `ferry-window-ember-${record.slug}`,
    method: `Mark ${record.returnTag}.`,
    hint: 'Carry this working copy to the old sight board by the east road in Emberford.',
  },
}));
export type WindowCase = (typeof FERRY_WINDOW_CASES)[number];

export const windowEmpty: Condition = { any: [{ not: { flagSet: CURRENT } }, { flag: CURRENT, eq: 'empty' }] };
export const inWindow = (entry: WindowCase): Condition => ({ flag: CURRENT, eq: entry.slug });
export const windowMounted = (entry: WindowCase, method: Method): Condition => ({ flag: entry.objective, eq: method });
export const windowReturned = (entry: WindowCase): Condition => ({ flag: `${entry.flag}.used`, eq: true });
export const windowPanel = (placement: Method): Condition => ({ all: [windowEmpty, { flag: PANEL, eq: placement }] });
export const shutterOpen: Condition = { any: [
  windowPanel('hinge'),
  { all: [{ not: windowEmpty }, { flag: WINDOW_SHUTTER, eq: 'open' }] },
] };

const stageAt: Record<Stop, Stage[]> = {
  eye: ['ready'], hinge: ['front'], open: ['opened'], edge: ['front'], handover: ['hinge', 'edge'],
};

function atStage(entry: WindowCase, stage: Stage): Condition {
  return { all: [inWindow(entry), { flag: `${entry.flag}.stage`, eq: stage }] };
}

export function atWindow(stop: Stop): Condition {
  return { any: FERRY_WINDOW_CASES.flatMap((entry) => stageAt[stop].map((stage) => atStage(entry, stage))) };
}

const model: Record<string, { result: string; weave: Pick<Weave, 'aoks' | 'subjects' | 'concepts'> }> = {
  path: { result: 'The far peg marks the point where this model turns out of sight. A walker still needs to check beyond it.',
    weave: { aoks: ['ART', 'HUM', 'MAT'], subjects: ['film', 'geography', 'math-ai'], concepts: ['perspective', 'evidence', 'interpretation', 'explanation'] } },
  wall: { result: 'The upright and the opening have separate marks. Counting nearby gaps cannot tell a reader how far the wall runs.',
    weave: { aoks: ['ART', 'MAT'], subjects: ['design-tech', 'visual-arts', 'math-ai'], concepts: ['perspective', 'evidence', 'objectivity', 'certainty'] } },
  water: { result: 'The new line follows the visible water boundary. A separate empty slot leaves depth and flow for another check.',
    weave: { aoks: ['ART', 'HUM', 'NAT'], subjects: ['geography', 'physics', 'visual-arts'], concepts: ['evidence', 'justification', 'perspective', 'responsibility'] } },
  join: { result: 'Two strips meet at this line. The seams carry their own notes. One aligned picture does not give one common point of origin.',
    weave: { aoks: ['ART', 'NAT'], subjects: ['film', 'physics', 'visual-arts'], concepts: ['evidence', 'perspective', 'interpretation', 'truth'] } },
};

function scene(id: string, speaker: string, text: string): DialogueNode {
  return { id, speaker, text, historicalLabel: 'fictional-world' };
}

function caseScenes(entry: WindowCase): DialogueNode[] {
  const say = (suffix: string, text: string, speaker = WINDOW_KEEPER) => scene(`${entry.flag}.${suffix}`, speaker, text);
  return [
    { ...say('take', `You can name ${entry.anchor} on ${entry.accession}. We can try that kind of view on the model. It has a cargo screen because Merrit says my last drawing went straight through a stack of boxes.`),
      options: [{ text: 'Clip this working sheet to the model.', if: windowEmpty, effects: [
        { setFlag: CURRENT, value: entry.slug }, { setFlag: `${entry.flag}.stage`, value: 'ready' },
        { setFlag: WINDOW_SHUTTER, value: 'closed' },
      ] }, { text: 'Leave the sheet on its hook.' }] },
    { ...say('pause', 'Put the sheet back if another case needs a turn. You can start the view again from the eye notch.'),
      options: [{ text: 'Hang it back.', if: inWindow(entry), effects: [
        { setFlag: CURRENT, value: 'empty' }, { setFlag: `${entry.flag}.stage`, value: 'ready' },
        { setFlag: WINDOW_SHUTTER, value: 'closed' },
      ] }, { text: 'Keep the sheet at the model.' }] },
    say('front-result', `The eye notch lets you see ${entry.anchor}. The box screen hides ${entry.blocked} on the practice model. I’d like to be able to show exactly where our first view stopped.`),
    say('open-result', `The cleared line now reaches ${entry.blocked}. ${model[entry.kind].result}`),
    say('edge-result', `From the outside ledge you can see ${entry.blocked}. Sketch both standing marks beside their views. ${model[entry.kind].result}`, WINDOW_READER),
    say('hinge-readback', `The waiting carrier puts the case at the side of the model instead of against the movable screen. Merrit can reach ${entry.blocked} along the short viewing line. The note keeps the first blocked view and the change that opened it.`, WINDOW_READER),
    say('edge-readback', `The cargo screen stays in use. A carrier takes the outside ledge and checks ${entry.blocked} from the second standing mark. Both places fit on the working sheet even if the box stays where it is.`, WINDOW_READER),
    { ...say('ember', `I have an old drawing of the east road that calls a line “the view.” With ${entry.accession} beside the yard model, a learner can mark where an observer stood and show what that position made visible.`, WINDOW_READER),
      options: [{ text: entry.revisit.method, if: { all: [specimenEquipped(entry.key), { not: windowReturned(entry) }] }, effects: [
        { setFlag: `${entry.flag}.used`, value: true }, { setFlag: WINDOW_LAST_RETURN, value: entry.slug },
        { journal: `j.${entry.flag}.ember` },
      ], next: `${entry.flag}.ember-readback` }, { text: 'Leave the east road board as it is.' }] },
    say('ember-readback', entry.returnResult, WINDOW_READER),
  ];
}

const stops: Record<Stop, { text: string; action: string; next?: string; stage?: Stage }> = {
  eye: { text: 'Set the edge of your working sheet against the low eye notch. Two older boxes still stand in the line.',
    action: 'Sight from the low notch using', stage: 'front', next: 'front-result' },
  hinge: { text: 'The two boxes are lashed to one pivot. There is room to swing the pair into the open bay and hold it there.',
    action: 'Swing the screen aside for', stage: 'opened' },
  open: { text: 'The slot through the model is clear. Walk through to mark where the old screen cut the view.',
    action: 'Try the cleared line for', stage: 'hinge', next: 'open-result' },
  edge: { text: 'The outside ledge still gives a view past the stack. It takes a walk around the end, and leaves the boxes where they are.',
    action: 'Look back from the ledge with', stage: 'edge', next: 'edge-result' },
  handover: { text: 'Merrit needs a demonstration that a person standing here can repeat. The working sheet can keep the view and the way to reach it.', action: '' },
};

function atStop(stop: Stop): DialogueNode {
  const step = stops[stop];
  return {
    ...scene(`ferry-window.stop.${stop}`, stop === 'handover' ? WINDOW_READER : WINDOW_KEEPER, step.text),
    options: [
      ...FERRY_WINDOW_CASES.flatMap((entry) => stageAt[stop].map((stage) => {
        const method = stage === 'hinge' ? 'hinge' : 'edge';
        return {
          text: stop === 'handover' ? (method === 'hinge' ? `Keep the short viewing line for ${entry.anchor}.` : `Pin both positions for ${entry.anchor}.`) : `${step.action} ${entry.anchor}.`,
          if: atStage(entry, stage),
          effects: stop === 'handover' ? [
            { setFlag: entry.objective, value: method }, { setFlag: CURRENT, value: 'empty' },
            { setFlag: PANEL, value: method }, { journal: `j.${entry.flag}.${method}` },
          ] : [
            { setFlag: `${entry.flag}.stage`, value: step.stage ?? 'ready' },
            ...(stop === 'hinge' ? [{ setFlag: WINDOW_SHUTTER, value: 'open' }] : []),
          ],
          next: stop === 'handover' ? `${entry.flag}.${method}-readback` : step.next ? `${entry.flag}.${step.next}` : 'ferry-window.moved',
        };
      })),
      { text: 'Leave this station for now.' },
    ],
  };
}

const objectives: Objective[] = FERRY_WINDOW_CASES.map((entry) => ({
  id: entry.objective, title: `Fit a repeatable view beside ${entry.accession}.`, visible: { card: entry.card }, essential: false,
  done: { all: [{ card: entry.card }, { any: WINDOW_METHODS.map((method) => windowMounted(entry, method)) }] },
  weave: { ...model[entry.kind].weave, framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    atl: ['thinking', 'research', 'social', 'communication'], thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 5 },
}));

function museumObservation(entry: WindowCase): string {
  return `${entry.maker}. ${entry.medium}. ${entry.alt}`;
}

export const ferryWindowContent = {
  characters: [
    { id: WINDOW_KEEPER, name: 'Nessa Lent', role: 'Keeper of the ferry teaching model', sprite: 'villager-2', mode: 'fictional',
      talk: [{ node: 'ferry-window.nessa' }] },
    { id: WINDOW_READER, name: 'Merrit Dole', role: 'Ferry apprentice learning the two approaches', sprite: 'villager-1', mode: 'fictional',
      talk: [{ node: 'ferry-window.merrit' }] },
  ],
  dialogue: [
    scene('ferry-window.nessa', WINDOW_KEEPER, 'After the boxes moved, the town crew and the boat crew followed the same drawing to two dead ends. I’m growing fond of the mistakes we can move by hand. Try a working sheet on my little model first.'),
    scene('ferry-window.merrit', WINDOW_READER, 'I found a short way to bring the chest in. The chest found a short way to stay right in my view. Leave me a view I can repeat while somebody else handles the rope.'),
    scene('ferry-window.moved', WINDOW_KEEPER, 'The boxes swung into the bay and the passage through their old position opened. Use the far slot to take the new view from the marked side.'),
    ...FERRY_WINDOW_CASES.flatMap(caseScenes), ...WINDOW_STOPS.map(atStop),
  ],
  sources: FERRY_WINDOW_CASES.map((entry) => ({
    id: entry.source, title: `${INSTITUTION}, ${entry.accession}`, url: entry.url, accessed: '2026-11-26',
    locator: 'Exact photographic object, medium, date, maker credit and open-access image', supports: museumObservation(entry),
  })),
  exhibits: FERRY_WINDOW_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, historicalLabel: 'documented', art: 'collection-stand', dateText: entry.date,
    dateKind: entry.dateKind, summary: museumObservation(entry), altText: entry.alt,
    sources: [entry.source], grantsCard: entry.card,
    specimen: { key: entry.key, institution: INSTITUTION, accession: entry.accession, source: entry.source,
      objective: entry.objective, pixelAsset: entry.asset, revisit: entry.revisit },
  })),
  cards: FERRY_WINDOW_CASES.map((entry) => ({
    id: entry.card, title: entry.title, claimKind: 'observation', historicalLabel: 'documented', text: museumObservation(entry),
    limits: entry.limit, sources: [entry.source],
  })),
  missions: [{ id: 'KG-CH01-R31', world: 'WORLD-02', title: 'The View from the Rope', available: FERRY_WINDOW_OPEN,
    objectives, caseVisits: objectives.map(({ id }) => [id]), knowledgeQuestion: 'Can the next observer stand where you did and see the same feature?',
    stake: 'The ferry’s apprentice needs a repeatable viewpoint while the porters need space for their luggage.',
  }],
  hints: FERRY_WINDOW_CASES.flatMap((entry) => [
    'Find a feature that this view can show, then notice what its edge leaves out.',
    `Open ${entry.accession} and carry the working sheet to the low eye notch.`,
    'Either swing the box screen aside and use the bright far slot, or keep the screen and try the ledge around it.',
    'Give Merrit the checked view, claim the earned copy at the case, and equip it for the east road board in Emberford.',
  ].map((text, index) => ({ id: `h.${entry.flag}.${index + 1}`, objective: entry.objective, depth: (index + 1) as Hint['depth'], text }))),
  journal: FERRY_WINDOW_CASES.flatMap((entry) => [
    { id: `j.${entry.flag}.hinge`, claimKind: 'observation' as const,
      text: `I swung the model’s cargo screen aside, found ${entry.blocked} through the clear line and put the photograph’s reference beside the view.` },
    { id: `j.${entry.flag}.edge`, claimKind: 'observation' as const,
      text: `I left the cargo screen in place, used the outside ledge and pinned two positions for ${entry.accession}.` },
    { id: `j.${entry.flag}.ember`, claimKind: 'observation' as const,
      text: `I equipped the working copy for ${entry.accession} at Emberford. ${entry.returnResult}` },
  ]),
} satisfies Partial<ContentPack>;
