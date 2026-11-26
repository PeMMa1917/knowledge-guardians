import type { GameController } from '../app/controller';
import {
  INCENTIVE_KITS, INCENTIVE_NAMES, INCENTIVE_PARTS, INCENTIVE_POLICIES, INCENTIVE_RECEIPTS, INCENTIVE_TRACES,
  activeIncentive, canCheckKit, checkedParts, incentiveAudited, incentivePhase, incentiveReport, kitChecked, readyForBell, traceSeen,
  type IncentiveAction, type IncentivePolicy, type IncentiveTrace,
} from '../domain/civicIncentive';
import { h } from './dom';
import './civicIncentive.css';

const TEXT: Record<IncentivePolicy, { label: string; case: string }> = {
  dispatch: { label: 'First-bell dispatch tags', case: 'The carrier can send lighter pieces early. A crew can set up a rail or a bench while it waits for the other half.' },
  kits: { label: 'Second-bell matched kits', case: 'Send each hook and foot together. A crew starts later and collects a working kit in one visit.' },
};

const RACK: Record<IncentiveTrace, string> = {
  'early-workshop': 'Rail shelf at first bell', 'early-dock': 'Bench rack at first bell',
  'late-workshop': 'Rail shelf at second bell', 'late-dock': 'Bench rack at second bell',
};

export type DispatchStation = 'board' | 'audit' | IncentiveTrace;
const stations = (['board', 'audit', ...INCENTIVE_TRACES] as const).map((station) => ({ id: `incentive-${station}`, station }));
export const incentiveStation = (id: string) => stations.find((entry) => entry.id === id);

export function civicIncentivePanel(station: DispatchStation, controller: GameController,
  sound: (key: string) => void, refreshWorld: () => void) {
  const report = h('div');
  const status = h('p', { 'aria-live': 'polite' });
  const button = (label: string, act: () => void, disabled = false) => h('button', { type: 'button', onclick: act, disabled }, label);

  function perform(action: IncentiveAction, note: string) {
    const failure = controller.dispatch(action).find((event) => event.kind === 'error');
    status.textContent = failure?.message ?? note;
    if (!failure) {
      refreshWorld();
      sound(action.type === 'CheckDispatchKit' ? 'sfx.complete' : 'sfx.click');
      draw();
      report.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
    }
  }

  function planButtons(standing = false) {
    return h('div', { class: 'row wrap', role: 'group', 'aria-label': standing ? 'Standing dispatch rule' : 'Dispatch target' },
      INCENTIVE_POLICIES.map((policy) => h('section', {},
        h('p', {}, TEXT[policy].case),
        button(`${standing ? 'Keep' : 'Post'} ${TEXT[policy].label.toLowerCase()}`, () => perform(
          { type: standing ? 'KeepDispatchTarget' : 'PublishDispatchTarget', policy },
          standing ? 'The kept tally is at its receiving rack.' : 'Lin has posted this target. The carrier is acting on this run’s rule.')))));
  }

  function printTarget(policy: IncentivePolicy, early: boolean) {
    const count = incentiveReport(policy).published;
    return h('section', { class: 'civic-incentive-print' }, h('h3', {}, TEXT[policy].label),
      h('p', {}, h('strong', {}, policy === 'dispatch' ? `${count} in the green`
        : early ? 'Second-bell tally open' : `${count} receipts closed`)),
      policy === 'dispatch' || !early
        ? h('div', { class: 'civic-incentive-marks', 'aria-hidden': 'true' }, Array.from({ length: count }, () => h('span')))
        : '',
      h('p', {}, policy === 'dispatch' ? 'A dispatch tag signed before first bell fills one mark on the target board.'
        : 'A receipt closes when a hook and its matching foot have arrived by second bell.'));
  }

  function showTrace(trace: IncentiveTrace, policy: IncentivePolicy) {
    const pieces = INCENTIVE_RECEIPTS[policy][trace];
    const read = traceSeen(controller.state.flags, trace);
    return [
      pieces.length
        ? h('ul', {}, pieces.map((part) => h('li', {}, INCENTIVE_NAMES[part])))
        : h('p', {}, 'The dockhand leaves the first-bell line empty. The crew is waiting for its joined kit.'),
      h('p', {}, trace.startsWith('early') && pieces.length
        ? 'The crew lays out this hook. It can mark the work area while the foot is still on the later cart.'
        : trace === 'late-workshop' && policy === 'dispatch'
          ? 'The slower cart now brings both feet to the workshop. Their marks point back to the two earlier hooks.'
          : trace.startsWith('late') ? 'Both matching marks are together at this rack.' : 'Check this rack before opening the later handover.'),
      button(read ? 'Receiving trace clipped' : 'Clip the receiving trace',
        () => perform({ type: 'CheckDispatchReceipt', trace }, 'The trace goes beside its bell and receiving place.'), read),
    ];
  }

  function draw() {
    const flags = controller.state.flags;
    const phase = incentivePhase(flags);
    const policy = activeIncentive(flags);
    if (station === 'board') {
      report.replaceChildren(h('p', {}, 'Lin has the same order for two Island crews. Each kit needs one hook and one marked foot. The dockhands will work to the target you post.'),
        !phase || phase === 'audited' ? planButtons() : h('p', {}, 'Take the signed manifest to Ivo at the Island workshop.'),
        policy ? printTarget(policy, phase === 'early') : '');
      return;
    }
    if (!policy) {
      report.replaceChildren(h('p', {}, 'The Island is waiting for Lin’s signed order.'));
      return;
    }
    if (station !== 'audit') {
      report.replaceChildren(...showTrace(station, policy));
      return;
    }
    const shown: HTMLElement[] = [printTarget(policy, phase === 'early')];
    if (phase === 'early') {
      shown.push(h('p', {}, 'Check the rail shelf here and the bench rack at Two-Tide Dock while the first bell holds.'),
        button('Call the second bell', () => perform({ type: 'CallDispatchBell' }, 'The later cart has reached the receiving racks.'), !readyForBell(flags)));
    }
    if (phase === 'late') {
      const parts = checkedParts(flags);
      shown.push(h('p', {}, policy === 'dispatch' ? 'The late cart is at the workshop rail shelf.'
        : 'The later kits are at the workshop rail shelf and the dock bench rack.'),
      h('div', { class: 'row wrap' }, INCENTIVE_KITS.map((kit) => h('section', {},
        h('h3', {}, kit === 'rail' ? 'Rail kit' : 'Bench kit'),
        h('ul', {}, INCENTIVE_PARTS[kit].map((part) => h('li', {}, `${INCENTIVE_NAMES[part]} · ${parts.includes(part) ? 'traced' : 'waiting'}`))),
        button(kitChecked(flags, kit) ? 'Pair checked' : `Fit the ${kit} hook and foot`,
          () => perform({ type: 'CheckDispatchKit', kit }, 'The matched marks check one working kit.'),
          kitChecked(flags, kit) || !canCheckKit(flags, kit))))));
    }
    const tested = INCENTIVE_POLICIES.filter((option) => incentiveAudited(flags, option));
    if (tested.length) shown.push(h('section', {}, h('h3', {}, 'Ivo’s matched receipts'), h('ul', {}, tested.map((option) => {
      const counts = incentiveReport(option);
      return h('li', {}, `${TEXT[option].label}: ${counts.published} on the target board. ${counts.earlyParts} separate pieces ready at first bell. ${counts.totalKits} matched kits by second bell.`);
    }))));
    if (phase === 'audited') {
      if (tested.length === 2) {
        shown.push(h('p', {}, 'Both runs used the same four pieces. The early rule gave crews a head start. The joined rule let each crew collect its working pair together. Which should the next crew plan around?'), planButtons(true));
      }
      const other = INCENTIVE_POLICIES.find((option) => option !== policy)!;
      shown.push(button(`Run again with ${TEXT[other].label.toLowerCase()}`,
        () => perform({ type: 'PublishDispatchTarget', policy: other }, 'Lin has cleared the practice racks. The same four pieces will go out under the new target.')));
    }
    const kept = flags['incentive.standing'];
    if (kept) shown.push(h('p', {}, kept === 'dispatch'
      ? 'The standing dispatch tally is at the early hook rack on the dock.'
      : 'The standing kit tally is beside the paired rail shelf in this workshop.'));
    report.replaceChildren(...shown);
  }
  draw();
  return h('div', {}, h('h2', {}, station === 'board' || station === 'audit' ? 'Ready by the Bell' : RACK[station]), report, status);
}
