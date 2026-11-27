import { BEARING_FIXES, BEARING_POSTS, BEARING_ROUTES, bearingKey, type BearingChange, type Point } from '../domain/bearingBay';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import records from './bearing-bay-records.json';

export const BEARING_GROUP = 'bearing-bay';
export const BEARING_GATE: Condition = { objective: 'coast.arrival' };
export const BEARING_RETURN_MAP = 'observatory.bearing-return';
export const BEARING_CASES = records.map((record) => {
  const key = bearingKey(record.slug);
  const start: Point = [record.start[0], record.start[1]];
  const changed: Point = [record.changed[0], record.changed[1]];
  const kind: BearingChange = record.kind === 'fog' || record.kind === 'post' ? record.kind : 'late';
  return { ...record, start, changed, kind, exhibit: `OBJ-BEARING-${record.slug}`, source: `HIS-BEARING-${record.slug}`, card: `card.${key}`,
    objective: `${key}.received`, returnObjective: `${key}.returned`, returnProp: `bearing-${record.slug}-return` };
});
export type BearingCase = (typeof BEARING_CASES)[number];

const goals = BEARING_CASES.flatMap((record): Objective[] => {
  const key = bearingKey(record.slug);
  return [{ id: record.objective, title: `Take two sights at the same bell and find where they cross on ${record.name}.`, essential: false, visible: { card: record.card },
    done: { all: [{ card: record.card }, ...BEARING_POSTS.map((post) => ({ flag: `${key}.${post}`, eq: true })),
      { any: BEARING_ROUTES.map((route) => ({ all: [{ flag: `${key}.route`, eq: route }, { flag: `${key}.received`, eq: route }] })) }] },
    weave: { concepts: ['evidence', 'perspective', 'interpretation', 'explanation', 'objectivity', 'responsibility'],
      framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], atl: ['thinking', 'communication'], aoks: ['MAT', 'ART', 'HIS'],
      subjects: ['geography', 'design-tech', 'math-aa'], thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }, minutes: 4 },
    onComplete: [{ journal: `j.${record.objective}` }],
  }, { id: record.returnObjective, title: `Look again at ${record.name} when the light or weather has changed.`, essential: false, visible: { item: `item.specimen.${record.key}` },
    done: { all: [{ objective: record.objective }, { flag: `${key}.old`, eq: true }, ...BEARING_FIXES.map((fix) => ({ flag: `${key}.${fix}`, eq: true })),
      { flag: `${key}.fitted`, in: [...BEARING_FIXES] }] },
    weave: { concepts: ['evidence', 'certainty', 'justification', 'perspective', 'responsibility'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
      atl: ['thinking', 'research', 'self-management'], aoks: ['MAT', 'NAT'], subjects: ['geography', 'physics', 'math-aa'],
      thinking: { dok: 3, bloom: 'evaluate', fink: 'application', solo: 'relational' }, minutes: 3 },
    onComplete: [{ journal: `j.${record.returnObjective}` }],
  }];
});

export const bearingBayContent = {
  missions: [{ id: 'KG-CH4-R26', title: 'Where the Two Sights Meet', world: 'WORLD-05', available: BEARING_GATE,
    stake: 'The harbour crew needs a quick mark for the west dock. The Fold has time to help people check it for themselves.',
    knowledgeQuestion: 'What must two readings share before their combination supports a position?', objectives: goals, caseVisits: goals.map(({ id }) => [id]) }],
  sources: BEARING_CASES.map((record) => ({ id: record.source, title: `${record.institution}, ${record.originalTitle}, ${record.accession}`, url: record.catalog,
    locator: 'Catalogue title, maker credit, date, technique, dimensions and open-access object image', supports: record.evidence, accessed: '2026-11-26' })),
  cards: BEARING_CASES.map((record) => ({ id: record.card, title: `${record.name} · ${record.accession}`, claimKind: 'observation', historicalLabel: 'documented',
    text: record.evidence, limits: record.limit, sources: [record.source] })),
  exhibits: BEARING_CASES.map((record) => ({ id: record.exhibit, name: record.name, historicalLabel: 'documented', art: 'coast.signal',
    dateText: record.date, dateKind: record.dateKind, summary: `${record.attribution}. ${record.place}. ${record.medium}. ${record.dimensions}. ${record.evidence}`,
    altText: record.altText, sources: [record.source], grantsCard: record.card,
    specimen: { key: record.key, accession: record.accession, institution: record.institution, source: record.source,
      objective: record.objective, pixelAsset: record.asset, revisit: { map: BEARING_RETURN_MAP, prop: record.returnProp,
        method: `Use the copied sight lines at the second rack for ${record.name}.`,
        hint: `Equip this working copy and find its shutter at the Headland Station return room.` } } })),
  journal: BEARING_CASES.flatMap((record) => [{ id: `j.${record.objective}`, claimKind: 'observation',
    text: `Two same-bell practice sights crossed at one square. ${record.name}, ${record.accession}, stays documented separately from our model. I fitted the route aid at a receiver.` },
  { id: `j.${record.returnObjective}`, claimKind: 'observation',
    text: `I held back one sight when its window or post changed. I kept both the next-bell check and the side-post check beside the returned copy of ${record.name}, then fitted a new aid.` }]),
  hints: BEARING_CASES.flatMap((record) => [
    ['A direction from one position can pass through more than one square.', `Open ${record.accession} beside the practice view, and keep its source limits with the image.`,
      'Record the west and east same-bell sights. Look for the squares where the two lines agree.',
      'Take the paired trace to Marl Fold for a guided check or fit the checked mark at the low west dock.'],
    ['One sight has a different time, playing surface or viewing condition.', `Equip the working copy of ${record.name} to uncover its shutter in the second room.`,
      'Try the old pair before collecting a matched pair one bell later and a side-post view at this bell.',
      'Fit the repeat-bell rack or the side-view guide. The rack keeps both measured results.'],
  ].flatMap((lines, phase) => lines.map((text, index) => { const objective = phase === 0 ? record.objective : record.returnObjective;
    return { id: `h.${objective}.${index + 1}`, objective, depth: (index + 1) as Hint['depth'], text }; }))),
} satisfies Partial<ContentPack>;
