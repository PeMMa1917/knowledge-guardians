import type { GameController } from '../app/controller';
import { corridorOpen, PASSAGES } from '../domain/corridor';
import { sagaAfterword,sagaChapter,sagaDecision,sagaFamily,sagaName,sagaRead,sagaRoute,sagaTrail,type SagaStage } from '../domain/corridorSagas';
import { h } from './dom';

const sheets=import.meta.glob<{default:SagaStage[]}>('../content/corridor-sagas/[0-9]*.json');
export async function chapterSagas(n:number) {
  const load=sheets['../content/corridor-sagas/'+n+'.json'];
  if(!load)throw Error('This map has no saga desk.');
  return (await load()).default;
}

export function sagaPanel(c:GameController,stages:SagaStage[], travel:(chapter:number)=>void) {
  const n=sagaChapter(c.state);
  const body=h('section',{}),status=h('p',{role:'status','aria-live':'polite'});
  let page=0,selection:SagaStage|undefined,filter='all';
  function drawList(){
    selection=undefined; status.textContent='';
    const sorted=stages.filter(r=>filter==='all'||(filter==='started'?sagaTrail(c.state,r.saga).length>0:sagaDecision(c.state,r.saga,n)===undefined));
    page=Math.min(page,Math.max(0,Math.ceil(sorted.length/6)-1));
    const filters=h('div',{class:'row wrap',role:'group','aria-label':'Show threads'});
    for (const [key,label] of [['all','All here'],['started','Started'],['open','Still to decide here']])filters.append(h('button',{type:'button','aria-pressed':filter===key,onclick:()=>{filter=key;page=0;drawList()}},label));
    body.replaceChildren(h('h2',{},'The travelling cases'),filters);
    if(!sorted.length)body.append(h('p',{},'There are no threads on this shelf yet.'));
    for (const stage of sorted.slice(page*6,page*6+6)) {
      const visited=sagaTrail(c.state,stage.saga).length;
      body.append(h('div',{class:'lore-entry'},h('button',{type:'button',onclick:()=>{selection=stage;drawCase();}},sagaName(stage.saga)),
        h('p',{class:'fine'},stage.person+' · '+stage.object+' · '+visited+'/'+sagaRoute(stage.saga).length+' stops')));
    }
    if(sorted.length>6)body.append(h('div',{class:'row'},h('button',{disabled:page===0,onclick:()=>{page--;drawList()}},'Previous'),
      h('span',{},'Page '+(page+1)+' of '+Math.ceil(sorted.length/6)),h('button',{disabled:(page+1)*6>=sorted.length,onclick:()=>{page++;drawList()}},'Next')));
  }
  function drawCase(){
    if(!selection)return;
    const stage=selection,id=stage.saga,f=sagaFamily(id),s=c.state,trail=sagaTrail(s,id);
    body.replaceChildren(h('button',{onclick:drawList},'Return to the shelf'),h('h2',{},sagaName(id)),
      h('p',{},stage.person+' left a working label for '+stage.object+' at '+stage.place+'.'),h('p',{},f.intro));
    const earlier=trail.filter(i=>i!==n).at(-1);
    if(earlier)body.append(h('p',{},'The last instruction comes from '+PASSAGES[earlier-1].name+'. '+f.effects[Number(sagaDecision(s,id,earlier))]));
    function act(move:'inspect'|'settle',choice:0|1){
      const error=c.dispatch({type:'SagaMove',saga:id,move,choice}).find(e=>e.kind==='error');
      if(error){status.textContent=error.message;return}
      status.textContent=move==='inspect'?f.findings[choice]:f.effects[choice];drawCase();
    }
    for(const i of [0,1] as const)body.append(h('button',{type:'button',onclick:()=>act('inspect',i)},f.tools[i]),
      ...(sagaRead(s,id,n,i)?[h('p',{},f.findings[i])]:[]));
    if(sagaRead(s,id,n,0)&&sagaRead(s,id,n,1)){
      for(const i of [0,1] as const)body.append(h('button',{type:'button','aria-pressed':sagaDecision(s,id,n)===i,onclick:()=>act('settle',i)},f.choices[i]));
    }
    if(trail.length)body.append(h('p',{},'Places that have answered: '+trail.map(i=>PASSAGES[i-1].name).join(' → ')+'.'));
    const remaining=sagaRoute(id).filter(i=>!trail.includes(i));
    body.append(h('p',{},remaining.length?'Other stops on the docket: '+remaining.map(i=>PASSAGES[i-1].name).join(', ')+'.':sagaAfterword(s,id)));
    for (const stop of sagaRoute(id)) {
      if (stop !== n && corridorOpen(s,stop)) body.append(h('button',{onclick:()=>travel(stop)},'Follow the case to '+PASSAGES[stop-1].name));
    }
  }
  drawList();return h('div',{},body,status);
}
