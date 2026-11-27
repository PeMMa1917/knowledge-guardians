/**
 * Learning tags for designers (Mika, 2026-11-26). Every encounter should weave TOK key concepts and
 * parts of the knowledge framework, and the thinking it asks for should vary: Webb's depth of
 * knowledge (DOK 1 to 4), Bloom's levels, Fink's dimensions of significant learning and SOLO levels.
 * These tags are for developers and teachers only. Players never see a level and are never graded:
 * nothing in the game is an exam (Mika's rule). Objectives carry concepts in their `weave`; this file
 * tags the encounters that live in TypeScript registries (crossings, hearth talks, field games,
 * loyalty missions). Pure data, no DOM.
 */
import type { AOK, Concept } from './types';

export type FrameworkPart = 'scope' | 'perspectives' | 'methods-and-tools' | 'ethics';
export const FRAMEWORK: FrameworkPart[] = ['scope', 'perspectives', 'methods-and-tools', 'ethics'];
export type Bloom = 'remember' | 'understand' | 'apply' | 'analyse' | 'evaluate' | 'create';
export const BLOOM: Bloom[] = ['remember', 'understand', 'apply', 'analyse', 'evaluate', 'create'];
export type Fink = 'foundational' | 'application' | 'integration' | 'human' | 'caring' | 'learning-to-learn';
export const FINK: Fink[] = ['foundational', 'application', 'integration', 'human', 'caring', 'learning-to-learn'];
export type Solo = 'unistructural' | 'multistructural' | 'relational' | 'extended';
export const SOLO: Solo[] = ['unistructural', 'multistructural', 'relational', 'extended'];

export interface LearnTag {
  concepts: Concept[];
  framework: FrameworkPart[];
  /** Areas and optional themes encountered on every normal completion route. */
  aoks?: readonly AOK[];
  dok: 1 | 2 | 3 | 4;
  bloom: Bloom;
  fink: Fink;
  solo: Solo;
  /** Estimated minutes of play (for the 30-minute design audit). */
  minutes: number;
}

const S: FrameworkPart = 'scope', P: FrameworkPart = 'perspectives', M: FrameworkPart = 'methods-and-tools', E: FrameworkPart = 'ethics';
const t = (concepts: Concept[], framework: FrameworkPart[], dok: LearnTag['dok'], bloom: Bloom, fink: Fink, solo: Solo, minutes: number): LearnTag =>
  ({ concepts, framework, dok, bloom, fink, solo, minutes });

/** Keys are `<family>:<id>`: crossing, hearth, field, loyalty. */
export const LEARN: Record<string, LearnTag> = {
  // Crossings (src/domain/crossings.ts)
  'crossing:lamb': t(['evidence', 'certainty'], [M], 2, 'apply', 'application', 'multistructural', 4),
  'crossing:lintel': t(['power', 'justification', 'truth'], [S, P], 3, 'evaluate', 'learning-to-learn', 'relational', 4),
  'crossing:repair-queue': t(['evidence', 'justification', 'perspective', 'power', 'responsibility'], [S, P, M, E], 3, 'evaluate', 'human', 'relational', 6),
  'crossing:borrowed': t(['interpretation', 'perspective', 'evidence'], [P, M], 3, 'analyse', 'integration', 'relational', 4),
  'crossing:warm-room': t(['values', 'responsibility', 'truth'], [S, E], 4, 'evaluate', 'caring', 'extended', 5),
  'crossing:tide-engine': t(['certainty', 'objectivity', 'explanation'], [M], 3, 'analyse', 'application', 'relational', 4),
  'crossing:geese': t(['objectivity', 'evidence'], [M, E], 2, 'apply', 'application', 'multistructural', 3),
  'crossing:furnace': t(['evidence', 'objectivity', 'power'], [M], 3, 'apply', 'application', 'relational', 4),
  'crossing:crowd': t(['power', 'evidence', 'responsibility'], [E, P], 3, 'evaluate', 'human', 'relational', 4),
  'crossing:drowned-bell': t(['culture', 'interpretation', 'explanation'], [P, S], 4, 'analyse', 'integration', 'extended', 5),
  'crossing:fortune': t(['certainty', 'explanation', 'evidence'], [M], 2, 'understand', 'foundational', 'multistructural', 3),
  'crossing:stage-fright': t(['certainty', 'responsibility'], [P], 2, 'create', 'learning-to-learn', 'multistructural', 3),
  'crossing:patron': t(['culture', 'values', 'power', 'justification'], [P, E, S], 4, 'evaluate', 'caring', 'extended', 5),
  'crossing:goat': t(['evidence', 'truth', 'certainty'], [M], 2, 'analyse', 'human', 'multistructural', 3),
  'crossing:sluice': t(['values', 'responsibility', 'evidence'], [E], 4, 'evaluate', 'caring', 'relational', 5),
  'crossing:name-box': t(['power', 'culture', 'objectivity'], [E, S], 3, 'create', 'caring', 'extended', 4),
  'crossing:two-elders': t(['truth', 'interpretation', 'perspective'], [P, M], 2, 'analyse', 'human', 'relational', 4),
  'crossing:last-lamp': t(['culture', 'perspective', 'certainty', 'interpretation', 'values', 'responsibility', 'justification'], [S, P, M, E], 3, 'evaluate', 'caring', 'relational', 7),
  'crossing:launch': t(['culture', 'perspective', 'evidence', 'justification'], [P, M], 4, 'evaluate', 'integration', 'extended', 5),
  // Hearth talks (src/domain/hearth.ts)
  'hearth:essay': t(['interpretation', 'explanation'], [S], 1, 'understand', 'foundational', 'unistructural', 2),
  'hearth:bridge': t(['perspective', 'culture', 'values'], [P], 3, 'analyse', 'integration', 'relational', 3),
  'hearth:glow': t(['certainty', 'responsibility'], [E], 2, 'evaluate', 'learning-to-learn', 'multistructural', 2),
  'hearth:unfinished': t(['certainty', 'explanation'], [M], 1, 'understand', 'learning-to-learn', 'unistructural', 2),
  'hearth:puns': t(['interpretation', 'truth'], [S], 1, 'create', 'human', 'multistructural', 3),
  'hearth:source': t(['evidence', 'justification', 'perspective'], [M, P], 3, 'evaluate', 'integration', 'relational', 3),
  'hearth:harrowmere': t(['responsibility', 'values', 'power'], [E], 4, 'evaluate', 'caring', 'extended', 3),
  'hearth:farewell': t(['values', 'responsibility'], [E], 1, 'remember', 'caring', 'unistructural', 2),
  // Field games (src/domain/fieldgames.ts)
  // The counting frame runs with an informed host and a forgetful host before completion.
  'field:doors': { ...t(['certainty', 'evidence', 'justification'], [M], 3, 'analyse', 'application', 'relational', 8), aoks: ['MAT', 'TEC'] },
  // A restartable trial: guess a rule from examples, then test it on new tiles; the last span has two rules that fit.
  'field:proving': { ...t(['evidence', 'certainty', 'justification'], [M], 3, 'analyse', 'application', 'relational', 6), aoks: ['NAT', 'MAT'] },
  'field:guests': t(['certainty', 'explanation'], [M, S], 2, 'apply', 'foundational', 'multistructural', 6),
  'field:slate': t(['interpretation', 'culture', 'objectivity'], [S, M], 3, 'evaluate', 'integration', 'relational', 6),
  // Before painting, players see the same readers react to at least two wordings of the same toll.
  'field:word': { ...t(['power', 'perspective', 'values'], [P, E], 4, 'create', 'human', 'extended', 8), aoks: ['HUM', 'LAN'] },
  'field:bones': t(['evidence', 'certainty'], [M], 2, 'apply', 'application', 'multistructural', 6),
  'field:ballad': t(['truth', 'evidence', 'power'], [E, M], 2, 'evaluate', 'learning-to-learn', 'multistructural', 5),
  'field:stars': t(['interpretation', 'culture', 'perspective', 'objectivity'], [P, S, M], 3, 'create', 'integration', 'relational', 7),
  'field:dig': t(['evidence', 'responsibility', 'values', 'certainty'], [M, E], 3, 'apply', 'caring', 'relational', 7),
  // Make a ladder, test three patterns (two break), build a proof from the rules, then say what it covers.
  'field:ladder': { ...t(['certainty', 'justification', 'evidence'], [M], 3, 'analyse', 'application', 'relational', 8), aoks: ['MAT'] },
  // Choose a triangle in a grove (a line is refused), see other shapes, say where the shape came from, then pace a side.
  'field:trees': { ...t(['interpretation', 'objectivity', 'perspective'], [M], 2, 'evaluate', 'integration', 'relational', 6), aoks: ['MAT', 'NAT'] },
  // Join a print, a poem, a debate record and a machine engraving about child sweeps; name the missing voice.
  'field:collage': { ...t(['evidence', 'interpretation', 'perspective', 'power'], [S, M, P], 3, 'analyse', 'human', 'relational', 6), aoks: ['ART', 'HIS'] },
  // Rank five people from one flood night, hear who ranks the same way, then rank again after a new fact.
  'field:river': { ...t(['values', 'responsibility', 'perspective', 'evidence'], [E, P], 3, 'evaluate', 'caring', 'relational', 6), aoks: ['HUM', 'POL'] },
  // Walk an island maze through three map lenses; one plan path is gone; no lens alone reaches the ferry.
  'field:maze': { ...t(['perspective', 'interpretation', 'evidence', 'objectivity'], [S, M], 2, 'apply', 'integration', 'relational', 5), aoks: ['NAT', 'HUM'] },
  // Design a study of people: how they join, what is kept, who sees it first; then read the trial week and its warnings.
  'field:survey': { ...t(['responsibility', 'evidence', 'values', 'power'], [M, E], 3, 'create', 'caring', 'relational', 5), aoks: ['HUM', 'POL'] },
  // See your first and latest journal entries, decide how to rewrite the first, and hear your past self answer.
  'field:mirror': { ...t(['certainty', 'perspective', 'responsibility', 'truth'], [S, P], 2, 'evaluate', 'learning-to-learn', 'extended', 4), aoks: ['HUM'] },
  // Listen with bare ears, tune a detector to find bats, hear a catch, then say what we can know of the bat's experience.
  'field:bats': { ...t(['perspective', 'objectivity', 'evidence', 'certainty', 'truth'], [S, M], 3, 'evaluate', 'human', 'relational', 5), aoks: ['NAT', 'HUM'] },
  // Spend ten tokens to defend market rules, see what is kept or clashes, compare two keepers, name the value.
  'field:fair': { ...t(['values', 'justification', 'responsibility', 'power'], [P, E], 3, 'evaluate', 'human', 'relational', 5), aoks: ['HUM', 'POL'] },
  // Choose two lenses and two objects for one event, hear what the account leaves out, then title it.
  'field:lens': { ...t(['perspective', 'interpretation', 'evidence', 'values', 'power'], [S, P, E], 3, 'evaluate', 'human', 'relational', 5), aoks: ['HIS', 'ART'] },
  // Send a message by drawings through two copyists; see what is lost or reversed; paint shared keys and resend.
  'field:relay': { ...t(['interpretation', 'evidence', 'culture', 'perspective'], [S, M], 3, 'analyse', 'integration', 'relational', 6), aoks: ['LAN', 'ART'] },
  // Four claims, two samples each; run the streak or density test; call same or different; a wrong call restarts the round.
  'field:assay': { ...t(['evidence', 'certainty', 'justification', 'values'], [S], 3, 'evaluate', 'application', 'relational', 6), aoks: ['NAT'] },
  'field:trade': t(['values', 'justification', 'perspective'], [P, S], 2, 'analyse', 'human', 'multistructural', 6),
  // Loyalty missions (src/domain/loyalty.ts)
  'loyalty:sefa': t(['culture', 'truth', 'values'], [P, E], 4, 'evaluate', 'caring', 'extended', 10),
  'loyalty:kip': t(['evidence', 'justification', 'truth'], [M], 3, 'analyse', 'integration', 'relational', 10),
  'loyalty:hesper': t(['responsibility', 'culture', 'justification'], [E, P], 3, 'evaluate', 'caring', 'relational', 10),
  'loyalty:rook': t(['evidence', 'objectivity', 'responsibility'], [M, E], 4, 'evaluate', 'learning-to-learn', 'extended', 10),
};

/**
 * Framework parts implied by an objective's concepts, for objectives that do not list them yet.
 * A designer's rule of thumb, not a definition: methods and tools for how we check, perspectives
 * for who sees what, ethics for what we owe, scope for what a claim covers and its limits.
 */
export function frameworkFromConcepts(concepts: readonly Concept[]): FrameworkPart[] {
  const out = new Set<FrameworkPart>();
  for (const c of concepts) {
    if (['evidence', 'objectivity', 'explanation', 'justification'].includes(c)) out.add(M);
    if (['perspective', 'culture', 'interpretation'].includes(c)) out.add(P);
    if (['values', 'responsibility', 'power'].includes(c)) out.add(E);
    if (['truth', 'certainty'].includes(c)) out.add(S);
  }
  return FRAMEWORK.filter((f) => out.has(f));
}
