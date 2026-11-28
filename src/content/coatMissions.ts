import type { ContentPack, Weave } from '../domain/types';
import { coatKey, pocketPlace, pocketSender } from '../domain/pocketCoat';
import { pocketStories } from './pocketStories';
import stations from './ink-post-stations.json';

// For each job these are the two worked contrasts and the choice of what travels.
// The same question returns when the keeper in the other chapter borrows that fitting.
const coatQuestions: Record<string, [number[], number[], number[]]> = {
  archive: [[1, 9], [2, 10], [27]],
  nile: [[6, 33], [3, 19], [29]],
  cold: [[5, 28], [8, 22], [31]],
  coast: [[14, 15, 26], [18, 30], [24]],
  fern: [[23, 25], [4, 20], [13]],
  yard: [[23, 32], [9, 28], [10]],
  press: [[2, 9], [1, 19], [27]],
  chart: [[9, 23], [12, 35], [7]],
  stage: [[21, 35], [26, 30], [10]],
  market: [[12, 25], [17, 32], [7]],
  gate: [[2, 9], [8, 18], [31]],
  dispatch: [[6, 34], [5, 34], [11]],
  voices: [[4, 25], [3, 26], [16]],
  island: [[8, 30], [7, 24], [11]],
  council: [[12, 35], [17, 29], [27]],
};
const ways = (site: string, action: number, verb: string) =>
  coatQuestions[site][action].map((number) => ({
    id: 'KQ-ROUTE-' + String(number).padStart(2, '0'),
    action: verb,
  }));
export function coatWeave(site: string, comparison = false): Weave {
  const pocket = pocketStories[site];
  const social = ['voices', 'council', 'market', 'nile', 'dispatch'].includes(site);
  const artistic = ['archive', 'press', 'stage'].includes(site);
  return {
    concepts: social
      ? ['evidence', 'power', 'responsibility', 'perspective']
      : artistic
        ? ['interpretation', 'perspective', 'values', 'evidence']
        : ['evidence', 'explanation', 'certainty', 'justification'],
    framework: social
      ? ['perspectives', 'methods-and-tools', 'ethics']
      : ['scope', 'methods-and-tools', 'perspectives'],
    subjects: pocket.subjects,
    aoks: pocket.areas,
    atl: ['thinking', 'communication', 'research'],
    thinking: comparison
      ? { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }
      : { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' },
    minutes: comparison ? 4 : 3,
  };
}
export function addCoatMissions(pack: ContentPack) {
  for (const [index, station] of stations.entries()) {
    const id = station.id,
      p = pocketStories[id],
      incoming = pocketSender(id)!;
    const key = (suffix: string) => coatKey(id, suffix);
    const goals = [
      ...p.controls.map(([name, l, r], i) => ({
        id: key('compared' + i),
        title: 'Try both fittings for ' + name.toLowerCase() + '.',
        clues: [
          p.opening,
          'Visit the blue shift coat in ' + station.place + '’s night register.',
          'Keep the other fitting in place between your two impressions.',
          'Try “' + l + '” and “' + r + '”. Pull an impression at each setting.',
        ],
        weave: coatWeave(id),
        questionWays: ways(id, i, 'testing'),
      })),
      {
        id: key('sent'),
        title: 'Sew one result into the coat for ' + pocketPlace(p.to) + '.',
        clues: [
          p.question,
          'The blue coat hangs inside the night register.',
          'Sew either seam once you have tried two arrangements that differ by one fitting.',
          'Choose a tested arrangement and send it to ' + pocketPlace(p.to) + '.',
        ],
        weave: coatWeave(id, true),
        questionWays: ways(id, 2, 'giving'),
      },
      ...pocketStories[incoming].controls.map(([name], i) => ({
        id: key('counter' + i),
        title: 'Try the travelling ' + name.toLowerCase() + ' at ' + station.place + '.',
        clues: [
          'The lining has a pocket from ' + pocketPlace(incoming) + '.',
          'Visit that register first and stitch a tested arrangement inside.',
          'Back here, open the pocket and keep its original impression.',
          'Try the other fitting for ' +
            name.toLowerCase() +
            '. The sender can still see their earlier reading.',
        ],
        weave: coatWeave(incoming, true),
        questionWays: ways(incoming, i, 'comparing'),
      })),
    ];
    pack.missions.push({
      id: 'KG-CH' + (index + 1) + '-SHIFT-COAT',
      world: station.world,
      title: p.title,
      stake: p.opening,
      available: { flag: key('open'), eq: true },
      knowledgeQuestion: p.question,
      objectives: goals.map((g) => ({
        id: g.id,
        title: g.title,
        essential: false,
        done: { flagSet: g.id },
        weave: g.weave,
        questionWays: g.questionWays,
      })),
    });
    for (const g of goals)
      g.clues.forEach((text, i) =>
        pack.hints.push({
          id: 'h.' + g.id + '.' + i,
          objective: g.id,
          depth: (i + 1) as 1 | 2 | 3 | 4,
          text,
        }),
      );
  }
}
