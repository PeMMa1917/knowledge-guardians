import type { GameController } from '../app/controller';
import {
  JOINED_CLOTH_DESTINATION, JOINED_CLOTH_KEY, JOINED_CLOTH_SOURCE, JOINED_CLOTH_USED,
  JOINT_LOADS, JOINT_STOP, JOINT_SUPPORTS, JOINT_USES, PACKET_WEIGHT,
  comparedJointTrials, jointReceipt, jointTrial, jointTrialFlag, type JointLoad, type JointSupport,
} from '../domain/joinedCloth';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './joinedCloth.css';

const SUPPORTS = { beam: 'Shared beam', separate: 'One support under each panel' } as const;
const LOADS = { centre: 'Centre mark', edge: 'Outer mark' } as const;

function printTrial(support: JointSupport, load: JointLoad) {
  const result = jointTrial(support, load);
  return `The join moves ${result.travel} ${result.travel === 1 ? 'tick' : 'ticks'}. ${result.clears ? 'The packet clears the pin.' : 'The cover catches on the pin.'}`;
}

function frame(support: JointSupport, load: JointLoad, measured: boolean) {
  const measuredTravel = measured ? jointTrial(support, load).travel : undefined;
  return h('div', {},
    h('div', { class: 'joined-frame', 'aria-hidden': 'true' },
      h('div', { class: 'joined-panels' }, h('div'), h('div')),
      h('span', { class: `joined-packet joined-${load}` }),
      h('div', { class: `joined-support joined-${support}` }, h('span'), support === 'separate' ? h('span') : null)),
    h('p', { class: 'fine' }, `${SUPPORTS[support]}. Same ${PACKET_WEIGHT}-unit packet at the ${LOADS[load].toLowerCase()}.`),
    measuredTravel === undefined ? null : h('div', { class: 'joined-travel', 'aria-hidden': 'true' },
      ...[0, 1, 2, 3, 4, 5].map((tick) => h('span', { class: `${tick === JOINT_STOP ? 'joined-pin' : ''} ${tick === measuredTravel ? 'joined-measured' : ''}` }, String(tick)))));
}

export function joinedClothPanel(controller: GameController, place: string, sound: (key: string) => void, refresh: () => void) {
  const panel = h('div', { class: 'joined-cloth' });
  const flags = () => controller.state.flags;
  function set(flag: string, value: boolean | string) {
    controller.dispatch({ type: 'SetFlag', flag, value });
    refresh();
  }

  if (place === 'frame') {
    if (!controller.check(specimenEquipped(JOINED_CLOTH_KEY))) return panel;
    const source = controller.pack.sources.find(({ id }) => id === JOINED_CLOTH_SOURCE);
    let support: JointSupport = 'beam';
    let load: JointLoad = 'centre';
    const diagram = h('div');
    const trials = h('div', { class: 'joined-trials' });
    const result = h('p', { role: 'status' });
    const setSupport = JOINT_SUPPORTS.map((next) => h('button', { type: 'button', onclick: () => {
      support = next;
      result.textContent = '';
      sound('sfx.click');
      paint();
    } }, next === 'beam' ? 'Fit the shared beam' : 'Fit the two separate supports'));
    const movePacket = JOINT_LOADS.map((next) => h('button', { type: 'button', onclick: () => {
      load = next;
      result.textContent = '';
      sound('sfx.click');
      paint();
    } }, `Move packet to ${LOADS[next].toLowerCase()}`));
    const send = (['rack', 'ledge'] as const).map((next) => h('button', { type: 'button', onclick: () => {
      if (!comparedJointTrials(flags()) || flags()[JOINED_CLOTH_DESTINATION]) return;
      set(JOINED_CLOTH_DESTINATION, next);
      sound('sfx.page');
      result.textContent = next === 'rack' ? 'Take the marked slip to the covered rack in the Plan Workshop.' : 'Take the marked slip to the east ledge and check the two supports there.';
      result.tabIndex = -1;
      result.focus();
      paint();
    } }, next === 'rack' ? 'Send the one-beam setup to the covered rack' : 'Send the separate supports to the east ledge'));
    function paint() {
      diagram.replaceChildren(frame(support, load, flags()[jointTrialFlag(support, load)] === true));
      setSupport.forEach((button, index) => button.setAttribute('aria-pressed', String(JOINT_SUPPORTS[index] === support)));
      movePacket.forEach((button, index) => button.setAttribute('aria-pressed', String(JOINT_LOADS[index] === load)));
      send.forEach((button) => { button.disabled = !comparedJointTrials(flags()) || !!flags()[JOINED_CLOTH_DESTINATION]; });
      trials.replaceChildren(...JOINT_SUPPORTS.map((kind) => h('section', { class: 'clue-view' }, h('h3', {}, SUPPORTS[kind]),
        ...JOINT_LOADS.map((at) => h('p', { class: 'fine' }, `${LOADS[at]}. ${flags()[jointTrialFlag(kind, at)] ? printTrial(kind, at) : 'Waiting for a transfer.'}`)))));
    }
    panel.append(h('h2', {}, 'The Two Supports'),
      h('p', {}, 'Cleveland records this joined tapa cloth from Hawaiʻi before 1930. The two pieces together measure 31.2 × 20.7 cm. The catalogue says probably paper mulberry bark. Separate piece sizes and seam strength remain open.'));
    if (source) panel.append(h('p', { class: 'fine' }, h('a', { href: source.url, target: '_blank', rel: 'noopener' }, 'Cleveland Museum of Art · 1971.160')));
    panel.append(h('p', {}, `The dock crew made this plain practice cover from two blank panels. The join can move up to ${JOINT_STOP} ticks before the pin catches it. Move the same packet across each support layout.`),
      h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Panel support' }, setSupport),
      h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Packet position' }, movePacket), diagram,
      h('button', { type: 'button', class: 'primary', onclick: () => {
        set(jointTrialFlag(support, load), true);
        result.textContent = printTrial(support, load);
        sound('sfx.page');
        paint();
      } }, 'Slide the model packet forward'), result, trials,
      h('p', { class: 'fine' }, 'The covered rack keeps its packet centred and uses one crew member. The east ledge takes the packet beside a post and needs a person at each support.'),
      h('div', { class: 'row wrap' }, send));
    paint();
    return panel;
  }

  if ((place !== 'rack' && place !== 'ledge') || flags()[JOINED_CLOTH_DESTINATION] !== place || !comparedJointTrials(flags())) return panel;
  const setup = JOINT_USES[place];
  const rack = place === 'rack';
  let measured = flags()[JOINED_CLOTH_USED] === place;
  let load: JointLoad = flags()[JOINED_CLOTH_USED] === place ? setup.load : rack ? 'edge' : 'centre';
  const diagram = h('div');
  const accepted = rack
    ? 'A single runner brings the packet to the covered rack. Both draft sheets now lie flat where the next planner can retrieve them.'
    : 'Both dock hands keep their own support in place while the packet clears the post. The outside shelf now holds the cover ready for the next side delivery.';
  const result = h('p', { role: 'status' }, flags()[JOINED_CLOTH_USED] === place ? accepted : '');
  const movePacket = JOINT_LOADS.map((next) => h('button', { type: 'button', onclick: () => {
    load = next;
    measured = false;
    result.textContent = '';
    sound('sfx.click');
    paint();
  } }, `Move packet to ${LOADS[next].toLowerCase()}`));
  function paint() {
    diagram.replaceChildren(frame(setup.support, load, measured));
    movePacket.forEach((button, index) => button.setAttribute('aria-pressed', String(JOINT_LOADS[index] === load)));
  }
  panel.append(h('h2', {}, rack ? 'The covered rack' : 'The east ledge'),
    h('p', {}, rack ? 'The workshop runner takes the middle lane to the dry rack. The guide calls for the shared beam and a centred packet.'
      : 'The centre lane ends against a dock post. Both dock hands have placed separate supports. They take the packet from the outer mark.'),
    h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Receiving packet position' }, movePacket), diagram,
    h('button', { type: 'button', class: 'primary', onclick: () => {
      const delivery = jointReceipt(place, load);
      measured = true;
      if (delivery.arrives) {
        set(JOINED_CLOTH_USED, place);
        sound('sfx.sparkle');
        result.textContent = `${printTrial(setup.support, load)} ${accepted}`;
      } else {
        sound('sfx.page');
        result.textContent = delivery.clears ? 'The cover clears its pin on the table. At this mark the packet faces the dock post, away from the receiving shelf.'
          : printTrial(setup.support, load);
      }
      paint();
    } }, 'Run the receiving transfer'), result);
  paint();
  return panel;
}
