import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'gutenberg.red.';
const referral: Condition = { item: 'item.gutenberg-leaf-slip' };
const filed: Condition = { flagSet: prefix + 'bookmark' };
const proof: Condition = { objective: prefix + 'compared' };
const sent: Condition = { flagSet: prefix + 'route' };
const done: Condition = { objective: prefix + 'used' };
const atPress: Condition = { all: [{ objective: 'copies.arrival' }, referral] };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `gutenberg-red-${id}`, kind: 'scene', node: prefix + node, x, y, w: 1, h: 1,
    label, art: `same-red.${art}`, visibleIf, walkThrough: true };
}

export const NEXUS_SAME_RED: Interactable[] = [
  { id: 'gutenberg-red-exhibit', kind: 'exhibit', exhibit: 'OBJ-LOC-GUTENBERG-52002339', x: 18, y: 5, w: 1, h: 1,
    label: 'the Library of Congress Gutenberg Bible, BS75 1454', art: 'same-red.exhibit', walkThrough: true },
  scene('catalogue', 'catalogue', 20, 6, 'Dace’s leaf bookmark beside the bibliographic record', 'catalogue',
    { all: [{ card: 'card.loc.gutenberg.52002339' }, { not: filed }] }),
  ...(['leaf', 'methods'] as const).map((route) => scene(`filed-${route}`, `catalogue.${route}`, 20, 6,
    'the checked source slip for Lark', `slip-${route}`, { flag: prefix + 'bookmark', eq: route })),
];

export const PRESS_SAME_RED: Interactable[] = [
  { ...scene('type', 'type', 19, 9, 'Lark’s fictional fixed-type proof', 'type', atPress),
    artOpen: { key: 'same-red.type-checked', if: { flag: prefix + 'type', eq: true } } },
  { ...scene('hand', 'hand', 15, 8, 'Lark’s fictional hand-added proof', 'hand', atPress),
    artOpen: { key: 'same-red.hand-checked', if: { flag: prefix + 'hand', eq: true } } },
  scene('plan', 'plan', 15, 13, 'the two fictional proof bundles and the class request', 'catalogue',
    { all: [atPress, proof, { not: sent }] }),
  ...(['type', 'hand'] as const).map((route) => scene(`sent-${route}`, `sent.${route}`, 15, 13,
    'the dispatch receipt for the fictional hall proof', `${route}-checked`, { flag: prefix + 'route', eq: route })),
];

export const LANDING_SAME_RED: Interactable[] = [
  ...([
    ['type', 11, 8, 'the paired fictional hall notices at the class rail'],
    ['hand', 7, 12, 'the fictional proof at the outer writing table'],
  ] as const).flatMap(([route, x, y, label]) => {
    const sentHere: Condition = { flag: prefix + 'route', eq: route };
    const mounted: Condition = { flag: prefix + 'mounted', eq: true };
    return [
      scene(`mount-${route}`, `landing.mount.${route}`, x, y, label, route, { all: [sentHere, { not: mounted }] }),
      scene(`read-${route}`, `landing.read.${route}`, x, y, label, `${route}-checked`, { all: [sentHere, mounted, { not: done }] }),
      scene(`kept-${route}`, `landing.kept.${route}`, x, y, label, `kept-${route}`, { all: [sentHere, done] }),
    ];
  }),
];
