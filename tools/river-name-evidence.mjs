const source = 'tests/river-names.test.ts';
export const riverNameProofs = [
  {
    source,
    map: 'sea.the-last-oven',
    target: 'river-names-spool',
    objective: 'rivernames.walks',
    anchor: "expect(warmfinTrail(d.s)).toContain('back past Reed Stair')",
    action:
      'Run the same thread at different water levels. At the flooded stair the parcel stays in the walker’s coat. Recover the slack and take the other edge of the board. The hands at the oven and shutter supply the two deliveries.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'Changing the water level on an otherwise identical path changes whether the walker can cross it. Following a warm brick alone cannot prove somebody received the parcel.',
      },
    ],
    dimensions: [
      'area:NAT',
      'area:HUM',
      'subject:geography',
      'concept:explanation',
      'framework:methods-and-tools',
      'question:KQ-ROUTE-02',
    ],
    elements: ['game:122', 'story:85'],
  },
  {
    source,
    map: 'sea.the-last-oven',
    target: 'river-names-stamp',
    objective: 'rivernames.smallblock',
    anchor: "expect(readersInBlock('flood', 'block')).toEqual([13])",
    action:
      'Stamp a geographic block containing two active receiving doors at low water. Keep the extent fixed and try it at high water. The recipient who knows which doors still take household bread can identify one household from the same unnamed block.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Intersecting the fixed block and the currently active receiving addresses in the fictional directory leaves a definite set. It contains two addresses in one condition and one in the other.',
      },
    ],
    dimensions: [
      'micro:630',
      'micro:664',
      'area:MAT',
      'area:HUM',
      'subject:geography',
      'concept:power',
      'framework:ethics',
      'framework:methods-and-tools',
      'question:KQ-ROUTE-16',
    ],
    elements: ['game:184', 'game:169', 'story:95'],
    comparison: {
      areas: [
        {
          id: 'MAT',
          method: 'Track set membership as water levels change while keeping the block fixed.',
          limit:
            'A count establishes the possible receiving doors only for the given fictional directory and time.',
        },
        {
          id: 'HUM',
          method: 'Ask a household how an observer standing on the quay uses the local delivery list.',
          limit:
            'Knowledge of the observer’s sources and the household’s wishes affects what publishing the count does to people.',
        },
      ],
      concepts: ['power'],
      framework: ['ethics', 'methods-and-tools'],
      connection:
        'The Guardian can count the candidates and then publish a public service window, provide a guide or issue a broader stamp. The count constrains the inference and the family has its own say in the release.',
    },
  },
  {
    source,
    map: 'sea.the-last-oven',
    target: 'river-names-spool',
    objective: 'rivernames.placename',
    anchor: "expect(d.done('rivernames.placename')).toBe(true)",
    action:
      'Use both named source leaves, take a single pin to the high-water walker and watch her lift it from her own sheet. Keep Emlet’s morning pin in his account. Try a jointly changeable route or separate tide slips.',
    reasoning: [
      {
        mode: 'analogical',
        basis:
          'The public Nunavut programme describes names carrying routes and events. The fictional river offers an independent example where a fixed point omits an environmental relationship, without conferring authority over the real names.',
      },
    ],
    dimensions: [
      'micro:828',
      'area:HIS',
      'theme:IND',
      'subject:geography',
      'concept:interpretation',
      'framework:perspectives',
      'question:KQ-ROUTE-14',
    ],
    elements: ['game:209', 'story:52', 'story:56'],
  },
  {
    source,
    map: 'sea.the-last-oven',
    target: 'river-names-press',
    objective: 'rivernames.mapmakers',
    anchor: "expect(d.done('rivernames.mapmakers')).toBe(true)",
    action:
      'Let Emlet and Rialla independently alter the two mapped traces. A changed successful walk invalidates the corresponding signature until its own walker checks it again. A public service address can be released while the household keeps its sleeping place out of the edition.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'An addressed packet has to work for both its two contributors and for someone receiving it elsewhere. The fixed signatures and the later recipient show who can use, revise or refuse the published layer.',
      },
    ],
    dimensions: [
      'micro:824',
      'theme:IND',
      'subject:geography',
      'concept:culture',
      'framework:perspectives',
      'question:KQ-ROUTE-24',
    ],
    elements: ['game:122', 'story:74'],
  },
  {
    source,
    map: 'water.letter-quay',
    target: 'river-names-fold-in',
    objective: 'rivernames.postmark',
    anchor: "expect(unpacked(d.s, 'flood', 'stranger').candidates).toEqual([12, 18])",
    action:
      'Send the same words from both waters, then send the name and hand shape. Open the identical revised slip with a visitor and a relief walker who learned the sign on that landing. The visitor cannot reconstruct the same address until another medium or another person supplies what is missing.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'With the received marks held fixed, the walked convention changes whether the reader can recover the intended landing. Sending the destination explicitly supplies another route to that information.',
      },
    ],
    dimensions: [
      'micro:18',
      'micro:231',
      'area:HIS',
      'theme:LAN',
      'theme:IND',
      'concept:interpretation',
      'framework:scope',
      'question:KQ-ROUTE-09',
      'question:KQ-ROUTE-10',
    ],
    elements: ['game:193', 'story:107', 'story:114'],
  },
  {
    source,
    map: 'water.letter-quay',
    target: 'river-names-council',
    objective: 'rivernames.partners',
    anchor: "expect(d.done('rivernames.partners')).toBe(true)",
    action:
      'Open the account by Bartlett, Murdena Marshall and Albert Marshall and stay for the actual delivery. Put the decision about the next map in the hands of the person who climbs the stairs or a working pair who will test separate rounds. The resulting seat or landing appears on the quay.',
    reasoning: [
      {
        mode: 'analogical',
        basis:
          'The authors’ account of continuing co-learning raises a question about who can direct later work. The new fictional receiver has specific concerns that the original walkers could not sign away.',
      },
    ],
    dimensions: [
      'micro:1058',
      'area:HUM',
      'theme:IND',
      'concept:responsibility',
      'framework:ethics',
      'question:KQ-ROUTE-17',
    ],
    elements: ['game:21', 'story:95', 'story:114'],
  },
];
