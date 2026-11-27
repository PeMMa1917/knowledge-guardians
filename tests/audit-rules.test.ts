import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';

const pack = buildPack();

/** Rules that came from the multi-persona audit (docs/audit/CONSENSUS.md). */
describe('audit rules', () => {
  it('C-028: every knowledge question is a question', () => {
    const bad = pack.missions.filter((m) => m.knowledgeQuestion && !m.knowledgeQuestion.trim().endsWith('?')).map((m) => m.id);
    expect(bad).toEqual([]);
  });
  it('C-003: no step title names an object only by an accession number', () => {
    const bad = pack.missions.flatMap((m) => m.objectives).filter((o) => /\b(beside|for|of|on|to|with|the) \d{2,4}\.\d+\.\d+/.test(o.title ?? '')).map((o) => o.id);
    expect(bad).toEqual([]);
  });
});
