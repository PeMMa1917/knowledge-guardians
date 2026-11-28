import { homecomingMap, originReturned } from '../content/originHomecomings';
import { travellerVisible } from '../content/originTours';
import {
  originPlaces,
  origins,
  type Origin,
} from '../domain/originInstruments';
import type { MapDef, Interactable } from './types';

const benches: Record<Origin, [number, number]> = {
  archive: [19, 11],
  traveller: [19, 6],
  harbour: [17, 10],
  workshop: [10, 9],
  singer: [16, 5],
};
export function withOriginVisitor(map: MapDef): MapDef {
  if (map.id === homecomingMap || map.id === 'stage.foyer') {
    const atCouncil = map.id === homecomingMap;
    const notch: Interactable = {
      id: atCouncil
        ? 'origin-splinter-council-notch'
        : 'origin-splinter-foyer-notch',
      kind: 'scene',
      x: 19,
      y: atCouncil ? 16 : 5,
      w: 1,
      h: 1,
      walkThrough: true,
      label: atCouncil
        ? 'the notch in the Council display rail'
        : 'the scrape through the theatre sign',
      art: 'old-sign',
      node: atCouncil ? 'origin-splinter.gallery' : 'origin-splinter.foyer',
      visibleIf: { flag: 'perspective.active', eq: 'sign-splinter' },
    };
    map = { ...map, interactables: [...map.interactables, notch] };
  }
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
