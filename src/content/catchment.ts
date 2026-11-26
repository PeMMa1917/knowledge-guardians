import type { Condition, ContentPack, Hint } from '../domain/types';

const read = (suffix: string): Condition => ({ flag: `catchment.${suffix}`, eq: true });
const bothPegs: Condition = { all: [read('upper'), read('lower')] };
const bothRuns: Condition = { all: [read('trial.pocket'), read('trial.open')] };
const matchingReceipt: Condition = { any: ['rows', 'crossing'].map((notice) => ({ all: [
  { flag: 'catchment.notice', eq: notice }, { flag: 'catchment.checked', eq: notice },
] })) };
const takeCopy = {
  text: 'Take the signed crossing copy.', if: { not: { item: 'item.catchment.crossing-copy' } },
  effects: [{ giveItem: 'item.catchment.crossing-copy' }],
};

function hints(id: string, lines: readonly [string, string, string, string]): Hint[] {
  const depths = [1, 2, 3, 4] as const;
  return depths.map((depth) => ({ id: `h.${id}.${depth}`, objective: id, depth, text: lines[depth - 1] }));
}

export const catchmentContent = {
  sources: [{ id: 'HIS-WHANGANUI-TUPUA', title: 'Tupua te Kawa',
    url: 'https://www.ngatangatatiaki.co.nz/our-story/tupua-te-kawa/', locator: 'Opening public catchment explanation',
    supports: 'The trust explains Whanganui Iwi’s relationship with Te Awa Tupua, and describes how waterways in the catchment are considered as parts of the living whole.',
    accessed: '2026-11-26', mla: { kind: 'page', title: 'Tupua te Kawa', container: 'Ngā Tāngata Tiaki o Whanganui', showAccessDate: true } }],
  dialogue: [
    { id: 'catchment.source', speaker: 'narrator', claimKind: 'observation', historicalLabel: 'documented', citationSource: 'HIS-WHANGANUI-TUPUA',
      text: 'Ngā Tāngata Tiaki o Whanganui’s public account explains how Whanganui Iwi understand Te Awa Tupua as a living whole. It connects the waters from mountains to sea with the people and their responsibilities. The nearby float model was built by Omi for the Water Commons.',
      effects: [{ setFlag: 'catchment.source', value: true }] },
    { id: 'catchment.rows', speaker: 'water-keeper', historicalLabel: 'fictional-world',
      text: '“I watched the first seed load across. The grower can start while there’s light. The other bank hasn’t got a watcher yet. Leave that space open on the notice.” Omi clips on a signed receipt.',
      effects: [{ setFlag: 'catchment.checked', value: 'rows' }], options: [takeCopy] },
    { id: 'catchment.crossing', speaker: 'water-keeper', historicalLabel: 'fictional-world',
      text: '“Both banks have signed. I had to hold the seed load through another bell. Two signatures, and the packet still complains about the wait.” Omi hands you the low rail’s receipt.',
      effects: [{ setFlag: 'catchment.checked', value: 'crossing' }], options: [takeCopy] },
    { id: 'catchment.civic.rows', speaker: 'narrator', historicalLabel: 'fictional-world',
      text: 'The Canal crew has opened one lane for loads with a signed receiver. Your terrace receipt is pinned to it. The line for the other bank has its own time and an empty box for a watcher.',
      effects: [{ setFlag: 'catchment.civic.rows', value: true }] },
    { id: 'catchment.civic.crossing', speaker: 'narrator', historicalLabel: 'fictional-world',
      text: 'The Canal crew has booked a staffed round where callers can see both sides of the rail. Your low-rail receipt hangs by the clock. The first carrier waits in the shade until the second watcher checks in.',
      effects: [{ setFlag: 'catchment.civic.crossing', value: true }] },
  ],
  missions: [
    { id: 'KG-CH11-R21', world: 'WORLD-12', title: 'Below the Gauge',
      knowledgeQuestion: 'When can observations at two places support a shared decision?',
      stake: 'Omi can spare one watcher. An early seed load and a waiting bank both need the same person.',
      available: { any: [read('upper'), read('lower')] }, objectives: [
        { id: 'catchment.pegs', title: 'Match the upper and lower crew’s marks from second bell.', done: bothPegs, essential: false,
          weave: { concepts: ['evidence', 'perspective', 'interpretation'], framework: ['scope', 'perspectives'], aoks: ['NAT', 'HUM'],
            atl: ['research', 'self-management'], subjects: ['geography', 'ess'], thinking: { dok: 2, bloom: 'analyse', fink: 'integration', solo: 'multistructural' }, minutes: 3 } },
        { id: 'catchment.read', title: 'Read the Whanganui Iwi account kept below the two pegs.', visible: { objective: 'catchment.pegs' }, done: read('source'), essential: false,
          weave: { concepts: ['culture', 'responsibility', 'perspective'], framework: ['perspectives', 'ethics'], aoks: ['HUM', 'IND'],
            atl: ['research', 'thinking'], subjects: ['geography', 'anthropology'], thinking: { dok: 2, bloom: 'understand', fink: 'human', solo: 'relational' }, minutes: 2 } },
        { id: 'catchment.compare', title: 'Release the same pulse into both pocket settings and keep the traces.', visible: { objective: 'catchment.pegs' }, done: bothRuns, essential: false,
          kq: { id: 'KQ-CATCHMENT-01', action: 'compare two connected traces' },
          weave: { concepts: ['objectivity', 'explanation', 'evidence', 'certainty'], framework: ['scope', 'methods-and-tools'], aoks: ['NAT', 'MAT'],
            atl: ['thinking', 'research'], subjects: ['ess', 'physics', 'math-ai'], thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4 } },
        { id: 'catchment.local-receipt', title: 'Post a crossing notice, use its passage and read the crew’s receipt.',
          visible: { objective: 'catchment.compare' }, done: matchingReceipt, essential: false, onComplete: [{ journal: 'j.catchment' }],
          kq: { id: 'KQ-CATCHMENT-01', action: 'follow the issued footboard notice' },
          weave: { concepts: ['power', 'values', 'responsibility', 'justification'], framework: ['perspectives', 'ethics'], aoks: ['HUM', 'POL'],
            atl: ['social', 'communication'], subjects: ['ess', 'global-politics'], thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' }, minutes: 4 } },
      ] },
    { id: 'KG-CH12-R18', world: 'WORLD-13', title: 'A Watcher at the Canal',
      available: { all: [{ objective: 'civic.arrival' }, { objective: 'catchment.local-receipt' }, { item: 'item.catchment.crossing-copy' }] },
      knowledgeQuestion: 'How can a second crew use a test while keeping its original conditions in sight?',
      stake: 'Both Canal Walk teams need a reading they can act on before they move a load.', objectives: [
        { id: 'catchment.civic.receipt', title: 'Check how the Canal crew put the Commons receipt to use.', essential: false,
          done: { any: [read('civic.rows'), read('civic.crossing')] },
          kq: { id: 'KQ-CATCHMENT-01', action: 'check the next crew’s use' },
          weave: { concepts: ['responsibility', 'power', 'justification'], framework: ['ethics', 'scope'], aoks: ['HUM', 'POL'],
            atl: ['communication', 'social'], subjects: ['global-politics', 'geography'], thinking: { dok: 3, bloom: 'apply', fink: 'integration', solo: 'relational' }, minutes: 3 } },
      ] },
  ],
  hints: [
    ...hints('catchment.pegs', ['Two crews left marks from the same bell.', 'Look by the keeper’s path at the Old Weir and near the bend on the lower path.', 'Each note points to part of the same passage.', 'Read the reed mark at the Old Weir and the matching mark west of the lower river. The hatch appears below the lower note.']),
    ...hints('catchment.read', ['Omi keeps a public account near the floats.', 'Find the folder west of the model.', 'The folder attributes the account to Whanganui Iwi’s trust.', 'Open the travelling copy from Whanganui Iwi and use its source line to see where the account comes from.']),
    ...hints('catchment.compare', ['Change the pocket while keeping the pulse.', 'The model is behind the service hatch below the lower reed mark.', 'Keep six floats at the top each time. See where the lower count changes.', 'Release six floats with the pocket exposed. Cover the pocket and release six again. Read both rows of the kept ledger.']),
    ...hints('catchment.local-receipt', ['Omi can staff one plan at a time.', 'The terrace can start now. The low rail needs both crews to arrive.', 'Post a notice at the float model and look for the matching door.', 'Use the terrace footboard door or staffed rail door. Read the signed receipt at the place it takes you. You can then try the other notice.']),
    ...hints('catchment.civic.receipt', ['Your checked notice travelled to Canal Walk.', 'Look for the receiving rail in the dock lane.', 'The new watch uses the method from your receipt.', 'Read the single-lane transfer or the paired transfer on Canal Walk.']),
  ],
  questions: [{ id: 'KQ-CATCHMENT-01', text: 'When does a reading at one stop justify a decision at another?',
    lastWord: 'Look for a connection between the stops and tell the next reader where the observation ends.' }],
  items: [{ id: 'item.catchment.crossing-copy', name: 'Omi’s signed crossing copy', historicalLabel: 'fictional-world', art: 'preserved.slip',
    description: 'The signed notice travels to Canal Walk. The receipt keeps the original crossing’s watchers and the work that has to wait.' }],
  journal: [{ id: 'j.catchment', claimKind: 'interpretation',
    text: 'The upper peg kept the same count while the lower reading changed. I checked the opened crossing and heard which crew would still wait.' }],
  moments: [{ id: 'mom.catchment-watcher', attribute: 'caring', when: { objective: 'catchment.local-receipt' },
    did: 'You read the crossing receipt and kept the waiting crew in view.', prompt: 'When could the crew you put second safely cross?' }],
} satisfies Partial<ContentPack>;
