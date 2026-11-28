import {addMillCrew} from './millCrew';
import { millAccounts, millSites, millWeave, type MillSite } from './millShift';
import type { ContentPack } from '../domain/types';
import places from './ink-post-stations.json';

interface Job {
  part: string;
  title: string;
  help: [string, string];
  question: number;
  verb: string;
  extended?: boolean;
}
const jobs: Record<MillSite, Job[]> = {
  nile: [
    {
      part: 'compared',
      title: 'Try both books on the same six counters.',
      help: [
        'The gate book counts time. The piece book counts the names on boards.',
        'Lay out the bell book and then the stamped boards. Watch Tessel’s bowl.',
      ],
      question: 12,
      verb: 'comparing',
    },
    {
      part: 'sent',
      title: 'Tie the six counters into purses for the workers.',
      help: [
        'The counters must stay on the rail until both books have been opened.',
        'Keep either split or move individual counters. Then tie the purses. The press will get your actual settlement.',
      ],
      question: 27,
      verb: 'giving',
    },
    {
      part: 'read',
      title: 'Find what Bayette did with the mill accounts.',
      help: [
        'The Copies press can send a public proof or folded letters.',
        'At that press set a lead and a support line, then send an edition. Back at Imani’s desk, unfold it.',
      ],
      question: 7,
      verb: 'revising',
      extended: true,
    },
  ],
  yard: [
    {
      part: 'sent',
      title: 'Punch a four-bell shift for the press.',
      help: [
        'One feed puts three blanks on the rack. Each turn uses what it can reach.',
        'Fill all four positions with feeds or turns, then stamp the strip. You can lift a punch and try again.',
      ],
      question: 23,
      verb: 'modelling',
    },
    {
      part: 'joint',
      title: 'Find a shift that changes only when both hands and iron change.',
      help: [
        'Keep the four punches in place. The same motion can be tried on either wheel and with either crew.',
        'Feed once and turn three times. Stamp the strip on both wheels, alone and beside Tessel. Keep the four counts.',
      ],
      question: 5,
      verb: 'testing',
      extended: true,
    },
    {
      part: 'read',
      title: 'Open a printed account beside the actual mill.',
      help: [
        'Bayette needs the settlement or a stamped strip before printing.',
        'Print a proof at the Copies register, then unfold it here. A public proof can open the workers’ stair.',
      ],
      question: 15,
      verb: 'comparing',
      extended: true,
    },
  ],
  press: [
    {
      part: 'estimate',
      title: 'Put two estimates beside a shift missing from the books.',
      help: [
        'Try tying the four dates by wheel and by rota. Then find a run neither set of dates records.',
        'At the mill, stamp four moves with two teeth alone or one tooth beside Tessel. Back here bind both cords and try both estimates.',
      ],
      question: 18,
      verb: 'modelling',
      extended: true,
    },
    {
      part: 'compared',
      title: 'Print an edition after trying the inventor’s and porter’s accounts.',
      help: [
        'Keep the four dates fixed while changing which hands appear in the headline.',
        'Bind the slips both ways. Try the tooth and the rota as leads. With a purse or strip from another keeper, print your chosen edition.',
      ],
      question: 26,
      verb: 'revising',
      extended: true,
    },
    {
      part: 'edited-moods',
      title: 'Give the workers an edition about yesterday and one about tomorrow.',
      help: [
        'A missed shift and an open shift need different pieces of type.',
        'Send an edition with “had stayed” and “could have cut”. Then print one with “comes tomorrow” and “can feed”. Either may travel folded or open.',
      ],
      question: 10,
      verb: 'making',
      extended: true,
    },
    {
      part: 'print',
      title: 'Find readers for the mill proof.',
      help: [
        'A folded version can reach the three workers before the street sees it. An open version reaches people who never held the book.',
        'Bring a settlement or a tried strip, set two lines, then pin the proof outside or send three folds.',
      ],
      question: 7,
      verb: 'giving',
    },
  ],
};
export function addMillMissions(pack: ContentPack) {
  addMillCrew(pack);
  for (const site of millSites) {
    const work = millAccounts[site],
      world = places.find((p) => p.id === site)!.world,
      key = (p: string) => 'mill-shift.' + site + '.' + p;
    const objectives = jobs[site].map((g) => {
      const id = key(g.part);
      [
        work.opening,
        'Find ' + work.keeper + ' in the night register. Look for “' + work.title + '” west of the coat peg.',
        ...g.help,
      ].forEach((text, i) =>
        pack.hints.push({ id: 'h.' + id + '.' + i, objective: id, depth: (i + 1) as 1 | 2 | 3 | 4, text }),
      );
      return {
        id,
        title: g.title,
        essential: false,
        done: { flagSet: id },
        weave: millWeave(site, g.extended),
        questionWays: [{ id: 'KQ-ROUTE-' + String(g.question).padStart(2, '0'), action: g.verb }],
      };
    });
    const question = {
      nile: 'Who could make their work count in each book?',
      yard: 'Which change made a difference on these four bells?',
      press: 'Whose work can a reader recover from the edition you sent?',
    };
    pack.missions.push({
      id: 'KG-MILL-' + site.toUpperCase(),
      world,
      title: work.title,
      stake: work.opening,
      knowledgeQuestion: question[site],
      available: { flag: key('open'), eq: true },
      objectives,
    });
  }
}
