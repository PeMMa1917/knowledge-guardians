import Phaser from 'phaser';
import { scoreAt, soundtrackKey, type WorldScore } from '../domain/campaignScore';
import { renderCampaignScore } from './campaignSynth';
import { caption } from './captions';

const REPLACED_CUES = new Set(['music.archive', 'music.town', 'music.box']);
const CACHED_SCORES = 2;

interface MusicRequest {
  key: string;
  original: string;
  score?: WorldScore;
  volume: number;
  announced: boolean;
}

/** Share Phaser's context, unlock and focus handling with the rest of the game. */
export class CampaignPlayback {
  private request?: MusicRequest;
  private active?: Phaser.Sound.BaseSound;
  private readonly rendered: string[] = [];

  constructor(private readonly manager: Phaser.Sound.BaseSoundManager, private readonly cache: Phaser.Cache.BaseCache) {
    manager.on(Phaser.Sound.Events.UNLOCKED, this.afterUnlock);
    manager.on(Phaser.Sound.Events.STOP_ALL, this.clear);
  }

  follow(world: string, map: string, original: string, volume: number): void {
    const supportsSynthesis = this.manager instanceof Phaser.Sound.WebAudioSoundManager;
    const score = supportsSynthesis && REPLACED_CUES.has(original) ? scoreAt(world, map) : undefined;
    const key = score ? soundtrackKey(score) : original;
    const level = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
    if (this.request?.key === key) {
      if (this.active && this.active.key !== key && this.request.original !== original) {
        this.removeActive();
        this.request.announced = false;
      }
      this.request.volume = level;
      this.request.original = original;
    } else {
      this.removeActive();
      this.request = { key, original, score, volume: level, announced: false };
    }
    this.update();
  }

  private update(): void {
    const request = this.request;
    if (!request) return;
    const { volume, original, score, key } = request;
    if (this.active && !this.active.pendingRemove && (this.active.isPlaying || this.active.isPaused)) {
      if (this.active instanceof Phaser.Sound.WebAudioSound || this.active instanceof Phaser.Sound.HTML5AudioSound) {
        this.active.setVolume(volume);
      }
      return;
    }
    this.removeActive();

    const web = this.manager instanceof Phaser.Sound.WebAudioSoundManager ? this.manager : null;
    const synth = score && web && web.context.state !== 'closed' ? web : null;
    const fallbacks = [...new Set([original, 'music.archive', 'music.town', 'music.title'])].filter((cue) => this.cache.exists(cue));
    if (volume <= 0 || this.manager.locked) {
      this.announce(request, synth ? key : fallbacks[0] ?? original);
      return;
    }
    if (score && synth && this.prepare(key, score, synth.context) && this.start(key, volume)) {
      this.announce(request, key);
    } else {
      const played = fallbacks.find((fallback) => this.start(fallback, volume));
      this.announce(request, played ?? fallbacks[0] ?? original);
    }
  }

  private prepare(key: string, score: WorldScore, context: AudioContext): boolean {
    if (!this.cache.exists(key)) {
      try {
        const pcm = renderCampaignScore(score);
        const buffer = context.createBuffer(2, pcm.left.length, pcm.sampleRate);
        buffer.copyToChannel(pcm.left, 0);
        buffer.copyToChannel(pcm.right, 1);
        this.cache.add(key, buffer);
      } catch {
        return false;
      }
    }
    const previous = this.rendered.indexOf(key);
    if (previous >= 0) this.rendered.splice(previous, 1);
    this.rendered.push(key);
    if (this.rendered.length > CACHED_SCORES) this.cache.remove(this.rendered.shift()!);
    return true;
  }

  private start(key: string, volume: number): boolean {
    let sound: Phaser.Sound.BaseSound | undefined;
    try {
      sound = this.manager.add(key, { loop: true, volume });
      if (sound.play()) {
        this.active = sound;
        return true;
      }
    } catch { /* A browser without usable audio can still play the game. */ }
    if (sound) this.manager.remove(sound);
    return false;
  }

  private announce(request: MusicRequest, key: string): void {
    if (request.announced) return;
    request.announced = true;
    caption(key);
  }

  private removeActive(): void {
    if (this.active) this.manager.remove(this.active);
    this.active = undefined;
  }

  private afterUnlock = (): void => { this.update(); };

  private clear = (): void => {
    this.request = undefined;
    this.removeActive();
    for (const key of this.rendered) this.cache.remove(key);
    this.rendered.length = 0;
  };

  destroy(): void {
    this.manager.off(Phaser.Sound.Events.UNLOCKED, this.afterUnlock);
    this.manager.off(Phaser.Sound.Events.STOP_ALL, this.clear);
    this.clear();
  }
}
