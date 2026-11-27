import { lanternCase } from './lamplight';
import { mlaCitation } from './mla';
import research from '../content/encyclopedia.json';
import { historicalEncounters, isHistoricalBiography } from './historicalEncounters';
import type { CampaignState, CharacterRecord, ContentPack, EvidenceCard, ExhibitRecord } from './types';

const languageNames = { fr: 'French', hu: 'Hungarian', sv: 'Swedish', de: 'German', it: 'Italian', arz: 'Egyptian Arabic', avk: 'Kotava' } as const;
type ArticleLanguage = keyof typeof languageNames;

export interface EncyclopediaLink {
  key: string;
  entity: 'person' | 'object';
  name: string;
  encounter: 'met' | 'read' | 'inspected';
  kind: 'article' | 'related' | 'search';
  title: string;
  url: string;
  language?: ArticleLanguage;
}

interface PersonMatch {
  wikidata: string;
  title: string;
  characters: string[];
  biographies: string[];
}

interface ExhibitMatch {
  id: string;
  kind: 'article' | 'related';
  title: string;
  language?: ArticleLanguage;
}

const researched = research as { people: PersonMatch[]; exhibits: ExhibitMatch[] };
const peopleByCharacter = new Map(researched.people.flatMap((entry) => entry.characters.map((id) => [id, entry] as const)));
const peopleByBiography = new Map(researched.people.flatMap((entry) => entry.biographies.map((id) => [id, entry] as const)));
const exhibitsById = new Map(researched.exhibits.map((entry) => [entry.id, entry] as const));
const english = 'https://en.wikipedia.org';

function destination(link: Omit<EncyclopediaLink, 'url'>): EncyclopediaLink {
  const url = link.kind === 'search' ? `${english}/w/index.php?${new URLSearchParams({ search: link.title })}`
    : `https://${link.language ?? 'en'}.wikipedia.org/wiki/${encodeURIComponent(link.title.replaceAll(' ', '_'))}`;
  return { ...link, url };
}

function personLink(match: PersonMatch | undefined, id: string, name: string, encounter: 'met' | 'read', search: string): EncyclopediaLink {
  return destination({ key: match ? `person:${match.wikidata}` : `person:${id}`, entity: 'person', name, encounter,
    kind: match ? 'article' : 'search', title: match?.title ?? search });
}

export function encyclopediaForCharacter(character: CharacterRecord): EncyclopediaLink | undefined {
  if (character.mode !== 'historical') return undefined;
  return personLink(peopleByCharacter.get(character.id), character.id, character.name, 'met', `${character.name} ${character.role}`);
}

export function encyclopediaForBiography(card: EvidenceCard): EncyclopediaLink | undefined {
  if (!isHistoricalBiography(card)) return undefined;
  return personLink(peopleByBiography.get(card.id), card.id, card.person.name, 'read', `${card.person.name} ${card.person.place}`);
}

export function encyclopediaForExhibit(exhibit: ExhibitRecord): EncyclopediaLink | undefined {
  if (exhibit.historicalLabel !== 'documented') return undefined;
  const match = exhibitsById.get(exhibit.id);
  const accession = exhibit.specimen?.accession;
  const search = accession && !exhibit.name.toLowerCase().includes(accession.toLowerCase()) ? `${exhibit.name} ${accession}` : exhibit.name;
  return destination({ key: `object:${exhibit.specimen?.key ?? exhibit.id}`, entity: 'object', name: exhibit.name,
    encounter: 'inspected', kind: match?.kind ?? 'search', title: match?.title ?? search,
    ...(match?.language ? { language: match.language } : {}) });
}

export interface EncyclopediaDiaryEvent {
  kind: string;
  key: string;
  ref: string;
}

export function encyclopediaForDiaryEvent(pack: ContentPack, event?: EncyclopediaDiaryEvent): EncyclopediaLink | undefined {
  if (!event) return undefined;
  if (event.key.startsWith('lantern:' + event.ref + ':') || event.key.startsWith('coat-tracing:' + event.ref + ':')) {
    const guest = lanternCase(event.ref)?.person;
    const character = guest && pack.characters.find(({ id }) => id === guest.character);
    if (character) return encyclopediaForCharacter(character);
  }
  if (event.kind === 'conversation' && event.key === `conversation:${event.ref}`) {
    const speaker = pack.dialogue.find(({ id }) => id === event.ref)?.speaker;
    const character = pack.characters.find(({ id }) => id === speaker);
    return character ? encyclopediaForCharacter(character) : undefined;
  }
  if (event.kind === 'inspection' && event.key === `biography:${event.ref}`) {
    const card = pack.cards.find(({ id }) => id === event.ref);
    return card ? encyclopediaForBiography(card) : undefined;
  }
  if (event.kind === 'inspection' || event.kind === 'finding') {
    const exhibit = pack.exhibits.find(({ id }) => id === event.ref);
    if (exhibit && (event.key === `exhibit:${exhibit.id}` || (exhibit.specimen && event.key === `specimen:${exhibit.specimen.key}`))) {
      return encyclopediaForExhibit(exhibit);
    }
  }
  return undefined;
}

export function encyclopediaLinks(pack: ContentPack, state: CampaignState): EncyclopediaLink[] {
  const encounters = historicalEncounters(pack, state);
  const links = new Map<string, EncyclopediaLink>();
  // A conversation takes precedence over a read biography for the same verified person.
  for (const link of [...encounters.peopleMet.map(encyclopediaForCharacter), ...encounters.biographiesRead.map(encyclopediaForBiography),
    ...encounters.exhibitsInspected.map(encyclopediaForExhibit)]) {
    if (link && !links.has(link.key)) links.set(link.key, link);
  }
  return [...links.values()].sort((a, b) => a.entity.localeCompare(b.entity) || a.name.localeCompare(b.name, 'en') || a.key.localeCompare(b.key));
}

export function encyclopediaEncounterLabel(link: EncyclopediaLink): string {
  return { met: 'Met', read: 'Read about', inspected: 'Inspected' }[link.encounter];
}

export function encyclopediaLinkLabel(link: EncyclopediaLink): string {
  if (link.kind === 'search') return `Search Wikipedia for ${link.title}`;
  const label = link.kind === 'related' ? 'Related Wikipedia article' : 'Wikipedia';
  return `${label} · ${link.title}${link.language ? ` (${languageNames[link.language]})` : ''}`;
}

export function isEncyclopediaURL(url: string, kind: EncyclopediaLink['kind']): boolean {
  try {
    const address = new URL(url);
    if (address.username || address.password || address.hash) return false;
    if (kind === 'search') {
      const params = [...address.searchParams.entries()];
      return address.origin === english && address.pathname === '/w/index.php' && params.length === 1 && params[0][0] === 'search' && !!params[0][1].trim();
    }
    if (kind !== 'article' && kind !== 'related') return false;
    if (address.origin !== english && !Object.keys(languageNames).some((lang) => address.origin === `https://${lang}.wikipedia.org`)) return false;
    const path = decodeURIComponent(address.pathname);
    return path.startsWith('/wiki/') && path.length > '/wiki/'.length && !address.search
      && !/^\/wiki\/(?:Special|File|Category|Template|Talk|User|Help):/i.test(path);
  } catch { return false; }
}

/** Article leads for people the player met or read about. A search page supplies no article citation. */
export function personArticleCitation(link: EncyclopediaLink) {
  if (link.kind !== 'article' || link.entity !== 'person' || !isEncyclopediaURL(link.url, link.kind)) return;
  return mlaCitation({ url: link.url, mla: { kind: 'page', title: link.title, container: 'Wikipedia' } });
}
