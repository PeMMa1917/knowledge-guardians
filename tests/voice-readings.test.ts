import { describe, expect, it } from 'vitest';
import { voiceReading } from '../src/domain/voiceReadings';
import { Driver } from './driver';

describe('Archive of Voices listening desk', () => {
  it('keeps each excerpt tied to its date, purpose and anonymous source when the guide changes the wording', () => {
    const carrier = voiceReading('carrier', 'original');
    expect(carrier).toMatchObject({ label: 'A carrier on the test walk', date: 'Lantern 4, dusk' });
    expect(carrier.text).toContain('Second lamp');
    expect(voiceReading('carrier', 'guide')).toEqual({
      ...carrier, text: 'A carrier recalls a test walk on Lantern 4 at dusk. From the quay, take the rail after the second lamp.',
    });
    const clerk = voiceReading('clerk', 'original');
    expect(clerk.date).toBe('Lantern 6');
    expect(clerk.text).toContain('public passage');
    expect(voiceReading('clerk', 'guide')).toEqual({
      ...clerk, text: 'The register starts with the public opening on Lantern 6.',
    });
    expect(() => voiceReading('carrier', 'private')).toThrow(/edition/);
  });

  it('requires the active desk and carrier permission, and records the two editions independently', () => {
    const d = new Driver();
    const original = () => d.run({ type: 'RunVoiceReading', source: 'carrier', view: 'original' });
    expect(original).toThrow(/listening desk/);
    d.s.mapId = 'voices.listening';
    d.run({ type: 'SetFlag', flag: 'voices.arrived', value: true });
    expect(original).toThrow(/permissions card/);
    d.run({ type: 'RunVoiceReading', source: 'clerk', view: 'original' });
    d.run({ type: 'SetFlag', flag: 'voices.permissions.read', value: true });
    original();
    expect(d.s.flags['voices.read.carrier.original']).toBe(true);
    expect(d.s.flags['voices.read.carrier.guide']).toBeUndefined();
    d.run({ type: 'RunVoiceReading', source: 'carrier', view: 'guide' });
    expect(d.s.flags['voices.read.carrier.guide']).toBe(true);
    const completed = d.s;
    original();
    expect(d.s).toEqual(completed);
  });
});
