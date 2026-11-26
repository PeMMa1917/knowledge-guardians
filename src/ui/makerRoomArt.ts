type Ink = (g: CanvasRenderingContext2D) => void;

function fill(g: CanvasRenderingContext2D, tone: string, x: number, y: number, width: number, height: number) {
  g.fillStyle = tone;
  g.fillRect(x, y, width, height);
}

export const MAKER_ROOM_ART: Record<string, [number, number, Ink]> = {
  'maker-exact-jiahu': [32, 26, (g) => {
    fill(g, '#5a4935', 2, 11, 28, 8);
    fill(g, '#dfbb83', 3, 11, 26, 6);
    for (const x of [5, 8, 11, 14, 17, 20, 23]) fill(g, '#6b563e', x, 13, 1, 2);
    fill(g, '#49918e', 17, 9, 2, 11);
    fill(g, '#aa7a53', 3, 23, 26, 2);
  }],
  'maker-exact-disk': [32, 26, (g) => {
    for (const [r, tone] of [[11, '#775b49'], [9, '#dcc6a4']] as const) {
      g.fillStyle = tone;
      g.beginPath();
      g.arc(16, 12, r, 0, Math.PI * 2);
      g.fill();
    }
    fill(g, '#ad9477', 9, 8, 14, 9);
    fill(g, '#e1cdaa', 11, 9, 10, 6);
    fill(g, '#4c8b83', 5, 22, 9, 3);
    fill(g, '#b77e53', 17, 22, 10, 3);
  }],
  'maker-exact-laguna': [32, 26, (g) => {
    fill(g, '#5a4937', 3, 4, 25, 17);
    fill(g, '#bf8053', 4, 4, 22, 15);
    fill(g, '#a77255', 5, 6, 21, 12);
    fill(g, '#dbc08a', 5, 18, 7, 4);
    fill(g, '#6c9f91', 13, 18, 7, 4);
    fill(g, '#dbc08a', 21, 18, 7, 4);
  }],
};
