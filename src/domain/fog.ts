/**
 * Fog of war for the map panel: the map starts clouded and clears where the player has walked.
 * The map is split into 4 x 4 tile chunks; each chunk is one bit in a hex string (flag `fog.<mapId>`).
 * Pure rules, no DOM.
 */
export const CHUNK = 4;

const dims = (w: number, h: number) => ({ cw: Math.ceil(w / CHUNK), ch: Math.ceil(h / CHUNK) });

function bits(hex: unknown, n: number): number[] {
  const s = typeof hex === 'string' && /^[0-9a-f]*$/.test(hex) ? hex : '';
  const out: number[] = [];
  for (let i = 0; i < Math.ceil(n / 4); i++) { const v = parseInt(s[i] ?? '0', 16); for (let b = 0; b < 4; b++) out.push((v >> b) & 1); }
  return out.slice(0, n);
}
function hexOf(b: number[]): string {
  let s = '';
  for (let i = 0; i < b.length; i += 4) s += ((b[i] | 0) | ((b[i + 1] | 0) << 1) | ((b[i + 2] | 0) << 2) | ((b[i + 3] | 0) << 3)).toString(16);
  return s;
}

/** Reveal the chunk at tile (x, y) and the chunks next to it. Returns the same string if nothing changed. */
export function revealAround(hex: unknown, w: number, h: number, x: number, y: number): string {
  const { cw, ch } = dims(w, h);
  const b = bits(hex, cw * ch);
  const cx = Math.floor(x / CHUNK), cy = Math.floor(y / CHUNK);
  for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) if (i >= 0 && j >= 0 && i < cw && j < ch) b[j * cw + i] = 1;
  return hexOf(b);
}

export function isRevealed(hex: unknown, w: number, h: number, x: number, y: number): boolean {
  const { cw, ch } = dims(w, h);
  const cx = Math.floor(x / CHUNK), cy = Math.floor(y / CHUNK);
  if (cx < 0 || cy < 0 || cx >= cw || cy >= ch) return false;
  return bits(hex, cw * ch)[cy * cw + cx] === 1;
}

/** Share of the map revealed, 0 to 1. */
export function explored(hex: unknown, w: number, h: number): number {
  const { cw, ch } = dims(w, h);
  const b = bits(hex, cw * ch);
  return b.filter(Boolean).length / b.length;
}

/** Number of chunks in the same grid used by the displayed fog. */
export function mapChunkCount(w: number, h: number): number {
  const { cw, ch } = dims(w, h);
  return cw * ch;
}

/** Keep every already revealed chunk and count only newly revealed chunks. */
export function mergeExploration(previous: unknown, current: unknown, w: number, h: number): { hex: string; added: number } {
  const count = mapChunkCount(w, h);
  const oldBits = bits(previous, count);
  const nextBits = bits(current, count);
  let added = 0;
  const merged = oldBits.map((bit, index) => {
    if (!bit && nextBits[index]) added++;
    return bit | nextBits[index];
  });
  return { hex: hexOf(merged), added };
}
