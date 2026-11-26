import { describe, expect, it } from 'vitest';
import { DISPATCH_LOADS, DISPATCH_PLANS, DISPATCH_STATS_OBJECTIVES, stampCounts } from '../src/content/dispatchStats';
import { microSkillId } from '../src/content/microSkillEvidence';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { STAMPS } from '../src/scenes/art';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const board = 'dispatch-stats-board';
const props = MAPS['nexus.archive'].interactables;
const station = (id: string) => props.find((entry) => entry.id === id)!;
const art = new Set(artKeys());

describe('The Ribbon on the Wrong Rack', () => {
  it('provides three different compared views and leaves each station approachable', () => {
    const d = new Driver();
    const nexus = MAPS['nexus.archive'];
    expect(check(station(board).visibleIf, d.s)).toBe(false);
    d.s.flags['talked.ise'] = true;
    expect(check(station(board).visibleIf, d.s)).toBe(true);
    expect(new Set(Object.values(station(board).artBy?.keys ?? {})).size).toBe(3);
    expect(station('dispatch-stats-fitted-slip').artOpen?.key).not.toBe(station('dispatch-stats-fitted-rail').artOpen?.key);
    for (const key of Object.values(station(board).artBy?.keys ?? {})) expect(art.has(key)).toBe(true);
    const own = props.filter(({ id }) => id.startsWith('dispatch-stats-'));
    for (const { x, y, id } of own) {
      expect(props.filter((p) => !own.includes(p) && p.x === x && p.y === y), id).toHaveLength(0);
      expect(art.has(station(id).art!), id).toBe(true);
      expect(nexus.floor(x - 1, y), id).not.toBe(null);
      expect(nexus.npcs.some((npc) => npc.x === x - 1 && npc.y === y), id).toBe(false);
      expect(nexus.stamps.some((stamp) => {
        const area = STAMPS[stamp.stamp].collide;
        if (!area) return false;
        const left = stamp.x + area[0], top = stamp.y + area[1];
        return x - 1 >= left && x - 1 < left + area[2] && y >= top && y < top + area[3];
      }), id).toBe(false);
    }
  });

  it('uses the same observations for both weather groups and the full-shift reversal', () => {
    const { bright, wet, all } = DISPATCH_LOADS;
    for (const label of ['oak', 'ash'] as const) {
      expect(all[label].total).toBe(bright[label].total + wet[label].total);
      expect(all[label].onTime).toBe(bright[label].onTime + wet[label].onTime);
    }
    const contrast = ({ oak, ash }: typeof all) => oak.onTime / oak.total - ash.onTime / ash.total;
    expect(contrast(bright)).toBeGreaterThan(0);
    expect(contrast(wet)).toBeGreaterThan(0);
    expect(contrast(all)).toBeLessThan(0);
  });

  it.each(DISPATCH_PLANS)('uses the %s plan and checks the signed arrival for just one parcel', (plan) => {
    const d = new Driver();
    d.s.flags['talked.ise'] = true;
    const source = station(board).node!;
    expect(d.e.visibleOptions(source, d.s).some(({ option }) => /staff|hang/i.test(option.text))).toBe(false);
    for (const [view, title] of [['wet', 'Slide the wet'], ['all', 'Pull both'], ['bright', 'Slide the bright']]) {
      d.walk(source, [title, 'Leave the shutter']);
      expect(d.s.flags['dispatch-stats.view']).toBe(view);
    }
    expect(d.done(DISPATCH_STATS_OBJECTIVES.mix)).toBe(true);
    expect(d.p.skills[microSkillId(307)]).toEqual([expect.stringContaining(DISPATCH_STATS_OBJECTIVES.mix)]);
    const receives = station(`dispatch-stats-receive-${plan}`);
    expect(check(receives.visibleIf, d.s)).toBe(false);
    d.walk(source, [plan === 'slip' ? 'Hang the whole-shift' : 'Staff the two-lane']);
    expect(check(receives.visibleIf, d.s)).toBe(true);
    expect(d.done(DISPATCH_STATS_OBJECTIVES.parcel)).toBe(false);
    d.walk(receives.node!, ['Pull and match']);
    expect(d.e.node('dispatch-stats.receipt').text).toContain('one notch before the bell');
    expect(d.done(DISPATCH_STATS_OBJECTIVES.parcel)).toBe(true);
    expect(d.p.skills[microSkillId(306)]).toEqual([expect.stringContaining(DISPATCH_STATS_OBJECTIVES.parcel)]);
    expect(d.s.journal).toContain('j.dispatch-stats.parcel');
    expect(check(receives.visibleIf, d.s)).toBe(false);
    expect(check(station(`dispatch-stats-fitted-${plan}`).visibleIf, d.s)).toBe(true);
    expect(check(station(`dispatch-stats-fitted-${plan === 'slip' ? 'rail' : 'slip'}`).visibleIf, d.s)).toBe(false);
    expect(d.done('m01.o6.label')).toBe(false);

    const fitted = station(`dispatch-stats-fitted-${plan}`);
    d.walk(fitted.node!, ['Open the practice', 'rack with few', 'Leave this ledger']);
    expect(d.done(DISPATCH_STATS_OBJECTIVES.stamps)).toBe(false);
    expect(d.e.visibleOptions('dispatch-stats.stamps', d.s).some(({ option }) => option.text.startsWith('Pull a marked'))).toBe(false);
    d.walk(fitted.node!, ['Open the practice', 'rack with many', 'Leave this ledger']);
    expect(d.done(DISPATCH_STATS_OBJECTIVES.stamps)).toBe(true);
    expect(d.p.skills[microSkillId(303)]).toEqual([expect.stringContaining(DISPATCH_STATS_OBJECTIVES.stamps)]);
    expect(check(fitted.artOpen?.if, d.s)).toBe(false);
    d.walk(fitted.node!, ['Open the practice', 'Pull a marked parcel']);
    expect(d.e.node('dispatch-stats.stamp-proof').text).toContain('seal slip shows the seal held');
    expect(check(fitted.artOpen?.if, d.s)).toBe(true);
  });

  it('holds the die’s coverage and extra mark rates fixed but changes the share of stamps needing a new seal', () => {
    const rare = stampCounts('rare');
    const common = stampCounts('common');
    for (const batch of [rare, common]) {
      expect(batch.correctlyStamped / batch.extra).toBe(0.9);
      expect(batch.unnecessarilyStamped / (batch.total - batch.extra)).toBe(0.1);
    }
    expect([rare.correctlyStamped, rare.allStamped]).toEqual([9, 108]);
    expect([common.correctlyStamped, common.allStamped]).toEqual([450, 500]);
  });
});
