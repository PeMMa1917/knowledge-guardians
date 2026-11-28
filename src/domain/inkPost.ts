// The post connects people through the Nexus archive. A historical speaker's
// fictional lines and the sourced note about their work are separate nodes.
import workshops from '../content/lamplight-stations.json';
import { inkTrialInvitation, inkTrialNodes, inkTrialRecall } from './inkTrials';
import letters from '../content/ink-post-letters.json';
import watermarks from '../content/ink-post-watermarks.json';
import stations from '../content/ink-post-stations.json';
import { frameworkFromConcepts } from './learningLevels';
import { diaryTopics } from './diarySelection';
import type { CharacterRecord, Condition, ContentPack, DialogueNode, DialogueOption, Hint, Mission, SourceRecord, Weave } from './types';

export const INK_STATIONS = stations;
export const INK_LETTERS = letters;
type Letter = (typeof letters)[number];
type Station = (typeof stations)[number];
const homeById = new Map(stations.map((station) => [station.id, station]));
const letterById = new Map(letters.map((letter) => [letter.id, letter]));
const pairByLetter = new Map(watermarks.flatMap((pair) => pair.letters.map((id, i) =>
  [id, { other: letterById.get(pair.letters[1 - i])!, watermark: pair.watermark }] as const)));
export function inkInvitation(character: string, map: string) {
  const roost = stations.find((s) => s.host === character && s.map === map);
  return roost && { node: 'ink-post.' + roost.id, text: 'Unfold the paper bird beside the keeper' };
}
const root = (station: Station) => 'ink-post.' + station.id;
const story = (letter: Letter) => 'ink.' + letter.id;
const marked = (flag: string): Condition => ({ flagSet: flag });
const missing = (flag: string): Condition => ({ not: marked(flag) });
const is = (flag: string, value: string): Condition => ({ flag, eq: value });
const ways = ['first', 'second'] as const;

function weaveFor(letter: Letter): Weave {
  const concepts = letter.weave.concepts as Weave['concepts'];
  return { ...letter.weave, concepts, aoks: letter.weave.aoks as Weave['aoks'], atl: ['communication', 'thinking'],
    framework: frameworkFromConcepts(concepts) };
}

export function inkLetterForNode(node: string) {
  const [family, id] = node.split('.');
  return family === 'ink' ? letterById.get(id) : undefined;
}

export function inkDiaryTopics(node: string) {
  const letter = inkLetterForNode(node);
  if (letter) return diaryTopics(weaveFor(letter));
}

export function inkDiaryQuestions(key: string): Record<string, string> | undefined {
  const [kind, ref] = key.split(':');
  if (!ref || !['conversation', 'choice', 'quest'].includes(kind)) return;
  const letter = inkLetterForNode(ref);
  if (!letter) return;
  const home = homeById.get(letter.station)!;
  if (ref.includes('.deliver.') || ref.includes('.handover') || ref.endsWith('.landed')) {
    return { fold: homeById.get(home.to)!.reflection };
  }
  if (ref.includes('.reply.') || ref.endsWith('.home')) return { fold: home.reflection, letter: letter.question };
  return { letter: letter.question };
}

function shelfNodes(station: Station): DialogueNode[] {
  const id = root(station);
  const outgoing = letters.filter((r) => r.station === station.id);
  const incoming = letters.filter((r) => homeById.get(r.station)!.to === station.id);
  const leaves: DialogueOption[] = [];
  const arrivals: DialogueOption[] = [];
  const replies: DialogueOption[] = [];
  for (const letter of outgoing) {
    const s = story(letter);
    leaves.push({ text: letter.title + ' · ' + letter.name, if: missing(s + '.fold'), next: s });
    for (const way of ways) {
      replies.push({ text: letter.title + ' · ' + letter.name, if: is(s + '.delivery', way), next: s + '.reply.' + way });
      leaves.push({ text: letter.title + ' · follow your letter', if: { all: [is(s + '.fold', way), missing(s + '.delivery')] }, next: s + '.sent.' + way });
    }
  }
  for (const letter of incoming) {
    const s = story(letter);
    for (const way of ways) arrivals.push({ text: letter.title + ' · ' + letter.name, if: is(s + '.fold', way), next: s + '.read.' + way });
  }
  const shelf = (suffix: string, text: string, options: DialogueOption[]): DialogueNode => ({
    id: id + suffix, speaker: station.host, historicalLabel: 'fictional-world', text, options: [...options, { text: 'Step away from the post.' }],
  });
  return [
    shelf('', station.intro, [
      { text: workshops.find((w) => w.id === station.id)!.title + ' · call a guest to the lantern', next: 'lamplight.' + station.id + '.post' },
      { text: 'Unfold a bird from this roost', if: { any: outgoing.map((l) => missing(story(l) + '.delivery')) }, next: id + '.out' },
      { text: 'Catch a bird from another chapter', if: { any: incoming.map((l) => marked(story(l) + '.fold')) }, next: id + '.in' },
      { text: 'Hear what came home', if: { any: outgoing.map((l) => marked(story(l) + '.delivery')) }, next: id + '.back' },
    ]),
    shelf('.out', 'The titles sit on the outside of the folded wings. Touch a crease to hear the voice inside.', leaves),
    shelf('.in', station.request, arrivals),
    shelf('.back', 'A second hand has added a mark underneath the first. Unfold the reply to hear who used what you sent.', replies),
  ];
}

function letterNodes(letter: Letter, home: Station, away: Station): DialogueNode[] {
  const id = story(letter);
  const fold = id + '.fold';
  const delivery = id + '.delivery';
  const pair = pairByLetter.get(letter.id)!;
  const otherStation = homeById.get(pair.other.station)!;
  const partner = story(pair.other);
  const partnerReplyRead: Condition = { any: ways.map((way) => ({
    all: [is(partner + '.delivery', way), is(partner + '.ack', way)],
  })) };
  const voice = { speaker: letter.character, historicalLabel: 'imagined-alternate' } as const;
  const nodes: DialogueNode[] = [
    { ...voice, id, text: letter.opening, options: [
      ...letter.folds.map((part, i) => ({ text: part.action, if: missing(delivery), next: id + '.sent.' + ways[i],
        effects: [{ setFlag: fold, value: ways[i] }] })),
      ...inkTrialInvitation(letter.id),
      { text: 'Read the name beneath the wax', next: id + '.source' },
      { text: 'Fold the wing loosely. Come back later.' },
    ] },
    { id: id + '.source', speaker: 'narrator', text: letter.context, citationSource: 'HIS-INK-' + letter.id,
      claimKind: 'observation', historicalLabel: 'documented', next: id },
    { id: id + '.match', speaker: 'narrator', text: 'There is half a watermark on the wing. The matching crease belongs to '
      + pair.other.name + ' at ' + otherStation.place + ' — “' + pair.other.title + '”.',
      options: [{ text: 'Fit the two finished wings against the light', if: partnerReplyRead, next: id + '.light' },
        { text: 'Reopen the original wing', next: id },
        { text: 'Put the wing back in its roost.' }] },
    { id: id + '.light', speaker: 'narrator', text: pair.watermark, historicalLabel: 'fictional-world', motif: 'in-the-open' },
  ];
  nodes.push(...inkTrialNodes(letter.id));
  for (const [i, way] of ways.entries()) {
    const part = letter.folds[i];
    nodes.push(
      { id: id + '.sent.' + way, speaker: 'narrator', text: '“' + part.action + '.” Under the crease, a route lights up to ' + away.place
        + '. The voice inside the wing will answer there.', options: [
          { text: 'Refold it before the keeper acts', if: missing(delivery), next: id },
          { text: 'Leave the bird on its way' },
        ] },
      { ...voice, id: id + '.read.' + way, text: part.arrival, options: [
        { text: 'Take the wing to the keeper here', next: id + '.handover' }, ...inkTrialRecall(letter.id), { text: 'Hold the wing for a later visit' },
      ] },
      { id: id + '.deliver.' + way, speaker: away.host, text: 'I have sent the reply to ' + home.place + '. Look under the first wing when you get home.',
        historicalLabel: 'fictional-world' },
      { id: id + '.reply.' + way, speaker: away.host, text: away.deliveries[i].reply, historicalLabel: 'fictional-world',
        options: [{ text: 'Keep the reply with ' + letter.name + '’s fold', next: id + '.match', effects: [{ setFlag: id + '.kept', value: true }, { setFlag: id + '.ack', value: way }] }] },
    );
  }
  nodes.push({ id: id + '.handover', speaker: away.host, text: away.request, historicalLabel: 'fictional-world',
    options: [...away.deliveries.map((part, i) => ({ text: part.action, next: id + '.deliver.' + ways[i],
      effects: [{ setFlag: delivery, value: ways[i] }, { setFlag: root(home) + '.news', value: true }] })),
    { text: 'Give the keeper time.' }] });
  return nodes;
}

export function installInkPost(pack: ContentPack, articles: ReadonlyMap<string, string>): void {
  pack.dialogue.push(...stations.flatMap(shelfNodes));
  const known = new Set(pack.characters.map((ch) => ch.id));
  for (const letter of letters) {
    const home = homeById.get(letter.station)!;
    const away = homeById.get(home.to)!;
    const id = story(letter);
    if (!known.has(letter.character)) {
      const character: CharacterRecord = { id: letter.character, name: letter.name, role: 'Voice in the folded wing', mode: 'historical',
        sprite: 'villager-1', talk: [{ node: id }] };
      pack.characters.push(character);
      known.add(letter.character);
    }
    const title = articles.get(letter.character)!;
    const source: SourceRecord = { id: 'HIS-INK-' + letter.id, title, locator: 'Biographical article', supports: letter.context,
      url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replaceAll(' ', '_')), accessed: '2026-11-28',
      mla: { kind: 'page', title, container: 'Wikipedia', showAccessDate: true } };
    pack.sources.push(source);
    pack.dialogue.push(...letterNodes(letter, home, away));
    const weave = weaveFor(letter);
    const chapter = Number(home.world.slice(6));
    const mission: Mission = { id: 'KG-CH' + String(Math.max(1, chapter - 1)).padStart(2, '0') + '-' + id, world: home.world, title: letter.title, stake: letter.opening, knowledgeQuestion: away.reflection,
      objectives: [
        { id: id + '.landed', title: 'Catch ' + letter.name + '’s paper bird at ' + away.place + '.', essential: false,
          visible: marked(id + '.fold'), done: marked(id + '.delivery'), weave: { ...weave, minutes: 2,
            thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' } } },
        { id: id + '.home', title: 'Hear what came back to ' + home.place + ' for “' + letter.title + '”.', essential: false,
          visible: marked(id + '.delivery'), done: marked(id + '.kept'), weave: { ...weave, minutes: 1,
            thinking: { dok: 2, bloom: 'understand', fink: 'human', solo: 'relational' } } },
      ] };
    pack.missions.push(mission);
    const routeHints = [
      [letter.title + ' is on the move.', 'Look for the small bird carrying a wax seal.', 'Follow it to ' + away.place + '.',
        'At that post, catch the incoming bird, hear the reply, then choose how the keeper will use it.'],
      ['The return address is still on the first fold.', home.intro, 'Go back to the paper bird at ' + home.place + '.',
        'Choose “Hear what came home”, open “' + letter.title + '”, and keep the reply.'],
    ];
    mission.objectives.forEach((obj, j) => routeHints[j].forEach((text, i) => {
      pack.hints.push({ id: 'h.' + obj.id + '.' + (i + 1), objective: obj.id, depth: (i + 1) as Hint['depth'], text });
    }));
  }
}
