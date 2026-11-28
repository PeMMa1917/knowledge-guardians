import { rankedActivities } from '../../shared/rankedStitch.mjs';
import { classScoreBoard, type BoardAudience } from '../classroom/scoreBoard';
import type { GameController } from '../app/controller';
import {
  leaderboardPeriodRange,
  LEADERBOARD_METRICS,
  LEADERBOARD_PERIODS,
  periodHistory,
  type LeaderboardPeriod,
} from '../domain/leaderboard';
import { h } from './dom';
import './leaderboard.css';

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  daily: 'Today',
  weekly: 'This week',
  monthly: 'This month',
  ytd: 'Year to date',
};

const METRIC_GROUPS: Array<[string, string]> = [
  ['', 'Play activity'],
  ['concept:', 'TOK concept practice'],
  ['aok:', 'Areas of knowledge'],
  ['framework:', 'Knowledge framework practice'],
  ['game:', 'Minigame activity'],
];

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });
const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const dateText = (day: string) => date.format(new Date(day + 'T12:00:00'));
const SINGULAR_UNITS: Readonly<Record<string, string>> = {
  quests: 'quest',
  characters: 'character',
  moves: 'move',
  practices: 'tagged activity',
  'percentage points': 'percentage point',
};

const ACTIVITY_HELP: Readonly<Record<string, string>> = {
  'active-seconds': 'Time spent actively playing during the selected period.',
  'map-discovery': 'Share of the registered map first revealed during this period, in percentage points.',
  'game:forecast-brier':
    'Best recorded forecast score in this period. A score nearer zero means forecasts matched the outcomes more closely.',
};

function scoreText(value: number, unit: string): string {
  if (unit === 'seconds') {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);
    return [
      hours ? `${hours} h` : '',
      minutes ? `${minutes} min` : '',
      seconds || !value ? `${seconds} sec` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
  const label =
    value === 1 ? (SINGULAR_UNITS[unit] ?? unit) : unit === 'practices' ? 'tagged activities' : unit;
  return label ? `${number.format(value)} ${label}` : number.format(value);
}

function scoreSelectors(hosted = false) {
  const period = h(
    'select',
    { 'aria-label': 'Period' },
    ...LEADERBOARD_PERIODS.map((id) => h('option', { value: id }, PERIOD_LABELS[id])),
  );
  const metrics = h(
    'select',
    { 'aria-label': 'Activity' },
    ...METRIC_GROUPS.map(([prefix, label]) => {
      const members = LEADERBOARD_METRICS.filter(
        (metric) =>
          (!hosted || rankedActivities.includes(metric.id)) &&
          (prefix ? metric.id.startsWith(prefix) : !metric.id.includes(':')),
      );
      return members.length
        ? h(
            'optgroup',
            { label },
            ...members.map((metric) => h('option', { value: metric.id }, metric.label)),
          )
        : null;
    }),
  );
  const selected = () => period.value as LeaderboardPeriod;
  const activity = () => LEADERBOARD_METRICS.find(({ id }) => id === metrics.value) ?? LEADERBOARD_METRICS[0];
  const filters = h(
    'div',
    { class: 'leaderboard-filters' },
    h('label', {}, 'Period', period),
    h('label', {}, 'Activity', metrics),
  );
  return { period, metrics, selected, activity, filters };
}

export function hostedScoreBoard(audience: BoardAudience) {
  const { period, metrics, selected, activity, filters } = scoreSelectors(true);
  const hosted = classScoreBoard(
    audience,
    () => ({ period: selected(), periodLabel: PERIOD_LABELS[selected()], metric: activity() }),
    scoreText,
  );
  hosted.section.querySelector('summary')!.after(filters);
  period.addEventListener('change', hosted.refresh);
  metrics.addEventListener('change', hosted.refresh);
  return hosted.section;
}

export function leaderboardPanel(player: GameController, audience?: BoardAudience): HTMLElement {
  const { period, metrics, selected, activity, filters } = scoreSelectors();
  const dates = h('p', { class: 'leaderboard-caption' }),
    explanation = h('p', {}),
    personal = h('p', { role: 'status' }),
    interval = h('p', {});
  function render() {
    const choice = selected(),
      metric = activity(),
      now = new Date();
    const { from, through } = leaderboardPeriodRange(choice, now);
    const history = periodHistory(player.permanent, choice, now),
      value = history.values[metric.id];
    dates.textContent = from === through ? dateText(from) : dateText(from) + ' to ' + dateText(through);
    personal.textContent = value == null ? 'No recorded value yet' : scoreText(value, metric.unit);
    interval.textContent = history.availableFrom
      ? 'Practice records start ' + dateText(history.availableFrom) + '.'
      : '';
    explanation.textContent =
      metric.unit === 'practices'
        ? 'Counts finished activities tagged with this topic.'
        : (ACTIVITY_HELP[metric.id] ?? '');
  }
  period.onchange = metrics.onchange = render;
  render();
  return h(
    'div',
    { class: 'leaderboard' },
    h(
      'section',
      {},
      h('h3', {}, 'Your practice'),
      h('p', {}, 'Device-recorded results are personal.'),
      filters,
      dates,
      personal,
      interval,
      explanation,
    ),
    audience ? hostedScoreBoard(audience) : null,
  );
}
