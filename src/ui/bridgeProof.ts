import type { GameController } from '../app/controller';
import { alternateBank, BRIDGE_BRANCHES, BRIDGE_PARITY_CHECKED, BRIDGE_PROOF_CHECKED, BRIDGE_PROOF_POSTED, BRIDGE_RULES,
  BRIDGE_STOPS, BRIDGE_TRIAL_MOVES, bridgeLinks, bridgeTraceFlag, traceBridgeBranch,
  type BridgeBranch, type BridgeRule, type BridgeStop } from '../domain/bridgeProof';
import { h } from './dom';
import './bridgeProof.css';

const rules: Record<BridgeRule, string> = {
  banks: 'Use only links between banks',
  plank: 'Add the marked same-bank plank',
};

function trail(path: BridgeStop[]): string {
  return path.map((stop) => BRIDGE_STOPS[stop].name).join(' → ');
}

function traceStrip(rule: BridgeRule, branch: BridgeBranch): HTMLElement {
  const routes = traceBridgeBranch(rule, branch);
  const passes = routes.filter((path) => path.at(-1) === 'rack').length;
  return h('details', { open: true, class: 'bridge-proof-trace' },
    h('summary', {}, `${BRIDGE_STOPS[branch].name} · ${passes} of ${routes.length} reach the rack`),
    h('ol', {}, routes.map((path) => h('li', {}, trail(path)))));
}

export function bridgeProofPanel(controller: GameController, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'bridge-proof-panel' });
  if (!controller.check({ flag: 'reached.emberford', eq: true })) return panel;
  let rule: BridgeRule = 'banks';
  let moves = controller.state.flags[BRIDGE_PARITY_CHECKED] === true ? BRIDGE_TRIAL_MOVES : 0;
  const layout = h('table', { class: 'bridge-proof-links' });
  const folded = h('p', { role: 'status' });
  const traces = h('div', { class: 'bridge-proof-results', 'aria-live': 'polite' });
  const handover = h('p', { role: 'status' });
  const selectors = BRIDGE_RULES.map((setting) => h('button', { type: 'button', onclick: () => {
    rule = setting;
    render();
  } }, rules[setting]));
  const fold = h('button', { type: 'button', onclick: () => {
    if (rule !== 'banks' || moves >= BRIDGE_TRIAL_MOVES) return;
    moves += 1;
    if (moves === BRIDGE_TRIAL_MOVES) flag(BRIDGE_PARITY_CHECKED, true);
    render();
  } }, 'Fold one bank mark');
  const unfold = BRIDGE_BRANCHES.map((branch) => h('button', { type: 'button', onclick: () => {
    flag(bridgeTraceFlag(rule, branch), true);
    render();
  } }, `Unfold the ${branch}-peg branch`));
  const dispatch = [
    h('button', { type: 'button', onclick: () => post('bank-route') }, 'Post the regular four-link route'),
    h('button', { type: 'button', onclick: () => post('light-plank') }, 'Fit the light-packet plank'),
  ];

  function flag(key: string, value: string | boolean) {
    controller.dispatch({ type: 'SetFlag', flag: key, value });
    sound('sfx.page');
  }
  function post(choice: 'bank-route' | 'light-plank') {
    if (!controller.check({ objective: BRIDGE_PROOF_CHECKED }) || controller.check({ flagSet: BRIDGE_PROOF_POSTED })) return;
    flag(BRIDGE_PROOF_POSTED, choice);
    render();
    refresh();
  }

  function render() {
    selectors.forEach((button, index) => button.setAttribute('aria-pressed', String(rule === BRIDGE_RULES[index])));
    fold.disabled = moves >= BRIDGE_TRIAL_MOVES || rule !== 'banks';
    const strip = Array.from({ length: moves + 1 }, (_, index) => alternateBank('Oak', index)).join(' → ');
    const inference = moves >= BRIDGE_TRIAL_MOVES
      ? ' From Start, every three-move trail ends on Stone bank under this rule. The rack sits on Oak bank.' : '';
    folded.textContent = rule === 'banks' ? `Bank strip: ${strip}.${inference}`
      : `The bank strip assumes each move switches sides. The fitted link joins the turn and the rack on Oak bank.`;
    layout.replaceChildren(
      h('caption', {}, 'Links on the practice rail'),
      h('tbody', {}, bridgeLinks(rule).map(([from, to]) => h('tr', {},
        h('td', {}, `${BRIDGE_STOPS[from].name} (${BRIDGE_STOPS[from].bank})`),
        h('td', {}, '↔'),
        h('td', {}, `${BRIDGE_STOPS[to].name} (${BRIDGE_STOPS[to].bank})`)))),
    );
    traces.replaceChildren(...BRIDGE_RULES.map((setting) => {
      const checked = BRIDGE_BRANCHES.filter((branch) => controller.state.flags[bridgeTraceFlag(setting, branch)] === true);
      return h('section', {}, h('h3', {}, rules[setting]),
        checked.length ? checked.map((branch) => traceStrip(setting, branch)) : h('p', { class: 'fine' }, 'Both branches are folded.'));
    }));
    const choice = controller.state.flags[BRIDGE_PROOF_POSTED];
    const ready = controller.check({ objective: BRIDGE_PROOF_CHECKED });
    dispatch.forEach((button) => { button.disabled = !ready || Boolean(choice); });
    const regular = traceBridgeBranch('banks', 'round', 4).find((path) => path.at(-1) === 'rack');
    handover.textContent = choice === 'bank-route' ? 'The regular route is marked. Sign at the turn post east of the rail, then go to the east rack.'
      : choice === 'light-plank' ? 'The light passage is marked just south of the rail. Use it and read the receipt by the east rack.'
      : ready && regular ? `A regular four-move trail still works: ${trail(regular)}. The fitted plank saves a marked move for a light packet. Crates use the regular route.`
      : '';
  }

  panel.append(
    h('h2', {}, 'A Plank on the Same Bank'),
    h('p', {}, 'Idris wants three marked moves for a small dispatch. Start and receiving rack are both on Oak bank in the model. Use any link in either direction. A trail visits each peg at most once.'),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Which links may be used' }, ...selectors),
    layout,
    h('div', { class: 'row' }, fold, ...unfold),
    folded,
    traces,
    handover,
    h('div', { class: 'row' }, ...dispatch),
  );
  render();
  return panel;
}
