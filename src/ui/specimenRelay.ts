import type { GameController } from '../app/controller';
import { RELAY_CASES, type RelayCase } from '../content/relayCases';
import { RELAY_CLIPS, RELAY_WEATHER, relayMove, relayState, weaveLine, type RelayChannel, type RelayClip } from '../domain/specimenRelay';
import { h } from './dom';
import './specimenRelay.css';

type Action = Parameters<typeof relayMove>[2];
const CLIP_NAME = { record: 'Catalogue clip', detail: 'Observation clip' } as const;
const RECIPIENT = { bell: 'Sora at the harbour bell', trace: 'Renna at Lantern House' } as const;

function clipCard(record: RelayCase, clip: RelayClip) {
  return h('div', { class: `relay-clip relay-${clip}` }, h('strong', {}, CLIP_NAME[clip]),
    h('span', {}, clip === 'record' ? `${record.institution} · ${record.accession}` : record.detail));
}

export function specimenRelayPanel(place: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void): HTMLElement {
  const summary = h('p', { class: 'relay-action-status fine', role: 'status' });
  const body = h('div');
  const root = h('div', { class: 'specimen-relay' }, body, summary);
  root.tabIndex = -1;

  function act(record: RelayCase, action: Action, id: string, announcement: string) {
    if (!controller.check({ card: record.card })) return;
    const effect = relayMove(record.key, controller.state.flags, action);
    if (!effect) return;
    const events = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
    if (events.some(({ kind }) => kind === 'error')) return;
    refreshWorld();
    sound(action.type === 'trial' ? 'sfx.step' : action.type === 'reunite' ? 'sfx.complete' : 'sfx.page');
    render();
    summary.textContent = announcement;
    const stay = root.querySelector<HTMLElement>(`button[data-relay="${id}"]:enabled`);
    const nextInCase = root.querySelector<HTMLElement>(`[data-relay-case="${record.slug}"] button:enabled`);
    (stay ?? nextInCase ?? root.querySelector<HTMLElement>('button:enabled') ?? root).focus();
  }

  function button(record: RelayCase, id: string, text: string, action: Action, announcement: string, disabled = false) {
    return h('button', { type: 'button', 'data-relay': id, disabled, onclick: () => act(record, action, id, announcement) }, text);
  }

  function renderStand(record: RelayCase) {
    const state = relayState(record.key, controller.state.flags);
    body.append(h('h2', {}, record.name), h('p', {}, record.stake));
    if (!controller.check({ card: record.card })) {
      body.append(h('p', {}, 'Open the museum record beside this stand to bring its two clips.'));
      return;
    }
    const order = state.loaded ? weaveLine(state.loaded, 'still').arrived : RELAY_CLIPS;
    body.append(
      h('div', { class: 'relay-cord', 'aria-label': state.loaded ? 'Threaded cord, lead clip first' : 'Clips beside an empty cord' },
        ...order.map((clip, index) => h('section', {}, h('p', { class: 'fine' }, state.loaded ? (index === 0 ? 'Lead catch' : 'Trailing catch') : 'On the workbench'), clipCard(record, clip)))),
      h('div', { class: 'row wrap' }, ...RELAY_CLIPS.map((first) =>
        button(record, `thread-${first}`, `Thread the ${first === 'record' ? 'catalogue' : 'observation'} clip first`, { type: 'thread', first },
          `${CLIP_NAME[first]} is in the lead catch.`, !!state.delivery || state.loaded === first))),
    );
    if (!state.loaded) return;
    const loaded = state.loaded;
    body.append(h('p', { class: 'fine' }, 'A gust shuts the lid between the two catches. The sheltered tray keeps the whole cord until after the bell.'),
      h('div', { class: 'relay-trials' }, ...RELAY_WEATHER.map((weather) => {
        const tried = controller.state.flags[`${record.key}.trial.${loaded}.${weather}`] === true;
        const result = weaveLine(loaded, weather);
        const text = result.held.length
          ? `${CLIP_NAME[loaded]} crossed. ${CLIP_NAME[result.held[0]]} stayed behind the shut lid.`
          : 'Both clips crossed, in thread order.';
        return h('section', { class: 'clue-view' }, h('h3', {}, weather === 'still' ? 'Still air' : 'Gust'),
          h('p', { class: 'fine' }, tried ? text : 'The catch is ready.'),
          button(record, `trial-${weather}`, weather === 'still' ? 'Pull the line in still air' : 'Pull the line in a gust',
            { type: 'trial', weather }, text, !!state.delivery));
      })),
    );
    if (state.delivery) {
      body.append(h('p', {}, `Sent to ${RECIPIENT[state.delivery.channel]}. ${state.checked ? 'The clips are back together.' : 'Visit the receiver to check the delivery.'}`));
      return;
    }
    body.append(h('div', { class: 'row wrap' },
      button(record, 'send-bell', 'Send the lead clip to Sora before the bell', { type: 'send', channel: 'bell' },
        'Sora has the lead clip at Seagrass Steps. Check the trailing clip with her there.', !state.compared),
      button(record, 'send-trace', 'Leave both clips in Renna’s late tray', { type: 'send', channel: 'trace' },
        'Renna’s late tray is back in Lantern House. Check the full clasp there.', !state.compared)));
  }

  function renderReceiver(channel: RelayChannel) {
    body.append(h('h2', {}, RECIPIENT[channel]));
    for (const record of RELAY_CASES) {
      const state = relayState(record.key, controller.state.flags);
      if (state.delivery?.channel !== channel) continue;
      const first = state.delivery.first;
      const staged = weaveLine(first, channel === 'bell' && !state.callback ? 'gust' : 'still');
      const entry = h('article', { class: 'relay-reply clue-view', 'data-relay-case': record.slug }, h('h3', {}, record.name),
        channel === 'bell' ? h('p', { class: 'fine' }, 'From the first slip at the bell') : null,
        h('p', {}, channel === 'trace' ? record.trace : first === 'record' ? record.bellSource : record.bellDetail),
        ...staged.arrived.map((clip) => clipCard(record, clip)),
      );
      if (state.checked) {
        entry.append(h('p', { class: 'fine' }, `The checked copy keeps the observation with accession ${record.accession}.`));
      } else if (staged.held.length) {
        const missing = CLIP_NAME[staged.held[0]].toLowerCase();
        entry.append(h('p', { class: 'fine' }, `The ${missing} is still at the other end.`),
          button(record, `callback-${record.slug}`, `Call for the ${missing}`, { type: 'request-missing' }, 'The trailing clip has arrived after the bell.'));
      } else {
        if (state.callback) entry.append(h('p', { class: 'fine' }, 'The trailing clip arrived after the bell. The first action is still on the working copy.'));
        entry.append(button(record, `reunite-${record.slug}`, 'Latch both clips onto the checked copy', { type: 'reunite', channel },
          `The checked copy of ${record.name} stays with ${RECIPIENT[channel]}.`));
      }
      body.append(entry);
    }
    if (body.childElementCount === 1) body.append(h('p', {}, 'There is room for a dispatch. The cord stands are through the small door at the back of Lantern House.'));
  }

  function render() {
    body.replaceChildren();
    if (place === 'bell' || place === 'trace') { renderReceiver(place); return; }
    const record = RELAY_CASES.find(({ slug }) => slug === place);
    if (record) renderStand(record);
  }
  render();
  return root;
}
