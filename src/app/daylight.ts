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

/** Light reflected by the materials of each setting, in the same pixel-art palette. */
export const chapterLights: Readonly<Record<string, { material: string; tint: number }>> = {
  'WORLD-01': { material: 'blue ink and beeswax', tint: 0xc6c1f4 },
  'WORLD-02': { material: 'clay brick and forge sparks', tint: 0xf6ba93 },
  'WORLD-03': { material: 'reed and pale river silt', tint: 0xeed59c },
  'WORLD-04': { material: 'frost on the glass stores', tint: 0xb7dce6 },
  'WORLD-05': { material: 'sea glass and copper roofs', tint: 0xa8d5d7 },
  'WORLD-06': { material: 'fern backs and birch bark', tint: 0xb8d79e },
  'WORLD-07': { material: 'warm brass over a banked forge', tint: 0xefb27d },
  'WORLD-08': { material: 'printer’s rouge on buff paper', tint: 0xe8b7af },
  'WORLD-09': { material: 'deep water and bleached sailcloth', tint: 0xa7bfdc },
  'WORLD-10': { material: 'plum velvet and footlights', tint: 0xe2afd1 },
  'WORLD-11': { material: 'quince peel in a canvas stall', tint: 0xe7d291 },
  'WORLD-12': { material: 'willow leaves over green water', tint: 0xaed5bc },
  'WORLD-13': { material: 'slate wheels and silvered tin', tint: 0xbec8dc },
  'WORLD-14': { material: 'brown vellum and mulberry ink', tint: 0xd8bacb },
  'WORLD-15': { material: 'linen charts and a chalk landing', tint: 0xc8dba9 },
  'WORLD-16': { material: 'old gold in the hour dial', tint: 0xe8c09a },
};

export function chapterTint(world: string, base: number): number {
  const light = chapterLights[world];
  return light ? mix(base, light.tint, .32) : base;
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
