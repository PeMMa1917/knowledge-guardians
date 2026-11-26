type Icon = [number, number, (g: CanvasRenderingContext2D) => void];

function sheet(mode: 'map' | 'strip' | 'pair'): Icon {
  return [16, 24, (g) => {
    const mark = (c: string, x: number, y: number, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    mark('#2a2136', 1, 5, 14, 16);
    mark('#958166', 2, 6, 12, 13);
    mark('#eaca8c', 3, 7, 10, mode === 'strip' ? 5 : 11);
    mark('#b69979', 4, 9, 8, 1);
    mark('#498779', 5, 9, 1, 3); mark('#498779', 6, 10, 2);
    if (mode !== 'strip') {
      mark('#bf9269', 4, 13, 7, 1); mark('#3c786f', 8, 12, 1, 5);
      mark('#d7e9dd', 10, 14, 1, 1);
    }
    if (mode === 'pair') { mark('#59416f', 9, 5, 1, 13); mark('#b592bb', 10, 9, 3, 1); }
    mark('#473749', 3, 19, 10, 2);
  }];
}

export const ALIGNMENT_ART = { 'align.map': sheet('map'), 'align.strip': sheet('strip'), 'align.pair': sheet('pair') };
