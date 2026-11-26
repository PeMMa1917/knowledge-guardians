import { describe, expect, it } from 'vitest';
import { captionFor } from '../src/app/captions';
import { renderCampaignScore } from '../src/app/campaignSynth';
import { arrangeScore, scoreAt, soundtrackKey } from '../src/domain/campaignScore';
import { STORY_PHRASE, storyMotifKey } from '../src/domain/storyMotifs';
import { MAPS } from '../src/maps';

function fingerprint(samples: Float32Array): number {
  const words = new Uint32Array(samples.buffer, samples.byteOffset, samples.length);
  let hash = 0x811c9dc5;
  for (const word of words) hash = Math.imul(hash ^ word, 0x01000193);
  return hash >>> 0;
}

describe('campaign music', () => {
  it('gives every world a distinct captioned score and keeps the existing cues', () => {
    const worldTracks = new Set<string>();
    const allTracks = new Set<string>();
    for (const map of Object.values(MAPS)) {
      const score = scoreAt(map.world, map.id);
      if (!score) throw new Error(`${map.id} has no campaign theme`);
      const key = soundtrackKey(score);
      allTracks.add(key);
      expect(captionFor(key)).toBe(score.caption);
      worldTracks.add(scoreAt(map.world, '')!.id);
    }
    expect(worldTracks.size).toBe(new Set(Object.values(MAPS).map(({ world }) => world)).size);
    expect(worldTracks.size).toBe(16);
    expect(allTracks.size).toBe(19);
    expect(scoreAt('WORLD-02', 'aethelgard.study')?.id).toBe('study');
    expect(scoreAt('WORLD-02', 'aethelgard.undercroft')?.id).toBe('undercroft');
    expect(scoreAt('WORLD-01', 'nexus.next-bench')?.id).toBe('bench');
    expect(scoreAt('future-world', 'future.map')).toBeUndefined();
    for (const key of ['music.archive', 'music.town', 'music.title', 'music.box', storyMotifKey('first-light')]) {
      expect(captionFor(key)).toBeTruthy();
    }
  });

  it('uses the opening cue as a recurring motif with a changed mode, reply and texture', () => {
    const archive = scoreAt('WORLD-01', 'nexus.archive')!;
    const undercroft = scoreAt('WORLD-02', 'aethelgard.undercroft')!;
    const campaignPhrase = (score: typeof archive) => arrangeScore(score).notes.filter(({ strength }) => strength === 0.91 || strength === 0.73);
    const original = campaignPhrase(archive);
    const vault = campaignPhrase(undercroft);
    expect(original).toHaveLength(STORY_PHRASE.length * 2);
    expect(original.slice(0, STORY_PHRASE.length).map(({ midi }) => midi - archive.tonic)).toEqual(STORY_PHRASE.map(({ pitch }) => pitch));
    expect(vault.slice(0, STORY_PHRASE.length).map(({ midi }) => midi - undercroft.tonic)).toEqual(STORY_PHRASE.map(({ pitch }) => pitch === 4 ? 3 : pitch));
    expect(original.slice(STORY_PHRASE.length).map(({ midi }) => midi + 12)).toEqual(original.slice(0, STORY_PHRASE.length).map(({ midi }) => midi));

    const profiles = [...new Set(Object.values(MAPS).map(({ world, id }) => scoreAt(world, id)!))];
    expect(new Set(profiles.map((score) => JSON.stringify(arrangeScore(score).notes))).size).toBe(profiles.length);
    for (const score of profiles) {
      const { duration, notes } = arrangeScore(score);
      expect(duration, score.id).toBeGreaterThan(25);
      expect(duration, score.id).toBeLessThan(65);
      expect(notes.every(({ at, duration: length, midi }) => at >= 0 && at + length <= duration && midi >= 24 && midi <= 96), score.id).toBe(true);
    }
  });

  it('renders reproducible, distinct stereo loops with signal and headroom through a clear seam', () => {
    const stage = scoreAt('WORLD-10', 'stage.gallery')!;
    const forest = scoreAt('WORLD-06', 'forest.trail')!;
    const first = renderCampaignScore(stage);
    const repeated = renderCampaignScore(stage);
    const other = renderCampaignScore(forest);
    expect(first.sampleRate).toBe(22050);
    expect(first.left.length).toBe(first.right.length);
    expect(first.left.length / first.sampleRate).toBeCloseTo(arrangeScore(stage).duration, 4);
    expect(fingerprint(first.left)).toBe(fingerprint(repeated.left));
    expect(fingerprint(first.right)).toBe(fingerprint(repeated.right));
    expect(fingerprint(first.left)).not.toBe(fingerprint(first.right));
    expect(fingerprint(first.left)).not.toBe(fingerprint(other.left));
    for (const samples of [first.left, first.right, other.left, other.right]) {
      let peak = 0;
      let energy = 0;
      for (const sample of samples) {
        peak = Math.max(peak, Math.abs(sample));
        energy += sample * sample;
      }
      expect(peak).toBeGreaterThan(0.055);
      expect(peak).toBeLessThan(0.75);
      expect(Math.sqrt(energy / samples.length)).toBeGreaterThan(0.01);
      expect(samples[0]).toBeCloseTo(0, 6);
      expect(samples[samples.length - 1]).toBeCloseTo(0, 6);
    }
  });
});
