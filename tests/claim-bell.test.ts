import { describe, expect, it } from 'vitest';
import { bellEffects, bellSites, channels, hearCaller, homeReading, readRule, ruleKey, shifts, visitors, workingRule, type BellCommand, type Rule } from '../src/domain/claimBell';
import type { CampaignState } from '../src/domain/types';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

type Move = BellCommand extends infer C ? C extends BellCommand ? Omit<C, 'type'> : never : never;
type Play = (move: Move) => void;
const rules = channels.flatMap(channel => shifts.map(shift => ({channel, shift})));
function rehearse(play: Play, rule: Rule) {
  play({ act:'set', ...rule });
  for (const who of visitors) play({ act:'try', who });
}
function issue(play: Play, rule: Rule) {
  play({ act:'turn' });
  rehearse(play,{channel:'voice',shift:'dawn'});
  rehearse(play,{channel:'token',shift:'late'});
  rehearse(play,rule);
  play({act:'issue'});
}
function sign(play: Play, original: Rule, intended: Rule) {
  play({act:'turn'});
  play({act:'receive'});
  rehearse(play, original);
  rehearse(play,{channel:'token',shift:'dawn'});
  rehearse(play,{channel:'voice',shift:'late'});
  rehearse(play,intended);
  play({act:'sign'});
}
describe('the bell for a quiet claim', () => {
  for (const sent of rules) it.each(rules)('returns '+ruleKey(sent)+' through $channel at $shift', final => {
    const state: Pick<CampaignState,'mapId'|'flags'> = { mapId: bellSites.well, flags: { 'well.shared':true,'well.jug':'late' } };
    const play: Play = move => {
      for (const effect of bellEffects(state,{type:'WorkClaimBell',...move})) {
        if ('setFlag' in effect) state.flags[effect.setFlag]=effect.value;
      }
    };
    issue(play,sent);
    state.mapId=bellSites.weir;
    sign(play,sent,final);
    expect(state.flags['claimbell.issued']).toBe(ruleKey(sent));
    expect(state.flags['claimbell.signed']).toBe(ruleKey(final));
    state.mapId=bellSites.well;
    play({act:'home'});
    expect(state.flags['well.jug']).toBe('late');
    expect(homeReading(state)).toContain(hearCaller('well','second', final).words);
    expect(state.flags['claimbell.home']).toBe(ruleKey(final));
  });
  it('carries the distinction between asking for a pot and reporting a crack across both desks', () => {
    const d=new Driver(), go: Play = move=>{ d.run({type:'WorkClaimBell',...move}); };
    const old={channel:'token',shift:'dawn'} as const, changed={channel:'voice',shift:'late'} as const;
    d.s.mapId=bellSites.well;
    const fixture = (site: 'well'|'weir') => MAPS[bellSites[site]].interactables.find(p=>p.id==='claim-bell-'+site)!;
    expect(check(fixture('well').visibleIf,d.s)).toBe(false);
    expect(()=>go({act:'turn'})).toThrow();
    d.s.flags['well.shared']=true;
    expect(check(fixture('well').visibleIf,d.s)).toBe(true);
    expect(()=>go({act:'issue'})).toThrow();
    issue(go,old);
    expect(d.done('claimbell.issue')).toBe(true);
    expect(check(fixture('weir').visibleIf,d.s)).toBe(true);
    d.s.mapId=bellSites.weir;
    go({act:'turn'});
    expect(()=>go({act:'set',...changed})).toThrow();
    go({act:'receive'});
    expect(workingRule(d.s,'weir')).toEqual(old);
    rehearse(go,old);
    expect(hearCaller('weir','first',old).entered).toBe(false);
    expect(()=>go({act:'sign'})).toThrow();
    rehearse(go,changed);
    expect(hearCaller('weir','first',changed).words).toContain('three times');
    go({act:'sign'});
    expect(d.done('claimbell.sign')).toBe(true);
    d.s.mapId=bellSites.well;
    go({act:'home'});
    expect(d.done('claimbell.home')).toBe(true);
    expect(JSON.stringify(d.s.adventureDiary)).toContain('LEX-BELL-EVIDENCE');
    expect(JSON.stringify(d.s.adventureDiary)).toContain('LEX-BELL-CLAIM');
    expect(JSON.stringify(d.s.adventureDiary)).toContain('his own turn');
    const xp = totalXP(d.p);
    go({act:'home'});
    expect(totalXP(d.p)).toBe(xp);
  });
  it('keeps both the signed evidence and the later trial, including an excluded worker',()=>{
    const d=new Driver(), go: Play = move=>{d.run({type:'WorkClaimBell',...move});};
    d.s.mapId=bellSites.well; d.s.flags['well.shared']=true;
    const sent={channel:'runner',shift:'late'} as const;
    issue(go,sent);
    expect(()=>go({act:'issue'})).toThrow();
    d.s.mapId=bellSites.weir;
    sign(go,sent,{channel:'voice',shift:'late'});
    rehearse(go,{channel:'token',shift:'dawn'});
    go({act:'sign'});
    expect(hearCaller('weir','first',workingRule(d.s,'weir')).entered).toBe(false);
    expect(d.s.flags['claimbell.issued']).toBe('runner.late');
    expect(readRule('runner.late.extra')).toBeUndefined();
    expect(readRule('dawn.runner')).toBeUndefined();
    d.s.mapId='nexus.study';
    expect(()=>go({act:'home'})).toThrow();
  });
});
