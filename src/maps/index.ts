import type { MapDef } from './types';
import { NEXUS } from './nexus';
import { EMBERFORD } from './emberford';
import { STUDY } from './study';
import { FERRY } from './ferry';

export const MAPS: Record<string, MapDef> = {
  [NEXUS.id]: NEXUS,
  [EMBERFORD.id]: EMBERFORD,
  [STUDY.id]: STUDY,
  [FERRY.id]: FERRY,
};
