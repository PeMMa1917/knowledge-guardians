/** Brief original tones for accessible practice models. */
export function playPracticeTones(frequencies: readonly number[], volume: number) {
  if (volume <= 0 || frequencies.length === 0 || typeof AudioContext === 'undefined') return;
  let context: AudioContext;
  try { context = new AudioContext(); } catch { return; }
  const gain = context.createGain();
  const start = context.currentTime;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume * .12 / frequencies.length, start + .04);
  gain.gain.linearRampToValueAtTime(0, start + .45);
  gain.connect(context.destination);
  const tones = frequencies.map((frequency) => {
    const tone = context.createOscillator();
    tone.frequency.value = frequency;
    tone.connect(gain);
    return tone;
  });
  const close = () => { if (context.state !== 'closed') void context.close().catch(() => undefined); };
  tones.at(-1)!.onended = close;
  for (const tone of tones) {
    tone.start(start);
    tone.stop(start + .49);
  }
  void context.resume().catch(close);
}
