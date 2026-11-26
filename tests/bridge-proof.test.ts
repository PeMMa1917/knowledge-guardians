import { describe, expect, it } from 'vitest';
import { alternateBank, BRIDGE_BRANCHES, BRIDGE_PARITY_CHECKED, BRIDGE_PROOF_CHECKED, BRIDGE_PROOF_POSTED,
  BRIDGE_RULES, BRIDGE_STOPS, bridgeLinks, bridgeTraceFlag, traceBridgeBranch } from '../src/domain/bridgeProof';
import { check } from '../src/domain/rules';
import { EMBERFORD_BRIDGE_PROOF } from '../src/maps/bridgeProof';
import { EMBERFORD } from '../src/maps/emberford';
import { Driver } from './driver';

describe('A Plank on the Same Bank', () => {
  it('uses one consistent rule change while keeping the same starting point, endpoint and number of moves', () => {
    expect(bridgeLinks('banks').every(([a, b]) => BRIDGE_STOPS[a].bank !== BRIDGE_STOPS[b].bank)).toBe(true);
    expect(bridgeLinks('plank')).toEqual([...bridgeLinks('banks'), ['turn', 'rack']]);
    expect([0, 1, 2, 3].map((moves) => alternateBank('Oak', moves))).toEqual(['Oak', 'Stone', 'Oak', 'Stone']);
    for (const first of BRIDGE_BRANCHES) {
      const original = traceBridgeBranch('banks', first);
      const extended = traceBridgeBranch('plank', first);
      expect(original).toHaveLength(2);
      expect(original.every((path) => BRIDGE_STOPS[path[3]].bank === 'Stone')).toBe(true);
      expect(extended).toEqual([...original, ['start', first, 'turn', 'rack']]);
      expect(traceBridgeBranch('banks', first, 4)).toContainEqual(['start', first, 'turn', 'lower', 'rack']);
      expect([...original, ...extended].every((path) => path.length === 4 && path.length === new Set(path).size)).toBe(true);
    }
  });

  it.each([
    ['bank-route', 'bridge-proof-turn', 'bridge-proof-rack-regular'],
    ['light-plank', 'bridge-proof-passage', 'bridge-proof-rack-plank'],
  ] as const)('checks all five observations and routes the %s proof through its own physical waypoint', (choice, waypointId, receiptId) => {
    const d = new Driver();
    const rail = EMBERFORD_BRIDGE_PROOF.find(({ id }) => id === 'bridge-proof-rail')!;
    expect(EMBERFORD.interactables).toContain(rail);
    expect(check(rail.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'reached.emberford', value: true });
    expect(check(rail.visibleIf, d.s)).toBe(true);
    for (const rule of BRIDGE_RULES) for (const branch of BRIDGE_BRANCHES) {
      d.run({ type: 'SetFlag', flag: bridgeTraceFlag(rule, branch), value: true });
    }
    expect(d.done(BRIDGE_PROOF_CHECKED)).toBe(false);
    d.run({ type: 'SetFlag', flag: BRIDGE_PARITY_CHECKED, value: true });
    expect(d.done(BRIDGE_PROOF_CHECKED)).toBe(true);
    expect(d.p.skills['SK-MICRO-0332']).toEqual([expect.stringMatching(/^WORLD-02\|.*\|bridge\.proof\.checked\|/)]);
    expect(EMBERFORD_BRIDGE_PROOF.filter((prop) => check(prop.visibleIf, d.s))).toEqual([rail]);
    d.run({ type: 'SetFlag', flag: BRIDGE_PROOF_POSTED, value: choice });
    const waypoint = EMBERFORD_BRIDGE_PROOF.find(({ id }) => id === waypointId)!;
    expect(EMBERFORD_BRIDGE_PROOF.filter((prop) => check(prop.visibleIf, d.s))).toEqual([rail, waypoint]);
    if (choice === 'light-plank') expect(waypoint.to).toEqual({ map: EMBERFORD.id, x: 37, y: 20 });
    d.run({ type: 'SetFlag', flag: waypoint.flag!, value: true });
    const receipt = EMBERFORD_BRIDGE_PROOF.find(({ id }) => id === receiptId)!;
    expect(EMBERFORD_BRIDGE_PROOF.filter((prop) => check(prop.visibleIf, d.s))).toEqual([rail, waypoint, receipt]);
    expect(d.done('bridge.proof.delivered')).toBe(false);
    expect(d.p.skills['SK-MICRO-0887']).toBeUndefined();
    d.run({ type: 'SetFlag', flag: receipt.flag!, value: true });
    expect(d.done('bridge.proof.delivered')).toBe(true);
    expect(d.p.skills['SK-MICRO-0887']).toEqual([expect.stringMatching(/^WORLD-02\|.*\|bridge\.proof\.delivered\|/)]);
    expect(d.s.journal).toContain('j.bridge.proof');
    expect(d.p.credit).toEqual({});
  });
});
