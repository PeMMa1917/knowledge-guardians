// A chapter sheet has one evidence column shared by 24 cells. Resolve every note to its intended cell before importing anything.
import { boardFor, cellKey, levels, depths } from './combination-checklist.mjs';

function csvRows(input) {
  const text = input.replace(/^\uFEFF/, '');
  const header = text.split(/\r?\n|\r/, 1)[0];
  const delimiter = [',', ';', '\t'].find(d => header.split(d).length >= 10);
  if (!delimiter) throw Error('Choose the UTF-8 CSV of a chapter worksheet. Keep its original headings.');
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else field += ch;
    } else if (ch === delimiter || ch === '\r' || ch === '\n') {
      row.push(field);
      field = '';
      closed = false;
      if (ch !== delimiter) {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        rows.push(row);
        row = [];
      }
    } else if (closed) throw Error('A quoted field is followed by unexpected text near row ' + (rows.length + 1) + '.');
    else if (ch === '"' && !field) quoted = true;
    else field += ch;
  }
  if (quoted) throw Error('The last quoted field in the CSV is unfinished.');
  if (field || row.length || closed) rows.push([...row, field]);
  return rows;
}
const labelOf = (bloom, dok) => bloom[0].toUpperCase() + bloom.slice(1) + ' · DOK ' + dok;
const labels = levels.flatMap(bloom => depths.map(dok => labelOf(bloom, dok)));
function notesByCell(text, selected) {
  const sections = new Map();
  if (!text?.trim()) return sections;
  if (/^Full value in Long entries, rows [0-9]+[–-][0-9]+\.$/.test(text.trim()))
    throw Error('Copy the complete text from the workbook’s Long entries sheet before saving this worksheet as CSV.');
  let label, lines = [], hadHeading = false;
  const finish = () => {
    const body = lines.join('\n').replace(/^\n+|\n+$/g, '');
    if (!body) return;
    if (label === undefined && (selected.length !== 1 || hadHeading))
      throw Error('Put a Bloom and DOK heading above each note, or use one reviewed cell on this row.');
    const key = label ?? selected[0];
    if (sections.has(key)) throw Error('A Bloom and DOK heading is repeated on this row.');
    sections.set(key, body);
  };
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const index = labels.indexOf(line.trim());
    if (index >= 0) {
      hadHeading = true;
      finish();
      lines = [];
      label = labels[index];
    } else lines.push(line);
  }
  finish();
  return sections;
}
function idsIn(value = '') {
  return value.split(',').map(t => t.trim()).filter(Boolean);
}

export function readChapterCSV(text, members, fallbackChapter) {
  const rows = csvRows(text);
  const header = rows.shift() ?? [];
  if (header[0] !== 'Element or action ID' || header[33] !== 'Evidence / source / perspectives' ||
      header[34] !== 'Distinct action IDs' || labels.some((v, i) => header[i + 9] !== v))
    throw Error('Choose a chapter tab from the chapter workbook and keep its 24 cognitive headings.');
  const chapterText = header[35]?.trim() || '';
  if (chapterText && !/^Chapter (0[1-9]|1[0-5])$/.test(chapterText))
    throw Error('The chapter heading must identify a single chapter from 01 to 15.');
  const chapter = chapterText ? Number(chapterText.slice(8)) : Number(fallbackChapter);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 15)
    throw Error('This older worksheet has no chapter in its heading. Select its chapter, then choose the file again.');
  if (chapterText && fallbackChapter && chapter !== Number(fallbackChapter))
    throw Error('The selected chapter disagrees with the chapter in the worksheet.');
  const observations = new Map();
  for (const [index, row] of rows.entries()) {
    try {
      const selected = labels.filter((_, i) => row[i + 9]?.trim());
      if (!selected.length && !row[33]?.trim() && !row[34]?.trim()) continue;
      const extra = (row[7] ?? '').trim();
      const ordered = extra.startsWith('Steps: ') || extra.includes('>');
      const steps = ordered ? extra.replace(/^Steps: /, '').split('>').map(idsIn) : undefined;
      const ids = [...new Set([row[0]?.trim(), ...row.slice(3, 7).flatMap(idsIn),
        ...(steps?.flat() ?? idsIn(extra)), ...idsIn(row[8])].filter(Boolean))];
      const board = boardFor(members, { chapter, ids, steps, design: 'any' });
      const evidence = notesByCell(row[33], selected), actions = notesByCell(row[34], selected);
      const used = new Set([...selected, ...evidence.keys(), ...actions.keys()]);
      for (const name of used) {
        const position = labels.indexOf(name);
        const state = (row[9 + position] ?? '').trim().toLowerCase();
        if (state && state !== 'reviewed' && state !== 'open') throw Error('Choose Reviewed or Open for ' + name + '.');
        const bloom = levels[Math.floor(position / 4)], dok = position % 4 + 1;
        const next = { board, bloom, dok, ...(state ? {checked: state === 'reviewed'} : {}),
          ...(evidence.has(name) ? {evidence: evidence.get(name)} : {}),
          ...(actions.has(name) ? {actions: [...new Set(actions.get(name).split('\n').map(x => x.trim()).filter(Boolean))].sort()} : {}) };
        const key = cellKey(board, bloom, dok);
        const old = observations.get(key);
        if (old) {
          for (const field of ['checked', 'evidence', 'actions']) {
            if (!(field in next)) continue;
            if (field in old && JSON.stringify(old[field]) !== JSON.stringify(next[field]))
              throw Error('Two rows give different values for the same ' + name + ' cell. Keep one value for this exact combination.');
            old[field] = next[field];
          }
        } else observations.set(key, next);
      }
    } catch (error) {
      throw Error('Worksheet row ' + (index + 2) + '. ' + error.message);
    }
  }
  return {chapter, observations};
}

export function planChapterImport(current, observations, replaceExisting = false, now = new Date().toISOString()) {
  const additions = new Map();
  let differing = 0, identical = 0;
  for (const [key, patch] of observations) {
    const old = current.get(key);
    const next = { checked: false, evidence: '', ...old, ...patch, updated: now };
    if (old) {
      const equal = old.checked === next.checked && old.evidence === next.evidence &&
        JSON.stringify(old.actions ?? []) === JSON.stringify(next.actions ?? []);
      if (equal) { identical++; continue; }
      differing++;
      if (!replaceExisting) continue;
    }
    additions.set(key, next);
  }
  return {additions, differing, identical};
}
