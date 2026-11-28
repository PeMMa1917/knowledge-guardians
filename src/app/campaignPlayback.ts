import Phaser from 'phaser';
import { scoreAt, soundtrackKey, type WorldScore } from '../domain/campaignScore';
import { renderCampaignScore, renderScoreLoop, type CampaignPcm } from './campaignSynth';
import { taskLayer, taskVolume, trialPhrase, type TaskMode, type TrialSound } from '../domain/taskScore';
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
  private mode: TaskMode = 'roam';
  private layer?: Phaser.Sound.BaseSound;
  private readonly trialKeys = new Set<string>();
  private readonly context?: AudioContext;
  private loadingFallback?: MusicRequest;
  private active?: Phaser.Sound.BaseSound;
  private readonly rendered: string[] = [];

  constructor(
    private readonly manager: Phaser.Sound.BaseSoundManager,
    private readonly cache: Phaser.Cache.BaseCache,
    private readonly loadMusic: (key: string) => Promise<boolean>,
  ) {
    if (manager instanceof Phaser.Sound.WebAudioSoundManager) {
      this.context = manager.context;
      this.context.addEventListener('statechange', this.onAudioState);
    }
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
      if (this.request.original !== original) this.request = { ...this.request, volume: level, original };
      else this.request.volume = level;
    } else {
      this.removeActive();
      this.request = { key, original, score, volume: level, announced: false };
    }
    this.update();
  }

  setTask(mode: TaskMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    if (mode !== 'roam') caption('music.task.' + mode);
    this.update();
  }

  private updateLayer(request: MusicRequest): void {
    const mode = this.mode;
    const web = this.manager instanceof Phaser.Sound.WebAudioSoundManager ? this.manager : undefined;
    const key = request.score && this.active?.key === request.key && (mode === 'work' || mode === 'hearing')
      ? 'music.layer.' + request.score.id + '.' + mode : undefined;
    if (this.layer && (this.layer.key !== key || request.volume <= 0)) this.removeLayer();
    if (!key || !request.score || !web || web.locked || web.context.state !== 'running' || request.volume <= 0) return;
    if (this.layer && (this.layer.pendingRemove || !(this.layer.isPlaying || this.layer.isPaused))) this.removeLayer();
    if (this.layer instanceof Phaser.Sound.WebAudioSound) {
      this.layer.setVolume(request.volume * .55);
      return;
    }
    if (mode !== 'work' && mode !== 'hearing') return;
    // Align the light four-bar layer to the playing chapter score.
    const loop = taskLayer(request.score, mode);
    if (!this.storePcm(key, web.context, () => renderScoreLoop(loop))) return;
    let sound: Phaser.Sound.BaseSound | undefined;
    try {
      sound = this.manager.add(key, {loop:true,volume:request.volume*.55});
      const seek = this.active instanceof Phaser.Sound.WebAudioSound ? this.active.seek % loop.duration : 0;
      if (sound.play({seek})) { this.layer = sound; return; }
    } catch { /* A failed music layer leaves the workbench usable. */ }
    if (sound) this.manager.remove(sound);
    this.cache.remove(key);
  }

  private removeLayer(): void {
    if (!this.layer) return;
    const key = this.layer.key;
    this.manager.remove(this.layer);
    this.cache.remove(key);
    this.layer = undefined;
  }

  private storePcm(key: string, audio: AudioContext, getPcm: () => CampaignPcm): boolean {
    if (this.cache.exists(key)) return true;
    try {
      const pcm = getPcm();
      const buffer = audio.createBuffer(2, pcm.left.length, pcm.sampleRate);
      buffer.copyToChannel(pcm.left, 0);
      buffer.copyToChannel(pcm.right, 1);
      this.cache.add(key, buffer);
      return true;
    } catch { return false; }
  }

  trial(kind: TrialSound, volume: number): void {
    const key = 'trial.'+kind;
    caption(key);
    const web = this.manager instanceof Phaser.Sound.WebAudioSoundManager ? this.manager : undefined;
    if (!web || web.locked || web.context.state !== 'running' || !Number.isFinite(volume) || volume <= 0) return;
    if (!this.storePcm(key,web.context,()=>renderScoreLoop(trialPhrase(kind)))) return;
    this.trialKeys.add(key);
    try { this.manager.play(key,{volume:Math.min(1,volume)}); }
    catch { /* The trial's text and caption are already available. */ }
  }

  private update(): void {
    const request = this.request;
    if (!request) return;
    const { original, score, key } = request;
    const volume = request.volume * taskVolume[this.mode];
    if (this.active && !this.active.pendingRemove && (this.active.isPlaying || this.active.isPaused)) {
      if (this.active instanceof Phaser.Sound.WebAudioSound || this.active instanceof Phaser.Sound.HTML5AudioSound) {
        this.active.setVolume(volume);
      }
      this.updateLayer(request);
      return;
    }
    this.removeActive();
    this.removeLayer();

    const web = this.manager instanceof Phaser.Sound.WebAudioSoundManager ? this.manager : null;
    const synth = score && web && web.context.state !== 'closed' ? web : null;
    const fallbacks = [...new Set([original, 'music.archive', 'music.town', 'music.title'])];
    if (volume <= 0 || this.manager.locked) {
      this.announce(request, synth ? key : original);
      return;
    }
    if (score && synth && this.prepare(key, score, synth.context) && this.start(key, volume)) {
      this.updateLayer(request);
      this.announce(request, key);
    } else if (!(this.manager instanceof Phaser.Sound.NoAudioSoundManager)) {
      void this.playFallback(request, fallbacks);
    } else {
      this.announce(request, original);
    }
  }

  private async playFallback(request: MusicRequest, fallbacks: string[]): Promise<void> {
    if (this.loadingFallback === request) return;
    this.loadingFallback = request;
    try {
      for (const key of fallbacks) {
        // A map or volume change can happen while a track is downloading.
        const available = this.cache.exists(key) || await this.loadMusic(key).catch(() => false);
        if (this.request !== request || request.volume <= 0 || this.manager.locked) return;
        if (available && this.start(key, request.volume * taskVolume[this.mode])) {
          this.announce(request, key);
          return;
        }
      }
      this.announce(request, request.original);
    } finally {
      if (this.loadingFallback === request) this.loadingFallback = undefined;
    }
  }

  private prepare(key: string, score: WorldScore, context: AudioContext): boolean {
    if (!this.storePcm(key, context, () => renderCampaignScore(score))) return false;
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

  private onAudioState = (): void => {
    if (this.context?.state === 'running') this.update();
  };

  private afterUnlock = (): void => { this.update(); };

  private clear = (): void => {
    this.request = undefined;
    this.mode = 'roam';
    this.removeLayer();
    for (const key of this.trialKeys) this.cache.remove(key);
    this.trialKeys.clear();
    this.removeActive();
    for (const key of this.rendered) this.cache.remove(key);
    this.rendered.length = 0;
  };

  destroy(): void {
    this.context?.removeEventListener('statechange', this.onAudioState);
    this.manager.off(Phaser.Sound.Events.UNLOCKED, this.afterUnlock);
    this.manager.off(Phaser.Sound.Events.STOP_ALL, this.clear);
    this.clear();
  }
}
