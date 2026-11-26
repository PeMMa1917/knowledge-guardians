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
  const sortText = (entry: SpecimenReference) => entry.text.replace(/^[“"]?(?:(?:an?|the)\s+)?/i, '');
  return entries.sort((a, b) => sortText(a).localeCompare(sortText(b), 'en') || a.key.localeCompare(b.key, 'en'));
}
