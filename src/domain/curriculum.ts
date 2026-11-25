/**
 * Curriculum names used by tags (spec 4, 43.1, 90, 91, 92).
 * Names are short and paraphrased. No IB wording is copied here.
 */
import type { AOK, ATL, Concept, ProfileAttribute } from './types';

export const CONCEPT_NAMES: Record<Concept, string> = {
  evidence: 'Evidence', certainty: 'Certainty', truth: 'Truth', interpretation: 'Interpretation',
  power: 'Power', justification: 'Justification', explanation: 'Explanation', objectivity: 'Objectivity',
  perspective: 'Perspective', culture: 'Culture', values: 'Values', responsibility: 'Responsibility',
};

export const ATL_NAMES: Record<ATL, string> = {
  thinking: 'Thinking', communication: 'Communication', social: 'Social',
  'self-management': 'Self-management', research: 'Research',
};

export const PROFILE_NAMES: Record<ProfileAttribute, string> = {
  inquirer: 'Inquirer', knowledgeable: 'Knowledgeable', thinker: 'Thinker', communicator: 'Communicator',
  principled: 'Principled', 'open-minded': 'Open-minded', caring: 'Caring', 'risk-taker': 'Risk-taker',
  balanced: 'Balanced', reflective: 'Reflective',
};

export const AOK_NAMES: Record<AOK, string> = {
  HIS: 'History', NAT: 'Natural sciences', HUM: 'Human sciences', ART: 'The arts', MAT: 'Mathematics',
  TEC: 'Knowledge and technology', LAN: 'Knowledge and language', POL: 'Knowledge and politics',
  REL: 'Knowledge and religion', IND: 'Knowledge and Indigenous societies',
};

/** DP subjects (spec 92.1). Ids are stable; names are for display. */
export const SUBJECTS: Record<string, { name: string; group: string }> = {
  'lang-lit': { name: 'Language A: literature', group: 'G1' },
  'lang-langlit': { name: 'Language A: language and literature', group: 'G1' },
  'lit-perf': { name: 'Literature and performance', group: 'G1' },
  'lang-b': { name: 'Language B and ab initio', group: 'G2' },
  'classics': { name: 'Classical languages', group: 'G2' },
  'business': { name: 'Business management', group: 'G3' },
  'digital-society': { name: 'Digital society', group: 'G3' },
  'economics': { name: 'Economics', group: 'G3' },
  'geography': { name: 'Geography', group: 'G3' },
  'global-politics': { name: 'Global politics', group: 'G3' },
  'history': { name: 'History', group: 'G3' },
  'philosophy': { name: 'Philosophy', group: 'G3' },
  'psychology': { name: 'Psychology', group: 'G3' },
  'anthropology': { name: 'Social and cultural anthropology', group: 'G3' },
  'world-religions': { name: 'World religions', group: 'G3' },
  'ess': { name: 'Environmental systems and societies', group: 'G3/G4' },
  'biology': { name: 'Biology', group: 'G4' },
  'chemistry': { name: 'Chemistry', group: 'G4' },
  'physics': { name: 'Physics', group: 'G4' },
  'computer-science': { name: 'Computer science', group: 'G4' },
  'design-tech': { name: 'Design technology', group: 'G4' },
  'sehs': { name: 'Sports, exercise and health science', group: 'G4' },
  'math-aa': { name: 'Mathematics: analysis and approaches', group: 'G5' },
  'math-ai': { name: 'Mathematics: applications and interpretation', group: 'G5' },
  'visual-arts': { name: 'Visual arts', group: 'G6' },
  'music': { name: 'Music', group: 'G6' },
  'theatre': { name: 'Theatre', group: 'G6' },
  'dance': { name: 'Dance', group: 'G6' },
  'film': { name: 'Film', group: 'G6' },
};
