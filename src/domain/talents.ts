/**
 * The Insight tree (skill tree): small helpful habits a Guardian learns, each named after a TOK skill.
 * Insight points come from the town: one for each lamp lit on the Lamp Wall. Talents are play helps
 * (they never give XP and never change how answers are judged). Unlearning is free at any Waystone.
 * Pure rules, no DOM.
 */
import type { CampaignState } from './types';

export interface Talent { id: string; name: string; skill: string; cost: number; needs?: string; text: string; why: string }

export const TALENTS: Talent[] = [
  { id: 'noticing', name: 'Noticing', skill: 'Observation', cost: 1, text: 'Hidden secrets shimmer faintly when you walk close to them.',
    why: 'Careful knowers notice small things before they explain them.' },
  { id: 'mapmaker', name: 'Map-maker', skill: 'Communication', cost: 2, needs: 'noticing', text: 'The map clears in a wider circle around you.',
    why: 'A good map records what you saw, and shows clearly what you have not seen yet.' },
  { id: 'pace', name: 'Steady pace', skill: 'Self-management', cost: 1, text: 'You walk a little faster.',
    why: 'Managing your time and energy is part of knowing well.' },
  { id: 'recall', name: 'Recall', skill: 'Thinking', cost: 1, text: "At Sefa's stitching table, all slips show for 3 seconds at the start.",
    why: 'Memory is a way of knowing. It is also easy to trust too much.' },
  { id: 'fairtrade', name: 'Fair trader', skill: 'Social', cost: 2, needs: 'pace', text: "Corvan's stall takes 1 more mark off each price.",
    why: 'Trust between people is knowledge too: who has been honest with you before?' },
  { id: 'listener', name: 'Patient listener', skill: 'Research', cost: 2, needs: 'recall', text: 'People with something new to say show a brighter mark.',
    why: 'Research starts with asking people, and listening to the whole answer.' },
];

export const insight = (s: CampaignState): number => Number(s.flags['lamps.lit'] ?? 0);
export const hasTalent = (s: CampaignState, id: string): boolean => s.flags[`talent.${id}`] === true;
export function spent(s: CampaignState): number { return TALENTS.filter((t) => hasTalent(s, t.id)).reduce((n, t) => n + t.cost, 0); }

/** Why a talent cannot be learned now, or null if it can. */
export function cannotLearn(s: CampaignState, id: string): string | null {
  const t = TALENTS.find((x) => x.id === id);
  if (!t) return 'Unknown talent';
  if (hasTalent(s, id)) return 'You know this already';
  if (t.needs && !hasTalent(s, t.needs)) return `Learn ${TALENTS.find((x) => x.id === t.needs)?.name} first`;
  if (insight(s) - spent(s) < t.cost) return 'Not enough Insight. Light more lamps.';
  return null;
}
