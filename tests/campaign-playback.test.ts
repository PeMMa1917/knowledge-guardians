import { describe, expect, it, vi } from 'vitest';
import { CampaignPlayback } from '../src/app/campaignPlayback';

vi.mock('phaser', () => ({
  default: {
    Sound: {
      Events: { UNLOCKED: 'unlocked', STOP_ALL: 'stopall' },
      WebAudioSoundManager: class {}, NoAudioSoundManager: class {},
      WebAudioSound: class {}, HTML5AudioSound: class {},
    },
  },
}));

function pendingTrack() {
  let resolve!: (available: boolean) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<boolean>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

function player(load: (key: string) => Promise<boolean>, existing: string[] = []) {
  const played: string[] = [];
  const listeners = new Map<string, () => void>();
  const manager = {
    locked: false,
    on: (name: string, listener: () => void) => listeners.set(name, listener),
    off: (name: string) => listeners.delete(name),
    add: (key: string) => ({ isPlaying: true, play: () => { played.push(key); return true; } }),
    remove: vi.fn(),
  } as unknown as ConstructorParameters<typeof CampaignPlayback>[0];
  const cache = { exists: (key: string) => existing.includes(key), remove: vi.fn() } as unknown as ConstructorParameters<typeof CampaignPlayback>[1];
  const playback = new CampaignPlayback(manager, cache, load);
  return { playback, played, remove: manager.remove, stopAll: () => listeners.get('stopall')?.() };
}

describe('campaign music fallback', () => {
  it.each(['success', 'failure'])('keeps the current map cue when a previous download ends in %s', async (outcome) => {
    const archive = pendingTrack();
    const load = vi.fn(() => archive.promise);
    const { playback, played, remove } = player(load, ['music.town']);
    playback.follow('WORLD-01', 'nexus.archive', 'music.archive', 0.5);
    expect(load).toHaveBeenCalledWith('music.archive');
    playback.follow('WORLD-02', 'aethelgard.emberford', 'music.town', 0.5);
    expect(played).toEqual(['music.town']);

    if (outcome === 'success') archive.resolve(true);
    else archive.reject(new Error('Archive track download failed'));
    await new Promise((done) => setTimeout(done, 0));
    expect(played).toEqual(['music.town']);
    expect(remove).not.toHaveBeenCalled();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('continues with a loaded alternative when the current fallback file fails', async () => {
    const town = pendingTrack();
    const load = vi.fn(() => town.promise);
    const { playback, played } = player(load, ['music.archive']);
    playback.follow('WORLD-02', 'aethelgard.emberford', 'music.town', 0.5);
    playback.follow('WORLD-02', 'aethelgard.emberford', 'music.town', 0.2);
    expect(load).toHaveBeenCalledTimes(1);
    town.reject(new Error('Town track download failed'));
    await vi.waitFor(() => expect(played).toEqual(['music.archive']));
  });

  it('stays quiet on the title if an old download finishes after Stop All', async () => {
    const archive = pendingTrack();
    const { playback, played, stopAll } = player(() => archive.promise);
    playback.follow('WORLD-01', 'nexus.archive', 'music.archive', 0.5);
    stopAll();
    archive.resolve(true);
    await new Promise((done) => setTimeout(done, 0));
    expect(played).toEqual([]);
  });
});
