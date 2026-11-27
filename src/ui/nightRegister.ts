import type { GameController } from '../app/controller';
import { nightFamilies } from '../content/nightFamilies';
import {
  traceMemory,
  memoryTraces,
  missingCaption,
  drawerAddress,
  captionFates,
  activeFriend,
  creatureTrails,
  trailMark,
  nightByFriend,
  nightLens,
  nightEdition,
  signedNames,
  nightEndings,
  nightFinding,
  nightFriendFlag,
  nightFriends,
  nightJob,
  nightParcel,
  nightReading,
  nightReceipt,
  nightWorks,
  type NightCommand,
  type NightFriend,
  type NightSite,
  type NightWork,
} from '../domain/nightRegister';
import { lanternDisplay, LANTERN_SITES } from '../domain/lamplight';
import { creaturePortrait } from './nightCreature';
import { h } from './dom';
import './nightRegister.css';

const button = (text: string, act: () => void) => h('button', { type: 'button', onclick: act }, text);
function editor(c: GameController, refresh: () => void) {
  const panel = h('section', { class: 'night-register' });
  const result = h('p', { role: 'status', class: 'night-result' });
  const body = h('div');
  panel.append(result, body);
  function work(cmd: NightCommand, render: () => void, line: string) {
    const error = c.dispatch(cmd).find((e) => e.kind === 'error');
    if (error) {
      result.textContent = error.message;
      return;
    }
    refresh();
    render();
    result.textContent = line;
    const focus = body.querySelector<HTMLElement>('[data-night-focus]');
    focus?.focus({ preventScroll: true });
  }
  return { panel, body, work };
}
const heading = (text: string) => h('h3', { tabindex: -1, 'data-night-focus': true }, text);
function pairedFrames(c: GameController, f: NightFriend) {
  const pair = creatureTrails.get(f.id)!;
  const both = pair.every((w) => nightEdition(c.state, trailMark(f, w)));
  return h(
    'details',
    {},
    h('summary', {}, f.name + '’s two-frame trail'),
    h(
      'p',
      {},
      both
        ? 'Both frames open together here. The catalogue uses the same classification for them. Compare the materials and what your tool showed in each.'
        : 'Two frames have caught ' +
            f.name +
            '’s attention. The gallery classifies both as “' +
            pair[0].kind +
            '”. Try ' +
            f.family.job.toLowerCase() +
            ' together at either one, compare the whole view and leave a reading.',
    ),
    ...pair.map((w) => {
      const edition = nightEdition(c.state, trailMark(f, w));
      return h(
        'section',
        {},
        h('strong', {}, w.title + ' · ' + w.site.title),
        h('p', {}, drawerAddress(w) + '. Mount ' + w.accession + '.'),
        both && edition
          ? h(
              'figure',
              {},
              h(
                'div',
                { class: 'night-window night-' + edition.family.mode },
                h('img', {
                  src: import.meta.env.BASE_URL + 'assets/' + w.image,
                  alt: w.title + ' by ' + w.maker,
                }),
              ),
              h(
                'figcaption',
                {},
                w.maker + ' · ' + w.date + ' · ' + w.medium + '. ' + w.site.replies[edition.choice],
              ),
            )
          : edition
            ? h('p', {}, f.name + ' has marked this frame.')
            : '',
      );
    }),
  );
}
export function nightPerch(c: GameController, site: NightSite, refresh: () => void) {
  const { panel, body, work } = editor(c, refresh);
  let selection: NightFriend | undefined,
    visitors = false;
  function draw() {
    const friend = selection;
    if (!friend) {
      const crew = nightFriends.filter((f) =>
        visitors ? c.state.flags[nightFriendFlag(f)] === true : f.site === site,
      );
      body.replaceChildren(
        heading(visitors ? 'My travelling companions' : 'The night perch'),
        h('p', {}, 'The perches are warm. ' + site.keeper + ' has left a place for you beside them.'),
        button(visitors ? 'Look at the home perches' : 'Call a companion I know', () => {
          visitors = !visitors;
          draw();
          body.querySelector('h3')?.focus();
        }),
        h(
          'div',
          { class: 'night-perches' },
          ...crew.map((f) => {
            const b = button(f.name + ' · ' + f.family.species, () => {
              selection = f;
              draw();
              body.querySelector('h3')?.focus();
            });
            b.prepend(creaturePortrait(f));
            return b;
          }),
        ),
        crew.length ? '' : h('p', {}, 'Wait beside a home perch to get to know someone.'),
      );
      return;
    }
    const met = c.state.flags[nightFriendFlag(friend)] === true,
      seen = c.state.flags['night.watch.' + friend.id] === true;
    const run = (action: 'watch' | 'travel' | 'rest', line: string) =>
      work({ type: 'WorkNightRegister', action, friend: friend.id }, draw, line);
    body.replaceChildren(
      heading(friend.name + ' · ' + friend.family.species),
      creaturePortrait(friend),
      h('p', {}, friend.family.sign),
      h('p', {}, friend.family.job + '. ' + friend.family.limit),
      !seen ? button('Wait by ' + friend.name, () => run('watch', friend.family.sign)) : '',
      seen && !met
        ? h(
            'div',
            { class: 'options' },
            ...[friend.family.gesture, friend.family.offer].map((label, i) =>
              button(
                label + ' · ' + (i === 0 ? 'scout for unvisited cases' : 'carry a reading between chapters'),
                () =>
                  work(
                    {
                      type: 'WorkNightRegister',
                      action: 'befriend',
                      friend: friend.id,
                      bond: i === 0 ? 'scout' : 'courier',
                    },
                    draw,
                    friend.family.trust,
                  ),
              ),
            ),
          )
        : '',
      met && c.state.flags['night.bond.' + friend.id] === 'scout' && activeFriend(c.state) === friend
        ? h(
            'p',
            {},
            (() => {
              const next = nightWorks.find(
                (w) => w.site === site && !c.state.flags['inspected.' + w.exhibit],
              );
              return next
                ? friend.name + ' is facing an unread frame. ' + drawerAddress(next) + '.'
                : 'Every frame in this room has been visited.';
            })(),
          )
        : '',
      met
        ? h(
            'blockquote',
            {},
            friend.family.trust +
              ' ' +
              (c.state.flags['night.bond.' + friend.id] === 'courier'
                ? 'It can remember a copy you showed it and carry it on to another chapter.'
                : 'It can guide you to the next unread case in a register room.'),
          )
        : '',
      met ? pairedFrames(c, friend) : '',
      met && friend.site === site
        ? button(
            c.state.flags['night.bond.' + friend.id] === 'scout'
              ? 'Practise carrying a copy instead'
              : 'Practise scouting for unread frames',
            () => {
              const bond = c.state.flags['night.bond.' + friend.id] === 'scout' ? 'courier' : 'scout';
              work(
                { type: 'WorkNightRegister', action: 'retrain', friend: friend.id, bond },
                draw,
                friend.name + ' is ready for the next shift.',
              );
            },
          )
        : '',
      met
        ? activeFriend(c.state) === friend
          ? button('Rest at the perch', () => run('rest', friend.name + ' has settled down.'))
          : button('Travel with ' + friend.name, () => run('travel', friend.name + ' comes to your side.'))
        : '',
      button('Back to the perches', () => {
        selection = undefined;
        draw();
        body.querySelector('h3')?.focus();
      }),
    );
  }
  draw();
  return panel;
}
export function nightCase(c: GameController, w: NightWork, refresh: () => void, updateClaim: () => void) {
  const { panel, body, work } = editor(c, refresh);
  const key = nightJob(w);
  function draw() {
    const chosen = nightFamilies.find((f) => f.mode === c.state.flags[key + '.method']);
    const checked = c.state.flags[key + '.checked'] === true,
      sent = c.state.flags[key + '.sent'];
    const friend = activeFriend(c.state),
      helper = nightByFriend.get(String(c.state.flags[key + '.helper']));
    const pick = h(
      'select',
      { 'aria-label': 'Choose a field tool' },
      ...nightFamilies.map((f) => h('option', { value: f.mode }, f.job)),
    );
    pick.value = chosen?.mode ?? friend?.family.mode ?? nightFamilies[0].mode;
    const perform = (cmd: NightCommand, signal: string) =>
      work(
        cmd,
        () => {
          draw();
          updateClaim();
        },
        signal,
      );
    const trial = (method: string) =>
      perform(
        { type: 'WorkNightRegister', action: 'trial', work: w.id, method },
        'The trial is on the stand.',
      );
    const src = import.meta.env.BASE_URL + 'assets/' + w.image;
    const view = (mode: string, text: string) =>
      h(
        'figure',
        {},
        h('div', { class: 'night-window night-' + mode }, h('img', { src, alt: w.title })),
        h('figcaption', {}, text),
      );
    const slip = missingCaption(c.state, w.site);
    const loose =
      slip === w
        ? h(
            'section',
            {},
            h('h4', {}, 'The loose plate fits'),
            h(
              'p',
              {},
              w.accession +
                ' is on both mounts. The catalogue gives this image its full caption: ' +
                w.title +
                ' · ' +
                w.maker +
                ' · ' +
                w.date +
                '.',
            ),
            ...['Stitch the caption to the sleeve', 'Stamp the accession and leave the caption here'].map(
              (label, i) =>
                button(label, () =>
                  perform(
                    { type: 'WorkNightRegister', action: 'bind-caption', work: w.id, choice: i as 0 | 1 },
                    captionFates[i as 0 | 1],
                  ),
                ),
            ),
          )
        : slip
          ? h(
              'p',
              {},
              'This frame reads ' +
                w.accession +
                '. The loose mount reads ' +
                slip.accession +
                '. ' +
                drawerAddress(slip) +
                '.',
            )
          : '';
    body.replaceChildren(
      heading('The night shift'),
      loose,
      h('p', {}, w.site.work),
      friend ? button(friend.name + ' · ' + friend.family.job, () => trial(friend.family.mode)) : '',
      h('label', {}, 'Hand tools ', pick),
      button('Try the selected tool', () => trial(pick.value)),
      chosen
        ? h(
            'section',
            {},
            h(
              'div',
              { class: 'night-views' },
              view(chosen.mode, chosen.job),
              checked
                ? view(
                    'original',
                    w.title + ' · ' + w.accession + ' · ' + w.maker + ' · ' + w.date + ' · ' + w.medium,
                  )
                : '',
            ),
            h('p', {}, (helper ? helper.name + ' worked beside me. ' : '') + chosen.limit),
            h('p', {}, nightReading(w, chosen.mode)),
            !checked
              ? button('Set the whole record beside the trial', () =>
                  perform(
                    { type: 'WorkNightRegister', action: 'whole', work: w.id, method: chosen.mode },
                    'Both views are on the stand.',
                  ),
                )
              : '',
          )
        : '',
      checked
        ? h(
            'div',
            { class: 'options' },
            ...w.site.choices.map((label, n) =>
              button(label, () =>
                perform(
                  { type: 'WorkNightRegister', action: 'send', work: w.id, choice: n as 0 | 1 },
                  w.site.replies[n],
                ),
              ),
            ),
          )
        : '',
      sent === 0 || sent === 1
        ? h(
            'aside',
            {},
            h('blockquote', {}, w.site.replies[sent]),
            button(
              nightParcel(c.state)?.id === w.id
                ? 'Packed for the next keeper'
                : nightParcel(c.state)
                  ? 'Replace the travelling reading with this one'
                  : 'Pack this reading for another chapter',
              () =>
                perform(
                  { type: 'WorkNightRegister', action: 'carry', work: w.id },
                  'The reading of ' + w.title + ' is ready for another chapter lamp.',
                ),
            ),
          )
        : '',
    );
  }
  draw();
  return panel;
}
export function nightDesk(c: GameController, site: NightSite, refresh: () => void) {
  const { panel, body, work } = editor(c, refresh);
  let trace: keyof typeof memoryTraces | undefined;
  function draw() {
    const findings = nightFinding(c.state),
      received = nightReceipt(c.state, site),
      parcel = nightParcel(c.state);
    const posted = nightWorks.find((w) => w.site === site && w.id === c.state.flags[site.room + '.posted']);
    const lantern = LANTERN_SITES.find((s) => s.id === site.site);
    const guest = lantern && lanternDisplay(c.state, lantern);
    const ending = c.state.flags['night.resolution'];
    const favour = c.state.flags[site.room + '.favour'];
    const origin = received?.work.site;
    const word = origin && c.state.flags[origin.room + '.favour'];
    const helper = activeFriend(c.state);
    const memory = helper && nightEdition(c.state, 'night.pocket.' + helper.id)?.work;
    const equipped = nightLens(c.state);
    const cabinet = nightWorks.filter((w) => w.site === site);
    const slip = missingCaption(c.state, site),
      bound = cabinet.find((w) => w.id === c.state.flags[site.room + '.bound-caption']);
    const next = cabinet[((slip ?? bound)?.slot ?? -1) + 1] ?? cabinet[0];
    const drawer = h(
      'details',
      {},
      h('summary', {}, 'A picture loose from its sleeve'),
      h(
        'p',
        {},
        'A gust has scattered the captions. The last carrier drew the position of the drawer on the back of each picture.',
      ),
      slip
        ? h(
            'figure',
            {},
            h(
              'div',
              { class: 'night-window' },
              h('img', {
                src: import.meta.env.BASE_URL + 'assets/' + slip.image,
                alt: 'Loose plate, mount ' + slip.accession,
              }),
            ),
            h('figcaption', {}, 'Mount ' + slip.accession + '. ' + drawerAddress(slip) + '.'),
          )
        : '',
      button(slip ? 'Put it back and follow the next plate' : 'Follow a loose plate', () =>
        work(
          { type: 'WorkNightRegister', action: 'find-caption', work: next.id },
          () => {
            draw();
            body.querySelector<HTMLDetailsElement>('[data-caption-drawer]')!.open = true;
          },
          'There is a pencilled location on the back.',
        ),
      ),
      bound
        ? h(
            'p',
            {},
            bound.title + ' · ' + captionFates[Number(c.state.flags[nightJob(bound) + '.caption']) as 0 | 1],
          )
        : '',
    );
    drawer.dataset.captionDrawer = '';
    body.replaceChildren(
      heading(site.title),
      drawer,
      h('p', {}, site.work),
      posted
        ? h(
            'blockquote',
            {},
            posted.title + ' · ' + site.replies[Number(c.state.flags[nightJob(posted) + '.sent'])],
          )
        : '',
      guest ? h('p', {}, guest.person.name + ' left a tracing at this lamp. ' + guest.use.reply) : '',
      received
        ? h(
            'details',
            {},
            h('summary', {}, 'Stay after closing with ' + site.keeper),
            h('p', {}, site.late),
            ...site.favours.map((v, i) =>
              button(v, () =>
                work(
                  { type: 'WorkNightRegister', action: 'favour', choice: i as 0 | 1 },
                  draw,
                  site.nextMorning[i],
                ),
              ),
            ),
          )
        : '',
      favour === 0 || favour === 1 ? h('blockquote', {}, site.nextMorning[favour]) : '',
      origin && (word === 0 || word === 1)
        ? h(
            'p',
            {},
            'A letter from ' + origin.keeper + ' arrived with the morning post. ' + origin.nextMorning[word],
          )
        : '',
      received
        ? h(
            'section',
            {},
            h('h4', {}, 'From ' + received.work.site.keeper),
            h('p', {}, received.work.title + ' · ' + received.work.accession),
            h(
              'p',
              {},
              'The travelling copy preserves the first setting. ' +
                received.edition.family.job +
                '. ' +
                (received.edition.helper ? received.edition.helper.name + ' helped. ' : '') +
                received.work.site.replies[received.edition.choice],
            ),
            h('blockquote', {}, site.replies[received.choice]),
            h('p', {}, site.clue),
            h('h4', {}, 'Whose memory are we using?'),
            h(
              'div',
              { class: 'options' },
              ...(['keeper', 'copy', 'home'] as const).map((key, i) =>
                button(
                  [
                    'Listen to the receiving keeper',
                    'Unseal the travelling record',
                    'Read the latest word from home',
                  ][i],
                  () => {
                    trace = key;
                    work(
                      { type: 'WorkNightRegister', action: 'read-memory', trace: key },
                      draw,
                      traceMemory(c.state, site, key),
                    );
                  },
                ),
              ),
            ),
            trace ? h('blockquote', {}, traceMemory(c.state, site, trace)) : '',
          )
        : '',
      equipped && equipped.site !== site && equipped !== parcel
        ? button('Unpack ' + equipped.title + ' from my satchel', () =>
            work(
              { type: 'WorkNightRegister', action: 'lend', work: equipped.id },
              draw,
              'The original reading is ready for this keeper.',
            ),
          )
        : '',
      helper && memory && memory.site !== site && memory !== parcel
        ? button('Ask ' + helper.name + ' for ' + memory.title, () =>
            work(
              { type: 'WorkNightRegister', action: 'recall', friend: helper.id },
              draw,
              'The travelling copy is back in your hands.',
            ),
          )
        : '',
      parcel && parcel.site !== site
        ? h(
            'div',
            {},
            h(
              'p',
              {},
              'Holding ' +
                parcel.title +
                ' from ' +
                parcel.site.keeper +
                '. Choose who will use the reading here.',
            ),
            ...site.choices.map((label, i) =>
              button(label, () =>
                work(
                  { type: 'WorkNightRegister', action: 'receive', choice: i as 0 | 1 },
                  draw,
                  site.replies[i],
                ),
              ),
            ),
          )
        : h(
            'p',
            {},
            parcel
              ? 'The reading is ready for a different chapter.'
              : 'A reading packed at another chapter’s case can be received here.',
          ),
      findings.length
        ? h(
            'details',
            {},
            h('summary', {}, 'The marks left by ' + findings.length + ' receiving keepers'),
            ...findings.map((s) => h('p', {}, s.keeper + ' · ' + s.clue)),
          )
        : '',
      findings.length >= 3
        ? h(
            'section',
            {},
            h('h4', {}, 'The missing signature'),
            h(
              'p',
              {},
              'Three different keepers turn over their sheets. Each has left the space for a sender empty. They thought the next person would sign. It was the work of carrying that went missing.',
            ),
            button('Pass the pencil to the first helper', () =>
              work({ type: 'WorkNightRegister', action: 'resolve', choice: 0 }, draw, nightEndings[0]),
            ),
            button('Let the last reader write on the back', () =>
              work({ type: 'WorkNightRegister', action: 'resolve', choice: 1 }, draw, nightEndings[1]),
            ),
            ending === 0 || ending === 1
              ? h(
                  'section',
                  {},
                  h('blockquote', {}, nightEndings[ending]),
                  h(
                    'details',
                    {},
                    h('summary', {}, 'The signed register'),
                    ...signedNames(c.state).map((line) => h('p', {}, line)),
                  ),
                )
              : '',
          )
        : '',
    );
  }
  draw();
  return panel;
}
