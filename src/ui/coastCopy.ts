import type { GameController } from '../app/controller';
import {
  COAST_COPY_DESK, COAST_COPY_OBJECTIVE, COAST_COPY_POCKET, coastCopyAvailable, coastCopyCompared,
  coastCopyFlag, coastCopyLayouts, type CoastCopyLayout,
} from '../content/coastCopy';
import { h } from './dom';
import { localGuide } from './localGuide';

const account = 'Holm reports that Kunit carved the map and explained it to him, including the meaning of a feature. The published explanation comes through Holm’s written account.';
const rubbing = 'The rubbing shows the short edge and two raised turns from Wren’s invented practice relief. The paper carries the outline alone. The maker and the purpose need a separate record.';
const outlineGap = 'Eren can follow the two turns on the rubbing. He still needs to learn who explained the original coast piece and how its meaning was recorded.';
const accountGap = 'Eren can trace the explanation to Kunit through Holm’s account. He still needs the paper outline to compare the two turns at the bench.';

function rubbingLeaf() {
  return h('section', { class: 'card' },
    h('h3', {}, 'BR-17 · Practice rubbing'),
    h('div', { role: 'img', 'aria-label': 'A paper mark turns twice and ends at a short edge.',
      style: { width: 'min(80%, 12rem)', height: '2rem', margin: '.7rem 0', position: 'relative' } },
      h('span', { style: { position: 'absolute', inset: '0 30% 50% 0', borderTop: '3px solid currentColor', borderRight: '3px solid currentColor' } }),
      h('span', { style: { position: 'absolute', inset: 'calc(50% - 2px) 0 0 calc(70% - 3px)', borderTop: '3px solid currentColor' } })),
    h('p', {}, rubbing));
}

function accountLeaf(source: string | undefined) {
  return h('section', { class: 'card' }, h('h3', {}, 'BR-17 · Account leaf'), h('p', {}, account),
    source ? h('p', {}, h('a', { href: source, target: '_blank', rel: 'noopener noreferrer' },
      'Holm’s 1886 report, page 104')) : null);
}

export function coastCopyPanel(game: string, controller: GameController, changed: () => void): HTMLElement {
  const box = h('div', {});
  const body = h('div', {});
  const status = h('p', { role: 'status', tabindex: '-1' });
  const accountSource = controller.pack.sources.find(({ id }) => id === 'HIS-KUNIT-HOLM')?.url;
  const documentedLeaf = () => accountLeaf(accountSource);
  const desk = game === COAST_COPY_DESK;
  const pocket = game === COAST_COPY_POCKET;
  const map = desk ? 'voices.listening' : 'voices.walk';
  const atStation = () => controller.state.mapId === map && controller.check(coastCopyAvailable);
  const set = (key: string, value: string | boolean = true) =>
    controller.dispatch({ type: 'SetFlag', flag: coastCopyFlag(key), value });
  const value = (key: string) => controller.state.flags[coastCopyFlag(key)];
  const selection = (key: string): CoastCopyLayout | undefined => {
    const chosen = value(key);
    if (chosen === 'sleeve' || chosen === 'pockets') return chosen;
  };
  const action = (id: string, label: string, change: () => void, feedback: string) => h('button', {
    type: 'button', 'data-coast-action': id,
    onclick: () => {
      if (!atStation()) return;
      change();
      render();
      status.textContent = feedback;
      changed();
      const replacement = body.querySelector<HTMLButtonElement>(`[data-coast-action="${id}"]`);
      (replacement ?? status).focus();
    },
  }, label);

  const render = () => {
    const start = Boolean(value('started'));
    const trial = value('trial');
    const gap = value('gap');
    const layout = selection('layout');
    const received = selection('received');
    const children: HTMLElement[] = [];

    if (!atStation()) {
      body.replaceChildren(h('p', {}, 'Equip Kunit’s working copy from the Bag to start. The Nexus collection room can move it back into your satchel.'));
      return;
    }

    if (desk) {
      children.push(h('p', {}, 'Wren has made a practice relief for copying. The historical exhibit stays at Lantern House. Try the paper outline and the separately filed account.'));
      if (!start) {
        children.push(action('set-copy', 'Set the working copy beside the practice relief.', () => set('started'), 'Wren opens the two-leaf work tray.'));
      } else {
        children.push(value('rubbing') ? rubbingLeaf() : action('lift-rubbing', 'Lift the rubbing from the practice relief.', () => set('rubbing'), 'The paper picked up the outline and lost the height of the wood.'));
        children.push(value('account') ? documentedLeaf() : action('lift-account', 'Lift the account leaf from its own slot.', () => set('account'), 'Kunit is credited as maker and teller. Holm is credited for the written report.'));
        if (controller.check(coastCopyCompared) && !trial) {
          children.push(h('p', {}, 'The test sleeve has room for one leaf. Send it across the passage before making the public copy.'));
          children.push(h('div', { class: 'row' },
            action('send-rubbing', 'Slip the rubbing into the test sleeve.', () => set('trial', 'rubbing'), 'The trial sleeve is at Eren’s bench on Glass Walk.'),
            action('send-account', 'Slip the account into the test sleeve.', () => set('trial', 'account'), 'The trial sleeve is at Eren’s bench on Glass Walk.')));
        } else if (trial && !gap) {
          children.push(h('p', {}, 'Eren has the test sleeve at the copy bench on Glass Walk. Check what he can recover from it.'));
        } else if (gap) {
          children.push(h('p', {}, gap === 'rubbing' ? outlineGap : accountGap));
          if (received) {
            children.push(h('p', {}, coastCopyLayouts[received].receipt));
          } else {
            children.push(...(Object.keys(coastCopyLayouts) as CoastCopyLayout[]).map((key) => h('section', { class: 'card' },
              h('p', {}, coastCopyLayouts[key].benefit),
              layout === key ? h('p', {}, 'This copy is waiting on Glass Walk.') :
                action(key, coastCopyLayouts[key].action, () => {
                  set('bench-tab', false);
                  set('layout', key);
                }, 'Eren’s bench now has the revised delivery.'))));
          }
        }
      }
    } else if (received) {
      children.push(h('p', {}, coastCopyLayouts[received].receipt));
      if (!pocket) children.push(rubbingLeaf());
      if (pocket || received === 'sleeve') children.push(documentedLeaf());
    } else if (!trial) {
      children.push(h('p', {}, 'Eren’s tray is empty. Wren can send a test sleeve from the Listening Room.'));
    } else if (pocket) {
      if (layout === 'pockets' && value('bench-tab')) {
        children.push(documentedLeaf(),
          action('check-pocket', 'Match the account’s tab to the rubbing at the bench.', () => set('received', 'pockets'), coastCopyLayouts.pockets.receipt));
      } else {
        children.push(h('p', {}, 'The account travels here after Eren checks the rubbing tab.'));
      }
    } else if (!gap && (trial === 'rubbing' || trial === 'account')) {
      children.push(trial === 'rubbing' ? rubbingLeaf() : documentedLeaf(),
        action('open-trial', 'Lift the empty flap and show Eren what arrived.', () => set('gap', trial),
          trial === 'rubbing' ? outlineGap : accountGap));
    } else if (layout === 'sleeve') {
      children.push(rubbingLeaf(), documentedLeaf(),
        action('check-sleeve', 'Lift both leaves and check their tabs with Eren.', () => set('received', 'sleeve'), coastCopyLayouts.sleeve.receipt));
    } else if (layout === 'pockets') {
      children.push(rubbingLeaf());
      if (value('bench-tab')) {
        children.push(h('p', {}, 'Follow BR-17 across Glass Walk to the courier pocket.'));
      } else {
        children.push(action('check-bench', 'Slide out the rubbing and read the tab number.', () => set('bench-tab'), 'The reverse tab reads BR-17. Look for the same number on the courier pocket.'));
      }
    } else {
      children.push(h('p', {}, gap === 'rubbing' ? outlineGap : accountGap),
        h('p', {}, 'Take the missing part back to Wren at the rubbing table.'));
    }
    body.replaceChildren(...children);
  };

  render();
  box.append(body, status, localGuide(controller, 'WORLD-14', COAST_COPY_OBJECTIVE));
  return box;
}
