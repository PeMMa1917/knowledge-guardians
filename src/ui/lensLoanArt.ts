type Picture = [number, number, (g: CanvasRenderingContext2D) => void];
const ink = '#453346',
  brass = '#dcaa65',
  gold = '#f4db96',
  berry = '#8f516a',
  fold = '#643e59',
  blue = '#72acbb',
  pale = '#cae1d7',
  wood = '#92664d';
function pixels(g: CanvasRenderingContext2D, rows: string[]) {
  const palette: Record<string, string> = {
    i: ink,
    b: brass,
    g: gold,
    r: berry,
    f: fold,
    t: blue,
    p: pale,
    w: wood,
  };
  rows.forEach((row, y) =>
    Array.from(row).forEach((c, x) => {
      if (c !== '.') {
        g.fillStyle = palette[c];
        g.fillRect(x, y, 1, 1);
      }
    }),
  );
}
export const lensArt: Record<string, Picture> = {
  'optic.drawer': [
    20,
    18,
    (g) =>
      pixels(g, [
        '....................',
        '...iiiiiiiiiiiiii...',
        '..ibbbbbbbbbbbbbbwi.',
        '..ibfffffffffffrfwi.',
        '..ibftppfffbgbfrfwi.',
        '..ibftpfffffbffrfwi.',
        '..ibfffffffffffrfwi.',
        '..iwwwwwwwwwwwwwwwi.',
        '.ibggggggggggggggbwi',
        'ibrrrrrrrrrrrrrrrbwi',
        'ibripptirrribbibrbwi',
        'ibritttirrribbibrbwi',
        'ibrririrrrrririrrbwi',
        'ibrrrrrrrrrrrrrrrbwi',
        '.iwwwwwibgbiwwwwwii.',
        '..iwwwwwiiiwwwwwii..',
        '...iiiiiiiiiiiiii...',
      ]),
  ],
  'optic.curtain': [
    22,
    20,
    (g) =>
      pixels(g, [
        '.iiiiiiiiiiiiiiiiiiii.',
        '.ibggggggggggggggggbi.',
        '..ifrrffrrffrrffrrfi..',
        '..ifrrffrrffrrffrrfi..',
        '..ifrrffgrffrrffrrfi..',
        '..ifrrfggrffrrffrrfi..',
        '..ifrrgfrgffrrffrrfi..',
        '..ifrgffrrgfrrggrrfi..',
        '..ifgrffrrrgrgffrrfi..',
        '..ifrrffrrfggrffrrfi..',
        '..ifrrffrrffrgfrrrfi..',
        '..ifrrffrrffrrgggrfi..',
        '..ifrrffrrffrrffrgfi..',
        '..ifrrffrrffrrffrrgi..',
        '..ifrrffrrffrrffrrfi..',
        '..iifrrfiifrrfiifrii..',
        '...iiffi..iffi..ifi...',
        '.....ii....ii....i....',
      ]),
  ],
  'optic.frame': [
    18,
    17,
    (g) =>
      pixels(g, [
        '..................',
        '...iiiiiiiiiiii...',
        '..ibggggggggggbi..',
        '..ibtpttttttptbi..',
        '..ibttpttttpttbi..',
        '..ibtttpttptttbi..',
        '..ibttttptttttbi..',
        '..ibttpttpttttbi..',
        '..ibtpttttptttbi..',
        '..ibpttttttpttbi..',
        '..ibggggggggggbi..',
        '...iiiiibbiiiii...',
        '.......ibbi.......',
        '.....iiibbiii.....',
        '....ibggggggbi....',
        '.....iiiiiiii.....',
      ]),
  ],
  'optic.steps': [
    18,
    18,
    (g) =>
      pixels(g, [
        '..................',
        '.......iii........',
        '......ibtbi.......',
        '......ipgpi.......',
        '.......igi........',
        '....iiiiiiiiii....',
        '...ibbbbbbbbbbi...',
        '...iwffffffffwi...',
        '...iwfffffttfwi...',
        '...iwfffffttfwi...',
        '...iwffffbbwwwi...',
        '...iwffbbbwwwii...',
        '...iwbbbwwwii.....',
        '...ibbbwwwii......',
        '..ibbbwwiii.......',
        '.ibbgwwiii........',
        '..iiiiiii.........',
      ]),
  ],
};
