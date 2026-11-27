import type { GameController } from '../app/controller';
import { ALIGN_CASES, ALIGN_GATE, type AlignmentCase } from '../content/mapAlignment';
import { SHEET_READERS, SHEET_RETURNS, SHEET_SCALES, readSheet, sheetMove, sheetRead, type SheetMove, type SheetPoint, type SheetReader, type SheetScale } from '../domain/mapAlignment';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './mapAlignment.css';

const SITE = { strip: 'Mina’s guide at the Landing', pair: 'Lark’s paired frame at the press' } as const;
const label = (mode: SheetScale) => mode === 'original' ? 'Original span' : 'Span set to the two pins';
const note = (pos: SheetPoint) => `${pos[0]} east, ${pos[1]} north`;

function overlay(readings: ReturnType<typeof sheetRead>) {
  const image = h('canvas', { width: 246, height: 246, 'aria-hidden': true });
  const g = image.getContext('2d');
  if (g) {
    const px = ([x, y]: SheetPoint) => [20 + x * 17, 222 - y * 17] as const;
    g.fillStyle = '#22304a';
    g.fillRect(0, 0, 246, 246);
    for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
      const [left, top] = px([x, y]);
      g.fillStyle = '#7793a4'; g.fillRect(left, top, 2, 2);
    }
    g.lineWidth = 2;
    for (const layer of ['fixed', 'placed'] as const) {
      g.strokeStyle = layer === 'fixed' ? '#98e7dc' : '#f6c58a';
      g.setLineDash(layer === 'fixed' ? [] : [4, 3]);
      g.beginPath(); g.moveTo(...px(readings[0][layer]));
      for (const row of readings.slice(1)) g.lineTo(...px(row[layer]));
      g.stroke(); g.setLineDash([]);
      for (const row of readings) {
        const [x, y] = px(row[layer]);
        if (layer === 'fixed') g.strokeRect(x - 6, y - 6, 12, 12);
        else { g.beginPath(); g.arc(x, y, 3, 0, 2 * Math.PI); g.stroke(); }
      }
    }
  }
  return h('figure', { class: 'alignment-chart' }, image,
    h('figcaption', {}, h('p', { class: 'fine' }, 'Squares mark the ground plan. Circles mark the movable sheet.'),
      h('ul', {}, ...readings.map(({ label: name, fixed, placed, gap }) => h('li', {}, h('strong', {}, `${name}. `),
        gap ? `${gap} grid ${gap === 1 ? 'step' : 'steps'} apart. Ground ${note(fixed)}. Sheet ${note(placed)}.` : `Aligned at ${note(fixed)}.`)))));
}

export function mapAlignmentPanel(place: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void) {
  const [station, slug] = place.split(':');
  let mode: SheetScale = 'span';
  const body = h('div'), status = h('p', { class: 'sr-only', role: 'status' });
  const panel = h('div', { class: 'alignment-panel', tabindex: -1 }, body, status);

  function control(record: AlignmentCase, id: string, text: string, action: SheetMove, message: string, disabled = false) {
    return h('button', { type: 'button', 'data-sheet-step': id, disabled, onclick: () => {
      if (!controller.check(ALIGN_GATE) || !controller.check({ card: record.card })) return;
      if (station === 'return' && !controller.check(specimenEquipped(record.key))) return;
      const effect = sheetMove(record.model, record.slug, controller.state.flags, action);
      if (!effect) return;
      const result = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
      if (result.some(({ kind }) => kind === 'error')) return;
      if (action.type === 'trial' || action.type === 'revisit') mode = action.mode;
      if (action.type === 'send' || action.type === 'receive' || action.type === 'place') refreshWorld();
      sound(action.type === 'place' || action.type === 'receive' ? 'sfx.sparkle' : 'sfx.pickup');
      render(); status.textContent = message;
      const ending = action.type === 'place' || action.type === 'receive'
        ? body.querySelector<HTMLElement>(`[data-sheet-result="${record.slug}"]`) : null;
      (ending ?? body.querySelector<HTMLElement>(`button[data-sheet-step="${id}"]:enabled`) ?? body.querySelector<HTMLElement>('button:enabled') ?? panel).focus();
    } }, text);
  }

  function trial(record: AlignmentCase) {
    const state = readSheet(record.slug, controller.state.flags);
    body.append(h('h2', {}, record.name), h('p', {}, record.stake));
    if (!controller.check({ card: record.card })) {
      body.append(h('p', {}, 'Read this case’s dated sheet, then turn the separate practice overlay.'));
      return;
    }
    body.append(h('p', { class: 'fine' }, record.evidence), h('p', {}, record.limit));
    if (!state.checked) {
      const positions = sheetRead(record.model, state.turns, state.pinned, 'span');
      body.append(h('p', {}, 'Slide the sheet’s gate mark onto the ground-plan pin. Turn the page on that pin until the post also lines up.'), overlay(positions),
        h('div', { class: 'row wrap' },
          control(record, 'pin', 'Slide onto the gate pin', { type: 'pin' }, 'The two gate marks coincide.', state.pinned),
          control(record, 'turn', 'Turn the overlay one quarter turn', { type: 'turn' }, 'The sheet turns about its gate mark.'),
          control(record, 'check', 'Hold both control marks', { type: 'check' }, 'The gate and post coincide at the adjusted span.', !state.pinned || positions[1].gap !== 0)));
      return;
    }
    body.append(h('div', { class: 'row wrap' }, ...SHEET_SCALES.map((check) => control(record, `trial-${check}`,
      check === 'original' ? 'Review the original span' : 'Review the two-pin span', { type: 'trial', mode: check }, label(check), !!state.reader || (state.trials.includes(check) && mode === check)))),
      h('h3', {}, label(mode)), overlay(sheetRead(record.model, state.turns, true, mode)));
    if (state.reader) {
      body.append(h('p', {}, state.received ? `The installed copy is at ${SITE[state.reader]}.` : `Fit your guide at ${SITE[state.reader]}.`));
      return;
    }
    if (state.trials.length === 2) body.append(h('div', { class: 'row wrap' }, ...SHEET_READERS.map((reader) => control(record, `send-${reader}`,
      reader === 'strip' ? 'Send a short guide to the Landing' : 'Send both overlays to the press', { type: 'send', reader }, `The guide is ready for ${SITE[reader]}.`))));
  }

  function receive(reader: SheetReader) {
    body.append(h('h2', {}, SITE[reader]));
    for (const record of ALIGN_CASES) {
      const state = readSheet(record.slug, controller.state.flags);
      if (state.reader !== reader) continue;
      const explanation = reader === 'strip' ? record.stripResult : record.pairResult;
      const readings = sheetRead(record.model, state.turns, true, 'span');
      body.append(h('section', { class: 'clue-view', tabindex: -1, 'data-sheet-result': record.slug }, h('h3', {}, record.name),
        reader === 'strip' ? h('div', {}, h('p', {}, 'The gate and the post align.'), h('p', {}, 'The far turn remains outside the guide.'))
          : h('div', {}, overlay(sheetRead(record.model, state.turns, true, 'original')), overlay(readings)),
        state.received ? h('p', {}, explanation) : control(record, `receive-${record.slug}`,
          reader === 'strip' ? 'Fit the guide up to the post' : 'Fit both sheets with the far turn visible', { type: 'receive', reader }, explanation)));
    }
    if (body.childElementCount === 1) body.append(h('p', {}, 'The hooks are clear for a guide from the alignment room.'));
  }

  function revisit(record: AlignmentCase) {
    const state = readSheet(record.slug, controller.state.flags);
    body.append(h('h2', {}, `Marek’s check of ${record.name}`));
    if (!state.received || !controller.check(specimenEquipped(record.key))) {
      body.append(h('p', {}, `Equip ${record.name} in the Bag to open Marek’s overlays.`));
      return;
    }
    body.append(h('p', {}, record.callback));
    if (!state.returned) body.append(h('div', { class: 'row wrap' }, ...SHEET_SCALES.map((check) => control(record, `revisit-${check}`,
      check === 'original' ? 'Check the new turn at original span' : 'Check it again at two-pin span', { type: 'revisit', mode: check }, label(check),
      state.returnTrials.includes(check) && mode === check))));
    if (state.returnTrials.length) body.append(overlay(sheetRead(record.model, state.turns, true, mode, true)));
    if (state.returned) {
      body.append(h('section', { class: 'clue-view', tabindex: -1, 'data-sheet-result': record.slug }, h('h3', {}, 'The installed route support'),
        h('p', {}, state.returned === 'tentative' ? record.nearResult : record.surveyResult)));
    } else if (state.returnTrials.length === 2) {
      body.append(h('div', { class: 'row wrap' }, ...SHEET_RETURNS.map((action) => control(record, `place-${action}`,
        action === 'tentative' ? 'Leave a guide that stops at the post' : 'Fit the separate third reading frame', { type: 'place', action },
        action === 'tentative' ? record.nearResult : record.surveyResult))));
    }
  }

  function render() {
    body.replaceChildren();
    if (station === 'strip' || station === 'pair') { receive(station); return; }
    const record = ALIGN_CASES.find((entry) => entry.slug === slug);
    if (!record) return;
    if (station === 'trial') trial(record);
    if (station === 'return') revisit(record);
  }
  render(); return panel;
}
