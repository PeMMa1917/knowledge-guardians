import { inkGuests, inkRunner } from '../content/secondInk';
import { inkCases, inkKey, type InkEdition } from '../domain/secondInk';
import type { Interactable, MapDef } from './types';

const addresses: Record<InkEdition, [number, number, string, string]> = {
  exhibit: [29, 7, 'the pin rail in the east aisle', 'rail'],
  serve: [5, 21, 'the service tray in the west aisle', 'tray'],
  entrust: [29, 21, 'the witness seat in the south aisle', 'seat'],
};
export function inkProps(map: string): Interactable[] {
  const k = inkCases.find((s) => s.room === map);
  if (!k) return [];
  return [
    {
      id: 'secondink.' + k.site + '.bench',
      kind: 'fieldgame',
      game: 'second-ink-press',
      label: 'the proof press under the gold moth',
      art: 'secondink.moth',
      x: 31,
      y: 24,
      w: 1,
      h: 1,
      sfx: 'sfx.page',
    },
    ...Object.entries(addresses).map(
      ([edition, [x, y, label, art]]): Interactable => ({
        id: 'secondink.' + k.site + '.' + edition,
        kind: 'fieldgame',
        game: 'second-ink-corner',
        label,
        art: 'secondink.' + art,
        x,
        y,
        w: 1,
        h: 1,
        walkThrough: true,
        visibleIf: { flag: inkKey(k, 'edition'), eq: edition },
        sfx: 'sfx.page',
      }),
    ),
  ];
}
export function inkPeople(map: string): MapDef['npcs'] {
  const k = inkCases.find((s) => s.room === map);
  if (!k) return [];
  const guest = inkGuests[k.site];
  return [
    { id: inkRunner, x: 32, y: 22, facing: 'left' },
    { id: 'agate-vale', x: 28, y: 24, facing: 'right' },
    ...(guest ? [{ id: guest.person, x: 26, y: 21, facing: 'down' as const }] : []),
  ];
}
