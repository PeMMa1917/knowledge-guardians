import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { validateContent } from '../src/domain/validate';

describe('content pack', () => {
  const pack = buildPack();
  it('passes validation', () => {
    expect(validateContent(pack)).toEqual([]);
  });
  it('labels every documented exhibit and card with a source', () => {
    for (const e of pack.exhibits) if (e.historicalLabel === 'documented') expect(e.sources.length).toBeGreaterThan(0);
    for (const c of pack.cards) if (c.historicalLabel === 'documented') expect(c.sources.length).toBeGreaterThan(0);
  });
  it('has no runtime AI endpoints in content', () => {
    const text = JSON.stringify(pack).toLowerCase();
    for (const bad of ['openai', 'gemini', 'anthropic', 'api_key', 'apikey']) expect(text).not.toContain(bad);
  });
});
