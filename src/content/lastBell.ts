import type { ContentPack, Hint, Weave } from '../domain/types';

export const sleeveEntry =
  'W–17 · Kitchen window, night of the spring tide. The cylinder has three grooves. The witness marked the sleeve for a private listening or her unsigned wording. Wren recorded the loan.';
export const bellGrooves = [
  'I heard it ring.',
  'By “it” I mean the little bell beside our stove.',
  'From our room I couldn’t hear the tower.',
];
export const bellCuts = [
  {
    label: 'Send the whole groove in its listening sleeve',
    account: 'The witness lends her complete recording for one visitor at a time.',
    outcome:
      'Wren gives up her own listening chair. A small line forms. At the back, a girl mouths the last sentence along with her sister. Joss draws a boot on their sleeve. Her model is waiting in the Island’s Plan Workshop.',
  },
  {
    label: 'Pin the wording the witness approved',
    account:
      'The unsigned slip says a household heard its kitchen bell. Whether the tower rang is still open.',
    outcome:
      'The ferry crew can read the slip together. The witness pockets her cylinder. “My sister would know my voice anywhere.” She asks you to take the slip to the runner at the Island’s Plan Workshop.',
  },
];
export const relayRuns = ['Kiln yard', 'Sail loft'] as const;
export const bellLeaves = ['Kitchen testimony', 'Runner’s chart', 'Reply ledger'] as const;
export const hearingChoices = [
  {
    label: 'Leave the chair with the families',
    outcome:
      'Hale slides his chair through the rail. A family can call the next hearing. The tower crew waits for an invitation.',
  },
  {
    label: 'Give the dawn shift a public trial',
    outcome:
      'Essi books the crew for a trial at first light. Anyone can watch. Families on the night shift will have to send someone or miss it.',
  },
];

export const secondHearing = [
  {
    action: 'Let the households design the next trial',
    answer:
      'Ro puts the two blank addresses at the top of a fresh sheet. Each household can choose a knock, a messenger or space to give its own account. The tower crew must wait to compare like with like.',
  },
  {
    action: 'Repeat the crossing with both houses watching',
    answer:
      'Joss gives the start cord to one house and the finish cord to the other. The crews get comparable times at last. Wren keeps a separate chair for a witness who wants to speak privately.',
  },
];
export type LastBellSite = 'voices' | 'island' | 'council';
interface Scene {
  title: string;
  map: string;
  world: string;
  chapter: number;
  opening: string;
  task: string;
  prompts: [string, string];
  hints: [string, string, string, string];
  weave: Weave;
  route: string;
}
export const lastBellScenes: Record<LastBellSite, Scene> = {
  voices: {
    title: 'The bell in the kitchen',
    map: 'voices.listening',
    world: 'WORLD-14',
    chapter: 13,
    opening:
      'Someone has chalked “I heard it ring” under the tower keeper’s portrait. A girl from one of the two dark windows sets a wax cylinder on Wren’s table. “That is my voice. Please let me finish.” The chalk ends at the first seam in the wax.',
    task: 'Fit the start and end stops on the cylinder. Wind the chalked words alone, then listen past the cut. Decide what the girl will let the town carry.',
    prompts: [
      'What happened to the pronoun when the words after it disappeared?',
      'What did hearing a voice add that a crowd reading its words could lose?',
    ],
    hints: [
      'The chalk mark lines up with a seam in the wax.',
      'Find Wren’s listening hood in the Listening Room.',
      'Set both stops at the first groove. Then leave the start there and move the end to the third.',
      'Spin each cut. Once the witness has heard both, she offers a listening sleeve or an unsigned slip.',
    ],
    weave: {
      concepts: ['evidence', 'interpretation', 'power', 'perspective', 'truth', 'responsibility'],
      framework: ['scope', 'perspectives', 'ethics', 'methods-and-tools'],
      aoks: ['ART', 'HIS', 'LAN'],
      subjects: ['lang-langlit', 'lit-perf', 'film', 'history'],
      atl: ['research', 'communication'],
      minutes: 4,
      thinking: { dok: 3, bloom: 'analyse', fink: 'human', solo: 'relational' },
    },
    route: 'KQ-ROUTE-07',
  },
  island: {
    title: 'The runner with one pair of boots',
    map: 'island.workshop',
    world: 'WORLD-15',
    chapter: 14,
    opening:
      'Joss takes both little boots off Ivo’s model and puts them side by side. “Lovely boots. There’s only one of me.” At the kiln, someone must move the clay before the water comes. Upstairs in the sail loft a boy sleeps through the morning shift.',
    task: 'Run both lanes in fog. Lift the shutter on one run to see what the tower changes. Watch the four-beat crossing deadline. Put the boots where you want the runner to go first.',
    prompts: [
      'Which paths shared a single point of failure?',
      'What would you have to measure on the actual hill before trusting its wooden double?',
    ],
    hints: [
      'Joss cannot run two lanes at once.',
      'Find the turning plinth in the Plan Workshop.',
      'In clear air the tower relays to both houses. Close its shutter and send one runner to each house in turn.',
      'Test both runners’ routes in fog and repeat one route in clear air. Compare the two households’ arrival beats and post one route.',
    ],
    weave: {
      concepts: ['explanation', 'evidence', 'certainty', 'values', 'objectivity', 'justification'],
      framework: ['methods-and-tools', 'scope', 'ethics'],
      aoks: ['MAT', 'HUM', 'TEC'],
      subjects: ['math-ai', 'geography', 'computer-science', 'design-tech'],
      atl: ['thinking', 'research'],
      minutes: 4,
      thinking: { dok: 3, bloom: 'evaluate', fink: 'application', solo: 'relational' },
    },
    route: 'KQ-ROUTE-05',
  },
  council: {
    title: 'A chair on the other side',
    map: 'council.hall',
    world: 'WORLD-16',
    chapter: 15,
    opening:
      'Hale has mended the hearing chair three times. A child turns it round so the people behind the rail can sit in it. “Who sits there tomorrow?” she asks. For once Hale leaves his pencil on the hook.',
    task: 'Lay two different records on the hearing desk. The first decides who opens the meeting. The second limits what they can say. Choose who gets to call people back.',
    prompts: [
      'Which part of your finding came from testimony, a model or a count?',
      'Who could challenge your arrangement, and what would it cost them to do so?',
    ],
    hints: [
      'The chair turns both ways. Two records fit on its desk.',
      'Find the hearing lamp in Time Hall.',
      'Lay a witness, a tested route or a reply ledger first. Put a different record beside it and read what it can establish.',
      'Move the first slip to the back to reverse the speakers. Leave the chair with the families or book a public trial.',
    ],
    weave: {
      concepts: ['evidence', 'justification', 'responsibility', 'power', 'values', 'perspective'],
      framework: ['methods-and-tools', 'perspectives', 'ethics', 'scope'],
      aoks: ['HUM', 'HIS', 'MAT', 'POL'],
      subjects: ['global-politics', 'history', 'math-ai', 'lang-langlit'],
      atl: ['communication', 'social'],
      minutes: 4,
      thinking: { dok: 3, bloom: 'create', fink: 'integration', solo: 'relational' },
    },
    route: 'KQ-ROUTE-01',
  },
};

export const lastBellObjective = (site: LastBellSite) => 'last-bell.' + site + '.left';
export function installLastBell(pack: ContentPack) {
  for (const site of Object.keys(lastBellScenes) as LastBellSite[]) {
    const scene = lastBellScenes[site],
      id = lastBellObjective(site);
    pack.missions.push({
      id: 'KG-CH' + scene.chapter + '-last-bell',
      title: scene.title,
      world: scene.world,
      stake: scene.opening,
      knowledgeQuestion: scene.prompts[0],
      objectives: [
        {
          id,
          essential: false,
          title: scene.task,
          visible: { flagSet: 'last-bell.' + site + '.work' },
          done: { flag: id, in: [0, 1] },
          weave: scene.weave,
          questionWays: [{ id: scene.route, action: scene.task }],
        },
      ],
    });
    scene.hints.forEach((text, i) =>
      pack.hints.push({ id: 'h.' + id + '.' + i, objective: id, text, depth: (i + 1) as Hint['depth'] }),
    );
  }
  const sleeve = 'last-bell.voices.sleeve';
  const voiceMission = pack.missions.find((m) => m.id === 'KG-CH13-last-bell')!;
  voiceMission.objectives.unshift({
    id: sleeve,
    essential: false,
    title: 'Follow the shelf mark on the chalk strip to its wax sleeve.',
    done: { flag: sleeve, eq: true },
    visible: { any: [{ flagSet: 'last-bell.voices.work' }, { flag: sleeve, eq: true }] },
    weave: {
      concepts: ['evidence'],
      framework: ['methods-and-tools'],
      aoks: ['HIS', 'LAN'],
      subjects: ['history', 'lang-langlit'],
      atl: ['research'],
      minutes: 1,
      thinking: { dok: 1, bloom: 'remember', fink: 'foundational', solo: 'unistructural' },
    },
  });
  [
    'A little shelf mark survived the chalk writer’s scissors.',
    'Look at the bottom edge of the chalk strip at Wren’s listening hood.',
    'The pasted corner reads W–17. Wren keeps her sleeves in order.',
    'Follow W–17 to the shelf. The loan record identifies which cylinder you are about to wind.',
  ].forEach((text, i) =>
    pack.hints.push({
      id: 'h.' + sleeve + '.' + i,
      objective: sleeve,
      text,
      depth: (i + 1) as Hint['depth'],
    }),
  );
  const revision = 'last-bell.island.field-check';
  pack.missions.push({
    id: 'KG-CH14-last-bell-walk',
    world: 'WORLD-15',
    title: 'The plank that tips',
    stake: 'Joss has a splinter in her glove from the real bridge.',
    knowledgeQuestion: 'What earns a correction to a model?',
    objectives: [
      {
        id: revision,
        essential: false,
        title: 'Follow Joss across the bridge, retest her time in fog and post the measured route.',
        visible: { flagSet: 'last-bell.island.left' },
        done: { flag: revision, eq: true },
        weave: {
          ...lastBellScenes.island.weave,
          thinking: { dok: 3, bloom: 'evaluate', fink: 'learning-to-learn', solo: 'relational' },
        },
        questionWays: [
          {
            id: 'KQ-ROUTE-04',
            action:
              'Compare the bridge against Joss’s timed walk before offering the new result to the next shift.',
          },
        ],
      },
    ],
  });
  [
    'Joss took the stamp in her glove out onto the actual hill.',
    'Return to the turning plinth after filing an island route.',
    'Walk the footbridge with Joss. Its hinged plank falls quickly one way and has to be lifted the other.',
    'Close the fog shutter again. Send the runner along the route you want to leave, then post it with the measured times.',
  ].forEach((text, i) =>
    pack.hints.push({
      id: 'h.' + revision + '.' + i,
      objective: revision,
      text,
      depth: (i + 1) as Hint['depth'],
    }),
  );

  const rehear = 'last-bell.council.reopened';
  pack.missions.push({
    id: 'KG-CH15-return-hearing',
    world: 'WORLD-16',
    title: 'Two empty lines at dawn',
    stake: 'Ro has to send a public answer back to two houses whose voices were missing.',
    knowledgeQuestion: 'What survives when a warning is tested by the people who have to live with it?',
    objectives: [
      {
        id: rehear,
        essential: false,
        title:
          'Bring the bell setting, dispatch rota, witness and walked trial back to the hearing. Give both houses a part in tomorrow’s check.',
        visible: {
          all: [{ objective: 'last-bell.council.left' }, { objective: 'last-bell.island.field-check' }],
        },
        done: { flag: rehear, in: [0, 1] },
        weave: {
          ...lastBellScenes.council.weave,
          thinking: { dok: 4, bloom: 'create', fink: 'integration', solo: 'extended' },
          minutes: 5,
        },
        questionWays: [
          {
            id: 'KQ-ROUTE-07',
            action:
              'Reopen the public finding with evidence from four other chapters and give the households or the test crew a new role.',
          },
        ],
      },
    ],
  });
  [
    'Ro keeps two chairs open at dawn.',
    'Find Maro’s tide strips at the Old Weir and Ro’s six-household rota in Library Dispatch.',
    'Hear the cut at Wren’s hood. Time the island plank in both directions and post a retested route.',
    'Sign a first finding at the hearing lamp. Bring all four records back, then give the households or the crew the lead on the dawn trial.',
  ].forEach((text, i) =>
    pack.hints.push({
      id: 'h.' + rehear + '.' + i,
      objective: rehear,
      text,
      depth: (i + 1) as Hint['depth'],
    }),
  );
}
