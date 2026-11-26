type Paint = CanvasRenderingContext2D;
type Picture = [width: number, height: number, draw: (g: Paint) => void];

function px(g: Paint, tone: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = tone;
  g.fillRect(x, y, w, h);
}

export const TURNING_ART: Record<string, Picture> = {
  'turning.kunit-case': [16, 24, (g) => {
    px(g, '#1c2535', 1, 5, 14, 17); px(g, '#6f8e91', 2, 6, 12, 14);
    px(g, '#b88a69', 4, 10, 8, 3); px(g, '#e4cda4', 5, 16, 7, 2);
    px(g, '#e9b47e', 7, 7, 2, 2);
  }],
  'big.turning.kunit-case': [120, 72, (g) => {
    px(g, '#19242f', 0, 0, 120, 72);
    px(g, '#354d5a', 4, 5, 112, 62);
    // Plain outside dimensions with a reference tag. The coast carving is kept in its source.
    px(g, '#aa7954', 14, 19, 55, 20);
    px(g, '#c59064', 15, 20, 53, 18);
    px(g, '#edcd91', 14, 44, 55); px(g, '#edcd91', 14, 42, 1, 5); px(g, '#edcd91', 68, 42, 1, 5);
    px(g, '#edcd91', 9, 19, 1, 20); px(g, '#edcd91', 7, 19, 5); px(g, '#edcd91', 7, 38, 5);
    g.fillStyle = '#f5dba6'; g.font = '7px Lexend, sans-serif';
    g.fillText('5.5 IN', 29, 53); g.fillText('2 IN', 7, 14);
    px(g, '#263741', 74, 15, 37, 39);
    g.fillStyle = '#a8d8df'; g.fillText('KUNIT', 79, 25);
    g.fillStyle = '#f5dba6'; g.fillText('390 A', 79, 35); g.fillText('1885', 79, 45);
    g.fillText('COAST PIECE', 12, 63);
  }],
};
