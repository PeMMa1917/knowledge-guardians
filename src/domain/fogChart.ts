/**
 * The Fog Chart (chapter 8 signature game, C-004). A fogged 6x6 bay with four hidden features. Each
 * sounding costs a boat trip. A hit names the feature; sounding all of it shows the claim and what holds
 * it up: a measurement, long practice, one person's testimony, or old records that disagree. Three
 * sailors' reports come first, and one is wrong. The player then decides how to print what was not
 * sounded. No print choice is marked right (OPEN-001). Pure rules.
 */
import data from '../content/fog-chart.json';

export type Claim = { id: string; name: string; cells: number[][]; claim: string; kind: string; support: string };
export const SIZE: number = data.size;
export const SOUNDINGS: number = data.soundings;
export const CLAIMS: Claim[] = data.claims;
export const REPORTS = data.reports;
export const TEXT = data;
export const KINDS = data.kinds as Record<string, string>;
export const PRINTS = data.prints;

const key = (x: number, y: number): string => `${x},${y}`;

/** The feature under a square, or null for open water. */
export const claimAt = (x: number, y: number): Claim | null =>
  CLAIMS.find((c) => c.cells.some(([cx, cy]) => cx === x && cy === y)) ?? null;

/** True when every square of a feature has been sounded. */
export const found = (claim: Claim, sounded: Set<string>): boolean => claim.cells.every(([x, y]) => sounded.has(key(x, y)));

/** The report on a square, if a sailor gave one. */
export const reportAt = (x: number, y: number) => REPORTS.find((r) => r.x === x && r.y === y) ?? null;

/** True when a sailor's report on a square is borne out by what lies there. */
export const reportTrue = (x: number, y: number): boolean => claimAt(x, y) !== null;

/** All squares that hold a feature. */
export const featureSquares = (): number => CLAIMS.reduce((n, c) => n + c.cells.length, 0);

export { key as squareKey };
