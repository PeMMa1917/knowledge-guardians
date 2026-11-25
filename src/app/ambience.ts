/**
 * Ambient sounds made in code (Web Audio, original, no files): the forge hammer
 * in Emberford and soft archive chimes in the Nexus. Volume follows the distance
 * to the source and the sound-effects volume. Sound is never needed to play.
 */
let ac: AudioContext | null = null;
function audio(): AudioContext | null {
  try { ac ??= new (window.AudioContext || (window as any).webkitAudioContext)(); return ac.state === 'running' ? ac : null; } catch { return null; }
}

function tone(a: AudioContext, freq: number, at: number, dur: number, vol: number, type: OscillatorType = 'sine'): void {
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0005, at + dur);
  o.connect(g); g.connect(a.destination); o.start(at); o.stop(at + dur + 0.02);
}

/** One hammer strike on an anvil: bright metal partials that ring briefly. */
export function clink(volume: number): void {
  const a = audio(); if (!a || volume <= 0.01) return;
  const t = a.currentTime + 0.01, v = Math.min(1, volume) * 0.05;
  for (const [f, d, k] of [[1320, 0.35, 1], [2710, 0.22, 0.6], [4150, 0.12, 0.35], [880, 0.08, 0.5]] as const) tone(a, f * (0.98 + Math.random() * 0.04), t, d, v * k, f === 880 ? 'triangle' : 'sine');
}

/** A soft chime (archive hall), from a pentatonic set so it never clashes with the music. */
export function chime(volume: number): void {
  const a = audio(); if (!a || volume <= 0.01) return;
  const notes = [523.25, 587.33, 659.25, 783.99, 880];
  const f = notes[Math.floor(Math.random() * notes.length)];
  const t = a.currentTime + 0.01, v = Math.min(1, volume) * 0.025;
  tone(a, f, t, 2.2, v); tone(a, f * 2, t, 1.2, v * 0.3);
}
