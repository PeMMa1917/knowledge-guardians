import type { ContentPack, Hint } from '../domain/types';

export const TIMBUKTU_CARD = 'card.timbuktu.season-copy';
export const TIMBUKTU_EXHIBIT = 'OBJ-TIMBUKTU-SEASON-COPY';
export const TIMBUKTU_SOURCE = 'HIS-TIMBUKTU-SEASON-COPY';
export const TIMBUKTU_MARC = 'HIS-TIMBUKTU-SEASON-MARC';
export const TIMBUKTU_OBJECTIVE = 'timbuktu.seasons.received';
export const TIMBUKTU_FLAG = 'timbuktu.seasons';
export const TIMBUKTU_OPEN = { objective: 'coast.revise' };
export const TIMBUKTU_AUTHOR = 'Nasir al-Din Abu al-Abbas Ahmad ibn al-Hajj al-Amin al-Tawathi al-Ghalawi';
export const TIMBUKTU_TITLE = 'The Important Stars Among the Multitude of the Heavens';

const hintText = [
  'Read the 1733 manuscript record in the Bell Archive. The date belongs to the copy.',
  'At the sighting board, use the guide to find where each marker first appears above the model skyline.',
  'Choose a quick repeat for the quay readers or keep both horizons together for the headland observer.',
  'Use the archive door or headland stairs. Put your tracing on the receiving board and check what the next reader can use.',
];

export const timbuktuManuscriptContent = {
  sources: [
    {
      id: TIMBUKTU_SOURCE, title: 'Library of Congress, Structure of the Heavens, object 1',
      url: 'https://www.loc.gov/exhibits/mali/mali-exhibit.html#obj1',
      locator: 'Object 1 caption and description, recto and verso loan',
      supports: 'The caption names the author and the Mamma Haidara Commemorative Library in Timbuktu. It dates the manuscript copy to 1733. The description relates stellar motions to the calculation of the beginning of seasons.',
      accessed: '2026-11-26',
    },
    {
      id: TIMBUKTU_MARC, title: 'Library of Congress, The Important Stars Among the Multitude of the Heavens, LCCN 2021667561',
      url: 'https://lccn.loc.gov/2021667561/marcxml',
      locator: 'LCCN 2021667561, MARC fields 245, 246, 500, 520, 535, 546 and 720',
      supports: 'The World Digital Library record identifies Arabic content, a staff-supplied English title, an astronomical diagram and the original at the Mamma Haidara Commemorative Library.',
      accessed: '2026-11-26',
    },
  ],
  exhibits: [{
    id: TIMBUKTU_EXHIBIT, name: `${TIMBUKTU_TITLE} · 2021667561`, art: 'timbuktu.horizon-case',
    historicalLabel: 'documented', dateText: 'Copy dated 1733', dateKind: 'Date of this manuscript copy',
    summary: `Kashf al-Ghummah fi Nafa al-Ummah. The catalogue identifies ${TIMBUKTU_AUTHOR} as the author. The original is held at the Mamma Haidara Commemorative Library in Timbuktu, Mali. The Library of Congress provides the online record.`,
    altText: 'A closed catalogue folder beside two invented skyline slips. The manuscript itself is available through the source.',
    sources: [TIMBUKTU_SOURCE, TIMBUKTU_MARC], grantsCard: TIMBUKTU_CARD,
    specimen: { key: 'loc:2021667561', institution: 'Library of Congress', accession: '2021667561', source: TIMBUKTU_MARC, objective: TIMBUKTU_OBJECTIVE },
  }],
  cards: [{
    id: TIMBUKTU_CARD, title: 'The 1733 astronomical manuscript copy · 2021667561', claimKind: 'observation',
    historicalLabel: 'documented', sources: [TIMBUKTU_SOURCE, TIMBUKTU_MARC],
    text: 'In this treatise, the author discusses using changes in stellar positions to calculate seasonal beginnings. The Library of Congress records a diagram of the rotation of the heavens in the copy.',
    limits: 'The catalogue dates this copy and attributes authorship. It does not identify the copyist or locate a particular observation by the author. The practice skylines in the archive are fictional.',
  }],
  missions: [{
    id: 'KG-CH4-R76', world: 'WORLD-05', title: 'Past the Roof Line', available: { card: TIMBUKTU_CARD },
    knowledgeQuestion: 'When can a repeated observation travel from one place to another?',
    stake: 'At the next demonstration, the quay readers may treat a backed-up skyline as a change in the stars.',
    objectives: [{
      id: TIMBUKTU_OBJECTIVE, essential: false, title: 'Trace the two horizons and bring your sighting copy to a reader.',
      done: { all: [{ card: TIMBUKTU_CARD }, { flag: `${TIMBUKTU_FLAG}.read.0`, eq: true },
        { flag: `${TIMBUKTU_FLAG}.read.1`, eq: true }, { any: [
          { all: [{ flag: `${TIMBUKTU_FLAG}.sent`, eq: 'quay' }, { flag: TIMBUKTU_OBJECTIVE, eq: 'quay' }] },
          { all: [{ flag: `${TIMBUKTU_FLAG}.sent`, eq: 'headland' }, { flag: TIMBUKTU_OBJECTIVE, eq: 'headland' }] },
        ] }],
      },
      onComplete: [{ journal: 'j.timbuktu.seasons' }],
      weave: {
        concepts: ['evidence', 'explanation', 'perspective', 'certainty', 'responsibility'],
        framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], aoks: ['HIS', 'NAT'],
        subjects: ['physics', 'history', 'math-ai'], atl: ['research', 'thinking', 'communication'],
        thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 5,
      },
    }],
  }],
  hints: hintText.map((text, i) => ({ id: `h.timbuktu.seasons.${i + 1}`, objective: TIMBUKTU_OBJECTIVE, depth: (i + 1) as Hint['depth'], text })),
  journal: [{ id: 'j.timbuktu.seasons', claimKind: 'simulation',
    text: 'I traced the same two practice markers against two skylines. An obstruction changed where a marker was first visible. I kept the record of the 1733 copy with the practice result.' }],
} satisfies Partial<ContentPack>;
