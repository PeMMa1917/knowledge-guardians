import { BASE_SHEET_KEY, BASE_SHEET_URL } from './looks';
import Phaser from 'phaser';
import { STAMPS, CHAR_FRAME } from './art';
import { artKeys, drawArt, glowCanvas } from '../ui/illustrations';

// These tracks are only needed if the browser cannot play a generated score.
const MUSIC: Record<string, string | undefined> = {
  'music.archive': 'assets/audio/music/mysterious-ambience-cynicmusic.mp3',
  'music.town': 'assets/audio/music/town-theme-cynicmusic.mp3',
  'music.title': 'assets/audio/music/happy-lullaby-cynicmusic.mp3',
};

/** Audio files. Every file is listed with its licence in CREDITS.md. */
const AUDIO: Record<string, string> = {
  'sfx.click': 'assets/audio/sfx/ui-click-kenney.mp3',
  'sfx.hover': 'assets/audio/sfx/ui-hover-kenney.mp3',
  'sfx.open': 'assets/audio/sfx/ui-open-kenney.mp3',
  'sfx.book': 'assets/audio/sfx/book-open-rubberduck.mp3',
  'sfx.page': 'assets/audio/sfx/page-turn-rubberduck.mp3',
  'sfx.coins': 'assets/audio/sfx/coins-rubberduck.mp3',
  'sfx.pickup': 'assets/audio/sfx/pickup-rubberduck.mp3',
  'sfx.metal': 'assets/audio/sfx/metal-rubberduck.mp3',
  'sfx.sparkle': 'assets/audio/sfx/sparkle-rubberduck.mp3',
  'sfx.lock': 'assets/audio/sfx/lock-rubberduck.mp3',
  'sfx.step': 'assets/audio/sfx/step-rubberduck.mp3',
  'sfx.award': 'assets/audio/sfx/award-wobbleboxx.mp3',
  'sfx.coin': 'assets/audio/sfx/coin-wobbleboxx.mp3',
  'sfx.complete': 'assets/audio/sfx/complete-haeldb.mp3',
};

export const CHARACTER_SHEETS = [
  'player-a', 'player-b', 'player-c', 'player-d', 'warden-ise', 'curator-dace', 'clerk-venn', 'kip-arden',
  'merchant-corvan', 'smith-hesper', 'guildmaster-orrin', 'scholar-sefa', 'villager-1', 'villager-2', 'tallowheel',
];

export class BootScene extends Phaser.Scene {
  private readonly missingPictures = new Set<string>();
  private readonly markMissing = (file: Phaser.Loader.File) => {
    if (file.type === 'image' || file.type === 'spritesheet') this.missingPictures.add(file.key);
  };
  private readonly pendingMusic = new Map<string, Promise<boolean>>();

  constructor() { super('boot'); }

  /** The boot scene's loader stays available when a world restarts or changes map. */
  loadMusic(key: string): Promise<boolean> {
    if (this.cache.audio.exists(key)) return Promise.resolve(true);
    const url = MUSIC[key];
    if (!url) return Promise.resolve(false);
    const pending = this.pendingMusic.get(key);
    if (pending) return pending;

    const result = new Promise<boolean>((resolve) => {
      const { COMPLETE, FILE_KEY_COMPLETE, FILE_LOAD_ERROR } = Phaser.Loader.Events;
      const fileComplete = `${FILE_KEY_COMPLETE}audio-${key}`;
      const finish = () => {
        this.load.off(fileComplete, finish);
        this.load.off(FILE_LOAD_ERROR, failed);
        this.load.off(COMPLETE, finish);
        resolve(this.cache.audio.exists(key));
      };
      const failed = (file: Phaser.Loader.File) => {
        if (file.type === 'audio' && file.key === key) finish();
      };
      this.load.once(fileComplete, finish);
      this.load.on(FILE_LOAD_ERROR, failed);
      this.load.once(COMPLETE, finish); // also settles unsupported formats that were never queued
      this.load.audio(key, url);
      this.load.start();
    }).finally(() => this.pendingMusic.delete(key));
    this.pendingMusic.set(key, result);
    return result;
  }

  preload(): void {
    const bar = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 4, 6, 0x9fe8ff);
    const showProgress = (p: number) => { bar.width = Math.max(4, p * 300); };
    this.load.on('progress', showProgress);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.load.off('progress', showProgress));
    this.load.image('ow', 'assets/art/armm1998/Overworld.png');
    this.load.image('in', 'assets/art/armm1998/Inner.png');
    this.load.image('market', 'assets/art/generated/market_tiles.png');
    this.load.image('water', 'assets/art/generated/water_tiles.png');
    this.load.image('civic', 'assets/art/generated/civic_tiles.png');
    this.load.image('voices', 'assets/art/generated/voices_tiles.png');
    this.load.image('island', 'assets/art/generated/island_tiles.png');
    this.load.image('council', 'assets/art/generated/council_tiles.png');
    this.load.image(BASE_SHEET_KEY, BASE_SHEET_URL); // base for custom player looks
    for (const id of CHARACTER_SHEETS) {
      this.load.spritesheet(`char.${id}`, `assets/art/generated/characters/${id}.png`, { frameWidth: CHAR_FRAME.w, frameHeight: CHAR_FRAME.h });
    }
    this.missingPictures.clear();
    this.load.on('loaderror', this.markMissing);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.load.off('loaderror', this.markMissing));
  }

  create(): void {
    this.children.removeAll(true); // remove the loading bar
    if (this.missingPictures.size) {
      this.game.events.emit('boot-failed');
      return;
    }
    // Named frames for every stamp on the tile sheets.
    for (const [name, s] of Object.entries(STAMPS)) {
      const tex = this.textures.get(s.sheet);
      if (!tex.has(name)) tex.add(name, 0, s.x * 16, s.y * 16, s.w * 16, s.h * 16);
    }
    // Procedural art (original, drawn in code).
    for (const key of artKeys()) {
      const c = drawArt(key);
      if (c && !this.textures.exists(key)) this.textures.addCanvas(key, c);
    }
    if (!this.textures.exists('glow')) this.textures.addCanvas('glow', glowCanvas(128));
    if (!this.anims.exists('moth.flap')) this.anims.create({ key: 'moth.flap', frames: [{ key: 'moth.0' }, { key: 'moth.1' }], frameRate: 9, repeat: -1 });
    // Walk animations.
    const dirs = ['down', 'right', 'up', 'left'];
    for (const id of CHARACTER_SHEETS) {
      dirs.forEach((d, row) => {
        this.anims.create({ key: `${id}.walk.${d}`, frames: this.anims.generateFrameNumbers(`char.${id}`, { start: row * 17, end: row * 17 + 3 }), frameRate: 8, repeat: -1 });
      });
    }
    this.game.events.emit('boot-complete');
    // Browser audio decoders can stall. Start the world with its textures, then load effects in the background.
    for (const [key, url] of Object.entries(AUDIO)) this.load.audio(key, url);
    this.load.start();
  }
}
