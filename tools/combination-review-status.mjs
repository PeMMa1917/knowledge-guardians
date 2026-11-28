import { levels, depths, reviewedLedger } from './combination-checklist.mjs';
const four = (values) => '| ' + values.join(' | ') + ' |';
export function reviewStatus(atlas) {
  const ledger = reviewedLedger(atlas);
  const atTarget = ledger.records.filter((cell) => cell.actions.length >= 10).length;
  const micros = atlas.members.filter((m) => m.kind === 'micro');
  const used = new Set(
    atlas.activities
      .flatMap((a) => a.skills)
      .filter((id) => id.startsWith('micro:')),
  );
  const out = [
    '# Curriculum combination review status',
    '',
    'The tables count distinct registered player actions by Bloom level and DOK. Each action has a source, a location and two perspectives. A zero means this evidence register has no reviewed action in that cell. A repeated gesture or another ending of the same decision can share an action ID.',
    '',
    '[Check an exact combination](COMBINATION_CHECKLIST.html) · [Download the implementation-review checks](COMBINATION_REVIEWED.json) · [See what the two people in each scene stand to gain](CHAPTER_VIEWPOINTS.md)',
    '',
    'The catalogue contains ' +
      atlas.members.length.toLocaleString('en-US') +
      ' selectable entries. All ' +
      micros.length.toLocaleString('en-US') +
      ' numbered micro-skills have names. ' +
      used.size +
      ' have objective links and ' +
      (micros.length - used.size) +
      ' still need such a link. The current register contains ' +
      atlas.beats.length +
      ' reviewed observations across ' +
      new Set(atlas.beats.map((beat) => beat.actionId)).size +
      ' distinct action IDs, ' +
      ledger.records.length +
      ' exact checked cells (' +
      atTarget +
      ' with ten distinct documented actions in the cell) and ' +
      atlas.routes.length +
      ' ordered journeys. Download the JSON and use **Import checklist JSON** to bring the implementation checks into a personal review. Existing personal checks and notes take precedence when importing this snapshot. Start with an empty browser profile for an independent review.',
    '',
    '## Across the campaign',
    '',
  ];
  function matrix(beats) {
    out.push(
      '| Bloom | DOK 1 | DOK 2 | DOK 3 | DOK 4 |',
      '| --- | ---: | ---: | ---: | ---: |',
    );
    for (const bloom of levels)
      out.push(
        four([
          bloom[0].toUpperCase() + bloom.slice(1),
          ...depths.map(
            (d) =>
              new Set(
                beats
                  .filter((b) => b.bloom === bloom && b.dok === d)
                  .map((b) => b.actionId),
              ).size,
          ),
        ]),
      );
    out.push('');
  }
  matrix(atlas.beats);
  out.push(
    'A checked cell records a review of the implemented task. A claim about a learner needs evidence from that learner. For extended work, record the investigation, its duration, how evidence from separate settings came together and what changed. Recalling a fact during that work can be a supporting step. The isolated act of recall provides evidence at DOK 1.',
    '',
  );
  for (let chapter = 1; chapter <= 15; chapter++) {
    out.push('## Chapter ' + chapter, '');
    matrix(atlas.beats.filter((b) => b.chapter === chapter));
  }
  return out.join('\n').trimEnd() + '\n';
}
