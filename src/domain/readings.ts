/**
 * Field readings (Mika 2026-11-25: crafting must matter in the world). A tool made at the Maker's
 * bench can test a claim that someone in town makes. The tool must be calibrated first: a reading
 * from an unchecked tool can be off by any amount. The playable scene uses observations and a handover in makerField.ts.
 * The option records here preserve the earlier command format for existing replays. Pure rules.
 */
import type { Recipe } from './craft';
import { RECIPES } from './craft';

export interface Reading {
  id: string;
  /** The recipe id of the tool that takes this reading. */
  tool: Recipe['id'];
  /** Where the reading is taken (shown as the panel title). */
  place: string;
  /** What someone in town says. */
  claim: string;
  /** What the calibrated tool shows. */
  result: string;
  q: string;
  options: { text: string; ok: boolean; why: string }[];
}

export const READINGS: Reading[] = [
  { id: 'rain', tool: 'rain-gauge', place: "The rain gauge by Noa's board",
    claim: "The tea seller says: 'Last night was the heaviest rain in years! The river will be over the bridge by noon.'",
    result: "You set your gauge out last evening. It holds 9 mm of rain. Noa's record book lists the nights when the river went over the bridge: each one had more than 40 mm.",
    q: 'What can you say now?',
    options: [
      { text: 'The tea seller is lying.', ok: false, why: 'A claim can be wrong without being a lie. Rain on a roof at night sounds heavier than it is. Ask her what she heard, not why she lied.' },
      { text: 'It rained, but much less than on the flood nights. A flood by noon is not likely, and I will say how sure I am.', ok: true, why: 'Yes: you compare your reading with a record, and you say how sure you are. One gauge in one place is still only one reading.' },
      { text: 'My reading proves the bridge will never flood.', ok: false, why: 'One reading tells you about one night. It cannot tell you about every night to come.' },
    ] },
  { id: 'tower', tool: 'plumb-line', place: 'The plumb line at the bell tower door',
    claim: "People in the market say: 'The bell tower leans more every year. It will fall soon.'",
    result: "Your plumb line hangs one finger away from the stone at the top of the door frame. Maren shows you a small mark cut in the frame by her grandmother, where her line hung fifty years ago. Your line hangs at the same mark.",
    q: 'What does this show?',
    options: [
      { text: 'The tower leans, so it will fall soon.', ok: false, why: 'A lean is not the same as a lean that grows. Your line and the old mark show no change in fifty years.' },
      { text: 'It leans a little, but the lean has not grown since the old mark. A builder can say more about the stone.', ok: true, why: 'Yes: an old measurement, made the same way, lets you compare across time. You also say where your knowledge stops.' },
      { text: 'It looks straight to me, so the line must be wrong.', ok: false, why: 'You checked the line at the bench. Small leans fool the eye; that is why people made plumb lines.' },
    ] },
  { id: 'flood-post', tool: 'reed-pen', place: 'The old flood post by the bridge',
    claim: "Clerk Venn needs a clear copy of the old flood post for the guild record. The carved line is clear. The painted year is faded: you can read 3, then a gap, then 7. Venn says: 'Just write 357. It was the big flood of 357, I am sure.'",
    result: 'The copy will go in the guild record, and people will read it long after you and Venn are gone.',
    q: 'What do you write?',
    options: [
      { text: "357, as Venn says. He knows the town's history.", ok: false, why: 'A guess written in a record looks like a fact to the next reader. Venn may be right, but the post does not show it.' },
      { text: "'3?7. The middle figure cannot be read. Clerk Venn thinks it is 5.'", ok: true, why: 'Yes: copy what you see, and keep a guess apart from it, with the name of the person who made it. The next reader can then check.' },
      { text: 'Nothing. A record must be complete, or it is not worth keeping.', ok: false, why: 'A part you can read is still evidence. Mark what is missing, and keep the rest.' },
    ] },
];

export const readingOf = (id: string): Reading | undefined => READINGS.find((r) => r.id === id);
export const toolOf = (r: Reading): Recipe => RECIPES.find((x) => x.id === r.tool)!;

/** Why this reading cannot be taken now, or null. */
export function cannotRead(s: { inventory: Record<string, unknown>; flags: Record<string, unknown> }, id: string): string | null {
  const r = readingOf(id);
  if (!r) return 'Nothing to measure here';
  const t = toolOf(r);
  if (!s.inventory[t.item]) return `You need a ${t.name.toLowerCase()}. Make one at the Maker's bench by the forge.`;
  if (s.flags[`craft.${t.id}.calibrated`] !== true) return `Your ${t.name.toLowerCase()} is not calibrated. A reading from an unchecked tool can be off by any amount. Calibrate it at the Maker's bench first.`;
  return null;
}
