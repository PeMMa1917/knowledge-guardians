import { lanternPair } from './lanternPair';
import { lanternInstrument } from './lanternInstrument';
import { materialLine } from '../domain/lanternInstruments';
import type { GameController } from '../app/controller';
import { LANTERN_PEOPLE, LANTERN_SITES, lanternDisplay, lanternMemory, lanternRead,
  type LanternCommand, type LanternPerson } from '../domain/lamplight';
import { encyclopediaForCharacter } from '../domain/encyclopedia';
import { mlaCitation } from '../domain/mla';
import { h } from './dom';

const tidy = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const pageSize = 6;

export function lamplightPanel(node: string, c: GameController, refresh: () => void, read: (text: string) => void, volume: number) {
  const [family, chapter, stage] = node.split('.');
  if (family !== 'lamplight' || !['post', 'bench'].includes(stage)) return;
  const site = LANTERN_SITES.find((s) => s.id === chapter && s.map === c.state.mapId);
  if (!site) return;
  const bench = stage === 'bench';
  const box = h('section', { class: 'lamplight', 'aria-label': site.title });
  const content = h('div');
  const button = (text: string, f: () => void) => h('button', { type: 'button', onclick: f }, text);
  const headline = (text: string) => h('h3', { tabindex: '-1' }, text);
  const focusHeading = () => content.querySelector<HTMLElement>('h3')?.focus();
  let page = 0, query = '', startedOnly = false;
  function work(cmd: LanternCommand) {
    const error = c.dispatch(cmd).find((e) => e.kind === 'error');
    if (error) { content.prepend(h('p', { role: 'alert' }, error.message)); return false; }
    refresh();
    return true;
  }
  function encounter(person: LanternPerson) {
    if (!site) return;
    const common = { type: 'WorkWithLantern' as const, site: site.id, person: person.id };
    if (!bench && !work({ ...common, stage: 'meet' })) return;
    const state = lanternRead(c.state, site, person), trace = state.trace;
    const spoken = bench && trace !== undefined ? person.folds[trace].arrival : person.opening;
    const name = person.name;
    const voice = h('blockquote', {}, spoken);
    const history = lanternMemory(c.state, site, person);
    const source = c.pack.sources.find((s) => s.id === 'HIS-INK-' + person.id || s.id === 'HIS-LAMPLIGHT-' + person.id);
    const character = c.pack.characters.find(({ id }) => id === person.character);
    const article = character && encyclopediaForCharacter(character);
    const citation = source ? mlaCitation(source) : [];
    const notes = h('details', {}, h('summary', {}, 'About ' + name), h('p', {}, person.context),
      h('p', {}, ...citation.map((p) => p.href ? h('a', { href: p.href, target: '_blank', rel: 'noopener noreferrer' }, p.text)
        : p.cite ? h('cite', {}, p.text) : p.text)));
    if (!citation.length && article) notes.append(h('a', { href: article.url, target: '_blank', rel: 'noopener noreferrer' }, article.title));
    const response = h('div', { class: 'options' });
    if (bench) {
      if (trace === undefined) { list(); return; }
      response.append(h('p', {}, 'Your tracing · ' + person.folds[trace].action), h('p', {}, materialLine(person.id, state.pieces)));
      site.uses.forEach((part, index) => response.append(button(part.action, () => {
        if (work({ ...common, stage: 'use', option: index === 0 ? 0 : 1 })) encounter(person);
      })));
      if (state.use !== undefined) response.append(h('p', { role: 'status' }, site.uses[state.use].reply));
    } else {
      response.append(lanternInstrument(person.id, state.pieces, (piece) => {
        if (work({ ...common, stage: 'pin', piece })) {
          encounter(person);
          content.querySelector<HTMLElement>('[data-lantern-piece="' + piece + '"]')?.focus();
        }
      }, volume));
      if (state.pieces.length === 2) person.folds.forEach((fold, index) => response.append(button(fold.action, () => {
        if (work({ ...common, stage: 'trace', option: index === 0 ? 0 : 1 })) encounter(person);
      })));
      if (trace !== undefined) response.append(h('p', { role: 'status' }, 'You prepared “' + person.folds[trace].action +
        '”. Meet ' + name + ' again at ' + site.bench + ' in ' + site.place + '. ' + direction(site.postAt, site.at)));
    }
    content.replaceChildren(headline(name + ' · ' + person.title), voice, button('Read this voice aloud', () => read(spoken)),
      ...(history ? [h('details', {}, h('summary', {}, 'What we did in another chapter'), h('p', {}, history))] : []),
      response, notes, button(bench ? 'Return to the lamp' : 'Call a different guest', () => { list(); focusHeading(); }));
    focusHeading();
  }
  function list() {
    if (!site) return;
    const mounted = lanternDisplay(c.state, site);
    const rows = h('div', { class: 'options' }), summary = h('p', { role: 'status' });
    const filter = h('input', { type: 'search', value: query, placeholder: 'Name or story', 'aria-label': 'Find a guest by name or story' });
    const narrow = h('input', { type: 'checkbox' });
    narrow.checked = startedOnly;
    function draw() {
      if (!site) return;
      const ordered = [...LANTERN_PEOPLE].sort((a, b) => Number(site.pair.guests.includes(b.id)) - Number(site.pair.guests.includes(a.id)));
      const matches = ordered.filter((p) => {
        const status = lanternRead(c.state, site, p);
        return (!bench || status.trace !== undefined) && (!startedOnly || status.met) && tidy(p.name + ' ' + p.title).includes(tidy(query.trim()));
      });
      const count = matches.length;
      page = Math.min(page, Math.max(0, Math.ceil(count / pageSize) - 1));
      summary.textContent = count ? (page * pageSize + 1) + '–' + Math.min(count, (page + 1) * pageSize) + ' of ' + count :
        bench && !query ? 'Bring a tracing from the folded-wing post. ' + direction(site.at, site.postAt) : 'No guest matches this search.';
      rows.replaceChildren(...matches.slice(page * pageSize, (page + 1) * pageSize).map((p) => {
        const state = lanternRead(c.state, site, p);
        const label = p.name + ' · ' + p.title + (state.use !== undefined ? ' · exhibited' : state.trace !== undefined ? ' · tracing ready' : '');
        return button(label, () => encounter(p));
      }));
      const turn = (delta: number) => { page += delta; draw(); rows.querySelector('button')?.focus(); };
      if (page > 0) rows.append(button('Previous guests', () => turn(-1)));
      if ((page + 1) * pageSize < count) rows.append(button('More guests', () => turn(1)));
    }
    filter.addEventListener('input', () => { query = filter.value; page = 0; draw(); });
    narrow.addEventListener('change', () => { startedOnly = narrow.checked; page = 0; draw(); });
    content.replaceChildren(headline(bench ? site.bench : site.title),
      ...(bench && mounted ? [h('div', { class: 'lore-entry' }, h('strong', {}, mounted.person.name + ' · ' + mounted.trace.action),
        h('p', {}, mounted.use.action + '. ' + mounted.use.reply), h('p', {}, materialLine(mounted.person.id, mounted.pieces)))] : []),
      ...(bench ? [lanternPair(c, site)] : []), h('label', {}, 'Find a guest ', filter), ...(!bench ? [h('label', {}, narrow, ' Guests I have met here')] : []), summary, rows);
    draw();
  }
  box.append(content);
  list();
  return box;
}

function direction(from: number[], to: number[]) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const steps = [dy < 0 ? 'north' : dy > 0 ? 'south' : '', dx < 0 ? 'west' : dx > 0 ? 'east' : ''].filter(Boolean).join(' and ');
  return 'Look ' + steps + ' of here.';
}
