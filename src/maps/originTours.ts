import { homecomingMap, originReturned } from '../content/originHomecomings';
import { travellerVisible } from '../content/originTours';
import {
  originPlaces,
  origins,
  type Origin,
} from '../domain/originInstruments';
import type { MapDef } from './types';

const benches: Record<Origin, [number, number]> = {
  archive: [19, 11],
  traveller: [19, 6],
  harbour: [17, 10],
  workshop: [10, 9],
  singer: [16, 5],
};
export function withOriginVisitor(map: MapDef): MapDef {
  if (map.id === homecomingMap) {
    const spots: Record<Origin, [number, number]> = {
      archive: [10, 6],
      traveller: [17, 6],
      harbour: [21, 5],
      workshop: [24, 16],
      singer: [5, 16],
    };
    return {
      ...map,
      npcs: [
        ...map.npcs,
        ...origins.map((o) => ({
          id: originPlaces[o][2],
          x: spots[o][0],
          y: spots[o][1],
          facing: 'down' as const,
          visibleIf: originReturned(o),
        })),
      ],
    };
  }
  const o = origins.find((o) => originPlaces[o][1] === map.id);
  if (!o) return map;
  const [x, y] = benches[o];
  return {
    ...map,
    npcs: [
      ...map.npcs,
      {
        id: originPlaces[o][2],
        x,
        y,
        facing: 'down',
        visibleIf: travellerVisible(o),
      },
    ],
  };
}
