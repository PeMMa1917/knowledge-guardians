/**
 * Companion approval (Mika 2026-11-25). A companion who walks with the player notices good
 * questions: a dialogue option tagged as inquiry (ask for a source, ask for reasons, trace, listen
 * first, plan a fair test...) and a rumour traced to its sources. Approval never rises for agreeing,
 * and it never falls: a companion is not a judge of the player's views. Each option counts once.
 * Stored as the number flag `approval.<companion>`. TOK link: inquiry, open-mindedness. Pure rules.
 */
const INQUIRY = /^(Ask|Trace|Listen first|Plan a fair test|Name the difference|Calibrate|Record it carefully)/;

/** Is this dialogue tag a questioning move? ("Accept the expert view" is not.) */
export const isInquiry = (tag: string | undefined): boolean => !!tag && INQUIRY.test(tag);

export const APPROVAL_RANKS = [
  { from: 0, name: 'Getting to know you' },
  { from: 3, name: 'Likes how you ask' },
  { from: 6, name: 'Trusts your questions' },
] as const;

export const approvalOf = (flags: Record<string, unknown>, who: string): number => Number(flags[`approval.${who}`] ?? 0);
export const approvalRank = (n: number): string => [...APPROVAL_RANKS].reverse().find((r) => n >= r.from)!.name;
