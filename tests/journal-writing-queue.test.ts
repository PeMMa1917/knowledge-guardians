import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameController } from '../src/app/controller';
import { discardPendingJournalWriting, flushJournalWriting, queueJournalWriting } from '../src/ui/journalWriting';

function prepare() {
  vi.useFakeTimers();
  vi.stubGlobal('window', { setTimeout, clearTimeout });
  const suspend = vi.fn(() => true);
  const controller = { suspend } as unknown as GameController;
  return { controller, suspend };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('journal writing persistence', () => {
  it('flushes the last input immediately and clears the timer for a second exit event', () => {
    const { controller, suspend } = prepare();
    queueJournalWriting(controller);
    vi.advanceTimersByTime(20);
    queueJournalWriting(controller);
    expect(suspend).not.toHaveBeenCalled();
    expect(flushJournalWriting(controller, 'Auto-save when leaving')).toBe(true);
    expect(flushJournalWriting(controller, 'Auto-save when leaving')).toBeNull();
    vi.advanceTimersByTime(1000);
    expect(suspend).toHaveBeenCalledExactlyOnceWith('Auto-save when leaving');
  });

  it('clears writes superseded by another save, and leaves later edits available to write', () => {
    const { controller, suspend } = prepare();
    queueJournalWriting(controller);
    discardPendingJournalWriting(controller);
    vi.advanceTimersByTime(1000);
    expect(suspend).not.toHaveBeenCalled();
    queueJournalWriting(controller);
    vi.advanceTimersByTime(1000);
    expect(suspend).toHaveBeenCalledExactlyOnceWith('Adventure journal');
  });

  it('keeps writing available for retry when the platform refuses a write', () => {
    const { controller, suspend } = prepare();
    suspend.mockReturnValueOnce(false);
    queueJournalWriting(controller);
    expect(flushJournalWriting(controller)).toBe(false);
    expect(flushJournalWriting(controller)).toBe(true);
    expect(flushJournalWriting(controller)).toBeNull();
    expect(suspend).toHaveBeenCalledTimes(2);
  });
});
