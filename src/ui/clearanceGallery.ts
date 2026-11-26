import type { GameController } from '../app/controller';
import { CLEARANCE_CASES, type ClearanceCase } from '../content/clearanceCases';
import { compareRail, type Rail, WIDE_RAIL } from '../domain/clearance';
import { h } from './dom';
import './clearanceGallery.css';

const RAIL_NAMES: Record<Rail, string> = { near: 'low rail', wide: 'wide rail' };
const RAILS: Rail[] = ['near', 'wide'];

export function clearanceGallery(controller: GameController, station: string, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'clearance-gallery' });
  const changes = (flag: string, value: string | boolean, step: string) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    refresh();
    render();
    const same = panel.querySelector<HTMLButtonElement>(`button[data-step="${step}"]:enabled`);
    const next = same ?? panel.querySelector<HTMLButtonElement>('button:enabled');
    (next ?? panel).focus();
  };
  panel.tabIndex = -1;
  const frame = (record: ClearanceCase, rail: Rail) => {
    const result = compareRail(record.span, rail);
    const tested = controller.state.flags[`${record.flag}.tested.${rail}`] === true;
    const use = `${record.flag}.tested.${rail}`;
    const percent = Math.round(result.scale * 100);
    return h('section', { class: 'clearance-frame' },
      h('h3', {}, rail === 'near' ? 'Low rail' : 'Wide rail'),
      h('div', {
        class: 'clearance-aperture', style: { width: `${result.aperture / WIDE_RAIL * 100}%` },
        'aria-hidden': 'true',
      }, tested ? h('span', { style: { width: `${Math.min(100, record.span / result.aperture * 100)}%` } }) : ''),
      h('p', { class: 'fine' }, tested
        ? (result.scale < 1 ? `The outline clears the frame at ${percent}% of the measured edge. Keep that scale on its guide.`
          : 'The measured edge clears this frame at its original scale.')
        : `${result.aperture} cm between the catches.`),
      h('button', { type: 'button', 'data-step': `fit-${rail}`, onclick: () => changes(use, true, `fit-${rail}`) }, tested ? `Check the ${RAIL_NAMES[rail]} again` : `Fit the ${RAIL_NAMES[rail]}`));
  };
  const readRail = (rail: Rail) => {
    const name = rail === 'near' ? 'Tavi’s reading tray' : 'Jase’s viewing bench';
    const hung = CLEARANCE_CASES.filter((record) => controller.state.flags[`${record.flag}.route`] === rail);
    return [
      h('h2', {}, name),
      hung.length ? null : h('p', {}, 'A blank note waits under the clip. Try the frames beside a collection stand first.'),
      ...hung.map((record) => {
        const seen = controller.state.flags[`${record.flag}.read`] === rail;
        const proofFlag = `${record.flag}.proof.${rail}`;
        const proof = controller.state.flags[proofFlag];
        const reply = proof === 'edge'
          ? `They run a finger along the ${record.edge} and can check ${record.span} cm against its scale.`
          : 'They put a blank space beside the traced edge and check the collection image for the remaining features.';
        return h('article', { class: 'clearance-reply' }, h('h3', {}, record.title),
          h('p', {}, record[rail]), h('p', { class: 'fine' }, `Collection reference ${record.accession} · ${record.edge} ${record.span} cm`),
          h('p', {}, 'There’s space in the clip for one slip. Which will you leave where the next reader can find it?'),
          h('div', { class: 'row' },
            h('button', { type: 'button', 'data-step': `${record.slug}-edge`, 'aria-pressed': String(proof === 'edge'), onclick: () => changes(proofFlag, 'edge', `${record.slug}-edge`) }, 'Slip with the measured edge'),
            h('button', { type: 'button', 'data-step': `${record.slug}-source`, 'aria-pressed': String(proof === 'source'), onclick: () => changes(proofFlag, 'source', `${record.slug}-source`) }, 'Slip for the open dimensions')),
          proof ? h('p', { class: 'fine', role: 'status' }, reply) : null,
          h('button', { type: 'button', 'data-step': record.slug, disabled: seen || !proof, onclick: () => changes(`${record.flag}.read`, rail, record.slug) }, seen ? 'Reply in my journal' : `Record the reply for ${record.accession}`));
      }),
    ];
  };
  const render = () => {
    if (station === 'near' || station === 'wide') {
      panel.replaceChildren(...readRail(station).filter((el) => el !== null));
      return;
    }
    const record = CLEARANCE_CASES.find(({ slug }) => slug === station);
    if (!record) return;
    const ready = RAILS.every((rail) => controller.state.flags[`${record.flag}.tested.${rail}`] === true);
    const route = controller.state.flags[`${record.flag}.route`];
    panel.replaceChildren(
      h('h2', {}, record.title),
      h('p', {}, `Fit the guide’s ${record.edge} of ${record.span} cm between two sets of catches. The object stays in its own case.`),
      h('div', { class: 'clearance-rails' }, ...RAILS.map((rail) => frame(record, rail))),
      h('p', { class: 'fine', role: 'status' }, route === 'near' || route === 'wide'
        ? `The guide is at the ${RAIL_NAMES[route]}. Visit the reader there.`
        : 'Tavi reads seated at the low rail. Jase can wait for the wider lane to clear.'),
      h('div', { class: 'row' }, ...RAILS.map((rail) =>
        h('button', { type: 'button', 'data-step': `leave-${rail}`, disabled: !ready, onclick: () => changes(`${record.flag}.route`, rail, `leave-${rail}`) }, `Leave the guide at the ${RAIL_NAMES[rail]}`))));
  };
  render();
  return panel;
}
