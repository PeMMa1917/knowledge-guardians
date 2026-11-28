/**
 * The Festival Dilemma (chapter 11 field game, C-004). One problem at the Water Commons festival, four
 * friends with four pieces of advice. The player tries three new facts on each friend and sees which facts
 * move whom. A friend who has heard every fact sums up what moves them. The journal names the four ways
 * of judging (X-012); the friends never do. The player then advises Tess; no advice is marked right
 * (OPEN-001). Pure rules.
 */
import data from '../content/festival-dilemma.json';

export type Response = { moves: boolean; line: string };
export const PROBLEM = data.problem;
export const FRIENDS = data.friends;
export const FACTS = data.facts;
export const SUMMARIES = data.summaries as Record<string, string>;
export const CHOICES = data.choices;
const RESPONSES = data.responses as Record<string, Response>;

/** The way of judging each friend shows. Named in the journal, not in the scene. */
export const VIEW_NAMES: Record<string, string> = { fen: 'consequences', odette: 'duty', tobin: 'virtue', lio: 'care' };

/** What a friend says when told a fact, and whether it changes their advice. */
export const respond = (friend: string, fact: string): Response => RESPONSES[`${friend}.${fact}`];

/** True once a friend has heard every fact. */
export const heardAll = (tried: Set<string>, friend: string): boolean => FACTS.every((f) => tried.has(`${friend}.${f.id}`));

/** The facts that move a friend. */
export const movedBy = (friend: string): string[] => FACTS.filter((f) => respond(friend, f.id).moves).map((f) => f.id);

/** Friends to hear out fully before the player advises Tess. */
export const FRIENDS_TO_HEAR = 2;
