import { describe, expect, it } from 'vitest';
import { bestFlag, canTimedReplay, clockText, elapsedSeconds, resultText, timedResult } from '../src/domain/timedReplay';

describe('timed replay of a field game (decision X-003)', () => {
  it('is offered only after the first untimed play is finished', () => {
    expect(canTimedReplay({}, 'doors')).toBe(false);
    expect(canTimedReplay({ 'field.doors.done': true }, 'doors')).toBe(true);
  });
  it('keeps the best time and never fails a slow run', () => {
    expect(timedResult({}, 'doors', 90)).toEqual({ seconds: 90, previous: null, best: 90, isBest: true });
    const flags = { [bestFlag('doors')]: 60 };
    expect(timedResult(flags, 'doors', 45).isBest).toBe(true);
    const slow = timedResult(flags, 'doors', 300);
    expect(slow).toMatchObject({ isBest: false, best: 60 });
    expect(resultText(slow)).toContain('best is still 1 min 00 s');
  });
  it('counts whole seconds and says them plainly', () => {
    expect(elapsedSeconds(0, 200)).toBe(1);
    expect(elapsedSeconds(0, 65_400)).toBe(65);
    expect(clockText(65)).toBe('1 min 05 s');
    expect(clockText(9)).toBe('9 s');
  });
});
