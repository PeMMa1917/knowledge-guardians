/**
 * Key remapping (spec 21.6, accessibility). Players can choose their own letter
 * keys. The arrow keys, Space, Enter, Esc and number keys always keep their jobs,
 * so a player can never lock themselves out. Pure rules, no DOM.
 */
export type Action = 'up' | 'left' | 'down' | 'right' | 'interact' | 'hint' | 'journal' | 'portfolio' | 'bag' | 'emote' | 'map';

export type KeyMap = Record<Action, string>;

export const ACTIONS: { id: Action; label: string }[] = [
  { id: 'up', label: 'Walk up' },
  { id: 'left', label: 'Walk left' },
  { id: 'down', label: 'Walk down' },
  { id: 'right', label: 'Walk right' },
  { id: 'interact', label: 'Talk, inspect, use' },
  { id: 'hint', label: 'Hint from Lumen' },
  { id: 'journal', label: 'Journal' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'bag', label: 'Bag' },
  { id: 'emote', label: 'Emotes (wave, cheer, think)' },
  { id: 'map', label: 'Folding map' },
];

export const DEFAULT_KEYS: KeyMap = { up: 'W', left: 'A', down: 'S', right: 'D', interact: 'E', hint: 'H', journal: 'J', portfolio: 'P', bag: 'I', emote: 'G', map: 'M' };

/** Ready-made layouts: AZERTY keyboards, and a left-hand layout one key to the right. */
export const PRESETS: { id: string; label: string; keys: KeyMap }[] = [
  { id: 'qwerty', label: 'W A S D (QWERTY)', keys: DEFAULT_KEYS },
  { id: 'azerty', label: 'Z Q S D (AZERTY)', keys: { ...DEFAULT_KEYS, up: 'Z', left: 'Q', down: 'S', right: 'D' } },
  { id: 'esdf', label: 'E S D F', keys: { ...DEFAULT_KEYS, up: 'E', left: 'S', down: 'D', right: 'F', interact: 'R' } },
];

/** Actions added after the first version (a stored map may not have them yet). */
const LATER: Action[] = ['emote', 'map'];

/** Only single letters can be mapped. Other keys have fixed jobs. */
export function mappableKey(key: string): string | null {
  return /^[a-z]$/i.test(key) ? key.toUpperCase() : null;
}

/** Give `action` the key `key`. If another action had that key, the two swap, so no key does two jobs. */
export function assignKey(map: KeyMap, action: Action, key: string): KeyMap {
  const k = mappableKey(key);
  if (!k) return map;
  const next = { ...map };
  const clash = ACTIONS.find((a) => a.id !== action && map[a.id] === k);
  if (clash) next[clash.id] = map[action];
  next[action] = k;
  return next;
}

/** Repair a stored map: fill missing actions and drop clashes or bad keys by using the defaults. */
export function normaliseKeys(raw: Partial<KeyMap> | undefined): KeyMap {
  const out = { ...DEFAULT_KEYS };
  if (!raw) return out;
  for (const a of ACTIONS) {
    const k = mappableKey(String(raw[a.id] ?? ''));
    if (k) out[a.id] = k;
  }
  // An action added in a later version keeps the player's own keys: it takes a free letter.
  for (const a of ACTIONS.filter((x) => LATER.includes(x.id))) {
    if (mappableKey(String(raw[a.id] ?? ''))) continue;
    if (ACTIONS.some((b) => b.id !== a.id && out[b.id] === out[a.id])) {
      const used = new Set(ACTIONS.filter((b) => b.id !== a.id).map((b) => out[b.id]));
      out[a.id] = 'GTKLMNOUVXYBCFQRZ'.split('').find((l) => !used.has(l)) ?? out[a.id];
    }
  }
  const seen = new Set<string>();
  for (const a of ACTIONS) { if (seen.has(out[a.id])) return { ...DEFAULT_KEYS }; seen.add(out[a.id]); }
  return out;
}

/** The action for a key press, if any. */
export function actionFor(map: KeyMap, key: string): Action | null {
  const k = key.toUpperCase();
  return ACTIONS.find((a) => map[a.id] === k)?.id ?? null;
}
