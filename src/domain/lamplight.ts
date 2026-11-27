import { installLastBell } from '../content/lastBell';
import {installWatches} from './watchBell';
import { microSkillId, useSignature } from './skills';
import { guestInstrument, isPiece, pinPiece, readPieces, type Piece } from './lanternInstruments';
import letters from '../content/ink-post-letters.json';
import roosts from '../content/ink-post-stations.json';
import people from '../content/lamplight-voices.json';
import workshops from '../content/lamplight-stations.json';
import { diaryTopics } from './diarySelection';
import { frameworkFromConcepts } from './learningLevels';
import type { CampaignState, ContentPack, Effect, Hint, Weave } from './types';

export const LANTERN_PEOPLE = [...letters, ...people];
export type LanternPerson = (typeof LANTERN_PEOPLE)[number];
export function lanternSource(person: LanternPerson) {
  return ('station' in person ? 'HIS-INK-' : 'HIS-LAMPLIGHT-') + person.id;
}
export const LANTERN_SITES = workshops.map((site) => {
  const roost = roosts.find(({ id }) => id === site.id)!;
  return { ...site, world: roost.world, map: roost.map, place: roost.place, host: roost.host, postAt: roost.at };
});
export type LanternSite = (typeof LANTERN_SITES)[number];
const guests = new Map(LANTERN_PEOPLE.map((person) => [person.id, person]));
const sites = new Map(LANTERN_SITES.map((site) => [site.id, site]));
type State = Pick<CampaignState, 'mapId' | 'flags'>;
export type LanternCommand = { type: 'WorkWithLantern'; site: string; person: string } & (
  { stage: 'meet' } | { stage: 'recall'; from: string } | { stage: 'pin'; piece: Piece } | { stage: 'trace' | 'use'; option: 0 | 1 }
);
export function lanternRef(site: string, person: string) { return 'lamplight.' + site + '.' + person; }

export function lanternCase(ref: string) {
  const [family, room, id, ...more] = ref.split('.');
  if (family !== 'lamplight' || more.length) return;
  const site = sites.get(room), person = guests.get(id);
  if (site && person) return { site, person, ref };
}

export function lanternRead(state: State, site: LanternSite, person: LanternPerson) {
  const ref = lanternRef(site.id, person.id);
  const trace = state.flags[ref + '.trace'];
  const use = state.flags[ref + '.use'];
  return { pieces: readPieces(state.flags[ref + '.pieces']), met: state.flags[ref + '.met'] === true, trace: trace === 0 || trace === 1 ? trace : undefined,
    use: use === 0 || use === 1 ? use : undefined } as const;
}

function unpackTracing(value: unknown) {
  if (typeof value !== 'string' || !/^[01][01][012]{2}$/.test(value)) return;
  const pieces = readPieces(value.slice(2));
  if (pieces.length === 2) return {trace: Number(value[0]), use: Number(value[1]), pieces, value};
}

/** The working instrument and the last tracing a guest entrusted to this room are separate. */
export function keptTracing(state: State, site: LanternSite, person: LanternPerson) {
  const kept = unpackTracing(state.flags[lanternRef(site.id, person.id) + '.receipt']);
  if (kept) return kept;
  // Earlier saves kept the last public tracing on the wall and the other completed ones on the worktables.
  const shown = state.flags['lamplight.' + site.id + '.shown'];
  if (typeof shown === 'string') {
    const [id, trace, use, pieces] = shown.split('.');
    if (id === person.id) {
      const display = unpackTracing(trace + use + pieces);
      if (display) return display;
    }
  }
  const work = lanternRead(state, site, person);
  if (work.trace !== undefined && work.use !== undefined) return unpackTracing(String(work.trace) + work.use + work.pieces.join(''));
}

export function tracingBasis(state: State, ref: string) {
  const raw = state.flags[ref + '.basis'];
  if (typeof raw !== 'string') return;
  const [from, encoded] = raw.split(':');
  const site = sites.get(from), record = unpackTracing(encoded);
  if (site && record) return {site, ...record};
}

export function lanternReturnPractice(state: State, cmd: LanternCommand) {
  if (cmd.stage !== 'use') return;
  const ref = lanternRef(cmd.site, cmd.person), pair = lanternCase(ref);
  if (!pair || !tracingBasis(state, ref) || state.flags[ref + '.compared'] !== true) return;
  const kit = guestInstrument(cmd.person)!;
  return {id: microSkillId(kit.practice), sig: useSignature(pair.site.world, kit.kind === 'route' ? 'game-13' : 'game-234',
    ref + '.rechecked', pair.person.weave.aoks)};
}

export function lanternEffects(cmd: LanternCommand, state: State): Effect[] {
  const ref = lanternRef(cmd.site, cmd.person);
  const pair = lanternCase(ref);
  if (!pair || state.mapId !== pair.site.map) throw new Error('Look for the lantern in this chapter.');
  const { met, trace, use, pieces } = lanternRead(state, pair.site, pair.person);
  const flag = (key: string, value: string | boolean | number): Effect => ({ setFlag: key, value });
  if (cmd.stage === 'meet') return met ? [] : [flag(ref + '.met', true), flag('lamplight.met.' + pair.person.character, true)];
  if (!met) throw new Error('Call the guest at the folded-wing post first.');
  const preserve = (): Effect[] => {
    if (state.flags[ref + '.receipt'] !== undefined) return [];
    const old = keptTracing(state, pair.site, pair.person);
    return old ? [flag(ref + '.receipt', old.value)] : [];
  };
  if (cmd.stage === 'recall') {
    const from = sites.get(cmd.from), kept = from && keptTracing(state, from, pair.person);
    if (!kept || cmd.from === cmd.site) throw new Error('Choose work you have already left with this guest in another chapter.');
    const basis = cmd.from + ':' + kept.value;
    if (state.flags[ref + '.basis'] === basis && pieces.join('') === kept.pieces.join('')) return [];
    return [...preserve(), flag(ref + '.basis', basis), flag(ref + '.pieces', kept.pieces.join('')), flag(ref + '.compared', false),
      flag(ref + '.trace', false), flag(ref + '.use', false)];
  }
  if (cmd.stage === 'pin') {
    if (!isPiece(cmd.piece) || !guestInstrument(cmd.person)) throw new Error('That instrument has no such setting.');
    const order = pinPiece(pieces, cmd.piece);
    if (order === pieces.join('')) return [];
    const result = [...preserve(), flag(ref + '.pieces', order), flag(ref + '.trace', false), flag(ref + '.use', false)];
    const earlier = tracingBasis(state, ref);
    if (earlier && !earlier.pieces.includes(cmd.piece)) result.push(flag(ref + '.compared', true));
    return result;
  }
  if (pieces.length !== 2) throw new Error('Try two different settings on the guest’s instrument.');
  if ((cmd.option !== 0 && cmd.option !== 1)) throw new Error('Call the guest at the folded-wing post first.');
  if (cmd.stage === 'trace') {
    if (trace === cmd.option) return [];
    return [...preserve(), flag(ref + '.trace', cmd.option), flag(ref + '.use', false)];
  }
  if (cmd.stage !== 'use' || trace === undefined) throw new Error('Make a tracing together before taking it to the lamp.');
  const last = 'lamplight.' + cmd.site + '.shown';
  // The mounted copy survives later revisions on the worktable until another copy replaces it.
  const display = [cmd.person, trace, cmd.option, pieces.join('')].join('.');
  if (use === cmd.option && state.flags[last] === display) return [];
  const displaced = lanternDisplay(state, pair.site);
  const previous = displaced && lanternRef(cmd.site, displaced.person.id);
  const backed = previous && displaced && displaced.person.id !== cmd.person && state.flags[previous + '.receipt'] === undefined
    ? keptTracing(state, pair.site, displaced.person) : undefined;
  return [...(backed ? [flag(previous + '.receipt', backed.value)] : []), flag(ref + '.use', cmd.option), flag(ref + '.receipt', String(trace) + cmd.option + pieces.join('')), flag(last, display), flag('lamplight.' + cmd.site + '.lit', true)];
}

export function lanternDisplay(state: State, site: LanternSite) {
  const mounted = state.flags['lamplight.' + site.id + '.shown'];
  if (typeof mounted !== 'string') return;
  const [id, trace, use, order] = mounted.split('.');
  const person = guests.get(id);
  if (person && /^[01]$/.test(trace) && /^[01]$/.test(use)) {
    return { person, pieces: readPieces(order), trace: person.folds[Number(trace)], use: site.uses[Number(use)] };
  }
}

/** Prefer work that can be resumed at this station; a pending job at the other station gives directions. */
export function lanternReturn(state: Pick<CampaignState, 'flags' | 'mapId' | 'adventureDiary'>, site: LanternSite, bench: boolean) {
  let elsewhere: LanternPerson | undefined;
  const entries = state.adventureDiary.entries;
  const prefix = 'lamplight.' + site.id + '.';
  for (let i = entries.length - 1; i >= 0; i--) {
    const ref = entries[i].event?.ref;
    if (!ref?.startsWith(prefix)) continue;
    const person = guests.get(ref.slice(prefix.length));
    if (!person) continue;
    const work = lanternRead(state, site, person);
    if (!work.met || work.use !== undefined) continue;
    if ((work.trace !== undefined) === bench) return person;
    elsewhere ??= person;
  }
  return elsewhere;
}

export function lanternMemory(state: State, site: LanternSite, person: LanternPerson) {
  const earlier = tracingBasis(state, lanternRef(site.id, person.id));
  const other = earlier?.site ?? LANTERN_SITES.find((s) => s.id !== site.id && keptTracing(state, s, person));
  const kept = earlier ?? (other && keptTracing(state, other, person));
  if (other && kept) return 'At ' + other.place + ' we tried “' + person.folds[kept.trace].action +
    '” together. You chose “' + other.uses[kept.use].action + '”. ' + other.uses[kept.use].reply;
}

export function lanternTopics(ref: string) {
  const pair = lanternCase(ref);
  if (!pair) return;
  const concepts = pair.person.weave.concepts as Weave['concepts'];
  return diaryTopics({ concepts, atl: ['thinking', 'communication'], framework: frameworkFromConcepts(concepts), aoks: pair.person.weave.aoks as Weave['aoks'] });
}

export function lanternQuestions(key: string) {
  const [category, ref, stage] = key.split(':');
  if (category === 'lantern-pair' && sites.has(ref)) return { guest: sites.get(ref)!.pair.question };
  const pair = category === 'lantern' && ref ? lanternCase(ref) : undefined;
  if (pair) {
    const questions: Record<string, string> = { guest: pair.person.question };
    if (stage === 'use') questions.keeper = pair.site.question;
    return questions;
  }
}

export function installLamplight(pack: ContentPack, articles: ReadonlyMap<string, string>) {
  installWatches(pack);
  installLastBell(pack);
  for (const site of LANTERN_SITES) {
    for (const stage of ['post', 'bench']) pack.dialogue.push({ id: 'lamplight.' + site.id + '.' + stage,
      speaker: site.host, historicalLabel: 'fictional-world', text: stage === 'post' ? site.hook : site.arrival });
  }
  // One discoverable home commission per guest. Roaming returns stay available in every chapter.
  // The 3,750 pairs of stations and guests are resolved on demand, outside the objective scan.
  for (const guest of LANTERN_PEOPLE) {
    const kit = guestInstrument(guest.id)!;
    const site = sites.get(kit.home)!;
    const ref = lanternRef(site.id, guest.id);
    const objective = ref + '.received';
    const concepts = guest.weave.concepts as Weave['concepts'];
    const action = 'Choose and compare two parts of ' + guest.title + ' with ' + guest.name + ', then use the finding at ' + site.bench + '.';
    pack.missions.push({ id: 'KG-CH' + String(Math.max(1, Number(site.world.slice(6)) - 1)).padStart(2, '0') + '-' + ref,
      world: site.world, title: guest.title + ' at ' + site.place, stake: guest.opening, knowledgeQuestion: guest.question,
      objectives: [{ id: objective, title: action, essential: false, visible: { flag: ref + '.met', eq: true },
        done: { flag: ref + '.use', in: [0, 1] }, questionWays: [{ id: 'KQ-ROUTE-' + String(kit.questionRoute).padStart(2, '0'), action }],
        weave: { concepts, atl: ['thinking', 'communication'], framework: frameworkFromConcepts(concepts), aoks: guest.weave.aoks as Weave['aoks'],
          subjects: guest.weave.subjects, minutes: 3, thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' } } }] });
    const steps = [site.hook, 'Call ' + guest.name + ' at the folded-wing post in ' + site.place + '.',
      'Choose two settings on the instrument. ' + kit.pieces[0].label + ' and ' + kit.pieces[1].label + ' are one possible pair.',
      'Choose how to prepare the tracing. Find ' + site.bench + ', call ' + guest.name + ' again and choose who can use the result.'];
    steps.forEach((text, i) => pack.hints.push({ id: 'h.' + objective + '.' + (i + 1), objective, depth: (i + 1) as Hint['depth'], text }));
  }
  const known = new Set(pack.characters.map(({ id }) => id));
  for (const person of people) {
    const id = 'lamplight-guest.' + person.id, title = articles.get(person.character)!;
    if (!known.has(person.character)) {
      pack.characters.push({ id: person.character, name: person.name, role: 'Guest at the lamplight workshop', mode: 'historical',
        sprite: 'villager-1', talk: [{ node: id }] });
      known.add(person.character);
    }
    pack.dialogue.push({ id, speaker: person.character, text: person.opening, historicalLabel: 'imagined-alternate' });
    pack.sources.push({ id: 'HIS-LAMPLIGHT-' + person.id, title, locator: 'Biographical article', supports: person.context,
      url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replaceAll(' ', '_')), accessed: '2026-11-27',
      mla: { kind: 'page', title, container: 'Wikipedia', showAccessDate: true } });
  }
}

export type LanternPairCommand = { type: 'TurnLanternGlass'; site: string } & (
  { stage: 'look'; aperture: Piece } | { stage: 'mount'; choice: 0 | 1 }
);

export function pairReady(state: State, site: LanternSite) {
  return site.pair.guests.every((id) => lanternRead(state, site, guests.get(id)!).use !== undefined);
}

export function pairEffects(cmd: LanternPairCommand, state: State): Effect[] {
  const site = sites.get(cmd.site);
  if (!site || site.map !== state.mapId || !pairReady(state, site)) throw new Error('Bring both guests’ finished tracings to this lamp.');
  const base = 'lamplight-pair.' + site.id;
  if (cmd.stage === 'look' && isPiece(cmd.aperture)) {
    const flag = base + '.seen.' + cmd.aperture;
    return state.flags[flag] === true ? [] : [{ setFlag: flag, value: true }];
  }
  if (cmd.stage !== 'mount' || (cmd.choice !== 0 && cmd.choice !== 1) ||
      ![0, 1, 2].every((i) => state.flags[base + '.seen.' + i] === true)) throw new Error('Turn the wheel through both single views and their overlap.');
  return state.flags[base + '.mounted'] === cmd.choice ? [] : [{ setFlag: base + '.mounted', value: cmd.choice }];
}
