import { describe, it, expect } from 'vitest';
import { studentName } from '../shared/studentNames.mjs';
import { normalizeLeaderboardAlias } from '../src/domain/leaderboard';

describe('school names', () => {
  it('keeps ordinary names in their original script and normalizes equivalent spellings', () => {
    for (const name of [
      'Марта',
      '雪の灯',
      'Αθηνά',
      'ओजस',
      'يوسف',
      'Север 7',
      'Scunthorpe',
      'Dickinson',
      'Cassidy',
      'Essex',
      'Nguyễn',
      'D’Arcy',
      'علی‌رضا',
    ])
      expect(normalizeLeaderboardAlias(name)).toBe(name);
    expect(studentName('  Jose\u0301   Sol  ')).toBe('José Sol');
    expect(studentName('СОКОЛ', 'login')).toBe('сокол');
    expect(studentName('李', 'display')).toBe('李');
    expect(studentName('李', 'login')).toBe('李');
  });
  it('filters strong terms, lookalikes, numeric substitutions, spacing and invisible formatting in every shared identity field', () => {
    for (const name of [
      'ѕh1thead',
      'Ғυсκ',
      'ＦＵＣＫ',
      'ѕ.һ.і.т',
      'f\u200buck',
      'fU\u0308ck',
      'Shit123',
      'fuuuuck',
      'ab\u202ecd',
      'мерде\u2069',
      'puta',
      'Scheiße',
      'ѕһіτ_２０２６_',
      'sh١t١٢٣_',
    ])
      for (const field of ['alias', 'login', 'display'] as const)
        expect(studentName(name, field), name).toBeNull();
  });
  it('rejects invalid usernames at school provisioning and allows a space in a roster label', () => {
    expect(studentName('Snow Finch', 'login')).toBeNull();
    expect(studentName('Snow Finch', 'display')).toBe('Snow Finch');
    expect(studentName('x'.repeat(41), 'login')).toBeNull();
  });
});
