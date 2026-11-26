export const REFERENCE_PROOF = 'reference-proof';
export const PLATES = [
  { id: 'quay', name: 'Quay plate', offset: 15 },
  { id: 'ledge', name: 'Ledge plate', offset: 45 },
] as const;
export type PracticePlate = (typeof PLATES)[number]['id'];

export function relativeAngle(angle: number, plate: PracticePlate): number {
  const offset = PLATES.find((entry) => entry.id === plate)!.offset;
  return ((angle - offset) % 360 + 360) % 360;
}
