import { requirements } from './combination-space.mjs';
// Shared by the offline document and the tests. Keys include the complete board, chapter and cell.
export const levels = [
  'remember',
  'understand',
  'apply',
  'analyse',
  'evaluate',
  'create',
];
export const depths = [1, 2, 3, 4];
export const ledgerVersion = 1;

export function boardFor(members, { ids, steps, chapter, design = 'joint' }) {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 15)
    throw Error('Choose a chapter from 1 to 15.');
  if (!Array.isArray(ids) || !ids.length) throw Error('Select some elements.');
  const selection = [...new Set(ids)].sort();
  const rule = requirements(members, selection, { design });
  if (!rule.valid)
    throw Error(
      [
        ...rule.missing.map((k) => 'Add ' + k),
        ...rule.unknown.map((k) => 'Unknown or excluded member ' + k),
      ].join('. '),
    );
  if (steps !== undefined && steps !== null) {
    if (
      !Array.isArray(steps) ||
      !steps.length ||
      steps.some((s) => !Array.isArray(s) || !s.length)
    )
      throw Error('Each ordered step needs an element.');
    const flattened = new Set(steps.flat());
    if (
      flattened.size !== selection.length ||
      selection.some((k) => !flattened.has(k))
    )
      throw Error('Include every selected member in the ordered steps.');
    steps = steps.map((s) => [...new Set(s)].sort());
  }
  // A board describes exactly its members. The search filter used to reach it is immaterial.
  return { chapter, ids: selection, ...(steps ? { steps } : {}) };
}
export function boardKey(b) {
  return JSON.stringify([b.chapter, b.ids, b.steps ?? null]);
}
export function cellKey(b, bloom, dok) {
  if (!levels.includes(bloom) || !depths.includes(dok))
    throw Error('Unknown Bloom or DOK cell.');
  return JSON.stringify([boardKey(b), bloom, dok]);
}
export function validateRecord(members, record) {
  if (!record || typeof record !== 'object' || !record.board)
    throw Error('Missing review record.');
  const board = boardFor(members, { ...record.board, design: 'any' });
  const { bloom, dok, checked, evidence = '', actions = [], updated } = record;
  cellKey(board, bloom, dok);
  if (
    !Array.isArray(actions) ||
    actions.some((x) => typeof x !== 'string' || !x.trim())
  )
    throw Error('Use a nonempty ID for each action.');
  if (
    typeof checked !== 'boolean' ||
    typeof evidence !== 'string' ||
    typeof updated !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(updated) ||
    !Number.isFinite(Date.parse(updated))
  )
    throw Error('Invalid review status, evidence or timestamp.');
  return {
    board,
    bloom,
    dok,
    checked,
    evidence,
    ...(actions.length
      ? { actions: [...new Set(actions.map((x) => x.trim()))].sort() }
      : {}),
    updated,
  };
}
export function mergeLedger(members, existing, incoming) {
  if (incoming?.version !== ledgerVersion || !Array.isArray(incoming.records))
    throw Error('Choose a version 1 checklist JSON file.');
  const merged = new Map(existing);
  let conflicts = 0;
  for (const item of incoming.records) {
    const rec = validateRecord(members, item),
      key = cellKey(rec.board, rec.bloom, rec.dok);
    const old = merged.get(key);
    if (old && incoming.kind === 'implementation-review') continue;
    if (!old || rec.updated > old.updated) merged.set(key, rec);
    else if (
      rec.updated === old.updated &&
      (rec.checked !== old.checked ||
        rec.evidence !== old.evidence ||
        JSON.stringify(rec.actions ?? []) !== JSON.stringify(old.actions ?? []))
    )
      conflicts++;
  }
  if (conflicts)
    throw Error(
      'Two reviews disagree at the same time. Both originals are preserved. Compare their evidence before importing.',
    );
  return merged;
}
export function saveLedger(records) {
  return {
    version: ledgerVersion,
    records: [...records.values()].sort((a, b) =>
      cellKey(a.board, a.bloom, a.dok).localeCompare(
        cellKey(b.board, b.bloom, b.dok),
      ),
    ),
  };
}
export function reviewTotals(records, member, chapter) {
  const totals = Object.fromEntries(levels.map((l) => [l, [0, 0, 0, 0]]));
  for (const r of records.values())
    if (
      r.checked &&
      r.board.chapter === chapter &&
      r.board.ids.includes(member)
    )
      totals[r.bloom][r.dok - 1]++;
  return totals;
}

const reviewDate = '2026-11-28T00:00:00.000Z';
/** A portable implementation-review snapshot. Authored leads and merely counted combinations earn no checks. */
export function reviewedLedger(atlas) {
  const records = new Map();
  for (const beat of atlas.beats) {
    const board = boardFor(atlas.members, {
      chapter: beat.chapter,
      ids: beat.members,
      design: 'any',
    });
    const key = cellKey(board, beat.bloom, beat.dok);
    const note = [
      beat.act,
      ...beat.views,
      beat.consequence,
      beat.map + ' · ' + beat.target,
      beat.source + ' · ' + beat.anchor,
    ].join('\n');
    const previous = records.get(key);
    const actions = [
      ...new Set([...(previous?.actions ?? []), beat.actionId]),
    ].sort();
    records.set(key, {
      board,
      bloom: beat.bloom,
      dok: beat.dok,
      checked: true,
      updated: reviewDate,
      actions,
      evidence: (previous ? previous.evidence + '\n\n' : '') + note,
    });
  }
  return { ...saveLedger(records), kind: 'implementation-review' };
}
