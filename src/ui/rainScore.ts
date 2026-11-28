import type { GameController } from '../app/controller';
import {
  rainDesk,
  rainMoves,
  playRain,
  type RainCommand,
  type RainMove,
} from '../domain/rainScore';
import { h } from './dom';
import { artURL } from './illustrations';
import './rainScore.css';
export function rainScorePanel(
  c: GameController,
  sound: (key: string) => void,
) {
  const shell = h('div', { class: 'rain-score', 'data-reading-bench': '' });
  const body = h('div', {}),
    feedback = h('p', {
      role: 'status',
      'aria-live': 'polite',
      'data-work-feedback': '',
    });
  shell.append(body, feedback);
  function action(text: string, code: string, command: RainCommand) {
    return h(
      'button',
      {
        type: 'button',
        'data-rain': code,
        onclick: () => {
          const result = c.dispatch(command),
            err = result.find((e) => e.kind === 'error');
          if (err?.kind === 'error') {
            feedback.textContent = err.message;
            return;
          }
          const desk = rainDesk(c.state)!;
          const beat = playRain(desk.score).beats.at(-1);
          const reply =
            command.act === 'move'
              ? desk.seat === 'stalls'
                ? beat?.sound
                : beat?.back
              : command.act === 'listen'
                ? 'You changed seats.'
                : command.act === 'bill'
                  ? 'The other room has received a programme.'
                  : command.act === 'try-other'
                    ? 'The visiting score is on the rig.'
                    : command.act === 'keep'
                      ? 'The first bar is tucked into the programme.'
                      : 'The bar is ready to change.';
          sound(
            command.act === 'move' && beat?.hits ? 'sfx.chime' : 'sfx.page',
          );
          render();
          feedback.textContent = reply ?? '';
          body
            .querySelector<HTMLElement>('[data-rain="' + code + '"]')
            ?.focus({ preventScroll: true });
        },
      },
      text,
    );
  }
  type Gesture<T extends RainCommand = RainCommand> = T extends unknown
    ? Omit<T, 'type'>
    : never;
  const button = (label: string, id: string, command: Gesture) =>
    action(label, id, { type: 'WorkCoatRain', ...command });
  function render() {
    const d = rainDesk(c.state)!;
    const play = playRain(d.score);
    const board = h('ol', {
      class: 'rain-beats',
      'aria-label': 'Four beats of indoor rain',
    });
    for (let i = 0; i < 4; i++) {
      const b = play.beats[i];
      board.append(
        h(
          'li',
          {},
          h('strong', {}, 'Beat ' + (i + 1)),
          h(
            'span',
            {},
            b ? (d.seat === 'stalls' ? b.sound : rainMoves[b.move]) : 'Open',
          ),
          b && d.seat === 'wings' ? h('small', {}, b.sound) : null,
        ),
      );
    }
    const hands = h(
      'div',
      { class: 'rain-actions' },
      ...Object.entries(rainMoves).map(([m, label]) =>
        button(label, m, { act: 'move', move: m as RainMove }),
      ),
    );
    body.replaceChildren(
      h(
        'div',
        { class: 'rain-rig' },
        h('img', { src: artURL('coat.cuff'), alt: '' }),
        h(
          'p',
          {},
          'Nim needs four beats for a sleeve that rains indoors. The keeper has two drops in the bulb. You can save a drop in the hem and release it later.',
        ),
      ),
      h(
        'p',
        { class: 'rain-seat' },
        (d.seat === 'wings' ? 'In the wings' : 'In the stalls') +
          ' · ' +
          (d.score.length === 4
            ? 'Four beats set'
            : 4 - d.score.length + ' open beats'),
      ),
      board,
      hands,
      h(
        'div',
        { class: 'rain-actions' },
        button('Lift the last beat', 'undo', { act: 'undo' }),
        button('Clear the bar', 'clear', { act: 'clear' }),
      ),
      h(
        'div',
        { class: 'rain-actions' },
        button('Listen from the stalls', 'stalls', {
          act: 'listen',
          seat: 'stalls',
        }),
        button('Watch the hands in the wings', 'wings', {
          act: 'listen',
          seat: 'wings',
        }),
      ),
      button('Keep this audience’s bar', 'keep', { act: 'keep' }),
    );
    if (d.kept) {
      const first = playRain(d.kept);
      let verdict = '';
      if (d.score.length === 4 && d.score !== d.kept)
        verdict =
          first.heard === play.heard
            ? ' Different working hands can produce the very same sound at the seats.'
            : ' The audience can hear the difference between these two bars.';
      body.append(
        h(
          'p',
          { class: 'rain-comparison' },
          'Inside the programme: ' +
            first.beats.map((b) => b.sound).join(' ') +
            verdict,
        ),
      );
    }
    body.append(
      h(
        'div',
        { class: 'rain-actions' },
        button(
          'Keep the trick for the show and name the rain keeper at the bow',
          'wonder',
          { act: 'bill', billing: 'wonder' },
        ),
        button('Give the rain keeper the stage for a demonstration', 'hands', {
          act: 'bill',
          billing: 'hands',
        }),
      ),
    );
    if (d.bill)
      body.append(
        h(
          'p',
          {},
          d.bill === 'wonder'
            ? 'Nim keeps the surprise. The keeper gets a named bow. A child in the back row still wants to know where the water came from.'
            : 'The keeper shows the folded hem to the front row. Nim hears somebody whisper the secret before the trick reaches the back.',
        ),
      );
    if (d.from)
      body.append(
        h(
          'p',
          {},
          d.from.billing === 'hands'
            ? 'A programme arrives with both sets of hands sketched beside the cue.'
            : 'A visiting programme lists the keeper for a bow. Its curtain still hides the trick.',
        ),
        button('Play the programme from the other room', 'receive', {
          act: 'try-other',
        }),
      );
  }
  render();
  return shell;
}
