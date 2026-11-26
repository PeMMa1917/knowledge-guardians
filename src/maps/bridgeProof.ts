import { BRIDGE_PROOF_POSTED, BRIDGE_PROOF_RECEIPT, BRIDGE_PROOF_TOOL, BRIDGE_PROOF_WAYPOINT } from '../domain/bridgeProof';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const one = (eq: 'bank-route' | 'light-plank'): Condition => ({ flag: BRIDGE_PROOF_POSTED, eq });
const travelled: Condition = { flag: BRIDGE_PROOF_WAYPOINT, eq: true };
const received = (route: 'bank-route' | 'light-plank'): Condition => ({ all: [one(route), travelled] });

export const EMBERFORD_BRIDGE_PROOF: Interactable[] = [
  {
    id: 'bridge-proof-rail', kind: 'fieldgame', game: BRIDGE_PROOF_TOOL,
    x: 31, y: 10, w: 1, h: 1, walkThrough: true, art: 'clerk-map', label: 'Idris’s practice bridge rail',
    visibleIf: { flag: 'reached.emberford', eq: true },
    artBy: { flag: BRIDGE_PROOF_POSTED, keys: { 'bank-route': 'fold.strip', 'light-plank': 'fold.paired' } },
  },
  {
    id: 'bridge-proof-passage', kind: 'door', x: 31, y: 13, w: 1, h: 1, walkThrough: true,
    art: 'bridge-post', label: 'the marked passage for light packets', visibleIf: one('light-plank'),
    flag: BRIDGE_PROOF_WAYPOINT, to: { map: 'aethelgard.emberford', x: 37, y: 20 },
  },
  {
    id: 'bridge-proof-turn', kind: 'sign', x: 34, y: 13, w: 1, h: 1, walkThrough: true,
    art: 'bridge-post', label: 'the regular route’s turn post', visibleIf: one('bank-route'), flag: BRIDGE_PROOF_WAYPOINT,
    text: 'The receiving rack stays on Oak bank in the practice plan. The regular trail takes four crossings. Idris clips the packet at the turn, where the crate walkers can also sign.',
  },
  {
    id: 'bridge-proof-rack-regular', kind: 'sign', x: 38, y: 20, w: 1, h: 1, walkThrough: true,
    art: 'fold.strip', label: 'the east rack’s regular-route receipt', visibleIf: received('bank-route'), flag: BRIDGE_PROOF_RECEIPT,
    text: 'The four-link route carried the packet and left the turn available to the crate walkers. Sefa kept the three-move bank strip next to the four-move route so the next keeper can see which claim each supports.',
  },
  {
    id: 'bridge-proof-rack-plank', kind: 'sign', x: 38, y: 20, w: 1, h: 1, walkThrough: true,
    art: 'fold.paired', label: 'the east rack’s light-packet receipt', visibleIf: received('light-plank'), flag: BRIDGE_PROOF_RECEIPT,
    text: 'Idris passed the packet to the receiving rack in three marked links. Sefa points to the same-bank link on the attached trial. Crate walkers still use the regular route. Hesper’s thin practice plank carries light packets alone.',
  },
];
