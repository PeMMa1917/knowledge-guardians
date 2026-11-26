export const DETECTOR_GAME = 'coast-detector';
export const DETECTOR_OBSERVED = 'coast.detector.compared';
export const DETECTOR_HANDOFF = 'coast.detector.handoff';

export const DETECTOR_RANGES = {
  wide: { label: 'Wide range', floor: 4, ceiling: 14 },
  amplified: { label: 'Amplified range', floor: 0, ceiling: 6 },
} as const;
export type DetectorRange = keyof typeof DETECTOR_RANGES;

const lights = [
  { name: 'Rim cord', intensity: 1 },
  { name: 'Lower step', intensity: 3 },
  { name: 'Landing lamp', intensity: 9 },
  { name: 'Outer lamp', intensity: 12 },
] as const;

export function detectorReading(range: DetectorRange) {
  const { floor, ceiling } = DETECTOR_RANGES[range];
  return lights.map(({ name, intensity }) => {
    const reading = Math.min(ceiling, Math.max(floor, intensity));
    const stop = reading === floor ? 'floor' : reading === ceiling ? 'ceiling' : null;
    return { name, reading, stop };
  });
}

export const detectorTrace = (range: DetectorRange) => `coast.detector.checked.${range}`;
