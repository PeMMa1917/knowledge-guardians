import type { MapDef } from './types';
import { NEXUS } from './nexus';
import { EMBERFORD } from './emberford';
import { STUDY } from './study';

export const MAPS: Record<string, MapDef> = {
  [NEXUS.id]: NEXUS,
  [EMBERFORD.id]: EMBERFORD,
  [STUDY.id]: STUDY,
};
