import skills from '../src/content/microSkillsCoat.json' with { type: 'json' };

// Each linked objective is played at its source and its receiving peg in pocket-coat.test.ts.
// Different skill readings of the same impression are still a single action in the census.
const actions = new Map();
for (const skill of skills)
  for (const use of skill.uses) {
    if (!use.objective.startsWith('coat.')) continue;
    const key = use.objective,
      site = key.split('.')[1];
    if (!actions.has(key))
      actions.set(key, {
        objective: key,
        map: 'night-register.' + site,
        target: 'night-register.' + site + '.coat',
        source: 'tests/pocket-coat.test.ts',
        anchor: 'awards every documented contrast at its own worktable',
        action: use.action,
        dimensions: [],
        elements: ['game:' + use.game, 'story:' + use.story],
      });
    actions.get(key).dimensions.push('micro:' + skill.number);
  }

const reviews = [
  [
    'archive.compared1',
    'pragmatic',
    'An eighteen-word cuff and an offcut tray serve two readers. Removing the formal lead makes the whole instruction available at the door while leaving its original for a later editor.',
    [2, 10],
  ],
  [
    'nile.compared0',
    'abductive',
    'Two signed arrivals appear when the filing rule changes. Selection for payment can explain why the pay drawer omitted journeys that the quay keeper recorded.',
    [6, 33],
  ],
  [
    'cold.compared0',
    'inductive',
    'All three first-bench readings agree. Repeating the same procedure at the other bench changes the result by one degree, limiting how far the observed regularity travels.',
    [5, 28],
  ],
  [
    'coast.compared1',
    'pragmatic',
    'A boat tie requires a working mark; a path above high water may need a wider allowance. The second model exposes how the proposed height depends on the intended use.',
    [18, 30],
  ],
  [
    'fern.compared0',
    'causal',
    'Hold the spring fixed and take the cast from another substrate. The surface controls which prints are retained in this model.',
    [23, 25],
  ],
  [
    'yard.compared1',
    'analogical',
    'The pitch strip preserves the order and recurrence of the high vibration marks. Loudness, bearing wear and cause do not follow from that correspondence alone.',
    [9, 28],
  ],
  [
    'chart.compared1',
    'deductive',
    'Given the five ordered waits the third must be ten. The sum divided by five must be twelve. Neither requires an inference about the next boat.',
    [12, 35],
  ],
  [
    'voices.compared1',
    'causal',
    'Hold the first question fixed. Hearing the first teller before giving the second account creates an identifiable route for a shared detail in the rehearsal.',
    [3, 26],
  ],
  [
    'island.compared1',
    'causal',
    'Hold the hinge fixed; posting the shortcut sign changes how many houses take the short lane, and so changes the final arrival on that lane.',
    [7, 24],
  ],
];
for (const [key, mode, basis, routes] of reviews) {
  const proof = actions.get('coat.' + key);
  proof.reasoning = [{ mode, basis }];
  proof.dimensions.push(...routes.map((n) => 'question:KQ-ROUTE-' + String(n).padStart(2, '0')));
}
const island = actions.get('coat.island.compared1');
island.comparison = {
  concepts: ['evidence', 'explanation'],
  framework: ['scope', 'methods-and-tools'],
  areas: [
    {
      id: 'MAT',
      method:
        'Use the fixed short-lane length and the one-place hinge to calculate the last arrival for three or six households.',
      limit: 'The length and capacity alone cannot tell how many households will choose that lane.',
    },
    {
      id: 'HUM',
      method:
        'Compare the households’ response to the public sign with the unannounced allocation on the same layout.',
      limit:
        'This is a specified choice model for six fictional households. It does not predict an unfamiliar town.',
    },
  ],
  connection:
    'The route becomes slower for the last arrival because the information given to the travellers changes the number in the mathematical queue.',
};
island.dimensions.push(
  'area:MAT',
  'area:HUM',
  'concept:evidence',
  'concept:explanation',
  'framework:scope',
  'framework:methods-and-tools',
);
const voices = actions.get('coat.voices.compared1');
voices.comparison = {
  concepts: ['evidence', 'perspective'],
  framework: ['methods-and-tools', 'perspectives'],
  areas: [
    {
      id: 'HIS',
      method:
        'Recover the dated first slip and compare it with the two later accounts, tracing when the blue detail first appeared.',
      limit:
        'The surviving slip contains no colour and cannot independently establish the colour of the boat.',
    },
    {
      id: 'HUM',
      method:
        'Keep the interview wording fixed and compare independent recording with hearing another teller first.',
      limit:
        'Agreement in these fictional interviews does not establish a general rate of memory contamination.',
    },
  ],
  connection:
    'The second reply can corroborate the first only to the extent that it did not borrow its detail. The dated slip remains available under either interview protocol.',
};
voices.dimensions.push(
  'area:HIS',
  'area:HUM',
  'concept:evidence',
  'concept:perspective',
  'framework:methods-and-tools',
  'framework:perspectives',
);
export const coatProofs = [...actions.values()];
