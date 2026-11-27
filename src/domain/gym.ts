/**
 * The training gym (Mika 2026-11-27, decision X-002, docs/audit/DECISIONS.md).
 *
 * The gym is a practice room outside the story. The student chooses to go there; the story never sends
 * them. It is the only place in the game with flashcards and school-style practice tasks. Nothing done in
 * the gym changes the story, gives XP or reaches a teacher. Gym progress is kept on this device only.
 *
 * Three rooms:
 *  - Word cards: flashcards made from Lumen's glossary, with a simple three-box review order.
 *  - Exhibition bench: the student puts three objects they found in the game beside a practice prompt
 *    and plans what each object shows and what it does not show.
 *  - Practice titles: original, essay-style questions to plan a claim, a counterclaim and examples.
 *
 * All prompts here are original to this project. Never copy IB prescribed titles, exhibition prompts,
 * past papers or examiner wording into this file (they are IB copyright, and the repository is public).
 * Pure rules and data, no DOM.
 */

export type CardBox = 1 | 2 | 3;

export interface GymProgress {
  /** Box for each glossary term id: 1 = still learning, 3 = known well. Missing means box 1. */
  boxes: Record<string, CardBox>;
  /** Number of word cards turned, for the student's own interest. */
  turned: number;
  /** Exhibition bench plans, by prompt id. */
  benches: Record<string, BenchPlan>;
  /** Practice title plans, by title id. */
  plans: Record<string, TitlePlan>;
}

export interface BenchPlan {
  /** Up to three evidence card ids the student found in the game. */
  objects: string[];
  /** For each chosen object: what it shows, and what it does not show. */
  notes: Record<string, { shows: string; limit: string }>;
}

export interface TitlePlan {
  claim: string;
  counterclaim: string;
  /** Examples from areas of knowledge, DP subjects or found objects. */
  examples: string;
}

export const emptyGym = (): GymProgress => ({ boxes: {}, turned: 0, benches: {}, plans: {} });

/** Read stored progress, and drop anything malformed. */
export function normaliseGym(raw: unknown): GymProgress {
  const g = emptyGym();
  if (!raw || typeof raw !== 'object') return g;
  const r = raw as Partial<GymProgress>;
  for (const [id, box] of Object.entries(r.boxes ?? {})) if (box === 1 || box === 2 || box === 3) g.boxes[id] = box;
  if (typeof r.turned === 'number' && Number.isSafeInteger(r.turned) && r.turned >= 0) g.turned = r.turned;
  for (const [id, b] of Object.entries(r.benches ?? {})) {
    if (!b || !Array.isArray(b.objects)) continue;
    const objects = b.objects.filter((o): o is string => typeof o === 'string').slice(0, BENCH_SIZE);
    const notes: BenchPlan['notes'] = {};
    for (const o of objects) {
      const n = b.notes?.[o];
      notes[o] = { shows: typeof n?.shows === 'string' ? n.shows : '', limit: typeof n?.limit === 'string' ? n.limit : '' };
    }
    g.benches[id] = { objects, notes };
  }
  for (const [id, p] of Object.entries(r.plans ?? {})) {
    if (!p) continue;
    g.plans[id] = { claim: String(p.claim ?? ''), counterclaim: String(p.counterclaim ?? ''), examples: String(p.examples ?? '') };
  }
  return g;
}

export const boxOf = (g: GymProgress, id: string): CardBox => g.boxes[id] ?? 1;

/**
 * The next word card: the lowest box first, then the term turned least recently in that box order.
 * `order` is the list of term ids; `after` is the id just shown, so the same card does not repeat at once.
 */
export function nextCard(order: readonly string[], g: GymProgress, after?: string): string | null {
  if (!order.length) return null;
  for (const box of [1, 2, 3] as const) {
    const inBox = order.filter((id) => boxOf(g, id) === box);
    if (!inBox.length) continue;
    const start = after ? (inBox.indexOf(after) + 1) % inBox.length : 0;
    const pick = inBox[start];
    if (pick !== after || inBox.length === 1) return pick;
  }
  return order[0];
}

/** "I knew it" moves a card up a box. "Not yet" moves it back to box 1. Never a score. */
export function rateCard(g: GymProgress, id: string, knew: boolean): GymProgress {
  const box = boxOf(g, id);
  const next: CardBox = knew ? (Math.min(3, box + 1) as CardBox) : 1;
  return { ...g, boxes: { ...g.boxes, [id]: next }, turned: g.turned + 1 };
}

export function boxCounts(order: readonly string[], g: GymProgress): Record<CardBox, number> {
  const counts: Record<CardBox, number> = { 1: 0, 2: 0, 3: 0 };
  for (const id of order) counts[boxOf(g, id)]++;
  return counts;
}

/** Exhibition practice uses three objects, like a small exhibition. */
export const BENCH_SIZE = 3;

/** Add or remove an object on a bench. Only objects the student found can be placed. */
export function toggleBenchObject(g: GymProgress, prompt: string, card: string, found: readonly string[]): GymProgress {
  if (!found.includes(card)) return g;
  const bench = g.benches[prompt] ?? { objects: [], notes: {} };
  const has = bench.objects.includes(card);
  if (!has && bench.objects.length >= BENCH_SIZE) return g;
  const objects = has ? bench.objects.filter((o) => o !== card) : [...bench.objects, card];
  const notes = { ...bench.notes };
  if (has) delete notes[card]; else notes[card] = { shows: '', limit: '' };
  return { ...g, benches: { ...g.benches, [prompt]: { objects, notes } } };
}

export function writeBenchNote(g: GymProgress, prompt: string, card: string, field: 'shows' | 'limit', text: string): GymProgress {
  const bench = g.benches[prompt];
  if (!bench?.objects.includes(card)) return g;
  const note = { ...(bench.notes[card] ?? { shows: '', limit: '' }), [field]: text };
  return { ...g, benches: { ...g.benches, [prompt]: { ...bench, notes: { ...bench.notes, [card]: note } } } };
}

export function writePlan(g: GymProgress, title: string, field: keyof TitlePlan, text: string): GymProgress {
  const plan = { ...(g.plans[title] ?? { claim: '', counterclaim: '', examples: '' }), [field]: text };
  return { ...g, plans: { ...g.plans, [title]: plan } };
}

/** How far a plan has come, in plain words. Never a mark. */
export function benchStatus(g: GymProgress, prompt: string): string {
  const bench = g.benches[prompt];
  const n = bench?.objects.length ?? 0;
  if (!n) return 'No objects yet.';
  const planned = bench!.objects.filter((o) => bench!.notes[o]?.shows.trim() && bench!.notes[o]?.limit.trim()).length;
  return `${n} of ${BENCH_SIZE} objects placed. ${planned} with both notes.`;
}

export interface GymPrompt {
  id: string;
  text: string;
  /** A short nudge that helps without giving an answer. */
  nudge: string;
}

/** Original exhibition-style practice prompts. Each asks how real objects can show knowledge at work. */
export const BENCH_PROMPTS: readonly GymPrompt[] = [
  { id: 'bench.label', text: 'Can a label that is true in one sense mislead in another?',
    nudge: 'Think of the three "first" pens. Which of your objects has a label that could be read two ways?' },
  { id: 'bench.maker', text: 'Whose work does an object hide?',
    nudge: 'Look for a maker, a helper or a community that the record does not name.' },
  { id: 'bench.change', text: 'How can an object change what people thought they knew?',
    nudge: 'Pick an object that surprised someone in the game. What did they believe before?' },
  { id: 'bench.copy', text: 'When is a copy as good as the original for knowing something?',
    nudge: 'A copy can keep some features and lose others. Which features matter for which question?' },
  { id: 'bench.tool', text: 'How does a tool decide what can be found?',
    nudge: 'Think of the Date Lens, a dig trowel or a measuring stick. What can the tool not see?' },
  { id: 'bench.keep', text: 'Who decides which things are worth keeping?',
    nudge: 'An archive, a family and a museum may keep different things for different reasons.' },
  { id: 'bench.number', text: 'What can a number about an object tell us, and what can it not?',
    nudge: 'A date, a weight or a count is exact. What question does it still leave open?' },
  { id: 'bench.voice', text: 'Can an object speak for the people who made it?',
    nudge: 'Who tells the object\'s story now? Is it the makers, the keepers or the visitors?' },
];

/** Original essay-style practice titles. Each can be argued more than one way. */
export const PRACTICE_TITLES: readonly GymPrompt[] = [
  { id: 'title.first', text: '"Being first matters more to the people who record history than to the people who make it." Discuss with reference to two areas of knowledge.',
    nudge: 'Who gains when a "first" is recorded? Try one example from history and one from the natural sciences.' },
  { id: 'title.loud', text: 'In the pursuit of knowledge, is a confident claim more dangerous than an uncertain one?',
    nudge: 'Corvan was confident. Was he dangerous because of the confidence, or because of the missing evidence?' },
  { id: 'title.method', text: 'To what extent does the method we choose decide the answer we find? Discuss with reference to the human sciences and one other area of knowledge.',
    nudge: 'A survey, an interview and an experiment can study the same question. Do they find the same thing?' },
  { id: 'title.agree', text: '"When experts agree, the rest of us should stop asking questions." Evaluate this claim.',
    nudge: 'When did the experts in the game agree and still miss something? When was it right to trust them?' },
  { id: 'title.lost', text: 'Is knowledge that nobody writes down more easily lost, or more easily kept?',
    nudge: 'Think of songs, crafts and community memory, and of records that burned or were misfiled.' },
  { id: 'title.beauty', text: 'Can a song carry knowledge that a ledger cannot? Discuss with reference to the arts and one other area of knowledge.',
    nudge: 'Sefa\'s song and the guild ledger told different parts of one story. What could each one do that the other could not?' },
  { id: 'title.change', text: 'If knowledge changes over time, in what sense was the old knowledge ever knowledge?',
    nudge: 'Think of a date or a label that the game corrected. Was the old label useless, or useful for a time?' },
  { id: 'title.ethics', text: 'Is some knowledge not worth the harm it costs to gain? Use one example from the game and one from a DP subject you study.',
    nudge: 'The Careful Dig can only be done once. Who should have a say before a site is dug?' },
];

export const GYM_NOTE = 'This is a practice room outside the story. Nothing here changes the story, gives XP or goes to your teacher. Your work here stays on this device.';
