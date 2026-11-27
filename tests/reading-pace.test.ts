import { afterEach, describe, expect, it, vi } from 'vitest';
import { paceForPanel, paceReadingRoom } from '../src/app/readingPace';

afterEach(() => { paceForPanel(); vi.useRealTimers(); });

describe('reading while the painted room keeps time', () => {
  const clock = () => ({
    running: true,
    sleep() { this.running = false; },
    wake() { this.running = true; },
    tick: vi.fn(),
  });
  it('keeps world ticks available behind the diary, preserves reduced motion and restores full rate on exit', () => {
    vi.useFakeTimers({toFake:['setTimeout','clearTimeout','queueMicrotask']});
    const game = clock();
    let hidden = false;
    const pace = paceReadingRoom(game, () => true, () => hidden, () => true);
    paceForPanel('journal wide'); vi.runAllTicks();
    vi.advanceTimersByTime(1000);
    expect(game.tick).toHaveBeenCalledTimes(4);
    hidden = true;
    pace.update();
    vi.advanceTimersByTime(1000);
    expect(game.tick).toHaveBeenCalledTimes(4);
    hidden = false;
    pace.update();
    vi.advanceTimersByTime(250);
    expect(game.tick).toHaveBeenCalledTimes(5);
    paceForPanel('fieldgame');
    expect(game.running).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(game.tick).toHaveBeenCalledTimes(5);
    pace.dispose();
  });
  it('keeps one clock when a dialogue replaces the recap or disappears during a tick', () => {
    vi.useFakeTimers({toFake:['setTimeout','clearTimeout','queueMicrotask']});
    const game = clock();
    const pace = paceReadingRoom(game, () => true, () => false, () => false);
    paceForPanel('recap'); paceForPanel('dialogue'); paceForPanel('dialogue'); vi.runAllTicks();
    vi.advanceTimersByTime(200);
    expect(game.tick).toHaveBeenCalledTimes(2);
    game.tick.mockImplementationOnce(() => paceForPanel());
    vi.advanceTimersByTime(1000);
    expect(game.tick).toHaveBeenCalledTimes(3);
    expect(game.running).toBe(true);
    pace.dispose();
  });
  it('leaves a loading renderer or a clock already paused by its owner alone', () => {
    vi.useFakeTimers({toFake:['setTimeout','clearTimeout','queueMicrotask']});
    const game = clock();
    let playing = false;
    const pace = paceReadingRoom(game, () => playing, () => false, () => false);
    paceForPanel('class-save'); expect(game.running).toBe(true);
    game.running = false; playing = true;
    pace.update(); pace.dispose();
    expect(game.running).toBe(false);
    expect(game.tick).toHaveBeenCalledTimes(0);
  });
});
