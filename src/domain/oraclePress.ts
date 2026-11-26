type Ink = 'copper' | 'blue';
type Stamp = 'named' | 'blank';
type FileStatus = 'supported' | 'unresolved';
type Copy = { id: string; heading: string; ink: Ink; stamp: Stamp; file: FileStatus; receipt: string };

const reference: Copy[] = [
  { id: 'sample-copper', heading: 'West stair check', ink: 'copper', stamp: 'named', file: 'supported',
    receipt: 'The stair copy has a dated receipt. It names an earlier climb and its window of use.' },
  { id: 'sample-blue', heading: 'East lift draft', ink: 'blue', stamp: 'blank', file: 'unresolved',
    receipt: 'There is a sketch of the lift. The trip log has no entry for a test yet.' },
  { id: 'sample-mixed', heading: 'South path proof', ink: 'blue', stamp: 'named', file: 'supported',
    receipt: 'The signed task slip gives the time and the person who inspected the path.' },
  { id: 'sample-unchecked', heading: 'Upper gate copy', ink: 'copper', stamp: 'blank', file: 'unresolved',
    receipt: 'The long list contains no sign-off for the gate. Keep the printed copy linked to that gap.' },
];

export const ORACLE_PACKET = [
  { id: 'quay', heading: 'The lower quay at third bell', ink: 'copper', stamp: 'blank', file: 'unresolved',
    receipt: 'The worker’s slip names the lower quay at third bell. The press copy removed the words “during one trial”. No one signed it open all day.' },
  { id: 'landing', heading: 'The east landing after rain', ink: 'blue', stamp: 'named', file: 'supported',
    receipt: 'The original, dated receipt says the steps were usable after the second rain. It names the keeper and the steps that were checked.' },
  { id: 'rail', heading: 'The spare handrail report', ink: 'copper', stamp: 'named', file: 'unresolved',
    receipt: 'The signature belongs to one spare handrail. The borrowed name was stamped over a later claim about the whole walkway. The later claim has no matching date.' },
  { id: 'shelter', heading: 'The visitors’ shelter slip', ink: 'blue', stamp: 'blank', file: 'supported',
    receipt: 'A signed source survived in the keeper’s book. The folded working copy arrived without the outer stamp.' },
] as const satisfies readonly Copy[];

export type OracleSupply = 'narrow' | 'broad';
export type OracleRule = 'ink' | 'stamp';
export type OracleCall = FileStatus | 'defer';
export type OracleAim = 'direction' | 'trace';

export function oracleRun(supply: OracleSupply, rule: OracleRule) {
  const notes = supply === 'narrow' ? reference.slice(0, 2) : reference;
  const rows = ORACLE_PACKET.map((copy) => {
    const matching = notes.filter((note) => copy[rule] === note[rule]);
    const supported = matching.filter((note) => note.file === 'supported').length;
    const unresolved = matching.length - supported;
    const call: OracleCall = supported === unresolved ? 'defer' : supported > unresolved ? 'supported' : 'unresolved';
    return { copy, call };
  });
  return { notes, rows };
}

export const ORACLE_BRIEFS: Record<OracleAim, { task: string; draft: string; use: string }> = {
  direction: {
    task: 'Use one line to guide the walker to the part that was checked.',
    draft: 'For the checked steps, turn at the east rail. The record was for the walk after the second rain.',
    use: 'The direction carries the date limit and sends readers to a named place. The source can stay on a separate tab.',
  },
  trace: {
    task: 'Keep the named keeper and the time of the check visible in the record.',
    draft: 'The east landing keeper checked the steps after the second rain. The signed receipt belongs to that check.',
    use: 'This form helps a reader trace somebody’s work. It leaves the walking directions for the marked rail.',
  },
};

export const ORACLE_COPY = {
  source: 'A lower-quay trial used one path at third bell.',
  cut: 'The lower quay is always open.',
  log: 'The job slip identifies the polished copy. The editor removed the time and the trial limit when the page was cut to fit the smaller space.',
};
