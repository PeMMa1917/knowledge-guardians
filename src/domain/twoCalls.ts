/** The large door card has a top line and a pocket. A moving reader gets the top line. */
export const CALL_LINES = ['entry', 'trial', 'returns'] as const;
export type CallLine = typeof CALL_LINES[number];
export type CallLayout = readonly CallLine[];
export type CallBell = 'first' | 'late';
export type CallReissue = 'paired' | 'staffed';

const layouts: readonly CallLayout[] = [
  ['entry', 'trial', 'returns'],
  ['entry', 'returns', 'trial'],
  ['trial', 'entry', 'returns'],
  ['trial', 'returns', 'entry'],
  ['returns', 'entry', 'trial'],
  ['returns', 'trial', 'entry'],
];

export function layoutBit(layout: CallLayout) {
  const id = layouts.findIndex((candidate) => candidate.join() === layout.join());
  return id < 0 ? 0 : 1 << id;
}
export const readLayout = (value: unknown) => layouts.find((layout) => layout.join(',') === value);
export const hasDifferentProofs = (mask: number) => mask > 0 && (mask & (mask - 1)) !== 0;

export function shiftCallLine(layout: CallLayout, index: number, step: -1 | 1): CallLayout {
  const other = index + step;
  if (index < 0 || index >= layout.length || other < 0 || other >= layout.length) return layout;
  const moved = [...layout];
  [moved[index], moved[other]] = [moved[other], moved[index]];
  return moved;
}

export function tryCallProof(layout: CallLayout, bell: CallBell) {
  const [top, pocket, runner] = layout;
  return {
    newcomer: (bell === 'first' ? top : runner) === 'entry',
    returner: (bell === 'first' ? runner : top) === 'returns',
    researcher: top === 'trial' || pocket === 'trial',
  };
}

export function servesCalls(result: ReturnType<typeof tryCallProof>) {
  return result.newcomer && result.returner && result.researcher;
}

/** The wider runner frame uses the remaining type. The staffed pocket uses the old frame. */
export function tryCallReissue(layout: CallLayout, mode: CallReissue) {
  const [top, pocket, strip] = layout;
  const paired = mode === 'paired';
  const actionLines: readonly CallLine[] = ['entry', 'returns'];
  const door: readonly CallLine[] = paired ? actionLines : [top];
  const runner: readonly CallLine[] = paired ? actionLines : [strip];
  const researcher = paired || top === 'trial' || pocket === 'trial';
  return {
    door,
    runner,
    sourceAt: paired ? 'archive' : 'door pocket',
    late: {
      newcomer: runner.includes('entry'),
      returner: door.includes('returns'),
      researcher,
    },
    otherApproach: {
      newcomer: door.includes('entry'),
      returner: runner.includes('returns'),
      researcher,
    },
  };
}
