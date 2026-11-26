/** Schematic charts of fictional places. The right edge hides different gaps in each edition. */
export const SEA_CHARTS = {
  harbour: {
    title: 'Harbour walking chart',
    marks: [
      { name: 'Seagrass Steps', x: 22, y: 60 },
      { name: 'Lantern House', x: 62, y: 33 },
      { name: 'Market Rail', x: 119, y: 54 },
    ],
    edge: 125,
    limit: 'The walking survey stops at Market Rail. The path past it was not walked.',
  },
  shoal: {
    title: 'Shoal survey chart',
    marks: [
      { name: 'Lantern House sight point', x: 24, y: 23 },
      { name: 'Shoal Shelf', x: 93, y: 58 },
    ],
    edge: 113,
    limit: 'The crew checked one strip from the shore marker. The water outside that strip was not surveyed.',
  },
} as const;

export function seaChart(id: string) {
  if (id !== 'harbour' && id !== 'shoal') throw new Error('That chart does not belong to the survey.');
  return SEA_CHARTS[id];
}
