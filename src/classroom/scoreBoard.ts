import { rankScoreRows, type LeaderboardMetric, type LeaderboardPeriod } from '../domain/leaderboard';
import { h } from '../ui/dom';
import { request, ServiceError } from './request';
import { rankedStitch } from './rankedStitch';

export type BoardAudience = {
  role: 'student' | 'teacher';
  account: string;
  classId: string;
  className: string;
  teacher?: string;
};
type Selection = { period: LeaderboardPeriod; metric: LeaderboardMetric; periodLabel: string };
type Owner = {
  revision: number;
  alias: string | null;
  rule: string | null;
  canWithdraw: boolean;
  value: number | null;
};
type Snapshot = { rows: { alias: string; value: number; through: string }[]; own?: Owner };
export function classScoreBoard(
  audience: BoardAudience,
  selected: () => Selection,
  format: (n: number, u: string) => string,
) {
  const student = audience.role === 'student';
  const section = h(
    'details',
    { class: 'leaderboard-sharing class-score-board' },
    h('summary', {}, 'Class leaderboard · ' + audience.className),
  );
  const status = h('p', { role: 'status' }),
    rows = h('div', { class: 'leaderboard-table' }),
    preview = h('p', {});
  const nickname = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false' });
  const refresh = h(
    'button',
    { type: 'button', 'data-refresh-scores': true, onclick: () => load() },
    'Refresh class scores',
  );
  const post = h('button', { type: 'button', onclick: () => change(false) }, 'Share server result');
  const remove = h('button', { type: 'button', onclick: () => change(true) }, 'Remove all my class scores');
  let version = 0,
    busy = false,
    owner: Owner | undefined,
    readPath = '';
  function path() {
    const s = selected(),
      q = new URLSearchParams({
        account: audience.account,
        class: audience.classId,
        activity: s.metric.id,
        period: s.period,
      });
    if (audience.teacher) q.set('teacher', audience.teacher);
    return audience.role + '/scores?' + q;
  }
  function controls() {
    refresh.disabled = busy;
    post.disabled = busy || !owner || owner.value === null || owner.rule === '';
    remove.disabled = busy || !owner?.canWithdraw;
    nickname.disabled = busy || !owner || owner.rule !== null;
  }
  async function load(message = '') {
    const seq = ++version,
      url = path(),
      s = selected();
    owner = undefined;
    readPath = '';
    rows.replaceChildren();
    preview.textContent = '';
    controls();
    if (!section.open) return;
    try {
      const data = await request<Snapshot>(url);
      if (seq !== version || !section.isConnected) return;
      readPath = url;
      owner = data.own;
      const ranks = rankScoreRows(data.rows, s.metric.direction);
      if (ranks.length)
        rows.append(
          h(
            'table',
            {},
            h('caption', {}, s.periodLabel + ' · ' + s.metric.label),
            h(
              'thead',
              {},
              h(
                'tr',
                {},
                ...['Rank', 'Nickname', 'Result', 'Earned (UTC)'].map((text) =>
                  h('th', { scope: 'col' }, text),
                ),
              ),
            ),
            h(
              'tbody',
              {},
              ...ranks.map((row) =>
                h(
                  'tr',
                  {},
                  h('td', {}, String(row.rank)),
                  h('th', { scope: 'row' }, h('bdi', {}, row.alias)),
                  h('td', {}, format(row.value, s.metric.unit)),
                  h('td', {}, row.through),
                ),
              ),
            ),
          ),
        );
      if (owner) {
        if (owner.rule !== null) nickname.value = owner.rule;
        else if (!nickname.value) nickname.value = owner.alias ?? '';
        preview.textContent =
          owner.value === null
            ? 'You have no server result for this period.'
            : 'Your server result: ' + format(owner.value, s.metric.unit) + '.';
      }
      status.textContent = [
        message,
        owner?.rule === ''
          ? 'Your teacher has hidden your nickname.'
          : owner?.rule
            ? 'Your teacher set your nickname.'
            : '',
        ranks.length ? ranks.length + ' ranked.' : 'No verified scores for this activity and period.',
      ]
        .filter(Boolean)
        .join(' ');
    } catch (error) {
      if (seq === version) status.textContent = (error as Error).message;
    } finally {
      if (seq === version) controls();
    }
  }
  async function change(withdraw: boolean) {
    if (busy || !owner || !section.open) return;
    if (path() !== readPath) {
      await load();
      return;
    }
    busy = true;
    controls();
    try {
      await request(
        readPath,
        withdraw ? 'DELETE' : 'PUT',
        withdraw ? { revision: owner.revision } : { revision: owner.revision, alias: nickname.value },
      );
      if (withdraw) nickname.value = '';
      await load(withdraw ? 'All your posted scores have been removed.' : 'Server result shared.');
    } catch (error) {
      if (error instanceof ServiceError && error.status === 409) await load(error.message);
      else status.textContent = (error as Error).message;
    } finally {
      busy = false;
      controls();
    }
  }
  section.append(
    h(
      'p',
      {},
      'This board ranks completed online rounds. Periods use UTC. Only members of ' +
        audience.className +
        ' and its assigned teacher can read shared results.',
    ),
    refresh,
    rows,
  );
  if (student)
    section.append(
      rankedStitch(audience, () => void load()),
      h(
        'p',
        {},
        'Sharing is optional. Your teacher can review flagged nicknames, including rejected ones. Classmates see the nickname and server result you share.',
      ),
      h('label', {}, 'Nickname for this class board', nickname),
      preview,
      h('div', { class: 'leaderboard-actions' }, post, remove),
    );
  section.append(status);
  section.ontoggle = () => {
    if (!busy) void load();
  };
  controls();
  return {
    section,
    refresh: () => {
      if (!busy) void load();
    },
  };
}
