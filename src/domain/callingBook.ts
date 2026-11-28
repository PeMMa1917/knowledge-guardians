import { conversationHistory } from './conversationHistory';
import {
  LANTERN_PEOPLE,
  LANTERN_SITES,
  keptTracing,
  lanternRead,
  lanternRef,
  lanternSource,
} from './lamplight';
import { guestInstrument } from './lanternInstruments';
import type { CampaignState, CharacterRecord, ContentPack, DialogueNode } from './types';

const guestsByCharacter = new Map(LANTERN_PEOPLE.map((person) => [person.character, person]));
const guestsByLampId = new Map(LANTERN_PEOPLE.map((person) => [person.id, person]));
type Lines = ContentPack['dialogue'] | ReadonlyMap<string, DialogueNode>;

/** Only a spoken scene or an actual meeting opens a page. Older saves may have only the local meeting flag. */
export function callers(pack: ContentPack, lines: Lines, state: CampaignState): CharacterRecord[] {
  const byId = new Map(pack.characters.map((person) => [person.id, person]));
  const nodes = 'get' in lines ? lines : new Map(lines.map((node) => [node.id, node]));
  const seen = new Set<string>(),
    out: CharacterRecord[] = [];
  for (const key of Object.keys(state.flags).reverse()) {
    if (state.flags[key] !== true) continue;
    let id: string | undefined;
    if (key.startsWith('node.')) id = nodes.get(key.slice(5))?.speaker;
    else if (key.startsWith('lamplight.met.')) id = key.slice('lamplight.met.'.length);
    else if (key.startsWith('lamplight.') && key.endsWith('.met'))
      id = guestsByLampId.get(key.split('.')[2])?.character;
    if (!id || seen.has(id)) continue;
    const person = byId.get(id);
    if (person) {
      seen.add(id);
      out.push(person);
    }
  }
  return out;
}

export function callingPage(pack: ContentPack, lines: Lines, state: CampaignState, id: string) {
  const person = callers(pack, lines, state).find((character) => character.id === id);
  if (!person) return;
  const past = conversationHistory(lines, state.flags).filter((node) => node.speaker === id);
  const guest = guestsByCharacter.get(id);
  const visits = guest
    ? LANTERN_SITES.flatMap((site) => {
        const work = lanternRead(state, site, guest),
          sent = keptTracing(state, site, guest),
          ref = lanternRef(site.id, guest.id);
        if (!work.met && !sent) return [];
        const kit = guestInstrument(guest.id)!;
        const last = sent
          ? {
              material: sent.pieces.map((i) => kit.pieces[i].label),
              request: guest.folds[sent.trace].action,
              response: site.uses[sent.use].reply,
            }
          : undefined;
        const active =
          work.met && work.use === undefined
            ? {
                material: work.pieces.map((i) => kit.pieces[i].label),
                next:
                  work.trace === undefined
                    ? 'At the folded-wing post in ' +
                      site.place +
                      ', try two settings and prepare the tracing.'
                    : 'The tracing is ready for ' + site.bench + ' in ' + site.place + '.',
              }
            : undefined;
        return [{ ref, place: site.place, active, last }];
      })
    : [];
  const sourceIds = new Set(past.flatMap((node) => (node.citationSource ? [node.citationSource] : [])));
  if (guest && visits.length) sourceIds.add(lanternSource(guest));
  const sources = pack.sources.filter((s) => sourceIds.has(s.id));
  return { person, past, visits, sources };
}
