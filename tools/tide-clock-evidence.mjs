const room = 'island.quarter-house',
  source = 'tests/tide-clock.test.ts';
export const tideClockProofs = [
  {
    source,
    map: room,
    target: 'quarter-clock',
    objective: 'quarter.watch',
    anchor: "expect(stamped(d.s, 'rail', 5)).toBe(true)",
    action:
      'Keep the slipway hearing at the crew break and the open-rail hearing at the pilots’ tying-up. When the tide clears the pad, those separate times survive on the brass and reveal the old stair.',
    reasoning: [
      {
        mode: 'inductive',
        basis:
          'One set of place-and-time records suggests when a crew can stop. Looking through the same tube at other hours tests that inference for this pier.',
      },
    ],
    dimensions: [
      'micro:311',
      'area:HUM',
      'framework:methods-and-tools',
      'concept:evidence',
      'subject:geography',
      'question:KQ-ROUTE-12',
    ],
    elements: ['game:172', 'game:282', 'story:77', 'story:48'],
  },
  {
    source,
    map: room,
    target: 'quarter-clock',
    objective: 'quarter.moth',
    anchor: "expect(d.s.flags['tideclock.mothNote']).toBe('blank')",
    action:
      'Make stamping the first instruction on a clean pad. Run the three feet separately, then wind an entire watch. Changing their order or direction changes which times and places reach the same card.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Each instruction has a specified effect on place, time, pad or brass. The resulting card can be derived one foot at a time and compared with the wound round.',
      },
      {
        mode: 'causal',
        basis:
          'Keep the starting pad, clock and pier fixed and move only the stamp. A copy taken after listening can retain an observation that the first blank impression missed.',
      },
    ],
    dimensions: [
      'micro:3',
      'micro:604',
      'micro:644',
      'subject:computer-science',
      'subject:math-ai',
      'subject:geography',
      'area:MAT',
      'area:HUM',
      'framework:methods-and-tools',
      'framework:scope',
      'concept:evidence',
      'question:KQ-ROUTE-32',
    ],
    elements: ['game:192', 'game:224', 'story:87'],
    comparison: {
      areas: [
        {
          id: 'MAT',
          method:
            'Trace the ordered operations from a specified initial state and compare the predicted record with eighteen separate steps.',
          limit: 'The computed itinerary cannot establish what people elsewhere on the pier were doing.',
        },
        {
          id: 'HUM',
          method:
            'Listen at different piers and shifts and ask the crew whose account a fixed itinerary would omit.',
          limit:
            'The six sampled times preserve particular encounters. They cannot settle the prevalence of a need on every day.',
        },
      ],
      framework: ['methods-and-tools', 'scope'],
      concepts: ['evidence'],
      connection:
        'The algorithm completely specifies what Matel sent the brass moth to do. The observations available on its card still depend on a human choice of route.',
    },
  },
  {
    source,
    map: room,
    target: 'quarter-clock',
    objective: 'quarter.plan',
    anchor: 'expect(endings.size).toBe(6)',
    action:
      'Start with either proposal. Put three movable fittings on three sites and walk the same arrangement with Siv’s crew and Joss’s pilots. The fitted dock preserves the issued version while other possibilities remain downstairs.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'Issuing a floor makes a particular break, warning or dry record available. The actual change on the pier gives the player a reason to keep or replace the plan.',
      },
    ],
    dimensions: [
      'micro:850',
      'area:HUM',
      'subject:geography',
      'subject:design-tech',
      'framework:perspectives',
      'concept:power',
      'question:KQ-ROUTE-35',
    ],
    elements: ['game:162', 'story:119', 'story:11'],
  },
  {
    source,
    map: room,
    target: 'quarter-clock',
    objective: 'quarter.leaves',
    anchor: "expect(d.done('quarter.leaves')).toBe(true)",
    action:
      'Take a rubbing of two different layouts after walking each with both crews. Hold the same two plans against the pilot’s need for a mark by the moorings and Ivo’s need for a dry public record. Count the planks each would have to cross.',
    reasoning: [
      {
        mode: 'analogical',
        basis:
          'Apply the same spatial representation to the two plans and use the same starting post for the same person on both leaves.',
      },
      {
        mode: 'pragmatic',
        basis:
          'Move one board and test the conflicting consequences of keeping a sheet dry or letting a pilot read without leaving the mooring.',
      },
    ],
    dimensions: [
      'micro:115',
      'micro:56',
      'area:MAT',
      'area:HUM',
      'subject:geography',
      'subject:math-ai',
      'framework:perspectives',
      'framework:scope',
      'concept:values',
      'concept:justification',
      'question:KQ-ROUTE-34',
    ],
    elements: ['game:162', 'story:11', 'story:119'],
    comparison: {
      areas: [
        {
          id: 'MAT',
          method:
            'Count the edges on a three-post linear plan from a named start to the same fitting on each leaf.',
          limit:
            'A plank distance contains no information about how long a worker’s break is or whether someone can leave a boat.',
        },
        {
          id: 'HUM',
          method:
            'Walk the same arrangement at break and tying-up, then place the two users’ criteria beside the traced distances.',
          limit:
            'These particular workers speak about their own stops. A later public decision still needs to hear others.',
        },
      ],
      framework: ['perspectives', 'scope'],
      concepts: ['values', 'justification'],
      connection:
        'The arithmetic of the floor stays fixed when a second person takes the page. Which distance is useful changes with the task that person must perform.',
    },
  },
  {
    source,
    map: 'island.dock',
    target: 'quarter-dock-plan',
    objective: 'quarter.after',
    anchor: "expect(d.done('quarter.after')).toBe(true)",
    action:
      'Take the early and late walk upstairs under the signed plan. Both crews describe an actual access change. Give Ada the annotated envelope and return to Matel for either follow-up.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The two uses of the installed plan can justify different revisions even after a successful trial.',
      },
    ],
    dimensions: [
      'micro:259',
      'subject:global-politics',
      'area:HUM',
      'framework:ethics',
      'concept:responsibility',
      'question:KQ-ROUTE-02',
    ],
    elements: ['game:162', 'story:114'],
  },
];
