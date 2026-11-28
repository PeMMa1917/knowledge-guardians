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
let lastBoardList = [],
  historyPage = 0,
  historyFilter = '';
function storageNotice(message) {
  const notice = get('storageNotice');
  notice.hidden = false;
  notice.textContent = message;
}
const archiveName = storeName + '-archive';
const pendingPrefix = archiveName + '/pending/';
const archiveMarker = archiveName + '/in-use';
let db = null,
  useArchive = false,
  saving = false;
let pending = new Map();
let smallSnapshot,
  knownArchive = false;
function readSmall() {
  const raw = localStorage.getItem(storeName);
  if (raw && raw !== smallSnapshot) {
    records = mergeLedger(atlas.members, records, JSON.parse(raw));
    smallSnapshot = raw;
  }
}
try {
  knownArchive = localStorage.getItem(archiveMarker) === 'true';
  readSmall();
} catch {
  unusableStore = true;
}

async function loadReviews() {
  const main = document.querySelector('main');
  main.inert = true;
  main.setAttribute('aria-busy', 'true');
  try {
    db = await openReviewDatabase(archiveName);
    const rows = await storedReviews(db);
    if (knownArchive && !rows.length) {
      storageNotice(
        'The stored review collection is empty. Import checklist JSON to restore a backup.',
      );
    }
    if (rows.length) {
      records = mergeLedger(atlas.members, records, { version: 1, records: rows });
      useArchive = true;
    }
    // Recover a cell which was still awaiting its database commit when a previous page closed.
    const recovered = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(pendingPrefix))
          recovered.push(JSON.parse(localStorage.getItem(key)));
      }
    } catch {}
    if (recovered.length) {
      records = mergeLedger(atlas.members, records, {
        version: 1,
        records: recovered,
      });
      useArchive = true;
    }
    if (useArchive && (recovered.length || smallSnapshot))
      queueArchive([...records.values()]);
    else if (unusableStore || records.size > 512) beginArchive();
  } catch {
    db = null;
    if (knownArchive) {
      unusableStore = true;
      storageNotice(
        'The browser could not open your saved reviews. Import a JSON backup to inspect them here. Export new edits before closing.',
      );
    } else if (unusableStore) {
      storageNotice(
        'This review is in memory. Export checklist JSON before closing.',
      );
    }
  } finally {
    main.inert = false;
    main.removeAttribute('aria-busy');
    document.documentElement.dataset.reviewReady = 'true';
    grid();
    listSaved();
    renderMatrix();
    memberOverview();
    if (location.hash.startsWith('#review?')) openRef(location.hash);
  }
}
function queueArchive(rows, patch, keepExisting = false) {
  for (const row of rows) {
    const key = cellKey(row.board, row.bloom, row.dok);
    const previous = pending.get(key);
    const changes = patch ? { ...previous?.patch, ...patch } : undefined;
    pending.set(key, { record: row, patch: changes, keepExisting });
  }
  // In particular a quick close/reload after the most recent checkbox or note can be recovered synchronously.
  if (rows.length === 1) {
    const row = rows[0];
    try {
      localStorage.setItem(
        pendingPrefix + cellKey(row.board, row.bloom, row.dok),
        JSON.stringify(row),
      );
    } catch {}
  }
  void flushArchive();
}
function beginArchive(changed = [], patch, keepExisting = false) {
  useArchive = true;
  const newKeys = new Set(changed.map((r) => cellKey(r.board, r.bloom, r.dok)));
  queueArchive(
    [...records].filter(([key]) => !newKeys.has(key)).map(([, row]) => row),
  );
  if (changed.length) queueArchive(changed, patch, keepExisting);
}
async function flushArchive() {
  if (saving || !db || !pending.size) return;
  saving = true;
  storageNotice(
    'Saving review changes in this browser. You can also export checklist JSON.',
  );
  try {
    while (pending.size) {
      const batch = pending;
      pending = new Map();
      try {
        const saved = await writeReviewChanges(db, atlas.members, batch);
        for (const [key, row] of saved) {
          if (!pending.has(key)) records.set(key, row);
          try {
            const walKey = pendingPrefix + key;
            const raw = localStorage.getItem(walKey);
            if (raw && JSON.parse(raw).updated <= row.updated)
              localStorage.removeItem(walKey);
          } catch {}
        }
      } catch (err) {
        for (const [key, change] of batch)
          if (!pending.has(key)) pending.set(key, change);
        throw err;
      }
    }
    try {
      localStorage.setItem(archiveMarker, 'true');
      if (smallSnapshot && localStorage.getItem(storeName) === smallSnapshot)
        localStorage.removeItem(storeName);
    } catch {}
    smallSnapshot = undefined;
    get('storageNotice').hidden = true;
  } catch {
    storageNotice(
      'The browser could not save the latest edits. Export checklist JSON before closing.',
    );
  } finally {
    saving = false;
  }
}
function persist(rows, patch, keepExisting = false) {
  if (useArchive) {
    queueArchive(rows, patch, keepExisting);
    return;
  }
  if (!unusableStore) {
    try {
      if (records.size > 512 && db) {
        beginArchive(rows, patch, keepExisting);
        return;
      }
      readSmall();
      const snapshot = JSON.stringify(saveLedger(records));
      localStorage.setItem(storeName, snapshot);
      smallSnapshot = snapshot;
      return;
    } catch {
      unusableStore = true;
    }
  }
  if (db) beginArchive(rows, patch, keepExisting);
  else
    storageNotice(
      'The browser could not save the latest edits. Export checklist JSON before closing.',
    );
}
function persistImported(previous, keepExisting) {
  const changed = [...records]
    .filter(([key, row]) => previous.get(key) !== row)
    .map(([, row]) => row);
  if (changed.length) persist(changed, undefined, keepExisting);
}
function describe(id) {
  return memberMap.get(id)?.name ?? id;
}
for (let i = 1; i <= 15; i++) get('chapter').append(option(i, 'Chapter ' + i));
get('family').append(option('', 'All families'));
for (const [k, name] of Object.entries(atlas.families))
  get('family').append(option(k, name));
let searchPage = 0;
function search() {
  get('playMatches').replaceChildren();
  get('activityMatches').replaceChildren();
  const q = get('search').value.trim().toLocaleLowerCase(),
    kind = get('family').value;
  const filtered = atlas.members.filter(
    (m) =>
      (!kind || m.kind === kind) &&
      [m.id, m.name, m.origin ?? '', ...(m.aliases ?? [])].some((t) =>
        t.toLocaleLowerCase().includes(q),
      ),
  );
  const list = get('matches');
  searchPage = Math.min(
    searchPage,
    Math.max(0, Math.ceil(filtered.length / 150) - 1),
  );
  const first = searchPage * 150;
  get('priorMembers').disabled = searchPage === 0;
  get('moreMembers').disabled = first + 150 >= filtered.length;
  list.replaceChildren(
    ...filtered
      .slice(first, first + 150)
      .map((m) => option(m.id, m.name + ' · ' + m.id)),
  );
  list.selectedIndex = filtered.length ? 0 : -1;
  get('matchCount').textContent = filtered.length
    ? first +
      1 +
      '–' +
      Math.min(first + 150, filtered.length) +
      ' of ' +
      filtered.length +
      ' matching elements.'
    : 'No matching elements.';
}
get('priorMembers').onclick = () => {
  searchPage--;
  search();
};
get('moreMembers').onclick = () => {
  searchPage++;
  search();
};
get('search').oninput = get('family').onchange = () => {
  searchPage = 0;
  search();
};
function refreshBoard() {
  editing = null;
  get('editPanel').hidden = true;
  get('bookmark').hidden = true;
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
  if (!get('stepBox').hidden) updateOrderRange();
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
    get('boardDesc').textContent = 'Complete the selection to enable its 24 cells.';
  }
  grid();
  renderProof();
  listSaved();
  renderMatrix();
}
function updateOrderRange() {
  const digits = get('orderNumber').value.trim(),
    max = factorial(draft.length);
  const ordinal = /^\d+$/.test(digits) ? BigInt(digits) : 0n;
  get('orderRange').textContent = draft.length
    ? max.toLocaleString('en-US') + ' orders of these ' + draft.length + ' elements.'
    : 'Choose elements to order.';
  get('openOrder').disabled = !draft.length || ordinal < 1n || ordinal > max;
}
get('orderNumber').oninput = updateOrderRange;
get('openOrder').onclick = () => {
  const ordered = permutationAt(
    [...draft].sort(),
    BigInt(get('orderNumber').value) - 1n,
  );
  get('steps').value = ordered.join(' > ');
  refreshBoard();
};
function add() {
  const id = get('matches').value;
  if (id && !draft.includes(id)) {
    draft.push(id);
    refreshBoard();
  }
}
get('newSelection').onclick = () => {
  draft = [];
  get('steps').value = '';
  get('sequence').value = 'set';
  refreshBoard();
  get('search').focus();
};
get('add').onclick = add;
get('matches').onchange = () => {
  get('playMatches').replaceChildren();
  get('activityMatches').replaceChildren();
};
get('matches').ondblclick = add;
for (const k of ['sequence', 'chapter', 'design'])
  get(k).onchange = () => {
    refreshBoard();
    get('activityMatches').replaceChildren();
  };
get('steps').oninput = refreshBoard;
function record(bloom, dok, changes, target = board) {
  if (!target) return;
  if (!useArchive && !unusableStore) {
    try {
      readSmall();
    } catch {
      unusableStore = true;
    }
  }
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
  persist([records.get(key)], changes);
  listSaved();
  memberOverview();
}
function boardProgress() {
  const box = get('boardProgress');
  if (!board) {
    box.textContent = '';
    return;
  }
  const cells = levels.flatMap((b) =>
    depths.map((d) => records.get(cellKey(board, b, d))),
  );
  const checked = cells.filter((r) => r?.checked).length;
  const target = cells.filter((r) => (r?.actions?.length ?? 0) >= 10).length;
  box.textContent =
    checked +
    ' of 24 cells reviewed · ' +
    target +
    ' of 24 have ten distinct recorded actions.';
}
function grid() {
  boardProgress();
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
        renderMatrix();
        boardProgress();
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
  const [criterion, example] = atlas.rubric[b][d - 1];
  get('criteriaTitle').textContent = criterion;
  get('criteriaDetail').textContent = example;
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
function openBeat(beat) {
  show({ chapter: beat.chapter, ids: beat.members });
  openNote(beat.bloom, beat.dok);
  const prior = records.get(cellKey(board, beat.bloom, beat.dok));
  if (!prior?.evidence)
    get('note').value = [
      beat.act,
      ...beat.views,
      beat.consequence,
      beat.map + ' · ' + beat.target,
      beat.source + ' · ' + beat.anchor,
    ].join('\n');
  const actions = new Set(prior?.actions ?? []);
  actions.add(beat.actionId);
  get('actionIds').value = [...actions].join('\n');
  get('note').focus();
}
function objectiveLeads(id) {
  const box = get('activityMatches');
  box.replaceChildren();
  const chapter = Number(get('chapter').value);
  const all = atlas.leads.filter(
    ([, ch, , members, derived]) =>
      ch === chapter && (members.includes(id) || derived.includes(id)),
  );
  if (!all.length) {
    box.append(
      el('p', 'No linked objective in chapter ' + chapter + ' for ' + id + '.'),
    );
    return;
  }
  const heading = el(
    'label',
    all.length +
      ' linked ' +
      (all.length === 1 ? 'objective' : 'objectives') +
      ' to inspect in chapter ' +
      chapter,
  );
  const list = el('select', '');
  list.id = 'objectiveLeads';
  heading.htmlFor = list.id;
  for (const [i, a] of all.entries()) list.append(option(i, a[2] + ' · ' + a[0]));
  const action = el('button', 'Build a review from this objective');
  const help = el(
    'small',
    'These are curriculum links. Verify the student’s action and choose the Bloom and DOK cell during review.',
  );
  action.onclick = () => {
    const [ref, ch, title, members, inferred] = all[Number(list.value)];
    const first = (prefix) => members.find((m) => m.startsWith(prefix + ':'));
    const ids = [
      ...new Set(
        [
          id,
          first('concept'),
          first('framework') ?? inferred[0],
          first('area') ?? first('theme'),
          first('question'),
        ].filter(Boolean),
      ),
    ];
    show({ chapter: ch, ids });
    tell(
      'Opened ' +
        ref +
        ' · ' +
        title +
        (inferred.length
          ? ' · Framework inferred from the objective’s concepts.'
          : ''),
    );
  };
  box.append(heading, list, action, help);
}
get('findAction').onclick = () => {
  const member = get('matches').value;
  if (!member) return;
  objectiveLeads(member);
  const matches = atlas.beats.filter((b) => b.members.includes(member));
  const list = get('playMatches');
  list.replaceChildren();
  if (!matches.length) {
    list.append(
      el(
        'p',
        'No action in the published evidence register names ' +
          member +
          ' yet. You can still build and review a combination that includes it.',
      ),
    );
    return;
  }
  const label = el('label', 'Registered actions for ' + describe(member));
  const choices = el('select', '');
  choices.id = 'knownAction';
  label.htmlFor = choices.id;
  for (const beat of matches)
    choices.append(
      option(
        beat.id,
        'Ch ' +
          beat.chapter +
          ' · ' +
          beat.bloom +
          ' / DOK ' +
          beat.dok +
          ' · ' +
          beat.act,
      ),
    );
  const review = el('button', 'Review selected action');
  review.onclick = () => openBeat(beatMap.get(choices.value));
  list.append(label, choices, review);
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
          beatMap.get(k).chapter === board.chapter ? beatMap.get(k).members : [],
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
      b.chapter === board.chapter && board.ids.every((id) => b.members.includes(id)),
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
    const review = el('button', 'Open this action’s exact review cell');
    review.onclick = () => openBeat(b);
    d.append(review);
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
  if (filter !== undefined && filter !== historyFilter) {
    historyPage = 0;
    historyFilter = filter;
  }
  const boards = new Map();
  for (const r of records.values())
    if (!historyFilter || r.board.ids.includes(historyFilter))
      boards.set(boardKey(r.board), r.board);
  lastBoardList = [...boards.values()].sort(
    (a, b) => a.chapter - b.chapter || a.ids.join().localeCompare(b.ids.join()),
  );
  renderHistoryPage();
}
function renderHistoryPage() {
  const size = 100;
  historyPage = Math.min(
    historyPage,
    Math.max(0, Math.ceil(lastBoardList.length / size) - 1),
  );
  const start = historyPage * size;
  const selected = lastBoardList.slice(start, start + size);
  get('savedBoards').replaceChildren(
    ...selected.map((b, i) =>
      option(
        start + i,
        'Ch ' +
          b.chapter +
          ' · ' +
          (b.steps ? 'sequence' : 'set') +
          ' · ' +
          b.ids.join(', '),
      ),
    ),
  );
  get('openSaved').disabled = !selected.length;
  get('priorSaved').disabled = !start;
  get('moreSaved').disabled = start + size >= lastBoardList.length;
  get('savedRange').textContent = selected.length
    ? start + 1 + '–' + (start + selected.length) + ' of ' + lastBoardList.length
    : 'No saved boards.';
}
get('priorSaved').onclick = () => {
  historyPage--;
  renderHistoryPage();
};
get('moreSaved').onclick = () => {
  historyPage++;
  renderHistoryPage();
};
get('openSaved').onclick = () => {
  const b = lastBoardList[Number(get('savedBoards').value)];
  if (b) show(b);
};
let focusedMember = '';
function memberOverview() {
  const box = get('memberReview');
  box.replaceChildren();
  if (!focusedMember) return;
  const id = focusedMember;
  const title = el('h3', describe(id));
  const info = el(
    'p',
    'Choose a Bloom level to see all four DOKs across chapters. Each count is a checked combination containing this element.',
  );
  const label = el('label', 'Bloom level for this element');
  const select = el('select', '');
  select.id = 'overviewBloom';
  label.htmlFor = select.id;
  for (const level of levels)
    select.append(option(level, level[0].toUpperCase() + level.slice(1)));
  select.value = overviewBloom;
  select.onchange = () => {
    overviewBloom = select.value;
    memberOverview();
    get('overviewBloom').focus();
  };
  const table = el('table', '');
  table.setAttribute(
    'aria-label',
    'Checked combinations by chapter and DOK for ' + describe(id),
  );
  const head = table.createTHead().insertRow();
  for (const name of ['Chapter', ...depths.map((d) => 'DOK ' + d)]) {
    const th = el('th', name);
    th.scope = 'col';
    head.append(th);
  }
  const rows = table.createTBody();
  for (let chapter = 1; chapter <= 15; chapter++) {
    const row = rows.insertRow(),
      th = el('th', String(chapter));
    th.scope = 'row';
    row.append(th);
    const counts = reviewTotals(records, id, chapter)[overviewBloom];
    for (const d of depths) {
      const button = el('button', String(counts[d - 1]));
      button.setAttribute(
        'aria-label',
        'Inspect chapter ' +
          chapter +
          ' ' +
          overviewBloom +
          ' DOK ' +
          d +
          ' for ' +
          id,
      );
      button.onclick = () => inspectMemberCell(id, chapter, overviewBloom, d);
      row.insertCell().append(button);
    }
  }
  const close = el('button', 'Close element overview');
  close.onclick = () => {
    focusedMember = '';
    listSaved('');
    box.replaceChildren();
    get('focus').focus();
  };
  const details = el('div', '');
  details.id = 'overviewDetails';
  details.tabIndex = -1;
  box.append(title, info, label, select, table, details, close);
}
let overviewBloom = 'analyse';
function inspectMemberCell(id, chapter, bloom, dok) {
  const box = get('overviewDetails');
  box.replaceChildren(
    el('h3', 'Chapter ' + chapter + ' · ' + bloom + ' · DOK ' + dok),
  );
  const matches = [...records.values()].filter(
    (r) =>
      r.board.chapter === chapter &&
      r.board.ids.includes(id) &&
      r.bloom === bloom &&
      r.dok === dok,
  );
  for (const record of matches) {
    const text =
      (record.checked ? 'Reviewed' : 'Open') +
      ' · ' +
      (record.board.steps ? 'Ordered journey' : 'Together') +
      ' · ' +
      record.board.ids.join(', ');
    const select = el('button', text);
    select.onclick = () => {
      show(record.board);
      openNote(bloom, dok);
    };
    box.append(select);
  }
  if (!matches.length)
    box.append(el('p', 'This cell has no saved review for this element.'));
  const build = el('button', 'Review with the current selection');
  build.disabled = !board;
  build.onclick = () => {
    const selection = board;
    if (!selection) return;
    if (selection.steps && !selection.ids.includes(id)) {
      tell(
        'Add the element to the step where it occurs before reviewing this sequence.',
      );
      get('steps').focus();
      return;
    }
    show({
      chapter,
      ids: [...new Set([...selection.ids, id])],
      steps: selection.steps,
    });
    openNote(bloom, dok);
  };
  box.append(build);
  box.focus();
}
get('focus').onclick = () => {
  focusedMember = get('matches').value;
  if (!focusedMember) return;
  listSaved(focusedMember);
  memberOverview();
  get('overviewBloom').focus();
};
get('makeReference').onclick = () => {
  if (!board) {
    tell('Choose a valid combination first.');
    return;
  }
  const fragment = reviewReference(
    board,
    editing && { bloom: editing.b, dok: editing.d },
  );
  get('reviewRef').value = fragment;
  get('bookmark').href = fragment;
  get('bookmark').hidden = false;
  get('reviewRef').focus();
  get('reviewRef').select();
};
function openRef(value) {
  try {
    const result = readReviewReference(atlas.members, value);
    show(result.board);
    if (result.cell) openNote(result.cell.bloom, result.cell.dok);
    else get('boardTitle').scrollIntoView();
    tell('Opened the requested review.');
  } catch (err) {
    tell('Could not open this reference. ' + err.message);
  }
}
get('openReference').onclick = () => openRef(get('reviewRef').value);
window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#review?')) openRef(location.hash);
});
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
get('documented').onclick = () => {
  const previous = records;
  const count = records.size;
  records = mergeLedger(atlas.members, records, reviewedLedger(atlas));
  persistImported(previous, true);
  refreshBoard();
  memberOverview();
  tell(
    'Added ' +
      (records.size - count) +
      ' implementation reviews. Existing checks and notes were kept.',
  );
};
get('json').onclick = () =>
  download(
    'knowledge-guardians-checklist.json',
    JSON.stringify(saveLedger(records), null, 2),
    'application/json',
  );
function downloadCSV(filename, rows) {
  const quote = (x) =>
    '"' +
    String(x)
      .replace(/^(\s*[=+@-])/, "'$1")
      .replaceAll('"', '""') +
    '"';
  download(
    filename,
    '\uFEFF' + rows.map((r) => r.map(quote).join(',')).join('\r\n'),
    'text/csv;charset=utf-8',
  );
}
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
  downloadCSV('knowledge-guardians-checklist.csv', rows);
};
function printableEvidence() {
  const box = get('printEvidence');
  box.replaceChildren();
  if (!board) return;
  const entries = levels
    .flatMap((l) => depths.map((d) => records.get(cellKey(board, l, d))))
    .filter((r) => r && (r.evidence || r.actions?.length));
  if (!entries.length) return;
  box.append(el('h3', 'Evidence recorded for this board'));
  for (const r of entries) {
    const run = el('article', '');
    run.append(
      el(
        'h3',
        r.bloom + ' · DOK ' + r.dok + ' · ' + (r.checked ? 'Reviewed' : 'Open'),
      ),
    );
    if (r.evidence) run.append(el('p', r.evidence));
    if (r.actions?.length)
      run.append(el('p', 'Distinct actions · ' + r.actions.join(' / ')));
    box.append(run);
  }
}
window.addEventListener('beforeprint', printableEvidence);
get('print').onclick = () => {
  printableEvidence();
  window.print();
};
get('load').onchange = async () => {
  try {
    const file = get('load').files[0];
    if (!file) return;
    const incoming = JSON.parse(await file.text());
    const previous = records;
    records = mergeLedger(atlas.members, records, incoming);
    persistImported(previous, incoming.kind === 'implementation-review');
    refreshBoard();
    memberOverview();
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
  get('familyCSV').disabled = true;
  if (!board || board.steps) {
    get('rowCounts').textContent = '';
    get('nextRows').disabled = get('prevRows').disabled = true;
    wrap.textContent =
      'Build a simultaneous combination above to review a family. For ordered journeys, assign the member to a specific action in the main grid.';
    return;
  }
  const kind = get('matrixKind').value,
    query = get('matrixSearch').value.toLowerCase().trim();
  const scope = get('design').value;
  if (
    (scope === 'story-only' && kind === 'game') ||
    (scope === 'game-only' && kind === 'story')
  ) {
    wrap.textContent = 'This family is outside the selected design scope.';
    get('rowCounts').textContent = '';
    get('prevRows').disabled = true;
    get('nextRows').disabled = true;
    return;
  }
  const matching = atlas.members.filter(
    (m) =>
      m.kind === kind &&
      [m.id, m.name, m.origin ?? '', ...(m.aliases ?? [])].some((t) =>
        t.toLowerCase().includes(query),
      ),
  );
  get('familyCSV').disabled = !matching.length;
  get('familyCSV').onclick = () => {
    const rows = [
      [
        'Chapter',
        'Focus ID',
        'Focus name',
        'Exact combination',
        ...levels.flatMap((l) => depths.map((d) => l + ' · DOK ' + d)),
      ],
    ];
    for (const member of matching) {
      const model = {
        chapter: board.chapter,
        ids: [...new Set([...board.ids, member.id])].sort(),
      };
      rows.push([
        model.chapter,
        member.id,
        member.name,
        model.ids.join(', '),
        ...levels.flatMap((l) =>
          depths.map((d) =>
            records.get(cellKey(model, l, d))?.checked ? 'Reviewed' : 'Open',
          ),
        ),
      ]);
    }
    downloadCSV(
      'knowledge-guardians-chapter-' + board.chapter + '-' + kind + '.csv',
      rows,
    );
    tell('Exported ' + matching.length + ' rows with 24 review cells each.');
  };
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
        const exact = cellKey(b, l, d);
        cb.dataset.reviewCell = exact;
        cb.checked = records.get(exact)?.checked ?? false;
        cb.setAttribute('aria-label', m.id + ' ' + l + ' DOK ' + d);
        cb.onchange = () => {
          record(l, d, { checked: cb.checked }, b);
          for (const sibling of wrap.querySelectorAll('input[data-review-cell]')) {
            if (sibling.dataset.reviewCell === exact) sibling.checked = cb.checked;
          }
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

let pinned = null;
for (const [k, label] of Object.entries(atlas.families))
  get('pool').append(option(k, label));
function pinCurrent() {
  if (!board || board.steps) {
    get('baseDescription').textContent =
      'Choose a simultaneous combination with the required TOK anchors, then pin it here.';
    pinned = null;
  } else {
    pinned = { ids: [...board.ids], scope: get('design').value };
    get('baseDescription').textContent =
      'Pinned elements · ' + pinned.ids.join(', ');
  }
  get('combinationNumber').value = '1';
  previewRange();
}
function range() {
  if (!pinned) throw Error('Pin a selection to browse its combinations.');
  const kinds = new Set([...get('pool').selectedOptions].map((o) => o.value));
  const fixed = new Set(pinned.ids);
  const pool = atlas.members
    .filter(
      (m) =>
        !fixed.has(m.id) &&
        (!kinds.size || kinds.has(m.kind)) &&
        !(pinned.scope === 'story-only' && m.kind === 'game') &&
        !(pinned.scope === 'game-only' && m.kind === 'story'),
    )
    .map((m) => m.id);
  const input = get('extraCount').value.trim();
  const n = Number(input);
  if (!/^\d+$/.test(input) || !Number.isSafeInteger(n) || n > pool.length)
    throw Error('Choose between 0 and ' + pool.length + ' additional elements.');
  const total = choose(pool.length, n);
  const digits = get('combinationNumber').value.trim();
  const number = /^\d+$/.test(digits) ? BigInt(digits) : 0n;
  return { pool, n, total, number };
}
function previewRange() {
  let spec;
  try {
    spec = range();
    get('spaceSize').textContent =
      spec.total.toLocaleString('en-US') +
      ' possible combinations. ' +
      (spec.number < 1n || spec.number > spec.total
        ? 'Choose a number in this range.'
        : 'Each combination has 24 independent review cells per chapter.');
  } catch (err) {
    get('spaceSize').textContent = err.message;
  }
  const valid = spec && spec.number >= 1n && spec.number <= spec.total;
  get('previousSet').disabled = !valid || spec.number === 1n;
  get('nextSet').disabled = !valid || spec.number === spec.total;
  get('useSet').disabled = !valid;
}
function openNumber(offset) {
  const r = range(),
    number = r.number + offset;
  if (number < 1n || number > r.total) return;
  get('combinationNumber').value = String(number);
  const extra = additionalMembers(r.pool, r.n, number - 1n);
  const scope = pinned.scope;
  show({
    chapter: Number(get('chapter').value),
    ids: [...pinned.ids, ...extra],
  });
  if (get('design').value !== scope) {
    get('design').value = scope;
    refreshBoard();
  }
  previewRange();
  tell('Opened combination ' + number + ' in chapter ' + board.chapter + '.');
}
get('navigator').ontoggle = () => {
  if (get('navigator').open && !pinned) pinCurrent();
};
get('pin').onclick = pinCurrent;
get('pool').onchange = get('extraCount').oninput = () => {
  get('combinationNumber').value = '1';
  previewRange();
};
get('combinationNumber').oninput = previewRange;
get('previousSet').onclick = () => openNumber(-1n);
get('nextSet').onclick = () => openNumber(1n);
get('useSet').onclick = () => openNumber(0n);

search();
get('example1').click();
void loadReviews();
