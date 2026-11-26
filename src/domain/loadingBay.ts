import type { Effect, FlagValue } from './types';

export const LOAD_NOTCHES = [-1, 1] as const;
export type LoadNotch = (typeof LOAD_NOTCHES)[number];
export const LOAD_ROUTES = ['bench', 'call'] as const;
export type LoadRoute = (typeof LOAD_ROUTES)[number];
export const LOAD_FIXES = ['axle', 'tie'] as const;
export type LoadFix = (typeof LOAD_FIXES)[number];
export type LoadState = readonly [left: number, right: number, leftSlot: number, rightSlot: number];
export const loadKey = (slug: string) => `loading.${slug}`;

/** Signed moment of two fictional practice boxes around a movable axle. */
export function cartLean([left, right, leftSlot, rightSlot]: LoadState, notch: LoadNotch): number {
  return left * (leftSlot - notch) + right * (rightSlot - notch);
}

export function changeLoad(load: LoadState, right: number, rightSlot: number): LoadState {
  return [load[0], right, load[2], rightSlot];
}

export function fitLoad(load: LoadState, notch: LoadNotch, fix: LoadFix) {
  const [left, right, leftSlot, rightSlot] = load;
  const fitted: LoadState = fix === 'tie' ? [left, right, leftSlot, rightSlot - 1] : load;
  const axle: LoadNotch = fix === 'axle' ? (notch === -1 ? 1 : -1) : notch;
  return { load: fitted, axle, lean: cartLean(fitted, axle) };
}

export function readLoad(slug: string, flags: Record<string, FlagValue>) {
  const key = loadKey(slug);
  const at = flags[`${key}.axle`];
  const routed = flags[`${key}.route`];
  const fixed = flags[`${key}.fit`];
  const axle = LOAD_NOTCHES.find((notch) => notch === at);
  const route = LOAD_ROUTES.find((option) => option === routed);
  const fix = LOAD_FIXES.find((option) => option === fixed);
  return {
    axle, route, fix, received: !!route && flags[`${key}.received`] === route,
    baseReady: LOAD_NOTCHES.every((notch) => flags[`${key}.notch.${notch}`] === true),
    returned: flags[`${key}.repeat`] === true,
    fixReady: LOAD_FIXES.every((option) => flags[`${key}.test.${option}`] === true),
  };
}

export type LoadMove = { type: 'measure' | 'mark'; notch: LoadNotch }
  | { type: 'send' | 'receive'; route: LoadRoute }
  | { type: 'recheck' }
  | { type: 'test' | 'fit'; fix: LoadFix };

type FlagEffect = Extract<Effect, { setFlag: string }>;

export function loadMove(slug: string, flags: Record<string, FlagValue>, move: LoadMove): FlagEffect | undefined {
  const key = loadKey(slug);
  const { axle, route, fix, baseReady, received, returned, fixReady } = readLoad(slug, flags);
  switch (move.type) {
    case 'measure': return !route && LOAD_NOTCHES.includes(move.notch) ? { setFlag: `${key}.notch.${move.notch}`, value: true } : undefined;
    case 'mark': return baseReady && !route && LOAD_NOTCHES.includes(move.notch) ? { setFlag: `${key}.axle`, value: move.notch } : undefined;
    case 'send': return axle !== undefined && !route && LOAD_ROUTES.includes(move.route) ? { setFlag: `${key}.route`, value: move.route } : undefined;
    case 'receive': return route === move.route && !received ? { setFlag: `${key}.received`, value: route } : undefined;
    case 'recheck': return received && !fix ? { setFlag: `${key}.repeat`, value: true } : undefined;
    case 'test': return returned && !fix && LOAD_FIXES.includes(move.fix) ? { setFlag: `${key}.test.${move.fix}`, value: true } : undefined;
    case 'fit': return fixReady && !fix && LOAD_FIXES.includes(move.fix) ? { setFlag: `${key}.fit`, value: move.fix } : undefined;
  }
}
