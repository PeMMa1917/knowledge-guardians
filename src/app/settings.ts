/**
 * Player settings (accessibility and comfort, spec 21.6, 21.7, 16.2).
 * Stored in localStorage. These are per-device conveniences, not campaign data.
 */
import { DEFAULT_KEYS, normaliseKeys, type KeyMap } from './keymap';

export interface Settings {
  textScale: number;          // 1, 1.25, 1.5
  reducedMotion: boolean;
  reducedEffects: boolean;    // lighting, bloom, particles
  musicVolume: number;        // 0..1
  sfxVolume: number;          // 0..1
  guidePrompts: boolean;      // unsolicited Lumen prompts
  /** Lumen offers help after a long time with no progress (decision X-011). The hint shows only after a click. */
  lumenOffers: boolean;
  /** Show the day streak in the Ledger (decision X-001). Off hides it; the streak is still kept. */
  showStreak: boolean;
  highContrast: boolean;
  dyslexiaSpacing: boolean;
  /** Calm mode (spec 93.3): events warn first and can be delayed. Nothing is ever timed. */
  calmMode: boolean;
  /** Zen mode (spec 47.4, C1): no turn limit in Showdowns, events always ask first, no fail states. */
  zenMode: boolean;
  /** Smart glossary (spec 47.10): key words in dialogue can be tapped for a plain explanation. */
  glossary: boolean;
  /** Read conversations aloud with the browser's own voice (spec 21, text-to-speech). Nothing is sent online by the game. */
  readAloud: boolean;
  /** Colour-safe marks: a blue/orange palette and a symbol on every good/bad result, so colour never carries meaning alone. */
  colourSafe: boolean;
  /** Talk sounds: short voice blips while characters speak (voice.ts). */
  talkSounds: boolean;
  /** Sound captions: a short text line for each sound (captions.ts). */
  captions: boolean;
  /** The player's own voice bark (voice.ts PLAYER_VOICES). */
  playerVoice: string;
  /** Interface colour theme. */
  theme: 'archive' | 'ember' | 'forest' | 'ocean' | 'dusk';
  /** Colour of Lumen's glow. */
  lumenColour: 'gold' | 'cyan' | 'rose' | 'green' | 'violet';
  /** Lumen's form (customisation): the same guide, a different shape. */
  lumenForm: 'fairy' | 'moth' | 'star' | 'wisp' | 'firefly';
  /** The player's own letter keys (see keymap.ts). */
  keys: KeyMap;
}

const KEY = 'kg.settings';

export const THEMES: { id: Settings['theme']; label: string }[] = [
  { id: 'archive', label: 'Archive night (violet and gold)' }, { id: 'ember', label: 'Ember (red and orange)' },
  { id: 'forest', label: 'Forest (green)' }, { id: 'ocean', label: 'Ocean (blue)' }, { id: 'dusk', label: 'Dusk (plum and pink)' },
];
export const LUMEN_FORMS: { id: Settings['lumenForm']; label: string }[] = [
  { id: 'fairy', label: 'Fairy' }, { id: 'moth', label: 'Moth' }, { id: 'star', label: 'Little star' }, { id: 'wisp', label: 'Wisp' }, { id: 'firefly', label: 'Firefly' },
];
/** The picture key for Lumen in the chosen form. */
export function lumenArt(s: Pick<Settings, 'lumenForm'>): string { return s.lumenForm && s.lumenForm !== 'fairy' ? `lumen.${s.lumenForm}` : 'lumen'; }
export const LUMEN_COLOURS: Record<Settings['lumenColour'], number> = { gold: 0xfff2b0, cyan: 0xb0f0ff, rose: 0xffc0d8, green: 0xc8ffc0, violet: 0xd8c0ff };

export const DEFAULTS: Settings = {
  textScale: 1, reducedMotion: false, reducedEffects: false, musicVolume: 0.5, sfxVolume: 0.7,
  guidePrompts: true, lumenOffers: true, showStreak: true, highContrast: false, dyslexiaSpacing: false, calmMode: false, zenMode: false, glossary: true, readAloud: false,
  colourSafe: false, keys: DEFAULT_KEYS, talkSounds: true, captions: false, playerVoice: 'mid', theme: 'archive', lumenColour: 'gold', lumenForm: 'fairy',
};

export function loadSettings(): Settings {
  let s = { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) s = { ...s, ...JSON.parse(raw) };
  } catch { /* storage blocked: use defaults */ }
  s.keys = normaliseKeys(s.keys);
  if (!LUMEN_FORMS.some((f) => f.id === s.lumenForm)) s.lumenForm = 'fairy';
  if (!(s.lumenColour in LUMEN_COLOURS)) s.lumenColour = 'gold';
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && !window.localStorage.getItem(KEY)) s.reducedMotion = true;
  } catch { /* ignore */ }
  return s;
}

export function saveSettings(s: Settings): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  applySettingsToDocument(s);
}

export function applySettingsToDocument(s: Settings): void {
  const r = document.documentElement;
  r.style.setProperty('--text-scale', String(s.textScale));
  r.classList.toggle('reduced-motion', s.reducedMotion);
  r.classList.toggle('high-contrast', s.highContrast);
  r.classList.toggle('dyslexia-spacing', s.dyslexiaSpacing);
  r.classList.toggle('colour-safe', s.colourSafe);
  for (const t of THEMES) r.classList.toggle(`theme-${t.id}`, s.theme === t.id && t.id !== 'archive');
}
