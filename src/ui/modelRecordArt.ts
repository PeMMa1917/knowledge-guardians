type Picture = [number, number, (g: CanvasRenderingContext2D) => void];
function fill(g: CanvasRenderingContext2D, color: string, x: number, y: number, width: number, height: number) {
  g.fillStyle = color;
  g.fillRect(x, y, width, height);
}

export const MODEL_RECORD_ART: Record<string, Picture> = {
  'model-record.theseus': [58, 52, (g) => {
    fill(g, '#25263a', 0, 0, 58, 52);
    fill(g, '#5b463e', 6, 32, 46, 11);
    fill(g, '#2c2d40', 9, 36, 40, 5);
    for (let x = 13; x < 43; x += 6) fill(g, '#ae8256', x, 37, 3, 2);
    fill(g, '#d1ae7d', 5, 8, 48, 27);
    fill(g, '#7d6954', 7, 10, 44, 23);
    for (const [x, y, width, height] of [[13,10,3,14],[14,22,20,2],[25,14,24,2],[34,16,3,12],[20,29,25,2]]) {
      fill(g, '#ddd0a3', x, y, width, height);
    }
    fill(g, '#b38852', 22, 24, 7, 4);
    fill(g, '#e0bc8b', 27, 23, 4, 3);
    fill(g, '#433238', 30, 24, 1, 1);
  }],
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
