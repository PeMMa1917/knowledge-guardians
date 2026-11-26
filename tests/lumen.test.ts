import { describe, expect, it } from 'vitest';
import { LUMEN_FORMS, lumenArt } from '../src/app/settings';

describe("Lumen's form (customisation)", () => {
  it('the fairy keeps the old picture; other forms have their own', () => {
    expect(lumenArt({ lumenForm: 'fairy' })).toBe('lumen');
    expect(lumenArt({ lumenForm: 'moth' })).toBe('lumen.moth');
    expect(new Set(LUMEN_FORMS.map((f) => lumenArt({ lumenForm: f.id }))).size).toBe(LUMEN_FORMS.length);
  });
});
