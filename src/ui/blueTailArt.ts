type Drawing = [number, number, (g: CanvasRenderingContext2D) => void];

const colours = {
  wood: '#483348', edge: '#7f5464', ink: '#3c3449', paper: '#f5dfa8', shade: '#cfa577',
  blue: '#63b5d8', deepBlue: '#366caa', thread: '#a5e4eb', light: '#ffebbc',
};

function block(g: CanvasRenderingContext2D, colour: keyof typeof colours, x: number, y: number, w = 1, h = 1): void {
  g.fillStyle = colours[colour];
  g.fillRect(x, y, w, h);
}

function paper(g: CanvasRenderingContext2D, x: number, y: number): void {
  block(g, 'shade', x, y + 1, 8, 11);
  block(g, 'paper', x + 1, y, 6, 11);
  block(g, 'ink', x + 2, y + 3, 4);
  block(g, 'ink', x + 2, y + 5, 4);
}

function thread(g: CanvasRenderingContext2D, x: number, y: number): void {
  block(g, 'deepBlue', x, y, 6, 2);
  block(g, 'blue', x + 2, y - 1, 4, 2);
  block(g, 'thread', x + 4, y - 2, 3);
  block(g, 'blue', x + 5, y + 2, 2);
}

function stand(g: CanvasRenderingContext2D): void {
  block(g, 'wood', 1, 17, 14, 4);
  block(g, 'edge', 2, 16, 12, 2);
  block(g, 'wood', 2, 21, 2, 3);
  block(g, 'wood', 12, 21, 2, 3);
}

function rail(g: CanvasRenderingContext2D, low: boolean): void {
  stand(g);
  block(g, 'wood', 0, 8, 16, 3);
  block(g, 'edge', 1, 8, 14);
  const y = low ? 13 : 9;
  paper(g, 5, y);
  block(g, 'deepBlue', 7, y + 5, 4);
  block(g, 'blue', 9, y + 4, 2, 3);
}

function desk(g: CanvasRenderingContext2D, marked: boolean): void {
  stand(g);
  block(g, 'deepBlue', 2, 7, 12, 10);
  block(g, 'blue', 3, 7, 10, 2);
  block(g, 'paper', 4, 9, 8, 6);
  block(g, 'ink', 5, 10, 6);
  thread(g, 6, 14);
  if (marked) {
    block(g, 'light', 1, 11, 4, 8);
    block(g, 'ink', 2, 13, 2, 1);
    block(g, 'deepBlue', 2, 16, 2, 2);
  }
}

export const BLUE_TAIL_ART: Record<string, Drawing> = {
  'blue-tail.strip': [16, 24, (g) => {
    block(g, 'wood', 2, 12, 12, 3);
    block(g, 'edge', 3, 11, 10, 2);
    block(g, 'wood', 4, 15, 2, 9);
    block(g, 'wood', 11, 15, 2, 9);
    paper(g, 3, 6);
    thread(g, 7, 12);
  }],
  'blue-tail.fold': [16, 24, (g) => {
    stand(g);
    paper(g, 1, 6);
    paper(g, 8, 5);
    block(g, 'shade', 8, 5, 1, 11);
    thread(g, 5, 12);
  }],
  'blue-tail.marked': [16, 24, (g) => {
    stand(g);
    paper(g, 2, 5);
    block(g, 'light', 10, 8, 3, 7);
    block(g, 'deepBlue', 3, 12, 4);
    block(g, 'blue', 9, 4, 3, 2);
    thread(g, 6, 13);
  }],
  'blue-tail.rail': [16, 24, (g) => rail(g, false)],
  'blue-tail.rail-low': [16, 24, (g) => rail(g, true)],
  'blue-tail.desk': [16, 24, (g) => desk(g, false)],
  'blue-tail.desk-marked': [16, 24, (g) => desk(g, true)],
};
