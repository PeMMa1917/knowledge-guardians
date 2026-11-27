import type { GameController } from '../app/controller';
import { makerTrialForTool, type MakerTrial } from '../content/makerTrials';
import {
  fieldObservation,
  makerLimitMask,
  makerLimits,
  fieldReceipt,
  fittedMakerLine,
  installedMakerFit,
  makerMarks,
  makerRecipient,
  makerSample,
  observedFieldSide,
  type MakerCommand,
  type FieldCommand,
} from '../domain/makerField';
import { h } from './dom';
import { makerIllustration } from './makerIllustration';

const sides = [0, 1] as const;
function button(label: string, key: string, fn: () => void) {
  return h('button', { type: 'button', 'data-maker': key, onclick: fn }, label);
}
function settle(root: HTMLElement, key: string) {
  root.querySelector<HTMLElement>('[data-maker="' + key + '"]')?.focus({ preventScroll: true });
}
export function makerBench(c: GameController, id: string, back: () => void, sound: () => void) {
  const t = makerTrialForTool(id)!;
  let mount = installedMakerFit(c.state, t)?.mount ?? 0;
  const root = h('section', { 'aria-label': 'Instrument stand' }),
    live = h('p', { role: 'status' }),
    body = h('div', {});
  root.append(h('p', {}, t.bench), live, body);
  const run = (command: MakerCommand, key: string, message: string) => {
    const error = c.dispatch(command).find((e) => e.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    sound();
    draw();
    live.textContent = message;
    settle(root, key);
  };
  function draw() {
    const seen = makerMarks(c.state, t, mount);
    const tabs = h('div', {
      class: 'row',
      role: 'group',
      'aria-label': 'Instrument mounting',
    });
    for (const m of sides) {
      const b = button(t.mounts[m], 'mount' + m, () => {
        mount = m;
        draw();
        live.textContent = t.mounts[m] + '.';
        settle(root, 'mount' + m);
      });
      b.setAttribute('aria-pressed', String(m === mount));
      tabs.append(b);
    }
    const samples = h('div', { class: 'row' });
    const readings = h('div', { 'aria-label': 'Reference readings' });
    for (const standard of sides) {
      const sample = makerSample(t, mount, standard),
        key = 'sample' + standard;
      samples.append(
        button(t.references[standard], key, () =>
          run(
            {
              type: 'WorkMakerInstrument',
              action: 'test',
              tool: id,
              mount,
              standard,
            },
            key,
            sample.reading + ' · ' + sample.note,
          ),
        ),
      );
      if (seen & (1 << standard))
        readings.append(
          h(
            'p',
            { class: 'clue-view' },
            makerIllustration(t, mount, standard),
            h('strong', {}, sample.reference + ' on the reference · ' + sample.reading + ' on the tool. '),
            sample.note,
          ),
        );
    }
    const fitting = h('div', { class: 'row' });
    if (seen === 3)
      for (const method of sides)
        fitting.append(
          button(t.seals[method], 'fit' + method, () =>
            run(
              {
                type: 'WorkMakerInstrument',
                action: 'fit',
                tool: id,
                mount,
                method,
              },
              'fit' + method,
              fittedMakerLine(t, mount, method),
            ),
          ),
        );
    else
      fitting.append(
        h(
          'p',
          { class: 'fine' },
          'Try the two references with the same mounting. Hesper will hold the other one still.',
        ),
      );
    const installed = installedMakerFit(c.state, t);
    body.replaceChildren(
      tabs,
      samples,
      readings,
      fitting,
      ...(installed
        ? [h('p', {}, 'On your tool: ' + fittedMakerLine(t, installed.mount, installed.method))]
        : []),
      button('Back to the bench', 'back', back),
    );
  }
  draw();
  return root;
}
export function makerField(c: GameController, t: MakerTrial, sound: () => void) {
  const root = h('section', { 'aria-label': 'Field instrument' }),
    live = h('p', { role: 'status' }),
    body = h('div', {});
  root.append(h('p', { class: 'clue-view' }, t.field), live, body);
  const run = (command: FieldCommand, key: string) => {
    const result = c.dispatch(command).find((e) => e.kind === 'error');
    if (result) {
      live.textContent = result.message;
      return;
    }
    sound();
    draw();
    settle(root, key);
    live.textContent =
      command.action === 'observe'
        ? fieldObservation(c.state, t, command.surface)
        : command.action === 'shade'
          ? makerLimits(t, makerLimitMask(c.state, t)).drawn
          : fieldReceipt(c.state, t)!;
  };
  function draw() {
    const controls = h('div', { class: 'row' }),
      impressions = h('div', {});
    for (const surface of sides) {
      const key = 'observe' + surface;
      controls.append(
        button(t.surfaces[surface], key, () =>
          run(
            {
              type: 'WorkTownReading',
              action: 'observe',
              reading: t.reading,
              surface,
            },
            key,
          ),
        ),
      );
      if (observedFieldSide(c.state, t, surface))
        impressions.append(h('p', { class: 'clue-view' }, fieldObservation(c.state, t, surface)));
    }
    const destinations = h('div', { class: 'row' });
    if (sides.every((i) => observedFieldSide(c.state, t, i)))
      for (const recipient of sides) {
        const key = 'hand' + recipient;
        destinations.append(
          button(t.gifts[recipient], key, () =>
            run(
              {
                type: 'WorkTownReading',
                action: 'hand',
                reading: t.reading,
                recipient,
              },
              key,
            ),
          ),
        );
      }
    if (!destinations.childElementCount)
      destinations.append(
        h('p', { class: 'fine' }, 'Examine each surface. Then choose who gets to use what you found.'),
      );
    const bands = h('section', {});
    if (t.tool !== 'reed-pen' && sides.every((i) => observedFieldSide(c.state, t, i))) {
      const mask = makerLimitMask(c.state, t),
        view = makerLimits(t, mask);
      bands.append(h('h3', {}, 'Edges of the reading'), h('p', {}, view.drawn + ' · ' + view.meaning));
      for (const source of sides) {
        const input = h('input', {
          type: 'checkbox',
          'data-maker': 'shade' + source,
        });
        input.checked = !!(mask & (1 << source));
        input.addEventListener('change', () =>
          run(
            {
              type: 'WorkTownReading',
              reading: t.reading,
              action: 'shade',
              source,
              include: input.checked,
            },
            'shade' + source,
          ),
        );
        bands.append(
          h('label', { class: 'maker-shade' }, input, view.labels[source] + ' · ' + view.sources[source]),
        );
      }
    }
    const recipient = makerRecipient(c.state, t);
    body.replaceChildren(
      controls,
      impressions,
      bands,
      destinations,
      ...(recipient === undefined
        ? []
        : [
            h(
              'p',
              {},
              'Word is waiting at Emberford’s Lamp Wall. You can come back and send this another way.',
            ),
          ]),
    );
  }
  draw();
  return root;
}
