import sources from './pocket-theatre-sources.json';
import {
  panes,
  theatreKey,
  theatreStories,
  theatreWorld,
} from '../domain/pocketTheatre';
import type {
  Condition,
  ContentPack,
  Hint,
  Objective,
  Weave,
} from '../domain/types';

const questions: Record<string, string> = {
  'brass-price': '005',
  'blue-fringe': '006',
  'empty-peg': '005',
  'six-knots': '005',
  'white-tail': '003',
  'cooling-hook': '003',
  'tuesday-fold': '002',
  'lantern-drift': '005',
  'paper-wings': '002',
  'two-coppers': '003',
  'dry-sleeve': '005',
  'no-queue': '006',
  'rolled-echo': '002',
  'crate-sky': '003',
  'cut-caveat': '002',
  'ten-stamps': '002',
  'reed-hand': '003',
  'mitten-sheet': '005',
  varnish: '003',
  'red-stitch': '004',
  'ninth-tooth': '003',
  'yellow-ink': '002',
  'two-routes': '005',
  'third-bell': '006',
  'ten-bowls': '003',
  'dry-garden': '004',
  'green-window': '002',
  'old-singing': '005',
  'blue-ribbon': '003',
  'night-ledger': '005',
};
const thought: Record<string, NonNullable<Weave['thinking']>> = {
  open: {
    bloom: 'understand',
    dok: 1,
    solo: 'unistructural',
    fink: 'foundational',
  },
  compare: {
    bloom: 'analyse',
    dok: 2,
    solo: 'relational',
    fink: 'application',
  },
  send: { bloom: 'evaluate', dok: 3, solo: 'relational', fink: 'caring' },
  receive: { bloom: 'apply', dok: 2, solo: 'relational', fink: 'integration' },
  return: { bloom: 'understand', dok: 2, solo: 'relational', fink: 'human' },
};
export function installPocketTheatre(pack: ContentPack) {
  for (const source of sources)
    pack.sources.push({
      id: 'POCKET-READING-' + source.id.toUpperCase(),
      title: source.title,
      url: source.url,
      locator: source.title,
      supports: source.supports,
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        title: source.title,
        container: source.container,
        author: source.author,
        publication: source.publication,
        showAccessDate: true,
      },
    });
  for (const story of theatreStories) {
    const key = (part: string) => theatreKey(story.id, part);
    const present = (part: string): Condition => ({ flagSet: key(part) });
    const seen = (n: number): Condition => ({
      flag: key('seen.' + n),
      eq: true,
    });
    const peer = theatreStories.find((s) => s.id === story.peer)!;
    const opened = present('open');
    const conditions: Record<string, Condition> = {
      open: opened,
      compare: {
        any: panes.map((omit) => ({
          all: panes.filter((p) => p !== omit).map(seen),
        })),
      },
      send: present('sent'),
      receive: present('received'),
      return: present('returned'),
    };
    const titles: Record<string, string> = {
      open: 'Unlatch “' + story.title + '”',
      compare: 'Try two changes in “' + story.title + '”',
      send: 'Send an ending for “' + story.title + '”',
      receive: 'Use a sheet from “' + peer.title + '”',
      return: 'Hear what “' + peer.title + '” did with the sheet',
    };
    const help: Record<string, string[]> = {
      open: [
        story.questions[0],
        'Look for the little travelling theatre.',
        'Open the suitcase in this district.',
        'Choose “' + story.title + '” from inside its lid.',
      ],
      compare: [
        story.questions[0],
        'You can leave your first direction open.',
        story.controls[0].join(' / '),
        story.controls[1].join(' / '),
      ],
      send: [
        story.questions[1],
        'Try three different settings of the two parts.',
        story.editions[0].immediate,
        story.editions[1].immediate,
      ],
      receive: [
        'A working sheet can travel between these two desks.',
        'Take the other case in “' + peer.title + '” to a public ending.',
        'Return to this suitcase and open the same pocket.',
        'Use the delivery under the visiting sheet.',
      ],
      return: [
        'The other room has to try your idea first.',
        'Send an ending from this desk.',
        'Use its sheet in “' + peer.title + '”.',
        'Come back to this pocket for the reply.',
      ],
    };
    const ids = ['open', 'compare', 'send', 'receive', 'return'];
    const objectives = ids.map(
      (part): Objective => ({
        id: key(part),
        title: titles[part],
        essential: false,
        done: conditions[part],
        visible:
          part === 'receive'
            ? { flagSet: theatreKey(story.peer, 'sent') }
            : part === 'return'
              ? present('sent')
              : opened,
        weave: { ...story.weave, thinking: thought[part] },
        kq: { id: 'KQ-NEW-' + questions[story.id], action: 'pocket-' + part },
      }),
    );
    pack.missions.push({
      id: 'KG-POCKET-' + story.id.toUpperCase(),
      world: theatreWorld(story),
      title: story.title,
      knowledgeQuestion: story.questions[0],
      stake: story.opening,
      available: opened,
      objectives,
    });
    for (const part of ids)
      help[part].forEach((text, i) =>
        pack.hints.push({
          id: 'h.' + key(part) + '.' + (i + 1),
          objective: key(part),
          depth: (i + 1) as Hint['depth'],
          text,
        }),
      );
  }
}
