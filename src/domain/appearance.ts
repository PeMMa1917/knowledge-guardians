/**
 * Player appearance (spec 35.1): skin, hair, outfit, trousers and small accessories.
 * Every option is available from the start. The look is stored as a short string in
 * `player.look`, so no save schema change is needed:
 *   "player-a"                      a ready-made look (a sheet on disk), or
 *   "custom:<skin>.<hair>.<outfit>.<trousers>.<accessory>.<accent>"
 * The recolour works on raw RGBA pixels, so it runs in the browser and in tests.
 * Base sheet: ArMM1998 character.png (CC0); see tools/make_character_variants.py.
 */
export const SKIN: Record<string, [string, string]> = {
  pale: ['f3e2cc', 'cdb497'], light: ['e8d4b2', 'bfa787'], warm: ['d9a77a', 'b07f55'], olive: ['c49a6c', '9a7550'],
  tan: ['b98157', '8e5e3b'], brown: ['946240', '6e452b'], deep: ['7a4e33', '5a3624'], dark: ['5a3a28', '3f281b'],
};
export const HAIR: Record<string, [string, string]> = {
  black: ['1f1a24', '3a3342'], brown: ['432e27', '6a4834'], auburn: ['6b2a1a', 'a4462a'], blonde: ['a8742a', 'e0b450'],
  grey: ['6e6e78', 'b4b4bc'], white: ['9a9aa6', 'e6e6ee'], blue: ['1f3a7a', '3f6fd4'], pink: ['8a2a5a', 'd46a9a'], green: ['1f5a3a', '3f9a5a'],
};
export const OUTFIT: Record<string, [string, string, string]> = {
  teal: ['2f9e9a', '1f6e6b', '154a48'], violet: ['7d5bc4', '56408a', '3a2b5e'], gold: ['d4a23a', '9c7426', '6b4f19'],
  green: ['4f9a3f', '35692b', '244a1d'], blue: ['3f6fc4', '2c4e8a', '1e365e'], plum: ['9a3f73', '6b2b50', '4a1d37'],
  slate: ['5d6b7a', '414b56', '2d343c'], orange: ['d46a2a', '9c4c1d', '6b3313'], red: ['c43c3c', '882e2e', '681c1c'],
  cream: ['e6dcc0', 'b8ad90', '8a8068'],
};
export const TROUSERS: Record<string, [string, string]> = {
  indigo: ['65659b', '5586b9'], brown: ['6a4834', '8a6448'], charcoal: ['3d3d46', '5a5a66'], olive: ['5b6332', '7a8448'],
  sand: ['a08a5e', 'c4ad7c'], wine: ['6b2b3a', '8f3f52'],
};
export const ACCENT: Record<string, string> = {
  gold: 'f2d27a', cyan: '9fe8ff', rose: 'ff9db0', white: 'f4f0e6', green: '8fe08f', red: 'e04848',
};
export const ACCESSORIES = ['none', 'headband', 'scarf', 'both'] as const;
export type Accessory = typeof ACCESSORIES[number];

export interface LookChoice { skin: string; hair: string; outfit: string; trousers: string; accessory: Accessory; accent: string }

/** Plain-language names for the colour options (for screen readers and labels). */
export const LABELS: Record<string, string> = {
  pale: 'pale', light: 'light', warm: 'warm', olive: 'olive', tan: 'tan', brown: 'brown', deep: 'deep brown', dark: 'very dark',
  black: 'black', auburn: 'auburn', blonde: 'blonde', grey: 'grey', white: 'white', blue: 'blue', pink: 'pink', green: 'green',
  teal: 'teal', violet: 'violet', gold: 'gold', slate: 'slate', orange: 'orange', red: 'red', plum: 'plum', cream: 'cream',
  indigo: 'indigo', charcoal: 'charcoal', sand: 'sand', wine: 'wine', cyan: 'sky blue', rose: 'rose',
  none: 'none', headband: 'headband', scarf: 'scarf', both: 'headband and scarf',
};

/** The four ready-made looks, as choices (same colours as the sheets on disk). */
export const PRESET_LOOKS: Record<string, LookChoice> = {
  'player-a': { skin: 'light', hair: 'brown', outfit: 'teal', trousers: 'indigo', accessory: 'none', accent: 'gold' },
  'player-b': { skin: 'deep', hair: 'black', outfit: 'violet', trousers: 'charcoal', accessory: 'none', accent: 'gold' },
  'player-c': { skin: 'warm', hair: 'auburn', outfit: 'gold', trousers: 'brown', accessory: 'none', accent: 'gold' },
  'player-d': { skin: 'tan', hair: 'blonde', outfit: 'blue', trousers: 'olive', accessory: 'none', accent: 'gold' },
};

/**
 * Cloak embroidery (spec 32.6): one stitched thread on the outfit hem for each world arc
 * the player has resolved. It shows progress in the world, not in a menu.
 */
export const ARC_THREADS: { objective: string; colour: string; name: string }[] = [
  { objective: 'm01.o7.portal', colour: 'f2d27a', name: 'Gold thread: The Three Firsts, in the Nexus' },
  { objective: 'm02.o8.ise', colour: 'ff8a3a', name: 'Ember thread: The Label on the Blade, in Emberford' },
];

export function cloakThreads(objectivesDone: string[]): typeof ARC_THREADS {
  return ARC_THREADS.filter((t) => objectivesDone.includes(t.objective));
}

export function encodeLook(c: LookChoice): string {
  return `custom:${c.skin}.${c.hair}.${c.outfit}.${c.trousers}.${c.accessory}.${c.accent}`;
}

/** Read a look string. Unknown parts fall back to the first ready-made look. */
export function decodeLook(look: string): LookChoice {
  if (PRESET_LOOKS[look]) return { ...PRESET_LOOKS[look] };
  const d = PRESET_LOOKS['player-a'];
  if (!look.startsWith('custom:')) return { ...d };
  const [skin, hair, outfit, trousers, accessory, accent] = look.slice(7).split('.');
  return {
    skin: SKIN[skin] ? skin : d.skin, hair: HAIR[hair] ? hair : d.hair, outfit: OUTFIT[outfit] ? outfit : d.outfit,
    trousers: TROUSERS[trousers] ? trousers : d.trousers,
    accessory: (ACCESSORIES as readonly string[]).includes(accessory) ? accessory as Accessory : 'none',
    accent: ACCENT[accent] ? accent : d.accent,
  };
}

export function isValidLook(look: string): boolean {
  return !!PRESET_LOOKS[look] || (look.startsWith('custom:') && encodeLook(decodeLook(look)) === look);
}

// Source palette of the base sheet.
const SRC = {
  hair: ['432e27', '6a4834'], skin: ['e8d4b2', 'bfa787'], outfit: ['c43c3c', '882e2e', '681c1c'], trousers: ['65659b', '5586b9'],
};
const rgb = (h: string): [number, number, number] => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
const key = (r: number, g: number, b: number) => (r << 16) | (g << 8) | b;

/**
 * Recolour a character sheet in place. `data` is RGBA, `w` x `h` pixels, frames are 16 x 32.
 * Accessories are painted per frame: a headband on the hair row just above the face,
 * and a scarf on the top row of the outfit.
 */
export function recolour(data: Uint8ClampedArray, w: number, h: number, c: LookChoice, threads: string[] = []): void {
  const roles = new Map<number, string>();
  const map = new Map<number, [number, number, number]>();
  const add = (src: string[], dst: string[], role: string) => src.forEach((s, i) => { const k = key(...rgb(s)); map.set(k, rgb(dst[i])); roles.set(k, role); });
  add(SRC.hair, HAIR[c.hair], 'hair');
  add(SRC.skin, SKIN[c.skin], 'skin');
  add(SRC.outfit, OUTFIT[c.outfit], 'outfit');
  add(SRC.trousers, TROUSERS[c.trousers], 'trousers');
  // Role of every pixel before recolouring, so accessories can find hair, face and outfit.
  const role = new Array<string | undefined>(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (!data[o + 3]) continue;
    const k = key(data[o], data[o + 1], data[o + 2]);
    role[i] = roles.get(k);
    const n = map.get(k);
    if (n) { data[o] = n[0]; data[o + 1] = n[1]; data[o + 2] = n[2]; }
  }
  if (threads.length) embroider(data, w, h, role, threads);
  if (c.accessory === 'none') return;
  const acc = rgb(ACCENT[c.accent]);
  const accShade = acc.map((v) => Math.round(v * 0.72)) as [number, number, number];
  const paint = (x: number, y: number, shade = false) => { const o = (y * w + x) * 4; const col = shade ? accShade : acc; data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2]; };
  const at = (x: number, y: number) => role[y * w + x];
  for (let fy = 0; fy + 32 <= h; fy += 32) {
    for (let fx = 0; fx + 16 <= w; fx += 16) {
      const rows = (pred: (r: string | undefined) => boolean, from: number, to: number) => {
        for (let y = from; y < to; y++) for (let x = 0; x < 16; x++) if (pred(at(fx + x, fy + y))) return y;
        return -1;
      };
      if (c.accessory === 'headband' || c.accessory === 'both') {
        const top = rows((r) => r === 'hair', 0, 16);
        if (top >= 0) {
          const face = rows((r) => r === 'skin', top, 16);
          const y = face > top ? face - 1 : Math.min(top + 4, 15);
          for (let x = 0; x < 16; x++) if (at(fx + x, fy + y) === 'hair') paint(fx + x, fy + y);
        }
      }
      if (c.accessory === 'scarf' || c.accessory === 'both') {
        const y = rows((r) => r === 'outfit', 14, 24);
        if (y >= 0) {
          for (let x = 0; x < 16; x++) { const r = at(fx + x, fy + y); if (r === 'outfit' || r === 'skin') paint(fx + x, fy + y); }
          for (let x = 0; x < 16; x++) { const r = at(fx + x, fy + y + 1); if (r === 'outfit' && x % 3 === 0) paint(fx + x, fy + y + 1, true); }
        }
      }
    }
  }
}

/** Stitch threads on the outfit hem of every 16 x 32 frame: the lowest outfit row, then every second row above it. */
function embroider(data: Uint8ClampedArray, w: number, h: number, role: (string | undefined)[], threads: string[]): void {
  for (let fy = 0; fy + 32 <= h; fy += 32) {
    for (let fx = 0; fx + 16 <= w; fx += 16) {
      let hem = -1;
      for (let y = 30; y >= 12 && hem < 0; y--) for (let x = 0; x < 16; x++) if (role[(fy + y) * w + fx + x] === 'outfit') { hem = y; break; }
      if (hem < 0) continue;
      threads.forEach((hex, i) => {
        const y = hem - i * 2;
        const col = rgb(hex);
        for (let x = 0; x < 16; x++) {
          const k = (fy + y) * w + fx + x;
          if (role[k] !== 'outfit' || (x + i) % 2) continue;
          data[k * 4] = col[0]; data[k * 4 + 1] = col[1]; data[k * 4 + 2] = col[2];
        }
      });
    }
  }
}
