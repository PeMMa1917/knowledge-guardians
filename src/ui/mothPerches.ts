import type { GameController } from '../app/controller';
import { h } from './dom';
import { artURL } from './illustrations';
import {
  linings,
  perches,
  lastMothVisit,
  traceMoth,
  type Perch,
  type Lining,
  type Shutter,
} from '../domain/mothPerches';
import type { GameEvent } from '../domain/engine';

export function mothPerchPanel(
  c: GameController,
  place: Perch,
  finished: (text: string) => void,
) {
  const last = lastMothVisit(c.state);
  const select = (
    label: string,
    items: Record<string, string>,
    initial: string,
  ) => {
    const ctrl = h(
      'select',
      {},
      Object.entries(items).map(([value, name]) =>
        h('option', { value }, name),
      ),
    );
    ctrl.value = initial;
    return { ctrl, label: h('label', {}, label, ' ', ctrl) };
  };
  const lining = select(
    'Perch lining',
    linings,
    last?.perch === place ? last.lining : 'glass',
  );
  const shutter = select(
    'Lamp shutter',
    { open: 'Open', hooded: 'Hooded' },
    last?.perch === place ? last.shutter : 'open',
  );
  const report = h(
    'p',
    { role: 'status', 'aria-live': 'polite' },
    last?.perch === place
      ? traceMoth(last).text
      : 'The moth’s shadow crosses the table. Kip props the lamp at one end and lays down his old cuff.',
  );
  const scene = h(
    'div',
    { class: 'moth-perch-view', 'aria-hidden': 'true' },
    h('span', { class: 'perch-lamp' }, '◉'),
    h('img', { class: 'perch-moth', src: artURL('moth.big'), alt: '' }),
    h('span', { class: 'perch-rest' }),
  );
  function draw(v: { lining: Lining; shutter: Shutter }, settled: boolean) {
    scene.dataset.foot = v.lining;
    scene.dataset.shutter = v.shutter;
    scene.dataset.settled = String(settled);
  }
  if (last?.perch === place) draw(last, traceMoth(last).lands);
  else draw({ lining: 'glass', shutter: 'open' }, false);
  const tryIt = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        const v = {
          perch: place,
          lining: lining.ctrl.value as Lining,
          shutter: shutter.ctrl.value as Shutter,
        };
        const error = c
          .dispatch({ type: 'TryMothPerch', ...v })
          .find((e) => e.kind === 'error');
        if (error) {
          report.textContent = error.message;
          return;
        }
        const r = traceMoth(v);
        draw(v, r.lands);
        report.textContent = r.text;
        updateLeave();
      },
    },
    'Set the perch and stand back',
  );
  const leave = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        const events = c.dispatch({ type: 'WelcomeMoth', perch: place });
        const error = events.find((e) => e.kind === 'error');
        if (error) {
          report.textContent = error.message;
          return;
        }
        const reply = events.find((e) => e.kind === 'loreling') as
          Extract<GameEvent, { kind: 'loreling' }> | undefined;
        if (reply?.ok) finished(reply.text);
        else if (reply) report.textContent = reply.text;
      },
    },
    'Leave a resting place here',
  );
  function updateLeave() {
    const tested = lastMothVisit(c.state);
    leave.disabled =
      !tested ||
      tested.perch !== place ||
      tested.lining !== lining.ctrl.value ||
      tested.shutter !== shutter.ctrl.value;
  }
  for (const control of [lining.ctrl, shutter.ctrl])
    control.addEventListener('change', () => {
      updateLeave();
      if (leave.disabled)
        report.textContent =
          'You change the setup. Set the perch and stand back to see what the moth does.';
      else {
        const tested = lastMothVisit(c.state);
        if (tested) report.textContent = traceMoth(tested).text;
      }
    });
  updateLeave();
  return h(
    'div',
    { class: 'moth-perch' },
    h('h3', {}, 'Kip’s folding perch'),
    h(
      'p',
      {},
      'At ' +
        perches[place] +
        ', you can change the lining, lower the lamp shutter and wait. A keeper at another stand can try a different arrangement.',
    ),
    scene,
    lining.label,
    shutter.label,
    h('div', { class: 'row wrap' }, tryIt, leave),
    report,
  );
}
