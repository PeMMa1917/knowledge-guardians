import type { GameController } from '../app/controller';
import { frameAvailable, frameReady, frameViewed, STORY_FRAMES, type StoryFrame } from '../content/storyArchive';
import { FRAME_POSITIONS, frameViews, lookedAt, openFrameView, type FramePosition } from '../domain/storyFrames';
import { h } from './dom';
import './storyFrames.css';

function paper(record: StoryFrame, position: FramePosition) {
  const variant = record.variants[position];
  return h('section', { class: `story-caption story-caption-${variant.key}`, 'aria-label': variant.title },
    h('h3', {}, variant.title), ...variant.lines.map((line) => h('p', {}, line)));
}

export function storyFramePanel(controller: GameController, key: string, refreshWorld: () => void): HTMLElement {
  const root = h('div', { class: 'story-frame-panel' });
  root.tabIndex = -1;
  const found = STORY_FRAMES.find((item) => item.key === key);
  if (!found) return root;
  const record = found;
  const choiceFlag = `${record.flag}.ready`;
  const viewsFlag = `${record.flag}.views`;
  const combFlag = `${record.flag}.comb`;
  const combHeld = () => controller.check({ item: 'item.source-rail-comb' });
  const focus = (step: string) => (root.querySelector<HTMLElement>(`[data-story-frame="${step}"]:enabled`)
    ?? root.querySelector<HTMLElement>('button:enabled') ?? root).focus();
  const sources = record.sources.map((id) => controller.pack.sources.find((source) => source.id === id)!);
  let active: FramePosition | null = controller.state.flags[choiceFlag] === record.variants[1].key ? 1
    : controller.state.flags[choiceFlag] === record.variants[0].key ? 0 : null;

  function update(flag: string, value: string | number | boolean, step: string) {
    const events = controller.dispatch({ type: 'SetFlag', flag, value });
    if (events.some((event) => event.kind === 'error')) return;
    refreshWorld();
    render();
    focus(step);
  }

  function preview(position: FramePosition) {
    if (!controller.check(frameReady(record))) return;
    active = position;
    const current = frameViews(controller.state.flags[viewsFlag]);
    update(viewsFlag, openFrameView(current, position), `preview-${position}`);
  }

  function send(position: FramePosition) {
    if (!controller.check({ all: [frameReady(record), frameViewed(record), frameAvailable(record)] })) return;
    update(choiceFlag, record.variants[position].key, 'send');
  }

  function render() {
    const item = record;
    const views = frameViews(controller.state.flags[viewsFlag]);
    const saved = item.variants.find(({ key: route }) => controller.state.flags[choiceFlag] === route);
    const clip = controller.state.flags[combFlag] === true;
    root.replaceChildren(h('h2', {}, item.title), h('p', {}, item.stake));
    if (!controller.check(frameReady(item))) {
      root.append(h('p', {}, 'Find the exhibit and its two paper clips first.'));
      return;
    }
    root.append(h('p', {}, item.prompt), h('p', { class: 'fine' }, item.identity),
      h('div', { class: 'row wrap' }, ...FRAME_POSITIONS.map((position) => h('button', {
        type: 'button', 'data-story-frame': `preview-${position}`, 'aria-pressed': String(position === active),
        onclick: () => preview(position),
      }, item.variants[position].control))),
      h('div', { class: 'story-caption-frame', 'aria-live': 'polite' }, active === null
        ? h('p', {}, 'Put one line at the front of the frame to inspect the caption.') : paper(item, active)),
      h('div', { class: 'story-caption-sources' },
        h('p', { class: 'fine' }, 'Sources on the caption’s reverse'),
        ...sources.map((source) => h('a', { href: source.url, target: '_blank', rel: 'noopener' }, source.title))),
      h('p', { class: 'fine', role: 'status' }, saved ? `The caption is ready at ${saved.destination}.`
        : `Checked ${FRAME_POSITIONS.filter((position) => lookedAt(views, position)).length} of 2 arrangements.`));
    if (combHeld()) root.append(clip
      ? h('p', { class: 'fine' }, 'Dace’s comb holds each source below its own line.')
      : h('button', { type: 'button', 'data-story-frame': 'comb', onclick: () => update(combFlag, true, 'comb') },
        'Seat the two source slips in Dace’s comb'));
    if (active !== null && !saved) {
      const position = active;
      root.append(h('button', { type: 'button', 'data-story-frame': 'send', disabled: !controller.check(frameViewed(item)), onclick: () => send(position) },
        `Send this caption to ${item.variants[position].destination}`));
    }
  }

  render();
  return root;
}
