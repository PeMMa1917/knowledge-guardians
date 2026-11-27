import { billWeave } from '../domain/ferryBill';
import { ferryMap, ferryWeave } from '../domain/pictureFerry';
import type {
  Condition,
  ContentPack,
  DialogueNode,
  Hint,
  Objective,
} from '../domain/types';

const is = (flag: string, eq: string | boolean): Condition => ({
  flag: 'picture-ferry.' + flag,
  eq,
});
const sailing: Condition = { flagSet: 'picture-ferry.landing' };
const realPrint = is('real-receipt', true);
const talking = (
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
): DialogueNode => ({
  id: 'picture-ferry.' + id,
  speaker,
  text,
  historicalLabel: 'fictional-world',
  options,
});
const talk = (text: string, id: string, condition?: Condition) => ({
  text,
  next: 'picture-ferry.' + id,
  if: condition,
});
const dialogue: DialogueNode[] = [
  talking(
    'tova',
    'ferry-tova',
    '“Ever see a moon come off in the wash?” Tova holds up a black sleeve with a bright silver thumb on it. “My Bo was small the night we had two moons. He says he put one there himself. I could have sworn I saw both before he was born.”',
    [
      talk('Take a look through the two windows.', 'lamp'),
      talk('Ask why she remembers the night so well.', 'storm'),
      talk(
        'Bring up the crossing that left on the bell.',
        'sail',
        is('landing', 'sail'),
      ),
      talk(
        'Sit with her on the moored crossing.',
        'moor',
        is('landing', 'moor'),
      ),
    ],
  ),
  talking(
    'storm',
    'ferry-tova',
    '“My first winter with the wheel. Mam sat here with her feet in a flour sack. Before she went ashore she said, ‘Fancy that, one for each of us.’ I have carried that sentence longer than I have carried this boat.” Tova rubs the silver mark. “I wonder if Bo has a sentence he wants to carry.”',
  ),
  talking(
    'lamp',
    'callboard-reader',
    '“The rail sees one leaf. The low bunk sees another. The third stays under the lamp.” Neris turns it once. “Try standing where our passengers stand. I spent a whole summer thinking everyone saw my show.”',
  ),
  talking(
    'neris',
    'callboard-reader',
    'Neris has put an orange at the eye level of a sleeping child. “I finally asked what the back bunks could see. He said, ‘Your boots.’ Good boots, mind. Very little plot.”',
    [
      talk('Watch Neris give the orange a turn.', 'orange'),
      talk('Ask what happened to the old bill.', 'signature'),
      talk('Bring the story back from the quay.', 'back', {
        flagSet: 'picture-ferry.received',
      }),
    ],
  ),
  talking(
    'orange',
    'callboard-reader',
    'Neris lies flat and rolls the orange along the bunk. It stops inside a circle of light. “There. That bit of ceiling is a fine theatre. It was also a fine theatre before I got here.”',
  ),
  talking(
    'signature',
    'callboard-reader',
    '“Signed a whole crew’s work with my own name once. One line on the bill, one hot dinner waiting at the end. When supper came round the printer was still at the press.” Neris opens the ticket leaf. “The next crew gets to see this before they agree to sail.”',
  ),
  talking(
    'bo',
    'picture-boy',
    '“Her moon is older than me,” says Bo. “Mine has paste on it.” He is drawing a wrinkle into a paper sea. “We can keep both. I just want mine where somebody might see how it got there.”',
    [
      talk('Ask for his supper ticket.', 'ticket'),
      talk('Offer him a job on the crossing.', 'job'),
      talk('Ask what he heard from shore.', 'back', {
        flagSet: 'picture-ferry.received',
      }),
    ],
  ),
  talking(
    'ticket',
    'picture-boy',
    'Bo prises the corner up with his thumbnail. Thursday’s stew has left a brown ring around one point of the crescent. “Mum says the moon in her story was the thin autumn one. I ran out of foil. Mine was going to be enormous.”',
  ),
  talking(
    'job',
    'picture-boy',
    '“I’ll take the low bunk. Grown-ups go there once, knock their heads, then report on the roof from up here.” He ties a bell to the leg of the bunk. “I can reach that flat on my back.”',
  ),
  talking(
    'sail',
    'ferry-tova',
    'A cook at the outer rail catches the first light just before the ferry casts off. Bo stays with his mother for the whole crossing. Neris runs a hand over the folded leaf and writes down who missed it. “Next trip,” the cook calls.',
  ),
  talking(
    'moor',
    'callboard-reader',
    'Tova knots the line. The child and the cook trade places at the lamp, and a waiting passenger misses the connection across the channel. Neris gives up a seat on the next boat and walks the long bank home. “I promised both of them a show.”',
  ),
  talking(
    'back',
    'picture-boy',
    '“One child told me which side of my boat they saw. Another asked who made it.” Bo has saved some foil. “Next week I want to hear Mum’s moon. I’ve never seen it from her side of the wheel.”',
  ),
  talking(
    'poster-sail',
    'stage-host',
    'Hari hangs a programme low enough to see from the last seat. “The ferry left on the bell. A passenger sent me the leaf they missed. I’m putting it where the next child can find it before we start.”',
  ),
  talking(
    'poster-moor',
    'stage-host',
    'Hari turns over a ticket with a wet corner. “The ferry stayed. One passenger missed our first scene. I’ve saved the empty chair and asked the understudy to give them the opening from her own side.”',
  ),
];
export function ferryLocalGreetings(pack: ContentPack) {
  const stops: Record<string, string> = {
    'ferry-tova': 'tova',
    'callboard-reader': 'neris',
  };
  pack.characters = pack.characters.map((c) =>
    stops[c.id]
      ? {
          ...c,
          localGreeting: {
            ...c.localGreeting,
            [ferryMap]: 'picture-ferry.' + stops[c.id],
          },
        }
      : c,
  );
}
const goals: Objective[] = [
  {
    id: 'picture-ferry.crossed',
    title: 'Light both windows and decide whether the ferry ties up.',
    essential: false,
    visible: { flagSet: 'picture-ferry.active' },
    done: sailing,
    weave: ferryWeave,
    onComplete: [{ journal: 'j.picture-ferry.crossed' }],
  },
  {
    id: 'picture-ferry.returned',
    title:
      'Take a signed print across, then find the reader waiting at Seagrass Steps.',
    essential: false,
    visible: sailing,
    done: realPrint,
    weave: {
      ...ferryWeave,
      framework: ['scope', 'ethics', 'perspectives'],
      thinking: {
        dok: 3,
        bloom: 'analyse',
        fink: 'integration',
        solo: 'relational',
      },
    },
    onComplete: [{ journal: 'j.picture-ferry.returned' }],
  },
  {
    id: 'picture-ferry.encore',
    title:
      'Peg three different prints on Bo’s line, then hear their programme in the theatre.',
    essential: false,
    visible: realPrint,
    done: { flag: 'picture-bill.heard', eq: true },
    weave: billWeave,
    onComplete: [{ journal: 'j.picture-bill.encore' }],
  },
];
const help = [
  [
    'Bo knows the view from the bunk. Neris has marked the rail with a loop of orange thread.',
    'The paper has three leaves. The lamp shines on two at a time.',
    'Fit Bo’s paper moon or a signed Callboard print. Try turning the wheel and reversing the sleeve.',
    'After choosing an arrangement, look through the rail window and the bunk window. Ring the sailing bell or tie the ferry up. You can change the arrangement later.',
  ],
  [
    'Neris keeps the Civic sheets separate. The passenger will know which one you brought.',
    'A signed print comes from putting the visible detail beside the collection record at the Civic Callboard.',
    'Perform with any signed print and step ashore. Look for the passenger’s bench by the ferry.',
    'At the passenger’s bench select the print you just used. Hand it across to hear what the passenger took home.',
  ],
  [
    'Neris dried three pages of the bill on a clothesline. Bo put a different job under each peg.',
    'Only prints that have made a crossing come out of the dry case for the show. The paper moon belongs with Bo.',
    'Try one print at different pegs. Look at the line the audience will hear. Each print can occupy one place at a time.',
    'Fit, check and sail three signed prints. At the line, pick one for each peg and choose who opens. Follow the theatre route and listen to all three pages in the gallery.',
  ],
];
export const pictureFerryContent: Partial<ContentPack> = {
  characters: [
    {
      id: 'picture-boy',
      name: 'Bo',
      role: 'Ferry artist and keeper of the low bunk bell',
      mode: 'fictional',
      sprite: 'villager-1',
      talk: [{ node: 'picture-ferry.bo' }],
    },
  ],
  dialogue,
  missions: [
    {
      id: 'KG-CH8-PICTURE-FERRY',
      world: 'WORLD-09',
      title: 'The night we had two moons',
      stake:
        'Bo has signed one moon. Tova has spent half her life steering by the other. People at the two windows on their boat see a different show.',
      knowledgeQuestion:
        'What can an image establish when a second audience can see a different part of its record?',
      objectives: goals,
    },
  ],
  hints: goals.flatMap((g, i) =>
    help[i].map((text, j): Hint => ({
      id: 'h.' + g.id + '.' + (j + 1),
      objective: g.id,
      depth: (j + 1) as Hint['depth'],
      text,
    })),
  ),
  journal: [
    {
      id: 'j.picture-bill.encore',
      claimKind: 'interpretation',
      text: 'I heard our three objects make one show. The opening could give the audience an image to revisit, or a question to carry through the other two pages.',
    },
    {
      id: 'j.picture-ferry.crossed',
      claimKind: 'observation',
      text: 'I stood at the rail and then by Bo’s bunk. The paper stayed in the lamp while the part I could see changed.',
    },
    {
      id: 'j.picture-ferry.returned',
      claimKind: 'interpretation',
      text: 'I carried a signed picture across the water. On the quay I heard what the passenger could do with the part they had seen.',
    },
  ],
};
