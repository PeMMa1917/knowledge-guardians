import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import { carriedSpecimenCount, specimenDisplay, SPECIMEN_CAPACITY, SPECIMEN_PAGE, type SpecimenExhibit } from '../domain/specimenGear';
import { h } from './dom';
import { artURL, BIG_ART } from './illustrations';
import './specimenVault.css';

export function specimenThumbnail(record: SpecimenExhibit) {
  const image = h('img', { alt: '', src: artURL(BIG_ART[record.art] ?? record.art) });
  if (record.specimen.pixelAsset) void specimenArt(record.specimen.pixelAsset).then((imageData) => {
    if (imageData && image.isConnected) image.src = imageData.toDataURL('image/png');
  });
  return image;
}

export function specimenVault(controller: GameController, refresh: () => void) {
  const panel = h('section', { class: 'specimen-vault' });
  const count = h('p', { role: 'status' });
  const display = h('div', { class: 'specimen-cases' });
  const carried = h('div', { class: 'specimen-cases' });
  const previous = h('button', { type: 'button', onclick: () => changePage(-1) }, 'Previous displays');
  const next = h('button', { type: 'button', onclick: () => changePage(1) }, 'More displays');
  const position = h('span', { 'aria-live': 'polite' });
  function changePage(steps: number) {
    const { page } = specimenDisplay(controller.pack, controller.state);
    controller.dispatch({ type: 'SetFlag', flag: SPECIMEN_PAGE, value: page + steps });
    refresh(); show();
  }
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
    const { carried: inBag, page, pages, cases } = specimenDisplay(controller.pack, state);
    const used = inBag.length;
    count.textContent = `Satchel object slots ${used} / ${SPECIMEN_CAPACITY}`;
    carried.replaceChildren(...inBag.map((record) => tile(record, false, false)));
    display.replaceChildren(...cases.map((record) => tile(record, true, used >= SPECIMEN_CAPACITY)));
    if (!cases.length) display.append(h('p', {}, 'These display cases are empty. Put an object here to free a slot in your satchel.'));
    previous.disabled = page === 0;
    next.disabled = page + 1 >= pages;
    position.textContent = `${page + 1} / ${pages}`;
  }
  panel.append(count, h('h2', {}, 'In your satchel'), carried, h('h2', {}, 'On display'), display,
    h('div', { class: 'row' }, previous, position, next));
  show();
  return panel;
}

export function specimenCase(controller: GameController, slot: number, refresh: () => void) {
  const section = h('section', { class: 'specimen-vault' });
  const record = specimenDisplay(controller.pack, controller.state).cases[slot];
  if (!record) return h('p', {}, 'This display case is open.');
  const source = controller.pack.sources.find(({ id }) => id === record.specimen.source);
  const feedback = h('p', { role: 'status', tabIndex: -1 });
  const take = h('button', { type: 'button', disabled: carriedSpecimenCount(controller.state) >= SPECIMEN_CAPACITY,
    onclick: () => {
      const events = controller.dispatch({ type: 'CarrySpecimen', key: record.specimen.key, carry: true });
      if (events.some(({ kind }) => kind === 'error')) return;
      section.replaceChildren(feedback);
      feedback.textContent = `${record.name} is in your satchel.`;
      feedback.focus();
      refresh();
    },
  }, 'Put in satchel');
  section.append(h('article', { class: 'specimen-case' }, h('h2', {}, record.name), specimenThumbnail(record), h('p', {}, record.summary),
    h('p', { class: 'fine' }, `${record.specimen.institution} · ${record.specimen.accession}`),
    source ? h('p', {}, h('a', { href: source.url, rel: 'noopener', target: '_blank' }, 'Open the collection record')) : null,
    take, take.disabled ? h('p', { class: 'fine' }, 'Free a slot at the satchel hooks.') : null));
  return section;
}
