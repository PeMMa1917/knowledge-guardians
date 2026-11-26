import type { CampaignState } from './types';

export const MAKER_TOOL = 'maker-bench';
export const MAKER_EXACT = 'maker-exact';
export const WORKBENCH_BANDS = [0, 1, 2, 3, 4, 5, 6] as const;
export const CONSTRUCTIONS = ['first', 'second'] as const;
export type Build = (typeof CONSTRUCTIONS)[number];
export type MakerKind = 'layer' | 'recess' | 'weave' | 'join';
export type MakerRoute = 'quay' | 'walk';

type Sample = { kind: MakerKind; band: number };
type Cell = 'stock' | 'mark' | 'tie' | 'void';

export const BUILD_SETTINGS: Record<MakerKind, { first: string; second: string; detail: string }> = {
  layer: {
    first: 'Place the mark beneath a clear strip',
    second: 'Place the mark on top of the clear strip',
    detail: 'A top view carries the line in either setting. Look through the cut to find which side of the clear strip carries the mark.',
  },
  recess: {
    first: 'Set a coloured piece in the recess',
    second: 'Lay the same colour across the surface',
    detail: 'The line looks the same from above. The cut shows whether the coloured piece fills the body or lies against its face.',
  },
  weave: {
    first: 'Run the accent between the supporting rows',
    second: 'Set the accent over the supporting rows',
    detail: 'The same design can run through a support or sit across it. The cut exposes the path of a single accent.',
  },
  join: {
    first: 'Hook separate pieces to a backing',
    second: 'Cut the visible pattern from a solid strip',
    detail: 'Both methods leave the same mark. Look below it for a backing and join.',
  },
};

const profiles: Record<MakerKind, Record<Build, readonly Cell[]>> = {
  layer: { first: ['void', 'tie', 'mark', 'stock'], second: ['void', 'mark', 'tie', 'stock'] },
  recess: { first: ['void', 'void', 'mark', 'stock'], second: ['void', 'mark', 'stock', 'stock'] },
  weave: { first: ['void', 'stock', 'mark', 'tie'], second: ['void', 'mark', 'stock', 'tie'] },
  join: { first: ['void', 'mark', 'tie', 'stock'], second: ['void', 'mark', 'stock', 'stock'] },
};

export function benchFace(sample: Sample): Cell[] {
  return WORKBENCH_BANDS.map((i) => i === sample.band ? 'mark' : 'stock');
}

export function crossSection(sample: Sample, build: Build, cut: number): readonly Cell[] {
  return cut === sample.band ? profiles[sample.kind][build] : ['void', 'void', 'stock', 'stock'];
}

export const readFlag = (stem: string, build: Build, cut: number) => `${stem}.read.${build}.${cut}`;
export const routeFlag = (stem: string) => `${stem}.delivery`;
export const receivedFlag = (stem: string) => `${stem}.received`;

export function comparedAt(state: Pick<CampaignState, 'flags'>, stem: string, cut: number): boolean {
  return CONSTRUCTIONS.every((build) => state.flags[readFlag(stem, build, cut)] === true);
}

export const benchPacket = (route: MakerRoute, cut: number) => `${route}.${cut}`;
export function parseBenchPacket(value: unknown): { route: MakerRoute; cut: number } | null {
  if (typeof value !== 'string') return null;
  const [route, cut, extra] = value.split('.');
  if (extra !== undefined || (route !== 'quay' && route !== 'walk') || !/^[0-6]$/.test(cut ?? '')) return null;
  return { route, cut: Number(cut) };
}

export function practiceFrequency(stop: number): number {
  const length = [32, 29, 27, 24, 21, 19, 17, 14][stop];
  return Math.round(5300 / length);
}
