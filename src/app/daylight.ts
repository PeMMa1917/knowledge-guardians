/**
 * Day and evening in town maps (visual and sound only; nothing in play depends on it).
 * One full day takes CYCLE seconds of play. Pure colour maths, so it is tested.
 */
export const CYCLE = 900; // 15 minutes

/** Key colours for the multiply grade, from morning (0) round to the next morning (1). */
const KEYS: { at: number; tint: number; light: number; name: string }[] = [
  { at: 0.0, tint: 0xffe8c4, light: 0.55, name: 'morning' },
  { at: 0.35, tint: 0xfff0d8, light: 0.5, name: 'midday' },
  { at: 0.55, tint: 0xffc890, light: 0.65, name: 'golden hour' },
  { at: 0.68, tint: 0xb894c8, light: 0.85, name: 'dusk' },
  { at: 0.8, tint: 0x7c82c4, light: 1.0, name: 'night' },
  { at: 0.92, tint: 0x8a80b8, light: 0.9, name: 'night' },
  { at: 1.0, tint: 0xffe8c4, light: 0.55, name: 'morning' },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function mix(c1: number, c2: number, t: number): number {
  const r = Math.round(lerp((c1 >> 16) & 255, (c2 >> 16) & 255, t));
  const g = Math.round(lerp((c1 >> 8) & 255, (c2 >> 8) & 255, t));
  const b = Math.round(lerp(c1 & 255, c2 & 255, t));
  return (r << 16) | (g << 8) | b;
}

/** The sky at a phase of the day (0 to 1): grade colour, light-pool strength, and how dark it is (0 day, 1 night). */
export function skyAt(phase: number): { tint: number; light: number; night: number; name: string } {
  const p = ((phase % 1) + 1) % 1;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].at <= p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  const light = lerp(a.light, b.light, t);
  return { tint: mix(a.tint, b.tint, t), light, night: Math.max(0, Math.min(1, (light - 0.55) / 0.45)), name: t < 0.5 ? a.name : b.name };
}

/** A short rain shower now and then (90 s in every 20 min of town time). Fixed, not random, so it is fair and testable. */
export const RAIN_EVERY = 1200, RAIN_FOR = 90, RAIN_AT = 520;
export function raining(clock: number): boolean {
  const t = ((clock % RAIN_EVERY) + RAIN_EVERY) % RAIN_EVERY;
  return t >= RAIN_AT && t < RAIN_AT + RAIN_FOR;
}
