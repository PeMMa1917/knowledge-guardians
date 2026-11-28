import { MOON_INSTRUMENT } from '../domain/spareMoonMusic';
import { clapHas, clapIs, clapMissing } from '../content/firstClap';
import type { Interactable } from './types';
import type { Condition } from '../domain/types';

function scene(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  visibleIf?: Condition,
  sfx = 'sfx.open',
): Interactable {
  return {
    id: 'first-clap-' + id,
    kind: 'scene',
    node: 'first-clap.' + id,
    x,
    y,
    w: 1,
    h: 1,
    walkThrough: true,
    label,
    art,
    visibleIf,
    sfx,
  };
}
const undecided: Condition = { all: [clapHas('asked'), clapMissing('bow')] };
export const FIRST_CLAP_REHEARSAL: Interactable[] = [
  {
    id: 'first-clap-song',
    kind: 'fieldgame',
    game: MOON_INSTRUMENT,
    x: 6,
    y: 6,
    w: 1,
    h: 1,
    walkThrough: true,
    label: 'the footlight strings after the bow',
    art: 'moon.fiddle',
    visibleIf: clapHas('bow'),
  },
  scene('dress', 8, 6, 'Edda rehearsing a bow to an empty house', 'moon.seat-up', clapMissing('started')),
  scene('light', 9, 7, 'the lever for the house lights', 'moon.flood', undecided),
  scene('light-return', 9, 7, 'Hari’s small drawing at the half-light mark', 'moon.flood', clapIs('bow', 'light')),
];
export const FIRST_CLAP_GALLERY: Interactable[] = [
  scene('seat', 5, 6, 'the seat with a crescent nick', 'moon.seat-up', { not: clapIs('seat', 'down') }),
  scene('seated', 5, 6, 'the seat held down by your weight', 'moon.seat-down', clapIs('seat', 'down')),
  scene(
    'friend',
    8,
    7,
    'Hari’s folded programme in the back row',
    'nile.scroll',
    clapMissing('asked'),
    'sfx.page',
  ),
  scene('dark', 5, 9, 'the wooden wedge below the seat', 'moon.thimble', undecided),
  scene('dark-return', 5, 9, 'a loose ribbon on the smallest actor’s wedge', 'moon.sixth', clapIs('bow', 'dark')),
];
