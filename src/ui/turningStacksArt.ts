type Picture = [number, number, (c: CanvasRenderingContext2D) => void];
const wood = '#a2684a',
  edge = '#3c3441',
  paper = '#f6dfab',
  hinge = '#ddb465',
  green = '#517774',
  lilac = '#c7abbc';
function rect(c: CanvasRenderingContext2D, colour: string, x: number, y: number, w: number, h: number) {
  c.fillStyle = colour;
  c.fillRect(x, y, w, h);
}
export const stackArt: Record<string, Picture> = {
  'stacks.cert': [
    20,
    24,
    (c) => {
      rect(c, edge, 2, 2, 16, 21);
      rect(c, green, 3, 3, 14, 19);
      rect(c, paper, 5, 2, 13, 19);
      rect(c, wood, 7, 4, 9, 1);
      rect(c, edge, 6, 7, 11, 1);
      rect(c, wood, 6, 9, 8, 1);
      for (const y of [12, 14, 16]) {
        rect(c, green, 9, y, 6, 1);
        rect(c, edge, 11, y - 1, 2, 1);
      }
      rect(c, wood, 6, 19, 4, 1);
    },
  ],
  'stacks.door': [
    22,
    26,
    (c) => {
      rect(c, edge, 2, 6, 18, 18);
      rect(c, wood, 3, 7, 16, 16);
      rect(c, green, 5, 9, 8, 14);
      rect(c, paper, 5, 4, 6, 2);
      rect(c, edge, 6, 2, 9, 2);
      rect(c, hinge, 6, 4, 2, 4);
      rect(c, hinge, 13, 4, 2, 4);
      rect(c, edge, 13, 10, 4, 11);
      rect(c, lilac, 14, 11, 2, 8);
      rect(c, hinge, 15, 16, 3, 2);
      rect(c, paper, 6, 10, 5, 2);
      rect(c, edge, 2, 23, 19, 2);
    },
  ],
  'stacks.floor': [
    24,
    22,
    (c) => {
      rect(c, edge, 1, 5, 22, 15);
      rect(c, wood, 2, 6, 20, 12);
      for (let y = 0; y < 5; y++)
        for (let x = 0; x < 5; x++)
          rect(c, x === 2 && y !== 2 ? green : (x + y) % 2 ? paper : '#e5c58b', 3 + x * 4, 7 + y * 2, 3, 2);
      rect(c, edge, 6, 7, 2, 3);
      rect(c, lilac, 15, 11, 3, 3);
      rect(c, hinge, 5, 17, 2, 2);
      rect(c, hinge, 16, 17, 2, 2);
    },
  ],
  'stacks.case': [
    22,
    20,
    (c) => {
      rect(c, edge, 2, 2, 18, 16);
      rect(c, wood, 3, 3, 16, 13);
      rect(c, paper, 5, 4, 5, 9);
      rect(c, '#efd0a0', 11, 5, 6, 8);
      rect(c, green, 5, 10, 5, 1);
      rect(c, lilac, 12, 9, 4, 1);
      rect(c, hinge, 9, 12, 4, 2);
      rect(c, edge, 3, 15, 16, 2);
    },
  ],
  'stacks.lamp': [
    20,
    22,
    (c) => {
      rect(c, edge, 9, 2, 3, 16);
      rect(c, hinge, 5, 2, 9, 2);
      rect(c, wood, 3, 5, 7, 2);
      rect(c, paper, 4, 7, 5, 6);
      rect(c, hinge, 2, 13, 9, 2);
      rect(c, green, 6, 17, 10, 2);
      rect(c, edge, 4, 19, 14, 2);
      rect(c, lilac, 13, 8, 3, 1);
    },
  ],
};
