import { playNotes } from '../app/ambience';
import { guestInstrument, instrumentsByKind, type Piece } from '../domain/lanternInstruments';
import { h } from './dom';

export function lanternInstrument(person: string, order: Piece[], pin: (piece: Piece) => void, volume: number) {
  const kit = guestInstrument(person)!;
  const tool = instrumentsByKind[kit.kind];
  const bar = h('ol', { class: 'lantern-rack', 'aria-label': tool.title }, ...tool.slots.map((label, i) => {
    const piece = order[i];
    return h('li', { class: piece === undefined ? 'empty' : 'filled' }, h('small', {}, label),
      h('strong', {}, piece === undefined ? 'Open' : kit.pieces[piece].label));
  }));
  const buttons = kit.pieces.map((piece, i) => h('button', { type: 'button', 'data-lantern-piece': i,
    'aria-pressed': String(order.includes(i as Piece)), onclick: () => pin(i as Piece) }, tool.verb + ' · ' + piece.label));
  const box = h('fieldset', { class: 'guest-instrument instrument-' + kit.kind }, h('legend', {}, tool.title), h('p', {}, tool.task),
    bar, h('div', { class: 'lantern-controls' }, buttons), h('div', { class: 'lantern-observations', 'aria-live': 'polite' },
      order.map((i) => h('p', {}, h('strong', {}, kit.pieces[i].label + ' · '), kit.pieces[i].reading))));
  if (kit.kind === 'score' && order.length) box.append(h('button', { type: 'button', onclick: () =>
    playNotes(order.map((p, i) => ({ f: [330, 440, 554][p], at: i * 2, beats: p === 2 ? 1.5 : 1 })), .3, 'marimba', volume) }, 'Play the cue tones'));
  return box;
}
