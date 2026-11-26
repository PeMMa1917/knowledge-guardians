/** Original external-form drawings for the three documentary cases. */
type Paint = CanvasRenderingContext2D;
type Picture = [width: number, height: number, draw: (g: Paint) => void];

function px(g: Paint, tone: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = tone;
  g.fillRect(x, y, w, h);
}

function label(g: Paint, tone: string, x: number, y: number, text: string, size = 7) {
  g.fillStyle = tone;
  g.font = `${size}px monospace`;
  g.fillText(text, x, y);
}

const ink = '#19242f';
const cream = '#e9d9b0';
const marine = '#92cdd5';
const ochre = '#e3a362';
const cedar = '#977257';

function tray(g: Paint) {
  px(g, ink, 1, 5, 14, 15);
  px(g, '#53717b', 2, 6, 12, 13);
  px(g, '#a6b6ad', 2, 18, 12, 2);
  px(g, '#c9ba9b', 4, 20, 8, 2);
}

export const PASSAGE_DOCUMENTARY_ART: Record<string, Picture> = {
  'passage.marshall-outline': [16, 24, (g) => {
    tray(g);
    px(g, marine, 4, 8, 8, 7);
    px(g, ink, 5, 9, 6, 5);
    px(g, cream, 4, 16, 7);
  }],
  'big.passage.marshall-outline': [120, 72, (g) => {
    px(g, ink, 0, 0, 120, 72);
    px(g, '#2d4654', 4, 6, 112, 60);
    px(g, marine, 18, 15, 44, 34);
    px(g, '#294350', 19, 16, 42, 32);
    // Only the measured outside envelope and its rulers appear here.
    px(g, cream, 18, 53, 44); px(g, cream, 18, 51, 1, 5); px(g, cream, 61, 51, 1, 5);
    px(g, cream, 14, 15, 1, 34); px(g, cream, 12, 15, 5); px(g, cream, 12, 48, 5);
    label(g, cream, 26, 62, '128 CM', 6);
    g.save(); g.translate(10, 44); g.rotate(-Math.PI / 2); label(g, cream, 0, 0, '100 CM', 6); g.restore();
    px(g, '#395361', 66, 14, 45, 38);
    label(g, marine, 69, 24, 'E432083-0', 6);
    label(g, cream, 69, 33, 'COLLECTED', 6);
    label(g, cream, 69, 41, '1940-1959', 6);
    label(g, cream, 69, 49, '28 SHELLS', 6);
  }],
  'passage.dhuwa-receipt': [16, 24, (g) => {
    tray(g);
    px(g, cedar, 4, 7, 6, 10); px(g, cream, 5, 9, 4, 5);
    px(g, marine, 10, 12, 3, 4); px(g, ink, 11, 13, 1, 2);
  }],
  'big.passage.dhuwa-receipt': [120, 72, (g) => {
    px(g, ink, 0, 0, 120, 72);
    px(g, '#304956', 4, 5, 112, 62);
    label(g, marine, 10, 16, 'DHUWA  /  14 AUG 1963');
    // A blank surround and a paper rectangle show document components only.
    px(g, cedar, 13, 21, 31, 35);
    px(g, cream, 20, 27, 17, 23);
    px(g, marine, 46, 36, 9); px(g, marine, 53, 35, 2, 3);
    px(g, '#426778', 56, 26, 52, 27);
    label(g, cream, 62, 37, 'RECEIPT', 7);
    label(g, marine, 62, 46, 'J. NELSON', 6);
    label(g, cream, 12, 63, 'PUBLIC RECORD I', 6);
  }],
  'passage.yirritja-copy': [16, 24, (g) => {
    tray(g);
    px(g, '#936246', 3, 7, 6, 10); px(g, cream, 4, 9, 4, 5);
    px(g, ochre, 10, 10, 3, 5); px(g, cream, 9, 12, 3, 4);
  }],
  'big.passage.yirritja-copy': [120, 72, (g) => {
    px(g, ink, 0, 0, 120, 72);
    px(g, '#39434e', 4, 5, 112, 62);
    label(g, ochre, 10, 16, 'YIRRITJA  /  28 AUG 1963');
    px(g, '#936246', 13, 22, 32, 35);
    px(g, cream, 20, 28, 18, 22);
    px(g, ochre, 46, 38, 8); px(g, ochre, 52, 37, 2, 3);
    px(g, '#6b6470', 58, 25, 49, 27);
    px(g, ochre, 63, 32, 9, 11); px(g, cream, 65, 34, 9, 12);
    label(g, cream, 78, 37, 'COPY', 7); label(g, cream, 78, 46, 'NOTE', 7);
    label(g, cream, 12, 63, 'PUBLIC RECORD II', 6);
  }],
};

export const PASSAGE_DOCUMENTARY_LARGE_ART = {
  'passage.marshall-outline': 'big.passage.marshall-outline',
  'passage.dhuwa-receipt': 'big.passage.dhuwa-receipt',
  'passage.yirritja-copy': 'big.passage.yirritja-copy',
};
