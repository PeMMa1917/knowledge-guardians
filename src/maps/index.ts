import type { MapDef } from './types';
import { NEXUS } from './nexus';
import { EMBERFORD } from './emberford';
import { STUDY } from './study';
import { FERRY } from './ferry';
import { NILE_HALL, NILE_ROYAL, NILE_ROUTE, NILE_WORKYARD } from './nile';
import { UNDERCROFT } from './undercroft';
import { PRESERVED_ARCHIVE, PRESERVED_COAST, PRESERVED_INQUIRY, PRESERVED_ROYAL } from './preserved';
import { OBSERVATORY_HARBOUR, OBSERVATORY_STATION } from './observatory';

export const MAPS: Record<string, MapDef> = {
  [NEXUS.id]: NEXUS,
  [EMBERFORD.id]: EMBERFORD,
  [STUDY.id]: STUDY,
  [FERRY.id]: FERRY,
  [UNDERCROFT.id]: UNDERCROFT,
  [NILE_HALL.id]: NILE_HALL,
  [NILE_ROYAL.id]: NILE_ROYAL,
  [NILE_WORKYARD.id]: NILE_WORKYARD,
  [NILE_ROUTE.id]: NILE_ROUTE,
  [PRESERVED_ARCHIVE.id]: PRESERVED_ARCHIVE,
  [PRESERVED_ROYAL.id]: PRESERVED_ROYAL,
  [PRESERVED_COAST.id]: PRESERVED_COAST,
  [PRESERVED_INQUIRY.id]: PRESERVED_INQUIRY,
  [OBSERVATORY_HARBOUR.id]: OBSERVATORY_HARBOUR,
  [OBSERVATORY_STATION.id]: OBSERVATORY_STATION,
};
