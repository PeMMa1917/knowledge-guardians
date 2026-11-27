import type { Condition } from './types';

/**
 * The rumour mill (Mika 2026-11-25: radiant side quests; rumours traced to a source). At the tea
 * table in the market the player overhears one rumour at a time. To trace it, the player checks
 * sources (a person, a record, someone who knows the subject). Each case names which sources must
 * be checked before the game gives feedback that refers to them. Four verdicts: supported, partly
 * supported, not supported, cannot tell yet. Every verdict is explained. The order is seeded (fair
 * randomness, never Math.random). All rumours are about the fictional town, never real news.
 * TOK link: testimony, corroboration, correlation and cause, observation and inference, sampling.
 */
export const VERDICTS = ['Supported', 'Partly supported', 'Not supported', 'Cannot tell yet'] as const;
export const MIN_SOURCES = 2;

export const RUMOUR_DESKS = ['ledger', 'ferry'] as const;
export type RumourDesk = typeof RUMOUR_DESKS[number];

export interface Rumour {
  id: string;
  /** Who is overheard, and where. */
  heard: string;
  line: string;
  sources: { label: string; text: string }[];
  /** Indexes of the sources named or relied on in the feedback. */
  requiredSources: readonly number[];
  title: string;
  handoffs: Record<RumourDesk, { action: string; reply: string }>;
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
  { id: 'clever-well', title: "The east well",
    handoffs: {
      ledger: { action: "File the two mineral readings together", reply: "Noa clips the two readings to one page. A visitor can check the minerals measured that spring. The page has no learning measures." },
      ferry: { action: "Send Efua’s school route to the landing", reply: "Tova lays the old school route next to the well on her ferry map. A family finds why pupils gathered there. The mineral book is still in town." },
    },
    heard: 'Two carters at the tea table', line: "'Drink from the east well and you get clever. Everyone knows that.'",
    sources: [
      { label: 'Ask the carters who told them', text: "'My gran said it. Her gran said it too.' They both smile: it is an old saying." },
      { label: 'Ask Efua, the well-keeper', text: "Efua laughs. 'The east well is next to the old school. For a hundred years, the pupils drank there before lessons.'" },
      { label: "Look in Noa's record book", text: 'Noa tested the water of both wells last spring. The same minerals are in both, in nearly the same amounts.' },
    ],
    requiredSources: [1, 2],
    best: 2,
    whys: [
      'The pupils drank there, but that does not test what the water did. What shows that drinking there caused learning?',
      'Pupils did drink there. The rumour goes further and says the water caused their learning. What evidence supports that step?',
      'The school was next to the well. Noa found similar mineral levels in both wells. Neither record shows that the water made the pupils clever.',
      'What the water might do is still open. These records give no support for the rumour’s claim that it made the pupils clever.',
    ],
    idea: 'Two things that go together (correlation) do not show that one causes the other.', fray: 'shadow-twins' },
  { id: 'greedy-prices', title: "The market-day price",
    handoffs: {
      ledger: { action: "Pin the toll and prices in the guild ledger", reply: "A buyer follows the two dated prices to the bridge toll. The clerk leaves Corvan’s reason for charging extra open." },
      ferry: { action: "Send Hana’s cart account to the landing", reply: "Hana waits beside the ferry cart to explain what the crossing costs her. A trader who arrives after she leaves will need the guild records." },
    },
    heard: 'A shopper by the fountain', line: "'Corvan puts his prices up every market day. Pure greed.'",
    sources: [
      { label: "Look at Corvan's price slate", text: 'On market days, each price is 2 marks higher.' },
      { label: 'Read the toll board at the bridge', text: 'On market days, the bridge toll for a loaded cart is twice the usual toll.' },
      { label: 'Ask Hana, the cloth seller', text: "'All of us who bring goods by cart put our prices up on market day. The toll, you see. Corvan is loud about many things, but not about this.'" },
    ],
    requiredSources: [0, 1, 2],
    best: 1,
    whys: [
      'The prices do go up. The toll offers another possible explanation. The records do not settle Corvan’s motives.',
      'The price slate shows the increase. The toll and Hana’s account give another possible reason, so the records do not establish Corvan’s motive.',
      'Part of the rumour is true: the slate shows higher prices on market days.',
      'You have the slate, the toll board and another seller. That is enough to judge most of it.',
    ],
    idea: 'A rumour often joins a fact to an interpretation. Check each part on its own.' },
  { id: 'bridge-lights', title: "The blue lights",
    handoffs: {
      ledger: { action: "File the porter’s sightline beside Tova’s route", reply: "The guild clerk sketches the stretch both accounts cover. A watchkeeper can locate the sighting. The farther bank stays blank." },
      ferry: { action: "Ask the ferry crew to walk the lantern route", reply: "Tova takes a traveller to the near bank at the next slow-water crossing. From there the lantern passes behind a post. What the porter saw farther east stays open." },
    },
    heard: 'A porter on the south road', line: "'There is a Fray at the bridge at night. I saw its blue light myself!'",
    sources: [
      { label: 'Ask the porter what he saw', text: "'Blue lights, low down, moving slowly along the river, late at night. Then they went east.'" },
      { label: 'Ask Tova at the ferry landing', text: "'Our people walk the old road at night when the water is slow. We carry blue lanterns, so the fish are not scared.'" },
      { label: 'Ask Sefa about the Fray', text: "'A Fray is an error in thinking that takes a shape. It grows where people stop checking. Blue lights are a question to check, not a monster to fear.'" },
    ],
    requiredSources: [0, 1],
    best: 1,
    whys: [
      'The light was real, but "it was a Fray" is a guess about what made it.',
      'Yes: the porter saw blue lights (an observation) and guessed they were a Fray (an inference). The observation holds; the ferry folk\'s lanterns explain it better than a Fray.',
      'The porter did see lights. His observation is supported, even if his guess is not.',
      'Tova gives a clear reason for the lights. You can judge it now.',
    ],
    idea: 'An observation (what you saw) and an inference (what you think it means) are different claims.' },
  { id: 'market-closing', title: "A month on the green",
    handoffs: {
      ledger: { action: "Date the draft in the public ledger", reply: "Orrin leaves a space for next week’s vote below the dated proposal. Traders can see which decision is still open. The early ferry has already left." },
      ferry: { action: "Send the proposed month to the next ferry", reply: "Tova tells the arriving stallholders to keep both sites on their delivery slips until the vote. They have to carry supplies for two possible stops." },
    },
    heard: 'A baker at the tea table', line: "'The guild is closing the market. For good!'",
    sources: [
      { label: 'Ask Orrin at the guild hall', text: "'Closing it? No. The bridge needs repairs. The council may move the market to the west green for one month. We vote next week.'" },
      { label: "Read the Sign-Smith's notice board", text: "A draft notice: 'PROPOSAL: the market may move to the west green during the bridge works. Council vote: next week.'" },
      { label: 'Ask the baker who told her', text: "'The carter heard it from the porter, who heard it from a clerk.' Three people, and each retold it a little bigger." },
    ],
    requiredSources: [0, 1, 2],
    best: 1,
    whys: [
      'Something is planned, but the plan is a move, not a closing, and it is not decided.',
      'Yes: a move is proposed, for one month, and not decided yet. Each retelling made it bigger and more certain than the notice.',
      'There is a real plan behind it. "Not supported" would hide that.',
      'The notice and Orrin agree, so you can say what the plan is.',
    ],
    idea: 'Retelling can change both the size of a claim and how certain it sounds.', fray: 'echo-moths' },
  { id: 'everyone-reads', title: "Who read the notice",
    handoffs: {
      ledger: { action: "Post the noon tally with its place and time", reply: "The clerk binds the tally to its noon collection slip. The guild can plan help for that queue. The dawn row stays empty." },
      ferry: { action: "Take a fresh tally sheet to the dawn ferry", reply: "Efua meets the farm crews at dawn. One asks for the notice aloud and another reads it to a friend. She records the requests separately from the noon count." },
    },
    heard: 'A clerk at the guild steps', line: "'Everyone in Emberford can read now. Our survey proves it.'",
    sources: [
      { label: "Look at Clerk Venn's survey", text: 'At noon in the plaza, 30 of 40 people read the notice aloud without help.' },
      { label: 'Ask Orrin who comes to town at noon', text: "'At noon? Traders and guild people. Farm families come at dawn and go home before ten.'" },
      { label: 'Ask Efua about the farm families', text: "'Some read, some do not. Nobody asked them.'" },
    ],
    requiredSources: [0, 1, 2],
    best: 3,
    whys: [
      'The survey asked only some people, at one time of day, and the record counts only 30 independent readings out of 40 people.',
      'You cannot say "partly" with confidence: the people who were not asked may be very different.',
      'The survey is real evidence about the people it asked. It does not show the claim is false either.',
      'Yes: the survey asked only the people in the plaza at noon. The farm families were not asked. A fair answer needs a fairer sample, so you cannot tell yet.',
    ],
    idea: 'A sample tells you about the people it asked. A small sample from one place and time cannot establish a claim about everyone.', fray: 'hasty-hydra' },
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

export const missingRumourSources = (f: Flags, r: Rumour): number[] =>
  r.requiredSources.filter((i) => f[`mill.${r.id}.s${i}`] !== true);

export function eastWellSlipAt(desk: RumourDesk): Condition {
  const well = RUMOURS.find(({ id }) => id === 'clever-well')!;
  return { all: [
    { flag: `mill.${well.id}.desk`, eq: desk },
    ...well.requiredSources.map((i) => ({ flag: `mill.${well.id}.s${i}`, eq: true as const })),
  ] };
}

/** The rumour the player hears now: the first one not yet judged, in seeded order; null when all are done. */
export function currentRumour(f: Flags, seed: number): Rumour | null {
  return rumourOrder(seed).find((r) => !rumourDone(f, r.id)) ?? null;
}
