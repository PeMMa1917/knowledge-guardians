import type Phaser from 'phaser';
import {afterEach,expect,it,vi} from 'vitest';
import {ensureFieldArt} from '../src/scenes/fieldArt';
import {artURL} from '../src/ui/illustrations';

afterEach(()=>vi.unstubAllGlobals());

it('uploads a visited picture once per game and encodes a journal illustration only on its first use',()=>{
  const encode=vi.fn(()=>'data:image/png;base64,star');
  const canvas={getContext:()=>({fillRect:vi.fn()}),toDataURL:encode};
  const create=vi.fn(()=>canvas);
  vi.stubGlobal('document',{createElement:create});
  const keys=new Set<string>(['existing.sheet']);
  const add=vi.fn((key:string)=>{keys.add(key);return {};});
  const textures={exists:(key:string)=>keys.has(key),addCanvas:add} as unknown as Phaser.Textures.TextureManager;
  expect(ensureFieldArt(textures,'existing.sheet')).toBe(true);
  expect(create).not.toHaveBeenCalled();
  expect(ensureFieldArt(textures,'star')).toBe(true);
  expect(ensureFieldArt(textures,'star')).toBe(true);
  expect(ensureFieldArt(textures,'unknown.room.picture')).toBe(false);
  expect(add).toHaveBeenCalledTimes(1);
  expect(artURL('star')).toBe(artURL('star'));
  expect(encode).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenCalledTimes(1);
});
