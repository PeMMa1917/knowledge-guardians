type Icon = [number, number, (g: CanvasRenderingContext2D) => void];

function shutter(mode: 'first' | 'pair' | 'side'): Icon {
  return [16, 24, (g) => {
    const draw = (color: string, x: number, y: number, w: number, h: number) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };
    draw('#282139', 1, 6, 14, 14);
    draw('#9a795d', 2, 6, 12, 13);
    draw('#777f8a', 3, 7, 10, 10);
    draw('#365266', 4, 8, 8, 8);
    draw('#bfcabe', 4, 11, 8, 1);
    draw('#a5ddd3', 5, 9, 1, 7);
    draw('#a5ddd3', 6, 12, 1, 1);
    draw('#a5ddd3', 7, 11, 1, 1);
    if (mode === 'pair') {
      draw('#ffd38b', 10, 9, 1, 5);
      draw('#ffd38b', 9, 10, 1, 1);
      draw('#ffd38b', 8, 11, 1, 1);
    } else if (mode === 'side') {
      draw('#a8efa0', 5, 9, 4, 1);
      draw('#a8efa0', 6, 10, 1, 1);
      draw('#a8efa0', 7, 11, 1, 1);
    }
    draw('#ceb586', 3, 17, 10, 1);
    draw('#463b51', 5, 19, 6, 2);
  }];
}

export const BEARING_ART = { 'bearing.sight': shutter('first'), 'bearing.pair': shutter('pair'), 'bearing.side': shutter('side') };
