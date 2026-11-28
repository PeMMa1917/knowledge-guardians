// Independent expected excerpts are exercised through the same sightline and cross-slide controls as play.
import { readFileSync } from 'node:fs';
const json = (path) =>
  JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const stories = json('src/content/pocket-theatre-cases.json');
const stops = json('src/content/pocket-theatre-stops.json');
const traces = json('tests/pocket-theatre-traces.json');
const skills = json('src/content/skillPractice/pocket-theatre.json');
const skillsByAction = new Map();
for (const skill of skills)
  for (const use of skill.uses) {
    const uses = skillsByAction.get(use.objective) ?? [];
    uses.push({ number: skill.number, game: use.game, story: use.story });
    skillsByAction.set(use.objective, uses);
  }
const designs = {
  'brass-price': [4, 119],
  'blue-fringe': [25, 238],
  'empty-peg': [53, 267],
  'six-knots': [48, 238],
  'white-tail': [48, 267],
  'cooling-hook': [59, 194],
  'tuesday-fold': [48, 267],
  'lantern-drift': [48, 267],
  'paper-wings': [106, 178],
  'two-coppers': [55, 191],
  'dry-sleeve': [48, 267],
  'no-queue': [95, 267],
  'rolled-echo': [48, 267],
  'crate-sky': [48, 238],
  'cut-caveat': [54, 267],
  'ten-stamps': [48, 267],
  'reed-hand': [48, 267],
  'mitten-sheet': [25, 267],
  varnish: [48, 238],
  'red-stitch': [33, 238],
  'ninth-tooth': [25, 238],
  'yellow-ink': [48, 267],
  'two-routes': [48, 238],
  'third-bell': [53, 238],
  'ten-bowls': [33, 238],
  'dry-garden': [33, 238],
  'green-window': [95, 267],
  'old-singing': [95, 267],
  'blue-ribbon': [25, 238],
  'night-ledger': [48, 267],
};
const judgments = {
  'brass-price': {
    dimensions: ['concept:values', 'framework:perspectives'],
    demand:
      'Sefa can prioritise a good light on the stairs or a journey home now. The two prices give neither answer for her.',
  },
  'blue-fringe': {
    dimensions: ['concept:perspective', 'framework:perspectives'],
    demand:
      'Choose whether the seam first helps a hand find a fold or gives someone in the back a clear reading.',
  },
  'empty-peg': {
    dimensions: ['concept:responsibility', 'framework:ethics'],
    demand:
      'Both rotas can leave a lamp unchecked. Choose who can act when a carer misses the ferry.',
  },
  'six-knots': {
    dimensions: ['concept:certainty', 'framework:methods-and-tools'],
    demand:
      'Use uncertainty about the harbour to choose what the next lookout will observe or which cart will run.',
  },
  'white-tail': {
    dimensions: ['concept:objectivity', 'framework:methods-and-tools'],
    demand:
      'Decide whether to remove the noise of the porters for a watch or keep observers with them so a working crossing stays represented.',
  },
  'cooling-hook': {
    dimensions: ['concept:justification', 'framework:scope'],
    demand:
      'Give a successful individual trial a restricted use or keep the old arm for the assembled kettle.',
  },
  'tuesday-fold': {
    dimensions: ['concept:responsibility', 'framework:ethics'],
    demand:
      'Choose a public repair that reaches the distant board or a signed correction readers can follow to its author.',
  },
  'lantern-drift': {
    dimensions: ['concept:evidence', 'framework:methods-and-tools'],
    demand:
      'Decide between a new daylight observation from the omitted pier and paired departure and return records.',
  },
  'paper-wings': {
    dimensions: ['concept:interpretation', 'framework:perspectives'],
    demand:
      'Choose when a second audience will see the drum and what different testimony that audience can take home.',
  },
  'two-coppers': {
    dimensions: ['concept:objectivity', 'framework:scope'],
    demand:
      'Choose the weight a buyer or carrier needs. Each answers a different question about the same basket.',
  },
  'dry-sleeve': {
    dimensions: ['concept:explanation', 'framework:methods-and-tools'],
    demand:
      'Use the competing sources of the knock to decide between an operational watch and an inspection at rest.',
  },
  'no-queue': {
    dimensions: ['concept:power', 'framework:ethics'],
    demand:
      'Choose between a person at the inaccessible turn and a register that admits a request before anyone is available.',
  },
  'rolled-echo': {
    dimensions: ['concept:interpretation', 'framework:perspectives'],
    demand:
      'Preserve the preceding breath for a limited room or give the wider hall a shorter hearing it can trace back.',
  },
  'crate-sky': {
    dimensions: ['concept:certainty', 'framework:scope'],
    demand:
      'The loaded, wet trial places a limit on a timetable. Decide how and when families will be promised places.',
  },
  'cut-caveat': {
    dimensions: ['concept:responsibility', 'framework:ethics'],
    demand:
      "Weigh public traceability of the repair against the family's control of its own testimony.",
  },
  'ten-stamps': {
    dimensions: ['concept:perspective', 'framework:perspectives'],
    demand:
      'Choose who gets the first turn after the apparent crowd has shrunk to one author. Each musician has something to lose.',
  },
  'reed-hand': {
    dimensions: ['concept:justification', 'framework:methods-and-tools'],
    demand:
      'Give visitors a live repeat or a corrected chain of credit. Each offers a different check on a narrow observation.',
  },
  'mitten-sheet': {
    dimensions: ['concept:explanation', 'framework:scope'],
    demand:
      'Choose whether a pleasing phrase sits beside a dated night or travels as a saying with a route back to the shift book.',
  },
  varnish: {
    dimensions: ['concept:explanation', 'framework:methods-and-tools'],
    demand:
      'Choose the surface trial or the boat berth after separating the purchase date from evidence about the hull.',
  },
  'red-stitch': {
    dimensions: ['concept:perspective', 'framework:perspectives'],
    demand:
      'Decide whose marks will be compared by the same cord and who can handle an account from the opposite crew.',
  },
  'ninth-tooth': {
    dimensions: ['concept:justification', 'framework:methods-and-tools'],
    demand:
      'Choose whether a named face helps the next learner more than another unfamiliar calibration trial.',
  },
  'yellow-ink': {
    dimensions: ['concept:power', 'framework:ethics'],
    demand:
      'Weigh repairing the stamp seen by distant readers against giving the waiting reader an actual seat.',
  },
  'two-routes': {
    dimensions: ['concept:certainty', 'framework:scope'],
    demand:
      'Decide what one tide of soundings can license on a map with one uncertain bend.',
  },
  'third-bell': {
    dimensions: ['concept:values', 'framework:ethics'],
    demand:
      'A memorable missed cue, a child’s colour vote and the height of the rope compete for the next rehearsal.',
  },
  'ten-bowls': {
    dimensions: ['concept:interpretation', 'framework:methods-and-tools'],
    demand:
      'Choose where the next taster can encounter the label relative to tasting. Both keep the shared recipe available.',
  },
  'dry-garden': {
    dimensions: ['concept:responsibility', 'framework:ethics'],
    demand:
      'Give the crews an adjustable trial with costs for the last beds or a chosen messenger for a warning.',
  },
  'green-window': {
    dimensions: ['concept:power', 'framework:ethics'],
    demand:
      'Decide how to expose the undercount of a small lane while respecting the households that neighbours might identify.',
  },
  'old-singing': {
    dimensions: ['concept:interpretation', 'framework:methods-and-tools'],
    demand:
      'Choose like-for-like performances for the purpose of practice or appreciation. Rough and final takes support different claims.',
  },
  'blue-ribbon': {
    dimensions: ['concept:justification', 'framework:methods-and-tools'],
    demand:
      'Keep an adjustable current on the family model or run a second landing. Each route tests the boat while treating the family’s attachment differently.',
  },
  'night-ledger': {
    dimensions: ['concept:responsibility', 'framework:ethics'],
    demand:
      'Choose who controls a key after a single counterexample to universal access. A late chair also needs somebody responsible for it.',
  },
};
const byId = new Map(stories.map((s) => [s.id, s]));
const combine = (story, action) => ({
  objective: 'pocket.' + story.id + '.' + action,
  map: stops[story.chapter - 1].map,
  target: 'travelling-pocket-theatre',
});
export const pocketProofs = traces.map((tr) => {
  const s = byId.get(tr.story);
  if (
    !s ||
    !s.readings[tr.pane]?.includes(tr.excerpt) ||
    !tr.patterns.every((p) => s.patterns.includes(p))
  )
    throw Error('Pocket theatre trace ' + tr.story);
  const [story, game] = designs[s.id],
    objective = combine(s, 'compare');
  const dimensions = [...tr.patterns];
  return {
    ...objective,
    source: 'tests/pocket-theatre-traces.json',
    anchor: tr.excerpt,
    action:
      'Compare “' +
      s.controls[0][tr.pane & 1] +
      '” with “' +
      s.controls[1][tr.pane >> 1] +
      '” fitted. ' +
      tr.basis,
    dimensions,
    elements: ['story:' + story, 'game:' + game],
    patternPractice: tr.patterns.map((id) => ({
      id,
      basis: tr.basis,
      excerpt: tr.excerpt,
      pane: tr.pane,
      case: s.id,
    })),
  };
});
export const pocketCognition = pocketProofs.map((proof) => {
  const [story, game] = proof.elements.map((e) => Number(e.split(':')[1]));
  const item = byId.get(proof.patternPractice[0].case);
  return {
    objective: proof.objective,
    anchor: proof.anchor,
    story,
    game,
    dimensions: proof.dimensions,
    bloom: 'analyse',
    dok: 2,
    demand: proof.action,
    consequence: item.editions.map((e) => e.immediate).join(' / '),
  };
});
for (const item of stories) {
  const go = combine(item, 'send');
  const a = item.editions;
  const [story, game] = [11, 22];
  const proof = {
    ...go,
    source: 'tests/pocket-theatre.test.ts',
    anchor: 'can receive and return both editions',
    action:
      'Choose between “' +
      a[0].label +
      '” and “' +
      a[1].label +
      '” after trying two changes to “' +
      item.title +
      '”. A different operation opens in “' +
      byId.get(item.peer).title +
      '”.',
    dimensions: judgments[item.id].dimensions,
    elements: ['story:' + story, 'game:' + game],
  };
  pocketProofs.push(proof);
  pocketCognition.push({
    objective: go.objective,
    anchor: proof.anchor,
    story,
    game,
    bloom: 'evaluate',
    dok: 3,
    dimensions: proof.dimensions,
    demand: judgments[item.id].demand,
    consequence: item.editions.map((e) => e.return).join(' / '),
  });
  const op = combine(item, 'compare');
  for (const use of skillsByAction.get(op.objective) ?? []) {
    const work = skills
      .find((s) => s.number === use.number)
      .uses.find((u) => u.objective === op.objective);
    pocketProofs.push({
      ...op,
      source: 'tests/pocket-theatre.test.ts',
      anchor: 'four held comparisons',
      action: work.action,
      dimensions: ['micro:' + use.number],
      elements: ['story:' + use.story, 'game:' + use.game],
    });
  }
}
