import type { GameController } from '../app/controller';
import { playPracticeTones } from '../app/practiceSounds';
import { practiceFrequency, type MakerRoute } from '../domain/makerRoom';
import type { FlagValue } from '../domain/types';
import { h } from './dom';
import { makerReturn } from './makerReturns';

const ids = ['jiahu', 'disk', 'laguna'] as const;
type Exact = (typeof ids)[number];
const headings: Record<Exact, string> = {
  jiahu: 'Changing One Opening',
  disk: 'Set the Disk on Its Other Face',
  laguna: 'The Receipt That Still Holds',
};

const receiptRows = [
  { id: 'recipient', action: 'Place Angkatan and Bukah on the recipient line', record: 'Angkatan and Bukah receive the clearance in the preliminary reading.' },
  { id: 'debt', action: 'Clip the cleared debt to Namwran’s line', record: 'Namwran’s debt is cleared in the preliminary reading.' },
  { id: 'witness', action: 'Put Kasumuran on the witness strip', record: 'Kasumuran is named as a witness in the preliminary reading.' },
  { id: 'date', action: 'Set the dated line under the receipt', record: '822 Saka, given as 900 CE in the museum catalogue.' },
] as const;

const stem = (id: Exact) => `makers.exact.${id}`;
const stops = [0, 1, 2, 3, 4, 5, 6, 7];

export function makerExact(controller: GameController, key: string, volume: () => number, sound: (name: string) => void, refresh: () => void): HTMLElement {
  if (key.startsWith('return-')) return makerReturn(controller, key.slice(7), volume, sound, refresh);
  const panel = h('div', { class: 'maker-room-tool', tabindex: -1 });
  const id = ids.find((candidate) => candidate === key);
  if (!id || !controller.check({ card: `card.${stem(id)}` })) return panel;
  const get = (name: string) => controller.state.flags[`${stem(id)}.${name}`];
  const set = (name: string, value: FlagValue) => {
    controller.dispatch({ type: 'SetFlag', flag: `${stem(id)}.${name}`, value });
    refresh();
  };
  const made = () => stops.filter((stop) => get(`tone.${stop}`) === true);
  const reports = h('div', { role: 'status', class: 'maker-exact-model' });
  const details = h('div', { class: 'maker-exact-model', 'aria-label': 'The current practice setting' });

  const send = (['quay', 'walk'] as const).map((route) => h('button', {
    type: 'button', onclick: () => {
      if (!ready()) return;
      if (id === 'jiahu') {
        const samples = made();
        set('sent.a', samples[0]);
        set('sent.b', samples.at(-1)!);
      }
      set('display', false);
      set('route', route);
      sound('sfx.page');
      update();
    },
  }, route === 'quay' ? 'Send the short copy to Lamp Quay' : 'Send the checked pair to the Glass Walk'));
  const ready = () => id === 'jiahu' ? made().length >= 2 : id === 'disk'
    ? get('front') === true && get('back') === true
    : receiptRows.every(({ id: name }) => get(name) === true);
  const update = () => {
    send.forEach((button) => { button.disabled = !ready(); });
    const route = get('route');
    reports.textContent = route === 'quay' ? 'The short copy now waits at Lamp Quay.'
      : route === 'walk' ? 'The checked pair now waits at the Glass Walk.'
        : 'Send a copy after the work on this stand is ready.';
  };

  panel.append(h('h2', {}, headings[id]));
  if (id === 'jiahu') {
    const ticks = h('input', { type: 'range', min: 0, max: 7, value: 0, step: 1, 'aria-label': 'Practice tube stop' });
    const settings = h('p', { class: 'fine', role: 'status' });
    const updateTone = () => {
      const stop = Number(ticks.value);
      details.textContent = `Practice setting ${stop + 1}. ${practiceFrequency(stop)} Hz in the fictional tube.`;
      settings.textContent = made().length ? `Sampled settings ${made().map((i) => `${i + 1} at ${practiceFrequency(i)} Hz`).join(', ')}.` : 'The sample hooks are empty.';
      update();
    };
    ticks.addEventListener('input', updateTone);
    panel.append(
      h('p', {}, 'Juzhong Zhang and colleagues tested flutes from Jiahu. This original model keeps the tube fixed and moves its stop so you can compare two tones.'),
      h('label', {}, 'Move the practice stop', ticks), details,
      h('button', { type: 'button', onclick: () => {
        const stop = Number(ticks.value);
        set(`tone.${stop}`, true);
        playPracticeTones([practiceFrequency(stop)], volume());
        updateTone();
      } }, 'Play and record this practice tone'), settings);
    updateTone();
  } else if (id === 'disk') {
    const picture = h('div', { class: 'maker-disc', role: 'img', 'aria-label': 'The face of the practice mount' });
    const side = h('p', { role: 'status', class: 'fine' }, 'Set a side of the disk into the mount.');
    const show = (face: 'front' | 'back') => {
      set(face, true);
      sound('sfx.page');
      picture.textContent = face === 'front' ? 'Relief face' : 'Name face';
      picture.setAttribute('aria-label', face === 'front' ? 'Model relief face in the mount' : 'Model inscription face in the mount');
      side.textContent = face === 'front'
        ? 'The Penn Museum describes a carved scene on this face. Here the model shows only its panel.'
        : 'The record reads Enheduanna’s name and identifies her as Sargon’s daughter. This face gives the name and relation.';
      update();
    };
    panel.append(
      h('p', {}, 'Set the two faces in turn. One plate supports discussion of the carving. A separate one keeps the named person with the inscription.'),
      picture, h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => show('front') }, 'Set the carved face in the mount'),
        h('button', { type: 'button', onclick: () => show('back') }, 'Turn the disk to its name face')),
      side);
  } else {
    const list = h('ul', { class: 'fine', role: 'status' });
    const updateLines = () => {
      list.replaceChildren(...receiptRows.filter(({ id: name }) => get(name) === true).map(({ record }) => h('li', {}, record)));
      update();
    };
    panel.append(
      h('p', {}, 'The case uses Antoon Postma’s preliminary reading. Put the persons, date and scope of the clearance in separate parts of the docket.'),
      h('div', { class: 'row' }, ...receiptRows.map(({ id: name, action }) => h('button', {
        type: 'button', onclick: () => { set(name, true); sound('sfx.page'); updateLines(); },
      }, action))), list);
    updateLines();
  }
  panel.append(h('div', { class: 'row' }, ...send), reports);
  update();
  return panel;
}

export function exactReceipts(controller: GameController, route: MakerRoute, volume: () => number, sound: (name: string) => void, refresh: () => void): HTMLElement[] {
  return ids.flatMap((id) => {
    const get = (name: string) => controller.state.flags[`${stem(id)}.${name}`];
    if (get('route') !== route) return [];
    const record = h('p', { role: 'status', class: 'fine' });
    const board = h('div', { class: 'maker-exact-model' });
    let installed = get('display') === route;
    const prepare = h('button', { type: 'button', onclick: () => { installed = true; update(); mount.focus(); } },
      id === 'jiahu' ? 'Place the sample readings on the sound board'
        : id === 'disk' ? 'Set the record in its receiving mount' : 'Check the named receipt against the open account');
    const mount = h('button', { type: 'button', onclick: () => {
      if (!installed || get('route') !== route) return;
      controller.dispatch({ type: 'SetFlag', flag: `${stem(id)}.display`, value: route });
      sound('sfx.complete');
      update();
      refresh();
      record.tabIndex = -1;
      record.focus();
    } }, 'Mount this record');
    const update = () => {
      const complete = get('display') === route;
      prepare.disabled = installed;
      mount.disabled = !installed || complete;
      record.textContent = complete ? 'The later visitor now has the checked copy and its collection reference.' : 'The receiver is preparing to use the record.';
      if (!installed) { board.textContent = 'The receiving board is clear.'; return; }
      if (id === 'jiahu') {
        const answer = route === 'quay' ? [get('sent.a')] : [get('sent.a'), get('sent.b')];
        board.replaceChildren(...answer.filter((v): v is number => typeof v === 'number').map((stop) =>
          h('div', {}, h('p', {}, `Practice setting ${stop + 1} produced ${practiceFrequency(stop)} Hz. The 23.1 cm Jiahu flute remains the historic object.`),
            h('button', { type: 'button', onclick: () => playPracticeTones([practiceFrequency(stop)], volume()) }, `Play carried practice sample ${stop + 1}`))));
      } else if (id === 'disk') {
        board.textContent = route === 'quay'
          ? 'The named line identifies Enheduanna as Sargon’s daughter. A worker puts the name with B16665.'
          : 'The reader can lift the named line and still see the other face recorded separately. The case supplies no author’s manuscript.';
      } else {
        board.textContent = route === 'quay'
          ? 'The keeper marks Namwran’s account cleared in the exercise. The short receipt keeps the name and date together.'
          : 'The folder preserves the recipients, named witness, date and clearance separately from the scholar’s preliminary translation notes.';
      }
    };
    const article = h('article', { class: 'maker-receipt' }, h('h3', {}, headings[id]), board, prepare, mount, record);
    update();
    return [article];
  });
}
