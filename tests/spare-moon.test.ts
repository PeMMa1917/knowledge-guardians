import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { moonBeatNames, moonPerformance, moonScore, MOON_TUNE } from '../src/domain/spareMoonMusic';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((entry) => entry.id === 'moon-' + id && check(entry.visibleIf, d.s));
}
function through(d: Driver, id: string) {
  const entry = prop(d, id);
  if (!entry?.to) throw Error('No door ' + id);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  d.s.mapId = entry.to.map;
  d.run({ type: 'VisitPlace', name: MAPS[d.s.mapId].name });
}
function read(d: Driver, id: string, ...choices: string[]) {
  const entry = prop(d, id);
  if (!entry?.node) throw Error('No scene ' + id);
  d.walk(entry.node, choices);
}
function talk(d: Driver, name: string, ...choices: string[]) {
  expect(MAPS[d.s.mapId].npcs.some((npc) => npc.id === name && check(npc.visibleIf, d.s))).toBe(true);
  d.talk(name, ...choices);
}
const paths = ['rope', 'shutter', 'moth', 'music'] as const;
const nights = ['bell', 'cord', 'bench'] as const;

describe('The Spare Moon', () => {
  for (const route of paths)
    for (const night of nights) {
      it(`opens via ${route}, makes the ${night} night and preserves both independent careers`, () => {
        for (const road of [true, false])
          for (const home of [true, false]) {
            const d = new Driver();
            through(d, 'loft');
            expect(prop(d, 'stair')).toBeUndefined();
            if (route === 'rope') talk(d, 'auda-wick', 'Hold the wool');
            if (route === 'shutter') talk(d, 'noll-wick', 'Steady the shutter');
            if (route === 'moth') read(d, 'moth', 'Run your thumb');
            if (route === 'music') d.run({ type: 'PlayMoonTune', tune: 'rrhr' });
            through(d, 'stair');
            talk(d, 'ket-ribble', 'Leave her');
            expect(prop(d, 'offer-' + night)).toBeUndefined();
            talk(d, 'ket-ribble', 'Take a watch');
            read(d, 'offer-' + night, 'Give me a minute');
            expect(d.s.flags['spare-moon.night']).toBeUndefined();
            read(d, 'offer-' + night);
            expect(d.done('spare-moon.keep-watch')).toBe(true);
            expect(prop(d, 'ket-' + night)).toBeDefined();
            for (const other of nights) expect(prop(d, 'offer-' + other)).toBeUndefined();
            const worth = d.p.credit;
            d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
            through(d, 'up');
            const options = d.e.visibleOptions('spare-moon.auda-later', d.s);
            expect(options.some(({ option }) => option.text.includes('little fish'))).toBe(false);
            if (road) read(d, 'thimble', 'Turn the fish');
            talk(d, 'auda-wick', road ? 'Show her' : 'Sit beside');
            talk(d, 'noll-wick', home ? 'Draw a stool' : 'Keep the empty');
            expect(d.s.flags['spare-moon.auda']).toBe(road ? 'road' : 'desk');
            expect(d.s.flags['spare-moon.noll']).toBe(home ? 'home' : 'hall');
            if (!road) talk(d, 'auda-wick');
            through(d, 'stair');
            if (home) talk(d, 'noll-wick');
            if (night === 'bell') through(d, 'short-stair');
            else {
              expect(prop(d, 'short-stair')).toBeUndefined();
              through(d, 'up');
              through(d, 'hall');
            }
            if (!home) talk(d, 'noll-wick');
            d.s.mapId = 'aethelgard.emberford';
            if (road) talk(d, 'auda-wick');
            expect(d.s.flags['nile.arrived']).toBeUndefined();
            expect(d.s.journal).toContain('j.spare-moon.' + night);
            for (const other of nights.filter((id) => id !== night))
              expect(d.s.journal).not.toContain('j.spare-moon.' + other);
            expect(d.p.credit).toEqual(worth);
          }
      });
    }

  it('plays all four-beat phrases including silence, with a distinct answer after each ending', () => {
    const d = new Driver();
    d.s.mapId = 'nexus.bell-loft';
    for (const a of 'lhr')
      for (const b of 'lhr')
        for (const c of 'lhr')
          for (const e of 'lhr') {
            const tune = a + b + c + e;
            d.run({ type: 'PlayMoonTune', tune });
            expect(d.s.flags[MOON_TUNE]).toBe(tune);
          }
    for (const invalid of ['', 'hhr', 'rrrrr', '12hl'])
      expect(() => d.run({ type: 'PlayMoonTune', tune: invalid })).toThrow();
    expect(moonScore('rrrr')).toEqual([]);
    expect(moonScore('hrlh', 5).map((note) => note.at)).toEqual([5, 7, 8]);
    expect(moonBeatNames('lrhh')).toEqual(['low', 'rest', 'high', 'high']);
    const responses = new Set<string>();
    d.s.mapId = 'council.hall';
    expect(() => d.run({ type: 'PlayMoonTune', tune: 'lrhh' })).toThrow();
    d.s.flags['ending.council'] = 'expose';
    expect(prop(d, 'song-council')).toBeUndefined();
    d.s.flags['spare-moon.night'] = 'unrecognised';
    expect(prop(d, 'song-council')).toBeUndefined();
    expect(moonPerformance(d.s)).toBeUndefined();
    for (const night of nights) {
      d.s.flags['spare-moon.night'] = night;
      expect(prop(d, 'song-council')).toBeDefined();
      responses.add(moonPerformance(d.s)!.reply);
      d.run({ type: 'PlayMoonTune', tune: 'lrhh' });
    }
    expect(responses.size).toBe(3);
  });
});

describe('the Wicks while the Guardian is away', () => {
  it('moves Noll on his own, leaves a discoverable trail, and still offers both of his later paths', () => {
    const d = new Driver();
    through(d, 'loft');
    expect(prop(d, 'empty-peg')).toBeUndefined();
    d.s.objectivesDone.push('m02.o1.arrive');
    expect(MAPS[d.s.mapId].npcs.some((n) => n.id === 'noll-wick' && check(n.visibleIf, d.s))).toBe(false);
    read(d, 'empty-peg', 'Use the bow');
    expect(d.s.flags['spare-moon.touch']).toBeUndefined();
    through(d, 'stair');
    talk(d, 'noll-wick');
    expect(d.s.flags['node.spare-moon.kitchen']).toBe(true);
    talk(d, 'ket-ribble', 'Take a watch');
    read(d, 'offer-bench');
    talk(d, 'noll-wick', 'Keep the empty');
    expect(MAPS[d.s.mapId].npcs.some((n) => n.id === 'noll-wick' && check(n.visibleIf, d.s))).toBe(false);
    expect(d.s.flags['spare-moon.noll']).toBe('hall');
  });

  it('unlocks the paper moon at the ordinary stall after any night and keeps both personal answers voluntary', () => {
    for (const night of nights)
      for (const reply of ['door', 'me']) {
        const d = new Driver();
        d.s.marks = 20;
        expect(() => d.run({ type: 'BuyWare', ware: 'lamp-moonshade' })).toThrow();
        d.s.flags['spare-moon.night'] = night;
        d.run({ type: 'BuyWare', ware: 'lamp-moonshade' });
        const pricePaid = 20 - d.s.marks;
        expect(pricePaid).toBeGreaterThan(0);
        expect(() => d.run({ type: 'BuyWare', ware: 'lamp-moonshade' })).toThrow();
        expect(d.s.marks).toBe(20 - pricePaid);
        d.s.mapId = 'nexus.spare-moon';
        read(d, 'shade', 'I’m still');
        expect(d.s.flags['spare-moon.shade']).toBeUndefined();
        read(d, 'shade', reply === 'door' ? 'next person' : 'For me.');
        expect(prop(d, 'shade-' + reply)).toBeDefined();
      }
  });
  it('gives a physical lead for exactly one outstanding Nile prerequisite and keeps both real keys necessary', () => {
    const d = new Driver();
    const visible = () =>
      MAPS['nexus.archive'].interactables
        .filter(
          (p) => (p.id.startsWith('door-waits-') || p.id === 'door-without-a-name') && check(p.visibleIf, d.s),
        )
        .map((p) => p.id);
    expect(visible()).toEqual([]);
    d.s.flags['study.letter'] = true;
    expect(visible()).toEqual(['door-waits-for-ise']);
    delete d.s.flags['study.letter'];
    d.s.objectivesDone.push('m02.o8.ise');
    expect(visible()).toEqual(['door-waits-for-letter']);
    d.s.flags['study.letter'] = true;
    expect(visible()).toEqual(['door-without-a-name']);
  });
});
