// Each row describes one distinct operation. Only its specific objective receives the skill link.
import { readFileSync } from 'node:fs';
const read = (name) =>
  JSON.parse(
    readFileSync(new URL('../src/content/' + name, import.meta.url), 'utf8'),
  );
const sites = read('return-coat-sites.json');
const skills = read('skillPractice/return-coat.json');
const lenses = {
  print: ['concept:evidence', 'framework:scope', 'area:HIS'],
  fare: ['concept:responsibility', 'framework:ethics', 'area:HIS'],
  cross: ['concept:values', 'framework:scope', 'area:HUM'],
  awning: ['concept:perspective', 'framework:perspectives', 'area:HUM'],
  act: ['concept:explanation', 'framework:methods-and-tools', 'area:ART'],
  part: ['concept:truth', 'framework:scope', 'area:ART'],
  mask: ['concept:responsibility', 'framework:ethics', 'theme:POL'],
  hinge: ['concept:power', 'framework:perspectives', 'theme:POL'],
};
export const returnCoatProofs = [];
export const returnCoatCognition = [];
for (const skill of skills)
  for (const use of skill.uses) {
    const [, siteId, trial] = use.objective.split('.');
    const site = sites.find((s) => s.id === siteId);
    const entry = site.trials.find((t) => t[0] === trial);
    const dimensions = [
      'micro:' + skill.number,
      ...lenses[trial],
      'question:KQ-ROUTE-25',
    ];
    const anchor = 'records only the operation the Guardian actually tried';
    returnCoatProofs.push({
      objective: use.objective,
      map: site.map,
      target: 'return-coat-' + siteId + '-work',
      source: 'tests/return-coat.test.ts',
      anchor,
      action: use.action,
      dimensions,
      elements: ['story:' + use.story, 'game:' + use.game],
    });
    returnCoatCognition.push({
      objective: use.objective,
      anchor,
      story: use.story,
      game: use.game,
      dimensions,
      bloom: 'analyse',
      dok: 2,
      demand: use.action,
      consequence: entry[4],
    });
  }

for (const skill of read('skillPractice/indoor-rain.json')) {
  for (const use of skill.uses) {
    const site = use.objective.split('.')[2];
    const comparison = skill.number === 270;
    const dimensions = [
      'micro:' + skill.number,
      'question:KQ-ROUTE-25',
      ...(comparison
        ? ['concept:explanation', 'framework:methods-and-tools', 'area:NAT']
        : ['concept:perspective', 'framework:perspectives', 'area:ART']),
    ];
    const anchor =
      'credits an authored score only after an audience and a worker';
    returnCoatProofs.push({
      objective: use.objective,
      map: site === 'stage' ? 'stage.foyer' : 'nexus.coat-lining',
      target: 'indoor-rain-rig',
      source: 'tests/rain-score.test.ts',
      anchor,
      action: use.action,
      dimensions,
      elements: ['story:' + use.story, 'game:' + use.game],
    });
    returnCoatCognition.push({
      objective: use.objective,
      anchor,
      story: use.story,
      game: use.game,
      dimensions,
      bloom: comparison ? 'analyse' : 'create',
      dok: 2,
      demand: use.action,
      consequence: comparison
        ? 'The kept bar and the new one sound identical in the stalls. The workforce in the wings can point to two different gestures.'
        : 'The company in the other room receives this exact score and its chosen billing. A changed rehearsal leaves that version in circulation.',
    });
  }
}
