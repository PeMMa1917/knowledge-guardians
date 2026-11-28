type Picture = [number, number, (g: CanvasRenderingContext2D) => void];
const palette: Record<string, string> = {
  i: '#28293b',
  b: '#694e56',
  w: '#a37664',
  t: '#7ba4ae',
  g: '#a1b282',
  h: '#f0c782',
  l: '#f6e1ad',
  r: '#b66570',
  s: '#b9b4a6',
};
function tile(lines: string[]): Picture {
  return [
    Math.max(...lines.map((l) => l.length)),
    lines.length,
    (g) =>
      lines.forEach((line, y) =>
        Array.from(line).forEach((v, x) => {
          if (palette[v]) {
            g.fillStyle = palette[v];
            g.fillRect(x, y, 1, 1);
          }
        }),
      ),
  ];
}
export const houseArt: Record<string, Picture> = {
  'middlehouse.threshold': tile([
    '.....iiiii......',
    '....iwwhwwi.....',
    '...iwhhbhwwi....',
    '..iwwbbbbbwwi...',
    '..iwbttbrrbwi...',
    '..iwbttbrrbwi...',
    '..iwbttbrrbwi...',
    '..iwbbbibbwwi...',
    '..iwhhwbwhlwi...',
    '..iwwwwbbwwwi...',
    '..iwbhwbwwhwi...',
    '..iwwwwbbwwwi...',
    '..iiiiiiiiiii...',
    '.ihhhllhllhhhi..',
    '.iiiiiiiiiiiii..',
  ]),
  'middlehouse.floor': tile([
    '................',
    '..iiiiiiiiiiii..',
    '..itttibbihwhi..',
    '..ittbibhihbhi..',
    '..ibbbibbihhhi..',
    '..iiiiiiiiiiii..',
    '..ihhhiggittti..',
    '..ihbhigbittbi..',
    '..ihwhiggibbbi..',
    '..iiiiiiiiiiii..',
    '..ibbbihhiiggi..',
    '..ibhbihbihggi..',
    '..ibbbihhiigbi..',
    '..iiiiiiiiiiii..',
  ]),
  'middlehouse.kettle': tile([
    '.......iii......',
    '......ihhhi.....',
    '....iiiiiiiii...',
    '...issti..itti..',
    '..issti....itti.',
    '..isti..ii..iti.',
    '...iiiiihhiiii..',
    '.....ithhhti....',
    '...iitthhhtti...',
    '..ititttwtttti..',
    '..iiiitwhtttii..',
    '......iiiiiii...',
    '...iiiiiiiiiii..',
    '....iswi.iswi...',
    '.....ii...ii....',
  ]),
  'middlehouse.lamp': tile([
    '......iiii......',
    '.....iw..wi.....',
    '.....iw..wi.....',
    '....iwwwwwwi....',
    '....iihhhiii....',
    '...itthlhhtti...',
    '...ithlllhtti...',
    '...ithlhlhhti...',
    '...ithlllhtti...',
    '....iihhhiii....',
    '....ibwwwbbi....',
    '....iiiiiiii....',
  ]),
  'middlehouse.seats': tile([
    '................',
    '.....iiiii......',
    '.....ihhhi......',
    '.....irwri......',
    '.....irwri......',
    '.....ihhhi......',
    '.....iwbwi......',
    '...iiiiiiiii....',
    '..ihhrrrrhhhi...',
    '..iiiiiiiiiii...',
    '...ib.....bi....',
    '...ib.....bi....',
    '...ii.....ii....',
  ]),
};
