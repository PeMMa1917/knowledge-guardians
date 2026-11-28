import type { GameController } from '../app/controller';
import { PRISM_CARD, PRISM_KEY, PRISM_AVAILABLE } from '../content/prismViewer';
import { PRISM_ACCESS, PRISM_LENSES, PRISM_PIXELS, PRISM_RENDERINGS, PRISM_SIZE, prismColour, prismMove, prismProgress, prismTone,
  type PrismAccess, type PrismLens, type PrismMove } from '../domain/prismViewer';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './prismViewer.css';

const BAND = ['0.9 µm (short)', '2.0 µm (middle)', '4.44 µm (long)'] as const;
const DEST = { seam: 'Nell’s low drying rack', dots: 'Venn’s window tracing table' } as const;
const ACCESS = { key: 'The key puts a line over long-band marks and a dot over short-band marks. A reader can follow either shape with the colour view still in place.',
  grey: 'The greyscale holder shows where any band reads strongly. The readings below name which band supplies each mark.' } as const;
const pointName = (i: number) => `${String.fromCharCode(65 + i % PRISM_SIZE)}${1 + Math.floor(i / PRISM_SIZE)}`;

function plate(lens: PrismLens, selected: number, setSample: (index: number) => void, access?: PrismAccess) {
  const rendering = PRISM_RENDERINGS[lens];
  const sample = h('p', { class: 'fine', role: 'status' });
  const cells = PRISM_PIXELS.map((pixel) => {
    const shade = access === 'grey' ? [prismTone(pixel), prismTone(pixel), prismTone(pixel)] : prismColour(pixel, lens);
    const symbol = `${access === 'key' && pixel[2] >= 3 ? '–' : ''}${access === 'key' && pixel[0] >= 3 ? '•' : ''}`;
    return h('span', { style: `background-color: rgb(${shade.join(',')})` }, symbol);
  });
  const reading = (i: number) => {
    sample.textContent = `${pointName(i)}. ${PRISM_PIXELS[i].map((value, index) => `${BAND[index]} reads ${value}`).join(' · ')}.`;
    cells.forEach((cell, index) => cell.classList.toggle('prism-sample', index === i));
  };
  reading(selected);
  const grid = h('div', { class: 'prism-grid', 'aria-hidden': true }, ...cells);
  const picker = h('select', { 'aria-label': 'Sample square', onchange: (event: Event) => {
    const index = Number((event.target as HTMLSelectElement).value);
    setSample(index);
    reading(index);
  } }, ...PRISM_PIXELS.map((_, index) => h('option', { value: String(index), selected: index === selected }, pointName(index))));
  const options = access === 'grey' ? 'Brighter grey means at least one band reads strongly.' : BAND.map((band, i) => `${band} → ${rendering.labels[i]}`).join(' · ');
  const method = access === 'key' ? 'Stroke: strong long-band mark. Dot: strong short-band mark.' : '';
  return h('figure', { class: 'prism-plate' }, grid, h('figcaption', {}, h('p', {}, options), method ? h('p', {}, method) : null,
    h('label', {}, 'Inspect a sample ', picker), sample));
}

export function prismViewerPanel(place: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void) {
  let selectedLens: PrismLens | undefined;
  let selectedAccess: PrismAccess | undefined;
  let sample = 14;
  const body = h('div'), status = h('p', { role: 'status', class: 'sr-only' });
  const panel = h('div', { class: 'prism-panel', tabindex: -1 }, body, status);
  const display = (lens: PrismLens, access?: PrismAccess) => plate(lens, sample, (index) => { sample = index; }, access);

  function control(id: string, label: string, move: PrismMove, message: string, disabled = false) {
    return h('button', { type: 'button', 'data-prism-step': id, disabled, onclick: () => {
      if (!controller.check(PRISM_AVAILABLE) || !controller.check({ card: PRISM_CARD })) return;
      if (place === 'access' && !controller.check(specimenEquipped(PRISM_KEY))) return;
      const effect = prismMove(controller.state.flags, move);
      if (!effect) return;
      const result = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
      if (result.some(({ kind }) => kind === 'error')) return;
      if (move.kind === 'view') selectedLens = move.lens;
      if (move.kind === 'preview') selectedAccess = move.method;
      sound(move.kind === 'fit' || move.kind === 'install' ? 'sfx.sparkle' : 'sfx.pickup');
      if (move.kind === 'send' || move.kind === 'fit' || move.kind === 'install') refreshWorld();
      render(); status.textContent = message;
      const resultNode = move.kind === 'install' || move.kind === 'fit' ? body.querySelector<HTMLElement>('[data-prism-result]') : null;
      (resultNode ?? body.querySelector<HTMLElement>(`button[data-prism-step="${id}"]:enabled`) ?? body.querySelector<HTMLElement>('button:enabled') ?? panel).focus();
    } }, label);
  }

  function render() {
    body.replaceChildren();
    if (!controller.check({ card: PRISM_CARD })) {
      body.append(h('p', {}, 'Read the dated Webb image by the practice viewer.'));
      return;
    }
    const state = prismProgress(controller.state.flags);
    if (place === 'access') {
      body.append(h('h2', {}, 'The dim reading light'));
      if (!controller.check(specimenEquipped(PRISM_KEY))) {
        body.append(h('p', {}, 'Use Webb’s Tarantula Nebula image from the Bag to unlock these supports.'));
        return;
      }
      const method = state.access ?? selectedAccess;
      body.append(h('p', {}, 'The Study’s light is dim. The next reader wants to check which band makes a mark without having to name its colour.'));
      if (!state.access) body.append(h('div', { class: 'row wrap' }, ...PRISM_ACCESS.map((option) => control(`preview-${option}`,
        option === 'key' ? 'Try the shape key' : 'Try a greyscale display', { kind: 'preview', method: option }, ACCESS[option], method === option))));
      if (method) body.append(h('section', { class: 'clue-view', tabindex: -1, 'data-prism-result': '' }, h('h3', {}, state.access ? 'The fitted display' : 'The display at the dim light'),
        h('p', {}, ACCESS[method]), display('seam', method)));
      if (!state.access && state.consulted.length === 2) body.append(h('div', { class: 'row wrap' }, ...PRISM_ACCESS.map((option) => control(`install-${option}`,
        option === 'key' ? 'Fit the shape key' : 'Fit the greyscale holder', { kind: 'install', method: option }, ACCESS[option]))));
      return;
    }
    if (place === 'seam' || place === 'dots') {
      const lens = place;
      const fitted = state.fitted.includes(lens);
      const task = lens === 'seam'
        ? 'Nell follows the cyan seam to cut a single continuous support. The brighter isolated pinholes stay on Venn’s separate view.'
        : 'Venn lifts three short-band pinhole marks into the dispatch. The paler seam stays available at Nell’s rack.';
      const cost = state.first === 'seam'
        ? 'The seam support dries this turn. Venn borrows the copying hand to hold the bright view until the dispatch is ready.'
        : 'The three marks make the first dispatch. Nell uses an extra drying peg while waiting for the other holder.';
      body.append(h('h2', {}, DEST[lens]), display(lens));
      if (fitted) body.append(h('section', { class: 'clue-view', tabindex: -1, 'data-prism-result': '' }, h('h3', {}, 'The fitted holder'), h('p', {}, task), h('p', {}, cost)));
      else body.append(control(`fit-${lens}`, lens === 'seam' ? 'Set the seam view in the low rack' : 'Fit the pinhole view for tracing',
        { kind: 'fit', lens }, task, !state.first || (state.first !== lens && !state.fitted.includes(state.first))));
      return;
    }
    body.append(h('h2', {}, 'The three-band viewer'), h('p', {}, 'The Webb mosaic uses assigned colours for measurements outside human vision. The three filter strips on this bench have their own readings. Nell is holding the support together with her thumb. Venn can see three pinholes through it. Which holder will you fit first?'),
      h('div', { class: 'row wrap' }, ...PRISM_LENSES.map((lens) => control(`view-${lens}`, lens === 'seam' ? 'Turn up the long band in cyan' : 'Turn up the short band in amber',
        { kind: 'view', lens }, `${PRISM_RENDERINGS[lens].name}. The three source values stay fixed.`, selectedLens === lens))));
    if (selectedLens) body.append(h('section', { class: 'clue-view' }, h('h3', {}, PRISM_RENDERINGS[selectedLens].name), display(selectedLens)));
    if (state.first) body.append(h('p', {}, state.fitted.length === 2 ? 'Both readers have their own fitted view.' :
      state.fitted.length ? `The first view is in use. Walk to ${DEST[PRISM_LENSES.find((lens) => lens !== state.first)!]} to fit the other.` : `Take the first view to ${DEST[state.first]}.`));
    else if (state.viewed.length === 2) body.append(h('div', { class: 'row wrap' }, ...PRISM_LENSES.map((lens) =>
      control(`send-${lens}`, lens === 'seam' ? 'Send Nell’s seam view first' : 'Send Venn’s pinhole view first', { kind: 'send', lens }, `The first holder is at ${DEST[lens]}.`))));
  }
  render(); return panel;
}
