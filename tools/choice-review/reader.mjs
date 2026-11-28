import { gunzipSync, strFromU8 } from 'fflate';
import { reviewChoice, reviewStation } from '../review-choice-perspectives.mjs';
const get = (id) => document.getElementById(id);
const decoded = atob(get('pack').textContent.trim());
const data = JSON.parse(strFromU8(gunzipSync(Uint8Array.from(decoded, (ch) => ch.charCodeAt(0)))));
get('pack').remove();
const make = (tag, txt) => {
  const el = document.createElement(tag);
  if (txt != null) el.textContent = txt;
  return el;
};
const addOption = (select, value, label) => select.add(new Option(label, value));
const selectRoom = (room) => data.rooms[room] ?? room;
const profiles = new Map(data.profiles.map((p) => [p.id, p]));
get('inventory').textContent =
  data.options.length.toLocaleString() +
  ' choices · ' +
  data.stations.length.toLocaleString() +
  ' map placements · ' +
  profiles.size +
  ' simulated stakeholder perspectives · revision ' +
  data.revision;
for (let i = 1; i <= 15; i++) addOption(get('chapter'), String(i), 'Chapter ' + i);
for (const [id, title] of Object.entries(data.rooms).sort((a, b) => a[1].localeCompare(b[1])))
  addOption(get('room'), id, title);
for (const p of data.profiles) for (const id of ['first', 'second']) addOption(get(id), p.id, p.name);
get('first').value = 'A1';
get('second').value = 'I1';
const index = [
  ...data.options.map((row) => ({ row, kind: 'choice', rooms: row.rooms, chapters: row.chapters })),
  ...data.stations.map((row) => ({ row, kind: 'station', rooms: [row.map], chapters: [row.chapter] })),
];
for (const item of index) {
  const r = item.row;
  item.search = [r.id, r.label, r.speaker || '', r.text || '', r.tool || '', ...item.rooms.map(selectRoom)]
    .join(' ')
    .toLocaleLowerCase('en');
}
let position = 0,
  filtered = [],
  selection = null;
const pageSize = 30;
function line(parent, term, value) {
  if (value != null && value !== '') {
    parent.append(make('dt', term), make('dd', value));
  }
}
function review(id, into) {
  const person = profiles.get(get(id).value),
    parent = get(into);
  parent.replaceChildren();
  if (!selection || !person) return;
  const r =
    selection.kind === 'choice' ? reviewChoice(person, selection.row) : reviewStation(person, selection.row);
  const dl = make('dl');
  line(dl, 'What could work', r.strength);
  line(dl, 'Concern to investigate', r.concern);
  line(dl, 'Try this', r.check);
  line(dl, 'If the concern is observed', r.ifConcernObserved);
  parent.append(make('h3', person.name), dl);
}
function detail() {
  const parent = get('scene');
  parent.replaceChildren();
  if (selection) {
    const { row: r, kind, rooms, chapters } = selection;
    parent.append(
      make(
        'p',
        'Chapter ' +
          chapters.join(', ') +
          ' · ' +
          rooms.map(selectRoom).slice(0, 4).join(' / ') +
          (rooms.length > 4 ? ' and ' + (rooms.length - 4) + ' more rooms' : ''),
      ),
      make('h2', r.label),
    );
    if (r.speaker) parent.append(make('h3', r.speaker));
    if (r.text) parent.append(make('blockquote', r.text));
    if (r.reply) parent.append(make('p', (r.replySpeaker ? r.replySpeaker + ' replies. ' : '') + r.reply));
    const record = make('details');
    record.append(make('summary', 'Conditions, destinations and records'));
    const dl = make('dl');
    line(dl, 'Identifier', r.id);
    line(dl, 'Available in', rooms.map(selectRoom).join(' / '));
    line(dl, 'Tool', r.tool ?? r.opens);
    line(dl, 'Nearby scene', r.next ?? r.node);
    line(dl, 'Condition', r.guard ? JSON.stringify(r.guard) : 'Available when the surrounding encounter opens');
    line(dl, 'Effects', r.effects?.length ? JSON.stringify(r.effects) : null);
    line(dl, 'Source record', r.citationSource ?? r.exhibit);
    line(dl, 'Next room', r.destination?.map);
    if (kind === 'choice' && r.callbackCount) {
      line(dl, 'Map readers', r.callbackCount + ' possible references');
      line(dl, 'Examples', r.callbacks.map((p) => p.label + ' in ' + selectRoom(p.map)).join(' / '));
    }
    record.append(dl);
    parent.append(record);
  } else parent.append(make('h2', 'No matching encounter'));
  review('first', 'left');
  review('second', 'right');
}
function page() {
  const list = get('options');
  list.replaceChildren();
  const batch = filtered.slice(position, position + pageSize);
  get('prev').disabled = position === 0;
  get('next').disabled = position + pageSize >= filtered.length;
  get('count').textContent = filtered.length
    ? position + 1 + '–' + (position + batch.length) + ' of ' + filtered.length.toLocaleString() + ' matches'
    : '0 matches';
  for (const item of batch) {
    const b = make('button', (item.row.speaker ? item.row.speaker + ' · ' : '') + item.row.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(selection === item));
    b.addEventListener('click', () => {
      selection = item;
      for (const other of list.children) other.setAttribute('aria-pressed', String(other === b));
      detail();
      remember();
    });
    list.append(b);
  }
}
function remember() {
  const q = new URLSearchParams();
  for (const s of ['chapter', 'room', 'kind', 'search', 'first', 'second'])
    if (get(s).value) q.set(s, get(s).value);
  if (selection) q.set('pick', selection.row.id);
  try {
    history.replaceState(null, '', '#' + q.toString());
  } catch {
    /* Some file viewers disable history. */
  }
}
function filter(pick) {
  const chapter = Number(get('chapter').value),
    room = get('room').value,
    kind = get('kind').value,
    words = get('search').value.trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
  filtered = index.filter(
    (item) =>
      (!chapter || item.chapters.includes(chapter)) &&
      (!room || item.rooms.includes(room)) &&
      (!kind || item.kind === kind) &&
      words.every((w) => item.search.includes(w)),
  );
  selection = filtered.find((x) => x.row.id === pick) ?? filtered[0] ?? null;
  position = Math.max(0, Math.floor(filtered.indexOf(selection) / pageSize) * pageSize);
  page();
  detail();
  remember();
}
const q = new URLSearchParams(location.hash.slice(1));
for (const id of ['chapter', 'room', 'kind', 'search', 'first', 'second'])
  if (q.has(id)) {
    const field = get(id);
    if (field.tagName !== 'SELECT' || [...field.options].some((o) => o.value === q.get(id)))
      field.value = q.get(id);
  }
get('filter').addEventListener('submit', (e) => e.preventDefault());
for (const id of ['chapter', 'room', 'kind', 'search'])
  get(id).addEventListener('input', () => filter(selection?.row.id));
for (const id of ['first', 'second'])
  get(id).addEventListener('change', () => {
    detail();
    remember();
  });
for (const [id, step] of [
  ['prev', -1],
  ['next', 1],
])
  get(id).addEventListener('click', () => {
    position += step * pageSize;
    page();
    get('options').querySelector('button')?.focus();
  });
filter(q.get('pick'));
