import type { ContentPack } from '../domain/types';
import type { MillSite } from './millShift';

interface Crew {
  id: string;
  site: MillSite;
  name: string;
  role: string;
  coat: string;
  first: string;
  returned: string;
  work: string;
  invite: string;
  news: string;
  offers: [string, string];
  replies: [string, string];
  from: string;
  heard: [string, string];
}
export const millCrew: Crew[] = [
  {
    id: 'liri-pell',
    site: 'yard',
    name: 'Liri Pell',
    invite: 'See the shelf Liri has promised to fit.',
    news: 'Tell Liri what Aven put in the guild book.',
    role: 'Mill apprentice and tool fitter',
    coat: 'tan.auburn.slate.sand.none.rose.bun.none.none',
    first:
      '“Give me your thumb.” Liri holds a paper strip against it. “There. That’s how high the feed shelf feels to me. Tessel’s shoulder comes up here. Whose elbow do you suppose they built it for?” She has been saving for a drill of her own. The shelf is her first commission.',
    returned:
      'Liri rolls the proof into a tube and holds it to her ear. “My name sounds just the same in here. I thought it would be louder.” On her palm there is a drawing with two holes for the feed shelf.',
    work: 'Aven has promised her one afternoon to change the shelf. Tessel can let her try his reach, or she can keep the old holes beside her own so a later apprentice can move it again.',
    offers: ['Walk the load with Tessel before drilling.', 'Keep both sets of holes for the next hand.'],
    replies: [
      '“Good. He always makes that turn sideways.” Liri scrapes her own pencilled shoulder off the drawing. Two figures can fit there now.',
      'She draws the old holes in red. “Somebody let me move it. I’d like to leave that much for the girl after me.” The second fitting will take most of the afternoon.',
    ],
    from: 'aven-dorr',
    heard: [
      '“Aven put my rough copy in the book?” Liri looks at the ink on her sleeve. “Right. They’ll see it took me three goes.”',
      '“All three of us get a place to speak? Tell her to put me last. I’ve told my part plenty.”',
    ],
  },
  {
    id: 'tessel-fen',
    site: 'nile',
    name: 'Tessel Fen',
    invite: 'Walk out to the ferry bend with Tessel.',
    news: 'Show Tessel what Liri did with the shelf.',
    role: 'Board porter and ferry-path mender',
    coat: 'brown.black.teal.wine.scarf.cyan.curls.lightframes.none',
    first:
      '“Six counters. I can make them tell you a week’s worth of lies before your kettle boils.” Tessel sits on a bollard and rubs grit from a sandal. His older sister bought the kettle. He has been promising to pay her back since the spring tide.',
    returned:
      'Tessel has kept the envelope. On its back he has drawn the dry path up from the boats. “That’s the funny thing about paper. There’s room behind my wages for all the walking.”',
    work: 'The next porter starts tomorrow. Tessel wants to leave her a dry crossing and get his sister’s kettle back from the mender before the shop shuts.',
    offers: ['Walk the dry turn with the new porter.', 'Mark where to wait and take the kettle home.'],
    replies: [
      'He sets his longest board down and the two of them walk the corner empty-handed. His sister brings the cold kettle to the mill that evening.',
      'Tessel paints a white toe on the dry kerb. Then he runs. The next porter finds the mark, though she still has to work out how to turn the long boards.',
    ],
    from: 'liri-pell',
    heard: [
      '“She measured the corner with me. First time a maker ever bumped into that post with my load on their shoulder.” He puts some salve by Liri’s place.',
      '“Extra holes in the shelf? My sister could work it now. That changes who I can ask to take the late boat.”',
    ],
  },
  {
    id: 'aven-dorr',
    site: 'press',
    name: 'Aven Dorr',
    invite: 'Look under Aven’s elbow at the rough drawing.',
    news: 'Tell Aven who marked the porter’s bend.',
    role: 'Shift foreperson and former apprentice',
    coat: 'light.grey.blue.indigo.headband.green',
    first:
      'Aven has a bread roll in her pocket with a perfect bite still missing. “I used to count work by what I’d eaten. Roll at dawn. Heel at noon. When they gave me the book I thought it could count better.” Liri’s first drawing is under her elbow.',
    returned:
      'Aven lays the printed account on a fresh guild leaf. “There’s a space here for my signature. Always has been. I had to turn the page over to see where the others could fit.”',
    work: 'The guild will take an attachment. Aven can bind the apprentice’s rough drawing into the morning record or keep room for three people to give an account on their next shift.',
    offers: [
      'Bind Liri’s first drawing with the pay leaf.',
      'Give each worker a place in the next shift book.',
    ],
    replies: [
      'The page will no longer lie flat. Aven ties a loop round the book. “I spent years making the margins straight. Look what I nearly cut off.”',
      'Aven rules three lines and leaves the ink downstairs. “If I carry it home again, it’ll be my handwriting on all three.”',
    ],
    from: 'tessel-fen',
    heard: [
      '“Tessel took the new hand round the real bend?” Aven takes a foot off tomorrow’s tally. “I forgot that teaching her takes his time too.”',
      '“A white toe on the kerb. That’s Tessel’s.” Aven adds a daylight walk for the new porter. “A mark gets a girl to the bend. It can’t carry a plank for her.”',
    ],
  },
];
export function addMillCrew(pack: ContentPack) {
  for (const actor of millCrew) {
    const key = 'mill-crew.' + actor.id;
    const options = actor.offers.map((text, i) => ({
      text,
      next: key + '.task' + i,
      effects: [{ setFlag: key + '.work', value: i }],
    }));
    const listen = actor.heard.map((_, i) => ({
      text: actor.news,
      if: { flag: 'mill-crew.' + actor.from + '.work', eq: i },
      next: key + '.heard' + i,
    }));
    const routes = [
      { text: actor.invite, next: key + '.work' },
      ...listen,
      { text: 'Catch the next bell.', next: null },
    ];
    const delivered =
      actor.site === 'press' ? 'mill-shift.press.print' : 'mill-shift.' + actor.site + '.read';
    pack.characters.push({
      id: actor.id,
      name: actor.name,
      role: actor.role,
      mode: 'fictional',
      sprite: 'custom:' + actor.coat,
      talk: [{ if: { flagSet: delivered }, node: key + '.return' }, { node: key + '.arrive' }],
    });
    const nodes = [
      { id: key + '.arrive', text: actor.first, options: routes },
      { id: key + '.return', text: actor.returned, options: routes },
      { id: key + '.work', text: actor.work, options },
      ...actor.replies.map((text, i) => ({ id: key + '.task' + i, text })),
      ...actor.heard.map((text, i) => ({ id: key + '.heard' + i, text })),
    ];
    for (const node of nodes)
      pack.dialogue.push({ ...node, speaker: actor.id, historicalLabel: 'fictional-world' });
  }
}
