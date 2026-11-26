import type { CampaignState, Condition, ContentPack, ExhibitRecord } from './types';

export const SPECIMEN_BASE = 'nexus.specimen-vault';
export const SPECIMEN_CAPACITY = 3;
export const PERSPECTIVE_FLAG = 'perspective.active';
const ITEM_PREFIX = 'item.specimen.';
const TOOL_PREFIX = 'specimen.';

export type SpecimenExhibit = ExhibitRecord & { specimen: NonNullable<ExhibitRecord['specimen']> };
export const hasSpecimen = (exhibit: ExhibitRecord): exhibit is SpecimenExhibit => !!exhibit.specimen;
export const specimenItemId = (key: string) => `${ITEM_PREFIX}${key}`;
export const specimenToolId = (key: string) => `${TOOL_PREFIX}${key}`;
export const isSpecimenItem = (id: string) => id.startsWith(ITEM_PREFIX);
export const specimenFromTool = (id: string) => id.startsWith(TOOL_PREFIX) ? id.slice(TOOL_PREFIX.length) : undefined;
export const carryFlag = (key: string) => `specimen.carried.${key}`;
export const specimenReadingFlag = (key: string) => `specimen.stand-reading.${key}`;

export const ownsSpecimen = (state: CampaignState, key: string) => (state.inventory[specimenItemId(key)] ?? 0) > 0;
export const carriesSpecimen = (state: CampaignState, key: string) => ownsSpecimen(state, key) && state.flags[carryFlag(key)] === true;
export const carriedSpecimenCount = (state: CampaignState) => Object.keys(state.inventory)
  .filter((id) => isSpecimenItem(id) && state.flags[carryFlag(id.slice(ITEM_PREFIX.length))] === true).length;

export function canClaimSpecimen(state: CampaignState, exhibit: SpecimenExhibit): boolean {
  return !ownsSpecimen(state, exhibit.specimen.key) && state.flags[`inspected.${exhibit.id}`] === true
    && state.objectivesDone.includes(exhibit.specimen.objective);
}

export function specimenEquipped(key: string): Condition {
  return { all: [{ item: specimenItemId(key) }, { flag: carryFlag(key), eq: true },
    { flag: PERSPECTIVE_FLAG, eq: specimenToolId(key) }] };
}

export function specimenEquipment(pack: ContentPack): void {
  const equipment = pack.keepsakes ?? (pack.keepsakes = []);
  for (const record of pack.exhibits.filter(hasSpecimen)) {
    const { key, institution, accession, revisit } = record.specimen;
    const item = specimenItemId(key);
    pack.items.push({ id: item, name: record.name, historicalLabel: record.historicalLabel,
      description: `${institution} · ${accession}`, art: record.art });
    equipment.push({ id: specimenToolId(key), name: record.name, text: record.summary,
      if: { item }, where: 'The Nexus collection room', use: revisit?.hint ?? 'Try the return arch in the Nexus collection room.',
      equip: { method: revisit?.method ?? 'Reopen a route with this object.',
        hint: revisit?.hint ?? 'Use the route arch in the Nexus collection room to return to where you found it.', art: record.art } });
  }
}
