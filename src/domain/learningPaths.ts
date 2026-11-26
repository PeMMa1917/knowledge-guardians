/**
 * Play-style paths for the 30-minute design audit (developers only; Mika 2026-11-26). Each path is an
 * estimated order of play: the main objectives of each chapter (with the steps they need), plus the
 * optional encounters that a kind of player tends to choose. Minutes are design estimates, not
 * measurements. The audit checks that every 30 minutes of each path meets all 12 key concepts and all
 * four parts of the knowledge framework. Players never see any of this. Pure data, no DOM.
 */
import type { Concept, ContentPack, Condition, Mission, Objective } from './types';
import { CROSSINGS } from './crossings';
import { LEARN, frameworkFromConcepts, type FrameworkPart } from './learningLevels';

export type PlayStyle = 'story' | 'social' | 'explorer' | 'puzzler' | 'cozy';
export const PLAY_STYLES: PlayStyle[] = ['story', 'social', 'explorer', 'puzzler', 'cozy'];

export interface PathStep { id: string; chapter: number; minutes: number; concepts: Concept[]; framework: FrameworkPart[] }

const deps = (c: Condition | undefined): string[] => !c ? [] : 'objective' in c ? [c.objective] : 'all' in c ? c.all.flatMap(deps) : 'any' in c ? deps(c.any[0]) : [];

/** Estimated minutes for an objective. Weave `minutes` wins when an author sets it. */
export function objectiveMinutes(o: Objective): number {
  if (o.weave?.minutes) return o.weave.minutes;
  if (/^(Arrive|Find|Follow the new passage|Go |Meet|Return|Talk to)/.test(o.title)) return 2;
  if (o.kq?.action === 'showdown' || o.kq?.action === 'exhibition') return 8;
  return 5;
}

/** Which chapter each optional registry encounter belongs to (where it first appears). */
export const OPTIONAL_CHAPTER: Record<string, number> = {
  ...Object.fromEntries(CROSSINGS.map((c) => [`crossing:${c.id}`, c.chapter])),
  'hearth:essay': 1, 'hearth:bridge': 2, 'hearth:glow': 4, 'hearth:unfinished': 5, 'hearth:puns': 7, 'hearth:source': 10, 'hearth:harrowmere': 11, 'hearth:farewell': 15,
  'field:doors': 1, 'field:guests': 1, 'field:slate': 1, 'field:word': 1, 'field:bones': 1, 'field:ballad': 1, 'field:trade': 1, 'field:dig': 5, 'field:stars': 4,
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

/** The estimated order of play for one style. */
export function playPath(pack: ContentPack, style: PlayStyle): PathStep[] {
  const objById = new Map<string, Objective>();
  for (const m of pack.missions) for (const o of m.objectives) objById.set(o.id, o);
  const out: PathStep[] = [];
  const seen = new Set<string>();
  const addObj = (id: string, ch: number) => {
    if (seen.has(id)) return;
    const o = objById.get(id); if (!o) return;
    for (const d of deps(o.done)) addObj(d, ch);
    seen.add(id);
    const concepts = o.weave?.concepts ?? [];
    out.push({ id, chapter: ch, minutes: objectiveMinutes(o), concepts, framework: o.weave?.framework ?? frameworkFromConcepts(concepts) });
  };
  const addMission = (mid: string, ch: number, all = false) => { const m = pack.missions.find((x) => x.id === mid); if (m) for (const o of m.objectives) if (all || o.essential || !m.objectives.some((x) => x.essential)) addObj(o.id, ch); };
  const addOptional = (ch: number) => {
    for (const [key, c] of Object.entries(OPTIONAL_CHAPTER)) if (c === ch && wants(style, key)) {
      const l = LEARN[key]; if (l) out.push({ id: key, chapter: ch, minutes: l.minutes, concepts: l.concepts, framework: l.framework });
    }
    if (style === 'explorer') for (const m of pack.missions) if (chapterOf(m) === ch && ch > 1 && !/-M01$/.test(m.id)) addMission(m.id, ch, true);
  };
  for (let ch = 1; ch <= 15; ch++) {
    if (ch === 1) {
      addMission('KG-CH1-M01', 1); addMission('KG-CH1-M02', 1);
      const lamp = pack.missions.find((m) => m.id === 'KG-CH1-LAMP');
      if (lamp) {
        addObj('lamp.o1.hear', 1);
        for (const k of KNOTS[style]) addMission(k, 1, true);
        addOptional(1);
        for (const o of lamp.objectives.slice(1)) addObj(o.id, 1);
      }
      continue;
    }
    const main = pack.missions.find((m) => m.id === `KG-CH${ch}-M01`);
    if (!main) continue;
    const half = Math.ceil(main.objectives.length / 2);
    main.objectives.slice(0, half).forEach((o) => o.essential && addObj(o.id, ch));
    addOptional(ch);
    main.objectives.slice(half).forEach((o) => o.essential && addObj(o.id, ch));
  }
  return out;
}

/** Every full 30-minute window that misses a concept or a framework part. */
export function pathGaps(path: PathStep[], window = 30): { from: string; to: string; missing: string[] }[] {
  const all: string[] = ['evidence', 'certainty', 'truth', 'interpretation', 'power', 'justification', 'explanation', 'objectivity', 'perspective', 'culture', 'values', 'responsibility', 'scope', 'perspectives', 'methods-and-tools', 'ethics'];
  const gaps: { from: string; to: string; missing: string[] }[] = [];
  for (let i = 0; i < path.length; i++) {
    const have = new Set<string>(); let t = 0, j = i;
    while (j < path.length && t < window) { for (const c of [...path[j].concepts, ...path[j].framework]) have.add(c); t += path[j].minutes; j++; }
    if (t < window) break;
    const missing = all.filter((d) => !have.has(d));
    if (missing.length) gaps.push({ from: path[i].id, to: path[j - 1].id, missing });
  }
  return gaps;
}
