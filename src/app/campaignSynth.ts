/** Deterministic stereo synthesis of the original campaign scores. No browser or file access. */
import { arrangeScore, type ScoreLoop, type ScoreVoice, type WorldScore } from '../domain/campaignScore';

interface Voice {
  harmonics: readonly number[];
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  gain: number;
  ring?: number;
}

const VOICES: Record<ScoreVoice, Voice> = {
  glass: { harmonics: [1, 0.08, 0.14, 0.06], attack: 0.009, decay: 0.23, sustain: 0.26, release: 0.58, gain: 0.16, ring: 2.63 },
  felt: { harmonics: [1, 0.18, 0.06, 0.03], attack: 0.016, decay: 0.29, sustain: 0.24, release: 0.25, gain: 0.18 },
  pluck: { harmonics: [1, 0.32, 0.21, 0.11, 0.07], attack: 0.008, decay: 0.16, sustain: 0.17, release: 0.31, gain: 0.15 },
  reed: { harmonics: [1, 0.07, 0.09, 0.02, 0.04], attack: 0.11, decay: 0.3, sustain: 0.52, release: 0.23, gain: 0.13 },
  strings: { harmonics: [1, 0.29, 0.13, 0.08, 0.04], attack: 0.22, decay: 0.39, sustain: 0.64, release: 0.46, gain: 0.12 },
  wood: { harmonics: [1, 0.08, 0.17, 0.06], attack: 0.008, decay: 0.092, sustain: 0.12, release: 0.17, gain: 0.19 },
  bell: { harmonics: [1, 0.14, 0.04, 0.11], attack: 0.008, decay: 0.17, sustain: 0.22, release: 0.49, gain: 0.14, ring: 2.81 },
  bass: { harmonics: [1, 0.22, 0.08], attack: 0.1, decay: 0.32, sustain: 0.60, release: 0.32, gain: 0.11 },
};

const SAMPLE_RATE = 22050;
const TABLE_LENGTH = 2048;
const TABLE_MASK = TABLE_LENGTH - 1;
const SINE = new Float32Array(TABLE_LENGTH);
for (let index = 0; index < TABLE_LENGTH; index++) SINE[index] = Math.sin(2 * Math.PI * index / TABLE_LENGTH);

const tables = new Map<ScoreVoice, Float32Array>();
function waveFor(voice: ScoreVoice): Float32Array {
  const previous = tables.get(voice);
  if (previous) return previous;
  const levels = VOICES[voice].harmonics;
  const scale = 1 / levels.reduce((sum, level) => sum + level, 0);
  const wave = new Float32Array(TABLE_LENGTH);
  for (let index = 0; index < TABLE_LENGTH; index++) {
    for (let partial = 0; partial < levels.length; partial++) {
      wave[index] += SINE[(index * (partial + 1)) & TABLE_MASK] * levels[partial] * scale;
    }
  }
  tables.set(voice, wave);
  return wave;
}

export interface CampaignPcm {
  sampleRate: number;
  left: Float32Array<ArrayBuffer>;
  right: Float32Array<ArrayBuffer>;
}

/** The shorter attacks and longer releases are part of the timbres, including the loop boundary. */
export function renderCampaignScore(score: WorldScore): CampaignPcm {
  return renderScoreLoop(arrangeScore(score));
}

export function renderScoreLoop(loop: ScoreLoop): CampaignPcm {
  const length = Math.round(loop.duration * SAMPLE_RATE);
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  for (const note of loop.notes) {
    const voice = VOICES[note.voice];
    const wave = waveFor(note.voice);
    const start = Math.round(note.at * SAMPLE_RATE);
    const hold = Math.round(note.duration * SAMPLE_RATE);
    const attack = Math.min(hold, Math.round(voice.attack * SAMPLE_RATE));
    const release = Math.round(voice.release * SAMPLE_RATE);
    const count = Math.min(hold + release, length - start);
    const step = (440 * Math.pow(2, (note.midi - 69) / 12)) * TABLE_LENGTH / SAMPLE_RATE;
    const ringingStep = step * (voice.ring ?? 0);
    const decay = Math.exp(-1 / (voice.decay * SAMPLE_RATE));
    const ringDecay = Math.exp(-1 / (0.13 * SAMPLE_RATE));
    const amplitude = note.strength * voice.gain;
    const leftGain = amplitude * Math.sqrt((1 - note.pan) / 2);
    const rightGain = amplitude * Math.sqrt((1 + note.pan) / 2);
    let tint = 1;
    let ring = voice.ring ? 0.19 : 0;
    let phase = note.midi * 17;
    let bellPhase = phase * 0.49;

    for (let frame = 0; frame < count; frame++) {
      const entry = frame < attack ? frame / attack : 1;
      const tail = frame > hold ? Math.max(0, 1 - (frame - hold) / release) : 1;
      const envelope = entry * tail * tail * (voice.sustain + (1 - voice.sustain) * tint);
      const sample = (wave[phase & TABLE_MASK] + SINE[bellPhase & TABLE_MASK] * ring) * envelope;
      left[start + frame] += sample * leftGain;
      right[start + frame] += sample * rightGain;
      phase += step;
      bellPhase += ringingStep;
      if (frame >= attack) tint *= decay;
      ring *= ringDecay;
    }
  }

  // Bring the tail to zero below the next downbeat. The same shape applies to every loop.
  const fadeIn = Math.round(0.025 * SAMPLE_RATE);
  const fadeOut = Math.round(0.21 * SAMPLE_RATE);
  for (let index = 0; index < fadeIn; index++) {
    left[index] *= index / fadeIn;
    right[index] *= index / fadeIn;
  }
  for (let offset = 0; offset < fadeOut; offset++) {
    const index = length - 1 - offset;
    left[index] *= offset / fadeOut;
    right[index] *= offset / fadeOut;
  }
  return { sampleRate: SAMPLE_RATE, left, right };
}
