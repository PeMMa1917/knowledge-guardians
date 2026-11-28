import {expect,it} from 'vitest';
import register from '../src/content/workshop-invitations.json';
import {invitationFor,availableOnSite,nextInvitation} from '../src/domain/workInvitations';
import {MAPS} from '../src/maps';
import {Driver} from './driver';
import type {Ticket} from '../src/domain/worldWork';
const books=import.meta.glob<{default:Ticket[]}>('../src/content/world-work/w*-g1.json',{eager:true});

it('connects invitations to the person present in the actual room and resumes their unfinished business',()=>{
  const game=new Driver(),distinct=new Set<string>();
  for(const [room,ids] of Object.entries(register.residents)){
    for(const id of ids){
      const invite=invitationFor(room,id)!;
      expect(MAPS[room].npcs.some(p=>p.id===id)).toBe(true);distinct.add(id);
      const book=books['../src/content/world-work/w'+invite.chapter+'-g1.json'].default;
      const keeper=game.e.pack.characters.find(c=>c.id===id)!;
      for(const offer of invite.orders){
        expect(availableOnSite(room,invite.chapter,1,offer)).toBe(true);
        expect(book.find(t=>t[0]===offer)?.[3]).toContain(keeper.name);
      }
      if(invite.orders.length>1){
        const [one,two]=invite.orders,key='work.'+invite.chapter+'.1.';
        const withWork={...game.s,flags:{[key+one+'.edition']:0,[key+two+'.position']:0}};
        expect(nextInvitation(withWork,invite)).toBe(two);
      }
    }
  }
  expect(distinct.size).toBe(175);
  expect(invitationFor('nexus.archive','temple.2.agent')).toBeUndefined();
  expect(availableOnSite('nowhere',1,1,1)).toBeFalsy();
});
