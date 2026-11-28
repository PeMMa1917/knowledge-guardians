// This runs as a bundled, offline script. No student account or network service is involved.
const atlas = JSON.parse(document.querySelector('#atlasData').textContent);
const memberMap = new Map(atlas.members.map((x) => [x.id, x]));
const beatMap = new Map(atlas.beats.map((x) => [x.id, x]));
const storeName = 'knowledge-guardians-review-ledger-v1';
const get = (id) => document.getElementById(id);
const el = (tag, text) =>
  Object.assign(document.createElement(tag), { textContent: text });
const option = (value, text) => Object.assign(el('option', text), { value });
const tell = (s) => {
  get('message').textContent = s;
};
let draft = [],
  board = null,
  records = new Map(),
  editing = null,
  unusableStore = false;
let lastBoardList = [];
try {
  const raw = localStorage.getItem(storeName);
  if (raw) records = mergeLedger(atlas.members, records, JSON.parse(raw));
} catch (e) {
  unusableStore = true;
  tell('Browser storage could not be read. Export your changes as JSON.');
}
function persist() {
  if (unusableStore) {
    tell('This review is in memory. Export JSON before closing.');
    return;
  }
  try {
    const raw = localStorage.getItem(storeName);
    if (raw) records = mergeLedger(atlas.members, records, JSON.parse(raw));
    localStorage.setItem(storeName, JSON.stringify(saveLedger(records)));
  } catch (e) {
    unusableStore = true;
    tell('Browser storage could not be updated. Export JSON before closing.');
  }
}
function describe(id) {
  return memberMap.get(id)?.name ?? id;
}
for (let i = 1; i <= 15; i++) get('chapter').append(option(i, 'Chapter ' + i));
get('family').append(option('', 'All families'));
for (const [k, name] of Object.entries(atlas.families))
  get('family').append(option(k, name));
function search() {
  const q = get('search').value.trim().toLocaleLowerCase(),
    kind = get('family').value;
  const filtered = atlas.members.filter(
    (m) =>
      (!kind || m.kind === kind) &&
      [m.id, m.name, ...(m.aliases ?? [])].some((t) =>
        t.toLocaleLowerCase().includes(q),
      ),
  );
  const list = get('matches');
  list.replaceChildren(
    ...filtered.slice(0, 150).map((m) => option(m.id, m.name + ' · ' + m.id)),
  );
  list.selectedIndex = filtered.length ? 0 : -1;
  get('matchCount').textContent =
    filtered.length +
    ' matches' +
    (filtered.length > 150 ? ' · refine the search to see more.' : '.');
}
get('search').oninput = search;
get('family').onchange = search;
function refreshBoard() {
  editing = null;
  get('editPanel').hidden = true;
  get('chips').replaceChildren();
  for (const id of draft) {
    const b = el('button', describe(id) + ' ×');
    b.title = id;
    b.setAttribute('aria-label', 'Remove ' + describe(id) + ' (' + id + ')');
    b.onclick = () => {
      draft = draft.filter((v) => v !== id);
      refreshBoard();
    };
    get('chips').append(b);
  }
  get('stepBox').hidden = get('sequence').value !== 'order';
  try {
    const steps = get('stepBox').hidden
      ? undefined
      : get('steps')
          .value.split('>')
          .map((s) =>
            s
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
          );
    board = boardFor(atlas.members, {
      ids: draft,
      steps,
      chapter: Number(get('chapter').value),
      design: get('design').value,
    });
    get('valid').textContent = 'TOK anchors present.';
    get('boardTitle').textContent = 'Chapter ' + board.chapter + ' review';
    get('boardDesc').textContent = board.steps
      ? 'Ordered journey · ' + board.steps.map((s) => s.join(', ')).join(' → ')
      : 'Together · ' + board.ids.join(', ');
  } catch (e) {
    board = null;
    get('valid').textContent = e.message;
    get('boardTitle').textContent = 'Review grid';
    get('boardDesc').textContent =
      'Complete the selection to enable its 24 cells.';
  }
  grid();
  renderProof();
  listSaved();
  renderMatrix();
}
function add() {
  const id = get('matches').value;
  if (id && !draft.includes(id)) {
    draft.push(id);
    refreshBoard();
  }
}
get('add').onclick = add;
get('matches').ondblclick = add;
for (const k of ['sequence', 'chapter', 'design'])
  get(k).onchange = refreshBoard;
get('steps').oninput = refreshBoard;
function record(bloom, dok, changes, target = board) {
  if (!target) return;
  const key = cellKey(target, bloom, dok);
  const old = records.get(key);
  const now = Math.max(Date.now(), old ? Date.parse(old.updated) + 1 : 0);
  records.set(key, {
    board: target,
    bloom,
    dok,
    checked: false,
    evidence: '',
    ...old,
    ...changes,
    updated: new Date(now).toISOString(),
  });
  persist();
  listSaved();
}
function grid() {
  const table = el('table', '');
  table.setAttribute(
    'aria-label',
    'Review status by Bloom level and depth of knowledge',
  );
  const row = table.createTHead().insertRow();
  for (const t of ['Bloom', ...depths.map((d) => 'DOK ' + d)]) {
    const th = el('th', t);
    th.scope = 'col';
    row.append(th);
  }
  const body = table.createTBody();
  for (const b of levels) {
    const tr = body.insertRow(),
      th = el('th', b[0].toUpperCase() + b.slice(1));
    th.scope = 'row';
    tr.append(th);
    for (const d of depths) {
      const td = tr.insertCell(),
        cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.disabled = !board;
      const current = board && records.get(cellKey(board, b, d));
      cb.checked = Boolean(current?.checked);
      cb.setAttribute('aria-label', 'Reviewed ' + b + ' DOK ' + d);
      cb.onchange = () => {
        record(b, d, { checked: cb.checked });
        tell(cb.checked ? 'Review checked.' : 'Review unchecked.');
      };
      const edit = el(
        'button',
        current?.actions?.length
          ? 'Note ' + current.actions.length + '/10'
          : current?.evidence
            ? 'Note •'
            : 'Note',
      );
      edit.className = 'edit';
      edit.disabled = !board;
      edit.setAttribute('aria-label', 'Edit evidence for ' + b + ' DOK ' + d);
      edit.onclick = () => openNote(b, d);
      td.append(cb, edit);
    }
  }
  get('grid').replaceChildren(table);
}
function openNote(b, d) {
  editing = { b, d };
  get('cellTitle').textContent = b + ' · DOK ' + d;
  const rec = records.get(cellKey(board, b, d));
  get('note').value = rec?.evidence ?? '';
  get('actionIds').value = (rec?.actions ?? []).join('\n');
  get('editPanel').hidden = false;
  get('note').focus();
}
get('saveNote').onclick = () => {
  if (editing) {
    record(editing.b, editing.d, {
      evidence: get('note').value,
      actions: [
        ...new Set(
          get('actionIds')
            .value.split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ].sort(),
    });
    grid();
    tell('Evidence saved.');
  }
  get('editPanel').hidden = true;
};
get('closeNote').onclick = () => {
  get('editPanel').hidden = true;
};
function renderProof() {
  const box = get('proof');
  box.replaceChildren();
  if (!board) return;
  if (board.steps) {
    const paths = atlas.routes.filter((r) =>
      matchesOrder(
        board.steps,
        r.beats.map((k) =>
          beatMap.get(k).chapter === board.chapter
            ? beatMap.get(k).members
            : [],
        ),
      ),
    );
    for (const r of paths)
      box.append(el('p', r.title + ' · ' + r.note + ' · ' + r.source));
    if (!paths.length)
      box.append(
        el(
          'p',
          'No reviewed journey currently documents this order in this chapter.',
        ),
      );
    return;
  }
  const found = atlas.beats.filter(
    (b) =>
      b.chapter === board.chapter &&
      board.ids.every((id) => b.members.includes(id)),
  );
  if (!found.length)
    box.append(
      el(
        'p',
        'This combination is available for review. No matching same-action evidence has been registered in this chapter.',
      ),
    );
  for (const b of found) {
    const d = document.createElement('details');
    d.className = 'result';
    d.append(
      el('summary', b.map + ' · ' + b.bloom + ' · DOK ' + b.dok),
      el('p', describe(b.question)),
      el('p', b.act),
    );
    const ul = el('ul', '');
    for (const v of b.views) ul.append(el('li', v));
    d.append(
      ul,
      el('p', b.consequence),
      el('small', b.target + ' · ' + b.source + ' · ' + b.anchor),
    );
    box.append(d);
  }
}
function show(b) {
  draft = [...b.ids];
  get('chapter').value = String(b.chapter);
  get('design').value =
    b.ids.some((id) => id.startsWith('story:')) &&
    b.ids.some((id) => id.startsWith('game:'))
      ? 'joint'
      : 'any';
  get('sequence').value = b.steps ? 'order' : 'set';
  get('steps').value = b.steps?.map((s) => s.join(', ')).join(' > ') ?? '';
  refreshBoard();
}
const sling = [
  'story:25',
  'game:238',
  'bias:halo',
  'fallacy:wealth',
  'concept:perspective',
  'framework:perspectives',
  'area:ART',
];
get('example1').onclick = () => show({ chapter: 2, ids: sling });
get('example2').onclick = () =>
  show({
    chapter: 11,
    ids: [
      'story:11',
      'game:114',
      'micro:759',
      'etymology:evidence',
      'concept:evidence',
      'framework:ethics',
      'theme:POL',
    ],
  });
get('example3').onclick = () => {
  const steps = [sling.slice(0, 4), [...sling.slice(4), 'story:11', 'game:22']];
  show({ chapter: 2, ids: steps.flat(), steps });
};
function listSaved(filter) {
  const boards = new Map();
  for (const r of records.values())
    if (!filter || r.board.ids.includes(filter))
      boards.set(boardKey(r.board), r.board);
  lastBoardList = [...boards.values()].sort(
    (a, b) => a.chapter - b.chapter || a.ids.join().localeCompare(b.ids.join()),
  );
  get('savedBoards').replaceChildren(
    ...lastBoardList.map((b, i) =>
      option(
        i,
        'Ch ' +
          b.chapter +
          ' · ' +
          (b.steps ? 'sequence' : 'set') +
          ' · ' +
          b.ids.join(', '),
      ),
    ),
  );
  get('openSaved').disabled = !lastBoardList.length;
}
get('openSaved').onclick = () => {
  const b = lastBoardList[Number(get('savedBoards').value)];
  if (b) show(b);
};
get('focus').onclick = () => {
  const id = get('matches').value;
  if (!id) return;
  listSaved(id);
  const totals = reviewTotals(records, id, Number(get('chapter').value));
  get('memberReview').replaceChildren(
    el('h3', describe(id) + ' · chapter ' + get('chapter').value),
    el('p', levels.map((l) => l + ' ' + totals[l].join(' / ')).join(' · ')),
    el(
      'small',
      'Counts of checked boards at DOK 1 / 2 / 3 / 4 for this member.',
    ),
  );
};
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
get('json').onclick = () =>
  download(
    'knowledge-guardians-checklist.json',
    JSON.stringify(saveLedger(records), null, 2),
    'application/json',
  );
get('csv').onclick = () => {
  const rows = [
    [
      'Chapter',
      'Elements',
      'Order',
      'Bloom',
      'DOK',
      'Reviewed',
      'Evidence',
      'Distinct action count',
      'Action IDs',
      'Updated',
    ],
  ];
  const boards = new Map(
    [...records.values()].map((r) => [boardKey(r.board), r.board]),
  );
  if (board) boards.set(boardKey(board), board);
  for (const b of boards.values())
    for (const l of levels)
      for (const d of depths) {
        const r = records.get(cellKey(b, l, d));
        rows.push([
          b.chapter,
          b.ids.join(', '),
          b.steps?.map((s) => s.join(', ')).join(' > ') ?? '',
          l,
          d,
          r?.checked ? 'Yes' : 'No',
          r?.evidence ?? '',
          r?.actions?.length ?? 0,
          (r?.actions ?? []).join(' / '),
          r?.updated ?? '',
        ]);
      }
  const quote = (x) =>
    '"' +
    String(x)
      .replace(/^(\s*[=+@-])/, "'$1")
      .replaceAll('"', '""') +
    '"';
  download(
    'knowledge-guardians-checklist.csv',
    '\uFEFF' + rows.map((r) => r.map(quote).join(',')).join('\r\n'),
    'text/csv;charset=utf-8',
  );
};
get('print').onclick = () => window.print();
get('load').onchange = async () => {
  try {
    const file = get('load').files[0];
    if (!file) return;
    const incoming = JSON.parse(await file.text());
    records = mergeLedger(atlas.members, records, incoming);
    persist();
    refreshBoard();
    tell('Checklist imported. ' + records.size + ' saved cells.');
  } catch (e) {
    tell('Import failed. ' + e.message);
  } finally {
    get('load').value = '';
  }
};
let matrixPage = 0;
for (const [kind, name] of Object.entries(atlas.families))
  get('matrixKind').append(option(kind, name));
get('matrixKind').value = 'micro';
function renderMatrix() {
  const wrap = get('matrixTable');
  wrap.replaceChildren();
  if (!get('matrix').open) return;
  if (!board || board.steps) {
    wrap.textContent =
      'Build a simultaneous combination above to review a family. For ordered journeys, assign the member to a specific action in the main grid.';
    return;
  }
  const kind = get('matrixKind').value,
    query = get('matrixSearch').value.toLowerCase().trim();
  const matching = atlas.members.filter(
    (m) =>
      m.kind === kind &&
      [m.id, m.name, ...(m.aliases ?? [])].some((t) =>
        t.toLowerCase().includes(query),
      ),
  );
  matrixPage = Math.min(
    matrixPage,
    Math.max(0, Math.ceil(matching.length / 12) - 1),
  );
  const start = 12 * matrixPage,
    page = matching.slice(start, start + 12);
  get('rowCounts').textContent = matching.length
    ? start + 1 + '–' + (start + page.length) + ' of ' + matching.length
    : 'No matching members.';
  get('prevRows').disabled = matrixPage === 0;
  get('nextRows').disabled = start + page.length >= matching.length;
  const table = el('table', ''),
    head = table.createTHead(),
    top = head.insertRow(),
    sub = head.insertRow();
  const title = el('th', 'Member');
  title.scope = 'col';
  title.rowSpan = 2;
  top.append(title);
  for (const l of levels) {
    const th = el('th', l);
    th.colSpan = 4;
    th.scope = 'colgroup';
    top.append(th);
    for (const d of depths) {
      const col = el('th', String(d));
      col.scope = 'col';
      sub.append(col);
    }
  }
  const body = table.createTBody();
  for (const m of page) {
    const tr = body.insertRow();
    const th = el('th', '');
    th.scope = 'row';
    tr.append(th);
    const ids = [...new Set([...board.ids, m.id])],
      b = boardFor(atlas.members, {
        chapter: board.chapter,
        ids,
        design: 'any',
      });
    const open = el('button', m.name + ' · ' + m.id);
    open.onclick = () => {
      get('matrix').open = false;
      show(b);
      get('boardTitle').scrollIntoView();
    };
    th.append(open);
    for (const l of levels)
      for (const d of depths) {
        const td = tr.insertCell(),
          cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = records.get(cellKey(b, l, d))?.checked ?? false;
        cb.setAttribute('aria-label', m.id + ' ' + l + ' DOK ' + d);
        cb.onchange = () => {
          record(l, d, { checked: cb.checked }, b);
          grid();
        };
        td.append(cb);
      }
  }
  wrap.append(table);
}
get('matrix').ontoggle = renderMatrix;
get('matrixKind').onchange = get('matrixSearch').oninput = () => {
  matrixPage = 0;
  renderMatrix();
};
get('prevRows').onclick = () => {
  matrixPage--;
  renderMatrix();
};
get('nextRows').onclick = () => {
  matrixPage++;
  renderMatrix();
};

search();
get('example1').click();
