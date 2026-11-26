/** Local proof press. The contact profiles are fictional, with the same strip and stop for both faces. */
export const BEATER_KEY = 'cma:1971.152';
export const BEATER_SOURCE = 'HIS-CMA-1971.152';
export const BEATER_PRESS_MAP = 'preserved.workroom';
export const BEATER_PRESS_PROP = 'beater-proof-press';
export const BEATER_GAME = 'beater-proof:';
export const BEATER_RECORD = 'beater.proof.record';
export const BEATER_CARRY = 'beater.proof.carry';
export const BEATER_PLACEMENT = 'beater.proof.placement';
export const BEATER_USED = 'beater.proof.used';

export const PROOF_FACES = ['wide', 'close'] as const;
export const PROOF_STOPS = ['light', 'firm'] as const;
export type ProofFace = typeof PROOF_FACES[number];
export type ProofStop = typeof PROOF_STOPS[number];

const contacts: Record<ProofFace, ReadonlyArray<readonly [position: number, minimumDepth: number]>> = {
  wide: [[2, 1], [6, 1]],
  close: [[3, 1], [4, 2], [5, 1]],
};
const depth: Record<ProofStop, number> = { light: 1, firm: 2 };
const bits: Record<ProofStop, Record<ProofFace, number>> = { light: { wide: 1, close: 2 }, firm: { wide: 4, close: 8 } };

export function pressTrace(face: ProofFace, stop: ProofStop): number[] {
  return contacts[face].filter(([, minimumDepth]) => minimumDepth <= depth[stop]).map(([position]) => position);
}

function recordedMask(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 15 ? value : 0;
}

export function recordPress(record: unknown, face: ProofFace, stop: ProofStop): number {
  return recordedMask(record) | bits[stop][face];
}

export function hasPress(record: unknown, face: ProofFace, stop: ProofStop): boolean {
  return (recordedMask(record) & bits[stop][face]) !== 0;
}

export function hasMatchedPair(record: unknown, stop: ProofStop): boolean {
  return PROOF_FACES.every((face) => hasPress(record, face, stop));
}

export function carriedProof(record: unknown, stop: unknown): ProofStop | undefined {
  return PROOF_STOPS.find((candidate) => candidate === stop && hasMatchedPair(record, candidate));
}
