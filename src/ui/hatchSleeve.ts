import type { GameController } from '../app/controller';
import { ctx } from '../app/context';
import { playCueTrial } from '../app/cueTrialAudio';
import {
  closedBoxes,
  clippedWords,
  editionStories,
  hatchReading,
  hatchReceipt,
  heldPair,
  issuedSleeve,
  listeners,
  sleeveLabels,
  sleeves,
  surfaces,
  wrapperReading,
  type HatchCommand,
  type Listener,
  type Surface,
} from '../domain/hatchSleeve';
import { h } from './dom';
import { localGuide } from './localGuide';
import './hatchSleeve.css';

export function hatchPanel(c: GameController, sound: (key: string) => void, receiving = false) {
  const shell = h('div', { class: 'hatch-sleeve' }),
    body = h('div', { class: 'hatch-work' });
  const feedback = h('p', {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    class: 'hatch-answer',
  });
  let surface: Surface = 'board',
    listener: Listener = 'peg',
    tooth = false;
  const saved = String(c.state.flags['hatch.last'] ?? '').split('.');
  if (surfaces.includes(saved[0] as Surface) && listeners.includes(saved[1] as Listener)) {
    surface = saved[0] as Surface;
    listener = saved[1] as Listener;
    tooth = saved[2] === 'in';
  }
  const guide = localGuide(c, receiving ? 'WORLD-01' : 'WORLD-02', () =>
    receiving ? 'hatch.return' : heldPair(c.state) ? 'hatch.issue' : 'hatch.control',
  );
  const action = (id: string, label: string, fn: () => void, selected?: boolean) =>
    h(
      'button',
      {
        type: 'button',
        'data-hatch': id,
        'aria-pressed': selected === undefined ? undefined : String(selected),
        onclick: () => {
          fn();
          draw();
          body.querySelector<HTMLElement>('[data-hatch="' + id + '"]')?.focus({ preventScroll: true });
        },
      },
      label,
    );
  const row = (...items: HTMLElement[]) => h('div', { class: 'hatch-row' }, ...items);
  const section = (title: string, ...items: HTMLElement[]) =>
    h('section', {}, h('h3', {}, title), ...items);
  const tell = (cmd: HatchCommand, result: string) => {
    const error = c.dispatch(cmd).find((e) => e.kind === 'error');
    feedback.textContent = error && error.kind === 'error' ? error.message : result;
    if (error) return;
    if (cmd.work === 'strike') {
      const { trace } = hatchReading(surface, listener, tooth);
      playCueTrial(
        trace === 'ring' ? ['cue'] : trace === 'click' ? ['work'] : ['rest'],
        ctx.settings.sfxVolume,
        () => shell.isConnected && ctx.settings.sfxVolume > 0,
      );
    } else sound('sfx.page');
  };
  const wordName = { elsbet: 'Elsbet’s outside slip', orrin: 'Orrin’s inside slip' };
  function draw() {
    const s = c.state,
      edition = issuedSleeve(s);
    body.replaceChildren();
    if (receiving) {
      if (!edition) {
        body.append(h('p', {}, 'The holder is empty. Its working sleeve is in Elsbet’s study.'));
        return;
      }
      const delivered = s.flags['hatch.delivered'] === edition;
      body.append(
        h(
          'p',
          {},
          'A sleeve from Emberford hangs beside the installed packet. The caller nearest the door has been reading it upside down. “I’m waiting for the other side to answer.”',
        ),
        section(
          sleeveLabels[edition],
          action('receive', 'Unroll it with the first reader', () =>
            tell({ type: 'WorkHatchSleeve', work: 'receive' }, hatchReceipt(s, edition)),
          ),
          ...(delivered
            ? [
                h('p', {}, hatchReceipt(s, edition)),
                action('visitor', 'Stay for the next caller', () =>
                  tell({ type: 'WorkHatchSleeve', work: 'visitor' }, editionStories[edition].cost),
                ),
              ]
            : []),
          ...(delivered && s.flags['hatch.visitor.' + edition]
            ? [h('p', {}, editionStories[edition].cost)]
            : []),
        ),
      );
      return;
    }
    const labels = {
      board: 'Wooden board',
      brass: 'Brass plate',
      peg: 'Near peg',
      table: 'Kitchen table',
    };
    const read = (a: 'elsbet' | 'orrin') =>
      section(
        wordName[a],
        h('blockquote', {}, s.flags['hatch.read.' + a] ? clippedWords[a].full : clippedWords[a].outside),
        action('unfold-' + a, 'Lift ' + (a === 'elsbet' ? 'the blue edge' : 'the pencilled edge'), () =>
          tell({ type: 'WorkHatchSleeve', work: 'unfold', author: a }, clippedWords[a].full),
        ),
      );
    const picture = h(
      'div',
      { 'aria-hidden': 'true', class: 'hatch-cutaway ' + (tooth ? 'tooth-in' : 'tooth-out') },
      h('span', { class: 'hatch-board' }),
      h('span', { class: 'hatch-cricket' }),
      h('span', { class: 'hatch-wire' }),
      h('span', { class: 'hatch-spoon' }),
    );
    const setSurface = (v: Surface) => {
      surface = v;
      feedback.textContent = 'Your knuckle rests on the ' + labels[v].toLowerCase() + '.';
    };
    const setPlace = (v: Listener) => {
      listener = v;
      feedback.textContent =
        v === 'peg'
          ? 'Orrin puts a hand beside the little cricket.'
          : 'Orrin takes his spoon to the table.';
    };
    body.append(
      h(
        'p',
        {},
        'One wax cricket is sitting on the old hatch. Orrin will stand on either side for you. “Try knocking. I want to know whether I could have missed her.”',
      ),
      h('div', { class: 'hatch-slips' }, read('elsbet'), read('orrin')),
      ...(wrapperReading(s)
        ? [
            action('lay', 'Lay Kip’s market wrapper beside the two slips', () =>
              tell({ type: 'WorkHatchSleeve', work: 'lay' }, wrapperReading(s)!),
            ),
          ]
        : []),
      section(
        'The little working catch',
        picture,
        h(
          'p',
          {},
          'The board reaches the near peg. The brass plate has a removable tooth and a wire to a spoon across the kitchen.',
        ),
        row(...surfaces.map((v) => action(v, labels[v], () => setSurface(v), surface === v))),
        row(...listeners.map((v) => action(v, labels[v], () => setPlace(v), listener === v))),
        row(
          action(
            'tooth',
            tooth ? 'Take the brass tooth out' : 'Fit the brass tooth',
            () => {
              tooth = !tooth;
              feedback.textContent = tooth ? 'The tooth engages the wire.' : 'The wire hangs loose.';
            },
            tooth,
          ),
          action('strike', 'Knock and listen', () =>
            tell(
              { type: 'WorkHatchSleeve', work: 'strike', surface, listener, tooth },
              hatchReading(surface, listener, tooth).text,
            ),
          ),
        ),
      ),
      section(
        'Two pockets Orrin has tied shut',
        h(
          'p',
          {},
          '“I’ll sit at the kitchen table. Find out what my spoon can detect before we open either one.”',
        ),
        row(
          ...(['apron', 'boot'] as const).map((box) =>
            action('probe-' + box, 'Tap ' + closedBoxes[box].label.toLowerCase(), () =>
              tell(
                { type: 'WorkHatchSleeve', work: 'probe', box },
                box === 'apron'
                  ? 'A spoon rings under the red cloth.'
                  : 'The spoon under the blue cloth stays still.',
              ),
            ),
          ),
        ),
        action('reveal', 'Lift both cloths', () =>
          tell(
            { type: 'WorkHatchSleeve', work: 'reveal' },
            'The apron hid a fitted tooth. The boot hid a slack wire. For this spoon you checked that it would have detected the tooth. Who checked what Elsbet could hear that night?',
          ),
        ),
        ...(s.flags['hatch.opened']
          ? [h('p', {}, closedBoxes.apron.note + ' ' + closedBoxes.boot.note)]
          : []),
      ),
      section(
        'What shall the sleeve carry?',
        row(
          ...sleeves.map((v) =>
            action(
              'clip-' + v,
              sleeveLabels[v],
              () => tell({ type: 'WorkHatchSleeve', work: 'clip', sleeve: v }, editionStories[v].gift),
              edition === v,
            ),
          ),
        ),
        ...(edition
          ? [
              h(
                'p',
                {},
                editionStories[edition].gift +
                  ' The sleeve fits beside the first Nile packet back in the Nexus.',
              ),
            ]
          : []),
      ),
    );
  }
  shell.append(guide, feedback, body);
  draw();
  return shell;
}
