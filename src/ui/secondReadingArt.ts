import { SECOND_READING_CASES } from '../content/secondReading';

type Brush = CanvasRenderingContext2D;
type Art = [width: number, height: number, draw: (g: Brush) => void];

const ink = '#242731', shelf = '#42647c', glint = '#97bccb', metal = '#d5b180', paper = '#e6d7af';

function rect(g: Brush, color: string, x: number, y: number, width = 1, height = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, width, height);
}

function medal(g: Brush, color: string, x: number, y: number, radius: number) {
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.floor(Math.sqrt(radius ** 2 - dy ** 2));
    rect(g, color, x - half, y + dy, half * 2 + 1);
  }
}

function caseFrame(draw: (g: Brush) => void): Art {
  return [32, 24, (g) => {
    rect(g, ink, 2, 3, 28, 19);
    rect(g, shelf, 3, 4, 26, 16);
    rect(g, glint, 3, 4, 26);
    rect(g, glint, 4, 5, 1, 12);
    rect(g, glint, 3, 19, 26);
    rect(g, metal, 12, 21, 8);
    draw(g);
  }];
}

const tints = ['#e0bf8c', '#86b6bc', '#a68bb5', '#a4c19d', '#d3988a'];

const cases = Object.fromEntries(SECOND_READING_CASES.map((entry, index): [string, Art] => [entry.art, caseFrame((g) => {
  const tone = tints[index % tints.length];
  const variation = index % 7;
  if (entry.shape === 'tube') {
    const end = 22 + index % 3;
    rect(g, ink, 6, 16, 19);
    rect(g, metal, 12 + variation % 4, 12, 3, 5);
    rect(g, tone, 7, 9, end - 6, 4);
    rect(g, paper, end - 1, 8, 3, 6);
    rect(g, glint, 9 + variation, 9, 1, 4);
  } else if (entry.shape === 'dial') {
    medal(g, tone, 16, 12, index % 2 === 0 ? 6 : 5);
    medal(g, ink, 16, 12, 3);
    rect(g, paper, 16, 7 + variation % 4, 1, 6);
    rect(g, glint, 16, 12, 2 + variation % 3);
    rect(g, metal, 14, 17, 5, 1);
  } else if (entry.shape === 'trace') {
    rect(g, paper, 7, 7, 18, 10);
    rect(g, ink, 8, 14, 16);
    for (let x = 0; x < 16; x++) {
      const wave = (x + variation) % 5;
      rect(g, tone, 8 + x, 13 - wave, 1, 2);
    }
  } else {
    rect(g, paper, 7, 6, 18, 12);
    rect(g, ink, 8, 7, 16, 10);
    medal(g, tone, 13 + variation, 12, 2 + index % 3);
    rect(g, glint, 9 + variation % 3, 8, 2);
    rect(g, metal, 19, 15, 4);
  }
})]));

function witness(position: number, tone: string): Art {
  return caseFrame((g) => {
    rect(g, paper, 6, 8, 20, 9);
    rect(g, ink, 8, 13, 16);
    for (const x of [10, 14, 18, 22]) rect(g, metal, x, 13, 1, 2);
    medal(g, tone, 10 + position, 12, 2);
    rect(g, glint, 15, 8, 1, 6);
  });
}

function handover(rail: boolean): Art {
  return caseFrame((g) => {
    rect(g, rail ? ink : metal, 6, rail ? 7 : 15, 20, 3);
    rect(g, paper, rail ? 8 : 6, 9, rail ? 16 : 9, 7);
    if (!rail) rect(g, '#a4c19d', 16, 9, 10, 6);
    rect(g, shelf, rail ? 10 : 7, 10, 7);
    rect(g, shelf, rail ? 12 : 17, 13, 7);
  });
}

export const SECOND_READING_ART: Record<string, Art> = {
  ...cases,
  'second-reading.bench': witness(5, glint),
  'second-reading.first': witness(1, '#bc8159'),
  'second-reading.second': witness(10, '#588e87'),
  'second-reading.rail': handover(true),
  'second-reading.table': handover(false),
};
