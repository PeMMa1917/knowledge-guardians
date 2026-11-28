type Picture = [number, number, (g: CanvasRenderingContext2D) => void];
const palette: Record<string, string> = {
  i: '#231f36',
  w: '#794859',
  m: '#bd6c69',
  g: '#f2c67d',
  h: '#ffe7aa',
  t: '#8cd0ca',
  b: '#397282',
  s: '#c1c2af',
  k: '#434153',
};
function block(lines: string[]): Picture {
  return [
    Math.max(...lines.map((l) => l.length)),
    lines.length,
    (g) =>
      lines.forEach((row, y) =>
        Array.from(row).forEach((ch, x) => {
          if (palette[ch]) {
            g.fillStyle = palette[ch];
            g.fillRect(x, y, 1, 1);
          }
        }),
      ),
  ];
}
export const radioArt: Record<string, Picture> = {
  'wire.receiver': block([
    '.........t........',
    '.........t....s...',
    '.....iii.t...s....',
    '....igggitiiii....',
    '..iiiiiiiiiiiii...',
    '.iwgggggggggggwi..',
    '.iwgibttthttigwi..',
    '.iwgibbttgttigwi..',
    '.iwgggggggggggwi..',
    '.iwigwiigwiimmi..',
    '.iwigwiigwiimmi..',
    '.iwmmmmmmmmmmwi..',
    '..iiiiiiiiiiii...',
    '...kk......kk....',
  ]),
  'wire.horn': block([
    '..ii.............',
    '.ihgi............',
    '.ihggi...........',
    '.ihgggi..........',
    '.iggggwi.........',
    '.iiggggwi........',
    '..iiggwwmmi......',
    '....iiiwmmwi.....',
    '.......iiwggi....',
    '.........iggi....',
    '........igggi....',
    '......iigggggii..',
    '.....iwwwwwwwwi..',
    '......iiiiiiii...',
  ]),
  'wire.reel': block([
    '...iiiii...iiiii..',
    '..isssssi.isssssi.',
    '.isikkisiisikkisi.',
    '.isksksiiisksksii.',
    '.isikkisiisikkisi.',
    '..isssssi.isssssi.',
    '...iiiii...iiiii..',
    '...iwgggggggggwi..',
    '...iwggwwwwgggwi..',
    '...iwmmmmmwwmmwi..',
    '....iiiiiiiiiii...',
  ]),
  'wire.stair': block([
    '.......iiiiii....',
    '.......iggggwi...',
    '......iiiiiiii...',
    '......igggggwi...',
    '.....iiiiiiiii...',
    '.....iggggggwi...',
    '....iiiiiiiiii...',
    '....igggggggwi...',
    '...iiiiiiiiiii...',
    '...iggggggggwi...',
    '..iiiiiiiiiiii...',
  ]),
  'wire.moth': block([
    '.....s......s....',
    '......s....s.....',
    '..iii..i..i..iii.',
    '.ittti..ii..ittbi',
    '.ibtthiiggihttbbi',
    '..ibbtiggggitbbi.',
    '...ibiiggggiibi..',
    '.....iiggggii....',
    '......igggi......',
    '.......iwi.......',
    '........i........',
  ]),
};
