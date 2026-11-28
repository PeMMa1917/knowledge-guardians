// The creature is a silhouette made from folded receipts. Its raised hat and the
// running edge separate when the player turns the brass lamp.
type Art = [number, number, (g: CanvasRenderingContext2D) => void];
const colors: Record<string, string> = {
  i: '#30283b', v: '#615572', s: '#937d8f', p: '#dbc5aa', w: '#ffe2af',
  b: '#70534c', c: '#bb814d', g: '#efbd69', y: '#ffe5a1',
};
function image(rows: string[]): Art {
  return [16, 16, (g) => rows.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === '.') return;
    g.fillStyle = colors[cell];
    g.fillRect(x, y, 1, 1);
  }))];
}
export const UNDERPAN_ART: Record<string, Art> = {
  'underpan.runner': image([
    '................','.....ppp........','....pwwwp.......','.....ipppp......',
    '......vi........','....ppvv..p.....','...pviiivwp.....','..pviiivp.......',
    '....vvip........','....piip........','...pv..ip.......','..pv....vp......',
    '.pp.....pp......','................',
  ]),
  'underpan.shadow': image([
    '................','......vv........','....vvii........','.....vii..vv....',
    '....vvii.vii....','.....viivii..v..','.....iiiiii.vv..','......iiiiivv...',
    '.......iiiii....','.......viiii....','........viii....','.........vii....',
  ]),
  'underpan.coin': image([
    '................','................','................','.......bc.......',
    '......bgyc......','......bgyc......','......bgyc......','......bgyc......',
    '......bgyc......','.......cc.......','....s.vvii......','..vviiiii.......',
  ]),
  'underpan.grate': image([
    '................','................','..iiiiiiiiiiii..','..vccgggggccvi..',
    '..viiiviiviiiv..','..viiiviiviiiv..','..vbbbbbbbbbbv..','..viiiviiviiiv..',
    '..viiiviiviiiv..','..vccgggggccvi..','..viiiiiiiiiiv..','................',
  ]),
};
