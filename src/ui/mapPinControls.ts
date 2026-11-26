import type { GameController } from '../app/controller';
import { FOLLOW_PIN, mapPinKey, PIN_PURPOSES, readMapPin, writeMapPin, type MapPin, type PinPurpose } from '../domain/mapPins';
import { MAPS } from '../maps';
import { h } from './dom';

export function mapPinControls(controller: GameController, mapId: string, redraw: (pin?: MapPin) => void): HTMLElement {
  const map = MAPS[mapId];
  const panel = h('div', { class: 'map-pin-controls' });
  const purpose = h('select', { 'aria-label': 'Reason for the mark' }, ...Object.entries(PIN_PURPOSES).map(([id, text]) => h('option', { value: id }, text)));
  const write = (flag: string, value: string) => controller.dispatch({ type: 'SetFlag', flag, value });
  const update = (focus?: 'mark' | 'follow') => {
    const flags = controller.state.flags;
    const pin = readMapPin(flags, mapId, map.width, map.height);
    const following = flags[FOLLOW_PIN] === mapId;
    if (pin) purpose.value = pin.purpose;
    redraw(pin);
    const mark = h('button', { type: 'button', onclick: markHere }, pin ? 'Move mark here' : 'Mark this spot');
    const follow = pin ? h('button', {
      type: 'button', 'aria-pressed': String(following), onclick: () => { write(FOLLOW_PIN, following ? '' : mapId); update('follow'); },
    }, 'Compass follows mark') : null;
    const remove = pin ? h('button', {
      type: 'button', onclick: () => { write(mapPinKey(mapId), ''); if (following) write(FOLLOW_PIN, ''); update('mark'); },
    }, 'Remove mark') : '';
    const other = Object.values(MAPS).filter((entry) => entry.id !== mapId && readMapPin(flags, entry.id, entry.width, entry.height));
    panel.replaceChildren(h('div', { class: 'row' }, purpose, mark, follow, remove),
      h('p', { class: 'fine', role: 'status' }, pin ? `${PIN_PURPOSES[pin.purpose]} · ${following ? 'Compass points here.' : 'Marked on this map.'}` : 'Mark where you are to find it again.'),
      other.length ? h('details', {}, h('summary', {}, 'Other marked places'), h('ul', {}, ...other.map(({ name }) => h('li', {}, name)))) : '');
    if (focus) (focus === 'follow' && follow ? follow : mark).focus();
  };
  const markHere = () => {
    const { pos } = controller.state;
    write(mapPinKey(mapId), writeMapPin({ ...pos, purpose: purpose.value as PinPurpose }));
    write(FOLLOW_PIN, mapId);
    update('mark');
  };
  update();
  return panel;
}
