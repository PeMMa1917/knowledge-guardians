import type { Effect, FlagValue } from './types';

export type Point = readonly [east: number, north: number];
export type SightLine = readonly [observer: Point, direction: Point];
export type BearingChange = 'fog' | 'late' | 'post';
export const BEARING_POSTS = ['west', 'east'] as const;
export type BearingPost = (typeof BEARING_POSTS)[number];
export const BEARING_ROUTES = ['fold', 'quay'] as const;
export type BearingRoute = (typeof BEARING_ROUTES)[number];
export const BEARING_FIXES = ['wait', 'side'] as const;
export type BearingFix = (typeof BEARING_FIXES)[number];
export const bearingKey = (slug: string) => `bearing.${slug}`;
const west: Point = [0, 0];
const east: Point = [8, 0];
const shiftedEast: Point = [8, 1];
const side: Point = [0, 8];
const field = Array.from({ length: 49 }, (_, index): Point => [1 + index % 7, 1 + Math.floor(index / 7)]);

export function sightFrom(origin: Point, target: Point): SightLine {
  return [origin, [target[0] - origin[0], target[1] - origin[1]]];
}

export function lineContains([origin, direction]: SightLine, point: Point): boolean {
  const dx = point[0] - origin[0];
  const dy = point[1] - origin[1];
  return dx * direction[1] === dy * direction[0] && dx * direction[0] + dy * direction[1] > 0;
}

export function matchingCells(lines: readonly SightLine[]): Point[] {
  return field.filter((point) => lines.every((line) => lineContains(line, point)));
}

export function firstSight(post: BearingPost, target: Point): SightLine {
  return sightFrom(post === 'west' ? west : east, target);
}

export function repeatSights(target: Point, change: BearingChange, repair?: BearingFix): readonly SightLine[] {
  const first = sightFrom(west, target);
  if (repair === 'wait') return [first, sightFrom(change === 'post' ? shiftedEast : east, target)];
  if (repair === 'side') return [first, sightFrom(side, target)];
  return [first];
}

export function readBearing(slug: string, flags: Record<string, FlagValue>) {
  const key = bearingKey(slug);
  const route = BEARING_ROUTES.find((choice) => flags[`${key}.route`] === choice);
  return {
    route, received: !!route && flags[`${key}.received`] === route,
    sighted: BEARING_POSTS.filter((post) => flags[`${key}.${post}`] === true),
    old: flags[`${key}.old`] === true, repeated: BEARING_FIXES.filter((fix) => flags[`${key}.${fix}`] === true),
    fitted: BEARING_FIXES.find((fix) => flags[`${key}.fitted`] === fix),
  };
}

export type BearingMove = { kind: 'read'; post: BearingPost } | { kind: 'send' | 'receive'; route: BearingRoute }
  | { kind: 'old' } | { kind: 'repeat' | 'fit'; fix: BearingFix };
type FlagEffect = Extract<Effect, {setFlag: string}>;

export function bearingMove(slug: string, flags: Record<string, FlagValue>, move: BearingMove): FlagEffect | undefined {
  const key = bearingKey(slug);
  const state = readBearing(slug, flags);
  switch (move.kind) {
    case 'read': return !state.route && BEARING_POSTS.includes(move.post) ? { setFlag: `${key}.${move.post}`, value: true } : undefined;
    case 'send': return !state.route && state.sighted.length === BEARING_POSTS.length && BEARING_ROUTES.includes(move.route) ? { setFlag: `${key}.route`, value: move.route } : undefined;
    case 'receive': return state.route === move.route && !state.received ? { setFlag: `${key}.received`, value: move.route } : undefined;
    case 'old': return state.received && !state.fitted ? { setFlag: `${key}.old`, value: true } : undefined;
    case 'repeat': return state.old && !state.fitted && BEARING_FIXES.includes(move.fix) ? { setFlag: `${key}.${move.fix}`, value: true } : undefined;
    case 'fit': return state.repeated.length === BEARING_FIXES.length && !state.fitted && BEARING_FIXES.includes(move.fix) ? { setFlag: `${key}.fitted`, value: move.fix } : undefined;
  }
}
