import { mlaCitation, type CitationPart } from './mla';
import { hasSpecimen, ownsSpecimen } from './specimenGear';
import type { CampaignState, ContentPack } from './types';

export interface SpecimenReference {
  key: string;
  label: string;
  url: string;
  text: string;
  runs: CitationPart[];
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
