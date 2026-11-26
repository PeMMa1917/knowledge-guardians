import { FRAMEWORK, LEARN } from '../src/domain/learningLevels';
import { CONCEPTS, type ContentPack } from '../src/domain/types';
import type { PathStep } from '../src/domain/learningPaths';

export const TOK_AREAS = ['HIS', 'NAT', 'HUM', 'ART', 'MAT'] as const;
export const TOK_OPTIONAL_THEMES = ['TEC', 'LAN', 'POL', 'REL', 'IND'] as const;
const axes = ['concepts', 'framework', 'areas', 'optionalThemes'] as const;
type Axis = typeof axes[number];
const inventory: Record<Axis, readonly string[]> = {
  concepts: CONCEPTS, framework: FRAMEWORK, areas: TOK_AREAS, optionalThemes: TOK_OPTIONAL_THEMES,
};
const topics: readonly string[] = [...TOK_AREAS, ...TOK_OPTIONAL_THEMES];
const floor: Record<Axis, number> = { concepts: 6, framework: 2, areas: 1, optionalThemes: 1 };

interface Tags {
  concepts?: readonly string[];
  framework?: readonly string[];
  aoks?: readonly string[];
}

export interface CourseEncounter extends Tags {
  id: string;
  minute: number;
}

/** Look up the evidence attached to the exact objective or registered activity. */
export function courseTags(pack: ContentPack): ReadonlyMap<string, Tags> {
  const byId = new Map<string, Tags>(Object.entries(LEARN).map(([id, { concepts, framework }]) => [id, { concepts, framework }]));
  for (const { objectives } of pack.missions) {
    for (const { id, weave } of objectives) {
      const { concepts, framework, aoks } = weave ?? {};
      byId.set(id, { concepts, framework, aoks });
    }
  }
  return byId;
}

/** Use the existing itinerary's times and order, with only the source record's explicit tags. */
export function estimatedCourseEncounters(path: readonly PathStep[], tags: ReadonlyMap<string, Tags>) {
  let duration = 0;
  const encounters = path.map(({ id, minutes }) => {
    if (!Number.isFinite(minutes) || minutes <= 0) throw new RangeError(`Invalid estimated duration for ${id}.`);
    duration += minutes;
    return { id, minute: duration, ...tags.get(id) };
  });
  return { duration, encounters };
}

function breadth(encounters: readonly CourseEncounter[]) {
  const distinct = (list: readonly string[]) => new Set(list);
  const concepts = distinct(encounters.flatMap(({ concepts }) => concepts ?? []));
  const framework = distinct(encounters.flatMap(({ framework }) => framework ?? []));
  const aoks = distinct(encounters.flatMap(({ aoks }) => aoks ?? []));
  const seen = { concepts, framework, areas: aoks, optionalThemes: aoks };
  const present = Object.fromEntries(axes.map((axis) => [axis, inventory[axis].filter((tag) => seen[axis].has(tag))])) as Record<Axis, string[]>;
  const missing = Object.fromEntries(axes.map((axis) => [axis, inventory[axis].filter((tag) => !seen[axis].has(tag))])) as Record<Axis, string[]>;
  const unknownEncounters = (field: keyof Tags) => [...distinct(encounters.filter((step) => step[field] === undefined).map(({ id }) => id))];
  return {
    present, missing,
    unknownEncounters: { concepts: unknownEncounters('concepts'), framework: unknownEncounters('framework'), topics: unknownEncounters('aoks') },
    unrecognisedTags: {
      concepts: [...concepts].filter((tag) => !inventory.concepts.includes(tag)),
      framework: [...framework].filter((tag) => !inventory.framework.includes(tag)),
      topics: [...aoks].filter((tag) => !topics.includes(tag)),
    },
  };
}

type FloorGap = { from: number; until: number | null; below: Axis[] };

function trailingFloor(duration: number, encounters: readonly CourseEncounter[], width: number) {
  const endpoints = [...new Set([width, duration, ...encounters.flatMap(({ minute }) => [minute, minute + width])])]
    .filter((time) => time >= width && time <= duration).sort((a, b) => a - b);
  const gaps: FloorGap[] = [];
  let start = 0;
  let stop = 0;
  let firstWindow: ReturnType<typeof breadth> | null = null;
  for (const [index, from] of endpoints.entries()) {
    while (stop < encounters.length && encounters[stop].minute <= from) stop++;
    while (start < stop && encounters[start].minute + width <= from) start++;
    const coverage = breadth(encounters.slice(start, stop));
    if (index === 0) firstWindow = coverage;
    const below = axes.filter((axis) => coverage.present[axis].length < floor[axis]);
    if (!below.length) continue;
    const until = endpoints[index + 1] ?? null;
    const previous = gaps.at(-1);
    if (previous?.until === from && previous.below.join() === below.join()) previous.until = until;
    else gaps.push({ from, until, below });
  }
  return {
    width, firstWindow, gaps,
    minutesWithGap: gaps.reduce((sum, gap) => sum + (gap.until ?? duration) - gap.from, 0),
  };
}

/** Count completed actions in (end - width, end]. The first hour is a separate cumulative inventory. */
export function auditCourseFloor(duration: number, evidence: readonly CourseEncounter[]) {
  if (!Number.isFinite(duration) || duration < 0) throw new RangeError('Expected a finite, nonnegative route duration.');
  if (evidence.some(({ minute }) => !Number.isFinite(minute) || minute < 0 || minute > duration)) {
    throw new RangeError('Every completion must fall within the route duration.');
  }
  const encounters = [...evidence].sort((a, b) => a.minute - b.minute);
  const firstHourMinutes = Math.min(60, duration);
  return {
    duration, floor,
    firstHour: { minutes: firstHourMinutes, complete: duration >= 60, ...breadth(encounters.filter(({ minute }) => minute <= firstHourMinutes)) },
    wholeRoute: breadth(encounters),
    rolling: [trailingFloor(duration, encounters, 20), trailingFloor(duration, encounters, 30)],
  };
}
