import type { GameController } from '../app/controller';
import {
  leaderboardFile, leaderboardPeriodRange, leaderboardWithdrawal, LEADERBOARD_METRICS, LEADERBOARD_PERIODS,
  mergeLeaderboardFiles, normalizeLeaderboardAlias, periodHistory, rankLeaderboard, readLeaderboard,
  type LeaderboardFile, type LeaderboardMetric, type LeaderboardPeriod,
} from '../domain/leaderboard';
import { h } from './dom';
import './leaderboard.css';

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  daily: 'Today', weekly: 'This week', monthly: 'This month', ytd: 'Year to date',
};

const METRIC_GROUPS: Array<[string, string]> = [
  ['', 'Play activity'],
  ['concept:', 'TOK concept practice'],
  ['aok:', 'Areas of knowledge'],
  ['framework:', 'Knowledge framework practice'],
  ['game:', 'Minigame activity'],
];

const FILE_LIMIT = 256 * 1024;
const BOARD_LIMIT = 1000;
const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });
const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const dateText = (day: string) => date.format(new Date(day + 'T12:00:00'));
const SINGULAR_UNITS: Readonly<Record<string, string>> = {
  quests: 'quest', characters: 'character', moves: 'move', practices: 'tagged activity', 'percentage points': 'percentage point',
};

const ACTIVITY_HELP: Readonly<Record<string, string>> = {
  'active-seconds': 'Time spent actively playing during the selected period.',
  'map-discovery': 'Share of the registered map first revealed during this period, in percentage points.',
  'game:forecast-brier': 'Best recorded forecast score in this period. A score nearer zero means forecasts matched the outcomes more closely.',
};

function scoreText(value: number, unit: string): string {
  if (unit === 'seconds') {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor(value % 3600 / 60);
    const seconds = Math.floor(value % 60);
    return [hours ? `${hours} h` : '', minutes ? `${minutes} min` : '', seconds || !value ? `${seconds} sec` : ''].filter(Boolean).join(' ');
  }
  const label = value === 1 ? SINGULAR_UNITS[unit] ?? unit
    : unit === 'practices' ? 'tagged activities' : unit;
  return label ? `${number.format(value)} ${label}` : number.format(value);
}

function localScoreFile(file: LeaderboardFile, name: string): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
  const link = h('a', { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The owner keeps the board's imported files in this tab's memory. */
export function leaderboardPanel(files: LeaderboardFile[], player?: GameController): HTMLElement {
  const period = h('select', {}, ...LEADERBOARD_PERIODS.map(id => h('option', { value: id }, PERIOD_LABELS[id])));
  const metrics = h('select', {}, ...METRIC_GROUPS.map(([prefix, label]) => {
    const members = LEADERBOARD_METRICS.filter(metric => prefix ? metric.id.startsWith(prefix) : !metric.id.includes(':'));
    return members.length ? h('optgroup', { label }, ...members.map(metric => h('option', { value: metric.id }, metric.label))) : null;
  }));
  const selected = () => period.value as LeaderboardPeriod;
  const activity = () => LEADERBOARD_METRICS.find(({ id }) => id === metrics.value) ?? LEADERBOARD_METRICS[0];
  const dates = h('p', { class: 'leaderboard-caption' });
  const explanation = h('p', { class: 'leaderboard-caption' });
  const filters = h('div', { class: 'leaderboard-filters' }, h('label', {}, 'Period', period), h('label', {}, 'Activity', metrics));
  const local = h('section', { class: 'leaderboard-local' }, h('h3', {}, 'Your practice'));
  const personal = h('p', { role: 'status' });
  const interval = h('p', { class: 'leaderboard-caption' });
  local.append(personal, interval);
  const imported = h('p', { role: 'status', class: 'leaderboard-caption' });
  const ranking = h('p', { role: 'status', class: 'leaderboard-caption' });
  const ranks = h('div', { class: 'leaderboard-ranks' });
  const fileInput = h('input', { type: 'file', accept: '.json,application/json', multiple: true, hidden: true });
  const add = h('button', { type: 'button', onclick: () => fileInput.click() }, 'Add score or withdrawal files');
  const clear = h('button', { type: 'button', onclick: () => {
    files.length = 0;
    imported.textContent = 'Cleared all files from this tab.';
    render();
    add.focus();
  } }, 'Clear imported files');
  const compare = h('section', { class: 'leaderboard-compare' }, h('h3', {}, 'Imported scores'),
    h('p', { class: 'leaderboard-caption' }, 'Load score files that others chose to give you. Files stay in this tab until you clear them or reload. Equal values share a rank.'),
    h('div', { class: 'leaderboard-actions' }, add, clear), fileInput, imported, ranking, ranks);
  let refreshSharing = () => {};

  function render(): void {
    const choice = selected();
    const metric = activity();
    const now = new Date();
    const { from, through } = leaderboardPeriodRange(choice, now);
    dates.textContent = from === through ? dateText(from) : `${dateText(from)} to ${dateText(through)}`;
    explanation.textContent = metric.unit === 'practices'
      ? 'Counts finished activities tagged with this topic.'
      : ACTIVITY_HELP[metric.id] ?? (metric.id.startsWith('game:') ? 'Best recorded result in this period.' : '');
    clear.disabled = add.disabled || !files.length;
    if (player) {
      const history = periodHistory(player.permanent, choice, now);
      const value = history.values[metric.id];
      personal.textContent = value == null ? 'No recorded value yet' : scoreText(value, metric.unit);
      interval.textContent = history.availableFrom && history.availableFrom > from && metric.id !== 'xp' && metric.id !== 'active-seconds'
        ? `Recording began ${dateText(history.availableFrom)}.` : '';
    }
    const localWithdrawal = player ? leaderboardWithdrawal(player.permanent, now) : null;
    const scores = localWithdrawal ? [...files, localWithdrawal] : files;
    const rows = rankLeaderboard(scores, choice, metric.id, now);
    ranking.textContent = rows.length ? `${rows.length} ${rows.length === 1 ? 'entry' : 'entries'} for this activity and period.`
      : files.length ? 'No imported score has a recorded value for this activity and period.' : 'No score files loaded yet.';
    if (!rows.length) ranks.replaceChildren();
    else {
      const rankCounts = new Map<number, number>();
      for (const row of rows) rankCounts.set(row.rank, (rankCounts.get(row.rank) ?? 0) + 1);
      ranks.replaceChildren(h('table', {},
        h('caption', {}, `${PERIOD_LABELS[choice]} · ${metric.label} · ${metric.direction === 'lower' ? 'Lower values first' : 'Higher values first'}`),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Rank'), h('th', { scope: 'col' }, 'Nickname'), h('th', { scope: 'col' }, 'Value'))),
        h('tbody', {}, ...rows.map(({ rank, alias, value, availableFrom, through: lastDay }) => {
          const notes: string[] = [];
          if (availableFrom && availableFrom > from && metric.id !== 'xp' && metric.id !== 'active-seconds') {
            notes.push(`Recorded from ${dateText(availableFrom)}`);
          }
          if (lastDay < through) notes.push(`Through ${dateText(lastDay)}`);
          return h('tr', {},
            h('td', {}, (rankCounts.get(rank) ?? 0) > 1 ? `${number.format(rank)} (tie)` : number.format(rank)),
            h('th', { scope: 'row' }, h('bdi', {}, alias), notes.length
              ? h('small', { class: 'leaderboard-caption leaderboard-row-detail' }, notes.join(' · ')) : null),
            h('td', {}, scoreText(value, metric.unit)));
        }))));
    }
    refreshSharing();
  }

  fileInput.addEventListener('change', async () => {
    const selected = Array.from(fileInput.files ?? []);
    fileInput.value = '';
    if (!selected.length) return;
    add.disabled = true;
    clear.disabled = true;
    let accepted = 0;
    for (const file of selected) {
      if (file.size > FILE_LIMIT) continue;
      try {
        const result = readLeaderboard(JSON.parse(await file.text()));
        if (result.ok) {
          const merged = mergeLeaderboardFiles(files, [result.file]);
          if (merged.length > BOARD_LIMIT) continue;
          files.splice(0, files.length, ...merged);
          accepted++;
        }
      } catch { /* Treat invalid JSON like a file of the wrong type. */ }
    }
    const skipped = selected.length - accepted;
    imported.textContent = `${accepted} ${accepted === 1 ? 'file' : 'files'} read.${skipped ? ` ${skipped} skipped. Use the score and withdrawal files from Leaderboard.` : ''}`;
    add.disabled = false;
    render();
    if (document.activeElement === document.body) add.focus();
  });
  period.addEventListener('change', render);
  metrics.addEventListener('change', render);

  const panel = h('div', { class: 'leaderboard' },
    h('p', {}, 'Compare activity recorded during play. The board reads the files you choose on this device.'),
    filters, dates, explanation, player ? local : null, compare);
  if (player) {
    const sharing = scoreSharing(player, selected, activity, render);
    refreshSharing = sharing.refresh;
    local.after(sharing.section);
  }
  render();
  return panel;
}

function scoreSharing(player: GameController, selected: () => LeaderboardPeriod,
  activity: () => LeaderboardMetric, updateBoard: () => void) {
  const nickname = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false',
    value: player.permanent.leaderboard?.sharing?.alias ?? '' });
  const status = h('p', { role: 'status', class: 'leaderboard-caption' });
  const feedback = h('p', { role: 'status', class: 'leaderboard-caption' });
  const contents = h('p', { class: 'leaderboard-caption' });
  const save = h('button', { type: 'button', onclick: () => {
    const next = normalizeLeaderboardAlias(nickname.value);
    if (!next) {
      feedback.textContent = 'Use 2 to 24 letters, numbers, spaces, or simple punctuation. Start with a letter or number.';
      nickname.focus();
      return;
    }
    if (!player.setLeaderboardSharing(next)) {
      feedback.textContent = 'Could not save this nickname. Try a different nickname or check browser storage.';
      return;
    }
    nickname.value = player.permanent.leaderboard?.sharing?.alias ?? next;
    feedback.textContent = 'Nickname saved for files you choose to download.';
    refresh();
  } }, 'Use nickname for score files');
  const readyToDownload = () => {
    if (player.canExportLeaderboard()) return true;
    feedback.textContent = 'Could not check current sharing settings. Reopen the game before downloading.';
    return false;
  };
  const exportScore = h('button', { type: 'button', onclick: () => {
    if (!readyToDownload()) return;
    const choice = selected();
    const snapshot = leaderboardFile(player.permanent, choice, new Date(), activity().id);
    if (!snapshot) {
      feedback.textContent = 'There is no score file available for this period yet.';
      return;
    }
    localScoreFile(snapshot, `knowledge-guardians-score-${choice}.json`);
    feedback.textContent = 'Download started on this device.';
  } }, 'Download score file');
  const turnOff = h('button', { type: 'button', onclick: () => {
    if (!player.setLeaderboardSharing(null)) {
      feedback.textContent = 'Could not change sharing. Check browser storage and try again.';
      return;
    }
    nickname.value = '';
    feedback.textContent = 'Score sharing is off. Download a withdrawal file for people with an earlier copy.';
    updateBoard();
    nickname.focus();
  } }, 'Turn off score sharing');
  const withdraw = h('button', { type: 'button', onclick: () => {
    if (!readyToDownload()) return;
    const file = leaderboardWithdrawal(player.permanent);
    if (!file) return;
    localScoreFile(file, 'knowledge-guardians-score-withdrawal.json');
    feedback.textContent = 'Withdrawal download started on this device.';
  } }, 'Download withdrawal file');

  function refresh(): void {
    const sharing = player.permanent.leaderboard?.sharing;
    const on = sharing?.enabled === true;
    status.textContent = on ? 'A nickname is ready. You choose whether to download and hand over a score file.' : 'Score sharing is off.';
    const selectedMetric = activity();
    const value = periodHistory(player.permanent, selected()).values[selectedMetric.id];
    contents.textContent = `${PERIOD_LABELS[selected()]} · ${selectedMetric.label} · ${value == null ? 'No recorded value to share' : scoreText(value, selectedMetric.unit)}`;
    exportScore.disabled = !on || value == null;
    turnOff.hidden = !on;
    withdraw.hidden = on || !leaderboardWithdrawal(player.permanent);
  }

  const section = h('details', { class: 'leaderboard-sharing' }, h('summary', {}, 'Score files (optional)'),
    h('p', { class: 'leaderboard-caption' }, 'Choose a nickname unrelated to your real name. The downloaded file contains the nickname, a random sharing ID and the selected activity’s value for the displayed period. Your journal, portfolio and learner profile stay private. The game records activity on this device even when score sharing is off.'),
    h('label', {}, 'Nickname for score files', nickname),
    status, contents, h('div', { class: 'leaderboard-actions' }, save, exportScore, turnOff, withdraw), feedback,
    h('p', { class: 'leaderboard-caption' }, 'Turning off sharing stops new score files. People who already have your file can load your withdrawal file with their scores to remove your entry from their comparison. This cannot erase copies they hold.'));
  return { section, refresh };
}
