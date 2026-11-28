import { request } from '../classroom/request';
import { h } from '../ui/dom';

type Field = 'login' | 'display' | 'alias';
type Member = {
  id: string;
  login: string;
  display: string;
  alias: string | null;
  revision: number;
  rule: string | null;
  flagged: string | null;
  flags: Field[];
};
const labels: Record<Field, string> = {
  login: 'Sign-in username',
  display: 'Class display name',
  alias: 'Leaderboard nickname',
};

// Show invisible formatting explicitly so a reviewer sees the actual submitted spelling.
function visibleName(value: string) {
  return value.replace(
    /[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/gu,
    (c) => '[U+' + c.codePointAt(0)!.toString(16).toUpperCase() + ']',
  );
}
export function classNames(account: string, classId: string, changed: () => void) {
  const endpoint = 'teacher/names?' + new URLSearchParams({ account, class: classId });
  const roster = h('div', {}),
    status = h('p', { role: 'status' });
  const summary = h('summary', {}, 'Manage student names');
  const panel = h(
    'details',
    { class: 'class-names' },
    summary,
    h(
      'p',
      {},
      'Only the assigned teacher can review flagged names. Removing a username generates a replacement that you can give to the student.',
    ),
    roster,
    status,
  );
  let generation = 0;
  async function load(message = '') {
    const seq = ++generation;
    try {
      const list = await request<Member[]>(endpoint);
      if (seq !== generation || !panel.isConnected) return;
      roster.replaceChildren(...list.map(memberCard));
      const flagged = list.filter((row) => row.flags.length).length;
      summary.textContent = flagged
        ? 'Manage student names · ' + flagged + ' flagged'
        : 'Manage student names';
      status.textContent = [
        message,
        flagged ? flagged + ' flagged student records.' : 'No names flagged for review.',
      ]
        .filter(Boolean)
        .join(' ');
    } catch (error) {
      if (seq === generation) status.textContent = (error as Error).message;
    }
  }
  function memberCard(row: Member) {
    const section = h(
      'fieldset',
      {},
      h('legend', {}, h('bdi', {}, visibleName(row.display)), ' · ', h('bdi', {}, visibleName(row.login))),
    );
    const field = h(
      'select',
      {},
      ...(['login', 'display', 'alias'] as const).map((key) => h('option', { value: key }, labels[key])),
    );
    const input = h('input', { type: 'text', autocomplete: 'off' }),
      current = h('p', {});
    const release = h(
      'button',
      { type: 'button', onclick: () => save('release') },
      'Let student choose nickname',
    );
    const dismiss = h('button', { type: 'button', onclick: () => save('dismiss') }, 'Dismiss nickname flag');
    function selectField() {
      const key = field.value as Field;
      const value = key === 'alias' ? (row.rule ?? row.alias) : row[key];
      current.replaceChildren(
        'Current ' + labels[key].toLowerCase() + ': ',
        h(
          'bdi',
          {},
          value ? visibleName(value) : row.rule === '' && key === 'alias' ? 'Hidden by teacher' : 'None',
        ),
      );
      input.value = '';
      release.hidden = key !== 'alias' || row.rule === null;
      dismiss.hidden = key !== 'alias' || row.flagged === null;
    }
    async function save(action: string) {
      if (section.disabled) return;
      section.disabled = true;
      const key = field.value as Field;
      try {
        const result = await request<{ value?: string }>(endpoint, 'PUT', {
          student: row.id,
          field: key,
          action,
          value: input.value,
          previous: row[key],
          flagged: row.flagged,
          revision: row.revision,
        });
        if (!panel.isConnected) return;
        changed();
        await load(
          key === 'login' && result.value
            ? 'Give this sign-in username to the student: ' + result.value
            : 'Name controls updated.',
        );
      } catch (error) {
        status.textContent = (error as Error).message;
      } finally {
        section.disabled = false;
      }
    }
    if (row.flags.length)
      section.append(
        h(
          'p',
          {},
          'Flagged for review: ' + row.flags.map((f) => labels[f]).join(', '),
          row.flagged
            ? h('span', {}, ' · Submitted nickname: ', h('bdi', {}, visibleName(row.flagged)))
            : null,
        ),
      );
    field.onchange = selectField;
    section.append(
      h('label', {}, 'Name to manage', field),
      current,
      h('label', {}, 'Replacement name', input),
      h('button', { type: 'button', onclick: () => save('replace') }, 'Set replacement'),
      h('button', { type: 'button', onclick: () => save('remove') }, 'Remove selected name'),
      release,
      dismiss,
    );
    selectField();
    return section;
  }
  panel.append(h('button', { type: 'button', onclick: () => load() }, 'Refresh student names'));
  panel.ontoggle = () => {
    if (panel.open) void load();
  };
  queueMicrotask(() => {
    if (panel.isConnected) void load();
  });
  return panel;
}
