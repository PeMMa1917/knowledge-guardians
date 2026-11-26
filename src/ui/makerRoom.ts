import type { GameController } from '../app/controller';
import { MAKER_CASES, type MakerCase } from '../content/makerRoomCases';
import { benchFace, benchPacket, BUILD_SETTINGS, comparedAt, CONSTRUCTIONS, crossSection, parseBenchPacket,
  readFlag, receivedFlag, routeFlag, WORKBENCH_BANDS, type Build, type MakerRoute } from '../domain/makerRoom';
import type { FlagValue } from '../domain/types';
import { h } from './dom';
import { exactReceipts } from './makerExact';
import './makerRoom.css';

const cellNames = { stock: 'body', mark: 'pattern', tie: 'support', void: 'air' } as const;

function cells(title: string, parts: readonly (keyof typeof cellNames)[]): HTMLElement {
  return h('figure', { class: 'maker-strip' },
    h('div', { class: 'maker-strip-cells', role: 'img', 'aria-label': `${title}. ${parts.map((part) => cellNames[part]).join(', ')}.` },
      ...parts.map((part) => h('span', { class: `maker-cell maker-${part}`, 'aria-hidden': 'true' }))),
    h('figcaption', {}, title));
}

function sourceNote(record: MakerCase) {
  return h('p', { class: 'fine' },
    h('a', { href: record.catalogue, target: '_blank', rel: 'noopener' }, `Collection record ${record.accession}`), ' · ', record.limit);
}

export function makerRoom(controller: GameController, station: string, volume: () => number, sound: (name: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'maker-room-tool', tabindex: -1 });
  const flags = () => controller.state.flags;
  const set = (flag: string, value: FlagValue) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };

  function receive(route: MakerRoute) {
    panel.append(h('h2', {}, route === 'quay' ? 'The front pattern at Lamp Quay' : 'The practice cut on the Glass Walk'),
      h('p', {}, route === 'quay'
        ? 'A reader can set a template on the bench as soon as its copy arrives.'
        : 'The reader can open the section and compare what each method placed beneath the front.'));
    for (const record of MAKER_CASES) {
      const sent = flags()[routeFlag(record.stem)];
      const packet = parseBenchPacket(sent);
      if (packet?.route !== route) continue;
      let placed = flags()[receivedFlag(record.stem)] === sent;
      const result = h('div', { class: 'maker-cut-result' });
      const receipt = h('p', { role: 'status', class: 'fine' });
      const place = h('button', { type: 'button', onclick: () => { placed = true; update(); mount.focus(); } },
        route === 'quay' ? 'Set the copied pattern in the frame' : 'Repeat the cut at the marked band');
      const mount = h('button', { type: 'button', onclick: () => {
        if (!placed || flags()[routeFlag(record.stem)] !== sent) return;
        set(receivedFlag(record.stem), sent!);
        update();
        receipt.tabIndex = -1;
        receipt.focus();
      } }, `Mount copy ${record.accession}`);
      const update = () => {
        const received = flags()[receivedFlag(record.stem)] === sent;
        place.disabled = placed;
        mount.disabled = received || !placed;
        const reports = !placed ? [] : route === 'quay'
          ? [cells('The single traced front', benchFace(record))]
          : CONSTRUCTIONS.map((build) => cells(BUILD_SETTINGS[record.kind][build], crossSection(record, build, packet.cut)));
        result.replaceChildren(...reports);
        receipt.textContent = received
          ? route === 'quay'
            ? 'The reader copies the outline. The preparation stays with the recorded object and its catalogue.'
            : packet.cut === record.band
              ? 'The two checks are pinned at the marked band. The next maker can reproduce the difference below the pattern.'
              : 'The two cuts agree at this band. The receiver leaves space to test the marked feature in a later trial.'
          : 'The packet has space for the tested result.';
      };
      panel.append(h('article', { class: 'maker-receipt' }, h('h3', {}, record.title), sourceNote(record), result, place, mount, receipt));
      update();
    }
    panel.append(...exactReceipts(controller, route, volume, sound, refresh));
  }

  if (station === 'quay' || station === 'walk') {
    receive(station);
    return panel;
  }

  const record = MAKER_CASES.find(({ slug }) => slug === station);
  if (!record || !controller.check({ card: record.card })) return panel;
  const choice = BUILD_SETTINGS[record.kind];
  let build: Build = 'first';
  let cut = record.band;
  const report = h('p', { role: 'status', class: 'fine' });
  const result = h('div', { class: 'maker-cut-result' });
  const controls = CONSTRUCTIONS.map((method) => h('button', {
    type: 'button', onclick: () => { build = method; update(); },
  }, choice[method]));
  const bands = WORKBENCH_BANDS.map((position) => h('button', {
    type: 'button', onclick: () => { cut = position; update(); },
    'aria-label': position === record.band ? `Band ${position + 1}, ${record.feature}` : `Band ${position + 1}`,
  }, String(position + 1)));
  const drill = h('button', { type: 'button', onclick: () => {
    set(readFlag(record.stem, build, cut), true);
    update();
  } }, 'Look into this cut');
  const send = ([['quay', 'Send the front pattern to Lamp Quay'], ['walk', 'Send the checked cut to the Glass Walk']] as const).map(([route, label]) =>
    h('button', { type: 'button', onclick: () => {
      if (!comparedAt(controller.state, record.stem, cut)) return;
      set(routeFlag(record.stem), benchPacket(route, cut));
      update();
    } }, label));
  const routeReport = h('p', { role: 'status', class: 'fine' });
  const update = () => {
    controls.forEach((button, index) => button.setAttribute('aria-pressed', String(CONSTRUCTIONS[index] === build)));
    bands.forEach((button, index) => button.setAttribute('aria-pressed', String(index === cut)));
    const ready = comparedAt(controller.state, record.stem, cut);
    send.forEach((button) => { button.disabled = !ready; });
    const found = CONSTRUCTIONS.filter((setting) => flags()[readFlag(record.stem, setting, cut)] === true);
    result.replaceChildren(...found.map((setting) => cells(choice[setting], crossSection(record, setting, cut))));
    report.textContent = !ready ? 'Check the same band through both builds.'
      : cut === record.band ? choice.detail : 'Both checks show the same body at this band. The marked feature is elsewhere.';
    const packet = parseBenchPacket(flags()[routeFlag(record.stem)]);
    routeReport.textContent = !packet ? 'One reader wants the outline. Another wants to look below it.'
      : packet.route === 'quay' ? 'Look for the front pattern at Lamp Quay.'
        : 'Look for the tested bands at the Glass Walk.';
  };
  const maker = record.people.length
    ? h('p', {}, `Named in the record: ${record.people.map((person) => person.name).join(' and ')}.`)
    : h('p', {}, `The case belongs to ${record.place}. The record leaves the maker’s name open.`);
  panel.append(h('h2', {}, record.title), maker, h('p', {}, record.fact),
    h('p', {}, `The fictional bench puts its mark for ${record.feature} in band ${record.band + 1}.`),
    cells('Top view for either practice build', benchFace(record)),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Practice build' }, ...controls),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Select the inspected band' }, ...bands),
    drill, result, report, sourceNote(record),
    h('div', { class: 'row' }, ...send), routeReport);
  update();
  return panel;
}
