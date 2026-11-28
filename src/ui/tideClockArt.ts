type Drawing = [number, number, (g: CanvasRenderingContext2D) => void];
const colours: Record<string, string> = {
  b: '#26354b',
  w: '#64516c',
  s: '#9984a5',
  p: '#d7af7d',
  l: '#f6daa1',
  c: '#81bbb2',
  t: '#4c8391',
  m: '#cf7970',
};
function pixels(lines: string[]): Drawing {
  return [
    Math.max(...lines.map((l) => l.length)),
    lines.length,
    (g) =>
      lines.forEach((line, y) =>
        Array.from(line).forEach((ch, x) => {
          if (colours[ch]) {
            g.fillStyle = colours[ch];
            g.fillRect(x, y, 1, 1);
          }
        }),
      ),
  ];
}
export const quarterArt: Record<string, Drawing> = {
  'quarter.clock': pixels([
    '.....bbbbbb.....',
    '...bbppppppbb...',
    '..bppllllllppb..',
    '.bplcppccppclpb.',
    '.bllpppbppppllb.',
    'bplcpppbpppcllpb',
    'bplppppbppppplpb',
    'bplcpppbbpppclpb',
    'bplppppppbbpplpb',
    '.bllpppppppbllb.',
    '.bplcppccppclpb.',
    '..bppllllllppb..',
    '...bbppppppbb...',
    '....bpbbbbpb....',
    '...bbpb..bpbb...',
    '...bbbb..bbbb...',
  ]),
  'quarter.moth': pixels([
    '................',
    '.pp.........pp..',
    '.plp...c...plp..',
    '..plp.tbt.plp...',
    '..pllpbbbpllp...',
    '...pplbbbllp....',
    '....ppbbblp.....',
    '...tm.bbb.mt....',
    '..t...bcb...t...',
    '.....p.p.p......',
    '....bp.bp.bp....',
  ]),
  'quarter.plan': pixels([
    '................',
    '..bbbbbbbbbbbb..',
    '..bppppppppplb..',
    '..bpllbbpppplb..',
    '..bpbbttlbbplb..',
    '..bpbbttlppllb..',
    '..bplllppbbplb..',
    '..bppbbptttpbb..',
    '..bppbbptttpbb..',
    '..bpppppppppbb..',
    '..bbbbbbbbbbbb..',
    '....bw....bw....',
    '....bw....bw....',
    '....bb....bb....',
  ]),
  'quarter.fittings': pixels([
    '..bbb...........',
    '..bllb..........',
    '..bpplb....bb...',
    '..bmpppbbbbcb...',
    '..bpplb....bb...',
    '..bllb..........',
    '..bbb..bbbbbbbb.',
    '....b..bppppppb.',
    '...bwb.bllllllb.',
    '..bbbbb..b..b...',
    '........bb..bb..',
  ]),
};
