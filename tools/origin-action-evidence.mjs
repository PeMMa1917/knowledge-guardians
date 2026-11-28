/** Each record names an observed manipulation or handover in a particular room. */
export const originActions = [
  {
    objective: 'origin-tour.archive.pack',
    map: 'nexus.archive',
    target: 'cataloguer-bela',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Place the original slip and a pointer. Send Mina and a maker to the drawers they actually use. A drawer can look empty to one although the other finds a record of the gift.',
    dimensions: [
      'micro:80',
      'area:HIS',
      'theme:TEC',
      'concept:interpretation',
      'framework:methods-and-tools',
      'subject:digital-society',
    ],
    elements: ['game:19', 'story:119'],
    reasoning: [
      {
        mode: 'causal',
        basis:
          'Changing the single cross-reference can take the second searcher from an empty drawer to the same original, while the place of custody stays fixed.',
      },
    ],
  },
  {
    objective: 'origin-tour.archive.homecoming',
    map: 'council.gallery',
    target: 'cataloguer-bela',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'follows the actual receiver to both Council endings',
    action:
      'Keep the empty envelope in the cabinet or send it with the child to a new school. The trace in the original room changes where a later visitor can look.',
    dimensions: [
      'area:HIS',
      'concept:values',
      'concept:power',
      'framework:perspectives',
    ],
    elements: ['game:22', 'story:144'],
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'A local catalogue may preserve public retrieval while a child can provide the next address of a travelling object. Give one responsibility priority and see who must ask for the other.',
      },
    ],
  },
  {
    objective: 'origin-tour.traveller.pack',
    map: 'nexus.archive',
    target: 'translator-lio',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Move the paper gate between departure and arrival. Select whose footsteps, musical cues or arrival time to use when assigning the word first.',
    dimensions: [
      'micro:170',
      'area:MAT',
      'area:ART',
      'theme:LAN',
      'concept:interpretation',
      'framework:scope',
      'subject:math-ai',
      'subject:theatre',
    ],
    elements: ['game:21', 'story:119'],
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'A person who leaves first need not arrive first. The order of events at each gate and the separate musical cue provide a counterexample.',
      },
    ],
    comparison: {
      concepts: ['interpretation'],
      framework: ['scope'],
      areas: [
        {
          id: 'MAT',
          method:
            'Place the departure and arrival of three figures in two separate event orders.',
          limit: 'An order does not identify who steers the band’s tempo.',
        },
        {
          id: 'ART',
          method:
            'Watch whose baton supplies the cue that the other players follow, even from the back.',
          limit:
            'A musical entrance need not report the instant a passenger crossed the gate.',
        },
      ],
      connection:
        'The same spoken word and the same three figures produce different answers when a town needs an order statistic or an ensemble cue.',
    },
  },
  {
    objective: 'origin-tour.traveller.tour',
    map: 'island.workshop',
    target: 'translator-lio',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Place the arriving baton and clock so that passengers can see a departure or a musician at the back can see the conductor. A different person waits for a second cue.',
    dimensions: [
      'micro:24',
      'area:ART',
      'theme:LAN',
      'concept:perspective',
      'framework:scope',
    ],
    elements: ['game:22', 'story:144'],
    reasoning: [
      {
        mode: 'pragmatic',
        basis: 'A useful signal depends on what its audience has to do next.',
      },
    ],
  },
  {
    objective: 'origin-tour.harbour.pack',
    map: 'aethelgard.emberford',
    target: 'runner-tamar',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Choose two pegs for three possible details. Send the boat to a family, loader or stallholder and read the different question that the receiver must take elsewhere.',
    dimensions: [
      'area:HUM',
      'theme:LAN',
      'concept:justification',
      'framework:ethics',
      'subject:economics',
    ],
    elements: ['game:22', 'story:38'],
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Two distinct pegs cannot carry all three details. The absence of a price confirmation forbids treating the boat as evidence of a quoted price.',
      },
    ],
  },
  {
    objective: 'origin-tour.harbour.tour',
    map: 'sea.harbour',
    target: 'runner-tamar',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Choose whether to sign the delivery with the child or send a second run to the stall. Look for who can witness the crossing and who can speak to the carts.',
    dimensions: [
      'area:HIS',
      'concept:responsibility',
      'concept:truth',
      'framework:methods-and-tools',
    ],
    elements: ['game:22', 'story:144'],
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'A delivery signature establishes a handover. The receiving shift must decide who can pursue the still open count or price.',
      },
    ],
  },
  {
    objective: 'origin-tour.workshop.pack',
    map: 'aethelgard.emberford',
    target: 'apprentice-ren',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Lift three tickets from one packet, vary paper moisture or the folded edge and hold the other condition fixed. Look at every lift before generalising across the batch.',
    dimensions: [
      'micro:89',
      'area:NAT',
      'concept:evidence',
      'concept:explanation',
      'framework:methods-and-tools',
      'subject:physics',
    ],
    elements: ['game:206', 'story:6'],
    reasoning: [
      {
        mode: 'causal',
        basis:
          'In this simulated packet a matched comparison isolates one change. Changing both settings leaves their individual effects ambiguous.',
      },
    ],
  },
  {
    objective: 'origin-tour.workshop.tour',
    map: 'metalworks.records',
    target: 'apprentice-ren',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Give another sheet its own test or hang one worn ticket in the window with its batch number. The later batch curls differently and one surviving edge carries limited evidence.',
    dimensions: [
      'micro:13',
      'area:NAT',
      'concept:certainty',
      'framework:scope',
      'subject:design-tech',
    ],
    elements: ['game:104', 'story:144'],
    reasoning: [
      {
        mode: 'inductive',
        basis:
          'A different batch qualifies any inference from the first three paper tickets to every concert ticket.',
      },
    ],
  },
  {
    objective: 'origin-tour.singer.pack',
    map: 'aethelgard.emberford',
    target: 'singer-teodora',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Leave a rest, sing a remembered cadence or bring in Sefa’s named line. Give each a different following entrance and listen for what the room adds and what the family can still attest.',
    dimensions: [
      'micro:7',
      'area:ART',
      'area:HIS',
      'theme:LAN',
      'concept:interpretation',
      'framework:methods-and-tools',
      'subject:music',
      'subject:history',
    ],
    elements: ['game:247', 'story:6'],
    reasoning: [
      {
        mode: 'analogical',
        basis:
          'An empty stool holds a place for a missing verse. That relationship can guide an ensemble entrance without supplying the absent words.',
      },
    ],
    comparison: {
      concepts: ['interpretation'],
      framework: ['methods-and-tools'],
      areas: [
        {
          id: 'ART',
          method:
            'Change a beat of rest into a hummed cadence or a named guest entrance and hear how the room responds.',
          limit:
            'An expressive new ending can move the room without recovering the earlier lyric.',
        },
        {
          id: 'HIS',
          method:
            'Keep the hill singer’s known line, the family’s remembered cadence and unremembered words on separate stools.',
          limit:
            'Familiarity with the cadence supplies no testimony to the missing words.',
        },
      ],
      connection:
        'Players can enlarge a performance while preserving the exact limits of an oral account.',
    },
  },
  {
    objective: 'origin-tour.singer.tour',
    map: 'stage.foyer',
    target: 'singer-teodora',
    source: 'tests/origin-instruments.test.ts',
    anchor: 'keeps four distinct first decisions',
    action:
      'Open the performance with a late singer or with a shared pause. Sefa and a child each have a different way into the tune. Take the stool to a new listener at Council.',
    dimensions: [
      'micro:449',
      'area:ART',
      'area:HIS',
      'theme:LAN',
      'concept:perspective',
      'framework:perspectives',
    ],
    elements: ['game:247', 'story:144'],
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'The entrance gives a different person the chance to contribute. Neither entrance decides the origin of a remembered note.',
      },
    ],
  },
];
