import type { ContentPack, ExhibitRecord } from '../domain/types';
import records from './survey-depot-records.json';
import story from './survey-depot-story.json';

const institution = 'Scott Polar Research Institute, University of Cambridge';
const catalogue = 'https://www.spri.cam.ac.uk/museum/catalogue/article/';

export const DEPOT_RECORDS = records.map((record) => ({
  ...record,
  source: `HIS-DEPOT-${record.path.toUpperCase()}`,
  exhibit: `OBJ-DEPOT-${record.path.toUpperCase()}`,
  card: `card.depot.${record.slug}`,
  art: `depot.case.${record.slug}`,
}));

const exhibitRecords: ExhibitRecord[] = DEPOT_RECORDS.map((record) => {
  const objective = record.group === 'identity' ? 'known' : record.group === 'counts' ? 'count' : record.group;
  return {
    id: record.exhibit, name: record.title, art: record.art, historicalLabel: 'documented',
    dateText: record.date, dateKind: record.dateKind, summary: record.summary, sources: [record.source],
    grantsCard: record.card, altText: `Original schematic. ${record.alt}`,
    ...(record.counted ? { specimen: {
      key: `spri:${record.accession.toLowerCase().replace(': ', '-').replaceAll('/', '-')}`,
      institution, accession: record.accession, source: record.source, objective: `depot.${objective}`,
    } } : {}),
  };
});

// Dialogue, objectives and hints use the same content-only vocabulary as other mission files.
export const surveyDepotContent: Partial<ContentPack> = {
  ...story as Partial<ContentPack>,
  exhibits: exhibitRecords,
  cards: DEPOT_RECORDS.map((record) => ({
    id: record.card, title: `${record.accession} · ${record.title}`, text: record.summary,
    claimKind: 'observation', historicalLabel: 'documented', sources: [record.source], limits: record.limits,
  })),
  sources: DEPOT_RECORDS.map((record) => ({
    id: record.source, title: `${institution}, ${record.title} (${record.accession})`, url: `${catalogue}${record.path}/`,
    locator: 'Accession number, object description, expedition association, field collection where given, and physical description where given',
    supports: record.summary, accessed: '2026-11-26',
    mla: { kind: 'page', title: record.title, container: institution, showAccessDate: true },
  })),
};
