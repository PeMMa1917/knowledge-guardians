export const ferryRadioProofs = [
  {
    source: 'tests/ferry-radio.test.ts',
    map: 'sea.listening-wheel',
    target: 'wire-console',
    objective: 'wire.leading',
    anchor: "expect(d.done('wire.leading')).toBe(true)",
    action:
      'Turn the same roof winding to the same painter twice. Supply “home” in one invitation and leave the word open in the other. Tavi can let the painter hear both takes.',
    reasoning: [
      {
        mode: 'causal',
        basis: 'The receiver and person stay fixed. The player adds the suggested word before one reply.',
      },
    ],
    dimensions: [
      'micro:287',
      'subject:psychology',
      'subject:lang-langlit',
      'area:HUM',
      'framework:methods-and-tools',
      'concept:interpretation',
    ],
    elements: ['game:173', 'story:77'],
  },
  {
    source: 'tests/ferry-radio.test.ts',
    map: 'sea.listening-wheel',
    target: 'wire-console',
    objective: 'wire.voice',
    anchor: "expect(d.done('wire.voice')).toBe(true)",
    action:
      'Find the caller who remembers a dented lid and the singer who knows the old sheet. Put the two nights against the same marked moment. Oda has to say how one old performance came to be heard twice.',
    reasoning: [
      {
        mode: 'abductive',
        basis:
          'The fall of the kettle in the same place on different broadcasts favours reuse of the take. It leaves the sung last word unresolved.',
      },
    ],
    dimensions: [
      'micro:310',
      'micro:1098',
      'area:HIS',
      'area:ART',
      'subject:music',
      'subject:history',
      'concept:evidence',
      'framework:methods-and-tools',
    ],
    elements: ['game:267', 'game:190', 'story:77'],
  },
  {
    source: 'tests/ferry-radio.test.ts',
    map: 'sea.listening-wheel',
    target: 'wire-console',
    objective: 'wire.crowd',
    anchor: "expect(d.done('wire.crowd')).toBe(true)",
    action:
      'Pin the two nights on the covered, exposed and combined reels. Fix the mix to equal shares and take all four strips to Du Bois.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'With the supplied counts the pooled recall rate rises four points, yet each stop falls five. A common weighting gives a five-point fall.',
      },
      {
        mode: 'inductive',
        basis:
          'The recorded slips suggest a change for these passengers. Different shifts and missing slips limit any extrapolation.',
      },
    ],
    dimensions: [
      'micro:307',
      'area:MAT',
      'area:HUM',
      'subject:math-ai',
      'subject:psychology',
      'framework:scope',
      'framework:methods-and-tools',
      'concept:objectivity',
      'concept:evidence',
    ],
    elements: ['game:267', 'story:87'],
    comparison: {
      areas: [
        {
          id: 'MAT',
          method: 'Calculate both within-stop rates, the pooled rate and a common-weight comparison.',
          limit:
            'These operations settle the relationship among the recorded numbers. They cannot establish who missed the ferry.',
        },
        {
          id: 'HUM',
          method:
            'Compare the sampling times, audience composition and a deckhand’s report alongside the visual display.',
          limit: 'The unreturned slips cannot identify what absent passengers heard.',
        },
      ],
      framework: ['scope', 'methods-and-tools'],
      concepts: ['evidence', 'objectivity'],
      connection:
        'The chart changes direction when the audience weights change. The decision about whom an evening report describes belongs with the people and times of the hearing.',
    },
  },
  {
    source: 'tests/ferry-radio.test.ts',
    map: 'sea.listening-wheel',
    target: 'wire-console',
    objective: 'wire.issue',
    anchor: "expect(() => act(d, { act: 'quote', caller: 'siv', credit: 'anonymous' })).toThrow(/private/)",
    action:
      'Choose a consenting listener for the public programme. The painter can travel without a name. Siv can be heard privately and keeps her voice at the studio.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The Guardian can carry the missing shift’s concern into a new invitation without carrying its private recording.',
      },
    ],
    dimensions: [
      'micro:76',
      'area:HUM',
      'area:ART',
      'framework:ethics',
      'concept:responsibility',
      'subject:music',
    ],
    elements: ['game:271', 'story:11'],
  },
  {
    source: 'tests/ferry-radio.test.ts',
    map: 'island.dock',
    target: 'wire-horn',
    objective: 'wire.return',
    anchor: 'expect([selected.edition, selected.crowd]).toEqual([edition, frame])',
    action:
      'Unroll the studio edition, then stay at the microphone and the gangway. Oda and Joss hear what the crowd numbers leave out. A chorus, a new horn or four open beats changes the scene on the dock.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The same counts can inform a practical change for the audience that still leaves the singer room to decide what belongs in the last bar.',
      },
    ],
    dimensions: [
      'micro:617',
      'micro:755',
      'area:HUM',
      'area:ART',
      'subject:music',
      'subject:psychology',
      'framework:perspectives',
      'framework:ethics',
      'concept:perspective',
      'concept:values',
    ],
    elements: ['game:22', 'game:173', 'story:114'],
    comparison: {
      areas: [
        {
          id: 'HUM',
          method:
            'State which respondents and time frame the count represents before applying it to the ferry service.',
          limit:
            'The group rate cannot recover the singer’s obligation to the absent voice or a listener’s experience behind the sail.',
        },
        {
          id: 'ART',
          method:
            'Send a deliberate rest, a second horn or a chorus. Follow how two listeners experience the same musical decision.',
          limit: 'A powerful response from the two listeners cannot estimate the whole shift’s hearing.',
        },
      ],
      framework: ['perspectives', 'ethics'],
      concepts: ['perspective', 'values'],
      connection:
        'The player sends the crowd frame and a staging decision in one programme. The receiving people can value the same hearing differently.',
    },
  },
  {
    source: 'tests/ferry-radio.test.ts',
    map: 'island.dock',
    target: 'wire-horn',
    objective: 'wire.shift',
    anchor: "expect(d.done('wire.shift')).toBe(true)",
    action:
      'Invite the missed shift at break or after tying up, then file who was available and whom the new invitation still missed. The earlier reading remains in the diary.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'Changing the call time changes which workers can stop and respond in this scripted ferry schedule.',
      },
      {
        mode: 'pragmatic',
        basis: 'The next shift can use the filed time to plan a hearing and account for another gap.',
      },
    ],
    dimensions: [
      'micro:311',
      'micro:76',
      'area:HUM',
      'subject:geography',
      'concept:responsibility',
      'framework:ethics',
      'framework:scope',
    ],
    elements: ['game:282', 'game:22', 'story:119'],
  },
];
