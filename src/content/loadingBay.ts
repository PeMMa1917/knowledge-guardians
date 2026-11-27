import { LOAD_FIXES, LOAD_NOTCHES, LOAD_ROUTES, loadKey, type LoadState } from '../domain/loadingBay';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import records from './loading-bay-records.json';

export const LOAD_GROUP = 'loading-bay';
export const LOAD_GATE: Condition = { objective: 'council.arrival' };
export const LOAD_CHECK_MAP = 'council.load-check';
export const LOAD_CASES = records.map((record) => {
  const key = loadKey(record.slug);
  const [left, right, leftSlot, rightSlot] = record.load;
  const load: LoadState = [left, right, leftSlot, rightSlot];
  return {
    ...record, load, exhibit: `OBJ-LOAD-${record.slug}`, source: `HIS-LOAD-${record.slug}`, card: `card.${key}`,
    objective: `${key}.received`, returnObjective: `${key}.refitted`, returnProp: `loading-${record.slug}-return`,
  };
});
export type LoadCase = (typeof LOAD_CASES)[number];

function runObjectives(record: LoadCase): [Objective, Objective] {
  const key = loadKey(record.slug);
  return [{
    id: record.objective, title: `Try the two axle notches and send the cart for ${record.name}.`, essential: false,
    visible: { card: record.card }, done: { all: [
      { card: record.card }, ...LOAD_NOTCHES.map((notch) => ({ flag: `${key}.notch.${notch}`, eq: true })),
      { flag: `${key}.axle`, in: [...LOAD_NOTCHES] },
      { any: LOAD_ROUTES.map((route) => ({ all: [{ flag: `${key}.route`, eq: route }, { flag: `${key}.received`, eq: route }] })) },
    ] },
    onComplete: [{ journal: `j.${record.objective}` }],
    weave: {
      concepts: ['evidence', 'explanation', 'interpretation', 'perspective', 'responsibility'],
      framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
      atl: ['thinking', 'communication', 'social'], aoks: ['MAT', 'HIS', 'ART'], subjects: ['physics', 'design-tech', 'history'], minutes: 4,
    },
  }, {
    id: record.returnObjective, title: `Fit a second load beside ${record.name}.`, essential: false,
    visible: { item: `item.specimen.${record.key}` }, done: { all: [
      { objective: record.objective }, { flag: `${key}.repeat`, eq: true },
      ...LOAD_FIXES.map((fix) => ({ flag: `${key}.test.${fix}`, eq: true })), { flag: `${key}.fit`, in: [...LOAD_FIXES] },
    ] },
    onComplete: [{ journal: `j.${record.returnObjective}` }],
    weave: {
      concepts: ['evidence', 'explanation', 'certainty', 'justification', 'responsibility'],
      framework: ['scope', 'methods-and-tools', 'ethics'], thinking: { dok: 3, bloom: 'evaluate', fink: 'application', solo: 'relational' },
      atl: ['thinking', 'self-management'], aoks: ['MAT', 'NAT'], subjects: ['physics', 'design-tech', 'math-aa'], minutes: 3,
    },
  }];
}

const objectives = LOAD_CASES.flatMap(runObjectives);

export const loadingBayContent = {
  sources: LOAD_CASES.map((record) => ({
    id: record.source, title: `${record.institution}, ${record.originalTitle}, ${record.accession}`,
    url: record.catalog, locator: 'Catalogue title, authorship, date, material, dimensions and image of this accession',
    supports: record.evidence, accessed: '2026-11-26',
  })),
  exhibits: LOAD_CASES.map((record) => ({
    id: record.exhibit, name: record.name, historicalLabel: 'documented', art: 'council.record',
    dateText: record.date, dateKind: record.dateKind,
    summary: `${record.attribution}. ${record.origin}. ${record.medium}. ${record.dimensions}. ${record.evidence}`,
    altText: record.altText, sources: [record.source], grantsCard: record.card,
    specimen: { key: record.key, accession: record.accession, institution: record.institution, source: record.source,
      objective: record.objective, pixelAsset: record.asset, revisit: { map: LOAD_CHECK_MAP, prop: record.returnProp,
        method: `Try the return load for ${record.name} at its own rack.`,
        hint: `Equip ${record.name} and visit its rack in the Council Cart Bay.` },
    },
  })),
  cards: LOAD_CASES.map((record) => ({
    id: record.card, title: `${record.name} · ${record.accession}`, historicalLabel: 'documented',
    claimKind: 'observation', sources: [record.source], text: record.evidence, limits: record.limit,
  })),
  missions: [{
    id: 'KG-CH15-R26', world: 'WORLD-16', title: 'The Cart Finds Its Centre', available: LOAD_GATE,
    stake: 'Hale has room for a self-service cart. Essi has hands to demonstrate a load. Both have a line of waiting carriers.',
    knowledgeQuestion: 'When do the results from a carefully matched trial still apply to the load in front of you?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: LOAD_CASES.flatMap((record) => [{ id: `j.${record.objective}`, claimKind: 'observation',
    text: `I read ${record.name} (${record.accession}) and kept its claim separate from the made-up load. I moved the axle between notches and carried the marked cart to a receiver.` },
  { id: `j.${record.returnObjective}`, claimKind: 'observation',
    text: `I returned with the copy of ${record.name}. The first mark faced a changed load. I tried the other axle notch and the inner strap separately before leaving one fit.` }]),
  hints: LOAD_CASES.flatMap((record) => [
    ['The boxes stay in place while you move the axle.', `Open the exact record for ${record.name} beside the practice cart.`,
      'Try both axle notches. Keep both readings, then mark the notch that you want your receiver to try.',
      'Deliver to Hale’s low Time Hall bench or Essi’s Bell Rail handover. Each offers a different way to use the two readings.'],
    ['A new load makes the old axle mark into a fresh claim.', `Equip ${record.name}, then look for its return rack through the second door in the Cart Bay.`,
      'Run the changed load on your old mark. Keep that result when you try each change on its own.',
      'Leave the other axle notch open or tie the changed box at the nearer ring. Your fitted position and result stay at this rack.'],
  ].flatMap((lines, phase) => lines.map((text, index) => {
    const objective = phase === 0 ? record.objective : record.returnObjective;
    return { id: `h.${objective}.${index + 1}`, objective, depth: (index + 1) as Hint['depth'], text };
  }))),
} satisfies Partial<ContentPack>;
