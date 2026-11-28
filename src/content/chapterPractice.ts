import type { ContentPack, Weave } from '../domain/types';

interface ReturnVisit {
  world: number;
  stop: string;
  objective: string;
  start: string;
  change: string;
  question: string;
  framework: NonNullable<Weave['framework']>;
  thinking: NonNullable<Weave['thinking']>;
}
const investigate = { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' } as const;
const decide = { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' } as const;
const test = { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' } as const;
export const returnVisits: ReturnVisit[] = [
  {
    world: 1,
    stop: 'The Nexus',
    objective: 'm01.o6.label',
    start: 'Three pens on the stands all claim a first.',
    change:
      'A visitor can read the kind of first the Guardian chose to support. The portal can open after Ise sees the repaired label.',
    question: 'Which visitor would need a date, and which would need a working mark?',
    framework: ['scope', 'methods-and-tools'],
    thinking: decide,
  },
  {
    world: 2,
    stop: 'Emberford',
    objective: 'm02.o3.thread',
    start: 'Corvan has a product claim and a name to sell with it.',
    change:
      'The Guardian can bring the route through stall and guild books to the next conversation about what the label promises.',
    question: 'Where could an honest seller have picked up a claim the smith never made?',
    framework: ['perspectives', 'methods-and-tools'],
    thinking: investigate,
  },
  {
    world: 3,
    stop: 'The Nile Archive',
    objective: 'nile.dispatch',
    start: 'Imani has several leads and one first packet to send.',
    change: 'Ise receives the packet the Guardian actually chose and has to use the account it carries.',
    question: 'Who can act on the first packet? What would the other lead have let them check?',
    framework: ['perspectives', 'scope'],
    thinking: decide,
  },
  {
    world: 4,
    stop: 'The Cold Store',
    objective: 'preserved.publish',
    start: 'A heading and a coastal context file fill different gaps in a transfer.',
    change:
      'The registrar can open a display with the Guardian’s arrangement. A visitor gets a first source and a way to pursue the other.',
    question: 'Where would an empty line help a visitor more than a smooth caption?',
    framework: ['perspectives', 'ethics'],
    thinking: decide,
  },
  {
    world: 5,
    stop: 'The Observatory Coast',
    objective: 'coast.revise',
    start: 'The quay and headland crews have already received an initial weather notice.',
    change:
      'A second headland reading can travel in a revised notice. The first recipients still have a reason to remember the earlier warning.',
    question: 'What changes for the quay when a measurement comes from the headland?',
    framework: ['scope', 'methods-and-tools'],
    thinking: investigate,
  },
  {
    world: 6,
    stop: 'The Living Forest',
    objective: 'forest.recheck',
    start: 'Two lookout posts returned counts and the steward has issued a notice.',
    change:
      'A return watch gives Elian an obstructed view to account for. The count alone can no longer stand in for everything in the forest.',
    question: 'How could fewer sightings mean something other than fewer animals?',
    framework: ['scope', 'methods-and-tools'],
    thinking: investigate,
  },
  {
    world: 7,
    stop: 'The Metalworks',
    objective: 'metal.compare',
    start: 'Two blue panels look alike on the stand.',
    change:
      'Corra receives two weights. A buyer can ask for the intake receipt to see what the balance could never establish.',
    question: 'Which claim would a better balance settle, and which still needs the receipt?',
    framework: ['scope', 'methods-and-tools'],
    thinking: test,
  },
  {
    world: 8,
    stop: 'The City of Copies',
    objective: 'copies.publish',
    start: 'The public copies have rubbed out part of Tuesday’s notice.',
    change: 'A recipient can recover a trial time and its source from Mina’s new notice.',
    question: 'Which piece could go missing in the next copy even if the time stays legible?',
    framework: ['methods-and-tools', 'ethics'],
    thinking: decide,
  },
  {
    world: 9,
    stop: 'The Chart Sea',
    objective: 'sea.compare',
    start: 'The harbour chart and shoal survey suggest different edges to the known water.',
    change:
      'Renna can point to where each survey stops before Sora chooses which view a sailor will see first.',
    question: 'Would a blank on the two sheets mean the same thing to the same crew?',
    framework: ['scope', 'perspectives'],
    thinking: investigate,
  },
  {
    world: 10,
    stop: 'The House of Performance',
    objective: 'stage.finish',
    start: 'A pause in the doorway drew comments from the gallery.',
    change: 'Hari can print a program that keeps the performed movement and a spectator’s account distinct.',
    question: 'How would you preserve what a spectator felt without making it a stage direction?',
    framework: ['perspectives', 'methods-and-tools'],
    thinking: decide,
  },
  {
    world: 11,
    stop: 'The Market of Measures',
    objective: 'market.compare',
    start: 'Two prices are posted beside two loaded baskets.',
    change:
      'Tellen can show what the goods weigh after the containers are accounted for. The household’s purse can now enter the decision.',
    question: 'When do two accurate weights still make an unfair comparison?',
    framework: ['scope', 'methods-and-tools'],
    thinking: test,
  },
  {
    world: 12,
    stop: 'The Water Commons',
    objective: 'water.publish',
    start: 'Sena has requests from rows of growers and a lower channel during a drought.',
    change:
      'The first gate order puts water on a particular route. The work left waiting stays on the record.',
    question: 'Whose loss would disappear if you recorded only the water delivered?',
    framework: ['ethics', 'perspectives'],
    thinking: decide,
  },
  {
    world: 13,
    stop: 'The Civic Machine',
    objective: 'civic.compare',
    start: 'The desk and walking crew have collected requests in different places.',
    change:
      'The Guardian can run one allocation rule on both tallies and check whom the desk heading leaves out.',
    question: 'Who can change the tally without changing the rule at all?',
    framework: ['methods-and-tools', 'ethics'],
    thinking: investigate,
  },
  {
    world: 14,
    stop: 'The Archive of Voices',
    objective: 'voices.publish',
    start: 'A permission card and a register describe two moments in a recording’s life.',
    change:
      'Eren posts the Guardian’s route notice on Glass Walk. The people following it have permission for a particular use.',
    question: 'Which detail could be true of the recording and still be someone else’s to share?',
    framework: ['ethics', 'perspectives'],
    thinking: decide,
  },
  {
    world: 15,
    stop: 'The Unfinished Island',
    objective: 'island.retest',
    start: 'The crew has a dock sheet written for the upper landing.',
    change:
      'A changed ramp allows a second run. The crew can compare the earlier ferry choice with another route under the lower setting.',
    question: 'What part of the earlier decision survives the ramp change?',
    framework: ['scope', 'methods-and-tools'],
    thinking: investigate,
  },
  {
    world: 16,
    stop: 'The Council of Hours',
    objective: 'council.finish',
    start: 'The loading crew has a watch docket. A courier sees the shutter from the other side.',
    change:
      'Both crews get a time check. The first docket stays available so the change can be reconstructed.',
    question: 'What would a later keeper lose if a correction replaced the original docket?',
    framework: ['methods-and-tools', 'ethics'],
    thinking: decide,
  },
];
export function reviewChapterPractices(pack: ContentPack) {
  const rows = new Map(returnVisits.map((r) => [r.objective, r]));
  for (const mission of pack.missions)
    for (const step of mission.objectives) {
      const row = rows.get(step.id);
      if (row && step.weave)
        step.weave = {
          ...step.weave,
          framework: step.weave.framework ?? row.framework,
          thinking: step.weave.thinking ?? row.thinking,
        };
    }
}
