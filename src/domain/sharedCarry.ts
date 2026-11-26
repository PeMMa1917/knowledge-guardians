/** A real in-world transfer between stands. Each move ends at a stable resting point. */
import type { CampaignState, Condition, Effect, PermanentRecord } from './types';

export const BRIDGE_PARTNER = 'award.bridge-partner';
export const CARRY_SITES = ['forest', 'copies'] as const;
export type CarrySite = typeof CARRY_SITES[number];
export type CarryStop = 'start' | 'turn' | 'shelf' | 'cart' | 'cart-turn' | 'lift' | 'low' | 'upper';

type CarryMove = {
  id: string;
  label: string;
  next: string;
  needs?: 'notebook' | 'partner';
};

type CarryPhase = {
  stop: CarryStop;
  text: string;
  art: string;
  moves?: CarryMove[];
};

interface CarrySiteDef {
  map: string;
  arrives: string;
  title: string;
  phases: Record<string, CarryPhase>;
}

const moves = {
  forestHand: { id: 'pass', label: 'Pass the lead handle to Ayla', next: 'shelf-pair' },
  forestRest: { id: 'rest', label: 'Set both ends on the trestles', next: 'shelf-rest' },
  cityPark: { id: 'park', label: 'Park the frame and free the lane', next: 'surveyed' },
} satisfies Record<string, CarryMove>;

export const CARRY: Record<CarrySite, CarrySiteDef> = {
  forest: {
    map: 'forest.community', arrives: 'forest.arrival', title: 'A Corner for Two',
    phases: {
      start: {
        stop: 'start', art: 'shared-carry.trestle',
        text: 'Ayla needs the rain-mark frame under the high shelf before her next walk. The last carrier watched the frame and missed the springy plank. Ayla taps both trestles. “I put two here. Take your pick of ends.”',
        moves: [
          { id: 'test-footing', label: 'Press the footing by each trestle', next: 'checked' },
          { id: 'read-footing', label: 'Open the notebook at the turn', next: 'checked-notebook', needs: 'notebook' },
        ],
      },
      checked: {
        stop: 'start', art: 'shared-carry.trestle',
        text: 'The plank moves under a heel. The stone beside it holds. Ayla can watch the plank while you keep the frame above the turn.',
        moves: [{ id: 'lift', label: 'Lift once Ayla calls ready', next: 'turn' }],
      },
      'checked-notebook': {
        stop: 'start', art: 'shared-carry.trestle',
        text: 'The notebook has separate places for the carrier’s position and the load. Ayla points to her loose-plank mark, then presses the plank. It moves; the stone beside it holds.',
        moves: [{ id: 'lift', label: 'Lift once Ayla calls ready', next: 'turn' }],
      },
      turn: {
        stop: 'turn', art: 'shared-carry.held',
        text: 'The frame waits in the waist-high hooks at the bend. Ayla can lead from the stone while you watch the long end. Setting the frame fully down gives you time to change both grips. The next cart would have to wait by these trestles.',
        moves: [moves.forestHand, moves.forestRest],
      },
      'shelf-pair': {
        stop: 'shelf', art: 'shared-carry.held',
        text: 'Ayla took the lead from the stone. She watched the plank and called each step. The cart passed straight through the bend. “Tell me when your corner clears.”',
        moves: [{ id: 'shelve', label: 'Call the clear corner and lower together', next: 'done-pair' }],
      },
      'shelf-rest': {
        stop: 'shelf', art: 'shared-carry.held',
        text: 'The cart waited for the full rest. On the trestles you both got a free hand to check the new grip. Ayla leads the frame up to the shelf.',
        moves: [{ id: 'shelve', label: 'Call the clear corner and lower together', next: 'done-rest' }],
      },
      'done-pair': {
        stop: 'shelf', art: 'shared-carry.upper',
        text: 'The rain-mark frame sits square under the covered shelf. Ayla will tell other keepers you can call a shared turn. “I can see my end and you can see yours. That’s a better pair of eyes than mine pretending.”',
      },
      'done-rest': {
        stop: 'shelf', art: 'shared-carry.upper',
        text: 'The rain-mark frame sits square under the covered shelf. Ayla will tell other keepers you know when to rest a load. “After the cart cleared we had two hands for each corner. Worth waiting for.”',
      },
    },
  },
  copies: {
    map: 'copies.landing', arrives: 'copies.arrival', title: 'A Lane for the Frame',
    phases: {
      start: {
        stop: 'start', art: 'shared-carry.trestle',
        text: 'Mina needs the wide-page frame off its delivery hooks. She can put it above the sheltered threshold or beside the low return counter. “First see what we can get around the turn here.”',
        moves: [{ id: 'survey', label: 'Swing the spare rod through the turn', next: 'surveyed' }],
      },
      surveyed: {
        stop: 'start', art: 'shared-carry.trestle',
        text: 'The rod clears with two people at the near rail. That move takes both keepers and closes the short lane until they seat the frame. The handcart avoids that lane, but it needs two rest stops. It ends at the low counter.',
        moves: [
          { id: 'cart', label: 'Take the handcart and keep the lane open', next: 'cart' },
          { id: 'signal', label: 'Show the Bridge Partner badge and signal a second keeper', next: 'lift', needs: 'partner' },
        ],
      },
      cart: {
        stop: 'cart', art: 'shared-carry.cart',
        text: 'At the first rest, the long end reaches past the cart rim. Mina holds the frame against the trestle while you bring the loose strap under its foot. People keep walking along the rail.',
        moves: [
          { id: 'strap', label: 'Thread the loose strap and roll to the far rest', next: 'cart-turn' },
          moves.cityPark,
        ],
      },
      'cart-turn': {
        stop: 'cart-turn', art: 'shared-carry.cart',
        text: 'The frame stayed level on the cart. At the far rest the new strap keeps it from sliding as Mina takes its far end.',
        moves: [{ id: 'transfer', label: 'Slide the frame to the low counter', next: 'low' }],
      },
      low: {
        stop: 'low', art: 'shared-carry.trestle',
        text: 'The public lane stayed open for both transfers. Someone at the return stool brings a book to try the wide-page frame. Mina holds one end while you seat its foot.',
        moves: [{ id: 'seat', label: 'Seat the frame at the low counter', next: 'done-low' }],
      },
      'done-low': {
        stop: 'low', art: 'shared-carry.low',
        text: 'The frame is low enough to use from the stool and the lane stayed open. The cart and its spare straps still take up the old overflow space. Mina keeps one spare return tray inside.',
        moves: [{ id: 'try-low', label: 'Slide the visitor’s book into the low frame', next: 'read-low' }],
      },
      'read-low': {
        stop: 'low', art: 'shared-carry.low',
        text: 'The visitor reaches the open spread from the stool and turns a page. Mina moves the inside tray closer to the door so she can hold it while someone reads.',
      },
      lift: {
        stop: 'lift', art: 'shared-carry.held',
        text: 'Mina’s second keeper has taken one handle. The short lane is reserved while you line up the far corner; callers can go around by the ordinary path.',
        moves: [
          { id: 'pair', label: 'Call the clear corner and take the short lift', next: 'upper' },
          moves.cityPark,
        ],
      },
      upper: {
        stop: 'upper', art: 'shared-carry.held',
        text: 'The two keepers reached the sheltered cradle in one move. The barrier is still across the short lane while one of them holds the frame’s weight.',
        moves: [{ id: 'seat', label: 'Seat the frame and wave the lane open', next: 'done-upper' }],
      },
      'done-upper': {
        stop: 'upper', art: 'shared-carry.upper',
        text: 'The frame sits dry at the upper cradle. The short lane is open again and the cart is free. Mina takes a loose page to a reader below the high cradle.',
        moves: [{ id: 'try-upper', label: 'Bring a loose page to the reader below', next: 'read-upper' }],
      },
      'read-upper': {
        stop: 'upper', art: 'shared-carry.upper',
        text: 'The reader can turn the loose page on the lower bench. Mina sets aside a dry page pocket next to the cradle for the next person who asks.',
      },
    },
  },
};

export const CARRY_STOPS = [
  ['forest', 'start'], ['forest', 'turn'], ['forest', 'shelf'],
  ['copies', 'start'], ['copies', 'cart'], ['copies', 'cart-turn'], ['copies', 'lift'], ['copies', 'low'], ['copies', 'upper'],
] as const satisfies ReadonlyArray<readonly [CarrySite, CarryStop]>;

export function carryGame(site: CarrySite, stop: CarryStop): string {
  return `shared-carry.${site}.${stop}`;
}

export function carryLocation(game: string): readonly [CarrySite, CarryStop] | undefined {
  return CARRY_STOPS.find(([site, stop]) => game === carryGame(site, stop));
}

function carryFlag(site: CarrySite): string {
  return `${site}.carry.phase`;
}

export function currentCarryPhase(site: CarrySite, state: CampaignState): CarryPhase {
  const phase = state.flags[carryFlag(site)];
  const phases = CARRY[site].phases;
  return typeof phase === 'string' && Object.hasOwn(phases, phase) ? phases[phase] : phases.start;
}

export function carryMoves(site: CarrySite, state: CampaignState, permanent: PermanentRecord): CarryMove[] {
  return (currentCarryPhase(site, state).moves ?? []).filter(({ needs }) => {
    if (needs === 'notebook') return state.flags['perspective.active'] === 'observer-notebook'
      && state.flags['keepsake.observer-notebook'] === true;
    if (needs === 'partner') return !!permanent.awards[BRIDGE_PARTNER];
    return true;
  });
}

export function moveSharedCarry(site: CarrySite, stop: CarryStop, action: string, state: CampaignState, permanent: PermanentRecord): Effect[] {
  const scene = CARRY[site];
  if (!scene || state.mapId !== scene.map || !state.objectivesDone.includes(scene.arrives)) {
    throw new Error('The frame work is at the local landing.');
  }
  if (currentCarryPhase(site, state).stop !== stop) throw new Error('The frame is resting at a different stop.');
  const move = carryMoves(site, state, permanent).find((option) => option.id === action);
  if (!move) throw new Error('This way of moving the frame is unavailable now.');
  return [{ setFlag: carryFlag(site), value: move.next }];
}

export function carryStopCondition(site: CarrySite, stop: CarryStop): Condition {
  const scene = CARRY[site];
  const phases = Object.entries(scene.phases).filter(([, phase]) => phase.stop === stop).map(([id]) => id);
  const here: Condition = { flag: carryFlag(site), in: phases };
  const known: Condition = { flag: carryFlag(site), in: Object.keys(scene.phases) };
  return { all: [{ objective: scene.arrives }, stop === 'start' ? { any: [here, { not: known }] } : here] };
}

export function carryArtBy(site: CarrySite, stop: CarryStop): { flag: string; keys: Record<string, string> } {
  return {
    flag: carryFlag(site),
    keys: Object.fromEntries(Object.entries(CARRY[site].phases).filter(([, phase]) => phase.stop === stop).map(([id, phase]) => [id, phase.art])),
  };
}
