/**
 * The Sketch Relay (chapter 7 signature game, C-004). A message passes from tower to tower by drawings
 * only. Each copyist leaves out the least bold mark. The harbour reads what is left. Shared keys painted
 * on every tower (up to two) change how marks are read, or how bold one is. Pure rules, no DOM.
 */
import data from '../content/sketch-relay.json';

export interface Part { id: string; name: string; bold: number; reads: string }
export type KeyId = 'arrow' | 'rope' | 'lightning';
export type Fate = 'through' | 'partly' | 'lost' | 'reversed';

export const MESSAGE = data.message;
export const PICK = data.pick;
export const COPYISTS = data.copyists;
export const PARTS = data.parts as Part[];
export const KEYS = data.keys as { id: KeyId; text: string; line: string }[];
export const TRUST = data.trust as { id: string; text: string; reply: string }[];

const part = (id: string): Part => PARTS.find((p) => p.id === id)!;
/** How bold a mark is under a key: the painted rope sign is as bold as the lightning. */
export const boldness = (id: string, keys: KeyId[]): number => (keys.includes('rope') && id === 'hand' ? 5 : part(id).bold);

/** Each copyist leaves out the least bold mark (on a tie, the one drawn last). Returns what each tower drew. */
export function relay(chosen: string[], keys: KeyId[]): string[][] {
  const stages = [chosen];
  let now = [...chosen];
  for (let i = 0; i < COPYISTS.length && now.length > 1; i++) {
    const weakest = now.reduce((w, id, j) => (boldness(id, keys) <= boldness(now[w], keys) ? j : w), 0);
    now = now.filter((_, j) => j !== weakest);
    stages.push(now);
  }
  return stages;
}

/** What got through of the three parts of the message: the storm, the west, the boats. */
export function reading(left: string[], keys: KeyId[]): { storm: Fate; west: Fate; boats: Fate } {
  const has = (id: string) => left.includes(id);
  const storm: Fate = has('lightning') ? 'through' : has('cloud') || has('sun') ? 'partly' : 'lost';
  const west: Fate = !has('arrow') ? 'lost' : keys.includes('arrow') ? 'through' : 'reversed';
  const boats: Fate = (has('hand') && (has('boat') || keys.includes('rope'))) || (keys.includes('lightning') && has('lightning')) ? 'through'
    : has('hand') || has('boat') ? 'partly' : 'lost';
  return { storm, west, boats };
}

/** The harbour's words, built from what is left. */
export function harbourReads(left: string[], keys: KeyId[]): string {
  const r = reading(left, keys);
  const words = [
    { through: 'A storm.', partly: 'Bad weather.' }[r.storm as 'through' | 'partly'],
    { through: 'It comes from the west.', reversed: 'Go east!' }[r.west as 'through' | 'reversed'],
    { through: 'Bring the boats in.', partly: 'Something about the boats.' }[r.boats as 'through' | 'partly'],
  ].filter(Boolean);
  return words.length ? words.join(' ') : 'Nobody at the harbour can read it.';
}

export const allThrough = (left: string[], keys: KeyId[]): boolean => Object.values(reading(left, keys)).every((f) => f === 'through');
