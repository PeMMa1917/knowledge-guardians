import type { Condition, ContentPack, Hint } from '../domain/types';

export const TURNING_GROUP = 'turning-table';
export const TURNING_EXHIBIT = 'OBJ-KUNIT-COAST-390A';
export const TURNING_OBJECTIVE = 'turning.kunit.received';
export const TURNING_CARD = 'card.turning.kunit';
export const TURNING_GATE: Condition = { objective: 'sea.arrival' };
export const KUNIT_KEY = 'nka:holm-collection-fig390-a';
export const KUNIT_REVISIT = { map: 'sea.turning-room', prop: 'turning-working-copy', method: 'Use a raised end stop when a second reader turns a relief block.',
  hint: 'Equip the working copy and return to the second rack in Lantern House’s Turning Room.' };
const F = 'turning.kunit';

export const turningTableContent = {
  dialogue: [{ id: 'turning.worked-return', speaker: 'sea-cartographer', historicalLabel: 'fictional-world',
    text: 'Your working copy keeps Kunit’s role as maker and teller beside Holm’s record. The new practice block has two ends that feel alike. A visitor coming from the wall reads the shallow mark first. We can fit an end stop at the wall or let a second reader take the two positions in turn.',
    options: [
      { text: 'Fit a fixed end stop for arrivals from the wall.', effects: [{ setFlag: 'turning.kunit.revisit', value: 'stop' }] },
      { text: 'Give the second reader the reversible rack.', effects: [{ setFlag: 'turning.kunit.revisit', value: 'pair' }] },
      { text: 'Rest the block back on its rack.' },
    ] }],
  sources: [
    { id: 'HIS-KUNIT-WALTERS', title: 'The Walters Art Museum, Part of Greenland Coast [and Islands]',
      url: 'https://web.archive.org/web/20110722174154/http://thewalters.org/exhibits/maps/image_pages/inuit.html',
      locator: 'Archived exhibition label and lender credit',
      supports: 'The exhibition identifies Kunit of Umivik, gives 1884 and wood, and credits the Greenland National Museum and Archives, Nuuk.', accessed: '2026-11-26' },
    { id: 'HIS-KUNIT-HOLM', title: 'Gustav Holm, 1886 article on wooden maps, Geografisk Tidsskrift 8',
      url: 'https://tidsskrift.dk/geografisktidsskrift/article/view/48890', locator: 'Page 104 and the account of the February 1885 exchange',
      supports: 'Holm records receiving the coast-and-islands map from Kunit on 8 February 1885. He reports that Kunit carved the map and showed him how features represented the coast.', accessed: '2026-11-26' },
    { id: 'HIS-KUNIT-FIGURE', title: 'W. Thalbitzer, Ethnographical collections from East Greenland, figure 390 A',
      url: 'https://archive.org/details/ammassalikeskimo3919thal', locator: 'Meddelelser om Grønland 39 (1914), pp. 665–666, figure 390 A. See also Holm’s account on pp. 107–108.',
      supports: 'Figure 390 A is the mainland coast piece in the Holm collection. The companion island strip is figure 390 B. The account describes turning and moving the pieces in relation to one another.', accessed: '2026-11-26' },
    { id: 'HIS-KUNIT-HARMSEN', title: 'Archaeology, Wooden Inuit Maps',
      url: 'https://archaeology.org/issues/may-june-2019/collection/maps-greenland-wooden-inuit-maps/mapping-the-past/',
      locator: 'Caption, left-hand coast piece, and comments from curator Hans Harmsen',
      supports: 'The caption gives 5.5 by 2 inches for the coast piece. Harmsen discusses how the forms helped one person tell another about a route.', accessed: '2026-11-26' },
  ],
  exhibits: [{
    id: TURNING_EXHIBIT, name: 'Kunit’s carved East Greenland coast piece',
    historicalLabel: 'documented', art: 'turning.kunit-case',
    dateText: 'Dated 1884 in the Walters exhibition. Exchange recorded on 8 February 1885.',
    dateKind: 'The Walters exhibition dates the wood piece to 1884. The second date records when Holm received it from Kunit.',
    summary: 'The exhibition credits Kunit of Umivik. This carved wood piece depicts mainland coast in East Greenland. Thalbitzer identifies it as figure 390 A, alongside the separate islands piece 390 B. The coast piece measures 5.5 by 2 inches in the published display. The Greenland National Museum and Archives in Nuuk is the credited lender.',
    altText: 'A plain outline marks the size of the coast piece. Separate tabs show the credited maker, the exchange date and the printed figure number.',
    sources: ['HIS-KUNIT-WALTERS', 'HIS-KUNIT-HOLM', 'HIS-KUNIT-FIGURE', 'HIS-KUNIT-HARMSEN'], grantsCard: TURNING_CARD,
    specimen: { key: KUNIT_KEY, accession: 'Holm collection, fig. 390 A', institution: 'Greenland National Museum and Archives',
      source: 'HIS-KUNIT-WALTERS', objective: TURNING_OBJECTIVE, revisit: KUNIT_REVISIT },
  }],
  cards: [{
    id: TURNING_CARD, title: 'Kunit’s coast piece and the island piece', claimKind: 'observation', historicalLabel: 'documented',
    sources: ['HIS-KUNIT-WALTERS', 'HIS-KUNIT-HOLM', 'HIS-KUNIT-FIGURE', 'HIS-KUNIT-HARMSEN'],
    text: 'Kunit’s coast piece is the mainland side of a paired representation in the Holm collection. The published account explains how moving the other piece set the islands in relation to that coast. The museum curator Hans Harmsen emphasizes the role of storytelling.',
    limits: 'The period source describes Kunit’s specific work. Our trial uses the invented shore of Lantern House and two smooth practice blocks.',
  }],
  missions: [{
    id: 'KG-CH8-R23', title: 'A Shore You Can Turn', world: 'WORLD-09', available: TURNING_GATE,
    stake: 'A visitor using Lantern House’s practice board has followed the wrong side of a note. Renna needs a useful starting mark or a keeper who can explain the turn.',
    knowledgeQuestion: 'How can a model help someone check a place they cannot see from their side?', caseVisits: [[TURNING_OBJECTIVE]],
    objectives: [{ id: TURNING_OBJECTIVE, title: 'Finish the turn trial and try one support with a reader.', visible: { card: TURNING_CARD }, essential: false,
      done: { all: [{ card: TURNING_CARD }, { flag: `${F}.note`, eq: true }, { flag: `${F}.fixed`, eq: true }, { flag: `${F}.shifted`, eq: true },
        { any: ['rail', 'keeper'].map((route) => ({ all: [{ flag: `${F}.route`, eq: route }, { flag: `${F}.read`, eq: route }] })) }] },
      onComplete: [{ journal: `j.${F}` }], weave: {
        concepts: ['evidence', 'interpretation', 'perspective', 'culture', 'responsibility'],
        framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], atl: ['thinking', 'research', 'communication'],
        aoks: ['HIS', 'ART', 'MAT'], subjects: ['geography', 'history', 'design-tech'],
        thinking: { dok: 3, bloom: 'apply', fink: 'integration', solo: 'relational' }, minutes: 5,
      } }],
  }],
  journal: [{ id: `j.${F}`, claimKind: 'observation', text: 'I used the records for Kunit’s own coast piece. I watched what changed when a fictional practice block turned and its other piece stayed fixed. I moved the island peg and checked one support with a reader.' }],
  hints: [
    'Study where the guide stays when you turn the coast block.',
    'Read Kunit’s catalogue case and the trial note in the Turning Room.',
    'Turn the block without moving the island peg. Then slide the peg to compare the new relationship.',
    'Bring a fixed starting mark to the low rail or ask Renna to show both positions at the speaking table.',
  ].map((text, index) => ({ id: `h.${F}.${index + 1}`, objective: TURNING_OBJECTIVE, depth: (index + 1) as Hint['depth'], text })),
} satisfies Partial<ContentPack>;
