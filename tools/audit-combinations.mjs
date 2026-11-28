import { guideDocument } from './combination-rubric.mjs';
import { reviewStatus, skillReviewIndex } from './combination-review-status.mjs';
import { reviewedLedger, reviewReference } from './combination-checklist.mjs';
/** Build and query the full authoring catalogue without enumerating its power set. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { loadAudit } from './audit-cross-weave.mjs';
import { renderChecklist } from './render-combination-checklist.mjs';
import { buildAtlas, familyNames, lookup } from './combination-atlas.mjs';
import { spaceCount, selectionAt } from './combination-space.mjs';

function cell(text) {
  return String(text ?? '')
    .replaceAll('|', '\\|')
    .replace(/\s+/g, ' ')
    .trim();
}
export function memberIndex(atlas) {
  const out = [
    '# Combination catalogue',
    '',
    'Each identifier selects a distinct member of the authoring space. The rows follow the game’s public catalogues and the mission questions in the current content pack. All 1,200 supplied micro-skills have a searchable public description and retain their worksheet number. A word and its history are independent selections.',
    '',
    '[Combination rules, worked journeys and lookup commands](COMBINATION_ATLAS.md)',
    '',
    '| Family | Members |',
    '| --- | ---: |',
  ];
  for (const [kind, title] of Object.entries(familyNames)) {
    const n = atlas.members.filter((x) => x.kind === kind).length;
    out.push('| [' + title + '](#family-' + kind + ') | ' + n + ' |');
  }
  for (const [kind, title] of Object.entries(familyNames)) {
    out.push(
      '',
      '<a id="family-' + kind + '"></a>',
      '',
      '## ' + title,
      '',
      '| ID | Member | Detail |',
      '| --- | --- | --- |',
    );
    for (const m of atlas.members.filter((x) => x.kind === kind)) {
      const detail = [
        m.status,
        m.origin,
        ...(m.aliases ?? []),
        m.note && m.url ? m.note + ' [Source](' + m.url + ')' : null,
      ]
        .filter(Boolean)
        .join(' · ');
      out.push(
        '| `' + m.id + '` | ' + cell(m.name) + ' | ' + cell(detail) + ' |',
      );
    }
  }
  return out.join('\n') + '\n';
}
export function chapterRegister(atlas) {
  const out = [
    '# Questions and perspectives by chapter',
    '',
    'This register shows an inspectable route for each chapter. The two endings leave different people able to act. Each question is a game-authored route or mission question. The audit command exports the entire objective register, including steps whose perspective outcome still needs review.',
    '',
    '[Member index](COMBINATION_MEMBERS.md) · [Combination rules](COMBINATION_ATLAS.md)',
  ];
  const members = new Map(atlas.members.map((x) => [x.id, x]));
  for (let chapter = 1; chapter <= 15; chapter++) {
    out.push('', '## Chapter ' + chapter, '');
    for (const beat of atlas.beats.filter(
      (x) =>
        x.chapter === chapter &&
        (x.id.endsWith('/send') || !x.id.includes('/')),
    )) {
      const route = atlas.routes.find((r) => r.beats.includes(beat.id));
      out.push(
        '### ' + (beat.id.endsWith('/send') ? route.title : beat.objective),
        '',
        '*' + members.get(beat.question).name + '*',
        '',
        beat.act,
        '',
        '- ' + beat.views[0],
        '- ' + beat.views[1],
        '',
        'Find this at `' +
          beat.map +
          '`, using `' +
          beat.target +
          '`. ' +
          beat.bloom +
          ' · DOK ' +
          beat.dok +
          '. [Review](' +
          '../../' +
          beat.source +
          ') · [Open this exact review](COMBINATION_CHECKLIST.html' +
          reviewReference(
            {chapter:beat.chapter,ids:beat.members},
            {bloom:beat.bloom,dok:beat.dok},
          ) +
          ')',
        '',
      );
    }
  }
  return out.join('\n').trimEnd() + '\n';
}
const stringOpts = [
  'members',
  'steps',
  'design',
  'question',
  'order',
  'length',
  'rank',
  'pool',
  'bloom',
  'dok',
  'world',
  'chapter',
  'export',
];
async function main() {
  const { values } = parseArgs({
    options: {
      ...Object.fromEntries(stringOpts.map((k) => [k, { type: 'string' }])),
      catalog: { type: 'boolean' },
      activities: { type: 'boolean' },
      write: { type: 'boolean' },
      check: { type: 'boolean' },
    },
  });
  const atlas = buildAtlas(await loadAudit({ activities: true }));
  const opts = {
    design: values.design ?? 'joint',
    question: values.question ?? 'context',
    order: values.order ?? 'combination',
    ...(values.length === undefined ? {} : { length: Number(values.length) }),
    ...(values.pool ? { pool: values.pool.split(',') } : {}),
  };
  const lists = [
    ['COMBINATION_MEMBERS.md', memberIndex(atlas)],
    ['CHAPTER_VIEWPOINTS.md', chapterRegister(atlas)],
    ['COMBINATION_REVIEW_STATUS.md', reviewStatus(atlas)],
    ['SKILL_REVIEW_INDEX.md', skillReviewIndex(atlas)],
    ['BLOOM_DOK_REVIEW_GUIDE.md', guideDocument()],
    ['COMBINATION_REVIEWED.json', JSON.stringify(reviewedLedger(atlas),null,2)+'\n'],
    ['COMBINATION_CHECKLIST.html', await renderChecklist(atlas)],
  ];
  if (values.write || values.check) {
    for (const [path, body] of lists) {
      const url = new URL('../docs/audit/' + path, import.meta.url);
      if (values.write) await writeFile(url, body);
      else if ((await readFile(url, 'utf8')) !== body)
        throw Error('Regenerate docs/audit/' + path);
    }
    if (!values.export) return;
  }
  if (values.export) {
    await writeFile(values.export, JSON.stringify(atlas));
    return;
  }
  if (values.catalog) {
    console.log(JSON.stringify(atlas.members, null, 2));
    return;
  }
  if (values.activities) {
    console.log(JSON.stringify(atlas.activities, null, 2));
    return;
  }
  const steps = values.steps
    ?.split('>')
    .map((s) => s.split(',').map((x) => x.trim()));
  if (values.members || steps) {
    const ids = values.members
      ? values.members.split(',').map((x) => x.trim())
      : [...new Set(steps.flat())];
    const found = lookup(atlas, ids, { ...values, order: steps });
    console.log(JSON.stringify(found, null, 2));
    if (!found.valid) process.exitCode = 2;
    return;
  }
  if (values.rank !== undefined) {
    console.log(
      JSON.stringify(
        selectionAt(atlas.members, opts.length, values.rank, opts),
      ),
    );
    return;
  }
  const count = spaceCount(atlas.members, opts);
  console.log(
    JSON.stringify(
      {
        members: atlas.members.length,
        mode: opts,
        countPerBloomAndDOK: count.toString(),
        cellsAcrossAll24Levels: (count * 24n).toString(),
        chapters: 15,
        objectives: atlas.activities.length,
        objectivesWithGaps: atlas.activities.filter((x) => x.gaps.length)
          .length,
        reviewedBeats: atlas.beats.length,
        reviewedRoutes: atlas.routes.length,
      },
      null,
      2,
    ),
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
