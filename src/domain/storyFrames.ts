export const FRAME_POSITIONS = [0, 1] as const;
export type FramePosition = typeof FRAME_POSITIONS[number];

export const BOTH_FRAME_VIEWS = 3;

export function frameViews(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= BOTH_FRAME_VIEWS ? value : 0;
}

export function lookedAt(views: number, position: FramePosition): boolean {
  return (views & (1 << position)) !== 0;
}

export function openFrameView(views: number, position: FramePosition): number {
  return views | (1 << position);
}
