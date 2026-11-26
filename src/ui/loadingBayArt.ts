type Icon = [number, number, (g: CanvasRenderingContext2D) => void];

function cart(stop: 'empty' | 'fitted' | 'marked'): Icon {
  return [16, 24, (g) => {
    const draw = (color: string, x: number, y: number, w: number, h: number) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };
    const finished = stop !== 'empty';
    draw('#241c30', 1, 17, 14, 5);
    draw('#c59869', 1, 13, 14, 3);
    draw('#e5c08d', 2, 13, 12, 1);
    draw('#815365', 3, 16, 10, 2);
    draw('#374858', 4, 18, 3, 3);
    draw('#374858', 10, 18, 3, 3);
    draw('#a8a0a9', 5, 19, 1, 1);
    draw('#a8a0a9', 11, 19, 1, 1);
    draw('#b16951', 2, 9, 5, 4);
    draw('#e7ab73', 2, 9, 5, 1);
    const right = stop === 'fitted' ? 8 : 9;
    draw(finished ? '#5d827c' : '#647387', right, 7, 5, 6);
    draw(finished ? '#b9d9b5' : '#aeb8c2', right, 7, 5, 1);
    if (finished) draw('#f8e9a9', stop === 'fitted' ? 8 : 5, 14, 2, 1);
  }];
}

export const LOAD_BAY_ART = {
  'loading.cart': cart('empty'), 'loading.fitted': cart('fitted'), 'loading.marked': cart('marked'),
};
