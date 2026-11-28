import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import {
  playRain,
  rainDesk,
  type RainCommand,
  type RainMove,
} from '../src/domain/rainScore';
type Gesture<T extends RainCommand = RainCommand> = T extends unknown
  ? Omit<T, 'type'>
  : never;
function rig(map = 'stage.foyer') {
  const driver = new Driver();
  driver.s.mapId = map;
  const act = (command: Gesture) =>
    driver.run({ type: 'WorkCoatRain', ...command });
  const write = (score: string) => {
    act({ act: 'clear' });
    for (const move of score) act({ act: 'move', move: move as RainMove });
  };
  const hear = () => {
    act({ act: 'listen', seat: 'stalls' });
    act({ act: 'listen', seat: 'wings' });
  };
  return { driver, act, write, hear };
}
describe('Four beats of indoor rain', () => {
  it('conserves the two drops at every step of all 256 scores, including rests and an empty bulb', () => {
    let complete = 0;
    function walk(score: string) {
      const run = playRain(score);
      expect(
        run.bulb + run.hem + run.beats.reduce((n, b) => n + b.hits, 0),
      ).toBe(2);
      expect(run.beats.every((b) => b.hits >= 0 && b.hits <= 2)).toBe(true);
      if (score.length === 4) {
        complete++;
        return;
      }
      for (const move of 'cpts') walk(score + move);
    }
    walk('');
    expect(complete).toBe(256);
    expect(playRain('ccts').heard).toBe('0020');
    expect(playRain('csts').heard).toBe(playRain('ssps').heard);
  });
  it.each(['stage', 'lining'])(
    'credits an authored score only after an audience and a worker have tried that exact bar at %s',
    (site) => {
      const {
        driver: d,
        act,
        write,
        hear,
      } = rig(site === 'stage' ? 'stage.foyer' : 'nexus.coat-lining');
      expect(() => act({ act: 'try-other' })).toThrow();
      expect(() => act({ act: 'listen', seat: 'stalls' })).toThrow();
      write('csts');
      act({ act: 'listen', seat: 'stalls' });
      act({ act: 'keep' });
      expect(() => act({ act: 'bill', billing: 'wonder' })).toThrow();
      act({ act: 'listen', seat: 'wings' });
      act({ act: 'undo' });
      act({ act: 'move', move: 'p' });
      expect(() => act({ act: 'bill', billing: 'hands' })).toThrow();
      write('csts');
      hear();
      expect(d.done('returned-coat.rain.' + site + '.twocauses')).toBe(false);
      write('cptp');
      hear();
      expect(d.done('returned-coat.rain.' + site + '.twocauses')).toBe(false);
      write('ssps');
      expect(d.done('returned-coat.rain.' + site + '.twocauses')).toBe(false);
      hear();
      act({ act: 'bill', billing: 'wonder' });
      expect(d.done('returned-coat.rain.' + site + '.twocauses')).toBe(true);
      expect(rainDesk(d.s)?.kept).toBe('csts');
      expect(d.done('returned-coat.rain.' + site)).toBe(true);
      expect(d.s.flags['returned-coat.hem']).toBe(true);
      const published = structuredClone(d.s.flags);
      write('ssss');
      const other = site === 'stage' ? 'nexus.coat-lining' : 'stage.foyer';
      d.s.mapId = other;
      expect(rainDesk(d.s)?.from).toMatchObject({
        score: 'ssps',
        billing: 'wonder',
      });
      act({ act: 'try-other' });
      expect(rainDesk(d.s)?.score).toBe('ssps');
      expect(() => act({ act: 'bill', billing: 'hands' })).toThrow();
      hear();
      act({ act: 'bill', billing: 'hands' });
      d.s.mapId = site === 'stage' ? 'stage.foyer' : 'nexus.coat-lining';
      expect(rainDesk(d.s)?.from).toMatchObject({
        billing: 'hands',
        score: 'ssps',
      });
      expect(rainDesk(d.s)?.score).toBe('ssss');
      act({ act: 'try-other' });
      expect(rainDesk(d.s)?.score).toBe('ssps');
      d.s.flags = published;
      expect(rainDesk(d.s)?.score).toBe('ssps');
      expect(rainDesk(d.s)?.kept).toBe('csts');
      expect(rainDesk(d.s)?.from).toBeUndefined();
    },
  );
  it('supports a silent performance, protects the four-beat limit and rejects a remote action', () => {
    const { driver: d, act, write, hear } = rig();
    write('ssss');
    expect(() => act({ act: 'move', move: 'p' })).toThrow();
    hear();
    act({ act: 'bill', billing: 'hands' });
    d.s.mapId = 'council.hall';
    const old = structuredClone(d.s.flags);
    expect(() => act({ act: 'try-other' })).toThrow();
    expect(d.s.flags).toEqual(old);
  });
});
