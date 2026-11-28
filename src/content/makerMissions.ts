import type { ContentPack, Objective, Weave } from '../domain/types';
import { makerTrials } from './makerTrials';

const jobs: Record<
  string,
  {
    title: string;
    question: string;
    room: string;
    verdict: string;
    work: Pick<Weave, 'concepts' | 'framework' | 'subjects' | 'aoks'>;
  }
> = {
  'rain-gauge': {
    title: 'The breakfast shelf',
    question: 'How far upstream can one cup see?',
    room: 'the rain stake by Noa’s board',
    verdict: 'The breakfast cups or the bridge watch will move when this slip reaches its reader.',
    work: {
      concepts: ['evidence', 'certainty', 'justification', 'responsibility'],
      framework: ['scope', 'methods-and-tools', 'ethics'],
      aoks: ['NAT', 'HUM', 'TEC'],
      subjects: ['physics', 'geography', 'math-ai'],
    },
  },
  'plumb-line': {
    title: 'The button in the plaster',
    question: 'How much movement might two matching marks hide?',
    room: 'the bell tower door',
    verdict: 'Maren can let the new ringer take a turn. The stoneworker can look one joint higher.',
    work: {
      concepts: ['evidence', 'certainty', 'explanation', 'perspective'],
      framework: ['methods-and-tools', 'scope', 'perspectives'],
      aoks: ['MAT', 'NAT', 'HIS', 'TEC'],
      subjects: ['math-ai', 'physics', 'history', 'design-tech'],
    },
  },
  'reed-pen': {
    title: 'The year between the strokes',
    question: 'Whose name belongs next to the missing part of a record?',
    room: 'the carved flood post by the bridge',
    verdict: 'Venn wants his father to be heard. The carver can still leave a space for a reader after him.',
    work: {
      concepts: ['interpretation', 'evidence', 'truth', 'responsibility', 'perspective'],
      framework: ['methods-and-tools', 'perspectives', 'ethics'],
      aoks: ['HIS', 'ART', 'LAN'],
      subjects: ['history', 'lang-langlit', 'visual-arts'],
    },
  },
};
export function makerWeave(
  tool: string,
  stage: 'fit' | 'compared-bounds' | 'recipient' = 'recipient',
): Weave {
  const work = jobs[tool].work;
  return {
    ...work,
    atl: stage === 'fit' ? ['thinking', 'research'] : ['thinking', 'communication', 'research'],
    thinking:
      stage === 'fit'
        ? {
            dok: 2,
            bloom: 'apply',
            fink: 'application',
            solo: 'multistructural',
          }
        : stage === 'compared-bounds'
          ? {
              dok: 2,
              bloom: 'analyse',
              fink: 'integration',
              solo: 'relational',
            }
          : {
              dok: 3,
              bloom: 'evaluate',
              fink: 'human',
              solo: 'relational',
            },
    minutes: stage === 'fit' ? 2 : 3,
  };
}
export function addMakerMissions(pack: ContentPack) {
  for (const t of makerTrials) {
    const job = jobs[t.tool],
      key = (part: string) => 'maker.' + t.tool + '.' + part;
    const objectives: Objective[] = [];
    function goal(
      stage: 'fit' | 'compared-bounds' | 'recipient',
      title: string,
      depths: string[],
      number: number,
      action: string,
    ) {
      const id = key(stage);
      objectives.push({
        id,
        title,
        essential: false,
        done: { flagSet: id },
        weave: makerWeave(t.tool, stage),
        questionWays: [{ id: 'KQ-ROUTE-' + String(number).padStart(2, '0'), action }],
      });
      depths.forEach((text, i) =>
        pack.hints.push({
          id: 'h.' + id + '.' + i,
          objective: id,
          depth: (i + 1) as 1 | 2 | 3 | 4,
          text,
        }),
      );
    }
    goal(
      'fit',
      'Fit the tool to Hesper’s two references.',
      [
        t.bench,
        'Find Hesper’s bench by the forge in Emberford.',
        'Keep a mounting face still while you try both cuts.',
        t.references.join('. Then ') + '. Choose either of the two ways to fit the tool.',
      ],
      23,
      'testing',
    );
    if (t.tool !== 'reed-pen')
      goal(
        'compared-bounds',
        'Trace how wide the reading can become.',
        [
          t.tool === 'rain-gauge'
            ? 'Both the catch and its ruled ring have edges.'
            : 'Daylight falls on both sides of the old notch.',
          'Take your checked tool to ' + job.room + '.',
          'Examine both surfaces. Two shutters appear under the reading.',
          'Shade the first limit alone. Keep it there and open the second. Watch the two end marks move.',
        ],
        8,
        'comparing',
      );
    goal(
      'recipient',
      'Find someone to use the two records.',
      [
        job.verdict,
        'Take your checked tool to ' + job.room + '.',
        'Try “' + t.surfaces[0] + '” and “' + t.surfaces[1] + '”.',
        'Choose who gets the slip. Their reply waits at the Lamp Wall in Emberford.',
      ],
      7,
      'giving',
    );
    pack.missions.push({
      id: 'KG-CH2-MAKER-' + t.tool.toUpperCase(),
      world: 'WORLD-02',
      title: job.title,
      stake: job.verdict,
      knowledgeQuestion: job.question,
      available: {
        any: ['marks0', 'marks1', 'seen0', 'seen1'].map((k) => ({
          flagSet: key(k),
        })),
      },
      objectives,
    });
  }
}
