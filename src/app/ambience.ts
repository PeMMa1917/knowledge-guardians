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

/** The Glimmermoth's soft shimmer (a Loreling): three quick high notes going up. */
export function shimmer(volume: number): void {
  const a = audio(); if (!a || volume <= 0.01) return;
  const t = a.currentTime + 0.01, v = Math.min(1, volume) * 0.02;
  [1567.98, 1975.53, 2349.32].forEach((f, i) => tone(a, f, t + i * 0.07, 0.5, v));
}

/** A distant town bell at dusk: two low, slow strikes with a long ring. */
export function bell(volume: number): void {
  const a = audio(); if (!a || volume <= 0.01) return;
  const t = a.currentTime + 0.01, v = Math.min(1, volume) * 0.035;
  for (const k of [0, 1.6]) { tone(a, 392, t + k, 3.2, v); tone(a, 784 * 1.01, t + k, 1.6, v * 0.35); tone(a, 196, t + k, 2.4, v * 0.5, 'triangle'); }
}

/** A soft rain shower: filtered noise that fades in and out. Call with `on` false to stop it. */
let rainNode: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
export function rain(on: boolean, volume: number): void {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  if (!on || volume <= 0.01) {
    if (rainNode) { const r = rainNode; rainNode = null; r.gain.gain.cancelScheduledValues(t); r.gain.gain.setValueAtTime(r.gain.gain.value, t); r.gain.gain.linearRampToValueAtTime(0, t + 3); r.src.stop(t + 3.1); }
    return;
  }
  const target = Math.min(1, volume) * 0.05;
  if (rainNode) { rainNode.gain.gain.setTargetAtTime(target, t, 0.5); return; }
  const len = a.sampleRate * 2;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  // Pink-ish noise with a few brighter drops.
  let b = 0;
  for (let i = 0; i < len; i++) { b = 0.97 * b + 0.03 * (Math.random() * 2 - 1); d[i] = b * 3 + (Math.random() < 0.0009 ? (Math.random() - 0.5) * 0.8 : 0); }
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = a.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 2400;
  const gain = a.createGain(); gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(target, t + 4);
  src.connect(bp); bp.connect(gain); gain.connect(a.destination); src.start(t);
  rainNode = { src, gain };
}
