import type { Concept } from './types';

/** Foregrounds for the game’s dark panels and the journal’s light printed page. */
export const CONCEPT_COLOURS = {
  evidence: { onDark: '#ffd86b', onLight: '#714a00' },
  certainty: { onDark: '#86ddff', onLight: '#0b5277' },
  truth: { onDark: '#fff2c7', onLight: '#5f4e32' },
  interpretation: { onDark: '#cbb0ff', onLight: '#5e3d87' },
  power: { onDark: '#ff9c97', onLight: '#8f2929' },
  justification: { onDark: '#90e2bd', onLight: '#18573f' },
  explanation: { onDark: '#ffb976', onLight: '#7d4119' },
  objectivity: { onDark: '#b9d9ef', onLight: '#335a70' },
  perspective: { onDark: '#d7e982', onLight: '#45600a' },
  culture: { onDark: '#ffb0dd', onLight: '#7b2b59' },
  values: { onDark: '#b4c6ff', onLight: '#3d4f9a' },
  responsibility: { onDark: '#79e0d9', onLight: '#075d57' },
} as const satisfies Record<Concept, { onDark: string; onLight: string }>;

export interface ConceptTextSegment {
  text: string;
  concept?: Concept;
}

const variants: Record<Concept, string> = {
  evidence: 'evidences', certainty: 'certainties', truth: 'truths', interpretation: 'interpretations', power: 'powers',
  justification: 'justifications', explanation: 'explanations', objectivity: 'objectivities', perspective: 'perspectives',
  culture: 'cultures', values: 'value', responsibility: 'responsibilities',
};
const conceptForWord = new Map<string, Concept>();
for (const concept of Object.keys(variants) as Concept[]) {
  conceptForWord.set(concept, concept);
  conceptForWord.set(variants[concept], concept);
}
export const WORD_CHARACTERS = '\\p{L}\\p{M}\\p{N}\\p{Pc}\\u200c\\u200d';
const word = new RegExp(`[${WORD_CHARACTERS}]+`, 'gu');

/** Find standalone concept words without changing any part of the original string. */
export function splitConceptText(text: string): ConceptTextSegment[] {
  const parts: ConceptTextSegment[] = [];
  let offset = 0;
  for (const token of text.matchAll(word)) {
    const concept = conceptForWord.get(token[0].toLowerCase());
    if (!concept) continue;
    if (token.index > offset) parts.push({ text: text.slice(offset, token.index) });
    parts.push({ text: token[0], concept });
    offset = token.index + token[0].length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}
