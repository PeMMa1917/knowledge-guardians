import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'last-turn.';
const flag = (name: string, value: string | true = true): Condition => ({ flag: prefix + name, eq: value });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const debate: Condition = { objective: 'm02.o5.showdown' };
const compared: Condition = { objective: prefix + 'compare' };
const posted: Condition = { flagSet: prefix + 'plan' };
const docket: Condition = { item: 'item.last-turn.docket' };

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id: prefix + id, kind: 'scene', x, y, w: 1, h: 1, walkThrough: true, label, art, node: prefix + node, visibleIf };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition, read?: string): Interactable {
  return { id: prefix + id, kind: 'sign', x, y, w: 1, h: 1, walkThrough: true, label, art, text, visibleIf,
    flag: read ? prefix + read : undefined };
}

export const EMBERFORD_LAST_TURN: Interactable[] = [
  { ...scene('slate', 16, 11, 'the face-down speaking slate by the square', 'slate-board', 'turn', all(debate, not(compared))),
    artBy: { flag: prefix + 'turned', keys: { lifted: 'nile.tablet' } } },
  sign('forge', 13, 11, 'Hesper’s slip from the forge road', 'nile.slip',
    'At the forge an apprentice turns a slate face down to hold a turn while they fetch the piece they want to show. Hesper saw Derva do the same and stay by the rail. She wanted people at the back to keep a turn after the louder speakers finished.',
    flag('turned', 'lifted'), 'read.forge'),
  sign('desk', 16, 9, 'Orrin’s slip from the tally desk', 'ledger',
    'At our desk we train each tally clerk to turn a slate face down when its entry is closed. Orrin saw Derva do the same. He drew a line under the speaking list so waiting buyers could collect their orders.',
    flag('turned', 'lifted'), 'read.desk'),
  scene('post', 16, 11, 'the two witness slips beside the speaking slate', 'preserved.display-paired', 'post', all(compared, not(posted))),
  sign('floor', 16, 11, 'Derva’s reopened turn on the square rail', 'preserved.display-paired',
    'Derva speaks from the rail. “I saw the sign from the back row. The speakers’ words never reached us there.” Orrin holds the tally queue for one turn. Her account sits in view of the same queue.',
    flag('plan', 'floor'), 'market.checked'),
  sign('file', 16, 11, 'the closed speaking list with a dated intake stub', 'preserved.display-records',
    'The tally queue moves. The public stub says Derva requested another turn and gives her a place on the Study record. Buyers leave with the tally. They have only this stub for her account.',
    flag('plan', 'file'), 'market.checked'),
];

export const STUDY_LAST_TURN: Interactable[] = [
  sign('study-floor', 8, 10, 'the rail copy beside the Study’s old speaking list', 'preserved.display-paired',
    'Anyone who reads the Study copy can see Derva’s account with the date and her place in the back row. The account tells which words reached those listeners. The line for the blade’s making stays with its sources.',
    all(docket, flag('plan', 'floor'), flag('market.checked')), 'study.checked'),
  scene('study-intake', 10, 10, 'Derva’s dated intake beside the Study stairs', 'preserved.folder', 'intake',
    all(docket, flag('plan', 'file'), flag('market.checked'), not(flag('study.checked')))),
  sign('study-file', 10, 10, 'Derva’s signed account in the opened intake sleeve', 'preserved.display-records',
    'Derva could see the sign from the back row. The speakers’ words never reached those listeners. The Study has her signed account and its intake date. The speaking list still shows where the first hearing stopped.',
    all(docket, flag('plan', 'file'), flag('study.checked'))),
];
