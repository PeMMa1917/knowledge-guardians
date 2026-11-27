import {
  normalizeLeaderboardAlias,
  rankScoreRows,
  type LeaderboardMetric,
  type LeaderboardPeriod,
} from '../domain/leaderboard';
import { dayOf } from '../domain/ledger';
import { h } from '../ui/dom';
import { request, ServiceError } from './request';

export type BoardAudience = {
  role: 'student' | 'teacher';
  account: string;
  classId: string;
  className: string;
  teacher?: string;
};

interface Snapshot {
  clockMismatch?: boolean;
  rows: { alias: string; value: number; through: string }[];
  own?: { revision: number; alias: string | null };
}
type Selection = {
  period: LeaderboardPeriod;
  metric: LeaderboardMetric;
  periodLabel: string;
  value: number | null;
};

/** Reading a board and posting a score are separate, explicit actions. */
export function classScoreBoard(
  audience: BoardAudience,
  selected: () => Selection,
  format: (value: number, unit: string) => string,
) {
  const label = audience.className;
  const section = h(
    'details',
    { class: 'leaderboard-sharing class-score-board' },
    h('summary', {}, 'Class leaderboard · ' + label),
  );
  const status = h('p', { role: 'status', class: 'leaderboard-caption' });
  const nickname = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false' });
  const rows = h('div', { class: 'leaderboard-table' });
  const preview = h('p', {});
  const refresh = h('button', { type: 'button', onclick: () => void load() }, 'Refresh class scores');
  const publish = h(
    'button',
    { type: 'button', onclick: () => void change(false) },
    'Post this score to my class',
  );
  const remove = h(
    'button',
    { type: 'button', onclick: () => void change(true) },
    'Remove all my class scores',
  );
  const student = audience.role === 'student';
  let offered: Selection | undefined;
  let saved: Snapshot['own'],
    version = 0,
    writing = false,
    readKey = '';

  const path = (s: Selection) => {
    const q = new URLSearchParams({
      account: audience.account,
      class: audience.classId,
      day: dayOf(new Date()),
      period: s.period,
      activity: s.metric.id,
    });
    if (audience.teacher) q.set('teacher', audience.teacher);
    return audience.role + '/scores?' + q;
  };
  function controls() {
    refresh.disabled = writing;
    publish.disabled = writing || !saved || offered?.value == null || readKey !== path(selected());
    remove.disabled = writing || !saved?.alias || readKey !== path(selected());
    remove.hidden = !saved?.alias;
    nickname.disabled = writing;
  }
  function clearSnapshot() {
    saved = undefined;
    offered = undefined;
    readKey = '';
    rows.replaceChildren();
    controls();
  }
  async function load(message = '') {
    const serial = ++version;
    clearSnapshot();
    if (!section.open) return;
    const activity = selected(),
      url = path(activity);
    offered = activity;
    preview.textContent = student
      ? activity.periodLabel +
        ' · ' +
        activity.metric.label +
        ' · ' +
        (activity.value == null ? 'No recorded value yet' : format(activity.value, activity.metric.unit))
      : '';
    status.textContent = 'Loading class scores…';
    try {
      const response = await request<Snapshot>(url);
      if (serial !== version || !section.isConnected || !section.open) return;
      const ranked = rankScoreRows(response.rows, activity.metric.direction);
      if (ranked.length) {
        const list = h('tbody', {});
        for (let i = 0; i < ranked.length; i++) {
          const row = ranked[i];
          const tied = ranked[i - 1]?.value === row.value || ranked[i + 1]?.value === row.value;
          list.append(
            h(
              'tr',
              {},
              h('td', {}, row.rank + (tied ? ' (tie)' : '')),
              h('th', { scope: 'row' }, h('bdi', {}, row.alias)),
              h('td', {}, format(row.value, activity.metric.unit)),
              h('td', {}, row.through),
            ),
          );
        }
        rows.replaceChildren(
          h(
            'table',
            {},
            h('caption', {}, activity.periodLabel + ' · ' + activity.metric.label),
            h(
              'thead',
              {},
              h(
                'tr',
                {},
                ...['Rank', 'Nickname', 'Value', 'Through'].map((t) => h('th', { scope: 'col' }, t)),
              ),
            ),
            list,
          ),
        );
      }
      saved = response.own;
      readKey = url;
      if (!nickname.value && saved?.alias) nickname.value = saved.alias;
      if (response.clockMismatch) {
        offered = { ...activity, value: null };
        preview.textContent = '';
        status.textContent =
          'Check the date on this device to view or post current scores. You can still remove all your posted scores.';
        return;
      }
      status.textContent = [
        message,
        ranked.length
          ? ranked.length + ' class ' + (ranked.length === 1 ? 'entry.' : 'entries.')
          : 'Nobody has posted this activity for this period.',
      ]
        .filter(Boolean)
        .join(' ');
    } catch (err) {
      if (serial === version)
        status.textContent = err instanceof Error ? err.message : 'Could not read class scores.';
    } finally {
      if (serial === version) controls();
    }
  }
  async function change(withdraw: boolean) {
    const activity = offered,
      url = path(selected());
    if (writing || !saved || !activity) return;
    if (url !== readKey) {
      await load('The date or selection changed. Check the displayed score.');
      return;
    }
    const alias = normalizeLeaderboardAlias(nickname.value);
    if (!withdraw && !alias) {
      status.textContent = 'Choose a nickname of 2 to 24 letters, numbers, spaces or simple punctuation.';
      nickname.focus();
      return;
    }
    if (!withdraw && activity.value == null) return;
    const prior = saved.revision;
    ++version;
    writing = true;
    controls();
    try {
      await request(
        url,
        withdraw ? 'DELETE' : 'PUT',
        withdraw ? { revision: prior } : { revision: prior, alias, value: activity.value },
      );
      if (withdraw) nickname.value = '';
      await load(
        withdraw
          ? 'All your posted scores have been removed.'
          : activity.metric.label + ' was posted for ' + activity.periodLabel.toLowerCase() + '.',
      );
    } catch (err) {
      if (err instanceof ServiceError && err.status === 409)
        await load('A newer change arrived from another device. Review the board before posting.');
      else if (section.isConnected)
        status.textContent =
          err instanceof Error ? err.message : 'Could not update class scores. Refresh to check your entry.';
    } finally {
      writing = false;
      controls();
    }
  }
  section.append(
    h(
      'p',
      { class: 'leaderboard-caption' },
      'Members of ' +
        label +
        ' and its assigned teacher can see the nicknames and play results people choose to post. Equal results share a rank.',
    ),
    refresh,
    rows,
  );
  if (student)
    section.append(
      h(
        'p',
        {},
        'Post any activity you like. Your nickname applies to all your posted scores in this class. Your account name, diary and portfolio stay off the board. Scores update when you post again.',
      ),
      h('label', {}, 'Nickname for this class board', nickname),
      preview,
      h('div', { class: 'leaderboard-actions' }, publish, remove),
    );
  section.append(status);
  section.addEventListener('toggle', () => {
    if (!writing) void load();
  });
  return {
    section,
    refresh: () => {
      if (!writing) void load();
    },
  };
}
