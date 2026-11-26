import { describe, expect, it } from 'vitest';
import { mapPinKey, readMapPin, writeMapPin } from '../src/domain/mapPins';

describe('personal marks on the folding map', () => {
  it('stores each map independently and preserves the purpose', () => {
    const archive = { x: 12, y: 17, purpose: 'trace' } as const;
    const field = { x: 21, y: 12, purpose: 'return' } as const;
    const flags = {
      [mapPinKey('nexus.archive')]: writeMapPin(archive),
      [mapPinKey('aethelgard.emberford')]: writeMapPin(field),
    };
    expect(readMapPin(flags, 'nexus.archive', 40, 20)).toEqual(archive);
    expect(readMapPin(flags, 'aethelgard.emberford', 40, 28)).toEqual(field);
    expect(readMapPin(flags, 'nile.hall', 25, 13)).toBeUndefined();
  });

  it.each(['', '12,3,?', '-1,3,trace', '3,40,meet', '92,30,trace', true])('ignores a missing or invalid mark (%s)', (value) => {
    const key = mapPinKey('nexus.archive');
    expect(readMapPin({ [key]: value }, 'nexus.archive', 40, 20)).toBeUndefined();
  });
});
