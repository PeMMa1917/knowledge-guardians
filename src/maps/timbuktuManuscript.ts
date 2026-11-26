import { TIMBUKTU_CARD, TIMBUKTU_EXHIBIT, TIMBUKTU_FLAG, TIMBUKTU_OBJECTIVE, TIMBUKTU_OPEN } from '../content/timbuktuManuscript';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const archive: Condition = { all: [TIMBUKTU_OPEN, { card: TIMBUKTU_CARD }] };

export const TIMBUKTU_ARCHIVE_PROPS: Interactable[] = [
  { id: 'timbuktu-manuscript', kind: 'exhibit', exhibit: TIMBUKTU_EXHIBIT, x: 7, y: 5, w: 1, h: 1,
    label: 'the copied 1733 astronomy manuscript’s catalogue record', art: 'timbuktu.horizon-case', visibleIf: TIMBUKTU_OPEN },
  { id: 'timbuktu-horizon-board', kind: 'fieldgame', game: 'timbuktu:board', x: 7, y: 7, w: 1, h: 1,
    label: 'the two-horizon sighting board', art: 'forecast-board', walkThrough: true, visibleIf: archive },
];

export function timbuktuReceiver(route: 'quay' | 'headland'): Interactable {
  const [x, y] = route === 'quay' ? [25, 9] : [18, 11];
  return {
    id: `timbuktu-${route}-receiver`, kind: 'fieldgame', game: `timbuktu:${route}`,
    label: route === 'quay' ? 'the quay readers’ roof line clip' : 'the headland’s paired skyline frame',
    x, y, w: 1, h: 1, walkThrough: true, art: route === 'quay' ? 'fold.strip' : 'fold.paired',
    visibleIf: { all: [archive, { flag: `${TIMBUKTU_FLAG}.read.0`, eq: true },
      { flag: `${TIMBUKTU_FLAG}.read.1`, eq: true }, { flag: `${TIMBUKTU_FLAG}.sent`, eq: route }] },
    artOpen: { key: 'preserved.display-records', if: { flag: TIMBUKTU_OBJECTIVE, eq: route } },
  };
}
