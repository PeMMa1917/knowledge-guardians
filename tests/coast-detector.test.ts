import { describe, expect, it } from 'vitest';
import { DETECTOR_HANDOFF, DETECTOR_OBSERVED, detectorReading, detectorTrace } from '../src/domain/coastDetector';
import { check } from '../src/domain/rules';
import { COAST_DETECTOR, COAST_DETECTOR_RECEIPTS } from '../src/maps/coastDetector';
import { OBSERVATORY_HARBOUR, OBSERVATORY_STATION } from '../src/maps/observatory';
import { Driver } from './driver';

describe('Where the Needles Stop', () => {
  it('compresses different light marks at opposite ends when only the range changes', () => {
    expect(detectorReading('wide')).toEqual([
      { name: 'Rim cord', reading: 4, stop: 'floor' },
      { name: 'Lower step', reading: 4, stop: 'floor' },
      { name: 'Landing lamp', reading: 9, stop: null },
      { name: 'Outer lamp', reading: 12, stop: null },
    ]);
    expect(detectorReading('amplified')).toEqual([
      { name: 'Rim cord', reading: 1, stop: null },
      { name: 'Lower step', reading: 3, stop: null },
      { name: 'Landing lamp', reading: 6, stop: 'ceiling' },
      { name: 'Outer lamp', reading: 6, stop: 'ceiling' },
    ]);
  });

  it.each([
    ['ramp', 'first bell', 21, 10],
    ['stairs', 'Both sets of rope marks', 8, 14],
  ] as const)('requires both ranges and directs the %s handoff to its own reachable receipt', (choice, reply, x, y) => {
    const d = new Driver();
    expect(OBSERVATORY_STATION.interactables).toContain(COAST_DETECTOR);
    expect(check(COAST_DETECTOR.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'coast.arrived', value: true });
    expect(check(COAST_DETECTOR.visibleIf, d.s)).toBe(true);
    d.run({ type: 'SetFlag', flag: detectorTrace('wide'), value: true });
    expect(d.done(DETECTOR_OBSERVED)).toBe(false);
    d.run({ type: 'SetFlag', flag: detectorTrace('amplified'), value: true });
    expect(d.done(DETECTOR_OBSERVED)).toBe(true);
    expect(COAST_DETECTOR_RECEIPTS.every(({ visibleIf }) => !check(visibleIf, d.s))).toBe(true);
    d.run({ type: 'SetFlag', flag: DETECTOR_HANDOFF, value: choice });
    const receipts = COAST_DETECTOR_RECEIPTS.filter(({ visibleIf }) => check(visibleIf, d.s));
    expect(receipts).toHaveLength(1);
    const [receipt] = receipts;
    expect(OBSERVATORY_HARBOUR.interactables).toContain(receipt);
    expect(receipt).toMatchObject({ x, y });
    expect(OBSERVATORY_HARBOUR.floor(x, y)).not.toBeNull();
    expect(receipt.text).toContain(reply);
    expect(d.done('coast.detector.received')).toBe(false);
    d.run({ type: 'SetFlag', flag: receipt.flag!, value: true });
    expect(d.done('coast.detector.received')).toBe(true);
    expect(d.s.journal).toContain('j.coast.detector');
    expect(d.p.credit).toEqual({});
  });
});
