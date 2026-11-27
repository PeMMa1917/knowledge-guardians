/**
 * The Survey Bell (chapter 12 signature game, C-004 with X-005). The Civic council wants to study how
 * people use the lanes. The player sets how people join, what is kept, and who sees the results first.
 * Each choice has a cost and a benefit; some pairs raise a warning. The choices are kept as flags, so a
 * later chapter (Vesper's Seal, chapter 14) can use the same data. Pure rules.
 */
import data from '../content/survey-bell.json';

export interface Option { id: string; text: string; note: string; coverage?: number; power?: number }
export interface Step { id: string; ask: string; options: Option[] }
export const STEPS = data.steps as Step[];
const WARNINGS = data.warnings;

export const flagFor = (step: string): string => `civic.survey.${step}`;
export const option = (step: string, id: string): Option => STEPS.find((s) => s.id === step)!.options.find((o) => o.id === id)!;

/** Warnings raised by the chosen design. */
export function warnings(chosen: Record<string, string>): string[] {
  const picked = new Set(Object.values(chosen));
  return WARNINGS.filter((w) => w.if.every((x) => picked.has(x))).map((w) => w.line);
}
