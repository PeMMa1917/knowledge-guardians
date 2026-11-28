import type { GameController } from '../app/controller';
import { KUNIT_KEY } from '../content/turningTable';
import { check } from '../domain/rules';
import { specimenEquipped } from '../domain/specimenGear';
import {
  cellAt,
  contributors,
  editionOf,
  finePrint,
  landings,
  nameForms,
  neighbours,
  places,
  portions,
  postLegends,
  proposalNames,
  proposed,
  publication,
  releases,
  riverDiary,
  riverFlag,
  scaleOf,
  scales,
  sealedWalks,
  season,
  sourceWords,
  walked,
  walkResult,
  type RiverCommand,
  type TextLeaf,
} from '../domain/riverNames';
import { h } from './dom';
import { artURL } from './illustrations';
import { localGuide } from './localGuide';
import './riverNames.css';

export const riverBenches = ['spool', 'stamp', 'leaves', 'press', 'receive', 'council'] as const;
type Bench = (typeof riverBenches)[number];
type Move = RiverCommand extends infer C ? (C extends RiverCommand ? Omit<C, 'type'> : never) : never;
const sourceTitles: Record<TextLeaf, string> = {
  names: 'Inuit Heritage Trust · Nunavut place names',
  plan: 'Pitquhirnikkut Ilihautiniq · Inuinnaqtun language plan',
  partners: 'Bartlett, Marshall and Marshall · co-learning',
};
const scaleNames = { door: 'Single door', block: 'Block', district: 'District' };
const image = (id: string) =>
  h('img', { src: artURL('rivernames.' + id), alt: '', class: 'river-post-art' });
export const benchNames: Record<Bench, string> = {
  spool: 'The parcel thread',
  stamp: 'The stamp with an eye',
  leaves: 'Three source leaves',
  press: 'The forwarding packet',
  receive: 'The first delivery',
  council: 'The extra stool',
};
export function ovenPanel(c: GameController, sound: (key: string) => void, bench: Bench) {
  const body = h('div'),
    live = h('p', {
      class: 'river-post-feedback',
      role: 'status',
      'aria-live': 'polite',
      'data-work-feedback': '',
    });
  const root = h(
    'section',
    { class: 'river-post', 'data-reading-bench': '', 'data-river-bench': bench },
    body,
    live,
  );
  const flag = (id: string) => riverFlag(c.state, id);
  const far = bench === 'receive' || bench === 'council';
  const guide = localGuide(
    c,
    far ? 'WORLD-12' : 'WORLD-09',
    () =>
      'rivernames.' +
      {
        spool: 'walks',
        stamp: 'smallblock',
        press: 'issue',
        leaves: 'placename',
        receive: 'quay',
        council: 'partners',
      }[bench],
  );
  let streetListOpen = false;
  let point = walked(c.state).at(-1)!,
    latestLeaf: TextLeaf | undefined;
  function run(move: Move, key: string) {
    const command: RiverCommand = { type: 'WalkRiverNames', ...move };
    const error = c.dispatch(command).find((event) => event.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    const detail = riverDiary(c.state, command);
    if (move.act === 'leaf') latestLeaf = move.leaf;
    if (['water', 'step', 'clear', 'back'].includes(move.act)) point = walked(c.state).at(-1)!;
    sound(
      move.act === 'receive' || move.act === 'release'
        ? 'sfx.pickup'
        : move.act === 'step'
          ? 'sfx.step'
          : 'sfx.page',
    );
    draw();
    const control =
      root.querySelector<HTMLElement>('[data-river="' + key + '"]') ??
      (move.act === 'step'
        ? root.querySelector<HTMLElement>('[data-river="cell-' + point + '"]')
        : null);
    control?.focus({ preventScroll: true });
    live.textContent = detail.text;
  }
  function btn(id: string, label: string, cmd: Move, pressed?: boolean) {
    return h(
      'button',
      {
        type: 'button',
        'data-river': id,
        ...(pressed === undefined ? {} : { 'aria-pressed': String(pressed) }),
        onclick: () => run(cmd, id),
      },
      label,
    );
  }
  const row = (...children: HTMLElement[]) => h('div', { class: 'river-post-row' }, ...children);
  const p = (line: string) => h('p', {}, line);
  function tide() {
    return row(
      ...landings.map((w) =>
        btn(
          'water-' + w,
          w === 'ebb' ? 'Low water' : 'High water',
          { act: 'water', water: w },
          season(c.state) === w,
        ),
      ),
    );
  }
  function weaveGrid() {
    const thread = walked(c.state),
      end = thread.at(-1)!;
    const field = h('div', {
      class: 'river-names-grid',
      role: 'group',
      'aria-label': 'Street map. Use arrow keys between squares, then Enter or Space to lay a stitch.',
    });
    places.forEach((place, i) => {
      const sq = btn('cell-' + i, place, { act: 'step', cell: i });
      const { col, row } = cellAt(i),
        pos = thread.indexOf(i);
      sq.setAttribute('tabindex', point === i ? '0' : '-1');
      sq.classList.toggle('river-threaded', pos >= 0);
      sq.classList.toggle('river-thread-end', i === end);
      sq.setAttribute(
        'aria-label',
        place +
          ', row ' +
          (row + 1) +
          ', column ' +
          (col + 1) +
          (pos < 0 ? '' : ', stitch ' + (pos + 1)) +
          (i === end ? ', thread end' : ''),
      );
      sq.prepend(
        h(
          'span',
          { 'aria-hidden': 'true', class: 'river-cell-mark' },
          pos >= 0 ? String(pos + 1) : neighbours(end, i) ? '·' : '',
        ),
      );
      sq.addEventListener('keydown', (e) => {
        const k = e.key;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(k)) return;
        e.preventDefault();
        e.stopPropagation();
        const target =
          k === 'Home'
            ? row * 5
            : k === 'End'
              ? row * 5 + 4
              : k === 'ArrowUp'
                ? Math.max(0, row - 1) * 5 + col
                : k === 'ArrowDown'
                  ? Math.min(3, row + 1) * 5 + col
                  : k === 'ArrowLeft'
                    ? row * 5 + Math.max(0, col - 1)
                    : row * 5 + Math.min(4, col + 1);
        focusCell(target);
      });
      sq.addEventListener('focus', () => {
        point = i;
        for (const b of field.querySelectorAll<HTMLButtonElement>('button'))
          b.tabIndex = b === sq ? 0 : -1;
      });
      field.append(sq);
    });
    function focusCell(i: number) {
      field.querySelector<HTMLButtonElement>('[data-river="cell-' + i + '"]')?.focus();
    }
    return field;
  }
  function streetList(end: number) {
    const fold = h(
      'details',
      { class: 'river-directions' },
      h('summary', {}, 'Walk by street directions'),
    );
    fold.open = streetListOpen;
    fold.addEventListener('toggle', () => {
      if (fold.isConnected) streetListOpen = fold.open;
    });
    for (const [name, offset] of [
      ['north', -5],
      ['east', 1],
      ['south', 5],
      ['west', -1],
    ] as const) {
      const next = end + offset;
      if (next >= 0 && next < places.length && neighbours(end, next))
        fold.append(
          btn('dir-' + name, 'Go ' + name + ' to ' + places[next], { act: 'step', cell: next }),
        );
    }
    return fold;
  }
  function spool() {
    const w = season(c.state),
      thread = walked(c.state),
      who = w === 'ebb' ? 'emlet' : 'rialla';
    const lead =
      w === 'ebb'
        ? 'Emlet waits at the West Rope with the flour. The old oven is down by the brick arch.'
        : 'Rialla has the letters. The red public shutter is at the other mooring.';
    body.append(
      image('threads'),
      p(lead),
      tide(),
      weaveGrid(),
      streetList(thread.at(-1)!),
      h('p', { class: 'river-post-route' }, thread.map((i) => places[i]).join(' → ')),
      row(
        btn('back', 'Lift a stitch', { act: 'back' }),
        btn('clear', 'Rewind to West Rope', { act: 'clear' }),
        btn('walk', 'Walk this thread', { act: 'walk' }),
      ),
      btn('skate', 'Call the oven skate', { act: 'warmfin' }),
    );
    if (flag('last.' + w))
      body.append(
        p(
          walkResult(
            String(flag('last.' + w))
              .split(',')
              .map(Number),
            w,
          ).text,
        ),
      );
    if (flag('walked.' + w))
      body.append(
        btn('hear', 'Hand the parcel to ' + (who === 'emlet' ? 'Emlet' : 'Rialla'), {
          act: 'hear',
          reader: who,
        }),
      );
    if (flag('heard.' + who))
      body.append(
        p('Put a proposal in the walker’s hands. They can keep it, move it or hand it back.'),
        row(
          ...nameForms.map((form) => btn('offer-' + form, proposalNames[form], { act: 'offer', form })),
        ),
      );
    if (proposed(c.state))
      body.append(
        p('Their two signatures are together on “' + proposalNames[proposed(c.state)!] + '”.'),
      );
  }
  function stamp() {
    body.append(
      image('shutter'),
      p(
        'Whoever stands on this quay can see which doors still take household bread. Rialla has left her own name off the stamp. Look at the same block after the tide turns.',
      ),
      tide(),
      row(
        ...scales.map((scale) =>
          btn('scale-' + scale, scaleNames[scale], { act: 'map', scale }, scale === scaleOf(c.state)),
        ),
      ),
      btn('simulate', 'Try the stamp from the quay', { act: 'simulate' }),
    );
    for (const w of landings) {
      const reading = flag('read.' + w + '.' + scaleOf(c.state));
      if (typeof reading === 'number')
        body.append(
          p(
            (w === 'ebb' ? 'Low water' : 'High water') +
              ' · ' +
              reading +
              ' possible ' +
              (reading === 1 ? 'door' : 'doors') +
              ' at this scale.',
          ),
        );
    }
    if (flag('read.' + season(c.state) + '.' + scaleOf(c.state))) body.append(p(finePrint(c.state)));
  }
  function leaves() {
    body.append(
      image('oven'),
      p(
        'These leaves keep their own names, authors and settings. Pendlow has left room beside them for the river family’s account.',
      ),
    );
    for (const leaf of Object.keys(sourceTitles) as TextLeaf[])
      body.append(btn('leaf-' + leaf, sourceTitles[leaf], { act: 'leaf', leaf }, leaf === latestLeaf));
    if (latestLeaf) body.append(p(sourceWords[latestLeaf]));
  }
  function press() {
    body.append(
      image('sack'),
      p(
        'A public shutter, a walker’s thimble or a sack without a street. Someone has to make each promise work.',
      ),
      p(
        'At the table · ' +
          (contributors(c.state)
            .map((v) => (v === 'emlet' ? 'Emlet' : 'Rialla'))
            .join(' and ') || 'two empty chairs'),
      ),
      row(
        ...releases.map((release) =>
          btn(
            'issue-' + release,
            postLegends[release],
            { act: 'release', release },
            editionOf(c.state) === release,
          ),
        ),
      ),
    );
    const e = editionOf(c.state);
    if (e)
      body.append(
        p(publication[e]),
        ...sealedWalks(c.state).map(p),
        btn('carry', 'Carry this packet to the Old Weir', { act: 'carry' }),
      );
  }
  function quay() {
    const e = editionOf(c.state);
    if (!e) return;
    body.append(
      image(e === 'window' ? 'shutter' : e === 'walk' ? 'threads' : 'sack'),
      p('The packet is here. Someone still has to carry it up the last few steps.'),
      btn('receive', 'Open the packet with its reader', { act: 'receive' }),
    );
    if (flag('received') === e)
      body.append(
        p(publication[e]),
        ...sealedWalks(c.state).map(p),
        row(
          btn('share-bread', 'Send a warm bag downstairs', { act: 'portion', share: 'bread' }),
          btn('share-post', 'Give the letter its next crossing', { act: 'portion', share: 'post' }),
          btn('share-guide', 'Give the guide a relief walker', { act: 'portion', share: 'guide' }),
        ),
      );
    const choice = flag('portion');
    if (choice && typeof choice === 'string' && Object.hasOwn(portions, choice))
      body.append(p(portions[choice as keyof typeof portions]));
  }
  function draw() {
    body.replaceChildren();
    if (bench === 'spool') spool();
    if (bench === 'stamp') stamp();
    if (bench === 'press') press();
    if (bench === 'receive') quay();
    if (bench === 'leaves') {
      leaves();
      if (check(specimenEquipped(KUNIT_KEY), c.state))
        body.append(
          p(
            'Set Kunit’s coast piece beside the original practice rack. Turn our rack while its neighbour stays still.',
          ),
          row(
            btn('touch', 'Feel the stop', { act: 'touch' }),
            btn('reverse', 'Turn the practice rack', { act: 'reverse' }),
          ),
        );
    }
    if (bench === 'council') {
      body.append(
        image('threads'),
        p('Pendlow gave you the pencil for the outward trip. Who gets a hand on it here?'),
      );
      leaves();
      body.append(
        row(
          btn('invite-one', 'Seat the neighbour who carries the basket', {
            act: 'council',
            turn: 'neighbour',
          }),
          btn('invite-two', 'Set a pair of stools for separate rounds', {
            act: 'council',
            turn: 'pair',
          }),
        ),
      );
    }
    body.append(guide);
  }
  draw();
  return root;
}
