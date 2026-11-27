import type { GameController } from '../app/controller';
import {
  millAccounts,
  millClaims,
  millCorrections,
  millHands,
  millPages,
  millWorkers,
  type MillSite,
} from '../content/millShift';
import {
  oldMillShifts,
  millClaim,
  millEdition,
  millMoves,
  millProof,
  millPurse,
  millReturn,
  millRig,
  millRigName,
  millRunMask,
  millStrip,
  millStripText,
  millTense,
  purseLine,
  purseReply,
  runMill,
  type MillCommand,
} from '../domain/millShift';
import { h } from './dom';

const two = [0, 1] as const,
  three = [0, 1, 2] as const;
type Move = MillCommand extends infer C ? (C extends MillCommand ? Omit<C, 'type'> : never) : never;
export function millPanel(c: GameController, site: MillSite, sound: () => void) {
  const job = millAccounts[site],
    body = h('div', {}),
    live = h('p', { role: 'status', class: 'mill-status' });
  const root = h(
    'section',
    { class: 'mill-work' },
    h('h2', {}, job.title),
    h('p', {}, job.opening),
    live,
    body,
  );
  function act(move: Move, key: string) {
    const events = c.dispatch({ type: 'WorkMillShift', ...move });
    const error = events.find((e) => e.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    draw();
    sound();
    if (move.action === 'coin') live.textContent = purseLine(millPurse(c.state)!) + '.';
    else if (move.action === 'stroke' || move.action === 'undo') {
      const run = runMill(millRig(c.state), millMoves(c.state));
      live.textContent = 'Bell ' + run.bells.length + '. ' + run.cut + ' cut, ' + run.rack + ' waiting.';
    } else if (move.action === 'return') {
      live.textContent =
        site === 'yard' && millEdition(c.state)?.audience === 0
          ? 'Liri opened the workers’ stair beside Bayette’s type case.'
          : site === 'nile' && millEdition(c.state)?.audience === 1
            ? 'Imani unlatched the letter chute beside Bayette’s type case.'
            : 'The signed proof is open at this register.';
    } else if (move.action === 'send') live.textContent = millCorrections[move.audience].reply;
    else
      live.textContent =
        move.action === 'arrive'
          ? job.guestName + ' has taken the next seat.'
          : move.action === 'purse'
            ? 'Bayette has your settlement.'
            : move.action === 'stamp'
              ? 'Bayette has this four-bell strip.'
              : move.action === 'try-estimate'
                ? 'Both estimates lie beside the tried strip.'
                : move.action === 'rig'
                  ? 'Your punches stay in place on the new run.'
                  : move.action === 'lay'
                    ? 'All six counters are on the rail.'
                    : move.action === 'bind'
                      ? 'Four dated tickets have been regrouped.'
                      : 'The wet proof has changed.';
    const control = body.querySelector<HTMLElement>('[data-mill="' + key + '"]:not([disabled])');
    (control ?? body.querySelector<HTMLElement>('button:not([disabled])'))?.focus({ preventScroll: true });
  }
  function button(label: string, key: string, move: Move, pressed?: boolean, disabled = false) {
    const el = h(
      'button',
      { type: 'button', 'data-mill': key, disabled, onclick: () => act(move, key) },
      label,
    );
    if (pressed !== undefined) el.setAttribute('aria-pressed', String(pressed));
    return el;
  }
  function pay() {
    const bowls = millPurse(c.state),
      sent = millPurse(c.state, true);
    const books = h(
      'div',
      { class: 'row' },
      ...['Lay the counters by bells worked', 'Lay them by stamped boards'].map((name, i) =>
        button(name, 'book' + i, { action: 'lay', book: two[i] }),
      ),
    );
    const rail = h('div', { class: 'mill-bowls' });
    if (bowls)
      for (const who of three) {
        const pile = h('span', { class: 'mill-coins', 'aria-hidden': 'true' });
        for (let i = 0; i < bowls[who]; i++) pile.append(h('i', {}));
        rail.append(
          h(
            'section',
            {},
            h('h3', {}, millWorkers[who]),
            pile,
            h('p', {}, bowls[who] + ' counters. ' + millHands[who]),
            ...three
              .filter((i) => i !== who)
              .map((to) =>
                button(
                  'Move one to ' + millWorkers[to],
                  'coin' + who + to,
                  { action: 'coin', from: who, to },
                  undefined,
                  !bowls[who],
                ),
              ),
          ),
        );
      }
    const both = c.state.flags['mill-shift.nile.compared'] === true;
    body.append(
      books,
      ...two
        .filter((i) => c.state.flags['mill-shift.nile.book' + i])
        .map((i) => h('p', { class: 'clue-view' }, millPages[i])),
      rail,
      both
        ? button('Tie the six counters into purses', 'settle', { action: 'purse' })
        : h(
            'p',
            { class: 'fine' },
            'Open both books to see who each rule pays. You can move individual counters between the bowls.',
          ),
      ...(sent ? [h('p', {}, 'Sent to Bayette. ' + purseLine(sent) + '. ' + purseReply(sent))] : []),
    );
  }
  function wheel() {
    const rig = millRig(c.state),
      moves = millMoves(c.state),
      trial = runMill(rig, moves);
    const gear = (rig % 2) as 0 | 1,
      porter = (rig >= 2 ? 1 : 0) as 0 | 1;
    const settings = h(
      'div',
      { class: 'mill-rig' },
      h(
        'div',
        { class: 'row', role: 'group', 'aria-label': 'Iron tooth' },
        ...two.map((tooth) =>
          button(
            tooth ? 'Mount Liri’s second tooth' : 'Mount the old single tooth',
            'gear' + tooth,
            { action: 'rig', tooth, porter },
            gear === tooth,
          ),
        ),
      ),
      h(
        'div',
        { class: 'row', role: 'group', 'aria-label': 'Shift rota' },
        ...two.map((p) =>
          button(
            p ? 'Work beside Tessel' : 'Take the shift alone',
            'porter' + p,
            { action: 'rig', tooth: gear, porter: p },
            porter === p,
          ),
        ),
      ),
    );
    const beats = h('ol', { class: 'mill-beats', 'aria-label': 'Four-bell punch strip' });
    for (let i = 0; i < 4; i++) {
      const b = trial.bells[i];
      beats.append(
        h(
          'li',
          { 'data-stroke': b?.move ?? 'open' },
          h('strong', {}, 'Bell ' + (i + 1)),
          h(
            'span',
            {},
            b ? (b.move === 'f' ? 'Fed three blanks' : 'Cut ' + b.got) + ' · ' + b.rack + ' waiting' : 'Open',
          ),
        ),
      );
    }
    const strip = millStrip(c.state),
      mask = millRunMask(c.state, moves);
    body.append(
      h(
        'p',
        {},
        'You get four moves. Feeding puts three blanks on the rack. Turning cuts one or two, up to the blanks in reach. If Tessel is here, he brings one blank on every turn.',
      ),
      settings,
      beats,
      h('p', {}, trial.cut + ' notches cut. ' + trial.rack + ' blanks left.'),
      h(
        'div',
        { class: 'row' },
        button(
          'Feed three blanks',
          'feed',
          { action: 'stroke', move: 'feed' },
          undefined,
          moves.length === 4,
        ),
        button('Turn the wheel', 'turn', { action: 'stroke', move: 'turn' }, undefined, moves.length === 4),
        button('Lift the last punch', 'undo', { action: 'undo' }, undefined, moves.length === 0),
        button('Stamp this four-bell run', 'stamp', { action: 'stamp' }, undefined, moves.length !== 4),
      ),
    );
    if (mask) {
      const board = h('section', {}, h('h3', {}, 'Tried with these same four moves'));
      for (let r = 0; r < 4; r++)
        if (mask & (1 << r))
          board.append(h('p', {}, millRigName(r) + ' · ' + runMill(r, moves).cut + ' cut.'));
      body.append(board);
    }
    if (c.state.flags['mill-shift.yard.joint'] === true)
      body.append(
        h(
          'p',
          { class: 'clue-view' },
          'Hesper sets two fingers on the joint in the wood. On one of your strips, changing either the tooth or the rota alone left the output where it was. Trying both together increased it. She keeps that strip for her apprentice.',
        ),
      );
    if (strip) body.append(h('p', {}, 'Last strip at the press. ' + millStripText(strip)));
  }
  function press() {
    const claim = millClaim(c.state),
      tense = millTense(c.state),
      purse = millPurse(c.state, true),
      strip = millStrip(c.state);
    const axis = c.state.flags['mill-shift.press.axis'];
    const grouping = h(
      'section',
      {},
      h('h3', {}, 'Four dated shifts'),
      h(
        'div',
        { class: 'row' },
        button('Bind by the tooth fitted', 'bind-tooth', { action: 'bind', axis: 'tooth' }, axis === 'tooth'),
        button(
          'Bind by who could work the shift',
          'bind-rota',
          { action: 'bind', axis: 'rota' },
          axis === 'rota',
        ),
      ),
    );
    if (axis === 'tooth' || axis === 'rota') {
      for (const group of two) {
        const rows = oldMillShifts.filter((d) => d.rig === (group ? 3 : 0));
        const name =
          axis === 'tooth' ? (group ? 'Two teeth' : 'One tooth') : group ? 'Two workers' : 'One worker';
        grouping.append(
          h(
            'p',
            { class: 'clue-view' },
            name +
              '. ' +
              rows.map((d) => 'Day ' + d.day + ' · ' + d.cut + ' notches').join(' / ') +
              '. Average ' +
              (rows[0].cut + rows[1].cut) / 2 +
              '.',
          ),
        );
      }
      grouping.append(
        h(
          'p',
          {},
          axis === 'rota'
            ? 'Day 13. A guild minute admits a porter to the feed rack. The pay book continues to name the hands that stamped boards.'
            : 'Day 13. The apprentice fits a second iron tooth. The foreperson keeps the old one in the rack.',
        ),
      );
    }
    if (c.state.flags['mill-shift.press.bound-tooth'] && c.state.flags['mill-shift.press.bound-rota']) {
      if (strip && (strip.rig === 1 || strip.rig === 2))
        grouping.append(
          button('Try both estimates on Hesper’s strip', 'estimate', { action: 'try-estimate' }),
        );
      else
        grouping.append(
          h(
            'p',
            { class: 'fine' },
            'Stamp a run with the double tooth alone or the single tooth beside Tessel. Both arrangements are missing from these dates.',
          ),
        );
    }
    const estimate = c.state.flags['mill-shift.press.estimate'];
    if (typeof estimate === 'string') grouping.append(h('p', {}, estimate));
    body.append(grouping);
    body.append(
      h(
        'section',
        { class: 'mill-sources' },
        h('h3', {}, 'On the compositor’s stone'),
        h(
          'p',
          {},
          'The old morning notice credits the tooth. The signed rota puts a second worker at the rack that same morning. Both changes came before the six stamped boards. The notice gives no trial of either change alone.',
        ),
        h(
          'p',
          {},
          purse
            ? 'Six counters from Imani. ' + purseLine(purse) + '.'
            : 'Imani’s pay slip has yet to come from the Nile register.',
        ),
        h(
          'p',
          {},
          strip
            ? 'Hesper’s strip. ' + millStripText(strip)
            : 'Hesper’s tried strip has yet to come from the Metalworks register.',
        ),
      ),
      h(
        'div',
        { class: 'row' },
        ...three.map((i) =>
          button(millClaims[i].title, 'frame' + i, { action: 'typeset', claim: i }, claim === i),
        ),
      ),
    );
    if (claim !== undefined)
      body.append(h('p', { class: 'clue-view' }, millClaims[claim].line + ' ' + millClaims[claim].lead));
    body.append(
      h(
        'div',
        { class: 'row' },
        button(
          'Set what the dated book records',
          'docket',
          { action: 'tense', mode: 'docket' },
          tense === 'docket',
        ),
        button(
          'Set “had stayed” with “could have cut”',
          'rehearsal',
          { action: 'tense', mode: 'rehearsal' },
          tense === 'rehearsal',
        ),
        button(
          'Set “comes tomorrow” with “can feed”',
          'tomorrow',
          { action: 'tense', mode: 'tomorrow' },
          tense === 'tomorrow',
        ),
      ),
    );
    const proof = millProof(c.state),
      edition = millEdition(c.state);
    if (proof)
      body.append(h('section', { class: 'mill-proof' }, h('h3', {}, 'Wet proof'), h('p', {}, proof)));
    if (proof && (purse || strip))
      body.append(
        h(
          'div',
          { class: 'row' },
          ...two.map((i) => button(millCorrections[i].title, 'send' + i, { action: 'send', audience: i })),
        ),
      );
    else
      body.append(
        h(
          'p',
          { class: 'fine' },
          'Set the two lines. Bring a purse from the Nile pay desk or a tried strip from the Metalworks to send an edition.',
        ),
      );
    if (edition)
      body.append(
        h(
          'details',
          {},
          h('summary', {}, 'Last edition sent'),
          h('p', {}, edition.text),
          h('p', {}, millReturn(c.state, 'press')),
        ),
      );
  }
  function draw() {
    body.replaceChildren();
    if (c.state.flags['mill-shift.' + site + '.open'] !== true) {
      body.append(button('Take the shift with ' + job.guestName, 'arrive', { action: 'arrive' }));
      return;
    }
    body.append(h('p', { class: 'clue-view' }, job.work));
    if (site === 'nile') pay();
    else if (site === 'yard') wheel();
    else press();
    if (site !== 'press' && millEdition(c.state)) {
      body.append(button('Unfold Bayette’s reply', 'reply', { action: 'return' }));
      if (c.state.flags['mill-shift.' + site + '.read'])
        body.append(
          h(
            'details',
            {},
            h('summary', {}, 'The proof I opened here'),
            h('p', {}, String(c.state.flags['mill-shift.' + site + '.opened-leaf'])),
            h('p', {}, String(c.state.flags['mill-shift.' + site + '.opened-reply'])),
          ),
        );
    }
    body.append(h('p', { class: 'fine' }, job.lead));
  }
  draw();
  return root;
}
