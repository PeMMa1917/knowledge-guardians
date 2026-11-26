import type { GameController } from '../app/controller';
import { PASSAGE_CASES, PASSAGE_GATE, type PassageCase } from '../content/passageCases';
import { heldPassage, passageDone, passageKey, passageMove, passageReady, type PassageStop } from '../domain/specimenPassage';
import { h } from './dom';
import './specimenPassage.css';

const PLACES = { lower: 'Halen at the low rail', upper: 'Clio at the upper binder' } as const;
const TOOLS: Record<string, readonly [string, string, string, string]> = {
  span: ['Measuring arm', 'Swing out the measuring arm', 'Scale note', 'Pull out its scale note'],
  surface: ['Inspection shutter', 'Turn the inspection shutter', 'Catalogue leaf', 'Lift the catalogue leaf'],
  edition: ['Dated view', 'Slide the dated view out', 'Register leaf', 'Separate the register leaf'],
};
type Action = Parameters<typeof passageMove>[2];

export function specimenPassagePanel(place: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void): HTMLElement {
  const body = h('div');
  const live = h('p', { role: 'status', class: 'fine passage-status' });
  const root = h('div', { class: 'specimen-passage', tabindex: -1 }, body, live);

  function act(record: PassageCase, action: Action, id: string, announcement: string) {
    if (!controller.check(PASSAGE_GATE) || !controller.check({ card: record.card })) return;
    const effect = passageMove(record.slug, controller.state.flags, action);
    if (!effect) return;
    const events = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
    if (events.some(({ kind }) => kind === 'error')) return;
    if (action.type !== 'inspect') refreshWorld();
    sound(action.type === 'leave' ? 'sfx.complete' : 'sfx.page');
    render();
    live.textContent = announcement;
    const same = body.querySelector<HTMLElement>(`button[data-passage="${id}"]:enabled`);
    (same ?? body.querySelector<HTMLElement>('button:enabled') ?? root).focus();
  }

  function actionButton(record: PassageCase, id: string, text: string, action: Action, announcement: string, disabled = false) {
    return h('button', { type: 'button', 'data-passage': id, disabled, onclick: () => act(record, action, id, announcement) }, text);
  }

  function renderStand(record: PassageCase) {
    const flags = controller.state.flags;
    const held = heldPassage(flags);
    const done = flags[passageDone(record.slug)];
    body.append(h('h2', {}, record.name), h('p', {}, record.stake));
    if (!controller.check({ card: record.card })) {
      body.append(h('p', {}, 'Read the public catalogue record beside this stand.'));
      return;
    }
    const [viewHeading, viewVerb, recordHeading, recordVerb] = TOOLS[record.family];
    const key = passageKey(record.slug);
    body.append(h('div', { class: 'passage-leaves' },
      h('section', { class: 'clue-view' }, h('h3', {}, viewHeading),
        flags[`${key}.view`] ? h('p', {}, record.first) : actionButton(record, 'view', viewVerb, { type: 'inspect', leaf: 'view' }, record.first, !!held)),
      h('section', { class: 'clue-view' }, h('h3', {}, recordHeading),
        flags[`${key}.record`] ? h('p', {}, record.boundary) : actionButton(record, 'record', recordVerb, { type: 'inspect', leaf: 'record' }, record.boundary, !!held)),
    ));
    if (done === 'lower' || done === 'upper') {
      body.append(h('p', {}, `A checked copy stays with ${PLACES[done]}.`));
    } else if (held) {
      body.append(h('p', {}, held.slug === record.slug ? `This guide is going to ${PLACES[held.stop]}.` : 'You have another guide. Deliver it or put it back at its stand.'));
      if (held.slug === record.slug) body.append(actionButton(record, 'unpack', 'Put the guide back', { type: 'unpack' }, 'The guide is back on this stand.', held.phase === 'seated'));
    } else {
      const blocked = !passageReady(record.slug, flags);
      body.append(h('div', { class: 'row wrap' },
        actionButton(record, 'carry-lower', 'Carry the working strip to Halen', { type: 'carry', stop: 'lower' }, 'Take the strip out to the low rail', blocked),
        actionButton(record, 'carry-upper', 'Carry both leaves to Clio', { type: 'carry', stop: 'upper' }, 'Take both leaves up to the binder', blocked)));
    }
  }

  function renderBench(stop: PassageStop) {
    const flags = controller.state.flags;
    const held = heldPassage(flags);
    const record = PASSAGE_CASES.find((item) => item.slug === held?.slug);
    const action = stop === 'lower' ? 'Set the strip in the low rail' : 'Open both hinges of the binder';
    body.append(h('h2', {}, PLACES[stop]));
    if (held?.stop === stop && record) {
      const placed = held.phase === 'seated';
      body.append(h('section', { class: 'clue-view' }, h('h3', {}, record.name),
        placed ? h('p', {}, record[stop]) : h('p', {}, 'The guide is ready in its sleeve.'),
        h('p', { class: 'fine' }, `${record.institution} · ${record.accession}`),
        placed ? actionButton(record, 'leave', 'Leave the checked guide here', { type: 'leave', stop }, 'The guide stays at this bench.')
          : actionButton(record, 'seat', action, { type: 'seat', stop }, record[stop])));
    } else if (held) {
      body.append(h('p', {}, `The guide you carry is going to ${PLACES[held.stop]}.`));
    } else {
      body.append(h('p', {}, 'There is room for another guide from the Shelter.'));
    }
    for (const deposited of PASSAGE_CASES.filter((item) => flags[passageDone(item.slug)] === stop)) {
      body.append(h('article', { class: 'clue-view' }, h('h3', {}, deposited.name),
        h('p', {}, deposited[stop]), h('p', { class: 'fine' }, `${deposited.institution} · ${deposited.accession}`)));
    }
  }

  function render() {
    body.replaceChildren();
    if (place === 'lower' || place === 'upper') { renderBench(place); return; }
    const record = PASSAGE_CASES.find(({ slug }) => slug === place);
    if (record) renderStand(record);
  }
  render();
  return root;
}
