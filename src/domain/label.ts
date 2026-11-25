/**
 * Label builder and the Fray (spec 2.11, 29.1 item 2).
 *
 * The player builds a label from a subject, a criterion (what kind of
 * "first") and a limit. The label's force is what it claims. Its support is
 * the evidence the player holds for that exact subject and criterion.
 *
 *   gap = force - limit - support
 *
 * gap > 0: the label claims more than its support. The Fray stays and
 * visitors repeat a distorted version. gap <= 0: the label holds and the
 * gold glow fades. Many combinations hold, so there is no hidden correct
 * label (OPEN-001). The game never says "wrong"; visitors react (PLAY-001).
 */
import type { CampaignState, LabelKit } from './types';

export interface LabelChoice { subject: string; criterion: string; limit: string }

export interface LabelResult {
  text: string;
  force: number;
  lower: number;
  support: number;
  gap: number;
  holds: boolean;
  /** What visitors say after reading it (the world response). */
  heard: string;
  /** Cards that gave support, for the "why" line. */
  used: string[];
  signals: string[];
}

export function labelText(kit: LabelKit, c: LabelChoice): string {
  const subj = kit.subjects.find((x) => x.id === c.subject)?.text ?? '';
  const crit = kit.criteria.find((x) => x.id === c.criterion)?.text ?? '';
  const lim = kit.limits.find((x) => x.id === c.limit)?.text ?? '';
  return [crit && subj ? `${crit}: ${subj}.` : `${subj}.`, lim].filter(Boolean).join(' ');
}

export function evaluateLabel(kit: LabelKit, c: LabelChoice, s: CampaignState): LabelResult {
  const crit = kit.criteria.find((x) => x.id === c.criterion);
  const subj = kit.subjects.find((x) => x.id === c.subject);
  const lim = kit.limits.find((x) => x.id === c.limit);
  if (!crit || !subj || !lim) throw new Error('Choose a part for each line of the label');
  const sup = kit.supports.find((x) => x.subject === c.subject && x.criterion === c.criterion);
  const used = (sup?.cards ?? []).filter((x) => s.cards.includes(x.card));
  const support = used.reduce((a, x) => a + x.weight, 0);
  const force = crit.force;
  const lower = lim.lower;
  const gap = force - lower - support;
  const holds = gap <= 0;
  const signals = [crit.signal, sup?.signal].filter((x): x is string => !!x);
  let heard: string;
  if (holds && sup) heard = sup.heard;
  else if (sup?.weak) heard = sup.weak;
  else if (!sup || support === 0) heard = kit.weak.noSupport;
  else heard = kit.weak.tooStrong;
  return { text: labelText(kit, c), force, lower, support, gap, holds, heard, used: used.map((x) => x.card), signals };
}

/** Current Fray level of a kit's label, for the world view: 0 = calm. */
export function frayLevel(kitId: string, s: CampaignState): number {
  if (s.flags[`label.${kitId}.holds`] === true) return 0;
  const g = Number(s.flags[`label.${kitId}.gap`] ?? 3);
  return Math.max(1, Math.min(3, g));
}
