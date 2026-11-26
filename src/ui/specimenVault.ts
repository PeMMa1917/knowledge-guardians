import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import { carriesSpecimen, carriedSpecimenCount, hasSpecimen, ownsSpecimen, SPECIMEN_CAPACITY, type SpecimenExhibit } from '../domain/specimenGear';
import { h } from './dom';
import { artURL, BIG_ART } from './illustrations';
import './specimenVault.css';

const PAGE = 12;

export function specimenThumbnail(record: SpecimenExhibit) {
  const image = h('img', { alt: '', src: artURL(BIG_ART[record.art] ?? record.art) });
  if (record.specimen.pixelAsset) void specimenArt(record.specimen.pixelAsset).then((imageData) => {
    if (imageData && image.isConnected) image.src = imageData.toDataURL('image/png');
  });
  return image;
}

export function specimenVault(controller: GameController, refresh: () => void) {
  const panel = h('section', { class: 'specimen-vault' });
  const owned = controller.pack.exhibits.filter(hasSpecimen).filter(({ specimen }) => ownsSpecimen(controller.state, specimen.key));
  const count = h('p', { role: 'status' });
  const display = h('div', { class: 'specimen-cases' });
  const carried = h('div', { class: 'specimen-cases' });
  const previous = h('button', { type: 'button', onclick: () => { page--; show(); } }, 'Previous displays');
  const next = h('button', { type: 'button', onclick: () => { page++; show(); } }, 'More displays');
  const position = h('span', { 'aria-live': 'polite' });
  let page = 0;
  const move = (record: SpecimenExhibit, carry: boolean) => {
    const events = controller.dispatch({ type: 'CarrySpecimen', key: record.specimen.key, carry });
    if (events.some(({ kind }) => kind === 'error')) return;
    refresh(); show();
    const control = [...panel.querySelectorAll<HTMLButtonElement>('button[data-specimen]')].find((button) => button.dataset.specimen === record.specimen.key);
    if (control?.disabled || !control) { count.tabIndex = -1; count.focus(); }
    else control.focus();
  };
  const tile = (record: SpecimenExhibit, wear: boolean, full: boolean) => h('article', {}, specimenThumbnail(record),
    h('h3', {}, record.name), h('p', { class: 'fine' }, `${record.specimen.institution} · ${record.specimen.accession}`),
    h('button', { type: 'button', 'data-specimen': record.specimen.key, disabled: wear && full,
      onclick: () => move(record, wear) }, wear ? 'Put in satchel' : 'Put on display'));
  function show() {
    const state = controller.state;
    const used = carriedSpecimenCount(state);
    count.textContent = `Satchel object slots ${used} / ${SPECIMEN_CAPACITY}`;
    const wall = owned.filter(({ specimen }) => !carriesSpecimen(state, specimen.key));
    const pages = Math.max(1, Math.ceil(wall.length / PAGE));
    page = Math.min(Math.max(page, 0), pages - 1);
    carried.replaceChildren(...owned.filter(({ specimen }) => carriesSpecimen(state, specimen.key)).map((record) => tile(record, false, false)));
    display.replaceChildren(...wall.slice(page * PAGE, (page + 1) * PAGE).map((record) => tile(record, true, used >= SPECIMEN_CAPACITY)));
    if (!wall.length) display.append(h('p', {}, 'These display cases are empty. Put an object here to free a slot in your satchel.'));
    previous.disabled = page === 0;
    next.disabled = page + 1 >= pages;
    position.textContent = `${page + 1} / ${pages}`;
  }
  panel.append(count, h('h2', {}, 'In your satchel'), carried, h('h2', {}, 'On display'), display,
    h('div', { class: 'row' }, previous, position, next));
  show();
  return panel;
}
