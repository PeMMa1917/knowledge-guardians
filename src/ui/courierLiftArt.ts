import courierCases from '../content/courier-case-records.json';

type Ctx = CanvasRenderingContext2D;
type Drawing = [number, number, (ctx: Ctx) => void];
type Painter = (
  x: number,
  y: number,
  w: number,
  h: number,
  colour: string,
) => void;
const paper = '#f2d6a3',
  edge = '#b48d60',
  ink = '#47364b',
  wood = '#a16f49',
  light = '#f5dd9d',
  sea = '#7caaaa';

function picture(shape: string, draw: Painter) {
  const line = (x: number, y: number, w: number, col = ink) =>
    draw(x, y, w, 1, col);
  const book = (colour: string) => {
    draw(3, 5, 16, 15, colour);
    draw(19, 4, 16, 16, colour);
    line(4, 20, 15, edge);
    line(19, 20, 16, edge);
    draw(18, 5, 2, 17, edge);
  };
  const plaque = (x: number, y: number, col: string) => {
    draw(x, y, 7, 3, col);
    line(x + 1, y + 1, 4, ink);
  };
  switch (shape) {
    case 'dome':
      book(paper);
      for (let r = 0; r < 5; r++) line(9 - r, 9 + r, 2 * r + 2, '#74919a');
      draw(8, 13, 9, 4, '#74919a');
      line(7, 17, 11);
      for (let y = 8; y < 18; y += 3) line(22, y, 10, ink);
      break;
    case 'drawers':
      draw(2, 4, 9, 16, '#394654');
      line(3, 6, 7, light);
      line(3, 19, 9, edge);
      for (let i = 0; i < 3; i++) {
        const x = 13 + i * 8;
        draw(x, 8, 7, 13, wood);
        draw(x + 1, 10, 5, 3, edge);
        draw(x + 1, 15 + (i % 2), 5, 3, edge);
        draw(x + 3, 11, 1, 1, ink);
      }
      draw(14, 15, 5, 5, paper);
      draw(16, 16, 2, 2, '#e9b647');
      break;
    case 'papyrus-red':
      draw(3, 4, 32, 17, '#bd965e');
      draw(4, 3, 30, 17, paper);
      for (let y = 6; y < 18; y += 3)
        for (let x = 6; x < 31; x += 4)
          line(x, y, 2 + ((x + y) % 2), (x + y) % 3 ? '#674c35' : '#a15a48');
      break;
    case 'papyrus-dark':
      draw(1, 7, 36, 12, '#ad864c');
      draw(3, 6, 29, 14, '#cfae6e');
      draw(6, 5, 13, 1, edge);
      for (let x = 4; x < 34; x += 2)
        draw(x, 7, 1, 11, x % 4 ? '#b09059' : '#ddbf82');
      for (let y = 8; y < 19; y += 3) {
        line(4, y, 10 - (y % 3), '#5c493b');
        line(17, y, 5, '#765442');
        line(26, y, 7, '#5c493b');
      }
      break;
    case 'shallow-basket':
      draw(4, 10, 30, 3, '#ad854e');
      draw(6, 13, 26, 3, '#bf9d66');
      draw(9, 16, 20, 2, '#ccac73');
      draw(13, 18, 12, 1, edge);
      line(7, 9, 24, light);
      line(9, 11, 20, '#6f5238');
      line(11, 12, 16, '#87673e');
      break;
    case 'bay-map':
      for (let f = 0; f < 3; f++)
        draw(3 + f * 10, 5 - (f % 2), 10, 12, f % 2 ? '#e5bf88' : paper);
      for (let x = 0; x < 24; x++) {
        const y = [8, 9, 10, 8, 7, 8, 11, 12][x % 8];
        draw(5 + x, y, 1, 16 - y, sea);
      }
      for (let i = 0; i < 3; i++)
        plaque(5 + i * 9, 18, [edge, light, '#91bfab'][i]);
      break;
    case 'one-leaf':
      draw(8, 4, 21, 16, '#b19b79');
      draw(9, 3, 21, 15, paper);
      for (let i = 0; i < 5; i++) line(11, 5 + 2 * i, 15 - (i % 3), '#876d55');
      draw(24, 14, 6, 4, '#ddbc88');
      line(24, 14, 6, edge);
      draw(12, 15, 3, 1, '#a55553');
      draw(15, 16, 4, 1, '#50729d');
      break;
    case 'number-board':
      draw(10, 3, 17, 18, wood);
      draw(11, 4, 15, 16, '#e7cb9a');
      draw(13, 6, 11, 10, '#baa994');
      line(13, 17, 8, '#806956');
      plaque(27, 17, light);
      break;
    case 'roman-book':
      book('#f1dcab');
      for (let y = 7; y < 18; y += 2) {
        line(5, y, 9 + (y % 3), '#594739');
        line(22, y, 8 + (y % 4), '#594739');
      }
      draw(30, 5, 2, 8, '#bb6e58');
      break;
    case 'long-print':
      draw(1, 8, 35, 13, '#eadfca');
      draw(3, 10, 31, 9, paper);
      draw(5, 12, 27, 5, '#b5b2a5');
      draw(8, 3, 11, 3, '#89788d');
      line(8, 6, 11, edge);
      break;
    case 'rete': {
      const cx = 19,
        cy = 12;
      for (let y = -10; y <= 10; y++)
        for (let x = -10; x <= 10; x++) {
          const rad = x * x + y * y;
          if (rad > 101) continue;
          const rim =
            rad > 75 ||
            Math.abs(x + Math.floor(y / 3)) < 2 ||
            Math.abs(y - Math.floor(x / 3)) < 1;
          draw(
            cx + x,
            cy + y,
            1,
            1,
            rim ? '#d7b369' : rad < 50 ? '#8b754e' : '#6e6146',
          );
        }
      draw(17, 1, 4, 2, light);
      draw(19, 0, 1, 2, edge);
      draw(13, 6, 2, 2, light);
      draw(24, 13, 3, 1, light);
      break;
    }
    case 'dugout':
      draw(15, 1, 1, 13, ink);
      for (let row = 0; row < 10; row++) line(16, 3 + row, 1 + row, paper);
      line(16, 13, 11, edge);
      for (let x = 1; x < 37; x++) {
        const end = Math.min(x - 1, 36 - x);
        const y = end < 4 ? 9 + end : 13;
        draw(x, y, 1, Math.min(4, end + 1), wood);
      }
      line(8, 14, 23, '#5c4738');
      line(10, 17, 18, edge);
      plaque(25, 20, paper);
      break;
    case 'banknote':
      draw(2, 5, 34, 14, '#bbbd9d');
      draw(3, 6, 32, 12, '#bdd3ad');
      draw(5, 8, 12, 7, '#9fae86');
      for (let i = 0; i < 4; i++) draw(7 + i * 3, 9, 2, 4, '#79957a');
      line(21, 9, 11, '#64674d');
      line(21, 12, 7, '#79957a');
      line(21, 15, 10, '#935f5c');
      break;
  }
}
export const courierArt: Record<string, Drawing> = {};
export const largeCourierArt: Record<string, string> = {};
for (const c of courierCases) {
  const draw = (g: Ctx) =>
    picture(c.shape, (x, y, w, h, col) => {
      g.fillStyle = col;
      g.fillRect(x, y, w, h);
    });
  const key = 'courier.' + c.shape;
  courierArt[key] = [
    16,
    24,
    (g) => {
      const image = document.createElement('canvas');
      image.width = 38;
      image.height = 24;
      draw(image.getContext('2d')!);
      g.imageSmoothingEnabled = false;
      g.drawImage(image, 0, 0, 38, 24, 0, 7, 16, 11);
      g.fillStyle = '#8c7665';
      g.fillRect(2, 19, 12, 2);
    },
  ];
  courierArt['large.' + key] = [38, 24, draw];
  largeCourierArt[key] = 'large.' + key;
}

courierArt['courier.cradle'] = [
  16,
  24,
  (g) => {
    const r = (x: number, y: number, w: number, h: number, c: string) => {
      g.fillStyle = c;
      g.fillRect(x, y, w, h);
    };
    r(2, 3, 12, 2, wood);
    r(2, 5, 2, 15, wood);
    r(12, 5, 2, 15, wood);
    r(7, 5, 1, 7, light);
    r(4, 12, 8, 2, edge);
    r(5, 14, 6, 2, wood);
    r(2, 20, 12, 2, edge);
  },
];
courierArt['courier.bell'] = [
  16,
  24,
  (g) => {
    g.fillStyle = wood;
    g.fillRect(7, 3, 2, 5);
    g.fillStyle = light;
    g.fillRect(6, 7, 4, 3);
    g.fillStyle = '#d9a956';
    g.fillRect(4, 10, 8, 5);
    g.fillRect(2, 15, 12, 2);
    g.fillStyle = edge;
    g.fillRect(7, 17, 2, 3);
  },
];
courierArt['courier.hatch'] = [
  16,
  24,
  (g) => {
    g.fillStyle = ink;
    g.fillRect(1, 11, 14, 10);
    for (let j = 0; j < 3; j++) {
      g.fillStyle = j % 2 ? edge : wood;
      g.fillRect(3 + j, 13 + 2 * j, 10 - 2 * j, 2);
    }
    g.fillStyle = light;
    g.fillRect(10, 10, 3, 2);
  },
];
