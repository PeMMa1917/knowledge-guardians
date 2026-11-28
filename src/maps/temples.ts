import temples from '../content/guardian-temples.json';
import { PASSAGES } from '../domain/corridor';
import type { Interactable, MapDef } from './types';

const entrances = [[28,5],[11,10],[13,14],[13,15],[12,11],[12,11],[11,12],[11,12],[11,12],[16,19],[12,11],[12,11],[12,11],[12,11]];
const site = (n:number) => n===1 ? 'aethelgard.undercroft' : PASSAGES[n-1].hall;
const station = (key:string,label:string,art:string,x:number,y:number):Interactable => ({
  id:'temple-'+key,kind:'fieldgame',game:'temple-'+key,label,art,x,y,w:1,h:1,walkThrough:true,
});

export function templeDoors(mapId:string): Interactable[] {
  if (mapId==='council.hall') return [station('index','the paired Coldwater receivers','voices.paired',12,11)];
  const t=temples.find(row=>site(row.chapter)===mapId);
  if (!t) return [];
  const [x,y]=entrances[t.chapter-1];
  return [{ id:'temple-door-'+t.chapter,kind:'door',label:t.temple,art:'preserved.door',x,y,w:1,h:1,walkThrough:true,
    to:{map:'temple.'+t.chapter,x:6,y:8},visibleIf:{objective:PASSAGES[t.chapter-1].finish} }];
}

export function guardianRooms(base:Record<string,MapDef>):MapDef[] {
  return temples.map(t=>{
    const hub=base[site(t.chapter)];
    const [x,y]=entrances[t.chapter-1];
    return {
      id:'temple.'+t.chapter,name:t.temple,world:hub.world,width:14,height:12,music:hub.music,ambience:hub.ambience,background:hub.background,
      floor:(x,y)=>x<1||x>12||y<1||y>10?null:y===1?'wall-mid':y===2?'wall-base':'stone-c',
      blocks:[[0,0,14,3],[0,11,14,1],[0,0,1,12],[13,0,1,12]],stamps:[],zones:[],npcs:[{id:'temple.'+t.chapter+'.agent',x:4,y:6,facing:'right'},{id:'temple.'+t.chapter+'.guardian',x:8,y:5,facing:'left'}],
      spawn:{x:6,y:8},lights:[{x:3,y:5,r:46,color:0xffcf82},{x:10,y:5,r:46,color:0x91cadd}],
      interactables:[
        station('first',t.trials[0].action,'board-stand',3,5),
        station('second',t.trials[1].action,'ledger',10,5),
        station('custody',t.guardian+' and '+t.agent,'preserved.display-paired',6,4),
        ...(t.chapter>1?[station('return','the travelling gift setting','label-stand',9,8)]:[]),
        {id:'temple-exit',kind:'door',label:'the passage back',art:'study-stairs',x:6,y:9,w:1,h:1,to:{map:hub.id,x,y:y+1}},
      ],
    };
  });
}
