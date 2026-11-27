import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { moonPerformance } from '../src/domain/spareMoonMusic';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function place(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((p) => p.id === 'first-clap-' + id && check(p.visibleIf, d.s));
}
function use(d: Driver, id: string, ...options: string[]) {
  const p = place(d, id);
  if (!p?.node) throw Error('This scene is unavailable: ' + id);
  d.walk(p.node, options);
}
describe('The Seat That Clapped First', () => {
  for (const bow of ['light', 'dark'])
    for (const clue of ['seat', 'friend'])
      it(`takes the ${clue} path to a ${bow} curtain call`, () => {
        const d = new Driver();
        d.s.mapId = 'stage.rehearsal';
        expect(place(d, 'light')).toBeUndefined();
        use(d, 'dress', 'Wait beside her');
        d.s.mapId = 'stage.gallery';
        if (clue === 'seat') {
          use(d, 'seat', 'Settle your weight', 'Stay here');
          expect(place(d, 'seated')).toBeDefined();
          d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
          use(d, 'seated', 'Stand up');
          expect(d.s.journal).toContain('j.first-clap.seat');
        }
        use(d, 'friend', 'Keep his confidence');
        expect(place(d, 'dark')).toBeUndefined();
        use(d, 'friend', 'Offer to walk back');
        d.s.mapId = bow === 'light' ? 'stage.rehearsal' : 'stage.gallery';
        use(d, bow, bow === 'light' ? 'Keep my hand' : 'Hold the wedge');
        expect(d.done('first-clap.curtain')).toBe(false);
        use(d, bow);
        expect(d.done('first-clap.curtain')).toBe(true);
        expect(place(d, bow + '-return')).toBeDefined();
        expect(place(d, bow)).toBeUndefined();
        expect(d.s.journal).toContain('j.first-clap.' + bow);
        d.s.mapId = 'stage.rehearsal';
        expect(place(d, 'song')).toBeDefined();
        expect(moonPerformance(d.s)?.reply).toBe(bow === 'light' ? 'rhlh' : 'rrlh');
        d.run({ type: 'PlayMoonTune', tune: 'hrlr' });
        expect(d.s.flags['spare-moon.tune']).toBe('hrlr');
        expect(d.s.flags['spare-moon.entered']).toBeUndefined();
        expect(d.s.flags['stage.revised']).toBeUndefined();
      });
});
