import { SHORE_REPLY_CASES } from '../content/shoreReply';

type Brush = CanvasRenderingContext2D;
type Art = [width: number, height: number, draw: (g: Brush) => void];

const ink = '#242731', shelf = '#496678', pale = '#bad7d5', brass = '#d8ae82', paper = '#e6dbb2';
const colors = ['#a7c9b4', '#d4a179', '#bd9aac', '#ddb879', '#88b2c4'];

function block(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function frame(draw: (g: Brush) => void): Art {
  return [32, 24, (g) => {
    block(g, ink, 2, 3, 28, 19);
    block(g, shelf, 3, 4, 26, 16);
    block(g, pale, 4, 5, 24);
    block(g, pale, 4, 6, 1, 12);
    block(g, brass, 5, 19, 22, 2);
    draw(g);
  }];
}

const sheets = Object.fromEntries(SHORE_REPLY_CASES.map((entry, n): [string, Art] => [entry.art, frame((g) => {
  const marker = colors[n % colors.length];
  const shift = n % 9;
  if (entry.family === 'chart') {
    block(g, paper, 7, 7, 19, 11);
    block(g, '#5c8c8c', 7, 13, 19, 4);
    block(g, '#81a695', 10 + shift % 4, 11, 4, 2);
    block(g, shelf, 8, 11, 3, 1);
    block(g, marker, 11 + shift, 8 + n % 3, 4, 2);
  } else if (entry.family === 'signal') {
    block(g, brass, 8 + shift % 4, 7, 1, 11);
    block(g, marker, 9 + shift % 4, 8, 11, 5);
    block(g, ink, 10 + shift % 4, 9, 3 + shift % 5, 1);
    block(g, pale, 20, 13, 5, 4);
  } else {
    block(g, paper, 7, 6, 18, 12);
    block(g, '#aaa079', 14, 6, 2, 11);
    block(g, marker, 9, 9, 4 + shift % 2, 2);
    block(g, ink, 17, 8 + shift % 5, 6);
    block(g, brass, 17, 13, 5, 3);
  }
})]));

function markedChart(linked: boolean): Art {
  return frame((g) => {
    block(g, paper, 6, 7, 20, 11);
    block(g, '#72a595', 6, 11, 20, 4);
    block(g, ink, 10, 12, 3, 2);
    if (linked) block(g, '#9d6959', 20, 11, 3, 2);
  });
}

function raisedSignal(linked: boolean): Art {
  return frame((g) => {
    block(g, brass, 10, 7, 1, 11);
    block(g, paper, 11, linked ? 7 : 12, 10, 3);
    block(g, '#8da8b8', 12, linked ? 8 : 13, 3, 1);
  });
}

function journalLeaf(linked: boolean): Art {
  return frame((g) => {
    block(g, paper, 7, 7, 8, 10);
    block(g, ink, 9, 9, 4);
    block(g, brass, 9, 11, 4, 3);
    if (!linked) return;
    block(g, paper, 17, 7, 8, 10);
    block(g, ink, 19, 9, 4);
    block(g, '#78a89f', 19, 11, 4, 3);
  });
}

export const SHORE_REPLY_ART: Record<string, Art> = {
  ...sheets,
  'shore-reply.chart': markedChart(false),
  'shore-reply.chart-linked': markedChart(true),
  'shore-reply.signal': raisedSignal(false),
  'shore-reply.signal-linked': raisedSignal(true),
  'shore-reply.ledger': journalLeaf(false),
  'shore-reply.ledger-linked': journalLeaf(true),
  'shore-reply.high': raisedSignal(true),
  'shore-reply.low': journalLeaf(true),
};
