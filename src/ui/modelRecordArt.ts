type Picture = [number, number, (g: CanvasRenderingContext2D) => void];
function fill(g: CanvasRenderingContext2D, color: string, x: number, y: number, width: number, height: number) {
  g.fillStyle = color;
  g.fillRect(x, y, width, height);
}

export const MODEL_RECORD_ART: Record<string, Picture> = {
  'model-record.stoppages': [64, 46, (g) => {
    fill(g, '#25263a', 0, 0, 64, 46);
    fill(g, '#5e3e36', 5, 7, 54, 31);
    fill(g, '#ab7956', 7, 9, 50, 4);
    fill(g, '#221e30', 10, 12, 44, 23);
    for (const y of [14, 21, 28]) {
      fill(g, '#758386', 12, y, 39, 4);
      fill(g, '#99a8a3', 13, y, 37, 1);
      fill(g, '#c2a583', 14, y + 2, 35, 1);
    }
    fill(g, '#d9a764', 25, 36, 13, 2);
  }],
  'model-record.moniac': [46, 64, (g) => {
    fill(g, '#252636', 0, 0, 46, 64);
    fill(g, '#86673f', 7, 5, 32, 50);
    fill(g, '#bfa071', 9, 6, 28, 48);
    fill(g, '#4f4f67', 11, 8, 24, 44);
    for (const [x, y, w, height] of [[15,12,12,7],[13,25,8,9],[25,24,7,10],[17,39,13,7]]) {
      fill(g, '#7a9c9e', x, y, w, height);
      fill(g, '#b0cccb', x + 1, y + 1, w - 2, 1);
      fill(g, '#b2c6d3', x + 1, y + height - 3, w - 2, 2);
    }
    fill(g, '#d3b491', 21, 19, 2, 6);
    fill(g, '#d3b491', 28, 34, 1, 5);
    fill(g, '#755139', 8, 53, 30, 6);
  }],
};
