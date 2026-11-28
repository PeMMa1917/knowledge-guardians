import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, FlagValue } from './types';

export const hatchStudy = 'aethelgard.study';
export const hatchHall = 'nexus.archive';
export const surfaces = ['board', 'brass'] as const;
export const listeners = ['peg', 'table'] as const;
export const sleeves = ['words', 'method', 'round'] as const;
export type Surface = (typeof surfaces)[number];
export type Listener = (typeof listeners)[number];
export type Sleeve = (typeof sleeves)[number];
export type HatchCommand = { type: 'WorkHatchSleeve' } & (
  | { work: 'strike'; surface: Surface; listener: Listener; tooth: boolean }
  | { work: 'probe'; box: 'apron' | 'boot' }
  | { work: 'reveal' }
  | { work: 'unfold'; author: 'elsbet' | 'orrin' }
  | { work: 'clip'; sleeve: Sleeve }
  | { work: 'receive' | 'visitor' | 'lay' }
);
type State = Pick<CampaignState, 'flags' | 'mapId'>;
const write = (place: string, value: FlagValue): Effect => ({ setFlag: 'hatch.' + place, value });
const marked = (s: State, k: string) => s.flags['hatch.' + k];
export const sleeveLabels: Record<Sleeve, string> = {
  words: 'The two uncut lines',
  method: 'The little working catch',
  round: 'The next round of knocks',
};
export const editionStories: Record<Sleeve, { gift: string; first: string; cost: string }> = {
  words: {
    gift: 'You copy both accounts onto opposite faces of the public slip. A reader can turn it over without waiting for a keeper.',
    first:
      'A visitor turns the slip over before reading the old title aloud. The back has a person and a place on it. She puts the two accounts side by side.',
    cost: 'Kip finds a bent brass tooth under the slip. The visitor had wanted to try the catch too. He saves it for the next round.',
  },
  method: {
    gift: 'You wrap the little test catch in its settings and put the original words in the staffed sleeve. Someone else can try the very same setup.',
    first:
      'A learner at the workshop tries the same catch twice. “I can get the silence with someone here.” The old archive record still needs its own witness.',
    cost: 'The keeper has gone for supper. A late visitor wants to read the old words and has to wait. Ise comes back wearing her coat over her apron.',
  },
  round: {
    gift: 'You mark both positions on a walking slip. At the next bell two listeners can take turns at the hatch and bring their own words back.',
    first:
      'Two strangers swap places, knock, listen and swap back. One has a skinned knuckle. The other lends a mitten. They come to the archive with separate accounts.',
    cost: 'A carrier arrives between rounds with an armful of hot bowls. She has time to leave one mark beside the invitation and keep walking.',
  },
};
const packetTurns: Record<string, string> = {
  print:
    'At the dated public case it is the crossed-out word “victory” that first catches the visitor’s eye. Two labels let her ask which event each one dates.',
  read: 'At the workmen’s reading table a child follows the scribe from a grain payment to the next protest. She asks who else had a voice the scribe never set down.',
  pair: 'At the model cart a reader holds the copy next to the cast. A trial can be repeated here. A wheel mark on this floor cannot date an ancient journey.',
};
export const clippedWords = {
  elsbet: {
    outside: '… no answer …',
    full: '“I stood on the steps and heard no answer to my knock.” Elsbet wrote from outside the hatch.',
  },
  orrin: {
    outside: '… sat inside …',
    full: '“I sat inside, filing the brass tooth for the catch.” Orrin wrote where he was. He never said which caller had knocked.',
  },
};
export function wrapperReading(s: State): string | undefined {
  if (marked(s, 'wrapper') === 'nick')
    return 'The wrapper sits against the old board. Its nick tells Kip which edge was up when he took the impression. The ring still has nobody’s name in it.';
  if (marked(s, 'wrapper') === 'hour')
    return 'Kip’s written hour comes after the closing bell. Orrin can say when Kip found the seal. He leaves the earlier box empty because neither of them saw it pressed.';
}
export function hatchReading(surface: Surface, listener: Listener, tooth: boolean) {
  const rings = surface === 'brass' && tooth;
  if (listener === 'table')
    return rings
      ? {
          trace: 'ring',
          text: 'The brass catches the tooth. A spoon on the kitchen table answers with one clear ring. The cricket stays on the quiet board.',
        }
      : {
          trace: 'quiet',
          text: 'At the kitchen table the spoon stays still. Orrin is still in the room. From here he could miss a caller who really did knock.',
        };
  if (surface === 'board')
    return {
      trace: 'felt',
      text: 'Two feet jump on the near peg. The wax cricket felt the board move. Farther into the kitchen the spoon stays quiet.',
    };
  return rings
    ? {
        trace: 'ring',
        text: 'At the peg the brass rings and the far spoon answers. The cricket hears the bell through the air but its feet stay on the still board.',
      }
    : {
        trace: 'click',
        text: 'At the peg you hear the loose brass tick. Without its tooth it cannot ring the spoon at the table.',
      };
}
const trial = (sf: Surface, ear: Listener, fitted: boolean) =>
  [sf, ear, fitted ? 'in' : 'out'].join('.');
export const closedBoxes = {
  apron: {
    label: 'The apron pocket',
    note: 'The spoon rings through the red cloth. When you lift it there is a brass tooth engaged in the wire.',
  },
  boot: {
    label: 'The boot pocket',
    note: 'The spoon stays still under the blue cloth. The wire has slack where its tooth should have been.',
  },
};
export function heldPair(s: State): boolean {
  return listeners.some(
    (ear) =>
      marked(s, 'trial.' + trial('brass', ear, false)) === true &&
      marked(s, 'trial.' + trial('brass', ear, true)) === true,
  );
}
export function issuedSleeve(s: State): Sleeve | undefined {
  return sleeves.find((key) => key === marked(s, 'edition'));
}
export function hatchPacket(s: State) {
  const packet = s.flags['nile.dispatch'];
  return typeof packet === 'string' && Object.hasOwn(packetTurns, packet) ? packet : undefined;
}
export function hatchReceipt(s: State, sleeve: Sleeve) {
  const packet = hatchPacket(s);
  return editionStories[sleeve].first + (packet ? ' ' + packetTurns[packet] : '');
}
export function hatchEffects(s: State, c: HatchCommand): Effect[] {
  if (c.work === 'visitor' || c.work === 'receive') {
    const edition = issuedSleeve(s),
      packet = hatchPacket(s);
    if (s.mapId !== hatchHall || !edition || !packet || !s.flags['nile.returned'])
      throw new Error('Bring the finished sleeve to the installed Nile packet in the Nexus.');
    if (c.work === 'receive') return [write('delivered', edition), write('packet', packet)];
    if (marked(s, 'delivered') !== edition) throw new Error('Unroll the sleeve with its first reader.');
    return [write('visitor.' + edition, true)];
  }
  if (s.mapId !== hatchStudy || !s.flags['study.letter'])
    throw new Error('Find the letter and its sleeve in Elsbet’s study.');
  switch (c.work) {
    case 'probe':
      if (!Object.hasOwn(closedBoxes, c.box)) throw new Error('Choose one of the two cloth pockets.');
      if (!marked(s, 'trial.brass.table.out') || !marked(s, 'trial.brass.table.in'))
        throw new Error(
          'At the table, first use the brass twice with only its tooth changed. See whether that spoon would detect a fitted tooth.',
        );
      return [write('probed.' + c.box, true)];
    case 'reveal':
      if (!marked(s, 'probed.apron') || !marked(s, 'probed.boot'))
        throw new Error('Try the covered catch in each pocket before lifting the cloth.');
      return [write('opened', true)];
    case 'lay':
      if (!wrapperReading(s)) throw new Error('Bring the wrapper that Kip packed at the portal stone.');
      return [write('wrapped.' + marked(s, 'wrapper'), true)];
    case 'unfold':
      if (!Object.hasOwn(clippedWords, c.author)) throw new Error('Lift one of the two written flaps.');
      return [write('read.' + c.author, true)];
    case 'strike': {
      if (
        !surfaces.includes(c.surface) ||
        !listeners.includes(c.listener) ||
        typeof c.tooth !== 'boolean'
      )
        throw new Error('Choose a surface, a listening place and a tooth setting.');
      const k = trial(c.surface, c.listener, c.tooth);
      return [write('trial.' + k, true), write('last', k)];
    }
    case 'clip': {
      if (!sleeves.includes(c.sleeve)) throw new Error('Choose the part the next reader can carry.');
      if (!marked(s, 'read.elsbet') || !marked(s, 'read.orrin'))
        throw new Error('Open both folded lines. The sleeve has hidden where their writers stood.');
      if (!heldPair(s))
        throw new Error('Try the brass at the same listening place with its tooth in and out.');
      if (
        !marked(s, 'trial.' + trial('board', 'peg', true)) &&
        !marked(s, 'trial.' + trial('board', 'peg', false))
      )
        throw new Error('Try the timber at the near peg. Watch the little cricket’s feet.');
      const fx: Effect[] = [write('edition', c.sleeve), { setFlag: 'study.entry', value: true }];
      if (issuedSleeve(s) !== c.sleeve) fx.push(write('delivered', false), write('packet', false));
      return fx;
    }
  }
}
export function hatchDiary(s: CampaignState, c: HatchCommand) {
  let id: string, words: string, ref: string;
  switch (c.work) {
    case 'strike':
      id = 'test.' + trial(c.surface, c.listener, c.tooth);
      words =
        'I knocked on the ' +
        (c.surface === 'brass' ? 'brass plate' : 'wooden board') +
        ' with the tooth ' +
        (c.tooth ? 'fitted' : 'out') +
        '. I listened at the ' +
        (c.listener === 'peg' ? 'near peg' : 'kitchen table') +
        '. ' +
        hatchReading(c.surface, c.listener, c.tooth).text;
      ref = 'hatch.control';
      break;
    case 'probe':
      id = 'probe.' + c.box;
      words =
        'I tapped the covered brass at the kitchen table. ' +
        (c.box === 'apron'
          ? 'The spoon rang through the red cloth.'
          : 'The spoon under the blue cloth stayed quiet.');
      ref = 'hatch.absence';
      break;
    case 'reveal':
      id = 'opened';
      words =
        'I lifted both cloths after testing the spoon with and without its tooth. The silent pocket had no fitted tooth. On Elsbet’s night nobody had checked whether her knock could reach the kitchen.';
      ref = 'hatch.absence';
      break;
    case 'lay':
      id = 'wrapper.' + marked(s, 'wrapper');
      words = 'I laid the wrapper beside Elsbet’s two accounts. ' + wrapperReading(s);
      ref = 'hatch.read';
      break;
    case 'unfold':
      id = 'words.' + c.author;
      words = 'I opened the edge of the sleeve. ' + clippedWords[c.author].full;
      ref = 'hatch.read';
      break;
    case 'clip':
      id = 'clip.' + c.sleeve;
      words = 'I issued ' + sleeveLabels[c.sleeve].toLowerCase() + '. ' + editionStories[c.sleeve].gift;
      ref = 'hatch.issue';
      break;
    default: {
      const ed = issuedSleeve(s),
        packet = hatchPacket(s);
      if (!ed || !packet) return undefined;
      id = c.work + '.' + ed + '.' + packet;
      words =
        c.work === 'receive'
          ? 'I brought the sleeve to its first reader. ' + hatchReceipt(s, ed)
          : 'I stayed for the caller who had to wait. ' + editionStories[ed].cost;
      ref = 'hatch.return';
    }
  }
  return diaryEvent(
    'hatch-sleeve:' + id,
    'tool',
    ref,
    'The cricket in the sleeve',
    words,
    {},
    'after-break',
  );
}
