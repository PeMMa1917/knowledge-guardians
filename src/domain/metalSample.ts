/** Readings from two fictional display coupons cut to the same dimensions. */
export const METAL_SAMPLES = {
  'panel-a': { name: 'Panel A', mass: 2 },
  'panel-b': { name: 'Panel B', mass: 4 },
} as const;

export function readMetalSample(id: string) {
  if (!Object.hasOwn(METAL_SAMPLES, id)) throw new Error('This coupon does not belong to the comparison.');
  return METAL_SAMPLES[id as keyof typeof METAL_SAMPLES];
}
