import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import { SHEET_READERS, SHEET_RETURNS, SHEET_SCALES, sheetKey, type SheetCase } from '../domain/mapAlignment';
import records from './map-alignment-records.json';

export const ALIGN_GROUP = 'aligned-map';
export const ALIGN_GATE: Condition = { objective: 'copies.arrival' };
export const ALIGN_REVISIT = 'nile.route';
export const ALIGN_CASES = records.map((record) => {
  const key = sheetKey(record.slug);
  const model: SheetCase = { turn: record.turn, offset: [record.offset[0], record.offset[1]], outer: [record.outer[0], record.outer[1]] };
  return { ...record, model, exhibit: `OBJ-ALIGN-${record.slug}`, card: `card.${key}`, source: `HIS-ALIGN-${record.slug}`,
    objective: `${key}.received`, second: `${key}.returned`, prop: `align-${record.slug}-nile` };
});
export type AlignmentCase = (typeof ALIGN_CASES)[number];

function goals(record: AlignmentCase): [Objective, Objective] {
  const key = sheetKey(record.slug);
  return [{ id: record.objective, title: `Align the practice overlays and fit a guide beside ${record.name}.`, essential: false, visible: { card: record.card },
    done: { all: [{ card: record.card }, { flag: `${key}.checked`, eq: true },
      ...SHEET_SCALES.map((mode) => ({ flag: `${key}.trial.${mode}`, eq: true })),
      { any: SHEET_READERS.map((reader) => ({ all: [{ flag: `${key}.reader`, eq: reader }, { flag: `${key}.received`, eq: reader }] })) }] },
    weave: { concepts: ['perspective', 'evidence', 'certainty', 'interpretation', 'explanation', 'responsibility'],
      framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], atl: ['thinking', 'social', 'research'], aoks: ['HIS', 'HUM', 'MAT'],
      subjects: ['geography', 'history', 'math-aa'], thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }, minutes: 5 },
    onComplete: [{ journal: `j.${record.objective}` }],
  }, { id: record.second, title: `Use the working copy of ${record.name} to check a changed edge in the Nile Map Room.`, essential: false,
    visible: { item: `item.specimen.${record.key}` }, done: { all: [{ objective: record.objective },
      ...SHEET_SCALES.map((mode) => ({ flag: `${key}.return.${mode}`, eq: true })), { flag: `${key}.placed`, in: [...SHEET_RETURNS] }] },
    weave: { concepts: ['evidence', 'perspective', 'justification', 'certainty', 'responsibility'], framework: ['scope', 'methods-and-tools', 'ethics'],
      atl: ['thinking', 'social', 'communication'], aoks: ['HIS', 'HUM', 'MAT'], subjects: ['geography', 'history', 'math-ai'],
      thinking: { dok: 3, bloom: 'evaluate', fink: 'application', solo: 'relational' }, minutes: 3 },
    onComplete: [{ journal: `j.${record.second}` }],
  }];
}

const objectives = ALIGN_CASES.flatMap(goals);

export const mapAlignmentContent = {
  sources: ALIGN_CASES.map((record) => ({ id: record.source, title: `${record.institution}, ${record.originalTitle}, ${record.accession}`, url: record.catalog,
    locator: 'Catalogue print record, contributors, sheet description, dated edition and named coverage', supports: record.evidence, accessed: '2026-11-26' })),
  exhibits: ALIGN_CASES.map((record) => ({
    id: record.exhibit, name: record.name, art: 'align.map', historicalLabel: 'documented', dateText: record.date, dateKind: record.dateKind,
    summary: `${record.attribution}. ${record.place}. ${record.dimensions}. ${record.scale} ${record.evidence}`,
    altText: record.altText, sources: [record.source], grantsCard: record.card,
    specimen: { key: record.key, accession: record.accession, source: record.source, institution: record.institution, pixelAsset: record.asset,
      objective: record.objective, revisit: { map: ALIGN_REVISIT, prop: record.prop,
        method: `Check the moved far turn beside the working copy of ${record.name}.`,
        hint: `Equip this copy and visit Marek’s second overlay rail in the Nile Map Room.` } },
  })),
  cards: ALIGN_CASES.map((record) => ({ id: record.card, title: `${record.name} · ${record.accession}`, historicalLabel: 'documented', claimKind: 'observation',
    sources: [record.source], text: record.evidence, limits: record.limit })),
  missions: [{ id: 'KG-CH7-R29-ALIGN', title: 'The Third Landmark', world: 'WORLD-08', available: ALIGN_GATE,
    stake: 'The landing needs a guide to its short turn. The printer needs the farther difference with the full record.',
    knowledgeQuestion: 'When can the agreement of two marks support a map, and what needs a separate check?', objectives,
    caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: ALIGN_CASES.flatMap((record) => [{ id: `j.${record.objective}`, claimKind: 'observation',
    text: `I kept the catalogue and scale for ${record.name} (${record.accession}). I turned and pinned the practice overlay, changed its span and checked the unused outer mark before fitting a guide.` },
  { id: `j.${record.second}`, claimKind: 'observation',
    text: `I brought the working copy of ${record.name} to Marek. The matching gate and post could not settle the new far turn. I left either a closer route for the next carrier or an independent check there.` }]),
  hints: ALIGN_CASES.flatMap((record) => [
    { objective: record.objective, texts: ['Start with a place each sheet marks.', `Inspect ${record.accession} beside the practice overlay.`,
      'Pin the gate and turn the sheet until its second mark falls toward the post. Check the original scale and the stretched span.',
      'Use the checked span for a short landing guide or keep both overlays at the press. Fit the chosen copy at its receiver.'] },
    { objective: record.second, texts: ['The earlier match cannot settle a moved mark.', `Equip the working copy for ${record.name} at Marek’s Map Room rail.`,
      'Compare the two old spans against the new survey’s outer mark. The gate and post are unchanged.',
      'Leave a route with the new limit marked or commission a separately placed outer reading.'] },
  ].flatMap(({ objective, texts }) => texts.map((text, index) => ({ id: `h.${objective}.${index + 1}`, objective, depth: (index + 1) as Hint['depth'], text })))),
} satisfies Partial<ContentPack>;
