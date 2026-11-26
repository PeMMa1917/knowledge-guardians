import { REFERENCE_PROOF } from '../domain/referenceProofs';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const reviewed = (subject: string): Condition => ({ card: `card.scope.${subject}` });
const coastal: Condition = { objective: 'coast.revise' };

function tray(subject: string, station: string, x: number, y: number, label: string, art: string,
  visibleIf: Condition): Interactable {
  return {
    id: `reference-${subject}-${station}`, kind: 'fieldgame', game: `${REFERENCE_PROOF}:${subject}.${station}`,
    x, y, w: 1, h: 1, label, art, walkThrough: true, visibleIf,
  };
}

function receiver(subject: string, route: 'short' | 'full', x: number, y: number, label: string): Interactable {
  return {
    ...tray(subject, route, x, y, label, 'preserved.folder', { flag: `scope.${subject}.sent`, eq: route }),
    artOpen: { key: 'preserved.display-paired', if: { flag: `scope.${subject}.display`, eq: route } },
  };
}

function exact(subject: string, art: string, x: number, y: number, label: string, visibleIf?: Condition): Interactable {
  return {
    id: `reference-${subject}-record`, kind: 'exhibit', exhibit: `OBJ-${subject.toUpperCase()}-EXACT`,
    x, y, w: 1, h: 1, art, label, visibleIf, walkThrough: true,
  };
}

export const PRESS_REFERENCE_PROOFS: Interactable[] = [
  exact('bone', 'reference-bone-tabs', 23, 14, 'the exact oracle-bone catalogue record'),
  {
    id: 'reference-bone-period', kind: 'sign', x: 22, y: 16, w: 1, h: 1, walkThrough: true,
    label: 'the period drawer for 67.43.16', art: 'preserved.slip', visibleIf: reviewed('bone'),
    text: 'The Met catalogue places this inscribed bone in the Shang dynasty, about 1600–1046 BCE. It gives a period for this object.',
    flag: 'scope.bone.period', sfx: 'sfx.page',
  },
  {
    id: 'reference-bone-gift', kind: 'sign', x: 24, y: 16, w: 1, h: 1, walkThrough: true,
    label: 'the accession credit drawer for 67.43.16', art: 'preserved.slip', visibleIf: reviewed('bone'),
    text: 'Gift of Paul E. Manheim, 1967. This date describes how the bone came into the Met’s collection.',
    flag: 'scope.bone.gift', sfx: 'sfx.page',
  },
  tray('bone', 'bench', 23, 18, 'the two-date record tray', 'ledger', reviewed('bone')),
  receiver('bone', 'full', 23, 20, 'the two-date study folder'),
  exact('jikji', 'reference-jikji-type', 28, 14, 'the Jikji accession Coréen 109'),
  tray('jikji', 'bench', 28, 16, 'the two printing forms', 'copies.press', reviewed('jikji')),
  receiver('jikji', 'full', 28, 19, 'the press comparison folder'),
];

export const LANDING_REFERENCE_PROOFS: Interactable[] = [
  receiver('bone', 'short', 5, 13, 'the bone’s two-date reading rail'),
  receiver('jikji', 'short', 8, 13, 'the printed edition card for Coréen 109'),
];

export const COAST_REFERENCE_PROOFS: Interactable[] = [
  exact('astrolabe', 'reference-rasulid-dial', 9, 5, 'the record of the signed Rasulid astrolabe', coastal),
  tray('astrolabe', 'bench', 10, 5, 'the practice dial with two place plates', 'board-stand', reviewed('astrolabe')),
  receiver('astrolabe', 'full', 14, 12, 'the paired dial readings at the archive table'),
];

export const HARBOUR_REFERENCE_PROOFS: Interactable[] = [
  receiver('astrolabe', 'short', 23, 12, 'the labelled quay plate reading'),
];
