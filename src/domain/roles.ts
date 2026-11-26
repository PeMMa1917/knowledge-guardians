/**
 * Knower roles (Mika 2026-11-25: classes). The player can take one role: Questioner, Maker,
 * Storyteller or Recorder. A role is a way of knowing, with a strength and a blind spot. It marks the
 * dialogue options that fit it, and Lumen's hints add the role's question and its blind spot. A role
 * never gives XP, never hides an option, and can be changed at any Waystone. TOK link: perspectives,
 * the knower, every way of knowing has strengths and limits. Pure rules, no DOM.
 */
export interface Role { id: string; name: string; like: string; strength: string; blind: string; ask: string; tags: RegExp }

export const ROLES: Role[] = [
  { id: 'questioner', name: 'Questioner', like: 'Kip the mapmaker', strength: 'You ask the second question: who says so, and how could they know?', blind: 'You can keep asking and forget to act on the answer.', ask: 'Who made this claim, and how could they know?', tags: /^(Ask|Trace)/ },
  { id: 'maker', name: 'Maker', like: 'Hesper the smith', strength: 'You test with your hands and your tools, one change at a time.', blind: 'You can trust a test more than the people who live with the result.', ask: 'What could I test, and what one thing would I change?', tags: /^(Plan a fair test|Calibrate|Let the numbers speak)/ },
  { id: 'storyteller', name: 'Storyteller', like: 'Sefa the scholar', strength: 'You listen for what a story means to the people who tell it.', blind: 'A good story can stand in for evidence, if you let it.', ask: 'Whose story is this, and what does it mean to them?', tags: /^(Listen first|Acknowledge a concern|Your background)/ },
  { id: 'recorder', name: 'Recorder', like: 'Keeper Oduya', strength: 'You keep careful records that other people can check.', blind: 'You can trust what is written more than what is in front of you.', ask: 'What would the next reader need, to check this?', tags: /^(Record it carefully|Name the difference)/ },
];

export const roleOf = (flags: Record<string, unknown>): Role | null => ROLES.find((r) => r.id === flags.role) ?? null;
/** Does this dialogue option fit the player's role? (Shown as a mark; it changes nothing else.) */
export const fitsRole = (role: Role | null, tag: string | undefined): boolean => !!role && !!tag && role.tags.test(tag);
