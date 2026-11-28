import {expect,it} from 'vitest';
import {PASSAGES} from '../src/domain/corridor';
import {connections,councilPost,invitation,letters,postChoice,rivalMove,terms,type RivalCommand} from '../src/domain/rivalPost';
import {apply,emptyOutputs} from '../src/domain/rules';
import {migrateCampaign} from '../src/domain/saves';
import {Driver} from './driver';

it('places all fourteen local opponents in seven reciprocal mysteries with different instruments and custody choices',()=>{
  expect(letters).toHaveLength(14);expect(connections).toHaveLength(7);
  expect(new Set(letters.flatMap(s=>[s.first,...s.routes.map(r=>r.action)])).size).toBe(42);
  for(const slip of letters)expect(letters[slip.other-1].other).toBe(slip.chapter);
});

it('joins the seven cases from either starting world under all custody arrangements and carries the choice into the existing hearing',()=>{
  const driver=new Driver();
  for(const pair of connections)for(const [a,b] of [[pair.from,pair.to],[pair.to,pair.from]])for(const left of [0,1])for(const right of [0,1]){
    let s={...driver.s,mapId:PASSAGES[a-1].hall,flags:{} as typeof driver.s.flags};
    const move=(act:RivalCommand['act'],value=0)=>{const result=rivalMove(s,{type:'RivalPost',act,value});s=apply(result.effects,s,emptyOutputs());return result;};
    expect(()=>move('trace')).toThrow();
    s.flags['work.'+a+'.0.1.edition']=0;expect(invitation(s,a)).toBe(true);
    expect(()=>move('send',left)).toThrow();
    move('trace');move('send',left);expect(()=>move('compare')).toThrow();
    s={...s,mapId:'temple.'+b};expect(invitation(s,b)).toBe(true);
    move('trace');move('send',right);
    const joined=move('compare');
    expect(joined.text).toContain(pair.reveal);
    expect(terms(s,a)).toContain(left+right===0?'public rail':left+right===2?'in person':'holds one original');
    s=migrateCampaign(JSON.parse(JSON.stringify(s))).state;
    expect(postChoice(s,b)).toBe(right);
    s={...s,mapId:'council.hall'};expect(()=>move('call',20)).toThrow();move('call',pair.from);
    expect(councilPost(s)).toBe(joined.text);
    s={...s,mapId:PASSAGES[a-1].hall};move('send',1-left);expect(councilPost(s)).not.toBe(joined.text);
  }
});

it('accepts an existing guardian gift and records the trace through the engine command',()=>{
  const d=new Driver();d.s.mapId='temple.7';d.s.flags['temple.gift.7']=true;
  d.run({type:'RivalPost',act:'trace',value:0});d.run({type:'RivalPost',act:'send',value:1});
  expect(postChoice(d.s,7)).toBe(1);
});
