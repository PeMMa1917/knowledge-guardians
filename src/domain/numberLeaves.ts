export const NOTCH_PAIRS = [[3, 6], [4, 8], [5, 10]] as const;
export const TRAINING_TRIANGLES = [[3, 4, 5], [5, 12, 13]] as const;

export function countedNotches() {
  return NOTCH_PAIRS.flat().reduce<number>((total, size) => total + size, 0);
}

export function triangleFit([a, b, c]: readonly [number, number, number]) {
  return { shortAreas: a ** 2 + b ** 2, longArea: c ** 2 };
}

export function placeWindow(divider: boolean): [number[], number] {
  return divider ? [[1, 0, 7], 107] : [[1, 7], 17];
}
