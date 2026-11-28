import visits from '../content/hall-visitors.json';
import { PASSAGES } from '../domain/corridor';
import type { MapDef } from './types';

export function visitingCrew(room: string): MapDef['npcs'] {
  return visits.flatMap((trip): MapDef['npcs'] => {
    const home = PASSAGES[trip.home - 1].hall === room;
    if (!home && PASSAGES[trip.away - 1].hall !== room) return [];
    const [x, y] = home ? trip.origin : trip.visit;
    const travelling = { flag: 'journeyman.' + trip.person + '.travelling', eq: true };
    return [{ id: trip.person, x, y, facing: 'down', visibleIf: home ? { not: travelling } : travelling }];
  });
}
