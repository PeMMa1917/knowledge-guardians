type Ink = (canvas: CanvasRenderingContext2D) => void;

function box(g: CanvasRenderingContext2D, colour: string, x: number, y: number, width: number, height: number) {
  g.fillStyle = colour;
  g.fillRect(x, y, width, height);
}

// Diagram of the catalogue tabs, with no marks copied from the historical fragment.
const bone: Ink = (g) => {
  box(g, '#473b32', 1, 18, 30, 4);
  box(g, '#b78556', 5, 5, 20, 13);
  box(g, '#e4c9a4', 7, 4, 14, 13);
  box(g, '#f3ddb5', 11, 3, 9, 13);
  box(g, '#6fa99e', 2, 20, 12, 5);
  box(g, '#d79e63', 18, 20, 12, 5);
};

// Printing-system model. The coloured blocks are invented shapes.
const folio: Ink = (g) => {
  box(g, '#725840', 4, 5, 24, 17);
  box(g, '#e9d5ae', 7, 6, 18, 14);
  for (const [x, y] of [[10, 9], [18, 9], [14, 15]]) {
    box(g, '#555478', x, y, 4, 3);
  }
  box(g, '#7baaa2', 17, 19, 11, 5);
};

// Face of a practice dial, without the historical inscriptions.
const dial: Ink = (g) => {
  for (const [r, colour] of [[12, '#784b34'], [10, '#c58d51'], [8, '#ecd0a0']] as const) {
    g.fillStyle = colour;
    g.beginPath();
    g.arc(16, 14, r, 0, Math.PI * 2);
    g.fill();
  }
  box(g, '#55383c', 15, 7, 2, 9);
  box(g, '#55383c', 15, 14, 8, 2);
  box(g, '#578078', 10, 23, 12, 4);
};

export const REFERENCE_PROOF_ART: Record<string, [number, number, Ink]> = {
  'reference-bone-tabs': [32, 27, bone],
  'reference-jikji-type': [32, 27, folio],
  'reference-rasulid-dial': [32, 28, dial],
};
