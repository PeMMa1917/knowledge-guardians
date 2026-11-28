import type { GameController } from '../app/controller';
import { ctx } from '../app/context';
import { playCueTrial } from '../app/cueTrialAudio';
import type { CueBeat } from '../domain/cueWorkshop';
import {
  aerials,
  bands,
  crowds,
  editions,
  radioFlag,
  reactions,
  sealedProgramme,
  setting,
  stations,
  tuned,
  weekMix,
  type Caller,
  type Crowd,
  type WireCommand,
} from '../domain/ferryRadio';
import { h } from './dom';
import { artURL } from './illustrations';
import { localGuide } from './localGuide';
import './ferryRadio.css';
type Move = WireCommand extends infer T ? (T extends WireCommand ? Omit<T, 'type'> : never) : never;
const keys = <T extends object>(v: T) => Object.keys(v) as (keyof T)[];
const sequences: Record<Caller, CueBeat[]> = {
  mara: ['cue', 'rest', 'cue', 'work'],
  ivo: ['work', 'work', 'rest', 'cue'],
  joist: ['covered', 'cue', 'rest', 'cue'],
  siv: ['work', 'rest', 'work', 'rest'],
  joss: ['work', 'cue', 'rest', 'work'],
  child: ['cue', 'covered', 'rest', 'work'],
};
function picture(key: string) {
  return h('img', { class: 'wire-picture', src: artURL(key), alt: '' });
}
function slips(crowd: Crowd) {
  const holder = h('div', { class: 'wire-slips' });
  weekMix(crowd).forEach((read, i) => {
    const strip = h('div', { class: 'wire-bar', 'aria-hidden': 'true' });
    strip.style.setProperty('--fill', String(read.percent) + '%');
    holder.append(
      h(
        'div',
        { class: 'wire-reading' },
        h('strong', {}, i ? 'Friday' : 'Tuesday'),
        strip,
        h('span', {}, read.spoken),
      ),
    );
  });
  return holder;
}
export function ferryRadioPanel(c: GameController, sound: (s: string) => void, island: boolean) {
  const body = h('div'),
    live = h('p', { class: 'wire-feedback', role: 'status', 'aria-live': 'polite', 'data-work-feedback': '' });
  const root = h('section', { class: 'wire-studio', 'data-reading-bench': '' }, body, live);
  let openFolds = new Set([island ? 'edition' : 'dial']);
  let last = '',
    playback = 0;
  const flag = (key: string) => radioFlag(c.state, key);
  const guide = localGuide(c, island ? 'WORLD-15' : 'WORLD-09', () =>
    island
      ? flag('received')
        ? 'wire.shift'
        : 'wire.return'
      : !flag('reuse')
        ? 'wire.voice'
        : !flag('reweighed')
          ? 'wire.crowd'
          : 'wire.issue',
  );
  function run(move: Move, key: string, message: string) {
    openFolds = new Set(
      Array.from(
        body.querySelectorAll<HTMLDetailsElement>('details[data-wire-fold][open]'),
        (fold) => fold.dataset.wireFold!,
      ),
    );
    const failure = c.dispatch({ type: 'WorkFerryRadio', ...move }).find((e) => e.kind === 'error');
    if (failure) {
      if (live.textContent !== failure.message) live.textContent = failure.message;
      return;
    }
    const generation = ++playback,
      st = tuned(c.state);
    if (move.act === 'listen' || move.act === 'align') {
      const beats =
        move.act === 'align'
          ? (['rest', 'covered', 'cue', 'work'] as CueBeat[])
          : st
            ? sequences[st.id]
            : (['rest', 'work', 'rest', 'rest'] as CueBeat[]);
      playCueTrial(beats, ctx.settings.sfxVolume, () => root.isConnected && generation === playback);
    } else sound(move.act === 'issue' || move.act === 'file' ? 'sfx.page' : 'sfx.click');
    last = message;
    if (move.act === 'listen')
      last = st
        ? setting(c.state).wording === 'open'
          ? st.first
          : st.prompted
        : 'A warm coil, a paper moth and no connected voice. Try another winding.';
    if (move.act === 'hear') {
      const issue = sealedProgramme(c.state);
      if (issue) last = reactions[issue.edition][move.listener];
    }
    draw();
    root.querySelector<HTMLElement>('[data-wire="' + key + '"]')?.focus({ preventScroll: true });
    if (live.textContent !== last) live.textContent = last;
  }
  const button = (label: string, key: string, move: Move, message: string, selected?: boolean) =>
    h(
      'button',
      {
        type: 'button',
        'data-wire': key,
        ...(selected !== undefined ? { 'aria-pressed': String(selected) } : {}),
        onclick: () => run(move, key, message),
      },
      label,
    );
  const group = (...elements: HTMLElement[]) => h('div', { class: 'wire-controls' }, ...elements);
  function fold(id: string, label: string, ...children: HTMLElement[]) {
    const d = h('details', { 'data-wire-fold': id }, h('summary', {}, label), ...children);
    d.open = openFolds.has(id);
    return d;
  }
  function studio() {
    const pos = setting(c.state),
      station = tuned(c.state);
    const tuning = h(
      'div',
      { class: 'wire-wheel' },
      picture('wire.receiver'),
      h(
        'div',
        {},
        h('h4', {}, 'Receiving wheel'),
        h('p', {}, station ? station.sign : 'A low hum. The two free coils sometimes attract a paper moth.'),
      ),
    );
    const dial = fold(
      'dial',
      'Turn the receiving wheel',
      tuning,
      group(
        ...bands.map((b) =>
          button(
            b[0].toUpperCase() + b.slice(1) + ' winding',
            'band-' + b,
            { act: 'tune', band: b },
            'The needle rests on ' + b + '.',
            b === pos.band,
          ),
        ),
      ),
      group(
        ...aerials.map((a) =>
          button(
            a === 'roof' ? 'Point above the roof' : 'Point over the water',
            'aim-' + a,
            { act: 'point', aerial: a },
            'The receiving horn faces the ' + a + '.',
            a === pos.aerial,
          ),
        ),
      ),
      group(
        button(
          'Leave the last word open',
          'open',
          { act: 'ask', wording: 'open' },
          'The listener can supply a word.',
          pos.wording === 'open',
        ),
        button(
          'Put “home” in the question',
          'prompt',
          { act: 'ask', wording: 'prompt' },
          'The next listener will hear your word first.',
          pos.wording === 'prompt',
        ),
      ),
      button('Open this line', 'listen', { act: 'listen' }, ''),
    );
    const ledger = h('div', { class: 'wire-calls' });
    for (const st of stations) {
      const plain = flag('heard.' + st.id + '.open'),
        leading = flag('heard.' + st.id + '.prompt');
      if (!plain && !leading) continue;
      ledger.append(
        h(
          'article',
          {},
          h('h4', {}, st.name),
          h(
            'p',
            {},
            st.permission === 'listen'
              ? 'Listen in the studio only'
              : st.permission === 'anonymous'
                ? 'Unnamed reading allowed'
                : 'Named reading allowed',
          ),
          plain ? h('p', {}, h('strong', {}, 'Open line. '), st.first) : null,
          leading ? h('p', {}, h('strong', {}, 'After “home.” '), st.prompted) : null,
          plain && leading ? h('p', { class: 'fine' }, st.limit) : null,
        ),
      );
    }
    if (!ledger.childElementCount)
      ledger.append(h('p', {}, 'The log is blank. A voice enters when you open its line.'));
    const tapes = fold(
      'spool',
      'Run the two kettle spools',
      picture('wire.reel'),
      h(
        'p',
        {},
        'Tuesday and Friday carry the same small breath, two spoon taps and a falling lid. Bring the two listeners who recognized the sounds into the studio log.',
      ),
      group(
        button(
          'Line up Tuesday’s take',
          'take-first',
          { act: 'align', take: 'first' },
          'Tuesday’s reel holds a breath, two spoon taps and a falling lid.',
        ),
        button(
          'Line up Friday’s take',
          'take-second',
          { act: 'align', take: 'second' },
          'Friday carries the same breath, taps and lid.',
        ),
      ),
      h(
        'p',
        {},
        flag('reuse')
          ? 'Both takes share the same background. Oda has something to tell you.'
          : 'Tuesday ' +
              (flag('take.first') ? 'aligned' : 'on the shelf') +
              ' · Friday ' +
              (flag('take.second') ? 'aligned' : 'on the shelf'),
      ),
    );
    const lastFrame = keys(crowds).find((k) => flag('lastFrame') === k) ?? 'pooled';
    const reels = fold(
      'crowd',
      'Wind the audience slips',
      h(
        'p',
        {},
        'A slip counts if a passenger could give a last word. The stop and the night are recorded. Several different words qualify.',
      ),
      group(
        ...keys(crowds).map((k) =>
          button(
            crowds[k],
            'frame-' + k,
            { act: 'pin', crowd: k },
            'Pinned two nights ' + crowds[k] + '.',
            lastFrame === k,
          ),
        ),
      ),
      slips(lastFrame),
      h('p', {}, 'Pinned frames ' + keys(crowds).filter((k) => flag('pin.' + k)).length + ' of 4.'),
      button(
        'Bind the fixed-mix comparison',
        'balance',
        { act: 'balance' },
        'The pooled count rose four points. Within each stop the rate fell five points.',
      ),
    );
    const programme = h('div', { class: 'wire-calls' });
    for (const st of stations.filter((st) => flag('heard.' + st.id + '.open'))) {
      if (st.permission === 'listen') {
        programme.append(
          h('p', {}, st.name + ' offered a private hearing. A later shift can still receive an invitation.'),
        );
        continue;
      }
      programme.append(
        h(
          'article',
          {},
          h('strong', {}, st.name),
          h('p', {}, st.first),
          group(
            ...(st.permission === 'credit' ? (['credit', 'anonymous'] as const) : (['anonymous'] as const)).map(
              (credit) =>
                button(
                  credit === 'credit' ? 'Use ' + st.name + '’s name' : 'Use an unnamed line from ' + st.name,
                  'quote-' + st.id + '-' + credit,
                  { act: 'quote', caller: st.id, credit },
                  'Set aside that line with the requested credit.',
                  flag('quote') === st.id && flag('credit') === credit,
                ),
            ),
          ),
        ),
      );
    }
    return [
      dial,
      fold('log', 'The studio listening log', ledger),
      tapes,
      reels,
      fold(
        'edition',
        'Send an edition on the ferry wire',
        programme,
        h(
          'p',
          {},
          'The broadcast takes the last audience frame you pinned. Current frame: ' + crowds[lastFrame] + '.',
        ),
        group(
          ...keys(editions).map((k) =>
            button(
              editions[k],
              'issue-' + k,
              { act: 'issue', edition: k, crowd: lastFrame },
              'The receiving horn now holds “' + editions[k] + '”.',
            ),
          ),
        ),
      ),
    ];
  }
  function dock() {
    const issue = sealedProgramme(c.state);
    if (!issue) return [h('p', {}, 'The little horn waits for a programme from Oda’s studio.')];
    return [
      fold(
        'edition',
        'At the receiving horn',
        picture('wire.horn'),
        h('h4', {}, editions[issue.edition]),
        h('p', {}, 'The return address is Seagrass Steps.'),
        button(
          'Unroll the ferry programme',
          'receive',
          { act: 'receive' },
          'The ferry edition is open on the island.',
        ),
        ...(flag('received')
          ? [
              h('blockquote', {}, issue.caller.first, h('footer', {}, issue.credit)),
              slips(issue.crowd),
              group(
                button('Listen from the gangway', 'runner', { act: 'hear', listener: 'runner' }, ''),
                button('Listen by the microphone', 'singer', { act: 'hear', listener: 'singer' }, ''),
              ),
            ]
          : []),
      ),
      fold(
        'shift',
        'Catch a shift at the slipway',
        h(
          'p',
          {},
          'There is one receiving horn. A time that works for a pilot may miss the crew already on the boat home.',
        ),
        group(
          button(
            'Go during the break',
            'break',
            { act: 'invite', shift: 'break' },
            'Five deckhands can speak. Two pilots are still running the boat.',
          ),
          button(
            'Go after the boats tie up',
            'late',
            { act: 'invite', shift: 'late' },
            'Two pilots can speak. The five deckhands have already left.',
          ),
        ),
        h(
          'p',
          {},
          flag('newShift')
            ? 'Your next hearing is marked for ' +
                (flag('newShift') === 'break' ? 'the break.' : 'the late tying-up.')
            : 'No time has been chosen for this edition.',
        ),
        button(
          'File the return hearing',
          'file',
          { act: 'file' },
          'The return book now records when each crew could speak.',
        ),
      ),
    ];
  }
  function draw() {
    body.replaceChildren(...(island ? dock() : studio()), guide);
  }
  draw();
  return root;
}
