import {recordView} from '../domain/contentNotes';
import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import { carriedSpecimenCount, findCollectedSpecimens, specimenDisplay, specimenSeat, SPECIMEN_CAPACITY, SPECIMEN_PAGE, type SpecimenExhibit } from '../domain/specimenGear';
import { h } from './dom';
import { artURL, BIG_ART } from './illustrations';
import './specimenVault.css';

export function specimenThumbnail(record: SpecimenExhibit,flags:Readonly<Record<string,unknown>>) {
  if(recordView(record.id,flags)!=='illustrated')return h('img',{src:artURL('preserved.folder'),alt:'Closed picture sleeve'});
  const image = h('img', { alt: '', src: artURL(BIG_ART[record.art] ?? record.art) });
  if (record.specimen.pixelAsset) void specimenArt(record.specimen.pixelAsset).then((imageData) => {
    if (imageData && image.isConnected) image.src = imageData.toDataURL('image/png');
  });
  return image;
}

function exchange(controller: GameController, first: SpecimenExhibit, second: SpecimenExhibit, satchel: boolean) {
  const result = controller.dispatch({ type: 'SwapSpecimenPlaces', first:first.specimen.key, second:second.specimen.key,
    targetSeat:specimenSeat(controller.state,second.specimen.key), satchel });
  return !result.some(event => event.kind === 'error');
}

function satchelExchange(controller: GameController, record: SpecimenExhibit, done: (outgoing: SpecimenExhibit) => void) {
  const { carried } = specimenDisplay(controller.pack,controller.state);
  const selected = h('select', { 'aria-label': 'Object to put on display in its place' },
    ...carried.map(object=>h('option',{value:object.specimen.key},object.name)));
  return h('div', {}, h('label',{},'Leave on display ',selected), h('button',{type:'button',onclick:()=>{
    const outgoing = carried.find(object=>object.specimen.key===selected.value);
    if (outgoing && exchange(controller,record,outgoing,true)) done(outgoing);
  }},'Exchange with satchel'));
}

export function specimenVault(controller: GameController, refresh: () => void) {
  const panel = h('section', { class: 'specimen-vault' });
  const count = h('p', { role: 'status' });
  const display = h('div', { class: 'specimen-cases' });
  const carried = h('div', { class: 'specimen-cases' });
  const previous = h('button', { type: 'button', onclick: () => changePage(-1) }, 'Previous displays');
  const next = h('button', { type: 'button', onclick: () => changePage(1) }, 'More displays');
  let picked: SpecimenExhibit | null = null;
  const announcement = h('p', { role:'status' });
  const cancel = h('button', {type:'button',onclick:()=>{ picked=null;announcement.textContent='Display move cancelled.';show(); }}, 'Cancel move');
  const position = h('span', { 'aria-live': 'polite' });
  const search = h('input', { type: 'search', placeholder: 'Name, person, museum or accession' });
  const matchCount = h('p', { role: 'status' });
  const results = h('ul', {});
  const index = h('details', { class: 'specimen-index' }, h('summary', {}, 'Find a collected object'),
    h('label', {}, 'Search your collection', search), matchCount, results);
  let collection = specimenDisplay(controller.pack, controller.state);
  function searchCollection() {
    const query = search.value.trim();
    const matches = findCollectedSpecimens(collection, query);
    matchCount.textContent = !query ? '' : matches.length === 0 ? 'No collected objects match.' :
      matches.length > 8 ? `${matches.length} matches. Showing the first 8. Add another word to narrow the list.` :
      `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}.`;
    results.replaceChildren(...matches.slice(0, 8).map(({ record, page }) => {
      const locate = () => {
        if (page !== null && page !== collection.page) {
          controller.dispatch({ type: 'SetFlag', flag: SPECIMEN_PAGE, value: page });
          refresh();
          show();
        }
        const heading = [...panel.querySelectorAll<HTMLElement>('h3[data-key]')]
          .find((node) => node.dataset.key === record.specimen.key);
        heading?.focus();
      };
      const place = page === null ? 'Satchel' : `Display ${page + 1}`;
      return h('li', {}, h('button', { type: 'button', onclick: locate }, `${record.name} · ${place}`));
    }));
  }
  search.addEventListener('input', searchCollection);
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
  function rearrange(record: SpecimenExhibit) {
    if (picked === null) {
      picked = record;
      announcement.textContent = 'Choose the case where you want ' + record.name + '. You can search or turn the page.';
    } else {
      const first = picked;
      if (first.specimen.key === record.specimen.key || !exchange(controller,first,record,false)) return;
      announcement.textContent = first.name + ' and ' + record.name + ' changed places.';
      picked = null;
      refresh();
    }
    show();
    const focus = picked ? cancel : display.querySelector<HTMLButtonElement>('button');
    focus?.focus();
  }
  const tile = (record: SpecimenExhibit, wear: boolean, full: boolean) => h('article', {}, specimenThumbnail(record,controller.state.flags),
    h('h3', { tabindex: -1, 'data-key': record.specimen.key }, record.name), h('p', { class: 'fine' }, `${record.specimen.institution} · ${record.specimen.accession}`),
    h('button', { type: 'button', 'data-specimen': record.specimen.key, disabled: wear && full,
      onclick: () => move(record, wear) }, wear ? 'Put in satchel' : 'Put on display'),
    wear && full ? satchelExchange(controller,record,(outgoing)=>{
      picked=null;show();refresh();announcement.textContent=record.name+' is in your satchel. '+outgoing.name+' is on display.';
      announcement.tabIndex=-1;announcement.focus();
    }) : null,
    wear && collection.stored.length > 1 ? h('button',{type:'button',disabled:picked?.specimen.key===record.specimen.key,
      onclick:()=>rearrange(record)}, picked ? 'Place selected object here' : 'Move this display') : null);
  function show() {
    collection = specimenDisplay(controller.pack, controller.state);
    const { carried: inBag, page, pages, cases } = collection;
    searchCollection();
    if (picked && !collection.stored.some(record => record.specimen.key === picked?.specimen.key)) picked=null;
    cancel.hidden = !picked;
    const used = inBag.length;
    count.textContent = `Satchel object slots ${used} / ${SPECIMEN_CAPACITY}`;
    carried.replaceChildren(...inBag.map((record) => tile(record, false, false)));
    display.replaceChildren(...cases.map((record) => tile(record, true, used >= SPECIMEN_CAPACITY)));
    if (!cases.length) display.append(h('p', {}, 'These display cases are empty. Put an object here to free a slot in your satchel.'));
    previous.disabled = page === 0;
    next.disabled = page + 1 >= pages;
    position.textContent = `${page + 1} / ${pages}`;
  }
  panel.append(count, h('h2', {}, 'In your satchel'), carried, h('h2', {}, 'On display'), index, announcement, cancel, display,
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
  section.append(h('article', { class: 'specimen-case' }, h('h2', {}, record.name), specimenThumbnail(record,controller.state.flags), h('p', {}, record.summary),
    h('p', { class: 'fine' }, `${record.specimen.institution} · ${record.specimen.accession}`),
    source ? h('p', {}, h('a', { href: source.url, rel: 'noopener', target: '_blank' }, 'Open the collection record')) : null,
    take, take.disabled ? satchelExchange(controller,record,(outgoing)=>{
      section.replaceChildren(feedback);
      feedback.textContent = record.name+' is in your satchel. '+outgoing.name+' now stands in this case.';
      feedback.focus(); refresh();
    }) : null));
  return section;
}
