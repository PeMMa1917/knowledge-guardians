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

/** Play a list of notes (the music box). `voice`: 'box' (bell-like), 'marimba' or 'flute'. Returns a stop function. */
export function playNotes(notes: { f: number; at: number; beats: number }[], beat: number, voice: 'box' | 'marimba' | 'flute', volume: number): () => void {
  const a = audio(); if (!a || volume <= 0.01) return () => {};
  const out = a.createGain(); out.gain.value = 1; out.connect(a.destination);
  const t0 = a.currentTime + 0.05, v = Math.min(1, volume) * 0.05;
  for (const n of notes) {
    const at = t0 + n.at * beat, len = n.beats * beat;
    const o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(out);
    if (voice === 'flute') {
      o.type = 'sine'; o.frequency.setValueAtTime(n.f, at);
      const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 5; lg.gain.value = n.f * 0.006; lfo.connect(lg); lg.connect(o.frequency); lfo.start(at); lfo.stop(at + len + 0.1);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v * 0.9, at + 0.06); g.gain.setValueAtTime(v * 0.8, at + len * 0.8); g.gain.linearRampToValueAtTime(0, at + len);
      o.start(at); o.stop(at + len + 0.05);
    } else {
      o.type = voice === 'marimba' ? 'triangle' : 'sine'; o.frequency.setValueAtTime(n.f, at);
      const ring = voice === 'marimba' ? 0.35 : Math.max(0.8, len * 1.6);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0005, at + ring);
      o.start(at); o.stop(at + ring + 0.05);
      if (voice === 'box') tone(a, n.f * 4.02, at, 0.25, v * 0.15);
    }
  }
  return () => { try { out.gain.setValueAtTime(0, a.currentTime); out.disconnect(); } catch { /* already stopped */ } };
}

/**
 * A hand clap and, after `echoDelay` seconds, its echo (quieter and duller), for the echo bridge.
 * Returns the audio clock time of the clap, or null when sound is off.
 */
export function clapEcho(volume: number, echoDelay: number | null): number | null {
  const a = audio(); if (!a || volume <= 0.01) return null;
  const t = a.currentTime + 0.03, v = Math.min(1, volume) * 0.5;
  const burst = (at: number, gain: number, cutoff: number) => {
    const len = Math.floor(a.sampleRate * 0.08);
    const buf = a.createBuffer(1, len, a.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = cutoff; f.Q.value = 0.8;
    const g = a.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start(at);
  };
  burst(t, v, 1800);
  if (echoDelay !== null) burst(t + echoDelay, v * 0.35, 1100);
  return t;
}
/** The audio clock now (seconds), or null. */
export function audioNow(): number | null { return audio()?.currentTime ?? null; }

/**
 * A Shepard scale for the bell stair: each step is a soft bell made of the same note in
 * several octaves (loud in the middle, quiet at the ends). Returns a stop function.
 */
export function playShepard(stepsParts: { f: number; amp: number }[][], stepDur: number, volume: number): () => void {
  const a = audio(); if (!a || volume <= 0.01) return () => {};
  const out = a.createGain(); out.gain.value = 1; out.connect(a.destination);
  const t0 = a.currentTime + 0.05, v = Math.min(1, volume) * 0.06;
  stepsParts.forEach((parts, i) => {
    const at = t0 + i * stepDur;
    for (const p of parts) {
      if (p.amp < 0.02) continue;
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(p.f, at);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v * p.amp, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, at + stepDur * 1.6);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + stepDur * 1.7);
    }
  });
  return () => { try { out.gain.setValueAtTime(0, a.currentTime); out.disconnect(); } catch { /* already stopped */ } };
}
