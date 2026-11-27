import type { CampaignState, Condition, ContentPack, Effect, ExhibitRecord } from './types';

export const SPECIMEN_BASE = 'nexus.specimen-vault';
export const SPECIMEN_CAPACITY = 3;
export const SPECIMEN_TARGET = 1000;
export const SPECIMEN_CASES = 6;
export const SPECIMEN_SHELF = 'specimen-shelf:';
export const SPECIMEN_PAGE = 'specimens.display.page';
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

const seatFlag = (key: string) => 'specimen.seat.' + key;
/** Anchors refer to catalogue IDs so adding a new exhibit does not invalidate a saved arrangement. */
export function specimenSeat(state: CampaignState, key: string): string {
  const seat = state.flags[seatFlag(key)];
  return typeof seat === 'string' ? seat : key;
}

export function swapSpecimenPlaces(state: CampaignState, first: string, second: string, targetSeat: string, satchel: boolean): Effect[] {
  if (state.mapId !== SPECIMEN_BASE || first === second || !ownsSpecimen(state, first) || !ownsSpecimen(state, second))
    throw new Error('Select two different collected objects at the Nexus display.');
  if (specimenSeat(state, first) === targetSeat && carriesSpecimen(state, first) === satchel) return [];
  if (carriesSpecimen(state, first) || carriesSpecimen(state, second) !== satchel || specimenSeat(state, second) !== targetSeat)
    throw new Error('The objects have moved. Choose their current places.');
  const effects: Effect[] = [
    { setFlag: seatFlag(second), value: specimenSeat(state, first) }, { setFlag: seatFlag(first), value: targetSeat },
  ];
  if (satchel) {
    effects.push({setFlag:carryFlag(second),value:false},{setFlag:carryFlag(first),value:true});
    if (state.flags[PERSPECTIVE_FLAG] === specimenToolId(second)) effects.push({setFlag:PERSPECTIVE_FLAG,value:false});
  }
  return effects;
}

export function specimenDisplay(pack: ContentPack, state: CampaignState) {
  const stored = [], carried = [];
  const exhibits = pack.exhibits.filter(hasSpecimen);
  for (const exhibit of exhibits) {
    if (!ownsSpecimen(state, exhibit.specimen.key)) continue;
    if (carriesSpecimen(state, exhibit.specimen.key)) carried.push(exhibit);
    else stored.push(exhibit);
  }
  if (stored.some(record => specimenSeat(state, record.specimen.key) !== record.specimen.key)) {
    const catalogueOrder = new Map(exhibits.map(({specimen}, index) => [specimen.key, index]));
    const rank = ({specimen}: SpecimenExhibit) => catalogueOrder.get(specimenSeat(state,specimen.key)) ?? catalogueOrder.get(specimen.key)!;
    stored.sort((a,b) => rank(a) - rank(b));
  }
  const pages = Math.max(1, Math.ceil(stored.length / SPECIMEN_CASES));
  const selected = state.flags[SPECIMEN_PAGE];
  const page = Number.isSafeInteger(selected) ? Math.max(0, Math.min(Number(selected), pages - 1)) : 0;
  return { stored, carried, page, pages, cases: stored.slice(page * SPECIMEN_CASES, (page + 1) * SPECIMEN_CASES) };
}

/** Look up only objects present in this Guardian's collection. A null page locates the satchel. */
export function findCollectedSpecimens(display: ReturnType<typeof specimenDisplay>, query: string) {
  const fold = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
  const words = query.trim().split(/\s+/).map(fold).filter(Boolean);
  const matches: { record: SpecimenExhibit; page: number | null }[] = [];
  if (!words.length) return matches;
  function match(record: SpecimenExhibit, page: number | null) {
    const { accession, institution, people = [] } = record.specimen;
    const fields = [record.name, accession, institution, ...people.map(({ name }) => name)].map(fold);
    if (words.every((word) => fields.some((field) => field.includes(word)))) matches.push({ record, page });
  }
  display.carried.forEach((record) => match(record, null));
  display.stored.forEach((record, index) => match(record, Math.floor(index / SPECIMEN_CASES)));
  return matches;
}

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
