type Image = [number, number, (g: CanvasRenderingContext2D) => void];
const ink: Record<string, string> = {
  i: '#29233b',
  o: '#80534b',
  y: '#edbc75',
  t: '#7eaba6',
  r: '#c4767a',
  p: '#f3dfae',
  n: '#52506f',
};
function tile(rows: string[]): Image {
  return [
    16,
    16,
    (g) =>
      rows.forEach((r, y) =>
        [...r].forEach((v, x) => {
          if (ink[v]) {
            g.fillStyle = ink[v];
            g.fillRect(x, y, 1, 1);
          }
        }),
      ),
  ];
}
export const secondInkArt: Record<string, Image> = {
  'secondink.moth': tile([
    '................',
    '..ii.......ii...',
    '.iyyi..ii.iyyi..',
    '.iyoyiitiiroyi..',
    '..iyypiityyyi...',
    '...iyyiityyi....',
    '....iritti......',
    '.....iitti......',
    '..ippittittppi..',
    '.ipppittittpppi.',
    '.ipppiiiiiiyppi.',
    '.iiiiiiiiiiiiii.',
    '..iooooooooooi..',
    '..ioi......ioi..',
    '..iii......iii..',
  ]),
  'secondink.rail': tile([
    '...ii......ii...',
    '..ittyyyyyyti...',
    '..itipppppiti...',
    '..itiopopitti...',
    '..itipppppiti...',
    '..itiopoopiti...',
    '..itipppppiti...',
    '..ittiiiiitti...',
    '..itt......ti...',
    '..itt......ti...',
    '..itt......ti...',
    '.iittii..iittii.',
  ]),
  'secondink.tray': tile([
    '................',
    '........ii......',
    '.....i..i.......',
    '.....i....i.....',
    '....iyyyyyyi....',
    '....itpppptii...',
    '.....itttti.....',
    '..iooooooooooi..',
    '.iyyyyyyyyyyyyi.',
    '..ioooooooooi...',
    '...iio....oii...',
    '...iri....iri...',
    '...iii....iii...',
  ]),
  'secondink.seat': tile([
    '..........ii....',
    '.........iyyi...',
    '.......iipyyi...',
    '....iiiyyppyi...',
    '....iyyyyyyi....',
    '....iyo...yi....',
    '....iyo...yi....',
    '....iyoyyyyi....',
    '...iyyyyyyyi....',
    '..ipppppppyi....',
    '..iyyyyyyyoi....',
    '..ioi....ioi....',
    '..ioi....ioi....',
    '..iii....iii....',
  ]),
};
