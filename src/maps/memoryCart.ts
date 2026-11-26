import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const arrived: Condition = { flag: 'reached.emberford', eq: true };
const at = (name: string, eq: string | true = true): Condition => ({ flag: `memory-cart.${name}`, eq });
const set = (name: string): Condition => ({ flagSet: `memory-cart.${name}` });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const working = set('working');
const first = set('first');
const afterSources: Condition = { objective: 'memory-cart.sources' };

function scene(id: string, pos: [number, number], label: string, node: string, art: string, visibleIf: Condition): Interactable {
  return { id: `memory-cart-${id}`, node: `memory-cart.${node}`, kind: 'scene',
    label, x: pos[0], y: pos[1], w: 1, h: 1, art: `memory-cart.${art}`, walkThrough: true, visibleIf };
}

function sign(id: string, pos: [number, number], label: string, text: string, art: string, visibleIf: Condition, flag?: string): Interactable {
  return { id: `memory-cart-${id}`, kind: 'sign', label, x: pos[0], y: pos[1], w: 1, h: 1, text,
    art: `memory-cart.${art}`, walkThrough: true, visibleIf, flag: flag && `memory-cart.${flag}` };
}

export const CART_MEMORY_ACTORS: MapDef['npcs'] = [
  { id: 'memory-cart-edrin', x: 21, y: 16, facing: 'down', visibleIf: all(first, not(working)) },
  { id: 'memory-cart-nella', x: 24, y: 18, facing: 'left', visibleIf: all(working, at('notice'), not(at('clip'))) },
];

export const CART_MEMORY_PROPS: Interactable[] = [
  scene('launch-wheel', [19, 20], 'the chalk-bar opening and cart stop', 'launch.wheel', 'stop',
    all(arrived, not(first), not(at('open.wheel')))),
  scene('first-wheel', [19, 20], 'the new tread past the chalk bar', 'first.wheel', 'wheel',
    all(arrived, not(first), at('open.wheel'))),
  scene('launch-strap', [21, 20], 'the eyelet opening and cart stop', 'launch.strap', 'stop',
    all(arrived, not(first), not(at('open.strap')))),
  scene('first-strap', [21, 20], 'the blue cord through the crate eye and peg', 'first.strap', 'strap',
    all(arrived, not(first), at('open.strap'))),
  scene('guide', [20, 17], 'Edrin’s account of the cart pass', 'guide', 'folder', all(first, not(working))),
  sign('notice', [21, 17], 'the covered-stall circulation slip',
    'I received our own collector’s list. None of those copies went past the covered stall. I had no west reading when we agreed where the crate stopped. —Nella',
    'folder', working, 'notice'),
  scene('clip', [19, 17], 'the flap fastened over the west witness slot', 'clip', 'closed', all(working, at('notice'), not(at('clip')))),
  sign('clip-open', [19, 17], 'the west slot and its former instruction',
    'Nella lifts the west strip into the reopened slot. The folded instruction remains beside it. It asked the stall crew to discard every west reading unopened.',
    'open', at('clip')),
  scene('wheel', [17, 19], 'the independent west chalk replay', 'wheel', 'wheel', at('clip')),
  sign('wheel-proof', [17, 16], 'the tread strip after the chalk replay',
    'A new wheel tread extends beyond the bar, just as the kept west strip shows. The framing still hides the crate. This view can establish passage across the bar.',
    'wheel', at('replay.wheel'), 'seen.wheel'),
  scene('strap', [23, 18], 'the independent east cord replay', 'strap', 'strap', working),
  sign('strap-proof', [22, 16], 'the cord loop after replay at the second opening',
    'The blue loop stays through the crate and cart peg throughout this opening. The framing leaves the far wheel hidden. This view shows that the displayed crate stays with the cart while it passes here.',
    'strap', at('replay.strap'), 'seen.strap'),
  {
    ...sign('original-wheel', [20, 18], 'the first peg’s preserved wheel sketch',
      'First sketch, taken before Edrin spoke. Tread beyond the chalk bar. Crate hidden by the rail. Edrin’s later note supplies the hand and the stop.',
      'note', all(working, at('first', 'wheel')), 'original'),
    artBy: { flag: 'memory-cart.working', keys: { over: 'memory-cart.covered', beside: 'memory-cart.open' } },
  },
  {
    ...sign('original-strap', [20, 18], 'the first peg’s preserved cord sketch',
      'First sketch, taken before Edrin spoke. Cord stayed tied through the crate and the peg at this opening. Far wheel hidden. Edrin’s later note supplies the hand and the stop.',
      'note', all(working, at('first', 'strap')), 'original'),
    artBy: { flag: 'memory-cart.working', keys: { over: 'memory-cart.covered', beside: 'memory-cart.open' } },
  },
  scene('publish', [20, 19], 'the south-rail desk for the checked handover', 'publish', 'open', all(afterSources, not(set('plan')))),
  sign('direct', [16, 20], 'the gate tray used by the next collector',
    'The collector found the crate with its loop still tied at the gate tray. She left the two checked positions on the public notice. The report of a hand at the south rail has its own clip for anyone who wants to check it later.',
    'direct', at('plan', 'direct'), 'receipt'),
  sign('escort', [25, 19], 'Nella’s escorted handover',
    'Nella walked the west and east viewpoints with one collector. The collector recognised the closed loop at the gate tray before it was lifted. The rack points to the checked route. Later visitors need to arrange their own walk if they want the same checks.',
    'escort', at('plan', 'escort'), 'receipt'),
];
