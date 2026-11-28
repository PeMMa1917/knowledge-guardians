import type { GameController } from '../app/controller';
import { availableSuppers, packedSupper, supperLines, supperScenes } from '../domain/companionSupper';
import { PASSAGES } from '../domain/corridor';
import { h } from './dom';

export function supperTable(c:GameController) {
  const available=availableSuppers(c.pack,c.engine.dialogueById,c.state);
  if (!available.length) return '';
  const body=h('div',{}), notice=h('p',{role:'status'});
  const table=h('details',{},h('summary',{},'Join the supper table'),body,notice);
  const show=(i:number) => {
    const scene=supperScenes[i], current=packedSupper(c.state,i);
    body.replaceChildren(h('button',{onclick:menu},'Back to the table'),h('h3',{tabindex:'-1'},scene.title),
      ...supperLines(c.state,i).map(line=>h('p',{},line)),...scene.editions.map((edition,j)=>
        h('button',{'aria-pressed':String(current===j),onclick:()=>{
          c.dispatch({type:'CompanionSupper',scene:i,action:'pack',choice:j});show(i);
          notice.textContent='Packed for '+PASSAGES[scene.chapter-1].name+'.';
        }},edition.action)));
    body.querySelector('h3')?.focus();
  };
  const menu=()=>{notice.textContent='';body.replaceChildren(...available.map(i=>h('button',{onclick:()=>{
    c.dispatch({type:'CompanionSupper',scene:i,action:'listen'});show(i);
  }},supperScenes[i].title)));};
  menu();return table;
}

export function supperParcels(c:GameController,chapter:number) {
  return supperScenes.flatMap((scene,i) => {
    const choice=packedSupper(c.state,i);
    if (scene.chapter!==chapter || (choice!==0 && choice!==1)) return [];
    const edition=scene.editions[choice];
    const reply=h('p',{'aria-live':'polite'},c.state.flags['supper.pair.'+i+'.delivered']===choice?edition.reply:'');
    return [h('div',{},h('h3',{},scene.title),h('p',{},edition.action),h('button',{onclick:()=>{
      c.dispatch({type:'CompanionSupper',scene:i,action:'unpack'});reply.textContent=edition.reply;
    }},'Unpack the supper parcel'),reply)];
  });
}
