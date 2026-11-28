import { describe, expect, it } from 'vitest';
import { QUEUE_LIMIT, enqueue, researchOn, sanitise } from '../src/domain/research';

const on = { url: 'https://kg.example.org/research', schoolConsent: true };

describe('research data (decision X-018)', () => {
  it('is off without the school\'s consent or the project\'s own https server', () => {
    expect(researchOn({ url: '', schoolConsent: true })).toBe(false);
    expect(researchOn({ url: 'http://insecure.example', schoolConsent: true })).toBe(false);
    expect(researchOn({ ...on, schoolConsent: false })).toBe(false);
    expect(enqueue([], { kind: 'hint', id: 'm01.o1.look', day: '2026-11-27' }, { ...on, schoolConsent: false })).toEqual([]);
  });
  it('keeps only play events with content ids, never free text or names', () => {
    expect(sanitise({ kind: 'hint', id: 'm01.o1.look', n: 2, day: '2026-11-27' })).toEqual({ kind: 'hint', id: 'm01.o1.look', n: 2, day: '2026-11-27' });
    expect(sanitise({ kind: 'hint', id: 'My name is Sam and I think…', day: '2026-11-27' })).toBeNull();
    expect(sanitise({ kind: 'essay' as never, id: 'x', day: '2026-11-27' })).toBeNull();
    expect(sanitise({ kind: 'hint', id: 'a', day: '2026-11-27T10:00' })).toBeNull();
  });
  it('caps the queue', () => {
    let q: ReturnType<typeof enqueue> = [];
    for (let i = 0; i < QUEUE_LIMIT + 20; i++) q = enqueue(q, { kind: 'hint', id: `o${i}`, day: '2026-11-27' }, on);
    expect(q).toHaveLength(QUEUE_LIMIT);
    expect(q[0].id).toBe('o20');
  });
});
