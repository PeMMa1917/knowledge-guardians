/**
 * Play-style paths for the 30-minute design audit (developers only; Mika 2026-11-26). Each path is an
 * estimated order of play: the main objectives of each chapter (with the steps they need), plus the
 * optional encounters that a kind of player tends to choose. Minutes are design estimates, not
 * measurements. The audit checks that every 30 minutes of each path meets all 12 key concepts and all
 * four parts of the knowledge framework. Players never see any of this. Pure data, no DOM.
 */
import { CONCEPTS, type Concept, type ContentPack, type Condition, type Mission, type Objective } from './types';
import { CROSSINGS } from './crossings';
import { FRAMEWORK, LEARN, frameworkFromConcepts, type FrameworkPart, type LearnTag } from './learningLevels';

export type PlayStyle = 'story' | 'social' | 'explorer' | 'puzzler' | 'cozy';
export const PLAY_STYLES: PlayStyle[] = ['story', 'social', 'explorer', 'puzzler', 'cozy'];

type ThinkingLevels = Pick<LearnTag, 'dok' | 'bloom' | 'fink' | 'solo'>;
export type PathDimension = Concept | FrameworkPart;
const DIMENSIONS: readonly PathDimension[] = [...CONCEPTS, ...FRAMEWORK];

export interface PathStep {
  id: string;
  chapter: number;
  minutes: number;
  concepts: readonly Concept[];
  framework: readonly FrameworkPart[];
  inferredFramework?: boolean;
  action?: string;
  levels?: ThinkingLevels;
}

// The executable Nexus trace estimates the Lens at 9 minutes, the test at 16,
// the Showdown at 22 and the label with its visitor response at 28. The
// first three objectives divide its combined 9-minute estimate.
const NEXUS_MINUTES: Partial<Record<string, number>> = {
  'm01.o1.look': 3,
  'm01.o2.inspect': 3,
  'm01.o3.lens': 3,
  'm01.o4.test': 7,
  'm01.o5.practice': 6,
  'm01.o6.label': 6,
  'nexus.ribbon.checked': 3,
  'nexus.print.checked': 5,
  'nexus.rest.checked': 5,
};

/** Existing Nexus detours observed in executable play or dedicated encounter tests. */
const NEXUS_STOPS: Partial<Record<PlayStyle, { id: string; after: string; action: string }>> = {
  social: { id: 'nexus.handle.checked', after: 'm01.o1.look', action: 'repair a handle with Kip' },
  explorer: { id: 'nexus.ribbon.checked', after: 'm01.o3.lens', action: 'place and read date rails' },
  puzzler: { id: 'nexus.print.checked', after: 'm01.o1.look', action: 'correct a slipped print' },
  cozy: { id: 'nexus.rest.checked', after: 'm01.o1.look', action: 'allocate reading rests' },
};

const deps = (c: Condition | undefined): string[] => !c ? [] : 'objective' in c ? [c.objective] : 'all' in c ? c.all.flatMap(deps) : 'any' in c ? deps(c.any[0]) : [];

/** Estimated minutes for an objective. Weave `minutes` wins when an author sets it. */
export function objectiveMinutes(o: Objective): number {
  const authored = o.weave?.minutes ?? NEXUS_MINUTES[o.id];
  if (authored !== undefined) return authored;
  if (/^(Arrive|Find|Follow the new passage|Go |Meet|Return|Talk to)/.test(o.title)) return 2;
  if (o.kq?.action === 'showdown' || o.kq?.action === 'exhibition') return 8;
  return 5;
}

/** Which chapter each optional registry encounter belongs to (where it first appears). */
export const OPTIONAL_CHAPTER: Record<string, number> = {
  ...Object.fromEntries(CROSSINGS.map((c) => [`crossing:${c.id}`, c.chapter])),
  'hearth:essay': 1, 'hearth:bridge': 2, 'hearth:glow': 4, 'hearth:unfinished': 5, 'hearth:puns': 7, 'hearth:source': 10, 'hearth:harrowmere': 11, 'hearth:farewell': 15,
  'field:proving': 1, 'field:doors': 1, 'field:guests': 1, 'field:slate': 1, 'field:word': 1, 'field:bones': 1, 'field:ballad': 1, 'field:trade': 1, 'field:dig': 5, 'field:stars': 4, 'field:ladder': 2, 'field:trees': 5, 'field:assay': 6, 'field:relay': 7, 'field:lens': 9,
  'loyalty:sefa': 1, 'loyalty:hesper': 1, 'loyalty:kip': 2, 'loyalty:rook': 10,
};

/** Lamp knots each style tends to choose for "light six lamps" in chapter 1 (mission ids). */
const KNOTS: Record<PlayStyle, string[]> = {
  story: ['KG-CH1-B01', 'KG-CH1-V01', 'KG-CH1-K01', 'KG-CH1-T01', 'KG-CH1-E01'],
  social: ['KG-CH1-R01', 'KG-CH1-S02', 'KG-CH1-Q01', 'KG-CH1-F01', 'KG-CH1-P01'],
  explorer: ['KG-CH1-B01', 'KG-CH1-V01', 'KG-CH1-K01', 'KG-CH1-R01', 'KG-CH1-S02', 'KG-CH1-P01'],
  puzzler: ['KG-CH1-S04', 'KG-CH1-B01', 'KG-CH1-H01', 'KG-CH1-A01', 'KG-CH1-N01'],
  cozy: ['KG-CH1-S02', 'KG-CH1-A01', 'KG-CH1-K01', 'KG-CH1-T01', 'KG-CH1-F01'],
};

function wants(style: PlayStyle, key: string): boolean {
  const [family, id] = key.split(':');
  const c = family === 'crossing' ? CROSSINGS.find((x) => x.id === id) : undefined;
  switch (style) {
    case 'story': return false;
    case 'social': return family === 'hearth' || family === 'loyalty' || (!!c && c.types.some((t) => t === 'person' || t === 'society' || t === 'self'));
    case 'explorer': return family === 'crossing' || family === 'loyalty';
    case 'puzzler': return family === 'field' || (!!c && c.types.some((t) => t === 'technology' || t === 'fate'));
    case 'cozy': return family === 'hearth' || family === 'field' || (!!c && c.tone !== 'serious');
  }
}

const chapterOf = (m: Mission): number => Number(/^KG-CH(\d+)-/.exec(m.id)?.[1] ?? 0);

/** The estimated order of play for one style. Select a case visit, or follow every optional case. */
export function playPath(pack: ContentPack, style: PlayStyle, caseVisit: number | 'all' = 0): PathStep[] {
  const objById = new Map<string, Objective>();
  for (const m of pack.missions) for (const o of m.objectives) objById.set(o.id, o);
  const out: PathStep[] = [];
  const seen = new Set<string>();
  const addObj = (id: string, ch: number, action?: string) => {
    if (seen.has(id)) return;
    const o = objById.get(id); if (!o) return;
    for (const d of deps(o.done)) addObj(d, ch);
    seen.add(id);
    const concepts = o.weave?.concepts ?? [];
    out.push({
      id, chapter: ch, minutes: objectiveMinutes(o), concepts, action: o.kq?.action ?? action, levels: o.weave?.thinking,
      framework: o.weave?.framework ?? frameworkFromConcepts(concepts),
      inferredFramework: o.weave?.framework === undefined,
    });
  };
  const addMission = (mid: string, ch: number, all = false) => {
    const m = pack.missions.find((x) => x.id === mid);
    if (!m) return;
    const visits = m.caseVisits ?? [];
    const visit = caseVisit === 'all' || !visits.length ? undefined : visits[caseVisit % visits.length];
    if (visit) for (const id of visit) addObj(id, ch);
    const independent = new Set(visit ? visits.flat() : []);
    const required = m.objectives.some((o) => o.essential);
    for (const o of m.objectives) if (!independent.has(o.id) && (all || o.essential || !required)) addObj(o.id, ch);
  };
  const addOptional = (ch: number) => {
    for (const [key, c] of Object.entries(OPTIONAL_CHAPTER)) if (c === ch && wants(style, key)) {
      const l = LEARN[key];
      if (l) out.push({ id: key, chapter: ch, minutes: l.minutes, concepts: l.concepts, framework: l.framework, action: key.split(':')[0], levels: l });
    }
  };
  for (let ch = 1; ch <= 15; ch++) {
    if (ch === 1) {
      const opening = pack.missions.find((m) => m.id === 'KG-CH1-M01');
      const stop = NEXUS_STOPS[style];
      for (const objective of opening?.objectives ?? []) {
        if (!objective.essential) continue;
        addObj(objective.id, 1);
        if (stop?.after === objective.id) addObj(stop.id, 1, stop.action);
      }
      const followsLastTurn = style === 'social' || style === 'explorer';
      const emberford = pack.missions.find((m) => m.id === 'KG-CH1-M02');
      for (const objective of emberford?.objectives ?? []) {
        if (!objective.essential) continue;
        addObj(objective.id, 1);
        if (followsLastTurn && objective.id === 'm02.o5.showdown') {
          addObj('last-turn.compare', 1, 'read two workplace accounts');
          addObj('last-turn.publish', 1, 'reserve a turn or open an intake');
        }
      }
      const lamp = pack.missions.find((m) => m.id === 'KG-CH1-LAMP');
      if (lamp) {
        addObj('lamp.o1.hear', 1);
        for (const k of KNOTS[style]) addMission(k, 1, true);
        addOptional(1);
        for (const o of lamp.objectives.slice(1)) {
          addObj(o.id, 1);
          if (followsLastTurn && o.id === 'lamp.o3.cellar') addObj('last-turn.follow', 1, 'check the filed account');
        }
      }
      continue;
    }
    const main = pack.missions.find((m) => m.id === `KG-CH${ch}-M01`);
    if (!main) continue;
    const half = Math.ceil(main.objectives.length / 2);
    const laterObjectives = new Set(main.objectives.slice(half).map((o) => o.id));
    const middle = new Set(style === 'explorer' ? pack.missions.filter((m) => chapterOf(m) === ch && m.id !== main.id) : []);
    const afterRevision: Mission[] = [];
    // A side mission can depend on another side mission that opens after the revision.
    for (let moved = true; moved;) {
      moved = false;
      for (const m of middle) {
        if (!deps(m.available).some((id) => laterObjectives.has(id))) continue;
        middle.delete(m);
        afterRevision.push(m);
        for (const o of m.objectives) laterObjectives.add(o.id);
        moved = true;
      }
    }
    main.objectives.slice(0, half).forEach((o) => o.essential && addObj(o.id, ch));
    addOptional(ch);
    middle.forEach((m) => addMission(m.id, ch, true));
    main.objectives.slice(half).forEach((o) => o.essential && addObj(o.id, ch));
    afterRevision.forEach((m) => addMission(m.id, ch, true));
  }
  return out;
}

export interface PathGap {
  /** Estimated ending times of the affected trailing windows. */
  from: number;
  /** Exclusive. Null indicates the interval includes the final window. */
  until: number | null;
  missing: PathDimension[];
}

interface WindowCoverage {
  missing: PathDimension[];
  singleAction: PathDimension[];
  inferredOnly: FrameworkPart[];
}

interface ActionProfile {
  steps: number;
  actions: Record<string, number>;
  withoutActionTag: number;
  withoutLevelTags: number;
  levels: Record<keyof ThinkingLevels, Record<string, number>>;
}

function actionProfile(steps: readonly PathStep[]): ActionProfile {
  const actions = new Map<string, number>();
  const levels: ActionProfile['levels'] = { dok: {}, bloom: {}, fink: {}, solo: {} };
  let withoutActionTag = 0;
  let withoutLevelTags = 0;
  for (const { action, levels: thinking } of steps) {
    if (action) actions.set(action, (actions.get(action) ?? 0) + 1);
    else withoutActionTag++;
    if (thinking) {
      for (const scale of ['dok', 'bloom', 'fink', 'solo'] as const) {
        const level = thinking[scale];
        levels[scale][level] = (levels[scale][level] ?? 0) + 1;
      }
    } else withoutLevelTags++;
  }
  return { steps: steps.length, actions: Object.fromEntries(actions), withoutActionTag, withoutLevelTags, levels };
}

function windowCoverage(steps: readonly PathStep[]): WindowCoverage {
  const actions = new Map<PathDimension, Set<string>>();
  const explicitFramework = new Set<FrameworkPart>();
  for (const step of steps) {
    for (const dimension of [...step.concepts, ...step.framework]) {
      const supporting = actions.get(dimension) ?? new Set<string>();
      supporting.add(step.id);
      actions.set(dimension, supporting);
    }
    if (!step.inferredFramework) for (const part of step.framework) explicitFramework.add(part);
  }
  return {
    missing: DIMENSIONS.filter((dimension) => !actions.has(dimension)),
    singleAction: DIMENSIONS.filter((dimension) => actions.get(dimension)?.size === 1),
    inferredOnly: FRAMEWORK.filter((part) => actions.has(part) && !explicitFramework.has(part)),
  };
}

/** Audit the trailing window (end - window, end] at every time it can change.
 * An estimated action counts at completion. A step's tags cannot show which
 * parts of the action are encountered earlier or which details players notice.
 */
export function auditPath(path: readonly PathStep[], window = 30) {
  if (!Number.isFinite(window) || window <= 0) throw new RangeError('The window must have a positive finite duration.');
  let minutes = 0;
  const encounters = path.map((step) => {
    if (!Number.isFinite(step.minutes) || step.minutes <= 0) throw new RangeError(`Invalid estimated duration for ${step.id}.`);
    minutes += step.minutes;
    if (!Number.isFinite(minutes)) throw new RangeError('The estimated path duration must be finite.');
    return { minute: minutes, step };
  });
  const endTimes = [...new Set([window, minutes, ...encounters.flatMap(({ minute }) => [minute, minute + window])])]
    .filter((minute) => minute >= window && minute <= minutes)
    .sort((a, b) => a - b);
  const firstSteps = encounters.filter(({ minute }) => minute <= window).map(({ step }) => step);
  const gaps: PathGap[] = [];
  const singleAction = new Set<PathDimension>();
  const inferredOnly = new Set<FrameworkPart>();
  endTimes.forEach((from, index) => {
    const until = endTimes[index + 1] ?? null;
    const steps = encounters.filter(({ minute }) => minute <= from && from < minute + window).map(({ step }) => step);
    const coverage = windowCoverage(steps);
    for (const dimension of coverage.singleAction) singleAction.add(dimension);
    for (const part of coverage.inferredOnly) inferredOnly.add(part);
    if (coverage.missing.length === 0) return;
    const previous = gaps.at(-1);
    if (previous?.until === from && previous.missing.join() === coverage.missing.join()) previous.until = until;
    else gaps.push({ from, until, missing: coverage.missing });
  });
  return {
    minutes,
    encounters,
    firstWindow: minutes < window ? null : { ...windowCoverage(firstSteps), profile: actionProfile(firstSteps) },
    gaps,
    gapMinutes: gaps.reduce((total, gap) => total + (gap.until ?? minutes) - gap.from, 0),
    singleAction: DIMENSIONS.filter((dimension) => singleAction.has(dimension)),
    inferredOnly: FRAMEWORK.filter((part) => inferredOnly.has(part)),
    profile: actionProfile(path),
  };
}
