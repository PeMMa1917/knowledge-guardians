// These are actions on the fictional rehearsal equipment. No target describes a property of the historical object.
import { benchFor, type Bench } from './workInstruments';
import type { CampaignState, Effect } from './types';
import type { WorkOrder } from './worldWork';

type Shape = 'trim' | 'ferry' | 'cue' | 'repair' | 'roster' | 'witness' | 'watch' | 'trace';
const defaults:Record<Bench,Shape> = {balance:'trim',trail:'ferry',rhythm:'cue',assembly:'repair',allocate:'roster',words:'witness',
  sample:'watch',source:'trace',model:'roster',sequence:'cue',chance:'watch',lens:'trim'};
const alternatives:Shape[][] = [[], ['witness','repair','ferry','roster','watch','trace'], ['trace','roster','witness','ferry','repair','cue'],
  ['watch','trim','ferry','roster','repair','cue'], ['trace','ferry','witness','cue','trim','watch','roster','repair']];
export function shapeOf(o:WorkOrder):Shape {
  const {group,ticket:t}=o;
  if(group===0)return defaults[benchFor(group,t[1])!];
  const shapes=alternatives[group];
  return shapes[(t[1]+t[2])%shapes.length];
}
interface Tool {
  title:string; prompt:string; controls:string[]; help:string;
  move:(input:number)=>{progress:number;done:boolean;text:string};
}
export function workTool(o:WorkOrder,s:CampaignState):Tool {
  const t=o.ticket, seed=t[0]*11+o.chapter*7+t[2]*3, key='work.'+o.chapter+'.'+o.group+'.'+t[0];
  const progress=Number(s.flags[key+'.position']??0);
  const put=(next:number,done:boolean,text:string)=>({progress:next,done,text});
  switch(shapeOf(o)){
    case 'trim': {
      const mark=2+seed%5;
      return {title:'Trim the carrier',prompt:'The load pulls '+mark+' divisions towards the quay. Put a counterweight on the opposite arm.',
        controls:Array.from({length:7},(_,i)=>String(i+1)+' divisions'),help:'Match the pull on the two arms. You can adjust the counterweight again.',
        move:i=>put(i+1,i+1===mark,i+1===mark?'The pointer holds at the centre. The porter can lift the latch.':(i+1<mark?'The load':'The counterweight')+' still pulls the arm down by '+Math.abs(mark-i-1)+'.')};
    }
    case 'ferry': {
      const width=3,goal=8,shoal=[1,3,4,5,7][seed%5];
      const names=['North','East','South','West'], moves=[-3,1,3,-1];
      const coord=(n:number)=>String.fromCharCode(65+n%3)+(1+Math.floor(n/3));
      return {title:'Pilot the returning ferry',prompt:'You are at '+coord(progress)+'. Reach C3. A submerged post blocks '+coord(shoal)+'. Columns A to C run west to east. Rows 1 to 3 run north to south.',
        controls:names,help:'The ferry starts at A1. Go around the post. A bump leaves you on the same square.',
        move:i=>{const next=progress+moves[i];if(next<0||next>8||(i===1&&progress%width===2)||(i===3&&progress%width===0)||next===shoal)return put(progress,false,'The pole meets the bank or the post. The ferry stays at '+coord(progress)+'.');
          return put(next,next===goal,next===goal?'The last passenger catches the ring at C3.':'The bow reaches '+coord(next)+'.');}};
    }
    case 'cue': {
      const calls=['low','middle','high'], seq=[seed%3,(seed+1)%3,(Math.floor(seed/3)+2)%3];
      const index=progress%3;
      return {title:'Answer the signal',prompt:'The caller plays '+seq.map(i=>calls[i]).join(' · ')+'. You have answered '+index+' of three notes.',
        controls:calls.map(c=>'Ring '+c),help:'Play the calls from left to right. After a missed entrance the caller starts again.',
        move:i=>i===seq[index]?put(index+1,index===2,index===2?'The far bell rings back. The last crew heard the whole call.':'The caller holds a breath for the next note.'):put(0,false,'The answering bell stays quiet. The caller repeats the phrase.')};
    }
    case 'repair': {
      const parts=['hinge','pin','sleeve'],first=seed%3,second=(first+1)%3,steps=[first,second,(second+1)%3],index=progress%3;
      return {title:'Rebuild the travelling joint',prompt:'The '+parts[first]+' rests against the case. The '+parts[second]+' holds it. The remaining part goes on last. '+index+' pieces are seated.',
        controls:parts.map(p=>'Seat the '+p),help:'Build from the case wall out. A loose fitting can be lifted without disturbing the pieces already in place.',
        move:i=>i===steps[index]?put(index+1,index===2,index===2?'The repaired joint swings under load.':'The fitting holds. There is room for the next piece.'):put(index,false,'That piece wobbles. You lift it out and keep the earlier fittings in place.')};
    }
    case 'roster': {
      const crews=['early crew','crossing crew','night crew'];
      return {title:'Cover two shifts',prompt:progress===0?'There are three work crews and two spare hands. Lend the first hand to a crew.':'The '+crews[progress-1]+' has the first hand. Choose who gets the second.',
        controls:crews.map(c=>'Help the '+c),help:'Both helpers can stay together, or two crews can share them. Someone will have to wait.',
        move:i=>progress===0?put(i+1,false,'A helper takes a place beside the '+crews[i]+'.'):put(i+1,true,progress===i+1?'Both helpers can finish one shift early. The other crews cover themselves.':'Two shifts have cover. The '+crews.find((_,j)=>j!==i&&j!==progress-1)+' keeps the full load.')};
    }
    case 'witness':
      return {title:'Arrange a hearing',prompt:progress===0?'The visitor waits with a folded statement. Offer a public seat or draw the screen.':(progress===1?'The visitor took the public seat.':'The visitor chose to speak behind the screen.')+' Agree what the next keeper may carry.',
        controls:progress===0?['Pull out the public seat','Draw the screen']:['Carry the agreed wording','Leave the words with the witness'],
        help:'Where to speak and what may travel are two separate decisions. The witness can keep custody of their words.',
        move:i=>progress===0?put(i+1,false,i===0?'A second listener moves up to the rail.':'The visitor lets go of the folded edge.'):put(progress,true,i===0?'The witness initials the travelling line. A second account can now challenge it.':'The witness keeps the statement. The next keeper receives directions to a listening seat.')};
    case 'watch': {
      const positions=['at the gate','behind the screen','beside the empty crate'];
      const used=progress,watched=positions.filter((_,i)=>used&(1<<i));
      return {title:'Keep a watch',prompt:'Look for the return signal from two positions. '+(watched.length?'Previous watch '+watched.join(' and ')+'.':'You have just taken over.'),
        controls:positions.map(p=>'Watch '+p),help:'A second visit to the same position repeats the same blind spot.',
        move:i=>{const mask=used|1<<i;const seen=1+(seed+i*3)%5;return put(mask,mask!==1&&mask!==2&&mask!==4,seen+' signals '+positions[i]+'. '+(mask===used?'The view is unchanged.':'The watcher ties a knot for this position.'));}};
    }
    case 'trace': {
      const corners=['wax edge','thread holes','ink shadow'],first=seed%3;
      return {title:'Trace the missing leaf',prompt:progress===0?'An envelope holds three scraps. Choose the trace to follow.':'The '+corners[progress-1]+' led to a witness slip. Choose how to preserve the connection.',
        controls:progress===0?corners.map(c=>'Lift the '+c):['Make a rubbing in place','Lay the two edges on one mount'],
        help:'Each trace takes you to a different feature of the same witness slip. Choose whether the original needs to stay in place.',
        move:i=>progress===0?put(i+1,false,['The wax carries a reversed letter.','Two holes share a frayed blue thread.','A pale line continues across both edges.'][(first+i)%3]):put(progress,true,i===0?'The rubbing travels. The slip keeps its place in the stack.':'The join is visible to the next reader. The keeper leaves a marker where the leaf came out.')};
    }
  }
}
export function performWork(o:WorkOrder,s:CampaignState,i:number,key:string):{effects:Effect[];title:string;text:string} {
  const tool=workTool(o,s);
  if(!Number.isInteger(i)||i<0||i>=tool.controls.length)throw Error('Choose a control on this instrument.');
  if(s.flags[key+'.worked'])throw Error('This rehearsal is complete. Its result is already on the order.');
  const result=tool.move(i);
  return {title:tool.controls[i],text:result.text,effects:[
    {setFlag:key+'.position',value:result.progress},{setFlag:key+'.result',value:result.text},
    ...(result.done?[{setFlag:key+'.worked',value:true as const}]:[])]};
}
