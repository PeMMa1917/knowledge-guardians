/**
 * The Assay Trial (chapter 6 signature game, C-004; a restartable trial, X-007).
 * Two samples, a seller's claim, and two tests: the streak a sample leaves on a white tile, and its
 * density (weight for its size, read with a margin). The player calls the pair the same or different.
 * A wrong call restarts the round. Values are standard mineral data. Pure rules, no DOM.
 */
import data from '../content/assay-trial.json';

export type Test = 'streak' | 'density';
export type Call = 'same' | 'different';
export interface Sample { name: string; look: string; streak: string; density: number }
export interface Round { a: string; b: string; speaker: string; claim: string; wrong: Partial<Record<Call, string>> }

export const MARGIN = data.margin;
export const SAMPLES = data.samples as Record<string, Sample>;
export const ROUNDS = data.rounds as Round[];
export const TRUST = data.trust as { id: string; text: string; reply: string }[];

/** What a test shows for one sample, as the panel prints it. */
export function reading(id: string, test: Test): string {
  const s = SAMPLES[id];
  return test === 'streak' ? s.streak : `${s.density.toFixed(1)} ± ${MARGIN} times the weight of water`;
}

/** Whether a test can tell two samples apart. Two densities inside each other's margin cannot. */
export function tellsApart(a: string, b: string, test: Test): boolean {
  const x = SAMPLES[a], y = SAMPLES[b];
  return test === 'streak' ? x.streak !== y.streak : Math.abs(x.density - y.density) > 2 * MARGIN;
}

/** The truth of a round: the same mineral or not. */
export const sameKind = (r: Round): boolean => SAMPLES[r.a].name === SAMPLES[r.b].name;

export function judge(r: Round, call: Call): { ok: true } | { ok: false; why: string } {
  if ((call === 'same') === sameKind(r)) return { ok: true };
  return { ok: false, why: r.wrong[call] ?? 'Corra shakes her head. Again.' };
}
