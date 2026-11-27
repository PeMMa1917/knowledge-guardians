import type { GameController } from '../app/controller';
import { CLAIM_ROLLS, DRAWERS, matchParcelTags, PARCEL_REPLY, pullParcelRack, type DrawerRule } from '../domain/parcelLedger';
import { h } from './dom';

export function parcelLedgerPanel(controller: GameController, place: string, rustle: () => void) {
  const shell = h('section', { class: 'number-leaf-panel' });
  const readout = h('p', { class: 'clue-view', role: 'status', 'aria-live': 'polite' });
  const flag = (name: string) => controller.state.flags[`parcel.${name}`];
  const record = (name: string, value: string | boolean) => {
    if (flag(name) !== value) controller.dispatch({ type: 'SetFlag', flag: `parcel.${name}`, value });
  };
  const button = (label: string, action: () => void) => h('button', { type: 'button', onclick: () => { rustle(); action(); } }, label);
  record('open', true);
  if (place === 'rack') {
    let pinned = 0;
    const pins = DRAWERS.map((name, i) => button(`Pin ${name}`, () => {
      pinned = i;
      syncPins();
      readout.textContent = `${name} is pinned. Pull either handle to run all six slips.`;
    }));
    function syncPins() {
      pins.forEach((pin, i) => pin.setAttribute('aria-pressed', String(i === pinned)));
    }
    const run = (rule: DrawerRule) => {
      const { keep, move, exposed } = pullParcelRack(pinned, rule);
      record(rule, DRAWERS[pinned]);
      readout.textContent = `${DRAWERS[pinned]} pinned. ${keep} seals under the original pin. ${move} under the other closed drawer. ${exposed} exposed before a runner could move. ` +
        (rule === 'spring' ? 'Lella catches the fallen seals in her apron. “Those never made it onto his slip.”' : 'Six empty drawers opened. Lella leaves her sighting mirror where Omrin can see it.');
    };
    shell.append(h('h2', {}, 'The seal that fell out'), h('p', {}, 'Lella opens a drawer. Empty. Omrin pulls the same handle with his eyes shut. A brass seal lands at your feet. Upstairs, someone still holds half a wrapper for a parcel the ledger calls collected.'),
      h('p', {}, 'The rack has six slips. Each drawer holds the seal twice across the set. Pin a drawer as the runner would, then try a handle.'),
      h('div', { class: 'row' }, pins), h('div', { class: 'row' },
        button('Let Lella open an empty drawer', () => run('keeper')), button('Release the blind spring', () => run('spring'))), readout);
    syncPins();
    readout.textContent = flag('keeper') && flag('spring') ? 'Both opening rules are on file. Across the room a torn queue roll waits.' : 'Reed is pinned. The seal moves between slips.';
  } else if (place === 'roll') {
    let roll = 0;
    const pieces = h('ol', { class: 'guest-list', 'aria-label': 'Queue tags in arrival order' });
    const show = (mode?: 'named' | 'pairs') => {
      const tags = CLAIM_ROLLS[roll];
      const pairs = mode ? matchParcelTags(tags, mode === 'pairs') : [];
      pieces.replaceChildren(...tags.map((tag, index) => h('li', { class: pairs.some((pair) => pair.includes(index)) ? 'match' : '' },
        `${index === 0 ? 'Lella' : 'Runner ' + (index + 1)} · ${tag}`)));
      if (!mode) { readout.textContent = 'Hook the thread at Lella’s tag or pass it between every pair.'; return; }
      if (roll === 0) record(mode, true);
      const comparisons = mode === 'named' ? tags.length - 1 : tags.length * (tags.length - 1) / 2;
      readout.textContent = `${comparisons} links checked. ` + (pairs.length ? pairs.map(([a, b]) =>
        `The ${tags[a]} mark appears on tags ${a + 1} and ${b + 1}.`).join(' ') : 'Lella’s Reed mark stands alone.') +
        (roll === 0 && pairs.length ? ' Omrin smooths the torn corner. “I checked everyone against her. I never checked those two against each other.”' : '');
    };
    const change = button('Unroll the next queue', () => {
      roll = 1 - roll;
      change.textContent = roll ? 'Return to the torn queue roll' : 'Unroll the next queue';
      heading.textContent = roll ? 'The next queue' : 'The torn queue roll';
      show();
    });
    const heading = h('h3', {}, 'The torn queue roll');
    shell.append(h('h2', {}, 'A moon sewn twice'), h('p', {}, 'Omrin closed the claim when nobody shared Lella’s tag. She puts her finger on the second runner. “He never said it matched mine.” Someone on the stair slips another corner of the wrapper under the door.'),
      heading, pieces, h('div', { class: 'row' }, button('Anchor the thread at Lella', () => show('named')),
        button('Weave between every pair', () => show('pairs')), change), readout);
    show();
  } else {
    const ready = controller.state.objectivesDone.includes('parcel.rack') && controller.state.objectivesDone.includes('parcel.roll');
    shell.append(h('h2', {}, 'A space at the counter'), h('p', {}, 'The runner on the stair wants another turn. Lella has two spare tokens. Omrin pulls a chair halfway out, then looks at the line. “Will you stay if I listen?”'));
    for (const [choice, reply] of Object.entries(PARCEL_REPLY)) {
      const control = button(reply.label, () => {
        record('reply', choice);
        readout.textContent = reply.text;
        syncChoice();
      });
      control.dataset.parcelChoice = choice;
      control.disabled = !ready;
      shell.append(control);
    }
    function syncChoice() {
      shell.querySelectorAll<HTMLButtonElement>('[data-parcel-choice]').forEach((control) =>
        control.setAttribute('aria-pressed', String(control.dataset.parcelChoice === flag('reply'))));
    }
    const current = flag('reply');
    readout.textContent = current === 'token' || current === 'desk' ? PARCEL_REPLY[current].text :
      ready ? 'You can change the arrangement when you see who it serves.' : 'The brass seal rack and torn queue roll each hold half of the story.';
    shell.append(readout);
    syncChoice();
  }
  return shell;
}
