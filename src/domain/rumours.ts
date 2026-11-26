/**
 * The rumour mill (Mika 2026-11-25: radiant side quests; rumours traced to a source). At the tea
 * table in the market the player overhears one rumour at a time. To trace it, the player checks
 * sources (a person, a record, someone who knows the subject). At least two sources must be checked
 * before a verdict: one source alone cannot be corroborated. Four verdicts: supported, partly
 * supported, not supported, cannot tell yet. Every verdict is explained. The order is seeded (fair
 * randomness, never Math.random). All rumours are about the fictional town, never real news.
 * TOK link: testimony, corroboration, correlation and cause, observation and inference, sampling.
 */
export const VERDICTS = ['Supported', 'Partly supported', 'Not supported', 'Cannot tell yet'] as const;
export const MIN_SOURCES = 2;

export interface Rumour {
  id: string;
  /** Who is overheard, and where. */
  heard: string;
  line: string;
  sources: { label: string; text: string }[];
  /** The index in VERDICTS that the evidence best supports. */
  best: number;
  /** One explanation for each verdict, in the order of VERDICTS. */
  whys: [string, string, string, string];
  /** The TOK idea, shown after the verdict. */
  idea: string;
  /** A Fray creature (an error in reasoning) that this rumour shows, met when it is solved. */
  fray?: string;
}

export const RUMOURS: Rumour[] = [
  { id: 'clever-well', heard: 'Two carters at the tea table', line: "'Drink from the east well and you get clever. Everyone knows that.'",
    sources: [
      { label: 'Ask the carters who told them', text: "'My gran said it. Her gran said it too.' They both smile: it is an old saying." },
      { label: 'Ask Efua, the well-keeper', text: "Efua laughs. 'The east well is next to the old school. For a hundred years, the pupils drank there before lessons.'" },
      { label: "Look in Noa's record book", text: 'Noa tested the water of both wells last spring. The same minerals are in both, in nearly the same amounts.' },
    ],
    best: 2,
    whys: [
      'The saying is old, but old is not the same as tested. What links the well and clever people?',
      'Something true is in it: clever people did drink there. But the rumour says the water makes them clever.',
      'Yes: the pupils drank there because the school was next to it. The well and learning go together, but the water does not cause the learning. Noa\'s test shows the water is the same as the other well.',
      'You have a test of the water and a reason why pupils drank there. That is enough to say more than "cannot tell".',
    ],
    idea: 'Two things that go together (correlation) do not show that one causes the other.', fray: 'shadow-twins' },
  { id: 'greedy-prices', heard: 'A shopper by the fountain', line: "'Corvan puts his prices up every market day. Pure greed.'",
    sources: [
      { label: "Look at Corvan's price slate", text: 'On market days, each price is 2 marks higher.' },
      { label: 'Read the toll board at the bridge', text: 'On market days, the bridge toll for a loaded cart is twice the usual toll.' },
      { label: 'Ask Hana, the cloth seller', text: "'All of us who bring goods by cart put our prices up on market day. The toll, you see. Corvan is loud about many things, but not about this.'" },
    ],
    best: 1,
    whys: [
      'The prices do go up. But "greed" is a reason, and the sources show another reason.',
      'Yes: the fact is right (the prices go up), but the reason added to it ("greed") is not supported. The bridge toll explains it, and every cart seller does the same.',
      'Part of the rumour is true: the slate shows higher prices on market days.',
      'You have the slate, the toll board and another seller. That is enough to judge most of it.',
    ],
    idea: 'A rumour often joins a fact to an interpretation. Check each part on its own.' },
  { id: 'bridge-lights', heard: 'A porter on the south road', line: "'There is a Fray at the bridge at night. I saw its blue light myself!'",
    sources: [
      { label: 'Ask the porter what he saw', text: "'Blue lights, low down, moving slowly along the river, late at night. Then they went east.'" },
      { label: 'Ask Tova at the ferry landing', text: "'Our people walk the old road at night when the water is slow. We carry blue lanterns, so the fish are not scared.'" },
      { label: 'Ask Sefa about the Fray', text: "'A Fray is an error in thinking that takes a shape. It grows where people stop checking. Blue lights are a question to check, not a monster to fear.'" },
    ],
    best: 1,
    whys: [
      'The light was real, but "it was a Fray" is a guess about what made it.',
      'Yes: the porter saw blue lights (an observation) and guessed they were a Fray (an inference). The observation holds; the ferry folk\'s lanterns explain it better than a Fray.',
      'The porter did see lights. His observation is supported, even if his guess is not.',
      'Tova gives a clear reason for the lights. You can judge it now.',
    ],
    idea: 'An observation (what you saw) and an inference (what you think it means) are different claims.' },
  { id: 'market-closing', heard: 'A baker at the tea table', line: "'The guild is closing the market. For good!'",
    sources: [
      { label: 'Ask Orrin at the guild hall', text: "'Closing it? No. The bridge needs repairs. The council may move the market to the west green for one month. We vote next week.'" },
      { label: "Read the Sign-Smith's notice board", text: "A draft notice: 'PROPOSAL: the market may move to the west green during the bridge works. Council vote: next week.'" },
      { label: 'Ask the baker who told her', text: "'The carter heard it from the porter, who heard it from a clerk.' Three people, and each retold it a little bigger." },
    ],
    best: 1,
    whys: [
      'Something is planned, but the plan is a move, not a closing, and it is not decided.',
      'Yes: a move is proposed, for one month, and not decided yet. Each retelling made it bigger and more certain than the notice.',
      'There is a real plan behind it. "Not supported" would hide that.',
      'The notice and Orrin agree, so you can say what the plan is.',
    ],
    idea: 'Retelling can change both the size of a claim and how certain it sounds.', fray: 'echo-moths' },
  { id: 'everyone-reads', heard: 'A clerk at the guild steps', line: "'Everyone in Emberford can read now. Our survey proves it.'",
    sources: [
      { label: "Look at Clerk Venn's survey", text: 'At noon in the plaza, 30 of 40 people read the notice aloud without help.' },
      { label: 'Ask Orrin who comes to town at noon', text: "'At noon? Traders and guild people. Farm families come at dawn and go home before ten.'" },
      { label: 'Ask Efua about the farm families', text: "'Some read, some do not. Nobody asked them.'" },
    ],
    best: 3,
    whys: [
      'The survey asked only some people, at one time of day, and even then 10 of 40 needed help.',
      'You cannot say "partly" with confidence: the people who were not asked may be very different.',
      'The survey is real evidence about the people it asked. It does not show the claim is false either.',
      'Yes: the survey asked only the people in the plaza at noon. The farm families were not asked. A fair answer needs a fairer sample, so you cannot tell yet.',
    ],
    idea: 'A sample tells you about the people it asked. A claim about "everyone" needs a sample that includes everyone.', fray: 'hasty-hydra' },
];

function rng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** The rumour order for a seed (fair: the same seed always gives the same order). */
export function rumourOrder(seed: number): Rumour[] {
  const r = rng(seed + 7), a = [...RUMOURS];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

type Flags = Record<string, unknown>;
export const rumourDone = (f: Flags, id: string): boolean => f[`mill.${id}.done`] === true;
export const sourcesChecked = (f: Flags, r: Rumour): number[] => r.sources.map((_, i) => i).filter((i) => f[`mill.${r.id}.s${i}`] === true);

/** The rumour the player hears now: the first one not yet judged, in seeded order; null when all are done. */
export function currentRumour(f: Flags, seed: number): Rumour | null {
  return rumourOrder(seed).find((r) => !rumourDone(f, r.id)) ?? null;
}
