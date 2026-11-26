import type { GameController } from '../app/controller';
import { ISLAND_CART_SLOTS, ISLAND_PROOF_KEYS, ISLAND_PROOF_ROUTES, ISLAND_PROOF_TRIALS, ISLAND_SLEEVE_LIMIT, islandProofFlag,
  proofManifest, proofScalePrint, type IslandPrint, type IslandProofCase, type IslandProofRoute } from '../domain/islandProofRack';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './islandProofRack.css';

const controls: Record<IslandProofCase, [string, string]> = {
  'paired-views': ['Load each card as a job', 'Clip both views to their common accession'],
  'scale-bar': ['Lay out the smaller practice print', 'Lay out the larger practice print'],
};
const choices: Record<IslandProofCase, [string, string]> = {
  'paired-views': ['Give the spare cart slot to the tide sheets', 'Keep the two envelopes in one job and hold the spare slot for the wet copy'],
  'scale-bar': ['Fit a measured sleeve at the dock', 'Leave both measurements at the staffed check stand'],
};
const openings: Record<IslandProofCase, [string, string]> = {
  'paired-views': [
    'Ivo shows the two work cards for USNM PAL 160174. Smithsonian calls the photographed surfaces part and counterpart. They belong to its one accession from the Simití Formation in Antioquia, Colombia.',
    'Ivo has room for three jobs in the practice cart. The two view cards reached the board on separate hooks. Mount both versions and see what each takes up.',
  ],
  'scale-bar': [
    'USNM PAL 247790 was collected at Chimbote, Peru, in 1961. The Smithsonian image captions give a 200-micrometre scale for the external valve views. The record leaves a named species open.',
    'Ivo made two fictional sample prints to test whether a copy will fit Joss’s measured sleeve. Each print has a 200-micrometre reference bar. Compare the model outline to its own bar before the loader uses it.',
  ],
};
const routes: Record<IslandProofCase, Record<IslandProofRoute, string>> = {
  'paired-views': { dock: 'Joss keeps the cart tally by the pier at Two-Tide Dock.', margin: 'Ivo keeps the one-job tray on the west boardwalk at Quiet Margin.' },
  'scale-bar': { dock: 'Joss keeps the measured sleeve beside the loading card at Two-Tide Dock.', margin: 'Ivo keeps the two matched prints at the low stand on the east boardwalk at Quiet Margin.' },
};

function manifestView(grouped: boolean): HTMLElement {
  const jobs = proofManifest(grouped);
  const open = ISLAND_CART_SLOTS - jobs.length;
  return h('div', {}, h('h3', {}, grouped ? 'Count by accession and job' : 'Count by card'),
    h('p', {}, `${jobs.length} of ${ISLAND_CART_SLOTS} slots occupied. ${open ? 'One slot left.' : 'Cart full.'}`),
    h('ol', { class: 'island-proof-slots' }, ...jobs.map((label) => h('li', {}, label)), open ? h('li', {}, 'Spare slot') : null));
}

function scaleView(print: IslandPrint): HTMLElement {
  const { outline, bar, modelDistance, fits } = proofScalePrint(print);
  return h('div', {}, h('h3', {}, print === 'small' ? 'Smaller practice print' : 'Larger practice print'),
    h('div', { class: 'island-proof-scale', 'aria-hidden': 'true' },
      h('span', { style: { width: `${outline / 4}ch` } }), h('i', { style: { width: `${bar / 4}ch` } })),
    h('p', {}, `Outline ${outline} mm on this print. Bar ${bar} mm on this print. The model outline spans ${modelDistance} µm. ${fits ? 'Fits' : 'Too wide for'} the ${ISLAND_SLEEVE_LIMIT} µm practice sleeve.`));
}

export function islandProofRackPanel(id: IslandProofCase, c: GameController, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'island-proof-rack' });
  const equipped = () => c.check(specimenEquipped(ISLAND_PROOF_KEYS[id]));
  if (!equipped()) return panel;
  const trials = ISLAND_PROOF_TRIALS[id];
  const observed = (trial: string) => c.state.flags[islandProofFlag(id, `try.${trial}`)] === true;
  const output = h('div', { 'aria-live': 'polite' });
  const notice = h('p', { role: 'status' });
  const setFlag = (part: string, value: boolean | string) => c.dispatch({ type: 'SetFlag', flag: islandProofFlag(id, part), value });
  const test = controls[id].map((label, index) => h('button', { type: 'button', onclick: () => {
    if (!equipped()) return;
    setFlag(`try.${trials[index]}`, true);
    sound('sfx.page');
    render();
  } }, label));
  const dispatch = choices[id].map((label, index) => h('button', { type: 'button', onclick: () => {
    if (!equipped() || !trials.every(observed) || c.state.flags[islandProofFlag(id, 'served')]) return;
    setFlag('plan', ISLAND_PROOF_ROUTES[index]);
    sound('sfx.page');
    render();
    refresh();
  } }, label));

  function render() {
    const plan = c.state.flags[islandProofFlag(id, 'plan')];
    const served = c.state.flags[islandProofFlag(id, 'served')];
    const rendered = trials.map((trial, index) => !observed(trial) ? null : id === 'paired-views'
      ? manifestView(index === 1) : scaleView(index === 0 ? 'small' : 'large'));
    output.replaceChildren(...rendered.filter((entry) => entry !== null));
    dispatch.forEach((button, index) => { button.disabled = !trials.every(observed) || Boolean(served) || plan === ISLAND_PROOF_ROUTES[index]; });
    notice.textContent = plan === 'dock' || plan === 'margin' ? `${served ? 'Receipt kept. ' : ''}${routes[id][plan]}` : '';
  }

  const source = c.pack.sources.find(({ id: sourceId }) => sourceId === (id === 'paired-views'
    ? 'HIS-REFERENCE-LINE-ANTIOQUIA-PAIR' : 'HIS-REFERENCE-LINE-CHIMBOTE-VALVE'));
  const catalogue = source ? h('details', {}, h('summary', {}, 'Read the exact museum record'),
    h('p', {}, id === 'paired-views' ? 'The Smithsonian credits the photograph to Mark Florence. Its image entry calls the views part and counterpart.'
      : 'The Smithsonian credits the micrographs to R. H. Benson. The scale belongs to the external view in the image record.'),
    h('a', { href: source.url, target: '_blank', rel: 'noreferrer noopener' }, 'Open the Smithsonian record through GBIF')) : null;
  panel.append(h('h2', {}, id === 'paired-views' ? 'Two Cards, One Cart Job' : 'A Sleeve with Room for a Name'),
    ...openings[id].map((line) => h('p', {}, line)), ...(catalogue ? [catalogue] : []), h('div', { class: 'row' }, ...test), output,
    h('div', { class: 'row' }, ...dispatch), notice);
  render();
  return panel;
}
