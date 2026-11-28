import { it, expect } from 'vitest';
import { Driver } from './driver';
import { availableSuppers, supperScenes, supperLines, supperThread } from '../src/domain/companionSupper';
import { PASSAGES } from '../src/domain/corridor';
import { receivingChoice, receivingKeepers, receivedTrail, receiptAccount } from '../src/domain/orderReceipts';
import { revision, ticketKey, workAction, type Ticket } from '../src/domain/worldWork';
import { apply, emptyOutputs } from '../src/domain/rules';
import { threadStanding, factions } from '../src/domain/temples';
import lives from '../src/content/keeper-lives.json';
import type { CampaignState } from '../src/domain/types';

it('brings every pair of companions to supper only after they meet and carries either outcome to its own hall', () => {
  const pairs=new Set<string>();
  for(const [i,scene] of supperScenes.entries()){
    const d=new Driver(), key='supper.pair.'+i;
    d.s.mapId=PASSAGES[0].hall;
    expect(availableSuppers(d.e.pack,d.e.dialogueById,d.s)).not.toContain(i);
    expect(()=>d.run({type:'CompanionSupper',action:'listen',scene:i})).toThrow();
    for(const who of scene.people){
      expect(lives[who as keyof typeof lives].thread).toBe(factions[supperThread[who]]);
      const spoken=d.e.pack.dialogue.find(n=>n.speaker===who)!;
      d.run({type:'EnterNode',node:spoken.id});
      d.s.flags['offshift.'+who]='cover';
    }
    const capital={...d.s.flags,'preserved.display':'records','sea.response':'shore'};
    const standing=threadStanding({...d.s,flags:capital});
    expect(standing[1]).toBeGreaterThanOrEqual(2);
    for(const [j,who] of scene.people.entries())if(supperThread[who]===1)
      expect(supperLines({...d.s,flags:capital},i)).toContain(scene.trusted[j]);
    expect(availableSuppers(d.e.pack,d.e.dialogueById,d.s)).toContain(i);
    expect(()=>d.run({type:'CompanionSupper',action:'pack',scene:i,choice:1})).toThrow();
    d.run({type:'CompanionSupper',action:'listen',scene:i});
    expect(supperLines(d.s,i)).toEqual(expect.arrayContaining(scene.memories));
    for(const choice of [0,1] as const){
      d.s.mapId=PASSAGES[0].hall;
      d.run({type:'CompanionSupper',action:'pack',scene:i,choice});
      d.s.mapId='no.such.hall';
      expect(()=>d.run({type:'CompanionSupper',action:'unpack',scene:i})).toThrow();
      d.s.mapId=PASSAGES[scene.chapter-1].hall;
      d.run({type:'CompanionSupper',action:'unpack',scene:i});
      expect(d.s.flags[key+'.delivered']).toBe(choice);
    }
    pairs.add([...scene.people].sort().join('.'));
  }
  expect(pairs.size).toBe(6);
});

const books=import.meta.glob<{default:Ticket[]}>('../src/content/world-work/w*-g*.json',{eager:true});
it('lets all 6,060 travelling orders carry a local decision onward and protects it from stale editions',()=>{
  let routes=0,threeWorldCases=0;
  const d=new Driver();
  for(let home=1;home<=15;home++){
    let longMain=0;
    for(let group=0;group<5;group++)for(const t of books['../src/content/world-work/w'+home+'-g'+group+'.json'].default){
      if(!t[7].length)continue;
      const order={chapter:home,group,ticket:t},key=ticketKey(order);
      let s:CampaignState={...d.s,flags:{[key+'.edition']:0,[key+'.revision']:1}};
      const trail:number[]=[];
      for(const destination of [...t[7]].reverse()){
        s={...s,mapId:PASSAGES[destination-1].hall};
        const move=(action:'receive'|'handoff',value:number)=>workAction(s,{type:'WorldWork',order,action,value});
        expect(()=>move('handoff',0)).toThrow();
        s=apply(move('receive',0).effects,s,emptyOutputs());
        const choice=destination%2 as 0|1,output=move('handoff',choice);
        if(trail.length)expect(output.text).toContain(receivingKeepers[trail.at(-1)!-1].routes[trail.at(-1)!%2].reply);
        s=apply(output.effects,s,emptyOutputs());trail.push(destination);
        expect(receiptAccount(s,key,destination,revision(s,order),trail,choice)).toBe(output.text);
        expect(receivedTrail(s,key,1,t[7])).toEqual(trail);
        expect(receivingChoice(s,key,destination,2)).toBeUndefined();
        expect(receivedTrail(s,key,2,t[7])).toEqual([]);
      }
      if(group===2 && t[7].length>=2)longMain++;
      routes++;
    }
    expect(longMain).toBeGreaterThanOrEqual(75);threeWorldCases+=longMain;
  }
  expect(threeWorldCases).toBeGreaterThanOrEqual(1125);expect(routes).toBe(6060);
},60000);
