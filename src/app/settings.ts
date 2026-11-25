/**
 * Player settings (accessibility and comfort, spec 21.6, 21.7, 16.2).
 * Stored in localStorage. These are per-device conveniences, not campaign data.
 */
export interface Settings {
  textScale: number;          // 1, 1.25, 1.5
  reducedMotion: boolean;
  reducedEffects: boolean;    // lighting, bloom, particles
  musicVolume: number;        // 0..1
  sfxVolume: number;          // 0..1
  guidePrompts: boolean;      // unsolicited Lumen prompts
  highContrast: boolean;
  dyslexiaSpacing: boolean;
  /** Calm mode (spec 93.3): events warn first and can be delayed. Nothing is ever timed. */
  calmMode: boolean;
  /** Smart glossary (spec 47.10): key words in dialogue can be tapped for a plain explanation. */
  glossary: boolean;
}

const KEY = 'kg.settings';

export const DEFAULTS: Settings = {
  textScale: 1, reducedMotion: false, reducedEffects: false, musicVolume: 0.5, sfxVolume: 0.7,
  guidePrompts: true, highContrast: false, dyslexiaSpacing: false, calmMode: false, glossary: true,
};

export function loadSettings(): Settings {
  let s = { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) s = { ...s, ...JSON.parse(raw) };
  } catch { /* storage blocked: use defaults */ }
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
}
