import type { GameController } from '../app/controller';
import { HANDOVER_BUNDLES, HANDOVER_FLAG, handoverKey, lastHandover, nextHandover, type HandoverPlace } from '../domain/handoverGallery';
import { activePerspective } from '../domain/perspectives';
import { h } from './dom';
import { artURL } from './illustrations';

export function handoverGallery(controller: GameController, sound: (key: string) => void, refreshWorld: () => void): HTMLElement {
  const panel = h('div');

  function drawBundle(focusFirst = false) {
    const last = controller.state.flags[HANDOVER_FLAG];
    const previous = lastHandover(last);
    const id = nextHandover(last);
    const bundle = HANDOVER_BUNDLES[id];
    const tool = activePerspective(controller.pack, controller.state);
    const inspected = new Set<number>();
    const publicButton = h('button', { type: 'button', class: 'primary', disabled: true,
      onclick: () => publish('public') }, 'Pin a public notice');
    const keeperButton = h('button', { type: 'button', disabled: true,
      onclick: () => publish('keeper') }, 'Leave a keeper handover');
    const helper = h('p', { class: 'fine', 'aria-live': 'polite' }, 'Set both pieces beside the empty copy.');

    function publish(place: HandoverPlace) {
      if (inspected.size !== bundle.pieces.length) return;
      const events = controller.dispatch({ type: 'SetFlag', flag: HANDOVER_FLAG, value: handoverKey(id, place) });
      if (!events.length) refreshWorld();
      sound('sfx.sparkle');
      const next = h('button', { type: 'button', class: 'primary', onclick: () => drawBundle(true) }, 'Set out the next bundle');
      panel.replaceChildren(h('h2', {}, bundle.name), h('p', {}, bundle[place]),
        h('p', { class: 'fine' }, place === 'public' ? 'The new notice is on the gallery’s east wall.' : 'The new handover is on the keeper’s west bench.'),
        next);
      next.focus();
    }

    const pieces = bundle.pieces.map((piece, index) => {
      const reading = h('div', { 'aria-live': 'polite' });
      const local = h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => openPiece() }, piece.action);
      const useTool = piece.tool && piece.tool.id === tool?.id
        ? h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => openPiece(tool.name) }, piece.tool.action) : null;
      function openPiece(toolName?: string) {
        sound('sfx.page');
        inspected.add(index);
        local.setAttribute('aria-pressed', String(!toolName));
        useTool?.setAttribute('aria-pressed', String(!!toolName));
        reading.replaceChildren(h('div', { class: 'row wrap' },
          h('img', { src: artURL(piece.art), alt: '', width: 32, height: 32 }), h('strong', {}, piece.title)),
          h('p', {}, piece.text), toolName ? h('p', { class: 'fine' }, `Opened with ${toolName}.`) : '');
        const ready = inspected.size === bundle.pieces.length;
        publicButton.disabled = !ready;
        keeperButton.disabled = !ready;
        if (ready) helper.textContent = 'The public copy reaches readers at once. The keeper’s copy keeps a place for the next check and who will make it.';
      }
      return h('section', { class: 'clue-view' }, h('div', { class: 'row wrap' }, local, useTool), reading);
    });

    panel.replaceChildren(h('h2', {}, bundle.name));
    if (previous) panel.append(h('p', { class: 'fine' }, 'The last display stays up while you work on this bundle.'));
    panel.append(h('p', {}, bundle.arrival), ...pieces, helper, h('div', { class: 'row wrap' }, publicButton, keeperButton));
    if (focusFirst) panel.querySelector('button')?.focus();
  }

  drawBundle();
  return panel;
}
