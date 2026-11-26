import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective } from '../domain/types';
import specimens from './glass-rack-specimens.json';
import voices from './glass-rack-lines.json';

export const GLASS_RACK_PREFIX = 'glass-rack:';
export const GLASS_RACK_READY: Condition = { objective: 'preserved.publish' };
export const GLASS_RACK_MODES = ['turn', 'open', 'detail'] as const;
export type GlassMode = (typeof GLASS_RACK_MODES)[number];
export type GlassMount = 'rail' | 'pocket';
const museum = 'The Cleveland Museum of Art';

interface GlassStory {
  work: string;
  comparison: string;
  rail: string;
  railDone: string;
  pocket: string;
  pocketDone: string;
  revisit: string;
  boardDone: string;
  deskDone: string;
}
const stories: Record<string, GlassStory> = voices;

export const GLASS_RACK_USES = {
  turn: {
    prop: 'nile-glass-double',
    title: 'the sleeves at opposite sides of Marek’s table',
    method: 'Put two viewpoints on opposite approaches',
    hint: 'Bring the equipped object to Marek’s double sleeve. Walk the outer or inner route to read from the side you reached.',
    action: 'Turn to the other side',
    work: 'Turn the other face toward the return path',
  },
  open: {
    prop: 'nile-glass-parts',
    title: 'Marek’s teaching board with two separate pockets',
    method: 'Give a body and its separately pictured parts independent places',
    hint: 'Bring the equipped object to Marek’s two pockets. Line up the body and its parts with the correct source scope.',
    action: 'Open the view of the parts',
    work: 'Open the second pocket for the separated parts',
  },
  detail: {
    prop: 'nile-glass-edge',
    title: 'Marek’s inset shutter over the route-board frame',
    method: 'Keep a close view anchored in its wider frame',
    hint: 'Bring the equipped object to the shutter. Leave a whole view and a labelled position for its inset.',
    action: 'Bring the framed detail forward',
    work: 'Set the inset beside its whole frame',
  },
} as const;

export const glassFlag = (flag: string, value: string | boolean = true): Condition => ({ flag, eq: value });
const write = (setFlag: string, value: string | boolean = true): Effect => ({ setFlag, value });
const all = (...values: Condition[]): Condition => ({ all: values });
const absent = (flag: string): Condition => ({ not: { flagSet: flag } });
const modeIs = (id: string): id is GlassMode => GLASS_RACK_MODES.some((mode) => mode === id);

export const GLASS_RACK_CASES = specimens.map((record) => {
  if (!modeIs(record.mode)) throw new Error(`Unknown Glass Rack view: ${record.mode}`);
  const mode = record.mode;
  const flag = `glass.${record.slug}`;
  const use = GLASS_RACK_USES[mode];
  const story = stories[record.slug];
  if (!story) throw new Error(`No Glass Rack dialogue for ${record.slug}`);
  return {
    ...record, mode, flag, story,
    source: `HIS-GLASS-${record.slug}`, exhibit: `OBJ-GLASS-${record.slug}`, card: `card.${flag}`,
    earned: `${flag}.earned`, returned: `${flag}.returned`,
    nodes: { work: `${flag}.work`, rail: `${flag}.rail`, pocket: `${flag}.pocket`, revisit: `${flag}.revisit` },
    revisit: { map: 'nile.route', prop: use.prop, method: use.method, hint: use.hint },
  };
});

export type GlassRecord = (typeof GLASS_RACK_CASES)[number];
export type GlassStation = GlassRecord | GlassMode | GlassMount;

export function glassRackStation(station: string): GlassStation | undefined {
  return station === 'rail' || station === 'pocket' || modeIs(station)
    ? station : GLASS_RACK_CASES.find(({ slug }) => slug === station);
}

export function glassRackEntries(game: string): string[] {
  if (!game.startsWith(GLASS_RACK_PREFIX)) return [];
  const station = glassRackStation(game.slice(GLASS_RACK_PREFIX.length));
  if (!station) return [];
  if (station === 'rail' || station === 'pocket') return GLASS_RACK_CASES.map(({ nodes }) => nodes[station]);
  if (typeof station === 'string') return GLASS_RACK_CASES.filter(({ mode }) => mode === station).map(({ nodes }) => nodes.revisit);
  return [station.nodes.work];
}

function glassCaseNodes(c: GlassRecord): DialogueNode[] {
  const { card, flag, key, nodes } = c;
  const keeper = 'glass-keeper';
  const ready = all(GLASS_RACK_READY, { card }, absent(`${flag}.mount`));
  const face = (name: string) => glassFlag(`${flag}.face`, name);
  const compared = all(ready, glassFlag(`${flag}.compared`));
  const approach = (mount: GlassMount) => all(GLASS_RACK_READY, { card }, glassFlag(`${flag}.mount`, mount), absent(`${flag}.heard`));
  const use = GLASS_RACK_USES[c.mode];
  const returnReady = all(specimenEquipped(key), absent(`${flag}.nile`));
  return [
    { id: nodes.work, speaker: keeper, historicalLabel: 'fictional-world',
      text: c.story.work, options: [
        { text: 'Set the whole view in the window.', if: all(ready, absent(`${flag}.face`)), effects: [write(`${flag}.face`, 'whole')] },
        { text: use.action, if: all(ready, face('whole'), absent(`${flag}.compared`)), effects: [write(`${flag}.face`, 'other')] },
        { text: 'Return to the whole view and line up its number.', if: all(ready, face('other')),
          effects: [write(`${flag}.face`, 'whole'), write(`${flag}.compared`)] },
        { text: 'Send both views to the broad rail.', if: compared, effects: [write(`${flag}.mount`, 'rail')] },
        { text: 'Fit a hinged pocket for the close desk.', if: compared, effects: [write(`${flag}.mount`, 'pocket')] },
      ] },
    { id: nodes.rail, speaker: 'glass-rail-reader', historicalLabel: 'fictional-world',
      text: c.story.rail, options: [
        { text: 'Set both photos side by side and leave the source tab.',
          if: approach('rail'), effects: [write(`${flag}.heard`, 'rail')] },
      ] },
    { id: nodes.pocket, speaker: 'glass-pocket-reader', historicalLabel: 'fictional-world',
      text: c.story.pocket, options: [
        { text: 'Lift the pocket flap for the other view.', if: all(approach('pocket'), absent(`${flag}.flap`)),
          effects: [write(`${flag}.flap`)] },
        { text: 'Close the flap and link it to the whole view.', if: all(approach('pocket'), glassFlag(`${flag}.flap`)),
          effects: [write(`${flag}.heard`, 'pocket')] },
      ] },
    { id: nodes.revisit, speaker: 'nile-marek', historicalLabel: 'fictional-world',
      text: c.story.revisit, options: [
        { text: 'Set the whole frame against the old board.', if: all(returnReady, absent(`${flag}.nile-whole`)),
          effects: [write(`${flag}.nile-whole`)] },
        { text: use.work, if: all(returnReady, glassFlag(`${flag}.nile-whole`), absent(`${flag}.nile-other`)),
          effects: [write(`${flag}.nile-other`)] },
        { text: 'Leave both views on the board for the next reader.',
          if: all(returnReady, glassFlag(`${flag}.nile-other`)),
          effects: [write(`${flag}.nile`, 'board')] },
        { text: 'Leave a pointer on the board and keep the views at the desk.',
          if: all(returnReady, glassFlag(`${flag}.nile-other`)),
          effects: [write(`${flag}.nile`, 'desk')] },
      ] },
  ];
}

const objectives: Objective[] = GLASS_RACK_CASES.flatMap((c): Objective[] => [
  { id: c.earned, title: `Make a two-view mount for ${c.accession}.`, visible: { card: c.card },
    essential: false, done: { flagSet: `${c.flag}.heard` }, onComplete: [{ journal: `j.${c.earned}` }],
    weave: { concepts: ['evidence', 'perspective', 'interpretation', 'justification'],
      framework: ['perspectives', 'methods-and-tools', 'scope'], thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' },
      atl: ['research', 'thinking', 'communication'], aoks: ['HIS', 'ART'], subjects: ['history', 'visual-arts', 'design-tech'], minutes: 4 } },
  { id: c.returned, title: `Leave the supported views of ${c.accession} in the Nile Archive.`,
    visible: { objective: c.earned }, essential: false, done: { flagSet: `${c.flag}.nile` },
    weave: { concepts: ['evidence', 'responsibility', 'explanation'], framework: ['scope', 'ethics', 'methods-and-tools'],
      thinking: { dok: 2, bloom: 'apply', fink: 'integration', solo: 'relational' },
      atl: ['communication', 'social'], aoks: ['HIS', 'ART'], subjects: ['history', 'design-tech'], minutes: 3 } },
]);

export const glassRackContent = {
  sources: GLASS_RACK_CASES.map((c) => ({
    id: c.source, title: `${museum}, ${c.title}, ${c.accession}`, url: c.url,
    locator: 'Object record, collection photograph and chosen alternate photograph', supports: c.record, accessed: '2026-11-26',
  })),
  exhibits: GLASS_RACK_CASES.map((c) => ({
    id: c.exhibit, name: c.title, historicalLabel: 'documented', art: 'preserved.catalogue',
    summary: [c.origin, c.materials, c.record, c.measurements].filter(Boolean).join(' · '),
    dateText: c.date, dateKind: 'catalogued creation of the recorded object',
    sources: [c.source], altText: c.whole, grantsCard: c.card,
    specimen: { key: c.key, institution: museum, accession: c.accession, objective: c.earned, source: c.source,
      pixelAsset: c.wholeAsset, revisit: c.revisit },
  })),
  cards: GLASS_RACK_CASES.map((c) => ({
    id: c.card, title: `${c.title} · ${c.accession}`, text: `${c.whole} ${c.record}`, limits: c.limit,
    historicalLabel: 'documented', claimKind: 'observation', sources: [c.source],
  })),
  characters: [
    { id: 'glass-keeper', name: 'Quena Tapwell', role: 'Hinges and mounts at the Cold Store', sprite: 'villager-1',
      mode: 'fictional', talk: [{ node: 'glass.quena' }] },
    { id: 'glass-rail-reader', name: 'Osyth Bellfoot', role: 'Reads the broad rail between delivery rounds', sprite: 'villager-2',
      mode: 'fictional', talk: [{ node: 'glass.osyth' }] },
    { id: 'glass-pocket-reader', name: 'Rennel Patch', role: 'Keeps a small reading desk by the coat hooks', sprite: 'villager-2',
      mode: 'fictional', talk: [{ node: 'glass.rennel' }] },
  ],
  dialogue: [
    { id: 'glass.quena', speaker: 'glass-keeper', historicalLabel: 'fictional-world',
      text: 'When our last Cold Store display went up, a reader asked what lay behind the picture. My glass reached only one side. The old photo cases through here each keep another view.' },
    { id: 'glass.osyth', speaker: 'glass-rail-reader', historicalLabel: 'fictional-world',
      text: 'Give me one broad rail and I can compare at the pace my boots stop. Write the case number where my elbow won’t cover it.' },
    { id: 'glass.rennel', speaker: 'glass-pocket-reader', historicalLabel: 'fictional-world',
      text: 'A large board would push the ink off my little table. My family taught me to sew a second leaf under the first. I can lift it when the light is good.' },
    ...GLASS_RACK_CASES.flatMap(glassCaseNodes),
  ],
  missions: [{
    id: 'KG-CH3-R42', world: 'WORLD-04', title: 'The Missing Face', available: GLASS_RACK_READY,
    stake: 'Quena can save room at Rennel’s close desk or give Osyth a broad read between rounds. The case number must follow both views.',
    knowledgeQuestion: 'What do two views of the same object let us see that either view alone would leave open?',
    objectives, caseVisits: GLASS_RACK_CASES.map((c) => [c.earned, c.returned]),
  }],
  journal: GLASS_RACK_CASES.map((c) => ({
    id: `j.${c.earned}`, claimKind: 'observation', text: `Both views of ${c.accession} made it to the reading station that could use their mount.`,
  })),
  hints: GLASS_RACK_CASES.flatMap((c) => [
    [c.earned, ['The second photo does something different from the first.', 'Inspect the numbered case and use the glass beside it.',
      'Set the first view, change the glass and return to the first view once.', 'Choose the broad rail or the pocket and go to its reader.']],
    [c.returned, ['Show the same pair earlier in the Archive.', 'Take the earned object and equip it in your Bag.',
      'Find its matching rack in the Nile Map Room. Open the first frame and fit the second.', 'Leave both views on the board or leave a pointer to the reading desk.']],
  ].flatMap(([objective, texts]) => (texts as string[]).map((text, index) => ({
    id: `h.${objective}.${index + 1}`, objective: objective as string, text, depth: (index + 1) as Hint['depth'],
  })))),
} satisfies Partial<ContentPack>;
