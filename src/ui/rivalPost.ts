import type {GameController} from '../app/controller';
import {corridorOpen} from '../domain/corridor';
import {connections,councilPost,invitation,joined,joint,letters,otherAddress,postChapter,postChoice,ready,rivalMove,terms,traced,type RivalCommand} from '../domain/rivalPost';
import {h} from './dom';

export function rivalPostPanel(c:GameController,cross:(n:number)=>void){
  const body=h('section',{}),live=h('p',{role:'status','aria-live':'polite'});
  function action(act:RivalCommand['act'],value:number,title:string){
    return h('button',{type:'button',onclick:()=>{
      const before=c.state,cmd:RivalCommand={type:'RivalPost',act,value};
      const err=c.dispatch(cmd).find(e=>e.kind==='error');
      if(err){live.textContent=err.message;return;}
      live.textContent=rivalMove(before,cmd).text;draw();
      body.querySelector<HTMLElement>('[data-post-title]')?.focus();
    }},title);
  }
  function draw(){
    const s=c.state,n=postChapter(s);
    if(n===15){
      const linked=connections.filter(p=>joined(s,p.from));
      body.replaceChildren(h('h2',{tabindex:'-1','data-post-title':true},'The witnesses’ rail'),
        h('p',{},linked.length?'Hale leaves the first receiver empty. Choose which keepers will bring their finding before the chamber.':'Seven two-part cases have addresses on the rail. Compare a pair in its home worlds to bring those witnesses here.'),
        ...linked.map(p=>action('call',p.from,p.title)),h('p',{},councilPost(s)));return;
    }
    const slip=letters[n-1];
    if(!slip||!invitation(s,n)){body.replaceChildren(h('h2',{},'The sealed post'),h('p',{},'Finish a local work order, visit the guardian for their gift, or bring a trace from the other end of this correspondence.'));return;}
    body.replaceChildren(h('h2',{tabindex:'-1','data-post-title':true},slip.title),h('p',{},slip.address),h('p',{},slip.opening));
    if(!traced(s,n)){body.append(action('trace',0,slip.first));return;}
    body.append(h('p',{},slip.discovery));
    for(const [i,r] of slip.routes.entries()){
      const btn=action('send',i,r.action);btn.setAttribute('aria-pressed',String(postChoice(s,n)===i));body.append(btn);
    }
    const custody=postChoice(s,n);if(typeof custody!=='number')return;
    body.append(h('blockquote',{},slip.routes[custody].consequence));
    const other=otherAddress(n);
    if(ready(s,slip.other)){
      const pair=joint(n)!;
      body.append(action('compare',0,'Bring the two traces together'));
      if(joined(s,n))body.append(h('h3',{},pair.title),h('p',{},pair.reveal),h('p',{},terms(s,n)));
    }else body.append(h('p',{},letters[slip.other-1].address+' has the answering piece in '+other.name+'.'));
    if(corridorOpen(s,slip.other))body.append(h('button',{onclick:()=>cross(slip.other)},'Follow the address to '+other.name));
  }
  draw();return h('div',{},body,live);
}
