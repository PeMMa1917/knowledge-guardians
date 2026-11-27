import type { ContentPack, Hint, Objective } from '../domain/types';
import data from './earlier-viewing.json';

export const EARLIER_VIEWING = 'earlier-viewing:';
export const earlierViews = data.map((record) => ({ ...record, prop: `earlier-viewing-${record.id}`, flag: `earlier-viewing.${record.id}` }));
export type EarlierView = typeof earlierViews[number];

const disciplines: Record<string, Pick<NonNullable<Objective['weave']>, 'aoks' | 'subjects'>> = {
  'north-turn': { aoks: ['HUM', 'HIS'], subjects: ['geography', 'history'] },
  'memory-board': { aoks: ['HIS', 'ART', 'IND'], subjects: ['anthropology', 'history'] },
  'deep-window': { aoks: ['NAT', 'TEC'], subjects: ['physics', 'ess'] },
  'dhuwa-receipt': { aoks: ['HIS', 'IND', 'POL'], subjects: ['global-politics', 'history'] },
  'yirritja-leaves': { aoks: ['HIS', 'IND', 'POL'], subjects: ['global-politics', 'history'] },
  'horizon-copy': { aoks: ['NAT', 'HIS'], subjects: ['physics', 'math-aa'] },
  'red-leaf': { aoks: ['HIS', 'ART', 'TEC'], subjects: ['history', 'visual-arts'] },
  'earliest-line': { aoks: ['HIS', 'LAN', 'REL'], subjects: ['history', 'world-religions'] },
  'two-print-hands': { aoks: ['HIS', 'LAN', 'TEC'], subjects: ['history', 'lang-lit'] },
  'portable-latitude': { aoks: ['MAT', 'NAT', 'HIS'], subjects: ['math-aa', 'physics'] },
  'horse-sequence': { aoks: ['ART', 'TEC'], subjects: ['film', 'theatre'] },
  'web-source': { aoks: ['TEC', 'HIS'], subjects: ['computer-science', 'digital-society'] },
  'telescope-rim': { aoks: ['NAT', 'TEC'], subjects: ['physics', 'design-tech'] },
  'lens-scale': { aoks: ['NAT', 'ART'], subjects: ['biology', 'visual-arts'] },
  'orbital-window': { aoks: ['NAT', 'HIS', 'TEC'], subjects: ['physics', 'history'] },
  'sea-learning-notice': { aoks: ['IND', 'NAT'], subjects: ['geography', 'ess'] },
  'repair-and-memory': { aoks: ['HIS', 'HUM'], subjects: ['history', 'lang-lit'] },
};

export function installEarlierViews(pack: ContentPack): void {
  const uses = new Map(earlierViews.map((record) => [record.key, record]));
  pack.exhibits = pack.exhibits.map((exhibit) => {
    if (!exhibit.specimen || exhibit.specimen.revisit) return exhibit;
    const record = uses.get(exhibit.specimen.key);
    if (!record) return exhibit;
    return { ...exhibit, specimen: { ...exhibit.specimen, revisit: { map: record.map, prop: record.prop,
      method: record.method, hint: `Equip it and look for ${record.title.toLowerCase()}.` } } };
  });
}

function viewingObjective(record: EarlierView): Objective {
  return { id: record.flag, title: record.method, essential: false, visible: { flag: `${record.flag}.begun`, eq: true },
    done: { all: [{ flag: `${record.flag}.view.0`, eq: true }, { flag: `${record.flag}.view.1`, eq: true },
      { any: ['single', 'paired'].map((layout) => ({ flag: `${record.flag}.layout`, eq: layout })) }] },
    onComplete: [{ journal: `j.${record.flag}` }],
    weave: { concepts: ['perspective', 'explanation', 'evidence', 'responsibility'], framework: ['scope', 'perspectives', 'methods-and-tools'],
      ...disciplines[record.id], atl: ['thinking', 'research', 'communication'],
      thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }, minutes: 3 },
  };
}

export const earlierViewsContent = {
  missions: earlierViews.map((record) => ({ id: record.prop, world: record.world, title: record.title,
    knowledgeQuestion: record.question, stake: record.request, objectives: [viewingObjective(record)] })),
  journal: earlierViews.map((record) => ({ id: `j.${record.flag}`, text: record.journal, claimKind: 'observation' })),
  hints: earlierViews.flatMap((record) => [`Bring the equipped object. ${record.firstHint}`, record.method,
    record.thirdHint, record.placements.map(({ label }) => label).join(' · '),
  ].map((text, i) => ({ id: `h.${record.flag}.${i + 1}`, objective: record.flag, depth: (i + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
