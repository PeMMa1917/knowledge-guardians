import { sources as riverNameSources, type TextLeaf } from './riverNames';
import { mlaCitation, type CitationPart } from './mla';
import { hasSpecimen, ownsSpecimen } from './specimenGear';
import type { CampaignState, ContentPack, EvidenceCard } from './types';

export interface SpecimenReference {
  key: string;
  label: string;
  url: string;
  text: string;
  runs: CitationPart[];
}

export function journalEvidence(pack: ContentPack, state: CampaignState): { card: EvidenceCard; includeSources: boolean }[] {
  const cards = new Map(pack.cards.map((card) => [card.id, card]));
  const specimenCards = new Map<string, boolean>();
  for (const exhibit of pack.exhibits.filter(hasSpecimen)) {
    if (!exhibit.grantsCard) continue;
    const earned = ownsSpecimen(state, exhibit.specimen.key);
    specimenCards.set(exhibit.grantsCard, earned || specimenCards.get(exhibit.grantsCard) === true);
  }
  return state.cards.flatMap((id) => {
    const card = cards.get(id);
    return card && specimenCards.get(id) !== false ? [{ card, includeSources: !specimenCards.has(id) }] : [];
  });
}

/** List the exact citations earned by this adventure. Without a state, list the public collection credits. */
export function specimenReferences(pack: ContentPack, state?: CampaignState): SpecimenReference[] {
  const sources = new Map(pack.sources.map((source) => [source.id, source]));
  const entries: SpecimenReference[] = [];
  for (const exhibit of pack.exhibits.filter(hasSpecimen)) {
    const { key, institution, accession, source: sourceId } = exhibit.specimen;
    if (state && !ownsSpecimen(state, key)) continue;
    const source = sources.get(sourceId);
    if (!source || !/^https:\/\//.test(source.url)) continue;
    const runs = mlaCitation({ ...source, mla: source.mla ?? {
      kind: 'artwork', title: exhibit.name, container: institution, workDate: exhibit.dateText, showAccessDate: true,
    } });
    entries.push({ key, label: `${exhibit.name} · ${institution} · ${accession}`, url: source.url,
      text: runs.map(({ text }) => text).join(''), runs });
  }
  return entries.sort(compareCitations);
}

export function compareCitations(a: SpecimenReference, b: SpecimenReference) {
  const sortText = (entry: SpecimenReference) => entry.text.replace(/^[“"]?(?:(?:an?|the)\s+)?/i, '');
  return sortText(a).localeCompare(sortText(b), 'en') || a.key.localeCompare(b.key, 'en');
}

/** A research source earned by opening one of the recorded encounters. */
export interface ResearchReading extends SpecimenReference {
  encounterKeys: string[];
}

export function earnedResearchReadings(pack: ContentPack, state: CampaignState): ResearchReading[] {
  const entries = state.adventureDiary.entries;
  if (!entries.some(({ event }) => event?.sourceIds?.length)) return [];

  const collectionSources = new Set(pack.exhibits.flatMap(exhibit => exhibit.sources));
  const dialogueSources = new Map(pack.dialogue.map(node => [node.id, node.citationSource]));
  const earned = new Map<string, Set<string>>();
  const pairedCambridgeReadings = state.objectivesDone.includes('optics.sources')
    && ['card.depot.micro', 'card.depot.micro-case'].every(card => state.cards.includes(card));

  function credit(id: string, eventKey: string) {
    const keys = earned.get(id) ?? new Set<string>();
    keys.add(eventKey);
    earned.set(id, keys);
  }

  for (const { event } of entries) {
    if (!event?.sourceIds?.length) continue;
    if (event.kind === 'conversation' && event.key === 'conversation:' + event.ref) {
      const source = dialogueSources.get(event.ref);
      // A conversation can cite a holding that is separately earned elsewhere in the game.
      if (source && event.sourceIds.includes(source) && !collectionSources.has(source)) credit(source, event.key);
    }
    if (event.kind === 'tool' && event.ref === 'river-names.leaf') {
      for (const [leaf, source] of Object.entries(riverNameSources) as [TextLeaf, string][]) {
        if (state.flags['rivernames.source.' + leaf] === true && event.key === 'river-names:reading:leaf.' + leaf && event.sourceIds.includes(source)) credit(source, event.key);
      }
    }
    if (event.kind === 'tool' && event.ref === 'walking-grove'
      && event.key.startsWith('walking-grove:reserve:') && typeof state.flags['grove.draftWindow'] === 'string'
      && event.sourceIds.includes('HIS-GROVE-ROTA')) {
      credit('HIS-GROVE-ROTA', event.key);
    }
    if (event.key === 'lens-loan:fitCard' && pairedCambridgeReadings) {
      for (const id of ['HIS-DEPOT-Z408A', 'HIS-DEPOT-Z408J']) {
        if (event.sourceIds.includes(id)) credit(id, event.key);
      }
    }
  }

  const readings: ResearchReading[] = [];
  for (const source of pack.sources) {
    const keys = earned.get(source.id);
    if (!keys || !source.mla || !source.url.startsWith('https://')) continue;
    const runs = mlaCitation(source);
    readings.push({ key: source.id, label: source.title, url: source.url,
      text: runs.map(part => part.text).join(''), runs, encounterKeys: [...keys] });
  }
  return readings.sort(compareCitations);
}
