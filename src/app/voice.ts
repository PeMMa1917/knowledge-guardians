/**
 * Talk sounds (spec 35.1 "voice barks", spec 21 audio): short synthesised blips
 * while a character speaks, so each person has a recognisable voice. Made in code
 * with the Web Audio API (original, no files). Sound is never needed to play:
 * every line is also text, and talk sounds can be turned off in Settings.
 */
export interface Voice { pitch: number; wave: OscillatorType; spread: number; rate: number }

/** Player voice choices. 'none' is silent. */
export const PLAYER_VOICES: { id: string; label: string; v: Voice | null }[] = [
  { id: 'none', label: 'No voice', v: null },
  { id: 'low', label: 'Low and calm', v: { pitch: 150, wave: 'triangle', spread: 0.15, rate: 70 } },
  { id: 'mid', label: 'Warm', v: { pitch: 220, wave: 'triangle', spread: 0.25, rate: 62 } },
  { id: 'high', label: 'Bright', v: { pitch: 320, wave: 'sine', spread: 0.3, rate: 55 } },
  { id: 'chirp', label: 'Quick and chirpy', v: { pitch: 420, wave: 'square', spread: 0.35, rate: 45 } },
];

const WAVES: OscillatorType[] = ['triangle', 'sine', 'square'];

/** A stable voice for a character id (the same person always sounds the same). */
export function voiceFor(id: string): Voice {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  if (id === 'lumen') return { pitch: 660, wave: 'sine', spread: 0.4, rate: 48 };
  return { pitch: 130 + (h % 230), wave: WAVES[(h >>> 8) % WAVES.length], spread: 0.12 + ((h >>> 12) % 25) / 100, rate: 50 + ((h >>> 16) % 25) };
}

/** Blip times for a line: one blip per short word part, at most `max` blips. Pure, for tests. */
export function blipPlan(text: string, rate: number, max = 18): { at: number; up: number }[] {
  const parts = text.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean).flatMap((w) => w.match(/.{1,3}/gu) ?? []);
  const out: { at: number; up: number }[] = [];
  let t = 0;
  for (let i = 0; i < parts.length && out.length < max; i++) {
    const c = parts[i].toLowerCase().charCodeAt(0);
    out.push({ at: t, up: ((c * 7) % 11) / 10 - 0.5 });
    t += rate + (parts[i].length - 1) * 8;
  }
  return out;
}

let ac: AudioContext | null = null;
function audio(): AudioContext | null {
  try {
    ac ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ac.state === 'suspended') void ac.resume();
    return ac;
  } catch { return null; }
}

let stopAt = 0;
/** Play the talk sound for a line. Stops any earlier line. */
export function babble(text: string, v: Voice | null, volume: number): void {
  if (!v || volume <= 0) return;
  const a = audio(); if (!a) return;
  const start = a.currentTime + 0.02;
  stopAt = start;
  const gainAll = a.createGain();
  gainAll.gain.value = Math.min(1, volume) * 0.08;
  gainAll.connect(a.destination);
  for (const b of blipPlan(text, v.rate)) {
    const t = start + b.at / 1000;
    const o = a.createOscillator(); const g = a.createGain();
    o.type = v.wave;
    o.frequency.setValueAtTime(v.pitch * (1 + b.up * v.spread), t);
    o.frequency.exponentialRampToValueAtTime(v.pitch * (1 + b.up * v.spread) * 0.92, t + 0.05);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g); g.connect(gainAll);
    o.start(t); o.stop(t + 0.07);
  }
  void stopAt;
}

/** A short "hm!" bark for the player (when choosing or greeting). */
export function bark(v: Voice | null, volume: number): void {
  babble('hm ah', v, volume);
}
