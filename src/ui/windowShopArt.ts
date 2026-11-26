type Art = [width: number, height: number, paint: (g: CanvasRenderingContext2D) => void];
type Brush = CanvasRenderingContext2D;

const ink = '#252237', oak = '#996b52', light = '#ecd2a2', ocean = '#294761', blue = '#6595ab',
  ice = '#cbe4ec', gold = '#e4ad65', rust = '#aa6453', steel = '#819ab0', paper = '#f4e3b3';

function pixel(g: Brush, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function make(paint: Art[2]): Art {
  return [32, 24, paint];
}

function caseView(paint: Art[2]): Art {
  return make((g) => {
    pixel(g, ink, 2, 3, 28, 20);
    pixel(g, ocean, 3, 3, 26, 16);
    pixel(g, blue, 3, 3, 26); pixel(g, blue, 3, 4, 1, 14);
    pixel(g, blue, 3, 18, 26, 3); pixel(g, ice, 3, 18, 26);
    pixel(g, paper, 13, 20, 6, 2); pixel(g, gold, 14, 19, 4);
    paint(g);
  });
}

function tube(g: Brush, shorter: boolean) {
  const left = shorter ? 8 : 5;
  pixel(g, ink, left, 9, 27 - left, 6);
  pixel(g, shorter ? oak : light, left, 10, 25 - left, 4);
  pixel(g, shorter ? gold : rust, left + 2, 10, 1, 4);
  pixel(g, shorter ? gold : rust, 22, 10, 1, 4);
  pixel(g, shorter ? rust : oak, 24, 9, 3, 6);
  pixel(g, ice, 26, 11);
}

function craft(g: Brush, xOffset = 0, yOffset = 0) {
  pixel(g, steel, 6 + xOffset, 10 + yOffset, 21, 4);
  pixel(g, ice, 7 + xOffset, 9 + yOffset, 19);
  pixel(g, steel, 12 + xOffset, 6 + yOffset, 4, 4);
  pixel(g, ocean, 13 + xOffset, 7 + yOffset, 2, 2);
  pixel(g, blue, 13 + xOffset, 14 + yOffset, 7, 3);
  pixel(g, steel, 15 + xOffset, 17 + yOffset, 3);
  pixel(g, ice, 16 + xOffset, 15 + yOffset, 2);
}

function board(g: Brush, interior: (g: Brush) => void) {
  pixel(g, ink, 2, 4, 28, 18);
  pixel(g, oak, 3, 4, 26, 16);
  pixel(g, gold, 3, 4, 26);
  pixel(g, ocean, 5, 6, 22, 12);
  pixel(g, steel, 5, 6, 22);
  interior(g);
}

function study(g: Brush, limbs: 'wide' | 'close' | 'front' | 'edge') {
  board(g, (g) => {
    if (limbs === 'wide') {
      pixel(g, ice, 8, 11, 2, 2); pixel(g, ice, 23, 11, 2, 2);
      pixel(g, light, 12, 12, 9);
      return;
    }
    if (limbs === 'close') {
      pixel(g, ice, 7, 11, 2, 2);
      pixel(g, light, 13, 11, 3, 2); pixel(g, light, 18, 11, 3, 2);
      pixel(g, steel, 24, 8, 1, 9);
      return;
    }
    pixel(g, '#58736e', 8, 8, 16, 8);
    pixel(g, ice, 10, 11, 12); pixel(g, ice, 10, 14, 12);
    if (limbs === 'front') pixel(g, light, 17, 12, 6, 4);
    else pixel(g, light, 8, 8, 16);
  });
}

function picture(g: Brush) {
  board(g, (g) => {
    pixel(g, ink, 5, 6, 5, 12); pixel(g, ink, 23, 6, 4, 12);
    pixel(g, steel, 10, 6, 1, 12); pixel(g, steel, 22, 6, 1, 12);
    pixel(g, ice, 12, 12, 3, 2); pixel(g, light, 17, 11, 4, 1);
    pixel(g, gold, 15, 8, 2);
  });
}

function trace(g: Brush, tall = false) {
  board(g, (g) => {
    pixel(g, paper, 6, 7, 20, 10);
    pixel(g, blue, 8, 14, 5); pixel(g, blue, 12, 10, 1, 5);
    pixel(g, blue, 12, 10, 12);
    pixel(g, rust, 12, 10, 2, 2); pixel(g, rust, 12, 13, 2, 2);
    if (tall) { pixel(g, ink, 4, 20, 3, 4); pixel(g, ink, 25, 20, 3, 4); }
    else pixel(g, light, 13, 17, 7);
  });
}

export const WINDOW_ART: Record<string, Art> = {
  'window.case.telescope': caseView((g) => tube(g, false)),
  'window.case.other': caseView((g) => tube(g, true)),
  'window.case.microscope': caseView((g) => {
    pixel(g, ink, 10, 5, 9, 12); pixel(g, gold, 11, 5, 7, 11); pixel(g, light, 11, 5, 7);
    pixel(g, rust, 16, 6, 2, 8); pixel(g, ink, 13, 8, 3, 3); pixel(g, ice, 14, 9);
    pixel(g, steel, 18, 10, 4, 1); pixel(g, gold, 21, 10, 1, 5); pixel(g, gold, 20, 14, 3);
  }),
  'window.case.trieste': caseView((g) => craft(g)),
  'window.case.profile': caseView((g) => {
    pixel(g, paper, 5, 5, 22, 12); pixel(g, blue, 5, 5, 22);
    pixel(g, ocean, 8, 11, 16, 2); pixel(g, ocean, 12, 9, 3, 2);
    pixel(g, ocean, 13, 13, 5, 2); pixel(g, rust, 7, 7, 5); pixel(g, gold, 18, 7, 7);
  }),
  'window.case.columbia': caseView((g) => {
    pixel(g, ice, 12, 5, 8, 2); pixel(g, steel, 11, 7, 10, 8);
    pixel(g, steel, 8, 13, 16, 3); pixel(g, steel, 10, 10, 12, 3);
    pixel(g, ocean, 12, 8, 2, 3); pixel(g, ocean, 18, 8, 2, 3);
    pixel(g, ink, 8, 16, 16, 2); pixel(g, rust, 10, 16, 12);
  }),
  'window.wide': make((g) => study(g, 'wide')),
  'window.close': make((g) => study(g, 'close')),
  'window.front': make((g) => study(g, 'front')),
  'window.edge': make((g) => study(g, 'edge')),
  'window.picture': make(picture),
  'window.track': make((g) => trace(g)),
  'window.deck': make((g) => trace(g, true)),
  'window.glass': make((g) => { picture(g); pixel(g, ice, 6, 6, 20); pixel(g, steel, 5, 17, 22); }),
  'window.draft': make((g) => {
    board(g, (g) => {
      pixel(g, paper, 6, 7, 20, 10);
      pixel(g, rust, 8, 8, 16, 2); pixel(g, oak, 8, 13, 10); pixel(g, oak, 8, 15, 6);
      pixel(g, gold, 22, 13, 2, 3);
    });
  }),
};
