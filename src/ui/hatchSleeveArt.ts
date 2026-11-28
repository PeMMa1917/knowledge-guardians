type Tile = [number, number, (g: CanvasRenderingContext2D) => void];
const tones: Record<string, string> = {
  k: '#302a3e',
  w: '#855b48',
  l: '#c39367',
  f: '#eecf88',
  c: '#7baa9f',
  p: '#f2e4ba',
  d: '#595168',
};
function drawing(rows: string[]): Tile {
  return [
    16,
    16,
    (g) =>
      rows.forEach((r, y) =>
        [...r].forEach((v, x) => {
          if (tones[v]) {
            g.fillStyle = tones[v];
            g.fillRect(x, y, 1, 1);
          }
        }),
      ),
  ];
}
export const hatchArt: Record<string, Tile> = {
  'hatch.cricket': drawing([
    '                ',
    '                ',
    '          k  k  ',
    '         f  f   ',
    '   kkk  ffkf    ',
    '   kwlfflfck    ',
    '   kwlffffkk    ',
    '   kwllkklk     ',
    ' kkkkkkkkkkkkk  ',
    ' kwllllllllllk  ',
    ' kwllwwwwwwwlk  ',
    ' kwlwwlllllllk  ',
    ' kwwwllwlwwwlk  ',
    ' kwllllllllllk  ',
    ' kkkkkkkkkkkkk  ',
    '                ',
  ]),
  'hatch.sleeve': drawing([
    '                ',
    '       kkk      ',
    '    kkklplk     ',
    '  kklpplcckk    ',
    '  klppplccklk   ',
    '  klplppkklpk   ',
    '  klpplppplpk   ',
    '  klppplplppk   ',
    '  klppdddpppk   ',
    '  klppkccklpk   ',
    '  klpplccklpk   ',
    '  klplpkkplpk   ',
    '  klppppplkk    ',
    '  klllkkk       ',
    '   kkk          ',
    '                ',
  ]),
};
