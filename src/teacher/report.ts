/**
 * Teacher view data (spec 94, 95). Pure functions: no DOM, so they are tested.
 *
 * Input: progress files that students save from the game (Menu, "Share with
 * my teacher") and give to the teacher by choice. There is no server. The
 * files stay in this browser tab and are not stored (TEACH-002 least data).
 *
 * Rules: formative only, never a mark (TEACH-001); no public ranking of named
 * students (TEACH-003); learner-profile moments only as class totals
 * (PROFILE-001); every alert says it may be wrong (MISC-001).
 */
import type { ContentPack } from '../domain/types';
import type { SkillStage } from '../domain/skills';

export interface ProgressFile {
  format: 'knowledge-guardians-progress';
  version: 1;
  exportedAt: string;
  player: string;
  content: string;
  objectivesDone: string[];
  awards: string[];
  conceptXP: Record<string, number>;
  totalXP: number;
  moments: Record<string, { attribute: string; at: string }>;
  met: { concepts: Record<string, number>; atl: Record<string, number>; subjects: Record<string, number>; aoks: Record<string, number> };
  misconceptions: { id: string; title: string; count: number; level: 'watch' | 'alert' }[];
  portfolio: { id: string; at: string; world: string; kind: string; title: string; text: string; reflection: string }[];
  /** Skill Atlas stages (spec 76.1), only for skills met. Optional: older files have none. */
  skills?: Record<string, SkillStage>;
}

/** Check one parsed file. Returns a plain reason when it cannot be used. */
export function readProgress(raw: unknown): { ok: true; file: ProgressFile } | { ok: false; reason: string } {
  const f = raw as Partial<ProgressFile>;
  if (!f || typeof f !== 'object' || f.format !== 'knowledge-guardians-progress') return { ok: false, reason: 'This is not a Knowledge Guardians progress file.' };
  if (f.version !== 1) return { ok: false, reason: 'This progress file was made by another version of the game.' };
  if (typeof f.player !== 'string' || !Array.isArray(f.objectivesDone) || !f.met || !Array.isArray(f.portfolio) || (f.skills !== undefined && (typeof f.skills !== 'object' || f.skills === null))) return { ok: false, reason: 'This progress file is damaged.' };
  return { ok: true, file: f as ProgressFile };
}

export interface ClassAlert { id: string; title: string; teacherMove: string; students: number; share: number; classLevel: boolean }

export interface ClassSummary {
  students: number;
  concepts: Record<string, { total: number; students: number }>;
  atl: Record<string, { total: number; students: number }>;
  aoks: Record<string, { total: number; students: number }>;
  subjects: Record<string, { total: number; students: number }>;
  /** Learner-profile moments: class totals only (PROFILE-001). */
  profile: Record<string, number>;
  alerts: ClassAlert[];
  /** Skill Atlas: for each skill met by anyone, how many students are at each stage. */
  skills: Record<string, Partial<Record<SkillStage, number>>>;
  /** Concepts with the fewest students who met them: a suggested focus. */
  gaps: string[];
}

function tally(files: ProgressFile[], pick: (f: ProgressFile) => Record<string, number>): Record<string, { total: number; students: number }> {
  const out: Record<string, { total: number; students: number }> = {};
  for (const f of files) for (const [k, v] of Object.entries(pick(f) ?? {})) {
    out[k] ??= { total: 0, students: 0 };
    out[k].total += v; if (v > 0) out[k].students += 1;
  }
  return out;
}

/** Latest file per player name; later exports replace earlier ones. */
export function latestPerStudent(files: ProgressFile[]): ProgressFile[] {
  const m = new Map<string, ProgressFile>();
  for (const f of files) { const p = m.get(f.player); if (!p || p.exportedAt < f.exportedAt) m.set(f.player, f); }
  return [...m.values()].sort((a, b) => a.player.localeCompare(b.player));
}

export function summarise(files0: ProgressFile[], pack: ContentPack, dismissed: string[] = []): ClassSummary {
  const files = latestPerStudent(files0);
  const n = files.length;
  const profile: Record<string, number> = {};
  for (const f of files) for (const m of Object.values(f.moments)) profile[m.attribute] = (profile[m.attribute] ?? 0) + 1;
  const concepts = tally(files, (f) => f.met.concepts);
  // Class alert (spec 95.1 step 3): one student at the teacher threshold, or 30% of the class with the pattern.
  const alerts: ClassAlert[] = pack.misconceptions.filter((m) => !dismissed.includes(m.id)).map((m) => {
    const hit = files.filter((f) => f.misconceptions.some((x) => x.id === m.id));
    const alerted = files.filter((f) => f.misconceptions.some((x) => x.id === m.id && x.level === 'alert'));
    const share = n ? hit.length / n : 0;
    return { id: m.id, title: m.title, teacherMove: m.teacherMove, students: hit.length, share, classLevel: alerted.length > 0 || (n >= 3 && share >= 0.3) };
  }).filter((a) => a.students > 0).sort((a, b) => b.share - a.share);
  const allConcepts = ['evidence', 'certainty', 'truth', 'interpretation', 'power', 'justification', 'explanation', 'objectivity', 'perspective', 'culture', 'values', 'responsibility'];
  const gaps = [...allConcepts].sort((a, b) => (concepts[a]?.students ?? 0) - (concepts[b]?.students ?? 0)).slice(0, 3);
  const skills: ClassSummary['skills'] = {};
  for (const f of files) for (const [id, st] of Object.entries(f.skills ?? {})) {
    if (st === 'unseen') continue;
    skills[id] ??= {}; skills[id][st] = (skills[id][st] ?? 0) + 1;
  }
  return {
    students: n, concepts, skills, atl: tally(files, (f) => f.met.atl), aoks: tally(files, (f) => f.met.aoks), subjects: tally(files, (f) => f.met.subjects),
    profile, alerts, gaps,
  };
}

/** Subject links as CSV (spec 94.3 "Subject links"): one row per student and subject. */
export function subjectCsv(files0: ProgressFile[]): string {
  const rows = [['student', 'subject', 'times met']];
  for (const f of latestPerStudent(files0)) for (const [s, v] of Object.entries(f.met.subjects)) rows.push([f.player, s, String(v)]);
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
}
