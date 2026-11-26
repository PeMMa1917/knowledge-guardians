import type { CueBeat } from '../domain/cueWorkshop';

let output: AudioContext | undefined;

/** Short original test tones that correspond exactly to the timing sheet. */
export function playCueTrial(beats: readonly CueBeat[], volume: number, current: () => boolean) {
  if (volume <= 0 || typeof AudioContext === 'undefined') return;
  try {
    output ??= new AudioContext();
    const audio = output;
    void audio.resume().then(() => {
      if (!current()) return;
      for (const [index, beat] of beats.entries()) {
        if (beat === 'rest') continue;
        setTimeout(() => {
          if (!current() || audio.state !== 'running') return;
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          const time = audio.currentTime;
          oscillator.frequency.value = beat === 'cue' ? 555 : 138;
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(volume * (beat === 'cue' ? 0.08 : 0.045), time + 0.02);
          gain.gain.linearRampToValueAtTime(0, time + 0.15);
          oscillator.connect(gain).connect(audio.destination);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(time);
          oscillator.stop(time + 0.15);
        }, index * 230);
      }
    }).catch(() => undefined);
  } catch { /* The timing sheet functions independently of audio. */ }
}
