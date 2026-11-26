import { CALLBOARD_LAYOUTS, type CallboardLayout } from '../domain/callboard';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective } from '../domain/types';
import { DATE_REGISTER_CASES } from './dateRegisterCases';
import objects from './callboard-specimens.json';

export const CALLBOARD_GROUP = 'callboard';
export const CALLBOARD_OPEN: Condition = { objective: 'civic.finish' };
export const CALLBOARD_FOLIO: Condition = { any: DATE_REGISTER_CASES.map(({ civicObjective, item }) => ({ all: [{ objective: civicObjective }, { item }] })) };
export const CALLBOARD_SHORT: Condition = { flag: 'callboard.shortcut', eq: true };
export const QUETZALECATZIN = 'loc:g4701g.ct009133';
export const GAGE = 'wam:03106';
export const GAGE_ART = 'callboard.gage-mount';

const RETURN_LOC = { map: 'sea.chartroom', prop: 'callboard-return-claims', method: 'Separate genealogy from a current land claim',
  hint: 'Bring the Codex to the paired lines at Lantern House. Check the ancestor line and the public claim before clipping the guide.' };
const RETURN_GAGE = { map: 'metalworks.records', prop: 'callboard-return-maker', method: 'Keep the name on the inscription separate from the maker',
  hint: 'Bring the mounted iron to the Metalworks name clips. Check the inscribed role and the later custody record separately.' };
const RETURN_VIEW = { map: 'sea.chartroom', prop: 'callboard-return-view', method: 'Check what an inlet image shows and what its record supports',
  hint: 'Bring the piece to the spare evidence clip at Lantern House. Use both sources before mounting the worded line.' };

export const CALLBOARD_CASES = objects.map((item) => {
  const flag = `callboard.${item.slug}`;
  const revisit = item.key === QUETZALECATZIN ? RETURN_LOC : item.key === GAGE ? RETURN_GAGE : RETURN_VIEW;
  return {
    ...item, flag, revisit,
    source: `HIS-CALL-${item.slug}`, artifact: `OBJ-CALL-${item.slug}`, card: `card.${flag}`, item: `item.${flag}.print`,
    objective: `${flag}.read`, nodes: { check: `${flag}.check`, first: `${flag}.first`, second: `${flag}.second`, return: `${flag}.return` },
  };
});
export type CallboardCase = (typeof CALLBOARD_CASES)[number];
export type CallboardStation = CallboardCase | 'first' | 'second' | 'claims' | 'maker' | 'return-view';
export const callboardState = (flag: string, value: string | boolean = true): Condition => ({ flag, eq: value });
const write = (setFlag: string, value: string | boolean = true): Effect => ({ setFlag, value });

export function callboardStation(id: string): CallboardStation | undefined {
  if (id === 'first' || id === 'second' || id === 'claims' || id === 'maker' || id === 'return-view') return id;
  return CALLBOARD_CASES.find(({ slug }) => slug === id);
}

export function callboardReturnCases(station: 'claims' | 'maker' | 'return-view'): CallboardCase[] {
  const prop = station === 'return-view' ? RETURN_VIEW.prop : `callboard-return-${station}`;
  return CALLBOARD_CASES.filter(({ revisit }) => revisit.prop === prop);
}

export function callboardEntries(game: string): string[] {
  const prefix = `${CALLBOARD_GROUP}:`;
  if (!game.startsWith(prefix)) return [];
  const station = callboardStation(game.slice(prefix.length));
  if (!station) return [];
  if (station === 'first' || station === 'second') return CALLBOARD_CASES.map(({ nodes }) => nodes[station]);
  if (typeof station === 'string') return callboardReturnCases(station).map(({ nodes }) => nodes.return);
  return [station.nodes.check];
}

const routeHeld = (c: CallboardCase, eq: CallboardLayout): Condition => callboardState(`${c.flag}.layout`, eq);
const checked = (c: CallboardCase, face: string): Condition => callboardState(`${c.flag}.checked.${face}`);

function caseNodes(c: CallboardCase): DialogueNode[] {
  const { flag, nodes, card, item } = c;
  const proof: Condition = { all: [{ card }, checked(c, 'view'), checked(c, 'record'), { not: { flagSet: `${flag}.layout` } }] };
  const waiting: Condition = { all: [{ item }, { not: { objective: c.objective } }] };
  const returned: Condition = { all: [specimenEquipped(c.key), { not: callboardState(`${flag}.returned`) }] };
  const loc = c.key === QUETZALECATZIN;
  const gage = c.key === GAGE;
  return [
    { id: nodes.check, speaker: 'narrator', historicalLabel: 'fictional-world', text: 'Keep both parts of the guide with the object number.', options: [
      { text: 'Place the visible detail on the guide.', if: { card }, effects: [write(`${flag}.checked.view`), write(`${flag}.face`, 'view')] },
      { text: 'Clip the catalogue evidence beside it.', if: { card }, effects: [write(`${flag}.checked.record`), write(`${flag}.face`, 'record')] },
      ...CALLBOARD_LAYOUTS.map((route) => ({
        text: route === 'bench' ? 'Send both parts to the first bench.' : 'Run a picture call and a later source call.',
        if: proof, effects: [write(`${flag}.layout`, route), { giveItem: item } as Effect],
      })),
    ] },
    { id: nodes.first, speaker: 'callboard-reader', historicalLabel: 'fictional-world', text: 'The first call goes ahead. Let me see what you have left on the bench.', options: [
      { text: 'Open the account and the view together.', if: { all: [waiting, routeHeld(c, 'bench')] }, effects: [write(`${flag}.heard`, 'bench')] },
      { text: 'Show the view and book the source stop.', if: { all: [waiting, routeHeld(c, 'separate'), { not: callboardState(`${flag}.first`) }] },
        effects: [write(`${flag}.first`)] },
    ] },
    { id: nodes.second, speaker: 'callboard-reader', historicalLabel: 'fictional-world', text: 'The source copy is here now. This second call joins it to the picture we saw earlier.', options: [
      { text: 'Sign the source receipt for the second stop.', if: { all: [waiting, routeHeld(c, 'separate'), callboardState(`${flag}.first`)] },
        effects: [write(`${flag}.heard`, 'separate')] },
    ] },
    { id: nodes.return, speaker: 'narrator', historicalLabel: 'fictional-world', text: c.limit, options: [
      { text: loc ? 'Trace the ancestor heading.' : gage ? 'Lift the name above the inscription.' : 'Put the documented detail beside the earlier display.',
        if: returned, effects: [write(`${flag}.return.view`)] },
      { text: loc ? 'Trace the separate land-claim caption.' : gage ? 'Open the later return record.' : 'Set the exact source slip in the other clip.',
        if: returned, effects: [write(`${flag}.return.record`)] },
      { text: loc ? 'Clip both accounts with their own limits.' : gage ? 'Post the maker, inscribed name and custodian separately.' : 'Fix the supported label to the earlier stand.',
        if: { all: [returned, callboardState(`${flag}.return.view`), callboardState(`${flag}.return.record`)] }, effects: [write(`${flag}.returned`)] },
    ] },
  ];
}

function exactSource(c: CallboardCase): string {
  return c.key === QUETZALECATZIN ? 'HIS-CALL-quetzalecatzin-catalogue' : c.source;
}

function caseSources(c: CallboardCase): string[] {
  return c.key === QUETZALECATZIN ? [exactSource(c), c.source] : [c.source];
}

const objectives: Objective[] = CALLBOARD_CASES.map((c) => ({
  id: c.objective, title: `Receive a signed reading for ${c.accession}.`, visible: { card: c.card }, essential: false,
  done: { flagSet: `${c.flag}.heard` }, onComplete: [{ journal: `j.${c.objective}` }],
  weave: { concepts: ['evidence', 'interpretation', 'perspective', 'responsibility'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' }, atl: ['research', 'communication', 'social'],
    aoks: ['HIS', 'ART', 'HUM'], subjects: ['history', 'visual-arts', 'design-tech'], minutes: 3 },
}));

export const callboardContent = {
  characters: [
    { id: 'callboard-reader', name: 'Neris Hollow', role: 'Reader and runner at the Civic callboard', sprite: 'villager-2', mode: 'fictional',
      talk: [{ node: 'callboard.neris.short', if: CALLBOARD_SHORT }, { node: 'callboard.neris' }] },
    { id: 'callboard-keeper', name: 'Orella Ven', role: 'Signs the visiting records at Civic Dispatch', sprite: 'villager-1', mode: 'fictional', talk: [{ node: 'callboard.orella' }] },
  ],
  dialogue: [
    { id: 'callboard.neris', speaker: 'callboard-reader', historicalLabel: 'fictional-world', text: 'I can read both copies at the first bench. If you post the picture now and keep the source covered, I’ll take the long walk to the later desk.' },
    { id: 'callboard.neris.short', speaker: 'callboard-reader', historicalLabel: 'fictional-world', text: 'I came through the signed passage. The earlier folio means I can come straight back to the source desk instead of rounding the stacks.' },
    { id: 'callboard.orella', speaker: 'callboard-keeper', historicalLabel: 'fictional-world', text: 'A public sheet has room for the view and the record. From the busy passage we can show the view quickly, then take questions with the source at the next bell.' },
    { id: 'callboard.authorise', speaker: 'callboard-keeper', historicalLabel: 'fictional-world',
      text: 'That signed Lantern House folio kept two dates with separate events. Neris can save the long walk if we file its original while the source desk stays open.', options: [
        { text: 'File the signed folio and open the short passage.', if: CALLBOARD_FOLIO, effects: [write('callboard.shortcut')] },
      ] },
    ...CALLBOARD_CASES.flatMap(caseNodes),
  ],
  sources: CALLBOARD_CASES.map((c) => ({
    id: c.source, title: `${c.institution}, ${c.title}, ${c.accession}`, url: c.sourceUrl,
    locator: 'Exact object entry or holding institution curatorial account', supports: c.record, accessed: '2026-11-26',
  })).concat([{
    id: 'HIS-CALL-quetzalecatzin-catalogue', title: 'Library of Congress, Codex Quetzalecatzin, g4701g.ct009133',
    url: 'https://www.loc.gov/resource/g4701g.ct009133/', locator: 'Digital image of the whole manuscript',
    supports: 'The numbered public catalogue scan shows the same coloured manuscript described in the curator’s separate essay.', accessed: '2026-11-26',
  }]),
  exhibits: CALLBOARD_CASES.map((c) => ({
    id: c.artifact, name: c.title, historicalLabel: 'documented', art: c.key === GAGE ? GAGE_ART : 'preserved.folder',
    dateText: c.date, dateKind: c.dateKind, summary: `${c.origin}. ${c.material}. ${c.dimension} ${c.record}`,
    altText: `Pixel view of ${c.alt}.`, sources: caseSources(c), grantsCard: c.card,
    specimen: { key: c.key, institution: c.institution, accession: c.accession, source: exactSource(c), objective: c.objective,
      ...(c.asset ? { pixelAsset: c.asset } : {}), revisit: c.revisit },
  })),
  cards: CALLBOARD_CASES.map((c) => ({
    id: c.card, title: `${c.accession} · ${c.title}`, text: `${c.view} ${c.record}`, limits: c.limit,
    historicalLabel: 'documented', claimKind: 'observation', sources: caseSources(c),
  })),
  items: CALLBOARD_CASES.map((c) => ({ id: c.item, name: `Callboard guide · ${c.accession}`, description: c.itemLine,
    historicalLabel: 'fictional-world', art: 'fold.paired' })),
  missions: [{
    id: 'KG-CH12-R31', world: 'WORLD-13', title: 'The Callboard Turn', available: CALLBOARD_OPEN,
    stake: 'Neris wants a first look and a supported explanation. Orella can send both together, or give each one its own stop.',
    knowledgeQuestion: 'How does the order of two encounters change what someone can safely carry away?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: CALLBOARD_CASES.map((c) => ({ id: `j.${c.objective}`, claimKind: 'observation',
    text: `I kept the pictured detail and its support together under ${c.accession}. Neris signed a reading receipt after seeing them.` })),
  hints: CALLBOARD_CASES.flatMap((c) => [
    'Look for two parts of the guide that do different jobs.',
    'Inspect one collection case and find its matching clip stand behind the case.',
    'Place the visible detail and the catalogue evidence. See what a reader gets on the first and later calls.',
    'Bring both parts to the public bench, or show the picture first and take the source to the later desk.',
  ].map((text, index) => ({ id: `h.${c.objective}.${index + 1}`, objective: c.objective, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
