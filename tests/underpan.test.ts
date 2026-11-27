import { expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function visible(d: Driver, map: string, id: string) {
  return MAPS[map].interactables.find((p) => p.id === 'underpan-' + id && check(p.visibleIf, d.s));
}
for (const clue of ['wall', 'edge']) for (const watch of ['lamps', 'shutters'])
  it('reaches Fen by the ' + clue + ' and gives her the ' + watch + ' watch', () => {
    const d = new Driver();
    d.s.mapId = 'market.square';
    expect(visible(d, d.s.mapId, 'grate')).toBeUndefined();
    d.walk(visible(d, d.s.mapId, 'coin')!.node!, ['Let her']);
    expect(visible(d, d.s.mapId, 'grate')).toBeUndefined();
    d.walk(visible(d, d.s.mapId, 'coin')!.node!, ['Tap once']);
    const cellar = visible(d, d.s.mapId, 'grate')!.to!.map;
    d.s.mapId = cellar;
    d.run({ type: 'VisitPlace', name: MAPS[cellar].name });
    expect(visible(d, cellar, 'leave')?.to?.map).toBe('market.square');
    expect(d.e.talkEntry('fen-clove', d.s)).toBe('underpan.fen');
    expect(visible(d, cellar, 'wall')).toBeUndefined();
    if (clue === 'wall') {
      d.walk(visible(d, cellar, 'lamp')!.node!, ['Turn the wick']);
      d.walk(visible(d, cellar, 'wall')!.node!, ['Mark the three']);
    } else d.walk(visible(d, cellar, 'edge')!.node!, ['Feel for']);
    expect(d.done('underpan.separate')).toBe(clue === 'wall');
    d.talk('fen-clove', 'Come back');
    expect(d.done('underpan.account')).toBe(false);
    d.talk('fen-clove', watch === 'lamps' ? 'Hold the lamps' : 'Keep the shutters');
    expect(d.done('underpan.account')).toBe(true);
    expect(!!visible(d, cellar, 'counting-stair')).toBe(watch === 'lamps');
    expect(visible(d, 'market.square', watch === 'lamps' ? 'show' : 'quiet')).toBeDefined();
    const homes = [cellar, 'market.square'].filter((map) => MAPS[map].npcs.some((p) => p.id === 'fen-clove' && check(p.visibleIf, d.s)));
    expect(homes).toEqual([watch === 'lamps' ? 'market.square' : cellar]);
    expect(d.e.talkEntry('fen-clove', d.s)).toBe(watch === 'lamps' ? 'underpan.outside' : 'underpan.inside');
  });

it('either local resident can open the way before the coin is found', () => {
  for (const speaker of ['market-assayer', 'market-clerk']) {
    const d = new Driver();
    d.walk('neighbour.' + speaker);
    expect(visible(d, 'market.square', 'grate')).toBeDefined();
    expect(d.s.flags['underpan.cold']).toBeUndefined();
  }
});
