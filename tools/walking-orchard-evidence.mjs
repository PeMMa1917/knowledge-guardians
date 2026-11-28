const source = 'tests/walking-orchard.test.ts',
  yard = 'forest.walking-orchard',
  square = 'civic.grove-square';
export const orchardProofs = [
  {
    source,
    map: yard,
    target: 'walking-grove-bed-bath',
    objective: 'grove.tracks',
    anchor: 'unlocks the old cartway in both directions',
    action:
      'Follow the lone heel, the choir inside the leaves and the broken chalk ring. The three clues become a cartway after the player buys an evening and reaches the later town.',
    reasoning: [
      {
        mode: 'abductive',
        basis:
          'A wheeled tub moved by people can fit the musical and physical traces. A footprint alone cannot identify a night walker.',
      },
    ],
    dimensions: [
      'concept:explanation',
      'concept:evidence',
      'area:NAT',
      'framework:methods-and-tools',
      'question:KQ-ROUTE-22',
    ],
    elements: ['game:13', 'story:48', 'story:77'],
  },
  {
    source,
    map: yard,
    target: 'walking-grove-bed-kiln',
    objective: 'grove.wheel',
    anchor: 'separates a sufficient mechanism from a claim about the missing caller',
    action:
      'Cross new chalk with a leafy and a bare tub, each with the boot hung and tied. Pella accepts either a demonstration of the cart or an open place for the missing night caller.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'Holding the tub fixed and changing the shoe changes the heel mark. Changing only the load changes the sound and leaves the heel outcome intact.',
      },
      {
        mode: 'abductive',
        basis:
          'An ordinary cart is sufficient to explain the old heel alongside the rims. The experiment cannot establish who pulled it on the original night.',
      },
    ],
    dimensions: [
      'micro:55',
      'micro:56',
      'framework:methods-and-tools',
      'framework:scope',
      'area:NAT',
      'area:HIS',
      'concept:explanation',
      'concept:evidence',
      'question:KQ-ROUTE-23',
    ],
    elements: ['game:234', 'story:48', 'story:77'],
    comparison: {
      areas: [
        {
          id: 'NAT',
          method: 'Change the shoe position under both loads and retain each fresh print.',
          limit: 'A repeatable mechanical effect cannot name the driver of an earlier cart.',
        },
        {
          id: 'HIS',
          method: 'Compare the new prints with the older heel and the singers’ account from that night.',
          limit: 'A match leaves several possible people and does not show that each tub was alive.',
        },
      ],
      framework: ['scope', 'methods-and-tools'],
      concepts: ['evidence', 'explanation'],
      connection:
        'A repeatable mechanism can narrow a reconstruction while leaving an unrepeatable event underdetermined.',
    },
  },
  {
    source,
    map: yard,
    target: 'walking-grove-bed-steps',
    objective: 'grove.springs',
    anchor: 'bounds two springs at matching dates',
    action:
      'Open all twelve bed views and match the two springs by date. The interval for change crosses zero. Hold the incomparable pair up too and make the reason for the different visual impression explicit.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Given confirmed leaves, known losses and no-return marks, calculate both ends of the possible difference without assigning a hidden state to an unobserved tub.',
      },
      {
        mode: 'inductive',
        basis:
          'A later count can suggest a change in the story of the nursery. The two partially observed years limit how confidently the suggestion travels.',
      },
    ],
    dimensions: [
      'micro:24',
      'micro:95',
      'micro:311',
      'micro:908',
      'concept:evidence',
      'concept:certainty',
      'framework:methods-and-tools',
      'framework:scope',
      'area:NAT',
      'area:MAT',
      'subject:biology',
      'subject:math-ai',
      'question:KQ-ROUTE-25',
    ],
    elements: ['game:234', 'story:48', 'story:77'],
    comparison: {
      areas: [
        {
          id: 'NAT',
          method:
            'Visit each bed at the stated season and use an actual leaf or a recorded loss for the field observation.',
          limit: 'A missing return entry leaves the biological state open.',
        },
        {
          id: 'MAT',
          method: 'Use lower and upper totals for both years and subtract opposite ends to bound the change.',
          limit:
            'The arithmetic determines the possible range under these records, not which missing trees survived.',
        },
      ],
      framework: ['methods-and-tools', 'scope'],
      concepts: ['evidence', 'certainty'],
      connection:
        'The evidence for a living organism supplies the endpoints of a calculation. The calculation cannot substitute for another field visit.',
    },
  },
  {
    source,
    map: yard,
    target: 'walking-grove-shade',
    objective: 'grove.shade',
    anchor: 'all twenty-four shutter combinations',
    action:
      'Vary which aspects of the fictional volunteer rota can be seen through the cloth. Compare a whole square to one slip. Carry a permitted group count or keep the rota rolled.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'For each setting the permitted bands and group size determine which proposal can leave the room.',
      },
      {
        mode: 'pragmatic',
        basis:
          'The public count must be usable on the square while respecting the grower who lent it. A smaller or even a large group can carry an unwanted detail.',
      },
    ],
    dimensions: [
      'micro:60',
      'micro:664',
      'area:HUM',
      'concept:power',
      'concept:responsibility',
      'framework:ethics',
      'framework:perspectives',
      'subject:digital-society',
      'question:KQ-ROUTE-16',
    ],
    elements: ['game:234', 'story:11'],
  },
  {
    source,
    map: yard,
    target: 'walking-grove-lamp',
    objective: 'grove.promise',
    anchor: 'independently of all three public projects',
    action:
      'Hang a defensible observation over the lantern and put two coins on a separate proposal. The same evidence can accompany shelter, a public dance or another round of visits.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The choice commits a scarce evening to one use; the stated purpose and cost can change without a change in the underlying observation.',
      },
    ],
    dimensions: [
      'micro:11',
      'micro:31',
      'micro:109',
      'area:HUM',
      'area:ART',
      'concept:values',
      'concept:justification',
      'framework:ethics',
      'framework:perspectives',
      'question:KQ-ROUTE-35',
    ],
    elements: ['game:162', 'story:11', 'story:114'],
  },
  {
    source,
    map: square,
    target: 'walking-grove-installed-return',
    objective: 'grove.turn',
    anchor: 'pursue any later handover',
    action:
      'Walk each installation with the carter and caller. Let the first promise stand, ask the grower to take the lead or leave the opening with the dancers. Reissuing the lamp invites both people back.',
    reasoning: [
      {
        mode: 'analogical',
        basis:
          'The nursery’s handover of a shutter cord becomes a handover of the square. Control of a private detail differs from deciding how a shared evening will be run.',
      },
      {
        mode: 'pragmatic',
        basis: 'The two walks show how a chosen use works for the people who must now live with it.',
      },
    ],
    dimensions: [
      'micro:58',
      'area:HUM',
      'area:ART',
      'concept:perspective',
      'concept:values',
      'framework:ethics',
      'framework:perspectives',
      'subject:theatre',
      'question:KQ-ROUTE-02',
    ],
    elements: ['game:21', 'story:114', 'story:11'],
  },
];
