/** One fixed inflow in an authored model of the Water Commons. */
export const WATER_SETTINGS = ['fields', 'split', 'channel'] as const;
export type WaterSetting = typeof WATER_SETTINGS[number];
export type WaterCondition = 'drought' | 'repaired';

const toFields = { fields: 7, split: 5, channel: 3 } as const;

export function waterTrial(condition: WaterCondition, setting: string) {
  if (setting !== 'fields' && setting !== 'split' && setting !== 'channel') {
    throw new Error('That setting does not belong to this gate.');
  }
  const incoming = 12;
  const leak = condition === 'drought' ? 2 : 0;
  const farm = toFields[setting];
  return { incoming, leak, farm, river: incoming - leak - farm };
}
