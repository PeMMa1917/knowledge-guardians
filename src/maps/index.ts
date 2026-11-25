import type { MapDef } from './types';
import { NEXUS } from './nexus';
import { EMBERFORD } from './emberford';

export const MAPS: Record<string, MapDef> = {
  [NEXUS.id]: NEXUS,
  [EMBERFORD.id]: EMBERFORD,
};
