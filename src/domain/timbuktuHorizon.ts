export const HORIZON_COLUMNS = 9;

export const HORIZON_VIEWS = [
  { place: 'Slate Harbour roof', height: 5, paths: [[1, 2, 3, 4, 5, 6, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 6, 7]] },
  { place: 'Headland low wall', height: 3, paths: [[1, 2, 3, 4, 5, 6, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 6, 7]] },
] as const;

export function firstVisiblePositions(view: typeof HORIZON_VIEWS[number]): [number, number] {
  const { height, paths } = view;
  return [paths[0].findIndex((point) => point > height), paths[1].findIndex((point) => point > height)];
}
