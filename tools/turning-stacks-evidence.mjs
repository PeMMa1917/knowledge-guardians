const source = 'tests/turning-stacks.test.ts';
const home = { map: 'civic.turning-stacks', target: 'stacks-floor', source };
const quay = { map: 'voices.quay', target: 'stacks-quay-book', source };
export const stacksProofs = [
  {
    ...home,
    objective: 'stacks.bound',
    anchor: 'expect(stackEdition(s)).toEqual({ first, second, aisle, visitor })',
    action:
      'Choose which two leaves to mount, who enters and where the screen opens. Walk to both shelves and bind their separately credited leaves in the order reached. The receiving case keeps that edition while the workshop changes.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The chosen crossing changes how a reader can reach the shelf. The guided route uses the same open squares.',
      },
    ],
    dimensions: ['concept:perspective', 'framework:methods-and-tools', 'subject:design-tech'],
    elements: ['game:113', 'game:115', 'game:123', 'story:114'],
  },
  {
    ...home,
    objective: 'stacks.counts',
    anchor: "expect(d.done('stacks.counts')).toBe(true)",
    action:
      'Set the same 115 votes against 163 valid votes, 169 returned ballots and 270 members entitled to vote. Follow the proportions back to what the Eastern Shawnee election board certified on its dated page.',
    reasoning: [
      {
        mode: 'deductive',
        basis: 'The numerator remains 115. Enlarging this denominator decreases the displayed fraction.',
      },
    ],
    comparison: {
      areas: [
        {
          id: 'MAT',
          method: 'Compare 115/163, 115/169 and 115/270 and keep each fraction with its defined population.',
          limit: 'The denominator cannot explain the intentions of people who did not return a valid vote.',
        },
        {
          id: 'HIS',
          method:
            'Read the election board’s dated certificate to establish what these three groups meant in this particular vote.',
          limit:
            'Three signatures establish who certified the figures. They do not identify how any one member voted.',
        },
      ],
      concepts: ['evidence'],
      framework: ['scope'],
      connection:
        'Resizing the ring changes the arithmetic claim while the named historical return stays in place.',
    },
    dimensions: [
      'micro:1009',
      'area:MAT',
      'area:HIS',
      'subject:math-ai',
      'subject:history',
      'concept:evidence',
      'framework:scope',
    ],
    elements: ['game:267', 'story:83'],
  },
  {
    ...home,
    objective: 'stacks.headlines',
    anchor: "expect(d.done('stacks.headlines')).toBe(true)",
    action:
      'Turn the plate to the votes for, then the votes against. Notice how Opal and Tallis respond when 48 dissenting votes move to the first line while all 163 valid votes remain on the board.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The order in which a reader sees the complementary counts changes the emphasis of the public message.',
      },
    ],
    dimensions: ['micro:503', 'concept:interpretation', 'framework:perspectives', 'subject:global-politics'],
    elements: ['game:234', 'story:119'],
  },
  {
    ...home,
    target: 'stacks-signature',
    objective: 'stacks.signatures',
    anchor: "expect(d.done('stacks.signatures')).toBe(true)",
    action:
      'Earn the constitutional file on the North Steps. Carry and equip it at the lamp. Trace the three certifying lines and the date inside the constitutional collection, each attributable to this return.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Certification by three named members does not assign any of the secret votes to a particular person.',
      },
    ],
    dimensions: [
      'micro:233',
      'micro:764',
      'area:HIS',
      'subject:global-politics',
      'concept:responsibility',
      'framework:ethics',
    ],
    elements: ['game:267', 'story:87'],
  },
  {
    ...quay,
    objective: 'stacks.readPair.absentee.eastern',
    anchor: "expect(d.done('stacks.readPair.absentee.eastern')).toBe(true)",
    action:
      'Use both windows of the public instrument to distinguish the Absentee Shawnee Tribe’s description of its emblem from a dated amendment record of the Eastern Shawnee Tribe. Preserve both names and choose whom the light reaches.',
    dimensions: ['micro:956', 'concept:culture', 'framework:perspectives', 'subject:history'],
    elements: ['game:115', 'story:114'],
  },
];
