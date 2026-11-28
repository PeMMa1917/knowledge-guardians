type Tile = [number, number, (g: CanvasRenderingContext2D) => void];
const colors: Record<string, string> = {
  i: '#273342',
  b: '#875047',
  r: '#b8564b',
  f: '#eda866',
  w: '#f4d6a7',
  a: '#6ba8a3',
  g: '#497773',
  p: '#9b7598',
  s: '#bcb5a1',
};
function tile(rows: string[]): Tile {
  return [
    Math.max(...rows.map((row) => row.length)),
    rows.length,
    (g) =>
      rows.forEach((row, y) =>
        Array.from(row).forEach((c, x) => {
          if (colors[c]) {
            g.fillStyle = colors[c];
            g.fillRect(x, y, 1, 1);
          }
        }),
      ),
  ];
}
export const riverArt: Record<string, Tile> = {
  'rivernames.oven': tile([
    '.....iiiiii.....',
    '...ibbffbbbi....',
    '..ibbrbbrbbbi...',
    '.ibrrbbrbbrbbi..',
    '.ibbiwwwwibibi..',
    '.ibriffffiibri..',
    '.ibbiiwwiiiibi..',
    '.ibbbiiiiibbbi..',
    '..iiiiiiiiiii...',
    '...ggaaaagg.....',
    '..gg..ag..gg....',
  ]),
  'rivernames.shutter': tile([
    '..iiiiiiiiiii...',
    '..iwrbbbrbbri...',
    '..ibrrbrbrbri...',
    '..iirbiiwibbi...',
    '..ibrbiwiibbi...',
    '..ibrrbrbrbri...',
    '..iwwwwwwwwwi...',
    '..iiiiiiiiiii...',
    '...iss..issi....',
    '...iii..iiii....',
  ]),
  'rivernames.threads': tile([
    '..iiiiiii.......',
    '.ibaaaggbi......',
    '.iwgggaawi......',
    '..iiiiiiiii.....',
    '..ifwwwwbiib....',
    '...iiggibi..b...',
    '....iaai....b...',
    '...iawwai...b...',
    '....iaai...b....',
    '.....ii...bw....',
    '.........bbb....',
  ]),
  'rivernames.sack': tile([
    '......iii.......',
    '.....ibbbi......',
    '....iwwwwbi.....',
    '.....ifffi......',
    '....ibwwbbi.....',
    '...ibwwwbbbi....',
    '..ibwriwrwbbi...',
    '..ibwrwrrwbbi...',
    '..ibbwwwwwbbi...',
    '...ibbbbbbbi....',
    '....iiiiiii.....',
  ]),
  'rivernames.skate': tile([
    '.......a........',
    '......apa.......',
    '.....aaawa......',
    '..iaaaiawaai....',
    '.iaawwwwwwaai...',
    '..iaggggggii....',
    '....iiaaii......',
    '......ag..aa....',
    '.......aaaa.....',
  ]),
};
