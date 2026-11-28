const source='tests/claim-bell.test.ts';
const place={well:{map:'aethelgard.emberford',target:'claim-bell-well'},weir:{map:'water.council',target:'claim-bell-weir'}};
export const bellProofs=[
  { ...place.well,source,objective:'claimbell.issue',anchor:"expect(d.done('claimbell.issue')).toBe(true)",
    action:'Turn the plate and trial different ways of making a claim. Choose a time and channel for the spare pot after walking both claimants under the rule.',
    dimensions:['etymology:claim','vocabulary:claim','micro:370','concept:perspective','framework:perspectives','question:KQ-ROUTE-35'],
    elements:['story:11','game:114'] },
  { ...place.weir,source,objective:'claimbell.weir.test',anchor:'carries the distinction between asking for a pot and reporting a crack across both desks',
    action:'Use the sealed procedure for requesting a pot as a way to admit statements about a damaged wheel. Try two people and see which traces the procedure captures.',
    dimensions:['micro:64','vocabulary:claim','concept:evidence','framework:methods-and-tools','question:KQ-ROUTE-12'],
    elements:['story:15','game:22'] },
  { ...place.weir,source,objective:'claimbell.sign',anchor:'keeps both the signed evidence and the later trial, including an excluded worker',
    action:'Test the sight-rooted word against a rubbing and a sound. Run both workers through the received rule, compare the flat slot with hearing the knocks and issue a public hearing rule.',
    dimensions:['micro:759','etymology:evidence','vocabulary:evidence','concept:evidence','framework:ethics','question:KQ-ROUTE-35'],
    elements:['story:11','game:114'] },
];
