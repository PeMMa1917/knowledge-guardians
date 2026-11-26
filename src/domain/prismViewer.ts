import type { Effect, FlagValue } from './types';

export const PRISM_LENSES = ['seam', 'dots'] as const;
export type PrismLens = (typeof PRISM_LENSES)[number];
export const PRISM_ACCESS = ['key', 'grey'] as const;
export type PrismAccess = (typeof PRISM_ACCESS)[number];
export type PrismPixel = readonly [short: number, middle: number, long: number];
type Hue = readonly [red: number, green: number, blue: number];
export const PRISM_SIZE = 6;
const SHORT = ['010000', '010000', '010040', '000000', '030000', '000004'];
const MIDDLE = ['111111', '122211', '122221', '123321', '112221', '111111'];
const LONG = ['130000', '044100', '004300', '004410', '000431', '000240'];

export const PRISM_PIXELS: readonly PrismPixel[] = Object.freeze(SHORT.flatMap((row, y) => [...row].map((value, x): PrismPixel =>
  Object.freeze([Number(value), Number(MIDDLE[y][x]), Number(LONG[y][x])]))));

export const PRISM_RENDERINGS: Record<PrismLens, { name: string; labels: readonly [string, string, string]; hues: readonly [Hue, Hue, Hue] }> = {
  seam: { name: 'Seam rendering', labels: ['Muted rust', 'Dim plum', 'Bright cyan'], hues: [[81, 36, 28], [66, 38, 77], [25, 221, 235]] },
  dots: { name: 'Pinholes rendering', labels: ['Bright amber', 'Dim plum', 'Muted blue'], hues: [[246, 183, 29], [66, 38, 77], [22, 51, 92]] },
};

export function prismColour([short, middle, long]: PrismPixel, lens: PrismLens): Hue {
  const [a, b, c] = PRISM_RENDERINGS[lens].hues;
  const mix = (channel: 0 | 1 | 2) => Math.min(255, 12 + Math.round((a[channel] * short + b[channel] * middle + c[channel] * long) / 5));
  return [mix(0), mix(1), mix(2)];
}

export function prismTone([short, middle, long]: PrismPixel): number {
  return 12 + 23 * Math.max(short, middle, long);
}

export function prismProgress(flags: Record<string, FlagValue>) {
  const first = PRISM_LENSES.find((lens) => flags['prism.first'] === lens);
  return { first, viewed: PRISM_LENSES.filter((lens) => flags[`prism.viewed.${lens}`] === true),
    fitted: PRISM_LENSES.filter((lens) => flags[`prism.fitted.${lens}`] === true),
    consulted: PRISM_ACCESS.filter((method) => flags[`prism.consulted.${method}`] === true),
    access: PRISM_ACCESS.find((method) => flags['prism.access'] === method) };
}

export type PrismMove = { kind: 'view' | 'send' | 'fit'; lens: PrismLens } | { kind: 'preview' | 'install'; method: PrismAccess };
type FlagEffect = Extract<Effect, { setFlag: string }>;

export function prismMove(flags: Record<string, FlagValue>, move: PrismMove): FlagEffect | undefined {
  const { first, viewed, fitted, consulted, access } = prismProgress(flags);
  switch (move.kind) {
    case 'view': return PRISM_LENSES.includes(move.lens) ? { setFlag: `prism.viewed.${move.lens}`, value: true } : undefined;
    case 'send': return !first && viewed.length === 2 && PRISM_LENSES.includes(move.lens) ? { setFlag: 'prism.first', value: move.lens } : undefined;
    case 'fit': return first && PRISM_LENSES.includes(move.lens) && !fitted.includes(move.lens) && (first === move.lens || fitted.includes(first))
      ? { setFlag: `prism.fitted.${move.lens}`, value: true } : undefined;
    case 'preview': return fitted.length === 2 && !access && PRISM_ACCESS.includes(move.method) ? { setFlag: `prism.consulted.${move.method}`, value: true } : undefined;
    case 'install': return consulted.length === 2 && !access && PRISM_ACCESS.includes(move.method) ? { setFlag: 'prism.access', value: move.method } : undefined;
  }
}
