const source = 'tests/second-ink.test.ts';
export const secondInkProofs = [
  {
    source,
    map: 'night-register.archive',
    target: 'secondink.archive.bench',
    objective: 'secondink.archive.slip',
    anchor: 'expect(cols.map((o) => o.pin)).toEqual([4, 4, 4])',
    action:
      'Slide the palm across two pegs above the fixed pinhole. Sheet and pin no longer move together. Turning the sheet hides the palm while the hole on the bed stays in sight.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'One changed position and a fixed reference distinguish motion of the printed surface from a mark on the press bed.',
      },
    ],
    dimensions: [
      'micro:102',
      'area:NAT',
      'subject:physics',
      'concept:explanation',
      'framework:methods-and-tools',
      'question:KQ-ROUTE-01',
    ],
    elements: ['game:184', 'story:5'],
  },
  {
    source,
    map: 'night-register.nile',
    target: 'secondink.nile.bench',
    objective: 'secondink.nile.cord',
    anchor: 'expect(inkReadout(s, k)).toContain(k.writers[k.origin[index]])',
    action:
      'Unwind the knots on two grain records to their first witnesses. A desk name alone cannot tell whether another person actually saw a payment.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Following each directed cord to the same named witness prevents those two desk slips from being counted as two independent observations.',
      },
    ],
    dimensions: [
      'micro:927',
      'area:HIS',
      'subject:history',
      'concept:evidence',
      'framework:perspectives',
      'question:KQ-ROUTE-03',
    ],
    elements: ['game:77', 'story:42'],
  },
  {
    source,
    map: 'night-register.coast',
    target: 'secondink.coast.bench',
    objective: 'secondink.coast.answer',
    anchor: 'expect(inkRival(s, k).level).toBe(2)',
    action:
      'After signing other towns’ notices with a familiar instrument, accept Agate’s stored counterproof. At Orren’s window open the identical bell in a second shift. A person present then can be missing at the same bell today.',
    reasoning: [
      {
        mode: 'inductive',
        basis:
          'The repeated bell is a specific counterexample to generalising the earlier watcher’s presence across shifts.',
      },
    ],
    dimensions: ['area:HUM', 'area:NAT', 'concept:certainty', 'framework:scope', 'question:KQ-ROUTE-28'],
    elements: ['game:70', 'story:43', 'story:44'],
  },
  {
    source,
    map: 'night-register.press',
    target: 'secondink.press.bench',
    objective: 'secondink.press.answer.slip',
    anchor: "expect(inkPaper(s, k).notch).toBe(k.fixed === 'paper' ? undefined : 2)",
    action:
      'Bring Agate a comparison of the print at one fixed peg before and after turning the sheet. Take the child’s footprint back to Ōi and Bayette, who have a second question about whether a correction ought to carry it.',
    reasoning: [
      {
        mode: 'abductive',
        basis:
          'A mark disappearing with the printed face supports transfer of the impression. It cannot identify whose decision put the footprint on the earlier sheet.',
      },
    ],
    dimensions: [
      'micro:102',
      'area:NAT',
      'area:ART',
      'concept:interpretation',
      'subject:visual-arts',
      'framework:methods-and-tools',
    ],
    elements: ['game:70', 'story:44'],
    comparison: {
      areas: [
        {
          id: 'NAT',
          method: 'Keep the registration peg fixed and examine the scar with each face up.',
          limit:
            'The test discriminates two possible surfaces and has no access to the original maker’s intention.',
        },
        {
          id: 'ART',
          method:
            'Turn the physical proof in Ōi’s light. Examine the mark as part of a publicly shown composition.',
          limit:
            'Reading the expressive or identifying power of a footprint cannot alone establish which surface carried it.',
        },
      ],
      concepts: ['interpretation'],
      framework: ['methods-and-tools'],
      connection:
        'Bayette can change the public impression after the material comparison. Whether to print a child’s trace remains an editorial and ethical decision.',
    },
  },
  {
    source,
    map: 'night-register.dispatch',
    target: 'secondink.dispatch.bench',
    objective: 'secondink.dispatch.cord',
    anchor: 'expect(new Set(k.origin).size).toBe(2)',
    action:
      'Pull the bell rack and supper-shelf cords past their intermediate hooks. Two arrival slips lead back to one clerk. A count of entries and a count of separate observers answer different questions about the runner’s meals.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'Composing the desk–hook–witness relations inside this displayed register identifies the number of distinct origins.',
      },
    ],
    dimensions: [
      'micro:1098',
      'area:HIS',
      'area:HUM',
      'concept:justification',
      'framework:methods-and-tools',
    ],
    elements: ['game:169', 'story:42'],
  },
  {
    source,
    map: 'night-register.chart',
    target: 'secondink.chart.bench',
    objective: 'secondink.chart.transfer',
    anchor: 'expect(inkComparison(s, b)).toMatchObject(',
    action:
      'Carry the earlier city’s actual signed samples to Ostel’s chart and put them beside a newly kept reading. The travel record retains both places, their differing circumstances and the original recipient.',
    reasoning: [
      {
        mode: 'analogical',
        basis:
          'The route by which another town carried a mark suggests a check on this chart. Its old source cannot establish where Ostel’s sister intended a boat to land.',
      },
    ],
    dimensions: [
      'area:HIS',
      'area:HUM',
      'concept:justification',
      'framework:scope',
      'question:KQ-ROUTE-10',
    ],
    elements: ['game:77', 'story:74'],
  },
  {
    source,
    map: 'night-register.voices',
    target: 'secondink.voices.entrust',
    objective: 'secondink.voices.delivery',
    anchor: 'expect(arrival.text).toContain(k[edition])',
    action:
      'Give a checked listening slip to its owner and walk to the witness seat. Hear what happens when the choir waits for permission to carry the pause as well as the singer’s words. The rail and service tray have different consequences.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'Seeing what the choir can now do and what it has to leave open tests the practical effect of giving custody back.',
      },
    ],
    dimensions: [
      'micro:58',
      'area:HUM',
      'concept:perspective',
      'framework:ethics',
      'question:KQ-ROUTE-16',
    ],
    elements: ['game:21', 'story:114'],
  },
];
