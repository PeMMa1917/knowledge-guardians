import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { adventureJournalView, setDiaryReflection } from '../src/domain/adventureJournal';
import { selectDiary } from '../src/domain/diarySelection';
import { encyclopediaForCharacter, encyclopediaLinks } from '../src/domain/encyclopedia';
import { LANTERN_PEOPLE, LANTERN_SITES, lanternDisplay, lanternEffects, lanternMemory, lanternRead, lanternRef,
  type LanternCommand } from '../src/domain/lamplight';
import { apply, emptyOutputs } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const pack = buildPack();
describe('the lamplight guest and receiving bench', () => {
  it('has a documented identity, two individual methods and a question for every roster entry', () => {
    for (const values of ['name', 'id', 'character', 'title', 'question'] as const)
      expect(new Set(LANTERN_PEOPLE.map((p) => p[values])).size, values).toBe(250);
    for (const person of LANTERN_PEOPLE) {
      const speaker = pack.characters.find((ch) => ch.id === person.character)!;
      expect(encyclopediaForCharacter(speaker)?.key).toBe('person:' + (('wikidata' in person && person.wikidata) || person.id.toUpperCase()));
      expect(pack.sources.find((s) => s.id === 'HIS-INK-' + person.id || s.id === 'HIS-LAMPLIGHT-' + person.id)?.supports).toBe(person.context);
      expect(person.folds).toHaveLength(2);
      expect(person.folds[0].arrival).not.toBe(person.folds[1].arrival);
      expect(person.folds[0].action).not.toBe(person.folds[1].action);
    }
  });

  it.each(LANTERN_SITES)('plays all 250 guests, both trials and both installations in $place', (site) => {
    const map = MAPS[site.map], d = new Driver();
    const bench = map.interactables.find((p) => p.node === 'lamplight.' + site.id + '.bench')!;
    const post = map.interactables.find((p) => p.id === 'ink-post.' + site.id)!;
    expect(d.e.node(post.node!).options?.some((o) => o.next === 'lamplight.' + site.id + '.post')).toBe(true);
    expect(d.e.node(bench.node!).speaker).toBe(site.host);
    expect(Math.abs(bench.x - post.x) + Math.abs(bench.y - post.y)).toBeGreaterThanOrEqual(5);
    const state = { ...d.s, mapId: site.map };
    for (const guest of LANTERN_PEOPLE) {
      const base = { type: 'WorkWithLantern' as const, site: site.id, person: guest.id };
      const run = (s: typeof state, cmd: LanternCommand) => apply(lanternEffects(cmd, s), s, emptyOutputs());
      const greeted = run(state, { ...base, stage: 'meet' });
      const met = run(run(greeted, { ...base, stage: 'pin', piece: 0 }), { ...base, stage: 'pin', piece: 1 });
      for (const trace of [0, 1] as const) {
        const prepared = run(met, { ...base, stage: 'trace', option: trace });
        for (const use of [0, 1] as const) {
          const cmd = { ...base, stage: 'use' as const, option: use };
          const finished = run(prepared, cmd);
          expect(lanternRead(finished, site, guest)).toEqual({ met: true, trace, use, pieces: [0, 1] });
          expect(lanternDisplay(finished, site)).toEqual({ person: guest, pieces: [0, 1], trace: guest.folds[trace], use: site.uses[use] });
          expect(lanternEffects(cmd, finished)).toEqual([]);
        }
      }
    }
  });

  it('keeps revisions, mounted copies, chapter memory and private diary references consistent after loading', () => {
    const d = new Driver(), [site, next] = LANTERN_SITES;
    const person = LANTERN_PEOPLE.find((p) => p.id === 'q234888')!;
    const base = { type: 'WorkWithLantern' as const, site: site.id, person: person.id };
    expect(encyclopediaLinks(pack, d.s)).toEqual([]);
    expect(() => d.run({ ...base, stage: 'use', option: 1 })).toThrow();
    d.run({ ...base, stage: 'meet' });
    expect(() => d.run({ ...base, stage: 'use', option: 0 })).toThrow();
    d.run({ ...base, stage: 'pin', piece: 0 });
    d.run({ ...base, stage: 'pin', piece: 2 });
    d.run({ ...base, stage: 'trace', option: 0 });
    d.run({ ...base, stage: 'use', option: 1 });
    const key = lanternRef(site.id, person.id);
    const view = adventureJournalView(pack, d.s, []);
    const entries = view.entries.filter((e) => e.event?.ref === key);
    expect(entries.length).toBe(5);
    for (const entry of entries) {
      expect(entry.encyclopedia?.title).toBe('Vera Rubin');
      expect(entry.reflections!.length).toBeGreaterThanOrEqual(1);
      expect(entry.topics?.areas).toContain('NAT');
    }
    expect(view.encyclopedia.map((e) => e.title)).toEqual(['Vera Rubin']);
    const last = entries.at(-1)!;
    d.s = setDiaryReflection(pack, d.s, last.id, 'keeper', 'I could see the far lamps.');
    const filtered = selectDiary(adventureJournalView(pack, d.s, []), { time: { kind: 'all' }, now: new Date(), topics: { areas: ['NAT'] } });
    expect(filtered.view!.entries.find((e) => e.id === last.id)?.reflections?.find((r) => r.id === 'keeper')?.response).toBe('I could see the far lamps.');
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(lanternMemory(d.s, next, person)).toContain(site.uses[1].reply);
    expect(lanternRead(d.s, next, person).met).toBe(false);
    d.run({ ...base, stage: 'trace', option: 1 });
    expect(lanternRead(d.s, site, person).use).toBeUndefined();
    expect(lanternDisplay(d.s, site)?.trace).toBe(person.folds[0]);
    expect(() => d.run({ ...base, site: next.id, stage: 'meet' })).toThrow();
    expect(() => d.run({ ...base, person: 'unknown', stage: 'meet' })).toThrow();
    expect(() => d.run({ ...base, stage: 'use', option: 2 as 0 })).toThrow();
  });
});

describe('reversible lantern instruments and the night watch',()=>{
  it('retains every ordered two-piece reading and permits replacement of the oldest piece',async()=>{
    const {pinPiece,readPieces}=await import('../src/domain/lanternInstruments');
    for(const a of [0,1,2] as const) for(const b of [0,1,2] as const) if(a!==b){
      const order=readPieces(pinPiece([a],b));
      expect(order).toEqual([a,b]);
      for(const c of [0,1,2] as const) expect(readPieces(pinPiece(order,c))).toEqual(c===b?[a,b]:[b,c]);
    }
  });
  it.each(LANTERN_SITES)('opens both endings after all three readings at $id',async(site)=>{
    const {pairEffects}=await import('../src/domain/lamplight');
    const s=new Driver().s;s.mapId=site.map;
    const cmd={type:'TurnLanternGlass' as const,site:site.id};
    expect(()=>pairEffects({...cmd,stage:'look',aperture:0},s)).toThrow();
    for(const id of site.pair.guests) s.flags[lanternRef(site.id,id)+'.use']=0;
    for(const aperture of [2,0,1] as const){
      expect(()=>pairEffects({...cmd,stage:'mount',choice:0},s)).toThrow();
      Object.assign(s.flags,{['lamplight-pair.'+site.id+'.seen.'+aperture]:true});
    }
    for(const choice of [0,1] as const) {
      expect(pairEffects({...cmd,stage:'mount',choice},s)).toEqual([{setFlag:'lamplight-pair.'+site.id+'.mounted',value:choice}]);
      s.flags['lamplight-pair.'+site.id+'.mounted']=choice;
      expect(pairEffects({...cmd,stage:'mount',choice},s)).toEqual([]);
    }
  });
  it('compares signal costs in one chapter and changes the recipient group in the next', async()=>{
    const {watches,watchReading}=await import('../src/domain/watchBell');
    const d=new Driver();d.s.mapId=watches.gate.map;
    const gate={type:'WorkNightWatch' as const,site:'gate' as const};
    expect(()=>d.run({...gate,stage:'leave',setting:0})).toThrow();
    for(const i of [2,0,1]) d.run({...gate,stage:'try',setting:i});
    expect(watchReading('gate',0)).toContain('3 dry-night calls and 0 missed');
    expect(watchReading('gate',2)).toContain('0 dry-night calls and 2 missed');
    for(const i of [0,1,2]) d.run({...gate,stage:'leave',setting:i});
    expect(d.s.objectivesDone).toContain('night-watch.gate.handover');
    d.s.mapId=watches.dispatch.map;
    expect(()=>d.run({...gate,stage:'try',setting:0})).toThrow();
    for(const i of [0,1]) d.run({...gate,site:'dispatch',stage:'try',setting:i});
    for(const i of [1,0]) d.run({...gate,site:'dispatch',stage:'leave',setting:i});
    expect(d.s.objectivesDone).toContain('night-watch.dispatch.handover');
    expect(d.s.adventureDiary.entries.map(e=>e.text).join(' ')).toContain('4 of 6 households');
  });
});
