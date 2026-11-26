import type { GameController } from '../app/controller';
import { NUMBER_LEAVES, NUMBER_LEAF_ROUTES, type NumberLeaf, type NumberLeafRoute } from '../content/numberLeaves';
import { countedNotches, NOTCH_PAIRS, placeWindow, TRAINING_TRIANGLES, triangleFit } from '../domain/numberLeaves';
import { h } from './dom';
import './numberLeaves.css';

const READERS = { method: 'Lella’s guide rack', context: 'Omrin’s finding desk' };
const TRIALS: Record<string, [string, string]> = {
  ishango: ['Join the matching counts', 'Count with the joins removed'],
  plimpton: ['Fit the small three-sided frame', 'Fit the longer three-sided frame'],
  bakhshali: ['Fit the spare mark', 'Hang the dated bark tabs'],
};
const RETURN_LINES: Record<string, [string, string]> = {
  ishango: ['The next runner keeps a visual notch for each of the six groups. Her note marks which doubles another runner can check.',
    'The clerk can check the sum without claiming what the maker kept in mind. She lays the group slip next to the total.'],
  plimpton: ['A visitor fits both cutouts against the long edge of the practice frame. The archivist keeps them beside a line that names the trial.',
    'A later reader can compare this practice frame with the broken record. The museum card leaves the purpose of the tablet open.'],
  bakhshali: ['The runner keeps a mark in the empty column and can read the three places back while moving the tray.',
    'The clerk leaves the empty place on the shared slip and puts the source’s different dates at the side. Two dates no longer share one cell.'],
};

function trialPicture(record: NumberLeaf, trial: 'a' | 'b') {
  if (record.slug === 'ishango') {
    const packs = NOTCH_PAIRS.map(([small, large]) => h('div', { class: 'number-leaf-pair' },
      ...[small, large].map((size) => h('div', { class: 'number-leaf-ticks', 'aria-label': `${size} marks` },
        `${size}`, ...Array.from({ length: size }, () => h('i', { 'aria-hidden': 'true' }))))));
    return h('div', { class: trial === 'a' ? 'number-leaf-joined' : 'number-leaf-separated' }, ...packs,
      h('p', {}, trial === 'a' ? 'In each pair the larger bundle uses twice as many marks. The clasp gives the reader that relationship.'
        : `The tray still holds ${countedNotches()} marks in these six groups alone. The total holds with the clasps open. Other groups on the bone stay outside this test.`));
  }
  if (record.slug === 'plimpton') {
    const sides = TRAINING_TRIANGLES[trial === 'a' ? 0 : 1];
    const fit = triangleFit(sides);
    return h('div', {}, h('div', { class: 'number-leaf-areas', 'aria-hidden': 'true' },
      h('span', { style: { width: `${sides[0] ** 2 / fit.longArea * 100}%` } }), h('span', { style: { width: `${sides[1] ** 2 / fit.longArea * 100}%` } })),
    h('p', {}, `For frame ${sides.join(' · ')}, the two shorter square areas add to ${fit.shortAreas}. The longest square covers ${fit.longArea}. The two filled pieces line up with the same area mark.`),
    h('p', { class: 'fine' }, 'These practice frames use their own lengths. The clay record stays at the exhibit.'));
  }
  if (trial === 'a') {
    const [gaps, gapValue] = placeWindow(true);
    const [joined, closeValue] = placeWindow(false);
    return h('div', {}, h('div', { class: 'number-leaf-digits', 'aria-hidden': 'true' }, ...gaps.map((digit) => h('span', {}, digit ? String(digit) : '●'))),
      h('p', {}, `The empty tens slot stays between the other places. The marked strip keeps ${gapValue}. Push its neighbours together and the two-digit strip shows ${joined.join('')}, or ${closeValue}.`));
  }
  return h('div', {}, h('div', { class: 'number-leaf-digits' }, ...['3rd–4th c.', '7th–8th c.', '9th–10th c.'].map((date) => h('span', {}, date))),
    h('p', {}, 'Bark dates now sit on their three tabs. The line for the writing date stays open beside them.'));
}

export function numberLeavesPanel(controller: GameController, place: string, sound: (key: string) => void, refresh: () => void) {
  const shell = h('section', { class: 'number-leaf-panel' });
  const flag = (name: string) => controller.state.flags[name];
  const update = (name: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag: name, value });
    sound('sfx.page');
    refresh();
  };
  const source = (entry: NumberLeaf) => h('a', { href: entry.url, target: '_blank', rel: 'noopener' }, entry.accession);
  function reader(route: NumberLeafRoute) {
    const copies = NUMBER_LEAVES.filter((entry) => flag(`${entry.flag}.sent`) === route);
    shell.append(h('h2', {}, READERS[route]));
    if (!copies.length) shell.append(h('p', {}, 'The clip is empty. Bring a slip from a checked model.'));
    for (const entry of copies) {
      const reply = h('p', { role: 'status' });
      const use = () => {
        reply.textContent = entry[route === 'method' ? 'methodReply' : 'contextReply'];
        hook.textContent = 'On the reader’s clip';
        hook.disabled = true;
      };
      const hook = h('button', { type: 'button', onclick: () => {
        update(`${entry.flag}.filed`, route); use(); reply.tabIndex = -1; reply.focus();
      } }, `Clip the slip for ${entry.accession}`);
      if (flag(`${entry.flag}.filed`) === route) use();
      shell.append(h('article', {}, h('h3', {}, entry.title), source(entry), hook, reply));
    }
  }
  function market() {
    shell.append(h('h2', {}, 'The market’s numbered references'));
    for (const entry of NUMBER_LEAVES.filter((record) => controller.state.objectivesDone.includes(record.objective))) {
      const result = h('p', { role: 'status' });
      const read = () => { result.textContent = flag(`${entry.flag}.market`) === 'method' ? entry.market
        : `The finding slip keeps ${entry.accession} in reach. ${entry.limit}`; };
      const row = NUMBER_LEAF_ROUTES.map((route) => h('button', { type: 'button', onclick: () => {
        update(`${entry.flag}.market`, route); update('number-leaf.market.used', true); setPressed(); read();
      } }, route === 'method' ? 'Send the checked method to the trainee' : 'Leave the source limits by the scale'));
      const setPressed = () => row.forEach((button, index) => button.setAttribute('aria-pressed',
        String(flag(`${entry.flag}.market`) === NUMBER_LEAF_ROUTES[index])));
      if (flag(`${entry.flag}.market`)) read();
      setPressed();
      shell.append(h('article', {}, h('h3', {}, entry.title), source(entry), h('div', { class: 'row' }, row), result));
    }
  }
  if (place === 'method' || place === 'context') { reader(place); return shell; }
  if (place === 'market') { market(); return shell; }
  if (place.startsWith('return-')) {
    const record = NUMBER_LEAVES.find(({ slug }) => slug === place.slice('return-'.length));
    if (!record) return shell;
    const result = h('p', { role: 'status', class: 'fine' });
    const marked = `${record.flag}.return`;
    const read = () => {
      const held = flag(marked);
      result.textContent = held === 'practice' ? RETURN_LINES[record.slug][0]
        : held === 'reserve' ? RETURN_LINES[record.slug][1] : 'You can leave an immediate guide or keep a second reading open.';
    };
    const choice = (key: 'practice' | 'reserve', text: string) => h('button', { type: 'button', onclick: () => {
      update(marked, key); read();
    } }, text);
    shell.append(h('h2', {}, record.revisit.method), trialPicture(record, 'a'),
      h('div', { class: 'row' }, choice('practice', 'Set the working pattern on the rail'),
        choice('reserve', 'Leave both readings in reach')), result);
    read();
    return shell;
  }
  const found = NUMBER_LEAVES.find((record) => record.slug === place);
  if (!found) return shell;
  const entry: NumberLeaf = found;
  const picture = h('div', { class: 'number-leaf-trial', role: 'status' });
  const status = h('p', { class: 'fine', role: 'status' });
  const trials = (['a', 'b'] as const).map((trial, index) => h('button', { type: 'button', onclick: () => {
    picture.replaceChildren(trialPicture(entry, trial));
    update(`${entry.flag}.trial.${trial}`, true);
    checkRoutes();
  } }, TRIALS[place][index]));
  const paths = NUMBER_LEAF_ROUTES.map((route) => h('button', { type: 'button', onclick: () => {
    update(`${entry.flag}.sent`, route);
    checkRoutes();
  } }, route === 'method' ? 'Send a practice slip to Lella' : 'Send the source and its limits to Omrin'));
  function checkRoutes() {
    const ready = flag(`${entry.flag}.trial.a`) === true && flag(`${entry.flag}.trial.b`) === true;
    const destination = flag(`${entry.flag}.sent`);
    paths.forEach((control, index) => {
      control.disabled = !ready;
      control.setAttribute('aria-pressed', String(destination === NUMBER_LEAF_ROUTES[index]));
    });
    status.textContent = destination === 'method' || destination === 'context' ? `A reader is waiting for the slip at ${READERS[destination]}.`
      : ready ? entry.limit : 'Try two checks and see which pieces travel together.';
  }
  shell.append(h('h2', {}, entry.title), h('p', {}, entry.observation), h('p', { class: 'fine' }, source(entry)),
    h('div', { class: 'row' }, trials), picture, status, h('div', { class: 'row' }, paths));
  checkRoutes();
  return shell;
}
