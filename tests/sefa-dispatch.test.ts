import { describe, expect, it } from 'vitest';
import { dailySeed, dealTiles, DISPATCH_DESKS, DISPATCH_MAPS, DISPATCH_SELECTION, DISPATCH_SLIPS, dispatchCount,
  dispatchFlag, dispatchReceived, selectableSlips, type TileDispatchAction } from '../src/domain/tiles';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

function complete(run = 0, daily: string | null = null): Extract<TileDispatchAction, { type: 'CompleteTileStitch' }> {
  const seed = daily ? dailySeed(new Date(daily + 'T12:00:00')) : run;
  const pairs = [...new Set(dealTiles(seed).map(({ slip }) => slip.id))];
  return { type: 'CompleteTileStitch', daily, run, pairs, moves: 8, secs: 14, times: [1.2, 2, 4.5, 7.9, 12, 13.8] };
}

const start = () => {
  const d = new Driver();
  d.s.mapId = DISPATCH_MAPS.guild;
  return d;
};

describe('Sefa’s checked dispatches', () => {
  it('leaves the previous daily score intact for an impossible calendar date', () => {
    const d = start();
    d.run(complete(0, '2024-02-29'));
    expect(() => d.run(complete(0, '2025-02-29'))).toThrow(/calendar day/);
    expect(d.s.flags['tiles.daily.day']).toBe('2024-02-29');
  });

  it('leaves an abandoned or incomplete tray and earlier score untouched', () => {
    const d = start();
    d.s.flags['tiles.runs'] = 3;
    d.s.flags['tiles.best.moves'] = 6;
    d.s.flags['tiles.best.secs'] = 5;
    d.s.flags['tiles.ghost'] = '1,1,2,3,4,5';
    const prior = { ...d.s.flags };
    expect(() => d.run({ ...complete(3), pairs: ['rain-cup'] })).toThrow(/six slips/);
    expect(() => d.run({ type: 'SendTileDispatch', slip: 'rain-cup', desk: 'guild' })).toThrow(/stitched/);
    expect(d.s.flags).toEqual(prior);
    expect(d.s.adventureDiary.entries).toHaveLength(0);
    d.run(complete(3));
    expect(d.s.flags['tiles.runs']).toBe(4);
    expect(d.s.flags['tiles.best.moves']).toBe(6);
    expect(d.s.flags['tiles.best.secs']).toBe(5);
    expect(d.s.flags['tiles.ghost']).toBe('1,1,2,3,4,5');
    expect(selectableSlips(d.s)).toHaveLength(6);
  });

  it('uses the daily seed and preserves the best same-day record without advancing the usual run counter', () => {
    const d = start();
    d.s.flags['tiles.runs'] = 9;
    const day = '2026-11-26';
    d.run(complete(9, day));
    expect(d.s.flags['tiles.runs']).toBe(9);
    expect(d.s.flags['tiles.daily.day']).toBe(day);
    expect(d.s.flags['tiles.daily.moves']).toBe(8);
    expect(d.s.flags['tiles.ghost']).toBe('1,2,5,8,12,14');
    d.run({ ...complete(9, day), moves: 10, secs: 15 });
    expect(d.s.flags['tiles.daily.secs']).toBe(14);
    expect(d.s.flags['tiles.daily.moves']).toBe(8);
  });

  const deliveries = DISPATCH_SLIPS.flatMap((slip) => (['guild', 'ferry'] as const).map((desk) => ({ slip, desk })));
  it.each(deliveries)('delivers $slip.name to the $desk desk and keeps the reader’s receipt', ({ slip, desk }) => {
    const d = start();
    for (let run = 0; run < 12; run++) {
      d.run(complete(run));
      if (selectableSlips(d.s).includes(slip)) break;
    }
    expect(selectableSlips(d.s)).toContain(slip);
    const absent = DISPATCH_SLIPS.find((candidate) => !selectableSlips(d.s).includes(candidate))!;
    expect(() => d.run({ type: 'SendTileDispatch', slip: absent.id, desk })).toThrow(/stitched/);
    d.run({ type: 'SendTileDispatch', slip: slip.id, desk });
    expect(d.s.flags[DISPATCH_SELECTION]).toBe(false);
    expect(d.s.flags[dispatchCount(desk)]).toBe(1);
    expect(d.s.adventureDiary.entries.some(({ text }) => text.includes(slip.limit))).toBe(true);
    d.s = JSON.parse(JSON.stringify(d.s));
    d.s.mapId = DISPATCH_MAPS[desk === 'guild' ? 'ferry' : 'guild'];
    expect(() => d.run({ type: 'ReceiveTileDispatch', slip: slip.id, desk })).toThrow(/marked desk/);
    d.s.mapId = DISPATCH_MAPS[desk];
    const prop = MAPS[d.s.mapId].interactables.find(({ id }) => id === `sefa-dispatch-${desk}`)!;
    expect(check(prop.visibleIf, d.s)).toBe(true);
    expect(check(prop.artOpen?.if, d.s)).toBe(false);
    d.run({ type: 'ReceiveTileDispatch', slip: slip.id, desk });
    expect(check(prop.artOpen?.if, d.s)).toBe(true);
    expect(d.s.flags[dispatchFlag(desk, slip.id)]).toBe('received');
    expect(d.s.flags[dispatchReceived(desk)]).toBe(1);
    expect(d.s.adventureDiary.entries.find(({ id }) => id === `${dispatchFlag(desk, slip.id)}:received`))
      .toMatchObject({ text: expect.stringContaining(slip[desk]), mapId: DISPATCH_MAPS[desk], title: expect.stringContaining(DISPATCH_DESKS[desk]) });
    expect(() => d.run({ type: 'ReceiveTileDispatch', slip: slip.id, desk })).toThrow(/marked desk/);
    expect(d.s.flags[dispatchReceived(desk)]).toBe(1);
  });

  it('keeps nearby pre-existing desks usable and uses different effects for every receiving job', () => {
    expect(new Set(DISPATCH_SLIPS.flatMap((slip) => [slip.guild, slip.ferry])).size).toBe(DISPATCH_SLIPS.length * 2);
    for (const [desk, old] of [['guild', 'record-book'], ['ferry', 'ferry-copy-ledger']] as const) {
      const map = MAPS[DISPATCH_MAPS[desk]];
      expect(map.interactables.some(({ id }) => id === old)).toBe(true);
      const prop = map.interactables.find(({ id }) => id === `sefa-dispatch-${desk}`)!;
      const hits = map.interactables.filter(({ x, y, w, h }) => prop.x >= x && prop.x < x + w && prop.y >= y - 1 && prop.y - 1 < y + h);
      expect(hits.map(({ id }) => id)).toEqual([prop.id]);
    }
  });
});
