import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const set = (flag: string, eq: string | true = true): Condition => ({ flag, eq });
const unset = (flag: string): Condition => ({ not: { flagSet: flag } });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return {
    id: id.replaceAll('.', '-'), kind: 'scene', node: id, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true, sfx: 'sfx.page',
  };
}

function desk(prefix: string, x: number, y: number, invitation: string, board: string): Interactable[] {
  return [
    scene(prefix + '.invite', x, y, invitation, 'preserved.folder', unset(prefix + '.started')),
    scene(prefix + '.board', x, y, board, 'board-stand', all(set(prefix + '.started'), unset(prefix + '.plan'))),
  ];
}

function source(prefix: string, id: string, x: number, y: number, label: string, art: string): Interactable {
  return scene(prefix + '.' + id, x, y, label, art, all(set(prefix + '.started'), unset(prefix + '.plan')));
}

function receiver(prefix: string, route: string, x: number, y: number, waiting: string, receipt: string, art: string): Interactable[] {
  const key = prefix + '.' + route;
  return [
    scene(key + '.receive', x, y, waiting, 'nile.slip', all(
      set(prefix + '.plan', route), { item: prefix + '.slip' }, unset(prefix + '.done'),
    )),
    scene(key + '.used', x, y, receipt, art, set(prefix + '.done', route)),
  ];
}

const index = 'nexus.public-index';
const welcome = 'nexus.public-welcome';

export const NEXUS_PUBLIC_VOICES: Interactable[] = [
  ...desk(index, 10, 11, 'Venn’s public record folder', 'Venn’s board for the two Yirrkala records'),
  source(index, 'parliament', 11, 10, 'the public catalogue’s two petition entries', 'ledger'),
  source(index, 'centre', 9, 10, 'the Buku-Larrŋgay Mulka Centre’s public history', 'nile.scroll'),
  ...receiver(index, 'dates', 21, 7, 'Venn’s index tray', 'Venn’s two dated index entries', 'ledger'),
  ...receiver(index, 'centre', 7, 13, 'Kip’s handoff beside the west bench', 'the reader’s Centre link on Kip’s bench', 'nile.scroll'),

  ...desk(welcome, 14, 12, 'Sella’s loose visitor clip', 'Sella’s visitor copy board'),
  source(welcome, 'fremont', 10, 13, 'the public account from the Fremont gurdwara', 'nile.scroll'),
  source(welcome, 'abbey', 12, 9, 'Saint Meinrad’s public welcome', 'preserved.folder'),
  source(welcome, 'schedule', 13, 11, 'the separate tour and prayer details from Saint Meinrad', 'ledger'),
  ...receiver(welcome, 'notice', 21, 12, 'Sella’s hall-side visitor clip', 'the tour line above Sella’s two source leaves', 'board-stand'),
  ...receiver(welcome, 'desk', 3, 8, 'Dace’s two empty source clips', 'the Fremont and Saint Meinrad leaves at Dace’s case', 'preserved.folder'),
];
