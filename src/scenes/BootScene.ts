import Phaser from 'phaser';
import { STAMPS, CHAR_FRAME } from './art';
import { artKeys, drawArt, glowCanvas } from '../ui/illustrations';

/** Audio files. Every file is listed with its licence in CREDITS.md. */
export const AUDIO: Record<string, string> = {
  'music.archive': 'assets/audio/music/mysterious-ambience-cynicmusic.mp3',
  'music.town': 'assets/audio/music/town-theme-cynicmusic.mp3',
  'music.title': 'assets/audio/music/happy-lullaby-cynicmusic.mp3',
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
  'merchant-corvan', 'smith-hesper', 'guildmaster-orrin', 'scholar-sefa', 'villager-1', 'villager-2',
];

export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload(): void {
    const bar = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 4, 6, 0x9fe8ff);
    this.load.on('progress', (p: number) => { bar.width = Math.max(4, p * 300); });
    this.load.image('ow', 'assets/art/armm1998/Overworld.png');
    this.load.image('in', 'assets/art/armm1998/Inner.png');
    for (const id of CHARACTER_SHEETS) {
      this.load.spritesheet(`char.${id}`, `assets/art/generated/characters/${id}.png`, { frameWidth: CHAR_FRAME.w, frameHeight: CHAR_FRAME.h });
    }
    for (const [k, url] of Object.entries(AUDIO)) this.load.audio(k, url);
    // A missing audio file must not stop the game (audio is never essential).
    this.load.on('loaderror', (f: Phaser.Loader.File) => console.warn('Could not load', f.key));
  }

  create(): void {
    this.children.removeAll(true); // remove the loading bar
    // Named frames for every stamp on the two tile sheets.
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
    // Walk animations.
    const dirs = ['down', 'right', 'up', 'left'];
    for (const id of CHARACTER_SHEETS) {
      dirs.forEach((d, row) => {
        this.anims.create({ key: `${id}.walk.${d}`, frames: this.anims.generateFrameNumbers(`char.${id}`, { start: row * 17, end: row * 17 + 3 }), frameRate: 8, repeat: -1 });
      });
    }
    this.game.events.emit('boot-complete');
  }
}
