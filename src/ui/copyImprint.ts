import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import { IMPRINT_CASES, PRINT_DESTINATIONS, type ImprintCase } from '../content/copyImprintCases';
import { imprintHeading, imprintHeadingFlag, imprintPacket, INK_CHARGES, installFlag, pressFlag, pressedCharges, pullFlag, pullInk, readPacket, type ImprintHeading, type ImprintRoute, type InkCharge } from '../domain/imprint';
import { h } from './dom';
import './copyImprint.css';

type SourcePixels = { width: number; height: number; data: Uint8ClampedArray; url: string };
const paper = [239, 223, 183, 255];
const ink = [31, 30, 44, 255];
const sourceCache = new Map<string, Promise<SourcePixels | null>>();

function pixelsFor(record: ImprintCase): Promise<SourcePixels | null> {
  const prior = sourceCache.get(record.asset);
  if (prior) return prior;
  const source = specimenArt(record.asset).then((art) => {
    const g = art?.getContext('2d');
    if (!art || !g) return null;
    return {
      width: art.width, height: art.height,
      data: g.getImageData(0, 0, art.width, art.height).data, url: art.toDataURL('image/png'),
    };
  });
  sourceCache.set(record.asset, source);
  return source;
}

function pullImage(source: SourcePixels, charge: InkCharge, target: HTMLCanvasElement): number {
  target.width = source.width;
  target.height = source.height;
  const context = target.getContext('2d')!;
  const result = pullInk(source.data, source.width, charge);
  const pixels = context.createImageData(source.width, source.height);
  let covered = 0;
  result.forEach((mark, index) => {
    if (mark) covered++;
    pixels.data.set(mark ? ink : paper, index * 4);
  });
  context.putImageData(pixels, 0, 0);
  return covered;
}

function testCard(record: ImprintCase, source: SourcePixels, charge: InkCharge): HTMLElement {
  const name = INK_CHARGES.find(({ key }) => charge === key)!.name;
  const image = h('canvas', { class: 'imprint-print', role: 'img', 'aria-label': `${name} on a simulated one-ink print of ${record.title}` });
  const covered = pullImage(source, charge, image);
  return h('figure', { class: 'imprint-sheet' }, image,
    h('figcaption', {}, name, h('small', {}, `Ink on ${covered} of ${source.width * source.height} squares.`)));
}

function catalogue(record: ImprintCase): HTMLElement {
  return h('p', { class: 'fine' }, h('a', { href: record.source, target: '_blank', rel: 'noopener' },
    `Collection ${record.accession} · ${record.date}`), ' · ', record.limit);
}

const creditHeading: Record<ImprintHeading, string> = { artist: 'Artist named', work: 'Work named' };

function creditSlip(slip: NonNullable<ImprintCase['creditSlip']>, first: ImprintHeading): HTMLElement {
  const second = first === 'artist' ? 'work' : 'artist';
  return h('dl', { class: 'imprint-credit' }, ...([first, second] as const).flatMap((key) => [
    h('dt', {}, creditHeading[key]), h('dd', {}, slip[key]),
  ]));
}

export function copyImprint(controller: GameController, station: string, sound: (name: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'imprint-station', tabindex: -1 });
  const flags = () => controller.state.flags;
  const set = (flag: string, value: string | boolean, sfx: string) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound(sfx);
    refresh();
  };

  function receiver(route: ImprintRoute) {
    const bay = PRINT_DESTINATIONS.find((entry) => entry.route === route)!;
    panel.append(h('h2', {}, bay.title), h('p', {}, bay.tradeoff));
    for (const record of IMPRINT_CASES) {
      const sent = flags()[pressFlag(record.stem)];
      const packet = readPacket(sent);
      if (packet?.route !== route) continue;
      const isOnHook = () => flags()[installFlag(record.stem)] === sent;
      const reply = h('p', { class: 'fine', role: 'status' });
      const copy = h('div', { class: 'imprint-results' });
      const update = () => {
        reply.textContent = isOnHook()
          ? record.creditSlip?.[route] ?? (route === 'counter'
            ? 'The runner takes this single pull and its catalogue slip to the queue. The other pulls stay in the press room.'
            : 'The keeper lays the collection view between the two pulls. A visitor can check which marks moved with the ink setting.')
          : 'The bearer has brought the packet to its hook.';
        mount.disabled = isOnHook();
        mount.textContent = isOnHook() ? 'Copy mounted' : `Mount proof ${record.accession}`;
      };
      const mount = h('button', { type: 'button', onclick: () => {
        if (flags()[pressFlag(record.stem)] !== sent) return;
        set(installFlag(record.stem), imprintPacket(route, packet.charge), 'sfx.pickup');
        update();
        reply.tabIndex = -1;
        reply.focus();
      } });
      update();
      panel.append(h('article', { class: 'imprint-receipt' }, h('h3', {}, record.title), catalogue(record),
        record.creditSlip ? creditSlip(record.creditSlip, imprintHeading(controller.state, record.stem)) : null, copy, mount, reply));
      void pixelsFor(record).then((photo) => {
        if (!photo) {
          copy.textContent = 'The paper view is unavailable. The catalogue slip is still attached.';
          return;
        }
        if (route === 'drawer') {
          copy.append(h('figure', { class: 'imprint-sheet' }, h('img', { src: photo.url, alt: record.alt }),
            h('figcaption', {}, 'Collection view')));
        }
        const charges = route === 'drawer' ? pressedCharges(controller.state, record.stem) : [packet.charge];
        copy.append(...charges.map((charge) => testCard(record, photo, charge)));
      });
    }
  }

  if (station === 'counter' || station === 'drawer') {
    receiver(station);
    return panel;
  }

  const record = IMPRINT_CASES.find(({ slug }) => slug === station);
  if (!record || !controller.check({ card: record.card })) return panel;
  const status = h('p', { class: 'fine', role: 'status' }, 'The paper is coming out of the cabinet.');
  panel.append(h('h2', {}, record.title), h('p', {}, record.focus), catalogue(record), status);
  void pixelsFor(record).then((photo) => {
    if (!photo) {
      status.textContent = 'The collection image is unavailable. The catalogue slip is still attached.';
      return;
    }
    const results = h('div', { class: 'imprint-results' });
    const checked = () => pressedCharges(controller.state, record.stem);
    let selected = checked()[0] ?? INK_CHARGES[0].key;
    const selectedControls = INK_CHARGES.map(({ key, name }) => h('button', {
      type: 'button', onclick: () => { selected = key; update(); },
    }, name));
    const firstLine = () => imprintHeading(controller.state, record.stem);
    const headingPreview = h('div');
    const headingOptions = (['artist', 'work'] as const).map((key) => h('button', {
      type: 'button', onclick: () => {
        if (readPacket(flags()[pressFlag(record.stem)])) return;
        set(imprintHeadingFlag(record.stem), key, 'sfx.page');
        update();
      },
    }, key === 'artist' ? 'Lead with the artist line' : 'Lead with the work line'));
    const destinations = PRINT_DESTINATIONS.map(({ route, title, tradeoff }) => h('div', { class: 'imprint-destination' },
      h('p', { class: 'fine' }, tradeoff),
      h('button', { type: 'button', onclick: () => {
        if (checked().length < 2 || !checked().includes(selected)) return;
        set(pressFlag(record.stem), imprintPacket(route, selected), 'sfx.complete');
        update();
      } }, `Send to the ${title.toLowerCase()}`)));
    const pull = h('button', { type: 'button', onclick: () => {
      set(pullFlag(record.stem, selected), true, 'sfx.page');
      update();
    } }, 'Pull a proof');
    const update = () => {
      const charges = checked();
      const current = readPacket(flags()[pressFlag(record.stem)]);
      selectedControls.forEach((button, i) => button.setAttribute('aria-pressed', String(INK_CHARGES[i].key === selected)));
      if (record.creditSlip) {
        headingPreview.replaceChildren(creditSlip(record.creditSlip, firstLine()));
        headingOptions.forEach((button, index) => {
          button.setAttribute('aria-pressed', String(firstLine() === (index === 0 ? 'artist' : 'work')));
          button.disabled = !!current;
        });
      }
      destinations.forEach((entry) => {
        entry.querySelector('button')!.disabled = charges.length < 2 || !charges.includes(selected);
      });
      status.textContent = current
        ? current.route === 'counter' ? 'Follow the single proof to the landing counter.' : 'Follow both trials to the proof drawer at the back of this room.'
        : charges.length < 2 ? 'Keep the same photograph. Pull at two different charges.'
          : 'Use the ink figures and the picture. Select a tested charge for the travelling proof.';
      results.replaceChildren(...charges.map((charge) => testCard(record, photo, charge)));
    };
    panel.insertBefore(h('figure', { class: 'imprint-sheet' }, h('img', { src: photo.url, alt: record.alt }),
      h('figcaption', {}, 'Collection view')), status);
    panel.append(h('div', { class: 'row', role: 'group', 'aria-label': 'Ink charge' }, ...selectedControls), pull, results);
    if (record.creditSlip) panel.append(h('section', { 'aria-label': 'Inscription slip' },
      h('p', {}, 'Choose the line a reader will meet first. Both go with the proof.'),
      h('div', { class: 'row' }, ...headingOptions), headingPreview));
    panel.append(...destinations);
    update();
  });
  return panel;
}
