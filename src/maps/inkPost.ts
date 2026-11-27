import stations from '../content/ink-post-stations.json';
import type { Interactable } from './types';

export function inkPostAt(map: string): Interactable[] {
  const station = stations.find((entry) => entry.map === map);
  if (!station) return [];
  const id = 'ink-post.' + station.id;
  return [{ id, kind: 'scene', node: id, label: 'the folded-wing post', art: 'ink-post.bird',
    artOpen: { key: 'ink-post.reply', if: { flag: id + '.news', eq: true } },
    x: station.at[0], y: station.at[1], w: 1, h: 1, walkThrough: true, sfx: 'sfx.page' }];
}
