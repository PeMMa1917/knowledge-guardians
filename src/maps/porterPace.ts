import { paceSummary, PORTER_CREWS, PORTER_EARLY, PORTER_EARLY_RECEIPT, PORTER_LATER, PORTER_LATER_RECEIPT,
  PORTER_PACES, PORTER_SLIP, PORTER_TOOL, runPorterTrial } from '../domain/porterPace';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

export const PORTER_WATER_READY: Condition = { all: [{ objective: 'water.arrival' }, { item: PORTER_SLIP }] };

export const PORTER_EMBERFORD: Interactable[] = [
  {
    id: 'porter-pace-board', kind: 'fieldgame', game: `${PORTER_TOOL}:emberford`, x: 10, y: 7, w: 1, h: 1,
    label: 'Idris’s carry and recovery board', art: 'clerk-map', walkThrough: true,
    visibleIf: { flag: 'reached.emberford', eq: true },
    artBy: { flag: PORTER_EARLY, keys: { front: 'fold.strip', even: 'fold.paired' } },
  },
  ...PORTER_PACES.map((pace): Interactable => ({
    id: `porter-pace-${pace}`, kind: 'sign', x: pace === 'front' ? 8 : 10, y: pace === 'front' ? 6 : 9, w: 1, h: 1,
    label: pace === 'front' ? 'Idris’s west porch delivery receipt' : 'Idris’s steady-round bench receipt',
    art: pace === 'front' ? 'fold.strip' : 'fold.paired', flag: PORTER_EARLY_RECEIPT, walkThrough: true,
    visibleIf: { flag: PORTER_EARLY, eq: pace },
    text: [
      pace === 'front'
        ? 'The porch crew collected in the early round. Idris leaves the next carry to the next porter while he takes a longer pause.'
        : 'The bench crew waited for the later round. Idris kept a lower peak on the practice board and stayed on the next carry list.',
      paceSummary(runPorterTrial('emberford', pace, 'solo'), 'solo'),
      'Take the slip with the pace, route and pause still named.',
    ].join(' '),
  })),
];

export const PORTER_COUNCIL: Interactable[] = [
  {
    id: 'porter-crew-board', kind: 'fieldgame', game: `${PORTER_TOOL}:water`, x: 21, y: 8, w: 1, h: 1,
    label: 'Sena’s half-route handover board', art: 'clerk-map', walkThrough: true,
    visibleIf: PORTER_WATER_READY,
    artBy: { flag: PORTER_LATER, keys: { solo: 'fold.strip', relay: 'fold.paired' } },
  },
  ...PORTER_CREWS.flatMap((crew) => PORTER_PACES.map((pace): Interactable => ({
    id: `porter-crew-${crew}-${pace}`, kind: 'sign', x: crew === 'solo' ? 20 : 22, y: crew === 'solo' ? 11 : 13,
    w: 1, h: 1, walkThrough: true, label: crew === 'solo' ? 'Sena’s south handover receipt' : 'Sena’s lower-side relay receipt',
    art: crew === 'solo' ? 'fold.strip' : 'fold.paired', flag: PORTER_LATER_RECEIPT,
    visibleIf: { all: [{ flag: PORTER_LATER, eq: crew }, { flag: PORTER_EARLY, eq: pace }] },
    text: [
      crew === 'solo'
        ? 'The load went straight to the south handover. The second worker stayed on rinsing duty. The first takes the next duty later.'
        : 'The carrier at the lower-side bench took the halfway load and left the rinse to another turn. The first carrier returned to the yard while the load was still moving.',
      paceSummary(runPorterTrial('water', pace, crew), crew),
    ].join(' '),
  }))),
];
