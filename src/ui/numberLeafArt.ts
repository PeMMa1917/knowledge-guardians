type Picture = [number, number, (g: CanvasRenderingContext2D) => void];
function rect(g: CanvasRenderingContext2D, fill: string, x: number, y: number, w: number, h: number) {
  g.fillStyle = fill;
  g.fillRect(x, y, w, h);
}

export const NUMBER_LEAF_ART: Record<string, Picture> = {
  'number-leaf.ishango': [64, 40, (g) => {
    rect(g, '#1a2335', 0, 0, 64, 40);
    rect(g, '#3c3546', 4, 28, 56, 5);
    rect(g, '#65432d', 8, 17, 43, 10);
    rect(g, '#9a6b41', 8, 15, 42, 10);
    rect(g, '#cba578', 9, 15, 38, 3);
    rect(g, '#92785d', 8, 21, 6, 4);
    rect(g, '#9a6b41', 49, 18, 4, 5);
    rect(g, '#c6c1bc', 53, 16, 4, 6);
    rect(g, '#eee6cd', 55, 16, 3, 4);
    rect(g, '#fff4d4', 58, 16, 1, 2);
    for (const x of [14, 16, 19, 24, 26, 28, 30, 34, 36, 40, 43, 46]) {
      rect(g, '#57392e', x, 18, 1, 4);
      rect(g, '#ab8059', x, 23, 1, 1);
    }
  }],
  'number-leaf.plimpton': [64, 44, (g) => {
    rect(g, '#232637', 0, 0, 64, 44);
    rect(g, '#3d3844', 9, 37, 46, 3);
    rect(g, '#6d4b39', 14, 8, 39, 28);
    rect(g, '#ad7f5b', 16, 6, 34, 28);
    rect(g, '#c69a6c', 18, 7, 30, 2);
    rect(g, '#232637', 14, 8, 4, 7);
    rect(g, '#232637', 14, 22, 3, 7);
    rect(g, '#232637', 14, 31, 7, 5);
    for (const y of [12, 16, 20, 24, 28, 32]) {
      rect(g, '#845f4a', 18, y, 29, 1);
      for (const x of [23, 30, 38, 44]) {
        rect(g, '#533f3e', x, y - 2, 2, 1);
        rect(g, '#533f3e', x + 1, y - 1, 1, 1);
      }
    }
  }],
  'number-leaf.bakhshali': [64, 44, (g) => {
    rect(g, '#27263b', 0, 0, 64, 44);
    rect(g, '#463644', 7, 33, 50, 5);
    rect(g, '#755043', 12, 18, 43, 17);
    rect(g, '#a37a58', 8, 16, 42, 16);
    rect(g, '#925b44', 12, 12, 41, 15);
    rect(g, '#c49a67', 14, 8, 37, 19);
    rect(g, '#ddba79', 16, 8, 34, 2);
    rect(g, '#27263b', 14, 8, 3, 3);
    rect(g, '#27263b', 48, 22, 5, 4);
    for (const y of [13, 16, 20, 24]) {
      rect(g, '#624236', 18, y, 6, 1);
      rect(g, '#624236', 27, y, 10, 1);
      rect(g, '#624236', 40, y, 5, 1);
    }
  }],
};

for (const [key, [width, height, draw]] of Object.entries(NUMBER_LEAF_ART)) {
  NUMBER_LEAF_ART[`${key}.case`] = [20, 20, (g) => {
    rect(g, '#7c6d64', 3, 16, 14, 4);
    g.save();
    g.translate(1, 3);
    const scale = Math.min(18 / width, 12 / height);
    g.scale(scale, scale);
    draw(g);
    g.restore();
  }];
}
