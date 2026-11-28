const source = 'tests/hatch-sleeve.test.ts';
export const hatchProofs = [
  {
    source,
    map: 'aethelgard.emberford',
    target: 'kip-arden',
    objective: 'm02.o7.kip',
    anchor: "expect(d.s.flags['hatch.wrapper']).toBe(wrapper)",
    action:
      'Locate the discarded sign at Kip’s portal post. Take its nick and ring on one wrapper or preserve Kip’s hour and name. At the study actually lay the carried version beside two accounts and see which question remains open.',
    reasoning: [
      {
        mode: 'abductive',
        basis:
          'A ring that fits the loose seal supports a candidate explanation for a material trace. Observing the place and time of discovery gives no independent view of its maker.',
      },
    ],
    dimensions: [
      'area:HIS',
      'concept:evidence',
      'concept:interpretation',
      'framework:scope',
      'theme:LAN',
      'question:KQ-ROUTE-09',
    ],
    elements: ['game:122', 'story:52'],
  },
  {
    source,
    map: 'aethelgard.study',
    target: 'hatch-cricket',
    objective: 'hatch.control',
    anchor: 'compares controlled knocks with a quiet patch of historical evidence',
    action:
      'Hold the brass and the table constant while fitting and removing the tooth. Move to the peg and change to the timber. Listen for the spoon and inspect the feet of the wax cricket. This room can produce a quiet table even with Orrin present.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'The fixed pair changes just the tooth connecting the brass and the wire. A different listening place or surface would introduce a second change.',
      },
    ],
    dimensions: [
      'area:NAT',
      'subject:physics',
      'subject:design-tech',
      'theme:TEC',
      'concept:explanation',
      'framework:methods-and-tools',
    ],
    elements: ['game:70', 'story:85'],
  },
  {
    source,
    map: 'aethelgard.study',
    target: 'hatch-cricket',
    objective: 'hatch.absence',
    anchor: "expect(d.done('hatch.absence')).toBe(true)",
    action:
      'Calibrate the kitchen spoon with a known fitted and missing tooth. Try both covered catches, lift both cloths and compare what a missing ring can show here with what the old hatch account leaves unknown.',
    reasoning: [
      {
        mode: 'deductive',
        basis:
          'In the specified working demonstration a fitted tooth transmits the brass strike to the working spoon. The silent covered catch fails that implication. The written account gives no check of the old mechanism.',
      },
    ],
    comparison: {
      concepts: ['evidence', 'certainty'],
      framework: ['scope', 'methods-and-tools'],
      areas: [
        {
          id: 'NAT',
          method:
            'Hold the brass and listening place constant. Check the two reference settings before testing the concealed catches and opening the pockets.',
          limit: 'The negative result concerns the device in these tested conditions.',
        },
        {
          id: 'HIS',
          method:
            'Read the two full accounts with their writers’ positions alongside the clipped line in the guild book.',
          limit:
            'Nobody recorded a control trial for Elsbet’s night. The surviving silence cannot establish that a worker had deserted the hatch.',
        },
      ],
      connection:
        'The same missing reply supports different conclusions depending on what a listener there could have detected and what record survives.',
    },
    dimensions: [
      'micro:519',
      'area:HIS',
      'area:NAT',
      'subject:history',
      'subject:physics',
      'concept:evidence',
      'concept:certainty',
      'framework:scope',
      'framework:methods-and-tools',
      'question:KQ-ROUTE-08',
    ],
    elements: ['game:70', 'story:85'],
  },
  {
    source,
    map: 'nexus.archive',
    target: 'hatch-readers',
    objective: 'hatch.return',
    anchor: "expect(d.s.flags['hatch.packet']).toBe(packet)",
    action:
      'Give the uncut words, the model catch or a pair of walking positions to the readers of the installed Nile packet. Stay for the second caller and read the additional work the first arrangement left behind.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis:
          'A public correction can be used while the desk is shut, a repeatable model requires a working surface, and a two-person round needs the two people there.',
      },
    ],
    dimensions: [
      'area:HIS',
      'theme:LAN',
      'theme:POL',
      'concept:responsibility',
      'framework:ethics',
      'question:KQ-ROUTE-10',
    ],
    elements: ['game:21', 'story:95'],
  },
];
