export type CallStation = 'open' | 'curtain' | 'marks' | 'felt';

type Beat = { knocked: boolean; heard: boolean; marker: boolean };
const sequence: Record<CallStation, readonly Beat[]> = {
  open: [
    { knocked: true, heard: true, marker: false },
    { knocked: true, heard: true, marker: false },
    { knocked: true, heard: true, marker: false },
  ],
  curtain: [
    { knocked: true, heard: true, marker: false },
    { knocked: true, heard: false, marker: false },
    { knocked: true, heard: true, marker: false },
  ],
  marks: [
    { knocked: true, heard: true, marker: true },
    { knocked: true, heard: false, marker: true },
    { knocked: true, heard: true, marker: true },
  ],
  felt: [
    { knocked: true, heard: true, marker: false },
    { knocked: true, heard: true, marker: false },
    { knocked: true, heard: true, marker: false },
  ],
};

export function curtainCall(station: CallStation, pulses: number): readonly Beat[] {
  return sequence[station].slice(0, Math.min(3, Math.max(0, pulses)));
}
