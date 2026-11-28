import { familyNames } from './combination-atlas.mjs';
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
    '[What remains and estimated effort](REMAINING_COVERAGE.md) · [Check an exact combination](COMBINATION_CHECKLIST.html) · [Download the implementation-review checks](COMBINATION_REVIEWED.json) · [See what the two people in each scene stand to gain](CHAPTER_VIEWPOINTS.md)',
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
  out.push('## Which elements have a documented action?', '',
    'Each family shows how many different members occur in a reviewed action and how many still need one in this register. A single action can connect several families. The last column counts distinct chapters with at least one such action. Each exact combination still needs its own review.', '',
    '| Family | Registered | With a reviewed action | Awaiting an action review | Chapters with an action |',
    '| --- | ---: | ---: | ---: | ---: |');
  const covered = new Set(atlas.beats.flatMap(beat => beat.members));
  for (const [kind, name] of Object.entries(familyNames)) {
    const members = atlas.members.filter(m => m.kind === kind);
    const observed = members.filter(m => covered.has(m.id)).length;
    const chapters = new Set(atlas.beats.filter(b => b.members.some(id => id.startsWith(kind + ':'))).map(b => b.chapter));
    out.push(four(['[' + name + '](COMBINATION_MEMBERS.md#family-' + kind + ')', members.length, observed, members.length - observed, chapters.size]));
  }
  out.push('');
  for (let chapter = 1; chapter <= 15; chapter++) {
    out.push('## Chapter ' + chapter, '');
    matrix(atlas.beats.filter((b) => b.chapter === chapter));
  }
  return out.join('\n').trimEnd() + '\n';
}

export function skillReviewIndex(atlas) {
  const objectives = new Map(),
    observations = new Map();
  function index(target, key, item) {
    const items = target.get(key) ?? [];
    items.push(item);
    target.set(key, items);
  }
  for (const activity of atlas.activities)
    for (const id of new Set(activity.skills)) index(objectives, id, activity);
  for (const beat of atlas.beats)
    for (const id of beat.members) index(observations, id, beat);
  const members = atlas.members.filter(
    (m) => m.kind === 'skill' || m.kind === 'micro',
  );
  const clean = (value) => String(value).replaceAll('|', '\\|').replace(/\s+/g, ' ');
  const lines = [
    '# Skill and micro-skill review index',
    '',
    'Find a skill by name or number. The chapter numbers identify where an objective links to the skill. The cognitive cells identify specific actions in the implementation register. An empty evidence column marks a review opportunity.',
    '',
    '[Open the full chapter checklist](COMBINATION_CHECKLIST.html) · [See the review criteria](COMBINATION_ATLAS.md) · [All curriculum and design elements](COMBINATION_MEMBERS.md)',
    '',
    'In the offline checklist, select a skill and choose **Review this element across chapters**. Pick a Bloom level, then a DOK cell. Select **Find this element in play** for the objective titles and observed actions. Each exact combination has its own evidence and ten-action count.',
    '',
  ];
  for (const kind of ['skill', 'micro']) {
    lines.push(
      kind === 'skill' ? '## Skills' : '## Numbered micro-skills',
      '',
      '| ID | Skill | Linked objectives | Chapters with a link | Documented chapter, Bloom and DOK |',
      '| --- | --- | ---: | --- | --- |',
    );
    for (const member of members.filter((m) => m.kind === kind)) {
      const links = objectives.get(member.id) ?? [];
      const chapters = [...new Set(links.map((a) => a.chapter))].sort(
        (a, b) => a - b,
      );
      const cells = [
        ...new Set(
          (observations.get(member.id) ?? []).map(
            (b) => b.chapter + ' · ' + b.bloom + ' / ' + b.dok,
          ),
        ),
      ];
      lines.push(
        '| ' +
          [
            '`' + member.id + '`',
            clean(member.name),
            links.length,
            chapters.join(', ') || '—',
            cells.join(', ') || '—',
          ].join(' | ') +
          ' |',
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}
