import {
  courierCases,
  courierFlag,
  courierTopics,
  liftLandings,
  type Landing,
} from '../domain/courierLift';
import { specimenToolId } from '../domain/specimenGear';
import type {
  Condition,
  ContentPack,
  DialogueNode,
  Hint,
  Mission,
} from '../domain/types';

export const readyCase: Condition = {
  any: courierCases.map((c) => ({
    flag: 'perspective.active',
    eq: specimenToolId(c.key),
  })),
};
export const readyLanding = (stop: Landing): Condition => ({
  any: courierCases.map((c) => ({
    all: [
      { flag: 'perspective.active', eq: specimenToolId(c.key) },
      { flagSet: courierFlag(c, stop === 'market' ? 'west' : 'east') },
    ],
  })),
});
export function installCourierLift(pack: ContentPack) {
  const lookup = new Map(courierCases.map((c) => [c.exhibit, c]));
  pack.exhibits = pack.exhibits.map((e) => {
    const c = lookup.get(e.id);
    if (!c) return e;
    return {
      ...e,
      name: c.title,
      dateText: c.date,
      dateKind: c.kind,
      art: 'courier.' + c.shape,
      altText: courierDescriptions[c.shape],
      specimen: {
        key: c.key,
        institution: c.institution,
        accession: c.accession,
        source: c.source,
        objective: c.objective,
        people: c.people,
        fieldUse:
          'At the collection room’s counterweight lift, tip the cradle and post a marked address. Carry this object to the market counter or theatre door to decide whose reading goes first.',
      },
    };
  });
  installCounterweightStory(pack);
  for (const stop of Object.keys(liftLandings) as Landing[]) {
    const market = stop === 'market';
    const mission: Mission = {
      id: market ? 'KG-CH10-COUNTERWEIGHT' : 'KG-CH9-COUNTERWEIGHT',
      world: market ? 'WORLD-11' : 'WORLD-10',
      title: market
        ? 'The price of the empty crate'
        : 'Dress rehearsal for a parcel',
      knowledgeQuestion: market
        ? 'When does a receipt settle what we know about a thing?'
        : 'What changes when the same object enters through a different person’s story?',
      stake: market
        ? 'Someone has signed for three crates. Only the address slips came down the rope. Bew wants his sister to stop paying carriage for things she never received.'
        : 'Pella can introduce every object in the rehearsal. She goes quiet when someone asks who taught her what to say.',
      objectives: courierCases.map((c) => ({
        id: 'courier.' + c.shape + '.' + stop,
        title:
          (market ? 'Bring the market caller ' : 'Give the stage host ') +
          c.title +
          '.',
        essential: false,
        visible: { flagSet: courierFlag(c, market ? 'west' : 'east') },
        done: { flagSet: courierFlag(c, stop + '.opening') },
        weave: courierTopics(c,stop),
        onComplete: [{ journal: 'j.courier.' + c.shape + '.' + stop }],
      })),
    };
    pack.missions.push(mission);
    for (const [i, g] of mission.objectives.entries()) {
      const c = courierCases[i];
      pack.journal.push({
        id: 'j.' + g.id,
        text: market
          ? 'I brought the object to the market counter myself. ' + c.west
          : 'I took a turn at the theatre door. ' + c.east,
        claimKind: 'observation',
      });
      // The slip can reach a room while its original is still at base. The route only answers the equipped object.
      [
        mission.stake!,
        c.scene,
        'At the collection room, carry and equip this object. Follow the marked address to ' +
          (market ? 'the market square.' : 'the theatre foyer.'),
        market
          ? 'Pull the brass bell at Bew’s counter. You can put the carrier or the object first.'
          : 'Ring the handbell at Pella’s door. Let the stage host lead with the object or a named voice.',
      ].forEach((text, i) =>
        pack.hints.push({
          id: 'h.' + g.id + '.' + i,
          depth: (i + 1) as Hint['depth'],
          objective: g.id,
          text,
        }),
      );
    }
  }
}
export const courierDescriptions: Record<string, string> = {
  dome: 'An open book with a dome above one side, a column of printed lines on the other and a cloth-bound spine.',
  drawers:
    'An upright book beside the three paired compartments in its probability example. A single drawer has been pulled out.',
  'papyrus-red':
    'A single ochre papyrus sheet with bands of dark and red marks. The border marks the edge of the surviving sheet.',
  'papyrus-dark':
    'A wide, irregular papyrus strip with short administrative entries in separate groups. Horizontal fibres run across both groups.',
  'shallow-basket':
    'A shallow oval grass-fibre basket with a low rim on a plain support. The drawing shows the profile and leaves individual stitches out.',
  'bay-map':
    'A schematic folded map with a ragged bay edge and three tabs identifying different contributions to the Ngāi Tahu project’s public map.',
  'one-leaf':
    'A single light paper leaf seen from an angle. A turning corner shows a second face; two small coloured marks indicate the recorded signature.',
  'number-board':
    'A single rectangular drawing mount with a separate little series label. The empty window indicates the individual board without reproducing Bouabré’s image.',
  'roman-book':
    'A narrow open book with short printed rows and a separate catalogue tab for the 1898 romanised Malay edition.',
  'long-print':
    'A long, low paper mount in a pale frame, with a separate swatch marking a second material. The artist’s composition remains in the museum record.',
  rete: 'An open brass framework turns around a rounded inner sphere. Small projections stand for selected bright stars.',
  dugout:
    'A long, narrow dugout hull with raised ends and its displayed sail in profile. The off-board museum tag is separate from a tab bearing the name.',
  banknote:
    'A horizontal banknote mount with a pale numeral field and a separate dark serial strip. These are schematic details of the recorded note.',
};

function installCounterweightStory(pack: ContentPack) {
  pack.characters.push(
    {
      id: 'courier-bew',
      name: 'Bew',
      role: 'Freight clerk',
      sprite: 'villager-2',
      mode: 'fictional',
      talk: [{ node: 'courier.under.bew' }],
    },
    {
      id: 'courier-pella',
      name: 'Pella',
      role: 'Theatre caller',
      sprite: 'villager-1',
      mode: 'fictional',
      talk: [{ node: 'courier.under.pella' }],
    },
  );
  const node = (
    id: string,
    speaker: string,
    text: string,
    options: DialogueNode['options'] = [],
  ): DialogueNode => ({
    id: 'courier.under.' + id,
    speaker,
    text,
    options,
    historicalLabel: 'fictional-world',
  });
  const remembered: DialogueNode['options'] = [
    {
      text: 'Look at the knot above the cradle.',
      if: { flag: 'courier.family', eq: 'bell' },
      next: 'courier.under.bell',
    },
    {
      text: 'Open the paid envelope again.',
      if: { flag: 'courier.family', eq: 'receipt' },
      next: 'courier.under.receipt',
    },
  ];
  pack.dialogue.push(
    node(
      'bew',
      'courier-bew',
      'Bew is weighing an empty envelope against three brass coins. “Nemi taught me to take the fee when I heard the bell. She was up on stage. I never once looked up to see what she was doing.”',
      [
        ...remembered,
        {
          text: 'Let Pella open one of the envelopes.',
          next: 'courier.under.letter',
        },
        { text: 'Sit beside the counter for a while.' },
      ],
    ),
    node(
      'pella',
      'courier-pella',
      'Pella has been practising their sister Nemi’s entrance. “I used the freight bell between the lines to fill the silence. Bew counted every ring.” She lays the bell on the floor.',
      [
        ...remembered,
        { text: 'Turn over the old schedule.', next: 'courier.under.letter' },
        {
          text: 'Listen to her practise the entrance.',
          next: 'courier.under.hum',
        },
      ],
    ),
    node(
      'hum',
      'courier-pella',
      'With the bell on the floor, you can hear how carefully she takes a breath before Nemi’s name. The next line comes out a whisper. It carries.',
    ),
    node(
      'letter',
      'courier-pella',
      'The sisters’ first broadside has a tiny drawing of a bell. The fee slip has three tally strokes. One marks a delivery. Two mark Pella’s pauses on stage. Bew used the same bell to clear a cart.',
      [
        {
          text: 'Knot a second cord for the stage caller.',
          effects: [{ setFlag: 'courier.family', value: 'bell' }],
          next: 'courier.under.bell',
        },
        {
          text: 'Put the three fees in the sister’s hands.',
          effects: [{ setFlag: 'courier.family', value: 'receipt' }],
          next: 'courier.under.receipt',
        },
      ],
    ),
    node(
      'bell',
      'courier-bew',
      'There are two cords now. Bew hears the silver bell and stays at the counter. Through the floorboards, a woman’s voice gets to finish a sentence before the cart moves. He still owes her three coins.',
    ),
    node(
      'receipt',
      'courier-pella',
      'Pella folds the receipt around the three coins and sends it upstairs. Nobody has settled which bell belongs to whom. Tonight she gives the cue with her open hand.',
    ),
  );
}
