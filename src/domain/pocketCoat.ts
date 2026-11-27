import { coatMargins } from '../content/coatMargins';
import { coatSlip, mountedCoatSlips, openedCoatSlip, slipFlag } from './coatTracing';
import { pocketStories } from '../content/pocketStories';
import stations from '../content/ink-post-stations.json';
import { pocketProof } from './pocketProof';
import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect } from './types';

type State = Pick<CampaignState, 'flags' | 'mapId'>;
export type PocketCommand = { type: 'WorkCoatPocket' } & (
  | { action: 'turn'; rail: 0 | 1; side: 0 | 1 }
  | { action: 'thread'; slip: string }
  | { action: 'unthread' }
  | { action: 'unfold'; leaf: 'other' | 'loose' }
  | { action: 'reply'; reading: 'alongside' | 'limit' }
  | { action: 'pull' }
  | { action: 'read' }
  | { action: 'recheck'; rail: 0 | 1 }
  | { action: 'stitch'; seam: 0 | 1 }
  | { action: 'finish'; seam: 0 | 1 }
);
export const coatKey = (site: string, part: string) => 'coat.' + site + '.' + part;
const put = (setFlag: string, value: string | number | boolean): Effect => ({ setFlag, value });
const inRoom = (s: State) =>
  s.mapId.startsWith('night-register.') ? s.mapId.slice('night-register.'.length) : '';
const number = (s: State, id: string, field: string, max: number) => {
  const n = s.flags[coatKey(id, field)];
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= max ? n : 0;
};
export const currentSetting = (s: State, id: string) => number(s, id, 'setting', 3);
export const pocketPulls = (s: State, id: string) => number(s, id, 'pulls', 15);
export const pocketEdition = (s: State, id: string, field: 'sent' | 'read' | 'first') => {
  const v = number(s, id, field, 8);
  return v ? { setting: (v - 1) % 4, seam: Math.floor((v - 1) / 4) as 0 | 1, value: v } : undefined;
};
const toSource = new Map(Object.entries(pocketStories).map(([id, p]) => [p.to, id]));
export const pocketSender = (site: string) => toSource.get(site);
export const pocketPlace = (site: string) => stations.find((s) => s.id === site)?.place ?? site;
export const coatNames = (s: State) =>
  Object.keys(pocketStories).filter((id) => pocketEdition(s, id, 'first'));
export const coatEndings = [
  'The coat hangs on the spare chair. The next person to work an unpaid shift can put it on without asking whose it was.',
  'The keepers turn the coat inside out. Each pocket comes away on its own ribbon. A person can take one job home without having to carry all fifteen.',
] as const;
export function coatWitnesses(s: State, seam: 0 | 1) {
  const names = s.flags['coat.ending.' + seam];
  if (typeof names !== 'string') return [];
  return names.split('|').flatMap((key) => {
    const [site, raw] = key.split('/');
    const v = Number(raw);
    if (!Object.hasOwn(pocketStories, site) || !Number.isInteger(v) || v < 1 || v > 8) return [];
    const p = pocketStories[site];
    return [
      pocketPlace(p.to) +
        ' · ' +
        p.title +
        ' · ' +
        pocketProof(site, (v - 1) % 4).face +
        ' ' +
        p.replies[Math.floor((v - 1) / 4)],
    ];
  });
}
export function coatEffects(cmd: PocketCommand, s: State): Effect[] {
  const id = inRoom(s);
  if (!Object.hasOwn(pocketStories, id))
    throw Error('Find the blue shift coat at a chapter’s night register.');
  const setting = currentSetting(s, id),
    pulls = pocketPulls(s, id);
  const edition = (seam: number) => 1 + setting + 4 * seam;
  if ('seam' in cmd && cmd.seam !== 0 && cmd.seam !== 1) throw Error('Choose a seam on the coat.');
  switch (cmd.action) {
    case 'thread': {
      const slip = mountedCoatSlips(s, id).find((v) => v.value === cmd.slip);
      if (!slip)
        throw Error(
          'At the chapter lamp, mount two pieces you worked on together. Choose one of those pieces for the pocket.',
        );
      return [put(slipFlag(id, 'draft'), slip.value)];
    }
    case 'unthread':
      return [put(slipFlag(id, 'draft'), false)];
    case 'unfold':
    case 'reply': {
      const sender = pocketSender(id)!;
      const opened = openedCoatSlip(s, sender);
      if (!opened) throw Error('Open a sewn pocket with a guest tracing inside.');
      if (cmd.action === 'unfold') {
        if (cmd.leaf !== 'other' && cmd.leaf !== 'loose') throw Error('Choose a leaf on the tracing.');
        return [put(slipFlag(sender, cmd.leaf), opened.receipt)];
      }
      if (!opened.both)
        throw Error(
          'Look under the sewn leaf and bring the loose piece beside it before sending word home.',
        );
      if (cmd.reading !== 'alongside' && cmd.reading !== 'limit')
        throw Error('Choose how this keeper will use the tracing.');
      return [put(slipFlag(sender, 'reply'), opened.receipt + '/' + cmd.reading)];
    }
    case 'turn': {
      if (![0, 1].includes(cmd.rail) || ![0, 1].includes(cmd.side))
        throw Error('Move one of the two fittings.');
      const bit = 1 << cmd.rail;
      return [put(coatKey(id, 'setting'), cmd.side ? setting | bit : setting & ~bit)];
    }
    case 'pull': {
      const next = pulls | (1 << setting);
      const effects = [
        put(coatKey(id, 'open'), true),
        put(coatKey(id, 'pulls'), next),
        put(coatKey(id, 'last'), setting + 1),
      ];
      for (const rail of [0, 1]) {
        // The opposite setting must have an actual impression with the other fitting held fixed.
        if (next & (1 << (setting ^ (1 << rail)))) effects.push(put(coatKey(id, 'compared' + rail), true));
      }
      return effects;
    }
    case 'stitch':
      if (!(pulls & (1 << setting))) throw Error('Try this arrangement before sewing it in.');
      if (![0, 1].some((rail) => (pulls & (1 << (setting ^ (1 << rail)))) !== 0))
        throw Error('Try changing one fitting on its own. Keep an impression of each version.');
      return [
        put(coatKey(id, 'sent'), edition(cmd.seam)),
        put(slipFlag(id, 'sent'), coatSlip(s, id, 'draft')?.value ?? false),
      ];
    case 'recheck': {
      const sender = pocketSender(id);
      const arrived = sender && pocketEdition(s, sender, 'read');
      if (!sender || !arrived) throw Error('Open the pocket before borrowing its fittings.');
      if (cmd.rail !== 0 && cmd.rail !== 1)
        throw Error('Choose a fitting to change on the travelling tool.');
      return [put(coatKey(id, 'counter' + cmd.rail), arrived.value)];
    }
    case 'read': {
      const sender = pocketSender(id);
      const sent = sender && pocketEdition(s, sender, 'sent');
      if (!sender || !sent) throw Error('This pocket has not arrived from its shift yet.');
      const received = [
        put(coatKey(id, 'open'), true),
        put(coatKey(sender, 'read'), sent.value),
        put(slipFlag(sender, 'read'), coatSlip(s, sender, 'sent')?.value ?? false),
      ];
      if (!pocketEdition(s, sender, 'first')) received.push(put(coatKey(sender, 'first'), sent.value));
      return received;
    }
    case 'finish': {
      const witnesses = coatNames(s);
      if (witnesses.length < 3)
        throw Error('Three different keepers need to open a pocket before turning the lining.');
      const effects = [put('coat.ending', cmd.seam)];
      if (!coatWitnesses(s, cmd.seam).length)
        effects.push(
          put(
            'coat.ending.' + cmd.seam,
            witnesses
              .map(
                (id) => id + '/' + (pocketEdition(s, id, 'read') ?? pocketEdition(s, id, 'first'))!.value,
              )
              .join('|'),
          ),
        );
      return effects;
    }
  }
}

export function coatDiary(cmd: PocketCommand, previous: State, state: State) {
  const id = inRoom(state);
  if (!Object.hasOwn(pocketStories, id)) return;
  const p = pocketStories[id];
  const setting = currentSetting(state, id);
  let where = id,
    text: string,
    detail: string;
  if (
    cmd.action === 'thread' ||
    cmd.action === 'unthread' ||
    cmd.action === 'unfold' ||
    cmd.action === 'reply'
  ) {
    const own = cmd.action === 'thread' || cmd.action === 'unthread';
    const from = own ? id : pocketSender(id)!;
    const slip = own
      ? coatSlip(cmd.action === 'thread' ? state : previous, from, 'draft')
      : coatSlip(state, from, 'read');
    if (!slip) return;
    const receipt = pocketEdition(state, from, 'read');
    let move: string = cmd.action;
    let line: string;
    if (cmd.action === 'thread')
      line =
        'I pinned the ' +
        slip.pinned.label +
        ' from my work with ' +
        slip.person.name +
        ' beside the coat impression. ' +
        slip.pinned.reading;
    else if (cmd.action === 'unthread')
      line =
        'I lifted ' +
        slip.person.name +
        '’s ' +
        slip.pinned.label +
        ' out before sewing the next edition. The last sent pocket stayed closed.';
    else if (cmd.action === 'unfold') {
      const material = slip[cmd.leaf];
      move += '-' + cmd.leaf;
      line =
        cmd.leaf === 'other'
          ? 'I unfolded the other piece from the original tracing with ' + slip.person.name + '. '
          : 'I brought in the piece missing from the original tracing with ' + slip.person.name + '. ';
      line +=
        material.label +
        ' — ' +
        material.reading +
        ' Beside it, the sewn coat reading said: ' +
        pocketProof(from, receipt!.setting).face;
    } else {
      move += '-' + cmd.reading;
      line =
        'I sent word back to ' +
        pocketPlace(from) +
        ' about the tracing with ' +
        slip.person.name +
        '. ' +
        coatMargins[id][cmd.reading];
    }
    const source = ('station' in slip.person ? 'HIS-INK-' : 'HIS-LAMPLIGHT-') + slip.person.id;
    return diaryEvent(
      'coat-tracing:' + slip.ref + ':' + move + ':' + (own ? 'draft' : receipt!.value) + ':' + slip.value,
      cmd.action === 'unfold' ? 'tool' : 'choice',
      slip.ref,
      pocketStories[id].title,
      line,
      { sourceIds: [source] },
      'after-break',
    );
  }
  if (cmd.action === 'turn') {
    if (currentSetting(previous, id) === setting) return;
    text =
      'I moved the fitting to “' +
      p.controls[cmd.rail][cmd.side + 1] +
      '”. The last impression stayed on the table.';
    detail = String(setting);
  } else if (cmd.action === 'pull') {
    const proof = pocketProof(id, setting);
    text =
      'I tried “' +
      p.controls[0][1 + (setting & 1)] +
      '” with “' +
      p.controls[1][1 + (setting >> 1)] +
      '”. ' +
      proof.face +
      ' ' +
      proof.traces.join(' ');
    detail = String(setting);
  } else if (cmd.action === 'stitch') {
    text =
      'I chose “' +
      p.seams[cmd.seam] +
      '” for ' +
      pocketPlace(p.to) +
      '. What I sent said: ' +
      pocketProof(id, setting).face;
    detail = String(pocketEdition(state, id, 'sent')!.value);
  } else if (cmd.action === 'recheck') {
    where = pocketSender(id)!;
    const arrived = pocketEdition(state, where, 'read')!;
    const changed = arrived.setting ^ (1 << cmd.rail);
    text =
      'I tried the travelling tool with one fitting changed. The sewn reading said: ' +
      pocketProof(where, arrived.setting).face +
      ' My second impression: ' +
      pocketProof(where, changed).face +
      ' ' +
      pocketProof(where, changed).traces.join(' ');
    detail = arrived.value + '-' + cmd.rail;
  } else if (cmd.action === 'read') {
    where = pocketSender(id)!;
    const sent = pocketEdition(state, where, 'read')!;
    text =
      'I opened the pocket from ' +
      pocketPlace(where) +
      '. ' +
      pocketProof(where, sent.setting).face +
      ' ' +
      pocketStories[where].replies[sent.seam];
    detail = String(sent.value);
  } else {
    text =
      'I turned the lining. ' +
      coatEndings[cmd.seam] +
      ' I kept the readings from ' +
      coatWitnesses(state, cmd.seam)
        .map((line) => line.split(' · ')[0])
        .join(', ') +
      '.';
    detail = String(cmd.seam);
  }
  return diaryEvent(
    'coat:' + where + ':' + cmd.action + ':' + detail,
    cmd.action === 'pull' ? 'tool' : 'choice',
    'coat.' + where,
    pocketStories[where].title,
    text,
    {},
    'after-break',
  );
}
