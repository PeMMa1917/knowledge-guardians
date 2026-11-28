import { describe, expect, it, vi } from 'vitest';
import { BootScene } from '../src/scenes/BootScene';

vi.mock('phaser', () => ({ default: { Scene: class {}, Loader: { Events: { COMPLETE: 'complete' } } } }));
vi.mock('../src/scenes/art', () => ({ STAMPS: {}, CHAR_FRAME: { w: 1, h: 1 } }));
vi.mock('../src/ui/illustrations', () => ({ artKeys: () => [] }));

describe('optional sound bootstrap', () => {
  it('declares the world ready while the optional effects are still pending', () => {
    const load = {
      on: vi.fn(), once: vi.fn(), image: vi.fn(), spritesheet: vi.fn(),
      audio: vi.fn(), start: vi.fn(),
    };
    const events = { emit: vi.fn() };
    const scene = Object.assign(new BootScene(), {
      load, game: { events }, scale: { width: 640, height: 360 },
      add: { rectangle: vi.fn() }, children: { removeAll: vi.fn() },
      textures: { exists: () => true, get: () => ({ has: () => true }) },
      anims: { exists: () => true, create: vi.fn(), generateFrameNumbers: vi.fn() },
    });

    scene.preload();
    expect(load.image).toHaveBeenCalled();
    expect(load.image).not.toHaveBeenCalledWith('council', expect.any(String));
    expect(load.spritesheet).toHaveBeenCalled();
    expect(load.audio).not.toHaveBeenCalled();

    scene.create();
    expect(events.emit).toHaveBeenCalledWith('boot-complete');
    expect(load.audio).toHaveBeenCalledWith('sfx.click', expect.stringMatching(/\.mp3$/));
    expect(events.emit.mock.invocationCallOrder[0]).toBeLessThan(load.audio.mock.invocationCallOrder[0]);
    expect(load.start).toHaveBeenCalledOnce();
  });
  it('reports a missing required picture and can preload again without starting a duplicate world', () => {
    const listeners = new Map<string, (file: {type:string;key:string}) => void>();
    const load = {
      on: vi.fn((name,fn) => listeners.set(name,fn)), once: vi.fn(), off: vi.fn(),
      image: vi.fn(), spritesheet: vi.fn(), audio: vi.fn(), start: vi.fn(),
    };
    const events = {emit:vi.fn()};
    const scene = Object.assign(new BootScene(), {
      load, game:{events}, scale:{width:390,height:844}, add:{rectangle:vi.fn()},
      children:{removeAll:vi.fn()}, textures:{exists:()=>true,get:()=>({has:()=>true})}, anims:{exists:()=>true,create:vi.fn(),generateFrameNumbers:vi.fn()},
    });
    scene.preload();
    listeners.get('loaderror')!({type:'image',key:'ow'});
    scene.create();
    expect(events.emit.mock.calls).toEqual([['boot-failed']]);
    expect(load.audio).not.toHaveBeenCalled();
    scene.preload();
    scene.create();
    expect(events.emit.mock.calls).toEqual([['boot-failed'],['boot-complete']]);
  });

});
