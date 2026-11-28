import type { GameController } from '../app/controller';
import {
  casts,
  currentCast,
  currentMask,
  currentSheet,
  currentStamp,
  currentTail,
  elbowFlag as flag,
  lotReading,
  patchCount,
  sheets,
  stamps,
  trySleeves,
  type ElbowCommand,
  type Sheet,
} from '../domain/giantSleeve';
import { drawSleeves } from './giantSleeveArt';
import { h } from './dom';

type Bench = 'fitting' | 'lottery' | 'curtain';
type Move = ElbowCommand extends infer C ? (C extends ElbowCommand ? Omit<C, 'type'> : never) : never;
const actors = ['Pip', 'Oda', 'Lo', 'Vee'];
const faceName = (tail: string) => (tail === 'rise' ? 'a rise' : 'a change either way');
const letters = 'ABCDEF';
const group = (...children: HTMLElement[]) => h('div', { class: 'row' }, ...children);
export function giantPanel(c: GameController, sound: (key: string) => void, bench: Bench) {
  const body = h('section', { class: 'giant-sleeve' });
  const live = h('p', { role: 'status', 'aria-live': 'polite' });
  const synopsis = h('p', {}),
    detail = h('p', {}),
    outcome = h('p', {});
  const cloth = h('canvas', { width: '136', height: '54', role: 'img' });
  const move = (m: Move) => {
    const command = { type: 'WorkGiantSleeve' as const, ...m };
    const failed = c.dispatch(command).find((e) => e.kind === 'error');
    if (failed?.kind === 'error') {
      live.textContent = '';
      return;
    }
    sound(
      m.act === 'cue' || m.act === 'hang' || m.act === 'print'
        ? 'sfx.sparkle'
        : m.act === 'patch'
          ? 'sfx.metal'
          : 'sfx.page',
    );
    draw();
    const s = c.state;
    switch (m.act) {
      case 'patch':
        live.textContent =
          (currentMask(s) & (1 << m.who) ? 'Pinned the brass joint to ' : 'Unpinned ') +
          actors[m.who] +
          '’s wooden elbow.';
        break;
      case 'cast':
        live.textContent = 'The ' + m.cast + ' company takes the rail.';
        break;
      case 'fit':
        live.textContent = 'Pip lowers the sleeve. ' + fitLine(currentCast(s), currentMask(s));
        break;
      case 'hang':
        live.textContent =
          'The cut paper sleeve sails down a line to Lantern Square. Vee wraps a plum-ice ticket round its wrist.';
        break;
      case 'pledge':
        live.textContent =
          (flag(s, 'unsealed')
            ? 'The original promise stays pinned. Now inspect '
            : 'Pinned before opening the packet: ') +
          faceName(currentTail(s)) +
          '.';
        break;
      case 'sheet':
        live.textContent =
          'Opened ' + sheets[m.sheet].name.toLowerCase() + '. The six strips still carry their own letters.';
        break;
      case 'stamp':
        live.textContent = readDraw();
        break;
      case 'print':
        live.textContent =
          'The measured sleeve and both readings are waiting on the rehearsal floor. One hinge will lift.';
        break;
      case 'hinge':
        live.textContent =
          m.sheet === 'chalk'
            ? 'The old strip lifts the chain over the catch. One big paper moon rises in the flies.'
            : 'The fine strip misses the catch and brushes Vee’s ribbon. Twelve small paper moons fall. Pip holds out her cap.';
        break;
      case 'face':
        live.textContent =
          m.face === 'writing'
            ? 'The front row can read VEE ENTERS LAST. Pip wrote it before the night she had to sit down.'
            : 'Three left-hand knots catch the light. Vee darned each place she took the weight.';
        break;
      case 'cue':
        live.textContent =
          m.when === 'first'
            ? 'Vee opens. Pip takes both her hands off the strings and claps. It takes her sister one whole breath to answer.'
            : 'Pip opens her hand from the chair. Vee raises the giant’s hand at the far wall. A child between them does it too.';
        break;
      case 'scratch':
        live.textContent = 'The curved elbow clears the giant’s nose. A paper hat sails into the light.';
        break;
    }
  };
  const button = (text: string, act: Move) => h('button', { type: 'button', onclick: () => move(act) }, text);
  const fitLine = (cast: (typeof casts)[number], mask: number) => {
    const tried = trySleeves(cast, mask),
      yes = tried.filter((p) => p.fits).map((p) => p.name.split(',')[0]);
    return (
      (yes.length ? yes.join(', ') + ' can meet the next hand.' : 'All four hands hang free.') +
      ' ' +
      (tried.length - yes.length) +
      ' still need another reach.'
    );
  };
  const readDraw = () => {
    const s = c.state,
      sheet = currentSheet(s),
      tail = currentTail(s),
      stamp = currentStamp(s),
      r = lotReading(sheet, stamp, tail);
    return (
      'Clips on ' +
      stamp +
      ' give a difference of ' +
      r.delta.toFixed(2) +
      ' mm. ' +
      (r.qualifies ? 'This draw reaches' : 'This draw falls inside') +
      ' the observed cutoff for ' +
      faceName(tail) +
      '.'
    );
  };
  const switches: { button: HTMLButtonElement; active: () => boolean }[] = [];
  const toggle = (label: string, act: Move, on: () => boolean) => {
    const b = button(label, act);
    switches.push({ button: b, active: on });
    return b;
  };
  let castList: HTMLElement | undefined,
    packetInfo: HTMLElement | undefined,
    seals: HTMLElement | undefined,
    extra: HTMLElement | undefined;
  let clipA = 'D';
  const clipped = h('select', { 'aria-label': 'Unclip a strip' }),
    loose = h('select', { 'aria-label': 'Give its clip to' });
  const setOptions = (el: HTMLSelectElement, opts: string[], preferred: string) => {
    const chosen = opts.includes(el.value) ? el.value : opts.includes(preferred) ? preferred : opts[0];
    el.replaceChildren(...opts.map((v) => h('option', { value: v }, v)));
    el.value = chosen;
  };
  const sample = h('div', { class: 'giant-strips', role: 'img' });
  const readCast = () => currentCast(c.state),
    readMask = () => currentMask(c.state);
  if (bench === 'fitting') {
    castList = h('ul', { class: 'giant-cast' });
    body.append(
      h(
        'p',
        {},
        'Pip’s sleeve pattern measures twenty centimetres. Each wooden elbow can give one centimetre either way. Two brass joints can take any of the four parts. “Try it on the summer company too,” she says. “They bought the same pattern.”',
      ),
      cloth,
      group(
        ...casts.map((cast) =>
          toggle(
            cast === 'winter' ? 'Unroll the winter cast' : 'Unroll the summer cast',
            { act: 'cast', cast },
            () => readCast() === cast,
          ),
        ),
      ),
      castList,
      group(
        ...actors.map((name, who) =>
          toggle(name + '’s brass joint', { act: 'patch', who }, () => !!(readMask() & (1 << who))),
        ),
      ),
      group(
        button('Lower the sleeves', { act: 'fit' }),
        button('Hang this pattern over Lantern Square', { act: 'hang' }),
      ),
      synopsis,
      detail,
      outcome,
      live,
    );
  } else if (bench === 'lottery') {
    packetInfo = h('div', {});
    seals = h('div', {});
    body.append(
      h(
        'p',
        {},
        'A puppet hand that misses its catch leaves Vee waving at the ceiling. The fitter tried polish on three of six hinge strips, chosen by drawing three letters from a bag. With a closed packet, peg the difference you intend to look for.',
      ),
      group(
        toggle(
          'Peg a rise in lift',
          { act: 'pledge', tail: 'rise' },
          () => flag(c.state, 'promise') !== undefined && currentTail(c.state) === 'rise',
        ),
        toggle(
          'Peg a change either way',
          { act: 'pledge', tail: 'either' },
          () => flag(c.state, 'promise') !== undefined && currentTail(c.state) === 'either',
        ),
      ),
      seals,
      group(
        ...(Object.keys(sheets) as Sheet[]).map((sheet) =>
          button(sheet === 'chalk' ? 'Open the old hinge packet' : 'Open the fine hinge packet', {
            act: 'sheet',
            sheet,
          }),
        ),
      ),
      packetInfo,
      live,
    );
    const exchange = h(
      'button',
      {
        type: 'button',
        onclick: () => {
          const mark = currentStamp(c.state);
          clipA = clipped.value;
          const next = letters
            .split('')
            .filter((l) => (mark.includes(l) && l !== clipA) || l === loose.value)
            .join('');
          move({ act: 'stamp', face: next });
        },
      },
      'Exchange the two clips',
    );
    packetInfo.append(
      sample,
      synopsis,
      detail,
      group(h('label', {}, 'Unclip ', clipped), h('label', {}, 'Clip instead ', loose), exchange),
      group(
        button('Restore the observed DEF draw', { act: 'stamp', face: 'DEF' }),
        h(
          'button',
          {
            type: 'button',
            onclick: () =>
              move({
                act: 'stamp',
                face: stamps[(stamps.indexOf(currentStamp(c.state)) + 1) % stamps.length],
              }),
          },
          'Rotate the stamp one notch',
        ),
      ),
      outcome,
      button('Send both hinge readings to rehearsal', { act: 'print' }),
    );
  } else {
    extra = group(button('Tuck in Duchamp’s curved nose-scratch cue', { act: 'scratch' }));
    body.append(
      h(
        'p',
        {},
        'A single sleeve hangs over the two empty chairs. Pip needs one hand free. Vee has spent her whole life waiting for that hand to open. Turn the sleeve both ways before giving either sister the entrance.',
      ),
      cloth,
      synopsis,
      h(
        'p',
        {},
        'Pip points to the chain. “Pull that and my moon comes up.” Vee has tied a ribbon just beneath it. “If the hand falls short, try mine.” You can also leave the hand rig in place.',
      ),
      group(
        toggle(
          'Fit the old hinge to the hand',
          { act: 'hinge', sheet: 'chalk' },
          () => flag(c.state, 'stageHinge') === 'chalk',
        ),
        toggle(
          'Fit the fine hinge to the hand',
          { act: 'hinge', sheet: 'chalk-dust' },
          () => flag(c.state, 'stageHinge') === 'chalk-dust',
        ),
      ),
      group(
        toggle(
          'Show the printed words',
          { act: 'face', face: 'writing' },
          () => flag(c.state, 'facing') === 'writing',
        ),
        toggle(
          'Show the repair knots',
          { act: 'face', face: 'seam' },
          () => flag(c.state, 'facing') === 'seam',
        ),
      ),
      detail,
      group(
        button('Give Vee the first entrance', { act: 'cue', when: 'first' }),
        button('Let Pip give the first cue', { act: 'cue', when: 'last' }),
      ),
      extra,
      outcome,
      live,
    );
  }
  function draw() {
    const s = c.state,
      mask = currentMask(s),
      cast = currentCast(s);
    for (const a of switches) a.button.setAttribute('aria-pressed', String(a.active()));
    if (bench === 'lottery') {
      const sheet = currentSheet(s),
        tail = currentTail(s),
        promise = flag(s, 'promise'),
        unsealed = flag(s, 'unsealed') === true;
      seals!.textContent = promise
        ? 'Original peg on ' +
          faceName(String(promise)) +
          '. ' +
          (unsealed
            ? 'The packet has been opened. Later changes of direction stay visible.'
            : 'The measured strips are sealed.')
        : 'The two packets are sealed.';
      packetInfo!.hidden = !unsealed;
      if (!unsealed) return;
      const r = lotReading(sheet, currentStamp(s), tail),
        paper = sheets[sheet],
        stamp = currentStamp(s);
      setOptions(
        clipped,
        letters.split('').filter((l) => stamp.includes(l)),
        clipA,
      );
      setOptions(
        loose,
        letters.split('').filter((l) => !stamp.includes(l)),
        'A',
      );
      const values = paper.tenthMillimetres.map((n, i) => letters[i] + ' ' + (n / 10).toFixed(1) + ' mm');
      sample.replaceChildren(
        ...paper.tenthMillimetres.map((n, i) =>
          h(
            'div',
            {
              class: 'giant-strip' + (stamp.includes(letters[i]) ? ' clipped' : ''),
              style: '--lift:' + Math.max(4, Math.round(n * 0.58)) + 'px',
            },
            h('span', {}, letters[i]),
            h('small', {}, (n / 10).toFixed(1)),
          ),
        ),
      );
      sample.setAttribute('aria-label', paper.name + '. ' + values.join(', ') + '. Clips on ' + stamp + '.');
      synopsis.textContent =
        paper.name +
        '. The fitter drew DEF. Their average lift exceeded ABC by ' +
        r.observed.toFixed(2) +
        ' mm. The catch needs ' +
        (paper.threshold / 10).toFixed(1) +
        ' mm. ' +
        r.clears +
        ' of the three treated strips reached it.';
      detail.textContent =
        'If polish changed none of the six strips, any three could have carried clips. Each of the twenty groups was equally likely. Counting ' +
        faceName(tail) +
        ', ' +
        r.rare +
        ' of twenty reach the observed cutoff.';
      outcome.textContent = readDraw();
      return;
    }
    const staged = Number(flag(s, 'printedPattern') ?? 0),
      front = String(flag(s, 'facing') ?? 'unturned');
    const modelling = bench === 'fitting' ? cast : 'summer',
      pattern = bench === 'fitting' ? mask : staged;
    const canvas = cloth.getContext('2d');
    if (canvas)
      drawSleeves(
        canvas,
        modelling,
        pattern,
        bench === 'curtain'
          ? {
              face: front,
              first: flag(s, 'cue') === 'first',
              curve: flag(s, 'scratch') === true,
              hinge: flag(s, 'stageHinge'),
            }
          : undefined,
      );
    cloth.setAttribute(
      'aria-label',
      'Four carved puppets in the ' +
        modelling +
        ' company. ' +
        fitLine(modelling, pattern) +
        (bench === 'curtain' ? ' Front of the cuff: ' + front + '.' : ''),
    );
    if (bench === 'fitting') {
      castList!.replaceChildren(
        ...trySleeves(cast, mask).map((p) =>
          h('li', {}, p.name + ' · ' + p.reach + ' cm' + (p.joint ? ' · brass joint' : '')),
        ),
      );
      synopsis.textContent =
        patchCount(mask) +
        ' of two joints pinned. ' +
        (flag(s, 'fitted.' + cast + '.' + mask)
          ? fitLine(cast, mask)
          : 'Pull the sleeve to see which hands meet.');
      detail.textContent =
        'This pattern has been lowered over ' +
        (casts.filter((v) => flag(s, 'fitted.' + v + '.' + mask)).join(' and ') || 'neither cast') +
        '. Both sets average 20 cm.';
      outcome.textContent =
        typeof flag(s, 'hung') === 'number'
          ? 'The pattern down in the square has ' + patchCount(Number(flag(s, 'hung'))) + ' brass joints.'
          : 'The runners are waiting under the window.';
    } else {
      const who = trySleeves('summer', staged)
        .filter((p) => p.joint)
        .map((p) => p.name.split(',')[0]);
      synopsis.textContent =
        'The signed pattern arrived ' +
        (who.length ? 'with brass joints for ' + who.join(' and ') : 'without brass joints') +
        '. The lottery packet records ' +
        faceName(String(flag(s, 'printed'))) +
        '.';
      detail.textContent =
        front === 'writing'
          ? 'Outside: VEE ENTERS LAST, printed before Pip’s illness.'
          : front === 'seam'
            ? 'Inside: three left-handed repairs where Vee took the weight.'
            : 'The cloth is folded over the cue rail.';
      extra!.hidden = flag(s, 'curve') !== true;
      outcome.textContent = flag(s, 'cue')
        ? (flag(s, 'cue') === 'first' ? 'Vee had the opening.' : 'Pip opened the show from her chair.') +
          ' The audience saw ' +
          (flag(s, 'performedFace') === 'writing' ? 'the old cue.' : 'the repairs.') +
          (flag(s, 'performedHinge') === 'chalk'
            ? ' One moon rose over the stage.'
            : flag(s, 'performedHinge') === 'chalk-dust'
              ? ' Tiny paper moons fell into open hands.'
              : ' The crew lifted the scenery by hand.') +
          ' Both sisters are back in the loft.'
        : 'Someone in the front row has saved a seat for the person who built the giant.';
    }
  }
  draw();
  return body;
}
