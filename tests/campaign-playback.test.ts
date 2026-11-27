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

describe('campaign music during fieldwork', () => {
  it('restores a suspended layer, keeps at most one task buffer and respects both volume controls', async () => {
    const { default: Phaser } = await import('phaser');
    const events = new EventTarget();
    const context = Object.assign(events, {
      state: 'suspended', createBuffer: () => ({ copyToChannel: vi.fn() }),
    });
    const buffers = new Map<string, unknown>();
    const cache = {
      exists: (key: string) => buffers.has(key),
      add: (key: string, value: unknown) => buffers.set(key, value),
      remove: (key: string) => buffers.delete(key),
    };
    const live = new Map<string, { volume: number; seek: number }>();
    const cues: string[] = [];
    const manager = Object.assign(Object.create(Phaser.Sound.WebAudioSoundManager.prototype), {
      context, locked: false, on: vi.fn(), off: vi.fn(),
      add: (key: string, options: { volume: number }) => {
        const sound = Object.assign(Object.create(Phaser.Sound.WebAudioSound.prototype), {
          key, seek: 0, volume: options.volume, isPlaying: false, pendingRemove: false,
          play(at?: { seek: number }) {
            this.seek = at?.seek ?? 0;
            this.isPlaying = true;
            live.set(key, this);
            return true;
          },
          setVolume(volume: number) { this.volume = volume; },
        });
        return sound;
      },
      play: (key: string) => { cues.push(key); },
      remove: (sound: { key: string }) => live.delete(sound.key),
    });
    const music = new CampaignPlayback(manager, cache as unknown as ConstructorParameters<typeof CampaignPlayback>[1], async () => false);
    const layers = () => [...buffers.keys()].filter((key) => key.startsWith('music.layer.'));
    music.follow('WORLD-01', 'nexus.archive', 'music.archive', .8);
    const bed = [...live.values()][0];
    bed.seek = 2;
    music.setTask('work');
    expect(layers()).toEqual([]);
    context.state = 'running';
    events.dispatchEvent(new Event('statechange'));
    expect(layers()).toHaveLength(1);
    expect(live.get(layers()[0])?.seek).toBe(2);
    expect(bed.volume).toBeCloseTo(.8 * .52);
    music.follow('WORLD-01', 'nexus.archive', 'music.archive', .2);
    expect(layers()).toHaveLength(1);
    expect(live.get(layers()[0])?.volume).toBeCloseTo(.2 * .55);
    music.setTask('hearing');
    expect(layers()).toHaveLength(1);
    expect(layers()[0]).toMatch(/hearing$/);
    music.follow('WORLD-01', 'nexus.archive', 'music.archive', 0);
    expect(layers()).toHaveLength(0);
    expect(bed.volume).toBe(0);
    music.trial('again', 0);
    music.trial('impression', Number.NaN);
    expect(cues).toEqual([]);
    music.trial('handed-on', .4);
    expect(cues).toEqual(['trial.handed-on']);
    music.follow('WORLD-02', 'aethelgard.emberford', 'music.town', .6);
    expect(layers()).toHaveLength(1);
    expect(layers()[0]).toMatch(/emberford.hearing$/);
    music.setTask('listen');
    expect(layers()).toEqual([]);
    music.setTask('roam');
    expect([...live.values()][0].volume).toBe(.6);
    music.destroy();
    events.dispatchEvent(new Event('statechange'));
    expect(live.size).toBe(0);
    expect(buffers.size).toBe(0);
  });
});
