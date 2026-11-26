import type { MapDef } from './types';
import { NEXUS } from './nexus';
import { EMBERFORD } from './emberford';
import { STUDY } from './study';
import { FERRY } from './ferry';
import { NILE_HALL, NILE_ROYAL, NILE_ROUTE, NILE_WORKYARD } from './nile';
import { UNDERCROFT } from './undercroft';

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
};
