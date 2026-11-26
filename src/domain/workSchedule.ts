export const SCHEDULE_TILES = ['source', 'practice', 'public'] as const;
export type ScheduleTile = typeof SCHEDULE_TILES[number];
export type SchedulePriority = 'source' | 'practice';

export interface ScheduleFixture {
  ticks: Record<ScheduleTile, number>;
  bell: number;
}

export function modelSchedule(fixture: ScheduleFixture, order: readonly ScheduleTile[]) {
  let elapsed = 0;
  const phases = order.map((tile) => {
    const start = elapsed;
    elapsed += fixture.ticks[tile];
    return { tile, start, end: elapsed };
  });
  const opening = phases.find(({ tile }) => tile === 'public')!;
  const proof = phases.filter(({ tile, end }) => tile !== 'public' && end <= opening.start);
  const visible = opening.end <= fixture.bell;
  const priority = visible && proof.length === 1 ? proof[0].tile as SchedulePriority : undefined;
  return { phases, visible, priority, elapsed };
}

export function moveScheduleTile(order: readonly ScheduleTile[], index: number, direction: -1 | 1): ScheduleTile[] {
  const swapped = [...order];
  const next = index + direction;
  if (index < 0 || index >= order.length || next < 0 || next >= order.length) return swapped;
  [swapped[next], swapped[index]] = [swapped[index], swapped[next]];
  return swapped;
}
