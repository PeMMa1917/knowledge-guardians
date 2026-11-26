export interface ModelPosition { x: number; y: number }

/** Each move consumes one segment of the same practice thread. */
export function layThread(curved: boolean): ModelPosition[] {
  const changes = curved
    ? [[1,0],[1,0],[0,1],[1,0],[0,1],[1,0],[1,0],[0,-1],[1,0],[0,-1],[1,0],[1,0]]
    : Array.from({ length: 12 }, () => [1, 0]);
  const path = [{ x: 0, y: 0 }];
  for (const [dx, dy] of changes) {
    const point = path[path.length - 1];
    path.push({ x: point.x + dx, y: point.y + dy });
  }
  return path;
}

/** A steady split leaves one of every three incoming units in reserve. */
export function flowModel(pulses: number, order: number) {
  const moved = Math.min(12, pulses * order);
  const reserve = moved / 3;
  return { intake: 12 - moved, exchange: moved - reserve, reserve };
}
