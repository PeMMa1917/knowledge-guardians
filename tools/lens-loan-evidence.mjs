const source = 'tests/lens-loan.test.ts';
const home = { source, map: 'observatory.loan-loft', target: 'optics-sled' };
const wing = { source, map: 'stage.rehearsal', target: 'optics-rail' };
export const lensProofs = [
  {
    ...home,
    objective: 'optics.scratch',
    anchor: "expect(d.done('optics.scratch')).toBe(true)",
    action:
      'Turn a cloth study under its holder and then lift the sleeve at a fixed angle. Mayle can name the light line that belongs to the holder and the separate edge on her father’s curtain.',
    reasoning: [
      { mode: 'causal', basis: 'Each paired comparison changes one fitting and holds the others still.' },
      {
        mode: 'abductive',
        basis:
          'Of the threads and scratch on view, the holder accounts for the mark that remains still through a turn and follows the raised sleeve.',
      },
    ],
    dimensions: [
      'micro:704',
      'micro:948',
      'subject:physics',
      'concept:objectivity',
      'framework:methods-and-tools',
    ],
    elements: ['game:41', 'game:45', 'story:87'],
  },
  {
    ...home,
    objective: 'optics.crease',
    anchor: "expect(d.done('optics.crease')).toBe(true)",
    action:
      'Keep the same angle and observation window on the fresh and pressed diagrams. Compare corresponding squares, then lay both slips beside Cajal’s pencil drawing. The extra ridge appears in the prepared version.',
    reasoning: [
      {
        mode: 'causal',
        basis:
          'The visible extra ridge survives a matched comparison in the prepared diagram. Changing the angle as well does not meet the test.',
      },
    ],
    dimensions: ['micro:905', 'area:NAT', 'subject:biology', 'concept:evidence', 'framework:methods-and-tools'],
    elements: ['game:45', 'story:87', 'story:114'],
  },
  {
    ...home,
    objective: 'optics.registration',
    anchor: "expect(d.done('optics.registration')).toBe(true)",
    action:
      'With both lenses borrowed, use any of five close windows and register its nine squares against the whole field of the same study. Show Nim where the seam disappeared from a crop.',
    reasoning: [
      {
        mode: 'deductive',
        basis: 'The coordinate map determines the nine shared positions, irrespective of the chosen specimen.',
      },
    ],
    dimensions: ['micro:704', 'micro:371', 'subject:visual-arts', 'concept:interpretation', 'framework:scope'],
    elements: ['game:41', 'game:45', 'story:83'],
  },
  {
    ...home,
    objective: 'optics.presets',
    anchor: "expect(d.done('optics.presets')).toBe(true)",
    action:
      'Take two impressions in the felt, save two packings beside Mayle’s original knot and star and recall them after returning a loan. The marks preserve a choice between what the company can test at the next bench.',
    reasoning: [
      {
        mode: 'pragmatic',
        basis: 'The tool pair determines which view the understudy can project at the receiving stage.',
      },
    ],
    dimensions: ['subject:design-tech', 'concept:responsibility', 'framework:methods-and-tools'],
    elements: ['game:49', 'game:125', 'story:74'],
  },
  {
    ...wing,
    objective: 'optics.drawings',
    anchor: "expect(d.done('optics.drawings')).toBe(true)",
    action:
      'Pin rival chalk drawings for a single seat, open or narrow the doorway, and repeat the crew’s sightings. Keep a useful cue for Nim or reserve the seat where the two models diverged for another test.',
    reasoning: [
      {
        mode: 'inductive',
        basis: 'Several fictional rehearsals at the same seat establish a revisable tendency.',
      },
      {
        mode: 'pragmatic',
        basis:
          'The actor needs a cue that works. A claim about the underlying light needs a situation in which rival diagrams give different forecasts.',
      },
    ],
    comparison: {
      areas: [
        {
          id: 'ART',
          method: 'Choose a drawing that lets the company call an entrance from a particular seat.',
          limit: 'A workable cue can leave the cause of the light undecided.',
        },
        {
          id: 'NAT',
          method:
            'Change the opening so the two forecasts diverge at the same seat, then compare repeat readings.',
          limit: 'Three observations leave uncertainty about the next performance.',
        },
      ],
      concepts: ['explanation', 'evidence'],
      framework: ['scope', 'methods-and-tools'],
      connection:
        'Two drawings work equally well in the broad doorway. A seat in the wing can distinguish them through the narrow opening.',
    },
    dimensions: [
      'micro:325',
      'micro:496',
      'area:ART',
      'area:NAT',
      'subject:physics',
      'subject:theatre',
      'concept:explanation', 'concept:evidence', 'framework:methods-and-tools',
      'framework:scope',
    ],
    elements: ['game:41', 'game:45', 'story:119'],
  },
  {
    ...wing,
    objective: 'optics.margins',
    anchor: "expect(d.done('optics.margins')).toBe(true)",
    action:
      'Bring the four-turn diagram from the depot to a seat already sampled under both openings. Bind the argument that applies to every square beside the observations the next stagehand can revisit.',
    reasoning: [
      {
        mode: 'deductive',
        basis: 'Applying the same coordinate quarter turn four times is the identity for every square.',
      },
      {
        mode: 'inductive',
        basis: 'The count of lit marks varies at the same seat even when the opening is fixed.',
      },
    ],
    comparison: {
      areas: [
        {
          id: 'MAT',
          method: 'Apply the known rotation twice and then twice again to arbitrary coordinates.',
          limit: 'The proof assumes the defined grid and its fixed quarter turn.',
        },
        {
          id: 'NAT',
          method: 'Observe a fixed seat through two apertures on successive rehearsal runs.',
          limit: 'More runs can change the estimate of how many marks reach that seat.',
        },
      ],
      concepts: ['certainty', 'justification'],
      framework: ['scope', 'methods-and-tools'],
      connection: 'The guardian gives the company two kinds of warrant that survive different challenges.',
    },
    dimensions: [
      'micro:601',
      'area:MAT',
      'area:NAT',
      'subject:math-aa',
      'subject:physics',
      'concept:certainty', 'concept:justification', 'framework:scope',
      'framework:methods-and-tools',
    ],
    elements: ['game:41', 'story:114', 'story:87'],
  },
];
