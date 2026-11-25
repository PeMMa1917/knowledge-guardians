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
  // Plant dyes from Wenna's barter boat (src/domain/trade.ts). Shown in the picker once bought; the base colours are always free.
  madder: ['b5452f', '86311f', '5e2215'], woad: ['4a6a9a', '34507a', '233857'], weld: ['c9b843', '978a2f', '6a601f'], walnut: ['8a6240', '67482e', '47321f'],
};
/** Outfit colours that are sold as dyes (cosmetic only). */
export const DYE_KEYS = ['madder', 'woad', 'weld', 'walnut'];
export const TROUSERS: Record<string, [string, string]> = {
  indigo: ['65659b', '5586b9'], brown: ['6a4834', '8a6448'], charcoal: ['3d3d46', '5a5a66'], olive: ['5b6332', '7a8448'],
  sand: ['a08a5e', 'c4ad7c'], wine: ['6b2b3a', '8f3f52'],
};
export const ACCENT: Record<string, string> = {
  gold: 'f2d27a', cyan: '9fe8ff', rose: 'ff9db0', white: 'f4f0e6', green: '8fe08f', red: 'e04848',
};
export const ACCESSORIES = ['none', 'headband', 'scarf', 'both'] as const;
export type Accessory = typeof ACCESSORIES[number];
/** Hair styles. 'covered' is a head scarf in the accessory colour. */
export const STYLES = ['short', 'long', 'bun', 'curls', 'covered'] as const;
export const GLASSES = ['none', 'darkframes', 'lightframes'] as const;
/** Mobility aids: shown as a normal part of the character, with no effect on play. */
export const AIDS = ['none', 'cane', 'wheelchair'] as const;
export type Style = typeof STYLES[number];
export type Glasses = typeof GLASSES[number];
export type Aid = typeof AIDS[number];

export interface LookChoice {
  skin: string; hair: string; outfit: string; trousers: string; accessory: Accessory; accent: string;
  style?: Style; glasses?: Glasses; aid?: Aid;
}

/** Plain-language names for the colour options (for screen readers and labels). */
export const LABELS: Record<string, string> = {
  pale: 'pale', light: 'light', warm: 'warm', olive: 'olive', tan: 'tan', brown: 'brown', deep: 'deep brown', dark: 'very dark',
  black: 'black', auburn: 'auburn', blonde: 'blonde', grey: 'grey', white: 'white', blue: 'blue', pink: 'pink', green: 'green',
  teal: 'teal', violet: 'violet', gold: 'gold', slate: 'slate', orange: 'orange', red: 'red', plum: 'plum', cream: 'cream',
  madder: 'madder red', woad: 'woad blue', weld: 'weld yellow', walnut: 'walnut brown',
  indigo: 'indigo', charcoal: 'charcoal', sand: 'sand', wine: 'wine', cyan: 'sky blue', rose: 'rose',
  none: 'none', headband: 'headband', scarf: 'scarf', both: 'headband and scarf',
  short: 'short', long: 'long', bun: 'bun', curls: 'full curls', covered: 'head scarf',
  darkframes: 'glasses, dark frames', lightframes: 'glasses, light frames', cane: 'walking cane', wheelchair: 'wheelchair',
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
  const base = `custom:${c.skin}.${c.hair}.${c.outfit}.${c.trousers}.${c.accessory}.${c.accent}`;
  const style = c.style ?? 'short', glasses = c.glasses ?? 'none', aid = c.aid ?? 'none';
  // Older looks have six parts; keep them short when the new parts are the defaults.
  return style === 'short' && glasses === 'none' && aid === 'none' ? base : `${base}.${style}.${glasses}.${aid}`;
}

/** Read a look string. Unknown parts fall back to the first ready-made look. */
export function decodeLook(look: string): LookChoice {
  if (PRESET_LOOKS[look]) return { style: 'short', glasses: 'none', aid: 'none', ...PRESET_LOOKS[look] };
  const d = PRESET_LOOKS['player-a'];
  if (!look.startsWith('custom:')) return { style: 'short', glasses: 'none', aid: 'none', ...d };
  const [skin, hair, outfit, trousers, accessory, accent, style, glasses, aid] = look.slice(7).split('.');
  const one = <T extends string>(list: readonly T[], v: string | undefined): T => (list as readonly string[]).includes(v ?? '') ? v as T : list[0];
  return {
    skin: SKIN[skin] ? skin : d.skin, hair: HAIR[hair] ? hair : d.hair, outfit: OUTFIT[outfit] ? outfit : d.outfit,
    trousers: TROUSERS[trousers] ? trousers : d.trousers,
    accessory: one(ACCESSORIES, accessory),
    accent: ACCENT[accent] ? accent : d.accent,
    style: one(STYLES, style), glasses: one(GLASSES, glasses), aid: one(AIDS, aid),
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
  const stitches = threads.filter((t) => /^[0-9a-f]{6}$/i.test(t));
  if (stitches.length) embroider(data, w, h, role, stitches);
  features(data, w, h, role, c);
  const crest = threads.find((t) => /^crest[0-9a-f]{12}$/i.test(t));
  if (crest) crestPatch(data, w, h, role, crest.slice(5, 11), crest.slice(11, 17));
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

/**
 * Hair styles, glasses and mobility aids (spec 35.1 inclusive avatars). Painted on the
 * four walk frames of each direction row (down, right, up, left). Positions are relative
 * to the top of the hair in each frame, so they follow the walk bob.
 */
function features(data: Uint8ClampedArray, w: number, h: number, role: (string | undefined)[], c: LookChoice): void {
  const style = c.style ?? 'short', glasses = c.glasses ?? 'none', aid = c.aid ?? 'none';
  if (style === 'short' && glasses === 'none' && aid === 'none') return;
  const [hairD, hairL] = HAIR[c.hair];
  const cloth = ACCENT[c.accent];
  const clothD = rgb(cloth).map((v) => Math.round(v * 0.72).toString(16).padStart(2, '0')).join('');
  const lens = glasses === 'lightframes' ? 'f2e6b8' : '1a1426';
  for (let row = 0; row < 4 && (row + 1) * 32 <= h; row++) {
    const dir = (['down', 'right', 'up', 'left'] as const)[row];
    let base = -1;
    for (let f = 0; f < 4 && (f + 1) * 16 <= w; f++) {
      const fx = f * 16, fy = row * 32;
      const idx = (x: number, y: number) => (fy + y) * w + fx + x;
      const at = (x: number, y: number) => (x < 0 || x > 15 || y < 0 || y > 31 ? undefined : role[idx(x, y)]);
      const empty = (x: number, y: number) => x >= 0 && x <= 15 && y >= 0 && y <= 31 && !data[idx(x, y) * 4 + 3];
      const put = (x: number, y: number, hex: string, a = 255) => {
        if (x < 0 || x > 15 || y < 0 || y > 31) return;
        const o = idx(x, y) * 4, col = rgb(hex);
        data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2]; data[o + 3] = a;
      };
      const wipe = (x: number, y: number) => { if (x >= 0 && x <= 15 && y >= 0 && y <= 31) data[idx(x, y) * 4 + 3] = 0; };
      const isDark = (x: number, y: number) => { const o = idx(x, y) * 4; return key(data[o], data[o + 1], data[o + 2]) === key(...rgb(hairD)); };
      let y0 = -1;
      for (let y = 0; y < 12 && y0 < 0; y++) for (let x = 0; x < 16; x++) if (at(x, y) === 'hair') { y0 = y; break; }
      if (y0 < 0) continue;
      if (base < 0) base = y0;
      const B = base;
      const mx = (x: number) => (dir === 'left' ? 15 - x : x); // mirror side views
      const headHair = (x: number, y: number) => at(x, y) === 'hair' && y < y0 + (dir === 'up' ? 12 : 11);

      // Mobility aid first: a wheelchair replaces the legs.
      if (aid === 'wheelchair') {
        for (let y = B + 17; y < 32; y++) for (let x = 0; x < 16; x++) wipe(x, y);
        const frame = '3a3352', rim = 'b4b4bc', tyre = '1a1426', seat = '5d6b7a';
        const [trL, trD] = TROUSERS[c.trousers];
        for (let x = 2; x <= 13; x++) put(x, B + 22, '000000', 70);
        if (dir === 'down' || dir === 'up') {
          for (let y = B + 12; y <= B + 21; y++) for (const x of [1, 2, 13, 14]) put(x, y, (x === 2 || x === 13) && (y + f) % 3 === 0 ? rim : tyre);
          if (dir === 'down') {
            for (let x = 4; x <= 11; x++) put(x, B + 17, trL);
            for (const x of [5, 6, 9, 10]) { put(x, B + 18, trD); put(x, B + 19, trD); put(x, B + 20, '3d2a20'); }
            for (let x = 4; x <= 11; x++) put(x, B + 21, frame);
            for (const x of [3, 12]) { put(x, B + 16, frame); put(x, B + 17, frame); }
          } else {
            for (let y = B + 12; y <= B + 17; y++) for (let x = 4; x <= 11; x++) put(x, y, y === B + 12 ? frame : seat);
            for (const x of [3, 12]) { put(x, B + 10, frame); put(x, B + 11, frame); put(x, B + 12, frame); }
            for (let x = 4; x <= 11; x++) put(x, B + 18, frame);
          }
        } else {
          const cx = 6, cy = B + 18, a = (f * Math.PI) / 4;
          for (let y = cy - 5; y <= cy + 5; y++) for (let x = cx - 5; x <= cx + 5; x++) {
            const d = Math.hypot(x - cx, y - cy);
            if (d >= 3.5 && d <= 4.6) put(mx(x), y, tyre);
            else if (d < 3.5 && d > 0.6) {
              const ang = Math.atan2(y - cy, x - cx);
              const spoke = [a, a + Math.PI / 2, a + Math.PI, a + (3 * Math.PI) / 2].some((s) => Math.abs(Math.atan2(Math.sin(ang - s), Math.cos(ang - s))) < 0.32);
              if (spoke) put(mx(x), y, rim);
            }
          }
          put(mx(cx), cy, rim);
          for (let y = B + 9; y <= B + 16; y++) if (empty(mx(3), y)) put(mx(3), y, frame);
          put(mx(2), B + 9, frame);
          for (let x = 7; x <= 11; x++) put(mx(x), B + 17, trL);
          for (let y = B + 18; y <= B + 20; y++) put(mx(11), y, trD);
          put(mx(12), B + 21, '3d2a20'); put(mx(11), B + 21, '3d2a20');
          for (let x = 10; x <= 13; x++) put(mx(x), B + 22, frame);
        }
      } else if (aid === 'cane') {
        const wood = '6a4834', tip = 'c9a24a';
        const cx = dir === 'down' ? 14 : dir === 'up' ? 1 : mx(12);
        for (let y = y0 + 14; y <= y0 + 20; y++) put(cx, y, wood);
        put(cx, y0 + 21, tip);
        put(dir === 'left' ? cx + 1 : dir === 'up' ? cx + 1 : cx - 1, y0 + 14, wood);
      }

      // Hair style.
      if (style === 'long') {
        if (dir === 'down') for (let y = y0 + 6; y <= y0 + 13; y++) { put(1, y, hairD); put(2, y, hairL); put(13, y, hairL); put(14, y, hairD); }
        else if (dir === 'up') for (let y = y0 + 11; y <= y0 + 14; y++) for (let x = 3; x <= 12; x++) put(x, y, x === 3 || x === 12 || y === y0 + 14 ? hairD : hairL);
        else for (let y = y0 + 9; y <= y0 + 14; y++) for (let x = 2; x <= 5; x++) put(mx(x), y, x === 2 || y === y0 + 14 ? hairD : hairL);
      } else if (style === 'bun') {
        const xs = dir === 'down' || dir === 'up' ? [6, 7, 8, 9] : [3, 4, 5, 6].map(mx);
        const yb = dir === 'down' || dir === 'up' ? y0 - 1 : y0;
        xs.forEach((x, i) => { put(x, yb, i === 0 || i === 3 ? hairD : hairL); if (i === 1 || i === 2) put(x, yb - 1, hairD); });
      } else if (style === 'curls') {
        const lim = dir === 'down' ? y0 + 7 : y0 + 10;
        const add: [number, number][] = [];
        for (let y = 0; y < lim; y++) for (let x = 0; x < 16; x++) if (headHair(x, y)) {
          for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0]]) if (empty(x + dx, y + dy)) add.push([x + dx, y + dy]);
        }
        add.forEach(([x, y]) => put(x, y, hairD));
        for (let y = 0; y < lim; y++) for (let x = 0; x < 16; x++) if (headHair(x, y) && (x + y * 2) % 4 === 0) put(x, y, hairL);
      } else if (style === 'covered') {
        for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) if (headHair(x, y)) put(x, y, isDark(x, y) ? clothD : cloth);
        if (dir === 'down') {
          for (let y = y0 + 5; y <= y0 + 12; y++) { put(1, y, clothD); put(2, y, cloth); put(13, y, cloth); put(14, y, clothD); }
          for (let x = 3; x <= 12; x++) if (at(x, y0 + 12) === 'skin' || at(x, y0 + 11) === 'skin' && (x <= 4 || x >= 11)) { put(x, y0 + 12, cloth); if (x <= 4 || x >= 11) put(x, y0 + 11, cloth); }
        } else if (dir === 'up') {
          for (let y = y0 + 10; y <= y0 + 13; y++) for (let x = 3; x <= 12; x++) put(x, y, x === 3 || x === 12 ? clothD : cloth);
        } else {
          for (let y = y0 + 8; y <= y0 + 13; y++) for (let x = 2; x <= 6; x++) put(mx(x), y, x === 2 ? clothD : cloth);
          for (let y = y0 + 11; y <= y0 + 12; y++) for (let x = 3; x <= 9; x++) if (at(mx(x), y) === 'skin') put(mx(x), y, cloth);
        }
      }

      // Glasses last, on top of the face.
      if (glasses !== 'none' && dir !== 'up') {
        const e = y0 + 8;
        if (dir === 'down') {
          for (let x = 4; x <= 11; x++) put(x, e - 1, lens);
          for (const x of [4, 6, 9, 11]) put(x, e, lens);
        } else {
          for (const x of [7, 8, 9, 10, 11]) put(mx(x), e - 1, lens);
          for (const x of [9, 11]) put(mx(x), e, lens);
        }
      }
    }
  }
}

/** The crest patch: a 4 x 3 shield on the back of the cloak (up-facing frames only). */
function crestPatch(data: Uint8ClampedArray, w: number, h: number, role: (string | undefined)[], field: string, ink: string): void {
  if (h < 96) return;
  const fy = 64; // the third row of frames faces up (the back)
  for (let f = 0; f < 4 && (f + 1) * 16 <= w; f++) {
    const fx = f * 16;
    let y0 = -1;
    for (let y = 0; y < 12 && y0 < 0; y++) for (let x = 0; x < 16; x++) if (role[(fy + y) * w + fx + x] === 'hair') { y0 = y; break; }
    if (y0 < 0) continue;
    const put = (x: number, y: number, hex: string) => { const o = ((fy + y) * w + fx + x) * 4, col = rgb(hex); data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2]; data[o + 3] = 255; };
    for (let x = 6; x <= 9; x++) put(x, y0 + 12, '2a2238');
    for (let x = 6; x <= 9; x++) put(x, y0 + 13, x === 6 || x === 9 ? '2a2238' : field);
    put(7, y0 + 14, field); put(8, y0 + 14, field);
    put(7, y0 + 13, ink);
  }
}
