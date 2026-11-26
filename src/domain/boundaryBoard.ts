import type { CampaignState, Effect } from './types';

export const SERVICE_BOUNDARIES = ['ditch', 'bridge'] as const;
export type ServiceBoundary = typeof SERVICE_BOUNDARIES[number];
export type BoundaryAction = { type: 'SetServiceBoundary'; seam: ServiceBoundary };

export const WATER_REQUESTS = [
  { label: 'Tanners’ rail', x: 2, y: 1, wait: 3 },
  { label: 'Pail rack', x: 2, y: 3, wait: 4 },
  { label: 'Upper stair', x: 3, y: 5, wait: 5 },
  { label: 'Willow bar', x: 5, y: 2, wait: 9 },
  { label: 'Rush basket', x: 5, y: 5, wait: 10 },
  { label: 'Middle shed', x: 6, y: 3, wait: 11 },
  { label: 'Silt bench', x: 8, y: 1, wait: 4 },
  { label: 'Lower pump', x: 8, y: 4, wait: 5 },
  { label: 'Mooring rail', x: 9, y: 5, wait: 6 },
] as const;

export const SERVICE_CUTS: Record<ServiceBoundary, { line: number; name: string }> = {
  ditch: { line: 4, name: 'Old ditch' },
  bridge: { line: 7, name: 'Footbridge' },
};

export const CART_CAPACITY = 4;

type WaterRequest = typeof WATER_REQUESTS[number];

function summary(requests: WaterRequest[]) {
  const average = requests.reduce((minutes, request) => minutes + request.wait, 0) / requests.length;
  return { requests, average };
}

export function servicePlan(seam: ServiceBoundary) {
  if (!SERVICE_BOUNDARIES.includes(seam)) throw new Error('That line is not on the night map.');
  const boundary = SERVICE_CUTS[seam];
  const upper = summary(WATER_REQUESTS.filter(({ x }) => x < boundary.line));
  const lower = summary(WATER_REQUESTS.filter(({ x }) => x >= boundary.line));
  const first = upper.average > lower.average ? 'upper' : 'lower';
  const delivered = [...(first === 'upper' ? upper : lower).requests].sort((a, b) => b.wait - a.wait).slice(0, CART_CAPACITY);
  const remaining = WATER_REQUESTS.filter((request) => !delivered.includes(request));
  return { upper, lower, first, delivered, remaining };
}

export function boundaryEffects(action: BoundaryAction, state: CampaignState): Effect[] {
  if (state.mapId !== 'civic.steps' || state.flags['boundary.civic.started'] !== true) {
    throw new Error('Use the night map at North Steps first.');
  }
  servicePlan(action.seam);
  return [
    { setFlag: 'boundary.civic.seen.' + action.seam, value: true },
    { setFlag: 'boundary.civic.last', value: action.seam },
  ];
}
