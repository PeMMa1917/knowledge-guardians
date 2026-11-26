import { EARLIER_VIEWING, earlierViews } from '../content/earlierViewing';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable } from './types';

export function earlierViewingAt(map: string): Interactable[] {
  return earlierViews.filter((record) => record.map === map).map((record) => ({
    id: record.prop, kind: 'fieldgame', game: EARLIER_VIEWING + record.id, x: record.at[0], y: record.at[1], w: 1, h: 1,
    label: record.title, art: 'preserved.folder', walkThrough: true, visibleIf: specimenEquipped(record.key),
    artBy: { flag: `${record.flag}.layout`, keys: { single: 'preserved.display-records', paired: 'preserved.display-paired' } },
  }));
}
