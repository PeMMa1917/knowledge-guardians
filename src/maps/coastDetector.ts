import { DETECTOR_GAME, DETECTOR_HANDOFF } from '../domain/coastDetector';
import type { Interactable } from './types';

export const COAST_DETECTOR: Interactable = {
  id: 'coast-detector-rail', kind: 'fieldgame', game: DETECTOR_GAME,
  x: 16, y: 11, w: 1, h: 1, walkThrough: true, label: 'Neri’s four-mark light reader',
  art: 'coast.clear-frame', artBy: { flag: DETECTOR_HANDOFF, keys: { ramp: 'fold.strip', stairs: 'fold.paired' } },
  visibleIf: { flag: 'coast.arrived', eq: true },
};

export const COAST_DETECTOR_RECEIPTS: Interactable[] = [
  {
    id: 'coast-detector-ramp', kind: 'sign', x: 21, y: 10, w: 1, h: 1, walkThrough: true,
    label: 'Ruan’s first-bell ramp receipt', art: 'coast.signal',
    text: 'The landing and outer lamp gave separate marks, 9 and 12. Ruan set the practice ropes at the ramp in time for the first bell. The stair strip still has two marks listed as “4 or lower”. No rope was set on the stair.',
    flag: 'coast.detector.received', visibleIf: { flag: DETECTOR_HANDOFF, eq: 'ramp' },
  },
  {
    id: 'coast-detector-stairs', kind: 'sign', x: 8, y: 14, w: 1, h: 1, walkThrough: true,
    label: 'Ruan’s paired lower-rail receipt', art: 'fold.paired',
    text: 'The amplified strip gives 1 at the rim cord and 3 at the lower step. Beside them Ruan keeps the wide strip for the two lamps. The ramp crew held their practice ropes until the second strip arrived. Both sets of rope marks are now in the handover.',
    flag: 'coast.detector.received', visibleIf: { flag: DETECTOR_HANDOFF, eq: 'stairs' },
  },
];
