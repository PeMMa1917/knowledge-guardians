import trials from '../content/ink-post-trials.json';
import type { DialogueNode, DialogueOption } from './types';

const byLetter = new Map(trials.map((trial) => [trial.letter, trial]));
export function inkTrialInvitation(letter: string): DialogueOption[] {
  const trial = byLetter.get(letter);
  return trial ? [{ text: trial.invitation, next: 'ink.' + letter + '.trial.0' }] : [];
}
export function inkTrialRecall(letter: string): DialogueOption[] {
  const trial = byLetter.get(letter);
  const story = 'ink.' + letter;
  return trial ? trial.readings.map((_, i) => ({ text: 'Unfold my saved trial marks',
    if: { flag: story + '.trial', eq: i }, next: story + '.marks.' + i })) : [];
}

export function inkTrialAt(node: string) {
  const [family, letter, phase, value] = node.split('.');
  const trial = byLetter.get(letter);
  if (family !== 'ink' || !trial || !['trial', 'marks'].includes(phase) || !/^[0-3]$/.test(value)) return;
  return { kind: trial.kind, reading: trial.readings[Number(value)], state: Number(value) };
}

export function inkTrialNodes(letter: string): DialogueNode[] {
  const trial = byLetter.get(letter);
  if (!trial) return [];
  const story = 'ink.' + letter;
  return trial.readings.flatMap((text, i): DialogueNode[] => [
    { id: story + '.trial.' + i, speaker: 'narrator', text, claimKind: 'simulation', historicalLabel: 'fictional-world',
      options: [
        { text: trial.controls[0][i & 1], next: story + '.trial.' + (i ^ 1) },
        { text: trial.controls[1][(i >> 1) & 1], next: story + '.trial.' + (i ^ 2) },
        { text: 'Tuck these trial marks into the wing', next: story, effects: [{ setFlag: story + '.trial', value: i }] },
      ] },
    { id: story + '.marks.' + i, speaker: 'narrator', text, claimKind: 'simulation', historicalLabel: 'fictional-world' },
  ]);
}
