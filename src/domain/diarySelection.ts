import type { AdventureJournalView, JournalEntry, JournalReflection } from './adventureJournal';
import type { EncyclopediaLink } from './encyclopedia';
import type { FrameworkPart } from './learningLevels';
import type { AOK, Concept, Weave } from './types';

export const DIARY_AREAS = ['HIS', 'NAT', 'HUM', 'ART', 'MAT'] as const satisfies readonly AOK[];
export const DIARY_THEMES = ['TEC', 'LAN', 'POL', 'REL', 'IND'] as const satisfies readonly AOK[];

export type DiaryTopics = {
  concepts?: readonly Concept[];
  framework?: readonly FrameworkPart[];
  areas?: readonly (typeof DIARY_AREAS)[number][];
  themes?: readonly (typeof DIARY_THEMES)[number][];
};

export function diaryTopics(weave: Weave): DiaryTopics {
  return {
    concepts: weave.concepts,
    framework: weave.framework,
    areas: DIARY_AREAS.filter((area) => weave.aoks?.includes(area)),
    themes: DIARY_THEMES.filter((theme) => weave.aoks?.includes(theme)),
  };
}

export type DiaryTime = { kind: 'all' } | { kind: 'session'; startedAt: number | null }
  | { kind: 'week' } | { kind: 'dates'; from: string; through: string };

export interface DiarySelection {
  time: DiaryTime;
  topics?: DiaryTopics;
  now: Date;
  includeUntaggedWriting?: boolean;
}

export function hasDiaryTopics(topics?: DiaryTopics): boolean {
  return !!topics && Object.values(topics).some((values) => !!values?.length);
}

function containsAny<T>(selected: readonly T[] | undefined, values: readonly T[] | undefined) {
  return !selected?.length || !!values?.some((value) => selected.includes(value));
}

function matchesTopics(selected?: DiaryTopics, topics?: DiaryTopics) {
  return containsAny(selected?.concepts, topics?.concepts)
    && containsAny(selected?.framework, topics?.framework)
    && containsAny(selected?.areas, topics?.areas)
    && containsAny(selected?.themes, topics?.themes);
}

function localMidnight(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = localMidnight(year, month, day);
  return year > 0 && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

function timeWindow(time: DiaryTime, now: Date): readonly [number, number] | string | undefined {
  switch (time.kind) {
    case 'all': return undefined;
    case 'session': return time.startedAt === null ? 'Start or continue an adventure to export this session.' : [time.startedAt, now.getTime() + 1];
    case 'week': {
      const monday = now.getDate() - ((now.getDay() + 6) % 7);
      return [localMidnight(now.getFullYear(), now.getMonth(), monday).getTime(),
        localMidnight(now.getFullYear(), now.getMonth(), monday + 7).getTime()];
    }
    case 'dates': {
      const from = parseLocalDate(time.from);
      const through = parseLocalDate(time.through);
      if (!from || !through) return 'Choose a start date and an end date.';
      if (from > through) return 'Choose an end date on or after the start date.';
      return [from.getTime(), localMidnight(through.getFullYear(), through.getMonth(), through.getDate() + 1).getTime()];
    }
  }
}

function matchedEncyclopedia(entries: AdventureJournalView['entries']): EncyclopediaLink[] {
  const links = new Map<string, EncyclopediaLink>();
  for (const { encyclopedia } of entries) {
    if (encyclopedia && (!links.has(encyclopedia.key) || encyclopedia.encounter === 'met')) links.set(encyclopedia.key, encyclopedia);
  }
  return [...links.values()];
}

type UntaggedDiaryReflection = Pick<JournalEntry, 'title' | 'at' | 'mapId'> & { reflections: JournalReflection[] };

export type DiarySelectionResult = { view: AdventureJournalView; untaggedReflections?: UntaggedDiaryReflection[]; error?: never }
  | { view?: never; error: string };

/** Filter by recorded time and explicit tags. Within a topic group any selected value can match. */
export function selectDiary(view: AdventureJournalView, selection?: DiarySelection): DiarySelectionResult {
  if (!selection) return { view };
  const window = timeWindow(selection.time, selection.now);
  if (typeof window === 'string') return { error: window };
  const topicFilter = hasDiaryTopics(selection.topics);
  if (!window && !topicFilter) return { view };
  const within = (at: string | null) => {
    if (!window) return true;
    const instant = at ? Date.parse(at) : NaN;
    return instant >= window[0] && instant < window[1];
  };
  const datedEntries = view.entries.filter(({ at }) => within(at));
  const entries = datedEntries.filter(({ topics }) => matchesTopics(selection.topics, topics));
  const includeStandalone = !topicFilter || selection.includeUntaggedWriting === true;
  const untaggedReflections = topicFilter && includeStandalone ? datedEntries.flatMap(({ title, at, mapId, topics, reflections }) => {
    if (hasDiaryTopics(topics)) return [];
    const answered = reflections?.filter(({ response }) => response !== undefined);
    return answered?.length ? [{ title, at, mapId, reflections: answered }] : [];
  }) : [];
  const keptSpecimens = new Set(entries.flatMap((entry) => entry.specimenReference ? [entry.specimenReference] : []));
  const encounters = new Set(entries.map(entry => entry.event?.key));
  return { untaggedReflections, view: {
    ...view,
    entries,
    notes: includeStandalone ? view.notes.filter((note) => within(note.at)) : [],
    portfolioWriting: includeStandalone ? view.portfolioWriting?.filter((writing) => within(writing.at)) : [],
    quests: [],
    references: view.references.filter(({ key }) => keptSpecimens.has(key)),
    ...(view.readings && { readings: view.readings.filter(reading => reading.encounterKeys.some(key => encounters.has(key))) }),
    encyclopedia: matchedEncyclopedia(entries),
  } };
}
