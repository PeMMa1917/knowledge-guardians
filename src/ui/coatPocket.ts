import type { GameController } from '../app/controller';
import { playNotes } from '../app/ambience';
import { pocketStories } from '../content/pocketStories';
import {
  coatKey,
  coatEndings,
  coatNames,
  coatWitnesses,
  currentSetting,
  pocketEdition,
  pocketPlace,
  pocketPulls,
  pocketSender,
  type PocketCommand,
} from '../domain/pocketCoat';
import { pocketProof, type PocketProof } from '../domain/pocketProof';
import { h } from './dom';
import './coatPocket.css';

function impression(proof: PocketProof) {
  const origin = proof.origin ?? 0;
  const scale = Math.max(origin + 1, ...(proof.marks ?? []).map((row) => row.value));
  return h(
    'div',
    { class: 'coat-paper', 'data-concept-paper': true },
    h('p', { class: 'coat-face' }, proof.face),
    ...(proof.marks
      ? [
          h(
            'div',
            { class: 'coat-bars', 'aria-label': 'Impression on the scale' },
            ...proof.marks.map(({ name, value }) =>
              h(
                'div',
                {},
                h('span', {}, name),
                h(
                  'span',
                  { class: 'coat-track', 'aria-hidden': 'true' },
                  h('i', { style: { width: (100 * (value - origin)) / (scale - origin) + '%' } }),
                ),
                h('span', {}, String(value) + (proof.unit ?? '')),
              ),
            ),
          ),
        ]
      : []),
    ...proof.traces.map((line) => h('p', {}, line)),
  );
}
export function coatPanel(c: GameController, site: string, volume: () => number, refresh: () => void) {
  const p = pocketStories[site],
    source = pocketSender(site)!,
    sender = pocketStories[source];
  const body = h('div', {}),
    live = h('p', { role: 'status', class: 'coat-live' }),
    title = 'The blue shift coat';
  const panel = h(
    'section',
    { class: 'coat-panel' },
    h('h2', {}, p.title),
    h('p', { class: 'coat-opening' }, p.opening),
    live,
    body,
  );
  let stop = () => {};
  function run(cmd: PocketCommand, message: string, focusKey: string) {
    const error = c.dispatch(cmd).find((e) => e.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    stop();
    refresh();
    draw();
    live.textContent = message;
    const restored = [...body.querySelectorAll<HTMLElement>('[data-coat-focus]')].find(
      (el) => el.dataset.coatFocus === focusKey,
    );
    restored?.focus({ preventScroll: true });
  }
  function action(text: string, key: string, cmd: PocketCommand, message: string) {
    return h(
      'button',
      { type: 'button', 'data-coat-focus': key, onclick: () => run(cmd, message, key) },
      text,
    );
  }
  function draw() {
    const s = c.state,
      setting = currentSetting(s, site),
      seen = pocketPulls(s, site);
    const last = Number(s.flags[coatKey(site, 'last')] ?? 0) - 1;
    const own = pocketEdition(s, site, 'sent'),
      sent = pocketEdition(s, source, 'sent'),
      read = pocketEdition(s, source, 'read');
    const gotReply = pocketEdition(s, site, 'read');
    const lastProof = last >= 0 && last < 4 ? pocketProof(site, last) : undefined;
    const compared =
      !!(seen & (1 << setting)) && [0, 1].some((i) => !!(seen & (1 << (setting ^ (1 << i)))));
    const workshop = h(
      'section',
      {},
      h('h3', {}, 'At the worktable'),
      ...p.controls.map(([label, left, right], i) => {
        const select = h(
          'select',
          { 'aria-label': label, 'data-coat-focus': 'fit' + i },
          h('option', { value: '0' }, left),
          h('option', { value: '1' }, right),
        );
        select.value = String((setting >> i) & 1);
        select.addEventListener('change', () =>
          run(
            {
              type: 'WorkCoatPocket',
              action: 'turn',
              rail: i as 0 | 1,
              side: Number(select.value) as 0 | 1,
            },
            'Fitting moved. Try it to leave an impression.',
            'fit' + i,
          ),
        );
        return h('label', { class: 'coat-fitting' }, label, select);
      }),
      action(p.run, 'pull', { type: 'WorkCoatPocket', action: 'pull' }, pocketProof(site, setting).face),
      lastProof
        ? h('section', {}, h('h4', {}, 'Last impression'), impression(lastProof))
        : h('p', {}, 'Try the tool. Then change one fitting and try it again. Both impressions stay here.'),
    );
    if (lastProof?.pitches)
      workshop.append(
        h(
          'button',
          {
            type: 'button',
            onclick: () => {
              stop();
              const notes = lastProof.pitches!.flatMap((f, i) =>
                f ? [{ f, at: site === 'stage' ? Math.floor(i / 2) : i, beats: 0.72 }] : [],
              );
              stop = playNotes(
                notes,
                site === 'stage' ? 0.38 : 0.21,
                site === 'stage' ? 'marimba' : 'pluck',
                volume(),
              );
            },
          },
          'Hear this impression',
        ),
      );
    if (seen) {
      const printRack = h('details', {}, h('summary', {}, 'Earlier impressions on this table'));
      for (let i = 0; i < 4; i++)
        if (seen & (1 << i))
          printRack.append(
            h(
              'section',
              {},
              h('h4', {}, p.controls[0][1 + (i & 1)] + ' · ' + p.controls[1][1 + (i >> 1)]),
              impression(pocketProof(site, i)),
            ),
          );
      workshop.append(printRack);
    }
    const outgoing = h('section', {}, h('h3', {}, 'Pocket for ' + pocketPlace(p.to)));
    if (compared)
      outgoing.append(
        ...p.seams.map((name, i) =>
          action(
            name,
            'sew' + i,
            { type: 'WorkCoatPocket', action: 'stitch', seam: i as 0 | 1 },
            'Sewn in. Find the blue coat at ' + pocketPlace(p.to) + ' to see who opens it.',
          ),
        ),
      );
    else
      outgoing.append(
        h('p', {}, 'To sew this setting in, try it and one neighbouring arrangement on the table.'),
      );
    if (own)
      outgoing.append(
        h('p', {}, 'Sewn inside: ' + pocketProof(site, own.setting).face + ' ' + p.seams[own.seam] + '.'),
      );
    if (gotReply)
      outgoing.append(
        h(
          'blockquote',
          {},
          'Word back from ' +
            pocketPlace(p.to) +
            ': ' +
            p.replies[gotReply.seam] +
            ' They opened the copy that said: ' +
            pocketProof(site, gotReply.setting).face,
        ),
      );
    const incoming = h('section', {}, h('h3', {}, 'Lining from ' + pocketPlace(source)));
    if (sent)
      incoming.append(
        action(
          read?.value === sent.value ? 'Open the sewn pocket again' : 'Open the sewn pocket',
          'read',
          { type: 'WorkCoatPocket', action: 'read' },
          sender.replies[sent.seam],
        ),
      );
    else
      incoming.append(
        h(
          'p',
          {},
          'The thread leads to “' +
            sender.title +
            '” at ' +
            pocketPlace(source) +
            '. The pocket is still empty.',
        ),
      );
    if (read) {
      incoming.append(
        h('blockquote', {}, sender.replies[read.seam]),
        h('h4', {}, 'As it arrived'),
        impression(pocketProof(source, read.setting)),
      );
      sender.controls.forEach(([name, left, right], i) => {
        const rail = i as 0 | 1,
          alternate = read.setting ^ (1 << rail);
        incoming.append(
          action(
            'Try the travelling tool: ' + [left, right][(alternate >> rail) & 1],
            'counter' + i,
            { type: 'WorkCoatPocket', action: 'recheck', rail },
            'Second impression beside the original. ' + pocketProof(source, alternate).face,
          ),
        );
        if (s.flags[coatKey(site, 'counter' + i)] === read.value)
          incoming.append(
            h(
              'details',
              { open: true },
              h('summary', {}, 'With ' + name.toLowerCase() + ' changed'),
              impression(pocketProof(source, alternate)),
            ),
          );
      });
    }
    const count = coatNames(s).length;
    const lining = h(
      'section',
      {},
      h('h3', {}, 'Inside the lining'),
      h(
        'p',
        {},
        count < 3
          ? count +
              ' of three keepers have opened a pocket. Each opened seam uncovers another line in the lining.'
          : 'Three sets of initials. The coat never belonged to one keeper. It waited beside the door for whoever took the shift nobody signed for. Ise’s mother was the one who kept putting it back.',
      ),
    );
    if (count >= 3) {
      for (const [i, label] of [
        'Hang the coat on the spare chair',
        'Unpick the pockets for their keepers',
      ].entries())
        lining.append(
          action(
            label,
            'ending' + i,
            { type: 'WorkCoatPocket', action: 'finish', seam: i as 0 | 1 },
            coatEndings[i],
          ),
        );
      const ending = s.flags['coat.ending'];
      if (ending === 0 || ending === 1)
        lining.append(
          h('blockquote', {}, coatEndings[ending]),
          h(
            'details',
            {},
            h('summary', {}, 'The impressions inside this ending'),
            ...coatWitnesses(s, ending).map((r) => h('p', {}, r)),
          ),
        );
    }
    body.replaceChildren(workshop, outgoing, incoming, lining);
  }
  draw();
  return { title, panel, dispose: () => stop() };
}
