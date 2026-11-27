import authored from './script-rail-specimens.json';
import { SCRIPT_LAYOUTS, type ScriptLayout } from '../domain/scriptRail';
import { specimenEquipped, specimenReadingFlag } from '../domain/specimenGear';
import type { Condition, ContentPack, Hint, Mission, Weave } from '../domain/types';

export const SCRIPT_RAIL = 'script-rail';
export const SCRIPT_RAIL_GATE: Condition = { objective: 'stage.finish' };
export const SCRIPT_CABINET = 'stage.script-cabinet';
export const SCRIPT_RAIL_RETURN = { map: 'copies.archive', prop: 'script-rail-copies-index' };
export const SCRIPT_ROOMS = ['verse', 'drama', 'prose', 'edition'] as const;
export type ScriptRoom = typeof SCRIPT_ROOMS[number];

interface ScriptObject {
  key: string;
  accession: string;
  institution: string;
  title: string;
  date: string;
  dateKind: string;
  artist: string;
  culture: string;
  medium: string;
  dimensions: string;
  catalogue: string;
  locator?: string;
  related?: string;
  pixelAsset: string;
  observation: string;
  limit: string;
  altText: string;
}

interface ScriptDraft {
  slug: string;
  room: ScriptRoom;
  title: string;
  task: string;
  cue: string;
  readbacks: [string, string];
  revisit: [string, string];
  object: ScriptObject;
}

export const SCRIPT_CASES = (authored as ScriptDraft[]).map((draft) => {
  const flag = `stage.script.${draft.slug}`;
  return { ...draft, flag, card: `card.${flag}`, objective: `${flag}.placed`,
    exhibit: `OBJ-SCRIPT-RAIL-${draft.slug.toUpperCase()}`, source: `HIS-SCRIPT-RAIL-${draft.slug.toUpperCase()}`,
    reprise: specimenReadingFlag(draft.object.key) };
});
export type ScriptCase = typeof SCRIPT_CASES[number];

export const SCRIPT_DESTINATIONS = {
  cue: { map: 'stage.gallery', label: 'the call rail in the Audience Gallery', prop: 'script-rail-receive-cue', installer: 'Lead with the reading cue' },
  catalogue: { map: 'stage.gallery', label: 'the seated reader’s open rest in the Audience Gallery', prop: 'script-rail-receive-catalogue', installer: 'Lead with the catalogue line' },
} as const;

interface ScriptPlace {
  map: string;
  mission: string;
  title: string;
  actor: string;
  name: string;
  role: string;
  welcome: string;
  question: string;
  stake: string;
  weave: Weave;
}

export const SCRIPT_DETAILS = {
  verse: {
    map: 'stage.script-verse', mission: 'KG-CH9-R90', title: 'The Verse Alcove',
    actor: 'script-irwen', name: 'Irwen Calf', role: 'Verse room reader',
    welcome: 'Come by the rail when you have one breath to spare. Sit at the rest when you need both strips. The same poem can reach those two places in very different company.',
    question: 'What changes when a reader meets the voice before its maker or occasion?',
    stake: 'A performance can make someone want to hear a poem. A catalogue has to help them find the right surviving work.',
    weave: { concepts: ['culture', 'perspective', 'evidence', 'interpretation'], framework: ['scope', 'perspectives', 'methods-and-tools'],
      atl: ['communication', 'research', 'thinking'], aoks: ['ART', 'LAN', 'HIS'], subjects: ['lang-lit', 'lit-perf', 'visual-arts'] },
  },
  drama: {
    map: 'stage.script-drama', mission: 'KG-CH9-R91', title: 'The Scene Cabinet',
    actor: 'script-rennick', name: 'Rennick Pell', role: 'Stage door keeper',
    welcome: 'A runner saw a fine figure in a print and wrote its name on a cast slip. I need the roles and the pictures to reach readers in a way they can pull apart.',
    question: 'Which claims about a performance can a surviving image support?',
    stake: 'A misleading caption can give a documented actor the wrong role or turn an illustrator into a witness.',
    weave: { concepts: ['truth', 'interpretation', 'evidence', 'objectivity', 'power'], framework: ['perspectives', 'methods-and-tools', 'ethics'],
      atl: ['communication', 'research', 'social'], aoks: ['ART', 'LAN', 'HIS'], subjects: ['lit-perf', 'lang-langlit', 'theatre', 'history'] },
  },
  prose: {
    map: 'stage.script-prose', mission: 'KG-CH9-R92', title: 'The Room of Story Voices',
    actor: 'script-cetra', name: 'Cetra Winnet', role: 'Story voice keeper',
    welcome: 'A letter may talk to a reader inside another story. Try the quick line and its record in both orders. Leave a place where somebody can find out who was actually speaking.',
    question: 'What does the reader need in order to locate a voice within a layered story?',
    stake: 'The wrong shortcut will send a borrower to the wrong plot, edition, speaker or part of a damaged work.',
    weave: { concepts: ['responsibility', 'evidence', 'interpretation', 'perspective'], framework: ['perspectives', 'scope', 'ethics'],
      atl: ['communication', 'research', 'thinking'], aoks: ['ART', 'LAN', 'HIS'], subjects: ['lang-lit', 'lang-langlit', 'visual-arts'] },
  },
  edition: {
    map: 'stage.script-edition', mission: 'KG-CH9-R93', title: 'The Room of Editions',
    actor: 'script-talven', name: 'Talven Dreer', role: 'Reader at the edition desk',
    welcome: 'I can find a translator, a title page, and a later gift line in the same volume. Visitors may come looking for any one of them. Give each a path they can follow.',
    question: 'What belongs to a story, what belongs to its edition, and what belongs to this particular object?',
    stake: 'Followers of an illustrator or translator must still be able to retrieve the exact edition without miscrediting it.',
    weave: { concepts: ['culture', 'justification', 'evidence', 'responsibility', 'explanation'], framework: ['scope', 'methods-and-tools', 'ethics'],
      atl: ['research', 'communication', 'thinking'], aoks: ['LAN', 'HIS', 'ART'], subjects: ['lang-langlit', 'lang-lit', 'history'] },
  },
} satisfies Record<ScriptRoom, ScriptPlace>;

export function scriptReady(record: ScriptCase): Condition {
  return { all: [{ card: record.card }, ...SCRIPT_LAYOUTS.map((layout): Condition =>
    ({ flag: `${record.flag}.preview.${layout}`, eq: true }))] };
}

export function scriptDelivery(record: ScriptCase, layout: ScriptLayout): Condition {
  return { all: [scriptReady(record), { flag: `${record.flag}.sent`, eq: layout }] };
}

export function scriptCarry(record: ScriptCase): Condition {
  return { all: [specimenEquipped(record.object.key), { objective: record.objective }] };
}

const missions: Mission[] = SCRIPT_ROOMS.map((room) => {
  const { mission, title, question, stake, weave } = SCRIPT_DETAILS[room];
  const entries = SCRIPT_CASES.filter((record) => record.room === room);
  const objectives = entries.map((record): Mission['objectives'][number] => ({
    id: record.objective, title: `Preview both folds and install a reading arrangement for ${record.title.toLowerCase()}.`,
    essential: false, visible: { card: record.card },
    done: { any: SCRIPT_LAYOUTS.map((layout) => ({
      all: [scriptDelivery(record, layout), { flag: record.objective, eq: layout }],
    })) },
    onComplete: [{ journal: `j.${record.flag}` }],
    weave: { ...weave,
      // This edition asks the reader to separate Seneca's line from the Latin editorial explanation.
      ...(record.slug === 'seneca-lipsius' ? { subjects: [...weave.subjects, 'classics'] } : {}),
      minutes: 6, thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' } },
  }));
  return { id: mission, world: 'WORLD-10', title, stake, knowledgeQuestion: question,
    objectives, available: { any: entries.map(({ card }) => ({ card })) }, caseVisits: objectives.map(({ id }) => [id]) };
});

export const scriptRailContent = {
  sources: SCRIPT_CASES.flatMap(({ source, object }) => [
    { id: source, title: `${object.institution}, ${object.title}, ${object.accession}`, url: object.catalogue,
      locator: object.locator ?? 'Object identity, date, named creators, material or individual edition', supports: object.observation, accessed: '2026-11-26' },
    ...(object.related ? [{ id: `${source}-RELATED`, title: 'Cleveland Museum of Art, Album of Illustrations for the Tale of Genji, 1961.202',
      url: object.related, locator: 'Public catalogue discussion of the independent album and its source tale',
      supports: 'The earlier literary work is credited to Murasaki Shikibu.', accessed: '2026-11-26' }] : []),
  ]),
  cards: SCRIPT_CASES.map(({ card, source, object }) => ({
    id: card, title: `${object.title} · ${object.accession}`, text: object.observation, limits: object.limit,
    historicalLabel: 'documented', claimKind: 'observation', sources: [source],
  })),
  exhibits: SCRIPT_CASES.map((entry) => {
    const { object } = entry;
    return { id: entry.exhibit, name: `${object.title} · ${object.accession}`, dateText: object.date, dateKind: object.dateKind,
      historicalLabel: 'documented', art: 'stage.programme', altText: object.altText, grantsCard: entry.card,
      summary: [object.artist, object.culture, object.medium, object.dimensions].filter(Boolean).join(' · '),
      sources: [entry.source, ...(object.related ? [`${entry.source}-RELATED`] : [])],
      specimen: { key: object.key, institution: object.institution, accession: object.accession, source: entry.source,
        objective: entry.objective, pixelAsset: object.pixelAsset, revisit: { ...SCRIPT_RAIL_RETURN, method: entry.revisit[0],
          hint: 'Equip the object from this case and bring it to the folded index at the City of Copies Record Room.' } },
    };
  }),
  characters: Object.values(SCRIPT_DETAILS).map(({ actor, name, role }) => ({
    id: actor, name, role, sprite: 'villager-2', mode: 'fictional', talk: [{ node: `${actor}.welcome` }],
  })),
  dialogue: Object.values(SCRIPT_DETAILS).map(({ actor, welcome }) => ({
    id: `${actor}.welcome`, speaker: actor, text: welcome, historicalLabel: 'fictional-world',
  })),
  missions,
  hints: SCRIPT_CASES.flatMap((record) => [
    `Find the accession ${record.object.accession} in the cabinet. The historical record has its own line.`,
    'Begin with the reading cue outside. Look from the rail and open the margin at the rest.',
    'Turn the card and test what changes with the catalogue line outside. Neither arrangement changes the historical record.',
    'Send one fold and install it at the matching stand in the Audience Gallery.',
  ].map((text, index) => ({ id: `h.${record.flag}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
  journal: SCRIPT_CASES.map((record) => ({
    id: `j.${record.flag}`, text: `I previewed both folded introductions for ${record.title.toLowerCase()}. ${record.object.limit}`, claimKind: 'simulation',
  })),
} satisfies Partial<ContentPack>;
