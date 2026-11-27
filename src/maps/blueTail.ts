import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const strip: Condition = { item: 'item.blue-tail' };
const found = (name: string): Condition => ({ flagSet: `tail.${name}` });
const flag = (name: string, eq: boolean | string = true): Condition => ({ flag: name, eq });
const not = (condition: Condition): Condition => ({ not: condition });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const ready = all(strip, found('water'), found('voices'), { any: [found('copies'), found('market')] });
const undecided = not(found('decision'));

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition, node = id): Interactable {
  return { id: `blue-tail-${id.replaceAll('.', '-')}`, kind: 'scene', node: `tail.${node}`, x, y, w: 1, h: 1,
    label, art: `blue-tail.${art}`, walkThrough: true, visibleIf, sfx: 'sfx.page' };
}

/** The folded object or reply changes in place once the player acts on it. */
function clue(id: string, x: number, y: number, label: string, art: string, gate = strip, replyLabel = label): Interactable[] {
  return [scene(id, x, y, label, art, all(gate, not(found(id)))),
    scene(`${id}.heard`, x, y, replyLabel, 'marked', all(gate, found(id)))];
}

const receiving = (stage: 'start-route' | 'decision' | 'finished', route: 'rail' | 'desk'): Condition => ({ flag: `tail.${stage}`, eq: route });

const blueTail: Record<string, Interactable[]> = {
  'nexus.archive': [
    scene('stair', 15, 14, 'the blue thread caught on the stair rail', 'strip', not(found('started'))),
    scene('bench', 15, 14, 'Kip’s open folding board', 'fold', all(strip, not(found('start-route')))),
    scene('early.rail', 11, 12, 'Kip’s dusk warning for the porter', 'rail', all(receiving('start-route', 'rail'), not(found('first-reader')))),
    scene('early.rail.receipt', 11, 12, 'the warning lowered for a porter carrying a box', 'rail-low', flag('tail.first-reader', 'rail')),
    scene('early.desk', 17, 11, 'Ise’s quiet desk hand-off', 'desk', all(receiving('start-route', 'desk'), not(found('first-reader')))),
    scene('early.desk.receipt', 17, 11, 'the desk number beside a closed return fold', 'desk-marked', flag('tail.first-reader', 'desk')),
    scene('nexus.rail', 13, 9, 'Kip’s lowered warning beside the historic blank', 'rail-low', receiving('finished', 'rail')),
    scene('nexus.desk', 19, 7, 'Ise’s two bell times beside the paired stub', 'desk-marked', receiving('finished', 'desk')),
  ],
  'nile.hall': clue('nile', 13, 10, 'Leila’s two-sided receiving fold', 'fold', strip, 'Leila’s marked dispatch and receipt loops'),
  'preserved.archive': clue('cold', 8, 14, 'Nima’s closed sleeve and outside tally', 'desk', strip, 'Nima’s copied outer movement mark'),
  'observatory.harbour': clue('coast', 9, 10, 'the watch slates with different pins', 'rail', strip, 'the slates on their own watch pins'),
  'forest.trail': [scene('forest.bend', 14, 8, 'the sightline at the white post', 'marked', all(strip, not(found('forest.bend')))),
    scene('forest.bend.done', 14, 8, 'the screened shelf marked from the bend', 'rail', all(strip, found('forest.bend')))],
  'forest.station': clue('forest', 11, 7, 'the far-side sightline and watcher’s book', 'fold', all(strip, found('forest.bend')), 'the joined sightline record with the interval open'),
  'metalworks.yard': clue('metal', 11, 7, 'the shallow and deep slip slots', 'fold', strip, 'the two results from the same practice strip'),
  'copies.press': [
    scene('copies.proof', 10, 6, 'the press proof with a broken letter', 'strip', all(strip, not(found('copies.cut')))),
    scene('copies.cut', 10, 6, 'the original and proof lined up at the tear', 'marked', all(strip, found('copies.cut'))),
    ...clue('copies', 13, 10, 'the runner’s sewn fold on the drying shelf', 'fold', all(strip, found('copies.cut')), 'the press and runner proofs clipped in date order'),
  ],
  'sea.harbour': clue('sea', 14, 6, 'the crew’s liftable card for Needle’s Lee', 'strip', strip, 'the marked approach with the crew’s local name'),
  'stage.gallery': [
    scene('stage.rear', 13, 7, 'the stage cue from behind the wings', 'fold', all(strip, not(found('stage.words')))),
    scene('stage.echo', 13, 7, 'the words at the back of the gallery', 'marked', all(strip, found('stage.words'))),
    ...clue('stage', 15, 9, 'the host’s view of the cue from the front rail', 'rail', all(strip, found('stage.words')), 'the caller’s full line about a stage prop'),
  ],
  'market.square': clue('market', 10, 18, 'Rook’s blue-tail guide and signing board', 'desk', all(strip, flag('rook.joined')), 'Rook’s signed account with an open dispatch box'),
  'water.gatehouse': clue('water', 14, 7, 'the keeper’s B17 counterfoil', 'fold', all(strip, flag('harrowmere.found')), 'the matched B17 instruction with its return box open'),
  'civic.steps': clue('civic', 12, 7, 'the dispatch and walk-up queue copy', 'fold', strip, 'the dispatch closed and the walk-up request kept open'),
  'voices.listening': clue('voices', 11, 7, 'the playback shutter and tied name sleeve', 'desk', strip, 'the approved warning beside the closed sleeve'),
  'island.workshop': clue('island', 13, 7, 'the two wooden feet beside the layout model', 'fold', strip, 'the later layout with its keeper and dusk limit'),
  'council.gallery': [
    scene('council.missing', 19, 11, 'the empty blue-tail rails', 'fold', all(strip, not(ready))),
    scene('council', 19, 11, 'the two evidence rails for the stair warning', 'fold', all(ready, undecided, not(found('council.tested')))),
    scene('council.resume', 19, 11, 'the matched strip and the approved words', 'marked', all(ready, undecided, found('council.tested'))),
    scene('end.rail', 16, 13, 'the low Council rail for the next porter', 'rail', all(receiving('decision', 'rail'), not(found('finished')))),
    scene('end.rail.done', 16, 13, 'the checked warning with an empty return box', 'rail-low', receiving('finished', 'rail')),
    scene('end.desk', 22, 11, 'the Council’s staffed desk and new return stub', 'desk', all(receiving('decision', 'desk'), not(found('finished')))),
    scene('end.desk.done', 22, 11, 'the new timed stub next to the historic blank', 'desk-marked', receiving('finished', 'desk')),
  ],
};

export function blueTailAt(map: string): Interactable[] {
  return blueTail[map] ?? [];
}
