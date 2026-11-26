export const SHUTTER_SIZE = 5;
export const SHUTTER_LAMP = [0, 2] as const;
export const SHUTTER_MIRRORS = [[2, 2], [2, 1], [2, 3]] as const;
export const SHUTTER_STOPS = [[1, 1], [3, 3]] as const;
export const SHUTTER_OUTLETS = { quiet: [4, 1], low: [0, 3] } as const;
export type ShutterRoute = keyof typeof SHUTTER_OUTLETS;
export type Mirror = '/' | '\\';
export type MirrorSet = readonly [Mirror, Mirror, Mirror];
type Spot = readonly [number, number];

export const OLD_SHUTTERS: MirrorSet = ['/', '\\', '\\'];
export const sameShutterSpot = ([x, y]: Spot, [otherX, otherY]: Spot) => x === otherX && y === otherY;

export function turnShutterMirror(mirrors: MirrorSet, index: number): MirrorSet {
  if (index < 0 || index >= mirrors.length) return mirrors;
  const out: [Mirror, Mirror, Mirror] = [...mirrors];
  out[index] = mirrors[index] === '/' ? '\\' : '/';
  return out;
}

export type ShutterTrace = {
  tiles: Spot[];
  end: 'stop' | 'edge' | 'loop' | ShutterRoute;
};

/** Mirrors turn one ray at right angles. Baffles absorb it and outlets record a strike. */
export function traceShutters(mirrors: MirrorSet): ShutterTrace {
  let [x, y]: [number, number] = [...SHUTTER_LAMP];
  let [dx, dy] = [1, 0];
  const tiles: Spot[] = [SHUTTER_LAMP];
  const seen = new Set<string>();
  for (;;) {
    x += dx;
    y += dy;
    if (x < 0 || x >= SHUTTER_SIZE || y < 0 || y >= SHUTTER_SIZE) return { tiles, end: 'edge' };
    const cell = [x, y] as const;
    tiles.push(cell);
    if (sameShutterSpot(cell, SHUTTER_OUTLETS.quiet)) return { tiles, end: 'quiet' };
    if (sameShutterSpot(cell, SHUTTER_OUTLETS.low)) return { tiles, end: 'low' };
    if (SHUTTER_STOPS.some((stop) => sameShutterSpot(cell, stop))) return { tiles, end: 'stop' };

    const phase = `${x},${y},${dx},${dy}`;
    if (seen.has(phase)) return { tiles, end: 'loop' };
    seen.add(phase);
    const mirror = SHUTTER_MIRRORS.findIndex((position) => sameShutterSpot(cell, position));
    if (mirror < 0) continue;
    [dx, dy] = mirrors[mirror] === '/' ? [-dy, -dx] : [dy, dx];
  }
}

export function readShutterMirrors(value: unknown): MirrorSet {
  if (typeof value !== 'string' || value.length !== 3) return OLD_SHUTTERS;
  const [a, b, c] = value;
  const mirror = (letter: string): letter is Mirror => letter === '/' || letter === '\\';
  return mirror(a) && mirror(b) && mirror(c) ? [a, b, c] : OLD_SHUTTERS;
}
