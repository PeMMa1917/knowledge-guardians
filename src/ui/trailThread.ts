import type { GameController } from '../app/controller';
import { tiedThread, trailMarkers, threadRecap, type ThreadFace } from '../domain/trailThread';
import { MAPS } from '../maps';
import { h } from './dom';

/** Prepare the list of open steps only when the journal ribbon is unfolded. */
export function trailThreadPanel(controller: GameController, worldName: (id: string) => string) {
  const panel = h(
    'details',
    { class: 'quest-pathway trail-thread' },
    h('summary', {}, 'Mark a path for my return'),
  );
  const contents = h('div', {}),
    saved = h('p', { 'aria-live': 'polite', role: 'status' });
  panel.append(contents);
  function show() {
    if (!panel.open) return;
    const open = controller.engine.visibleObjectives(controller.state).filter((o) => !o.complete);
    const tie = tiedThread(controller.pack, controller.state);
    const worlds = [
      ...new Set(open.map((o) => o.mission.world).filter((w) => Object.hasOwn(trailMarkers, w))),
    ];
    const world = h(
      'select',
      { 'aria-label': 'Place for my ribbon' },
      ...worlds.map((w) => h('option', { value: w }, worldName(w))),
    );
    const mission = h('select', { 'aria-label': 'Story to mark' }),
      step = h('select', { 'aria-label': 'Step to return to' });
    const face = h(
      'select',
      { 'aria-label': 'Side of the ribbon' },
      h('option', { value: 'thing' }, 'An object to notice'),
      h('option', { value: 'voice' }, 'Someone to listen for'),
    );
    const preview = h('p', {}),
      current = h('p', {}),
      staging = h('div', { class: 'trail-choices' });
    const mark = h('button', { type: 'button', onclick: () => commit(false) }, 'Tie this ribbon');
    const untie = h('button', { type: 'button', onclick: () => commit(true) }, 'Untie my ribbon');
    function updateMarker() {
      const marker = trailMarkers[world.value];
      preview.textContent = marker ? marker.paper + '. ' + marker[face.value as ThreadFace] : '';
      mark.disabled = !step.value;
    }
    function steps(prefer?: string) {
      const options = open.filter((o) => o.mission.id === mission.value);
      step.replaceChildren(...options.map((o) => h('option', { value: o.id }, o.title)));
      if (prefer && options.some((o) => o.id === prefer)) step.value = prefer;
      updateMarker();
    }
    function stories(prefer?: string, preferStep?: string) {
      const options = new Map(
        open.filter((o) => o.mission.world === world.value).map((o) => [o.mission.id, o.mission.title]),
      );
      mission.replaceChildren(...Array.from(options, ([id, title]) => h('option', { value: id }, title)));
      if (prefer && options.has(prefer)) mission.value = prefer;
      steps(preferStep);
    }
    function readRibbon() {
      const lines = threadRecap(controller.pack, controller.state, open);
      current.textContent = lines.length
        ? lines.join(' ')
        : 'Your ribbon is loose. You can mark an open lead to see it when you return.';
      untie.hidden = !tiedThread(controller.pack, controller.state);
    }
    function commit(clear: boolean) {
      const result = controller.dispatch(
        clear
          ? { type: 'UntieJournalThread' }
          : { type: 'TieJournalThread', step: step.value, face: face.value as ThreadFace },
      );
      const error = result.find((e) => e.kind === 'error');
      if (error?.kind === 'error') {
        saved.textContent = error.message;
        return;
      }
      readRibbon();
      saved.textContent = clear
        ? 'Your ribbon is loose.'
        : 'Ribbon tied to ' + (step.selectedOptions[0]?.textContent ?? 'your step') + '.';
      if (clear) (worlds.length ? mark : panel.querySelector('summary'))?.focus();
    }
    const here = MAPS[controller.state.mapId]?.world;
    if (tie && worlds.includes(tie.mission.world)) world.value = tie.mission.world;
    else if (worlds.includes(here)) world.value = here;
    if (tie) face.value = tie.face;
    world.addEventListener('change', () => stories());
    mission.addEventListener('change', () => steps());
    face.addEventListener('change', updateMarker);
    step.addEventListener('change', updateMarker);
    staging.append(
      h('label', {}, 'Place', world),
      h('label', {}, 'Story', mission),
      h('label', {}, 'Step', step),
      h('label', {}, 'Ribbon', face),
      preview,
      mark,
    );
    staging.hidden = !worlds.length;
    saved.textContent = '';
    contents.replaceChildren(current, staging, untie, saved);
    readRibbon();
    stories(tie?.mission.id, tie?.objective.id);
  }
  panel.addEventListener('toggle', show);
  return panel;
}
