/**
 * Field games from Mika's game-elements compendium (2026-11-26), each with a TOK twist:
 * - Star Pictures (constellation tracing, telescope work): the stars are the same for everyone and can
 *   be measured; the pictures people draw between them differ, and each picture carries knowledge.
 * - The Careful Dig (excavation and delicate restoration): a fast tool or a slow tool; a find without
 *   its context loses most of its value as evidence; a site can only be dug once.
 * - The Spare Tag (a trading chain): the same thing is worth different things to different people,
 *   for different kinds of reasons.
 * Fictional people, places, sky pictures and finds only. Seeded and fair. No timers in calm mode.
 * Pure data and rules; no DOM.
 */
import { rng } from './fairgames';

// ------------------------------------------------------------ Star Pictures (chapter 4)

export interface Star { x: number; y: number; bright?: boolean }
/** Seven stars over the Observatory Coast (positions in a 100 x 70 box). */
export const STARS: Star[] = [
  { x: 12, y: 50 }, { x: 28, y: 38 }, { x: 44, y: 30, bright: true }, { x: 60, y: 36 }, { x: 78, y: 26 }, { x: 52, y: 52 }, { x: 70, y: 58 },
];
export interface SkyPicture { id: string; name: string; who: string; lines: [number, number][]; knows: string }
export const SKY_PICTURES: SkyPicture[] = [
  { id: 'heron', name: 'the Heron', who: 'the quay families', lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]],
    knows: "The Heron stands up at dusk in the month the herons come back to the marsh. When it does, the quay families mend their nets: the shoals are coming." },
  { id: 'ladder', name: 'the Ladder', who: 'the ridge shepherds', lines: [[6, 5], [5, 2], [2, 1], [1, 0], [5, 3]],
    knows: "The top of the Ladder points along a line to the one star that never moves. The ridge shepherds walk home by it on dark nights." },
];
export const MY_PICTURE_NAMES = ['the Kettle', 'the Running Hare', 'the Lantern'];
/** The measured height of the bright star above the sea wall: the same for both keepers. */
export const STAR_HEIGHT = 23;
export interface ChartChoice { id: string; text: string; cost: string }
export const CHART_CHOICES: ChartChoice[] = [
  { id: 'heron', text: 'Label it "the Heron" on the harbour chart.', cost: 'The quay families feel at home on the chart. The shepherds say the Nexus has taken a side.' },
  { id: 'ladder', text: 'Label it "the Ladder".', cost: 'The shepherds are pleased. The quay families say nobody asked them, and they are right.' },
  { id: 'both', text: 'Put both names, and say who uses each and what for.', cost: 'Honest and fair, but the chart is crowded, and a visitor must read more.' },
  { id: 'numbers', text: 'Put only the positions and the measured height.', cost: 'Nobody can argue with the numbers. But the knowledge in the pictures (when to mend nets, how to walk home) is left off.' },
];

// ------------------------------------------------------------ The Careful Dig (chapter 5)

export const DIG_W = 6, DIG_H = 4;
export type DigTool = 'pick' | 'brush';
export interface DigCell { find: boolean; layer: 'ash' | 'clay' | 'charcoal'; cleared: number; cracked: boolean; noted: boolean }
/** Brush strokes a cell needs; the pick clears a cell in one stroke but cracks a find under it. */
export const BRUSH_STROKES = 3;
export const DIG_LIGHT = 40;

/** A seeded site: one old cooking pot in four pieces, in a block of four cells. */
export function digSite(seed: number): DigCell[] {
  const r = rng(seed * 13 + 5);
  const fx = Math.floor(r() * (DIG_W - 1)), fy = Math.floor(r() * (DIG_H - 1));
  const layers: DigCell['layer'][] = ['ash', 'clay', 'charcoal'];
  return Array.from({ length: DIG_W * DIG_H }, (_, i) => {
    const x = i % DIG_W, y = Math.floor(i / DIG_W);
    const find = x >= fx && x <= fx + 1 && y >= fy && y <= fy + 1;
    return { find, layer: find ? 'charcoal' : layers[Math.floor(r() * 3)], cleared: 0, cracked: false, noted: false };
  });
}

/** One stroke of a tool on a cell. Returns a new site (pure). */
export function digStroke(site: DigCell[], i: number, tool: DigTool): DigCell[] {
  return site.map((c, k) => {
    if (k !== i || c.cleared >= BRUSH_STROKES) return c;
    if (tool === 'pick') return { ...c, cleared: BRUSH_STROKES, cracked: c.find };
    return { ...c, cleared: c.cleared + 1 };
  });
}
export const digNote = (site: DigCell[], i: number): DigCell[] => site.map((c, k) => (k === i && c.cleared >= BRUSH_STROKES ? { ...c, noted: true } : c));

export interface DigReport { pieces: number; whole: number; cracked: number; notedFinds: number; notedAll: number; open: number }
export function digReport(site: DigCell[]): DigReport {
  const finds = site.filter((c) => c.find && c.cleared >= BRUSH_STROKES);
  return {
    pieces: finds.length, whole: finds.filter((c) => !c.cracked).length, cracked: finds.filter((c) => c.cracked).length,
    notedFinds: finds.filter((c) => c.noted).length, notedAll: site.filter((c) => c.noted).length, open: site.filter((c) => c.cleared >= BRUSH_STROKES).length,
  };
}
export const DIG_CHOICES: ChartChoice[] = [
  { id: 'now', text: 'Dig the second trench now, while the crew is here.', cost: 'You learn more this season. But once it is dug, nobody can dig it again with better tools.' },
  { id: 'later', text: 'Leave the second trench for later, for better tools and new questions.', cost: 'The next people may learn more than you can. But the forest may move the soil, and the crew is disappointed.' },
  { id: 'together', text: 'Ask the families who use the forest camp today what they want, then decide with them.', cost: 'It takes a week of talking. Some want it dug, some want it left. Whatever you decide, someone is unhappy.' },
];

// ------------------------------------------------------------ The Spare Tag (chapter 1)

export interface Trader { who: string; wants: string; why: string; kind: 'use' | 'memory' | 'beauty' | 'need'; gives: string }
export interface TradeStep { have: string; offers: Trader[] }
export const TRADE_START = 'a spare carrier tag';
/** Each step: two people want what you hold, for different kinds of reasons. You choose who gets it. */
export const TRADE_STEPS: ((have: string) => Trader[])[] = [
  () => [
    { who: 'Juno the ferry cook', wants: TRADE_START, why: "'I can tie it to the salt jar. Then nobody puts salt in the porridge again. Again.'", kind: 'use', gives: 'a dented brass ladle' },
    { who: 'Hollis', wants: TRADE_START, why: "'My granddad was a carrier. His tags looked just like that. Can I keep it?'", kind: 'memory', gives: 'a smooth river stone with a hole in it' },
  ],
  (have) => have === 'a dented brass ladle' ? [
    { who: 'Odo the sign-painter', wants: have, why: "'A brass ladle! Perfect for stirring gold paint. Mine is a stick.'", kind: 'use', gives: 'a half pot of gold paint' },
    { who: 'Wynn the ballad-singer', wants: have, why: "'Look how it catches the light. I will hang it by the well and sing under it.'", kind: 'beauty', gives: 'a song sheet with one verse missing' },
  ] : [
    { who: 'Tova the ferry keeper', wants: have, why: "'A stone with a hole keeps the boat lucky, the old ferry folk say. Mine fell in the river.'", kind: 'memory', gives: 'a coil of good rope' },
    { who: 'Odo the sign-painter', wants: have, why: "'I need a weight for my notices in the wind. That is exactly the right size.'", kind: 'need', gives: 'a half pot of gold paint' },
  ],
  (have) => [
    { who: 'Clerk Venn', wants: have, why: "'I need it for the Weigh-House. It is useful, and it is town business.'", kind: 'need', gives: 'an old brass compass' },
    { who: 'Kip', wants: have, why: "'I just want to know where it has been. Who had it? Who before them? Can I write it down?'", kind: 'memory', gives: 'a notebook page called "Where things have been"' },
  ],
];
export const TRADE_KIND: Record<Trader['kind'], string> = { use: 'for what it can do', memory: 'for what it reminds them of', beauty: 'for how it looks', need: 'because they must have it' };
