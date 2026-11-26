import { describe, expect, it } from 'vitest';
import { CONCEPT_COLOURS, splitConceptText } from '../src/domain/conceptText';
import { CONCEPTS } from '../src/domain/types';

const luminance = (hex: string): number => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
  .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

function contrast(a: string, b: string): number {
  const [dark, light] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (light + 0.05) / (dark + 0.05);
}

const termPairs = [
  ['evidence', 'evidences'], ['certainty', 'certainties'], ['truth', 'truths'], ['interpretation', 'interpretations'],
  ['power', 'powers'], ['justification', 'justifications'], ['explanation', 'explanations'], ['objectivity', 'objectivities'],
  ['perspective', 'perspectives'], ['culture', 'cultures'], ['values', 'value'], ['responsibility', 'responsibilities'],
] as const;

describe('concept text', () => {
  it('finds all 12 singular/plural families with original case, order and exact punctuation', () => {
    const text = termPairs.map(([label, variant]) => `(${label[0].toUpperCase() + label.slice(1)}, ${variant.toUpperCase()}, ${label})`).join('\n');
    const parts = splitConceptText(text);
    expect(parts.map(({ text }) => text).join('')).toBe(text);
    expect(parts.flatMap(({ concept }) => concept ? [concept] : [])).toEqual(CONCEPTS.flatMap((concept) => [concept, concept, concept]));
    expect(parts.find(({ text }) => text === 'RESPONSIBILITIES')?.concept).toBe('responsibility');
  });

  it('uses Unicode word boundaries and keeps markup-looking input plain', () => {
    const text = 'truthful 𐐀truth truthß truth_2 not_evidence TrUthé truth\u0301 truth\u200dful 5truth 𝟟truth ' +
      '<fake>truth</fake> truth’s (values), counter-evidence; cultures—culture!';
    const parts = splitConceptText(text);
    expect(parts.map(({ text }) => text).join('')).toBe(text);
    expect(parts.flatMap(({ concept, text }) => concept ? [text] : [])).toEqual(['truth', 'truth', 'values', 'evidence', 'cultures', 'culture']);
    expect(splitConceptText('unmarked plain text')).toEqual([{ text: 'unmarked plain text' }]);
    expect(splitConceptText('')).toEqual([]);
  });

  it('keeps repeated terms in long diaries and starts each call at the beginning', () => {
    const paragraph = 'The evidence looked like truth at first. We tested other perspectives, then named the evidence again.\n';
    const diary = paragraph.repeat(1000);
    for (let pass = 0; pass < 3; pass++) {
      const segments = splitConceptText(diary);
      expect(segments.filter(({ concept }) => concept === 'evidence')).toHaveLength(2000);
      expect(segments.filter(({ concept }) => concept === 'truth')).toHaveLength(1000);
      expect(segments.filter(({ concept }) => concept === 'perspective')).toHaveLength(1000);
      expect(segments.map(({ text }) => text).join('')).toBe(diary);
    }
  });

  it('keeps distinct inks with at least 4.5:1 on the game panel and paper backgrounds', () => {
    const backgrounds = {
      onDark: ['#120f24', '#261e4a', '#4e2218', '#183a28', '#102c4c', '#481e46', '#3b2f70', '#000000'],
      onLight: ['#ffffff', '#fffdf6', '#f4ecd2', '#f6efd9', '#f8e1dc', '#fffbe6', '#fff8e6', '#f2d27a', '#b4e0e0', '#f3eee0', '#efe1bd', '#dff2e3'],
    } as const;
    for (const tone of ['onDark', 'onLight'] as const) {
      const ink = new Set<string>();
      for (const concept of CONCEPTS) {
        const colour = CONCEPT_COLOURS[concept][tone];
        expect(colour).toMatch(/^#[a-f0-9]{6}$/);
        ink.add(colour);
        for (const background of backgrounds[tone]) expect(contrast(colour, background)).toBeGreaterThanOrEqual(4.5);
      }
      expect(ink.size).toBe(CONCEPTS.length);
    }
  });
});
