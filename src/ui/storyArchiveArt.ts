type Drawing = [width: number, height: number, draw: (g: CanvasRenderingContext2D) => void];

function fill(g: CanvasRenderingContext2D, colour: string, x: number, y: number, width: number, height: number) {
  g.fillStyle = colour;
  g.fillRect(x, y, width, height);
}

function backdrop(g: CanvasRenderingContext2D) {
  fill(g, '#29263c', 0, 0, 64, 40);
  fill(g, '#36344d', 1, 1, 62, 37);
  fill(g, '#48435b', 1, 29, 62, 1);
  fill(g, '#a69eb6', 3, 37, 58, 1);
}

/** A closed reading mount. The surface carries no motif or encoded mark. */
function closedMount(g: CanvasRenderingContext2D) {
  fill(g, '#201d34', 8, 30, 34, 4);
  fill(g, '#75533a', 13, 5, 22, 26);
  fill(g, '#94704c', 15, 7, 18, 22);
  fill(g, '#b08e64', 16, 8, 16, 1);
  fill(g, '#825e41', 31, 8, 2, 20);
  fill(g, '#d9caaa', 43, 20, 13, 9);
  fill(g, '#b49d7d', 43, 28, 13, 1);
  fill(g, '#7f745e', 45, 23, 8, 1);
  fill(g, '#7f745e', 45, 26, 5, 1);
}

function wheel(g: CanvasRenderingContext2D, x: number, y: number, shade: string) {
  fill(g, shade, x + 2, y, 7, 11);
  fill(g, shade, x, y + 2, 11, 7);
  fill(g, '#655c73', x + 3, y + 2, 5, 7);
  fill(g, '#afa2a6', x + 4, y + 4, 3, 3);
}

/** A generic tricycle diagram, drawn without a person or an event scene. */
function smallCycle(g: CanvasRenderingContext2D) {
  fill(g, '#242237', 8, 32, 48, 2);
  wheel(g, 15, 20, '#302d44');
  wheel(g, 42, 21, '#222036');
  fill(g, '#a57560', 16, 23, 27, 2);
  fill(g, '#c49176', 26, 18, 16, 2);
  fill(g, '#c49176', 38, 13, 3, 10);
  fill(g, '#a87866', 41, 16, 2, 5);
  fill(g, '#c49176', 34, 11, 11, 2);
  fill(g, '#d4ab91', 43, 10, 4, 2);
  fill(g, '#4f3b4c', 23, 14, 10, 3);
  fill(g, '#a57560', 27, 17, 2, 4);
  wheel(g, 9, 23, '#222036');
  fill(g, '#d7c7ac', 51, 29, 7, 4);
}

function caseArt(g: CanvasRenderingContext2D, draw: (context: CanvasRenderingContext2D) => void) {
  g.save();
  g.scale(0.375, 0.375);
  backdrop(g);
  draw(g);
  g.restore();
  fill(g, '#a69eb6', 1, 15, 22, 2);
  fill(g, '#716680', 3, 17, 18, 5);
}

export const STORY_ARCHIVE_ART: Record<string, Drawing> = {
  'story-archive.board': [24, 24, (g) => caseArt(g, closedMount)],
  'story-archive.cycle': [24, 24, (g) => caseArt(g, smallCycle)],
  'big.story-archive.board': [64, 40, (g) => { backdrop(g); closedMount(g); }],
  'big.story-archive.cycle': [64, 40, (g) => { backdrop(g); smallCycle(g); }],
};

export const STORY_ARCHIVE_LARGE_ART = {
  'story-archive.board': 'big.story-archive.board',
  'story-archive.cycle': 'big.story-archive.cycle',
};
