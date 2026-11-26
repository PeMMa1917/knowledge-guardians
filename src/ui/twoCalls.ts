import type { GameController } from '../app/controller';
import {
  CALL_LINES, hasDifferentProofs, layoutBit, readLayout, servesCalls, shiftCallLine, tryCallProof, tryCallReissue,
  type CallLayout, type CallReissue,
} from '../domain/twoCalls';
import { h } from './dom';
import './twoCalls.css';

const prefix = 'copies.twocalls.';
const copy = {
  entry: { name: 'Today’s entry rule', text: 'Readers can enter without a slip. Mina signed today’s rule.' },
  trial: { name: 'The dated trial', text: 'On Tuesday, the return line moved faster during the trial. See the Lending Clerk’s log.' },
  returns: { name: 'The returns step', text: 'Bring the book to the returns clerk inside.' },
};
const slots = ['Door top line', 'Door pocket', 'Runner strip'];
const part = {
  paired: 'The wider frame uses the remaining type. Each approach gets both directions. A source reader follows the locator to the archive.',
  staffed: 'The current approaches each get their own line. Mina keeps Tuesday’s full source in the door pocket during her shift.',
};

function printResult(result: ReturnType<typeof tryCallProof>, source = 'the door'): HTMLElement {
  return h('ul', { class: 'two-call-reports' },
    h('li', {}, result.newcomer ? 'The newcomer can find the entry rule.' : 'The newcomer turns back without the entry rule.'),
    h('li', {}, result.returner ? 'The return carrier reaches the clerk.' : 'The carrier still carries the book. The visible line did not say where to return it.'),
    h('li', {}, result.researcher ? `The source reader can recover the dated trial at ${source}.` : 'The old trial has no place the source reader can reach.'));
}

export function twoCallsPanel(controller: GameController, refresh: () => void, sound: () => void): HTMLElement {
  const panel = h('div', { class: 'two-calls' });
  const state = () => controller.state;
  const atPress = () => state().mapId === 'copies.press' && state().objectivesDone.includes(`${prefix}sources`);
  if (!atPress()) return panel;

  const flag = (name: string) => state().flags[prefix + name];
  function set(name: string, value: string | number | boolean) {
    if (!atPress()) return;
    controller.dispatch({ type: 'SetFlag', flag: prefix + name, value });
    refresh();
    sound();
  }
  const earlier = () => readLayout(flag('first'));
  const proofMask = () => Number(flag('tried') ?? 0);
  let layout: CallLayout = readLayout(flag('staffed')) ?? earlier() ?? CALL_LINES;
  const position = h('ol', { class: 'two-call-positions', 'aria-label': 'Three positions on the proof board' });
  const reports = h('div', { class: 'two-call-proof', tabindex: -1, 'aria-live': 'polite' });
  const status = h('p', { class: 'fine', role: 'status' });
  const controls = h('div', { class: 'row' });

  const testFirst = h('button', { type: 'button', onclick: () => {
    if (earlier()) return;
    const bit = layoutBit(layout);
    if (!(proofMask() & bit)) set('tried', proofMask() | bit);
    show('First call', printResult(tryCallProof(layout, 'first')));
    update();
  } }, 'Run this first proof');
  const saveFirst = h('button', { type: 'button', onclick: () => {
    if (earlier() || !hasDifferentProofs(proofMask()) || !(proofMask() & layoutBit(layout)) || !servesCalls(tryCallProof(layout, 'first'))) return;
    set('first', layout.join(','));
    show('First proof kept', printResult(tryCallProof(layout, 'first')));
    update();
  } }, 'Keep this first proof');
  const testAgain = h('button', { type: 'button', onclick: () => {
    const kept = earlier();
    if (!kept || flag('change') !== true) return;
    if (flag('countered') !== true) set('countered', true);
    show('The retained first proof at the later call', printResult(tryCallProof(kept, 'late')));
    update();
  } }, 'Test the first proof against the new arrivals');
  const testPaired = h('button', { type: 'button', onclick: () => {
    if (flag('countered') !== true || flag('plan')) return;
    const trial = tryCallReissue(layout, 'paired');
    if (servesCalls(trial.late)) set('paired', true);
    show('The wider frame at the later call',
      h('p', {}, part.paired),
      printResult(trial.late, 'the archive'),
      h('h3', {}, 'If the approaches change back'), printResult(trial.otherApproach, 'the archive'));
    update();
  } }, 'Try a wider runner frame');
  const testStaffed = h('button', { type: 'button', onclick: () => {
    if (flag('countered') !== true || flag('plan')) return;
    const trial = tryCallReissue(layout, 'staffed');
    if (servesCalls(trial.late)) set('staffed', layout.join(','));
    show('The old frame at the later call', printResult(trial.late, 'the door pocket'),
      h('p', {}, 'Mina can put the dated trial in the door pocket during her shift. The two moving readers depend on where their lines sit.'),
      h('h3', {}, 'If the approaches change back'), printResult(trial.otherApproach, 'the door pocket'));
    update();
  } }, 'Try these lines with a staffed pocket');
  const send = (mode: CallReissue, label: string) => h('button', { type: 'button', onclick: () => {
    const revised = readLayout(flag('staffed'));
    if (!flag('paired') || !revised || flag('plan')) return;
    if (mode === 'staffed') layout = revised;
    set('plan', mode);
    show('Repair ready for the landing', h('p', {}, part[mode]));
    update();
  } }, label);
  const sendPaired = send('paired', 'Send the wider frame');
  const sendStaffed = send('staffed', 'Send the staffed pocket');

  function show(title: string, ...elements: HTMLElement[]) {
    reports.replaceChildren(h('h3', {}, title), ...elements);
    reports.focus();
  }
  function drawPositions(focus?: CallLayout[number]) {
    const movable = !earlier() || flag('countered') === true && !flag('plan');
    position.replaceChildren(...layout.map((line, index) => {
      const move = (step: -1 | 1) => {
        layout = shiftCallLine(layout, index, step);
        update(line);
      };
      return h('li', { 'data-line': line },
        h('span', { class: 'fine' }, slots[index]),
        h('strong', {}, copy[line].name),
        h('p', {}, copy[line].text),
        movable ? h('div', { class: 'row' },
          h('button', { type: 'button', disabled: index === 0, 'aria-label': `Move ${copy[line].name} earlier`, onclick: () => move(-1) }, 'Earlier'),
          h('button', { type: 'button', disabled: index === layout.length - 1, 'aria-label': `Move ${copy[line].name} later`, onclick: () => move(1) }, 'Later')) : null);
    }));
    if (focus) position.querySelector<HTMLButtonElement>(`[data-line="${focus}"] button:not(:disabled)`)?.focus();
  }

  function update(focus?: CallLayout[number]) {
    const kept = earlier();
    if (firstDetails.hidden && kept) {
      firstDetails.hidden = false;
      firstDetails.append(h('p', {}, kept.map((line, i) => `${slots[i]} — ${copy[line].name}`).join('. ')),
        printResult(tryCallProof(kept, 'first')));
    }
    const changed = flag('change') === true;
    const retested = flag('countered') === true;
    const plan = flag('plan');
    const both = flag('paired') === true && !!readLayout(flag('staffed'));
    if (!kept) {
      controls.replaceChildren(testFirst, saveFirst);
      saveFirst.disabled = !hasDifferentProofs(proofMask()) || !(proofMask() & layoutBit(layout)) || !servesCalls(tryCallProof(layout, 'first'));
      status.textContent = hasDifferentProofs(proofMask()) ? 'Two different proofs are on the board. Keep a tested one that reaches the first three readers.'
        : 'Try more than one arrangement. Mina’s readers need different lines from the same two holders.';
    } else if (!changed) {
      controls.replaceChildren();
      status.textContent = 'The first proof stays on file. Take it to Mina at the landing before trying a second arrangement.';
    } else if (!retested) {
      controls.replaceChildren(testAgain);
      status.textContent = 'The reader routes have changed. Test the same layout before moving its lines.';
    } else {
      controls.replaceChildren(testPaired, testStaffed, sendPaired, sendStaffed);
      testPaired.disabled = testStaffed.disabled = !!plan;
      sendPaired.disabled = sendStaffed.disabled = !both || !!plan;
      if (plan) status.textContent = 'Take the fitted copy to the handcart at the landing. The retained first proof can still be consulted.';
      else status.textContent = both ? 'Both repairs serve the later call. Decide whether to print broad directions or keep the source close.'
        : 'Try the wider frame. Move the lines to try the staffed pocket. Both repairs have room for the same three requests in different ways.';
    }
    drawPositions(focus);
  }

  const firstDetails = h('details', { hidden: true }, h('summary', {}, 'Read the retained first proof'));

  panel.append(h('h2', {}, 'Two Calls After Tuesday'),
    h('p', {}, 'Set the three lines in the two holders. Try what each reader can use at the call.'),
    firstDetails, position, controls, status, reports);
  update();
  return panel;
}
