type Icon = [number, number, (g: CanvasRenderingContext2D) => void];
function plate(shades: string[], dots: boolean): Icon {
  return [16, 24, (g) => {
    const fill = (c: string, x: number, y: number, w: number, h: number) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    fill('#251c2c', 1, 5, 14, 15); fill('#97735a', 2, 6, 12, 12);
    fill('#344361', 3, 7, 10, 10); fill(shades[0], 4, 8, 8, 2);
    if (dots) {
      fill(shades[1], 9, 10, 2, 2); fill(shades[1], 6, 13, 2, 2); fill(shades[1], 10, 14, 1, 1);
    } else {
      fill(shades[1], 4, 10, 4, 1); fill(shades[1], 6, 11, 2, 2); fill(shades[1], 8, 13, 3, 1); fill(shades[1], 10, 14, 2, 2);
    }
    fill('#cbb18a', 4, 18, 8, 2); fill('#564059', 6, 20, 4, 2);
  }];
}
export const PRISM_ART = { 'prism.image': plate(['#768cbc', '#a3d5e1'], false), 'prism.seam': plate(['#355b76', '#93efeb'], false),
  'prism.dots': plate(['#514267', '#f2bf73'], true), 'prism.mono': plate(['#777d83', '#f0efe5'], false) };
