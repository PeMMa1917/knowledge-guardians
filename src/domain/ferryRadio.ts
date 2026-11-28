import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const radioLoft = 'sea.listening-wheel';
export const radioDock = 'island.dock';
export const bands = ['reed', 'brass', 'glass', 'wood'] as const;
export const aerials = ['roof', 'water'] as const;
export type Band = (typeof bands)[number];
export type Aerial = (typeof aerials)[number];
export type Wording = 'open' | 'prompt';
export type Crowd = 'covered' | 'open' | 'pooled' | 'balanced';
export type Edition = 'chorus' | 'pause' | 'relay';
export type Permission = 'credit' | 'anonymous' | 'listen';
export const stations = [
  {
    id: 'mara',
    name: 'Mara Bell',
    band: 'reed',
    aerial: 'roof',
    sign: 'Two spoon taps against a cooling kettle.',
    permission: 'credit',
    first: 'I sang the last word from the old sheet. I could have sung it with the horn unplugged.',
    prompted: 'Home? Oh, certainly. It has always ended there on my copy.',
    limit: 'Mara knows the old verse by heart. Her sung answer could come from memory.',
  },
  {
    id: 'ivo',
    name: 'Ivo',
    band: 'brass',
    aerial: 'roof',
    sign: 'Paper clicks against the little brass clip.',
    permission: 'credit',
    first: 'I marked the moment the singer stopped. The pencil went through the paper. I left the word blank.',
    prompted: 'You have supplied a word. I can tell you when the line ended.',
    limit: 'Ivo made a timing mark. His page has no words after it.',
  },
  {
    id: 'joist',
    name: 'The joist painter',
    band: 'glass',
    aerial: 'roof',
    sign: 'A roller taps the roof joist twice.',
    permission: 'anonymous',
    first: 'I heard “foam.” My cousin says that is foolish. Leave my name at the desk.',
    prompted: 'When you say “home,” I start hearing it your way. Leave the first take on the spool too.',
    limit: 'The painter permits an unnamed reading. The second answer came after hearing a suggested word.',
  },
  {
    id: 'siv',
    name: 'Siv of the slipway',
    band: 'reed',
    aerial: 'water',
    sign: 'A float knocks under the third plank.',
    permission: 'listen',
    first:
      'The show stops just before our break. When your survey boat comes round, it always finds the other shift.',
    prompted: 'At my stop there was no singer. You may listen here. Please keep my voice off the horn.',
    limit:
      'This shift missed the boat. A missing slip says nothing about which word the shift would have heard.',
  },
  {
    id: 'joss',
    name: 'Joss',
    band: 'brass',
    aerial: 'water',
    sign: 'A boot heel knocks a hollow note out of the gangway.',
    permission: 'credit',
    first:
      'Could hear the little intake of breath before the note. There was a sail between me and every word after.',
    prompted: 'Home is what your question says. Put the sail in the report.',
    limit: 'Joss was behind a sail. The receiver log alone cannot establish what reached that seat.',
  },
  {
    id: 'child',
    name: 'The night ferry’s caller',
    band: 'wood',
    aerial: 'water',
    sign: 'Two falling notes, then the ferry chain rattles.',
    permission: 'anonymous',
    first: 'Da used to hum there. What I heard last night was a kettle. I know that dented lid.',
    prompted: 'Home, perhaps. Can you play me the breath just before it? It sounded the same on both nights.',
    limit:
      'The caller identifies a background sound. Matching it can locate a reused recording without identifying the missing word.',
  },
] as const;
export type Caller = (typeof stations)[number]['id'];
export const crowds: Record<Crowd, string> = {
  covered: 'under the awning',
  open: 'at the open rail',
  pooled: 'both stops together',
  balanced: 'an equal share from each stop',
};
const chart = {
  covered: [
    [9, 10],
    [34, 40],
  ],
  open: [
    [30, 40],
    [7, 10],
  ],
} as const;
export const editions: Record<Edition, string> = {
  chorus: 'Teach the tune under the awning',
  pause: 'Give the last bar to the missing shift',
  relay: 'Send a second horn to the rail',
};
export const reactions: Record<Edition, Record<'runner' | 'singer', string>> = {
  chorus: {
    runner:
      'Joss keeps the ferry open for a second verse. “Covered seats know the tune. Give the rail a copy that travels.”',
    singer:
      'Oda sings up to the empty bar and holds out her palm. Children under the awning supply three different endings.',
  },
  pause: {
    runner:
      'Joss has a shift to send home. He sits with them through four beats of quiet. One worker asks for the word on paper.',
    singer:
      'Oda turns down the kettle spool. In the space it leaves, someone at the back starts the verse from the beginning.',
  },
  relay: {
    runner:
      'Joss unhooks the spare horn for the rail. “The person behind the sail can try again. Someone under the awning will have to share.”',
    singer: 'Oda hears her own voice return a beat late. She waits and lets the second bank finish the line.',
  },
};
const listening: Weave = {
  concepts: ['evidence', 'perspective', 'interpretation', 'certainty'],
  framework: ['scope', 'methods-and-tools', 'perspectives'],
  aoks: ['ART', 'HUM', 'TEC', 'LAN'],
  subjects: ['music', 'psychology', 'lang-langlit'],
  atl: ['thinking', 'communication'],
};
const counting: Weave = {
  concepts: ['evidence', 'objectivity', 'explanation', 'interpretation', 'justification'],
  framework: ['methods-and-tools', 'scope', 'perspectives'],
  aoks: ['MAT', 'HUM', 'TEC'],
  subjects: ['math-ai', 'psychology', 'geography'],
  atl: ['research', 'thinking'],
};
const voicing: Weave = {
  concepts: ['power', 'responsibility', 'values', 'perspective', 'culture', 'justification'],
  framework: ['ethics', 'perspectives', 'scope'],
  aoks: ['ART', 'HUM', 'LAN', 'POL'],
  subjects: ['music', 'global-politics', 'lang-langlit', 'digital-society'],
  atl: ['social', 'communication'],
};
export function wireTopics(act: string): Weave {
  if (['pin', 'balance', 'crowd'].includes(act)) return counting;
  if (['issue', 'quote', 'hear', 'receive', 'invite', 'file', 'shift', 'return'].includes(act)) return voicing;
  if (act === 'align' || act === 'voice')
    return {
      ...listening,
      concepts: ['truth', 'evidence', 'certainty', 'explanation', 'interpretation'],
      aoks: ['ART', 'HIS', 'TEC'],
      subjects: ['music', 'history', 'digital-society'],
    };
  return listening;
}
type S = Pick<CampaignState, 'flags'>;
export const radioFlag = (s: S, key: string) => s.flags['wire.' + key];
const set = (key: string, value: FlagValue = true): Effect => ({ setFlag: 'wire.' + key, value });
const has = (s: S, key: string) => radioFlag(s, key) === true;
export function setting(s: S): { band: Band; aerial: Aerial; wording: Wording } {
  const band = bands.find((b) => b === radioFlag(s, 'band')) ?? 'reed';
  return {
    band,
    aerial: radioFlag(s, 'aerial') === 'water' ? 'water' : 'roof',
    wording: radioFlag(s, 'wording') === 'prompt' ? 'prompt' : 'open',
  };
}
export function tuned(s: S) {
  const { band, aerial } = setting(s);
  return stations.find((st) => st.band === band && st.aerial === aerial);
}
export function readCrowd(crowd: Crowd, night: 0 | 1) {
  const a = chart.covered[night],
    b = chart.open[night];
  if (crowd === 'balanced') {
    const percent = (50 * (a[0] * b[1] + b[0] * a[1])) / (a[1] * b[1]);
    return {
      hits: null,
      people: null,
      percent,
      spoken: 'At equal weight, ' + Number(percent.toFixed(1)) + ' percent. Each stop contributes half.',
    };
  }
  const [hits, people] = crowd === 'pooled' ? [a[0] + b[0], a[1] + b[1]] : chart[crowd][night];
  const percent = (100 * hits) / people;
  return {
    hits,
    people,
    percent,
    spoken: hits + ' of ' + people + ' slips recall a last word, ' + percent + ' percent.',
  };
}
export const weekMix = (crowd: Crowd) => [readCrowd(crowd, 0), readCrowd(crowd, 1)] as const;
export const dialSound = (s: S) =>
  tuned(s)?.sign ?? 'The coil hums without a voice. A little paper moth drifts across the dial.';
const signed = (s: S, id: Caller, word: Wording) => has(s, 'heard.' + id + '.' + word);
const stationFor = (id: Caller) => stations.find((st) => st.id === id)!;
export function sealedProgramme(
  s: S,
): { edition: Edition; caller: (typeof stations)[number]; credit: string; crowd: Crowd } | null {
  const edition = radioFlag(s, 'issued'),
    quote = radioFlag(s, 'issuedQuote'),
    credit = radioFlag(s, 'issuedCredit'),
    frame = radioFlag(s, 'issuedFrame');
  if (edition !== 'chorus' && edition !== 'pause' && edition !== 'relay') return null;
  if (frame !== 'covered' && frame !== 'open' && frame !== 'pooled' && frame !== 'balanced') return null;
  const caller = stations.find((st) => st.id === quote);
  if (
    !caller ||
    caller.permission === 'listen' ||
    (credit !== 'anonymous' && (credit !== 'credit' || caller.permission !== 'credit'))
  )
    return null;
  return { edition, caller, credit: credit === 'credit' ? caller.name : 'An unnamed listener', crowd: frame };
}
export type WireCommand = { type: 'WorkFerryRadio' } & (
  | { act: 'tune'; band: Band }
  | { act: 'point'; aerial: Aerial }
  | { act: 'ask'; wording: Wording }
  | { act: 'listen' }
  | { act: 'align'; take: 'first' | 'second' }
  | { act: 'pin'; crowd: Crowd }
  | { act: 'balance' }
  | { act: 'quote'; caller: Caller; credit: 'credit' | 'anonymous' }
  | { act: 'issue'; edition: Edition; crowd: Crowd }
  | { act: 'receive' }
  | { act: 'hear'; listener: 'runner' | 'singer' }
  | { act: 'invite'; shift: 'break' | 'late' }
  | { act: 'file' }
);
export function wireEffects(s: CampaignState, cmd: WireCommand): Effect[] {
  const atDock = s.mapId === radioDock;
  if (s.mapId !== radioLoft && !atDock) throw Error('Find the ferry studio or its receiving horn.');
  const remote = cmd.act === 'receive' || cmd.act === 'hear' || cmd.act === 'invite' || cmd.act === 'file';
  if (remote !== atDock)
    throw Error(
      remote ? 'Take the ferry edition to the island dock.' : 'That control belongs in the ferry studio.',
    );
  const current = setting(s),
    speaker = tuned(s);
  switch (cmd.act) {
    case 'tune':
      return [set('band', cmd.band)];
    case 'point':
      return [set('aerial', cmd.aerial)];
    case 'ask':
      return [set('wording', cmd.wording)];
    case 'listen': {
      if (!speaker) return [set('quiet.' + current.band + '.' + current.aerial), set('last', 'quiet')];
      const out = [set('heard.' + speaker.id + '.' + current.wording), set('last', speaker.id)];
      if (signed(s, speaker.id, current.wording === 'open' ? 'prompt' : 'open'))
        out.push(set('paired.' + speaker.id));
      return out;
    }
    case 'align': {
      if (!signed(s, 'child', 'open') || !signed(s, 'mara', 'open'))
        throw Error('Listen to the open line at the slipway caller and to the kettle under the roof first.');
      const out = [set('take.' + cmd.take)];
      if (has(s, 'take.' + (cmd.take === 'first' ? 'second' : 'first'))) out.push(set('reuse'));
      return out;
    }
    case 'pin':
      return [set('pin.' + cmd.crowd), set('lastFrame', cmd.crowd)];
    case 'balance':
      if (!['pooled', 'covered', 'open', 'balanced'].every((k) => has(s, 'pin.' + k)))
        throw Error('Put both nights on the pooled reel, the two stop reels and the equal-share reel.');
      return [set('reweighed')];
    case 'quote': {
      const st = stationFor(cmd.caller);
      if (!st || !signed(s, st.id, 'open')) throw Error('First take the open line from that listener.');
      if (st.permission === 'listen')
        throw Error(
          'Siv offered the studio a private hearing. You can leave the last bar open for that shift.',
        );
      if (cmd.credit === 'credit' && st.permission === 'anonymous')
        throw Error('That listener offered an unnamed line. Keep their name off the programme.');
      return [set('quote', cmd.caller), set('credit', cmd.credit)];
    }
    case 'issue': {
      if (!has(s, 'reuse'))
        throw Error('Match the two takes of the old kettle spool before the horn goes live.');
      if (!has(s, 'pin.' + cmd.crowd)) throw Error('Roll both nights onto the frame you want to broadcast.');
      const quote = radioFlag(s, 'quote'),
        credit = radioFlag(s, 'credit');
      const speaker = stations.find((st) => st.id === quote);
      if (
        !speaker ||
        speaker.permission === 'listen' ||
        !signed(s, speaker.id, 'open') ||
        (credit !== 'anonymous' && (credit !== 'credit' || speaker.permission !== 'credit'))
      )
        throw Error('Give a consenting listener a line in this programme.');
      if (
        radioFlag(s, 'issued') === cmd.edition &&
        radioFlag(s, 'issuedFrame') === cmd.crowd &&
        radioFlag(s, 'issuedQuote') === quote &&
        radioFlag(s, 'issuedCredit') === credit
      )
        return [];
      return [
        set('issued', cmd.edition),
        set('issuedFrame', cmd.crowd),
        set('issuedQuote', speaker.id),
        set('issuedCredit', credit),
        set('received', false),
        set('response.runner', false),
        set('response.singer', false),
        set('newShift', ''),
        set('editionMade'),
      ];
    }
    case 'receive': {
      if (!sealedProgramme(s))
        throw Error('The island horn is waiting for the ferry studio to send a programme.');
      return [set('received'), set('everReceived')];
    }
    case 'hear': {
      const issue = sealedProgramme(s);
      if (!issue || !has(s, 'received')) throw Error('Open the issued programme on the island horn first.');
      return [set('response.' + cmd.listener), set('heardEdition.' + issue.edition + '.' + cmd.listener)];
    }
    case 'invite':
      if (!has(s, 'received') || !has(s, 'heard.siv.open'))
        throw Error('Hear why the slipway missed the first call, then open the programme on the island.');
      return [set('newShift', cmd.shift), set('invited.' + cmd.shift)];
    case 'file': {
      const shift = radioFlag(s, 'newShift');
      if (!has(s, 'response.runner') || !has(s, 'response.singer') || !shift || !has(s, 'reweighed'))
        throw Error(
          'Hear both listeners, try another shift and carry the four-frame comparison to the island.',
        );
      return [set('filed'), set('filedShift', shift)];
    }
  }
}
export function wireDiary(s: CampaignState, cmd: WireCommand) {
  const now = setting(s),
    st = tuned(s),
    issue = sealedProgramme(s);
  let title: string, text: string;
  switch (cmd.act) {
    case 'tune':
      title = 'At the tuning wheel';
      text = 'I moved the needle to the ' + cmd.band + ' winding. ' + dialSound(s);
      break;
    case 'point':
      title = 'A turn of the receiving horn';
      text = 'I pointed the horn toward the ' + cmd.aerial + '. ' + dialSound(s);
      break;
    case 'ask':
      title = 'The words before the song';
      text =
        cmd.wording === 'open'
          ? 'I left the next listener a blank last bar.'
          : 'I put the word “home” into my question before the listener could name a word.';
      break;
    case 'listen':
      title = st ? 'An answer from ' + st.name : 'A quiet winding';
      text =
        st?.permission === 'listen'
          ? 'I kept the private voice off my page. I can record that the slipway was working through the first call.'
          : st
            ? 'I heard ' +
              st.name +
              ' on the ' +
              now.aerial +
              ' loop. “' +
              (now.wording === 'open' ? st.first : st.prompted) +
              '”'
            : 'I heard the coil hum. The quiet gave me no count of the people at the water.';
      break;
    case 'align':
      title = 'The kettle between verses';
      text =
        cmd.take === 'first'
          ? 'I lined up Tuesday’s breath with the falling kettle lid.'
          : 'I ran Friday’s spool against Tuesday’s. The dented lid rattled in exactly the same place.';
      break;
    case 'pin': {
      const [a, b] = weekMix(cmd.crowd);
      title = 'Two nights ' + crowds[cmd.crowd];
      text = 'I rolled the two tapes side by side. First night: ' + a.spoken + ' Second night: ' + b.spoken;
      break;
    }
    case 'balance':
      title = 'The crowd that changed between songs';
      text =
        'I held the audience mix still. Both stops fell five points while the pooled rate rose four points. The second night sent many more covered-seat slips.';
      break;
    case 'quote':
      title = 'A voice for the programme';
      text =
        'I chose an open-line reading and marked the credit as ' +
        (cmd.credit === 'credit' ? stationFor(cmd.caller).name : 'an unnamed listener') +
        '.';
      break;
    case 'issue':
      title = 'An edition across the water';
      text =
        'I sent the dock “' +
        editions[cmd.edition] +
        '” with the figures for ' +
        crowds[cmd.crowd] +
        ' and a reading credited to ' +
        issue!.credit +
        '.';
      break;
    case 'receive':
      title = 'What came out of the island horn';
      text =
        'I unrolled “' +
        editions[issue!.edition] +
        '” by the gangway. I could hear the half-bar Oda left between verses.';
      break;
    case 'hear':
      title = 'After the last bar';
      text = 'I stayed by the horn. ' + reactions[issue!.edition][cmd.listener];
      break;
    case 'invite':
      title = 'An invitation at the slipway';
      text =
        cmd.shift === 'break'
          ? 'I took the call during the short break. Five deckhands could speak. Two running the ferry asked me to come after tying up.'
          : 'I stayed until the late tying-up. Two pilots could speak. Five workers had already taken the boat home.';
      break;
    case 'file':
      title = 'The time on Joss’s invitation';
      text =
        'I sent both shifts a record of the people the horn had reached and the people the first call had missed.';
      break;
  }
  const key = Object.entries(cmd)
    .filter(([k]) => k !== 'type')
    .map(([, v]) => v)
    .join('.');
  const extra =
    cmd.act === 'listen'
      ? '.' + now.band + '.' + now.aerial + '.' + now.wording
      : cmd.act === 'hear'
        ? '.' + issue!.edition
        : '';
  return diaryEvent('ferry-wire:' + key + extra, 'tool', 'ferry-wire', title, text, {}, 'after-break');
}
