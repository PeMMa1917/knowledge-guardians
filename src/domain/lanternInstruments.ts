import instruments from '../content/lamplight-instruments.json';

export type Piece = 0 | 1 | 2;
export type InstrumentKind = 'bench' | 'layers' | 'scale' | 'chain' | 'frame' | 'route' | 'supply' | 'score';
export interface GuestInstrument { practice: number; home: string; questionRoute: number; kind: InstrumentKind; pieces: { label: string; reading: string }[] }
const kits = new Map(Object.entries(instruments) as [string, GuestInstrument][]);
export const guestInstrument = (id: string) => kits.get(id);
export function isPiece(n: unknown): n is Piece { return n === 0 || n === 1 || n === 2; }
export function readPieces(value: unknown): Piece[] {
  if (typeof value !== 'string' || !/^[012]{1,2}$/.test(value)) return [];
  const pieces = [...value].map(Number).filter(isPiece);
  return new Set(pieces).size === pieces.length ? pieces : [];
}
export function pinPiece(order: Piece[], next: Piece): string {
  return [...order.filter((piece) => piece !== next), next].slice(-2).join('');
}
export function materialLine(id: string, pieces: Piece[]) {
  const kit = guestInstrument(id);
  return kit ? pieces.map((p) => kit.pieces[p].label + ' — ' + kit.pieces[p].reading).join(' ') : '';
}

export const instrumentsByKind = {
  bench: { title: 'Test stand', task: 'Set a reference, then change one part of the model. Compare what the two positions let you see.', verb: 'Set the model to', slots: ['Reference', 'Trial'] },
  layers: { title: 'Tracing glass', task: 'Lay a record under the glass, then lower a second over it. You can reverse which record the viewer meets first.', verb: 'Lay on the glass', slots: ['Under the glass', 'Upper sheet'] },
  scale: { title: 'Measuring lens', task: 'Wind the lens to two scales. Keep the marks that shift when the scale changes.', verb: 'Focus on', slots: ['First scale', 'Second scale'] },
  chain: { title: 'Chain of evidence', task: 'Fasten two links in the order a visitor should follow. A third displaces the oldest link.', verb: 'Fasten', slots: ['Start of chain', 'Next link'] },
  frame: { title: 'Moving viewfinder', task: 'Frame a first view, then swing the shutter to a second. Someone standing behind you will see your two frames in that order.', verb: 'Frame', slots: ['First frame', 'Cut to'] },
  route: { title: 'Route board', task: 'Lay a route between two stops. Reverse the journey or chart another route to hear what a different traveller encounters.', verb: 'Walk to', slots: ['Start', 'Destination'] },
  supply: { title: 'Two-place carrier', task: 'There are two places in the carrier. Make room for what someone needs. Adding a third piece sends the oldest back to its owner.', verb: 'Load', slots: ['Packed first', 'At hand'] },
  score: { title: 'Cue rack', task: 'Cue two moments in order. Play the cue tones or follow the printed score. Try changing which one lands last.', verb: 'Cue', slots: ['Opening beat', 'Answering beat'] },
} satisfies Record<InstrumentKind, { title: string; task: string; verb: string; slots: string[] }>;
