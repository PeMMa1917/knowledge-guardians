/**
 * Fair games from the mathematics lessons (Mika's TOK lessons, 2026-11-26). Each one is played,
 * never asked as a quiz. The player first acts on a gut feeling, then runs many seeded rounds, then
 * changes one assumption and sees the answer change. Fair randomness: every run comes from a seed.
 *
 * - Dov's Three Doors (a three-door game): does switching help? Only when the host knows.
 * - The Ferry Guest Book (shared birthdays): how many passengers before two share a birthday?
 * - The Weigh-House Slate (order of operations): a convention we agree on, and the story that decides.
 * TOK link: intuition and reason, certainty, assumptions, mathematics as discovered or invented.
 */
export function rng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pickOf = <T>(list: T[], r: () => number): T => list[Math.floor(r() * list.length)];

// ---------------------------------------------------------------- Dov's Three Doors

export interface DoorRound { prize: number; opened: number | null }

/** Where the lantern is in round `n` of a run (the same seed always gives the same rounds). */
export function doorPrize(seed: number, n: number): number {
  return Math.floor(rng(seed * 101 + n + 1)() * 3);
}

/**
 * Which door Dov opens after the player picks. If Dov knows, he opens an empty door that the player
 * did not pick. If he has forgotten, he opens either other door at random, and may show the lantern.
 */
export function pellOpens(prize: number, pick: number, knows: boolean, r: () => number): number {
  const others = [0, 1, 2].filter((d) => d !== pick);
  return pickOf(knows ? others.filter((d) => d !== prize) : others, r);
}

/** Run many rounds with both plans. Rounds where Dov shows the lantern are set aside (not counted). */
export function runDoors(n: number, seed: number, knows: boolean): { stay: number; swap: number; counted: number; setAside: number } {
  const r = rng(seed);
  let stay = 0, swap = 0, counted = 0, setAside = 0;
  for (let i = 0; i < n; i++) {
    const prize = Math.floor(r() * 3), pick = Math.floor(r() * 3);
    const opened = pellOpens(prize, pick, knows, r);
    if (opened === prize) { setAside++; continue; }
    const other = [0, 1, 2].find((d) => d !== pick && d !== opened)!;
    counted++;
    if (pick === prize) stay++;
    if (other === prize) swap++;
  }
  return { stay, swap, counted, setAside };
}

// ---------------------------------------------------------------- The Ferry Guest Book

/** Birthdays (day 0..364) of the passengers on boat `n`, in the order they sign, until two share a day. */
export function boatGuests(seed: number, n: number): number[] {
  const r = rng(seed * 977 + n + 3), seen: number[] = [];
  for (;;) {
    const d = Math.floor(r() * 365);
    seen.push(d);
    if (seen.indexOf(d) !== seen.length - 1) return seen;
  }
}

/** The chance that at least two of `k` people share a birthday (365 equally likely days). */
export function shareChance(k: number): number {
  let none = 1;
  for (let i = 0; i < k; i++) none *= (365 - i) / 365;
  return 1 - none;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export function dayName(d: number): string {
  let m = 0;
  while (d >= DAYS_IN[m]) { d -= DAYS_IN[m]; m++; }
  return `${d + 1} ${MONTHS[m]}`;
}

// ---------------------------------------------------------------- The Weigh-House Slate

/** The slate says 8 ÷ 2(2 + 2). Two careful readers, two conventions, two answers. */
export const SLATE = {
  written: '8 ÷ 2(2 + 2)',
  readers: [
    { who: 'Clerk Venn', rule: 'Left to right: division and multiplication are equal, so take them in order.', steps: ['8 ÷ 2(2 + 2)', '8 ÷ 2 × 4', '4 × 4', '16'], result: 16 },
    { who: "Hesper's apprentice Ren", rule: 'A number pressed against brackets belongs to them, so do that first.', steps: ['8 ÷ 2(2 + 2)', '8 ÷ 2(4)', '8 ÷ 8', '1'], result: 1 },
  ],
  stories: [
    { id: 'children', text: "Eight marks of the fair fund are shared between two families. Each family has two girls and two boys. How much does each child get?", meant: '8 ÷ (2 × (2 + 2))', result: 1 },
    { id: 'stall', text: 'A stall costs 8 marks for 2 days. A cloth seller stays for the 2 fair days and 2 more market days. What does she pay?', meant: '(8 ÷ 2) × (2 + 2)', result: 16 },
  ],
  /** Clear ways to write it: each gives one answer to every reader. */
  clear: ['8 ÷ (2 × (2 + 2))', '(8 ÷ 2) × (2 + 2)'],
};

/** Evaluate a fully bracketed slate line (only + − × ÷, numbers and brackets). */
export function evalClear(src: string): number {
  const t = src.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  let i = 0;
  const num = (): number => {
    if (t[i] === '(') { i++; const v = expr(); i++; return v; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i));
    if (!m) throw new Error(`Bad slate at ${i}`);
    i += m[0].length; return Number(m[0]);
  };
  const term = (): number => { let v = num(); while (t[i] === '*' || t[i] === '/') { const op = t[i++]; const w = num(); v = op === '*' ? v * w : v / w; } return v; };
  const expr = (): number => { let v = term(); while (t[i] === '+' || t[i] === '-') { const op = t[i++]; const w = term(); v = op === '+' ? v + w : v - w; } return v; };
  return expr();
}

// ---------------------------------------------------------------- Lanterns and Bones (dice, no betting)

/** One roll (1..6). A loaded die shows six with chance `six` (the other faces share the rest). */
export function roll(r: () => number, six = 1 / 6): number {
  const u = r();
  if (u < six) return 6;
  return 1 + Math.floor(((u - six) / (1 - six)) * 5);
}

/** Juno's tally book: in `n` fair rolls, what follows a run of `drought` or more rolls without a six? */
export function dueTest(n: number, seed: number, drought = 3): { after: number; sixes: number; all: number; allSixes: number } {
  const r = rng(seed);
  let run = 0, after = 0, sixes = 0, allSixes = 0;
  for (let i = 0; i < n; i++) {
    const v = roll(r);
    if (run >= drought) { after++; if (v === 6) sixes++; }
    if (v === 6) { allSixes++; run = 0; } else run++;
  }
  return { after, sixes, all: n, allSixes };
}

/** The two dice on Juno's table. One is loaded (six comes up 1 time in 3). Which one depends on the seed. */
export function diceFor(seed: number): { loaded: 0 | 1 } {
  return { loaded: rng(seed * 13 + 5)() < 0.5 ? 0 : 1 };
}
