import type { GameController } from '../app/controller';
import {
  mouldPressures,
  mouldSurfaces,
  traceMould,
  type Surface,
  type Pressure,
} from '../domain/orchardMould';
import { h } from './dom';

export function orchardMould(c: GameController, sound: (id: string) => void) {
  const saved = String(c.state.flags['plum.mould.last'] ?? '').split('.');
  const field = (
    label: string,
    choices: readonly string[],
    initial: string,
  ) => {
    const select = h(
      'select',
      {},
      choices.map((v) => h('option', { value: v }, v)),
    );
    select.value = choices.includes(initial) ? initial : choices[0];
    return { select, label: h('label', {}, label, ' ', select) };
  };
  const surface = field('Mould', mouldSurfaces, saved[0] ?? 'fresh');
  const pressure = field(
    'Hand pressure',
    mouldPressures,
    saved[1] ?? 'working',
  );
  const result = h('div', { class: 'orchard-profiles' });
  const report = h(
    'p',
    { role: 'status', 'aria-live': 'polite' },
    'Draw a reading with both tabs side by side. The fourth notch crosses the join.',
  );
  function print(s: Surface, p: Pressure) {
    const r = traceMould(s, p);
    const profile = (name: string, shape: boolean[]) =>
      h(
        'figure',
        {},
        h('figcaption', {}, name),
        h(
          'ol',
          { 'aria-label': name + ' profile' },
          shape.map((raised, i) =>
            h(
              'li',
              {
                class: raised ? 'raised' : 'hollow',
                'aria-label':
                  'Notch ' + (i + 1) + (raised ? ', raised' : ', level'),
              },
              raised ? '▰' : '_',
            ),
          ),
        ),
      );
    result.replaceChildren(
      h('p', {}, 'Last draw · ' + s + ' mould, ' + p + ' pressure'),
      profile('Pair of bumps', r.first),
      profile('Ridge', r.second),
    );
    report.textContent = r.report;
  }
  if (
    mouldSurfaces.includes(saved[0] as Surface) &&
    mouldPressures.includes(saved[1] as Pressure)
  )
    print(saved[0] as Surface, saved[1] as Pressure);
  const draw = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        const s = surface.select.value as Surface,
          p = pressure.select.value as Pressure;
        const error = c
          .dispatch({ type: 'DrawOrchardStylus', surface: s, pressure: p })
          .find((e) => e.kind === 'error');
        if (error) {
          report.textContent = error.message;
          return;
        }
        sound('sfx.page');
        print(s, p);
      },
    },
    'Draw across both tabs',
  );
  return h(
    'div',
    { class: 'plum-work orchard-mould' },
    h(
      'p',
      {},
      'Fen cut a pair of bumps on one tab and a single ridge on the other. Her stylus runs through seven notches. The brass band marks her working pressure.',
    ),
    surface.label,
    pressure.label,
    draw,
    result,
    report,
  );
}
