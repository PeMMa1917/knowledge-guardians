import type { ContentPack, Hint } from '../domain/types';

export function bakeryContent(): Partial<ContentPack> {
  const hints: Hint[] = [];
  const bakery = 'emberford.tally.weigh';
  const bakeryHints = [
    'The scale counts a different thing from the stall doors.',
    'Set an untouched tray on the scale. Then deliver one loaf and weigh the rest.',
    'Work with both the small loaves and the large ones. You can always bring one back.',
    'On each tray, weigh the full load, leave one loaf at a door and weigh again. Idris can read the change in scale units.',
  ];
  bakeryHints.forEach((text, i) =>
    hints.push({
      id: 'h.' + bakery + '.' + (i + 1),
      objective: bakery,
      depth: (i + 1) as Hint['depth'],
      text,
    }),
  );
  return {
    missions: [
      {
        id: 'KG-CH1-BAKE-SCALE',
        world: 'WORLD-02',
        title: 'The weight of one doorstep',
        knowledgeQuestion:
          'When can a count of loaves travel as a measure of cargo?',
        available: { flagSet: 'tally.tray' },
        objectives: [
          {
            id: bakery,
            title:
              'Try each tray on Idris’s scale before and after a doorstep delivery.',
            essential: false,
            done: {
              all: [
                'small.full',
                'small.one-out',
                'large.full',
                'large.one-out',
              ].map((k) => ({ flag: 'tally.checked.' + k, eq: true })),
            },
            weave: {
              concepts: [
                'evidence',
                'interpretation',
                'justification',
                'explanation',
              ],
              framework: ['scope', 'methods-and-tools', 'perspectives'],
              aoks: ['MAT', 'HUM'],
              subjects: ['math-ai', 'business'],
              atl: ['thinking', 'communication'],
              thinking: {
                dok: 2,
                bloom: 'apply',
                fink: 'integration',
                solo: 'relational',
              },
            },
          },
        ],
      },
    ],
    hints,
  };
}
