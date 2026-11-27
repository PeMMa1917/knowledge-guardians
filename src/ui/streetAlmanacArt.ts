type Drawing = [number, number, (g: CanvasRenderingContext2D) => void];
const palette: Record<string, string> = {
  x: '#403847',
  w: '#ad7859',
  s: '#8e959a',
  a: '#687e86',
  h: '#cbd0b9',
  p: '#ecd9aa',
  t: '#bb9a75',
  d: '#695153',
  k: '#4d6578',
  l: '#ecd885',
  b: '#79b7bb',
  r: '#d88c76',
};
const sheets: Record<string, string[]> = {
  stone: [
    '       ss             ',
    '      shhsss          ',
    '     shhhhhsas        ',
    '    ssssssshhhas      ',
    '   ssaassssssshaa     ',
    '  sssasssaaassssaa    ',
    ' ssaassssssssasssa    ',
    ' ssssssaasssssssssaa  ',
    '  ssaasssssaaassssaaa ',
    '  ssssssssssssssssaa  ',
    '    aaaaaasssaaaaaa   ',
    '       aaaaaaaaa      ',
  ],
  report: [
    '                      ',
    ' ttttttttttttttttttt  ',
    ' thppppppppppppppppt  ',
    ' tppddpdppddppdddpppt  ',
    ' tpppppppppppppppppt  ',
    ' tppdddpddppdddpppppt  ',
    ' tpppdppppppppppppppt  ',
    ' tppddppdpddppdpppppt  ',
    ' tpppppppppppppppppt  ',
    ' tppdddpdppppppppttt  ',
    ' ttttttttttttttttttt  ',
    '                      ',
  ],
  volume: [
    '                      ',
    '   ttttttt  ttttttt   ',
    '  wtppppppttpppppptw  ',
    '  wtppdpppttppdpdptw  ',
    '  wtppdpppttppdppptw  ',
    '  wtppppppttpppppptw  ',
    '  wtpdppdpttppdpdptw  ',
    '  wtppppppttpppppptw  ',
    '  wttttttttttttttttw  ',
    '  wwwwwwwwwwwwwwwwww  ',
    '           ww         ',
    '                      ',
  ],
  shell: [
    '        hh            ',
    '       hptt           ',
    '      hpttppt         ',
    '    hhptthpppt        ',
    '  hhptpphpthpppt      ',
    ' hppthphppxxpptpt     ',
    ' hpptptppxxxxhhptt    ',
    '  tthpptttxxhtptt d   ',
    '    ttttthppthtt  d   ',
    '        ttttptt  d    ',
    '             d dd     ',
    '              d       ',
  ],
  awning: [
    '      w       w       ',
    '  wwwwwwwwwwwwwwwww   ',
    '  rrppprrrppprrrpp    ',
    ' rrppprrrppprrrppp    ',
    ' rppprrrppprrrpppr    ',
    ' rr  rr  rr  rr  r    ',
    '   w bbkkkbbl  w      ',
    '   w bbkkkbbl  w      ',
    '   w lllkllll  w      ',
    '   w kkkkkkkk  w      ',
    '   w bbbkkbbb  w      ',
    '   w wwwwwwww  w      ',
  ],
  strip: [
    '                      ',
    '                      ',
    ' wwwwwwwwwwwwwwwwwww  ',
    ' wpppppppppppppppppw  ',
    ' wpbbpddpbbpddpbbppw  ',
    ' wpbbpddpbbpddpbbppw  ',
    ' wpppppppppppppppppw  ',
    ' wwwwwwwwwwwwwwwwwww  ',
    '   w             w    ',
    '   w             w    ',
    '   w             w    ',
    '                      ',
  ],
};
export const almanacArt: Record<string, Drawing> = {};
export const almanacLargeArt: Record<string, string> = {};
for (const [name, rows] of Object.entries(sheets)) {
  function paint(g: CanvasRenderingContext2D) {
    rows.forEach((row, y) =>
      Array.from(row).forEach((pixel, x) => {
        if (palette[pixel]) {
          g.fillStyle = palette[pixel];
          g.fillRect(x, y, 1, 1);
        }
      }),
    );
  }
  const key = 'street.' + name;
  almanacArt[key] = [
    22,
    22,
    (g) => {
      g.save();
      g.translate(0, 6);
      paint(g);
      g.restore();
    },
  ];
  almanacArt['large.' + key] = [22, 12, paint];
  almanacLargeArt[key] = 'large.' + key;
}
